import Link from "next/link"
import type { Metadata } from "next"
import { AlertTriangle, Archive, CalendarDays, Clock, FilePlus2, FileSpreadsheet, PackageCheck, Send } from "lucide-react"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatData, formatEuro, oggiIso } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/area/page-header"
import { StatCard } from "@/components/area/stat-card"
import { EmptyState } from "@/components/area/empty-state"
import { MOS_LISTA_SELECT, MosTable, type MosRiga } from "@/components/area/mos/mos-table"

export const metadata: Metadata = { title: "Dashboard" }

function saluto() {
  const h = new Date().getHours()
  if (h < 13) return "Buongiorno"
  if (h < 18) return "Buon pomeriggio"
  return "Buonasera"
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const [{ errore }, profilo] = await Promise.all([searchParams, requireProfilo()])
  const supabase = await createClient()

  const oggi = oggiIso()
  const inizioMese = `${oggi.slice(0, 8)}01`

  const [oggiRes, meseRes, daSpedireRes, senzaCopiaRes, ultimiRes, confrontoRes] = await Promise.all([
    supabase.from("mos").select("id", { count: "exact", head: true }).eq("data", oggi),
    supabase.from("mos").select("id", { count: "exact", head: true }).gte("data", inizioMese),
    supabase.from("mos").select("id", { count: "exact", head: true }).in("stato", ["bozza", "stampato"]),
    supabase.from("mos").select("id", { count: "exact", head: true }).eq("stato", "spedito"),
    supabase.from("mos").select(MOS_LISTA_SELECT).order("numero", { ascending: false }).limit(8),
    supabase
      .from("confronti")
      .select("id, nome_file, numero_fattura, periodo_da, periodo_a, righe_totali, righe_abbinate, anomalie_rilevanti, totale_costi, totale_incassi, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const ultimi = (ultimiRes.data ?? []) as MosRiga[]
  const confronto = confrontoRes.data
  const nome = profilo.nome.split(" ")[0] || profilo.email

  return (
    <>
      <PageHeader
        titolo={`${saluto()}, ${nome}`}
        descrizione={`Oggi è ${formatData(new Date())}. Ecco la situazione dei moduli di spedizione.`}
        azioni={
          <>
            <Button asChild variant="outline">
              <Link href="/area-riservata/confronto">
                <FileSpreadsheet className="h-4 w-4" /> Confronto Poste
              </Link>
            </Button>
            <Button asChild className="bg-primary text-white hover:bg-primary-600">
              <Link href="/area-riservata/mos/nuovo">
                <FilePlus2 className="h-4 w-4" /> Nuovo MOS
              </Link>
            </Button>
          </>
        }
      />

      {errore === "non-autorizzato" ? (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4" /> La pagina richiesta è riservata agli amministratori.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Moduli oggi" valore={oggiRes.count ?? 0} icon={CalendarDays} tono="primary" href={`/area-riservata/mos?da=${oggi}&a=${oggi}`} />
        <StatCard label="Moduli questo mese" valore={meseRes.count ?? 0} icon={Archive} href={`/area-riservata/mos?da=${inizioMese}&a=${oggi}`} />
        <StatCard
          label="In attesa di spedizione"
          valore={daSpedireRes.count ?? 0}
          icon={Clock}
          tono="warning"
          hint="Bozze e moduli firmati senza tracking"
          href="/area-riservata/mos?stato=stampato"
        />
        <StatCard
          label="Spediti, copia da inviare"
          valore={senzaCopiaRes.count ?? 0}
          icon={Send}
          tono="success"
          hint="Spediti ma senza email al cliente"
          href="/area-riservata/mos?stato=spedito"
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Ultimi moduli</h2>
            <Link href="/area-riservata/mos" className="text-sm font-medium text-primary hover:underline">
              Vai all&apos;archivio
            </Link>
          </div>
          {ultimi.length > 0 ? (
            <MosTable moduli={ultimi} compatto />
          ) : (
            <EmptyState
              icon={PackageCheck}
              titolo="Nessun modulo ancora registrato"
              descrizione="Compila il primo modulo MOS: i dati resteranno in archivio e i clienti verranno proposti automaticamente la volta successiva."
              azione={
                <Button asChild className="bg-primary text-white hover:bg-primary-600">
                  <Link href="/area-riservata/mos/nuovo">
                    <FilePlus2 className="h-4 w-4" /> Compila un MOS
                  </Link>
                </Button>
              }
            />
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Ultimo confronto Poste</h2>
            <Link href="/area-riservata/confronto" className="text-sm font-medium text-primary hover:underline">
              Storico
            </Link>
          </div>
          {confronto ? (
            <Link
              href={`/area-riservata/confronto/${confronto.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-500">Fattura {confronto.numero_fattura || "—"}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Periodo {formatData(confronto.periodo_da)} – {formatData(confronto.periodo_a)} · caricato il {formatData(confronto.created_at)}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Righe abbinate</dt>
                  <dd className="font-semibold text-slate-900">
                    {confronto.righe_abbinate} / {confronto.righe_totali}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Anomalie rilevanti</dt>
                  <dd className={confronto.anomalie_rilevanti > 0 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>
                    {confronto.anomalie_rilevanti}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Costi Poste</dt>
                  <dd className="font-semibold text-slate-900">{formatEuro(confronto.totale_costi)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Incassi</dt>
                  <dd className="font-semibold text-slate-900">{formatEuro(confronto.totale_incassi)}</dd>
                </div>
              </dl>
            </Link>
          ) : (
            <EmptyState
              icon={FileSpreadsheet}
              titolo="Nessun confronto eseguito"
              descrizione="Carica il file CSV che Poste invia con la fattura per verificare gli addebiti."
              azione={
                <Button asChild variant="outline">
                  <Link href="/area-riservata/confronto">Carica il file di Poste</Link>
                </Button>
              }
            />
          )}
        </section>
      </div>
    </>
  )
}
