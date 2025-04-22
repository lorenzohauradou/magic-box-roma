"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const navLinks = [
    { href: "/#home", label: "Home" },
    { href: "/#servizi", label: "Servizi" },
    { href: "/#vantaggi", label: "Vantaggi" },
    { href: "/#processo", label: "Come Funziona" },
    { href: "/#negozio", label: "Negozio" },
    { href: "/#contatti", label: "Contatti" },
  ]

  return (
    <header
      className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", {
        "bg-white text-secondary shadow-lg py-3": isScrolled,
        "bg-transparent text-white py-5": !isScrolled,
      })}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center z-20">
            <div className="relative h-12 w-48">
              {isScrolled ? (
                <div className="flex items-center">
                  <span className="text-xl font-bold text-secondary">Magic</span>
                  <span className="text-xl font-bold text-primary">Box</span>
                  <span className="text-xl font-bold text-secondary ml-1">Roma</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-xl font-bold text-white">Magic</span>
                  <span className="text-xl font-bold text-primary ml-1">Box</span>
                  <span className="text-xl font-bold text-white ml-1">Roma</span>
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full",
                  {
                    "text-secondary hover:text-primary-600": isScrolled,
                    "text-white hover:text-primary-100": !isScrolled,
                  },
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button size="lg" className="bg-primary hover:bg-primary-600 text-white font-medium rounded-md" onClick={() => window.location.href = "/#contatti"}>
              Richiedi Preventivo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden z-20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? "text-secondary" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? "text-secondary" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-secondary z-10 lg:hidden flex flex-col justify-center items-center">
          <nav className="flex flex-col space-y-6 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white text-xl font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-600 text-white font-medium rounded-md mt-4"
              onClick={() => {
                setIsMobileMenuOpen(false)
                window.location.href = "/#contatti"
                }}
            >
              Richiedi Preventivo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

