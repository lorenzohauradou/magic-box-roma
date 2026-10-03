import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Accesso" }

const MESSAGGI: Record<string, string> = {
  disattivato: "Il tuo account è stato disattivato. Contatta l'amministratore.",
  sessione: "La sessione è scaduta. Accedi di nuovo.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; errore?: string }>
}) {
  const { next, errore } = await searchParams
  const configurato = isSupabaseConfigured()
  const messaggio = errore ? MESSAGGI[errore] : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 sm:p-12">
      <div className="w-full max-w-sm space-y-8 rounded-xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-magic-box-roma.png"
            alt="Magic Box Roma"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div className="leading-tight">
            <p className="text-lg font-bold text-secondary">
              Magic<span className="text-primary">Box</span> Roma
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-400">Area riservata</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Accedi all&apos;area riservata
          </h2>
        </div>

        {messaggio ? (
          <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {messaggio}
          </p>
        ) : null}

        {configurato ? (
          <LoginForm next={next} />
        ) : (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Configurazione mancante</p>
          </div>
        )}

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Torna al sito
          </Link>
        </div>
      </div>
    </div>
  )
}