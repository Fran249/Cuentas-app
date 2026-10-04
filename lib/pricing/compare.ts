import type { PricePoint } from "@/types"

export function pctChange(a?: number, b?: number): number {
  if (a == null || b == null || a <= 0) return 0
  return ((b - a) / a) * 100
}

export function compareToPrevious(current: PricePoint, previous?: PricePoint) {
  if (!previous) return { pct: 0, direction: "equal" as const }
  const p = pctChange(previous.unitPrice, current.unitPrice)
  return {
    pct: Math.round(p * 100) / 100,
    direction: p > 0.01 ? ("up" as const) : p < -0.01 ? ("down" as const) : ("equal" as const),
  }
}