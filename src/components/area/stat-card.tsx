import type React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  valore,
  icon: Icon,
  hint,
  href,
  tono = "default",
  className,
}: {
  label: string
  valore: React.ReactNode
  icon: LucideIcon
  hint?: React.ReactNode
  href?: string
  tono?: "default" | "primary" | "warning" | "success"
  className?: string
}) {
  const toni = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-primary/10 text-primary",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700",
  }
  const contenuto = (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow",
        href && "hover:shadow-md",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">{valore}</p>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </div>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toni[tono])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  )
  return href ? <Link href={href}>{contenuto}</Link> : contenuto
}
