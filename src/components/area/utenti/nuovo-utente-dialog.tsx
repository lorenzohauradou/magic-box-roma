"use client"

import { useActionState, useEffect, useState } from "react"
import { Loader2, UserPlus, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { creaUtente, type ActionState } from "@/app/area-riservata/(app)/utenti/actions"
import { generaPassword } from "./password-utils"

export function NuovoUtenteDialog() {
  const [aperto, setAperto] = useState(false)
  const [password, setPassword] = useState("")
  const [ruolo, setRuolo] = useState<"admin" | "operatore">("operatore")
  const [state, formAction, pending] = useActionState<ActionState, FormData>(creaUtente, {})

  useEffect(() => {
    if (state.ok) {
      toast.success(state.messaggio ?? "Utente creato")
      setAperto(false)
      setPassword("")
      setRuolo("operatore")
    }
  }, [state])

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-primary-600">
          <UserPlus className="h-4 w-4" /> Nuovo utente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={formAction} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Nuovo utente dello staff</DialogTitle>
            <DialogDescription>
              L&apos;utente potrà accedere subito con email e password. Non è prevista registrazione autonoma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome e cognome</Label>
            <Input id="nome" name="nome" required className="h-11" placeholder="Es. Maria Rossi" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="h-11" placeholder="maria@magicboxroma.it" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruolo">Ruolo</Label>
            <input type="hidden" name="ruolo" value={ruolo} />
            <Select value={ruolo} onValueChange={(v) => setRuolo(v as "admin" | "operatore")}>
              <SelectTrigger id="ruolo" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operatore">Operatore · compila e gestisce i moduli</SelectItem>
                <SelectItem value="admin">Amministratore · gestisce anche gli utenti</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password iniziale</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                name="password"
                type="text"
                required
                minLength={8}
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 font-mono"
                placeholder="Almeno 8 caratteri"
              />
              <Button type="button" variant="outline" className="h-11 shrink-0" onClick={() => setPassword(generaPassword())}>
                <Wand2 className="h-4 w-4" /> Genera
              </Button>
            </div>
            <p className="text-xs text-slate-500">Comunica la password all&apos;operatore. Potrà essere reimpostata in qualsiasi momento.</p>
          </div>

          {state.errore ? (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.errore}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAperto(false)}>
              Annulla
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary-600" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Crea utente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
