import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseEnv } from "./env"

/**
 * Client Supabase per Server Components, Server Actions e Route Handlers.
 * Usa la sessione dell'utente (cookie), quindi le policy RLS si applicano.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Chiamato da un Server Component: i cookie vengono aggiornati dal middleware.
        }
      },
    },
  })
}
