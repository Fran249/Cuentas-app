import { useCallback, useRef, useState } from "react"

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState(false)

  const start = useCallback(async () => {
    try {
      setError(null)
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
      setActive(true)
    } catch (e: any) {
      setError(e?.message || "Camera error")
      setActive(false)
    }
  }, [])

  const stop = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setActive(false)
  }, [stream])

  const capture = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current) return null
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9))
  }, [])

  return { videoRef, start, stop, capture, active, error }
}