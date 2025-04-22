"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, PackageCheck, Timer, MapPin } from "lucide-react"

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="home" className="relative w-full min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background image and overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Servizi di spedizione e imballaggio"
          fill
          priority
          className="object-cover brightness-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-secondary/70" />
      </div>

      <div className="container mx-auto px-4 md:px-6 z-10 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-6 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20">
              <span className="text-sm font-medium">SPEDIZIONI PROFESSIONALI</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Soluzioni di <span className="text-primary">spedizione</span> e{" "}
              <span className="text-primary">imballaggio</span> per ogni esigenza
            </h1>

            <p className="text-lg text-white/80 max-w-xl">
              Imballare e spedire non è mai stato così comodo e sicuro. Offriamo servizi professionali a 360° per
              privati e aziende.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-600 text-white rounded-md group transition-all" onClick={() => {
                window.location.href = "/#contatti"
              }}>
                Richiedi Preventivo
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className=" border-white hover:bg-white/10 rounded-md" onClick={() => {
                window.location.href = "/#servizi"
              }}>
                Scopri i Servizi
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="p-2 rounded-full bg-primary/20">
                  <PackageCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">Imballaggi Sicuri</p>
                  <p className="text-white/70 text-sm">Materiali premium</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="p-2 rounded-full bg-primary/20">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">Consegne Rapide</p>
                  <p className="text-white/70 text-sm">In tutto il mondo</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="p-2 rounded-full bg-primary/20">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium">Ritiro a Domicilio</p>
                  <p className="text-white/70 text-sm">Servizio comodo</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`relative h-[500px] transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
          >
            <div className="absolute -top-16 -right-16 h-80 w-80 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-float">
              <Image
                src="/placeholder.svg?height=800&width=600"
                alt="Servizi di spedizione professionali"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}

