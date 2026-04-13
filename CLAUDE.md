<!-- Template v1.7 — manuale-coproduzione -->
# Nome Progetto

<!-- Sostituisci con il nome del tuo progetto -->

## Progetto

<!-- 1-2 frasi: cosa fa il progetto, per chi, obiettivo principale -->
App web per [descrizione breve]. Stack: Next.js + PostgreSQL su Vercel.

## Stack Tecnologico

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js v5
- **Deploy**: Vercel
<!-- Aggiungi o rimuovi voci in base al tuo stack reale -->

## Comandi

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Build produzione
npm run lint         # ESLint
npm test             # Vitest
npm run db:migrate   # Applica migration
npm run db:seed      # Seed dati di test
```
<!-- Sostituisci con i comandi reali del progetto. Includi TUTTI i comandi
     che Claude potrebbe dover eseguire: build, test, lint, dev, migration. -->

## Struttura Cartelle

```
src/
  app/           # Route e pagine (App Router)
  components/    # Componenti React riutilizzabili
  lib/           # Utility, client DB, helpers
  actions/       # Server Actions
  types/         # Tipi TypeScript condivisi
docs/
  prd/           # PRD per le feature
prisma/
  schema.prisma  # Schema database
```
<!-- Descrivi solo le directory principali. Aggiorna quando la struttura cambia. -->

## Convenzioni

- **Naming file**: kebab-case per file (`user-profile.tsx`), PascalCase per componenti (`UserProfile`)
- **Lingua**: codice e commenti in inglese, UI in italiano
- **Import**: path alias `@/` per `src/`
- **Componenti**: server component di default, `"use client"` solo se necessario
- **Error handling**: try/catch nelle Server Actions, error boundary per UI
<!-- Aggiungi convenzioni specifiche del progetto. Esempi concreti aiutano
     Claude a seguire i pattern esistenti. -->

## Note Tecniche

<!-- Inserisci qui gotcha, workaround, e decisioni architetturali non ovvie.
     Esempio: "Le API esterne X hanno rate limit di 100 req/min — usare il
     queue in src/lib/queue.ts" -->
- Le migration vanno create manualmente, MAI auto-generate da Claude
- Il file `.env.local` contiene i secret — non committare mai

## Regole di Sessione

- Usa plan mode per qualsiasi task non banale: 3+ passaggi, decisioni architetturali, o modifiche a 3+ file
- Per task complessi, usa subagenti per ricerca/analisi. Mantieni pulito il contesto principale. Un task per subagente
- Dopo una correzione dell'utente, registra il pattern in `.claude/rules/lessons.md`. Rivedi le lezioni a inizio sessione
- Esegui `npm run build && npm run lint && npm test` prima di dichiarare completato
- NON installare pacchetti senza approvazione
- NON creare migration DB senza approvazione
- Committa al completamento di ogni sotto-task logico
<!-- Aggiungi regole specifiche. Queste vengono lette ad ogni sessione e
     dopo ogni compaction del contesto — devono essere le piu' importanti. -->

## Workflow Co-Produzione

- Regole operative AI: `.claude/rules/coproduzione.md`
- Manuale co-produzione (riferimento umano): `docs/coproduzione/MANUALE-COPRODUZIONE-AI.md`
- Prompt sessione PM: `docs/coproduzione/PROMPT-PM.md`
<!-- Rimuovi questa sezione se non usi il manuale di co-produzione -->
