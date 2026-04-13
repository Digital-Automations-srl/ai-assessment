"use client";

import type { AxisKey } from "@/lib/types";

interface SpiderChartProps {
  data: Record<AxisKey, number>;
  size?: number;
}

const AXES_ORDER: AxisKey[] = [
  "conformita",
  "processi",
  "utilizzo",
  "autonomia",
  "protezione",
  "tecnologia",
];

const AXIS_LABELS: Record<AxisKey, string> = {
  conformita: "Conformita'",
  processi: "Processi e Controlli",
  utilizzo: "Utilizzo Reale",
  autonomia: "Autonomia Team",
  protezione: "Protezione Dati",
  tecnologia: "Tecnologia",
};

const LEVELS = 5;

function getPoint(
  centerX: number,
  centerY: number,
  radius: number,
  index: number,
  total: number
): [number, number] {
  // Start from 12 o'clock (-PI/2), go clockwise
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return [
    centerX + radius * Math.cos(angle),
    centerY + radius * Math.sin(angle),
  ];
}

function polygonPoints(
  centerX: number,
  centerY: number,
  radius: number,
  total: number
): string {
  return Array.from({ length: total })
    .map((_, i) => {
      const [x, y] = getPoint(centerX, centerY, radius, i, total);
      return `${x},${y}`;
    })
    .join(" ");
}

export default function SpiderChart({ data, size = 420 }: SpiderChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.35;
  const total = AXES_ORDER.length;
  const labelOffset = 28;

  // Data polygon points
  const dataPoints = AXES_ORDER.map((key, i) => {
    const value = data[key] ?? 0;
    const r = (value / LEVELS) * maxRadius;
    return getPoint(cx, cy, r, i, total);
  });
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto"
    >
      {/* Concentric pentagon grid */}
      {Array.from({ length: LEVELS }).map((_, level) => {
        const r = ((level + 1) / LEVELS) * maxRadius;
        const isLast = level === LEVELS - 1;
        return (
          <polygon
            key={`grid-${level}`}
            points={polygonPoints(cx, cy, r, total)}
            fill="none"
            stroke="#E4E4E4"
            strokeWidth={isLast ? 1.5 : 0.7}
          />
        );
      })}

      {/* Axis lines */}
      {AXES_ORDER.map((_, i) => {
        const [x, y] = getPoint(cx, cy, maxRadius, i, total);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#E4E4E4"
            strokeWidth={0.7}
          />
        );
      })}

      {/* Level numbers */}
      {Array.from({ length: LEVELS }).map((_, level) => {
        const r = ((level + 1) / LEVELS) * maxRadius;
        // Place numbers along the first axis (12 o'clock)
        const [x, y] = getPoint(cx, cy, r, 0, total);
        return (
          <text
            key={`level-${level}`}
            x={x + 6}
            y={y + 3}
            fontSize="10"
            fill="#999"
            textAnchor="start"
          >
            {level + 1}
          </text>
        );
      })}

      {/* Result polygon */}
      <polygon
        points={dataPolygon}
        fill="#016FC0"
        fillOpacity={0.15}
        stroke="#016FC0"
        strokeWidth={2.2}
      />

      {/* Vertex dots */}
      {dataPoints.map(([x, y], i) => (
        <circle
          key={`dot-${i}`}
          cx={x}
          cy={y}
          r={4}
          fill="#016FC0"
          stroke="white"
          strokeWidth={1.5}
        />
      ))}

      {/* Labels */}
      {AXES_ORDER.map((key, i) => {
        const [x, y] = getPoint(cx, cy, maxRadius + labelOffset, i, total);
        const angle = (2 * Math.PI * i) / total - Math.PI / 2;
        const isRight = Math.cos(angle) > 0.01;
        const isLeft = Math.cos(angle) < -0.01;
        const anchor = isRight ? "start" : isLeft ? "end" : "middle";

        return (
          <text
            key={`label-${key}`}
            x={x}
            y={y}
            fontSize="13"
            fontWeight="600"
            fill="#004172"
            textAnchor={anchor}
            dominantBaseline="central"
          >
            {AXIS_LABELS[key]}
          </text>
        );
      })}
    </svg>
  );
}
