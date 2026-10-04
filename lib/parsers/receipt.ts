import { nanoid } from "nanoid"
import { normalizeProductName, extractUnitInfo } from "@/lib/text/normalize"
import type { LineItem } from "@/types"

export interface ParsedReceipt {
  items: LineItem[]
  rawText: string
  confidence: number
}

const PRICE_RE = /(\d+[.,]\d{2})\b/g

export function parseReceiptText(rawText: string): ParsedReceipt {
  if (!rawText) return { items: [], rawText: "", confidence: 0 }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2)

  const items: LineItem[] = []

  for (const line of lines) {
    const prices = [...line.matchAll(PRICE_RE)].map((m) => parseFloat(m[1].replace(",", ".")))
    if (prices.length < 1) continue

    // Heurística simple: línea con precio suele ser ítem
    const lastPrice = prices[prices.length - 1]
    // evitar líneas que son totales tipo "TOTAL 12.34"
    if (/total|importe|subtotal/i.test(line)) continue

    const nameRaw = line
      .replace(PRICE_RE, " ")
      .replace(/\s{2,}/g, " ")
      .trim()

    if (!nameRaw) continue

    const norm = normalizeProductName(nameRaw)
    const unit = extractUnitInfo(norm)
    const qty = 1 // inferir después si hace falta

    const total = lastPrice
    const unitPrice = total / qty

    items.push({
      id: nanoid(),
      rawName: nameRaw,
      nameNormalized: unit.cleanName || norm,
      qty,
      unitPrice: Math.round(unitPrice * 100) / 100,
      total: Math.round(total * 100) / 100,
      confidence: 0.6,
    })
  }

  const confidence = items.length > 0 ? Math.min(0.9, 0.6 + items.length * 0.05) : 0

  return { items, rawText, confidence }
}