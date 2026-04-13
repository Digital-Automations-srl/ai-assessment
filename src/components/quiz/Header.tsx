"use client";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-100 border-b bg-white"
      style={{ borderColor: "#E4E4E4", padding: "12px 24px" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="font-bold"
          style={{ color: "#004172", fontSize: "14px" }}
        >
          Digital Automations
        </span>
        <span style={{ color: "#E4E4E4" }}>|</span>
        <span style={{ color: "#016FC0", fontSize: "12px" }}>
          AI Readiness Assessment
        </span>
      </div>
    </header>
  );
}
