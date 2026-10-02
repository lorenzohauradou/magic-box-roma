import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Paginazione({
  pagina,
  totale,
  perPagina,
  basePath,
  params,
}: {
  pagina: number
  totale: number
  perPagina: number
  basePath: string
  params: Record<string, string | undefined>
}) {
  const pagine = Math.max(1, Math.ceil(totale / perPagina))
  if (pagine <= 1) return null

  const href = (p: number) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v)
    sp.set("page", String(p))
    return `${basePath}?${sp.toString()}`
  }
  const da = (pagina - 1) * perPagina + 1
  const a = Math.min(pagina * perPagina, totale)
  const linkClass = (disabled: boolean) =>
    cn(
      "inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50",
      disabled && "pointer-events-none opacity-40",
    )

  return (
    <nav className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500" aria-label="Paginazione">
      <p>
        {da}–{a} di {totale}
      </p>
      <div className="flex items-center gap-2">
        <Link href={href(pagina - 1)} className={linkClass(pagina <= 1)} aria-disabled={pagina <= 1}>
          <ChevronLeft className="h-4 w-4" /> Precedente
        </Link>
        <span className="px-1">
          Pagina {pagina} di {pagine}
        </span>
        <Link href={href(pagina + 1)} className={linkClass(pagina >= pagine)} aria-disabled={pagina >= pagine}>
          Successiva <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  )
}
