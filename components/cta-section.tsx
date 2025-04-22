"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight } from "lucide-react"

export default function CtaSection() {
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
    <section id="contatti" className="w-full py-24 bg-secondary clip-wave-bottom">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden reveal">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-primary p-10 md:p-12 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Richiedi un Preventivo Gratuito</h2>
              <p className="text-white/80 mb-6">
                Compila il form e sarai ricontattato dal nostro staff nel più breve tempo possibile.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <p className="text-white">Inserisci i tuoi dati</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <p className="text-white">Descrivi le tue esigenze</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <p className="text-white">Ricevi un preventivo personalizzato</p>
                </div>
              </div>
            </div>

            <div className="p-10 md:p-12">
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome e Cognome
                  </label>
                  <Input id="name" placeholder="Es. Mario Rossi" className="w-full" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="Es. mario@esempio.it" className="w-full" />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono
                  </label>
                  <Input id="phone" placeholder="Es. 3XX XXXXXXX" className="w-full" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Messaggio
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Descrivi le tue esigenze di spedizione o imballaggio..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  ></textarea>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white group">
                  Invia Richiesta
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

