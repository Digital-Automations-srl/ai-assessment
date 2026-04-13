import { describe, it, expect } from "vitest";

const API_URL = "/api/send-report";

// Helper to build a valid request body
function validBody() {
  return {
    lead: {
      nome: "Mario",
      cognome: "Rossi",
      email: "mario@test.it",
      azienda: "Test Srl",
      telefono: "+39 333 1234567",
      consenso: true,
    },
    results: {
      contextAnswers: { X1: "IT e tecnologia", X2: "10-50", X3: "Titolare / CEO" },
      axisResults: [
        { key: "conformita", label: "Conformita'", formal: "Compliance", score: 3.0, levelLabel: "In costruzione", levelColor: "#ca8a04" },
        { key: "processi", label: "Processi e Controlli", formal: "Governance", score: 2.5, levelLabel: "In avvio", levelColor: "#E09900" },
        { key: "utilizzo", label: "Utilizzo Reale", formal: "Adoption", score: 2.0, levelLabel: "In avvio", levelColor: "#E09900" },
        { key: "autonomia", label: "Autonomia Team", formal: "AI Skills", score: 3.5, levelLabel: "Operativo", levelColor: "#16a34a" },
        { key: "protezione", label: "Protezione Dati", formal: "Data Security", score: 4.0, levelLabel: "Operativo", levelColor: "#16a34a" },
        { key: "tecnologia", label: "Tecnologia", formal: "Technology", score: 1.5, levelLabel: "In avvio", levelColor: "#E09900" },
      ],
      overallScore: 2.8,
      overallLabel: "In costruzione",
      compliance: [
        { name: "Registro Strumenti AI", reference: "AI Act Art. 6, GDPR Art. 6", score: 3.0, color: "yellow", message: "msg", action: "act" },
        { name: "Registro Casi d'Uso", reference: "AI Act Art. 5-6", score: 2.0, color: "yellow", message: "msg", action: "act" },
        { name: "AI Policy interna", reference: "AI Act Art. 17", score: 2.5, color: "yellow", message: "msg", action: "act" },
        { name: "Informative trasparenza", reference: "L. 132/2025", score: 3.0, color: "yellow", message: "msg", action: "act" },
        { name: "Formazione", reference: "AI Act Art. 4", score: 3.0, color: "yellow", message: "msg", action: "act" },
        { name: "DPIA", reference: "GDPR Art. 35", score: 3.0, color: "yellow", message: "msg", action: "act" },
        { name: "Monitoraggio", reference: "Best practice", score: 2.0, color: "yellow", message: "msg", action: "act" },
      ],
    },
  };
}

// ─── T21: API validation – missing lead ─────────────────────────────────
describe("T21 – API validation: missing lead returns 400", () => {
  it("body without lead field fails validation", async () => {
    const body = validBody();
    const bodyWithoutLead = { results: body.results };

    const { POST } = await import("@/app/api/send-report/route");
    const req = new Request("http://localhost:3000" + API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyWithoutLead),
    });

    // Need to convert Request to NextRequest-like object
    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(req);
    const res = await POST(nextReq);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
  });
});

// ─── T22: API validation – missing results ──────────────────────────────
describe("T22 – API validation: missing results returns 400", () => {
  it("body without results field fails validation", async () => {
    const body = validBody();
    const bodyWithoutResults = { lead: body.lead };

    const { POST } = await import("@/app/api/send-report/route");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(
      new Request("http://localhost:3000" + API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyWithoutResults),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ─── T23: API validation – empty lead fields ───────────────────────────
describe("T23 – API validation: empty required lead fields return 400", () => {
  const requiredFields = ["nome", "cognome", "email", "azienda"];

  for (const field of requiredFields) {
    it(`empty ${field} → 400`, async () => {
      const body = validBody();
      (body.lead as Record<string, unknown>)[field] = "";

      const { POST } = await import("@/app/api/send-report/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest(
        new Request("http://localhost:3000" + API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  }
});

// ─── T24: API validation – invalid email format ────────────────────────
describe("T24 – API validation: invalid email format returns 400", () => {
  const invalidEmails = ["notanemail", "missing@", "@nodomain", "spaces in@email.com"];

  for (const email of invalidEmails) {
    it(`"${email}" → 400`, async () => {
      const body = validBody();
      body.lead.email = email;

      const { POST } = await import("@/app/api/send-report/route");
      const { NextRequest } = await import("next/server");
      const req = new NextRequest(
        new Request("http://localhost:3000" + API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  }
});

// ─── T25: API validation – incomplete results ──────────────────────────
describe("T25 – API validation: incomplete results returns 400", () => {
  it("results without overallScore → 400", async () => {
    const body = validBody();
    delete (body.results as Record<string, unknown>).overallScore;

    const { POST } = await import("@/app/api/send-report/route");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(
      new Request("http://localhost:3000" + API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("results without axisResults array → 400", async () => {
    const body = validBody();
    (body.results as Record<string, unknown>).axisResults = "not-array";

    const { POST } = await import("@/app/api/send-report/route");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest(
      new Request("http://localhost:3000" + API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ─── T26: Email template builds without errors ─────────────────────────
describe("T26 – Email templates build correctly", () => {
  it("buildLeadEmail returns subject and html", async () => {
    const { buildLeadEmail } = await import("@/lib/email");
    const body = validBody();
    const result = buildLeadEmail(body.lead, body.results as never);
    expect(result.subject).toBeTruthy();
    expect(result.html).toContain("Mario");
    expect(result.html).toContain("2.8");
  });

  it("buildInternalEmail returns subject and html with lead data", async () => {
    const { buildInternalEmail } = await import("@/lib/email");
    const body = validBody();
    const result = buildInternalEmail(body.lead, body.results as never);
    expect(result.subject).toBeTruthy();
    expect(result.html).toContain("Mario");
    expect(result.html).toContain("Rossi");
    expect(result.html).toContain("Test Srl");
  });
});
