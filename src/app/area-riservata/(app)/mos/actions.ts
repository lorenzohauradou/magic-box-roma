"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { SupabaseClient } from "@supabase/supabase-js"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { fase2Schema, invioCopiaSchema, mosSchema, type Fase2Values, type MosFormValues } from "@/lib/mos/schema"
import { generaPdfMos, nomeFilePdf } from "@/lib/mos/pdf"
import { inviaCopiaMosEmail } from "@/lib/mos/email"
import type { Cliente, Mos } from "@/types/database"

export type Risultato<T = undefined> =
  | { ok: true; dati: T; messaggio?: string }
  | { ok: false; errore: string; campi?: Record<string, string> }

const ARCHIVIO = "/area-riservata/mos"

function rivalida(id?: string) {
  revalidatePath(ARCHIVIO)
  revalidatePath("/area-riservata")
  if (id) revalidatePath(`${ARCHIVIO}/${id}`)
}

// ---------------------------------------------------------------------
//  Clienti: ricerca per il completamento automatico
// ---------------------------------------------------------------------
export type ClienteSuggerito = Pick<
  Cliente,
  "id" | "nome" | "cognome" | "ragione_sociale" | "partita_iva" | "codice_sdi" | "indirizzo" | "cap" | "citta" | "provincia" | "stato" | "telefono" | "email" | "nominativo"
>

export async function cercaClienti(q: string): Promise<ClienteSuggerito[]> {
  await requireProfilo()
  const termine = q.trim().replace(/[,%()]/g, " ").replace(/\s+/g, " ")
  if (termine.length < 2) return []
  const supabase = await createClient()
  const like = `%${termine}%`
  const { data } = await supabase
    .from("clienti")
    .select("id, nome, cognome, ragione_sociale, partita_iva, codice_sdi, indirizzo, cap, citta, provincia, stato, telefono, email, nominativo")
    .or(`nominativo.ilike.${like},telefono.ilike.${like},email.ilike.${like},partita_iva.ilike.${like}`)
    .order("updated_at", { ascending: false })
    .limit(8)
  return (data ?? []) as ClienteSuggerito[]
}

type Prefisso = "mitt" | "dest"

function datiCliente(prefisso: Prefisso, v: MosFormValues) {
  const g = (k: string) => ((v as unknown as Record<string, unknown>)[`${prefisso}_${k}`] as string | undefined) ?? ""
  return {
    nome: g("nome"),
    cognome: g("cognome"),
    ragione_sociale: g("ragione_sociale"),
    partita_iva: prefisso === "mitt" ? g("partita_iva") : "",
    codice_sdi: prefisso === "mitt" ? g("sdi") : "",
    indirizzo: g("indirizzo"),
    cap: g("cap"),
    citta: g("citta"),
    provincia: g("provincia"),
    stato: g("stato") || "Italia",
    telefono: g("telefono"),
    email: g("email"),
  }
}

/**
 * Mantiene aggiornata l'anagrafica clienti: se il modulo è stato compilato a partire da un
 * cliente in archivio ne aggiorna la scheda, altrimenti la crea (o riusa una scheda identica).
 */
async function sincronizzaCliente(supabase: SupabaseClient, prefisso: Prefisso, v: MosFormValues): Promise<string | null> {
  const dati = datiCliente(prefisso, v)
  const nominativo = `${dati.nome} ${dati.cognome} ${dati.ragione_sociale}`.replace(/\s+/g, " ").trim()
  if (!nominativo) return null

  const idEsistente = (v as unknown as Record<string, unknown>)[`${prefisso}_cliente_id`] as string | null
  if (idEsistente) {
    const { error } = await supabase.from("clienti").update(dati).eq("id", idEsistente)
    if (!error) return idEsistente
  }

  const { data: trovato } = await supabase
    .from("clienti")
    .select("id")
    .ilike("nominativo", nominativo)
    .eq("cap", dati.cap)
    .limit(1)
    .maybeSingle()
  if (trovato?.id) {
    await supabase.from("clienti").update(dati).eq("id", trovato.id)
    return trovato.id as string
  }

  const { data: creato } = await supabase.from("clienti").insert(dati).select("id").single()
  return (creato?.id as string | undefined) ?? null
}

// ---------------------------------------------------------------------
//  Salvataggio del modulo (nuovo o modifica)
// ---------------------------------------------------------------------
export async function salvaMos(values: MosFormValues, id?: string): Promise<Risultato<{ id: string }>> {
  const profilo = await requireProfilo()
  const parsed = mosSchema.safeParse(values)
  if (!parsed.success) {
    const campi: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const k = issue.path.join(".")
      if (k && !campi[k]) campi[k] = issue.message
    }
    return { ok: false, errore: "Controlla i campi evidenziati.", campi }
  }

  const supabase = await createClient()
  const d = parsed.data
  const [mittId, destId] = await Promise.all([sincronizzaCliente(supabase, "mitt", d), sincronizzaCliente(supabase, "dest", d)])

  const riga = { ...d, mitt_cliente_id: mittId, dest_cliente_id: destId }

  if (id) {
    const { error } = await supabase.from("mos").update(riga).eq("id", id)
    if (error) return { ok: false, errore: `Salvataggio non riuscito: ${error.message}` }
    rivalida(id)
    return { ok: true, dati: { id }, messaggio: "Modulo aggiornato." }
  }

  const { data, error } = await supabase
    .from("mos")
    .insert({ ...riga, created_by: profilo.id })
    .select("id, numero")
    .single()
  if (error || !data) return { ok: false, errore: `Salvataggio non riuscito: ${error?.message ?? "errore sconosciuto"}` }
  rivalida(data.id)
  return { ok: true, dati: { id: data.id }, messaggio: `Modulo MOS-${String(data.numero).padStart(5, "0")} registrato.` }
}

// ---------------------------------------------------------------------
//  Stampa e firma
// ---------------------------------------------------------------------
async function caricaMos(supabase: SupabaseClient, id: string): Promise<Mos | null> {
  const { data } = await supabase.from("mos").select("*").eq("id", id).maybeSingle()
  return (data as Mos | null) ?? null
}

export async function segnaStampato(id: string): Promise<Risultato> {
  await requireProfilo()
  const supabase = await createClient()
  const mos = await caricaMos(supabase, id)
  if (!mos) return { ok: false, errore: "Modulo non trovato" }
  const patch: Partial<Mos> = { stampato_il: new Date().toISOString() }
  if (mos.stato === "bozza") patch.stato = "stampato"
  const { error } = await supabase.from("mos").update(patch).eq("id", id)
  if (error) return { ok: false, errore: error.message }
  rivalida(id)
  return { ok: true, dati: undefined }
}

const firmaSchema = z
  .string()
  .startsWith("data:image/png;base64,", "Formato firma non valido")
  .max(600_000, "Firma troppo pesante")

export async function salvaFirma(id: string, firmaPng: string): Promise<Risultato> {
  await requireProfilo()
  const parsed = firmaSchema.safeParse(firmaPng)
  if (!parsed.success) return { ok: false, errore: parsed.error.issues[0]?.message ?? "Firma non valida" }
  const supabase = await createClient()
  const mos = await caricaMos(supabase, id)
  if (!mos) return { ok: false, errore: "Modulo non trovato" }
  const patch: Partial<Mos> = { firma_png: parsed.data, firmato_il: new Date().toISOString() }
  if (mos.stato === "bozza") patch.stato = "stampato"
  const { error } = await supabase.from("mos").update(patch).eq("id", id)
  if (error) return { ok: false, errore: error.message }
  rivalida(id)
  return { ok: true, dati: undefined, messaggio: "Firma acquisita e inserita nel modulo." }
}

export async function rimuoviFirma(id: string): Promise<Risultato> {
  await requireProfilo()
  const supabase = await createClient()
  const { error } = await supabase.from("mos").update({ firma_png: null, firmato_il: null }).eq("id", id)
  if (error) return { ok: false, errore: error.message }
  rivalida(id)
  return { ok: true, dati: undefined, messaggio: "Firma rimossa." }
}

// ---------------------------------------------------------------------
//  Fase 2: spedizione avvenuta + invio copia
// ---------------------------------------------------------------------
async function inviaCopiaInterna(supabase: SupabaseClient, mos: Mos, email: string) {
  const pdf = await generaPdfMos(mos)
  await inviaCopiaMosEmail({ mos, pdf, nomeFile: nomeFilePdf(mos), destinatario: email })
  const patch: Partial<Mos> = { copia_inviata_a: email, copia_inviata_il: new Date().toISOString() }
  if (mos.stato === "spedito") patch.stato = "copia_inviata"
  await supabase.from("mos").update(patch).eq("id", mos.id)
}

export async function registraSpedizione(id: string, values: Fase2Values): Promise<Risultato<{ emailInviata: boolean; emailErrore?: string; emailA?: string }>> {
  await requireProfilo()
  const parsed = fase2Schema.safeParse(values)
  if (!parsed.success) {
    const campi: Record<string, string> = {}
    for (const issue of parsed.error.issues) campi[issue.path.join(".")] = issue.message
    return { ok: false, errore: "Controlla i campi evidenziati.", campi }
  }
  const supabase = await createClient()
  const esistente = await caricaMos(supabase, id)
  if (!esistente) return { ok: false, errore: "Modulo non trovato" }

  const { error } = await supabase
    .from("mos")
    .update({ ...parsed.data, stato: "spedito" })
    .eq("id", id)
  if (error) return { ok: false, errore: error.message }

  const mos = await caricaMos(supabase, id)
  let emailInviata = false
  let emailErrore: string | undefined
  const emailA = mos?.mitt_email?.trim() || undefined
  if (mos && emailA) {
    try {
      await inviaCopiaInterna(supabase, mos, emailA)
      emailInviata = true
    } catch (e) {
      emailErrore = e instanceof Error ? e.message : "Invio email non riuscito"
    }
  }
  rivalida(id)
  return { ok: true, dati: { emailInviata, emailErrore, emailA } }
}

export async function inviaCopia(id: string, email?: string): Promise<Risultato<{ emailA: string }>> {
  await requireProfilo()
  const supabase = await createClient()
  const mos = await caricaMos(supabase, id)
  if (!mos) return { ok: false, errore: "Modulo non trovato" }
  const parsed = invioCopiaSchema.safeParse({ email: email ?? mos.mitt_email })
  if (!parsed.success) return { ok: false, errore: "Inserisci un indirizzo email valido." }
  try {
    await inviaCopiaInterna(supabase, mos, parsed.data.email)
  } catch (e) {
    return { ok: false, errore: e instanceof Error ? e.message : "Invio email non riuscito" }
  }
  rivalida(id)
  return { ok: true, dati: { emailA: parsed.data.email }, messaggio: `Copia inviata a ${parsed.data.email}.` }
}

export async function eliminaMos(id: string): Promise<Risultato> {
  const profilo = await requireProfilo()
  const supabase = await createClient()
  const mos = await caricaMos(supabase, id)
  if (!mos) return { ok: false, errore: "Modulo non trovato" }
  if (mos.stato !== "bozza" && profilo.ruolo !== "admin") {
    return { ok: false, errore: "Solo un amministratore può eliminare un modulo già stampato o spedito." }
  }
  const { error } = await supabase.from("mos").delete().eq("id", id)
  if (error) return { ok: false, errore: error.message }
  rivalida()
  return { ok: true, dati: undefined, messaggio: "Modulo eliminato." }
}
