"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Check, ChevronsUpDown, Loader2, Search, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cercaClienti, type ClienteSuggerito } from "@/app/area-riservata/(app)/mos/actions"
import { cn } from "@/lib/utils"

export function ClienteCombobox({
  onSelectAction,
  selezionatoId,
  placeholder = "Cerca un cliente in archivio…",
  className,
}: {
  onSelectAction: (cliente: ClienteSuggerito) => void
  selezionatoId?: string | null
  placeholder?: string
  className?: string
}) {
  const [aperto, setAperto] = useState(false)
  const [query, setQuery] = useState("")
  const [risultati, setRisultati] = useState<ClienteSuggerito[]>([])
  const [pending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (query.trim().length < 2) {
      setRisultati([])
      return
    }
    timer.current = setTimeout(() => {
      startTransition(async () => {
        try {
          setRisultati(await cercaClienti(query))
        } catch {
          setRisultati([])
        }
      })
    }, 250)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query])

  return (
    <Popover open={aperto} onOpenChange={setAperto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={aperto}
          className={cn("h-11 w-full justify-between border-dashed border-primary/40 bg-primary/5 font-normal text-slate-600 hover:bg-primary/10", className)}
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            {placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Nome, cognome, ragione sociale, telefono…" value={query} onValueChange={setQuery} />
          <CommandList>
            {pending ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Ricerca…
              </div>
            ) : (
              <>
                <CommandEmpty>{query.trim().length < 2 ? "Digita almeno 2 caratteri" : "Nessun cliente trovato: compila i campi qui sotto."}</CommandEmpty>
                <CommandGroup>
                  {risultati.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.id}
                      onSelect={() => {
                        onSelectAction(c)
                        setAperto(false)
                        setQuery("")
                      }}
                      className="flex items-start gap-3 py-2.5"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{c.nominativo}</p>
                        <p className="truncate text-xs text-slate-500">
                          {[c.indirizzo, [c.cap, c.citta].filter(Boolean).join(" ")].filter(Boolean).join(" · ") || "Indirizzo non presente"}
                          {c.telefono ? ` · ${c.telefono}` : ""}
                        </p>
                      </div>
                      {selezionatoId === c.id ? <Check className="h-4 w-4 text-primary" /> : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}