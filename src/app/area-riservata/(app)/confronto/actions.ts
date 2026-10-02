"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { parsePosteFile, type FileParsato } from "@/lib/poste/parse"
import { eseguiConfronto, type ModuloPerConfronto } from "@/lib/poste/confronto"
import { nominativo } from "@/lib/format"

export type UploadState = { errore?: string }

const MAX_BYTES = 20 * 1024 * 1024
const ESTENSIONI = ["csv", "txt", "xlsx", "xlsm"]
const PAGINA = "/area-riservata/confronto"

const SELECT_MOS =
  "id, numero, data, data_spedizione, stato, corriere, lettera_di_vettura, peso_kg, n_colli, importo_totale, importo_spedizione, contrassegno_attivo, assicurazione_attiva, mitt_nome, mitt_cognome, mitt_ragione_sociale, dest_nome, dest_cognome, dest_ragione_sociale, dest_cap"

type MosRow = {
  id: string
  numero: number
  data: string
  data_spedizione: string | null
  stato: string
  corriere: string
  lettera_di_vettura: string
  peso_kg: number
  n_colli: number
  importo_totale: number
  importo_spedizione: number
  contrassegno_attivo: boolean
  assicurazione_attiva: boolean
  mitt_nome: string
  mitt_cognome: string
  mitt_ragione_sociale: string
  dest_nome: string
  dest_cognome: string
  dest_ragione_sociale: string
  dest_cap: string
}

function toModulo(m: MosRow): ModuloPerConfronto {
  return {
    id: m.id,
    numero: m.numero,
    data: m.data,
    data_spedizione: m.data_spedizione,
    stato: m.stato,
    corriere: m.corriere,
    lettera_di_vettura: m.lettera_di_vettura,
    peso_kg: Number(m.peso_kg) || 0,
    n_colli: m.n_colli,
    importo_totale: Number(m.importo_totale) || 0,
    importo_spedizione: Number(m.importo_spedizione) || 0,
    contrassegno_attivo: m.contrassegno_attivo,
    assicurazione_attiva: m.assicurazione_attiva,
    mittente: nominativo({ nome: m.mitt_nome, cognome: m.mitt_cognome, ragione_sociale: m.mitt_ragione_sociale }),
    destinatario: nominativo({ nome: m.dest_nome, cognome: m.dest_cognome, ragione_sociale: m.dest_ragione_sociale }),
    dest_cap: m.dest_cap,
  }
}

export async function caricaConfronto(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const profilo = await requireProfilo()
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return { errore: "Seleziona il file CSV o Excel di Poste." }
  if (file.size > MAX_BYTES) return { errore: "Il file supera i 20 MB." }
  const ext = file.name.toLowerCase().split(".").pop() ?? ""
  if (!ESTENSIONI.includes(ext)) return { errore: "Formato non supportato: carica un file .csv oppure .xlsx." }

  const bytes = new Uint8Array(await file.arrayBuffer())
  let parsato: FileParsato
  try {
    parsato = await parsePosteFile(file.name, bytes)
  } catch (e) {
    return { errore: e instanceof Error ? e.message : "File non leggibile" }
  }

  const supabase = await createClient()
  const moduli = new Map<string, MosRow>()

  // 1) Moduli con la stessa lettera di vettura (qualsiasi corriere)
  const ldvs = [...new Set(parsato.righe.map((r) => r.ldv))]
  for (let i = 0; i < ldvs.length; i += 200) {
    const { data, error } = await supabase.from("mos").select(SELECT_MOS).in("lettera_di_vettura", ldvs.slice(i, i + 200))
    if (error) return { errore: `Errore lettura archivio: ${error.message}` }
    for (const m of (data ?? []) as MosRow[]) moduli.set(m.id, m)
  }

  // 2) Moduli abbinabili per numero (riferimento "MOS-00042" nel campo NUM_RIF_SPED)
  const numeri = [...new Set(parsato.righe.map((r) => r.rifSped.match(/^(?:mos)?[\s#-]*0*(\d{1,7})$/i)?.[1]).filter(Boolean).map(Number))]
  if (numeri.length > 0) {
    const { data } = await supabase.from("mos").select(SELECT_MOS).in("numero", numeri.slice(0, 500))
    for (const m of (data ?? []) as MosRow[]) moduli.set(m.id, m)
  }

  // 3) Moduli spediti con Poste nel periodo della fattura (per rilevare i "non addebitati")
  const date = parsato.righe.map((r) => r.dataPartenza).filter((d): d is string => Boolean(d)).sort()
  if (date.length > 0) {
    const da = date[0]
    const a = date[date.length - 1]
    const { data } = await supabase
      .from("mos")
      .select(SELECT_MOS)
      .or("corriere.ilike.poste%,corriere.ilike.sda")
      .neq("lettera_di_vettura", "")
      .or(`and(data_spedizione.gte.${da},data_spedizione.lte.${a}),and(data_spedizione.is.null,data.gte.${da},data.lte.${a})`)
    for (const m of (data ?? []) as MosRow[]) moduli.set(m.id, m)
  }

  const risultato = eseguiConfronto(parsato.righe, [...moduli.values()].map(toModulo), { avvisi: parsato.avvisi })
  const r = risultato.riepilogo

  const { data: creato, error } = await supabase
    .from("confronti")
    .insert({
      nome_file: file.name,
      numero_fattura: r.numeroFattura,
      data_fattura: r.dataFattura,
      periodo_da: r.periodoDa,
      periodo_a: r.periodoA,
      righe_totali: r.righeTotali,
      righe_abbinate: r.righeAbbinate,
      moduli_non_addebitati: r.moduliNonAddebitati,
      anomalie_totali: r.anomalieTotali,
      anomalie_rilevanti: r.anomalieRilevanti,
      totale_costi: r.totaleCosti,
      totale_incassi: r.totaleIncassi,
      risultato,
      created_by: profilo.id,
    })
    .select("id")
    .single()
  if (error || !creato) return { errore: `Salvataggio non riuscito: ${error?.message ?? "errore sconosciuto"}` }

  // Archiviazione del file originale (best effort: il confronto è già salvato)
  const nomeSicuro = file.name.replace(/[^\w.-]+/g, "_").slice(0, 80)
  const path = `${new Date().getFullYear()}/${creato.id}-${nomeSicuro}`
  try {
    const upload = await supabase.storage.from("poste-files").upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false })
    if (!upload.error) await supabase.from("confronti").update({ file_path: path }).eq("id", creato.id)
  } catch {
    // Il file originale non è indispensabile: il risultato è già in archivio.
  }

  revalidatePath(PAGINA)
  revalidatePath("/area-riservata")
  redirect(`${PAGINA}/${creato.id}`)
}

export async function eliminaConfronto(id: string): Promise<{ ok: boolean; errore?: string }> {
  await requireProfilo()
  const supabase = await createClient()
  const { data } = await supabase.from("confronti").select("file_path").eq("id", id).maybeSingle()
  if (data?.file_path) await supabase.storage.from("poste-files").remove([data.file_path])
  const { error } = await supabase.from("confronti").delete().eq("id", id)
  if (error) return { ok: false, errore: error.message }
  revalidatePath(PAGINA)
  revalidatePath("/area-riservata")
  return { ok: true }
}
