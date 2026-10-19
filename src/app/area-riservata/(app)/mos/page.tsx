import type { Metadata } from "next"
import Link from "next/link"
import { Archive, FilePlus2 } from "lucide-react"
import { requireProfilo } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { parseNumeroMos } from "@/lib/format"
import { isStatoMos } from "@/lib/mos/stati"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/area/page-header"
import { EmptyState } from "@/components/area/empty-state"
import { Paginazione } from "@/components/area/paginazione"
import { MosFiltri } from "@/components/area/mos/mos-filtri"
import { MOS_LISTA_SELECT, MosTable, type MosRiga } from "@/components/area/mos/mos-table"

export const metadata: Metadata = { title: "Archivio MOS" }

const PER_PAGINA = 25
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

type Params = { q?: string; stato?: string; da?: string; a?: string; page?: string }

export default async function ArchivioPage({ searchParams }: { searchParams: Promise<Params> }) {
  const [sp] = await Promise.all([searchParams, requireProfilo()])
  const q = (sp.q ?? "").trim()
  const stato = sp.stato && isStatoMos(sp.stato) ? sp.stato : ""
  const da = sp.da && DATA_RE.test(sp.da) ? sp.da : ""
  const a = sp.a && DATA_RE.test(sp.a) ? sp.a : ""
  const pagina = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1)

  const supabase = await createClient()
  let query = supabase.from("mos").select(MOS_LISTA_SELECT, { count: "exact" })

  if (q) {
    const numero = parseNumeroMos(q)
    if (numero !== null) {
      query = query.eq("numero", numero)
    } else {
      const termine = q.toLowerCase().replace(/[,%()"\\]/g, " ").replace(/\s+/g, " ").trim()
      const like = `%${termine}%`
      query = query.or(`ricerca.ilike.${like},lettera_di_vettura.ilike.${like}`)
    }
  }
  if (stato) query = query.eq("stato", stato)
  if (da) query = query.gte("data", da)
  if (a) query = query.lte("data", a)

  const { data, count, error } = await query.order("numero", { ascending: false }).range((pagina - 1) * PER_PAGINA, pagina * PER_PAGINA - 1)
  const moduli = (data ?? []) as MosRiga[]
  const totale = count ?? 0
  const filtriAttivi = Boolean(q || stato || da || a)

  return (
    <>
      <PageHeader
        titolo="Archivio MOS"
        descrizione="Tutti i moduli di spedizione. Cerca per nominativo, numero, codice di tracking o periodo."
        azioni={
          <Button asChild className="bg-primary text-white hover:bg-primary-600">
            <Link href="/area-riservata/mos/nuovo">
              <FilePlus2 className="h-4 w-4" /> Nuovo MOS
            </Link>
          </Button>
        }
      />

      <MosFiltri valori={{ q, stato, da, a }} />

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Errore nel caricamento: {error.message}
        </p>
      ) : null}

      <div className="mt-4">
        <p className="mb-2 text-sm text-slate-500">
          {totale === 0 ? "Nessun modulo" : totale === 1 ? "1 modulo" : `${totale} moduli`}
          {filtriAttivi ? " corrispondenti ai filtri" : " in archivio"}
        </p>
        {moduli.length > 0 ? (
          <MosTable moduli={moduli} />
        ) : (
          <EmptyState
            icon={Archive}
            titolo={filtriAttivi ? "Nessun risultato" : "L'archivio è vuoto"}
            descrizione={filtriAttivi ? "Prova con un altro nominativo, numero o intervallo di date." : "I moduli compilati compariranno qui."}
            azione={
              filtriAttivi ? (
                <Button asChild variant="outline">
                  <Link href="/area-riservata/mos">Azzera filtri</Link>
                </Button>
              ) : (
                <Button asChild className="bg-primary text-white hover:bg-primary-600">
                  <Link href="/area-riservata/mos/nuovo">
                    <FilePlus2 className="h-4 w-4" /> Compila il primo MOS
                  </Link>
                </Button>
              )
            }
          />
        )}
        <Paginazione pagina={pagina} totale={totale} perPagina={PER_PAGINA} basePath="/area-riservata/mos" params={{ q, stato, da, a }} />
      </div>
    </>
  )
}
