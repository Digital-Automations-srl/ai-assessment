"use client";

interface AxisTransitionProps {
  completedAxisLabel: string;
  nextAxisLabel: string;
  nextAxisIndex: number;
  totalAxes: number;
  onContinue: () => void;
}

export default function AxisTransition({
  completedAxisLabel,
  nextAxisLabel,
  nextAxisIndex,
  totalAxes,
  onContinue,
}: AxisTransitionProps) {
  return (
    <div className="flex min-h-[60vh] animate-[fadeIn_0.4s_ease-in] flex-col items-center justify-center px-4 py-12 text-center">
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Green check icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="32" fill="#16a34a" />
        <path
          d="M20 33L28 41L44 25"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h2
        className="mt-6 text-2xl font-bold"
        style={{ color: "#004172" }}
      >
        {completedAxisLabel} completato!
      </h2>

      <p className="mt-3 text-base" style={{ color: "#666" }}>
        Prossimo: <strong>{nextAxisLabel}</strong> (Asse {nextAxisIndex + 1} di{" "}
        {totalAxes})
      </p>

      <button
        onClick={onContinue}
        className="mt-8 cursor-pointer rounded-lg px-8 py-3 font-bold text-white transition-colors"
        style={{ backgroundColor: "#016FC0" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#004172")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#016FC0")
        }
      >
        Continua
      </button>
    </div>
  );
}
