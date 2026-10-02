"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { sanitizeNext } from "@/lib/supabase/middleware"

const schema = z.object({
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "Inserisci la password"),
  next: z.string().optional(),
})

export type LoginState = { errore: string | null }

export async function accedi(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  })
  if (!parsed.success) {
    return { errore: parsed.error.issues[0]?.message ?? "Dati non validi" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes("invalid login")) {
      return { errore: "Email o password non corretti." }
    }
    return { errore: error?.message ?? "Accesso non riuscito. Riprova." }
  }

  const { data: profilo } = await supabase.from("profili").select("attivo").eq("id", data.user.id).maybeSingle()
  if (!profilo || !profilo.attivo) {
    await supabase.auth.signOut()
    return { errore: "Il tuo account è disattivato. Contatta l'amministratore." }
  }

  redirect(sanitizeNext(parsed.data.next))
}
