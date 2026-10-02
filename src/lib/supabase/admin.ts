import { createClient } from "@supabase/supabase-js"

/**
 * Client con chiave service_role: bypassa le RLS.
 * Da usare SOLO lato server e SOLO dopo aver verificato che l'utente è admin.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY mancante: necessaria per la gestione degli utenti (vedi .env.example)")
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
