"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
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
import { eliminaConfronto } from "@/app/area-riservata/(app)/confronto/actions"

export function EliminaConfrontoButton({ id, redirectDopo, compatto = false }: { id: string; redirectDopo?: string; compatto?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function elimina() {
    startTransition(async () => {
      const res = await eliminaConfronto(id)
      if (!res.ok) {
        toast.error(res.errore ?? "Eliminazione non riuscita")
        return
      }
      toast.success("Confronto eliminato")
      if (redirectDopo) router.push(redirectDopo)
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {compatto ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" aria-label="Elimina confronto" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        ) : (
          <Button variant="outline" className="text-red-600 hover:text-red-700" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Elimina
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminare questo confronto?</AlertDialogTitle>
          <AlertDialogDescription>Verranno rimossi il risultato e il file caricato. I moduli MOS non vengono toccati.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={elimina}>
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
