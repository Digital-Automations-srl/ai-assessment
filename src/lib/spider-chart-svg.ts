/**
 * Server-side SVG spider chart generator.
 * Converts all text to SVG paths using opentype.js so NO system fonts are needed.
 * Works on Vercel serverless without any font files at runtime.
 */

import opentype from "opentype.js";
import { INTER_FONT_BASE64 } from "./font-data";
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

// Parse font from embedded base64 (no filesystem needed)
let cachedFont: opentype.Font | null = null;
function getFont(): opentype.Font {
  if (cachedFont) return cachedFont;
  const binary = Buffer.from(INTER_FONT_BASE64, "base64");
  cachedFont = opentype.parse(binary.buffer as ArrayBuffer);
  return cachedFont;
}

/** Render text as SVG <path> — no font needed at PNG render time */
function textToPath(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string,
  anchor: "start" | "middle" | "end" = "start",
  fontWeight: "normal" | "bold" = "bold",
): string {
  const font = getFont();
  // opentype.js doesn't have weight variants in variable font easily,
  // so we use the same font for all weights
  void fontWeight;

  // Measure width for alignment
  const width = font.getAdvanceWidth(text, fontSize);
  let adjustedX = x;
  if (anchor === "middle") adjustedX = x - width / 2;
  else if (anchor === "end") adjustedX = x - width;

  const path = font.getPath(text, adjustedX, y, fontSize);
  const svgPath = path.toSVG(2);
  // path.toSVG returns <path d="..."/> — we need to add fill
  return svgPath.replace('<path', `<path fill="${fill}"`);
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

  // Level numbers as paths
  let nums = "";
  for (let level = 0; level < LEVELS; level++) {
    const r = ((level + 1) / LEVELS) * maxRadius;
    const [x, y] = getPoint(cx, cy, r, 0, total);
    nums += textToPath(String(level + 1), x + 8, y + 4, 11, "#999", "start", "normal");
  }

  // Target polygon (blue)
  const tPts = AXES_ORDER.map((key, i) => getPoint(cx, cy, ((targetData[key] ?? 0) / LEVELS) * maxRadius, i, total));
  let targetSvg = `<polygon points="${tPts.map(p => p.join(",")).join(" ")}" fill="${DA_BLUE}" fill-opacity="0.12" stroke="${DA_BLUE}" stroke-width="2.5" stroke-linejoin="round"/>`;
  tPts.forEach(([x, y]) => { targetSvg += `<circle cx="${x}" cy="${y}" r="5" fill="${DA_BLUE}" stroke="white" stroke-width="2"/>`; });

  // Current polygon (amber)
  const dPts = AXES_ORDER.map((key, i) => getPoint(cx, cy, ((data[key] ?? 0) / LEVELS) * maxRadius, i, total));
  let currentSvg = `<polygon points="${dPts.map(p => p.join(",")).join(" ")}" fill="${DA_AMBER}" fill-opacity="0.20" stroke="${DA_AMBER}" stroke-width="2.5" stroke-linejoin="round"/>`;
  dPts.forEach(([x, y]) => { currentSvg += `<circle cx="${x}" cy="${y}" r="5" fill="${DA_AMBER}" stroke="white" stroke-width="2"/>`; });

  // Axis labels as paths
  let labels = "";
  AXES_ORDER.forEach((key, i) => {
    const [x, y] = getPoint(cx, cy, maxRadius + labelOffset, i, total);
    const angle = (2 * Math.PI * i) / total - Math.PI / 2;
    const cosA = Math.cos(angle);
    const anchor: "start" | "middle" | "end" = cosA > 0.01 ? "start" : cosA < -0.01 ? "end" : "middle";
    labels += textToPath(AXIS_LABELS[key], x, y + 5, 14, DA_NAVY, anchor);
  });

  // Legend as paths
  const ly = vh - 30;
  const legend = `
    <circle cx="${cx - 120}" cy="${ly}" r="7" fill="${DA_AMBER}"/>
    ${textToPath("La tua azienda", cx - 106, ly + 5, 13, DA_AMBER, "start")}
    <circle cx="${cx + 50}" cy="${ly}" r="7" fill="${DA_BLUE}"/>
    ${textToPath("Obiettivo DA (90gg)", cx + 64, ly + 5, 13, DA_BLUE, "start")}
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}">
  <rect width="100%" height="100%" fill="white"/>
  ${grid}
  ${spokes}
  ${nums}
  ${targetSvg}
  ${currentSvg}
  ${labels}
  ${legend}
</svg>`;
}
