"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const testimonials = [
  {
    name: "Gianmarco Faraoni",
    role: "CEO - Azienda di Forniture",
    content:
      "Collaboro con Magic box da quasi 6 mesi ormai, servendomi,per la mia società con la quale effettuo forniture di vario genere, del Servizio di logistica e spedizione! Grazie alla loro disponibilità e professionalità gestisco il tutto dal mio telefono! Disponibili nel risolvere qualsiasi intoppo si possa creare e rapidi nella gestione e soluzione del tutto! Ragazzi giovani e super preparati! Proseguiamo con la nostra collaborazione! Avanti tutta, sempre al top!",
    rating: 5,
    image: "/persona5.png"
  },
  {
    name: "Francesca Citarella",
    role: "E-commerce - Founder",
    content:
      "Ho iniziato a lavorare con loro e mi sono trovata subito benissimo. Ho uno shoponline e loro seguono e si occupano delle mie spedizioni dall'inizio alla fine. Consigliati e approvati!",
    rating: 5,
    image: "/persona3.png"
  },
  {
    name: "Arturo Nanni",
    role: "Cliente Privato",
    content:
      "Un punto eccezionale per ricevere e spedire pacchi di ogni genere. Il personale molto gentile e preciso nei veri servizi Bravi Magic Box e complimenti per il vostro lavoro con simpatia e ammirazione Arthur Nanni",
    rating: 5,
    image: "/persona1.png"
  },
  {
    name: "Edoardo Scrima",
    role: "Cliente Privato",
    content:
      "Servizio ottimo. Ho chiesto loro di spedirmi un pacco in Francia, a Parigi, e sono stati super efficienti. Dopo neanche 5 giorni il pacco era già arrivato a casa. Inoltre il personale è cordiale e disponibile a cercare di soddisfare ogni richiesta del cliente.",
    rating: 5,
    image: "/persona4.png"
  },
  {
    name: "Alessandro Valeri",
    role: "Privato",
    content:
      "Abbiamo contattato la magic.box. per la spedizione delle valigie per la nostra settimana bianca, che dire! Esperienza fantastica precisi e puntuali sia all'andata che al ritorno, ragazzi in gamba, gentili ed economici. Sicuramente consigliato.",
    rating: 5,
    image: "/persona2.png"
  },

]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Numero fisso di testimonianze visibili in base alla viewport
  const displayCount = 1 // mobile
  const displayCountTablet = 2 // tablet
  const displayCountDesktop = 3 // desktop
  
  // Calcolo numero massimo di pagine possibili (solo 2 pagine sul desktop)
  const maxPages = 2

  // Gestione dimensioni viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    
    // Imposta i valori iniziali
    handleResize()
    
    // Aggiungi l'event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const nextTestimonial = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setTimeout(() => {
      if (isMobile) {
        // Su mobile, ci sono 5 pagine (una per ogni testimonial)
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
      } else if (isTablet) {
        // Su tablet, ci sono 3 pagine (mostra 2 testimonial alla volta)
        setCurrentIndex((prevIndex) => (prevIndex + 1) % 3)
      } else {
        // Su desktop ci saranno solo 2 pagine (0 e 1)
        setCurrentIndex((prevIndex) => prevIndex === 0 ? 1 : 0)
      }
      setIsAnimating(false)
    }, 300)
  }

  const prevTestimonial = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setTimeout(() => {
      if (isMobile) {
        // Su mobile, ci sono 5 pagine (una per ogni testimonial)
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
      } else if (isTablet) {
        // Su tablet, ci sono 3 pagine (mostra 2 testimonial alla volta)
        setCurrentIndex((prevIndex) => (prevIndex - 1 + 3) % 3)
      } else {
        // Su desktop ci saranno solo 2 pagine (0 e 1)
        setCurrentIndex((prevIndex) => prevIndex === 1 ? 0 : 1)
      }
      setIsAnimating(false)
    }, 300)
  }

  // Funzione per filtrare i testimonial da mostrare
  const getVisibleTestimonials = () => {
    if (isMobile) {
      // Su mobile mostra solo un testimonial
      return [testimonials[currentIndex % testimonials.length]];
    } else if (isTablet) {
      // Su tablet mostra due testimonial
      const startIdx = (currentIndex * displayCountTablet) % testimonials.length;
      return [
        testimonials[startIdx],
        testimonials[(startIdx + 1) % testimonials.length]
      ].filter(Boolean);
    } else {
      // Su desktop, prima pagina: primi 3, seconda pagina: ultimi 2
      return currentIndex === 0 
        ? testimonials.slice(0, 3)  // Prima pagina: primi 3 testimonial
        : testimonials.slice(3);    // Seconda pagina: ultimi 2 testimonial
    }
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
            {getVisibleTestimonials().map((testimonial, index) => (
              <Card 
                key={testimonial.name} 
                className="shadow-lg border-none hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <Image 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          width={48} 
                          height={48} 
                          className="object-cover w-full h-full"
                        />
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
              disabled={isMobile ? false : currentIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {[...Array(isMobile ? testimonials.length : isTablet ? 3 : maxPages)].map((_, index) => (
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
              disabled={isMobile ? false : (isTablet ? currentIndex >= 2 : currentIndex >= maxPages - 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

