"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Marco Bianchi",
    role: "Privato",
    content:
      "Ho dovuto spedire un oggetto delicato all'estero e grazie a Magic Box Roma è arrivato perfettamente integro. Servizio impeccabile e personale gentilissimo!",
    rating: 5,
  },
  {
    name: "Laura Rossi",
    role: "Imprenditrice",
    content:
      "Utilizziamo Magic Box Roma per tutte le spedizioni della nostra azienda. Puntualità e professionalità al top, oltre a prezzi competitivi. Consigliatissimo!",
    rating: 5,
  },
  {
    name: "Giovanni Verdi",
    role: "Artigiano",
    content:
      "I miei prodotti artigianali hanno bisogno di un'attenzione particolare nell'imballaggio. Con Magic Box Roma ho trovato la soluzione perfetta per le mie spedizioni.",
    rating: 4,
  },
  {
    name: "Francesca Neri",
    role: "Designer",
    content:
      "Il servizio di ritiro a domicilio è stato fondamentale per la mia attività. Comodo, veloce e affidabile. Utilizzerò sicuramente di nuovo Magic Box Roma.",
    rating: 5,
  },
  {
    name: "Roberto Marini",
    role: "Collezionista",
    content:
      "Quando devo spedire i pezzi della mia collezione mi affido solo a Magic Box Roma. La cura nell'imballaggio e la sicurezza nella consegna sono fondamentali per me.",
    rating: 5,
  },
  {
    name: "Elena Ferretti",
    role: "E-commerce Owner",
    content:
      "Da quando collaboriamo con Magic Box Roma per le spedizioni del nostro e-commerce, i reclami per danni sono praticamente scomparsi. Servizio eccellente!",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const displayCount = 1 // Numero di testimonianze visibili su mobile
  const displayCountDesktop = 3 // Numero di testimonianze visibili su desktop

  const nextTestimonial = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (testimonials.length - displayCountDesktop + 1))
      setIsAnimating(false)
    }, 300)
  }

  const prevTestimonial = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - displayCountDesktop : prevIndex - 1))
      setIsAnimating(false)
    }, 300)
  }

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
    <section className="w-full py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">
            Cosa Dicono i <span className="text-primary">Clienti</span>
          </h2>
          <p className="text-lg text-gray-600">
            La soddisfazione dei nostri clienti è la nostra priorità. Ecco alcune testimonianze di chi ha scelto i
            nostri servizi.
          </p>
        </div>

        <div className="relative reveal">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}
          >
            {testimonials.slice(currentIndex, currentIndex + displayCountDesktop).map((testimonial, index) => (
              <Card 
                key={index} 
                className={`shadow-lg border-none hover:shadow-xl transition-all duration-300 ${index >= displayCount ? 'hidden md:block' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-secondary">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={prevTestimonial}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {[...Array(testimonials.length - displayCountDesktop + 1)].map((_, index) => (
              <Button
                key={index}
                variant={currentIndex === index ? "default" : "outline"}
                size="sm"
                className={`w-2 h-2 p-0 rounded-full ${currentIndex === index ? "bg-primary" : "bg-transparent"}`}
                onClick={() => setCurrentIndex(index)}
              >
                <span className="sr-only">Pagina {index + 1}</span>
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={nextTestimonial}
              disabled={currentIndex >= testimonials.length - displayCountDesktop}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

