"use client";

import { useState } from "react";
import type { AxisResult, ComplianceResult, AxisKey } from "@/lib/types";
import { AFTER_TARGETS, LEVEL_LABELS, LEVEL_DETAILS } from "@/lib/scoring";
import SpiderChart from "./SpiderChart";
import ComplianceChecklist from "./ComplianceChecklist";

interface ReportProps {
  axisResults: AxisResult[];
  overallScore: number;
  overallLabel: string;
  overallColor: string;
  overallMessage: string;
  compliance: ComplianceResult[];
  leadName: string;
  onThankYou?: () => void;
}

export default function Report({
  axisResults,
  overallScore,
  overallLabel,
  overallColor,
  overallMessage,
  compliance,
  leadName,
  onThankYou,
}: ReportProps) {
  const [expandedAxis, setExpandedAxis] = useState<AxisKey | null>(null);

  const chartData = axisResults.reduce(
    (acc, r) => {
      acc[r.key] = r.score;
      return acc;
    },
    {} as Record<AxisKey, number>
  );

  const toggleAxis = (key: AxisKey) => {
    setExpandedAxis((prev) => (prev === key ? null : key));
  };

  const getLevelIndex = (score: number): number => {
    if (score <= 1.4) return 1;
    if (score <= 2.4) return 2;
    if (score <= 3.4) return 3;
    if (score <= 4.4) return 4;
    return 5;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Section 1: Profile */}
      <h1
        className="text-center text-2xl font-extrabold"
        style={{ color: "#004172" }}
      >
        Report AI Readiness - {leadName}
      </h1>

      <div className="mt-8 flex flex-col items-center">
        <span
          className="text-5xl font-extrabold"
          style={{ color: overallColor }}
        >
          {overallScore.toFixed(1)}
        </span>
        <span
          className="mt-1 text-lg font-semibold"
          style={{ color: overallColor }}
        >
          {overallLabel}
        </span>
      </div>

      <div className="mt-8">
        <SpiderChart
          data={chartData}
          targetData={Object.keys(AFTER_TARGETS).reduce(
            (acc, key) => {
              acc[key as AxisKey] = AFTER_TARGETS[key as AxisKey].score;
              return acc;
            },
            {} as Record<AxisKey, number>
          )}
          size={380}
        />
        {/* Legend */}
        <div className="mt-3 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#E09900" }} />
            <span className="text-xs font-semibold" style={{ color: "#E09900" }}>La tua azienda</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#016FC0" }} />
            <span className="text-xs font-semibold" style={{ color: "#016FC0" }}>Obiettivo DA (90gg)</span>
          </div>
        </div>
      </div>

      <div
        className="mt-6 rounded-lg p-4"
        style={{
          borderLeft: "4px solid #016FC0",
          backgroundColor: "#f0f7ff",
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "#333" }}>
          {overallMessage}
        </p>
      </div>

      {/* Section 2: Axis details */}
      <h2
        className="mt-12 text-xl font-extrabold"
        style={{ color: "#004172" }}
      >
        Dettaglio per area
      </h2>

      <div className="mt-4 space-y-3">
        {axisResults.map((axis) => {
          const isExpanded = expandedAxis === axis.key;
          const levelIdx = getLevelIndex(axis.score);
          const labels = LEVEL_LABELS[axis.key];
          const details = LEVEL_DETAILS[axis.key];
          const target = AFTER_TARGETS[axis.key];

          return (
            <div
              key={axis.key}
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "#E4E4E4" }}
            >
              {/* Card header - always visible */}
              <button
                onClick={() => toggleAxis(axis.key)}
                className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#004172" }}
                  >
                    {axis.label}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: axis.levelColor }}
                  >
                    {axis.score.toFixed(1)} - {axis.levelLabel}
                  </span>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="#999"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div
                  className="border-t px-4 py-4"
                  style={{ borderColor: "#E4E4E4" }}
                >
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-semibold uppercase" style={{ color: "#666" }}>
                        Livello attuale
                      </span>
                      <p className="mt-1 text-sm" style={{ color: "#333" }}>
                        <strong style={{ color: axis.levelColor }}>
                          {labels[levelIdx]}
                        </strong>{" "}
                        - {details[levelIdx]}
                      </p>
                    </div>

                    <div
                      className="rounded-lg p-3"
                      style={{ backgroundColor: "#f0f7ff" }}
                    >
                      <span className="text-xs font-semibold uppercase" style={{ color: "#666" }}>
                        Obiettivo dopo AI Starter Program
                      </span>
                      <p className="mt-1 text-sm" style={{ color: "#016FC0" }}>
                        <strong>
                          {target.score.toFixed(1)} - {target.label}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section 3: Compliance checklist */}
      <div className="mt-12">
        <ComplianceChecklist compliance={compliance} />
      </div>

      {/* Section 4: Next steps */}
      <div
        className="mt-12 rounded-xl border p-6"
        style={{ borderColor: "#E4E4E4", backgroundColor: "#f8f9fa" }}
      >
        <h2
          className="text-xl font-extrabold"
          style={{ color: "#004172" }}
        >
          Prossimi passi
        </h2>

        <p className="mt-3 text-sm leading-relaxed" style={{ color: "#444" }}>
          L&apos;AI Starter Program di Digital Automations e&apos; un percorso
          strutturato di 90 giorni progettato per portare la tua azienda dal
          livello attuale a un livello operativo su tutte e 6 le aree. Include
          conformita&apos; normativa, formazione, deployment di agenti AI e
          governance.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <a
            href="https://calendly.com/digital-automations"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block cursor-pointer rounded-lg px-8 py-3 text-center font-bold text-white transition-colors"
            style={{ backgroundColor: "#016FC0" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#004172")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#016FC0")
            }
          >
            Prenota una call di 30 minuti
          </a>
        </div>
      </div>

      {/* Go to thank you */}
      {onThankYou && (
        <div className="mt-8 text-center pb-8">
          <button
            onClick={onThankYou}
            className="text-sm font-medium transition-colors cursor-pointer"
            style={{ color: "#016FC0" }}
          >
            Vai alla pagina di conferma &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
