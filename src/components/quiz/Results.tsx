"use client";

import { useEffect } from "react";
import type { AxisResult, AxisKey } from "@/lib/types";
import SpiderChart from "./SpiderChart";
import { getTargetScore } from "@/lib/scoring";
import { track, trackOnce } from "@/lib/plausible";

interface ResultsProps {
  overallScore: number;
  overallLabel: string;
  overallColor: string;
  overallMessage: string;
  axisResults: AxisResult[];
  onGetReport: () => void;
  /**
   * Funnel Fase 0 — teaser di curiosità (no PII). Numero di aree compliance con
   * un gap (non verdi) e nome dell'asse più debole. Solo conteggio/nome: NON
   * rivelano l'interpretazione, che resta gated nel report. Opzionali: senza
   * dati il teaser non viene mostrato.
   */
  complianceRiskCount?: number;
  weakestAxisLabel?: string;
}

export default function Results({
  overallScore,
  overallLabel,
  overallColor,
  overallMessage,
  axisResults,
  onGetReport,
  complianceRiskCount = 0,
  weakestAxisLabel = "",
}: ResultsProps) {
  // Funnel Fase 0 — eventi diagnostici di scroll sulla pagina risultati.
  // trackOnce ⇒ una sola emissione per soglia per sessione. Misura la
  // percentuale di pagina vista (scroll + viewport) / altezza documento.
  useEffect(() => {
    const measure = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight;
      if (total <= 0) return;
      const seen = window.scrollY + window.innerHeight;
      const pct = seen / total;
      if (pct >= 0.5) trackOnce("results_scroll_50");
      if (pct >= 0.9) trackOnce("results_scroll_90");
    };
    window.addEventListener("scroll", measure, { passive: true });
    // Misura iniziale: leggere scrollHeight forza il layout, quindi è
    // accurata già qui. Copre le pagine corte in cui non serve scrollare
    // (l'utente vede comunque CTA/fondo pagina).
    measure();
    return () => window.removeEventListener("scroll", measure);
  }, []);

  const showTeaser = complianceRiskCount > 0 || weakestAxisLabel !== "";
  const chartData = axisResults.reduce(
    (acc, r) => {
      acc[r.key] = r.score;
      return acc;
    },
    {} as Record<AxisKey, number>
  );

  // Target = max(floor, score + 1), capped at 5
  const targetData = axisResults.reduce(
    (acc, r) => {
      acc[r.key] = getTargetScore(r.key, r.score);
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
        <SpiderChart data={chartData} targetData={targetData} size={520} />
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

      {/* Teaser di curiosità (Funnel Fase 0) — apre il loop senza rivelare
          l'interpretazione: solo conteggio rischi + nome asse + framing del
          report come piano d'azione. NON sostituisce nulla di ciò che è sopra. */}
      {showTeaser && (
        <div
          className="mt-8 rounded-xl border p-5"
          style={{ borderColor: "#E09900", backgroundColor: "#FFF8EC" }}
        >
          <p className="text-sm font-bold" style={{ color: "#004172" }}>
            Nel report gratuito: il tuo piano d&apos;azione personalizzato
          </p>
          <ul className="mt-3 space-y-2">
            {complianceRiskCount > 0 && (
              <li className="flex items-start gap-2 text-sm" style={{ color: "#333" }}>
                <span aria-hidden="true">🔒</span>
                <span>
                  <strong>{complianceRiskCount}</strong>{" "}
                  {complianceRiskCount === 1
                    ? "rischio di conformità rilevato"
                    : "rischi di conformità rilevati"}{" "}
                  da analizzare
                </span>
              </li>
            )}
            {weakestAxisLabel !== "" && (
              <li className="flex items-start gap-2 text-sm" style={{ color: "#333" }}>
                <span aria-hidden="true">🎯</span>
                <span>
                  Il tuo punto più debole: «<strong>{weakestAxisLabel}</strong>»,
                  con le azioni concrete per rafforzarlo
                </span>
              </li>
            )}
          </ul>
          <p className="mt-3 text-xs" style={{ color: "#666" }}>
            Il report aggiunge rischi, opportunità e prossimi passi su misura per
            la tua azienda. Lo ricevi gratis via email.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            // Funnel Fase 0 — click sulla CTA verso il form (distingue
            // "non interessato" da "non ha visto la CTA").
            track("get_report_clicked");
            onGetReport();
          }}
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
