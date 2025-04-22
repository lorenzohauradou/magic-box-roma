import Image from "next/image"

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/393515947075"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors hover:scale-110 duration-300"
      aria-label="Contattaci su WhatsApp"
    >
      <Image
        src="/whatsapp.png"
        alt="WhatsApp"
        width={24}
        height={24}
        className="h-6 w-6"
      />
    </a>
  )
}

