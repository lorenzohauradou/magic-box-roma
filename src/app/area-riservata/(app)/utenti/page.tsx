import type { Metadata } from "next"
import { Users } from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { Profilo } from "@/types/database"
import { PageHeader } from "@/components/area/page-header"
import { EmptyState } from "@/components/area/empty-state"
import { NuovoUtenteDialog } from "@/components/area/utenti/nuovo-utente-dialog"
import { UtentiTable } from "@/components/area/utenti/utenti-table"

export const metadata: Metadata = { title: "Utenti" }

export default async function UtentiPage() {
  const me = await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase.from("profili").select("*").order("created_at", { ascending: true })
  const utenti = (data ?? []) as Profilo[]
  const serviceRoleOk = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  return (
    <>
      <PageHeader
        titolo="Utenti dello staff"
        descrizione="Solo gli amministratori creano e disattivano gli accessi. Non esiste registrazione libera dall'esterno."
        azioni={<NuovoUtenteDialog />}
      />

      {!serviceRoleOk ? (
        <p role="alert" className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Per creare o modificare utenti serve la variabile <code>SUPABASE_SERVICE_ROLE_KEY</code> sul server (vedi <code>.env.example</code>).
        </p>
      ) : null}

      {utenti.length > 0 ? (
        <UtentiTable utenti={utenti} mioId={me.id} />
      ) : (
        <EmptyState icon={Users} titolo="Nessun utente" descrizione="Crea il primo accesso per lo staff." />
      )}
    </>
  )
}
