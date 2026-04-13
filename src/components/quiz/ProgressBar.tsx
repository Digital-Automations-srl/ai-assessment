"use client";

interface ProgressBarProps {
  axisLabel: string;
  axisIndex: number;
  totalAxes: number;
  questionIndex: number;
  totalQuestions: number;
}

export default function ProgressBar({
  axisLabel,
  axisIndex,
  totalAxes,
  questionIndex,
  totalQuestions,
}: ProgressBarProps) {
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="mb-6">
      <p className="text-sm font-semibold" style={{ color: "#004172" }}>
        Asse {axisIndex + 1} di {totalAxes}: {axisLabel}
      </p>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "#E4E4E4" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ backgroundColor: "#016FC0", width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs" style={{ color: "#999" }}>
        Domanda {questionIndex + 1} di {totalQuestions}
      </p>
    </div>
  );
}
