import type { StatoMos } from "@/types/database"

export interface StatoInfo {
  label: string
  descrizione: string
  /** Classi Tailwind del badge */
  classe: string
  /** Classi del pallino/indicatore */
  dot: string
}

export const STATI: Record<StatoMos, StatoInfo> = {
  bozza: {
    label: "Bozza",
    descrizione: "Compilato, non ancora stampato o firmato",
    classe: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  stampato: {
    label: "Stampato / firmato",
    descrizione: "Modulo stampato o firmato dal cliente, in attesa di spedizione",
    classe: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  spedito: {
    label: "Spedito",
    descrizione: "Corriere e lettera di vettura registrati",
    classe: "bg-sky-50 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
  },
  copia_inviata: {
    label: "Copia inviata",
    descrizione: "Copia aggiornata inviata via email al cliente",
    classe: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
}

export const ORDINE_STATI: StatoMos[] = ["bozza", "stampato", "spedito", "copia_inviata"]

export function isStatoMos(value: string): value is StatoMos {
  return (ORDINE_STATI as string[]).includes(value)
}
