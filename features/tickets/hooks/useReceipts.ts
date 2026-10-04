import { useCallback, useEffect, useState } from "react"
import type { Receipt } from "@/types"
import { getDataClient } from "@/lib/data"

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: queryError } = await getDataClient().receipts.list()
    if (queryError) {
      setError(queryError.message)
    } else {
      setReceipts(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { receipts, loading, error, refresh }
}
