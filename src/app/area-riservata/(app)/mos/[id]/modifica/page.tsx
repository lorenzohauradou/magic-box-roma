import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatNumeroMos } from "@/lib/format"
import { mosToFormValues } from "@/lib/mos/schema"
import type { Mos } from "@/types/database"
import { PageHeader } from "@/components/area/page-header"
import { MosForm } from "@/components/area/mos/mos-form"

export const metadata: Metadata = { title: "Modifica MOS" }

export default async function ModificaMosPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, requireProfilo()])
  const supabase = await createClient()
  const { data } = await supabase.from("mos").select("*").eq("id", id).maybeSingle()
  if (!data) notFound()
  const mos = data as Mos

  return (
    <>
      <PageHeader
        titolo={`Modifica ${formatNumeroMos(mos.numero)}`}
        descrizione={
          mos.copia_inviata_il
            ? "Attenzione: il cliente ha già ricevuto una copia. Dopo le modifiche puoi reinviarla dalla pagina del modulo."
            : "Aggiorna i dati del modulo. Il numero progressivo resta invariato."
        }
        briciole={[
          { label: "Archivio MOS", href: "/area-riservata/mos" },
          { label: formatNumeroMos(mos.numero), href: `/area-riservata/mos/${mos.id}` },
          { label: "Modifica" },
        ]}
      />
      <MosForm id={mos.id} valoriIniziali={mosToFormValues(mos)} />
    </>
  )
}
