import type React from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

/** Layout del sito pubblico: navbar e footer. L'area riservata ha il suo layout. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
