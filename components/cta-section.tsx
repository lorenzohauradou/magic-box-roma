"use client"

import { useEffect, useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export default function CtaSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Gestore per l'aggiornamento dei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  // Gestore per l'invio del form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || "Errore durante l'invio dell'email.")
      }

      setSubmitStatus("success")
      setFormData({ name: "", email: "", phone: "", message: "" }) // Reset form
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Si è verificato un errore sconosciuto.")
    } finally {
      setIsSubmitting(false)
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome e Cognome
                  </label>
                  <Input
                    id="name"
                    placeholder="Es. Mario Rossi"
                    className="w-full"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Es. mario@esempio.it"
                    className="w-full"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono
                  </label>
                  <Input
                    id="phone"
                    placeholder="Es. 3XX XXXXXXX"
                    className="w-full"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Messaggio
                  </label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Descrivi le tue esigenze di spedizione o imballaggio..."
                    className="w-full min-h-[100px]"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-600 text-white group disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      Invia Richiesta
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Messaggi di stato */}
                {submitStatus === "success" && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-100 p-3 rounded-md">
                    <CheckCircle className="h-4 w-4" />
                    <span>Richiesta inviata con successo! Ti contatteremo presto.</span>
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 p-3 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Errore: {errorMessage}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

