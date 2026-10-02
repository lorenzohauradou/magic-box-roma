"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inviaCopia } from "@/app/area-riservata/(app)/mos/actions"

export function InviaCopiaDialog({ mosId, emailPredefinita, giaInviata }: { mosId: string; emailPredefinita: string; giaInviata: boolean }) {
  const router = useRouter()
  const [aperto, setAperto] = useState(false)
  const [email, setEmail] = useState(emailPredefinita)
  const [pending, startTransition] = useTransition()

  function invia(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await inviaCopia(mosId, email)
      if (!res.ok) {
        toast.error(res.errore)
        return
      }
      toast.success(res.messaggio ?? "Copia inviata")
      setAperto(false)
      // Primo invio: il modulo è completo e si torna all'archivio.
      // Reinvio di una copia già spedita: si resta sul modulo.
      if (!giaInviata) router.push("/area-riservata/mos")
      router.refresh()
    })
  }

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send className="h-4 w-4" /> {giaInviata ? "Reinvia copia" : "Invia copia via email"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={invia} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Invia copia del modulo</DialogTitle>
            <DialogDescription>Il PDF aggiornato verrà allegato all&apos;email. Puoi indicare un indirizzo diverso da quello del mittente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="email-copia">Indirizzo email</Label>
            <Input
              id="email-copia"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              placeholder="cliente@esempio.it"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAperto(false)} disabled={pending}>
              Annulla
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary-600" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {pending ? "Invio…" : "Invia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
