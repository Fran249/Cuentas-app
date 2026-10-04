import { create } from "zustand"
import type { Receipt, LineItem } from "@/types"

interface TicketDraft {
  image?: string // dataURL or blob url
  rawText: string
  items: LineItem[]
  receipt?: Partial<Receipt>
  confidence: number
  step: "capture" | "processing" | "review" | "saved"
}

interface TicketStore {
  draft: TicketDraft
  setImage: (img?: string) => void
  setRawText: (t: string) => void
  setItems: (items: LineItem[]) => void
  setStep: (s: TicketDraft["step"]) => void
  resetDraft: () => void
}

const initial: TicketDraft = {
  rawText: "",
  items: [],
  confidence: 0,
  step: "capture",
}

export const useTicketStore = create<TicketStore>((set) => ({
  draft: initial,
  setImage: (image) => set((s) => ({ draft: { ...s.draft, image } })),
  setRawText: (rawText) => set((s) => ({ draft: { ...s.draft, rawText } })),
  setItems: (items) => set((s) => ({ draft: { ...s.draft, items } })),
  setStep: (step) => set((s) => ({ draft: { ...s.draft, step } })),
  resetDraft: () => set(() => ({ draft: initial })),
}))