// Lighthouse's accessibility score for the screens, from the built site:
//   node scripts/check-lighthouse.mjs            the new reading screens and the main tabs
// Needs lighthouse installed globally (npm install -g lighthouse) and the
// Chromium that Playwright uses.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const g = execSync("npm root -g").toString().trim();
const lighthouse = (await import(join(g, "lighthouse/core/index.js"))).default;
const chromeLauncher = await import(join(g, "lighthouse/node_modules/chrome-launcher/dist/index.js")).catch(() => import(join(g, "chrome-launcher/dist/index.js")));
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const root = join(process.cwd(), "_site");
const server = createServer((req, res) => {
  let f = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = "http://127.0.0.1:" + server.address().port;
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/lessons/", "/practice/", "/records/", "/more/", "/reading-1/", "/reading-1/lesson-040/", "/reading-2/lesson-026/", "/stories/", "/stories/sam-sat/", "/quick-sounds/", "/sounds/", "/words/", "/guide/reading/", "/placement/reading/", "/placement/"];
const chromePath = process.env.CHROME_PATH || "/opt/pw-browsers/chromium";
const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] });
const fails = [];
for (const p of PAGES) {
  const r = await lighthouse(BASE + p, { port: chrome.port, onlyCategories: ["accessibility", "best-practices"], output: "json", logLevel: "error", formFactor: "mobile", screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false } });
  const a11y = Math.round(r.lhr.categories.accessibility.score * 100);
  const bp = Math.round(r.lhr.categories["best-practices"].score * 100);
  const bad = Object.values(r.lhr.audits).filter((a) => a.score !== null && a.score < 1 && r.lhr.categories.accessibility.auditRefs.some((x) => x.id === a.id)).map((a) => a.id);
  console.log((a11y === 100 ? "ok   " : "FAIL ") + p + "  accessibility " + a11y + ", best practices " + bp + (bad.length ? "  " + bad.join(", ") : ""));
  if (a11y < 100) fails.push(p);
}
await chrome.kill();
server.close();
if (fails.length) { console.error("check-lighthouse: " + fails.length + " page(s) under 100."); process.exit(1); }
console.log("check-lighthouse: accessibility 100 on " + PAGES.length + " pages.");
