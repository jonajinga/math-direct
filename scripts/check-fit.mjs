// Walks every step of the runner pages in a headless browser and fails when
// anything does not fit on one screen: the panel or the stage overflows, the
// page itself scrolls, the control bar wraps, text is clipped, the strip is
// cut, the script drops under 16 px, or the primary button moves. It also
// checks the child's tap: a tap only rings the touched part and locks the
// group, and never shows a verdict. The primary button's right edge, top,
// and height must be the same on every step of a page.
//
//   node scripts/check-fit.mjs            every 12th lesson, every test, practice sets, placement, facts
//   node scripts/check-fit.mjs --all      every lesson too
//   node scripts/check-fit.mjs --only /reading-sample/   one page
//   node scripts/check-fit.mjs --level reading-2        every page of one level
//   node scripts/check-fit.mjs --sizes 375x667,320x568
//
// Needs a built site in _site/ and Playwright (local or global).
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch (e) {}
  try { return require(join(execSync("npm root -g").toString().trim(), "playwright")); } catch (e) {}
  console.error("check-fit: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();

const args = process.argv.slice(2);
const ALL = args.includes("--all");
const sizesArg = args[args.indexOf("--sizes") + 1];
const SIZES = (args.includes("--sizes") ? sizesArg : "375x667,667x375,740x360,320x568").split(",").map((s) => s.split("x").map(Number));
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-fit: build the site first (npm run build)."); process.exit(2); }

// ── Which pages ──
const { buildProgram } = require("../curriculum/index.js");
const program = buildProgram({ strict: true });
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : "";
const LEVEL = process.argv.includes("--level") ? process.argv[process.argv.indexOf("--level") + 1] : "";
const urls = [];
if (ONLY) urls.push(ONLY);
else if (LEVEL) {
  // Every lesson, test, and practice set of one level.
  program.lessons.forEach((l) => { if (l.level === LEVEL) urls.push(l.url); });
  program.tests.forEach((t) => { if (t.level === LEVEL) urls.push(t.url); });
  program.practice.forEach((s) => { if (s.level === LEVEL) urls.push(s.url); });
}
else {
  program.lessons.forEach((l, i) => { if (ALL || i % 12 === 0) urls.push(l.url); });
  program.tests.forEach((t) => urls.push(t.url));
  program.practice.forEach((s, i) => { if (ALL || i % 3 === 0) urls.push(s.url); });
  urls.push("/placement/math/", "/placement/reading/", "/facts/", "/reading-sample/", "/quick-sounds/", "/stories/sam-sat/", "/stories/the-man-and-the-dog/");
}

// ── A tiny static server ──
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = "http://127.0.0.1:" + server.address().port;

// ── The walk, run inside the page ──
function walk(url) {
  const $ = (id) => document.getElementById(id);
  const out = [];
  const visible = (e) => e && !e.hidden && e.offsetParent !== null;
  const primary = () => ["btn-goon", "btn-firm", "btn-next"].map($).find(visible);
  let primaryBox = null;
  const measure = (label) => {
    const b = $("tp-body"), st = $("child-stage"), bar = document.querySelector(".rn-bar"), where = $("rn-where"), say = $("tp-say");
    const btns = [...bar.querySelectorAll(".btn")].filter(visible);
    const tops = new Set(btns.map((x) => Math.round(x.getBoundingClientRect().top)));
    const pb = primary() ? primary().getBoundingClientRect() : null;
    const box = pb ? [pb.right, pb.top, pb.height].map(Math.round).join(",") : "";
    if (!primaryBox) primaryBox = box;
    const clipped = [...document.querySelectorAll(".rn-panel *")].filter((e) => visible(e) && e.textContent.trim() && (() => { const cs = getComputedStyle(e); return (cs.webkitLineClamp && cs.webkitLineClamp !== "none") || (cs.textOverflow === "ellipsis" && e.scrollWidth > e.clientWidth + 1); })()).map((e) => e.id || e.className).join(",");
    out.push({
      label,
      body: b.scrollHeight - b.clientHeight,
      stage: st.scrollHeight - st.clientHeight,
      stageW: st.scrollWidth - st.clientWidth,
      doc: Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth),
      rows: tops.size + (bar.scrollWidth - bar.clientWidth > 1 ? 1 : 0),
      cut: where.scrollWidth > where.clientWidth + 1 ? where.textContent : "",
      sayPx: parseFloat(getComputedStyle(say).fontSize),
      fit4: b.classList.contains("fit-4"),
      folded: $("tp-correct").classList.contains("is-folded"),
      moved: box && box !== primaryBox ? box + " vs " + primaryBox : "",
      clipped,
      say: say.textContent.slice(0, 60),
    });
  };
  const tapCheck = () => {
    if (!visible($("btn-firm"))) return null; // only the child's answer steps
    const group = document.querySelector("#child-stage [data-ans]:not([data-ans=''])");
    if (!group) return null;
    const taps = [...group.querySelectorAll(".mdv-tap")];
    if (taps.length < 2) return null;
    taps[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const r = {};
    r.verdict = !!document.querySelector("#child-stage .is-right, #child-stage .is-wrong");
    r.picked = taps[0].classList.contains("is-picked");
    r.locked = group.classList.contains("is-done");
    r.told = !$("tp-touched").hidden && /Child touched/.test($("tp-touched").textContent);
    taps[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    r.stillFirst = taps[0].classList.contains("is-picked") && !taps[1].classList.contains("is-picked");
    r.suggested = !!document.querySelector(".rn-bar .is-suggested");
    return r;
  };
  const taps = [];
  for (let i = 0; i < 600; i++) {
    if (!$("runner-finish").hidden || $("runner-shell").hidden) break;
    measure(url + " #" + i);
    const t = tapCheck();
    if (t) taps.push({ label: url + " #" + i, ...t });
    const err = $("btn-error");
    if (visible(err) && !err.disabled && i % 2 === 0) {
      err.click();
      if (!$("runner-shell").hidden && $("runner-finish").hidden) measure(url + " #" + i + " error");
    }
    const pick = primary();
    if (!pick) break;
    pick.click();
  }
  return { out, taps };
}

const browser = await chromium.launch();
let failed = false;
for (const [w, h] of SIZES) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  const tapSamples = [];
  const tot = { pages: 0, steps: 0, bad: 0, body: 0, stage: 0, doc: 0, rows: 0, cut: 0, clipped: 0, small: 0, moved: 0, fit4: 0, folded: 0, taps: 0, tapBad: 0, samples: [] };
  for (const url of urls) {
    await page.goto(BASE + url, { waitUntil: "load" });
    // Start screens: pick the first choice.
    const start = await page.$("[data-start], [data-facts]");
    if (start) await start.click();
    await page.waitForFunction(() => { const s = document.getElementById("tp-say"); return s && s.textContent.length > 0; }, null, { timeout: 8000 }).catch(() => {});
    // Let the fonts arrive and the panel refit before the first measurement.
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(80);
    const r = await page.evaluate(walk, url);
    tot.pages++;
    for (const x of r.out) {
      tot.steps++;
      let bad = false;
      if (x.body > 1) { tot.body++; bad = true; }
      if (x.stage > 1 || x.stageW > 1) { tot.stage++; bad = true; }
      if (x.doc > 1) { tot.doc++; bad = true; }
      if (x.rows > 1) { tot.rows++; bad = true; }
      if (x.cut) { tot.cut++; bad = true; }
      if (x.clipped) { tot.clipped++; bad = true; }
      if (x.sayPx < 15.99) { tot.small++; bad = true; }
      if (x.moved) { tot.moved++; bad = true; }
      if (x.fit4) tot.fit4++;
      if (x.folded) tot.folded++;
      if (bad) { tot.bad++; if (tot.samples.length < 8) tot.samples.push(x); }
    }
    for (const t of r.taps) {
      tot.taps++;
      if (t.verdict || !t.picked || !t.locked || !t.told || !t.stillFirst || !t.suggested) { tot.tapBad++; if (tapSamples.length < 6) tapSamples.push(t); }
    }
  }
  const { samples, ...rest } = tot;
  const ok = !tot.bad && !tot.tapBad && !pageErrors.length;
  if (!ok) failed = true;
  console.log(`${ok ? "ok  " : "FAIL"} ${w}x${h}`, JSON.stringify(rest), pageErrors.length ? "PAGE ERRORS: " + [...new Set(pageErrors)].slice(0, 3).join(" | ") : "");
  for (const s of samples) console.log("     ", JSON.stringify(s));
  for (const s of tapSamples) console.log("      tap", JSON.stringify(s));
  await page.close();
}
await browser.close();
server.close();
if (failed) { console.error("check-fit: something does not fit. See the samples above."); process.exit(1); }
console.log(`check-fit: every step of ${urls.length} pages fits at ${SIZES.map((s) => s.join("x")).join(", ")}.`);
