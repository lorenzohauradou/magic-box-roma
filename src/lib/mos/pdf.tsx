import React from "react"
import { Document, Image, Line, Page, StyleSheet, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer"
import type { Mos } from "@/types/database"
import { LOGO_PNG_DATA_URL } from "@/lib/pdf/logo"
import { CONDIZIONI_MOS, DICHIARAZIONE_FIRMA } from "./condizioni"
import { TIPI_SERVIZIO } from "./schema"

const ARANCIO = "#F04E23"
const NERO = "#111111"
const GRIGIO = "#666666"

const s = StyleSheet.create({
  page: { paddingTop: 22, paddingBottom: 22, paddingHorizontal: 30, fontFamily: "Helvetica", fontSize: 8.5, color: NERO },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 },
  headerLato: { width: 150 },
  logoWrap: { alignItems: "center", flex: 1 },
  logo: { width: 66, height: 66 },
  brand: { fontFamily: "Helvetica-Bold", fontSize: 11, letterSpacing: 1.5, marginTop: 2 },
  brandSub: { fontSize: 6, color: GRIGIO, letterSpacing: 0.5 },
  meta: { alignItems: "flex-end" },
  metaNumero: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  metaData: { fontSize: 8.5, marginTop: 3 },
  metaStato: { fontSize: 6.5, color: GRIGIO, marginTop: 2 },

  sezioneTitolo: { fontFamily: "Helvetica-Bold", fontSize: 12.5, marginTop: 6, marginBottom: 3 },
  box: { borderWidth: 1.4, borderColor: ARANCIO, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 8 },
  riga: { flexDirection: "row", gap: 10, marginBottom: 4 },
  campo: { flexDirection: "row", alignItems: "flex-end", borderBottomWidth: 0.6, borderBottomColor: "#999999", paddingBottom: 1.5, minHeight: 12 },
  etichetta: { fontSize: 7.5, color: GRIGIO, marginRight: 4 },
  valore: { fontFamily: "Helvetica-Bold", fontSize: 8.5, flex: 1 },

  colonne: { flexDirection: "row", gap: 10 },
  colSx: { flex: 1.15 },
  colDx: { flex: 1 },
  sottoTitolo: { fontFamily: "Helvetica-Bold", fontSize: 8.5, letterSpacing: 0.8, marginTop: 5, marginBottom: 3 },
  checkRiga: { flexDirection: "row", alignItems: "center", gap: 5, marginRight: 10 },
  check: { width: 10, height: 10, borderWidth: 1, borderColor: NERO },
  misureRiga: { flexDirection: "row", gap: 4, marginBottom: 6 },
  misuraBox: { flex: 1, borderWidth: 1, borderColor: ARANCIO, padding: 4, minHeight: 34 },
  misuraLabel: { fontSize: 7, color: GRIGIO },
  misuraVal: { fontFamily: "Helvetica-Bold", fontSize: 10, marginTop: 3 },
  totale: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 6 },
  totaleLabel: { fontFamily: "Helvetica-Bold", color: ARANCIO, fontSize: 11, letterSpacing: 0.8 },
  totaleVal: { fontFamily: "Helvetica-Bold", fontSize: 13, borderBottomWidth: 1, borderBottomColor: NERO, minWidth: 90, textAlign: "right", paddingBottom: 1 },

  footerCols: { flexDirection: "row", gap: 10, marginTop: 8, flex: 1 },
  footerSx: { width: 190, gap: 8 },
  footerDx: { flex: 1 },
  timbro: { borderWidth: 1.4, borderColor: ARANCIO, height: 78, padding: 6, justifyContent: "flex-start" },
  timbroLabel: { fontSize: 8, color: NERO },
  firmaBox: { borderWidth: 1.4, borderColor: ARANCIO, padding: 6, minHeight: 120 },
  firmaTitolo: { fontFamily: "Helvetica-Bold", color: ARANCIO, fontSize: 9.5, letterSpacing: 0.6, marginBottom: 3 },
  firmaTesto: { fontSize: 5.6, color: GRIGIO, lineHeight: 1.25 },
  firmaImg: { width: 170, height: 60, objectFit: "contain", marginTop: 6 },
  firmaLinea: { borderBottomWidth: 0.8, borderBottomColor: NERO, marginTop: 58, width: 160 },
  firmaMeta: { fontSize: 5.5, color: GRIGIO, marginTop: 2 },
  condizioni: { fontSize: 5.4, lineHeight: 1.3, color: "#222222", textAlign: "justify", marginBottom: 2.5 },
  noValidita: { fontFamily: "Helvetica-Bold", color: ARANCIO, fontSize: 9.5, textAlign: "right", marginTop: 6, letterSpacing: 0.5 },

  spedizioneBar: { marginTop: 6, borderTopWidth: 0.6, borderTopColor: "#BBBBBB", paddingTop: 4, flexDirection: "row", justifyContent: "space-between" },
  spedizioneTesto: { fontSize: 7.5 },
  piede: { position: "absolute", bottom: 10, left: 30, right: 30, flexDirection: "row", justifyContent: "space-between", fontSize: 6, color: GRIGIO },
})

function euro(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return ""
  return `€ ${Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function dataIt(v: string | null | undefined) {
  if (!v) return ""
  const [y, m, d] = v.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

function dataOraIt(v: string | Date) {
  const d = typeof v === "string" ? new Date(v) : v
  return d.toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })
}

function Campo({ label, value, flex = 1 }: { label: string; value?: string | number | null; flex?: number }) {
  return (
    <View style={[s.campo, { flex }]}>
      <Text style={s.etichetta}>{label}</Text>
      <Text style={s.valore}>{value === null || value === undefined ? "" : String(value)}</Text>
    </View>
  )
}

function Check({ label, checked }: { label: string; checked: boolean }) {
  return (
    <View style={s.checkRiga}>
      <Text>{label}</Text>
      <View style={s.check}>
        {checked ? (
          <Svg width={8} height={8} viewBox="0 0 8 8">
            <Line x1={1} y1={1} x2={7} y2={7} stroke={NERO} strokeWidth={1.4} />
            <Line x1={7} y1={1} x2={1} y2={7} stroke={NERO} strokeWidth={1.4} />
          </Svg>
        ) : null}
      </View>
    </View>
  )
}

export function MosDocument({ mos }: { mos: Mos }) {
  const totale = Number(mos.importo_totale ?? 0)
  const firmato = Boolean(mos.firma_png)
  const generatoIl = dataOraIt(new Date())
  const numero = `MOS-${String(mos.numero).padStart(5, "0")}`

  return (
    <Document title={`${numero} · Modulo di spedizione Magic Box`} author="Magic Box Roma · Danema S.r.l.s." subject="Modulo di spedizione (MOS)">
      <Page size="A4" style={s.page}>
        {/* Intestazione */}
        <View style={s.header}>
          <View style={s.headerLato}>
            <Text style={{ fontSize: 7, color: GRIGIO }}>Danema S.r.l.s. · Magic Box</Text>
            <Text style={{ fontSize: 7, color: GRIGIO }}>Via Francesco D&apos;Ovidio 143/145</Text>
            <Text style={{ fontSize: 7, color: GRIGIO }}>00137 Roma · Tel. 06 89226298</Text>
            <Text style={{ fontSize: 7, color: GRIGIO }}>info@magicboxroma.it</Text>
          </View>
          <View style={s.logoWrap}>
            <Image src={LOGO_PNG_DATA_URL} style={s.logo} />
            <Text style={s.brand}>MAGIC BOX</Text>
            <Text style={s.brandSub}>Logistica &amp; Spedizioni</Text>
          </View>
          <View style={[s.headerLato, s.meta]}>
            <Text style={s.metaNumero}>{numero}</Text>
            <Text style={s.metaData}>Data {dataIt(mos.data)}</Text>
            {firmato ? <Text style={s.metaStato}>Firmato digitalmente su tablet</Text> : null}
          </View>
        </View>

        {/* Cliente mittente */}
        <Text style={s.sezioneTitolo}>Cliente Mittente</Text>
        <View style={s.box}>
          <View style={s.riga}>
            <Campo label="Nome" value={mos.mitt_nome} />
            <Campo label="Cognome" value={mos.mitt_cognome} />
          </View>
          <View style={s.riga}>
            <Campo label="Ragione sociale" value={mos.mitt_ragione_sociale} flex={1.4} />
            <Campo label="Partita IVA" value={mos.mitt_partita_iva} />
          </View>
          <View style={s.riga}>
            <Campo label="Indirizzo" value={mos.mitt_indirizzo} flex={1.4} />
            <Campo label="SDI" value={mos.mitt_sdi} />
          </View>
          <View style={s.riga}>
            <Campo label="CAP" value={mos.mitt_cap} flex={0.5} />
            <Campo label="Città" value={mos.mitt_citta} flex={1.2} />
            <Campo label="Prov." value={mos.mitt_provincia} flex={0.4} />
            <Campo label="Stato" value={mos.mitt_stato} flex={0.7} />
          </View>
          <View style={[s.riga, { marginBottom: 0 }]}>
            <Campo label="Telefono" value={mos.mitt_telefono} />
            <Campo label="E-mail" value={mos.mitt_email} flex={1.4} />
          </View>
        </View>

        {/* Destinatario */}
        <Text style={s.sezioneTitolo}>Destinatario</Text>
        <View style={s.box}>
          <View style={s.riga}>
            <Campo label="Ragione sociale" value={mos.dest_ragione_sociale} />
          </View>
          <View style={s.riga}>
            <Campo label="Nome" value={mos.dest_nome} />
            <Campo label="Cognome" value={mos.dest_cognome} />
          </View>
          <View style={s.riga}>
            <Campo label="Indirizzo" value={mos.dest_indirizzo} />
          </View>
          <View style={s.riga}>
            <Campo label="CAP" value={mos.dest_cap} flex={0.5} />
            <Campo label="Città" value={mos.dest_citta} flex={1.2} />
            <Campo label="Prov." value={mos.dest_provincia} flex={0.4} />
            <Campo label="Stato" value={mos.dest_stato} flex={0.7} />
          </View>
          <View style={s.riga}>
            <Campo label="Telefono" value={mos.dest_telefono} />
            <Campo label="E-mail" value={mos.dest_email} flex={1.4} />
          </View>
          <View style={[s.riga, { marginBottom: 0 }]}>
            <Campo label="NOTE PER LA CONSEGNA:" value={mos.dest_note_consegna} />
          </View>
        </View>

        {/* Dati della spedizione */}
        <Text style={s.sezioneTitolo}>Dati della spedizione</Text>
        <View style={s.box}>
          <View style={s.colonne}>
            <View style={s.colSx}>
              <View style={[s.riga, { marginTop: 2 }]}>
                <Campo label="Contenuto" value={mos.contenuto} />
              </View>
              <Text style={s.sottoTitolo}>TIPO DI SERVIZIO</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {TIPI_SERVIZIO.map((t) => (
                  <Check key={t.value} label={t.label} checked={mos.tipo_servizio === t.value} />
                ))}
              </View>
              <Text style={s.sottoTitolo}>SERVIZI ACCESSORI E VALORE</Text>
              <View style={[s.riga, { alignItems: "flex-end" }]}>
                <Check label="Contrassegno" checked={mos.contrassegno_attivo} />
                <Campo label="€" value={mos.contrassegno_attivo ? euro(mos.contrassegno_valore).replace("€ ", "") : ""} />
              </View>
              <View style={[s.riga, { alignItems: "flex-end", marginBottom: 0 }]}>
                <Check label="Valore da assicurare" checked={mos.assicurazione_attiva} />
                <Campo label="€" value={mos.assicurazione_attiva ? euro(mos.assicurazione_valore).replace("€ ", "") : ""} />
              </View>
            </View>

            <View style={s.colDx}>
              <View style={s.misureRiga}>
                <View style={s.misuraBox}>
                  <Text style={s.misuraLabel}>N. Colli</Text>
                  <Text style={s.misuraVal}>{mos.n_colli}</Text>
                </View>
                <View style={s.misuraBox}>
                  <Text style={s.misuraLabel}>Peso</Text>
                  <Text style={s.misuraVal}>{Number(mos.peso_kg) > 0 ? `${Number(mos.peso_kg).toLocaleString("it-IT")} kg` : ""}</Text>
                </View>
                <View style={[s.misuraBox, { flex: 1.3 }]}>
                  <Text style={s.misuraLabel}>Misure</Text>
                  <Text style={s.misuraVal}>{mos.misure}</Text>
                </View>
              </View>
              <Text style={s.sottoTitolo}>SPECIFICHE</Text>
              <View style={[s.riga, { alignItems: "flex-end" }]}>
                <Campo label="Spedizione €" value={euro(mos.importo_spedizione).replace("€ ", "")} />
                <Check label="Imballato dal cliente" checked={mos.imballato_dal_cliente} />
              </View>
              <View style={[s.riga, { alignItems: "flex-end" }]}>
                <Campo label="Contrassegno €" value={euro(mos.importo_contrassegno).replace("€ ", "")} />
                <Check label="con pagamento contanti" checked={mos.contrassegno_contanti} />
              </View>
              <View style={[s.riga, { alignItems: "flex-end", marginBottom: 0 }]}>
                <Campo label="Assicurazione €" value={euro(mos.importo_assicurazione).replace("€ ", "")} />
                <Campo label="Spese suppl. €" value={euro(mos.importo_spese_suppl).replace("€ ", "")} />
              </View>
            </View>
          </View>
          <View style={s.totale}>
            <Text style={s.totaleLabel}>IMPORTO TOTALE</Text>
            <Text style={s.totaleVal}>{euro(totale)}</Text>
          </View>
        </View>

        {/* Spedizione avvenuta (fase 2) */}
        {mos.lettera_di_vettura ? (
          <View style={s.spedizioneBar}>
            <Text style={s.spedizioneTesto}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Corriere:</Text> {mos.corriere || "—"}
            </Text>
            <Text style={s.spedizioneTesto}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Lettera di vettura / tracking:</Text> {mos.lettera_di_vettura}
            </Text>
            <Text style={s.spedizioneTesto}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Spedito il:</Text> {dataIt(mos.data_spedizione)}
            </Text>
          </View>
        ) : null}

        {/* Timbro, firma, condizioni */}
        <View style={s.footerCols}>
          <View style={s.footerSx}>
            <View style={s.timbro}>
              <Text style={s.timbroLabel}>Timbro e firma Danema SRLS</Text>
            </View>
            <View style={s.firmaBox}>
              <Text style={s.firmaTitolo}>FIRMA CLIENTE</Text>
              <Text style={s.firmaTesto}>{DICHIARAZIONE_FIRMA}</Text>
              {mos.firma_png ? (
                <>
                  <Image src={mos.firma_png} style={s.firmaImg} />
                  <Text style={s.firmaMeta}>
                    Firma acquisita su tablet il {mos.firmato_il ? dataOraIt(mos.firmato_il) : ""}
                  </Text>
                </>
              ) : (
                <View style={s.firmaLinea} />
              )}
            </View>
          </View>
          <View style={s.footerDx}>
            {CONDIZIONI_MOS.map((p, i) => (
              <Text key={i} style={s.condizioni}>
                {p}
              </Text>
            ))}
            <Text style={s.noValidita}>DOCUMENTO SENZA VALIDITÀ FISCALE</Text>
          </View>
        </View>

        <View style={s.piede} fixed>
          <Text>{numero} · Modulo di spedizione</Text>
          <Text>Generato il {generatoIl}</Text>
        </View>
      </Page>
    </Document>
  )
}

/** Genera il PDF del modulo come Buffer (lato server). */
export async function generaPdfMos(mos: Mos): Promise<Buffer> {
  return renderToBuffer(<MosDocument mos={mos} />)
}

export function nomeFilePdf(mos: Mos) {
  return `MOS-${String(mos.numero).padStart(5, "0")}.pdf`
}
