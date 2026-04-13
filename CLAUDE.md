# AI Readiness Assessment

## Progetto

Quiz di autovalutazione AI Readiness per PMI italiane. Misura la maturita' AI su 6 assi (30 domande), produce un grafico a ragno SVG, una checklist compliance su 7 aree obbligatorie, e raccoglie lead per follow-up commerciale.

Dominio: `aiassessment.digitalautomations.it`

## Stack Tecnologico

- **Frontend + Backend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Email**: Nodemailer via AWS SES SMTP
- **Analytics**: Plausible
- **Deploy**: Vercel (auto-deploy da GitHub)
- **Database**: Nessuno (tutto client-side, dati inviati via email)

## Comandi

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Build produzione
npm run lint         # ESLint
```

## Struttura Cartelle

```
src/
  app/
    page.tsx                    # Orchestratore quiz (state machine)
    layout.tsx                  # Root layout + metadata + Plausible
    globals.css                 # Tailwind + variabili colore DA
    api/send-report/route.ts    # API POST: invio email report
  components/quiz/
    Header.tsx                  # Header fisso
    Landing.tsx                 # Step 1: landing page
    Instructions.tsx            # Step 2: istruzioni pre-quiz
    ContextPage.tsx             # Step 3: 3 domande contesto (una pagina)
    AxisPage.tsx                # Step 4: 5 domande per asse (una pagina per asse)
    ProgressBar.tsx             # Barra progresso per asse
    SpiderChart.tsx             # Grafico a ragno SVG
    Results.tsx                 # Step 5: risultato gratuito
    LeadForm.tsx                # Step 6: form cattura lead
    Report.tsx                  # Step 7: report dettagliato
    ComplianceChecklist.tsx     # 7 aree compliance con semaforo
    ThankYou.tsx                # Step 8: conferma
  lib/
    quiz-data.ts                # 33 domande (3 contesto + 30 quiz)
    scoring.ts                  # Calcolo punteggi, livelli, compliance
    email.ts                    # Template email HTML (lead + interno)
    types.ts                    # Tipi TypeScript
docs/
  specs/                        # Specifiche quiz e componente ragno JSX
  coproduzione/                 # Manuali co-produzione
```

## Convenzioni

- **Naming file**: PascalCase per componenti (`AxisPage.tsx`)
- **Lingua**: codice in inglese, UI in italiano
- **Import**: path alias `@/` per `src/`
- **Componenti**: tutti `"use client"` (quiz e' interamente client-side)
- **Colori DA**: Navy #004172, Blue #016FC0, Light Gray #E4E4E4, Amber #E09900

## Note Tecniche

- Il quiz e' una state machine client-side: landing → instructions → context → quiz (6 assi) → results → lead-form → report → thank-you
- Email inviate via API route `/api/send-report` (POST) con nodemailer + AWS SES SMTP
- Due email: una al lead (report), una a digital@digitalautomations.it (notifica interna)
- Il file `.env.local` contiene i secret SMTP — non committare mai
- Specifiche complete: `docs/specs/QUIZ_SPECS.md`
- Scoring: G2 opzione C = 2.5 (non standard), "Non so" = 1.5

## Regole di Sessione

- Esegui `npm run build && npm run lint` prima di dichiarare completato
- NON installare pacchetti senza approvazione
- Committa al completamento di ogni sotto-task logico
