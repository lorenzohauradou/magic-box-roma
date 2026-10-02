import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, FileText, Search, ShieldCheck, Sparkles } from "lucide-react"
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Pannello brand */}
      <section className="relative hidden overflow-hidden bg-secondary-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <Image src="/logo-magic-box-roma.png" alt="Magic Box Roma" width={44} height={44} className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <p className="text-lg font-bold">
              Magic<span className="text-primary">Box</span> Roma
            </p>
            <p className="text-xs uppercase tracking-widest text-white/50">Area riservata</p>
          </div>
        </div>

        <div className="relative max-w-md space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary-100">
            <Sparkles className="h-3.5 w-3.5" /> Gestionale spedizioni
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Il modulo MOS, <span className="text-primary">digitale.</span>
          </h1>
          <ul className="space-y-4 text-white/80">
            <li className="flex gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>Compilazione al banco, PDF fedele al cartaceo e firma del cliente su tablet.</span>
            </li>
            <li className="flex gap-3">
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>Archivio ricercabile per nominativo, numero, tracking e date.</span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>Confronto automatico con le fatture di Poste e segnalazione delle anomalie.</span>
            </li>
          </ul>
        </div>

        <p className="relative text-sm text-white/40">© {new Date().getFullYear()} Danema S.r.l.s. · Magic Box Roma</p>
      </section>

      {/* Form di accesso */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Image src="/logo-magic-box-roma.png" alt="Magic Box Roma" width={40} height={40} className="h-10 w-10 object-contain" />
            <p className="text-lg font-bold text-secondary">
              Magic<span className="text-primary">Box</span> Roma
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Accedi all&apos;area riservata</h2>
            <p className="text-sm text-slate-500">Inserisci le credenziali fornite dall&apos;amministratore.</p>
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
              <p className="mt-1">
                Imposta <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nel file{" "}
                <code>.env.local</code> (vedi <code>.env.example</code> e <code>docs/AREA-RISERVATA.md</code>).
              </p>
            </div>
          )}

          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Torna al sito
          </Link>
        </div>
      </section>
    </div>
  )
}
