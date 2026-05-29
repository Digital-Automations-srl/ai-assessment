import { describe, it, expect } from "vitest";
import {
  computeLeadTier,
  computeGapTotale,
  computeComplianceRisk,
  complianceCounts,
  suggestNextAction,
  weakestAxis,
  daysSince,
  gapColor,
  behaviorEngagement,
  TIER_THRESHOLDS,
} from "@/lib/admin/lead-scoring";
import type { BehaviorSignals } from "@/lib/types";

function behavior(o: Partial<BehaviorSignals>): BehaviorSignals {
  return {
    totalTimeMs: null,
    answeredCount: 30,
    skippedCount: 0,
    nonSoCount: 0,
    backClicks: 0,
    ...o,
  };
}

describe("computeLeadTier", () => {
  it("HOT: completed, score>=3.5, email, consenso marketing", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: 3.9,
      email: "a@b.it",
      consenso_marketing: true,
    });
    expect(r.tier).toBe("hot");
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it("WARM: completed, score nella fascia media con email", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: 2.9,
      email: "a@b.it",
      consenso_marketing: false,
    });
    expect(r.tier).toBe("warm");
  });

  it("WARM: requisiti HOT ma senza consenso marketing", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: 4.2,
      email: "a@b.it",
      consenso_marketing: false,
    });
    expect(r.tier).toBe("warm");
    expect(r.reasons.join(" ")).toMatch(/consenso/i);
  });

  it("COLD: record anonimo", () => {
    const r = computeLeadTier({
      status: "anonymous",
      overall_score: 4.5,
      email: null,
      consenso_marketing: null,
    });
    expect(r.tier).toBe("cold");
  });

  it("COLD: score basso anche se completed con email", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: 1.8,
      email: "a@b.it",
      consenso_marketing: true,
    });
    expect(r.tier).toBe("cold");
  });

  it("COLD: email assente anche se completed con score alto", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: 4.0,
      email: "  ",
      consenso_marketing: true,
    });
    expect(r.tier).toBe("cold");
  });

  it("boundary: esattamente warmMin (2.5) con email → warm", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: TIER_THRESHOLDS.warmMin,
      email: "a@b.it",
      consenso_marketing: false,
    });
    expect(r.tier).toBe("warm");
  });

  it("boundary: esattamente hotMin (3.5) con consenso → hot", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: TIER_THRESHOLDS.hotMin,
      email: "a@b.it",
      consenso_marketing: true,
    });
    expect(r.tier).toBe("hot");
  });

  it("ranking score ordina hot > warm > cold", () => {
    const hot = computeLeadTier({ status: "completed", overall_score: 3.6, email: "a@b.it", consenso_marketing: true });
    const warm = computeLeadTier({ status: "completed", overall_score: 4.9, email: "a@b.it", consenso_marketing: false });
    const cold = computeLeadTier({ status: "anonymous", overall_score: 5, email: null, consenso_marketing: null });
    expect(hot.score).toBeGreaterThan(warm.score);
    expect(warm.score).toBeGreaterThan(cold.score);
  });
});

describe("computeGapTotale", () => {
  it("calcola la somma dei gap target-attuale arrotondata", () => {
    const gap = computeGapTotale({
      score_conformita: 1,
      score_processi: 1,
      score_utilizzo: 1,
      score_autonomia: 1,
      score_protezione: 1,
      score_tecnologia: 1,
    });
    // floors: conf 4.5, proc 4.0, util 3.0, auto 3.8, prot 4.5, tech 3.5
    // ma target = max(floor, score+1) → con score 1: 4.5,4.0,3.0,3.8,4.5,3.5
    // gap = (4.5-1)+(4-1)+(3-1)+(3.8-1)+(4.5-1)+(3.5-1)=3.5+3+2+2.8+3.5+2.5=17.3
    expect(gap).toBeCloseTo(17.3, 1);
  });

  it("ritorna null se nessun asse e' valorizzato", () => {
    expect(computeGapTotale({})).toBeNull();
    expect(
      computeGapTotale({
        score_conformita: null,
        score_processi: null,
      })
    ).toBeNull();
  });

  it("gap piu' basso per punteggi alti", () => {
    const low = computeGapTotale({
      score_conformita: 5,
      score_processi: 5,
      score_utilizzo: 5,
      score_autonomia: 5,
      score_protezione: 5,
      score_tecnologia: 5,
    });
    expect(low).toBe(0);
  });
});

describe("computeComplianceRisk", () => {
  it("critico con >=3 rossi", () => {
    const c = [
      { name: "a", color: "red" },
      { name: "b", color: "red" },
      { name: "c", color: "red" },
      { name: "d", color: "green" },
    ];
    expect(computeComplianceRisk(c)).toBe("critico");
  });

  it("medio con >=2 gialli", () => {
    const c = [
      { name: "a", color: "yellow" },
      { name: "b", color: "yellow" },
      { name: "c", color: "green" },
    ];
    expect(computeComplianceRisk(c)).toBe("medio");
  });

  it("medio con 1 rosso", () => {
    const c = [
      { name: "a", color: "red" },
      { name: "b", color: "green" },
    ];
    expect(computeComplianceRisk(c)).toBe("medio");
  });

  it("basso con tutti verdi", () => {
    const c = [
      { name: "a", color: "green" },
      { name: "b", color: "green" },
    ];
    expect(computeComplianceRisk(c)).toBe("basso");
  });

  it("null se jsonb assente o malformato", () => {
    expect(computeComplianceRisk(null)).toBeNull();
    expect(computeComplianceRisk(undefined)).toBeNull();
    expect(computeComplianceRisk("nope")).toBeNull();
    expect(computeComplianceRisk([{ foo: 1 }])).toBeNull();
  });

  it("accetta anche label italiane rosso/giallo/verde", () => {
    const c = [
      { area: "a", stato: "rosso" },
      { area: "b", stato: "rosso" },
      { area: "c", stato: "rosso" },
    ];
    expect(computeComplianceRisk(c)).toBe("critico");
    expect(complianceCounts(c)).toEqual({ reds: 3, yellows: 0, greens: 0 });
  });
});

describe("weakestAxis", () => {
  it("trova l'asse col punteggio minimo", () => {
    expect(
      weakestAxis({
        score_conformita: 3,
        score_processi: 1.2,
        score_utilizzo: 4,
      })
    ).toBe("processi");
  });
  it("null se nessun punteggio", () => {
    expect(weakestAxis({})).toBeNull();
  });
});

describe("suggestNextAction", () => {
  it("re-engagement per cold senza score", () => {
    expect(
      suggestNextAction({ tier: "cold", overall_score: null, compliance: null, weakest: null })
    ).toMatch(/re-engagement/i);
  });
  it("audit per compliance critica", () => {
    const c = [{ color: "red" }, { color: "red" }, { color: "red" }];
    expect(
      suggestNextAction({ tier: "warm", overall_score: 3, compliance: c, weakest: "processi" })
    ).toMatch(/audit/i);
  });
  it("governance per score molto basso", () => {
    expect(
      suggestNextAction({ tier: "cold", overall_score: 1.5, compliance: null, weakest: "utilizzo" })
    ).toMatch(/governance/i);
  });
  it("cita l'asse debole altrimenti", () => {
    expect(
      suggestNextAction({ tier: "warm", overall_score: 3, compliance: [{ color: "green" }], weakest: "tecnologia" })
    ).toMatch(/tecnolog/i);
  });
});

describe("daysSince", () => {
  it("calcola giorni interi", () => {
    const now = new Date("2026-05-29T12:00:00Z");
    expect(daysSince("2026-05-19T12:00:00Z", now)).toBe(10);
  });
  it("0 per data futura o invalida", () => {
    const now = new Date("2026-05-29T12:00:00Z");
    expect(daysSince("2026-06-01T00:00:00Z", now)).toBe(0);
    expect(daysSince(null, now)).toBe(0);
    expect(daysSince("not-a-date", now)).toBe(0);
  });
});

describe("gapColor", () => {
  it("soglie colore", () => {
    expect(gapColor(0.5)).toBe("#16a34a");
    expect(gapColor(1.5)).toBe("#E09900");
    expect(gapColor(3)).toBe("#dc2626");
  });
});

describe("behaviorEngagement (DATA-2)", () => {
  it("0 se behavior assente", () => {
    expect(behaviorEngagement(null)).toBe(0);
    expect(behaviorEngagement(undefined)).toBe(0);
  });
  it("0 per completamento click-through (<=45s)", () => {
    expect(behaviorEngagement(behavior({ totalTimeMs: 20_000 }))).toBe(0);
    expect(behaviorEngagement(behavior({ totalTimeMs: 45_000 }))).toBe(0);
  });
  it("~1 per tempo congruo (>=300s) senza Non so", () => {
    expect(behaviorEngagement(behavior({ totalTimeMs: 300_000 }))).toBeCloseTo(1, 5);
    expect(behaviorEngagement(behavior({ totalTimeMs: 600_000 }))).toBe(1);
  });
  it("monotono crescente nel tempo", () => {
    const a = behaviorEngagement(behavior({ totalTimeMs: 100_000 }));
    const b = behaviorEngagement(behavior({ totalTimeMs: 200_000 }));
    expect(b).toBeGreaterThan(a);
  });
  it("penalizza la quota di risposte Non so", () => {
    const senza = behaviorEngagement(behavior({ totalTimeMs: 300_000, nonSoCount: 0 }));
    const con = behaviorEngagement(
      behavior({ totalTimeMs: 300_000, nonSoCount: 15, answeredCount: 30 })
    );
    expect(con).toBeLessThan(senza);
    expect(con).toBeCloseTo(0.5, 5);
  });
});

describe("computeLeadTier — tie-break comportamentale (DATA-2)", () => {
  const baseHot = {
    status: "completed",
    overall_score: 3.6,
    email: "a@b.it",
    consenso_marketing: true,
  } as const;

  it("a parita' di tier+overall, piu' engagement → score maggiore", () => {
    const engaged = computeLeadTier({ ...baseHot, behavior: behavior({ totalTimeMs: 400_000 }) });
    const fast = computeLeadTier({ ...baseHot, behavior: behavior({ totalTimeMs: 20_000 }) });
    const none = computeLeadTier({ ...baseHot });
    expect(engaged.tier).toBe("hot");
    expect(engaged.score).toBeGreaterThan(fast.score);
    expect(fast.score).toBeCloseTo(none.score, 5); // engagement 0 == nessun behavior
  });

  it("il tie-break NON scavalca una differenza reale di overall (<0.1)", () => {
    // overall 3.6 senza engagement vs 3.5 con engagement massimo: il maturo vince.
    const piuMaturo = computeLeadTier({ ...baseHot, overall_score: 3.6 });
    const menoMaturoEngaged = computeLeadTier({
      ...baseHot,
      overall_score: 3.5,
      behavior: behavior({ totalTimeMs: 600_000 }),
    });
    expect(piuMaturo.score).toBeGreaterThan(menoMaturoEngaged.score);
  });

  it("il tie-break non cambia la classe di tier", () => {
    const r = computeLeadTier({
      status: "completed",
      overall_score: 1.0,
      email: "a@b.it",
      consenso_marketing: true,
      behavior: behavior({ totalTimeMs: 600_000 }),
    });
    expect(r.tier).toBe("cold"); // overall basso resta cold malgrado l'engagement
  });
});
