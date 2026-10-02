/**
 * Motore di confronto tra il file di Poste e i moduli MOS archiviati.
 * Puro (nessun accesso a DB): riceve righe e moduli, restituisce il risultato.
 */
import type { PosteRiga } from "./parse"

export const CLASSI_PESO = ["0-2", "2-5", "5-10", "10-20", "20-30", "30-50", "50-70", "70-100", "Oltre 100"] as const
const LIMITI_KG = [2, 5, 10, 20, 30, 50, 70, 100]

export function classePesoDaKg(kg: number | null | undefined): string {
  if (kg === null || kg === undefined || !Number.isFinite(kg) || kg <= 0) return ""
  for (let i = 0; i < LIMITI_KG.length; i++) {
    if (kg <= LIMITI_KG[i]) return CLASSI_PESO[i]
  }
  return "Oltre 100"
}

export function indiceClasse(classe: string): number {
  return (CLASSI_PESO as readonly string[]).indexOf(classe)
}

export interface ModuloPerConfronto {
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
  mittente: string
  destinatario: string
  dest_cap: string
}

export type TipoAnomalia =
  | "addebito_senza_modulo"
  | "modulo_non_addebitato"
  | "duplicato"
  | "classe_peso"
  | "addebito_aggiuntivo"
  | "servizio_extra"
  | "margine_negativo"
  | "colli"
  | "data"

export const ETICHETTE_ANOMALIA: Record<TipoAnomalia, { label: string; descrizione: string }> = {
  addebito_senza_modulo: { label: "Addebito senza modulo", descrizione: "Poste ha addebitato una spedizione per cui non risulta alcun MOS" },
  modulo_non_addebitato: { label: "Modulo non addebitato", descrizione: "MOS spedito con Poste nel periodo ma assente dalla fattura" },
  duplicato: { label: "Riga duplicata", descrizione: "La stessa lettera di vettura compare più volte" },
  classe_peso: { label: "Classe di peso", descrizione: "Poste ha tassato una fascia di peso superiore a quella del modulo" },
  addebito_aggiuntivo: { label: "Addebito aggiuntivo", descrizione: "Supplementi non previsti dal modulo (giacenza, località disagiata, ecc.)" },
  servizio_extra: { label: "Servizio extra", descrizione: "Riga di 'Addebito Servizi Vari' o servizio diverso dalla spedizione standard" },
  margine_negativo: { label: "Costo superiore all'incasso", descrizione: "Poste ha addebitato più di quanto incassato dal cliente" },
  colli: { label: "Numero colli", descrizione: "Colli fatturati diversi da quelli sul modulo" },
  data: { label: "Data spedizione", descrizione: "Data di partenza distante da quella registrata sul modulo" },
}

export interface Anomalia {
  id: string
  tipo: TipoAnomalia
  titolo: string
  descrizione: string
  /** Impatto economico stimato in euro (0 = solo informativa) */
  impatto: number
  rilevante: boolean
  ldv: string
  rifSped: string
  indiceRiga: number | null
  mosId: string | null
  mosNumero: number | null
  dettagli: Record<string, string | number | null>
}

export interface RigaConfronto {
  indice: number
  ldv: string
  rifSped: string
  servizio: string
  dataPartenza: string | null
  mittente: string
  destinatario: string
  cittaDest: string
  classePeso: string
  pesoTassabileKg: number | null
  importoTotale: number
  abbinamento: "ldv" | "riferimento" | "nessuno"
  mosId: string | null
  mosNumero: number | null
  mosPesoKg: number | null
  mosClassePeso: string
  mosIncasso: number | null
  anomalie: TipoAnomalia[]
}

export interface ModuloNonAddebitato {
  mosId: string
  mosNumero: number
  dataSpedizione: string | null
  ldv: string
  corriere: string
  destinatario: string
  incasso: number
}

export interface RiepilogoConfronto {
  numeroFattura: string
  dataFattura: string | null
  periodoDa: string | null
  periodoA: string | null
  righeTotali: number
  righeAbbinate: number
  righeNonAbbinate: number
  moduliNonAddebitati: number
  duplicati: number
  anomalieTotali: number
  anomalieRilevanti: number
  impattoAnomalie: number
  totaleCosti: number
  totaleIncassi: number
  margine: number
  perClasse: { classe: string; righe: number; costo: number }[]
  tariffeRilevate: Record<string, number>
}

export interface RisultatoConfronto {
  versione: 1
  riepilogo: RiepilogoConfronto
  anomalie: Anomalia[]
  righe: RigaConfronto[]
  moduliNonAddebitati: ModuloNonAddebitato[]
  avvisi: string[]
}

export interface OpzioniConfronto {
  /** Sotto questa cifra (€) un'anomalia è "marginale" */
  sogliaRilevante?: number
  /** Giorni di scarto tollerati tra data MOS e data partenza Poste */
  tolleranzaGiorni?: number
  avvisi?: string[]
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** "2026-07-08" → "08/07/2026" (per le descrizioni leggibili) */
function dataIt(iso: string | null | undefined) {
  if (!iso) return "data n/d"
  const [y, m, d] = iso.slice(0, 10).split("-")
  return d && m && y ? `${d}/${m}/${y}` : iso
}

function isServizioStandard(servizio: string) {
  const s = servizio.trim().toLowerCase()
  if (!s) return true
  return !s.startsWith("addebito")
}

/** "MOS-00042", "#42", "42" → 42. Riferimenti come "O2026000000411" o "PARISI" → null. */
export function numeroMosDaRiferimento(rif: string): number | null {
  const m = rif.trim().match(/^(?:mos)?[\s#-]*0*(\d{1,7})$/i)
  return m ? Number(m[1]) : null
}

function giorniTra(a: string, b: string) {
  const da = new Date(`${a}T00:00:00Z`).getTime()
  const db = new Date(`${b}T00:00:00Z`).getTime()
  return Math.abs(Math.round((da - db) / 86400000))
}

/** Tariffa base "tipica" per classe di peso, dedotta dal file stesso (moda di IMPORTO_LDV). */
function rilevaTariffe(righe: PosteRiga[]): Record<string, number> {
  const conteggi = new Map<string, Map<number, number>>()
  for (const r of righe) {
    if (!r.classePeso || !isServizioStandard(r.servizio) || r.importoLdv <= 0) continue
    const perClasse = conteggi.get(r.classePeso) ?? new Map<number, number>()
    const v = round2(r.importoLdv)
    perClasse.set(v, (perClasse.get(v) ?? 0) + 1)
    conteggi.set(r.classePeso, perClasse)
  }
  const out: Record<string, number> = {}
  for (const [classe, mappa] of conteggi) {
    let best = 0
    let bestN = -1
    for (const [v, n] of mappa) {
      if (n > bestN || (n === bestN && v < best)) {
        best = v
        bestN = n
      }
    }
    out[classe] = best
  }
  return out
}

export function eseguiConfronto(righe: PosteRiga[], moduli: ModuloPerConfronto[], opzioni: OpzioniConfronto = {}): RisultatoConfronto {
  const soglia = opzioni.sogliaRilevante ?? 1
  const tolleranza = opzioni.tolleranzaGiorni ?? 5
  const avvisi = [...(opzioni.avvisi ?? [])]

  const perLdv = new Map<string, ModuloPerConfronto>()
  const perNumero = new Map<number, ModuloPerConfronto>()
  for (const m of moduli) {
    const ldv = m.lettera_di_vettura.trim().toUpperCase()
    if (ldv && !perLdv.has(ldv)) perLdv.set(ldv, m)
    perNumero.set(m.numero, m)
  }

  const tariffe = rilevaTariffe(righe)
  const anomalie: Anomalia[] = []
  const righeOut: RigaConfronto[] = []
  const abbinati = new Set<string>()
  const ldvViste = new Set<string>()
  let progressivo = 0

  const aggiungi = (a: Omit<Anomalia, "id" | "rilevante" | "titolo"> & { titolo?: string }) => {
    progressivo++
    const impatto = round2(a.impatto)
    anomalie.push({
      ...a,
      impatto,
      id: `a${progressivo}`,
      titolo: a.titolo ?? ETICHETTE_ANOMALIA[a.tipo].label,
      rilevante: impatto >= soglia,
    })
  }

  let totaleCosti = 0
  let totaleIncassi = 0
  let duplicati = 0
  const perClasse = new Map<string, { righe: number; costo: number }>()
  const date: string[] = []

  for (const r of righe) {
    const key = r.ldv.toUpperCase()
    const standard = isServizioStandard(r.servizio)
    totaleCosti += r.importoTotale
    if (r.dataPartenza) date.push(r.dataPartenza)

    const classeKey = r.classePeso || (standard ? "n/d" : "servizi vari")
    const pc = perClasse.get(classeKey) ?? { righe: 0, costo: 0 }
    pc.righe++
    pc.costo += r.importoTotale
    perClasse.set(classeKey, pc)

    let modulo = perLdv.get(key) ?? null
    let abbinamento: RigaConfronto["abbinamento"] = modulo ? "ldv" : "nessuno"
    if (!modulo) {
      const n = numeroMosDaRiferimento(r.rifSped)
      if (n !== null && perNumero.has(n)) {
        modulo = perNumero.get(n)!
        abbinamento = "riferimento"
      }
    }

    const tipiRiga: TipoAnomalia[] = []
    const base = { ldv: r.ldv, rifSped: r.rifSped, indiceRiga: r.indice, mosId: modulo?.id ?? null, mosNumero: modulo?.numero ?? null }
    const chi = `${r.destinatario || "—"}${r.cittaDest ? ` (${r.cittaDest})` : ""}`

    if (standard && ldvViste.has(key)) {
      duplicati++
      tipiRiga.push("duplicato")
      aggiungi({
        ...base,
        tipo: "duplicato",
        descrizione: `La lettera di vettura ${r.ldv} è già presente in un'altra riga della fattura. Addebito ripetuto di ${r.importoTotale.toFixed(2)} €.`,
        impatto: r.importoTotale,
        dettagli: { destinatario: chi, importo: r.importoTotale },
      })
    } else if (standard) {
      ldvViste.add(key)
    }

    if (!standard) {
      tipiRiga.push("servizio_extra")
      const voci = r.supplementi.map((sup) => `${sup.etichetta} ${sup.importo.toFixed(2)} €`).join(", ")
      aggiungi({
        ...base,
        tipo: "servizio_extra",
        descrizione: `Riga "${r.servizio}" per ${chi}${voci ? `: ${voci}` : ""}.${modulo ? "" : " Nessun modulo con questa lettera di vettura."}`,
        impatto: r.importoTotale,
        dettagli: { servizio: r.servizio, riferimento: r.rifSped, importo: r.importoTotale },
      })
    }

    if (modulo) abbinati.add(modulo.id)

    if (!modulo && standard) {
      tipiRiga.push("addebito_senza_modulo")
      aggiungi({
        ...base,
        tipo: "addebito_senza_modulo",
        descrizione: `Spedizione ${r.ldv} per ${chi} (rif. "${r.rifSped || "—"}", ${dataIt(r.dataPartenza)}) addebitata ${r.importoTotale.toFixed(2)} € ma senza modulo in archivio.`,
        impatto: r.importoTotale,
        dettagli: { mittente: r.mittente, destinatario: chi, dataPartenza: r.dataPartenza, classe: r.classePeso, importo: r.importoTotale },
      })
    }

    let mosClasse = ""
    if (modulo) {
      const incasso = Number(modulo.importo_totale) || 0
      totaleIncassi += incasso
      mosClasse = classePesoDaKg(Number(modulo.peso_kg))

      // Classe di peso: segnaliamo solo quando Poste tassa una fascia superiore
      if (standard && r.classePeso && mosClasse && indiceClasse(r.classePeso) > indiceClasse(mosClasse)) {
        const attesa = tariffe[mosClasse]
        const impatto = attesa !== undefined ? Math.max(0, r.importoLdv - attesa) : 0
        tipiRiga.push("classe_peso")
        aggiungi({
          ...base,
          tipo: "classe_peso",
          descrizione: `Modulo ${modulo.peso_kg} kg (fascia ${mosClasse}), Poste ha tassato ${r.pesoTassabileKg ?? "?"} kg (fascia ${r.classePeso})${r.pesoVolumetricoKg ? `, volumetrico ${r.pesoVolumetricoKg} kg` : ""}.${attesa !== undefined ? ` Tariffa ${r.importoLdv.toFixed(2)} € invece di ${attesa.toFixed(2)} €.` : ""}`,
          impatto,
          dettagli: {
            pesoModulo: modulo.peso_kg,
            classeModulo: mosClasse,
            pesoDichiarato: r.pesoDichiaratoKg,
            pesoRilevato: r.pesoRilevatoKg,
            pesoVolumetrico: r.pesoVolumetricoKg,
            pesoTassabile: r.pesoTassabileKg,
            classePoste: r.classePeso,
            tariffaAddebitata: r.importoLdv,
            tariffaAttesa: attesa ?? null,
          },
        })
      }

      // Supplementi non previsti dal modulo
      if (standard) {
        const inattesi = r.supplementi.filter((sup) => {
          if (sup.codice === "IMPORTO_CONTRASSEGNO" && modulo!.contrassegno_attivo) return false
          if (sup.codice.startsWith("IMPORTO_COPERTURA") && modulo!.assicurazione_attiva) return false
          return true
        })
        if (inattesi.length > 0) {
          const somma = inattesi.reduce((acc, sup) => acc + sup.importo, 0)
          tipiRiga.push("addebito_aggiuntivo")
          aggiungi({
            ...base,
            tipo: "addebito_aggiuntivo",
            descrizione: `${inattesi.map((sup) => `${sup.etichetta} ${sup.importo.toFixed(2)} €`).join(", ")} su ${r.ldv} (${chi}).`,
            impatto: somma,
            dettagli: Object.fromEntries(inattesi.map((sup) => [sup.etichetta, sup.importo])),
          })
        }
      }

      // Numero colli
      if (r.numColli !== null && r.numColli > 0 && modulo.n_colli !== r.numColli) {
        tipiRiga.push("colli")
        aggiungi({
          ...base,
          tipo: "colli",
          descrizione: `Fatturati ${r.numColli} colli, sul modulo ${modulo.n_colli}.`,
          impatto: 0,
          dettagli: { colliPoste: r.numColli, colliModulo: modulo.n_colli },
        })
      }

      // Data
      const dataMos = modulo.data_spedizione ?? modulo.data
      if (r.dataPartenza && dataMos) {
        const gg = giorniTra(r.dataPartenza, dataMos)
        if (gg > tolleranza) {
          tipiRiga.push("data")
          aggiungi({
            ...base,
            tipo: "data",
            descrizione: `Partenza Poste ${dataIt(r.dataPartenza)}, modulo ${dataIt(dataMos)}: ${gg} giorni di differenza.`,
            impatto: 0,
            dettagli: { dataPoste: r.dataPartenza, dataModulo: dataMos, giorni: gg },
          })
        }
      }

      // Costo Poste superiore all'incasso
      if (standard && incasso > 0 && r.importoTotale > incasso + 0.005) {
        tipiRiga.push("margine_negativo")
        aggiungi({
          ...base,
          tipo: "margine_negativo",
          descrizione: `Poste addebita ${r.importoTotale.toFixed(2)} €, il cliente ha pagato ${incasso.toFixed(2)} € (${chi}).`,
          impatto: r.importoTotale - incasso,
          dettagli: { costo: r.importoTotale, incasso, differenza: round2(r.importoTotale - incasso) },
        })
      }
    }

    righeOut.push({
      indice: r.indice,
      ldv: r.ldv,
      rifSped: r.rifSped,
      servizio: r.servizio,
      dataPartenza: r.dataPartenza,
      mittente: r.mittente,
      destinatario: r.destinatario,
      cittaDest: r.cittaDest,
      classePeso: r.classePeso,
      pesoTassabileKg: r.pesoTassabileKg,
      importoTotale: round2(r.importoTotale),
      abbinamento,
      mosId: modulo?.id ?? null,
      mosNumero: modulo?.numero ?? null,
      mosPesoKg: modulo ? Number(modulo.peso_kg) : null,
      mosClassePeso: mosClasse,
      mosIncasso: modulo ? round2(Number(modulo.importo_totale) || 0) : null,
      anomalie: tipiRiga,
    })
  }

  // Periodo coperto dalla fattura
  date.sort()
  const periodoDa = date[0] ?? null
  const periodoA = date[date.length - 1] ?? null

  // Moduli spediti con Poste nel periodo ma non presenti in fattura
  const moduliNonAddebitati: ModuloNonAddebitato[] = []
  for (const m of moduli) {
    if (abbinati.has(m.id)) continue
    if (!m.lettera_di_vettura.trim()) continue
    const c = m.corriere.trim().toLowerCase()
    if (!(c.startsWith("poste") || c === "sda")) continue
    const dataMos = m.data_spedizione ?? m.data
    if (periodoDa && periodoA && (dataMos < periodoDa || dataMos > periodoA)) continue
    moduliNonAddebitati.push({
      mosId: m.id,
      mosNumero: m.numero,
      dataSpedizione: m.data_spedizione,
      ldv: m.lettera_di_vettura,
      corriere: m.corriere,
      destinatario: m.destinatario,
      incasso: round2(Number(m.importo_totale) || 0),
    })
    aggiungi({
      tipo: "modulo_non_addebitato",
      descrizione: `MOS-${String(m.numero).padStart(5, "0")} spedito il ${dataIt(dataMos)} con ${m.corriere} (${m.lettera_di_vettura}) non compare in fattura: potrebbe essere addebitato nel periodo successivo.`,
      impatto: 0,
      ldv: m.lettera_di_vettura,
      rifSped: "",
      indiceRiga: null,
      mosId: m.id,
      mosNumero: m.numero,
      dettagli: { destinatario: m.destinatario, incasso: round2(Number(m.importo_totale) || 0) },
    })
  }

  // Ordinamento: prima le rilevanti per impatto decrescente, poi le informative
  anomalie.sort((a, b) => Number(b.rilevante) - Number(a.rilevante) || b.impatto - a.impatto || (a.indiceRiga ?? 0) - (b.indiceRiga ?? 0))

  const righeAbbinate = righeOut.filter((r) => r.abbinamento !== "nessuno").length
  const rilevanti = anomalie.filter((a) => a.rilevante)

  const riepilogo: RiepilogoConfronto = {
    numeroFattura: righe[0]?.numeroFattura ?? "",
    dataFattura: righe[0]?.dataFattura ?? null,
    periodoDa,
    periodoA,
    righeTotali: righe.length,
    righeAbbinate,
    righeNonAbbinate: righe.length - righeAbbinate,
    moduliNonAddebitati: moduliNonAddebitati.length,
    duplicati,
    anomalieTotali: anomalie.length,
    anomalieRilevanti: rilevanti.length,
    impattoAnomalie: round2(rilevanti.reduce((acc, a) => acc + a.impatto, 0)),
    totaleCosti: round2(totaleCosti),
    totaleIncassi: round2(totaleIncassi),
    margine: round2(totaleIncassi - totaleCosti),
    perClasse: [...perClasse.entries()]
      .map(([classe, v]) => ({ classe, righe: v.righe, costo: round2(v.costo) }))
      .sort((a, b) => {
        const ia = indiceClasse(a.classe)
        const ib = indiceClasse(b.classe)
        if (ia === -1 && ib === -1) return a.classe.localeCompare(b.classe)
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      }),
    tariffeRilevate: tariffe,
  }

  return { versione: 1, riepilogo, anomalie, righe: righeOut, moduliNonAddebitati, avvisi }
}
