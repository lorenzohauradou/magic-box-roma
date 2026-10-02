import Link from "next/link"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ORDINE_STATI, STATI } from "@/lib/mos/stati"

export interface FiltriMos {
  q?: string
  stato?: string
  da?: string
  a?: string
}

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

/** Form GET: funziona anche senza JavaScript e mantiene i filtri nell'URL (condivisibili). */
export function MosFiltri({ valori }: { valori: FiltriMos }) {
  const attivi = Boolean(valori.q || valori.stato || valori.da || valori.a)
  return (
    <form method="get" action="/area-riservata/mos" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-12">
      <div className="relative md:col-span-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          name="q"
          defaultValue={valori.q ?? ""}
          placeholder="Nominativo, numero MOS o codice di tracking"
          className="h-11 pl-9"
          autoComplete="off"
        />
      </div>
      <div className="md:col-span-2">
        <select name="stato" defaultValue={valori.stato ?? ""} className={selectClass} aria-label="Stato">
          <option value="">Tutti gli stati</option>
          {ORDINE_STATI.map((s) => (
            <option key={s} value={s}>
              {STATI[s].label}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <Input name="da" type="date" defaultValue={valori.da ?? ""} className="h-11" aria-label="Dal" />
      </div>
      <div className="md:col-span-2">
        <Input name="a" type="date" defaultValue={valori.a ?? ""} className="h-11" aria-label="Al" />
      </div>
      <div className="flex gap-2 md:col-span-1">
        <Button type="submit" className="h-11 flex-1 bg-secondary text-white hover:bg-secondary-600">
          Cerca
        </Button>
        {attivi ? (
          <Button asChild type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Azzera filtri">
            <Link href="/area-riservata/mos">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </form>
  )
}
