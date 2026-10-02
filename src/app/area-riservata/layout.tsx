import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], display: "swap" })

// Tutta l'area dipende dalla sessione: mai prerenderizzare in fase di build.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    default: "Area riservata · Magic Box Roma",
    template: "%s · Area riservata Magic Box",
  },
  robots: { index: false, follow: false, nocache: true },
}

export default function AreaRiservataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(inter.className, "min-h-screen bg-slate-50 text-slate-900 antialiased")}>
      {children}
      <Toaster richColors position="top-right" closeButton />
    </div>
  )
}
