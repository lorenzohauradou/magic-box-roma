import type React from "react"
import "@/app/globals.css"
import { Outfit } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "Magic Box Roma - Spedizioni, Imballaggi e Servizi",
  description: "Servizi premium di spedizione, imballaggio professionale, ritiro a domicilio e molto altro a Roma",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'