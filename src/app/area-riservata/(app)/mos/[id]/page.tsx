import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, ExternalLink, Mail, PenLine, Truck } from "lucide-react"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatData, formatDataOra, formatEuro, formatNumeroMos, nominativo } from "@/lib/format"
import { ORDINE_STATI, STATI } from "@/lib/mos/stati"
import { TIPI_SERVIZIO } from "@/lib/mos/schema"
import { linkTracking } from "@/lib/mos/tracking"
import { cn } from "@/lib/utils"
import type { Mos } from "@/types/database"
import { PageHeader } from "@/components/area/page-header"
import { StatoBadge } from "@/components/area/mos/stato-badge"
import { MosAzioni } from "@/components/area/mos/mos-azioni"

export const metadata: Metadata = { title: "Dettaglio MOS" }

function Card({ titolo, children, className }: { titolo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-bold uppercase tracking-wide text-slate-700">{titolo}</h2>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function Riga({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="col-span-2 font-medium text-slate-900">{children || <span className="text-slate-300">—</span>}</dd>
    </div>
  )
}

function Stepper({ stato }: { stato: Mos["stato"] }) {
  const idx = ORDINE_STATI.indexOf(stato)
  return (
    <ol className="mb-6 grid grid-cols-4 gap-2">
      {ORDINE_STATI.map((s, i) => {
        const fatto = i <= idx
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                fatto ? "bg-primary text-white" : "bg-slate-200 text-slate-500",
              )}
            >
              {fatto ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn("hidden text-xs font-medium sm:block", fatto ? "text-slate-900" : "text-slate-400")}>{STATI[s].label}</span>
            {i < ORDINE_STATI.length - 1 ? <span className={cn("ml-auto hidden h-0.5 flex-1 rounded sm:block", i < idx ? "bg-primary" : "bg-slate-200")} /> : null}
          </li>
        )
      })}
    </ol>
  )
}

export default async function DettaglioMosPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, profilo] = await Promise.all([params, requireProfilo()])
  const supabase = await createClient()
  const { data } = await supabase.from("mos").select("*, creatore:profili!mos_created_by_fkey(nome, email)").eq("id", id).maybeSingle()
  if (!data) notFound()
  const mos = data as Mos & { creatore: { nome: string; email: string } | null }
  const numero = formatNumeroMos(mos.numero)
  const tracking = linkTracking(mos.corriere, mos.lettera_di_vettura)
  const servizio = TIPI_SERVIZIO.find((t) => t.value === mos.tipo_servizio)?.label ?? mos.tipo_servizio

  return (
    <>
      <PageHeader
        titolo={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{numero}</span>
            <StatoBadge stato={mos.stato} className="text-sm" />
          </span>
        }
        descrizione={`Modulo del ${formatData(mos.data)} · registrato il ${formatDataOra(mos.created_at)}${mos.creatore?.nome ? ` da ${mos.creatore.nome}` : ""}`}
        briciole={[{ label: "Archivio MOS", href: "/area-riservata/mos" }, { label: numero }]}
        azioni={<MosAzioni mos={mos} ruolo={profilo.ruolo} />}
      />

      <Stepper stato={mos.stato} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card titolo="Cliente mittente">
          <dl>
            <Riga label="Nominativo">{nominativo({ nome: mos.mitt_nome, cognome: mos.mitt_cognome, ragione_sociale: mos.mitt_ragione_sociale })}</Riga>
            {mos.mitt_partita_iva ? <Riga label="Partita IVA">{mos.mitt_partita_iva}</Riga> : null}
            {mos.mitt_sdi ? <Riga label="SDI">{mos.mitt_sdi}</Riga> : null}
            <Riga label="Indirizzo">
              {mos.mitt_indirizzo}
              <br />
              {[mos.mitt_cap, mos.mitt_citta, mos.mitt_provincia ? `(${mos.mitt_provincia})` : ""].filter(Boolean).join(" ")}
              {mos.mitt_stato && mos.mitt_stato !== "Italia" ? ` · ${mos.mitt_stato}` : ""}
            </Riga>
            <Riga label="Telefono">{mos.mitt_telefono}</Riga>
            <Riga label="E-mail">{mos.mitt_email}</Riga>
          </dl>
        </Card>

        <Card titolo="Destinatario">
          <dl>
            <Riga label="Nominativo">{nominativo({ nome: mos.dest_nome, cognome: mos.dest_cognome, ragione_sociale: mos.dest_ragione_sociale })}</Riga>
            <Riga label="Indirizzo">
              {mos.dest_indirizzo}
              <br />
              {[mos.dest_cap, mos.dest_citta, mos.dest_provincia ? `(${mos.dest_provincia})` : ""].filter(Boolean).join(" ")}
              {mos.dest_stato && mos.dest_stato !== "Italia" ? ` · ${mos.dest_stato}` : ""}
            </Riga>
            <Riga label="Telefono">{mos.dest_telefono}</Riga>
            <Riga label="E-mail">{mos.dest_email}</Riga>
            <Riga label="Note consegna">{mos.dest_note_consegna}</Riga>
          </dl>
        </Card>

        <Card titolo="Dati della spedizione">
          <dl>
            <Riga label="Contenuto">{mos.contenuto}</Riga>
            <Riga label="Colli / peso">
              {mos.n_colli} {mos.n_colli === 1 ? "collo" : "colli"} · {Number(mos.peso_kg).toLocaleString("it-IT")} kg
              {mos.misure ? ` · ${mos.misure} cm` : ""}
            </Riga>
            <Riga label="Servizio">{servizio}</Riga>
            <Riga label="Imballaggio">{mos.imballato_dal_cliente ? "Imballato dal cliente" : "Imballato da Magic Box"}</Riga>
            <Riga label="Contrassegno">
              {mos.contrassegno_attivo ? `${formatEuro(mos.contrassegno_valore)}${mos.contrassegno_contanti ? " · in contanti" : ""}` : "No"}
            </Riga>
            <Riga label="Assicurazione">{mos.assicurazione_attiva ? `Valore assicurato ${formatEuro(mos.assicurazione_valore)}` : "No"}</Riga>
            {mos.note ? <Riga label="Note interne">{mos.note}</Riga> : null}
          </dl>
        </Card>

        <Card titolo="Importi">
          <dl>
            <Riga label="Spedizione">{formatEuro(mos.importo_spedizione)}</Riga>
            <Riga label="Contrassegno">{formatEuro(mos.importo_contrassegno)}</Riga>
            <Riga label="Assicurazione">{formatEuro(mos.importo_assicurazione)}</Riga>
            <Riga label="Spese suppl.">{formatEuro(mos.importo_spese_suppl)}</Riga>
          </dl>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary px-4 py-3 text-white">
            <span className="text-sm font-semibold uppercase tracking-wide text-white/70">Totale</span>
            <span className="text-2xl font-bold tabular-nums">{formatEuro(mos.importo_totale)}</span>
          </div>
        </Card>

        <Card titolo="Corriere e tracking">
          {mos.lettera_di_vettura ? (
            <dl>
              <Riga label="Corriere">{mos.corriere}</Riga>
              <Riga label="Lettera di vettura">
                <span className="font-mono">{mos.lettera_di_vettura}</span>
                {tracking ? (
                  <a href={tracking} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Traccia <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </Riga>
              <Riga label="Spedito il">{formatData(mos.data_spedizione)}</Riga>
            </dl>
          ) : (
            <div className="flex items-start gap-3 text-sm text-slate-500">
              <Truck className="mt-0.5 h-5 w-5 text-slate-300" />
              <p>
                Il pacco non è ancora partito. Quando parte, usa <strong>Registra spedizione</strong> per inserire corriere e lettera di vettura: la
                copia aggiornata verrà inviata al cliente.
              </p>
            </div>
          )}
        </Card>

        <Card titolo="Firma e copia al cliente">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Firma del cliente</p>
              {mos.firma_png ? (
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mos.firma_png} alt="Firma del cliente" className="mx-auto h-24 object-contain" />
                  <p className="mt-1 text-center text-xs text-slate-400">Acquisita il {formatDataOra(mos.firmato_il)}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                  <PenLine className="h-4 w-4 text-slate-300" /> Non firmato su tablet
                  {mos.stampato_il ? <span className="text-xs text-slate-400">· stampato il {formatDataOra(mos.stampato_il)}</span> : null}
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Copia via email</p>
              {mos.copia_inviata_il ? (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
                  <Mail className="mt-0.5 h-4 w-4" />
                  <span>
                    Inviata a <strong>{mos.copia_inviata_a}</strong>
                    <br />
                    <span className="text-xs">il {formatDataOra(mos.copia_inviata_il)}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                  <Mail className="h-4 w-4 text-slate-300" /> Nessuna copia inviata
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Ultima modifica {formatDataOra(mos.updated_at)} ·{" "}
        <Link href={`/area-riservata/mos/${mos.id}/modifica`} className="text-primary hover:underline">
          modifica i dati
        </Link>
      </p>
    </>
  )
}
