export function normalizeProductName(raw: string): string {
  if (!raw) return ""
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s\.\,]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function extractUnitInfo(name: string): {
  unitType?: "kg" | "g" | "L" | "ml" | "ud" | "un" | "other"
  unitSize?: number
  cleanName: string
} {
  const n = name.toLowerCase()
  const patterns: Array<{
    re: RegExp
    unitType: any
    factor?: number // to base
  }> = [
    { re: /(\d+[.,]?\d*)\s*(kg)/, unitType: "kg" },
    { re: /(\d+[.,]?\d*)\s*(g)/, unitType: "g" },
    { re: /(\d+[.,]?\d*)\s*(l|lt|litro|litros)/, unitType: "L" },
    { re: /(\d+[.,]?\d*)\s*(ml)/, unitType: "ml" },
    { re: /(\d+)\s*(ud|uds|un|unidad|unidades)/, unitType: "ud" },
  ]

  for (const p of patterns) {
    const m = n.match(p.re)
    if (m) {
      const val = parseFloat(m[1].replace(",", "."))
      const cleanName = n.replace(p.re, " ").replace(/\s+/g, " ").trim()
      return { unitType: p.unitType, unitSize: Number.isFinite(val) ? val : undefined, cleanName }
    }
  }
  return { cleanName: n.replace(/\s+/g, " ").trim() }
}