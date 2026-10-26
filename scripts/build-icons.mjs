// Renders the app icons from src/assets/img/icon.svg with the browser that
// Playwright provides. Run once after changing the icon; the PNGs are committed.
// Usage: NODE_PATH=$(npm root -g) node scripts/build-icons.mjs
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const svg = fs.readFileSync("src/assets/img/icon.svg", "utf8");
const out = "src/assets/img/";
const jobs = [
  { file: "icon-192.png", size: 192, pad: 0 },
  { file: "icon-512.png", size: 512, pad: 0 },
  { file: "icon-maskable-512.png", size: 512, pad: 0.1, bg: "#0b4f8a" },
  { file: "apple-touch-icon.png", size: 180, pad: 0, bg: "#0b4f8a" },
];
const browser = await chromium.launch();
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: j.size, height: j.size }, deviceScaleFactor: 1 });
  const inner = Math.round(j.size * (1 - 2 * j.pad));
  await page.setContent(`<html><body style="margin:0;width:${j.size}px;height:${j.size}px;background:${j.bg || "transparent"};display:grid;place-items:center">` +
    `<div style="width:${inner}px;height:${inner}px">${svg.replace("<svg", '<svg width="100%" height="100%"')}</div></body></html>`);
  await page.screenshot({ path: out + j.file, omitBackground: !j.bg });
  await page.close();
  console.log("wrote", out + j.file);
}
await browser.close();
