import { describe, it, expect } from "vitest";
import { AXES, CONTEXT_QUESTIONS } from "@/lib/quiz-data";

// ─── T13: Exactly 3 context questions ────────────────────────────────────
describe("T13 – Context questions: exactly 3 with correct IDs", () => {
  it("has exactly 3 context questions", () => {
    expect(CONTEXT_QUESTIONS).toHaveLength(3);
  });

  it("IDs are X1, X2, X3", () => {
    expect(CONTEXT_QUESTIONS.map((q) => q.id)).toEqual(["X1", "X2", "X3"]);
  });

  it("each context question has non-empty text and at least 2 options", () => {
    for (const q of CONTEXT_QUESTIONS) {
      expect(q.text.length).toBeGreaterThan(0);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

// ─── T14: Exactly 6 axes ────────────────────────────────────────────────
describe("T14 – Exactly 6 axes with correct keys", () => {
  it("has exactly 6 axes", () => {
    expect(AXES).toHaveLength(6);
  });

  it("keys are conformita, processi, utilizzo, autonomia, protezione, tecnologia", () => {
    expect(AXES.map((a) => a.key)).toEqual([
      "conformita",
      "processi",
      "utilizzo",
      "autonomia",
      "protezione",
      "tecnologia",
    ]);
  });

  it("each axis has label and formal name", () => {
    for (const axis of AXES) {
      expect(axis.label.length).toBeGreaterThan(0);
      expect(axis.formal.length).toBeGreaterThan(0);
    }
  });
});

// ─── T15: Each axis has exactly 5 questions ─────────────────────────────
describe("T15 – Each axis has exactly 5 questions", () => {
  for (const axis of AXES) {
    it(`${axis.label} (${axis.key}) has 5 questions`, () => {
      expect(axis.questions).toHaveLength(5);
    });
  }
});

// ─── T16: Total 30 quiz questions ───────────────────────────────────────
describe("T16 – Total quiz questions = 30", () => {
  it("sum of all axis questions = 30", () => {
    const total = AXES.reduce((sum, axis) => sum + axis.questions.length, 0);
    expect(total).toBe(30);
  });
});

// ─── T17: All question IDs are unique ───────────────────────────────────
describe("T17 – All question IDs are unique across all axes", () => {
  it("no duplicate IDs", () => {
    const allIds: string[] = [];
    for (const axis of AXES) {
      for (const q of axis.questions) {
        allIds.push(q.id);
      }
    }
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("question IDs match axis prefix (C for conformita, G for processi, etc.)", () => {
    const prefixMap: Record<string, string> = {
      conformita: "C",
      processi: "G",
      utilizzo: "A",
      autonomia: "S",
      protezione: "D",
      tecnologia: "T",
    };
    for (const axis of AXES) {
      const prefix = prefixMap[axis.key];
      for (const q of axis.questions) {
        expect(q.id.startsWith(prefix)).toBe(true);
      }
    }
  });
});

// ─── T18: Every question has at least 5 options (A-E) ───────────────────
describe("T18 – Every quiz question has at least 5 options", () => {
  for (const axis of AXES) {
    for (const q of axis.questions) {
      it(`${q.id} has >= 5 options`, () => {
        expect(q.options.length).toBeGreaterThanOrEqual(5);
      });
    }
  }
});

// ─── T19: Score range validation (1-5, plus 2.5 and 1.5 specials) ──────
describe("T19 – All option scores are in valid range [1, 5]", () => {
  it("every option score is between 1 and 5", () => {
    for (const axis of AXES) {
      for (const q of axis.questions) {
        for (const opt of q.options) {
          expect(opt.score).toBeGreaterThanOrEqual(1);
          expect(opt.score).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it("valid non-integer scores are 1.5 (Non so) and 2.5 (G2-C) only", () => {
    const nonIntegerScores: { id: string; letter: string; score: number }[] = [];
    for (const axis of AXES) {
      for (const q of axis.questions) {
        for (const opt of q.options) {
          if (opt.score % 1 !== 0) {
            nonIntegerScores.push({
              id: q.id,
              letter: opt.letter,
              score: opt.score,
            });
          }
        }
      }
    }
    for (const entry of nonIntegerScores) {
      expect([1.5, 2.5]).toContain(entry.score);
    }
  });
});

// ─── T20: No "Non so" options present ───────────────────────────────────
describe("T20 – No 'Non so' options in any question", () => {
  it("no question has isNonSo options", () => {
    for (const axis of AXES) {
      for (const q of axis.questions) {
        const hasNonSo = q.options.some((o) => o.isNonSo === true);
        expect(hasNonSo).toBe(false);
      }
    }
  });
});
