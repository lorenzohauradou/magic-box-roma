import { cn } from "@/lib/utils"
import { STATI } from "@/lib/mos/stati"
import type { StatoMos } from "@/types/database"

export function StatoBadge({ stato, className }: { stato: StatoMos; className?: string }) {
  const info = STATI[stato] ?? STATI.bozza
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        info.classe,
        className,
      )}
      title={info.descrizione}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", info.dot)} />
      {info.label}
    </span>
  )
}
