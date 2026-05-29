// Observability + delivery-reliability primitives. ZERO external dependencies
// (no Sentry/Datadog SDK). Used by the Node route handlers
// (`/api/send-report`, `/api/track-result`).
//
// Cosa fornisce:
//  - log strutturato a riga singola JSON (event, outcome, requestId, ts) →
//    greppabile nei log Vercel;
//  - consegna webhook AWAITED con retry limitato + backoff esponenziale +
//    timeout per tentativo (AbortController);
//  - contatore di fallimenti consecutivi per canale, per pilotare l'alerting.
//
// Privacy (vincolo CLAUDE.md): i record di log NON contengono PII (niente
// nome/email/telefono) ne' segreti. I chiamanti passano in `fields` solo
// scalari sicuri (conteggi, punteggi, booleani, status HTTP, eventualmente il
// dominio di un'email). La verifica post-scrittura del DB vive nella route (che
// possiede il client tipizzato) e usa `logEvent` per tracciare l'esito.

export type Outcome = "ok" | "error" | "warn";

/** Identificatore di richiesta per correlare i log di una singola invocazione. */
export function newRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback improbabile (Web Crypto assente): comunque univoco a sufficienza.
    return `req_${Date.now().toString(36)}_${Math.round(Math.random() * 1e6).toString(36)}`;
  }
}

/**
 * Emette una riga di log JSON strutturata su stdout/stderr in base all'esito.
 * Non lancia mai (un log rotto non deve rompere la richiesta).
 */
export function logEvent(
  event: string,
  outcome: Outcome,
  fields: Record<string, unknown> = {}
): void {
  const base = { ts: new Date().toISOString(), event, outcome };
  let line: string;
  try {
    line = JSON.stringify({ ...base, ...fields });
  } catch {
    // Campi non serializzabili: non perdere l'evento, scarta i campi.
    line = JSON.stringify({ ...base, _fieldsDropped: true });
  }
  if (outcome === "error") console.error(line);
  else if (outcome === "warn") console.warn(line);
  else console.log(line);
}

// ── Contatore fallimenti consecutivi per canale ────────────────────────────
// Stato a livello di modulo: in serverless e' per-istanza ed effimero (un cold
// start lo azzera). E' un best-effort per arricchire gli alert ("N-esimo
// fallimento consecutivo"), NON una metrica durevole. L'alert principale resta
// guidato dall'esito della singola richiesta (es. webhook esaurisce i retry).
const consecutive: Record<string, number> = {};

/** Incrementa e restituisce il numero di fallimenti consecutivi del canale. */
export function recordFailure(channel: string): number {
  consecutive[channel] = (consecutive[channel] ?? 0) + 1;
  return consecutive[channel];
}

/** Azzera il contatore del canale dopo un successo. */
export function recordSuccess(channel: string): void {
  consecutive[channel] = 0;
}

/** Fallimenti consecutivi correnti del canale (0 se nessuno). */
export function consecutiveFailures(channel: string): number {
  return consecutive[channel] ?? 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Consegna webhook affidabile ────────────────────────────────────────────
export interface WebhookResult {
  ok: boolean;
  attempts: number;
  status?: number;
  error?: string;
  /** Fallimenti consecutivi del canale dopo questa consegna (0 se ok). */
  consecutiveFailures: number;
}

export interface DeliverOptions {
  requestId: string;
  /** Nome canale per log + contatore (es. "encharge"). Default "webhook". */
  channel?: string;
  /** Tentativi massimi (incluso il primo). Default 3. */
  maxAttempts?: number;
  /** Timeout per singolo tentativo in ms (AbortController). Default 4000. */
  timeoutMs?: number;
  /** Base del backoff esponenziale in ms (250→500→1000...). Default 300. */
  baseDelayMs?: number;
  /** Nome evento di log. Default "webhook.deliver". */
  event?: string;
}

/**
 * POST JSON con retry + backoff esponenziale + timeout per tentativo, AWAITED.
 * Logga ogni tentativo; al fallimento finale incrementa il contatore del canale
 * e logga un evento `error`. Non lancia: ritorna sempre un WebhookResult, cosi'
 * il chiamante decide se mandare un alert. Un 2xx conta come successo e azzera
 * il contatore.
 */
export async function deliverWebhook(
  url: string,
  payload: unknown,
  opts: DeliverOptions
): Promise<WebhookResult> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const timeoutMs = opts.timeoutMs ?? 4000;
  const baseDelayMs = opts.baseDelayMs ?? 300;
  const event = opts.event ?? "webhook.deliver";
  const channel = opts.channel ?? "webhook";

  let lastStatus: number | undefined;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      lastStatus = res.status;
      if (res.ok) {
        recordSuccess(channel);
        logEvent(event, "ok", {
          requestId: opts.requestId,
          channel,
          attempt,
          status: res.status,
          durationMs: Date.now() - startedAt,
        });
        return { ok: true, attempts: attempt, status: res.status, consecutiveFailures: 0 };
      }
      lastError = `HTTP ${res.status}`;
      logEvent(event, "warn", {
        requestId: opts.requestId,
        channel,
        attempt,
        status: res.status,
        durationMs: Date.now() - startedAt,
        willRetry: attempt < maxAttempts,
      });
    } catch (err) {
      clearTimeout(timer);
      const aborted = err instanceof Error && err.name === "AbortError";
      lastError = aborted
        ? `timeout>${timeoutMs}ms`
        : err instanceof Error
          ? err.message
          : String(err);
      logEvent(event, "warn", {
        requestId: opts.requestId,
        channel,
        attempt,
        error: lastError,
        durationMs: Date.now() - startedAt,
        willRetry: attempt < maxAttempts,
      });
    }
    // Backoff prima del prossimo tentativo (non dopo l'ultimo).
    if (attempt < maxAttempts) {
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  const failures = recordFailure(channel);
  logEvent(event, "error", {
    requestId: opts.requestId,
    channel,
    attempts: maxAttempts,
    status: lastStatus,
    error: lastError,
    consecutiveFailures: failures,
  });
  return {
    ok: false,
    attempts: maxAttempts,
    status: lastStatus,
    error: lastError,
    consecutiveFailures: failures,
  };
}
