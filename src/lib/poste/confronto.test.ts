import { test } from "node:test"
import assert from "node:assert/strict"
import { parsePosteCsv, parseNumero, parseDataPoste, separaCapCitta, normalizzaClassePeso } from "./parse"
import { classePesoDaKg, eseguiConfronto, numeroMosDaRiferimento, type ModuloPerConfronto } from "./confronto"

// Tracciato "FATTURATO" di Poste, ridotto alle colonne significative, con dati fittizi.
const CSV = [
  "NUMERO_FATTURA;DATA_FATTURA;LDV;NUMERO_COLLI;NUM_RIF_SPED;SERVIZIO;MITTENTE;DESTINATARIO;CAP_DEST;PESO_DICHIARATO;PESO_RILEVATO;PESO_VOLUMETRICO_RILEVATO;PESO_TASSABILE;IMPORTO_LDV;VALORE_CONTRASSEGNO;IMPORTO_CONTRASSEGNO;IMPORTO_CAP_LOC_DISAGIATE;IMPORTO_DOSSIER_GIACENZA;IMPORTO_SUPPL_CARBUR;ALTRI_IMPORTI;IMPORTO_TOTALE;WEIGHT_RANGE;DATA_PART",
  "0000001;20260820;3UW0AAA000001;1;MOS-00001;Poste Delivery Business Express;Mario Rossi;Anna Verdi;28060|MOSEZZO;700.00;700.00;500.00;700.00;4.28;;0.00;0.00;0.00;0.43;0.00;4.71;0-2;20260702",
  "0000001;20260820;3UW0AAA000002;1;O2026000000412;Poste Delivery Business Express;Mario Rossi;Luca Bianchi;80050|CASOLA;1500.00;7000.00;14200.00;14200.00;6.33;;0.00;0.00;0.00;0.63;0.00;6.96;10-20;20260703",
  "0000001;20260820;3UW0AAA000003;1;;Poste Delivery Business Express;Ditta Srl;Paola Neri;07046|PORTO TORRES;666.00;1450.00;2540.03;1450.00;4.28;;0.00;1.00;0.00;0.43;0.00;5.71;0-2;20260708",
  "0000001;20260820;3UW0AAA000003;1;;Poste Delivery Business Express;Ditta Srl;Paola Neri;07046|PORTO TORRES;666.00;1450.00;2540.03;1450.00;4.28;;0.00;1.00;0.00;0.43;0.00;5.71;0-2;20260708",
  "0000001;20260820;3UW0AAA000004;1;SCONOSCIUTO;Poste Delivery Business Express;Ditta Srl;Giulia Gialli;20121|MILANO;1000.00;1000.00;500.00;1000.00;4.28;;0.00;0.00;0.00;0.43;0.00;4.71;0-2;20260710",
  "0000001;20260820;3UW0AAA000005;1;COZZI;Addebito Servizi Vari;MAGIC BOX;Cozzi Paola;82030|MELIZZANO;50000.00;53200.00;88160.00;0.00;0.00;;0.00;0.00;0.50;0.00;0.00;0.50;;20260725",
  "0000001;20260820;4UW0AAA000006;1;FF;Poste Delivery Business Express;For Farma;Teresa Carlucci;70022|ALTAMURA;100.00;100.00;0.00;100.00;4.28;3600.00;1.20;0.00;0.00;0.43;0.00;5.91;0-2;20260723",
  "0000001;20260820;3UW0AAA000007;1;MOS-00007;Poste Delivery Business Express;Mario Rossi;Elena Blu;00168|ROMA;500.00;500.00;5.45;500.00;4.28;;0.00;0.00;0.00;0.43;0.00;4.71;0-2;20260724",
].join("\r\n")

const modulo = (over: Partial<ModuloPerConfronto>): ModuloPerConfronto => ({
  id: over.id ?? "m",
  numero: over.numero ?? 1,
  data: "2026-07-01",
  data_spedizione: "2026-07-02",
  stato: "spedito",
  corriere: "Poste Italiane",
  lettera_di_vettura: "",
  peso_kg: 1,
  n_colli: 1,
  importo_totale: 9,
  importo_spedizione: 9,
  contrassegno_attivo: false,
  assicurazione_attiva: false,
  mittente: "Mario Rossi",
  destinatario: "Anna Verdi",
  dest_cap: "28060",
  ...over,
})

test("conversioni di base", () => {
  assert.equal(parseNumero("6.33"), 6.33)
  assert.equal(parseNumero("1.234,56"), 1234.56)
  assert.equal(parseNumero("6,33"), 6.33)
  assert.equal(parseNumero(""), null)
  assert.equal(parseDataPoste("20260820"), "2026-08-20")
  assert.equal(parseDataPoste("08/07/2026"), "2026-07-08")
  assert.deepEqual(separaCapCitta("28060|MOSEZZO"), { cap: "28060", citta: "MOSEZZO" })
  assert.equal(normalizzaClassePeso("30-50 Kg"), "30-50")
  assert.equal(normalizzaClassePeso("Oltre 100"), "Oltre 100")
  assert.equal(classePesoDaKg(0.7), "0-2")
  assert.equal(classePesoDaKg(2), "0-2")
  assert.equal(classePesoDaKg(14.2), "10-20")
  assert.equal(classePesoDaKg(150), "Oltre 100")
  assert.equal(numeroMosDaRiferimento("MOS-00007"), 7)
  assert.equal(numeroMosDaRiferimento("O2026000000412"), null)
  assert.equal(numeroMosDaRiferimento("PARISI"), null)
})

test("parsing del CSV di Poste", () => {
  const f = parsePosteCsv(CSV)
  assert.equal(f.righe.length, 8)
  const r1 = f.righe[0]
  assert.equal(r1.ldv, "3UW0AAA000001")
  assert.equal(r1.pesoTassabileKg, 0.7)
  assert.equal(r1.importoTotale, 4.71)
  assert.equal(r1.classePeso, "0-2")
  assert.equal(r1.dataPartenza, "2026-07-02")
  assert.equal(r1.cittaDest, "MOSEZZO")
  assert.equal(r1.capDest, "28060")
  const contrassegno = f.righe.find((r) => r.ldv === "4UW0AAA000006")!
  assert.equal(contrassegno.contrassegnoValore, 36)
  assert.equal(contrassegno.supplementi.some((s) => s.codice === "IMPORTO_CONTRASSEGNO" && s.importo === 1.2), true)
  const giacenza = f.righe.find((r) => r.ldv === "3UW0AAA000005")!
  assert.equal(giacenza.servizio, "Addebito Servizi Vari")
  assert.equal(giacenza.supplementi[0].etichetta, "Dossier giacenza")
})

test("confronto: abbinamenti e anomalie", () => {
  const { righe, avvisi } = parsePosteCsv(CSV)
  const moduli: ModuloPerConfronto[] = [
    // abbinato per LDV, tutto regolare
    modulo({ id: "m1", numero: 1, lettera_di_vettura: "3UW0AAA000001", peso_kg: 0.7, importo_totale: 9 }),
    // abbinato per LDV: classe di peso superiore (1,5 kg → tassato 14,2 kg)
    modulo({ id: "m2", numero: 2, lettera_di_vettura: "3UW0AAA000002", peso_kg: 1.5, importo_totale: 10 }),
    // abbinato per LDV: supplemento località disagiata + duplicato
    modulo({ id: "m3", numero: 3, lettera_di_vettura: "3UW0AAA000003", peso_kg: 1.45, importo_totale: 8 }),
    // contrassegno previsto sul modulo → nessun addebito aggiuntivo
    modulo({ id: "m6", numero: 6, lettera_di_vettura: "4UW0AAA000006", peso_kg: 0.1, contrassegno_attivo: true, importo_totale: 12 }),
    // abbinato tramite riferimento MOS-00007 (LDV non registrata) e incasso inferiore al costo
    modulo({ id: "m7", numero: 7, lettera_di_vettura: "", peso_kg: 0.5, importo_totale: 3 }),
    // spedito con Poste nel periodo ma assente dalla fattura
    modulo({ id: "m8", numero: 8, lettera_di_vettura: "3UW0ZZZ000099", data_spedizione: "2026-07-15", importo_totale: 7 }),
    // BRT: non deve risultare "non addebitato"
    modulo({ id: "m9", numero: 9, lettera_di_vettura: "BRT123", corriere: "BRT", data_spedizione: "2026-07-15" }),
    // Poste ma fuori periodo
    modulo({ id: "m10", numero: 10, lettera_di_vettura: "3UW0ZZZ000100", data_spedizione: "2026-08-15" }),
  ]

  const r = eseguiConfronto(righe, moduli, { avvisi })
  const tipi = (t: string) => r.anomalie.filter((a) => a.tipo === t)

  assert.equal(r.riepilogo.righeTotali, 8)
  assert.equal(r.riepilogo.periodoDa, "2026-07-02")
  assert.equal(r.riepilogo.periodoA, "2026-07-25")
  assert.equal(r.riepilogo.duplicati, 1)

  // abbinamenti
  const riga7 = r.righe.find((x) => x.ldv === "3UW0AAA000007")!
  assert.equal(riga7.abbinamento, "riferimento")
  assert.equal(riga7.mosNumero, 7)
  assert.equal(r.righe.find((x) => x.ldv === "3UW0AAA000001")!.abbinamento, "ldv")

  // addebiti senza modulo: la riga 4 (SCONOSCIUTO); la riga "servizi vari" è classificata a parte
  assert.deepEqual(tipi("addebito_senza_modulo").map((a) => a.ldv), ["3UW0AAA000004"])
  assert.equal(tipi("servizio_extra").length, 1)
  assert.equal(tipi("servizio_extra")[0].impatto, 0.5)

  // duplicato
  assert.equal(tipi("duplicato").length, 1)
  assert.equal(tipi("duplicato")[0].impatto, 5.71)

  // classe di peso: tariffa 6.33 contro 4.28 attesa per 0-2
  const cp = tipi("classe_peso")
  assert.equal(cp.length, 1)
  assert.equal(cp[0].mosNumero, 2)
  assert.equal(cp[0].impatto, 2.05)
  assert.equal(cp[0].rilevante, true)

  // supplemento non previsto (località disagiata) sulla riga 3, due volte perché duplicata
  const agg = tipi("addebito_aggiuntivo")
  assert.equal(agg.length, 2)
  assert.equal(agg[0].impatto, 1)
  // il contrassegno previsto non genera anomalia
  assert.equal(agg.some((a) => a.mosNumero === 6), false)

  // margine negativo sul modulo 7 (costo 4.71 > incasso 3)
  const mn = tipi("margine_negativo")
  assert.equal(mn.length, 1)
  assert.equal(mn[0].impatto, 1.71)

  // moduli non addebitati: solo m8
  assert.deepEqual(r.moduliNonAddebitati.map((m) => m.mosNumero), [8])

  // ordinamento: prima le rilevanti per impatto decrescente
  assert.equal(r.anomalie[0].rilevante, true)
  for (let i = 1; i < r.anomalie.length; i++) {
    const a = r.anomalie[i - 1]
    const b = r.anomalie[i]
    if (a.rilevante === b.rilevante) assert.ok(a.impatto >= b.impatto)
    else assert.ok(a.rilevante && !b.rilevante)
  }

  // totali
  assert.equal(r.riepilogo.totaleCosti, 38.92)
  assert.equal(r.riepilogo.righeAbbinate, 6)
  assert.equal(r.riepilogo.tariffeRilevate["0-2"], 4.28)
})
