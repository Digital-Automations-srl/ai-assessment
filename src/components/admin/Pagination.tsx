import Link from "next/link";
import { filtersToQuery } from "@/lib/admin/filters";
import type { SubmissionFilters } from "@/lib/admin/types";

export default function Pagination({
  filters,
  total,
}: {
  filters: SubmissionFilters;
  total: number;
}) {
  const { pageSize } = filters;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(filters.page, 1), totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const href = (p: number) => {
    const qs = filtersToQuery(filters, { page: p });
    return qs ? `/admin?${qs}` : "/admin";
  };

  const btn =
    "rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium";

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
      <span>
        {from}–{to} di <strong>{total}</strong>
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={`${btn} hover:bg-gray-50`}>
            ← Prec
          </Link>
        ) : (
          <span className={`${btn} cursor-not-allowed opacity-40`}>← Prec</span>
        )}
        <span className="px-1">
          Pagina {page} di {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={href(page + 1)} className={`${btn} hover:bg-gray-50`}>
            Succ →
          </Link>
        ) : (
          <span className={`${btn} cursor-not-allowed opacity-40`}>Succ →</span>
        )}
      </div>
    </div>
  );
}
