"use client";

import type { ContextQuestion as ContextQuestionType } from "@/lib/types";

interface ContextQuestionProps {
  question: ContextQuestionType;
  selectedOption: string | null;
  onSelect: (option: string) => void;
  onNext: () => void;
  onBack?: () => void;
  questionIndex: number;
  totalQuestions: number;
}

export default function ContextQuestion({
  question,
  selectedOption,
  onSelect,
  onNext,
  onBack,
  questionIndex,
  totalQuestions,
}: ContextQuestionProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="mb-1 text-sm" style={{ color: "#999" }}>
        Domanda {questionIndex + 1} di {totalQuestions}
      </p>

      <h2
        className="mb-6 text-lg font-semibold md:text-xl"
        style={{ color: "#004172" }}
      >
        {question.text}
      </h2>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option;
          return (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className="w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all"
              style={{
                borderColor: isSelected ? "#016FC0" : "#E4E4E4",
                backgroundColor: isSelected ? "rgba(1, 111, 192, 0.05)" : "white",
                minHeight: "44px",
              }}
            >
              <span className="text-[15px]" style={{ color: "#333" }}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="cursor-pointer rounded-lg border-2 px-6 py-2.5 font-semibold transition-colors"
            style={{ borderColor: "#E4E4E4", color: "#666" }}
          >
            Indietro
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onNext}
          disabled={!selectedOption}
          className="cursor-pointer rounded-lg px-6 py-2.5 font-semibold text-white transition-colors"
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
