import { Resend } from "resend"
import type { Mos } from "@/types/database"
import { formatData, formatEuro, formatNumeroMos, nominativo } from "@/lib/format"
import { linkTracking } from "./tracking"

// ---------------------------------------------------------------------
//  Dati dell'attività, usati nell'intestazione e nel piè di pagina
// ---------------------------------------------------------------------
const AZIENDA = {
  nome: "Magic Box Roma",
  ragioneSociale: "Danema S.r.l.s.",
  indirizzo: "Via Francesco D'Ovidio 143/145",
  cap: "00137",
  citta: "Roma",
  telefono: "06 89226298",
  telefonoLink: "+390689226298",
  email: "info@magicboxroma.it",
  orari: "Lun-Ven 9:00-13:00 / 14:30-19:00 · Sab 9:00-13:00",
}

const ARANCIO = "#F04E23"
const SCURO = "#1B1D26"
const TESTO = "#1F2937"
const TENUE = "#6B7280"
const BORDO = "#E5E7EB"
const SFONDO = "#F1F3F6"

/**
 * Le immagini dell'email devono avere un indirizzo pubblico: in sviluppo
 * NEXT_PUBLIC_SITE_URL punta a localhost, quindi si ricade sul dominio reale.
 */
function baseUrl() {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (u && u.startsWith("https://")) return u.replace(/\/+$/, "")
  return "https://www.magicboxroma.it"
}

function escapeHtml(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** Nel saluto si usa la persona se c'è, altrimenti la ragione sociale (mai entrambe). */
function saluto(mos: Mos) {
  const persona = [mos.mitt_nome, mos.mitt_cognome].filter(Boolean).join(" ").trim()
  const chi = persona || mos.mitt_ragione_sociale.trim()
  return chi ? `Gentile ${chi},` : "Gentile cliente,"
}

interface Voce {
  label: string
  valore: string
  evidenza?: boolean
}

function vociModulo(mos: Mos): Voce[] {
  const dest = nominativo({ nome: mos.dest_nome, cognome: mos.dest_cognome, ragione_sociale: mos.dest_ragione_sociale })
  const destCompleto = [dest, mos.dest_citta].filter((v) => v && v !== "—").join(" · ")
  const totale = Number(mos.importo_totale) || 0
  const voci: Voce[] = [
    { label: "Numero modulo", valore: formatNumeroMos(mos.numero) },
    { label: "Data", valore: formatData(mos.data) },
    { label: "Destinatario", valore: destCompleto || "—" },
  ]
  if (mos.contenuto.trim()) voci.push({ label: "Contenuto", valore: mos.contenuto })
  voci.push({
    label: "Colli e peso",
    valore: `${mos.n_colli} ${mos.n_colli === 1 ? "collo" : "colli"} · ${Number(mos.peso_kg).toLocaleString("it-IT")} kg`,
  })
  if (mos.lettera_di_vettura) {
    if (mos.corriere) voci.push({ label: "Corriere", valore: mos.corriere })
    if (mos.data_spedizione) voci.push({ label: "Spedito il", valore: formatData(mos.data_spedizione) })
  }
  // L'importo compare solo se è stato incassato qualcosa
  if (totale > 0) voci.push({ label: "Importo pagato", valore: formatEuro(totale), evidenza: true })
  return voci
}

function righeHtml(voci: Voce[]) {
  return voci
    .map((v, i) => {
      const bordo = i === 0 ? "" : `border-top:1px solid ${BORDO};`
      return `<tr>
        <td style="${bordo}padding:11px 20px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;color:${TENUE};white-space:nowrap;">${escapeHtml(v.label)}</td>
        <td align="right" style="${bordo}padding:11px 20px;font-family:Helvetica,Arial,sans-serif;font-size:${v.evidenza ? "15px" : "13px"};line-height:20px;color:${TESTO};font-weight:bold;">${escapeHtml(v.valore)}</td>
      </tr>`
    })
    .join("")
}

/** Pulsante compatibile anche con Outlook (VML). */
function pulsante(href: string, testo: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr><td align="center" bgcolor="${ARANCIO}" style="border-radius:8px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;line-height:18px;color:#FFFFFF;text-decoration:none;border-radius:8px;">${escapeHtml(testo)}</a>
    </td></tr>
  </table>`
}

export function htmlEmailCopia(mos: Mos) {
  const numero = formatNumeroMos(mos.numero)
  const spedito = Boolean(mos.lettera_di_vettura)
  const tracking = linkTracking(mos.corriere, mos.lettera_di_vettura)
  const url = baseUrl()

  const titolo = spedito ? "La tua spedizione è partita" : "La tua copia del modulo"
  const occhiello = spedito ? "Spedizione affidata al corriere" : "Modulo di spedizione"
  const introduzione = spedito
    ? `il pacco che ci hai affidato è stato consegnato al corriere. Qui sotto trovi il codice per seguirlo fino a destinazione; in allegato la copia aggiornata del modulo <strong style="color:${TESTO};">${numero}</strong>.`
    : `in allegato trovi la copia del modulo di spedizione <strong style="color:${TESTO};">${numero}</strong>. Ti scriveremo di nuovo appena il pacco sarà affidato al corriere.`
  const preheader = spedito
    ? `${numero} affidato a ${mos.corriere || "corriere"} · codice ${mos.lettera_di_vettura}`
    : `${numero} · copia del modulo di spedizione in allegato`

  const boxTracking = spedito
    ? `<tr><td class="riempimento" style="padding:0 28px 28px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FDF2EE;border:1px solid #F8D5C8;border-radius:10px;">
          <tr><td align="center" style="padding:20px 20px 22px 20px;">
            <p style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:14px;letter-spacing:1.2px;text-transform:uppercase;color:#B4471F;">Codice di tracciamento</p>
            <p class="codice" style="margin:0 0 ${tracking ? "18px" : "0"} 0;font-family:'Courier New',Courier,monospace;font-size:22px;line-height:28px;font-weight:bold;color:${SCURO};letter-spacing:1px;">${escapeHtml(mos.lettera_di_vettura)}</p>
            ${tracking ? pulsante(tracking, "Segui la spedizione") : ""}
          </td></tr>
        </table>
      </td></tr>`
    : ""

  return `<!doctype html>
<html lang="it" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<title>${escapeHtml(titolo)} · ${numero}</title>
<style>
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
  /* I rilevatori automatici di indirizzi e numeri non devono colorare il testo */
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; }
  u + #corpo a { color:inherit; text-decoration:none; }
  @media only screen and (max-width:620px) {
    .riempimento { padding-left:20px !important; padding-right:20px !important; }
    .titolo { font-size:24px !important; line-height:30px !important; }
    .codice { font-size:18px !important; letter-spacing:0 !important; }
  }
</style>
</head>
<body id="corpo" style="margin:0;padding:0;background-color:${SFONDO};">
<div style="display:none;font-size:1px;color:${SFONDO};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${SFONDO};">
<tr><td align="center" style="padding:28px 12px 36px 12px;">

  <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
  <table role="presentation" class="contenitore" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,0.08);">

    <!-- Filetto arancione: unico tocco di colore in cima -->
    <tr><td style="background-color:${ARANCIO};font-size:0;line-height:0;height:5px;">&nbsp;</td></tr>

    <!-- Intestazione: logo grande centrato, come sul modulo cartaceo -->
    <tr><td align="center" class="riempimento" style="padding:30px 28px 26px 28px;border-bottom:1px solid ${BORDO};">
      <img src="${url}/logo-magic-box-roma.png" width="72" height="72" alt="Magic Box Roma" style="display:block;width:72px;height:72px;margin:0 auto 12px auto;">
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:21px;line-height:26px;font-weight:bold;letter-spacing:2px;color:${SCURO};">MAGIC <span style="color:${ARANCIO};">BOX</span></p>
      <p style="margin:5px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:14px;letter-spacing:2px;text-transform:uppercase;color:${TENUE};">Logistica e spedizioni</p>
    </td></tr>

    <!-- Titolo -->
    <tr><td class="riempimento" style="padding:30px 28px 0 28px;">
      <p align="center" style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:14px;letter-spacing:1.4px;text-transform:uppercase;color:${ARANCIO};font-weight:bold;text-align:center;">${escapeHtml(occhiello)}</p>
      <h1 class="titolo" align="center" style="margin:0 0 4px 0;font-family:Helvetica,Arial,sans-serif;font-size:28px;line-height:34px;font-weight:bold;color:${SCURO};text-align:center;">${escapeHtml(titolo)}</h1>
      <p align="center" style="margin:0 0 24px 0;font-family:'Courier New',Courier,monospace;font-size:13px;line-height:18px;color:${TENUE};text-align:center;">${numero}</p>
      <p style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:${TESTO};">${escapeHtml(saluto(mos))}</p>
      <p style="margin:0 0 26px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:${TENUE};">${introduzione}</p>
    </td></tr>

    ${boxTracking}

    <!-- Riepilogo -->
    <tr><td class="riempimento" style="padding:0 28px 8px 28px;">
      <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:14px;letter-spacing:1.2px;text-transform:uppercase;color:${TENUE};font-weight:bold;">Riepilogo della spedizione</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDO};border-radius:10px;">
        ${righeHtml(vociModulo(mos))}
      </table>
    </td></tr>

    <!-- Allegato -->
    <tr><td class="riempimento" style="padding:22px 28px 30px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFC;border-radius:10px;">
        <tr><td style="padding:14px 18px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:${TENUE};">
          In allegato a questa email trovi il modulo <strong style="color:${TESTO};">${numero}.pdf</strong>, da conservare come ricevuta della consegna del collo.
        </td></tr>
      </table>
    </td></tr>

    <!-- Chiusura -->
    <tr><td class="riempimento" style="padding:0 28px 34px 28px;border-bottom:1px solid ${BORDO};">
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:${TENUE};">
        Per qualsiasi necessità rispondi a questa email oppure chiamaci allo <span style="color:${TESTO};font-weight:bold;">${AZIENDA.telefono}</span>. Grazie per aver scelto Magic Box Roma.
      </p>
    </td></tr>

    <!-- Piè di pagina -->
    <tr><td class="riempimento" style="padding:26px 28px 30px 28px;">
      <p style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;font-weight:bold;color:${TESTO};">${AZIENDA.nome} <span style="font-weight:normal;color:${TENUE};">· ${AZIENDA.ragioneSociale}</span></p>
      <p style="margin:0 0 4px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:${TENUE};">${AZIENDA.indirizzo} &#183; ${AZIENDA.cap} ${AZIENDA.citta}</p>
      <p style="margin:0 0 4px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:${TENUE};">Telefono ${AZIENDA.telefono} &#183; ${AZIENDA.email}</p>
      <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:${TENUE};">${AZIENDA.orari}</p>
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:17px;color:#9AA0AE;">${spedito ? "Email inviata automaticamente a seguito della spedizione. " : ""}Documento senza validità fiscale.</p>
    </td></tr>

  </table>
  <!--[if mso]></td></tr></table><![endif]-->

</td></tr>
</table>
</body>
</html>`
}

/** Versione testuale: migliora la consegna e serve ai lettori che non mostrano HTML. */
export function testoEmailCopia(mos: Mos) {
  const numero = formatNumeroMos(mos.numero)
  const spedito = Boolean(mos.lettera_di_vettura)
  const tracking = linkTracking(mos.corriere, mos.lettera_di_vettura)

  const righe = [
    saluto(mos),
    "",
    spedito
      ? `il pacco che ci hai affidato è stato consegnato al corriere. In allegato la copia aggiornata del modulo ${numero}.`
      : `in allegato trovi la copia del modulo di spedizione ${numero}.`,
    "",
  ]
  if (spedito) {
    righe.push(`Codice di tracciamento: ${mos.lettera_di_vettura}`)
    if (tracking) righe.push(`Segui la spedizione: ${tracking}`)
    righe.push("")
  }
  righe.push("RIEPILOGO DELLA SPEDIZIONE")
  for (const v of vociModulo(mos)) righe.push(`- ${v.label}: ${v.valore}`)
  righe.push(
    "",
    `Per qualsiasi necessità rispondi a questa email oppure chiamaci allo ${AZIENDA.telefono}.`,
    "Grazie per aver scelto Magic Box Roma.",
    "",
    `${AZIENDA.nome} · ${AZIENDA.ragioneSociale}`,
    `${AZIENDA.indirizzo} · ${AZIENDA.cap} ${AZIENDA.citta}`,
    `Telefono ${AZIENDA.telefono} · ${AZIENDA.email}`,
    AZIENDA.orari,
    "",
    "Documento senza validità fiscale.",
  )
  return righe.join("\n")
}

export async function inviaCopiaMosEmail(opts: { mos: Mos; pdf: Buffer; nomeFile: string; destinatario: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY mancante: impossibile inviare email")

  const resend = new Resend(apiKey)
  const from = process.env.EMAIL_MITTENTE || `Magic Box Roma <${AZIENDA.email}>`
  const numero = formatNumeroMos(opts.mos.numero)
  const spedito = Boolean(opts.mos.lettera_di_vettura)

  const { data, error } = await resend.emails.send({
    from,
    to: [opts.destinatario],
    replyTo: AZIENDA.email,
    subject: spedito
      ? `La tua spedizione è partita · ${numero} · Magic Box Roma`
      : `Copia del modulo di spedizione · ${numero} · Magic Box Roma`,
    html: htmlEmailCopia(opts.mos),
    text: testoEmailCopia(opts.mos),
    attachments: [{ filename: opts.nomeFile, content: opts.pdf }],
  })
  if (error) throw new Error(error.message || "Invio email non riuscito")
  return data?.id ?? null
}
