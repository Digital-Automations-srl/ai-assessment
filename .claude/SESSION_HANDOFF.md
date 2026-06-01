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

## Wave 1 tecnica — ✅ IN PRODUZIONE (merge 2026-05-29, main `0b88187`)
- Consegnati 10 item: **OBS-1** (observability/alerting), **SEC-1** (`ADMIN_SESSION_SECRET` fail-closed in prod), **SEC-2** (drop policy RLS insert-anonimo), **SEC-3** (audit log admin → tabella `admin_audit` + mini-vista "Ultimi accessi"), **CODE-1** (font 1.1MB esternalizzato), **CODE-2** (e2e Playwright in `e2e/`), **CODE-3** (design tokens), **DATA-1** (UTM), **DATA-2** (segnali comportamentali). Gate verificato in PM (build/lint ok, vitest 169/169, e2e 3/3). Env + 2 migrazioni SQL già applicate.
- Nuovi moduli: `src/lib/{observability,utm,behavior,plausible,design-tokens}.ts`, `src/lib/admin/audit.ts`, `src/components/admin/RecentAccess.tsx`. Nuova devDependency `@playwright/test` (`npm run test:e2e`, `npx playwright install chromium` la 1ª volta).

## Backlog prioritizzato
- 📋 **Matrice opportunità**: **`docs/IMPROVEMENT-MATRIX.md`** (Wave 1 segnata ✅). Restano aperti:
  - ✅ **INFRA-2 CHIUSO**: passaggio a **Supabase Pro** (backup giornalieri + restore self-service; no auto-pausa) + OBS-1 già in prod. Residuo opzionale: dry-run una-tantum del restore.
  - **PROD-1** (quiz inline): rinviato a *dopo* i dati di funnel di GROW-1.
  - **Wave 2** (opzionale) — decisioni 2026-05-29: ⛔ **INFRA-3 BLOCCATO** (serve accesso AWS via ufficio tecnico); ⏸️ **PROD-3 IN ATTESA** dati funnel + consenso. Restano: GROW-2 nurturing Encharge, GROW-6 CRM/sync, PROD-2 consenso/GDPR, GROW-4 benchmark, GROW-5 i18n.

## Sessioni operative — esito 2026-05-29
- ✅ **Funnel Fase 0 — IN PRODUZIONE** (merge `fef8533`, deploy 2026-05-29): teaser di curiosità sui risultati (rischi non-verdi + asse più debole, scorecard intatto) + eventi `get_report_clicked`/`results_scroll_50/90`/`lead_form_abandoned`. Gate PM verde (build/lint, test 175/175). Branch + worktree rimossi. Handoff storico in `.claude/questions/FUNNEL-FASE0_HANDOFF.md` (sul main).
- ❌ **GROW-3 PDF — ABBANDONATO** (PDF troppo complesso; sponsor ha bloccato la sessione). Nessun residuo git. PRD rimosso. Eventuale ripensamento: servizio esterno HTML→PDF (vedi matrice).
- 🧹 Igiene: `.claude/worktrees/` aggiunto a `.gitignore` **e** agli ignore di ESLint (`eslint.config.mjs`) — le worktree annidate dei chip facevano esplodere `npm run lint` da root.
- 📏 **Da fare tra ~1-2 settimane**: leggere R1 (`lead_form_viewed/results_viewed`) + nuovi eventi su Plausible. ⚠️ baseline pre-teaser quasi assente (GROW-1+teaser stesso giorno) → leggere in assoluto, non come delta del teaser. Tema unico con PROD-3.
- 🔧 **Report fixes — LANCIATA** (chip, PRD `docs/specs/REPORT-FIXES_PRD.md`): etichetta "Obiettivo DA"→"…con Digital Automations" (3 punti incl. SVG email), **rimozione pagina di conferma** (Option A: banner sul report + elimina ThankYou + 2 link rotti calendly/"torna al profilo"). Worktree isolata; NON deploya/mergia. **VERIFICARE al ritorno.**
- 🔧 **Admin delete — LANCIATA** (chip, PRD `docs/specs/ADMIN-DELETE_PRD.md`): hard delete record singolo dal dettaglio `/admin/[id]` (route `POST /api/admin/delete` via secret key + conferma nome/email + audit `event:"delete"` senza PII). **Nessuna migrazione** (`admin_audit.event` è text). Worktree isolata; NON deploya/mergia. **VERIFICARE al ritorno.**
- 🗑️ **Record di test immediati**: lo sponsor può cancellarli dal SQL Editor Supabase (`select … ; delete from submissions where id in (…)`) senza attendere la feature.

## Sessioni operative aperte
- ✅ Nessuna. Wave 1 mergiata e branch/worktree ripuliti (resta solo `main`).

## Follow-up aperti
- 🔲 **Verifica post-deploy (lato sponsor)**: su Vercel deploy verde + `/admin` logga gli accessi ("Ultimi accessi") + login con la password **intera** (incluso `#`).
- 🔲 **Vercel**: confermare `ADMIN_PASSWORD` = valore completo e `ADMIN_SESSION_SECRET` presente (SEC-1: senza, il login admin si rompe in prod — fail-closed).
- (opzionale) dry-run una-tantum del restore Supabase Pro, per confermare il ripristino.
- Rietichettare `ai_usage` (=ruolo) nella UI dashboard (cosmetico). Avvisi GraphQL "object visible": cosmetici (RLS protegge).
- Privacy policy sulla cattura anonima: **gestita dallo sponsor**.

## Sicurezza / segreti
- `.env.local` (gitignorato, mai committare): SMTP_* · NEXT_PUBLIC_SUPABASE_URL · SUPABASE_ANON_KEY · SUPABASE_SECRET_KEY · ADMIN_PASSWORD · ENCHARGE_WEBHOOK_URL. Chiavi Supabase in formato moderno (`sb_publishable_*` / `sb_secret_*`).
- ⚠️ Valori env con `#` vanno **quotati** in `.env.local` (dotenv tronca al `#` non quotato → mismatch locale vs Vercel).

## Note operative
- Quiz client-side in `src/app/page.tsx`. Dashboard in `src/app/admin/*` + `src/lib/admin/*` + `src/components/admin/*`.
- **Lanciare chip/sessioni operative in WORKTREE ISOLATA** (non in-place): le sessioni in-place collidono col branch della sessione PM (lezione appresa il 29/05).
- Migrazioni DB → SQL Editor di Supabase a mano (l'ambiente dev non raggiunge il DB).
