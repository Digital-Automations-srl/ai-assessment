-- Migration: SEC-2 — rimozione della policy RLS insert-anonimo "always true"
-- Da applicare a mano nel SQL editor di Supabase (l'ambiente dev non raggiunge
-- il DB). NON automatica: e' un hardening di sicurezza, da eseguire dopo aver
-- verificato lo stato delle policy in produzione (vedi STEP 1).
--
-- ── Perche' e' sicuro (verifica fatta sul codice, 2026-05-29) ───────────────
-- TUTTE le scritture su `submissions` passano dal client server-only
-- `supabaseAdmin` (SUPABASE_SECRET_KEY), che BYPASSA la RLS:
--   • src/app/api/send-report/route.ts  → .update()/.insert()
--   • src/app/api/track-result/route.ts → .upsert()
-- Il client anon/publishable (`src/lib/supabase.ts`) NON ha alcun importer in
-- `src/` (grep: 0 occorrenze) → nessun path client scrive con la anon key.
-- Quindi la policy "insert anonimo always-true" non serve a nulla e va rimossa:
-- con RLS attiva e nessuna insert-policy, gli insert via anon key sono negati,
-- mentre il server (secret key) continua a scrivere indisturbato.

-- ── STEP 1 (ISPEZIONE, opzionale) — guarda le policy attuali ────────────────
-- Esegui da solo per vedere i nomi reali prima del drop:
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where schemaname = 'public' and tablename = 'submissions';

-- ── STEP 2 — rimuovi le policy INSERT permissive su public.submissions ──────
-- La policy fu creata a mano dallo sponsor (non da una migrazione), quindi il
-- nome non e' noto a priori: questo blocco rimuove TUTTE le policy con comando
-- INSERT sulla tabella, qualunque sia il nome. Idempotente.
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'submissions'
      and cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on public.submissions', pol.policyname);
    raise notice 'SEC-2: dropped INSERT policy % on public.submissions', pol.policyname;
  end loop;
end $$;

-- Nota: la RLS resta ABILITATA su public.submissions (non disattivarla). Dopo
-- questo drop, l'avviso "RLS Policy Always True" sparisce e gli insert via anon
-- key risultano negati. Le letture della dashboard usano comunque la secret key.
