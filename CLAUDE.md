# AI Readiness Assessment

## Progetto

Quiz di autovalutazione AI Readiness per PMI italiane. Misura la maturita' AI su 6 assi (30 domande), produce un grafico a ragno SVG, una checklist compliance su 7 aree obbligatorie, e raccoglie lead per follow-up commerciale. Include una **dashboard admin** (`/admin`) per visionare i lead raccolti.

Dominio: `aiassessment.digitalautomations.it`

## Stack Tecnologico

- **Frontend + Backend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Email**: Nodemailer via AWS SES SMTP
- **Analytics**: Plausible
- **Deploy**: Vercel (auto-deploy da GitHub, branch `main`)
- **Database**: Supabase (Postgres, progetto `ssifdqiwmuktemixiubz`). Scritture server-side via **Secret key** (`SUPABASE_SECRET_KEY`, formato moderno `sb_secret_*`); **RLS attiva** sulla tabella `submissions`. Lettura quiz pubblico via anon/publishable key.

## Comandi

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Build produzione
npm run lint         # ESLint
npm run test         # Vitest (unit + integrazione route)
npm run test:e2e     # Playwright e2e quiz pubblico (npx playwright install chromium la 1a volta)
```

## Struttura Cartelle

```
src/
  app/
    page.tsx                    # Orchestratore quiz (state machine)
    layout.tsx                  # Root layout + metadata + Plausible
    proxy.ts                    # (Next 16, NON middleware.ts) protegge /admin/*
    api/send-report/route.ts    # POST: invio email + insert submission (secret key, affidabile)
    api/track-result/route.ts   # POST: cattura anonima allo step "risultati"
    api/admin/{login,logout,export}/route.ts  # auth dashboard + export CSV
    admin/                      # Dashboard riservata: page.tsx, [id]/page.tsx, login/page.tsx, stats/page.tsx
  components/quiz/              # Landing, Instructions, ContextPage, AxisPage, ProgressBar,
                                #   SpiderChart, Results, LeadForm, Report, ComplianceChecklist, ThankYou
  components/admin/             # SubmissionsTable, FilterBar, Pagination, SubmissionDetail, Charts, ...
  lib/
    quiz-data.ts                # 33 domande (3 contesto + 30 quiz)
    scoring.ts                  # Calcolo punteggi, livelli, compliance
    email.ts                    # Template email HTML (lead + interno)
    spider-chart-svg.ts         # SVG/PNG del ragno per le email
    types.ts                    # Tipi TypeScript
    supabase.ts                 # client anon (lato quiz pubblico)
    supabase-admin.ts           # client server-only con SUPABASE_SECRET_KEY (bypassa RLS)
    admin/                      # auth, queries, filters, format, types della dashboard
supabase/
  migrations/                   # migrazioni schema (es. 20260529_assessment_capture.sql)
docs/
  specs/                        # Specifiche quiz e componente ragno JSX
  coproduzione/                 # Manuali co-produzione (v1.9)
```

## Convenzioni

- **Naming file**: PascalCase per componenti (`AxisPage.tsx`)
- **Lingua**: codice in inglese, UI in italiano
- **Import**: path alias `@/` per `src/`
- **Componenti**: quiz tutti `"use client"`; la dashboard usa Server Components + route handlers
- **Colori DA**: Navy #004172, Blue #016FC0, Light Gray #E4E4E4, Amber #E09900

## Note Tecniche

- Quiz = state machine client-side: landing → instructions → context → quiz (6 assi) → results → lead-form → report → thank-you
- Email via `/api/send-report` (POST, nodemailer + AWS SES). Due email: lead (report) + interna a digital@digitalautomations.it
- **Cattura dati**: insert su `submissions` ora **affidabile** (await + alert interno su fallimento). **Cattura anonima** pre-form via `/api/track-result` + `submission_token` effimero (no PII). `quiz_answers` (jsonb) storicizza le 30 risposte (solo nuovi assessment)
- **Dashboard `/admin` (v2)**: auth a **password unica** (`ADMIN_PASSWORD`, cookie HMAC), protezione via `proxy.ts`. Letture via `supabase-admin` (Secret key). Sezioni: lista lead (filtri+preset Segmenti+KPI; colonne Priorita'/Giorni/Gap/Compliance), dettaglio (executive summary + SpiderChart + compliance), export CSV arricchito, cruscotto di mercato (`/admin/stats`: heatmap conformita', matrice assi×settore, funnel, maturita' nel tempo, per ruolo)
- **Metriche derivate lead**: tutte calcolate in `src/lib/admin/lead-scoring.ts` (modulo **puro**, no DB/React, testato): tier hot/warm/cold (soglie centralizzate `TIER_THRESHOLDS`), gap totale, compliance risk, azione consigliata, giorni. Single source of truth riusata da lista, dettaglio ed export. **Ruolo** del rispondente = `answers['X3']` (US-8 filtra su `answers->>'X3'`), NON `ai_usage`. Tier filter: il tier non e' colonna DB → restringimento via predicati AND + raffinamento in memoria (count/paginazione ricalcolati)
- **Mock dashboard**: `ADMIN_MOCK=1` fa restituire alle query (`src/lib/admin/queries.ts`) un dataset finto deterministico (`src/lib/admin/mock-data.ts`, ~25 lead) per far girare `/admin` senza DB (sandbox). Gate dietro env: mai sul path di produzione
- **DB `submissions`**: RLS attiva. ⚠️ **SEC-2 (Wave 1)**: la policy insert-anonimo always-true è stata **rimossa** (scritture ora solo via Secret key server-side). Colonne: `quiz_answers, submission_token, status, completed_at, consenso, consenso_marketing` + **Wave 1**: `utm_*` (source/medium/campaign/term/content — DATA-1), `behavior` (jsonb segnali comportamentali — DATA-2). Nota: `ai_usage` contiene il **ruolo** del rispondente (legacy naming)
- **DB `admin_audit`** (Wave 1 / SEC-3): log accessi e azioni della dashboard (login/logout/export). Scritto da `requireAdmin()` (runtime Node) e dalle route `/api/admin/*`; mini-vista "Ultimi accessi" in `/admin` (`components/admin/RecentAccess.tsx`)
- **Moduli Wave 1** (`src/lib/`): `observability.ts` (OBS-1: retry webhook *awaited*, verifica post-scrittura DB, log strutturato; persistenza DB **prima** del webhook), `admin/audit.ts` (SEC-3), `utm.ts` (DATA-1), `behavior.ts` (DATA-2: plumbing pronto, tie-break tier guidato dal tempo, peso ≤0.09 — non cambia mai la classe tier), `plausible.ts` (GROW-1: eventi custom funnel quiz), `design-tokens.ts` (CODE-3). Font 1.1MB esternalizzato in `src/assets`, letto on-demand (CODE-1). E2e Playwright in `e2e/` (CODE-2)
- `.env.local` (mai committare): SMTP_* · NEXT_PUBLIC_SUPABASE_URL · SUPABASE_ANON_KEY · **SUPABASE_SECRET_KEY** · **ADMIN_PASSWORD** · **ADMIN_SESSION_SECRET** (SEC-1: **obbligatorio in produzione**, fail-closed; in dev fallback su `ADMIN_PASSWORD`) · ENCHARGE_WEBHOOK_URL. ⚠️ se un valore contiene `#`, **quotalo** (dotenv tronca al `#` non quotato)
- Specifiche complete: `docs/specs/QUIZ_SPECS.md`
- Scoring: G2 opzione C = 2.5 (non standard), "Non so" = 1.5

## Regole di Sessione

- Esegui `npm run build && npm run lint` prima di dichiarare completato
- NON installare pacchetti senza approvazione
- Committa al completamento di ogni sotto-task logico
- **Sessioni operative / chip in worktree ISOLATA** (non in-place sulla working dir della sessione PM, per evitare collisioni di branch)
- Migrazioni DB: vanno applicate a mano nel SQL Editor di Supabase (l'ambiente dev non raggiunge il DB)
