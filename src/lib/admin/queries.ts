import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AxisKey } from "@/lib/types";
import { COMPLIANCE_AREA_NAMES } from "@/lib/scoring";
import {
  computeComplianceRisk,
  computeGapTotale,
  computeLeadTier,
  complianceCounts,
  daysSince,
  suggestNextAction,
  tierPredicates,
  weakestAxis,
  AXIS_SHORT_LABEL,
} from "./lead-scoring";
import { getMockRows, isMockMode } from "./mock-data";
import {
  DIPENDENTI_OPTIONS,
  LIST_COLUMNS,
  MAX_EXPORT_ROWS,
  MAX_STATS_ROWS,
  RUOLO_OPTIONS,
  SORTABLE_COLUMNS,
  type AdminStats,
  type AxisSectorRow,
  type ComplianceAreaStat,
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
// Le ultime 5 sono metriche derivate calcolate via lead-scoring.ts (US-10).
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
  "ruolo",
  "overall_score",
  "overall_label",
  ...AXIS_KEYS.map((k) => `score_${k}`),
  "consenso",
  "consenso_marketing",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "tier",
  "giorni_attesa",
  "gap_totale",
  "compliance_risk",
  "azione_consigliata",
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
  not(column: string, operator: string, value: unknown): this;
  or(filters: string): this;
}

// Applica i filtri condivisi (status/settore/dimensione/ruolo/date/ricerca) a
// una query builder Supabase. Restituisce la stessa builder per concatenazione.
// NOTA tier: il tier è derivato (non colonna DB). Per non rompere la
// paginazione, applichiamo qui i predicati AND di restringimento (vedi
// tierPredicates) e raffiniamo poi in memoria con computeLeadTier.
function applyFilters<T extends FilterableBuilder>(
  q: T,
  f: SubmissionFilters
): T {
  let out = q;
  if (f.status) out = out.eq("status", f.status);
  if (f.settore) out = out.eq("settore", f.settore);
  if (f.dipendenti) out = out.eq("dipendenti", f.dipendenti);
  // Ruolo → answers->>'X3' (operatore jsonb di PostgREST: colonna->>chiave).
  if (f.ruolo) out = out.eq("answers->>X3", f.ruolo);
  if (f.dateFrom) out = out.gte("created_at", `${f.dateFrom}T00:00:00`);
  if (f.dateTo) out = out.lte("created_at", `${f.dateTo}T23:59:59.999`);
  if (f.tier) {
    for (const p of tierPredicates(f.tier)) {
      if (p.kind === "eq") out = out.eq(p.col, p.value);
      else if (p.kind === "gte") out = out.gte(p.col, p.value);
      else if (p.kind === "notNull") out = out.not(p.col, "is", null);
    }
  }
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

// ── Mock helpers (sandbox: ADMIN_MOCK=1) ──────────────────────────────────
function rowRole(r: SubmissionRow): string | null {
  return r.answers?.X3 ?? null;
}

function mockMatches(r: SubmissionRow, f: SubmissionFilters): boolean {
  if (f.status && r.status !== f.status) return false;
  if (f.settore && r.settore !== f.settore) return false;
  if (f.dipendenti && r.dipendenti !== f.dipendenti) return false;
  if (f.ruolo && rowRole(r) !== f.ruolo) return false;
  if (f.dateFrom && r.created_at < `${f.dateFrom}T00:00:00`) return false;
  if (f.dateTo && r.created_at > `${f.dateTo}T23:59:59.999`) return false;
  if (f.search) {
    const t = f.search.toLowerCase();
    const hay = [r.nome, r.cognome, r.email, r.azienda]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(t)) return false;
  }
  if (f.tier) {
    const { tier } = computeLeadTier(r);
    if (tier !== f.tier) return false;
  }
  return true;
}

// Ordinamento per metriche derivate (chiavi sintetiche: 'tier' | 'gap').
// Condiviso fra percorso reale (fetchSubmissions) e percorso mock cosi' la
// semantica e' identica. I record senza gap valorizzato (gap null) finiscono
// sempre in coda, qualsiasi sia la direzione.
function sortSynthetic<
  T extends {
    status: string;
    overall_score: number | null;
    email: string | null;
    consenso_marketing: boolean | null;
  }
>(rows: T[], sort: string, dir: "asc" | "desc"): T[] {
  const sign = dir === "asc" ? 1 : -1;
  const out = [...rows];
  if (sort === "gap") {
    out.sort((a, b) => {
      const ga = computeGapTotale(a as never);
      const gb = computeGapTotale(b as never);
      if (ga == null && gb == null) return 0;
      if (ga == null) return 1; // null sempre in coda
      if (gb == null) return -1;
      return (ga - gb) * sign;
    });
  } else {
    // 'tier': ranking hot>warm>cold (tie-break overall_score) via score.
    out.sort((a, b) => (computeLeadTier(a).score - computeLeadTier(b).score) * sign);
  }
  return out;
}

function sortMockRows(rows: SubmissionRow[], f: SubmissionFilters): SubmissionRow[] {
  if (f.sort === "tier" || f.sort === "gap") {
    return sortSynthetic(rows, f.sort, f.dir);
  }
  const dir = f.dir === "asc" ? 1 : -1;
  const out = [...rows];
  const col = SORTABLE_COLUMNS[f.sort] ?? "created_at";
  out.sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[col];
    const bv = (b as unknown as Record<string, unknown>)[col];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  return out;
}

// ── Lista paginata + conteggio del set filtrato ───────────────────────────
/**
 * Tier-filtering (US-2): per i tier WARM/COLD il restringimento SQL non e'
 * esatto (WARM = unione, COLD = OR). Quando e' presente f.tier raffiniamo in
 * memoria con computeLeadTier sull'intero set filtrato (cap-limitato), poi
 * pagiamo in JS: cosi' count e paginazione restano coerenti.
 */
export async function fetchSubmissions(
  f: SubmissionFilters
): Promise<{ rows: SubmissionListItem[]; total: number }> {
  if (isMockMode()) {
    const all = getMockRows().filter((r) => mockMatches(r, f));
    const sorted = sortMockRows(all, f);
    const from = (f.page - 1) * f.pageSize;
    const page = sorted.slice(from, from + f.pageSize);
    return { rows: page as unknown as SubmissionListItem[], total: all.length };
  }

  const client = getClient();
  // Ordinamenti "sintetici": metriche derivate (non colonne DB) ordinate in
  // memoria. 'tier' usa il ranking di computeLeadTier; 'gap' usa computeGapTotale.
  const synthetic = f.sort === "tier" || f.sort === "gap";
  const needsMemoryRefine = !!f.tier;

  // Se l'ordinamento e' sintetico (tier/gap) o il tier richiede raffinamento in
  // memoria, dobbiamo caricare il set filtrato e impaginare in JS.
  if (synthetic || needsMemoryRefine) {
    let q = client.from("submissions").select(LIST_COLUMNS);
    q = applyFilters(q, f);
    const { data, error } = await q
      .order("created_at", { ascending: false })
      .range(0, MAX_STATS_ROWS - 1);
    if (error) throw new Error(error.message);
    let rows = (data ?? []) as unknown as SubmissionListItem[];
    if (f.tier) rows = rows.filter((r) => computeLeadTier(r).tier === f.tier);
    if (synthetic) rows = sortSynthetic(rows, f.sort, f.dir);
    const total = rows.length;
    const from = (f.page - 1) * f.pageSize;
    return { rows: rows.slice(from, from + f.pageSize), total };
  }

  // Percorso standard: ordinamento e paginazione lato DB.
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
  if (isMockMode()) {
    const rows = getMockRows();
    return {
      total: rows.length,
      completed: rows.filter((r) => r.status === "completed").length,
      anonymous: rows.filter((r) => r.status === "anonymous").length,
    };
  }
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
  if (isMockMode()) {
    return getMockRows().find((r) => r.id === id) ?? null;
  }
  const client = getClient();
  const { data, error } = await client
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SubmissionRow | null) ?? null;
}

// Arricchisce una riga grezza con le metriche derivate (per l'export).
function enrichForExport(r: Record<string, unknown>): Record<string, unknown> {
  const tier = computeLeadTier({
    status: String(r.status ?? ""),
    overall_score: typeof r.overall_score === "number" ? r.overall_score : null,
    email: (r.email as string | null) ?? null,
    consenso_marketing: (r.consenso_marketing as boolean | null) ?? null,
  }).tier;
  const gap = computeGapTotale(r as never);
  const risk = computeComplianceRisk(r.compliance);
  const weak = weakestAxis(r as never);
  const azione = suggestNextAction({
    tier,
    overall_score: typeof r.overall_score === "number" ? r.overall_score : null,
    compliance: r.compliance,
    weakest: weak,
  });
  const answers = r.answers as Record<string, string> | null | undefined;
  return {
    ...r,
    ruolo: answers?.X3 ?? "",
    tier,
    giorni_attesa: daysSince(r.created_at as string),
    gap_totale: gap ?? "",
    compliance_risk: risk ?? "",
    azione_consigliata: azione,
  };
}

/** Righe per l'export CSV del set filtrato (cap MAX_EXPORT_ROWS), arricchite. */
export async function fetchExportRows(
  f: SubmissionFilters
): Promise<{ rows: Record<string, unknown>[]; capped: boolean; total: number }> {
  if (isMockMode()) {
    const all = getMockRows().filter((r) => mockMatches(r, f));
    return {
      rows: all.map((r) =>
        enrichForExport(r as unknown as Record<string, unknown>)
      ),
      capped: false,
      total: all.length,
    };
  }
  const client = getClient();
  // Servono anche answers/compliance/score_* per le metriche derivate.
  const cols =
    "id,created_at,completed_at,status,nome,cognome,email,azienda,telefono,referral,settore,dipendenti,ai_usage,answers,compliance,overall_score,overall_label," +
    AXIS_KEYS.map((k) => `score_${k}`).join(",") +
    ",consenso,consenso_marketing,utm_source,utm_medium,utm_campaign,utm_content";
  let q = client.from("submissions").select(cols, { count: "exact" });
  q = applyFilters(q, f);
  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(0, MAX_EXPORT_ROWS - 1);
  if (error) throw new Error(error.message);
  let rows = (data ?? []) as unknown as Record<string, unknown>[];
  // Raffinamento tier in memoria (coerente con fetchSubmissions).
  if (f.tier) {
    rows = rows.filter(
      (r) =>
        computeLeadTier({
          status: String(r.status ?? ""),
          overall_score:
            typeof r.overall_score === "number" ? r.overall_score : null,
          email: (r.email as string | null) ?? null,
          consenso_marketing: (r.consenso_marketing as boolean | null) ?? null,
        }).tier === f.tier
    );
  }
  const total = f.tier ? rows.length : count ?? 0;
  const enriched = rows.map((r) => enrichForExport(r));
  return {
    rows: enriched,
    capped: !f.tier && total > MAX_EXPORT_ROWS,
    total,
  };
}

// ── Statistiche (aggregazione lato JS sul set completo, cap MAX_STATS_ROWS) ──
type StatRow = SubmissionRow;

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function groupAvg(
  rows: StatRow[],
  keyFn: (r: StatRow) => string | null,
  order?: readonly string[]
): GroupAvg[] {
  const map = new Map<string, number[]>();
  for (const r of rows) {
    const g = keyFn(r) ?? "—";
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

// Aggrega le 7 aree compliance dal jsonb (US-3).
function complianceStats(rows: StatRow[]): ComplianceAreaStat[] {
  const map = new Map<string, { r: number; y: number; g: number }>();
  for (const name of COMPLIANCE_AREA_NAMES) map.set(name, { r: 0, y: 0, g: 0 });
  for (const row of rows) {
    if (!Array.isArray(row.compliance)) continue;
    for (const item of row.compliance) {
      if (!item || typeof item !== "object") continue;
      const name = (item as { name?: string; area?: string }).name
        ?? (item as { area?: string }).area;
      const color = (item as { color?: string; stato?: string }).color
        ?? (item as { stato?: string }).stato;
      if (!name || !map.has(name)) continue;
      const slot = map.get(name)!;
      if (color === "red" || color === "rosso") slot.r += 1;
      else if (color === "yellow" || color === "giallo") slot.y += 1;
      else if (color === "green" || color === "verde") slot.g += 1;
    }
  }
  const out: ComplianceAreaStat[] = [];
  for (const [area, c] of map) {
    const total = c.r + c.y + c.g;
    out.push({
      area,
      rosso: c.r,
      giallo: c.y,
      verde: c.g,
      total,
      pctRosso: total ? Math.round((c.r / total) * 100) : 0,
      pctGiallo: total ? Math.round((c.y / total) * 100) : 0,
      pctVerde: total ? Math.round((c.g / total) * 100) : 0,
    });
  }
  // ordina per % rosso decrescente
  out.sort((a, b) => b.pctRosso - a.pctRosso);
  return out.filter((s) => s.total > 0);
}

// Heatmap assi × settore (US-4).
function axisBySettoreStats(rows: StatRow[]): AxisSectorRow[] {
  const bySettore = new Map<string, StatRow[]>();
  for (const r of rows) {
    if (typeof r.overall_score !== "number") continue;
    const s = r.settore ?? "—";
    if (!bySettore.has(s)) bySettore.set(s, []);
    bySettore.get(s)!.push(r);
  }
  const out: AxisSectorRow[] = [];
  for (const [settore, rs] of bySettore) {
    const cells: AxisSectorRow["cells"] = {};
    for (const k of AXIS_KEYS) {
      const vals = rs
        .map((r) => r[`score_${k}` as keyof StatRow] as number | null)
        .filter((v): v is number => typeof v === "number");
      cells[k] = { avg: avg(vals), count: vals.length };
    }
    out.push({ settore, count: rs.length, cells });
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

export async function fetchStats(): Promise<AdminStats & { capped: boolean }> {
  let rows: StatRow[];
  let total: number;

  if (isMockMode()) {
    rows = getMockRows();
    total = rows.length;
  } else {
    const client = getClient();
    const cols =
      "status,overall_score,overall_label,settore,dipendenti,created_at,completed_at,email,consenso,consenso_marketing,answers,compliance," +
      AXIS_KEYS.map((k) => `score_${k}`).join(",");
    const { data, error, count } = await client
      .from("submissions")
      .select(cols, { count: "exact" })
      .order("created_at", { ascending: true })
      .range(0, MAX_STATS_ROWS - 1);
    if (error) throw new Error(error.message);
    rows = (data ?? []) as unknown as StatRow[];
    total = count ?? rows.length;
  }

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

  // trend per mese con composizione per livello (US-6)
  const monthMap = new Map<
    string,
    { total: number; completed: number; byLevel: Record<string, number> }
  >();
  for (const r of rows) {
    const m = r.created_at.slice(0, 7); // YYYY-MM
    if (!monthMap.has(m))
      monthMap.set(m, { total: 0, completed: 0, byLevel: {} });
    const e = monthMap.get(m)!;
    e.total += 1;
    if (r.status === "completed") e.completed += 1;
    if (typeof r.overall_score === "number" && r.overall_label) {
      e.byLevel[r.overall_label] = (e.byLevel[r.overall_label] ?? 0) + 1;
    }
  }
  const byMonth = [...monthMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, v]) => ({
      month,
      total: v.total,
      completed: v.completed,
      byLevel: v.byLevel,
    }));

  // funnel (US-6)
  const withPrivacy = rows.filter(
    (r) => r.status === "completed" && r.consenso === true
  ).length;
  const withMarketing = rows.filter(
    (r) => r.status === "completed" && r.consenso_marketing === true
  ).length;
  const funnel = [
    { label: "Anonimi", count: anonymous + completed },
    { label: "Completati", count: completed },
    { label: "Consenso privacy", count: withPrivacy },
    { label: "Consenso marketing", count: withMarketing },
  ];

  // hot leads (US-9)
  const hotLeads = rows.filter((r) => computeLeadTier(r).tier === "hot").length;

  // compliance + heatmap assi
  const compliance = complianceStats(rows);
  const axisBySettore = axisBySettoreStats(rows);

  const topCriticalArea = compliance.length
    ? { area: compliance[0].area, pct: compliance[0].pctRosso }
    : null;

  const bySettore = groupAvg(scored, (r) => r.settore);
  // settore piu' maturo per media (US-9): scegli per avg, non per count.
  const matureSector = bySettore
    .filter((s) => s.count >= 1 && s.group !== "—")
    .reduce<{ settore: string; avg: number } | null>(
      (best, s) =>
        !best || s.avg > best.avg ? { settore: s.group, avg: s.avg } : best,
      null
    );

  return {
    total,
    completed,
    anonymous,
    completionRate: total ? completed / total : 0,
    avgOverall,
    scoredCount: scored.length,
    byLabel,
    bySettore,
    byDipendenti: groupAvg(scored, (r) => r.dipendenti, DIPENDENTI_OPTIONS),
    byRuolo: groupAvg(scored, (r) => r.answers?.X3 ?? null).filter((g) =>
      (RUOLO_OPTIONS as readonly string[]).includes(g.group)
    ),
    byMonth,
    compliance,
    axisBySettore,
    funnel,
    hotLeads,
    topCriticalArea,
    topSector: matureSector,
    capped: total > rows.length,
  };
}

// Label brevi assi (riusate dalle heatmap nello stats).
export { AXIS_SHORT_LABEL };
export { complianceCounts };
