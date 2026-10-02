"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { oggiIso } from "@/lib/format"
import { CORRIERI } from "@/lib/mos/schema"
import { registraSpedizione } from "@/app/area-riservata/(app)/mos/actions"

export function SpedizioneDialog({
  mosId,
  corriere,
  letteraDiVettura,
  dataSpedizione,
  emailMittente,
}: {
  mosId: string
  corriere: string
  letteraDiVettura: string
  dataSpedizione: string | null
  emailMittente: string
}) {
  const router = useRouter()
  const giaSpedito = Boolean(letteraDiVettura)
  const corriereNoto = (CORRIERI as readonly string[]).includes(corriere)
  const [aperto, setAperto] = useState(false)
  const [sel, setSel] = useState(corriere ? (corriereNoto ? corriere : "Altro") : "Poste Italiane")
  const [altro, setAltro] = useState(corriere && !corriereNoto ? corriere : "")
  const [ldv, setLdv] = useState(letteraDiVettura)
  const [data, setData] = useState(dataSpedizione ?? oggiIso())
  const [errori, setErrori] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function invia(e: React.FormEvent) {
    e.preventDefault()
    setErrori({})
    const corriereFinale = sel === "Altro" ? altro.trim() : sel
    startTransition(async () => {
      const res = await registraSpedizione(mosId, { corriere: corriereFinale, lettera_di_vettura: ldv, data_spedizione: data })
      if (!res.ok) {
        setErrori(res.campi ?? {})
        toast.error(res.errore)
        return
      }
      toast.success("Spedizione registrata")
      setAperto(false)

      if (res.dati.emailInviata) {
        // Il modulo è completo: si torna all'archivio, pronti per il prossimo cliente.
        toast.success(`Copia aggiornata inviata a ${res.dati.emailA}`)
        router.push("/area-riservata/mos")
      } else {
        // Manca ancora la copia al cliente: si resta sul modulo per inviarla.
        if (res.dati.emailErrore) toast.warning(`Copia non inviata: ${res.dati.emailErrore}`)
        else toast.info("Nessuna email del mittente: invia la copia manualmente.")
      }
      router.refresh()
    })
  }

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button className={giaSpedito ? "" : "bg-primary text-white hover:bg-primary-600"} variant={giaSpedito ? "outline" : "default"}>
          <Truck className="h-4 w-4" />
          {giaSpedito ? "Modifica spedizione" : "Registra spedizione"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={invia} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{giaSpedito ? "Modifica dati di spedizione" : "Il pacco è partito"}</DialogTitle>
            <DialogDescription>
              Inserisci corriere e lettera di vettura.{" "}
              {emailMittente ? (
                <>
                  La copia aggiornata verrà inviata automaticamente a <strong>{emailMittente}</strong>.
                </>
              ) : (
                "Il mittente non ha un'email: potrai inviare la copia in seguito."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="corriere">Corriere</Label>
            <Select value={sel} onValueChange={setSel}>
              <SelectTrigger id="corriere" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CORRIERI.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sel === "Altro" ? (
              <Input value={altro} onChange={(e) => setAltro(e.target.value)} placeholder="Nome del corriere" className="h-11" required />
            ) : null}
            {errori.corriere ? <p className="text-xs text-red-600">{errori.corriere}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ldv">Lettera di vettura / codice tracking</Label>
            <Input
              id="ldv"
              value={ldv}
              onChange={(e) => setLdv(e.target.value.toUpperCase())}
              placeholder="Es. 3UW0ZCW001492"
              className="h-11 font-mono uppercase"
              autoComplete="off"
              required
            />
            {errori.lettera_di_vettura ? <p className="text-xs text-red-600">{errori.lettera_di_vettura}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_spedizione">Data di spedizione</Label>
            <Input id="data_spedizione" type="date" value={data} onChange={(e) => setData(e.target.value)} className="h-11" required />
            {errori.data_spedizione ? <p className="text-xs text-red-600">{errori.data_spedizione}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAperto(false)} disabled={pending}>
              Annulla
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary-600" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              {pending ? "Salvataggio…" : "Conferma spedizione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
