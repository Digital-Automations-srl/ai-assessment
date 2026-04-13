/**
 * Server-side SVG spider chart generator.
 * Embeds Inter font as base64 @font-face for serverless compatibility.
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { AxisKey } from "./types";

const AXES_ORDER: AxisKey[] = [
  "conformita", "processi", "utilizzo", "autonomia", "protezione", "tecnologia",
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

// Cache font base64
let fontBase64Cache: string | null = null;
function getFontBase64(): string {
  if (fontBase64Cache) return fontBase64Cache;
  const fontPath = join(process.cwd(), "src/assets/Inter-Variable.ttf");
  fontBase64Cache = readFileSync(fontPath).toString("base64");
  return fontBase64Cache;
}

function getPoint(cx: number, cy: number, radius: number, index: number, total: number): [number, number] {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function polygonPoints(cx: number, cy: number, radius: number, total: number): string {
  return Array.from({ length: total })
    .map((_, i) => getPoint(cx, cy, radius, i, total).join(","))
    .join(" ");
}

export function generateSpiderChartSVG(
  data: Record<AxisKey, number>,
  targetData: Record<AxisKey, number>,
): string {
  const size = 560;
  const padding = 90;
  const vw = size + padding * 2;
  const vh = size + padding * 2 + 50;
  const cx = vw / 2;
  const cy = (size + padding * 2) / 2;
  const maxRadius = size * 0.40;
  const total = AXES_ORDER.length;
  const labelOffset = 38;

  const fontB64 = getFontBase64();

  // Font embedding
  const fontStyle = `
    <defs>
      <style type="text/css">
        @font-face {
          font-family: 'Inter';
          src: url('data:font/truetype;base64,${fontB64}') format('truetype');
          font-weight: 400 700;
          font-style: normal;
        }
      </style>
    </defs>`;

  // Grid hexagons
  let grid = "";
  for (let level = 0; level < LEVELS; level++) {
    const r = ((level + 1) / LEVELS) * maxRadius;
    const sw = level === LEVELS - 1 ? 1.5 : 0.7;
    grid += `<polygon points="${polygonPoints(cx, cy, r, total)}" fill="none" stroke="#D0D0D0" stroke-width="${sw}"/>`;
  }

  // Axis spokes
  let spokes = "";
  for (let i = 0; i < total; i++) {
    const [x, y] = getPoint(cx, cy, maxRadius, i, total);
    spokes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#D0D0D0" stroke-width="0.7"/>`;
  }

  // Level numbers
  let nums = "";
  for (let level = 0; level < LEVELS; level++) {
    const r = ((level + 1) / LEVELS) * maxRadius;
    const [x, y] = getPoint(cx, cy, r, 0, total);
    nums += `<text x="${x + 8}" y="${y + 4}" font-size="11" fill="#999" font-family="Inter, Arial, sans-serif">${level + 1}</text>`;
  }

  // Target polygon (blue)
  const tPts = AXES_ORDER.map((key, i) => getPoint(cx, cy, ((targetData[key] ?? 0) / LEVELS) * maxRadius, i, total));
  let target = `<polygon points="${tPts.map(p => p.join(",")).join(" ")}" fill="${DA_BLUE}" fill-opacity="0.12" stroke="${DA_BLUE}" stroke-width="2.5" stroke-linejoin="round"/>`;
  tPts.forEach(([x, y]) => { target += `<circle cx="${x}" cy="${y}" r="5" fill="${DA_BLUE}" stroke="white" stroke-width="2"/>`; });

  // Current polygon (amber)
  const dPts = AXES_ORDER.map((key, i) => getPoint(cx, cy, ((data[key] ?? 0) / LEVELS) * maxRadius, i, total));
  let current = `<polygon points="${dPts.map(p => p.join(",")).join(" ")}" fill="${DA_AMBER}" fill-opacity="0.20" stroke="${DA_AMBER}" stroke-width="2.5" stroke-linejoin="round"/>`;
  dPts.forEach(([x, y]) => { current += `<circle cx="${x}" cy="${y}" r="5" fill="${DA_AMBER}" stroke="white" stroke-width="2"/>`; });

  // Axis labels
  let labels = "";
  AXES_ORDER.forEach((key, i) => {
    const [x, y] = getPoint(cx, cy, maxRadius + labelOffset, i, total);
    const angle = (2 * Math.PI * i) / total - Math.PI / 2;
    const cosA = Math.cos(angle);
    const anchor = cosA > 0.01 ? "start" : cosA < -0.01 ? "end" : "middle";
    labels += `<text x="${x}" y="${y}" font-size="14" font-weight="700" fill="${DA_NAVY}" text-anchor="${anchor}" dominant-baseline="central" font-family="Inter, Arial, sans-serif">${AXIS_LABELS[key]}</text>`;
  });

  // Legend
  const ly = vh - 30;
  const legend = `
    <circle cx="${cx - 120}" cy="${ly}" r="7" fill="${DA_AMBER}"/>
    <text x="${cx - 106}" y="${ly + 1}" font-size="13" font-weight="600" fill="${DA_AMBER}" dominant-baseline="central" font-family="Inter, Arial, sans-serif">La tua azienda</text>
    <circle cx="${cx + 50}" cy="${ly}" r="7" fill="${DA_BLUE}"/>
    <text x="${cx + 64}" y="${ly + 1}" font-size="13" font-weight="600" fill="${DA_BLUE}" dominant-baseline="central" font-family="Inter, Arial, sans-serif">Obiettivo DA (90gg)</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}">
  ${fontStyle}
  <rect width="100%" height="100%" fill="white"/>
  ${grid}
  ${spokes}
  ${nums}
  ${target}
  ${current}
  ${labels}
  ${legend}
</svg>`;
}
