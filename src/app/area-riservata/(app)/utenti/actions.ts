"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Ruolo } from "@/types/database"

export type ActionState = { ok?: boolean; errore?: string; messaggio?: string }

const PAGINA = "/area-riservata/utenti"
const BAN_PERMANENTE = "876000h" // ~100 anni: l'utente non può più accedere finché non viene riattivato

const nuovoUtenteSchema = z.object({
  nome: z.string().trim().min(1, "Inserisci il nome").max(100),
  email: z.string().trim().email("Indirizzo email non valido"),
  ruolo: z.enum(["admin", "operatore"]),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri").max(72),
})

function traduciErrore(msg: string) {
  const m = msg.toLowerCase()
  if (m.includes("already") || m.includes("exists") || m.includes("registered")) return "Esiste già un utente con questa email."
  if (m.includes("password")) return "Password non valida: usa almeno 8 caratteri."
  if (m.includes("service_role") || m.includes("service role")) return "Chiave service_role mancante o non valida."
  return msg
}

export async function creaUtente(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = nuovoUtenteSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    ruolo: formData.get("ruolo"),
    password: formData.get("password"),
  })
  if (!parsed.success) return { errore: parsed.error.issues[0]?.message ?? "Dati non validi" }

  const { nome, email, ruolo, password } = parsed.data
  let admin
  try {
    admin = createAdminClient()
  } catch (e) {
    return { errore: e instanceof Error ? e.message : "Configurazione mancante" }
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, ruolo },
  })
  if (error || !data.user) return { errore: traduciErrore(error?.message ?? "Creazione non riuscita") }

  // Il trigger crea già il profilo; l'upsert garantisce nome e ruolo corretti.
  const { error: errProfilo } = await admin
    .from("profili")
    .upsert({ id: data.user.id, email, nome, ruolo, attivo: true }, { onConflict: "id" })
  if (errProfilo) return { errore: `Utente creato ma profilo non salvato: ${errProfilo.message}` }

  revalidatePath(PAGINA)
  return { ok: true, messaggio: `Utente ${email} creato. Comunica la password all'operatore.` }
}

export async function impostaAttivo(id: string, attivo: boolean): Promise<ActionState> {
  const me = await requireAdmin()
  if (id === me.id) return { errore: "Non puoi disattivare il tuo stesso account." }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: attivo ? "none" : BAN_PERMANENTE })
  if (error) return { errore: traduciErrore(error.message) }

  const { error: errProfilo } = await admin.from("profili").update({ attivo }).eq("id", id)
  if (errProfilo) return { errore: errProfilo.message }

  revalidatePath(PAGINA)
  return { ok: true, messaggio: attivo ? "Utente riattivato." : "Utente disattivato: non potrà più accedere." }
}

export async function impostaRuolo(id: string, ruolo: Ruolo): Promise<ActionState> {
  const me = await requireAdmin()
  if (id === me.id) return { errore: "Non puoi cambiare il tuo stesso ruolo." }

  const admin = createAdminClient()
  const { error: errProfilo } = await admin.from("profili").update({ ruolo }).eq("id", id)
  if (errProfilo) return { errore: errProfilo.message }
  await admin.auth.admin.updateUserById(id, { user_metadata: { ruolo } })

  revalidatePath(PAGINA)
  return { ok: true, messaggio: ruolo === "admin" ? "L'utente è ora amministratore." : "L'utente è ora operatore." }
}

const passwordSchema = z.string().min(8, "La password deve avere almeno 8 caratteri").max(72)

export async function reimpostaPassword(id: string, password: string): Promise<ActionState> {
  await requireAdmin()
  const parsed = passwordSchema.safeParse(password)
  if (!parsed.success) return { errore: parsed.error.issues[0]?.message ?? "Password non valida" }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, { password: parsed.data })
  if (error) return { errore: traduciErrore(error.message) }

  return { ok: true, messaggio: "Password aggiornata. Comunicala all'operatore." }
}
