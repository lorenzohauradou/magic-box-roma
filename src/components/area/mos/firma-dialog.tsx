"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import SignaturePad from "signature_pad"
import { Check, Eraser, Loader2, PenLine, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DICHIARAZIONE_FIRMA } from "@/lib/mos/condizioni"
import { rimuoviFirma, salvaFirma } from "@/app/area-riservata/(app)/mos/actions"

export function FirmaDialog({ mosId, firmata }: { mosId: string; firmata: boolean }) {
  const router = useRouter()
  const [aperto, setAperto] = useState(false)
  const [vuota, setVuota] = useState(true)
  const [pending, startTransition] = useTransition()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    if (!aperto) return
    let pad: SignaturePad | null = null
    let ro: ResizeObserver | null = null

    // Il canvas viene montato dopo l'animazione di apertura: attendiamo un frame.
    const raf = requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ridimensiona = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        const dati = pad?.toData()
        canvas.width = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio
        canvas.getContext("2d")?.scale(ratio, ratio)
        pad?.clear()
        if (dati && dati.length) pad?.fromData(dati)
      }
      pad = new SignaturePad(canvas, { minWidth: 1, maxWidth: 2.6, penColor: "#111827", throttle: 8 })
      pad.addEventListener("endStroke", () => setVuota(pad?.isEmpty() ?? true))
      padRef.current = pad
      ridimensiona()
      ro = new ResizeObserver(ridimensiona)
      ro.observe(canvas)
    })

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      pad?.off()
      padRef.current = null
      setVuota(true)
    }
  }, [aperto])

  function conferma() {
    const pad = padRef.current
    if (!pad || pad.isEmpty()) {
      toast.error("Il cliente deve firmare prima di confermare.")
      return
    }
    const png = pad.toDataURL("image/png")
    startTransition(async () => {
      const res = await salvaFirma(mosId, png)
      if (!res.ok) {
        toast.error(res.errore)
        return
      }
      toast.success(res.messaggio ?? "Firma salvata")
      setAperto(false)
      router.refresh()
    })
  }

  function rimuovi() {
    if (!confirm("Rimuovere la firma acquisita? Il cliente dovrà firmare di nuovo.")) return
    startTransition(async () => {
      const res = await rimuoviFirma(mosId)
      if (!res.ok) toast.error(res.errore)
      else {
        toast.success(res.messaggio ?? "Firma rimossa")
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={aperto} onOpenChange={setAperto}>
      <DialogTrigger asChild>
        <Button variant={firmata ? "outline" : "default"} className={firmata ? "" : "bg-secondary text-white hover:bg-secondary-600"}>
          {firmata ? <Check className="h-4 w-4 text-emerald-600" /> : <PenLine className="h-4 w-4" />}
          {firmata ? "Firmato · rifirma" : "Firma su tablet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Firma del cliente</DialogTitle>
          <DialogDescription>Passa il tablet al cliente: la firma verrà inserita nel PDF del modulo.</DialogDescription>
        </DialogHeader>

        <p className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">{DICHIARAZIONE_FIRMA}</p>

        <div className="relative">
          <canvas
            ref={canvasRef}
            className="h-64 w-full touch-none rounded-lg border-2 border-dashed border-slate-300 bg-white sm:h-72"
            aria-label="Area per la firma"
          />
          {vuota ? (
            <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-slate-300">Firma qui</p>
          ) : null}
          <div className="pointer-events-none absolute inset-x-8 bottom-10 border-b border-slate-200" />
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                padRef.current?.clear()
                setVuota(true)
              }}
              disabled={pending}
            >
              <Eraser className="h-4 w-4" /> Cancella
            </Button>
            {firmata ? (
              <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700" onClick={rimuovi} disabled={pending}>
                <Trash2 className="h-4 w-4" /> Rimuovi firma salvata
              </Button>
            ) : null}
          </div>
          <Button type="button" size="lg" className="h-11 bg-primary text-white hover:bg-primary-600" onClick={conferma} disabled={pending || vuota}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Conferma firma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
