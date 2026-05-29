# Handoff — Funnel Fase 0 (teaser curiosità + eventi diagnostici)

> Sessione operativa, 2026-05-29. Branch: `claude/funnel-fase0` (pushato su origin).
> PRD: `docs/specs/FUNNEL-FASE0_PRD.md` · Razionale: `docs/FUNNEL-GATING-ANALYSIS.md`.
> **Data di rilascio (per confronto pre/post): 2026-05-29** — da confermare al merge/deploy.

## Stato
- Branch `claude/funnel-fase0` pushato (2 commit feature + questo handoff).
- `npm run build` · `npm run lint` · `npm run test` (175 test) **tutti verdi**.
- **NON deployato. NON mergiato.** Lo sponsor rivede sul branch.
- Lavorato in **worktree isolata** (`.claude/worktrees/funnel-fase0`), mai in-place su main.

## File toccati (5, diff +210/-2)
- `src/lib/plausible.ts` — aggiunto `trackOnce()` (emissione una-tantum per caricamento pagina, riusa `track()`).
- `src/components/quiz/Results.tsx` — teaser di curiosità + scroll-depth + `get_report_clicked`.
- `src/components/quiz/LeadForm.tsx` — `lead_form_abandoned` su uscita pagina senza submit.
- `src/app/page.tsx` — calcola e passa a `Results` `complianceRiskCount` + `weakestAxisLabel` (diff minimo).
- `tests/components.test.tsx` — 6 test sul teaser (conteggio plurale/singolare, hiding a 0, scorecard intatta, CTA).

## Parte A — Teaser (nessuna rimozione di ciò che è gratis)
Card ambra vicino alla CTA. Mostra:
- 🔒 **N rischi di conformità rilevati** — `N` = aree compliance NON verdi (rosse o gialle) da `scoring.ts`. Solo il **conteggio**, non quali.
- 🎯 **Il tuo punto più debole: «<asse>»** — solo il **nome** dell'asse col punteggio minimo, non l'analisi.
- Microcopy che inquadra il report come *"piano d'azione personalizzato"* (no paywall).
- La riga rischi si nasconde se `N = 0`; l'intero teaser si nasconde se non ci sono dati.

**Invariati e verificati**: punteggio complessivo, grafico ragno, tabella dei 6 punteggi, messaggio contestuale, CTA. Si è solo AGGIUNTO il teaser.

> **Decisione da validare (PM)**: ho contato come "rischi di conformità" le aree **non verdi (rosse+gialle)**, non solo le rosse. Motivo: matcha la microcopy ("rilevati"), evita l'anticlimax "0 rischi" per aziende mediamente conformi, ed è onesto (sono le aree che il report segnala). Per passare a sole-rosse è una modifica di una riga in `page.tsx` (`c.color === "red"`).

## Parte B — Eventi diagnostici (Plausible, via `track`/`trackOnce`)
| Evento | Quando | Note |
|---|---|---|
| `get_report_clicked` | click sulla CTA "Ottieni il report gratuito" | distingue "non interessato" da "non ha visto la CTA" |
| `results_scroll_50` / `results_scroll_90` | scroll ≥50% / ≥90% della pagina risultati | **una sola volta per soglia per sessione** (`trackOnce`) |
| `lead_form_abandoned` | l'utente lascia la pagina del form senza inviare | `pagehide` (chiusura tab, refresh, back); **non** su unmount → safe con React Strict Mode |

Nessun PII negli eventi. `lead_form_viewed` e `lead_submitted` restano quelli di GROW-1.

## Come verificarli in locale
1. `npm run dev` e completa il quiz fino ai risultati.
2. In console, per intercettare gli eventi senza inviarli a Plausible (che comunque **ignora `localhost`** di default):
   ```js
   window.__ev = []; window.plausible = (e) => window.__ev.push(e);
   ```
   poi naviga e leggi `window.__ev`.
3. Sequenza attesa: `…axis_6_completed → results_viewed → results_scroll_50 → results_scroll_90 → get_report_clicked → lead_form_viewed → lead_form_abandoned`.
4. Verifica anti-duplicato: ri-emetti `scroll` / `pagehide` → l'evento non si ripete (trackOnce).

> Verifica eseguita in questa sessione su localhost guidando il quiz via DOM, con `fetch` di `/api/track-result` **stubbato** (nessuna scrittura sul DB di produzione) e `window.plausible` catturato in locale (nessun evento reale inviato). Tutti gli eventi confermati; teaser confermato ("7 rischi di conformità rilevati" + "punto più debole: «Conformità»" con risposte tutte minime). Screenshot della pagina risultati col teaser allegato nel transcript della sessione.

## Misurazione (no A/B)
Rilascio a tutti; confronto **pre/post** su **R1 = lead_form_viewed / results_viewed** + nuovi eventi. Annotare la data di rilascio effettiva al merge.

## Vincoli rispettati
Nessuna nuova dipendenza · nessuna migrazione DB · nessun campo PII nuovo · `Report.tsx` e GROW-3 non toccati · diff su `page.tsx` minimo e localizzato.
