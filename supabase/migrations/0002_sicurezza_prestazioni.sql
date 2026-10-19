-- =====================================================================
--  Magic Box Roma · Area riservata
--  0002: sicurezza e prestazioni
--  Da eseguire nel SQL Editor di Supabase dopo la 0001 (si può rieseguire).
-- =====================================================================

-- ---------------------------------------------------------------------
--  Sicurezza: chi si registra da solo non ottiene alcun accesso.
--  I metadati li sceglie chi si registra, quindi il ruolo non si legge più da lì:
--  ruolo e attivazione li imposta l'amministratore (azioni con service_role, che fanno upsert).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profili (id, email, nome, ruolo, attivo)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    'operatore',
    false
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- I visitatori non autenticati non hanno motivo di accedere alle tabelle (le RLS restano comunque attive).
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- ---------------------------------------------------------------------
--  Policy RLS. "(select …)" fa valutare la funzione una sola volta per query
--  (initPlan) invece che per ogni riga letta: conteggi e liste molto più veloci.
-- ---------------------------------------------------------------------
drop policy if exists "profili: lettura per lo staff" on public.profili;
create policy "profili: lettura per lo staff"
  on public.profili for select to authenticated
  using (id = (select auth.uid()) or (select public.is_staff_attivo()));

drop policy if exists "clienti: staff attivo" on public.clienti;
create policy "clienti: staff attivo"
  on public.clienti for all to authenticated
  using ((select public.is_staff_attivo()))
  with check ((select public.is_staff_attivo()));

-- Moduli: eliminare un modulo non più in bozza resta riservato agli amministratori
-- anche chiamando direttamente l'API di Supabase, non solo dall'interfaccia.
drop policy if exists "mos: staff attivo" on public.mos;
drop policy if exists "mos: lettura staff" on public.mos;
drop policy if exists "mos: inserimento staff" on public.mos;
drop policy if exists "mos: modifica staff" on public.mos;
drop policy if exists "mos: eliminazione bozze o admin" on public.mos;

create policy "mos: lettura staff"
  on public.mos for select to authenticated
  using ((select public.is_staff_attivo()));

create policy "mos: inserimento staff"
  on public.mos for insert to authenticated
  with check ((select public.is_staff_attivo()));

create policy "mos: modifica staff"
  on public.mos for update to authenticated
  using ((select public.is_staff_attivo()))
  with check ((select public.is_staff_attivo()));

create policy "mos: eliminazione bozze o admin"
  on public.mos for delete to authenticated
  using ((select public.is_admin()) or (stato = 'bozza' and (select public.is_staff_attivo())));

drop policy if exists "confronti: staff attivo" on public.confronti;
create policy "confronti: staff attivo"
  on public.confronti for all to authenticated
  using ((select public.is_staff_attivo()))
  with check ((select public.is_staff_attivo()));

drop policy if exists "poste-files: staff attivo" on storage.objects;
create policy "poste-files: staff attivo"
  on storage.objects for all to authenticated
  using (bucket_id = 'poste-files' and (select public.is_staff_attivo()))
  with check (bucket_id = 'poste-files' and (select public.is_staff_attivo()));

-- ---------------------------------------------------------------------
--  Indici
-- ---------------------------------------------------------------------
-- Confronto Poste: abbinamento esatto per lettera di vettura (salvata già in maiuscolo).
create index if not exists mos_ldv_eq_idx on public.mos (lettera_di_vettura);
-- Archivio: ricerca "contiene" sul codice di tracking.
create index if not exists mos_ldv_trgm on public.mos using gin (lettera_di_vettura gin_trgm_ops);
-- L'indice su upper(lettera_di_vettura) non è usato da nessuna query: rallenta solo le scritture.
drop index if exists public.mos_ldv_idx;
