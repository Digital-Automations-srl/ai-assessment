"use client";

interface ProgressBarProps {
  axisLabel: string;
  axisIndex: number;
  totalAxes: number;
}

export default function ProgressBar({
  axisLabel,
  axisIndex,
  totalAxes,
}: ProgressBarProps) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#666" }}>
        Asse {axisIndex + 1} di {totalAxes}
      </p>
      <h2 className="mt-1 text-xl font-extrabold" style={{ color: "#004172" }}>
        {axisLabel}
      </h2>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: totalAxes }, (_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= axisIndex ? "#016FC0" : "#E4E4E4",
            }}
          />
        ))}
      </div>
    </div>
  );
}
