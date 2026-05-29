import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySession } from "./auth";
import { clientMetaFromHeaders, recordAudit } from "./audit";

// Difesa in profondita': anche se il middleware protegge gia' /admin/*, ogni
// pagina server admin richiama requireAdmin() prima di leggere il DB. Cosi' un
// errore di matcher non espone mai i dati. L'import di `next/headers` rende
// questo modulo utilizzabile solo lato server (non finisce nel bundle client).
//
// SEC-3: dopo una verifica riuscita registra un evento di audit 'access'. Il
// `path` e' passato esplicitamente dalle pagine (non c'e' un modo affidabile di
// leggerlo qui). Best-effort: l'await su un solo insert e' trascurabile per una
// dashboard a basso traffico e non blocca mai (recordAudit non lancia).
export async function requireAdmin(path?: string): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const ok = await verifySession(token, Date.now());
  if (!ok) redirect("/admin/login");

  const { ip, userAgent } = clientMetaFromHeaders(await headers());
  await recordAudit({
    event: "access",
    outcome: "ok",
    path: path ?? null,
    method: "GET",
    ip,
    userAgent,
  });
}
