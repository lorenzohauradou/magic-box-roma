import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function esci(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const url = new URL(request.url)
  const destinazione = new URL("/area-riservata/login", url.origin)
  const motivo = url.searchParams.get("motivo")
  if (motivo) destinazione.searchParams.set("errore", motivo)

  return NextResponse.redirect(destinazione, { status: 303 })
}

export async function GET(request: Request) {
  return esci(request)
}

export async function POST(request: Request) {
  return esci(request)
}
