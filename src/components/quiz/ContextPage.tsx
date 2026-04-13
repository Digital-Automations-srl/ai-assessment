"use client";

import type { ContextQuestion } from "@/lib/types";

interface ContextPageProps {
  questions: ContextQuestion[];
  answers: Record<string, string>;
  onSelect: (questionId: string, option: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ContextPage({
  questions,
  answers,
  onSelect,
  onNext,
  onBack,
}: ContextPageProps) {
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="mb-1 text-sm" style={{ color: "#999" }}>
        Informazioni di contesto
      </p>
      <h2
        className="mb-8 text-lg font-semibold md:text-xl"
        style={{ color: "#004172" }}
      >
        Prima di iniziare, raccontaci della tua azienda
      </h2>

      <div className="space-y-8">
        {questions.map((question, idx) => (
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
                const isSelected = answers[question.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => onSelect(question.id, option)}
                    className="w-full cursor-pointer rounded-lg border-2 p-3 text-left transition-all"
                    style={{
                      borderColor: isSelected ? "#016FC0" : "#E4E4E4",
                      backgroundColor: isSelected
                        ? "rgba(1, 111, 192, 0.05)"
                        : "white",
                      minHeight: "40px",
                    }}
                  >
                    <span className="text-sm" style={{ color: "#333" }}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
