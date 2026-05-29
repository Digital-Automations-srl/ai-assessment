import { formatDateTime } from "@/lib/admin/format";
import type { AuditRow } from "@/lib/admin/audit";

// Mini-vista "ultimi accessi" (SEC-3): Server Component, nessuno stato. Mostra
// gli ultimi eventi di audit (accessi pagina, login, logout, export).
const EVENT_META: Record<string, { label: string; fg: string; bg: string }> = {
  access: { label: "Accesso", fg: "#016FC0", bg: "#e6f1fb" },
  login_success: { label: "Login", fg: "#16a34a", bg: "#dcfce7" },
  login_failed: { label: "Login fallito", fg: "#dc2626", bg: "#fef2f2" },
  logout: { label: "Logout", fg: "#64748b", bg: "#f1f5f9" },
  export: { label: "Export CSV", fg: "#E09900", bg: "#fef3c7" },
};

export default function RecentAccess({ rows }: { rows: AuditRow[] }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
      <h2 className="mb-3 text-base font-extrabold" style={{ color: "#004172" }}>
        Ultimi accessi e azioni
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">
          Nessun accesso registrato. (Se la dashboard è appena stata aggiornata,
          applica la migrazione Wave 1 che crea la tabella admin_audit.)
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 text-sm">
          {rows.map((r) => {
            const meta = EVENT_META[r.event] ?? {
              label: r.event,
              fg: "#64748b",
              bg: "#f1f5f9",
            };
            return (
              <li key={r.id} className="flex items-center gap-3 py-2">
                <span
                  className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold"
                  style={{ color: meta.fg, backgroundColor: meta.bg }}
                >
                  {meta.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-gray-600">
                  {r.path ?? "—"}
                </span>
                <span className="hidden shrink-0 font-mono text-xs text-gray-400 sm:inline">
                  {r.ip ?? "—"}
                </span>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatDateTime(r.created_at)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
