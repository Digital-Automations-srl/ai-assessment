# Session Handoff — AI Readiness Assessment

> Aggiornato: 2026-05-14
> Leggi questo file all'avvio di una **sessione PM** ("avvia una sessione di PM").
> Ruolo PM: pianifica, coordina, verifica quality gate. **NON modificare codice.**
> Template prompt PM completo: `docs/coproduzione/PROMPT-PM.md`

## Stato progetto

- **Repo**: https://github.com/Digital-Automations-srl/ai-assessment (branch `main`)
- **Deploy**: Vercel, auto-deploy da push su `main` → `aiassessment.digitalautomations.it`
- **DB**: Supabase (`ssifdqiwmuktemixiubz.supabase.co`), salvataggio lead non bloccante
- **Stack**: Next.js 16, React 19, TS, Tailwind 4. Email via AWS SES SMTP. Webhook Encharge.

## Lavoro completato in questa sessione (committato)

1. **Grafico a ragno più grande** nelle pagine web Report e Results
   - `SpiderChart.tsx`: padding 70 → 85 (evita label tagliate)
   - `Report.tsx` e `Results.tsx`: size 380 → 520
2. **Fix bug hydration Plausible** — `layout.tsx`: migrato da tag `<script>` nativi
   nel `<head>` al componente `<Script>` di Next.js (`strategy="afterInteractive"`)
3. **Grafico spider chart inline nella mail interna** — `email.ts`: aggiunto
   `<img src="cid:spider-chart">` in `buildInternalEmail` (prima il grafico c'era
   solo come allegato CID nella mail al lead)
4. Verifiche fatte: `npm run build` + `npm run lint` OK, test visivi via preview MCP
   (desktop + mobile), nessuna label tagliata.

Nota CTA: il link `https://landing.digitalautomations.it/demo-ai-stater-program`
(in `Report.tsx` e `email.ts`) è stato verificato — la pagina **carica**
correttamente. Il team l'aveva segnalato come "rotto" ma l'URL è quello fornito
dal marketing e risponde. La variante con "starter" dà 404. Se il team insiste,
il problema è lato landing page, non nel codice.

## DECISIONE APERTA — config Spider Chart

L'utente ha chiesto opzioni di posizionamento label per il grafico. Creata una
pagina di confronto temporanea: `src/app/test-chart-options/page.tsx` (route
`/test-chart-options`, 6 varianti A–F). **File NON committato** (resta su disco,
untracked). L'utente deve scegliere quale config applicare a `SpiderChart.tsx`.

Opzioni proposte:
- **A** Attuale (padding 85, labelOffset 32, fontSize 13)
- **B** Label più distanti (labelOffset 40)
- **C** Font più grande + bold (fontSize 14, weight 700, padding 90)
- **D** Grafico più grande, label compatte (maxRadius 0.44, labelOffset 28)
- **E** Fine-tuned con offset verticali per asse
- **F** Elegante equilibrato (maxRadius 0.43, labelOffset 36, micro-adjust)

→ **Quando l'utente sceglie**: applicare la config a `SpiderChart.tsx`, poi
**eliminare** `src/app/test-chart-options/`. Build + lint prima di committare.

## Pulizia in sospeso

- `src/app/test-chart-options/` — rimuovere dopo la decisione sul grafico
- `scripts/send-test-reports.ts` — script di test vecchio, valutare se rimuovere

## Note operative

- `.env.local` ha i secret SMTP/Supabase/Encharge — mai committare
- Quiz interamente client-side, state machine in `src/app/page.tsx`
- Specifiche complete: `docs/specs/QUIZ_SPECS.md`
- Regole co-produzione: `.claude/rules/coproduzione.md`
