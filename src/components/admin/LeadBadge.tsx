import {
  RISK_COLOR,
  TIER_COLOR,
  type ComplianceRisk,
  type LeadTier,
} from "@/lib/admin/lead-scoring";

// Badge priorità (tier) riusabile in tabella e dettaglio.
export function TierBadge({ tier, title }: { tier: LeadTier; title?: string }) {
  const c = TIER_COLOR[tier];
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.fg }}
      />
      {c.label}
    </span>
  );
}

// Badge rischio compliance (critico/medio/basso). null → trattino.
export function RiskBadge({ risk }: { risk: ComplianceRisk | null }) {
  if (!risk) return <span className="text-gray-300">—</span>;
  const c = RISK_COLOR[risk];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.fg }}
      />
      {c.label}
    </span>
  );
}
