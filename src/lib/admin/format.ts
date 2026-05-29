// Helper di formattazione condivisi (server-safe).

const DT = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const D = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : DT.format(d);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : D.format(d);
}

export function formatScore(n: number | null | undefined): string {
  return n == null ? "—" : n.toFixed(1);
}

export function dash(v: string | null | undefined): string {
  return v && v.trim() ? v : "—";
}
