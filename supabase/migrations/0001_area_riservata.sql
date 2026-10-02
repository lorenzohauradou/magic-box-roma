-- =====================================================================
--  Magic Box Roma · Area riservata
--  Schema iniziale: profili staff, clienti, moduli MOS, confronti Poste
--  Da eseguire nel SQL Editor di Supabase (una sola volta).
-- =====================================================================

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
--  Funzioni di utilità
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
--  Profili dello staff (estende auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profili (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  nome        text not null default '',
  ruolo       text not null default 'operatore' check (ruolo in ('admin', 'operatore')),
  attivo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profili_updated_at
  before update on public.profili
  for each row execute function public.set_updated_at();

-- Alla creazione di un utente in Auth viene creato automaticamente il profilo.
-- Nome e ruolo vengono letti dai metadati passati dall'amministratore.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profili (id, email, nome, ruolo)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    case when new.raw_user_meta_data ->> 'ruolo' = 'admin' then 'admin' else 'operatore' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper per le policy (security definer: evita ricorsione sulle RLS di profili)
create or replace function public.is_staff_attivo()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profili where id = auth.uid() and attivo);
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profili where id = auth.uid() and attivo and ruolo = 'admin');
$$;

alter table public.profili enable row level security;

create policy "profili: lettura per lo staff"
  on public.profili for select to authenticated
  using (id = auth.uid() or public.is_staff_attivo());

-- Inserimenti/modifiche dei profili avvengono solo dal server con la chiave service_role
-- (azioni riservate all'amministratore).

-- ---------------------------------------------------------------------
--  Clienti (anagrafica riutilizzabile per mittenti e destinatari)
-- ---------------------------------------------------------------------
create table if not exists public.clienti (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null default '',
  cognome          text not null default '',
  ragione_sociale  text not null default '',
  partita_iva      text not null default '',
  codice_sdi       text not null default '',
  indirizzo        text not null default '',
  cap              text not null default '',
  citta            text not null default '',
  provincia        text not null default '',
  stato            text not null default 'Italia',
  telefono         text not null default '',
  email            text not null default '',
  nominativo       text generated always as (
                     btrim(regexp_replace(nome || ' ' || cognome || ' ' || ragione_sociale, '\s+', ' ', 'g'))
                   ) stored,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists clienti_nominativo_trgm on public.clienti using gin (nominativo gin_trgm_ops);
create index if not exists clienti_updated_idx on public.clienti (updated_at desc);

create trigger clienti_updated_at
  before update on public.clienti
  for each row execute function public.set_updated_at();

alter table public.clienti enable row level security;

create policy "clienti: staff attivo"
  on public.clienti for all to authenticated
  using (public.is_staff_attivo())
  with check (public.is_staff_attivo());

-- ---------------------------------------------------------------------
--  Moduli MOS
-- ---------------------------------------------------------------------
create sequence if not exists public.mos_numero_seq;

create table if not exists public.mos (
  id                     uuid primary key default gen_random_uuid(),
  numero                 integer not null unique default nextval('public.mos_numero_seq'),
  data                   date not null default current_date,
  stato                  text not null default 'bozza'
                         check (stato in ('bozza', 'stampato', 'spedito', 'copia_inviata')),

  -- Cliente mittente
  mitt_cliente_id        uuid references public.clienti (id) on delete set null,
  mitt_nome              text not null default '',
  mitt_cognome           text not null default '',
  mitt_ragione_sociale   text not null default '',
  mitt_partita_iva       text not null default '',
  mitt_sdi               text not null default '',
  mitt_indirizzo         text not null default '',
  mitt_cap               text not null default '',
  mitt_citta             text not null default '',
  mitt_provincia         text not null default '',
  mitt_stato             text not null default 'Italia',
  mitt_telefono          text not null default '',
  mitt_email             text not null default '',

  -- Destinatario
  dest_cliente_id        uuid references public.clienti (id) on delete set null,
  dest_ragione_sociale   text not null default '',
  dest_nome              text not null default '',
  dest_cognome           text not null default '',
  dest_indirizzo         text not null default '',
  dest_cap               text not null default '',
  dest_citta             text not null default '',
  dest_provincia         text not null default '',
  dest_stato             text not null default 'Italia',
  dest_telefono          text not null default '',
  dest_email             text not null default '',
  dest_note_consegna     text not null default '',

  -- Dati della spedizione
  contenuto              text not null default '',
  n_colli                integer not null default 1 check (n_colli >= 1),
  peso_kg                numeric(10,2) not null default 0,
  misure                 text not null default '',
  tipo_servizio          text not null default 'standard'
                         check (tipo_servizio in ('standard', 'express', 'roma_su_roma')),
  imballato_dal_cliente  boolean not null default false,

  -- Servizi accessori e valore
  contrassegno_attivo    boolean not null default false,
  contrassegno_valore    numeric(10,2) not null default 0,
  contrassegno_contanti  boolean not null default false,
  assicurazione_attiva   boolean not null default false,
  assicurazione_valore   numeric(10,2) not null default 0,

  -- Importi (specifiche)
  importo_spedizione     numeric(10,2) not null default 0,
  importo_contrassegno   numeric(10,2) not null default 0,
  importo_assicurazione  numeric(10,2) not null default 0,
  importo_spese_suppl    numeric(10,2) not null default 0,
  importo_totale         numeric(10,2) generated always as (
                           importo_spedizione + importo_contrassegno + importo_assicurazione + importo_spese_suppl
                         ) stored,

  -- Fase 2: spedizione avvenuta
  corriere               text not null default '',
  lettera_di_vettura     text not null default '',
  data_spedizione        date,

  -- Firma, stampa, invio copia
  firma_png              text,
  firmato_il             timestamptz,
  stampato_il            timestamptz,
  copia_inviata_a        text,
  copia_inviata_il       timestamptz,

  note                   text not null default '',

  -- Colonna di ricerca per nominativo (mittente + destinatario)
  ricerca                text generated always as (
                           lower(mitt_nome || ' ' || mitt_cognome || ' ' || mitt_ragione_sociale || ' ' ||
                                 dest_nome || ' ' || dest_cognome || ' ' || dest_ragione_sociale)
                         ) stored,

  created_by             uuid references public.profili (id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists mos_ricerca_trgm on public.mos using gin (ricerca gin_trgm_ops);
create index if not exists mos_ldv_idx on public.mos (upper(lettera_di_vettura));
create index if not exists mos_data_idx on public.mos (data desc, numero desc);
create index if not exists mos_stato_idx on public.mos (stato);
create index if not exists mos_data_spedizione_idx on public.mos (data_spedizione);

create trigger mos_updated_at
  before update on public.mos
  for each row execute function public.set_updated_at();

alter table public.mos enable row level security;

create policy "mos: staff attivo"
  on public.mos for all to authenticated
  using (public.is_staff_attivo())
  with check (public.is_staff_attivo());

-- ---------------------------------------------------------------------
--  Confronti con i file di Poste (storico)
-- ---------------------------------------------------------------------
create table if not exists public.confronti (
  id                      uuid primary key default gen_random_uuid(),
  nome_file               text not null,
  file_path               text,
  numero_fattura          text not null default '',
  data_fattura            date,
  periodo_da              date,
  periodo_a               date,
  righe_totali            integer not null default 0,
  righe_abbinate          integer not null default 0,
  moduli_non_addebitati   integer not null default 0,
  anomalie_totali         integer not null default 0,
  anomalie_rilevanti      integer not null default 0,
  totale_costi            numeric(12,2) not null default 0,
  totale_incassi          numeric(12,2) not null default 0,
  risultato               jsonb not null default '{}'::jsonb,
  created_by              uuid references public.profili (id) on delete set null,
  created_at              timestamptz not null default now()
);

create index if not exists confronti_created_idx on public.confronti (created_at desc);

alter table public.confronti enable row level security;

create policy "confronti: staff attivo"
  on public.confronti for all to authenticated
  using (public.is_staff_attivo())
  with check (public.is_staff_attivo());

-- ---------------------------------------------------------------------
--  Permessi di base per i ruoli dell'API (le RLS sopra restano il vero filtro)
--  Senza questi grant le query rispondono "permission denied for table ...".
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
--  Storage: bucket privato per i file caricati di Poste
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('poste-files', 'poste-files', false, 20971520)
on conflict (id) do nothing;

create policy "poste-files: staff attivo"
  on storage.objects for all to authenticated
  using (bucket_id = 'poste-files' and public.is_staff_attivo())
  with check (bucket_id = 'poste-files' and public.is_staff_attivo());
