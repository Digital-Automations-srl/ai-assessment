import type { NextRequest } from "next/server";
import { parseFilters, toCsv } from "@/lib/admin/filters";
import {
  EXPORT_COLUMNS,
  fetchExportRows,
  isConfigError,
} from "@/lib/admin/queries";

// GET /api/admin/export?<filtri> → CSV del set filtrato.
// Auth garantita dal proxy su /api/admin/* (route non esente come il login).
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const filters = parseFilters(params);

  try {
    const { rows, capped, total } = await fetchExportRows(filters);
    const headers = [...EXPORT_COLUMNS];
    const dataRows = rows.map((r) => headers.map((h) => r[h]));
    const csv = toCsv(headers, dataRows);

    // YYYY-MM-DD per il nome file (UTC, sufficiente per un export).
    const day = new Date().toISOString().slice(0, 10);

    if (capped) {
      // Niente troncamenti silenziosi: lo segnaliamo (header + log senza PII).
      console.warn(
        `[admin/export] Export troncato a ${rows.length}/${total} righe (cap MAX_EXPORT_ROWS).`
      );
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="assessment-export-${day}.csv"`,
        "Cache-Control": "no-store",
        ...(capped ? { "X-Export-Capped": `${rows.length}/${total}` } : {}),
      },
    });
  } catch (e) {
    const status = isConfigError(e) ? 503 : 500;
    const message = isConfigError(e)
      ? "Database non configurato."
      : e instanceof Error
        ? e.message
        : "Errore export.";
    return Response.json({ error: message }, { status });
  }
}
