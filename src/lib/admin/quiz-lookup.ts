import { AXES, CONTEXT_QUESTIONS } from "@/lib/quiz-data";
import type { AxisKey } from "@/lib/types";

export interface FlatOption {
  letter: string;
  text: string;
  score: number;
}

interface FlatQuestion {
  id: string;
  text: string;
  axisKey: AxisKey;
  axisLabel: string;
  options: FlatOption[];
}

// Struttura ordinata asse → domande, per il rendering raggruppato delle 30
// risposte nel dettaglio.
export const AXIS_QUESTIONS = AXES.map((a) => ({
  key: a.key,
  label: a.label,
  questions: a.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
  })),
}));

const BY_ID = new Map<string, FlatQuestion>();
for (const a of AXES) {
  for (const q of a.questions) {
    BY_ID.set(q.id, {
      id: q.id,
      text: q.text,
      axisKey: a.key,
      axisLabel: a.label,
      options: q.options,
    });
  }
}

export function getQuestion(id: string): FlatQuestion | undefined {
  return BY_ID.get(id);
}

export function getOptionText(id: string, letter: string): string | null {
  return BY_ID.get(id)?.options.find((o) => o.letter === letter)?.text ?? null;
}

// id-domanda-contesto → testo (per mostrare ruolo ecc. dal jsonb `answers`).
export const CONTEXT_LABEL: Record<string, string> = Object.fromEntries(
  CONTEXT_QUESTIONS.map((q) => [q.id, q.text])
);
