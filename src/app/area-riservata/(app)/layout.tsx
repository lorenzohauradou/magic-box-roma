import type React from "react"
import { requireProfilo } from "@/lib/auth"
import { AppShell } from "@/components/area/app-shell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profilo = await requireProfilo()
  return (
    <AppShell utente={{ nome: profilo.nome, email: profilo.email, ruolo: profilo.ruolo }}>
      {children}
    </AppShell>
  )
}
