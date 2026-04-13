"use client";

import type { QuizQuestion as QuizQuestionType } from "@/lib/types";
import ProgressBar from "./ProgressBar";

interface QuizQuestionProps {
  question: QuizQuestionType;
  axisLabel: string;
  axisIndex: number;
  totalAxes: number;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string | null;
  onSelect: (questionId: string, optionLetter: string, score: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function QuizQuestion({
  question,
  axisLabel,
  axisIndex,
  totalAxes,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelect,
  onNext,
  onBack,
}: QuizQuestionProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ProgressBar
        axisLabel={axisLabel}
        axisIndex={axisIndex}
        totalAxes={totalAxes}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
      />

      <h2
        className="mb-6 text-lg font-semibold md:text-xl"
        style={{ color: "#004172" }}
      >
        {question.text}
      </h2>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.letter;
          const isNonSo = option.isNonSo === true;

          return (
            <button
              key={option.letter}
              onClick={() => onSelect(question.id, option.letter, option.score)}
              className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-left transition-all"
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
                boxShadow: isSelected ? "0 1px 4px rgba(1, 111, 192, 0.15)" : "none",
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: isSelected ? "#016FC0" : "#E4E4E4",
                  color: isSelected ? "white" : "#333",
                  minWidth: "28px",
                  minHeight: "28px",
                }}
              >
                {isNonSo ? "?" : option.letter}
              </span>
              <span
                className="text-[15px]"
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
          disabled={!selectedOption}
          className="rounded-lg px-6 py-2.5 font-semibold text-white transition-colors"
          style={{
            backgroundColor: "#016FC0",
            opacity: selectedOption ? 1 : 0.4,
            cursor: selectedOption ? "pointer" : "not-allowed",
          }}
        >
          Avanti
        </button>
      </div>
    </div>
  );
}
