import { describe, it, expect, vi, afterEach } from "vitest";

// Route POST /api/admin/delete (ADMIN-DELETE). Nel test runner Supabase NON e'
// raggiungibile (nessuna env DB → supabaseAdmin = null), quindi senza mock la
// route risponde 503 (config), come la route export. Con ADMIN_MOCK=1 e' un
// no-op sicuro che ritorna ok. L'auth e' garantita a monte dal proxy (qui non
// testata: il route handler assume la richiesta gia' autenticata).

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function callDelete(body: unknown) {
  const { POST } = await import("@/app/api/admin/delete/route");
  const { NextRequest } = await import("next/server");
  const req = new NextRequest(
    new Request("http://localhost/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  return POST(req);
}

const SAMPLE_ID = "00000000-0000-0000-0000-000000000000";

describe("admin/delete (route)", () => {
  it("400 se manca l'id", async () => {
    const res = await callDelete({});
    expect(res.status).toBe(400);
  });

  it("400 se l'id e' vuoto/non valido", async () => {
    const res = await callDelete({ id: "   " });
    expect(res.status).toBe(400);
  });

  it("ADMIN_MOCK=1 → no-op ok (nessuna scrittura, nessun crash)", async () => {
    vi.stubEnv("ADMIN_MOCK", "1");
    const res = await callDelete({ id: SAMPLE_ID });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
  });

  it("DB non configurato → 503 (come la route export)", async () => {
    const res = await callDelete({ id: SAMPLE_ID });
    expect(res.status).toBe(503);
  });
});
