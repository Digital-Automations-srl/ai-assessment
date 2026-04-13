"use client";

import type { Axis } from "@/lib/types";
import ProgressBar from "./ProgressBar";

interface AxisPageProps {
  axis: Axis;
  axisIndex: number;
  totalAxes: number;
  answers: Record<string, { letter: string; score: number }>;
  onSelect: (questionId: string, letter: string, score: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AxisPage({
  axis,
  axisIndex,
  totalAxes,
  answers,
  onSelect,
  onNext,
  onBack,
}: AxisPageProps) {
  const allAnswered = axis.questions.every((q) => answers[q.id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ProgressBar
        axisLabel={axis.label}
        axisIndex={axisIndex}
        totalAxes={totalAxes}
      />

      <div className="space-y-8">
        {axis.questions.map((question, idx) => {
          const selectedLetter = answers[question.id]?.letter ?? null;

          return (
            <div
              key={question.id}
              className="rounded-xl border-2 p-5"
              style={{ borderColor: "#E4E4E4", backgroundColor: "white" }}
            >
              <p
                className="mb-4 text-[15px] font-semibold"
                style={{ color: "#004172" }}
              >
                {idx + 1}. {question.text}
              </p>

              <div className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = selectedLetter === option.letter;
                  const isNonSo = option.isNonSo === true;

                  return (
                    <button
                      key={option.letter}
                      onClick={() =>
                        onSelect(question.id, option.letter, option.score)
                      }
                      className="flex w-full cursor-pointer items-start gap-3 rounded-lg border-2 p-3 text-left transition-all"
                      style={{
                        borderColor: isSelected
                          ? "#016FC0"
                          : isNonSo
                            ? "rgba(224, 153, 0, 0.4)"
                            : "#E4E4E4",
                        backgroundColor: isSelected
                          ? "rgba(1, 111, 192, 0.05)"
                          : isNonSo
                            ? "#FFF8E7"
                            : "white",
                        boxShadow: isSelected
                          ? "0 1px 4px rgba(1, 111, 192, 0.15)"
                          : "none",
                      }}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: isSelected ? "#016FC0" : "#E4E4E4",
                          color: isSelected ? "white" : "#333",
                          minWidth: "24px",
                          minHeight: "24px",
                        }}
                      >
                        {isNonSo ? "?" : option.letter}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          color: "#333",
                          fontStyle: isNonSo ? "italic" : "normal",
                        }}
                      >
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="cursor-pointer rounded-lg border-2 px-6 py-2.5 font-semibold transition-colors"
          style={{ borderColor: "#E4E4E4", color: "#666" }}
        >
          Indietro
        </button>

        <button
          onClick={onNext}
          disabled={!allAnswered}
          className="rounded-lg px-6 py-2.5 font-semibold text-white transition-colors"
          style={{
            backgroundColor: "#016FC0",
            opacity: allAnswered ? 1 : 0.4,
            cursor: allAnswered ? "pointer" : "not-allowed",
          }}
        >
          Avanti
        </button>
      </div>
    </div>
  );
}
