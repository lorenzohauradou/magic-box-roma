import type React from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { GoogleTagManager } from "@next/third-parties/google"

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

/**
 * Layout del sito pubblico: navbar, footer, dati strutturati e statistiche.
 * GTM e Analytics restano fuori dall'area riservata (URL con nominativi dei clienti, peso inutile).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GoogleTagManager gtmId="GTM-KCZD8GVK" />
      <Navbar />
      {children}
      <Footer />
      <Analytics />
    </>
  )
}
