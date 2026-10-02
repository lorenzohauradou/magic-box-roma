# Area riservata Magic Box · guida tecnica

Gestionale del modulo MOS e confronto con le fatture di Poste, integrato nel sito Next.js.
Percorso: `https://www.magicboxroma.it/area-riservata` (non indicizzato, escluso da `robots.txt`).

## Architettura in breve

| Componente | Tecnologia | Note |
| --- | --- | --- |
| Interfaccia | Next.js 15 (App Router) in `src/app/area-riservata` | Layout separato dal sito pubblico (`src/app/(site)`) |
| Autenticazione | Supabase Auth (email + password) | Nessuna registrazione libera: gli utenti li crea l'admin |
| Base dati e file | Supabase Postgres + Storage (regione UE) | Schema in `supabase/migrations/0001_area_riservata.sql`, RLS attive |
| PDF del modulo | `@react-pdf/renderer` lato server | `src/lib/mos/pdf.tsx`, fedele al cartaceo, firma inclusa |
| Firma su tablet | `signature_pad` | PNG salvato nel record del modulo |
| Email | Resend | Copia del modulo in allegato, `src/lib/mos/email.ts` |
| Confronto Poste | Motore puro in `src/lib/poste/` | Test con `npm test` |
| Export Excel | `exceljs` | `src/lib/poste/excel.ts` |

## Messa in funzione (una tantum)

### 1. Progetto Supabase
1. Crea un progetto su [supabase.com](https://supabase.com) scegliendo una **regione europea** (es. Frankfurt).
2. In **Authentication → Providers → Email** lascia attivo *Email*, e **disattiva "Allow new users to sign up"**
   (gli account li crea solo l'amministratore dall'area riservata).
3. In **SQL Editor** incolla ed esegui per intero `supabase/migrations/0001_area_riservata.sql`.
   Crea tabelle (`profili`, `clienti`, `mos`, `confronti`), policy RLS, trigger e il bucket privato `poste-files`.

### 2. Variabili d'ambiente
Copia `.env.example` in `.env.local` (in locale) e imposta le stesse variabili su Vercel (Project → Settings → Environment Variables):

| Variabile | Dove trovarla |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (**solo server, mai nel browser**) |
| `RESEND_API_KEY` | già presente per il form contatti |
| `EMAIL_MITTENTE` | es. `Magic Box Roma <info@magicboxroma.it>` (dominio verificato su Resend) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.magicboxroma.it` |

### 3. Primo amministratore
Con `.env.local` compilato:

```bash
node --env-file=.env.local scripts/crea-admin.mjs --email lorenzooradu@gmail.com --nome "Lorenzo" --password "UnaPasswordSicura!"
```

Da quel momento si entra su `/area-riservata/login` e gli altri operatori si creano dalla pagina **Utenti**.
Lo script è idempotente: rilanciato sullo stesso indirizzo aggiorna password e ruolo.

### 4. Avvio
```bash
npm install
npm run dev        # http://localhost:3000/area-riservata
npm run typecheck  # controllo tipi
npm test           # test del motore di confronto
npm run build
```

## Struttura del codice

```
src/
  middleware.ts                       protezione di /area-riservata/* (sessione Supabase)
  lib/
    auth.ts                           requireProfilo / requireAdmin
    supabase/{server,admin,middleware,env}.ts
    format.ts                         euro, date, numero MOS
    mos/  schema.ts (zod + calcolo totale) · stati.ts · pdf.tsx · email.ts · tracking.ts · condizioni.ts
    poste/ parse.ts (CSV/Excel) · confronto.ts (motore) · excel.ts (export) · confronto.test.ts
  app/
    (site)/                           sito pubblico (navbar + footer)
    area-riservata/
      login/ · logout/ · layout.tsx
      (app)/                          shell autenticata con sidebar
        page.tsx                      dashboard
        mos/  page (archivio) · nuovo · [id] (dettaglio) · [id]/modifica · [id]/pdf (route) · actions.ts
        confronto/  page (upload + storico) · [id] (risultato) · [id]/excel (route) · actions.ts
        utenti/  page · actions.ts    (solo admin)
  components/area/                    shell, header, tabelle, dialog (firma, spedizione, email…)
supabase/migrations/                  schema SQL
scripts/crea-admin.mjs                bootstrap primo admin
```

## Flusso operativo

1. **Nuovo MOS** (al banco): digitando il nominativo si scelgono i clienti già in archivio; il totale si calcola da solo;
   al salvataggio viene assegnato il numero progressivo (`MOS-00001`, …) e l'anagrafica clienti si aggiorna.
2. **Stampa / PDF** apre il modulo fedele al cartaceo; **Firma su tablet** acquisisce la firma e la inserisce nel PDF.
   Entrambe portano lo stato a *Stampato / firmato*.
3. **Registra spedizione** (pacco partito): corriere + lettera di vettura + data → stato *Spedito*.
   Se il mittente ha un'email, la copia aggiornata parte automaticamente (stato *Copia inviata*).
   **Invia copia** permette di reinviarla in qualsiasi momento, anche a un indirizzo diverso.
4. **Duplica** precompila un nuovo modulo da uno esistente (si cambia il destinatario e si salva come nuovo MOS).
5. **Archivio**: ricerca per nominativo, numero, tracking; filtro per stato e intervallo di date.
6. **Confronto Poste**: si carica il CSV mensile; ogni riga viene abbinata per lettera di vettura
   (in subordine per riferimento `MOS-xxxxx` nel campo `NUM_RIF_SPED`). Risultato con anomalie ordinate per impatto
   economico, riepilogo del mese ed export Excel. Lo storico resta consultabile.

### Stati del modulo
`bozza` → `stampato` (stampa o firma) → `spedito` (corriere + LDV) → `copia_inviata` (email al cliente).

## Confronto Poste: regole applicate

Tracciato atteso: file «FATTURATO» esportato dal portale Poste, separatore `;`, prima riga con i nomi colonna
(`LDV`, `NUM_RIF_SPED`, `SERVIZIO`, `PESO_*`, `IMPORTO_*`, `WEIGHT_RANGE`, `DATA_PART`, …). Sono accettati anche `.xlsx`.

Unità osservate nel file di esempio (agosto 2026) e assunte dal parser:
- pesi in **grammi** → convertiti in kg (riconoscimento automatico: se la mediana è < 200 si assume già in kg);
- `IMPORTO_*` in **euro** al netto di IVA (la lettera d'incarico parla di centesimi: nel file reale sono euro,
  es. `IMPORTO_TOTALE 4.71` per la fascia 0-2 kg; **da confermare con il cliente nella sessione di allineamento**);
- `VALORE_CONTRASSEGNO` in **centesimi** (3600.00 = 36,00 €);
- date `YYYYMMDD`.

Anomalie rilevate (in ordine di priorità per impatto economico):

| Tipo | Quando | Impatto stimato |
| --- | --- | --- |
| Addebito senza modulo | LDV in fattura assente dall'archivio | importo della riga |
| Riga duplicata | stessa LDV ripetuta (servizio standard) | importo della riga |
| Servizio extra | righe «Addebito Servizi Vari» o servizio non standard | importo della riga |
| Classe di peso | fascia Poste superiore a quella del peso sul modulo | tariffa addebitata − tariffa tipica della fascia del modulo (dedotta dal file) |
| Addebito aggiuntivo | supplementi (giacenza, località disagiata, riconsegna…) non giustificati dal modulo; contrassegno e copertura sono attesi se previsti sul MOS | somma dei supplementi |
| Costo superiore all'incasso | totale Poste > totale incassato dal cliente | differenza |
| Modulo non addebitato | MOS spedito con Poste/SDA nel periodo della fattura ma assente | informativa |
| Numero colli / Data | scostamenti informativi (data oltre 5 giorni) | informativa |

Soglia di rilevanza: 1,00 € (`sogliaRilevante` in `eseguiConfronto`).

## Da confermare con il cliente
- Unità degli importi nel file Poste (vedi sopra) e colonne che considerano rilevanti.
- Se nel portale Poste inseriranno il numero MOS come riferimento spedizione (abilita l'abbinamento di riserva).
- Modello definitivo del modulo cartaceo (il PDF replica il file `MOS-Nuovologo.pdf` ricevuto).
- Indirizzo mittente delle email e testo del messaggio al cliente.

## Sicurezza
- Le pagine dell'area sono protette dal middleware e da `requireProfilo()` in ogni pagina/azione; le route PDF/Excel
  verificano la sessione prima di generare i file.
- Le RLS Postgres consentono l'accesso ai dati solo a utenti con profilo **attivo**; un utente disattivato viene
  espulso al primo accesso (`ban` in Auth + `attivo=false`).
- La chiave `service_role` è usata solo nelle azioni admin di gestione utenti, mai nel client.
