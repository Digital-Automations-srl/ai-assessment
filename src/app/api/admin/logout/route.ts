import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";
import { clientMetaFromHeaders, recordAudit } from "@/lib/admin/audit";

// POST → invalida il cookie di sessione.
export async function POST(req: Request) {
  const { ip, userAgent } = clientMetaFromHeaders(req.headers);
  await recordAudit({
    event: "logout",
    outcome: "ok",
    path: "/api/admin/logout",
    method: "POST",
    ip,
    userAgent,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
