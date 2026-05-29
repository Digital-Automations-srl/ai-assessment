# Feature: Funnel Fase 0 — teaser di curiosità + eventi diagnostici (results→form)

> PRD preparato in sessione PM, 2026-05-29. Basato su `docs/FUNNEL-GATING-ANALYSIS.md`.

## Obiettivo
Aumentare l'incentivo a passare dai **risultati** al **form** SENZA amputare lo scorecard, e strumentare gli eventi mancanti per diagnosticare il gate results→form.

## Principio guida (non negoziabile)
Il **dato grezzo dell'utente resta gratis**: NON rimuovere né oscurare punteggio complessivo, grafico ragno, tabella dei 6 punteggi (oggi visibili in `Results.tsx`). Si AGGIUNGE solo un teaser di curiosità sull'**interpretazione** (che è già gated nel report).

## Parte A — Teaser di curiosità (`src/components/quiz/Results.tsx`)
Vicino alla CTA "Ottieni il report gratuito", aggiungere un blocco teaser che apre un loop di curiosità SENZA rivelare l'interpretazione:
- **Conteggio** delle aree compliance critiche rilevate (es. "🔒 Nel report completo: N rischi di conformità rilevati") — il numero viene dai dati compliance già calcolati (`scoring.ts`); NON mostrare quali.
- **Nome dell'asse più debole** (es. "Il tuo punto più debole: «<asse>»") — solo il nome, non l'analisi.
- **Microcopy** che inquadra il report come "piano d'azione personalizzato", non come "sblocca/paywall".
Nessuna rimozione di ciò che è oggi visibile.

## Parte B — Eventi diagnostici (estende GROW-1, `src/lib/plausible.ts`)
Riusa il helper `track()` di GROW-1 (custom events Plausible):
- `get_report_clicked` — click sulla CTA dai risultati verso il form (separa "non interessato" da "non ha visto la CTA").
- `results_scroll_50` / `results_scroll_90` — soglie di scroll sulla pagina risultati (un solo invio per soglia per sessione).
- `lead_form_abandoned` — l'utente ha aperto il form (`lead_form_viewed`) ed esce/torna senza submit.

## Misurazione (no A/B)
Niente A/B (traffico basso → impraticabile in tempi utili). Teaser rilasciato **a tutti**; misurazione **pre/post** su **R1 = lead_form_viewed / results_viewed** (già raccolto da GROW-1) + nuovi eventi. **Annotare la data di rilascio** (nel commit/handoff) per il confronto prima/dopo.

## Acceptance Criteria
1. Pagina risultati: invariata in ciò che mostra (score/ragno/6 punteggi) + nuovo blocco teaser (conteggio rischi compliance + asse più debole + microcopy) che **non rivela** l'interpretazione.
2. I 3 eventi diagnostici (`get_report_clicked`, `results_scroll_50/90`, `lead_form_abandoned`) emessi correttamente e verificabili (console/Plausible).
3. Nessun campo PII nuovo; **nessuna migrazione DB**; **nessuna nuova dipendenza**.
4. `build`/`lint`/`test` verdi.

## File (orientativo)
- `src/components/quiz/Results.tsx` — teaser + scroll + `get_report_clicked`.
- `src/components/quiz/LeadForm.tsx` — `lead_form_abandoned`.
- `src/app/page.tsx` — passare a `Results` il conteggio rischi compliance + l'asse più debole; wiring eventi. **Modifiche localizzate e minime** (un'altra sessione (GROW-3) NON tocca page.tsx, ma resta cortesia tenere il diff piccolo).
- `src/lib/plausible.ts` — nuovi eventi.
- Riuso: `src/lib/scoring.ts` (compliance + livelli), `src/lib/types.ts` se serve un tipo.

## Vincoli
- **Worktree isolata**, branch dedicato (es. `claude/funnel-fase0`), **MAI in-place**.
- **NON deployare/mergiare** (PM rivede). **NON** nuove dipendenze. **NON** migrazioni.
- **NON toccare il report gated** (`Report.tsx`) né la feature GROW-3 (PDF) — è una sessione separata.
- `build`/`lint`/`test` verdi; commit per sotto-task; pusha il branch.

## Fuori scope
- A/B test infra; rimozione/oscuramento di info dai risultati; modifiche al report; PROD-3 exit-intent (tema separato, in attesa dati).

## Deliverable atteso (handoff del chip)
- Branch pushato; `build`/`lint`/`test` verdi.
- **Screenshot** della pagina risultati col teaser.
- Lista degli eventi emessi e **come verificarli** in locale.
- Data di rilascio annotata (per il confronto pre/post). Conferma che NON è stato deployato/mergiato.
