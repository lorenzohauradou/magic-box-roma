"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Ruolo } from "@/types/database"
import { AreaLogo } from "./logo"
import { isNavActive, navPerRuolo } from "./nav-config"

export interface UtenteShell {
  nome: string
  email: string
  ruolo: Ruolo
}

function iniziali(nome: string, email: string) {
  const base = nome.trim() || email
  const parti = base.split(/[\s@._-]+/).filter(Boolean)
  return parti
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function NavLinks({ ruolo, pathname, onNavigate }: { ruolo: Ruolo; pathname: string; onNavigate?: () => void }) {
  const gruppi = navPerRuolo(ruolo)
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {gruppi.map((gruppo) => (
        <div key={gruppo.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/35">{gruppo.label}</p>
          <ul className="space-y-1">
            {gruppo.items.map((item) => {
              const attivo = isNavActive(pathname, item)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={attivo ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      attivo
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function UserCard({ utente }: { utente: UtenteShell }) {
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
          {iniziali(utente.nome, utente.email)}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-white">{utente.nome || utente.email}</p>
          <p className="truncate text-xs text-white/50">{utente.ruolo === "admin" ? "Amministratore" : "Operatore"}</p>
        </div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <form action="/area-riservata/logout" method="post">
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Esci"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </TooltipTrigger>
            <TooltipContent side="top">Esci</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export function AppShell({ utente, children }: { utente: UtenteShell; children: React.ReactNode }) {
  const pathname = usePathname()
  const [aperto, setAperto] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-secondary-900 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <AreaLogo />
        </div>
        <NavLinks ruolo={utente.ruolo} pathname={pathname} />
        <UserCard utente={utente} />
      </aside>

      {/* Header mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Sheet open={aperto} onOpenChange={setAperto}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Apri menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col bg-secondary-900 p-0 text-white [&>button]:text-white">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-16 items-center border-b border-white/10 px-5">
              <AreaLogo />
            </div>
            <NavLinks ruolo={utente.ruolo} pathname={pathname} onNavigate={() => setAperto(false)} />
            <UserCard utente={utente} />
          </SheetContent>
        </Sheet>
        <AreaLogo dark={false} />
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  )
}
