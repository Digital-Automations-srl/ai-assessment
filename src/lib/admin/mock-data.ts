// Dataset MOCK per far girare /admin senza DB (sandbox non raggiunge Supabase).
// Attivo SOLO quando ADMIN_MOCK=1. Mai sul percorso di produzione: le query
// controllano l'env prima di usarlo. Distribuzione realistica coerente con i
// ~25 lead reali (molti overall 1-2.x, pochi 3.5-3.9; "Servizi professionali"
// dominante; compliance R/Y/G; alcuni anonimi).

import type { ComplianceResult } from "@/lib/types";
import { COMPLIANCE_AREA_NAMES, getLevel } from "@/lib/scoring";
import type { SubmissionRow } from "./types";

const SETTORI = [
  "Servizi professionali",
  "Servizi professionali",
  "Servizi professionali",
  "Manifattura e produzione",
  "IT e tecnologia",
  "Formazione e education",
  "Costruzioni e impianti",
];
const DIMENSIONI = ["Meno di 10", "Meno di 10", "10-50", "51-100"];
const RUOLI = [
  "Titolare / CEO",
  "Direzione generale (AD, DG)",
  "IT / CTO",
  "HR / Risorse Umane",
  "Amministrazione e finanza",
  "Altro",
];

const AXIS_KEYS = [
  "conformita",
  "processi",
  "utilizzo",
  "autonomia",
  "protezione",
  "tecnologia",
] as const;

// PRNG deterministico (mulberry32) per dati riproducibili.
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

function complianceFor(r: () => number, overall: number): ComplianceResult[] {
  // Maturita' bassa → piu' rossi. Genera colori coerenti col livello.
  return COMPLIANCE_AREA_NAMES.map((name, i) => {
    const roll = r() + (overall - 2.5) * 0.18;
    let color: "red" | "yellow" | "green";
    if (roll < 0.35) color = "red";
    else if (roll < 0.7) color = "yellow";
    else color = "green";
    const score = color === "red" ? 1.5 : color === "yellow" ? 2.7 : 3.8;
    return {
      name,
      reference: "AI Act / GDPR",
      score,
      color,
      message: `Stato area ${i + 1}.`,
      action: "Azione consigliata.",
    };
  });
}

function buildRow(i: number): SubmissionRow {
  const r = rng(1000 + i);
  // ~30% anonimi, resto completati. Maturita' sbilanciata in basso.
  const anonymous = r() < 0.3;
  // overall: distribuzione con coda bassa.
  const base = r();
  const overall =
    base < 0.55
      ? Math.round((1 + r() * 1.4) * 10) / 10 // 1.0-2.4 (maggioranza)
      : base < 0.85
        ? Math.round((2.5 + r() * 0.9) * 10) / 10 // 2.5-3.4
        : Math.round((3.5 + r() * 0.4) * 10) / 10; // 3.5-3.9 (pochi)
  const label = getLevel(overall).label;

  const axisScores: Record<string, number> = {};
  for (const k of AXIS_KEYS) {
    const v = Math.max(1, Math.min(5, Math.round((overall + (r() - 0.5) * 1.6) * 10) / 10));
    axisScores[`score_${k}`] = v;
  }

  const daysAgo = Math.floor(r() * 120);
  const created = new Date(Date.now() - daysAgo * 86_400_000);
  const month = created.getMonth();
  // distribuisci su piu' mesi per il trend
  created.setMonth(month);

  const settore = pick(r, SETTORI);
  const dipendenti = pick(r, DIMENSIONI);
  const ruolo = pick(r, RUOLI);
  const consensoMkt = r() < 0.45;

  // DATA-1: UTM finti per varieta' (alcuni record senza attribuzione → NULL).
  const hasUtm = r() < 0.6;
  const utmSource = hasUtm ? pick(r, ["google", "linkedin", "newsletter", "referral"]) : null;
  const utmMedium = hasUtm ? pick(r, ["cpc", "social", "email", "organic"]) : null;
  const utmCampaign = hasUtm ? pick(r, ["ai-readiness", "pmi-2026", "webinar"]) : null;

  // DATA-2: behavior finto (tempo totale + back-click variabili; ~metà degli
  // anonimi senza behavior → null, come gli storici).
  const behavior =
    anonymous && r() < 0.5
      ? null
      : {
          totalTimeMs: Math.round((30 + r() * 540) * 1000), // 30s..570s
          answeredCount: 30,
          skippedCount: 0,
          nonSoCount: 0,
          backClicks: Math.floor(r() * 4),
        };

  return {
    id: `mock-${String(i).padStart(3, "0")}`,
    created_at: created.toISOString(),
    status: anonymous ? "anonymous" : "completed",
    completed_at: anonymous ? null : created.toISOString(),
    nome: anonymous ? null : pick(r, ["Marco", "Laura", "Giulia", "Andrea", "Paolo"]),
    cognome: anonymous ? null : pick(r, ["Rossi", "Bianchi", "Verdi", "Conti", "Ferrari"]),
    email: anonymous ? null : `lead${i}@esempio.it`,
    azienda: anonymous ? null : `Azienda ${i}`,
    telefono: anonymous ? null : `+39 333 ${1000000 + i}`,
    referral: pick(r, ["Google", "LinkedIn", "Passaparola", "Newsletter"]),
    settore,
    dipendenti,
    ai_usage: pick(r, ["Sperimentale", "Nessuno", "Strutturato"]),
    overall_score: overall,
    overall_label: label,
    answers: { X1: settore, X2: dipendenti, X3: ruolo },
    compliance: complianceFor(r, overall),
    quiz_answers: null,
    behavior,
    submission_token: null,
    consenso: anonymous ? null : true,
    consenso_marketing: anonymous ? null : consensoMkt,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: null,
    ...(axisScores as Record<`score_${(typeof AXIS_KEYS)[number]}`, number>),
  } as SubmissionRow;
}

let CACHE: SubmissionRow[] | null = null;

export function isMockMode(): boolean {
  return process.env.ADMIN_MOCK === "1";
}

export function getMockRows(): SubmissionRow[] {
  if (!CACHE) CACHE = Array.from({ length: 25 }, (_, i) => buildRow(i + 1));
  return CACHE;
}
