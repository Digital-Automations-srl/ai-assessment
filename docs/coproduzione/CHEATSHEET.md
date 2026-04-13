# Claude Code — Cheatsheet

> **v1.7** — Quick reference dal [Manuale di Co-Produzione AI](MANUALE-COPRODUZIONE-AI.md). Stampabile su 1 pagina A4.

## Setup Iniziale

| Comando | Cosa fa |
|---------|---------|
| `npm install -g @anthropic-ai/claude-code` | Installa Claude Code |
| `claude` | Avvia sessione interattiva |
| `/init` | Genera CLAUDE.md di partenza |
| `/permissions` | Configura permessi tool |
| `cp coproduzione.md .claude/rules/` | Installa regole operative AI |

## Sessione Base

| Comando | Cosa fa |
|---------|---------|
| `claude` | Sessione interattiva (supervisione piena) |
| `claude --model opusplan` | Opus per planning, Sonnet per esecuzione |
| `claude --mode plan` | Forza plan-then-execute |
| `claude --mode auto-accept` | Auto-approva edit file |
| `claude --resume` | Riprende ultima sessione interrotta |
| `claude --continue "prompt"` | Riprende e aggiunge istruzioni |
| `claude --verbose` | Mostra dettagli interni (debug) |

## Worktree e Wave

| Comando | Cosa fa |
|---------|---------|
| `claude -w wave1-a` | Crea worktree isolato + sessione |
| `git merge claude/wave1-a` | Merge branch completato |
| `git worktree prune` | Pulizia worktree stale |
| `git branch -d claude/wave1-a` | Elimina branch post-merge |
| `git diff main...claude/wave1-a --name-only` | Verifica file overlap pre-merge |

**Wave parallele** — 2 task indipendenti in terminali separati:
```bash
# Terminale 1 (interattivo)        # Terminale 2 (headless)
claude -w wave1-a                   claude -p -w wave1-b \
                                      --dangerously-skip-permissions \
                                      "$(cat docs/prd/PRD-02.md)"
```

## Comandi In-Session

| Comando | Cosa fa |
|---------|---------|
| `/compact with summary: ...` | Comprimi contesto con riassunto esplicito |
| `/remember` | Salva decisione nella memoria permanente |
| `/model` | Cambia livello effort del modello |
| `/worktree` | Crea worktree da dentro la sessione |

**Plan Mode**: Claude propone piano → rivedi → approva → implementa. Attivabile con `--mode plan` o automaticamente su task complessi.

## Flag Headless / CI

| Flag | Cosa fa |
|------|---------|
| `-p "prompt"` / `--print` | Esecuzione non-interattiva |
| `--dangerously-skip-permissions` | Salta tutti i permessi (solo sandbox) |
| `--allowedTools "Read,Edit,..."` | Restringe tool disponibili |
| `--max-turns N` | Limita iterazioni (safety net) |
| `-w <name>` / `--worktree` | Worktree isolato |

**Esempio CI completo:**
```bash
claude -p --dangerously-skip-permissions --max-turns 50 \
  -w feature-x "$(cat docs/prd/PRD-01.md)"
```

## Troubleshooting Rapido

| Problema | Soluzione |
|----------|----------|
| Claude ignora il CLAUDE.md | Verifica che sia nella root del progetto. Usa `/compact` per ricaricarlo |
| Sessione si blocca / loop | `--max-turns N` per limitare. Ctrl+C e riparti con prompt piu' specifico |
| Contesto esaurito | `/compact with summary: [stato attuale]` — oppure nuova sessione |
| Conflitto merge tra wave | `git diff main...branch --name-only` pre-merge. PRD su file diversi |
| Worktree orfano | `git worktree prune && git worktree list` per verificare |
