# LOG — AI Readiness Assessment

> Log cronologico **append-only** delle decisioni e attività di project management.
> Formato: data assoluta (YYYY-MM-DD) → decisioni prese, azioni avviate, gap aperti.
> Per lo stato operativo "fotografia corrente" vedi `.claude/SESSION_HANDOFF.md`. Per le specifiche vedi `docs/specs/`.

---

## 2026-05-29 — Sessione PM

**Manutenzione / co-produzione**
- Manuale di co-produzione aggiornato **v1.7 → v1.9.0** (marker JSON `.claude/.coproduzione-version`, `scripts/coproduzione-version.sh`, manuali + regole allineati). Commit `5f11163`.
- Rimosso script di test obsoleto `scripts/send-test-reports.ts`. Commit `3126d21`.
- Skill `sessione-pm` v1.9.1 verificata allineata all'upstream.

**Decisioni prese**
- **Spider chart**: scelta variante **G2** (font 14 bold, `labelOffset` 40, `padding` 90, raggio 0.42 invariato) dopo confronto visivo A–G2. Da applicare a `SpiderChart.tsx` (web) + `src/lib/spider-chart-svg.ts` (PNG email), in coerenza.
- **Dashboard admin**: nuova route `/admin`, auth a **password unica** (`ADMIN_PASSWORD`), scope **MVP + statistiche**.
- **Permessi DB**: strada 1 — **Secret key** Supabase (formato moderno, server-side, bypassa RLS). Variabile standard: **`SUPABASE_SECRET_KEY`**. Strada 2 (Supabase Auth + RLS, zero chiavi privilegiate) rimandata a eventuale fase-2.
- **Cattura dati**: opzione (a) — cattura **anonima** (no PII) allo step "risultati" + linking via token effimero al lead form; insert reso affidabile (await + alert interno su fallimento); storicizzazione delle 30 risposte (`quiz_answers jsonb`, solo nuovi).

**Sessioni operative avviate come chip (da verificare al ritorno)**
- ① Dashboard admin `/admin` (MVP + statistiche)
- ② Hardening cattura dati + storicizzazione (include file di migrazione SQL)
- ③ Apply spider chart G2 (web + email) + rimozione `src/app/test-chart-options/`

**Gap / prerequisiti aperti**
- Utente: inserire `SUPABASE_SECRET_KEY` + `ADMIN_PASSWORD` in `.env.local` (+ Vercel).
- Utente: applicare la migrazione SQL su Supabase (file prodotto dal chip ②).
- Privacy policy sulla cattura anonima: gestita dallo sponsor.
- Vincolo ambiente: la sandbox non raggiunge Supabase → verifica con dati reali a carico dell'utente in locale (`npm run dev` + Secret key).

**Note**
- DB attuale (`submissions`): cattura solo assessment con lead form inviato e insert riuscito; le 30 risposte puntuali non erano storicizzate (lo storico pre-fix non è ricostruibile).
