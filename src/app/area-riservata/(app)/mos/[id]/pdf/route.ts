import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { generaPdfMos, nomeFilePdf } from "@/lib/mos/pdf"
import type { Mos } from "@/types/database"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireProfilo()
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase.from("mos").select("*").eq("id", id).maybeSingle()
    if (error || !data) {
      console.error("[PDF MOS] Errore recupero Supabase o modulo non trovato:", error)
      return new Response("Modulo non trovato", { status: 404 })
    }

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
  } catch (err) {
    console.error("[PDF MOS] Errore durante la generazione del PDF:", err)
    return new Response(
      JSON.stringify({ error: "Errore interno durante la generazione del PDF", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}