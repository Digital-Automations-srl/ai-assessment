import { describe, it, expect } from "vitest";
import { buildBehavior, TOTAL_QUIZ_QUESTIONS } from "@/lib/behavior";
import { sanitizeBehavior } from "@/lib/submission-record";
import type { QuizAnswerMap } from "@/lib/submission-record";

function answers(n: number): QuizAnswerMap {
  const m: QuizAnswerMap = {};
  for (let i = 0; i < n; i++) m[`Q${i}`] = { letter: "A", score: 3 };
  return m;
}

describe("buildBehavior (DATA-2)", () => {
  it("conta risposte e calcola gli skip rispetto al totale domande", () => {
    const b = buildBehavior({ quizAnswers: answers(5), totalTimeMs: 120_000, backClicks: 2 });
    expect(b.answeredCount).toBe(5);
    expect(b.skippedCount).toBe(TOTAL_QUIZ_QUESTIONS - 5);
    expect(b.totalTimeMs).toBe(120_000);
    expect(b.backClicks).toBe(2);
  });

  it("nessuna opzione 'Non so' flaggata nel quiz attuale → nonSoCount 0", () => {
    const b = buildBehavior({ quizAnswers: answers(30), totalTimeMs: null, backClicks: 0 });
    expect(b.nonSoCount).toBe(0);
    expect(b.skippedCount).toBe(Math.max(0, TOTAL_QUIZ_QUESTIONS - 30));
  });

  it("clampa back-click negativi a 0 e passa totalTimeMs null", () => {
    const b = buildBehavior({ quizAnswers: answers(0), totalTimeMs: null, backClicks: -5 });
    expect(b.backClicks).toBe(0);
    expect(b.totalTimeMs).toBeNull();
  });
});

describe("sanitizeBehavior (DATA-2, difesa server-side)", () => {
  it("null per payload non-oggetto", () => {
    expect(sanitizeBehavior(null)).toBeNull();
    expect(sanitizeBehavior(undefined)).toBeNull();
    expect(sanitizeBehavior("x")).toBeNull();
    expect(sanitizeBehavior(42)).toBeNull();
  });

  it("normalizza un oggetto valido", () => {
    const b = sanitizeBehavior({
      totalTimeMs: 90_000.7,
      answeredCount: 30,
      skippedCount: 0,
      nonSoCount: 1,
      backClicks: 3,
    });
    expect(b).toEqual({
      totalTimeMs: 90_001,
      answeredCount: 30,
      skippedCount: 0,
      nonSoCount: 1,
      backClicks: 3,
    });
  });

  it("scarta valori negativi/NaN/non-numerici", () => {
    const b = sanitizeBehavior({
      totalTimeMs: -10,
      answeredCount: "tanti",
      skippedCount: NaN,
      nonSoCount: 2.9,
      backClicks: Infinity,
    });
    expect(b).toEqual({
      totalTimeMs: null,
      answeredCount: 0,
      skippedCount: 0,
      nonSoCount: 3,
      backClicks: 0,
    });
  });
});
