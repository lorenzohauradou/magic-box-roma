"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, Home, Clock, Warehouse, Briefcase, Wrench } from "lucide-react"

const services = [
  {
    icon: <Package className="h-12 w-12 text-primary" />,
    title: "Imballaggi Professionali",
    description:
      "Proteggiamo i tuoi oggetti con materiali premium e tecniche professionali per garantire la massima sicurezza durante il trasporto.",
    color: "bg-gradient-to-br from-primary-50 to-primary-100",
  },
  {
    icon: <Truck className="h-12 w-12 text-white" />,
    title: "Spedizioni Worldwide",
    description:
      "Consegne nazionali e internazionali affidabili e tracciabili. Spediamo in ogni angolo del mondo, anche extra UE.",
    color: "bg-gradient-to-br from-primary-500 to-primary-600 text-white",
  },
  {
    icon: <Home className="h-12 w-12 text-primary" />,
    title: "Ritiro a Domicilio",
    description:
      "Prenota il tuo ritiro e in un giorno passiamo a prendere il pacco direttamente a casa tua o in ufficio.",
    color: "bg-gradient-to-br from-secondary-600 to-secondary-900 text-white",
  },
  {
    icon: <Clock className="h-12 w-12 text-primary" />,
    title: "Servizio Express",
    description: "Servizio rapido di consegna in giornata su Roma. La soluzione ideale per l'urgenza metropolitana.",
    color: "bg-gradient-to-br from-secondary-50 to-secondary-100",
  },
  {
    icon: <Briefcase className="h-12 w-12 text-primary" />,
    title: "Domiciliazioni",
    description: "Domiciliazione della corrispondenza e dei pacchi. Riceviamo per te quando non sei disponibile.",
    color: "bg-gradient-to-br from-secondary-600 to-secondary-900 text-white",
  },
  {
    icon: <Warehouse className="h-12 w-12 text-primary" />,
    title: "Magazzinaggio",
    description: "Spazio di stoccaggio sicuro e organizzato per i tuoi beni. Soluzioni flessibili per ogni necessità.",
    color: "bg-gradient-to-br from-secondary-50 to-secondary-100 ",
  },
  {
    icon: <Wrench className="h-12 w-12 text-white" />,
    title: "Assistenza PC",
    description: "Supporto tecnico per hardware e software. Riparazioni, configurazioni e consulenza personalizzata.",
    color: "bg-gradient-to-br from-primary-500 to-primary-600 text-white",
  },
]

export default function ServicesSection() {
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
    <section id="servizi" className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">
            I Nostri <span className="text-primary">Servizi</span>
          </h2>
          <p className="text-lg text-gray-600">
            Offriamo una gamma completa di soluzioni professionali per tutte le tue esigenze di spedizione, imballaggio
            e molto altro ancora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`reveal border-none shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${service.color}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="mb-4">{service.icon}</div>
                <CardTitle
                  className={`text-2xl font-bold ${service.color.includes("text-white") ? "text-white" : "text-secondary"}`}
                >
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription
                  className={`text-base ${service.color.includes("text-white") ? "text-white/80" : "text-gray-600"}`}
                >
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

