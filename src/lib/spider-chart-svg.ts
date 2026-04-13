/**
 * Server-side SVG spider chart generator.
 * Produces a standalone SVG string (with embedded font) for email embedding.
 */

import type { AxisKey } from "./types";

const AXES_ORDER: AxisKey[] = [
  "conformita",
  "processi",
  "utilizzo",
  "autonomia",
  "protezione",
  "tecnologia",
];

const AXIS_LABELS: Record<AxisKey, string> = {
  conformita: "Conformità",
  processi: "Processi e Controlli",
  utilizzo: "Utilizzo Reale",
  autonomia: "Autonomia Team",
  protezione: "Protezione Dati",
  tecnologia: "Tecnologia",
};

const LEVELS = 5;
const DA_NAVY = "#004172";
const DA_BLUE = "#016FC0";
const DA_AMBER = "#E09900";

function getPoint(cx: number, cy: number, radius: number, index: number, total: number): [number, number] {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function polygonPoints(cx: number, cy: number, radius: number, total: number): string {
  return Array.from({ length: total })
    .map((_, i) => {
      const [x, y] = getPoint(cx, cy, radius, i, total);
      return `${x},${y}`;
    })
    .join(" ");
}

export function generateSpiderChartSVG(
  data: Record<AxisKey, number>,
  targetData: Record<AxisKey, number>,
  imgSize = 560
): string {
  const padding = 90;
  const vw = imgSize + padding * 2;
  const vh = imgSize + padding * 2 + 60; // extra space for legend
  const cx = vw / 2;
  const cy = (imgSize + padding * 2) / 2;
  const maxRadius = imgSize * 0.40;
  const total = AXES_ORDER.length;
  const labelOffset = 38;

  // Grid
  let gridLines = "";
  for (let level = 0; level < LEVELS; level++) {
    const r = ((level + 1) / LEVELS) * maxRadius;
    const sw = level === LEVELS - 1 ? 1.5 : 0.7;
    gridLines += `<polygon points="${polygonPoints(cx, cy, r, total)}" fill="none" stroke="#D0D0D0" stroke-width="${sw}"/>`;
  }

  // Axis lines
  let axisLines = "";
  for (let i = 0; i < total; i++) {
    const [x, y] = getPoint(cx, cy, maxRadius, i, total);
    axisLines += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#D0D0D0" stroke-width="0.7"/>`;
  }

  // Level numbers
  let levelNumbers = "";
  for (let level = 0; level < LEVELS; level++) {
    const r = ((level + 1) / LEVELS) * maxRadius;
    const [x, y] = getPoint(cx, cy, r, 0, total);
    levelNumbers += `<text x="${x + 8}" y="${y + 4}" font-size="11" fill="#999" font-family="Arial, sans-serif">${level + 1}</text>`;
  }

  // Target polygon (blue)
  const targetPts = AXES_ORDER.map((key, i) => {
    const r = ((targetData[key] ?? 0) / LEVELS) * maxRadius;
    return getPoint(cx, cy, r, i, total);
  });
  const targetPolygon = targetPts.map(([x, y]) => `${x},${y}`).join(" ");
  let targetSvg = `<polygon points="${targetPolygon}" fill="${DA_BLUE}" fill-opacity="0.12" stroke="${DA_BLUE}" stroke-width="2.5" stroke-linejoin="round"/>`;
  targetPts.forEach(([x, y]) => {
    targetSvg += `<circle cx="${x}" cy="${y}" r="5" fill="${DA_BLUE}" stroke="white" stroke-width="2"/>`;
  });

  // Current data polygon (amber)
  const dataPts = AXES_ORDER.map((key, i) => {
    const r = ((data[key] ?? 0) / LEVELS) * maxRadius;
    return getPoint(cx, cy, r, i, total);
  });
  const dataPolygon = dataPts.map(([x, y]) => `${x},${y}`).join(" ");
  let dataSvg = `<polygon points="${dataPolygon}" fill="${DA_AMBER}" fill-opacity="0.20" stroke="${DA_AMBER}" stroke-width="2.5" stroke-linejoin="round"/>`;
  dataPts.forEach(([x, y]) => {
    dataSvg += `<circle cx="${x}" cy="${y}" r="5" fill="${DA_AMBER}" stroke="white" stroke-width="2"/>`;
  });

  // Axis labels
  let labels = "";
  AXES_ORDER.forEach((key, i) => {
    const [x, y] = getPoint(cx, cy, maxRadius + labelOffset, i, total);
    const angle = (2 * Math.PI * i) / total - Math.PI / 2;
    const cosA = Math.cos(angle);
    const anchor = cosA > 0.01 ? "start" : cosA < -0.01 ? "end" : "middle";
    labels += `<text x="${x}" y="${y}" font-size="14" font-weight="700" fill="${DA_NAVY}" text-anchor="${anchor}" dominant-baseline="central" font-family="Arial, sans-serif">${AXIS_LABELS[key]}</text>`;
  });

  // Legend at bottom
  const legendY = vh - 30;
  const legendCx = vw / 2;
  const legend = `
    <circle cx="${legendCx - 120}" cy="${legendY}" r="7" fill="${DA_AMBER}"/>
    <text x="${legendCx - 108}" y="${legendY + 1}" font-size="13" font-weight="600" fill="${DA_AMBER}" dominant-baseline="central" font-family="Arial, sans-serif">La tua azienda</text>
    <circle cx="${legendCx + 40}" cy="${legendY}" r="7" fill="${DA_BLUE}"/>
    <text x="${legendCx + 52}" y="${legendY + 1}" font-size="13" font-weight="600" fill="${DA_BLUE}" dominant-baseline="central" font-family="Arial, sans-serif">Obiettivo DA (90gg)</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}">
  <rect width="100%" height="100%" fill="white"/>
  ${gridLines}
  ${axisLines}
  ${levelNumbers}
  ${targetSvg}
  ${dataSvg}
  ${labels}
  ${legend}
</svg>`;
}
