import ExcelJS from "exceljs"
import { ETICHETTE_ANOMALIA, type RisultatoConfronto } from "./confronto"

const ARANCIO = "FFF04E23"

function intestazione(ws: ExcelJS.Worksheet) {
  const row = ws.getRow(1)
  row.font = { bold: true, color: { argb: "FFFFFFFF" } }
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARANCIO } }
  row.alignment = { vertical: "middle" }
  ws.views = [{ state: "frozen", ySplit: 1 }]
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columns.length } }
}

const EURO = '#,##0.00 "€"'

/** Genera il file Excel con riepilogo, anomalie e righe della fattura. */
export async function creaExcelConfronto(r: RisultatoConfronto, meta: { nomeFile: string; creatoIl: string }): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "Magic Box Roma · Area riservata"
  wb.created = new Date()

  // ---- Riepilogo ----
  const wsR = wb.addWorksheet("Riepilogo")
  wsR.columns = [
    { header: "Voce", key: "voce", width: 36 },
    { header: "Valore", key: "valore", width: 24 },
  ]
  const rr = r.riepilogo
  const vociRiepilogo: [string, string | number][] = [
    ["File caricato", meta.nomeFile],
    ["Data confronto", meta.creatoIl],
    ["Numero fattura", rr.numeroFattura],
    ["Data fattura", rr.dataFattura ?? ""],
    ["Periodo spedizioni", `${rr.periodoDa ?? ""} – ${rr.periodoA ?? ""}`],
    ["Righe in fattura", rr.righeTotali],
    ["Righe abbinate a un modulo", rr.righeAbbinate],
    ["Righe senza modulo", rr.righeNonAbbinate],
    ["Moduli non addebitati", rr.moduliNonAddebitati],
    ["Righe duplicate", rr.duplicati],
    ["Anomalie totali", rr.anomalieTotali],
    ["Anomalie rilevanti", rr.anomalieRilevanti],
    ["Impatto anomalie rilevanti (€)", rr.impattoAnomalie],
    ["Totale costi Poste (€)", rr.totaleCosti],
    ["Totale incassi moduli abbinati (€)", rr.totaleIncassi],
    ["Margine (€)", rr.margine],
  ]
  vociRiepilogo.forEach(([voce, valore]) => wsR.addRow({ voce, valore }))
  wsR.addRow({})
  wsR.addRow({ voce: "Classe di peso", valore: "Righe / Costo €" }).font = { bold: true }
  rr.perClasse.forEach((c) => wsR.addRow({ voce: c.classe, valore: `${c.righe} / ${c.costo.toFixed(2)}` }))
  wsR.addRow({})
  wsR.addRow({ voce: "Tariffa base rilevata per classe", valore: "€" }).font = { bold: true }
  Object.entries(rr.tariffeRilevate).forEach(([classe, v]) => wsR.addRow({ voce: classe, valore: v }))
  intestazione(wsR)
  wsR.autoFilter = undefined

  // ---- Anomalie ----
  const wsA = wb.addWorksheet("Anomalie")
  wsA.columns = [
    { header: "Priorità", key: "priorita", width: 11 },
    { header: "Tipo", key: "tipo", width: 26 },
    { header: "Impatto €", key: "impatto", width: 12, style: { numFmt: EURO } },
    { header: "Lettera di vettura", key: "ldv", width: 18 },
    { header: "Riferimento", key: "rif", width: 18 },
    { header: "MOS", key: "mos", width: 12 },
    { header: "Riga file", key: "riga", width: 9 },
    { header: "Descrizione", key: "descrizione", width: 90 },
  ]
  r.anomalie.forEach((a) =>
    wsA.addRow({
      priorita: a.rilevante ? "Rilevante" : "Marginale",
      tipo: ETICHETTE_ANOMALIA[a.tipo]?.label ?? a.tipo,
      impatto: a.impatto,
      ldv: a.ldv,
      rif: a.rifSped,
      mos: a.mosNumero ? `MOS-${String(a.mosNumero).padStart(5, "0")}` : "",
      riga: a.indiceRiga ?? "",
      descrizione: a.descrizione,
    }),
  )
  intestazione(wsA)

  // ---- Righe fattura ----
  const wsF = wb.addWorksheet("Righe fattura")
  wsF.columns = [
    { header: "Riga", key: "indice", width: 7 },
    { header: "Lettera di vettura", key: "ldv", width: 18 },
    { header: "Riferimento", key: "rif", width: 18 },
    { header: "Servizio", key: "servizio", width: 28 },
    { header: "Data partenza", key: "data", width: 13 },
    { header: "Mittente", key: "mittente", width: 28 },
    { header: "Destinatario", key: "destinatario", width: 32 },
    { header: "Città dest.", key: "citta", width: 20 },
    { header: "Classe Poste", key: "classe", width: 12 },
    { header: "Peso tassabile kg", key: "peso", width: 14 },
    { header: "Costo Poste €", key: "costo", width: 13, style: { numFmt: EURO } },
    { header: "MOS", key: "mos", width: 12 },
    { header: "Peso MOS kg", key: "pesoMos", width: 12 },
    { header: "Classe MOS", key: "classeMos", width: 11 },
    { header: "Incasso €", key: "incasso", width: 12, style: { numFmt: EURO } },
    { header: "Abbinamento", key: "abbinamento", width: 13 },
    { header: "Anomalie", key: "anomalie", width: 40 },
  ]
  r.righe.forEach((x) =>
    wsF.addRow({
      indice: x.indice,
      ldv: x.ldv,
      rif: x.rifSped,
      servizio: x.servizio,
      data: x.dataPartenza ?? "",
      mittente: x.mittente,
      destinatario: x.destinatario,
      citta: x.cittaDest,
      classe: x.classePeso,
      peso: x.pesoTassabileKg ?? "",
      costo: x.importoTotale,
      mos: x.mosNumero ? `MOS-${String(x.mosNumero).padStart(5, "0")}` : "",
      pesoMos: x.mosPesoKg ?? "",
      classeMos: x.mosClassePeso,
      incasso: x.mosIncasso ?? "",
      abbinamento: x.abbinamento === "ldv" ? "Lettera di vettura" : x.abbinamento === "riferimento" ? "Riferimento" : "Nessuno",
      anomalie: x.anomalie.map((t) => ETICHETTE_ANOMALIA[t]?.label ?? t).join(", "),
    }),
  )
  intestazione(wsF)

  // ---- Moduli non addebitati ----
  const wsM = wb.addWorksheet("Moduli non addebitati")
  wsM.columns = [
    { header: "MOS", key: "mos", width: 12 },
    { header: "Data spedizione", key: "data", width: 15 },
    { header: "Corriere", key: "corriere", width: 16 },
    { header: "Lettera di vettura", key: "ldv", width: 18 },
    { header: "Destinatario", key: "destinatario", width: 32 },
    { header: "Incasso €", key: "incasso", width: 12, style: { numFmt: EURO } },
  ]
  r.moduliNonAddebitati.forEach((m) =>
    wsM.addRow({
      mos: `MOS-${String(m.mosNumero).padStart(5, "0")}`,
      data: m.dataSpedizione ?? "",
      corriere: m.corriere,
      ldv: m.ldv,
      destinatario: m.destinatario,
      incasso: m.incasso,
    }),
  )
  intestazione(wsM)

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer as ArrayBuffer)
}
