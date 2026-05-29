# Feature: GROW-3 — Report PDF brandizzato (scaricabile)

> PRD preparato in sessione PM, 2026-05-29. Primo step di GROW-3 (**solo-PDF**; link condivisibile e allegato email rimandati).

## Obiettivo
Permettere all'utente di **scaricare il proprio report di assessment come PDF brandizzato DA** dallo step "report" del quiz.

## Decisione tecnica (analizzata, non a sensazione)
Motore: **`@react-pdf/renderer`** (nuova dependency runtime, **approvata** dallo sponsor).
Motivazione (verificata su fonti di produzione 2026): su Vercel serverless è la scelta stabile — ~2 MB, generazione <400ms — contro Puppeteer/Chromium (~50 MB, cold start fino a ~15s > timeout Vercel 10s, fragile). Puppeteer regge solo in worker async, non dietro un download sincrono. Compatibile React 19 (≥ v4.1.0) e Next.js 16.

## Acceptance Criteria
1. Sullo step **report** del quiz c'è un bottone **"Scarica PDF"** che genera e scarica il PDF del report corrente.
2. Il PDF è **brandizzato DA** (colori da `design-tokens.ts`: Navy #004172, Blue #016FC0, Amber #E09900; logo se disponibile in `public/`) e contiene: intestazione + dati di contesto azienda, **punteggio complessivo + livello**, **grafico ragno**, i **6 assi** con punteggi/livelli, la **checklist compliance** (7 aree).
3. Il **grafico ragno** nel PDF è il **PNG già generato** da `src/lib/spider-chart-svg.ts` (embed via `<Image>` di react-pdf), NON re-implementato da zero.
4. Generazione in un **route handler Node** (non Edge), via `renderToStream`/`renderToBuffer`, con header corretti (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename=...`).
5. I **font sono bundlati localmente** (TTF/OTF da `src/assets`), **NON fetchati a runtime** (in cold-start i fetch font falliscono, anche in silenzio; react-pdf supporta meglio TTF/OTF che WOFF2).
6. Nessuna **PII nuova** esposta; **nessun cambio** al flusso email/SES in questo step.
7. **Build, lint, test verdi**; smoke manuale del download (PDF apribile, ragno presente, branding corretto).

## File da modificare/creare (orientativo)
- **Nuovo** route handler: `src/app/api/report-pdf/route.ts` — riceve i dati del report (o l'id/token), genera il PDF.
- **Nuovo** documento PDF: `src/lib/report-pdf.tsx` (o `src/components/report/ReportPdf.tsx`) con i primitivi react-pdf (`Document/Page/View/Text/Image/StyleSheet`).
- **Modifica**: `src/components/quiz/Report.tsx` — bottone "Scarica PDF".
- **Riuso**: `src/lib/spider-chart-svg.ts` (PNG ragno), `src/lib/scoring.ts` (livelli/compliance), `src/lib/design-tokens.ts` (colori), font in `src/assets`.
- **`next.config.ts`**: se necessario, `serverExternalPackages: ['@react-pdf/renderer']`.
- **`package.json`**: + `@react-pdf/renderer` (approvato).

## Vincoli
- Lavora in **worktree isolata** su **branch dedicato** (es. `claude/grow3-pdf-report`). **MAI in-place** sulla working dir principale.
- `@react-pdf/renderer` **approvata**; **nessun'altra** install senza chiedere conferma.
- **NON deployare. NON mergiare.** Lo sponsor rivede il risultato sul branch prima del merge.
- Esegui `npm run build && npm run lint && npm run test` prima di dichiarare completato. Committa per sotto-task logico.
- Migrazioni DB: **non previste** in questo step.

## Fuori scope (NON fare)
- Link pubblico condivisibile `/r/[token]` (step b di GROW-3 — rimandato).
- Allegato PDF all'email lead (rimandato).
- Qualunque modifica a SES/Encharge o al funnel oltre al bottone.

## Deliverable atteso (report di handoff del chip)
- Branch pushato; `build`/`lint`/`test` verdi.
- Un **PDF di esempio** allegato/salvato + come testare il download in locale.
- Nota di handoff: file toccati, scelte di layout, eventuali caveat, e conferma che nulla è stato deployato/mergiato.
