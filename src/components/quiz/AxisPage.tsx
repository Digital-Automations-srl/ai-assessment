"use client";

import type { Axis } from "@/lib/types";
import ProgressBar from "./ProgressBar";
import Tooltip from "./Tooltip";

const GLOSSARY: { term: string; explanation: string }[] = [
  { term: "DPIA", explanation: "Data Protection Impact Assessment: valutazione d'impatto sulla protezione dei dati, obbligatoria per trattamenti ad alto rischio (GDPR Art. 35)." },
  { term: "AI Act", explanation: "Regolamento UE 2024/1689 sull'Intelligenza Artificiale. Stabilisce obblighi per chi sviluppa o usa sistemi AI nell'Unione Europea." },
  { term: "GDPR", explanation: "General Data Protection Regulation (Reg. UE 2016/679). Norma europea sulla protezione dei dati personali." },
  { term: "shadow AI", explanation: "Uso di strumenti AI non autorizzati dall'azienda, spesso con dati aziendali su piattaforme pubbliche senza controllo." },
  { term: "AUP", explanation: "Acceptable Use Policy: documento che definisce le regole per l'uso degli strumenti AI in azienda." },
];

function renderWithTooltips(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliestMatch: { index: number; term: string; explanation: string } | null = null;

    for (const g of GLOSSARY) {
      const idx = remaining.toLowerCase().indexOf(g.term.toLowerCase());
      if (idx !== -1 && (earliestMatch === null || idx < earliestMatch.index)) {
        earliestMatch = { index: idx, term: g.term, explanation: g.explanation };
      }
    }

    if (!earliestMatch) {
      parts.push(remaining);
      break;
    }

    if (earliestMatch.index > 0) {
      parts.push(remaining.slice(0, earliestMatch.index));
    }

    const matchedText = remaining.slice(earliestMatch.index, earliestMatch.index + earliestMatch.term.length);
    parts.push(
      <Tooltip key={key++} term={matchedText} explanation={earliestMatch.explanation} />
    );
    remaining = remaining.slice(earliestMatch.index + earliestMatch.term.length);
  }

  return parts;
}

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
                {idx + 1}. {renderWithTooltips(question.text)}
              </p>

              <div className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = selectedLetter === option.letter;

                  return (
                    <button
                      key={option.letter}
                      onClick={() =>
                        onSelect(question.id, option.letter, option.score)
                      }
                      className="flex w-full cursor-pointer items-start gap-3 rounded-lg border-2 p-3 text-left transition-all"
                      style={{
                        borderColor: isSelected ? "#016FC0" : "#E4E4E4",
                        backgroundColor: isSelected
                          ? "rgba(1, 111, 192, 0.05)"
                          : "white",
                        boxShadow: isSelected
                          ? "0 1px 4px rgba(1, 111, 192, 0.15)"
                          : "none",
                        minHeight: "44px",
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
                        {option.letter}
                      </span>
                      <span className="text-sm" style={{ color: "#333" }}>
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
