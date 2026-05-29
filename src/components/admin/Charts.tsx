import { getLevel } from "@/lib/scoring";
import { AXIS_SHORT_LABEL } from "@/lib/admin/lead-scoring";
import type {
  AxisSectorRow,
  ComplianceAreaStat,
  FunnelStep,
  GroupAvg,
  LabelCount,
  MonthPoint,
} from "@/lib/admin/types";
import type { AxisKey } from "@/lib/types";

// Colori semaforo compliance (coincidono col ComplianceChecklist del quiz).
const RYG = { rosso: "#dc2626", giallo: "#E09900", verde: "#16a34a" };

// Ordine canonico dei 5 livelli per lo stacked mensile.
const LEVEL_SEQUENCE = [
  "Iniziale",
  "In avvio",
  "In costruzione",
  "Operativo",
  "Maturo",
];

// Colore per livello/label (allineato a scoring.ts LEVEL_THRESHOLDS).
// Esportato per evitare duplicazione nei nuovi grafici (stacked mensile, ecc.).
export const LABEL_COLOR: Record<string, string> = {
  Iniziale: "#dc2626",
  "In avvio": "#E09900",
  "In costruzione": "#ca8a04",
  Operativo: "#16a34a",
  Maturo: "#047857",
};

function EmptyNote() {
  return <p className="py-6 text-center text-sm text-gray-400">Nessun dato.</p>;
}

// Distribuzione per conteggio: barre orizzontali proporzionali al massimo.
export function DistributionBars({ items }: { items: LabelCount[] }) {
  if (!items.length) return <EmptyNote />;
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-2.5">
      {items.map((it) => {
        const color = LABEL_COLOR[it.label] ?? "#016FC0";
        const pct = Math.round((it.count / total) * 100);
        return (
          <li key={it.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-gray-600">
              {it.label}
            </span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${(it.count / max) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </span>
            <span className="w-20 shrink-0 text-right text-sm text-gray-700">
              <strong>{it.count}</strong>{" "}
              <span className="text-gray-400">({pct}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Media (scala 0–5) per gruppo, colorata per livello, con numerosita'.
export function AvgBars({ items }: { items: GroupAvg[] }) {
  if (!items.length) return <EmptyNote />;
  return (
    <ul className="space-y-2.5">
      {items.map((it) => {
        const color = getLevel(it.avg).color;
        return (
          <li key={it.group} className="flex items-center gap-3">
            <span className="w-44 shrink-0 truncate text-sm text-gray-600">
              {it.group}
            </span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <span
                className="block h-full rounded-full"
                style={{ width: `${(it.avg / 5) * 100}%`, backgroundColor: color }}
              />
            </span>
            <span
              className="w-10 shrink-0 text-right text-sm font-semibold"
              style={{ color }}
            >
              {it.avg.toFixed(1)}
            </span>
            <span className="w-14 shrink-0 text-right text-xs text-gray-400">
              n={it.count}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Trend mensile: colonne con totale (chiaro) e quota completati (navy) sovrapposta.
export function TrendChart({ points }: { points: MonthPoint[] }) {
  if (!points.length) return <EmptyNote />;
  const max = Math.max(1, ...points.map((p) => p.total));
  return (
    <div className="flex items-end gap-3 overflow-x-auto pb-2">
      {points.map((p) => (
        <div key={p.month} className="flex w-12 shrink-0 flex-col items-center gap-1">
          <span className="text-xs font-semibold text-gray-600">{p.total}</span>
          <div className="relative h-32 w-7 overflow-hidden rounded-md bg-gray-100">
            <div
              className="absolute bottom-0 w-full rounded-md"
              style={{
                height: `${(p.total / max) * 100}%`,
                backgroundColor: "#9ec8e8",
              }}
              title={`Totale: ${p.total}`}
            />
            <div
              className="absolute bottom-0 w-full rounded-md"
              style={{
                height: `${(p.completed / max) * 100}%`,
                backgroundColor: "#004172",
              }}
              title={`Completati: ${p.completed}`}
            />
          </div>
          <span className="text-[10px] text-gray-400">{p.month.slice(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ── US-3: Heatmap conformità di mercato (7 barre stacked R/Y/G) ──
export function ComplianceHeatmap({ areas }: { areas: ComplianceAreaStat[] }) {
  if (!areas.length) return <EmptyNote />;
  const top = areas[0];
  return (
    <div>
      <ul className="space-y-3">
        {areas.map((a) => (
          <li key={a.area}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-gray-700">{a.area}</span>
              <span className="shrink-0 text-xs text-gray-400">
                {a.rosso}/{a.giallo}/{a.verde} · {a.total}
              </span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
              {a.pctRosso > 0 && (
                <span
                  className="h-full"
                  style={{ width: `${a.pctRosso}%`, backgroundColor: RYG.rosso }}
                  title={`Rosso ${a.pctRosso}%`}
                />
              )}
              {a.pctGiallo > 0 && (
                <span
                  className="h-full"
                  style={{ width: `${a.pctGiallo}%`, backgroundColor: RYG.giallo }}
                  title={`Giallo ${a.pctGiallo}%`}
                />
              )}
              {a.pctVerde > 0 && (
                <span
                  className="h-full"
                  style={{ width: `${a.pctVerde}%`, backgroundColor: RYG.verde }}
                  title={`Verde ${a.pctVerde}%`}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        Area più critica: <strong>{top.area}</strong> ({top.pctRosso}% rosso)
      </p>
      <p className="mt-2 text-xs text-gray-400">
        <span style={{ color: RYG.rosso }}>■</span> non conforme ·{" "}
        <span style={{ color: RYG.giallo }}>■</span> parziale ·{" "}
        <span style={{ color: RYG.verde }}>■</span> conforme
      </p>
    </div>
  );
}

// ── US-4: Heatmap assi × settore (matrice colorata per livello) ──
export function AxisSectorHeatmap({ rows }: { rows: AxisSectorRow[] }) {
  if (!rows.length) return <EmptyNote />;
  const axes = Object.keys(AXIS_SHORT_LABEL) as AxisKey[];
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left font-semibold text-gray-500">
              Settore
            </th>
            {axes.map((k) => (
              <th
                key={k}
                className="px-2 py-1 text-center font-semibold text-gray-500"
              >
                {AXIS_SHORT_LABEL[k]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.settore}>
              <td className="max-w-[10rem] truncate px-2 py-1 text-left text-gray-700">
                {row.settore}{" "}
                <span className="text-gray-400">({row.count})</span>
              </td>
              {axes.map((k) => {
                const cell = row.cells[k];
                const low = cell.count < 3;
                const bg = cell.count ? getLevel(cell.avg).color : "#e5e7eb";
                return (
                  <td
                    key={k}
                    className="px-2 py-1 text-center font-semibold text-white"
                    style={{
                      backgroundColor: bg,
                      borderRadius: 6,
                      opacity: low ? 0.45 : 1,
                    }}
                    title={
                      low
                        ? `n=${cell.count} (campione piccolo)`
                        : `n=${cell.count}`
                    }
                  >
                    {cell.count ? cell.avg.toFixed(1) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-gray-400">
        Celle attenuate = campione piccolo (n&lt;3). Colore = livello di maturità.
      </p>
    </div>
  );
}

// ── US-6: Distribuzione maturità per mese (colonne stacked sui 5 livelli) ──
export function StackedMonthChart({ points }: { points: MonthPoint[] }) {
  if (!points.length) return <EmptyNote />;
  const max = Math.max(
    1,
    ...points.map((p) =>
      LEVEL_SEQUENCE.reduce((s, l) => s + (p.byLevel[l] ?? 0), 0)
    )
  );
  return (
    <div>
      <div className="flex items-end gap-3 overflow-x-auto pb-2">
        {points.map((p) => {
          const tot = LEVEL_SEQUENCE.reduce(
            (s, l) => s + (p.byLevel[l] ?? 0),
            0
          );
          return (
            <div
              key={p.month}
              className="flex w-12 shrink-0 flex-col items-center gap-1"
            >
              <span className="text-xs font-semibold text-gray-600">{tot}</span>
              <div className="flex h-32 w-7 flex-col-reverse overflow-hidden rounded-md bg-gray-100">
                {LEVEL_SEQUENCE.map((l) => {
                  const c = p.byLevel[l] ?? 0;
                  if (!c) return null;
                  return (
                    <div
                      key={l}
                      style={{
                        height: `${(c / max) * 100}%`,
                        backgroundColor: LABEL_COLOR[l] ?? "#016FC0",
                      }}
                      title={`${l}: ${c}`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-400">
                {p.month.slice(2)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
        {LEVEL_SEQUENCE.map((l) => (
          <span key={l}>
            <span style={{ color: LABEL_COLOR[l] }}>■</span> {l}
          </span>
        ))}
      </p>
    </div>
  );
}

// ── US-6: Funnel anonimo → completato → consenso → marketing ──
export function Funnel({ steps }: { steps: FunnelStep[] }) {
  if (!steps.length || steps[0].count === 0) return <EmptyNote />;
  const top = steps[0].count || 1;
  return (
    <ul className="space-y-2.5">
      {steps.map((s, i) => {
        const prev = i === 0 ? s.count : steps[i - 1].count;
        const retention = prev ? Math.round((s.count / prev) * 100) : 0;
        return (
          <li key={s.label} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-sm text-gray-600">
              {s.label}
            </span>
            <span className="h-6 flex-1 overflow-hidden rounded-md bg-gray-100">
              <span
                className="flex h-full items-center justify-end rounded-md px-2 text-xs font-semibold text-white"
                style={{
                  width: `${Math.max(6, (s.count / top) * 100)}%`,
                  backgroundColor: "#016FC0",
                }}
              >
                {s.count}
              </span>
            </span>
            <span className="w-12 shrink-0 text-right text-xs text-gray-400">
              {i === 0 ? "—" : `${retention}%`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
