"use client";

import type { ComplianceResult } from "@/lib/types";

interface ComplianceChecklistProps {
  compliance: ComplianceResult[];
}

const COLOR_CONFIG = {
  red: {
    dot: "#dc2626",
    bg: "#fef2f2",
    border: "#dc2626",
  },
  yellow: {
    dot: "#E09900",
    bg: "#fffbeb",
    border: "#E09900",
  },
  green: {
    dot: "#16a34a",
    bg: "#f0fdf4",
    border: "#16a34a",
  },
};

export default function ComplianceChecklist({
  compliance,
}: ComplianceChecklistProps) {
  return (
    <div>
      <h2
        className="text-xl font-extrabold"
        style={{ color: "#004172" }}
      >
        Conformità: le 7 aree obbligatorie
      </h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "#666" }}>
        Verifica basata su AI Act (Reg. UE 2024/1689), GDPR (Reg. UE 2016/679)
        e Legge 132/2025 sull&apos;AI in ambito lavorativo.
      </p>

      <div className="mt-6 space-y-3">
        {compliance.map((item) => {
          const colors = COLOR_CONFIG[item.color];
          return (
            <div
              key={item.name}
              className="rounded-lg p-4"
              style={{
                backgroundColor: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Traffic light dot */}
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: colors.dot }}
                />

                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#004172" }}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs" style={{ color: "#666" }}>
                      {item.reference}
                    </span>
                    <span
                      className="ml-auto text-sm font-bold"
                      style={{ color: colors.dot }}
                    >
                      {item.score.toFixed(1)}/5.0
                    </span>
                  </div>

                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: "#444" }}
                  >
                    {item.message}
                  </p>

                  <p
                    className="mt-2 text-xs font-medium"
                    style={{ color: "#666" }}
                  >
                    <strong>Azione:</strong> {item.action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
