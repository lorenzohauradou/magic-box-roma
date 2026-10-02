#!/usr/bin/env node
/**
 * Crea (o promuove) il primo amministratore dell'area riservata.
 *
 * Uso:
 *   node --env-file=.env.local scripts/crea-admin.mjs --email lorenzooradu@gmail.com --nome "Lorenzo" --password "UnaPasswordSicura!"
 *
 * Richiede in .env.local: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js"

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const email = arg("email")
const password = arg("password")
const nome = arg("nome") ?? ""

if (!email || !password) {
  console.error('Uso: node --env-file=.env.local scripts/crea-admin.mjs --email <email> --password <password> [--nome "Nome"]')
  process.exit(1)
}
if (password.length < 8) {
  console.error("La password deve avere almeno 8 caratteri.")
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error("Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (usa --env-file=.env.local).")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

let userId
const created = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { nome, ruolo: "admin" },
})

if (created.error) {
  if (!/already|exists|registered/i.test(created.error.message)) {
    console.error("Errore creazione utente:", created.error.message)
    process.exit(1)
  }
  // Utente già presente: lo cerchiamo e lo promuoviamo ad admin aggiornando la password.
  const list = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const existing = list.data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!existing) {
    console.error("Utente esistente ma non trovato nella lista:", created.error.message)
    process.exit(1)
  }
  userId = existing.id
  const upd = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    ban_duration: "none",
    user_metadata: { ...(existing.user_metadata ?? {}), nome: nome || existing.user_metadata?.nome, ruolo: "admin" },
  })
  if (upd.error) {
    console.error("Errore aggiornamento utente:", upd.error.message)
    process.exit(1)
  }
  console.log(`Utente esistente aggiornato: ${email}`)
} else {
  userId = created.data.user.id
  console.log(`Utente creato: ${email}`)
}

const profilo = await supabase
  .from("profili")
  .upsert({ id: userId, email, nome, ruolo: "admin", attivo: true }, { onConflict: "id" })
if (profilo.error) {
  console.error("Errore salvataggio profilo (hai eseguito la migrazione SQL?):", profilo.error.message)
  process.exit(1)
}

console.log(`✔ ${email} è amministratore dell'area riservata. Accedi su /area-riservata/login`)
