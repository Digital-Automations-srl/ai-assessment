-- Migration: assessment_capture
-- Approvata dallo sponsor. Da applicare nel SQL editor di Supabase (l'ambiente
-- di sviluppo non raggiunge il DB). Idempotente: usa IF NOT EXISTS / DROP NOT NULL.
--
-- Obiettivo: cattura affidabile e completa degli assessment.
--   B) storicizzazione delle 30 risposte complete del quiz
--   C) cattura anonima pre-form con linking via token di sessione effimero
--   + persistenza del consenso al submit del form
--   + colonne PII rese nullable (il record anonimo NON contiene PII)

-- ── B — storicizza le 30 risposte complete del quiz ────────────────────────
-- (vale solo per i nuovi assessment; lo storico non si ricostruisce)
alter table public.submissions
  add column if not exists quiz_answers jsonb;

-- ── C — cattura anonima + linking ──────────────────────────────────────────
-- submission_token: uuid effimero generato dal client (vita = sessione), usato
--   per collegare il record anonimo creato allo step "results" al lead inviato
--   col form. NON e' un identificatore persistente (no cookie/fingerprint).
-- status: 'anonymous' alla creazione (track-result) → 'completed' al submit form.
--   DEFAULT 'completed' perche' le righe storiche gia' presenti sono tutti lead
--   completi: il backfill le marca correttamente. I nuovi record anonimi
--   impostano 'anonymous' esplicitamente lato server.
-- completed_at: valorizzato solo quando il lead invia il form.
alter table public.submissions
  add column if not exists submission_token text,
  add column if not exists status text not null default 'completed',
  add column if not exists completed_at timestamptz;

-- Unicita' del token (consente piu' NULL: le righe storiche non hanno token).
create unique index if not exists submissions_submission_token_key
  on public.submissions (submission_token);

-- ── Consenso persistito al submit del form (intervento C: "dati PII + consenso")
-- Le righe storiche restano NULL (consenso non tracciato a posteriori).
alter table public.submissions
  add column if not exists consenso boolean,
  add column if not exists consenso_marketing boolean;

-- ── PRIVACY (vincolante) — il record anonimo non contiene PII ───────────────
-- Le colonne PII devono poter restare NULL nei record anonimi.
alter table public.submissions
  alter column nome drop not null,
  alter column cognome drop not null,
  alter column email drop not null,
  alter column azienda drop not null;
