import type { Metadata } from "next"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatNumeroMos, oggiIso } from "@/lib/format"
import { mosToFormValues, valoriIniziali } from "@/lib/mos/schema"
import type { Mos } from "@/types/database"
import { PageHeader } from "@/components/area/page-header"
import { MosForm } from "@/components/area/mos/mos-form"

export const metadata: Metadata = { title: "Nuovo MOS" }

export default async function NuovoMosPage({ searchParams }: { searchParams: Promise<{ da?: string }> }) {
  const [{ da }] = await Promise.all([searchParams, requireProfilo()])
  const oggi = oggiIso()

  let origine: Mos | null = null
  if (da) {
    const supabase = await createClient()
    const { data } = await supabase.from("mos").select("*").eq("id", da).maybeSingle()
    origine = (data as Mos | null) ?? null
  }

  return (
    <>
      <PageHeader
        titolo={origine ? `Nuovo MOS da ${formatNumeroMos(origine.numero)}` : "Nuovo modulo MOS"}
        descrizione="Compila i dati al banco. Il numero progressivo viene assegnato al salvataggio."
        briciole={[{ label: "Archivio MOS", href: "/area-riservata/mos" }, { label: "Nuovo" }]}
      />
      <MosForm
        valoriIniziali={origine ? mosToFormValues(origine, { duplica: true, oggi }) : valoriIniziali(oggi)}
        duplicatoDa={origine ? { id: origine.id, numero: origine.numero } : undefined}
      />
    </>
  )
}
