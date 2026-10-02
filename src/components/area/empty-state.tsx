import type React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  titolo,
  descrizione,
  azione,
  className,
}: {
  icon: LucideIcon
  titolo: string
  descrizione?: React.ReactNode
  azione?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{titolo}</h3>
      {descrizione ? <p className="mt-1 max-w-md text-sm text-slate-500">{descrizione}</p> : null}
      {azione ? <div className="mt-5">{azione}</div> : null}
    </div>
  )
}
