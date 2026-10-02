/**
 * Parsing del file di rendicontazione di Poste Italiane (CSV con ";" oppure Excel).
 *
 * Unità di misura osservate nel tracciato "FATTURATO":
 *  - PESO_*            → grammi (7000.00 = 7 kg)           → convertiti in kg
 *  - IMPORTO_*         → euro al netto di IVA (6.33)       → usati così come sono
 *  - VALORE_CONTRASSEGNO → centesimi (3600.00 = 36,00 €)   → convertito in euro
 *  - DATA_*            → YYYYMMDD                          → convertite in ISO
 * Il rilevamento delle unità è comunque euristico (vedi `rilevaUnitaPeso`) per tollerare varianti.
 */

export interface Supplemento {
  codice: string
  etichetta: string
  importo: number
}

export interface PosteRiga {
  /** Numero di riga nel file (1 = prima riga dati) */
  indice: number
  numeroFattura: string
  dataFattura: string | null
  ldv: string
  numColli: number | null
  rifSped: string
  servizio: string
  opzioneConsegna: string
  mittente: string
  destinatario: string
  capDest: string
  cittaDest: string
  pesoDichiaratoKg: number | null
  pesoRilevatoKg: number | null
  pesoVolumetricoKg: number | null
  pesoTassabileKg: number | null
  classePeso: string
  importoLdv: number
  importoCarburante: number
  importoTotale: number
  contrassegnoValore: number | null
  importoContrassegno: number
  supplementi: Supplemento[]
  dataPartenza: string | null
}

export interface FileParsato {
  righe: PosteRiga[]
  colonne: string[]
  avvisi: string[]
}

/** Colonne di importo che fanno parte della tariffa base (non sono supplementi). */
const COLONNE_BASE = new Set(["IMPORTO_LDV", "IMPORTO_SUPPL_CARBUR", "IMPORTO_TOTALE"])

export const ETICHETTE_SUPPLEMENTI: Record<string, string> = {
  IMPORTO_SUPPL_PALLET: "Supplemento pallet",
  TARIFFA_COLLO_AGGIUNTIVO: "Collo aggiuntivo",
  IMPORTO_SUPPL_IMPORT: "Supplemento import",
  IMPORTO_CONTRASSEGNO: "Contrassegno",
  IMPORTO_COPERTURA_FULL: "Copertura assicurativa full",
  IMPORTO_COPERTURA_FULL_0_1500: "Copertura full fino a 1.500 €",
  IMPORTO_COPERTURA_FULL_0_50000: "Copertura full fino a 50.000 €",
  IMPORTO_COPERTURA_BASIC: "Copertura assicurativa basic",
  IMPORTO_TIME_DEFINITE: "Consegna time definite",
  IMPORTO_DIGIPOD: "Prova di consegna digitale",
  IMPORTO_SMS: "Notifica SMS",
  IMPORTO_CONS_APPUNTAMENTO: "Consegna su appuntamento",
  IMPORTO_CONS_PIANO: "Consegna al piano",
  IMPORTO_CONS_SABATO: "Consegna di sabato",
  IMPORTO_CONS_SERA: "Consegna serale",
  IMPORTO_CONS_PROGRAMMATA: "Consegna programmata",
  IMPORTO_CONS_GG_STABILITO: "Consegna nel giorno stabilito",
  IMPORTO_CONSEGNA_AL_VICINO: "Consegna al vicino",
  IMPORTO_SCS: "Servizio SCS",
  IMPORTO_CAP_LOC_PERIFERICHE: "Località periferica",
  IMPORTO_CAP_LOC_DISAGIATE: "Località disagiata",
  IMPORTO_PAPERLESS: "Paperless",
  IMPORTO_SVINCOLO_PROATTIVO: "Svincolo proattivo giacenza",
  IMPORTO_DOSSIER_GIACENZA: "Dossier giacenza",
  IMPORTO_SPESE_RICONSEGNA: "Spese di riconsegna",
  IMPORTO_RITORNO_AL_MITTENTE: "Ritorno al mittente",
  IMPORTO_FUORI_SAGOMA: "Fuori sagoma",
  IMPORTO_FUORI_DIMENSIONE: "Fuori dimensione",
  IMPORTO_NON_SOVRAPPONIBILE: "Non sovrapponibile",
  IMPORTO_PICCO_STAGIONALE: "Picco stagionale",
  IMPORTO_CONSEGNA_PUNTO_PROS: "Consegna in punto di prossimità",
  IMPORTO_PACCHI_GRANDI: "Pacchi grandi",
  IMPORTO_PACCHI_ECCEDENTI: "Pacchi eccedenti",
  IMPORTO_CORREZIONE_INDIRIZZO: "Correzione indirizzo",
  IMPORTO_FMP_CP_LOCK_PROSS: "Fermoposta / locker / punto di prossimità",
  IMPORTO_AREE_REMOTE: "Aree remote",
  IMPORTO_EXTRA_PESO_DIMENSIONI_COLLO: "Extra peso/dimensioni collo",
  IMPORTO_EXTRA_PESO_DIMENSIONI_PALLET: "Extra peso/dimensioni pallet",
  IMPORTO_LANDED_COST_CALCULATOR: "Landed cost calculator",
  IMPORTO_PROHIBITED_ITEMS_AND_RESTRICTIONS: "Articoli vietati / restrizioni",
  IMPORTO_OP_DOGANALI: "Operazioni doganali",
  IMPORTO_DIR_POSTALI: "Diritti postali",
  IMPORTO_SERVIZI_SDOGANAMENTO: "Servizi di sdoganamento",
  IMPORTO_DICH_COMPL_P_VOCI: "Dichiarazione complessa per voci",
  IMPORTO_DICH_ENTI_GOV: "Dichiarazione enti governativi",
  IMPORTO_DEP_SPED: "Deposito spedizione",
  IMPORTO_EMISS_DOC_TRANS: "Emissione documenti di transito",
  IMPORTO_ADD_SPED_ALTRO_SPED: "Addebito ad altro spedizioniere",
  IMPORTO_INOLTRO_DAZI: "Inoltro dazi",
  IMPORTO_OPZ_ON_DOG_MITT: "Oneri doganali a carico mittente",
  IMPORTO_ON_DOGANALI: "Oneri doganali",
  IMPORTO_LAST_MILE_DELIVERY: "Last mile delivery",
  ALTRI_IMPORTI: "Altri importi",
}

export function etichettaSupplemento(codice: string) {
  if (ETICHETTE_SUPPLEMENTI[codice]) return ETICHETTE_SUPPLEMENTI[codice]
  const pulito = codice.replace(/^IMPORTO_/, "").toLowerCase().replace(/_/g, " ")
  return pulito.charAt(0).toUpperCase() + pulito.slice(1)
}

// ---------------------------------------------------------------------
//  Conversioni
// ---------------------------------------------------------------------
export function parseNumero(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  let s = String(raw).trim().replace(/[€\s]/g, "")
  if (s === "" || s.toUpperCase() === "N/A") return null
  if (s.includes(",")) {
    // formato italiano: 1.234,56 → 1234.56
    s = s.replace(/\./g, "").replace(",", ".")
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function parseDataPoste(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null
    return raw.toISOString().slice(0, 10)
  }
  const s = String(raw).trim()
  if (!s) return null
  let m = s.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`
  return null
}

/** "28060|MOSEZZO" → { cap: "28060", citta: "MOSEZZO" } */
export function separaCapCitta(raw: string): { cap: string; citta: string } {
  const s = raw.trim()
  if (!s) return { cap: "", citta: "" }
  const parti = s.split("|")
  if (parti.length >= 2) return { cap: parti[0].trim(), citta: parti.slice(1).join(" ").trim() }
  const m = s.match(/^(\d{5})\s+(.+)$/)
  if (m) return { cap: m[1], citta: m[2].trim() }
  return /^\d{5}$/.test(s) ? { cap: s, citta: "" } : { cap: "", citta: s }
}

export function normalizzaClassePeso(raw: string): string {
  const s = raw.trim().replace(/\s*kg\s*$/i, "").trim()
  if (!s) return ""
  if (/^oltre/i.test(s)) return `Oltre ${s.replace(/^oltre\s*/i, "").trim() || "100"}`
  const m = s.match(/^(\d+)\s*-\s*(\d+)$/)
  if (m) return `${m[1]}-${m[2]}`
  return s
}

// ---------------------------------------------------------------------
//  CSV
// ---------------------------------------------------------------------
function rilevaDelimitatore(intestazione: string): string {
  const candidati = [";", ",", "\t", "|"]
  let migliore = ";"
  let max = -1
  for (const d of candidati) {
    const n = intestazione.split(d).length - 1
    if (n > max) {
      max = n
      migliore = d
    }
  }
  return migliore
}

/** Parser CSV minimale ma corretto: gestisce campi tra virgolette, "" e ritorni a capo interni. */
export function parseCsv(testo: string, delimitatore?: string): string[][] {
  const src = testo.replace(/^﻿/, "")
  const primaRiga = src.split(/\r?\n/, 1)[0] ?? ""
  const d = delimitatore ?? rilevaDelimitatore(primaRiga)
  const righe: string[][] = []
  let riga: string[] = []
  let campo = ""
  let inQuote = false

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuote) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          campo += '"'
          i++
        } else {
          inQuote = false
        }
      } else {
        campo += c
      }
      continue
    }
    if (c === '"') {
      inQuote = true
    } else if (c === d) {
      riga.push(campo)
      campo = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++
      riga.push(campo)
      campo = ""
      if (riga.some((v) => v.trim() !== "")) righe.push(riga)
      riga = []
    } else {
      campo += c
    }
  }
  riga.push(campo)
  if (riga.some((v) => v.trim() !== "")) righe.push(riga)
  return righe
}

// ---------------------------------------------------------------------
//  Da tabella (intestazione + righe) a PosteRiga[]
// ---------------------------------------------------------------------
function normalizzaIntestazione(h: unknown) {
  return String(h ?? "")
    .replace(/^﻿/, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
}

function rilevaUnitaPeso(valori: number[]): "g" | "kg" {
  const positivi = valori.filter((v) => v > 0).sort((a, b) => a - b)
  if (positivi.length === 0) return "g"
  const mediana = positivi[Math.floor(positivi.length / 2)]
  // Un pacco "mediano" sopra i 200 kg non è plausibile: sono grammi.
  return mediana > 200 ? "g" : "kg"
}

export function righeDaTabella(tabella: unknown[][]): FileParsato {
  if (tabella.length === 0) throw new Error("Il file è vuoto")
  const intestazioni = tabella[0].map(normalizzaIntestazione)
  const idx = new Map<string, number>()
  intestazioni.forEach((h, i) => {
    if (h && !idx.has(h)) idx.set(h, i)
  })

  const colonnaLdv = idx.has("LDV") ? "LDV" : idx.has("AWB") ? "AWB" : null
  if (!colonnaLdv) {
    throw new Error("Colonna LDV (lettera di vettura) non trovata: il file non sembra un tracciato di Poste")
  }
  if (!idx.has("IMPORTO_TOTALE")) {
    throw new Error("Colonna IMPORTO_TOTALE non trovata nel file")
  }

  const avvisi: string[] = []
  const get = (r: unknown[], col: string) => {
    const i = idx.get(col)
    if (i === undefined) return ""
    const v = r[i]
    if (v === null || v === undefined) return ""
    if (v instanceof Date) return v
    return typeof v === "object" ? String((v as { result?: unknown; text?: unknown }).result ?? (v as { text?: unknown }).text ?? "") : String(v)
  }
  const num = (r: unknown[], col: string) => parseNumero(get(r, col))
  const str = (r: unknown[], col: string) => {
    const v = get(r, col)
    return v instanceof Date ? v.toISOString().slice(0, 10) : v.trim()
  }

  const colonneSupplemento = intestazioni.filter((h) => (h.startsWith("IMPORTO_") && !COLONNE_BASE.has(h)) || h === "ALTRI_IMPORTI" || h === "TARIFFA_COLLO_AGGIUNTIVO")

  const datiGrezzi = tabella.slice(1).filter((r) => r.some((v) => String(v ?? "").trim() !== ""))
  const pesiTassabili = datiGrezzi.map((r) => num(r, "PESO_TASSABILE") ?? num(r, "PESO_DICHIARATO") ?? 0)
  const unita = rilevaUnitaPeso(pesiTassabili)
  const kg = (v: number | null) => (v === null ? null : unita === "g" ? Math.round(v) / 1000 : v)
  if (unita === "kg") avvisi.push("I pesi del file sembrano già espressi in kg: nessuna conversione applicata.")

  const righe: PosteRiga[] = []
  let senzaLdv = 0

  datiGrezzi.forEach((r, i) => {
    const ldv = str(r, colonnaLdv).toUpperCase()
    if (!ldv) {
      senzaLdv++
      return
    }
    const { cap, citta } = separaCapCitta(str(r, "CAP_DEST"))
    const supplementi: Supplemento[] = []
    for (const col of colonneSupplemento) {
      const v = num(r, col)
      if (v && Math.abs(v) >= 0.005) {
        supplementi.push({ codice: col, etichetta: etichettaSupplemento(col), importo: Math.round(v * 100) / 100 })
      }
    }
    const importoContrassegno = num(r, "IMPORTO_CONTRASSEGNO") ?? 0
    const valoreContrassegnoRaw = num(r, "VALORE_CONTRASSEGNO")

    righe.push({
      indice: i + 1,
      numeroFattura: str(r, "NUMERO_FATTURA"),
      dataFattura: parseDataPoste(get(r, "DATA_FATTURA")),
      ldv,
      numColli: num(r, "NUMERO_COLLI"),
      rifSped: str(r, "NUM_RIF_SPED"),
      servizio: str(r, "SERVIZIO"),
      opzioneConsegna: str(r, "OPZIONE_CONSEGNA"),
      mittente: str(r, "MITTENTE"),
      destinatario: str(r, "DESTINATARIO"),
      capDest: cap,
      cittaDest: citta,
      pesoDichiaratoKg: kg(num(r, "PESO_DICHIARATO")),
      pesoRilevatoKg: kg(num(r, "PESO_RILEVATO")),
      pesoVolumetricoKg: kg(num(r, "PESO_VOLUMETRICO_RILEVATO") ?? num(r, "PESO_VOLUMETRICO_DICHIARATO")),
      pesoTassabileKg: kg(num(r, "PESO_TASSABILE")),
      classePeso: normalizzaClassePeso(str(r, "WEIGHT_RANGE")),
      importoLdv: num(r, "IMPORTO_LDV") ?? 0,
      importoCarburante: num(r, "IMPORTO_SUPPL_CARBUR") ?? 0,
      importoTotale: num(r, "IMPORTO_TOTALE") ?? 0,
      // VALORE_CONTRASSEGNO è espresso in centesimi nel tracciato Poste
      contrassegnoValore: valoreContrassegnoRaw === null ? null : Math.round(valoreContrassegnoRaw) / 100,
      importoContrassegno,
      supplementi,
      dataPartenza: parseDataPoste(get(r, "DATA_PART")),
    })
  })

  if (senzaLdv > 0) avvisi.push(`${senzaLdv} righe senza lettera di vettura sono state ignorate.`)
  if (righe.length === 0) throw new Error("Nessuna riga valida trovata nel file")

  return { righe, colonne: intestazioni, avvisi }
}

export function parsePosteCsv(testo: string): FileParsato {
  return righeDaTabella(parseCsv(testo))
}

function decodificaTesto(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder("windows-1252").decode(bytes)
  }
}

/** Rileva il formato dal nome/contenuto e restituisce le righe normalizzate. */
export async function parsePosteFile(nomeFile: string, contenuto: ArrayBuffer | Uint8Array): Promise<FileParsato> {
  const bytes = contenuto instanceof Uint8Array ? contenuto : new Uint8Array(contenuto)
  const isZip = bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b
  const ext = nomeFile.toLowerCase().split(".").pop() ?? ""

  if (isZip || ext === "xlsx" || ext === "xlsm") {
    const ExcelJS = (await import("exceljs")).default
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer)
    const ws = wb.worksheets[0]
    if (!ws) throw new Error("Il file Excel non contiene fogli")
    const tabella: unknown[][] = []
    ws.eachRow({ includeEmpty: false }, (row) => {
      const valori = row.values as unknown[]
      // ExcelJS usa indici 1-based: la posizione 0 è sempre vuota
      tabella.push(valori.slice(1))
    })
    return righeDaTabella(tabella)
  }
  if (ext === "xls") {
    throw new Error("Il formato .xls non è supportato: salva il file come .xlsx oppure .csv")
  }
  return parsePosteCsv(decodificaTesto(bytes))
}
