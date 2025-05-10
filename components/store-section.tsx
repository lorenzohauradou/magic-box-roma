"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone } from "lucide-react"

export default function StoreSection() {
  const [isHovered, setIsHovered] = useState(false)

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
    <section id="negozio" className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="lg:order-2 space-y-8 reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-secondary">
              Il Nostro <span className="text-primary">Negozio</span>
            </h2>

            <p className="text-lg text-gray-600">
              Vieni a trovarci nel nostro punto vendita a Roma. Il nostro staff è a tua disposizione per consigliarti il
              servizio più adatto alle tue esigenze e fornirti assistenza personalizzata.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary text-lg">Indirizzo</h3>
                  <p className="text-gray-600">Via Francesco D'Ovidio 143/145</p>
                  <p className="text-gray-600">Roma - Zona Talenti</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary text-lg">Orari di Apertura</h3>
                  <p className="text-gray-600">Lun-Ven: 9:00 - 13:00 / 14:30 - 19:00</p>
                  <p className="text-gray-600">Sab: 9:00 - 13:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary text-lg">Contatti</h3>
                  <p className="text-gray-600">Tel: +39 0689226298</p>
                  <p className="text-gray-600">Email: info@magicboxroma.it</p>
                </div>
              </div>
            </div>

            <div>
              <Button 
                className="bg-primary hover:bg-primary-600 text-white"
                onClick={() => window.open("https://www.google.com/maps/dir/?api=1&destination=Via+Francesco+D'Ovidio+143%2F145+Roma+RM", "_blank")}
              >
                Indicazioni Stradali
              </Button>
            </div>
          </div>

          <div className="lg:order-1 reveal">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div
                className="absolute inset-0 bg-primary/5 transition-opacity duration-300 z-10"
                style={{ opacity: isHovered ? 0 : 1 }}
              />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2973.019447161387!2d12.562445!3d41.952267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61b3e3b3b3b3%3A0x132f61b3e3b3b3b3!2sVia%20Francesco%20D'Ovidio%2C%20143%2F145%2C%2000136%20Roma%20RM!5e0!3m2!1sit!2sit!4v1625147200000!5m2!1sit!2sit"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="grayscale hover:grayscale-0 transition-all duration-300"
                title="Mappa Google che mostra la posizione del negozio Magic Box Roma"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-secondary/80 to-transparent">
                <h3 className="text-3xl font-bold text-white mb-2">Magic Box Roma</h3>
                <p className="text-white/80">Il tuo partner affidabile per spedizioni e imballaggi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

