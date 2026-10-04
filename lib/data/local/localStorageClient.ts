import type { PricePoint, Product, Receipt } from "@/types"
import type {
  DataClient,
  PricePointRepository,
  ProductRepository,
  QueryResult,
  ReceiptRepository,
} from "../types"

const KEY_PREFIX = "app-cuentas:"

const KEYS = {
  receipts: `${KEY_PREFIX}receipts`,
  products: `${KEY_PREFIX}products`,
  pricePoints: `${KEY_PREFIX}price-points`,
} as const

/**
 * Internal persisted shape for price points. The public `PricePoint` type has no
 * product link, so we wrap it with the owning product name and receipt id. The
 * receipt id keeps re-insertion of the same receipt idempotent.
 */
interface StoredPricePoint {
  receiptId: string
  nameNormalized: string
  point: PricePoint
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

/** Reads JSON, falling back to `fallback` on missing/corrupt data. Never throws. */
function readJson<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === "undefined") return fallback
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Writes JSON. May throw (e.g. quota) so callers can surface a `QueryResult` error. */
function writeJson(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") {
    throw new Error("localStorage is not available")
  }
  localStorage.setItem(key, JSON.stringify(value))
}

/** Runs `fn`, mapping any thrown error into the Supabase-shaped result. */
async function query<T>(fn: () => T): Promise<QueryResult<T>> {
  try {
    return { data: fn(), error: null }
  } catch (e) {
    return { data: null, error: toError(e) }
  }
}

/** Like `query`, for single-item lookups where "not found" is `null` data. */
async function queryOne<T>(fn: () => T | undefined): Promise<QueryResult<T>> {
  try {
    return { data: fn() ?? null, error: null }
  } catch (e) {
    return { data: null, error: toError(e) }
  }
}

function persistReceipt(receipt: Receipt): Receipt {
  const receipts = readJson<Receipt[]>(KEYS.receipts, [])
  const products = readJson<Product[]>(KEYS.products, [])
  const storedPoints = readJson<StoredPricePoint[]>(KEYS.pricePoints, [])

  const productByName = new Map(products.map((p) => [p.nameNormalized, p]))

  // Derive a Product per distinct nameNormalized and link it onto each line item.
  const items = receipt.items.map((item) => {
    let product = productByName.get(item.nameNormalized)
    if (!product) {
      product = {
        id: crypto.randomUUID(),
        nameNormalized: item.nameNormalized,
        displayName: item.rawName,
      }
      productByName.set(item.nameNormalized, product)
      products.push(product)
    }
    return { ...item, productId: product.id }
  })

  const stored: Receipt = { ...receipt, items }

  // Replace by id so re-inserting the same receipt never duplicates.
  const nextReceipts = receipts.filter((r) => r.id !== receipt.id)
  nextReceipts.push(stored)

  const derivedPoints: StoredPricePoint[] = items.map((item) => ({
    receiptId: receipt.id,
    nameNormalized: item.nameNormalized,
    point: {
      date: receipt.date,
      store: receipt.store,
      unitPrice: item.unitPrice,
      qty: item.qty,
      total: item.total,
      currency: receipt.currency,
    },
  }))
  const nextPoints = storedPoints
    .filter((p) => p.receiptId !== receipt.id)
    .concat(derivedPoints)

  writeJson(KEYS.receipts, nextReceipts)
  writeJson(KEYS.products, products)
  writeJson(KEYS.pricePoints, nextPoints)

  return stored
}

function createReceiptsRepository(): ReceiptRepository {
  return {
    list: () => query(() => readJson<Receipt[]>(KEYS.receipts, [])),
    getById: (id) =>
      queryOne(() => readJson<Receipt[]>(KEYS.receipts, []).find((r) => r.id === id)),
    insert: (receipt) => query(() => persistReceipt(receipt)),
    upsert: (receipt) => query(() => persistReceipt(receipt)),
    remove: (id) =>
      query(() => {
        const receipts = readJson<Receipt[]>(KEYS.receipts, [])
        writeJson(KEYS.receipts, receipts.filter((r) => r.id !== id))

        // Drop the receipt's derived price points. Products are kept as a catalog.
        const storedPoints = readJson<StoredPricePoint[]>(KEYS.pricePoints, [])
        writeJson(
          KEYS.pricePoints,
          storedPoints.filter((p) => p.receiptId !== id),
        )
        return null
      }),
  }
}

function createProductsRepository(): ProductRepository {
  return {
    list: () => query(() => readJson<Product[]>(KEYS.products, [])),
    getByNormalizedName: (nameNormalized) =>
      queryOne(() =>
        readJson<Product[]>(KEYS.products, []).find(
          (p) => p.nameNormalized === nameNormalized,
        ),
      ),
    upsertMany: (incoming) =>
      query(() => {
        const products = readJson<Product[]>(KEYS.products, [])
        const byName = new Map(products.map((p) => [p.nameNormalized, p]))
        for (const product of incoming) {
          const existing = byName.get(product.nameNormalized)
          byName.set(
            product.nameNormalized,
            existing ? { ...existing, ...product, id: existing.id } : product,
          )
        }
        const merged = Array.from(byName.values())
        writeJson(KEYS.products, merged)
        return merged
      }),
  }
}

function createPricePointRepository(): PricePointRepository {
  return {
    insertMany: (points) =>
      query(() => {
        const storedPoints = readJson<StoredPricePoint[]>(KEYS.pricePoints, [])
        // The public `PricePoint` carries no product link, so these standalone
        // inserts cannot be attributed to a product (empty nameNormalized).
        const appended = points.map((point) => ({
          receiptId: "",
          nameNormalized: "",
          point,
        }))
        writeJson(KEYS.pricePoints, storedPoints.concat(appended))
        return points
      }),
    historyForProduct: (nameNormalized) =>
      query(() =>
        readJson<StoredPricePoint[]>(KEYS.pricePoints, [])
          .filter((p) => p.nameNormalized === nameNormalized)
          .map((p) => p.point)
          .sort((a, b) => a.date.localeCompare(b.date)),
      ),
  }
}

/** Creates the localStorage-backed data client. All methods never throw. */
export function createLocalStorageClient(): DataClient {
  return {
    receipts: createReceiptsRepository(),
    products: createProductsRepository(),
    pricePoints: createPricePointRepository(),
  }
}
