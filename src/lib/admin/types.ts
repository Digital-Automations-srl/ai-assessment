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

// Sottoinsieme di colonne usato nella tabella (lista). Leggero: niente jsonb.
export type SubmissionListItem = Pick<
  SubmissionRow,
  | "id"
  | "created_at"
  | "status"
  | "nome"
  | "azienda"
  | "settore"
  | "dipendenti"
  | "overall_score"
  | "overall_label"
>;

export const LIST_COLUMNS =
  "id,created_at,status,nome,azienda,settore,dipendenti,overall_score,overall_label";

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

// Colonne ordinabili dalla tabella → mappa whitelist (evita SQL injection sul
// nome colonna passando dal querystring).
export const SORTABLE_COLUMNS: Record<string, string> = {
  created_at: "created_at",
  overall_score: "overall_score",
  azienda: "azienda",
  status: "status",
  settore: "settore",
};

export const DEFAULT_PAGE_SIZE = 25;
// Tetto di sicurezza all'export/aggregazioni (no scansioni illimitate).
export const MAX_EXPORT_ROWS = 10000;
export const MAX_STATS_ROWS = 10000;

export interface SubmissionFilters {
  status?: SubmissionStatus;
  settore?: string;
  dipendenti?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  search?: string;
  sort: string; // colonna whitelisted
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
  byMonth: MonthPoint[];
  scoredCount: number; // record con overall_score non nullo
}
