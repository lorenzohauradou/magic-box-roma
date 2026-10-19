"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, Download, Loader2, MoreHorizontal, Pencil, Printer, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Mos, Ruolo } from "@/types/database"
import { eliminaMos, segnaStampato } from "@/app/area-riservata/(app)/mos/actions"
import { FirmaDialog } from "./firma-dialog"
import { InviaCopiaDialog } from "./invia-copia-dialog"
import { SpedizioneDialog } from "./spedizione-dialog"

/** Solo i campi usati dalle azioni: la firma (PNG in base64) non viene serializzata verso il browser. */
export type MosAzioniDati = Pick<
  Mos,
  "id" | "stato" | "corriere" | "lettera_di_vettura" | "data_spedizione" | "mitt_email" | "copia_inviata_a" | "copia_inviata_il"
> & { firmata: boolean }

export function MosAzioni({ mos, ruolo }: { mos: MosAzioniDati; ruolo: Ruolo }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const pdfUrl = `/area-riservata/mos/${mos.id}/pdf`
  const puoEliminare = mos.stato === "bozza" || ruolo === "admin"

  // Le azioni chiamano revalidatePath: la risposta contiene già la pagina aggiornata, router.refresh() la rigenererebbe due volte.
  function stampa() {
    // La stampa avviene nel browser (finestra PDF); qui registriamo solo lo stato.
    startTransition(async () => {
      const res = await segnaStampato(mos.id)
      if (!res.ok) toast.error(res.errore)
    })
  }

  function elimina() {
    startTransition(async () => {
      const res = await eliminaMos(mos.id)
      if (!res.ok) {
        toast.error(res.errore)
        return
      }
      toast.success(res.messaggio ?? "Modulo eliminato")
      router.push("/area-riservata/mos")
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" onClick={stampa}>
        <a href={pdfUrl} target="_blank" rel="noopener">
          <Printer className="h-4 w-4" /> Stampa / PDF
        </a>
      </Button>
      <FirmaDialog mosId={mos.id} firmata={mos.firmata} />
      <SpedizioneDialog
        mosId={mos.id}
        corriere={mos.corriere}
        letteraDiVettura={mos.lettera_di_vettura}
        dataSpedizione={mos.data_spedizione}
        emailMittente={mos.mitt_email}
      />
      <InviaCopiaDialog mosId={mos.id} emailPredefinita={mos.copia_inviata_a || mos.mitt_email} giaInviata={Boolean(mos.copia_inviata_il)} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Altre azioni" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/area-riservata/mos/${mos.id}/modifica`}>
              <Pencil className="h-4 w-4" /> Modifica dati
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/area-riservata/mos/nuovo?da=${mos.id}`}>
              <Copy className="h-4 w-4" /> Duplica per nuovo destinatario
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`${pdfUrl}?download=1`}>
              <Download className="h-4 w-4" /> Scarica PDF
            </a>
          </DropdownMenuItem>
          {puoEliminare ? (
            <>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4" /> Elimina modulo
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminare il modulo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Il modulo verrà rimosso dall&apos;archivio in modo definitivo. Il numero progressivo non verrà riassegnato.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={elimina}>
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
