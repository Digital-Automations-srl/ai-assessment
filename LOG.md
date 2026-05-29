# LOG — AI Readiness Assessment

> Log cronologico **append-only** delle decisioni e attività di project management.
> Formato: data assoluta (YYYY-MM-DD) → decisioni prese, azioni avviate, gap aperti.
> Per la "fotografia corrente" vedi `.claude/SESSION_HANDOFF.md`. Specs in `docs/specs/`.

---

## 2026-05-29 — Sessione PM (giornata intensa)

### Manutenzione / co-produzione
- Manuale di co-produzione aggiornato **v1.7 → v1.9.0** (marker JSON `.claude/.coproduzione-version`, `scripts/coproduzione-version.sh`, manuali + regole). Skill `sessione-pm` v1.9.1 allineata. Commit `5f11163`.
- Rimosso script di test obsoleto `scripts/send-test-reports.ts` (commit `3126d21`). Aggiunto `LOG.md`.

### Decisioni prese
- **Dev-kit aziendale**: ignorato per ora (su richiesta).
- **Spider chart**: scelta finale **G2** evoluta → la sessione operativa ha implementato **etichette a capo per parola + bold**, sincronizzate web (`SpiderChart.tsx`) + email (`spider-chart-svg.ts`). Confermata dallo sponsor. `test-chart-options/` rimossa.
- **Permessi DB**: strada moderna — **Secret key** Supabase (`SUPABASE_SECRET_KEY`, `sb_secret_*`), server-side, bypassa RLS. Niente Supabase Auth (rimandato).
- **Dashboard `/admin`**: auth **password unica** (`ADMIN_PASSWORD` + cookie HMAC, `proxy.ts`), scope **MVP + statistiche**.
- **Cattura dati** (opzione "cattura completa anonima"): record anonimo pre-form (no PII) + linking via `submission_token`; insert affidabile + alert; `quiz_answers` storicizzate.

### Incidente Supabase (pausa) + recupero
- Diagnosticato: progetto Supabase **andato in pausa** (free tier) → host non risolveva → **insert in produzione falliti in silenzio** da ~16/04. Lo sponsor ha fatto **Restore** + applicato la **migrazione SQL** + abilitato **RLS**.
- Trovato: la `SUPABASE_SECRET_KEY` inizialmente inserita era di **un altro progetto** → corretta dallo sponsor.
- **DB ripulito + ricostruito**: i 8 record erano 7 test/interni + 1 reale. Eliminati i 7 fabbricati/interni; **recuperati 24 lead reali dalle email di notifica** (punteggi-asse + compliance + contesto + date originali) → **25 lead reali** totali, 0 residui test. Nessun lead reale perso.

### Rilasci in produzione (main `6944573`, deploy 29/05)
- Merge (FF) di `assessment-capture` + `admin-dashboard` su `main`. Branch feature + worktree ripuliti.
- **Smoke-test** (dev server + login + `/admin`): quiz 200, login 200, `/admin` 200 con dati reali, protezione 307/401. Bug trovato e risolto: `ADMIN_PASSWORD` con `#` non quotato → troncato da dotenv in locale (quotato in `.env.local`; su Vercel resta letterale).

### Sicurezza
- RLS abilitata (avviso CRITICO "RLS Disabled" risolto). Avviso residuo "RLS Policy Always True" = policy insert anonimo (atteso). Avvisi GraphQL "object visible" = cosmetici (RLS protegge).
- Password **mai esposta** nel transcript/git (solo lunghezza/struttura). Residui locali in `/tmp` (backup secret + PII) **eliminati**.

### Avviato (workflow background)
- **`dashboard-v2-redesign`** (run `wf_95641af1-fe9`): panel esperti → user stories + spec → implementazione su `claude/dashboard-v2` → verify → debug. **Al termine**: smoke-test live + preview allo sponsor → merge su ok.

### Lezione di processo
- I chip operativi del 29/05 sono girati **in-place** sulla stessa working dir → collisione col branch della sessione PM. **D'ora in poi: chip/sessioni operative in worktree ISOLATA.**

### Follow-up aperti
- Verifica `/admin` in prod (login pw intera). Confermare `ADMIN_PASSWORD` completo su Vercel.
- Opzionale: drop policy insert anonimo (hardening RLS). Rietichettare `ai_usage` (=ruolo) in dashboard. Verificare rendering compliance nel dettaglio.
- Privacy policy cattura anonima: gestita dallo sponsor.
