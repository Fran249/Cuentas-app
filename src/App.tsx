import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./App.css"
import { Navbar } from "./components/shared/navbar"
import { HomePage } from "@/features/tickets/pages/HomePage"
import { ScanPage } from "@/features/tickets/pages/ScanPage"
import { ReviewPage } from "@/features/tickets/pages/ReviewPage"
import { HistoryPage } from "@/features/tickets/pages/HistoryPage"
import { ProductPage } from "@/features/tickets/pages/ProductPage"

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <main className="container">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
        </main>
        <Toaster />
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App