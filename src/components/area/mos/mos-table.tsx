import Link from "next/link"
import { ArrowUpRight, Truck } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatData, formatEuro, formatNumeroMos, nominativo } from "@/lib/format"
import type { Mos } from "@/types/database"
import { StatoBadge } from "./stato-badge"

/** Colonne minime per la lista (select Supabase). */
export const MOS_LISTA_SELECT =
  "id, numero, data, stato, mitt_nome, mitt_cognome, mitt_ragione_sociale, mitt_citta, dest_nome, dest_cognome, dest_ragione_sociale, dest_citta, corriere, lettera_di_vettura, importo_totale, data_spedizione"

export type MosRiga = Pick<
  Mos,
  | "id"
  | "numero"
  | "data"
  | "stato"
  | "mitt_nome"
  | "mitt_cognome"
  | "mitt_ragione_sociale"
  | "mitt_citta"
  | "dest_nome"
  | "dest_cognome"
  | "dest_ragione_sociale"
  | "dest_citta"
  | "corriere"
  | "lettera_di_vettura"
  | "importo_totale"
  | "data_spedizione"
>

export function MosTable({ moduli, compatto = false }: { moduli: MosRiga[]; compatto?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="w-[130px]">Numero</TableHead>
            <TableHead className="w-[110px]">Data</TableHead>
            <TableHead>Mittente</TableHead>
            <TableHead>Destinatario</TableHead>
            {!compatto ? <TableHead>Spedizione</TableHead> : null}
            <TableHead className="text-right">Totale</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {moduli.map((m) => (
            <TableRow key={m.id} className="group">
              <TableCell className="font-mono text-sm font-semibold text-slate-900">
                <Link href={`/area-riservata/mos/${m.id}`} className="hover:text-primary">
                  {formatNumeroMos(m.numero)}
                </Link>
              </TableCell>
              <TableCell className="text-slate-600">{formatData(m.data)}</TableCell>
              <TableCell>
                <p className="font-medium text-slate-900">{nominativo({ nome: m.mitt_nome, cognome: m.mitt_cognome, ragione_sociale: m.mitt_ragione_sociale })}</p>
                {m.mitt_citta ? <p className="text-xs text-slate-500">{m.mitt_citta}</p> : null}
              </TableCell>
              <TableCell>
                <p className="font-medium text-slate-900">{nominativo({ nome: m.dest_nome, cognome: m.dest_cognome, ragione_sociale: m.dest_ragione_sociale })}</p>
                {m.dest_citta ? <p className="text-xs text-slate-500">{m.dest_citta}</p> : null}
              </TableCell>
              {!compatto ? (
                <TableCell>
                  {m.lettera_di_vettura ? (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-slate-400" />
                      <div className="leading-tight">
                        <p className="text-sm text-slate-900">{m.corriere || "—"}</p>
                        <p className="font-mono text-xs text-slate-500">{m.lettera_di_vettura}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Da spedire</span>
                  )}
                </TableCell>
              ) : null}
              <TableCell className="text-right font-semibold tabular-nums text-slate-900">{formatEuro(m.importo_totale)}</TableCell>
              <TableCell>
                <StatoBadge stato={m.stato} />
              </TableCell>
              <TableCell>
                <Link
                  href={`/area-riservata/mos/${m.id}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-primary group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Apri ${formatNumeroMos(m.numero)}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
