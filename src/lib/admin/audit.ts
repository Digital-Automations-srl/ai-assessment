// Audit log accessi/azioni dashboard admin (SEC-3). Server-only: usa
// `supabaseAdmin` (secret key, bypassa RLS) e quindi NON deve finire nel bundle
// client. Best-effort: un fallimento dell'audit non blocca mai l'azione admin.
//
// Sorgenti degli eventi:
//  - 'access'        → requireAdmin() su ogni render di pagina admin (Node)
//  - 'login_success' / 'login_failed' → /api/admin/login
//  - 'logout'        → /api/admin/logout
//  - 'export'        → /api/admin/export
// Nota runtime: il logging degli accessi vive in requireAdmin() (Server
// Component, runtime Node garantito) e NON nel proxy, che e' runtime-agnostico
// Edge+Node (vedi auth.ts) dove una scrittura DB sarebbe inaffidabile/pesante.

import { supabaseAdmin } from "@/lib/supabase-admin";
import { logEvent } from "@/lib/observability";
import { isMockMode } from "./mock-data";

export type AuditEvent =
  | "access"
  | "login_success"
  | "login_failed"
  | "logout"
  | "export";

export type AuditOutcome = "ok" | "denied" | "error";

export interface AuditEntry {
  event: AuditEvent;
  outcome?: AuditOutcome;
  path?: string | null;
  method?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  detail?: Record<string, unknown> | null;
}

export interface AuditRow {
  id: string;
  created_at: string;
  event: string;
  outcome: string | null;
  path: string | null;
  method: string | null;
  ip: string | null;
  user_agent: string | null;
  detail: Record<string, unknown> | null;
}

/** Estrae IP + User-Agent (best-effort) da un set di header di richiesta. */
export function clientMetaFromHeaders(h: Headers): {
  ip: string | null;
  userAgent: string | null;
} {
  const fwd = h.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0]?.trim() : null) || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent") || null;
  return { ip, userAgent };
}

/** Registra una voce di audit. Mai bloccante: non lancia, logga sui fallimenti. */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  if (isMockMode() || !supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.from("admin_audit").insert({
      event: entry.event,
      outcome: entry.outcome ?? "ok",
      path: entry.path ?? null,
      method: entry.method ?? null,
      ip: entry.ip ?? null,
      user_agent: entry.userAgent ?? null,
      detail: entry.detail ?? null,
    });
    if (error) {
      logEvent("admin_audit.write", "error", {
        auditEvent: entry.event,
        error: error.message,
      });
    }
  } catch (e) {
    logEvent("admin_audit.write", "error", {
      auditEvent: entry.event,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

// Dati finti per la sandbox (ADMIN_MOCK=1): la mini-vista mostra qualcosa anche
// senza DB. Deterministici (offset fissi da un istante base).
function mockAudit(limit: number): AuditRow[] {
  const base = Date.parse("2026-05-29T09:00:00.000Z");
  const rows: AuditRow[] = [
    { event: "access", path: "/admin", method: "GET", outcome: "ok", offset: 2 },
    { event: "export", path: "/api/admin/export", method: "GET", outcome: "ok", offset: 20 },
    { event: "access", path: "/admin/stats", method: "GET", outcome: "ok", offset: 35 },
    { event: "login_success", path: "/api/admin/login", method: "POST", outcome: "ok", offset: 60 },
    { event: "login_failed", path: "/api/admin/login", method: "POST", outcome: "denied", offset: 75 },
  ].map((r, i) => ({
    id: `mock-audit-${i}`,
    created_at: new Date(base - r.offset * 60_000).toISOString(),
    event: r.event,
    outcome: r.outcome,
    path: r.path,
    method: r.method,
    ip: "203.0.113.10",
    user_agent: "Mozilla/5.0",
    detail: null,
  }));
  return rows.slice(0, limit);
}

/** Ultimi N eventi di audit per la mini-vista. Mai lancia: [] sui fallimenti. */
export async function fetchRecentAudit(limit = 10): Promise<AuditRow[]> {
  if (isMockMode()) return mockAudit(limit);
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_audit")
      .select("id,created_at,event,outcome,path,method,ip,user_agent,detail")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      // Tabella assente (migrazione non ancora applicata) o altro errore →
      // la mini-vista mostra "nessun accesso", senza rompere la pagina.
      logEvent("admin_audit.read", "warn", { error: error.message });
      return [];
    }
    return (data ?? []) as unknown as AuditRow[];
  } catch (e) {
    logEvent("admin_audit.read", "error", {
      error: e instanceof Error ? e.message : String(e),
    });
    return [];
  }
}
