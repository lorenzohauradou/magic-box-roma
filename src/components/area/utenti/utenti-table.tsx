"use client"

import { useState, useTransition } from "react"
import { KeyRound, Loader2, MoreHorizontal, ShieldCheck, ShieldOff, UserCheck, UserX, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatData } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Profilo } from "@/types/database"
import { impostaAttivo, impostaRuolo, reimpostaPassword, type ActionState } from "@/app/area-riservata/(app)/utenti/actions"
import { generaPassword } from "./password-utils"

export function UtentiTable({ utenti, mioId }: { utenti: Profilo[]; mioId: string }) {
  const [pending, startTransition] = useTransition()
  const [inCorso, setInCorso] = useState<string | null>(null)
  const [passwordPer, setPasswordPer] = useState<Profilo | null>(null)
  const [nuovaPassword, setNuovaPassword] = useState("")

  function esegui(id: string, fn: () => Promise<ActionState>) {
    setInCorso(id)
    startTransition(async () => {
      const res = await fn()
      setInCorso(null)
      if (res.errore) toast.error(res.errore)
      else toast.success(res.messaggio ?? "Fatto")
    })
  }

  function salvaPassword() {
    if (!passwordPer) return
    const id = passwordPer.id
    esegui(id, async () => {
      const res = await reimpostaPassword(id, nuovaPassword)
      if (res.ok) {
        setPasswordPer(null)
        setNuovaPassword("")
      }
      return res
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead>Utente</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Creato il</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {utenti.map((u) => {
              const isMe = u.id === mioId
              const occupato = pending && inCorso === u.id
              return (
                <TableRow key={u.id} className={cn(!u.attivo && "opacity-60")}>
                  <TableCell>
                    <p className="font-medium text-slate-900">
                      {u.nome || "—"} {isMe ? <span className="ml-1 text-xs font-normal text-slate-400">(tu)</span> : null}
                    </p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    {u.ruolo === "admin" ? (
                      <Badge className="bg-secondary text-white hover:bg-secondary">Amministratore</Badge>
                    ) : (
                      <Badge variant="outline">Operatore</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.attivo ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Attivo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Disattivato
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">{formatData(u.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={occupato} aria-label="Azioni">
                          {occupato ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onSelect={() => {
                            setPasswordPer(u)
                            setNuovaPassword(generaPassword())
                          }}
                        >
                          <KeyRound className="h-4 w-4" /> Reimposta password
                        </DropdownMenuItem>
                        {!isMe ? (
                          <>
                            <DropdownMenuSeparator />
                            {u.ruolo === "admin" ? (
                              <DropdownMenuItem onSelect={() => esegui(u.id, () => impostaRuolo(u.id, "operatore"))}>
                                <ShieldOff className="h-4 w-4" /> Rendi operatore
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => esegui(u.id, () => impostaRuolo(u.id, "admin"))}>
                                <ShieldCheck className="h-4 w-4" /> Rendi amministratore
                              </DropdownMenuItem>
                            )}
                            {u.attivo ? (
                              <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={() => esegui(u.id, () => impostaAttivo(u.id, false))}>
                                <UserX className="h-4 w-4" /> Disattiva accesso
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => esegui(u.id, () => impostaAttivo(u.id, true))}>
                                <UserCheck className="h-4 w-4" /> Riattiva accesso
                              </DropdownMenuItem>
                            )}
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={passwordPer !== null} onOpenChange={(o) => !o && setPasswordPer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reimposta password</DialogTitle>
            <DialogDescription>
              Nuova password per <strong>{passwordPer?.nome || passwordPer?.email}</strong>. Quella attuale smetterà di funzionare.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="nuova-password">Nuova password</Label>
            <div className="flex gap-2">
              <Input
                id="nuova-password"
                value={nuovaPassword}
                onChange={(e) => setNuovaPassword(e.target.value)}
                className="h-11 font-mono"
                minLength={8}
                autoComplete="off"
              />
              <Button type="button" variant="outline" className="h-11 shrink-0" onClick={() => setNuovaPassword(generaPassword())}>
                <Wand2 className="h-4 w-4" /> Genera
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasswordPer(null)}>
              Annulla
            </Button>
            <Button className="bg-primary text-white hover:bg-primary-600" onClick={salvaPassword} disabled={pending || nuovaPassword.length < 8}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Salva password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
