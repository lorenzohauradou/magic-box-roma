"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatData, formatEuro, formatNumeroMos } from "@/lib/format"
import { ETICHETTE_ANOMALIA, type RisultatoConfronto, type TipoAnomalia } from "@/lib/poste/confronto"
import { cn } from "@/lib/utils"

const COLORI_TIPO: Record<TipoAnomalia, string> = {
  addebito_senza_modulo: "bg-red-100 text-red-800",
  duplicato: "bg-red-100 text-red-800",
  classe_peso: "bg-amber-100 text-amber-800",
  addebito_aggiuntivo: "bg-amber-100 text-amber-800",
  servizio_extra: "bg-amber-100 text-amber-800",
  margine_negativo: "bg-orange-100 text-orange-800",
  modulo_non_addebitato: "bg-sky-100 text-sky-800",
  colli: "bg-slate-100 text-slate-700",
  data: "bg-slate-100 text-slate-700",
}

function TipoBadge({ tipo }: { tipo: TipoAnomalia }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", COLORI_TIPO[tipo])}>{ETICHETTE_ANOMALIA[tipo]?.label ?? tipo}</span>
}

function MosLink({ id, numero }: { id: string | null; numero: number | null }) {
  if (!id || !numero) return <span className="text-slate-300">—</span>
  return (
    <Link href={`/area-riservata/mos/${id}`} className="whitespace-nowrap font-mono text-sm font-semibold text-primary hover:underline">
      {formatNumeroMos(numero)}
    </Link>
  )
}

const selectClass = "h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"

export function ConfrontoDettaglio({ risultato }: { risultato: RisultatoConfronto }) {
  const { anomalie, righe, moduliNonAddebitati, riepilogo } = risultato
  const [soloRilevanti, setSoloRilevanti] = useState(true)
  const [tipo, setTipo] = useState<string>("")
  const [cerca, setCerca] = useState("")
  const [soloNonAbbinate, setSoloNonAbbinate] = useState(false)

  const conteggiTipo = useMemo(() => {
    const m = new Map<TipoAnomalia, number>()
    for (const a of anomalie) m.set(a.tipo, (m.get(a.tipo) ?? 0) + 1)
    return m
  }, [anomalie])

  const anomalieFiltrate = useMemo(
    () => anomalie.filter((a) => (!soloRilevanti || a.rilevante) && (!tipo || a.tipo === tipo)),
    [anomalie, soloRilevanti, tipo],
  )

  const righeFiltrate = useMemo(() => {
    const q = cerca.trim().toLowerCase()
    return righe.filter((r) => {
      if (soloNonAbbinate && r.abbinamento !== "nessuno") return false
      if (!q) return true
      return (
        r.ldv.toLowerCase().includes(q) ||
        r.rifSped.toLowerCase().includes(q) ||
        r.destinatario.toLowerCase().includes(q) ||
        r.mittente.toLowerCase().includes(q) ||
        (r.mosNumero !== null && formatNumeroMos(r.mosNumero).toLowerCase().includes(q))
      )
    })
  }, [righe, cerca, soloNonAbbinate])

  return (
    <Tabs defaultValue="anomalie">
      <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 bg-slate-100 p-1">
        <TabsTrigger value="anomalie">Anomalie ({anomalie.length})</TabsTrigger>
        <TabsTrigger value="righe">Righe fattura ({righe.length})</TabsTrigger>
        <TabsTrigger value="non-addebitati">Moduli non addebitati ({moduliNonAddebitati.length})</TabsTrigger>
        <TabsTrigger value="classi">Classi di peso</TabsTrigger>
      </TabsList>

      {/* ---- Anomalie ---- */}
      <TabsContent value="anomalie" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={soloRilevanti} onChange={(e) => setSoloRilevanti(e.target.checked)} className="h-4 w-4 accent-[#F04E23]" />
            Solo economicamente rilevanti (≥ 1 €)
          </label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass} aria-label="Tipo di anomalia">
            <option value="">Tutti i tipi</option>
            {(Object.keys(ETICHETTE_ANOMALIA) as TipoAnomalia[])
              .filter((t) => conteggiTipo.get(t))
              .map((t) => (
                <option key={t} value={t}>
                  {ETICHETTE_ANOMALIA[t].label} ({conteggiTipo.get(t)})
                </option>
              ))}
          </select>
          <span className="text-slate-500">{anomalieFiltrate.length} risultati</span>
        </div>

        {anomalieFiltrate.length === 0 ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800">
            Nessuna anomalia con questi filtri: gli addebiti tornano con i moduli.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="w-8" />
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Impatto</TableHead>
                  <TableHead>Lettera di vettura</TableHead>
                  <TableHead>MOS</TableHead>
                  <TableHead>Descrizione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anomalieFiltrate.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <span className={cn("block h-2.5 w-2.5 rounded-full", a.rilevante ? "bg-red-500" : "bg-slate-300")} title={a.rilevante ? "Rilevante" : "Marginale"} />
                    </TableCell>
                    <TableCell>
                      <TipoBadge tipo={a.tipo} />
                    </TableCell>
                    <TableCell className={cn("text-right font-semibold tabular-nums", a.impatto > 0 ? "text-red-600" : "text-slate-400")}>
                      {a.impatto > 0 ? formatEuro(a.impatto) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {a.ldv || "—"}
                      {a.rifSped ? <span className="block text-[11px] text-slate-400">rif. {a.rifSped}</span> : null}
                    </TableCell>
                    <TableCell>
                      <MosLink id={a.mosId} numero={a.mosNumero} />
                    </TableCell>
                    <TableCell className="max-w-xl text-sm text-slate-700">{a.descrizione}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      {/* ---- Righe fattura ---- */}
      <TabsContent value="righe" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="Cerca LDV, riferimento, destinatario, MOS…" className="h-9 pl-9" />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={soloNonAbbinate} onChange={(e) => setSoloNonAbbinate(e.target.checked)} className="h-4 w-4 accent-[#F04E23]" />
            Solo senza modulo
          </label>
          <span className="text-slate-500">{righeFiltrate.length} righe</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="w-10">#</TableHead>
                <TableHead>LDV / riferimento</TableHead>
                <TableHead>Partenza</TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead>Classe Poste</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead>MOS</TableHead>
                <TableHead>Classe MOS</TableHead>
                <TableHead className="text-right">Incasso</TableHead>
                <TableHead>Anomalie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {righeFiltrate.map((r) => (
                <TableRow key={`${r.indice}-${r.ldv}`} className={cn(r.abbinamento === "nessuno" && "bg-red-50/40")}>
                  <TableCell className="text-xs text-slate-400">{r.indice}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.ldv}
                    {r.rifSped ? <span className="block text-[11px] text-slate-400">{r.rifSped}</span> : null}
                    {r.servizio && !r.servizio.toLowerCase().startsWith("poste delivery") ? <span className="block text-[11px] text-amber-700">{r.servizio}</span> : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{formatData(r.dataPartenza)}</TableCell>
                  <TableCell className="text-sm">
                    {r.destinatario || "—"}
                    {r.cittaDest ? <span className="block text-xs text-slate-500">{r.cittaDest}</span> : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.classePeso || "—"}
                    {r.pesoTassabileKg !== null ? <span className="block text-xs text-slate-500">{r.pesoTassabileKg} kg</span> : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatEuro(r.importoTotale)}</TableCell>
                  <TableCell>
                    <MosLink id={r.mosId} numero={r.mosNumero} />
                    {r.abbinamento === "riferimento" ? <span className="block text-[11px] text-slate-400">via riferimento</span> : null}
                  </TableCell>
                  <TableCell className={cn("text-sm", r.mosClassePeso && r.classePeso && r.mosClassePeso !== r.classePeso && "font-semibold text-amber-700")}>
                    {r.mosClassePeso || "—"}
                    {r.mosPesoKg !== null ? <span className="block text-xs font-normal text-slate-500">{r.mosPesoKg} kg</span> : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.mosIncasso !== null ? formatEuro(r.mosIncasso) : "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.anomalie.map((t) => (
                        <TipoBadge key={t} tipo={t} />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* ---- Moduli non addebitati ---- */}
      <TabsContent value="non-addebitati">
        {moduliNonAddebitati.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            Tutti i moduli spediti con Poste nel periodo compaiono in fattura.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead>MOS</TableHead>
                  <TableHead>Spedito il</TableHead>
                  <TableHead>Corriere</TableHead>
                  <TableHead>Lettera di vettura</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead className="text-right">Incasso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moduliNonAddebitati.map((m) => (
                  <TableRow key={m.mosId}>
                    <TableCell>
                      <MosLink id={m.mosId} numero={m.mosNumero} />
                    </TableCell>
                    <TableCell>{formatData(m.dataSpedizione)}</TableCell>
                    <TableCell>{m.corriere}</TableCell>
                    <TableCell className="font-mono text-xs">{m.ldv}</TableCell>
                    <TableCell>{m.destinatario}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatEuro(m.incasso)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      {/* ---- Classi di peso ---- */}
      <TabsContent value="classi">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead>Classe</TableHead>
                  <TableHead className="text-right">Righe</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riepilogo.perClasse.map((c) => (
                  <TableRow key={c.classe}>
                    <TableCell className="font-medium">{c.classe}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.righe}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatEuro(c.costo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h3 className="font-semibold text-slate-900">Tariffe base rilevate dal file</h3>
            <p className="text-xs text-slate-500">
              Importo «LDV» più frequente per ciascuna classe: serve a stimare l&apos;impatto quando Poste tassa una fascia superiore a quella del modulo.
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
              {Object.entries(riepilogo.tariffeRilevate).map(([classe, v]) => (
                <div key={classe} className="flex justify-between border-b border-slate-100 py-1">
                  <dt className="text-slate-600">{classe}</dt>
                  <dd className="tabular-nums">{formatEuro(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
