# Analisi: gating della pagina risultati per ridurre il drop-off

> Analisi multi-prospettiva (3 lenti indipendenti: CRO/conversione, Trust/brand B2B, Dati/sperimentazione) + sintesi PM. Data: 2026-05-29.
> Innesco: ipotesi sponsor — "la pagina risultati gratis rivela troppo → l'utente è soddisfatto e se ne va senza lasciare i contatti; rendiamola un teaser e spostiamo più valore dietro il form".

## Stato attuale (ancorato al codice)
Funnel: landing → istruzioni → contesto → quiz → **RISULTATI** → **FORM CONTATTI** → **REPORT** → grazie.

- **RISULTATI** (`src/components/quiz/Results.tsx`, gratis, pre-form): punteggio complessivo + etichetta livello, **grafico ragno completo** (azienda vs obiettivo DA 90gg), **tabella di tutti e 6 i punteggi** con livelli, messaggio contestuale, CTA "Ottieni il report gratuito". *(qui avviene già la cattura anonima senza PII via `/api/track-result`)*
- **REPORT** (`src/components/quiz/Report.tsx`, gated, post-form): ripete score+ragno; **aggiunge** dettaglio per asse (descrizione livello, "Rischio concreto", "Opportunità che stai perdendo", "Obiettivo post-programma"), **checklist compliance** (7 aree: AI Act/GDPR/L.132/2025), "Prossimi passi" + CTA "Prenota una call".

**Fatto chiave**: il report completo è **già gated**. La pagina gratis mostra il *dato* dell'utente; il report aggiunge l'*interpretazione esperta*.

## Sintesi delle 3 lenti (convergenti)
- **CRO/conversione**: non amputare lo scorecard (distrugge endowment/reciprocità). Leva vera = gatare l'interpretazione (già così) **+ aggiungere un teaser di curiosità** ("3 rischi compliance rilevati — sbloccali"; "il tuo asse più debole è X"). Gating più spinto → volume giù, *intento su* (ok per vendita consultiva), ma solo validato in A/B.
- **Trust/brand B2B (PMI IT)**: il più contrario all'amputazione. Togliere il "loro" punteggio = bait-and-switch → lead "munto" che apre la call in difensiva. Il dato dell'utente è suo; la vostra lettura è gatabile. Struttura attuale ben tarata: agire sul **form** e su un teaser, non sui risultati. Nel passaparola PMI la trasparenza *è* il prodotto.
- **Dati/sperimentazione**: non decidere ora (GROW-1 è di oggi, zero dati). Misurare **R1 = lead_form_viewed / results_viewed**: < ~45% → problema reale; > ~70% → il collo è il *form*, non i risultati. A/B richiede ~3-6 settimane a questo traffico (solo effetti grandi rilevabili).

## Principio guida
> **Il dato grezzo dell'utente (punteggio + ragno + 6 score) resta gratis. L'interpretazione esperta (rischi/opportunità, compliance, azioni) si gata legittimamente.** È già la linea attuale — la si rispetta, non la si sposta.

## Raccomandazione: piano a fasi (no rollout cieco)
1. **Fase 0 (economica, basso rischio)** — sostenuta da tutte e 3 le lenti:
   - **Teaser di curiosità** sulla pagina risultati (es. "🔒 Nel report: N rischi compliance + il tuo asse più debole è *X*"): apre il loop senza togliere nulla.
   - **Eventi diagnostici** (estendono GROW-1): `get_report_clicked`, `results_scroll_50/90`, `lead_form_abandoned`.
2. **Fase 1 (dopo 1-2 settimane di dati)**: leggere **R1**. Solo se basso *e* scroll/click confermano "appagati e via" → **A/B** teaser vs attuale; primaria `lead_submitted / results_viewed`; guard-rail su **qualità lead** (email aziendali, no-show), non solo tasso di compilazione.
3. **Mai**: amputare ragno + punteggi.

## Dipendenze / coerenza
- Stessa dipendenza-dati di **PROD-3** (exit-intent): entrambi ottimizzano il gate results→form. Trattarli come unico tema "ottimizzazione funnel", da decidere insieme coi numeri (~2 settimane).
- **GROW-3** (report PDF) è indipendente da questa analisi (PDF = value-add del report già gated), ma per scelta dello sponsor è **in pausa** finché la direzione funnel non è decisa.

## Fonti
- Heyflow — reveal prima dell'email converte 3-5x: https://heyflow.com/blog/personalized-results-quiz-funnel/
- ProvenROI — gated vs ungated content (lead-gen): https://www.provenroi.com/blog/choose-gated-vs-ungated-content-strategy-for-lead-generation
- Lead Alchemists — Zeigarnik effect / curiosity gap: https://www.leadalchemists.com/marketing-psychology/ziegarnik-effect/
