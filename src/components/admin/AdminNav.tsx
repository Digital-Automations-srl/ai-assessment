"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "Assessment" },
  { href: "/admin/stats", label: "Statistiche" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <header
      className="sticky top-0 z-10 border-b border-black/5"
      style={{ backgroundColor: "#004172" }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <span className="text-sm font-extrabold text-white">
          AI Readiness · Admin
        </span>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition"
                style={{
                  color: "white",
                  backgroundColor: active
                    ? "rgba(255,255,255,0.18)"
                    : "transparent",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="ml-auto rounded-md px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50"
        >
          {loggingOut ? "Esco…" : "Esci"}
        </button>
      </div>
    </header>
  );
}
