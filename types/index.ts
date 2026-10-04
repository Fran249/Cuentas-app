export type Currency = "EUR" | "USD" | "ARS" | "MXN" | string

export interface PricePoint {
  date: string // ISO
  store?: string
  unitPrice: number
  qty: number
  total: number
  currency: Currency
}

export interface Product {
  id: string
  nameNormalized: string
  displayName: string
  brand?: string
  unitType?: "kg" | "g" | "L" | "ml" | "ud" | "un" | "other"
  unitSize?: number
}

export interface LineItem {
  id: string
  productId?: string
  rawName: string
  nameNormalized: string
  qty: number
  unitPrice: number
  total: number
  confidence: number // 0-1
}

export interface Receipt {
  id: string
  store?: string
  date: string // ISO
  total: number
  currency: Currency
  items: LineItem[]
  rawText: string
  imagePath?: string
  confidence: number // 0-1
  createdAt: string // ISO
}

export interface PriceComparison {
  productId: string
  displayName: string
  previous?: PricePoint
  current: PricePoint
  pctChange: number // +10 = +10% increase
  direction: "up" | "down" | "equal"
  vs: "last" | "avg" | "best"
  unitPricePerBase?: number
  baseUnit?: "kg" | "L" | "ud"
  recommendation?: "buy" | "wait" | "neutral"
  reason?: string
}