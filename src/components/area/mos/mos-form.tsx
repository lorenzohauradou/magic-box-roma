"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, FormProvider, useForm, useFormContext, useWatch, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, Link2Off, Loader2, Save, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatEuro, formatNumeroMos } from "@/lib/format"
import { calcolaTotale, mosSchema, TIPI_SERVIZIO, type MosFormValues } from "@/lib/mos/schema"
import { salvaMos, type ClienteSuggerito } from "@/app/area-riservata/(app)/mos/actions"
import { ClienteCombobox } from "./cliente-combobox"

type Nome = FieldPath<MosFormValues>

// ---------------------------------------------------------------------
//  Elementi di layout
// ---------------------------------------------------------------------
function Sezione({ titolo, sottotitolo, children, azione }: { titolo: string; sottotitolo?: string; children: React.ReactNode; azione?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="border-l-4 border-primary pl-3">
          <h2 className="text-base font-bold text-slate-900">{titolo}</h2>
          {sottotitolo ? <p className="text-xs text-slate-500">{sottotitolo}</p> : null}
        </div>
        {azione ? <div className="sm:w-80">{azione}</div> : null}
      </header>
      <div className="grid gap-4 p-5 sm:grid-cols-6">{children}</div>
    </section>
  )
}

function Campo({
  name,
  label,
  className,
  hint,
  children,
}: {
  name: Nome
  label: string
  className?: string
  hint?: string
  children: React.ReactNode
}) {
  const {
    formState: { errors },
  } = useFormContext<MosFormValues>()
  const errore = (errors as Record<string, { message?: string } | undefined>)[name]?.message
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </Label>
      {children}
      {errore ? (
        <p className="text-xs font-medium text-red-600">{errore}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

function Testo({ name, label, className, hint, ...props }: { name: Nome; label: string; className?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<MosFormValues>()
  const invalido = Boolean((errors as Record<string, unknown>)[name])
  return (
    <Campo name={name} label={label} className={className} hint={hint}>
      <Input id={name} aria-invalid={invalido} className={cn("h-11", invalido && "border-red-400 focus-visible:ring-red-400")} {...register(name)} {...props} />
    </Campo>
  )
}

function Importo({ name, label, className, hint }: { name: Nome; label: string; className?: string; hint?: string }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<MosFormValues>()
  const invalido = Boolean((errors as Record<string, unknown>)[name])
  return (
    <Campo name={name} label={label} className={className} hint={hint}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">€</span>
        <Input
          id={name}
          type="number"
          step="0.01"
          min={0}
          inputMode="decimal"
          aria-invalid={invalido}
          className={cn("h-11 pl-8 text-right tabular-nums", invalido && "border-red-400")}
          onFocus={(e) => e.currentTarget.select()}
          {...register(name)}
        />
      </div>
    </Campo>
  )
}

// ---------------------------------------------------------------------
//  Sezioni anagrafiche (mittente / destinatario)
// ---------------------------------------------------------------------
function Anagrafica({ prefisso }: { prefisso: "mitt" | "dest" }) {
  const { setValue, control } = useFormContext<MosFormValues>()
  const isMitt = prefisso === "mitt"
  const clienteId = useWatch({ control, name: isMitt ? "mitt_cliente_id" : "dest_cliente_id" })
  const stato = useWatch({ control, name: isMitt ? "mitt_stato" : "dest_stato" })
  const italia = !stato || stato.trim().toLowerCase() === "italia"
  const f = (k: string) => `${prefisso}_${k}` as Nome

  function applicaCliente(c: ClienteSuggerito) {
    const set = (k: string, v: string | null) => setValue(f(k), v as never, { shouldDirty: true, shouldValidate: false })
    set("cliente_id", c.id)
    set("nome", c.nome)
    set("cognome", c.cognome)
    set("ragione_sociale", c.ragione_sociale)
    if (isMitt) {
      set("partita_iva", c.partita_iva)
      set("sdi", c.codice_sdi)
    }
    set("indirizzo", c.indirizzo)
    set("cap", c.cap)
    set("citta", c.citta)
    set("provincia", c.provincia)
    set("stato", c.stato || "Italia")
    set("telefono", c.telefono)
    set("email", c.email)
    toast.success(`Dati di ${c.nominativo} inseriti`)
  }

  return (
    <Sezione
      titolo={isMitt ? "Cliente mittente" : "Destinatario"}
      sottotitolo={isMitt ? "Chi consegna il pacco al banco. L'email serve per inviare la copia del modulo." : "A chi va consegnato il pacco."}
      azione={<ClienteCombobox onSelectAction={applicaCliente} selezionatoId={clienteId} />}
    >
      {clienteId ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-slate-600 sm:col-span-6">
          <span>
            Dati presi dall&apos;archivio clienti. <span className="hidden sm:inline">Le modifiche che fai qui aggiornano anche la scheda del cliente.</span>
          </span>
          <button type="button" className="inline-flex items-center gap-1 font-medium text-primary hover:underline" onClick={() => setValue(f("cliente_id"), null as never, { shouldDirty: true })}>
            <Link2Off className="h-3.5 w-3.5" /> Scollega
          </button>
        </div>
      ) : null}

      {!isMitt ? <Testo name={f("ragione_sociale")} label="Ragione sociale" className="sm:col-span-6" autoComplete="off" /> : null}
      <Testo name={f("nome")} label="Nome" className="sm:col-span-3" autoComplete="off" />
      <Testo name={f("cognome")} label="Cognome" className="sm:col-span-3" autoComplete="off" />
      {isMitt ? (
        <>
          <Testo name={f("ragione_sociale")} label="Ragione sociale" className="sm:col-span-3" autoComplete="off" />
          <Testo name={f("partita_iva")} label="Partita IVA" className="sm:col-span-2" inputMode="numeric" autoComplete="off" />
          <Testo name={f("sdi")} label="Codice SDI" className="sm:col-span-1" autoComplete="off" maxLength={7} />
        </>
      ) : null}
      <Testo name={f("indirizzo")} label="Indirizzo" className="sm:col-span-6" placeholder="Via, numero civico" autoComplete="off" />
      <Testo name={f("cap")} label="CAP" className="sm:col-span-1" inputMode="numeric" maxLength={italia ? 5 : 10} autoComplete="off" />
      <Testo name={f("citta")} label="Città" className="sm:col-span-3" autoComplete="off" />
      <Testo name={f("provincia")} label="Prov." className="sm:col-span-1" maxLength={2} autoComplete="off" style={{ textTransform: "uppercase" }} />
      <Testo name={f("stato")} label="Stato" className="sm:col-span-1" autoComplete="off" />
      <Testo name={f("telefono")} label="Telefono" className="sm:col-span-2" type="tel" inputMode="tel" autoComplete="off" />
      <Testo name={f("email")} label="E-mail" className="sm:col-span-4" type="email" inputMode="email" autoComplete="off" />
      {!isMitt ? <Testo name="dest_note_consegna" label="Note per la consegna" className="sm:col-span-6" placeholder="Es. citofono, orari, piano…" autoComplete="off" /> : null}
    </Sezione>
  )
}

// ---------------------------------------------------------------------
//  Dati della spedizione
// ---------------------------------------------------------------------
function TipoServizio() {
  const { control } = useFormContext<MosFormValues>()
  return (
    <Controller
      control={control}
      name="tipo_servizio"
      render={({ field }) => (
        <div role="radiogroup" aria-label="Tipo di servizio" className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
          {TIPI_SERVIZIO.map((t) => {
            const attivo = field.value === t.value
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={attivo}
                onClick={() => field.onChange(t.value)}
                className={cn(
                  "h-9 rounded-md text-sm font-medium transition-colors",
                  attivo ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      )}
    />
  )
}

function Interruttore({ name, label, descrizione }: { name: Nome; label: string; descrizione?: string }) {
  const { control } = useFormContext<MosFormValues>()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5">
          <span>
            <span className="block text-sm font-medium text-slate-900">{label}</span>
            {descrizione ? <span className="block text-xs text-slate-500">{descrizione}</span> : null}
          </span>
          <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
        </label>
      )}
    />
  )
}

function Spedizione() {
  const { control } = useFormContext<MosFormValues>()
  const contrassegno = useWatch({ control, name: "contrassegno_attivo" })
  const assicurazione = useWatch({ control, name: "assicurazione_attiva" })

  return (
    <Sezione titolo="Dati della spedizione" sottotitolo="Contenuto, colli, peso e servizi accessori richiesti dal cliente.">
      <Testo name="data" label="Data" className="sm:col-span-2" type="date" />
      <Testo name="contenuto" label="Contenuto" className="sm:col-span-4" placeholder="Es. abbigliamento, documenti, oggetti fragili" autoComplete="off" />
      <Testo name="n_colli" label="N. colli" className="sm:col-span-2" type="number" min={1} step={1} inputMode="numeric" />
      <Testo name="peso_kg" label="Peso (kg)" className="sm:col-span-2" type="number" min={0} step="0.01" inputMode="decimal" placeholder="0,00" />
      <Testo name="misure" label="Misure (cm)" className="sm:col-span-2" placeholder="Es. 40 × 30 × 20" autoComplete="off" />

      <div className="space-y-1.5 sm:col-span-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Tipo di servizio</Label>
        <TipoServizio />
      </div>
      <div className="sm:col-span-3">
        <Interruttore name="imballato_dal_cliente" label="Imballato dal cliente" descrizione="Il pacco arriva già chiuso: Magic Box non risponde del contenuto." />
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 p-4 sm:col-span-3">
        <Interruttore name="contrassegno_attivo" label="Contrassegno" descrizione="Il corriere incassa alla consegna." />
        {contrassegno ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Importo name="contrassegno_valore" label="Valore da incassare" />
            <Controller
              control={control}
              name="contrassegno_contanti"
              render={({ field }) => (
                <label className="flex items-center gap-2 self-end pb-3 text-sm text-slate-700">
                  <Checkbox checked={Boolean(field.value)} onCheckedChange={(v) => field.onChange(v === true)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  Pagamento in contanti
                </label>
              )}
            />
          </div>
        ) : null}
      </div>
      <div className="space-y-3 rounded-lg border border-slate-200 p-4 sm:col-span-3">
        <Interruttore name="assicurazione_attiva" label="Assicurazione" descrizione="Copertura sul valore dichiarato." />
        {assicurazione ? <Importo name="assicurazione_valore" label="Valore da assicurare" /> : null}
      </div>
    </Sezione>
  )
}

// ---------------------------------------------------------------------
//  Importi
// ---------------------------------------------------------------------
function useTotale() {
  const { control } = useFormContext<MosFormValues>()
  const valori = useWatch({ control, name: ["importo_spedizione", "importo_contrassegno", "importo_assicurazione", "importo_spese_suppl"] })
  return useMemo(
    () =>
      calcolaTotale({
        importo_spedizione: valori[0] ?? 0,
        importo_contrassegno: valori[1] ?? 0,
        importo_assicurazione: valori[2] ?? 0,
        importo_spese_suppl: valori[3] ?? 0,
      }),
    [valori],
  )
}

function Importi() {
  const totale = useTotale()
  return (
    <Sezione titolo="Specifiche e importi" sottotitolo="Il totale viene calcolato automaticamente.">
      <Importo name="importo_spedizione" label="Spedizione" className="sm:col-span-3 lg:col-span-1" />
      <Importo name="importo_contrassegno" label="Contrassegno" className="sm:col-span-3 lg:col-span-1" hint="Costo del servizio" />
      <Importo name="importo_assicurazione" label="Assicurazione" className="sm:col-span-3 lg:col-span-1" />
      <Importo name="importo_spese_suppl" label="Spese suppl." className="sm:col-span-3 lg:col-span-1" />
      <div className="flex items-center justify-between rounded-lg bg-secondary px-5 py-4 text-white sm:col-span-6 lg:col-span-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-white/70">Importo totale</span>
        <span className="text-2xl font-bold tabular-nums">{formatEuro(totale)}</span>
      </div>
      <Campo name="note" label="Note interne" className="sm:col-span-6" hint="Non compaiono sul modulo stampato.">
        <NoteTextarea />
      </Campo>
    </Sezione>
  )
}

function NoteTextarea() {
  const { register } = useFormContext<MosFormValues>()
  return <Textarea id="note" rows={2} {...register("note")} />
}

// ---------------------------------------------------------------------
//  Form completo
// ---------------------------------------------------------------------
export function MosForm({
  id,
  valoriIniziali,
  duplicatoDa,
}: {
  id?: string
  valoriIniziali: MosFormValues
  duplicatoDa?: { id: string; numero: number }
}) {
  const router = useRouter()
  const form = useForm<MosFormValues>({
    resolver: zodResolver(mosSchema),
    defaultValues: valoriIniziali,
    mode: "onBlur",
  })
  const [salvataggio, setSalvataggio] = useState(false)
  const totale = calcolaTotale(form.watch())
  const ultimoSubmit = useRef(0)
  const { submitCount, errors } = form.formState

  useEffect(() => {
    // Dopo un tentativo di salvataggio porta l'utente sul primo campo con errore
    if (submitCount === ultimoSubmit.current) return
    ultimoSubmit.current = submitCount
    const errori = Object.keys(errors)
    if (errori.length > 0) {
      const el = document.getElementById(errori[0])
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      el?.focus()
    }
  }, [submitCount, errors])

  async function onSubmit(values: MosFormValues) {
    setSalvataggio(true)
    try {
      const res = await salvaMos(values, id)
      if (!res.ok) {
        if (res.campi) {
          for (const [k, msg] of Object.entries(res.campi)) form.setError(k as Nome, { message: msg })
          const primo = document.getElementById(Object.keys(res.campi)[0])
          primo?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        toast.error(res.errore)
        return
      }
      toast.success(res.messaggio ?? "Modulo salvato")
      router.push(`/area-riservata/mos/${res.dati.id}`)
      router.refresh()
    } finally {
      setSalvataggio(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-28" noValidate>
        {duplicatoDa ? (
          <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-slate-700">
            <Copy className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Modulo precompilato da <strong>{formatNumeroMos(duplicatoDa.numero)}</strong>. Modifica il destinatario (o gli altri dati) e salva: verrà
              registrato come nuovo MOS con un nuovo numero.
            </p>
          </div>
        ) : null}

        <Anagrafica prefisso="mitt" />
        <Anagrafica prefisso="dest" />
        <Spedizione />
        <Importi />

        {/* Barra azioni fissa (comoda su tablet) */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-wide text-slate-500">Totale</p>
              <p className="text-xl font-bold tabular-nums text-slate-900">{formatEuro(totale)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={salvataggio}>
                <X className="h-4 w-4" /> Annulla
              </Button>
              <Button type="submit" size="lg" className="h-11 bg-primary px-6 text-white hover:bg-primary-600" disabled={salvataggio}>
                {salvataggio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {id ? "Salva modifiche" : "Registra modulo"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
