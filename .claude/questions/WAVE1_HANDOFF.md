# Handoff Wave 1 — tecnica → sessione PM

> Sessione operativa autonoma, 2026-05-29. Branch `claude/wave1-tech` (pushato su origin).
> **Tutti i 10 item consegnati. Env + migrazioni GIÀ APPLICATE dallo sponsor. Resta solo il merge.**

## Stato quality gate (sull'intero branch)
`npx vitest run` → **169/169** · `npm run lint` → pulito · `npm run build` → ok · `npx playwright test` → **3/3**.

## Azioni manuali pre-deploy — ✅ COMPLETATE
- ✅ **SEC-1**: `ADMIN_SESSION_SECRET` settato su Vercel + env locale (in dev c'è fallback su `ADMIN_PASSWORD`, quindi obbligatorio solo in produzione).
- ✅ **SQL #1** `supabase/migrations/20260529130000_wave1.sql` applicata (tabella `admin_audit` + colonne `utm_*` e `behavior` su `submissions`).
- ✅ **SQL #2 (SEC-2)** `supabase/migrations/20260529140000_sec2_drop_anon_insert_policy.sql` applicata (drop policy RLS insert-anonimo; conteneva un bug `%%`→`%` nella RAISE, fixato nel commit `19ece6c`).

## Cosa resta da fare (PM)
1. **Merge `claude/wave1-tech` → `main`.** Il merge 3-way è **pulito**: dopo la creazione del branch, `main` è avanzato solo del commit docs `d1a35c5` (tocca `.claude/SESSION_HANDOFF.md` + `LOG.md`); questo branch non tocca quei file → nessun conflitto.
2. **Post-merge (consigliato, non bloccante):**
   - Aggiungere `ADMIN_SESSION_SECRET` all'elenco env in `CLAUDE.md` (oggi assente).
   - Aggiornare le "Note Tecniche" di `CLAUDE.md` con i nuovi moduli: `observability.ts`, `design-tokens.ts`, `utm.ts`, `behavior.ts`, `admin/audit.ts`, `plausible.ts`; tabella `admin_audit`; SEC-1 (secret obbligatorio in prod).
   - Aggiornare `IMPROVEMENT-MATRIX.md` segnando Wave 1 completata.
   - Verificare su Vercel che il deploy post-merge sia verde e che `/admin` logghi gli accessi (mini-vista "Ultimi accessi").

## Item consegnati (1 commit ciascuno)
| Commit | Item |
|---|---|
| `28b2069` | **OBS-1** observability + alerting (retry webhook awaited, verifica post-scrittura DB, log strutturato) |
| `41c021a` | **SEC-1** `ADMIN_SESSION_SECRET` obbligatorio in prod (fail-closed) |
| `29d51d8` | **SEC-2** SQL drop policy RLS insert-anonimo |
| `bbc0aff` | **SEC-3** audit log accessi/azioni + mini-vista `/admin` |
| `3338462` | **CODE-1** font 1.1MB esternalizzato (letto da `src/assets`) |
| `4bc40fd` | **CODE-3** design tokens DA centralizzati |
| `94ef947` | **DATA-1** tracking UTM source/medium |
| `42e4edd` | **DATA-2** segnali comportamentali + tie-break lead tier |
| `d2ee332` | **GROW-1** eventi Plausible sul funnel del quiz |
| `ed4ebba` | **CODE-2** e2e Playwright + test integrazione route |
| `19ece6c` | fix SEC-2 SQL (RAISE `%`) |

## Note / scelte di default prese in autonomia
- **SEC-3**: il logging degli **accessi** vive in `requireAdmin()` (runtime Node garantito), non nel `proxy.ts` (runtime-agnostico Edge+Node → DB write inaffidabile). Le **azioni** (login/logout/export) sono loggate nelle route `/api/admin/*`.
- **OBS-1**: webhook Encharge ora *awaited* con timeout per-tentativo contenuto (2.5s ×3); persistenza DB spostata **prima** del webhook (cattura lead > nurturing).
- **DATA-2**: `nonSoCount`/`skippedCount` valgono 0 oggi (il quiz impone tutte le risposte e non flagga "Non so"); plumbing pronto, tie-break guidato dal tempo. Il tie-break (peso ≤0.09) separa solo lead a parità di tier+overall, **non cambia mai la classe tier**.
- **CODE-3**: non esaustivo per scelta (moduli puri testati e colori dei grafici lasciati invariati).
- Nuova devDependency: **`@playwright/test`** (approvata). Browser: `npx playwright install chromium`. Script: `npm run test:e2e`.

## Fuori scope (NON toccato)
- **PROD-1** (quiz inline): rinviato a dopo i dati di funnel di GROW-1.
- **Wave 2**: Encharge/nurturing, CRM/sync, AWS SES, report PDF/condivisibile, i18n, exit-intent, consenso/GDPR.
