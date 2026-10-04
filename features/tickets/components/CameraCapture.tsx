import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCamera } from "../hooks/useCamera"

export function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (blob: Blob) => void
  onClose?: () => void
}) {
  const { videoRef, start, stop, capture, active, error } = useCamera()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    start()
    return () => stop()
  }, [])

  async function handleCapture() {
    setBusy(true)
    const blob = await capture()
    setBusy(false)
    if (blob) onCapture(blob)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-lg border bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleCapture} disabled={busy || !active}>
          {busy ? "Capturando..." : "Tomar foto"}
        </Button>
      </div>
    </div>
  )
}