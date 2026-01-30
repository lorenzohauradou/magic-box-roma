import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { GoogleTagManager } from '@next/third-parties/google'

const siteUrl = "https://www.magicboxroma.it"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Magic Box Roma - Spedizioni, Imballaggi e Servizi Postali Roma",
    template: "%s | Magic Box Roma"
  },
  description: "Spedizioni nazionali e internazionali, imballaggio professionale, ritiro a domicilio e servizi postali a Roma. Affidati a Magic Box Roma per le tue spedizioni.",
  keywords: [
    "spedizioni roma",
    "imballaggi roma", 
    "ritiro pacchi roma",
    "spedizioni internazionali roma",
    "corriere roma",
    "servizi postali roma",
    "magic box roma",
    "spedizioni nazionali",
    "imballaggio professionale",
    "ritiro a domicilio roma"
  ],
  authors: [{ name: "Magic Box Roma" }],
  creator: "Magic Box Roma",
  publisher: "Magic Box Roma",
  icons: {
    icon: '/magicboxfav.ico'
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteUrl,
    siteName: "Magic Box Roma",
    title: "Magic Box Roma - Spedizioni, Imballaggi e Servizi Postali Roma",
    description: "Spedizioni nazionali e internazionali, imballaggio professionale, ritiro a domicilio e servizi postali a Roma. Affidati a Magic Box Roma per le tue spedizioni.",
    images: [
      {
        url: "/hero_front1.webp",
        width: 1200,
        height: 630,
        alt: "Magic Box Roma - Servizi di Spedizione"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Box Roma - Spedizioni, Imballaggi e Servizi Postali Roma",
    description: "Spedizioni nazionali e internazionali, imballaggio professionale, ritiro a domicilio e servizi postali a Roma.",
    images: ["/hero_front1.webp"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: siteUrl
  },
  verification: {
    // Aggiungi qui il codice di verifica Google Search Console quando lo hai
    // google: "il-tuo-codice-verifica"
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Magic Box Roma",
  "image": "https://www.magicboxroma.it/logo-magic-box-roma.png",
  "description": "Spedizioni nazionali e internazionali, imballaggio professionale, ritiro a domicilio e servizi postali a Roma.",
  "@id": "https://www.magicboxroma.it",
  "url": "https://www.magicboxroma.it",
  "telephone": "+39 06 1234567",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Example 123",
    "addressLocality": "Roma",
    "postalCode": "00100",
    "addressCountry": "IT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.9028,
    "longitude": 12.4964
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "priceRange": "€€",
  "areaServed": {
    "@type": "City",
    "name": "Roma"
  },
  "serviceType": ["Spedizioni", "Imballaggi", "Ritiro a domicilio", "Servizi postali"]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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