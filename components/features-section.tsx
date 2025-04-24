"use client"

import { useEffect } from "react"
import Image from "next/image"
import { CheckSquare } from "lucide-react"

export default function FeaturesSection() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active")
        }
      })
    }, observerOptions)

    const elements = document.querySelectorAll(".reveal")
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <section id="vantaggi" className="w-full py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">
            Non solo <span className="text-primary">spedizioni</span>!
          </h2>
          <p className="text-lg text-gray-600">
            Siamo in grado di offrire servizi a 360° per privati ed aziende, con un'attenzione particolare alla qualità
            e alla cura del cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative reveal">
            <div className="absolute -top-10 -left-10 h-64 w-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl md:scale-75">
              <Image
                src="/pointing_screen.jpg"
                alt="Magic Box Roma Servizi"
                width={500}
                height={500}
                className="object-cover w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-transparent h-1/3"></div>
              <div className="absolute bottom-2 left-2 sm:bottom-6 sm:left-6 bg-gradient-to-r from-white/90 to-gray-100/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-xl border border-white/50 max-w-[85%] sm:max-w-none transition-all duration-300 hover:translate-y-[-5px] group">
                <div className="absolute -right-2 -top-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold tracking-wide shadow-md transform rotate-2">AFFIDABILITÀ</div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/20 p-2 hidden sm:flex">
                    <CheckSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-secondary">Servizi di spedizione professionali</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1 group-hover:text-primary transition-colors">Al servizio di privati e aziende</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 reveal">
            <h3 className="text-2xl md:text-3xl font-bold text-secondary">
              Perché scegliere <span className="text-primary">Magic Box Roma?</span>
            </h3>

            <p className="text-gray-600">
              Tra i servizi più richiesti, oltre agli imballaggi professionali e alle spedizioni, puoi usufruire di
              ritiri a domicilio dei tuoi oggetti, servizio di spedizione Express su Roma con consegne in giornata,
              servizio di domiciliazione e magazzinaggio e molto altro...
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <CheckSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary">Materiali Premium</h4>
                  <p className="text-gray-600 text-sm">
                    Usiamo solo materiali di altissima qualità per proteggere i tuoi beni
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary">Preventivi Trasparenti</h4>
                  <p className="text-gray-600 text-sm">Prezzi chiari senza costi nascosti o sorprese</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary">Servizio Rapido</h4>
                  <p className="text-gray-600 text-sm">Tempi di consegna ottimizzati per ogni destinazione</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary">Assistenza Dedicata</h4>
                  <p className="text-gray-600 text-sm">Supporto personalizzato per ogni esigenza</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary">Tracciabilità Completa</h4>
                  <p className="text-gray-600 text-sm">Monitora lo stato delle tue spedizioni in tempo reale</p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-secondary">Copertura Assicurativa</h4>
                  <p className="text-gray-600 text-sm">Proteggiamo i tuoi beni con assicurazioni personalizzate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

