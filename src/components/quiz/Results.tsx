"use client";

import type { AxisResult, AxisKey } from "@/lib/types";
import SpiderChart from "./SpiderChart";
import { AFTER_TARGETS } from "@/lib/scoring";

interface ResultsProps {
  overallScore: number;
  overallLabel: string;
  overallColor: string;
  overallMessage: string;
  axisResults: AxisResult[];
  onGetReport: () => void;
}

export default function Results({
  overallScore,
  overallLabel,
  overallColor,
  overallMessage,
  axisResults,
  onGetReport,
}: ResultsProps) {
  const chartData = axisResults.reduce(
    (acc, r) => {
      acc[r.key] = r.score;
      return acc;
    },
    {} as Record<AxisKey, number>
  );

  const targetData = Object.keys(AFTER_TARGETS).reduce(
    (acc, key) => {
      acc[key as AxisKey] = AFTER_TARGETS[key as AxisKey].score;
      return acc;
    },
    {} as Record<AxisKey, number>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Title */}
      <h1
        className="text-center text-2xl font-extrabold"
        style={{ color: "#004172" }}
      >
        Il tuo profilo AI Readiness
      </h1>

      {/* Score badge */}
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

      {/* Spider chart */}
      <div className="mt-8">
        <SpiderChart data={chartData} targetData={targetData} size={380} />
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

      {/* Score table */}
      <div className="mt-8 overflow-hidden rounded-xl border" style={{ borderColor: "#E4E4E4" }}>
        {axisResults.map((axis, i) => (
          <div
            key={axis.key}
            className="flex items-center gap-4 px-4 py-3"
            style={{
              borderTop: i > 0 ? "1px solid #E4E4E4" : "none",
            }}
          >
            <span
              className="w-40 shrink-0 text-sm font-semibold"
              style={{ color: "#004172" }}
            >
              {axis.label}
            </span>

            <span
              className="w-12 shrink-0 text-right text-sm font-bold"
              style={{ color: axis.levelColor }}
            >
              {axis.score.toFixed(1)}
            </span>

            <span className="text-xs" style={{ color: "#666" }}>
              /5.0
            </span>

            {/* Visual bar */}
            <div className="flex-1">
              <div
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "#E4E4E4" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: axis.levelColor,
                    width: `${(axis.score / 5) * 100}%`,
                  }}
                />
              </div>
            </div>

            <span
              className="w-28 shrink-0 text-right text-xs font-medium"
              style={{ color: axis.levelColor }}
            >
              {axis.levelLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Contextual message */}
      <div
        className="mt-8 rounded-lg p-4"
        style={{
          borderLeft: "4px solid #016FC0",
          backgroundColor: "#f0f7ff",
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "#333" }}>
          {overallMessage}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={onGetReport}
          className="cursor-pointer rounded-lg px-10 py-4 text-lg font-bold text-white transition-colors"
          style={{ backgroundColor: "#016FC0" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#004172")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#016FC0")
          }
        >
          Ottieni il report gratuito
        </button>
      </div>
    </div>
  );
}
