import {
  DEFAULT_PAGE_SIZE,
  DIPENDENTI_OPTIONS,
  RUOLO_OPTIONS,
  SETTORE_OPTIONS,
  isSortable,
  type LeadTierFilter,
  type SubmissionFilters,
} from "./types";

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const t = s?.trim();
  return t ? t : undefined;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Normalizza i searchParams (gia' await-ati) in filtri validati e sicuri. */
export function parseFilters(params: RawParams): SubmissionFilters {
  const status = first(params.status);
  const settore = first(params.settore);
  const dipendenti = first(params.dipendenti);
  const ruolo = first(params.ruolo);
  const tier = first(params.tier);
  const dateFrom = first(params.dateFrom);
  const dateTo = first(params.dateTo);
  const search = first(params.q);
  const sort = first(params.sort) ?? "created_at";
  const dir = first(params.dir);

  const pageRaw = Number(first(params.page));
  const sizeRaw = Number(first(params.pageSize));

  return {
    status:
      status === "anonymous" || status === "completed" ? status : undefined,
    settore: SETTORE_OPTIONS.includes(settore as never) ? settore : undefined,
    dipendenti: DIPENDENTI_OPTIONS.includes(dipendenti as never)
      ? dipendenti
      : undefined,
    ruolo: RUOLO_OPTIONS.includes(ruolo as never) ? ruolo : undefined,
    tier:
      tier === "hot" || tier === "warm" || tier === "cold"
        ? (tier as LeadTierFilter)
        : undefined,
    dateFrom: dateFrom && DATE_RE.test(dateFrom) ? dateFrom : undefined,
    dateTo: dateTo && DATE_RE.test(dateTo) ? dateTo : undefined,
    // limita la lunghezza della ricerca per sicurezza
    search: search ? search.slice(0, 120) : undefined,
    sort: isSortable(sort) ? sort : "created_at",
    dir: dir === "asc" ? "asc" : "desc",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize:
      Number.isFinite(sizeRaw) && sizeRaw >= 1 && sizeRaw <= 100
        ? Math.floor(sizeRaw)
        : DEFAULT_PAGE_SIZE,
  };
}

/** Serializza i filtri in querystring (per link paginazione / export / sort). */
export function filtersToQuery(
  f: SubmissionFilters,
  overrides: Partial<SubmissionFilters> = {}
): string {
  const m = { ...f, ...overrides };
  const sp = new URLSearchParams();
  if (m.status) sp.set("status", m.status);
  if (m.settore) sp.set("settore", m.settore);
  if (m.dipendenti) sp.set("dipendenti", m.dipendenti);
  if (m.ruolo) sp.set("ruolo", m.ruolo);
  if (m.tier) sp.set("tier", m.tier);
  if (m.dateFrom) sp.set("dateFrom", m.dateFrom);
  if (m.dateTo) sp.set("dateTo", m.dateTo);
  if (m.search) sp.set("q", m.search);
  if (m.sort && m.sort !== "created_at") sp.set("sort", m.sort);
  if (m.dir && m.dir !== "desc") sp.set("dir", m.dir);
  if (m.page && m.page !== 1) sp.set("page", String(m.page));
  if (m.pageSize && m.pageSize !== DEFAULT_PAGE_SIZE)
    sp.set("pageSize", String(m.pageSize));
  return sp.toString();
}

// ── CSV ──
function csvCell(value: unknown): string {
  if (value == null) return "";
  let s = String(value);
  // neutralizza formula injection in Excel/Sheets
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCsv(headers: string[], rows: (unknown[])[]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const r of rows) lines.push(r.map(csvCell).join(","));
  // BOM UTF-8 → Excel apre gli accenti correttamente
  return "﻿" + lines.join("\r\n");
}
