// The puzzle's hints and the new pictures, on the sample math lesson:
//   - every picture of the grades 2 to 5 framework renders (no step shows a
//     placeholder), with a text alternative;
//   - on a puzzle step the tool slot holds Hint, and Show again and Clear
//     marks are hidden; on other steps Hint is hidden;
//   - each press (the button, the H key, the More row) reveals the next hint
//     in order on the panel, the button goes quiet after the last, and the
//     primary button's box never moves;
//   - the hints used are kept with the item's record and in the saved lesson.
//
//   node scripts/check-hint.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch (e) {}
  try { return require(join(execSync("npm root -g").toString().trim(), "playwright")); } catch (e) {}
  console.error("check-hint: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-hint: build the site first (npm run build)."); process.exit(2); }
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let f = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = "http://127.0.0.1:" + server.address().port;

let failed = 0;
function check(name, ok, detail) { console.log((ok ? "ok   " : "FAIL ") + name + (ok || !detail ? "" : "  " + detail)); if (!ok) failed++; }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(BASE + "/math-sample/", { waitUntil: "load" });
await page.waitForTimeout(300);
const visible = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && e.offsetParent !== null; }, sel);
const rect = (sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(","); }, sel);
const segs = await page.evaluate(() => window.mdRunner.segments().map((s) => ({ title: s.title, n: s.steps.length })));

// 1. Every picture renders.
let placeholders = 0, noAlt = 0, steps = 0;
for (let si = 0; si < segs.length; si++) {
  await page.evaluate((i) => document.querySelector('#tp-outline-list [data-seg="' + i + '"]').click(), si);
  await page.waitForTimeout(100);
  for (let st = 0; st < segs[si].n; st++) {
    steps++;
    placeholders += await page.evaluate(() => [...document.querySelectorAll("#child-stage .mdv")].filter((e) => /^\[\w+\]$/.test(e.textContent.trim())).length);
    const alt = await page.textContent("#stage-alt");
    if (!alt || alt.length < 12) noAlt++;
    if (st < segs[si].n - 1) await page.evaluate(() => { const next = ["btn-goon", "btn-firm", "btn-next"].map((id) => document.getElementById(id)).find((b) => b && !b.hidden); next.click(); });
    await page.waitForTimeout(40);
  }
}
check("every step draws its picture", placeholders === 0, placeholders + " placeholder(s) in " + steps + " steps");
check("every step has a text alternative", noAlt === 0, noAlt + " step(s) without");
const kinds = await page.evaluate(() => { const out = []; (function walk(v) { if (!v) return; if (Array.isArray(v)) return v.forEach(walk); out.push(v.t); walk(v.items); walk(v.opts); })(JSON.parse(document.getElementById("runner-data").textContent).lesson.exercises.flatMap((e) => e.steps.map((s) => s.screen))); return out; });
const wanted = ["colx", "mult", "ldiv", "blocks", "frac", "bar", "nl", "grid", "tape", "graph", "table", "geo", "angle", "coord", "ruler", "cubes", "prose", "poem", "diagram"];
check("the sample shows every new picture", wanted.every((k) => kinds.includes(k)), wanted.filter((k) => !kinds.includes(k)).join(", "));

// 2. A hint step and a plain step.
const pz = segs.findIndex((s) => /Puzzle/.test(s.title));
check("the sample has a puzzle", pz >= 0);
await page.evaluate((i) => document.querySelector('#tp-outline-list [data-seg="' + i + '"]').click(), pz);
await page.waitForTimeout(150);
check("on the puzzle's model step Hint is hidden", !(await visible("#btn-hint")));
await page.click("#btn-next");
await page.waitForTimeout(150);
check("on the puzzle's test step Hint is in the tool slot", (await visible("#btn-hint")) && !(await visible("#btn-show")) && !(await visible("#btn-clear")));
check("the hint box is hidden before a press", !(await visible("#tp-hint")));
const before = await rect("#btn-firm");
await page.click("#btn-hint");
await page.waitForTimeout(150);
let hintText = await page.textContent("#tp-hint-text");
check("the first press shows hint 1 and only hint 1", (await visible("#tp-hint")) && /Hint 1\./.test(hintText) && !/Hint 2\./.test(hintText), hintText);
check("the button stays live with a hint left", !(await page.evaluate(() => document.getElementById("btn-hint").disabled)));
await page.keyboard.press("h");
await page.waitForTimeout(150);
hintText = await page.textContent("#tp-hint-text");
check("the H key shows hint 2 under hint 1", /Hint 1\./.test(hintText) && /Hint 2\./.test(hintText), hintText);
check("the button goes quiet after the last hint", await page.evaluate(() => document.getElementById("btn-hint").disabled));
check("the primary button did not move", (await rect("#btn-firm")) === before, before + " then " + (await rect("#btn-firm")));
await page.click("#btn-more");
await page.waitForTimeout(350);
check("the More row for a hint is quiet when none are left", await page.evaluate(() => document.querySelector('[data-act="hint"]').disabled));
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
await page.click("#btn-firm");
await page.waitForTimeout(150);
const used = await page.evaluate(() => { const r = window.mdRunner.itemResults(); return r["pz:sample:greatest-sum"]; });
check("the item's record carries the hints used", !!used && used.hints === 2, JSON.stringify(used));
check("the hints are kept with the lesson's state", await page.evaluate(() => Object.values(window.mdRunner.hints()).some((n) => n === 2)));
// A touchable diagram label.
const chain = segs.findIndex((s) => /Text and diagrams/.test(s.title));
await page.evaluate((i) => document.querySelector('#tp-outline-list [data-seg="' + i + '"]').click(), chain);
await page.waitForTimeout(100);
for (let i = 0; i < 6; i++) { if (await page.evaluate(() => !!document.querySelector("#child-stage .mdv-diagram.mdv-pickable"))) break; await page.evaluate(() => ["btn-goon", "btn-firm", "btn-next"].map((id) => document.getElementById(id)).find((b) => b && !b.hidden).click()); await page.waitForTimeout(60); }
await page.evaluate(() => document.querySelectorAll("#child-stage .mdv-diagram .mdv-tap")[2].dispatchEvent(new MouseEvent("click", { bubbles: true })));
await page.waitForTimeout(100);
const touched = await page.textContent("#tp-touched");
check("a touched diagram label is named on the panel", /frog/.test(touched), touched);
check("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
await browser.close();
server.close();
if (failed) { console.error(`check-hint: ${failed} check(s) failed.`); process.exit(1); }
console.log("check-hint: every new picture draws, and a puzzle's hints come one at a time, stay on the panel, and are kept with the record.");
