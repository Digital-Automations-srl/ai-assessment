import { getLevel } from "@/lib/scoring";
import type { GroupAvg, LabelCount, MonthPoint } from "@/lib/admin/types";

// Colore per livello/label (allineato a scoring.ts LEVEL_THRESHOLDS).
const LABEL_COLOR: Record<string, string> = {
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
