import HeroSection from "@/components/hero-section"
import ServicesSection from "@/components/services-section"
import FeaturesSection from "@/components/features-section"
import ProcessSection from "@/components/process-section"
import TestimonialsSection from "@/components/testimonials-section"
import StoreSection from "@/components/store-section"
import CtaSection from "@/components/cta-section"
import WhatsAppButton from "@/components/whatsapp-button"
import FaqSection from "@/components/faq-section"
import AboutSection from "@/components/about-section"
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <FeaturesSection />
      <ProcessSection />
      <TestimonialsSection />
      <StoreSection />
      <FaqSection />
      <CtaSection />
      <WhatsAppButton />
    </main>
  )
}

