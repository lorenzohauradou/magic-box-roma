import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Instagram, Clock } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary text-white pt-20 text-center md:text-left">
      <div className="container">
      <div className="absolute h-80 w-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-10">
          <div>
            <div className="mb-5">
              <div className="md:flex items-center">
                <span className="text-xl font-bold text-white">Magic</span>
                <span className="text-xl font-bold text-primary ml-1">Box</span>
                <span className="text-xl font-bold text-white ml-1">Roma</span>
              </div>
            </div>
            <p className="text-white/70 mb-6">
              Soluzioni professionali di spedizione e imballaggio per privati e aziende. Dal 2010 al vostro servizio con
              qualità e affidabilità.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link
                href="https://www.facebook.com/profile.php?id=61561045394684"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-primary transition-colors"
                aria-label="Seguici su Facebook (apre in nuova scheda)"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/magic.box.roma/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-primary transition-colors"
                aria-label="Seguici su Instagram (apre in nuova scheda)"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 relative">
              I Nostri Servizi
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 md:w-10 w-28 h-0.5 bg-primary md:left-0 md:translate-x-0"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-white/70 hover:text-primary transition-colors">
                  Spedizioni Nazionali
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-primary transition-colors">
                  Spedizioni Internazionali
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-primary transition-colors">
                  Imballaggi Professionali
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-primary transition-colors">
                  Ritiro a Domicilio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-primary transition-colors">
                  Servizio Express Roma
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-primary transition-colors">
                  Magazzinaggio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 relative">
              Contattaci
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 md:w-10 w-20 h-0.5 bg-primary md:left-0 md:translate-x-0"></span>
            </h3>
            <ul className="space-y-4 text-center md:text-left">
              <li className="flex flex-col items-center md:flex-row md:items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-white/70">Via Francesco D'Ovidio 143/145, Roma - Zona Talenti</span>
              </li>
              <li className="flex flex-col items-center md:flex-row md:items-start gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-white/70">+39 0689226298</span>
              </li>
              <li className="flex flex-col items-center md:flex-row md:items-start gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-white/70">info@magicboxroma.it</span>
              </li>
              <li className="flex flex-col items-center md:flex-row md:items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-white/70">
                  Lun-Ven: 9:00 - 19:00
                  <br />
                  Sab: 9:00 - 13:00
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center">
          <p className="text-white/50 text-sm">
            © {currentYear} Magic Box Roma. Tutti i diritti riservati. P.IVA 16908541002
          </p>
          <Link 
            href="https://nibirumail.com/cookies/policy/?url=www.magicboxroma.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/50 text-sm hover:text-primary transition-colors"
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

