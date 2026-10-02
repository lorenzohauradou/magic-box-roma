import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Briciola {
  label: string
  href?: string
}

export function PageHeader({
  titolo,
  descrizione,
  briciole,
  azioni,
  className,
}: {
  titolo: React.ReactNode
  descrizione?: React.ReactNode
  briciole?: Briciola[]
  azioni?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {briciole && briciole.length > 0 ? (
          <nav aria-label="Percorso" className="mb-1.5 flex flex-wrap items-center gap-1 text-xs text-slate-500">
            {briciole.map((b, i) => (
              <span key={`${b.label}-${i}`} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="h-3 w-3 text-slate-300" /> : null}
                {b.href ? (
                  <Link href={b.href} className="hover:text-primary">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-slate-700">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{titolo}</h1>
        {descrizione ? <p className="mt-1 text-sm text-slate-500">{descrizione}</p> : null}
      </div>
      {azioni ? <div className="flex shrink-0 flex-wrap items-center gap-2">{azioni}</div> : null}
    </div>
  )
}
