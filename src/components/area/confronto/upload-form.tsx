"use client"

import { useActionState, useRef, useState } from "react"
import { FileSpreadsheet, Loader2, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { caricaConfronto, type UploadState } from "@/app/area-riservata/(app)/confronto/actions"

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export function UploadForm() {
  const [state, formAction, pending] = useActionState<UploadState, FormData>(caricaConfronto, {})
  const [file, setFile] = useState<File | null>(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f && inputRef.current) {
      const dt = new DataTransfer()
      dt.items.add(f)
      inputRef.current.files = dt.files
      setFile(f)
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          drag ? "border-primary bg-primary/5" : "border-slate-300 bg-slate-50 hover:border-primary/60 hover:bg-primary/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept=".csv,.txt,.xlsx,.xlsm,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
        {file ? (
          <>
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">Trascina qui il file di Poste o clicca per sceglierlo</p>
            <p className="text-xs text-slate-500">CSV (separatore «;») oppure Excel .xlsx · max 20 MB</p>
          </>
        )}
      </label>

      {file ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
          onClick={() => {
            setFile(null)
            if (inputRef.current) inputRef.current.value = ""
          }}
        >
          <X className="h-3.5 w-3.5" /> Rimuovi file
        </button>
      ) : null}

      {state.errore ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.errore}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="h-11 w-full bg-primary text-white hover:bg-primary-600" disabled={pending || !file}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
        {pending ? "Analisi in corso…" : "Avvia il confronto"}
      </Button>
    </form>
  )
}
