# Feature: Fix pagina report — etichetta "DA", rimozione pagina di conferma, link rotti

> PRD preparato in sessione PM, 2026-05-29. Batch di fix segnalati dallo sponsor sulla coda del funnel (report/conferma).

## Obiettivo
Rendere chiara l'etichetta "Obiettivo DA" e **eliminare la pagina di conferma ridondante** (Option A), che porta con sé 2 link rotti, spostando la conferma email come banner sul report.

## Interventi

### 1. Etichetta legenda del ragno (3 punti, web + email)
`"Obiettivo DA (90gg)"` → `"Obiettivo con Digital Automations (90gg)"` in:
- `src/components/quiz/Results.tsx:112`
- `src/components/quiz/Report.tsx:98`
- `src/lib/spider-chart-svg.ts:165` — **SVG usato nelle email**. ⚠️ Il testo è più lungo: lo SVG usa `textToPath` (font 13px, ancora `"start"`, posizione ~`cx+64`). **Verificare/riadattare il layout** (spazio, posizione, eventuale riduzione font) per non sforare; controllare il path/SVG generato.

### 2. Rimozione pagina di conferma (Option A, scelta sponsor)
- Eliminare il bottone **"Vai alla pagina di conferma →"** da `src/components/quiz/Report.tsx` (~righe 295-305) e la prop/handler `onThankYou`.
- In `src/app/page.tsx`: rimuovere lo step **"thank-you"** dalla state machine — dal type `Step`, dal render branch `{step === "thank-you" && ...}`, dall'handler `onThankYou`/`setStep("thank-you")`, e l'import di `ThankYou`.
- **Eliminare il file** `src/components/quiz/ThankYou.tsx` → rimuove automaticamente i 2 link rotti (calendly `ThankYou.tsx:43` + "Torna al tuo profilo" `ThankYou.tsx:63`).
- Il **report diventa la schermata finale**; mantiene la CTA call **corretta** già presente (`Report.tsx:277` → `landing.digitalautomations.it/demo-ai-stater-program`).

### 3. Banner di conferma in cima al report
- In cima a `Report.tsx`, banner: **"✓ Fatto! Il tuo report è qui sotto, e l'abbiamo inviato anche a {email}."** (copy ritoccabile in review).
- Passare l'email: in `page.tsx` aggiungere `email={leadData.email}` al render di `Report`; aggiungere la prop `email` all'interfaccia di `Report`.

## Acceptance Criteria
1. Etichetta "Obiettivo con Digital Automations (90gg)" su **web** (results + report) ed **email** (SVG), **senza overflow** visivo nello SVG.
2. Nessuna pagina di conferma; nessun link a calendly; nessun "Torna al profilo"; lo step `thank-you` non esiste più.
3. Il report mostra in cima il banner di conferma con l'email del lead.
4. La CTA "Prenota una call di 15 minuti" (landing corretta) resta funzionante sul report.
5. `build`/`lint`/`test` verdi; eventuali test che referenziano `ThankYou`/step thank-you aggiornati.

## Vincoli
- **Worktree isolata**, branch dedicato (es. `claude/report-fixes`). **MAI in-place**.
- **NON deployare. NON mergiare** (PM rivede). **Nessuna nuova dipendenza. Nessuna migrazione DB.**
- NON toccare la logica di invio email (`send-report`) né il funnel results→form appena rilasciato (teaser/eventi Fase 0). Solo `Results.tsx`/`Report.tsx`/`spider-chart-svg.ts`/`page.tsx` (+ rimozione `ThankYou.tsx`).
- `build`/`lint`/`test` verdi; commit per sotto-task; pusha il branch.

## Fuori scope
- Banner condizionale all'esito reale dell'invio (lo sponsor ha scelto la A semplice; il banner è informativo come oggi).
- Altri usi dell'abbreviazione "DA" altrove nel prodotto.

## Deliverable atteso (handoff)
Branch pushato; `build`/`lint`/`test` verdi; **screenshot** del report con banner in cima + legenda aggiornata (web) e nota su come è stato verificato lo **SVG email** (no overflow). Conferma esplicita di NON aver deployato/mergiato.
