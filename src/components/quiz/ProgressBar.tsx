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
      <p className="text-sm font-semibold" style={{ color: "#004172" }}>
        Asse {axisIndex + 1} di {totalAxes}: {axisLabel}
      </p>
      <div className="mt-1.5 flex gap-1">
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
