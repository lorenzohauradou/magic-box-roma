export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      "Configurazione Supabase mancante: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (vedi .env.example)",
    )
  }
  return { url, anonKey }
}

/** Nel browser non c'è un client Supabase: i cookie di sessione restano inaccessibili a JavaScript. */
export const COOKIE_OPTIONS = { httpOnly: true, secure: process.env.NODE_ENV === "production" }

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
