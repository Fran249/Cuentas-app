import Tesseract from "tesseract.js"
import { preprocessImageToCanvas } from "./preprocess"

export async function extractTextFromImage(
  source: HTMLImageElement | HTMLCanvasElement | File
): Promise<{ text: string; confidence: number }> {
  let canvas: HTMLCanvasElement

  if (source instanceof File) {
    const img = await createImageBitmap(source)
    const c = document.createElement("canvas")
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext("2d")!
    ctx.drawImage(img, 0, 0)
    canvas = preprocessImageToCanvas(c)
  } else {
    canvas = preprocessImageToCanvas(source as any)
  }

  const result = await Tesseract.recognize(canvas, "spa+eng", {
    logger: () => {},
  } as any)

  const text = result.data.text ?? ""
  const confidence = result.data.confidence / 100

  return { text, confidence: Number.isFinite(confidence) ? confidence : 0 }
}

async function createImageBitmap(file: File) {
  return await window.createImageBitmap(file)
}