# Matrice opportunità di miglioramento — AI Readiness Assessment

> Fonte: analisi multi-agente read-only (6 analisti: prodotto, codice, dati, sicurezza, infra, crescita) + sintesi. Data: 2026-05-29.
> Scoring: **priorità = impatto × fit × fattibilità / 5** (range 1-25). Scale 1-5 (5 = migliore).
> Backlog per le prossime sessioni operative. Aggiornare quando un item viene completato.

## Matrice completa (ordinata per priorità)

| ID | Opportunità | Area | Fatt | Imp | Fit | Prio | Quadrante | Effort | Wave |
|---|---|---|:--:|:--:|:--:|:--:|---|---|:--:|
| GROW-1 | Plausible custom events (funnel quiz per step) | Crescita | 5 | 5 | 5 | 25 | quick-win | 2-3h | 1 |
| INFRA-2 | Backup automatici Supabase + health-check periodico | Infra | 4 | 5 | 5 | 20 | quick-win | 1-2g | 1 |
| SEC-1 | `ADMIN_SESSION_SECRET` obbligatorio in produzione | Sicurezza | 5 | 4 | 5 | 20 | quick-win | 1-2h | 1 |
| GROW-2 | Nurturing Encharge per tier + gap d'asse | Crescita | 4 | 5 | 5 | 20 | quick-win | 4-6g | **2** |
| DATA-1 | Tracking UTM / source-medium sui lead | Dati | 4 | 4 | 5 | 16 | quick-win | 2-3g | 1 |
| GROW-3 | Report condivisibile + PDF brandizzato DA | Prodotto | 4 | 4 | 5 | 16 | quick-win | 3-5g | **2** |
| SEC-3 | Audit log accessi/export dashboard admin | Sicurezza | 4 | 4 | 5 | 16 | quick-win | 3-4h | 1 |
| INFRA-3 | SES bounce/complaint + deliverability | Infra | 5 | 4 | 4 | 16 | quick-win | 1-2g | **2** |
| OBS-1 ★ | Observability + alerting (DB/email/webhook) | Infra | 3 | 5 | 5 | 15 | big-bet | 4-7h | 1 |
| PROD-2 ⚖️ | Form a frizione ridotta (consenso mkt opt-in) | Prodotto | 3 | 5 | 5 | 15 | big-bet | 3-4h* | **2** |
| DATA-2 | Lead scoring + segnali comportamentali quiz | Dati | 4 | 4 | 4 | 12.8 | quick-win | 2-3g | 1 |
| PROD-3 | Exit-intent: cattura email-only chi abbandona | Crescita | 4 | 4 | 4 | 12.8 | quick-win | 3-4g | **2** |
| SEC-2 | Rimuovere policy RLS insert-anonimo always-true | Sicurezza | 5 | 3 | 4 | 12 | quick-win | 0.5-1h | 1 |
| CODE-1 | Esternalizzare `font-data.ts` (1.1MB) | Codice | 5 | 3 | 4 | 12 | quick-win | 1.5-3h | 1 |
| CODE-2 | E2e test quiz pubblico + integrazione DB | Codice | 3 | 4 | 5 | 12 | big-bet | 3-5g | 1 |
| GROW-6 | CRM bidirezionale + monitoring sync Encharge | Crescita | 3 | 5 | 4 | 12 | big-bet | 5-7g | **2** |
| PROD-1 | Quiz inline + progress per-domanda | Prodotto | 4 | 3 | 4 | 9.6 | fill-in | 4-5h | 1 |
| GROW-4 | Benchmark pubblico anonimo (lead magnet) | Crescita | 3 | 4 | 4 | 9.6 | big-bet | 4-6g | **2** |
| CODE-3 | Design tokens DA centralizzati (227 hex sparsi) | Codice | 5 | 2 | 4 | 8 | fill-in | 2-4h | 1 |
| GROW-5 † | i18n IT+EN (espansione UE) | Crescita | 3 | 4 | 3 | 7.2 | big-bet | 5-8g | **2** |

★ **OBS-1 = fondante** (causa-radice dell'incidente pausa Supabase che ha perso 24 lead; prerequisito di GROW-2/GROW-6) · ⚖️ **PROD-2** tocca consenso/GDPR → review legale/sponsor · † **GROW-5 fit basso** (UE non è obiettivo dichiarato)

## Quadranti (Impatto × Fattibilità)
- **Quick-win** (imp≥4, fatt≥4): GROW-1, INFRA-2, SEC-1, GROW-2, DATA-1, GROW-3, SEC-3, INFRA-3, DATA-2, PROD-3
- **Big-bet** (imp≥4, fatt≤3): OBS-1, PROD-2, CODE-2, GROW-6, GROW-4, GROW-5
- **Fill-in** (imp≤3, fatt≥4): SEC-2, CODE-1, PROD-1, CODE-3
- **Questionable**: nessuna

## Piano a due wave

> **Split confermato dallo sponsor (2026-05-29).** Wave 1 in esecuzione via sessione operativa (branch `claude/wave1-tech`, chip autonomo: interazioni solo a inizio/fine). **PROD-1 escluso dalla Wave 1** e rinviato a *dopo* i dati di funnel di GROW-1 (l'impatto sull'abbandono è presunto senza dati di drop-off reali).

### Wave 1 — Miglioramento tecnico (interno, shippabile insieme) — ✅ COMPLETATA (2026-05-29, merge `0b88187` → prod)
Interventi interni al sistema: nessuna coordinazione con piattaforme esterne, nessun cambio nell'ingaggio col cliente.
**OBS-1 (per primo)** · SEC-1 · SEC-2 · SEC-3 · CODE-1 · CODE-2 · CODE-3 · DATA-1 · DATA-2 · GROW-1 — **tutti consegnati e mergiati** (gate verificato in sessione PM: build/lint ok, vitest 169/169, e2e 3/3; env + 2 migrazioni SQL applicate).
**Non inclusi**: `INFRA-2` (backup Supabase + health-check) **rimane aperto** in backlog; `PROD-1` (quiz inline) rinviato a *dopo* i dati di funnel di GROW-1.

Caveat: richiedono **approvazione** per regola co-produzione → migrazioni DB: SEC-3, DATA-1, DATA-2; nuova dipendenza: CODE-2 (Playwright). `GROW-1`/`DATA-1` servono il marketing ma l'implementazione è interna (borderline, qui in Wave 1).

### Wave 2 — Opzionale: tool esterni / azioni proattive sul cliente / decisioni business
Toccano integrazioni esterne (Encharge/CRM/AWS SES) o l'ingaggio proattivo del cliente (outreach, cattura, asset marketing) o richiedono decisioni di business/legali.
**GROW-2** (nurturing Encharge) · **GROW-6** (CRM + sync) · **INFRA-3** (config AWS SES) · **GROW-3** (report condivisibile/marketing) · **PROD-3** (exit-intent capture + consenso) · **PROD-2** (consenso/GDPR — review legale) · **GROW-4** (benchmark pubblico) · **GROW-5** (i18n — strategico)

## Sequenza consigliata
1. **Prima ondata (costo-ore)**: GROW-1, SEC-1, SEC-2, CODE-1, SEC-3 + **OBS-1** (fondante).
2. **Affidabilità dato**: INFRA-2.
3. **Resto Wave 1**: DATA-1, DATA-2, CODE-2, CODE-3, PROD-1.
4. **Wave 2** (quando affidabilità garantita + decisioni business prese): GROW-2 → DATA/CRM → asset marketing.

## Note metodologiche (dalla sintesi)
- Dedup: 42 proposte grezze → 20. OBS-1 ha assorbito 6 proposte convergenti di observability (tema più ripetuto).
- Verifiche su codice (fatti): `font-data.ts` = 1.168.805 byte; 227 occorrenze hex in `src/`; nessuna cartella e2e; `auth.ts` L17 fallback `ADMIN_SESSION_SECRET||ADMIN_PASSWORD`; `send-report` webhook Encharge `.catch->console.error` senza retry/await.
- Migrazioni → SQL Editor Supabase a mano (dev non raggiunge il DB).
