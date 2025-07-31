import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { GoogleTagManager } from '@next/third-parties/google'



export const metadata = {
  title: "Magic Box Roma - Spedizioni, Imballaggi e Servizi",
  description: "Servizi premium di spedizione, imballaggio professionale, ritiro a domicilio e molto altro a Roma",
  icons: {
    icon: '/magicboxfav.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-KCZD8GVK" />
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}