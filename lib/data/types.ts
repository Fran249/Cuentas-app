import type { PricePoint, Product, Receipt } from "@/types"

/**
 * Supabase-shaped result. Kept intentionally identical to the shape returned by
 * supabase-js (`{ data, error }`) so the local client can be swapped later.
 */
export type QueryResult<T> = { data: T | null; error: Error | null }

export interface ReceiptRepository {
  list(): Promise<QueryResult<Receipt[]>>
  getById(id: string): Promise<QueryResult<Receipt>>
  insert(receipt: Receipt): Promise<QueryResult<Receipt>>
  upsert(receipt: Receipt): Promise<QueryResult<Receipt>>
  remove(id: string): Promise<QueryResult<null>>
}

export interface ProductRepository {
  list(): Promise<QueryResult<Product[]>>
  getByNormalizedName(nameNormalized: string): Promise<QueryResult<Product>>
  upsertMany(products: Product[]): Promise<QueryResult<Product[]>>
}

export interface PricePointRepository {
  insertMany(points: PricePoint[]): Promise<QueryResult<PricePoint[]>>
  historyForProduct(nameNormalized: string): Promise<QueryResult<PricePoint[]>>
}

export interface DataClient {
  receipts: ReceiptRepository
  products: ProductRepository
  pricePoints: PricePointRepository
}
