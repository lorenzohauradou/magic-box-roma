import { Skeleton } from "@/components/ui/skeleton"

/** Mostrato subito al cambio pagina (la sidebar resta): niente schermata ferma in attesa del server. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Caricamento">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-64 bg-slate-200" />
        <Skeleton className="h-4 w-96 max-w-full bg-slate-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="mt-8 space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-10 bg-slate-100" />
        ))}
      </div>
    </div>
  )
}
