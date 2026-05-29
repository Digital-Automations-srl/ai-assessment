import type { AxisKey, ComplianceResult } from "@/lib/types";

// Stato di una submission (vedi migrazione assessment_capture):
//  - 'anonymous'  → record creato allo step "results" senza PII (track-result)
//  - 'completed'  → lead che ha inviato il form (send-report)
export type SubmissionStatus = "anonymous" | "completed";

// Le 6 colonne score_<asse> presenti su `submissions`.
export type AxisScoreColumns = {
  [K in AxisKey as `score_${K}`]: number | null;
};

// Riga completa di `submissions` (campi noti). I jsonb sono tipizzati larghi:
// la fonte resta il DB, qui ci serve solo leggerli per il dettaglio.
export interface SubmissionRow extends AxisScoreColumns {
  id: string;
  created_at: string;
  status: SubmissionStatus | string;
  completed_at: string | null;

  nome: string | null;
  cognome: string | null;
  email: string | null;
  azienda: string | null;
  telefono: string | null;
  referral: string | null;

  settore: string | null;
  dipendenti: string | null;
  ai_usage: string | null;

  overall_score: number | null;
  overall_label: string | null;

  answers: Record<string, string> | null;
  compliance: ComplianceResult[] | null;
  quiz_answers: Record<string, { letter: string; score: number }> | null;

  submission_token: string | null;
  consenso: boolean | null;
  consenso_marketing: boolean | null;
}

// Sottoinsieme di colonne usato nella tabella (lista). Esteso con i campi che
// alimentano le colonne derivate (Priorita'/Gap/Compliance) senza una query
// per riga: email/consenso_marketing/completed_at (tier), i 6 score_<asse>
// (gap) e il jsonb compliance (badge rischio). Payload ancora piccolo (<=100).
export type SubmissionListItem = Pick<
  SubmissionRow,
  | "id"
  | "created_at"
  | "completed_at"
  | "status"
  | "nome"
  | "email"
  | "azienda"
  | "settore"
  | "dipendenti"
  | "overall_score"
  | "overall_label"
  | "consenso_marketing"
  | "compliance"
  | `score_${AxisKey}`
>;

export const LIST_COLUMNS =
  "id,created_at,completed_at,status,nome,email,azienda,settore,dipendenti,overall_score,overall_label,consenso_marketing,compliance,score_conformita,score_processi,score_utilizzo,score_autonomia,score_protezione,score_tecnologia";

// ── Facet per i filtri (deterministici: vengono dalle domande di contesto,
// non da una query DISTINCT — cosi' i dropdown funzionano anche a DB vuoto). ──
export const SETTORE_OPTIONS = [
  "Manifattura e produzione",
  "Distribuzione e retail",
  "Servizi professionali",
  "Costruzioni e impianti",
  "Logistica e trasporti",
  "Formazione e education",
  "IT e tecnologia",
  "Altro",
] as const;

export const DIPENDENTI_OPTIONS = [
  "Meno di 10",
  "10-50",
  "51-100",
  "101-250",
  "Più di 250",
] as const;

// Opzioni ruolo (domanda X3 del quiz). Allineate a quiz-data.ts CONTEXT_QUESTIONS.
// Tenute qui per il dropdown/whitelist senza importare quiz-data nel client.
export const RUOLO_OPTIONS = [
  "Titolare / CEO",
  "Direzione generale (AD, DG)",
  "IT / CTO",
  "HR / Risorse Umane",
  "Amministrazione e finanza",
  "Altro",
] as const;

export type LeadTierFilter = "hot" | "warm" | "cold";

// Colonne ordinabili dalla tabella → mappa whitelist (evita SQL injection sul
// nome colonna passando dal querystring).
export const SORTABLE_COLUMNS: Record<string, string> = {
  created_at: "created_at",
  overall_score: "overall_score",
  azienda: "azienda",
  status: "status",
  settore: "settore",
};

// Chiavi di ordinamento "sintetiche": non sono colonne DB ma metriche derivate.
// L'ordinamento avviene in memoria sul set paginato (vedi fetchSubmissions).
// 'tier' è ordinabile via ranking; 'gap' resta colonna informativa (non qui).
export const SYNTHETIC_SORT_KEYS = ["tier"] as const;
export function isSortable(sort: string): boolean {
  return sort in SORTABLE_COLUMNS || (SYNTHETIC_SORT_KEYS as readonly string[]).includes(sort);
}

export const DEFAULT_PAGE_SIZE = 25;
// Tetto di sicurezza all'export/aggregazioni (no scansioni illimitate).
export const MAX_EXPORT_ROWS = 10000;
export const MAX_STATS_ROWS = 10000;

export interface SubmissionFilters {
  status?: SubmissionStatus;
  settore?: string;
  dipendenti?: string;
  ruolo?: string; // filtra su answers->>'X3' (whitelisted)
  tier?: LeadTierFilter; // derivato: filtrato dopo il calcolo del tier
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  search?: string;
  sort: string; // colonna whitelisted o chiave sintetica
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
}

// ── Statistiche ──
export interface LabelCount {
  label: string;
  count: number;
}
export interface GroupAvg {
  group: string;
  count: number;
  avg: number;
}
export interface MonthPoint {
  month: string; // YYYY-MM
  total: number;
  completed: number;
  byLevel: Record<string, number>; // composizione per livello (US-6)
}

// Conformità di mercato: per area, conteggi R/Y/G + percentuali (US-3).
export interface ComplianceAreaStat {
  area: string;
  rosso: number;
  giallo: number;
  verde: number;
  total: number;
  pctRosso: number; // 0..100
  pctGiallo: number;
  pctVerde: number;
}

// Heatmap assi × settore: media per cella (US-4).
export interface AxisSectorCell {
  avg: number;
  count: number;
}
export interface AxisSectorRow {
  settore: string;
  count: number; // record del settore
  cells: Record<string, AxisSectorCell>; // chiave = AxisKey
}

// Funnel anonimo → completato → consenso → marketing (US-6).
export interface FunnelStep {
  label: string;
  count: number;
}

export interface AdminStats {
  total: number;
  completed: number;
  anonymous: number;
  completionRate: number; // 0..1 sui record che hanno un overall_score
  avgOverall: number | null;
  byLabel: LabelCount[];
  bySettore: GroupAvg[];
  byDipendenti: GroupAvg[];
  byRuolo: GroupAvg[]; // US-8
  byMonth: MonthPoint[];
  scoredCount: number; // record con overall_score non nullo
  compliance: ComplianceAreaStat[]; // US-3
  axisBySettore: AxisSectorRow[]; // US-4
  funnel: FunnelStep[]; // US-6
  hotLeads: number; // US-9 (conteggio tier hot)
  topCriticalArea: { area: string; pct: number } | null; // US-3/US-9
  topSector: { settore: string; avg: number } | null; // US-9
}
