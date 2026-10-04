import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>App Cuentas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Escanea tickets, extrae productos y compara precios para ver si conviene comprar.
          </p>
          <div className="flex gap-2">
            <Button render={<Link to="/scan" />}>Escanear ticket</Button>
            <Button variant="outline" render={<Link to="/history" />}>
              Historial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}