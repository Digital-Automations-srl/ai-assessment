"use client";

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 text-center">
      <h1
        className="mx-auto max-w-2xl text-[28px] leading-tight font-extrabold md:text-[36px]"
        style={{ color: "#004172" }}
      >
        Quanto e&apos; pronta la tua azienda per l&apos;AI?
      </h1>

      <p
        className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed md:text-[18px]"
        style={{ color: "#666666" }}
      >
        30 domande, 8 minuti. Scopri il tuo livello su 6 aree chiave e verifica
        la conformita&apos; su 7 obblighi normativi.
      </p>

      <button
        onClick={onStart}
        className="mt-8 cursor-pointer rounded-lg px-10 py-4 text-lg font-bold text-white transition-colors"
        style={{ backgroundColor: "#016FC0" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#004172")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#016FC0")
        }
      >
        Inizia il quiz gratuito
      </button>

      <div className="mt-6 flex flex-row gap-6">
        {["Gratuito", "8 minuti", "Risultato immediato"].map((badge) => (
          <span key={badge} className="text-sm" style={{ color: "#999999" }}>
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
