# Regole di Co-Produzione AI
<!-- v1.7 — Riferimento per gli umani: il manuale completo e' nel file MANUALE-COPRODUZIONE-AI
     (nella posizione scelta durante il setup). NON leggerlo durante le sessioni di lavoro,
     queste regole sono autosufficienti. -->

---

## Comportamento Obbligatorio

1. Quando ricevi un task complesso (3+ file coinvolti), proponi SEMPRE un piano prima di scrivere codice. Non procedere senza approvazione
2. Dopo ogni implementazione, esegui `build`, `lint` e test suite prima di dichiarare completato. Se falliscono, fixa
3. NON installare pacchetti (npm/pip/cargo) senza approvazione esplicita
4. NON creare file di migration SQL/DB senza approvazione esplicita
5. Se il task/PRD e' ambiguo o incompleto, chiedi chiarimento. NON procedere con assunzioni
6. Modifica SOLO i file necessari per il task. Non toccare file fuori scope
7. Committa al completamento di ogni sotto-task logico, non accumulare tutto in un commit gigante
8. Documenta decisioni architetturali non ovvie nel commit message o nel CLAUDE.md

---

## Situazioni Problematiche

| Situazione | Azione |
|-----------|--------|
| Build fallisce | Fixare PRIMA di dichiarare completato. Dopo 3 tentativi, segnala e chiedi aiuto |
| Errori TypeScript irrisolvibili | Verifica tipi generati. NON usare `any` o `@ts-ignore` come workaround |
| PRD incompleto/ambiguo | Elenca domande aperte e FERMATI. In headless: scrivi in `.claude/questions/` |
| File si contraddicono | Segnala la contraddizione. NON scegliere arbitrariamente quale seguire |
| Test esistenti falliscono | Se causato da tue modifiche: fixa. Se pre-existing: segnala e procedi |
| Scope piu' ampio del previsto | Comunica PRIMA di procedere. Attendi approvazione |
| Dipendenza circolare | Fermati e proponi alternativa architetturale |

---

## Quando Fermarsi e Chiedere

Fermati SEMPRE se:
- Il task e' radicalmente diverso da come descritto nel PRD
- Il fix richiede modifiche a 10+ file non previsti
- Non sei sicuro di capire il requisito
- Stai per modificare auth, pagamento, o dati personali senza review esplicita

---

## Template PRD

```markdown
# Feature: [Nome]

## Obiettivo
[Una frase: outcome, non implementazione]

## Acceptance Criteria
1. [Criterio verificabile 1]
2. [Criterio verificabile 2]
3. [Criterio verificabile 3]

## File da modificare
- `path/to/file.ts` — [cosa fare]

## Vincoli
- [Vincolo tecnico 1]
- [Vincolo tecnico 2]

## Fuori scope
- [Cosa NON fare]
```

---

## Template Prompt Sessione

```markdown
Sessione: [Wave X] - [Nome Task]
Branch: claude/waveX-[lettera]

## Contesto
Leggi: [lista file rilevanti, max 3-4]

## Obiettivo
[Descrizione + acceptance criteria]

## Vincoli
- NON modificare file al di fuori di: [lista]
- NON installare dipendenze
- Committa e pusha quando hai finito
```

---

## Sessione PM vs Sessione Operativa

Se stai ricevendo questo prompt in una **sessione PM**: il tuo ruolo e' pianificare, non implementare. NON modificare codice. Leggi lo stato del progetto, gestisci il backlog, scrivi prompt di lancio per le sessioni operative, e verifica quality gate dopo le wave.

Se stai ricevendo questo prompt in una **sessione operativa**: segui il prompt di lancio ricevuto, lavora solo sui file assegnati, e segui la checklist pre/post-wave sotto.

---

## Checklist Pre-Wave

- [ ] PRD pronti (anche informali)
- [ ] `git status` pulito sul main
- [ ] Nessuna sessione parallela sugli stessi file
- [ ] Designato migration leader e dependency leader (se applicabile)

## Checklist Post-Wave

- [ ] Tutte le sessioni hanno pushato
- [ ] Merge dei branch (uno alla volta)
- [ ] Build + lint passano
- [ ] Sessione di test lanciata
- [ ] CLAUDE.md aggiornato con note dalla wave

---

## Anti-Pattern da Evitare

| Anti-Pattern | Cosa fare invece |
|-------------|-----------------|
| Rubber stamp (approvo senza leggere) | Leggere ogni riga del diff |
| One-shotting (tutto in un colpo) | Task piccoli, plan mode |
| Context stuffing (20 file nel prompt) | Max 3-4 file specifici |
| Session marathon (3+ ore) | Sprint 30-90 min + `/compact` |
| Vague prompting ("aggiungi X") | PRD con acceptance criteria |
| CLAUDE.md bloat | ~200-300 righe, il resto in `.claude/rules/` |
| Premature completion (dichiaro "fatto" senza test) | Verifica acceptance criteria + test prima di dichiarare completato |
| Silent regression (tocco file non correlati) | Modifica SOLO file nel scope del task. "Perche' hai toccato questo file?" |
| Prompt leaking (copio output tra sessioni) | Ogni sessione parte pulita. Non copia-incollare output grezzi |
| Happy path only (niente edge case) | Testare anche input vuoti, null, e limiti |
| Model mismatch (modello sbagliato per il task) | Scegli per complessita': Opus per ragionamento profondo, Sonnet per lavoro quotidiano |

---

## Modello Default

- **Sonnet 4.6**: lavoro quotidiano (implementazione, bug fix, test, refactoring standard)
- **Opus 4.6**: planning, architettura, refactoring large-scale, debugging complesso, task ambigui
- **Haiku 4.5**: subagent (esplorazione, review automatica, CRUD, docs)
- **opusplan**: alias consigliato per sessioni miste (`--model opusplan`)
- Scegli per complessita' del task, non per costo
- Usa `/compact` tra sprint con summary esplicito
