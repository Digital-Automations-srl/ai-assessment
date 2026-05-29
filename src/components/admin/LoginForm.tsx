"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Accesso negato.");
        setLoading(false);
        return;
      }
      // Destinazione: ?next=… se presente e interna, altrimenti /admin.
      const next = new URLSearchParams(window.location.search).get("next");
      const target = next && next.startsWith("/admin") ? next : "/admin";
      router.replace(target);
      router.refresh();
    } catch {
      setError("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{ color: "#004172" }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#016FC0] focus:ring-2 focus:ring-[#016FC0]/30"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
        style={{ backgroundColor: "#016FC0" }}
      >
        {loading ? "Accesso…" : "Accedi"}
      </button>
    </form>
  );
}
