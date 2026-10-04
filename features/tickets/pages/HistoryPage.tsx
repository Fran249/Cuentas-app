import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReceipts } from "../hooks/useReceipts"

export function HistoryPage() {
  const { receipts, loading, error } = useReceipts()

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {!loading && error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && !error && receipts.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay tickets guardados todavía</p>
          )}

          {!loading &&
            !error &&
            receipts.map((receipt) => (
              <div key={receipt.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {new Date(receipt.date).toLocaleDateString("es-ES")}
                  </span>
                  <span className="text-sm font-semibold">
                    {receipt.total.toFixed(2)} {receipt.currency}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{receipt.store ?? "Tienda desconocida"}</span>
                  <span>{receipt.items.length} ítems</span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
