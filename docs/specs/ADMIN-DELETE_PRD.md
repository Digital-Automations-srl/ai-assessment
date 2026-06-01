# Feature: Admin — cancellazione record (hard delete + conferma + audit)

> PRD preparato in sessione PM, 2026-05-29. Scelta sponsor: Option A (hard delete).

## Obiettivo
Dare all'admin un modo **semplice** per cancellare definitivamente un singolo record (tipicamente record di test) dal dettaglio lead, con conferma e tracciamento.

## Decisione (presa)
Hard delete reale, **per record singolo**, dal dettaglio `/admin/[id]`. Conferma obbligatoria + log su `admin_audit`. **Nessuna migrazione DB**: la colonna `admin_audit.event` è `text` (non enum), quindi il nuovo valore `delete` non richiede schema change; la cancellazione è una semplice `DELETE` su `submissions`.

## Interventi
1. **Route** `POST /api/admin/delete` (nuova):
   - Protetta dall'auth del **proxy** (come le altre `/api/admin/*`; NON esente come il login). Verifica che `proxy.ts` la copra (non aggiungerla agli esenti).
   - Body: `{ id }`. Cancella: `supabaseAdmin.from("submissions").delete().eq("id", id)`.
   - Audit: `recordAudit({ event: "delete", outcome: "ok"|"error", path:"/api/admin/delete", method:"POST", ip, userAgent, detail: { id } })`. ⚠️ **NIENTE PII nell'audit** (solo `id`, al più `status`; **NO** email/nome), coerente con la policy dell'export.
   - `ADMIN_MOCK=1`: **no-op sicuro** (ritorna ok senza toccare nulla, non crasha).
   - Errori come la route export: config mancante → 503; altro → 500.
2. **Componente client** `src/components/admin/DeleteSubmissionButton.tsx`:
   - Bottone "Elimina record" (stile destructive/rosso).
   - **Dialog di conferma** che mostra **nome + email** del record: «Eliminare definitivamente il lead di "Nome" / email? Azione irreversibile.»
   - Al conferma: `fetch("/api/admin/delete", { method:"POST", ... })` → on success `router.push("/admin")` (torna alla lista). Gestire stato di errore visibile.
3. **Dettaglio** `src/app/admin/[id]/page.tsx`: rendere `DeleteSubmissionButton` passando `id`, `nome`, `email` del record.
4. **Audit type** `src/lib/admin/audit.ts`: aggiungere `"delete"` all'union `AuditEvent` (+ breve commento). Nessuna modifica DB.

## Acceptance Criteria
1. Sul dettaglio `/admin/[id]` c'è "Elimina record" che, **dopo conferma esplicita** (mostra nome+email), cancella il record e riporta a `/admin`.
2. Cancellazione **server-side** via `supabaseAdmin` (secret key), per `id`, **protetta dall'auth**.
3. Loggata su `admin_audit` con `event="delete"` e `detail.id` (**senza PII**).
4. `ADMIN_MOCK=1` non crasha (no-op).
5. **Nessun delete a un solo click** (serve la conferma).
6. `build`/`lint`/`test` verdi (aggiungi se fattibile un test sulla route, sul pattern di `tests/integration-routes.test.ts`).

## Vincoli
- **Worktree isolata**, branch dedicato (es. `claude/admin-delete`). **MAI in-place**.
- **Nessuna migrazione DB** (event è text). **Nessuna nuova dipendenza.**
- **NON deployare. NON mergiare** (PM rivede). NON toccare il quiz/funnel pubblico né `send-report`/`track-result`.
- `build`/`lint`/`test` verdi; commit per sotto-task; pusha il branch.

## Fuori scope
- Soft delete / archiviazione (Option B, scartata). Bulk delete (Option C). Undo/cestino. Cancellazione massiva.

## Deliverable (handoff)
Branch pushato; `build`/`lint`/`test` verdi; **screenshot** del dettaglio col bottone + dialog di conferma; nota su come testare (incluso comportamento con `ADMIN_MOCK=1`). Conferma esplicita di NON aver deployato/mergiato.
