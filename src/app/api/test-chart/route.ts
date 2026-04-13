import { NextResponse } from "next/server";
import sharp from "sharp";
import { generateSpiderChartSVG } from "@/lib/spider-chart-svg";
import type { AxisKey } from "@/lib/types";

/**
 * GET /api/test-chart — returns the spider chart as PNG.
 * For testing only. Remove after verifying.
 */
export async function GET() {
  const data: Record<AxisKey, number> = {
    conformita: 2.4, processi: 3.2, utilizzo: 1.8,
    autonomia: 2.0, protezione: 3.6, tecnologia: 2.8,
  };
  const target: Record<AxisKey, number> = {
    conformita: 4.5, processi: 4.2, utilizzo: 3.0,
    autonomia: 3.8, protezione: 4.6, tecnologia: 3.8,
  };

  const svg = generateSpiderChartSVG(data, target);
  const png = await sharp(Buffer.from(svg)).resize(700).png().toBuffer();

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
