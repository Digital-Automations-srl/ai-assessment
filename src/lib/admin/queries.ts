import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AxisKey } from "@/lib/types";
import {
  DIPENDENTI_OPTIONS,
  LIST_COLUMNS,
  MAX_EXPORT_ROWS,
  MAX_STATS_ROWS,
  SORTABLE_COLUMNS,
  type AdminStats,
  type GroupAvg,
  type SubmissionFilters,
  type SubmissionListItem,
  type SubmissionRow,
} from "./types";

// Ordine canonico dei livelli (allineato a scoring.ts LEVEL_THRESHOLDS).
const LEVEL_ORDER = [
  "Iniziale",
  "In avvio",
  "In costruzione",
  "Operativo",
  "Maturo",
];

export const AXIS_KEYS: AxisKey[] = [
  "conformita",
  "processi",
  "utilizzo",
  "autonomia",
  "protezione",
  "tecnologia",
];

// Colonne esportate in CSV (PII inclusa: l'export e' un'azione admin esplicita).
export const EXPORT_COLUMNS = [
  "id",
  "created_at",
  "completed_at",
  "status",
  "nome",
  "cognome",
  "email",
  "azienda",
  "telefono",
  "referral",
  "settore",
  "dipendenti",
  "ai_usage",
  "overall_score",
  "overall_label",
  ...AXIS_KEYS.map((k) => `score_${k}`),
  "consenso",
  "consenso_marketing",
] as const;

class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase non configurato (manca SUPABASE_SECRET_KEY).");
    this.name = "SupabaseNotConfiguredError";
  }
}

function getClient() {
  if (!supabaseAdmin) throw new SupabaseNotConfiguredError();
  return supabaseAdmin;
}

export function isConfigError(e: unknown): boolean {
  return e instanceof SupabaseNotConfiguredError;
}

// Builder Supabase ristretto ai soli metodi-filtro che usiamo. I metodi
// ritornano `this` cosi' la stessa builder concreta si concatena senza cast.
interface FilterableBuilder {
  eq(column: string, value: unknown): this;
  gte(column: string, value: unknown): this;
  lte(column: string, value: unknown): this;
  or(filters: string): this;
}

// Applica i filtri condivisi (status/settore/dimensione/date/ricerca) a una
// query builder Supabase. Restituisce la stessa builder per concatenazione.
function applyFilters<T extends FilterableBuilder>(
  q: T,
  f: SubmissionFilters
): T {
  let out = q;
  if (f.status) out = out.eq("status", f.status);
  if (f.settore) out = out.eq("settore", f.settore);
  if (f.dipendenti) out = out.eq("dipendenti", f.dipendenti);
  if (f.dateFrom) out = out.gte("created_at", `${f.dateFrom}T00:00:00`);
  if (f.dateTo) out = out.lte("created_at", `${f.dateTo}T23:59:59.999`);
  if (f.search) {
    // PostgREST .or() usa virgole/parentesi come sintassi → vanno rimosse dal
    // valore per evitare di romperla. % e _ sono wildcard ilike: li togliamo.
    const term = f.search.replace(/[,()%_*\\]/g, " ").trim();
    if (term) {
      const like = `%${term}%`;
      out = out.or(
        `nome.ilike.${like},cognome.ilike.${like},email.ilike.${like},azienda.ilike.${like}`
      );
    }
  }
  return out;
}

/** Lista paginata + conteggio totale del set filtrato. */
export async function fetchSubmissions(
  f: SubmissionFilters
): Promise<{ rows: SubmissionListItem[]; total: number }> {
  const client = getClient();
  const sortCol = SORTABLE_COLUMNS[f.sort] ?? "created_at";
  const from = (f.page - 1) * f.pageSize;
  const to = from + f.pageSize - 1;

  let q = client.from("submissions").select(LIST_COLUMNS, { count: "exact" });
  q = applyFilters(q, f);
  const { data, error, count } = await q
    .order(sortCol, { ascending: f.dir === "asc" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return {
    rows: (data ?? []) as unknown as SubmissionListItem[],
    total: count ?? 0,
  };
}

/** Conteggi globali (non filtrati): totale, completati, anonimi. */
export async function fetchCounts(): Promise<{
  total: number;
  completed: number;
  anonymous: number;
}> {
  const client = getClient();
  const base = () =>
    client.from("submissions").select("id", { count: "exact", head: true });
  const [all, completed, anon] = await Promise.all([
    base(),
    base().eq("status", "completed"),
    base().eq("status", "anonymous"),
  ]);
  if (all.error) throw new Error(all.error.message);
  return {
    total: all.count ?? 0,
    completed: completed.count ?? 0,
    anonymous: anon.count ?? 0,
  };
}

/** Record completo per il dettaglio. null se non trovato. */
export async function fetchSubmissionById(
  id: string
): Promise<SubmissionRow | null> {
  const client = getClient();
  const { data, error } = await client
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SubmissionRow | null) ?? null;
}

/** Righe per l'export CSV del set filtrato (cap MAX_EXPORT_ROWS). */
export async function fetchExportRows(
  f: SubmissionFilters
): Promise<{ rows: Record<string, unknown>[]; capped: boolean; total: number }> {
  const client = getClient();
  let q = client
    .from("submissions")
    .select(EXPORT_COLUMNS.join(","), { count: "exact" });
  q = applyFilters(q, f);
  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(0, MAX_EXPORT_ROWS - 1);
  if (error) throw new Error(error.message);
  const total = count ?? 0;
  return {
    rows: (data ?? []) as unknown as Record<string, unknown>[],
    capped: total > MAX_EXPORT_ROWS,
    total,
  };
}

// ── Statistiche (aggregazione lato JS sul set completo, cap MAX_STATS_ROWS) ──
type StatRow = {
  status: string;
  overall_score: number | null;
  overall_label: string | null;
  settore: string | null;
  dipendenti: string | null;
  created_at: string;
};

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function groupAvg(
  rows: StatRow[],
  key: "settore" | "dipendenti",
  order?: readonly string[]
): GroupAvg[] {
  const map = new Map<string, number[]>();
  for (const r of rows) {
    const g = r[key] ?? "—";
    if (!map.has(g)) map.set(g, []);
    if (typeof r.overall_score === "number") map.get(g)!.push(r.overall_score);
  }
  const entries: GroupAvg[] = [];
  for (const [group, scores] of map) {
    entries.push({ group, count: scores.length, avg: avg(scores) });
  }
  if (order) {
    entries.sort(
      (a, b) =>
        (order.indexOf(a.group) + 1 || 999) - (order.indexOf(b.group) + 1 || 999)
    );
  } else {
    entries.sort((a, b) => b.count - a.count);
  }
  return entries;
}

export async function fetchStats(): Promise<AdminStats & { capped: boolean }> {
  const client = getClient();
  const { data, error, count } = await client
    .from("submissions")
    .select("status,overall_score,overall_label,settore,dipendenti,created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: true })
    .range(0, MAX_STATS_ROWS - 1);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as StatRow[];
  const total = count ?? rows.length;
  const completed = rows.filter((r) => r.status === "completed").length;
  const anonymous = rows.filter((r) => r.status === "anonymous").length;

  const scored = rows.filter((r) => typeof r.overall_score === "number");
  const avgOverall = scored.length
    ? avg(scored.map((r) => r.overall_score as number))
    : null;

  // distribuzione per livello/label
  const labelMap = new Map<string, number>();
  for (const r of scored) {
    const l = r.overall_label ?? "—";
    labelMap.set(l, (labelMap.get(l) ?? 0) + 1);
  }
  const byLabel = LEVEL_ORDER.filter((l) => labelMap.has(l))
    .map((label) => ({ label, count: labelMap.get(label)! }))
    .concat(
      [...labelMap.keys()]
        .filter((l) => !LEVEL_ORDER.includes(l))
        .map((label) => ({ label, count: labelMap.get(label)! }))
    );

  // trend per mese (su tutte le righe; completed = sottoinsieme)
  const monthMap = new Map<string, { total: number; completed: number }>();
  for (const r of rows) {
    const m = r.created_at.slice(0, 7); // YYYY-MM
    if (!monthMap.has(m)) monthMap.set(m, { total: 0, completed: 0 });
    const e = monthMap.get(m)!;
    e.total += 1;
    if (r.status === "completed") e.completed += 1;
  }
  const byMonth = [...monthMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, v]) => ({ month, total: v.total, completed: v.completed }));

  return {
    total,
    completed,
    anonymous,
    completionRate: total ? completed / total : 0,
    avgOverall,
    scoredCount: scored.length,
    byLabel,
    bySettore: groupAvg(scored, "settore"),
    byDipendenti: groupAvg(scored, "dipendenti", DIPENDENTI_OPTIONS),
    byMonth,
    capped: total > rows.length,
  };
}
