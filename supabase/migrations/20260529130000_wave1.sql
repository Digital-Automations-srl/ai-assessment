-- Migration: Wave 1 (consolidata) — approvata dallo sponsor 2026-05-29.
-- Da applicare a mano nel SQL editor di Supabase (l'ambiente dev non raggiunge
-- il DB). Idempotente (IF NOT EXISTS). Raggruppa tre interventi della Wave 1:
--   • SEC-3  → tabella admin_audit (log accessi/azioni della dashboard admin)
--   • DATA-1 → colonne utm_* su submissions (attribuzione sorgente lead)
--   • DATA-2 → colonna behavior (jsonb) su submissions (segnali comportamentali)

-- ── SEC-3 — audit log accessi/azioni dashboard admin ────────────────────────
-- Scritta solo dal server via secret key (bypassa RLS). Eventi: access,
-- login_success, login_failed, logout, export. Nessun PII di lead: solo
-- metadati di accesso admin (path, metodo, IP/UA dello staff, dettaglio jsonb).
create table if not exists public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  outcome text,
  path text,
  method text,
  ip text,
  user_agent text,
  detail jsonb
);

create index if not exists admin_audit_created_at_idx
  on public.admin_audit (created_at desc);

-- RLS abilitata SENZA policy: l'accesso e' esclusivamente server-side via secret
-- key (che bypassa la RLS). Anon/publishable key → nessun accesso.
alter table public.admin_audit enable row level security;

-- ── DATA-1 — attribuzione sorgente del lead (UTM) ───────────────────────────
-- Catturati dai query param del primo accesso (?utm_source=...). Storici → NULL.
alter table public.submissions
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text;

-- ── DATA-2 — segnali comportamentali del quiz ───────────────────────────────
-- jsonb non-PII: tempo totale, n. risposte "Non so", n. skip, back-click, ecc.
-- Usato come tie-break del lead tier (lead-scoring.ts). Storici → NULL.
alter table public.submissions
  add column if not exists behavior jsonb;
