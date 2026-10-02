export type Ruolo = "admin" | "operatore"

export interface Profilo {
  id: string
  email: string
  nome: string
  ruolo: Ruolo
  attivo: boolean
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  nome: string
  cognome: string
  ragione_sociale: string
  partita_iva: string
  codice_sdi: string
  indirizzo: string
  cap: string
  citta: string
  provincia: string
  stato: string
  telefono: string
  email: string
  nominativo: string
  created_at: string
  updated_at: string
}

export type StatoMos = "bozza" | "stampato" | "spedito" | "copia_inviata"
export type TipoServizio = "standard" | "express" | "roma_su_roma"

export interface Mos {
  id: string
  numero: number
  data: string
  stato: StatoMos

  mitt_cliente_id: string | null
  mitt_nome: string
  mitt_cognome: string
  mitt_ragione_sociale: string
  mitt_partita_iva: string
  mitt_sdi: string
  mitt_indirizzo: string
  mitt_cap: string
  mitt_citta: string
  mitt_provincia: string
  mitt_stato: string
  mitt_telefono: string
  mitt_email: string

  dest_cliente_id: string | null
  dest_ragione_sociale: string
  dest_nome: string
  dest_cognome: string
  dest_indirizzo: string
  dest_cap: string
  dest_citta: string
  dest_provincia: string
  dest_stato: string
  dest_telefono: string
  dest_email: string
  dest_note_consegna: string

  contenuto: string
  n_colli: number
  peso_kg: number
  misure: string
  tipo_servizio: TipoServizio
  imballato_dal_cliente: boolean
  contrassegno_attivo: boolean
  contrassegno_valore: number
  contrassegno_contanti: boolean
  assicurazione_attiva: boolean
  assicurazione_valore: number
  importo_spedizione: number
  importo_contrassegno: number
  importo_assicurazione: number
  importo_spese_suppl: number
  importo_totale: number

  corriere: string
  lettera_di_vettura: string
  data_spedizione: string | null

  firma_png: string | null
  firmato_il: string | null
  stampato_il: string | null
  copia_inviata_a: string | null
  copia_inviata_il: string | null
  note: string

  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ConfrontoRecord {
  id: string
  nome_file: string
  file_path: string | null
  numero_fattura: string
  data_fattura: string | null
  periodo_da: string | null
  periodo_a: string | null
  righe_totali: number
  righe_abbinate: number
  moduli_non_addebitati: number
  anomalie_totali: number
  anomalie_rilevanti: number
  totale_costi: number
  totale_incassi: number
  risultato: unknown
  created_by: string | null
  created_at: string
}
