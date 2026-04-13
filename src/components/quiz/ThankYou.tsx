"use client";

interface ThankYouProps {
  name: string;
  email: string;
}

export default function ThankYou({ name, email }: ThankYouProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      {/* Green check icon */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="40" cy="40" r="40" fill="#16a34a" />
        <path
          d="M24 41L35 52L56 31"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h1
        className="mt-8 text-3xl font-extrabold"
        style={{ color: "#004172" }}
      >
        Grazie, {name}!
      </h1>

      <p className="mt-4 text-base" style={{ color: "#666" }}>
        Il tuo report è stato inviato a{" "}
        <strong style={{ color: "#333" }}>{email}</strong>.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <a
          href="https://calendly.com/digital-automations"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block cursor-pointer rounded-lg px-8 py-3 font-bold text-white transition-colors"
          style={{ backgroundColor: "#016FC0" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#004172")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#016FC0")
          }
        >
          Prenota una call con un consulente DA
        </a>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer text-sm font-medium underline"
          style={{ color: "#016FC0" }}
        >
          Torna al tuo profilo
        </button>
      </div>
    </div>
  );
}
