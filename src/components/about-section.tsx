"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"
import Numbers from "@/components/ui/numbers"

export default function AboutSection() {
  // Animazioni al caricamento
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll(".animate")
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <section id="chi-siamo" className="w-full py-28 bg-white">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-20 animate text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
            <span className="text-sm font-medium tracking-wide">CHI SIAMO</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
            Magic <span className="text-primary">Box</span> Roma
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            La nostra missione è rendere le spedizioni semplici, sicure e senza stress.
          </p>
        </div>

        {/* 2 colonne con immagine e testo */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24 animate">
          <div className="order-2 md:order-1">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-secondary mb-6">
                La Nostra Storia
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Da piccola attività locale, siamo cresciuti fino a 
                diventare un punto di riferimento per gli italiani che necessitano di soluzioni di 
                spedizione affidabili e professionali.
              </p>
            </div>
            
            <ul className="space-y-2">
              {["5.000+ clienti soddisfatti", "Specialisti in imballaggi sicuri", "Partner dei principali corrieri", "Servizio personalizzato"].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="order-1 md:order-2 relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl border-8 border-white shadow-xl">
              <Image 
                src="/about.webp" 
                alt="Il team di Magic Box Roma" 
                fill 
                className="object-cover"
              />
            </div>
            {/* decoration */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/10 -z-10"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-secondary/10 -z-10"></div>
          </div>
        </div>

        <Numbers />

        {/* CTA */}
        <div className="text-center animate">
          <h3 className="text-2xl font-bold text-secondary mb-6">
            Pronto a Spedire con Noi?
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Contattaci oggi stesso per scoprire come possiamo aiutarti con le tue esigenze di spedizione e imballaggio.
          </p>
          <Button 
            className="bg-primary text-white hover:bg-primary/90 group px-6 py-6 text-lg"
            onClick={() => window.location.href = "/#contatti"}
          >
            Richiedi un Preventivo
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      <style jsx global>{`
        .animate {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0s, transform 0s;
        }
        
        .animate-in {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
      `}</style>
    </section>
  )
}