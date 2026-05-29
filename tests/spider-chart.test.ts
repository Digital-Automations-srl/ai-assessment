import { describe, it, expect } from "vitest";
import { generateSpiderChartSVG } from "@/lib/spider-chart-svg";
import type { AxisKey } from "@/lib/types";

// CODE-1: il font non e' piu' embeddato come base64 ma letto da
// src/assets/Inter-Variable.ttf a runtime. Questo test esercita davvero il
// caricamento del font: se il file non fosse risolto/parsato, generateSpider
// ChartSVG lancerebbe. I testi sono renderizzati come <path> → la loro presenza
// (col fill DA navy delle etichette) conferma che il font ha prodotto i glifi.
describe("spider-chart-svg: font on-demand da file (CODE-1)", () => {
  const data: Record<AxisKey, number> = {
    conformita: 3,
    processi: 2,
    utilizzo: 2.5,
    autonomia: 4,
    protezione: 3.5,
    tecnologia: 1.5,
  };
  const target: Record<AxisKey, number> = {
    conformita: 4,
    processi: 4,
    utilizzo: 4,
    autonomia: 4,
    protezione: 4,
    tecnologia: 4,
  };

  it("genera un SVG valido con glifi-path (font risolto da src/assets)", () => {
    const svg = generateSpiderChartSVG(data, target);
    expect(svg.startsWith("<svg")).toBe(true);
    // I glifi di testo sono <path>; le etichette assi usano il fill DA navy.
    expect(svg).toContain("<path");
    expect(svg).toContain('fill="#004172"');
    // Numerosi path (etichette assi a parola + numeri livello + legenda): ogni
    // parola e' un singolo <path>. Se il font non caricasse, sarebbero 0/crash.
    expect((svg.match(/<path/g) ?? []).length).toBeGreaterThan(10);
  });
});
