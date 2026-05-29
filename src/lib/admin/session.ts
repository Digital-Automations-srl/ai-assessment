import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySession } from "./auth";

// Difesa in profondita': anche se il middleware protegge gia' /admin/*, ogni
// pagina server admin richiama requireAdmin() prima di leggere il DB. Cosi' un
// errore di matcher non espone mai i dati. L'import di `next/headers` rende
// questo modulo utilizzabile solo lato server (non finisce nel bundle client).
export async function requireAdmin(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const ok = await verifySession(token, Date.now());
  if (!ok) redirect("/admin/login");
}
