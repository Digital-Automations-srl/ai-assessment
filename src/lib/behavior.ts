// Costruzione dei segnali comportamentali del quiz (DATA-2). Lato CLIENT: legge
// quiz-data (AXES) per derivare conteggi. I valori "runtime" (tempo, back-click)
// arrivano dai ref di page.tsx. Modulo separato dalla sanificazione server-side
// (submission-record.ts) per non trascinare quiz-data nei route handler.

import { AXES } from "./quiz-data";
import type { BehaviorSignals } from "./types";
import type { QuizAnswerMap } from "./submission-record";

// Numero totale di domande quiz (oggi 30) — derivato, non hardcoded.
export const TOTAL_QUIZ_QUESTIONS = AXES.reduce(
  (n, a) => n + a.questions.length,
  0
);

// Chiavi `${questionId}:${letter}` delle opzioni flaggate "Non so" (isNonSo).
// Oggi vuoto (nessuna opzione e' flaggata nel quiz): countNonSo → 0. Si popola
// da solo se in futuro si aggiungono opzioni con isNonSo: true.
const NON_SO_KEYS = new Set<string>(
  AXES.flatMap((a) =>
    a.questions.flatMap((q) =>
      q.options.filter((o) => o.isNonSo).map((o) => `${q.id}:${o.letter}`)
    )
  )
);

/** Conta le risposte su opzioni "Non so" (isNonSo). */
export function countNonSo(answers: QuizAnswerMap): number {
  let n = 0;
  for (const [qId, ans] of Object.entries(answers)) {
    if (NON_SO_KEYS.has(`${qId}:${ans.letter}`)) n += 1;
  }
  return n;
}

/** Assembla i BehaviorSignals da risposte + segnali runtime (tempo, back-click). */
export function buildBehavior(input: {
  quizAnswers: QuizAnswerMap;
  totalTimeMs: number | null;
  backClicks: number;
}): BehaviorSignals {
  const answeredCount = Object.keys(input.quizAnswers).length;
  return {
    totalTimeMs: input.totalTimeMs,
    answeredCount,
    skippedCount: Math.max(0, TOTAL_QUIZ_QUESTIONS - answeredCount),
    nonSoCount: countNonSo(input.quizAnswers),
    backClicks: Math.max(0, input.backClicks),
  };
}
