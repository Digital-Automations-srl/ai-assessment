import { describe, it, expect, vi, beforeEach } from "vitest";

// Integration test dei route handler track-result/send-report nel caso in cui
// l'ambiente NON raggiunge Supabase (supabaseAdmin = null: nessuna env DB nel
// test runner). Verifica il comportamento robusto di OBS-1: il report al lead
// parte comunque, niente crash. nodemailer/sharp sono mockati (no SMTP reale).

const sendMail = vi.fn(async () => ({ messageId: "test" }));

vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail }) },
}));

vi.mock("sharp", () => ({
  default: () => ({
    resize: () => ({
      png: () => ({ toBuffer: async () => Buffer.from([0x89, 0x50, 0x4e, 0x47]) }),
    }),
  }),
}));

function results() {
  return {
    contextAnswers: { X1: "IT e tecnologia", X2: "10-50", X3: "Titolare / CEO" },
    axisResults: [
      { key: "conformita", label: "Conformita'", formal: "Compliance", score: 3.0, levelLabel: "In costruzione", levelColor: "#ca8a04" },
      { key: "processi", label: "Processi", formal: "Governance", score: 2.5, levelLabel: "In avvio", levelColor: "#E09900" },
      { key: "utilizzo", label: "Utilizzo", formal: "Adoption", score: 2.0, levelLabel: "In avvio", levelColor: "#E09900" },
      { key: "autonomia", label: "Autonomia", formal: "AI Skills", score: 3.5, levelLabel: "Operativo", levelColor: "#16a34a" },
      { key: "protezione", label: "Protezione", formal: "Data Security", score: 4.0, levelLabel: "Operativo", levelColor: "#16a34a" },
      { key: "tecnologia", label: "Tecnologia", formal: "Technology", score: 1.5, levelLabel: "In avvio", levelColor: "#E09900" },
    ],
    overallScore: 2.8,
    overallLabel: "In costruzione",
    compliance: [
      { name: "Registro Strumenti AI", reference: "AI Act", score: 3.0, color: "yellow", message: "m", action: "a" },
    ],
  };
}

beforeEach(() => {
  sendMail.mockClear();
});

describe("send-report (integrazione, DB irraggiungibile)", () => {
  it("invia il report e ritorna success anche se supabaseAdmin e' null", async () => {
    const { POST } = await import("@/app/api/send-report/route");
    const { NextRequest } = await import("next/server");

    const body = {
      lead: {
        nome: "Mara",
        cognome: "Verdi",
        email: "mara@acme.it",
        azienda: "Acme Srl",
        telefono: "",
        referral: "",
        consenso: true,
        consensoMarketing: true,
      },
      submissionToken: "tok-1",
      utm: { utm_source: "google", utm_medium: "cpc" },
      behavior: {
        totalTimeMs: 120_000,
        answeredCount: 30,
        skippedCount: 0,
        nonSoCount: 0,
        backClicks: 1,
      },
      results: results(),
    };

    const req = new NextRequest(
      new Request("http://localhost/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    // Due email: report al lead + notifica interna.
    expect(sendMail).toHaveBeenCalledTimes(2);
    const recipients = sendMail.mock.calls.map((c) => (c[0] as { to: string }).to);
    expect(recipients).toContain("mara@acme.it");
  });
});

describe("track-result (integrazione)", () => {
  it("400 se manca il submissionToken", async () => {
    const { POST } = await import("@/app/api/track-result/route");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(
      new Request("http://localhost/api/track-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: results() }),
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("400 se i results sono incompleti", async () => {
    const { POST } = await import("@/app/api/track-result/route");
    const { NextRequest } = await import("next/server");
    const incomplete = results() as Record<string, unknown>;
    delete incomplete.overallScore;
    const req = new NextRequest(
      new Request("http://localhost/api/track-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionToken: "t", results: incomplete }),
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("DB non configurato → ok:false, skipped (200, best-effort)", async () => {
    const { POST } = await import("@/app/api/track-result/route");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(
      new Request("http://localhost/api/track-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionToken: "tok-xyz",
          utm: { utm_source: "linkedin" },
          behavior: { totalTimeMs: 90_000, answeredCount: 30, skippedCount: 0, nonSoCount: 0, backClicks: 0 },
          results: results(),
        }),
      })
    );
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(false);
    expect(json.skipped).toBe(true);
  });
});
