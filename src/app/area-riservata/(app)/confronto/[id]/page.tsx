import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AlertTriangle, Download, Euro, Link2, ShieldAlert, TrendingUp } from "lucide-react"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatData, formatDataOra, formatEuro } from "@/lib/format"
import type { RisultatoConfronto } from "@/lib/poste/confronto"
import type { ConfrontoRecord } from "@/types/database"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/area/page-header"
import { StatCard } from "@/components/area/stat-card"
import { ConfrontoDettaglio } from "@/components/area/confronto/confronto-dettaglio"
import { EliminaConfrontoButton } from "@/components/area/confronto/elimina-confronto-button"

export const metadata: Metadata = { title: "Risultato confronto" }

export default async function DettaglioConfrontoPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, requireProfilo()])
  const supabase = await createClient()
  const { data } = await supabase.from("confronti").select("*").eq("id", id).maybeSingle()
  if (!data) notFound()
  const c = data as ConfrontoRecord
  const risultato = c.risultato as RisultatoConfronto | null
  const r = risultato?.riepilogo

  return (
    <>
      <PageHeader
        titolo={c.numero_fattura ? `Fattura ${c.numero_fattura}` : c.nome_file}
        descrizione={`${c.data_fattura ? `Fattura del ${formatData(c.data_fattura)} · ` : ""}spedizioni dal ${formatData(c.periodo_da)} al ${formatData(c.periodo_a)} · file «${c.nome_file}» caricato il ${formatDataOra(c.created_at)}`}
        briciole={[{ label: "Confronto Poste", href: "/area-riservata/confronto" }, { label: c.numero_fattura ? `Fattura ${c.numero_fattura}` : "Risultato" }]}
        azioni={
          <>
            <EliminaConfrontoButton id={c.id} redirectDopo="/area-riservata/confronto" />
            <Button asChild className="bg-primary text-white hover:bg-primary-600">
              <a href={`/area-riservata/confronto/${c.id}/excel`}>
                <Download className="h-4 w-4" /> Esporta Excel
              </a>
            </Button>
          </>
        }
      />

      {!risultato || risultato.versione !== 1 || !r ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Il risultato salvato non è leggibile. Ricarica il file per rieseguire il confronto.
        </p>
      ) : (
        <>
          {risultato.avvisi.length > 0 ? (
            <ul className="mb-6 space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {risultato.avvisi.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {a}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Righe abbinate" valore={`${r.righeAbbinate} / ${r.righeTotali}`} icon={Link2} hint={`${r.righeNonAbbinate} senza modulo · ${r.moduliNonAddebitati} moduli non addebitati`} tono="primary" />
            <StatCard
              label="Anomalie rilevanti"
              valore={r.anomalieRilevanti}
              icon={ShieldAlert}
              tono={r.anomalieRilevanti > 0 ? "warning" : "success"}
              hint={`Impatto stimato ${formatEuro(r.impattoAnomalie)} · ${r.anomalieTotali} anomalie totali`}
            />
            <StatCard label="Costi Poste" valore={formatEuro(r.totaleCosti)} icon={Euro} hint="Somma degli importi in fattura (netto IVA)" />
            <StatCard
              label="Incassi moduli abbinati"
              valore={formatEuro(r.totaleIncassi)}
              icon={TrendingUp}
              tono={r.margine >= 0 ? "success" : "warning"}
              hint={`Margine ${formatEuro(r.margine)} sulle spedizioni abbinate`}
            />
          </div>

          <div className="mt-8">
            <ConfrontoDettaglio risultato={risultato} />
          </div>
        </>
      )}
    </>
  )
}
