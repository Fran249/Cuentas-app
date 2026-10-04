import { toast } from "sonner"
import type { LineItem, Receipt } from "@/types"
import { useTicketStore } from "@/stores/ticketStore"
import { getDataClient } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const itemSchema = z.object({
  rawName: z.string().min(1),
  qty: z.coerce.number().positive(),
  unitPrice: z.coerce.number().positive(),
  total: z.coerce.number().positive(),
})

const schema = z.object({
  items: z.array(itemSchema),
})

type FormValues = z.infer<typeof schema>

export function ReviewPage() {
  const { draft, setItems, resetDraft } = useTicketStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { items: draft.items },
  })

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  async function onSubmit(values: FormValues) {
    const items: LineItem[] = values.items.map((it) => ({
      id: crypto.randomUUID(),
      rawName: it.rawName,
      nameNormalized: it.rawName.toLowerCase().trim(),
      qty: it.qty,
      unitPrice: it.unitPrice,
      total: it.total,
      confidence: 1,
    }))

    setItems(items)

    const now = new Date().toISOString()
    const receipt: Receipt = {
      id: crypto.randomUUID(),
      store: draft.receipt?.store,
      date: now,
      total: items.reduce((sum, it) => sum + it.total, 0),
      currency: "EUR",
      items,
      rawText: draft.rawText,
      confidence: 1,
      createdAt: now,
    }

    const { error } = await getDataClient().receipts.insert(receipt)
    if (error) {
      toast.error("No se pudo guardar el ticket")
      return
    }

    toast.success("Ticket guardado")
    resetDraft()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Revisar y editar ítems</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 rounded-lg border p-3">
                  <div className="col-span-12 md:col-span-5">
                    <FormField
                      control={form.control}
                      name={`items.${idx}.rawName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Producto</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${idx}.qty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cant.</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${idx}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>P. unit.</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${idx}.total`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-6 flex items-end md:col-span-1">
                    <Button type="button" variant="outline" onClick={() => remove(idx)}>
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button type="submit">Confirmar ítems</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}