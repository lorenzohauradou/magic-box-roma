import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { generaPdfMos, nomeFilePdf } from "@/lib/mos/pdf"
import type { Mos } from "@/types/database"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireProfilo()
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("mos").select("*").eq("id", id).maybeSingle()
  if (!data) return new Response("Modulo non trovato", { status: 404 })

  const mos = data as Mos
  const pdf = await generaPdfMos(mos)
  const download = new URL(request.url).searchParams.get("download") === "1"

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${nomeFilePdf(mos)}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
