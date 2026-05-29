import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/auth";

// Next 16: convenzione "proxy" (ex middleware, ora deprecato). Runtime nodejs.
// Protegge /admin/* e /api/admin/* con il cookie di sessione firmato.
// Eccezioni (accessibili senza auth): la pagina e l'API di login.
// Il quiz pubblico (tutto il resto) NON e' toccato dal matcher.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const valid = await verifySession(token, Date.now());

  if (isLoginPage || isLoginApi) {
    // Gia' autenticato sulla pagina di login → manda alla dashboard.
    if (valid && isLoginPage) {
      return noStore(NextResponse.redirect(new URL("/admin", req.url)));
    }
    return noStore(NextResponse.next());
  }

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return noStore(
        NextResponse.json({ error: "Non autorizzato." }, { status: 401 })
      );
    }
    const url = new URL("/admin/login", req.url);
    if (pathname && pathname !== "/admin") url.searchParams.set("next", pathname);
    return noStore(NextResponse.redirect(url));
  }

  return noStore(NextResponse.next());
}
