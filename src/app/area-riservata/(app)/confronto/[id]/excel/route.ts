import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { creaExcelConfronto } from "@/lib/poste/excel"
import type { RisultatoConfronto } from "@/lib/poste/confronto"
import { formatDataOra } from "@/lib/format"
import type { ConfrontoRecord } from "@/types/database"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireProfilo()
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("confronti").select("*").eq("id", id).maybeSingle()
  if (!data) return new Response("Confronto non trovato", { status: 404 })

  const c = data as ConfrontoRecord
  const risultato = c.risultato as RisultatoConfronto
  if (!risultato || risultato.versione !== 1) return new Response("Formato del confronto non supportato", { status: 422 })

  const buffer = await creaExcelConfronto(risultato, { nomeFile: c.nome_file, creatoIl: formatDataOra(c.created_at) })
  const nome = `confronto-poste-${(c.numero_fattura || c.id).replace(/[^\w-]+/g, "_")}.xlsx`

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
