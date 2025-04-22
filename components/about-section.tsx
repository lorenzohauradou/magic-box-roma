import Image from "next/image"
import { Check } from "lucide-react"

export default function AboutSection() {
  const services = [
    "Spedizioni nazionali ed internazionali",
    "Imballaggi professionali con materiali Premium",
    "Ritiro merci a domicilio",
    "Pony Express Roma su Roma",
    "Domiciliazioni",
    "Magazzinaggio",
    "Assistenza PC Hardware & Software",
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Magic Box Roma non è solo spedizioni!
            </h2>
            <p className="text-lg text-gray-600 italic mb-6">
              Siamo in grado di offrire servizi a 360° per privati ed aziende.
            </p>
            <p className="text-gray-600 mb-8">
              Tra i servizi più richiesti, oltre agli imballaggi professionali e alle spedizioni, puoi usufruire di
              ritiri a domicilio dei tuoi oggetti, servizio di pony Express Roma su Roma con consegne in giornata,
              servizio di domiciliazione e magazzinaggio e molto altro...
            </p>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/placeholder.svg?height=800&width=800"
              alt="Logo Magic Box Roma"
              fill
              className="object-contain bg-black"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

