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

## Dashboard v2 — IN PRODUZIONE (deploy 2026-05-29, main `d88269e`)
- Ridisegno via workflow multi-agente (10 user story, 150 test verdi). Novità: lead scoring **hot/warm/cold** + colonne Priorità/Giorni/Gap/Compliance; preset "Segmenti"; heatmap conformità di mercato; heatmap assi×settore; funnel + maturità per mese; executive summary nel dettaglio; filtro ruolo; KPI board; export CSV arricchito. Logica derivata in `src/lib/admin/lead-scoring.ts` (puro, testato). Mock dietro `ADMIN_MOCK=1`.
- **Bug fix post-deploy** (commit `cb6e0fb`): `/admin` resa fluida full-width (era cappata a `max-w-7xl`); dettaglio lead non crasha più (`ComplianceChecklist` reso robusto a compliance shape `{area,stato}` dei recuperati).
- **Follow-up dati RISOLTI** (UPDATE in DB): i 24 recuperati ora hanno `answers.X1/X2/X3` (filtro "per ruolo" ok) e `compliance` arricchita col testo canonico di `scoring.ts`.
- ⚠️ **Chiarimento**: il RUOLO del rispondente è `answers['X3']`, NON `ai_usage` (= "uso AI dichiarato"). Correggere eventuali note residue.

## Backlog prioritizzato
- 📋 **Matrice opportunità** (fattibilità/impatto/fit, 20 voci, piano a 2 wave: Wave 1 tecnica interna · Wave 2 opzionale tool esterni/proattivo cliente): **`docs/IMPROVEMENT-MATRIX.md`**. Fondante: **OBS-1** (observability — causa-radice dell'incidente pausa).

## Sessioni operative aperte (VERIFICARE per prime)
- 🔧 **Wave 1 — tecnica** (chip autonomo, branch `claude/wave1-tech`, worktree isolata `/Users/edoardo/Developer/.AI-Assessment-wt/wave1-tech`): implementa OBS-1, SEC-1/2/3, CODE-1/2/3, DATA-1/2, GROW-1 (struttura: interazioni solo a inizio/fine). **NON ancora mergiata.** Al ritorno: leggi la review finale del chip → fai le **azioni manuali** che riporta (applicare `supabase/migrations/*_wave1.sql` + SQL drop policy RLS nel SQL Editor Supabase; aggiungere `ADMIN_SESSION_SECRET` su Vercel + `.env.local`) → poi **merge `claude/wave1-tech` → main** con build/lint/test verdi + smoke prima del push prod. `PROD-1` rinviato a dopo i dati di funnel di GROW-1.

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
