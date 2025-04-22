"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, PackageSearch, PackagePlus, Truck, CheckCircle } from "lucide-react"

export default function ProcessSection() {
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

  const steps = [
    {
      icon: <PackageSearch className="h-12 w-12 text-white" />,
      title: "Richiedi un Preventivo",
      description:
        "Compila il modulo o contattaci per ricevere un preventivo personalizzato in base alle tue esigenze.",
      color: "bg-gradient-to-br from-primary-500 to-primary-600 text-white/80",
      delay: 0,
    },
    {
      icon: <PackagePlus className="h-12 w-12 text-primary" />,
      title: "Prepariamo il Pacco",
      description:
        "Portiamo i tuoi oggetti al negozio o li ritiriamo a domicilio, e li imballiamo con materiali premium.",
      color: "bg-gradient-to-br from-primary-50 to-primary-100",
      delay: 200,
    },
    {
      icon: <Truck className="h-12 w-12 text-white" />,
      title: "Spediamo Ovunque",
      description: "Affidiamo il pacco ai migliori corrieri per garantire una consegna puntuale e sicura.",
      color: "bg-gradient-to-br from-secondary-600 to-secondary-950 text-white/80",
      delay: 400,
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-primary" />,
      title: "Consegna Completata",
      description: "Monitoriamo la spedizione fino alla consegna, offrendoti aggiornamenti in tempo reale.",
      color: "bg-gradient-to-br from-secondary-50 to-secondary-100",
      delay: 600,
    },
  ]

  return (
    <section id="processo" className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-secondary">
            Come <span className="text-primary">Funziona</span>
          </h2>
          <p className="text-lg text-gray-600">
            Un processo semplice e trasparente per offrirti la migliore esperienza di spedizione e imballaggio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`reveal rounded-xl p-8 ${step.color} transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
              style={{ animationDelay: `${step.delay}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full p-4 bg-white/20 mb-6">{step.icon}</div>

                <div className="rounded-full bg-white/20 w-8 h-8 flex items-center justify-center mb-5">
                  <span
                    className={`font-bold ${step.color.includes("from-primary-50") || step.color.includes("to-secondary-100") ? "text-secondary" : "text-white"}`}
                  >
                    {index + 1}
                  </span>
                </div>

                <h3
                  className={`text-xl font-bold mb-3 ${step.color.includes("to-primary-100") || step.color.includes("to-secondary-100") ? "text-secondary" : "text-white"}`}
                >
                  {step.title}
                </h3>

                <p className="text-inherit">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 reveal">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-600 text-white font-medium rounded-md group transition-all"
          >
            Inizia Ora
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}

