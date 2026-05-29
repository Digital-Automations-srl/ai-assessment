import Link from "next/link";
import { filtersToQuery } from "@/lib/admin/filters";
import {
  formatDateTime,
  formatScore,
  dash,
} from "@/lib/admin/format";
import type {
  SubmissionFilters,
  SubmissionListItem,
} from "@/lib/admin/types";
import { getLevel } from "@/lib/scoring";
import StatusBadge from "./StatusBadge";

// Intestazione ordinabile: clic → ordina per quella colonna, alternando la
// direzione se gia' attiva. Resetta sempre alla pagina 1.
function SortHeader({
  col,
  label,
  filters,
  className = "",
}: {
  col: string;
  label: string;
  filters: SubmissionFilters;
  className?: string;
}) {
  const active = filters.sort === col;
  const nextDir = active && filters.dir === "asc" ? "desc" : "asc";
  const qs = filtersToQuery(filters, {
    sort: col,
    dir: active ? nextDir : "desc",
    page: 1,
  });
  const arrow = active ? (filters.dir === "asc" ? "▲" : "▼") : "";
  return (
    <th className={`px-3 py-2 text-left font-semibold ${className}`}>
      <Link
        href={qs ? `/admin?${qs}` : "/admin"}
        className="inline-flex items-center gap-1 hover:text-[#016FC0]"
      >
        {label}
        <span className="text-[10px] text-[#016FC0]">{arrow}</span>
      </Link>
    </th>
  );
}

export default function SubmissionsTable({
  rows,
  filters,
}: {
  rows: SubmissionListItem[];
  filters: SubmissionFilters;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-500 ring-1 ring-black/5">
        Nessun assessment trovato con i filtri correnti.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-black/5">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <SortHeader col="created_at" label="Data" filters={filters} />
            <SortHeader col="status" label="Stato" filters={filters} />
            <th className="px-3 py-2 text-left font-semibold">Nome</th>
            <SortHeader col="azienda" label="Azienda" filters={filters} />
            <SortHeader col="settore" label="Settore" filters={filters} />
            <th className="px-3 py-2 text-left font-semibold">Dimensione</th>
            <SortHeader
              col="overall_score"
              label="Punteggio"
              filters={filters}
              className="text-right"
            />
            <th className="px-3 py-2 text-left font-semibold">Livello</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const color =
              r.overall_score != null ? getLevel(r.overall_score).color : "#999";
            return (
              <tr
                key={r.id}
                className="border-b border-gray-100 transition hover:bg-[#f6f8fa]"
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                  {formatDateTime(r.created_at)}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-2.5 text-gray-700">{dash(r.nome)}</td>
                <td className="px-3 py-2.5 font-medium text-[#004172]">
                  <Link href={`/admin/${r.id}`} className="hover:underline">
                    {dash(r.azienda)}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-gray-600">{dash(r.settore)}</td>
                <td className="px-3 py-2.5 text-gray-600">
                  {dash(r.dipendenti)}
                </td>
                <td
                  className="px-3 py-2.5 text-right font-semibold"
                  style={{ color }}
                >
                  {formatScore(r.overall_score)}
                </td>
                <td className="px-3 py-2.5 text-gray-600">
                  {dash(r.overall_label)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Link
                    href={`/admin/${r.id}`}
                    className="text-sm font-medium text-[#016FC0] hover:underline"
                  >
                    Apri →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
