// Metriche derivate dei lead — modulo PURO (nessun import di Supabase/React).
// Single source of truth riusata da lista, dettaglio ed export.
// Le funzioni qui dentro non leggono il DB: ricevono i campi grezzi e calcolano.

import { getLevel, getTargetScore } from "@/lib/scoring";
import type { AxisKey, BehaviorSignals } from "@/lib/types";

export type LeadTier = "hot" | "warm" | "cold";

// ── Soglie centralizzate (un solo punto di verita' per regole + predicati SQL) ──
export const TIER_THRESHOLDS = {
  /** Soglia minima overall per essere HOT (incluso). */
  hotMin: 3.5,
  /** Estremo inferiore della fascia WARM (incluso). */
  warmMin: 2.5,
} as const;

export const AXIS_KEYS: AxisKey[] = [
  "conformita",
  "processi",
  "utilizzo",
  "autonomia",
  "protezione",
  "tecnologia",
];

// Sottoinsieme dei campi grezzi necessari al calcolo del tier. Volutamente
// minimale: combacia con i campi della lista (SubmissionListItem estesa).
export interface TierInput {
  status: string;
  overall_score: number | null;
  email: string | null;
  consenso_marketing: boolean | null;
  // DATA-2: usato SOLO come tie-break del ranking (non cambia la classe tier).
  behavior?: BehaviorSignals | null;
}

// Peso massimo del tie-break comportamentale sul `score` di ranking. Deve
// restare < 0.1 (granularita' degli overall_score, arrotondati a 1 decimale)
// cosi' l'engagement separa SOLO lead a parita' di tier e overall, senza mai
// scavalcare una differenza reale di maturita'.
const ENGAGEMENT_TIEBREAK_WEIGHT = 0.09;

/**
 * Engagement 0..1 dai segnali comportamentali. Neutro (0) se behavior assente
 * (lead storici → ordinati dopo, a parita' di overall). Guidato dal tempo
 * speso (un completamento <45s e' click-through → 0) e penalizzato dalla quota
 * di risposte "Non so".
 */
export function behaviorEngagement(
  behavior: BehaviorSignals | null | undefined
): number {
  if (!behavior) return 0;
  const t =
    typeof behavior.totalTimeMs === "number" && behavior.totalTimeMs > 0
      ? behavior.totalTimeMs
      : 0;
  // 0 a <=45s (click-through), sale linearmente fino a 1 a >=300s.
  const timeScore =
    t <= 45_000 ? 0 : Math.min(1, (t - 45_000) / (300_000 - 45_000));
  const answered = behavior.answeredCount > 0 ? behavior.answeredCount : 0;
  const nonSoRatio = answered > 0 ? Math.min(1, behavior.nonSoCount / answered) : 0;
  const e = timeScore * (1 - nonSoRatio);
  return Math.max(0, Math.min(1, e));
}

export interface TierResult {
  tier: LeadTier;
  score: number; // ordinabile: hot > warm > cold, tie-break su overall_score
  reasons: string[];
}

/**
 * Classifica un lead in hot/warm/cold secondo regole verificabili.
 *
 * HOT  = completed AND overall_score>=3.5 AND email presente AND consenso_marketing=true
 * WARM = completed AND overall_score in [2.5, 3.49] con email
 *        OPPURE i requisiti di HOT ma senza consenso_marketing
 * COLD = anonymous OR overall_score<2.5 OR email assente
 *
 * `score` e' un valore di ranking (non il punteggio quiz): combina il rango di
 * tier con l'overall per dare un ordinamento stabile hot→warm→cold con
 * tie-break su overall_score desc.
 */
export function computeLeadTier(row: TierInput): TierResult {
  const reasons: string[] = [];
  const score = typeof row.overall_score === "number" ? row.overall_score : 0;
  const hasEmail = !!row.email && row.email.trim().length > 0;
  const isCompleted = row.status === "completed";

  // COLD: requisiti non soddisfatti alla radice.
  if (!isCompleted) {
    reasons.push("Record anonimo (form non inviato)");
    return tierResult("cold", score, reasons, row.behavior);
  }
  if (!hasEmail) {
    reasons.push("Email assente: non contattabile");
    return tierResult("cold", score, reasons, row.behavior);
  }
  if (score < TIER_THRESHOLDS.warmMin) {
    reasons.push(`Maturita' bassa (${score.toFixed(1)} < ${TIER_THRESHOLDS.warmMin})`);
    return tierResult("cold", score, reasons, row.behavior);
  }

  // A questo punto: completed, con email, score>=2.5.
  if (score >= TIER_THRESHOLDS.hotMin) {
    if (row.consenso_marketing === true) {
      reasons.push(`Maturita' alta (${score.toFixed(1)})`);
      reasons.push("Consenso marketing presente");
      return tierResult("hot", score, reasons, row.behavior);
    }
    // Tutti i requisiti HOT ma senza consenso marketing → WARM.
    reasons.push(`Maturita' alta (${score.toFixed(1)})`);
    reasons.push("Manca consenso marketing");
    return tierResult("warm", score, reasons, row.behavior);
  }

  // score in [2.5, 3.49] con email → WARM.
  reasons.push(`Maturita' media (${score.toFixed(1)})`);
  return tierResult("warm", score, reasons, row.behavior);
}

function tierResult(
  tier: LeadTier,
  overall: number,
  reasons: string[],
  behavior?: BehaviorSignals | null
): TierResult {
  const rank = tier === "hot" ? 2000 : tier === "warm" ? 1000 : 0;
  // Tie-break comportamentale: separa lead a parita' di tier e overall.
  const engagement = behaviorEngagement(behavior) * ENGAGEMENT_TIEBREAK_WEIGHT;
  return { tier, score: rank + overall + engagement, reasons };
}

// Mappatura tier → predicati SQL grezzi (per filtrare server-side senza
// rompere la paginazione: il tier non e' una colonna DB). Usata in queries.ts.
// Le chiavi sono interpretate dal chiamante che possiede la query builder.
export type TierPredicate =
  | { kind: "eq"; col: string; value: unknown }
  | { kind: "gte"; col: string; value: number }
  | { kind: "lt"; col: string; value: number }
  | { kind: "notNull"; col: string }
  | { kind: "null"; col: string }
  | { kind: "or"; expr: string };

/**
 * Predicati che, combinati in AND, selezionano esattamente le righe di un tier.
 * HOT: status=completed AND overall>=3.5 AND email not null AND consenso_marketing=true
 * WARM: e' un'unione di due insiemi → non esprimibile come solo AND. Per WARM
 *   ritorniamo i predicati "core" (completed, email not null, overall>=2.5) e
 *   lasciamo l'esclusione precisa degli HOT al filtro in-memory (documentato).
 * COLD: e' un OR di tre condizioni → idem, predicati core (overall<2.5 oppure
 *   non-completed/email assente vanno gestiti via OR string).
 *
 * Per robustezza usiamo l'approccio: HOT filtrabile interamente via AND; WARM e
 * COLD via predicati che restringono il piu' possibile, poi raffinamento finale
 * con computeLeadTier in memoria sul set ristretto (il count viene ricalcolato
 * sul set effettivamente classificato).
 */
export function tierPredicates(tier: LeadTier): TierPredicate[] {
  switch (tier) {
    case "hot":
      return [
        { kind: "eq", col: "status", value: "completed" },
        { kind: "gte", col: "overall_score", value: TIER_THRESHOLDS.hotMin },
        { kind: "notNull", col: "email" },
        { kind: "eq", col: "consenso_marketing", value: true },
      ];
    case "warm":
      return [
        { kind: "eq", col: "status", value: "completed" },
        { kind: "gte", col: "overall_score", value: TIER_THRESHOLDS.warmMin },
        { kind: "notNull", col: "email" },
      ];
    case "cold":
      // Non restringibile in modo netto senza OR; il raffinamento avviene in
      // memoria. Nessun predicato AND universale → ritorna vuoto.
      return [];
  }
}

// ── Gap totale (potenziale di vendita) ──
export type AxisScores = Partial<Record<`score_${AxisKey}`, number | null>>;

/**
 * Somma su tutti i 6 assi di (target consigliato - punteggio attuale).
 * Arrotondata a 1 decimale. null/missing → contributo 0 (asse a punteggio 0).
 * Restituisce null se NESSUN asse e' valorizzato (record senza punteggi).
 */
export function computeGapTotale(scores: AxisScores): number | null {
  let hasAny = false;
  let total = 0;
  for (const k of AXIS_KEYS) {
    const raw = scores[`score_${k}`];
    if (typeof raw === "number") hasAny = true;
    const current = typeof raw === "number" ? raw : 0;
    const target = getTargetScore(k, current);
    total += target - current;
  }
  if (!hasAny) return null;
  return Math.round(total * 10) / 10;
}

/** Asse piu' debole: chiave con punteggio piu' basso tra quelli valorizzati. */
export function weakestAxis(scores: AxisScores): AxisKey | null {
  let best: AxisKey | null = null;
  let bestVal = Infinity;
  for (const k of AXIS_KEYS) {
    const raw = scores[`score_${k}`];
    if (typeof raw !== "number") continue;
    if (raw < bestVal) {
      bestVal = raw;
      best = k;
    }
  }
  return best;
}

// ── Compliance risk (urgenza normativa aggregata) ──
export type ComplianceRisk = "critico" | "medio" | "basso";

function normalizeCompliance(
  compliance: unknown
): { reds: number; yellows: number; greens: number } | null {
  if (!Array.isArray(compliance)) return null;
  let reds = 0;
  let yellows = 0;
  let greens = 0;
  let valid = false;
  for (const item of compliance) {
    if (!item || typeof item !== "object") continue;
    const color = (item as { color?: unknown; stato?: unknown }).color
      ?? (item as { stato?: unknown }).stato;
    if (color === "red" || color === "rosso") {
      reds += 1;
      valid = true;
    } else if (color === "yellow" || color === "giallo") {
      yellows += 1;
      valid = true;
    } else if (color === "green" || color === "verde") {
      greens += 1;
      valid = true;
    }
  }
  if (!valid) return null;
  return { reds, yellows, greens };
}

/**
 * Rischio compliance aggregato dal jsonb `compliance`.
 * critico = >=3 rossi ; medio = >=2 gialli OPPURE 1-2 rossi ; basso = resto.
 * null se il jsonb non e' valorizzato/valido.
 */
export function computeComplianceRisk(compliance: unknown): ComplianceRisk | null {
  const c = normalizeCompliance(compliance);
  if (!c) return null;
  if (c.reds >= 3) return "critico";
  if (c.yellows >= 2 || c.reds >= 1) return "medio";
  return "basso";
}

/** Conteggi R/Y/G grezzi (per heatmap e badge); null se non valido. */
export function complianceCounts(
  compliance: unknown
): { reds: number; yellows: number; greens: number } | null {
  return normalizeCompliance(compliance);
}

// ── Giorni da created_at ──
/** Giorni interi trascorsi da `iso` a `now` (default oggi). 0 se futuro/invalid. */
export function daysSince(iso: string | null | undefined, now: Date = new Date()): number {
  if (!iso) return 0;
  const then = new Date(iso);
  if (isNaN(then.getTime())) return 0;
  const ms = now.getTime() - then.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / 86_400_000);
}

// Label brevi degli assi (per le azioni consigliate e le heatmap).
export const AXIS_SHORT_LABEL: Record<AxisKey, string> = {
  conformita: "Conformita'",
  processi: "Processi",
  utilizzo: "Utilizzo",
  autonomia: "Autonomia",
  protezione: "Protezione",
  tecnologia: "Tecnologia",
};

// ── Azione consigliata (prossimo passo commerciale) ──
export interface NextActionInput {
  tier: LeadTier;
  overall_score: number | null;
  compliance: unknown;
  weakest: AxisKey | null;
}

/**
 * Prossimo passo testuale derivato da regole (NON hardcoded nel JSX).
 * Priorita': anonimo → re-engagement; compliance critica → audit; score basso
 * → governance; altrimenti cita l'asse piu' debole.
 */
export function suggestNextAction(input: NextActionInput): string {
  const { tier, overall_score, compliance, weakest } = input;
  const risk = computeComplianceRisk(compliance);
  const score = typeof overall_score === "number" ? overall_score : null;

  if (tier === "cold" && (score == null || score === 0)) {
    return "Re-engagement: invito a completare l'assessment con i dati di contatto.";
  }
  if (risk === "critico") {
    return "Audit conformita' prioritario: 3+ aree in rosso, alto rischio normativo (AI Act / GDPR / L.132).";
  }
  if (score != null && score < 2) {
    return "Governance + change management: fondamenta assenti, partire da policy e cultura AI.";
  }
  if (risk === "medio") {
    return "Gap compliance da chiudere: proporre allineamento normativo mirato sulle aree gialle/rosse.";
  }
  if (weakest) {
    return `Intervento mirato sull'asse piu' debole: ${AXIS_SHORT_LABEL[weakest]}.`;
  }
  return "Consolidamento: ottimizzazione e integrazione avanzata sui processi AI esistenti.";
}

// Colore badge per tier (palette DA: hot verde, warm ambra, cold grigio).
export const TIER_COLOR: Record<LeadTier, { bg: string; fg: string; label: string }> = {
  hot: { bg: "#dcfce7", fg: "#16a34a", label: "Hot" },
  warm: { bg: "#fef3c7", fg: "#E09900", label: "Warm" },
  cold: { bg: "#f1f5f9", fg: "#64748b", label: "Cold" },
};

// Colore badge per compliance risk.
export const RISK_COLOR: Record<ComplianceRisk, { bg: string; fg: string; label: string }> = {
  critico: { bg: "#fef2f2", fg: "#dc2626", label: "Critico" },
  medio: { bg: "#fffbeb", fg: "#E09900", label: "Medio" },
  basso: { bg: "#f0fdf4", fg: "#16a34a", label: "Basso" },
};

// Colore della mini-barra del gap (<=1 verde, 1-2 ambra, >2 rosso).
export function gapColor(gap: number): string {
  if (gap <= 1) return "#16a34a";
  if (gap <= 2) return "#E09900";
  return "#dc2626";
}

// Riusato anche dal dettaglio per coerenza colore livello.
export { getLevel };
