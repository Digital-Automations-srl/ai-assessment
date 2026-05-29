import Link from "next/link";
import { notFound } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import StatusBadge from "@/components/admin/StatusBadge";
import SubmissionDetail from "@/components/admin/SubmissionDetail";
import { formatDateTime } from "@/lib/admin/format";
import { fetchSubmissionById, isConfigError } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";
import type { SubmissionRow } from "@/lib/admin/types";

type Params = Promise<{ id: string }>;

export default async function SubmissionDetailPage({
  params,
}: {
  params: Params;
}) {
  await requireAdmin();
  const { id } = await params;

  let row: SubmissionRow | null = null;
  let error: { config: boolean; message: string } | null = null;
  try {
    row = await fetchSubmissionById(id);
  } catch (e) {
    error = {
      config: isConfigError(e),
      message: e instanceof Error ? e.message : "Errore sconosciuto.",
    };
  }

  if (!error && !row) notFound();

  const title =
    row && row.status === "completed" && row.azienda
      ? row.azienda
      : "Assessment anonimo";

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link
          href="/admin"
          className="text-sm font-medium text-[#016FC0] hover:underline"
        >
          ← Torna alla lista
        </Link>

        {row ? (
          <>
            <div className="mb-5 mt-3 flex flex-wrap items-center gap-3">
              <h1
                className="text-2xl font-extrabold"
                style={{ color: "#004172" }}
              >
                {title}
              </h1>
              <StatusBadge status={row.status} />
              <span className="text-sm text-gray-400">
                {formatDateTime(row.created_at)}
              </span>
            </div>
            <SubmissionDetail row={row} />
          </>
        ) : (
          <div className="mt-4 rounded-xl bg-amber-50 p-6 text-sm ring-1 ring-amber-200">
            <p className="font-semibold text-amber-800">
              {error?.config
                ? "Database non configurato"
                : "Errore nel caricamento"}
            </p>
            <p className="mt-1 text-amber-700">
              {error?.config
                ? "Manca SUPABASE_SECRET_KEY nell'ambiente."
                : error?.message}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
