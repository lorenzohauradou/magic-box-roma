import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { Profilo } from "@/types/database"

/** Profilo dell'utente loggato (null se non autenticato). Memoizzato per richiesta. */
export const getProfiloCorrente = cache(async (): Promise<Profilo | null> => {
  if (!isSupabaseConfigured()) return null
  const supabase = await createClient()
  // JWT verificato in locale (chiavi asimmetriche): l'unico round-trip è la lettura del profilo.
  const { data: auth } = await supabase.auth.getClaims()
  const claims = auth?.claims
  if (!claims) return null

  const { data } = await supabase.from("profili").select("*").eq("id", claims.sub).maybeSingle()
  if (!data) {
    // Utente esistente ma senza profilo: trattato come non attivo.
    return {
      id: claims.sub,
      email: claims.email ?? "",
      nome: "",
      ruolo: "operatore",
      attivo: false,
      created_at: "",
      updated_at: "",
    }
  }
  return data as Profilo
})

/** Da usare nelle pagine/azioni dell'area riservata: garantisce utente attivo. */
export async function requireProfilo(): Promise<Profilo> {
  const profilo = await getProfiloCorrente()
  if (!profilo) redirect("/area-riservata/login")
  if (!profilo.attivo) redirect("/area-riservata/logout?motivo=disattivato")
  return profilo
}

export async function requireAdmin(): Promise<Profilo> {
  const profilo = await requireProfilo()
  if (profilo.ruolo !== "admin") redirect("/area-riservata?errore=non-autorizzato")
  return profilo
}
