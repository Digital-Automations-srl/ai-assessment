import { generateSpiderChartSVG } from "../src/lib/spider-chart-svg";
import sharp from "sharp";
import { writeFileSync } from "fs";

async function main() {
  const data = {
    conformita: 2.4, processi: 3.2, utilizzo: 1.8,
    autonomia: 2.0, protezione: 3.6, tecnologia: 2.8,
  };
  const target = {
    conformita: 4.5, processi: 4.2, utilizzo: 3.0,
    autonomia: 3.8, protezione: 4.6, tecnologia: 3.8,
  };

  const svg = generateSpiderChartSVG(data as any, target as any);
  writeFileSync("/tmp/chart-test.svg", svg);
  console.log("SVG saved to /tmp/chart-test.svg");

  const png = await sharp(Buffer.from(svg)).resize(700).png().toBuffer();
  writeFileSync("/tmp/chart-test.png", png);
  console.log("PNG saved to /tmp/chart-test.png (" + png.length + " bytes)");
}

main();
