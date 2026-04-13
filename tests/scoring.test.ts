import { describe, it, expect } from "vitest";
import {
  getLevel,
  getMessage,
  calculateAxisScore,
  calculateResults,
  AFTER_TARGETS,
  LEVEL_LABELS,
  LEVEL_DETAILS,
} from "@/lib/scoring";
import { AXES } from "@/lib/quiz-data";

// ─── T01: getLevel thresholds ─────────────────────────────────────────────
describe("T01 – getLevel returns correct label and color for each threshold", () => {
  it("score 1.0 → Iniziale (red)", () => {
    const r = getLevel(1.0);
    expect(r.label).toBe("Iniziale");
    expect(r.color).toBe("#dc2626");
  });

  it("score 1.4 → Iniziale (boundary)", () => {
    expect(getLevel(1.4).label).toBe("Iniziale");
  });

  it("score 1.5 → In avvio", () => {
    expect(getLevel(1.5).label).toBe("In avvio");
  });

  it("score 2.4 → In avvio (boundary)", () => {
    expect(getLevel(2.4).label).toBe("In avvio");
  });

  it("score 2.5 → In costruzione", () => {
    expect(getLevel(2.5).label).toBe("In costruzione");
  });

  it("score 3.5 → Operativo", () => {
    expect(getLevel(3.5).label).toBe("Operativo");
  });

  it("score 4.5 → Maturo", () => {
    expect(getLevel(4.5).label).toBe("Maturo");
  });

  it("score 5.0 → Maturo", () => {
    expect(getLevel(5.0).label).toBe("Maturo");
  });
});

// ─── T02: getMessage returns correct range message ────────────────────────
describe("T02 – getMessage returns message for each score range", () => {
  it("score 1.0 → contains 'fase iniziale'", () => {
    expect(getMessage(1.0)).toContain("fase iniziale");
  });

  it("score 2.0 → contains 'primi passi'", () => {
    expect(getMessage(2.0)).toContain("primi passi");
  });

  it("score 3.0 → contains 'base solida'", () => {
    expect(getMessage(3.0)).toContain("base solida");
  });

  it("score 4.0 → contains 'buon livello'", () => {
    expect(getMessage(4.0)).toContain("buon livello");
  });

  it("score 5.0 → contains 'piu' avanzate'", () => {
    expect(getMessage(5.0)).toContain("piu' avanzate");
  });
});

// ─── T03: calculateAxisScore ──────────────────────────────────────────────
describe("T03 – calculateAxisScore averages correctly", () => {
  it("all-1 → 1.0", () => {
    expect(calculateAxisScore([1, 1, 1, 1, 1])).toBe(1.0);
  });

  it("all-5 → 5.0", () => {
    expect(calculateAxisScore([5, 5, 5, 5, 5])).toBe(5.0);
  });

  it("mixed [1,2,3,4,5] → 3.0", () => {
    expect(calculateAxisScore([1, 2, 3, 4, 5])).toBe(3.0);
  });

  it("with G2-C 2.5 score → correct average", () => {
    expect(calculateAxisScore([1, 2.5, 3, 4, 5])).toBe(3.1);
  });

  it("with Non-so 1.5 score → correct average", () => {
    expect(calculateAxisScore([1, 1.5, 3, 4, 5])).toBe(2.9);
  });
});

// ─── T04: Profile all-A (score=1) → overall 1.0 ──────────────────────────
describe("T04 – Full profile all-A: overall score = 1.0, label = Iniziale", () => {
  it("all questions answered A (score=1) → 1.0", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 1;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    expect(r.overallScore).toBe(1.0);
    expect(r.overallLabel).toBe("Iniziale");
  });
});

// ─── T05: Profile all-E (score=5) → overall 5.0 ──────────────────────────
describe("T05 – Full profile all-E: overall score = 5.0, label = Maturo", () => {
  it("all questions answered E (score=5) → 5.0", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 5;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    expect(r.overallScore).toBe(5.0);
    expect(r.overallLabel).toBe("Maturo");
  });
});

// ─── T06: Profile all-NS (score=1.5) → overall 1.5 ──────────────────────
describe("T06 – Profile with NS answers (score=1.5) computes correctly", () => {
  it("all questions 1.5 → overall 1.5, label In avvio", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 1.5;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    expect(r.overallScore).toBe(1.5);
    expect(r.overallLabel).toBe("In avvio");
  });
});

// ─── T07: G2 option C = 2.5 (non-standard score) ────────────────────────
describe("T07 – G2 option C has non-standard score 2.5", () => {
  it("G2 question has option C with score 2.5", () => {
    const processAxis = AXES.find((a) => a.key === "processi")!;
    const g2 = processAxis.questions.find((q) => q.id === "G2")!;
    const optionC = g2.options.find((o) => o.letter === "C")!;
    expect(optionC.score).toBe(2.5);
  });
});

// ─── T08: Compliance traffic light logic ─────────────────────────────────
describe("T08 – Compliance scoring: red < 2.0, yellow 2.0–3.0, green > 3.0", () => {
  it("all-A (score=1) → all compliance areas red", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 1;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    for (const c of r.compliance) {
      expect(c.color).toBe("red");
    }
  });

  it("all-E (score=5) → all compliance areas green", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 5;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    for (const c of r.compliance) {
      expect(c.color).toBe("green");
    }
  });

  it("score=2.0 → yellow for areas using that question", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 2;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    // All compliance area scores should be 2.0 → yellow
    for (const c of r.compliance) {
      expect(c.color).toBe("yellow");
    }
  });
});

// ─── T09: Compliance has exactly 7 areas ─────────────────────────────────
describe("T09 – Compliance returns exactly 7 areas", () => {
  it("returns 7 compliance results", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 3;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    expect(r.compliance).toHaveLength(7);
  });

  it("each area has name, reference, score, color, message, action", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 3;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    for (const c of r.compliance) {
      expect(c.name).toBeTruthy();
      expect(c.reference).toBeTruthy();
      expect(typeof c.score).toBe("number");
      expect(["red", "yellow", "green"]).toContain(c.color);
      expect(c.message).toBeTruthy();
      expect(c.action).toBeTruthy();
    }
  });
});

// ─── T10: calculateResults returns all required fields ───────────────────
describe("T10 – calculateResults returns complete result object", () => {
  it("has axisResults, overallScore, overallLabel, overallColor, overallMessage, compliance", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 3;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    expect(r.axisResults).toHaveLength(6);
    expect(typeof r.overallScore).toBe("number");
    expect(r.overallLabel).toBeTruthy();
    expect(r.overallColor).toBeTruthy();
    expect(r.overallMessage).toBeTruthy();
    expect(r.compliance).toBeDefined();
  });

  it("each axisResult has key, label, formal, score, levelLabel, levelColor", () => {
    const answers: Record<string, number> = {};
    for (const axis of AXES) {
      for (const q of axis.questions) {
        answers[q.id] = 3;
      }
    }
    const r = calculateResults(answers, {}, AXES);
    for (const a of r.axisResults) {
      expect(a.key).toBeTruthy();
      expect(a.label).toBeTruthy();
      expect(a.formal).toBeTruthy();
      expect(typeof a.score).toBe("number");
      expect(a.levelLabel).toBeTruthy();
      expect(a.levelColor).toBeTruthy();
    }
  });
});

// ─── T11: AFTER_TARGETS / LEVEL_LABELS / LEVEL_DETAILS exports ──────────
describe("T11 – Exported constants cover all 6 axes", () => {
  const axisKeys = ["conformita", "processi", "utilizzo", "autonomia", "protezione", "tecnologia"];

  it("AFTER_TARGETS has entries for all 6 axes", () => {
    for (const key of axisKeys) {
      expect(AFTER_TARGETS[key as keyof typeof AFTER_TARGETS]).toBeDefined();
      expect(AFTER_TARGETS[key as keyof typeof AFTER_TARGETS].score).toBeGreaterThan(0);
    }
  });

  it("LEVEL_LABELS has 6 entries per axis (empty + 5 levels)", () => {
    for (const key of axisKeys) {
      expect(LEVEL_LABELS[key as keyof typeof LEVEL_LABELS]).toHaveLength(6);
    }
  });

  it("LEVEL_DETAILS has 6 entries per axis (empty + 5 levels)", () => {
    for (const key of axisKeys) {
      expect(LEVEL_DETAILS[key as keyof typeof LEVEL_DETAILS]).toHaveLength(6);
    }
  });
});

// ─── T12: Missing answers default to 1 ──────────────────────────────────
describe("T12 – Missing answers default to score 1", () => {
  it("empty answers object → all axes score 1.0", () => {
    const r = calculateResults({}, {}, AXES);
    for (const a of r.axisResults) {
      expect(a.score).toBe(1.0);
    }
    expect(r.overallScore).toBe(1.0);
  });
});
