import type { NextRequest } from "next/server";
import { clientMetaFromHeaders, recordAudit } from "@/lib/admin/audit";
import { isMockMode } from "@/lib/admin/mock-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST { id } → hard-delete di una singola submission dal dettaglio admin.
// Auth garantita dal proxy su /api/admin/* (route NON esente come il login).
// Tracciata su admin_audit (event="delete", solo `id` — NIENTE PII: niente
// email/nome, coerente con la policy dell'export). ADMIN-DELETE.
export async function POST(req: NextRequest) {
  const { ip, userAgent } = clientMetaFromHeaders(req.headers);

  let id: unknown;
  try {
    const body = await req.json();
    id = (body as { id?: unknown })?.id;
  } catch {
    id = undefined;
  }

  if (typeof id !== "string" || id.trim() === "") {
    return Response.json({ error: "id mancante o non valido." }, { status: 400 });
  }

  // Sandbox (ADMIN_MOCK=1): no-op sicuro. Nessuna scrittura, nessun crash anche
  // senza DB. recordAudit e' gia' no-op in mock, ma qui usciamo prima ancora.
  if (isMockMode()) {
    return Response.json({ ok: true, mock: true });
  }

  // DB non configurato (manca SUPABASE_SECRET_KEY) → 503, come la route export.
  if (!supabaseAdmin) {
    return Response.json({ error: "Database non configurato." }, { status: 503 });
  }

  try {
    const { error } = await supabaseAdmin
      .from("submissions")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);

    await recordAudit({
      event: "delete",
      outcome: "ok",
      path: "/api/admin/delete",
      method: "POST",
      ip,
      userAgent,
      detail: { id }, // solo id — NIENTE PII (no email/nome)
    });

    return Response.json({ ok: true });
  } catch (e) {
    await recordAudit({
      event: "delete",
      outcome: "error",
      path: "/api/admin/delete",
      method: "POST",
      ip,
      userAgent,
      detail: { id },
    });
    const message = e instanceof Error ? e.message : "Errore eliminazione.";
    return Response.json({ error: message }, { status: 500 });
  }
}
