import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import FilterBar from "@/components/admin/FilterBar";
import Pagination from "@/components/admin/Pagination";
import SubmissionsTable from "@/components/admin/SubmissionsTable";
import { filtersToQuery, parseFilters } from "@/lib/admin/filters";
import { fetchCounts, fetchSubmissions, isConfigError } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";
import type { SubmissionFilters, SubmissionListItem } from "@/lib/admin/types";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-black/5">
      <div className="text-2xl font-extrabold" style={{ color: "#004172" }}>
        {value}
      </div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
    </div>
  );
}

interface PageData {
  rows: SubmissionListItem[];
  total: number;
  counts: { total: number; completed: number; anonymous: number };
}

function TableView({
  data,
  filters,
}: {
  data: PageData;
  filters: SubmissionFilters;
}) {
  const { rows, total, counts } = data;
  const exportQs = filtersToQuery(filters);
  const exportHref = exportQs ? `/api/admin/export?${exportQs}` : "/api/admin/export";

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Totale" value={counts.total} />
        <Kpi label="Completati" value={counts.completed} />
        <Kpi label="Anonimi" value={counts.anonymous} />
        <Kpi
          label="% completati"
          value={
            counts.total
              ? `${Math.round((counts.completed / counts.total) * 100)}%`
              : "—"
          }
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {total} risultati con i filtri correnti
        </p>
        <Link
          href={exportHref}
          prefetch={false}
          className="shrink-0 rounded-lg border border-[#016FC0] px-4 py-1.5 text-sm font-semibold text-[#016FC0] hover:bg-[#016FC0]/5"
        >
          ↓ Export CSV
        </Link>
      </div>

      <div className="mt-3">
        <FilterBar filters={filters} />
      </div>

      <div className="mt-4">
        <SubmissionsTable rows={rows} filters={filters} />
      </div>

      <div className="mt-4">
        <Pagination filters={filters} total={total} />
      </div>
    </>
  );
}

function ErrorBanner({ config, message }: { config: boolean; message: string }) {
  return (
    <div className="rounded-xl bg-amber-50 p-6 text-sm ring-1 ring-amber-200">
      <p className="font-semibold text-amber-800">
        {config ? "Database non configurato" : "Errore nel caricamento dei dati"}
      </p>
      <p className="mt-1 text-amber-700">
        {config
          ? "Manca SUPABASE_SECRET_KEY (o NEXT_PUBLIC_SUPABASE_URL) nell'ambiente. Verifica .env.local in locale o le env su Vercel."
          : message}
      </p>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const filters = parseFilters(await searchParams);

  let data: PageData | null = null;
  let error: { config: boolean; message: string } | null = null;
  try {
    const [list, counts] = await Promise.all([
      fetchSubmissions(filters),
      fetchCounts(),
    ]);
    data = { rows: list.rows, total: list.total, counts };
  } catch (e) {
    error = {
      config: isConfigError(e),
      message: e instanceof Error ? e.message : "Errore sconosciuto.",
    };
  }

  return (
    <>
      <AdminNav />
      <main className="w-full px-4 py-6 lg:px-6">
        <h1 className="mb-4 text-xl font-extrabold" style={{ color: "#004172" }}>
          Assessment ricevuti
        </h1>
        {data ? (
          <TableView data={data} filters={filters} />
        ) : (
          <ErrorBanner
            config={error?.config ?? false}
            message={error?.message ?? "Errore sconosciuto."}
          />
        )}
      </main>
    </>
  );
}
