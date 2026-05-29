# Feature: GROW-3 — Report PDF brandizzato (scaricabile)

> PRD preparato in sessione PM, 2026-05-29. Primo step di GROW-3 (**solo-PDF**; link condivisibile e allegato email rimandati).

## Obiettivo
Permettere all'utente di **scaricare il proprio report di assessment come PDF brandizzato DA** dallo step "report" del quiz (il report completo, già gated dietro il form).

## Decisione tecnica (analizzata, non a sensazione)
Motore: **`@react-pdf/renderer`** (dependency, **APPROVATA** dallo sponsor). Compatibile React 19 (≥ v4.1.0) e Next 16.

**Generazione CLIENT-SIDE preferita** per il solo download: usa `PDFDownloadLink` / `usePDF` di react-pdf → il PDF si genera **nel browser dell'utente** al click. Vantaggi: nessuna route serverless, **niente cold-start/limiti Vercel**, download istantaneo, nessuna modifica a `page.tsx`.
- La generazione **server-side** (route handler **Node**, non Edge, `renderToStream`) serve SOLO se in futuro si allega il PDF all'email lead — **fuori scope ora**. Non implementarla in questo step.
- Motivazione del motore (verificata su fonti 2026): react-pdf è la scelta stabile vs Puppeteer/Chromium (cold start fino a ~15s > timeout Vercel 10s); ma con la via client-side il tema serverless non si pone proprio.

Accortezze:
- **Font bundlati localmente** (TTF/OTF da `src/assets`), MAI fetchati a runtime (in cold-start falliscono, anche in silenzio; react-pdf supporta meglio TTF/OTF che WOFF2).
- Grafico ragno = **embed del PNG** già prodotto da `src/lib/spider-chart-svg.ts` (`<Image>`), non re-implementare il chart.

## Acceptance Criteria
1. Sullo step **report** c'è un bottone **"Scarica PDF"** che genera e scarica il PDF del report corrente (generazione client-side al click).
2. PDF **brandizzato DA** (colori da `design-tokens.ts`: Navy #004172, Blue #016FC0, Amber #E09900; logo se in `public/`) con: contesto azienda, **punteggio complessivo + livello**, **ragno** (PNG), i **6 assi** con punteggi/livelli, la **checklist compliance** (7 aree).
3. Ragno embeddato come **PNG** (riuso `spider-chart-svg.ts`), non reimplementato.
4. **Font bundlati localmente** (TTF/OTF da `src/assets`).
5. Nessuna **PII nuova**; **nessun cambio** al flusso email/SES; nessuna migrazione DB.
6. **Build, lint, test verdi**; smoke manuale del download (PDF apribile, ragno presente, branding ok).

## File da modificare/creare (orientativo)
- **Nuovo** documento PDF: `src/lib/report-pdf.tsx` (o `src/components/report/ReportPdf.tsx`) con i primitivi react-pdf (`Document/Page/View/Text/Image/StyleSheet`).
- **Modifica**: `src/components/quiz/Report.tsx` — bottone "Scarica PDF" (`PDFDownloadLink`/`usePDF`).
- **Riuso**: `src/lib/spider-chart-svg.ts` (PNG ragno), `src/lib/scoring.ts` (livelli/compliance), `src/lib/design-tokens.ts` (colori), font in `src/assets`.
- **`next.config.ts`**: se necessario per il bundling, `serverExternalPackages`/transpile per `@react-pdf/renderer`.
- **`package.json`**: + `@react-pdf/renderer` (approvato).
- **NB**: con la via client-side **NON serve** toccare `src/app/page.tsx` né creare route → zero sovrapposizione con la sessione "Funnel Fase 0".

## Vincoli
- Lavora in **worktree isolata** su **branch dedicato** (es. `claude/grow3-pdf-report`). **MAI in-place**.
- **Scope-guard**: il PDF è un **value-add del report già gated**. NON toccare la pagina results (`Results.tsx`) né la logica del gate results→form; **nessuna meccanica di cattura legata al PDF**. Resta su `Report.tsx` + componente PDF.
- `@react-pdf/renderer` **approvata**; **nessun'altra** install senza chiedere.
- **NON deployare. NON mergiare.** Lo sponsor rivede il risultato sul branch.
- `npm run build && npm run lint && npm run test` verdi prima di completare. Commit per sotto-task.

## Fuori scope (NON fare)
- Link pubblico condivisibile `/r/[token]` (step b di GROW-3 — rimandato).
- Allegato PDF all'email lead + generazione server-side (rimandati).
- Qualunque modifica a results/funnel/SES/Encharge.

## Deliverable atteso (handoff del chip)
- Branch pushato; `build`/`lint`/`test` verdi.
- Un **PDF di esempio** salvato/allegato + come testare il download in locale.
- Nota di handoff: file toccati, scelte di layout, caveat, conferma che NON è stato deployato/mergiato.
