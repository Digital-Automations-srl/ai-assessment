"use client";

// Accetta sia la shape completa del quiz (ComplianceResult: {name,color,reference,score,message,action})
// sia la shape ridotta dei record (recuperati da email): {area, stato:"verde|giallo|rosso"}.
// Normalizza internamente ed e' difensivo su campi mancanti per non crashare mai.
interface ComplianceItemInput {
  name?: string;
  area?: string;
  color?: string;
  stato?: string;
  reference?: string;
  score?: number | null;
  message?: string;
  action?: string;
}

interface ComplianceChecklistProps {
  compliance: ComplianceItemInput[];
}

const COLOR_CONFIG = {
  red: { dot: "#dc2626", bg: "#fef2f2", border: "#dc2626" },
  yellow: { dot: "#E09900", bg: "#fffbeb", border: "#E09900" },
  green: { dot: "#16a34a", bg: "#f0fdf4", border: "#16a34a" },
} as const;

type ColorKey = keyof typeof COLOR_CONFIG;

const STATO_TO_COLOR: Record<string, ColorKey> = {
  rosso: "red",
  giallo: "yellow",
  verde: "green",
  red: "red",
  yellow: "yellow",
  green: "green",
};

function resolveColor(item: ComplianceItemInput): ColorKey {
  const raw = (item.color ?? item.stato ?? "").toString().toLowerCase();
  return STATO_TO_COLOR[raw] ?? "yellow";
}

export default function ComplianceChecklist({
  compliance,
}: ComplianceChecklistProps) {
  return (
    <div>
      <h2 className="text-xl font-extrabold" style={{ color: "#004172" }}>
        Conformità: le 7 aree obbligatorie
      </h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "#666" }}>
        Verifica basata su AI Act (Reg. UE 2024/1689), GDPR (Reg. UE 2016/679)
        e Legge 132/2025 sull&apos;AI in ambito lavorativo.
      </p>

      <div className="mt-6 space-y-3">
        {compliance.map((item, i) => {
          const colors = COLOR_CONFIG[resolveColor(item)];
          const name = item.name ?? item.area ?? "Area";
          return (
            <div
              key={name + i}
              className="rounded-lg p-4"
              style={{
                backgroundColor: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: colors.dot }}
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-bold" style={{ color: "#004172" }}>
                      {name}
                    </span>
                    {item.reference && (
                      <span className="text-xs" style={{ color: "#666" }}>
                        {item.reference}
                      </span>
                    )}
                    {typeof item.score === "number" && (
                      <span
                        className="ml-auto text-sm font-bold"
                        style={{ color: colors.dot }}
                      >
                        {item.score.toFixed(1)}/5.0
                      </span>
                    )}
                  </div>

                  {item.message && (
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "#444" }}>
                      {item.message}
                    </p>
                  )}

                  {item.action && (
                    <p className="mt-2 text-xs font-medium" style={{ color: "#666" }}>
                      <strong>Azione:</strong> {item.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
