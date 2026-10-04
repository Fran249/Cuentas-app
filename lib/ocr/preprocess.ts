export function preprocessImageToCanvas(
  image: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return canvas

  const w = image.width as number
  const h = image.height as number
  canvas.width = w
  canvas.height = h

  ctx.drawImage(image as any, 0, 0, w, h)
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  // Grayscale + slight contrast
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    let gray = 0.299 * r + 0.587 * g + 0.114 * b
    // contrast bump simple
    gray = Math.min(255, Math.max(0, (gray - 128) * 1.15 + 128))
    data[i] = data[i + 1] = data[i + 2] = gray
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}