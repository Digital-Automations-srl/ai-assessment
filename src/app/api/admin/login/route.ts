import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  SESSION_TTL_MS,
  signSession,
  verifyPassword,
} from "@/lib/admin/auth";
import { clientMetaFromHeaders, recordAudit } from "@/lib/admin/audit";

// POST { password } → setta il cookie di sessione httpOnly firmato.
export async function POST(req: Request) {
  const { ip, userAgent } = clientMetaFromHeaders(req.headers);

  let password: unknown;
  try {
    const body = await req.json();
    password = (body as { password?: unknown })?.password;
  } catch {
    password = undefined;
  }

  if (!verifyPassword(password)) {
    // Messaggio volutamente generico; nessun log della password.
    await recordAudit({
      event: "login_failed",
      outcome: "denied",
      path: "/api/admin/login",
      method: "POST",
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "Password non valida." }, { status: 401 });
  }

  let token: string;
  try {
    token = await signSession(Date.now());
  } catch {
    return NextResponse.json(
      { error: "Configurazione server incompleta." },
      { status: 500 }
    );
  }

  await recordAudit({
    event: "login_success",
    outcome: "ok",
    path: "/api/admin/login",
    method: "POST",
    ip,
    userAgent,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
