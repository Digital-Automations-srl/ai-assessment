"use client";

interface InstructionsProps {
  onContinue: () => void;
}

export default function Instructions({ onContinue }: InstructionsProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: "#f8f9fa", borderColor: "#E4E4E4" }}
      >
        <h2
          className="mb-4 text-xl font-bold"
          style={{ color: "#004172" }}
        >
          Prima di iniziare
        </h2>

        <div className="space-y-3 text-[15px] leading-relaxed" style={{ color: "#444" }}>
          <p>
            Questo e&apos; un assessment reale, non un quiz generico. I risultati
            dipendono dalla sincerita&apos; delle risposte.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Rispondi in base a quello che e&apos; effettivamente implementato nella
              tua azienda, non a quello che vorresti o che e&apos; in programma.
            </li>
            <li>
              In caso di dubbio, scegli l&apos;opzione piu&apos; conservativa: il
              risultato sara&apos; piu&apos; utile.
            </li>
            <li>
              Per ogni domanda esiste l&apos;opzione &quot;Non sono sicuro&quot; se
              non conosci la risposta.
            </li>
          </ul>
          <p style={{ color: "#999" }}>
            Tempo stimato: 8-10 minuti.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="mt-6 cursor-pointer rounded-lg px-8 py-3 font-bold text-white transition-colors"
          style={{ backgroundColor: "#016FC0" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#004172")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#016FC0")
          }
        >
          Ho capito, iniziamo
        </button>
      </div>
    </div>
  );
}
