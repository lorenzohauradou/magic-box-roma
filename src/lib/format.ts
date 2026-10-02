const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" })
const numero2 = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatEuro(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : value
  if (n === null || n === undefined || Number.isNaN(n)) return "—"
  return euro.format(n)
}

export function formatNumero(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  if (decimals === 2) return numero2.format(value)
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: decimals }).format(value)
}

/** "2026-07-08" → "08/07/2026" */
export function formatData(value: string | Date | null | undefined) {
  if (!value) return "—"
  const d = typeof value === "string" ? new Date(value.length === 10 ? `${value}T00:00:00` : value) : value
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatDataOra(value: string | Date | null | undefined) {
  if (!value) return "—"
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Data odierna in formato ISO (YYYY-MM-DD), fuso locale. */
export function oggiIso() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Numero progressivo del modulo: 42 → "MOS-00042" */
export function formatNumeroMos(numero: number) {
  return `MOS-${String(numero).padStart(5, "0")}`
}

/** Riconosce "42", "#42", "MOS-00042", "mos 42" → 42. Altrimenti null. */
export function parseNumeroMos(input: string): number | null {
  const m = input.trim().match(/^(?:mos)?[\s#-]*0*(\d{1,7})$/i)
  return m ? Number(m[1]) : null
}

export function nominativo(parts: { nome?: string | null; cognome?: string | null; ragione_sociale?: string | null }) {
  const persona = [parts.nome, parts.cognome].filter(Boolean).join(" ").trim()
  const rs = (parts.ragione_sociale ?? "").trim()
  if (persona && rs) return `${persona} · ${rs}`
  return persona || rs || "—"
}

export function pluralize(n: number, singolare: string, plurale: string) {
  return n === 1 ? singolare : plurale
}
