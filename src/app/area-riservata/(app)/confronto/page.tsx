import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, FileSpreadsheet, Info } from "lucide-react"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatData, formatEuro } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ConfrontoRecord } from "@/types/database"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/area/page-header"
import { EmptyState } from "@/components/area/empty-state"
import { UploadForm } from "@/components/area/confronto/upload-form"
import { EliminaConfrontoButton } from "@/components/area/confronto/elimina-confronto-button"

export const metadata: Metadata = { title: "Confronto Poste" }

type Riga = Pick<
  ConfrontoRecord,
  "id" | "nome_file" | "numero_fattura" | "data_fattura" | "periodo_da" | "periodo_a" | "righe_totali" | "righe_abbinate" | "anomalie_rilevanti" | "anomalie_totali" | "totale_costi" | "totale_incassi" | "created_at"
>

export default async function ConfrontoPage() {
  await requireProfilo()
  const supabase = await createClient()
  const { data } = await supabase
    .from("confronti")
    .select("id, nome_file, numero_fattura, data_fattura, periodo_da, periodo_a, righe_totali, righe_abbinate, anomalie_rilevanti, anomalie_totali, totale_costi, totale_incassi, created_at")
    .order("created_at", { ascending: false })
    .limit(50)
  const storico = (data ?? []) as Riga[]

  return (
    <>
      <PageHeader
        titolo="Confronto con le fatture di Poste"
        descrizione="Carica il file che Poste allega alla fattura mensile: ogni riga viene abbinata ai moduli tramite la lettera di vettura."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Nuovo confronto</h2>
            <UploadForm />
          </div>
          <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p>
                Il file si scarica dall&apos;area business di Poste insieme alla fattura (tracciato «FATTURATO», colonne separate da «;»).
              </p>
              <p className="text-xs text-sky-800/80">
                Se nel portale Poste indichi il numero del modulo (es. <span className="font-mono">MOS-00042</span>) come riferimento spedizione, l&apos;abbinamento
                funziona anche quando la lettera di vettura non è stata registrata.
              </p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-3 text-base font-bold text-slate-900">Storico dei confronti</h2>
          {storico.length === 0 ? (
            <EmptyState icon={FileSpreadsheet} titolo="Nessun confronto eseguito" descrizione="Il primo risultato comparirà qui con riepilogo e anomalie." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead>Fattura</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead className="text-right">Abbinate</TableHead>
                    <TableHead className="text-right">Anomalie</TableHead>
                    <TableHead className="text-right">Costi</TableHead>
                    <TableHead className="text-right">Incassi</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storico.map((c) => (
                    <TableRow key={c.id} className="group">
                      <TableCell>
                        <Link href={`/area-riservata/confronto/${c.id}`} className="font-medium text-slate-900 hover:text-primary">
                          {c.numero_fattura ? `N. ${c.numero_fattura}` : c.nome_file}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {c.data_fattura ? `del ${formatData(c.data_fattura)} · ` : ""}caricata il {formatData(c.created_at)}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {formatData(c.periodo_da)} – {formatData(c.periodo_a)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c.righe_abbinate}/{c.righe_totali}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "inline-flex min-w-8 justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                            c.anomalie_rilevanti > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700",
                          )}
                          title={`${c.anomalie_totali} anomalie totali`}
                        >
                          {c.anomalie_rilevanti}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatEuro(c.totale_costi)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatEuro(c.totale_incassi)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/area-riservata/confronto/${c.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-primary"
                            aria-label="Apri confronto"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                          <EliminaConfrontoButton id={c.id} compatto />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
