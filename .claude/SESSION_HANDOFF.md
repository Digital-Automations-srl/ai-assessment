# Session Handoff — AI Readiness Assessment

> Aggiornato: 2026-05-29
> Leggi all'avvio di una **sessione PM**. Ruolo PM: pianifica, coordina, verifica quality gate. **NON modificare codice applicativo.**
> Storico decisioni: `LOG.md`. Specs: `docs/specs/`. Co-produzione: `.claude/rules/coproduzione.md` (v1.9).

## Stato progetto
- **Repo**: github `Digital-Automations-srl/ai-assessment` (branch `main`). **Deploy**: Vercel auto da `main` → `aiassessment.digitalautomations.it`
- **Stack**: Next.js 16, React 19, TS, Tailwind 4. Email AWS SES SMTP. Webhook Encharge. Analytics Plausible.
- **DB**: Supabase Postgres (`ssifdqiwmuktemixiubz`). Scritture server-side via **Secret key** (`SUPABASE_SECRET_KEY`); **RLS attiva**.

## In produzione (deploy 2026-05-29, main `6944573`)
- Quiz 6 assi + **spider chart variante G2** (etichette a capo per parola + bold, web + email sincronizzati).
- **Cattura dati robusta**: insert affidabile (await + alert su fallimento); **cattura anonima** pre-form (`/api/track-result` + `submission_token`); storicizzazione 30 risposte (`quiz_answers`).
- **Dashboard `/admin`** (password unica `ADMIN_PASSWORD`, `proxy.ts`): tabella + filtri + KPI, dettaglio + SpiderChart + compliance, export CSV, statistiche. Smoke-test locale OK (login + dati + protezione).

## Dati a DB
- `submissions`: **25 lead reali** (periodo 16/04–28/05). I dati di test/interni sono stati rimossi; i lead persi durante la pausa Supabase sono stati **recuperati dalle email di notifica**.
- ⚠️ `ai_usage` contiene il **ruolo** del rispondente (non l'uso-AI) → da rietichettare in dashboard.

## In corso (workflow background)
- **`dashboard-v2-redesign`** (run `wf_95641af1-fe9`, task `wn2fddnzz`): panel 4 esperti (BI/strategia/dataviz/dominio) → user stories + spec → implementazione su branch **`claude/dashboard-v2`** → verifica per story → debug loop.
- **Al termine (PM)**: smoke-test live (sandbox-off) → **far vedere allo sponsor un preview** (soddisfazione soggettiva) → poi merge su `main`. NON mergiare in prod senza ok visivo dello sponsor.

## Follow-up aperti
- Verificare `/admin` in **produzione** (login con la password **intera**, incluso `#`).
- **Vercel**: confermare `ADMIN_PASSWORD` = valore completo (Vercel letterale; in locale `.env.local` va quotato per via del `#`).
- Hardening RLS (opzionale): `drop policy "public insert submissions"` (scritture ora via secret key) → chiude l'avviso "RLS Policy Always True".
- Avvisi GraphQL "object visible": cosmetici (la RLS protegge i dati).
- Privacy policy sulla cattura anonima: **gestita dallo sponsor**.

## Sicurezza / segreti
- `.env.local` (gitignorato, mai committare): SMTP_* · NEXT_PUBLIC_SUPABASE_URL · SUPABASE_ANON_KEY · SUPABASE_SECRET_KEY · ADMIN_PASSWORD · ENCHARGE_WEBHOOK_URL. Chiavi Supabase in formato moderno (`sb_publishable_*` / `sb_secret_*`).
- ⚠️ Valori env con `#` vanno **quotati** in `.env.local` (dotenv tronca al `#` non quotato → mismatch locale vs Vercel).

## Note operative
- Quiz client-side in `src/app/page.tsx`. Dashboard in `src/app/admin/*` + `src/lib/admin/*` + `src/components/admin/*`.
- **Lanciare chip/sessioni operative in WORKTREE ISOLATA** (non in-place): le sessioni in-place collidono col branch della sessione PM (lezione appresa il 29/05).
- Migrazioni DB → SQL Editor di Supabase a mano (l'ambiente dev non raggiunge il DB).
