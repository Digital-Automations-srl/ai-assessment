// Design tokens Digital Automations — single source of truth degli hex di brand
// e dei colori semantici (CODE-3). Prima erano ~227 hex sparsi: importa da qui
// invece di scrivere "#004172" a mano. Modulo PURO (nessun import React/DOM):
// usabile sia in Server/Client Component (style inline) sia nei generatori
// server-side (SVG/email) che non passano da Tailwind.

// ── Palette di brand DA ─────────────────────────────────────────────────────
export const COLORS = {
  navy: "#004172",
  blue: "#016FC0",
  lightGray: "#E4E4E4",
  amber: "#E09900",
} as const;

// ── Colori semantici di stato (foreground + background tenue) ───────────────
// Riusati da compliance, tier lead e rischio: verde/ambra/rosso/neutro.
export interface StatusColor {
  fg: string;
  bg: string;
}
export const STATUS_COLORS = {
  green: { fg: "#16a34a", bg: "#dcfce7" },
  amber: { fg: "#E09900", bg: "#fef3c7" },
  red: { fg: "#dc2626", bg: "#fef2f2" },
  gray: { fg: "#64748b", bg: "#f1f5f9" },
  blue: { fg: "#016FC0", bg: "#e6f1fb" },
} as const satisfies Record<string, StatusColor>;

// ── Compliance: colori IT ↔ EN ──────────────────────────────────────────────
// Le submission storiche/recuperate usano sia il canonico EN ("red/yellow/
// green", da scoring.ts) sia l'IT ("rosso/giallo/verde"): normalizziamo a una
// chiave unica e mappiamo allo stato semantico corrispondente.
export type ComplianceColorKey = "red" | "yellow" | "green";

const COMPLIANCE_COLOR_ALIASES: Record<string, ComplianceColorKey> = {
  red: "red",
  rosso: "red",
  yellow: "yellow",
  giallo: "yellow",
  green: "green",
  verde: "green",
};

/** Normalizza un colore compliance (IT o EN) alla chiave canonica EN, o null. */
export function normalizeComplianceColor(c: unknown): ComplianceColorKey | null {
  if (typeof c !== "string") return null;
  return COMPLIANCE_COLOR_ALIASES[c.toLowerCase()] ?? null;
}

/** Stile (fg/bg) + label IT di un colore compliance (accetta IT o EN). */
export const COMPLIANCE_COLORS: Record<
  ComplianceColorKey,
  StatusColor & { label: string }
> = {
  red: { ...STATUS_COLORS.red, label: "Critico" },
  yellow: { ...STATUS_COLORS.amber, label: "Da migliorare" },
  green: { ...STATUS_COLORS.green, label: "Conforme" },
};
