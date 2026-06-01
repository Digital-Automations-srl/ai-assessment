"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COLORS, STATUS_COLORS } from "@/lib/design-tokens";

// Bottone "Elimina record" (destructive) + dialog di conferma obbligatoria sul
// dettaglio /admin/[id]. Nessun delete a un solo click: serve la conferma.
// Al conferma → POST /api/admin/delete e ritorno alla lista. ADMIN-DELETE.
export default function DeleteSubmissionButton({
  id,
  nome,
  email,
}: {
  id: string;
  nome?: string | null;
  email?: string | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = nome?.trim() || null;
  const mail = email?.trim() || null;
  const red = STATUS_COLORS.red.fg;

  // Frase di conferma: mostra nome + email se presenti (record completato),
  // altrimenti il record anonimo. Sempre il monito "irreversibile".
  const target = name ? (
    <>
      il lead di <span className="font-semibold text-gray-800">{name}</span>
      {mail ? <> ({mail})</> : null}
    </>
  ) : mail ? (
    <>
      il lead con email{" "}
      <span className="font-semibold text-gray-800">{mail}</span>
    </>
  ) : (
    <>questo record anonimo</>
  );

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(json?.error ?? `Errore ${res.status}.`);
      }
      // Torna alla lista; refresh per invalidare la cache della pagina.
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Errore durante l'eliminazione."
      );
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: red }}
      >
        Elimina record
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <h2
              id="delete-dialog-title"
              className="text-lg font-extrabold"
              style={{ color: COLORS.navy }}
            >
              Eliminare definitivamente?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Eliminare definitivamente {target}? Azione{" "}
              <span className="font-semibold">irreversibile</span>.
            </p>

            {error && (
              <p
                className="mt-3 rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: STATUS_COLORS.red.bg, color: red }}
              >
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: red }}
              >
                {deleting ? "Elimino…" : "Elimina definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
