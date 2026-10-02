import { z } from "zod"
import type { Mos, TipoServizio } from "@/types/database"

// ---------------------------------------------------------------------
//  Costanti
// ---------------------------------------------------------------------
export const TIPI_SERVIZIO: { value: TipoServizio; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "roma_su_roma", label: "Roma su Roma" },
]

export const CORRIERI = ["Poste Italiane", "SDA", "BRT", "UPS", "GLS", "SEU", "FedEx", "DHL", "Altro"] as const

/** Poste Delivery Business è fatturato da Poste Italiane; SDA è il brand storico dello stesso gruppo. */
export function isCorrierePoste(corriere: string) {
  const c = corriere.trim().toLowerCase()
  return c.startsWith("poste") || c === "sda"
}

// ---------------------------------------------------------------------
//  Validazione (zod)
// ---------------------------------------------------------------------
const testo = (max = 200) => z.string().trim().max(max, `Massimo ${max} caratteri`)
const emailOpzionale = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "Indirizzo email non valido")
const importo = z.coerce
  .number({ invalid_type_error: "Inserisci un importo valido" })
  .min(0, "L'importo non può essere negativo")
  .max(999999, "Importo troppo alto")

function capValido(cap: string, stato: string) {
  const italia = stato.trim().toLowerCase() === "italia" || stato.trim() === ""
  return italia ? /^\d{5}$/.test(cap) : cap.length > 0
}

const mittenteSchema = z
  .object({
    mitt_cliente_id: z.string().uuid().nullable().default(null),
    mitt_nome: testo(100),
    mitt_cognome: testo(100),
    mitt_ragione_sociale: testo(200),
    mitt_partita_iva: testo(20),
    mitt_sdi: testo(10),
    mitt_indirizzo: testo(200).min(1, "Inserisci l'indirizzo"),
    mitt_cap: testo(10),
    mitt_citta: testo(100).min(1, "Inserisci la città"),
    mitt_provincia: testo(5).transform((v) => v.toUpperCase()),
    mitt_stato: testo(60).transform((v) => v || "Italia"),
    mitt_telefono: testo(40),
    mitt_email: emailOpzionale,
  })
  .superRefine((v, ctx) => {
    const persona = v.mitt_nome && v.mitt_cognome
    if (!persona && !v.mitt_ragione_sociale) {
      ctx.addIssue({ code: "custom", path: ["mitt_nome"], message: "Inserisci nome e cognome oppure la ragione sociale" })
    }
    if (!capValido(v.mitt_cap, v.mitt_stato)) {
      ctx.addIssue({ code: "custom", path: ["mitt_cap"], message: "Il CAP deve avere 5 cifre" })
    }
  })

const destinatarioSchema = z
  .object({
    dest_cliente_id: z.string().uuid().nullable().default(null),
    dest_ragione_sociale: testo(200),
    dest_nome: testo(100),
    dest_cognome: testo(100),
    dest_indirizzo: testo(200).min(1, "Inserisci l'indirizzo"),
    dest_cap: testo(10),
    dest_citta: testo(100).min(1, "Inserisci la città"),
    dest_provincia: testo(5).transform((v) => v.toUpperCase()),
    dest_stato: testo(60).transform((v) => v || "Italia"),
    dest_telefono: testo(40),
    dest_email: emailOpzionale,
    dest_note_consegna: testo(300),
  })
  .superRefine((v, ctx) => {
    const persona = v.dest_nome && v.dest_cognome
    if (!persona && !v.dest_ragione_sociale) {
      ctx.addIssue({ code: "custom", path: ["dest_nome"], message: "Inserisci nome e cognome oppure la ragione sociale" })
    }
    if (!capValido(v.dest_cap, v.dest_stato)) {
      ctx.addIssue({ code: "custom", path: ["dest_cap"], message: "Il CAP deve avere 5 cifre" })
    }
  })

const spedizioneSchema = z
  .object({
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida"),
    contenuto: testo(200).min(1, "Indica il contenuto"),
    n_colli: z.coerce.number({ invalid_type_error: "Numero colli non valido" }).int("Numero intero").min(1, "Almeno 1 collo").max(999),
    peso_kg: z.coerce.number({ invalid_type_error: "Inserisci il peso" }).positive("Il peso deve essere maggiore di 0").max(9999),
    misure: testo(60),
    tipo_servizio: z.enum(["standard", "express", "roma_su_roma"]),
    imballato_dal_cliente: z.boolean().default(false),
    contrassegno_attivo: z.boolean().default(false),
    contrassegno_valore: importo,
    contrassegno_contanti: z.boolean().default(false),
    assicurazione_attiva: z.boolean().default(false),
    assicurazione_valore: importo,
    importo_spedizione: importo,
    importo_contrassegno: importo,
    importo_assicurazione: importo,
    importo_spese_suppl: importo,
    note: testo(1000),
  })
  .superRefine((v, ctx) => {
    if (v.contrassegno_attivo && v.contrassegno_valore <= 0) {
      ctx.addIssue({ code: "custom", path: ["contrassegno_valore"], message: "Indica il valore del contrassegno" })
    }
    if (v.assicurazione_attiva && v.assicurazione_valore <= 0) {
      ctx.addIssue({ code: "custom", path: ["assicurazione_valore"], message: "Indica il valore da assicurare" })
    }
  })

export const mosSchema = mittenteSchema.and(destinatarioSchema).and(spedizioneSchema)

export type MosFormValues = z.infer<typeof mosSchema>

/** Fase 2: corriere + lettera di vettura a spedizione avvenuta */
export const fase2Schema = z.object({
  corriere: testo(60).min(1, "Seleziona il corriere"),
  lettera_di_vettura: testo(60)
    .min(3, "Inserisci la lettera di vettura")
    .transform((v) => v.toUpperCase().replace(/\s+/g, "")),
  data_spedizione: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida"),
})
export type Fase2Values = z.infer<typeof fase2Schema>

export const invioCopiaSchema = z.object({
  email: z.string().trim().email("Indirizzo email non valido"),
})

// ---------------------------------------------------------------------
//  Calcoli e conversioni
// ---------------------------------------------------------------------
export function calcolaTotale(v: {
  importo_spedizione: number | string
  importo_contrassegno: number | string
  importo_assicurazione: number | string
  importo_spese_suppl: number | string
}) {
  const n = (x: number | string) => {
    const num = typeof x === "string" ? Number(x.replace(",", ".")) : x
    return Number.isFinite(num) ? num : 0
  }
  return Math.round((n(v.importo_spedizione) + n(v.importo_contrassegno) + n(v.importo_assicurazione) + n(v.importo_spese_suppl)) * 100) / 100
}

export function valoriIniziali(oggi: string): MosFormValues {
  return {
    mitt_cliente_id: null,
    mitt_nome: "",
    mitt_cognome: "",
    mitt_ragione_sociale: "",
    mitt_partita_iva: "",
    mitt_sdi: "",
    mitt_indirizzo: "",
    mitt_cap: "",
    mitt_citta: "",
    mitt_provincia: "",
    mitt_stato: "Italia",
    mitt_telefono: "",
    mitt_email: "",
    dest_cliente_id: null,
    dest_ragione_sociale: "",
    dest_nome: "",
    dest_cognome: "",
    dest_indirizzo: "",
    dest_cap: "",
    dest_citta: "",
    dest_provincia: "",
    dest_stato: "Italia",
    dest_telefono: "",
    dest_email: "",
    dest_note_consegna: "",
    data: oggi,
    contenuto: "",
    n_colli: 1,
    // Campo vuoto (non "0"): la validazione richiede comunque un peso > 0
    peso_kg: "" as unknown as number,
    misure: "",
    tipo_servizio: "standard",
    imballato_dal_cliente: false,
    contrassegno_attivo: false,
    contrassegno_valore: 0,
    contrassegno_contanti: false,
    assicurazione_attiva: false,
    assicurazione_valore: 0,
    importo_spedizione: 0,
    importo_contrassegno: 0,
    importo_assicurazione: 0,
    importo_spese_suppl: 0,
    note: "",
  }
}

/** Da record DB a valori del form (per modifica e duplicazione). */
export function mosToFormValues(mos: Mos, opzioni?: { duplica?: boolean; oggi?: string }): MosFormValues {
  const base = valoriIniziali(opzioni?.oggi ?? mos.data)
  const chiavi = Object.keys(base) as (keyof MosFormValues)[]
  const out = { ...base } as Record<string, unknown>
  for (const k of chiavi) {
    if (k in mos) out[k] = (mos as unknown as Record<string, unknown>)[k]
  }
  if (opzioni?.duplica) {
    out.data = opzioni.oggi ?? base.data
    out.note = ""
  }
  return out as MosFormValues
}
