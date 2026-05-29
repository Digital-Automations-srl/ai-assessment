import AdminNav from "@/components/admin/AdminNav";
import { AvgBars, DistributionBars, TrendChart } from "@/components/admin/Charts";
import { fetchStats, isConfigError } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";
import type { AdminStats } from "@/lib/admin/types";

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-black/5">
      <div className="text-2xl font-extrabold" style={{ color: "#004172" }}>
        {value}
      </div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-gray-400">{sub}</div>}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
      <h2 className="mb-4 text-base font-extrabold" style={{ color: "#004172" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatsView({ stats }: { stats: AdminStats & { capped: boolean } }) {
  const completionPct = Math.round(stats.completionRate * 100);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Totale assessment" value={stats.total} />
        <Kpi
          label="Completati"
          value={stats.completed}
          sub={`${completionPct}% del totale`}
        />
        <Kpi label="Anonimi" value={stats.anonymous} />
        <Kpi
          label="Media complessiva"
          value={stats.avgOverall != null ? stats.avgOverall.toFixed(1) : "—"}
          sub={`su ${stats.scoredCount} con punteggio`}
        />
        <Kpi label="% completati" value={`${completionPct}%`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Distribuzione per livello">
          <DistributionBars items={stats.byLabel} />
        </Card>
        <Card title="Media per dimensione aziendale">
          <AvgBars items={stats.byDipendenti} />
        </Card>
        <Card title="Media per settore">
          <AvgBars items={stats.bySettore} />
        </Card>
        <Card title="Andamento per mese">
          <TrendChart points={stats.byMonth} />
          <p className="mt-3 text-xs text-gray-400">
            <span style={{ color: "#9ec8e8" }}>■</span> totale ·{" "}
            <span style={{ color: "#004172" }}>■</span> completati
          </p>
        </Card>
      </div>

      {stats.capped && (
        <p className="mt-4 text-xs text-amber-600">
          Statistiche calcolate su un campione (oltre il limite di righe
          aggregabili). I conteggi totali restano esatti.
        </p>
      )}
    </>
  );
}

export default async function AdminStatsPage() {
  await requireAdmin();

  let stats: (AdminStats & { capped: boolean }) | null = null;
  let error: { config: boolean; message: string } | null = null;
  try {
    stats = await fetchStats();
  } catch (e) {
    error = {
      config: isConfigError(e),
      message: e instanceof Error ? e.message : "Errore sconosciuto.",
    };
  }

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-xl font-extrabold" style={{ color: "#004172" }}>
          Statistiche
        </h1>
        {stats ? (
          <StatsView stats={stats} />
        ) : (
          <div className="rounded-xl bg-amber-50 p-6 text-sm ring-1 ring-amber-200">
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
