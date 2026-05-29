import type { QuizResults, AxisKey, BehaviorSignals } from "./types";

// Le 30 risposte complete del quiz, come tenute nello stato del client:
// { [questionId]: { letter, score } }.
export type QuizAnswerMap = Record<string, { letter: string; score: number }>;

// Mappa id-domanda-contesto → colonna denormalizzata. Il contesto e' keyed
// per id (X1/X2/X3), NON per nome. La fonte completa resta in `answers` (jsonb).
const CONTEXT_SETTORE = "X1"; // "Qual e' il settore principale..."
const CONTEXT_DIPENDENTI = "X2"; // "Quanti dipendenti ha l'azienda..."
// NB: non esiste una domanda di contesto per l'uso dell'AI → `ai_usage` resta null.

/**
 * Campi NON-PII condivisi dal record anonimo (track-result) e dal record
 * completo (send-report): punteggi per asse, overall, contesto denormalizzato,
 * contesto completo (jsonb), compliance e le 30 risposte storicizzate.
 */
export function buildSubmissionFields(
  results: QuizResults,
  quizAnswers?: QuizAnswerMap | null
) {
  const axisScores = results.axisResults.reduce(
    (acc: Record<string, number>, a: { key: AxisKey; score: number }) => {
      acc[`score_${a.key}`] = a.score;
      return acc;
    },
    {}
  );

  const ctx = results.contextAnswers ?? {};

  return {
    settore: ctx[CONTEXT_SETTORE] ?? null,
    dipendenti: ctx[CONTEXT_DIPENDENTI] ?? null,
    ai_usage: null as string | null,
    overall_score: results.overallScore,
    overall_label: results.overallLabel,
    ...axisScores,
    answers: results.contextAnswers,
    compliance: results.compliance,
    quiz_answers: quizAnswers ?? null,
  };
}

// Numero intero finito non-negativo, o fallback. Difesa server-side: il client
// non e' fidato (DATA-2).
function safeInt(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0
    ? Math.round(v)
    : fallback;
}

/**
 * Valida/normalizza i segnali comportamentali ricevuti dal client (DATA-2).
 * Ritorna null se il payload non e' un oggetto: la colonna `behavior` resta NULL.
 */
export function sanitizeBehavior(raw: unknown): BehaviorSignals | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const totalTimeMs =
    typeof b.totalTimeMs === "number" && Number.isFinite(b.totalTimeMs) && b.totalTimeMs >= 0
      ? Math.round(b.totalTimeMs)
      : null;
  return {
    totalTimeMs,
    answeredCount: safeInt(b.answeredCount),
    skippedCount: safeInt(b.skippedCount),
    nonSoCount: safeInt(b.nonSoCount),
    backClicks: safeInt(b.backClicks),
  };
}
