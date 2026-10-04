import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CameraCapture } from "../components/CameraCapture"
import { extractTextFromImage } from "@/lib/ocr/tesseract"
import { parseReceiptText } from "@/lib/parsers/receipt"
import { useTicketStore } from "@/stores/ticketStore"

export function ScanPage() {
  const [showCam, setShowCam] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { setImage, setRawText, setItems, setStep } = useTicketStore()

  async function handleCapture(blob: Blob) {
    setShowCam(false)
    setProcessing(true)
    setStep("processing")
    const imgUrl = URL.createObjectURL(blob)
    setImage(imgUrl)
    try {
      const file = new File([blob], "ticket.jpg", { type: "image/jpeg" })
      const { text } = await extractTextFromImage(file)
      setRawText(text)
      const parsed = parseReceiptText(text)
      setItems(parsed.items)
      setStep("review")
    } catch (e) {
      console.error(e)
      setStep("capture")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Escanear ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => setShowCam((s) => !s)} disabled={processing}>
            {showCam ? "Cerrar cámara" : "Abrir cámara"}
          </Button>
          {showCam && <CameraCapture onCapture={handleCapture} onClose={() => setShowCam(false)} />}
          {processing && <p className="text-sm text-muted-foreground">Procesando imagen con OCR...</p>}
        </CardContent>
      </Card>
    </div>
  )
}