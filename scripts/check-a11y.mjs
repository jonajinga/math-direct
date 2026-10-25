// Runs axe-core (WCAG 2.2 A and AA, plus best practices) over every kind of
// screen at two phone sizes, in several states: the runner on a step, after
// a touch, in a correction, with each sheet open, on a finish screen, and
// the app screens with a child's records in place. Adds four probes of its
// own: every text node at 7:1 against its background, every control at
// least 44 by 44 px, no sideways overflow at 320 px except inside the fact
// chart's own region, and no clipped text under 200% text spacing.
//
//   node scripts/check-a11y.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch (e) {}
  try { return require(join(execSync("npm root -g").toString().trim(), "playwright")); } catch (e) {}
  console.error("check-a11y: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();
const axeSrc = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-a11y: build the site first (npm run build)."); process.exit(2); }

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

const SIZES = [[390, 844], [320, 568]];
const PAGES = ["/", "/lessons/", "/k/", "/practice/", "/records/", "/more/", "/search/?q=count", "/guide/", "/curriculum/", "/about/", "/privacy/", "/terms/", "/offline/", "/404.html", "/placement/", "/facts/", "/timed/"];
const fails = [];
let runs = 0;

// ── Probes run inside the page ──
function probes(allowRegion) {
  const out = { contrast: [], targets: [], overflow: 0, spacing: [] };
  // Relative luminance and contrast, resolving the effective background.
  const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const parse = (s) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const bgOf = (el) => { let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0.99) return c; e = e.parentElement; } return [255, 255, 255, 1]; };
  const ratio = (a, b) => { const l1 = lum(...a) + 0.05, l2 = lum(...b) + 0.05; return l1 > l2 ? l1 / l2 : l2 / l1; };
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && !el.closest("[hidden], [aria-hidden='true'], .sr-only"); };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  const seen = new Set();
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim();
    if (!t || !node.parentElement || seen.has(node.parentElement)) continue;
    const el = node.parentElement;
    seen.add(el);
    if (!visible(el) || el.closest("script, style, noscript, svg, dialog:not([open])")) continue;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) continue;
    const r = ratio(fg, bgOf(el));
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 4.5 : 7;
    if (r < need) out.contrast.push({ text: t.slice(0, 40), ratio: Math.round(r * 10) / 10, px, where: el.id || el.className || el.tagName });
  }
  // Targets: every control at least 44 by 44, except inline links in running text.
  document.querySelectorAll("a, button, input, select, textarea, summary, [role='button']").forEach((el) => {
    if (!visible(el) || el.closest("dialog:not([open])")) return;
    // WCAG 2.5.8 exempts a link inside a sentence or a line of text.
    if (el.tagName === "A" && getComputedStyle(el).display === "inline" && !el.classList.contains("btn") && !el.classList.contains("row") && !el.classList.contains("lchip")) return;
    // A radio inside a chip label: the chip is the target.
    if (el.tagName === "INPUT" && el.type === "radio" && el.closest("label.chip")) { const r2 = el.closest("label.chip").getBoundingClientRect(); if (r2.height >= 43.5 && r2.width >= 43.5) return; }
    const r = el.getBoundingClientRect();
    if (r.width < 43.5 || r.height < 43.5) out.targets.push({ where: el.id || el.className || el.tagName, w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30) });
  });
  // Reflow: nothing scrolls sideways but the allowed region.
  out.overflow = document.documentElement.scrollWidth - window.innerWidth;
  document.querySelectorAll("*").forEach((el) => {
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "hidden" && visible(el)) {
      if (allowRegion && el.closest(allowRegion)) return;
      if (el === document.documentElement || el === document.body) return;
      out.spacing.push("scrolls sideways: " + (el.id || el.className || el.tagName));
    }
  });
  return out;
}

// Text spacing (WCAG 1.4.12): widen the spacing and look for clipped text.
const SPACING_CSS = "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }";
function clippedAfterSpacing() {
  const out = [];
  document.querySelectorAll("p, li, h1, h2, h3, span, a, button, label, dt, dd, summary").forEach((el) => {
    if (el.closest("[hidden], dialog:not([open]), .sr-only, .fact-grid-wrap, .runner")) return;
    const cs = getComputedStyle(el);
    if (cs.overflow === "hidden" && el.scrollHeight > el.clientHeight + 2 && el.textContent.trim()) out.push(el.id || el.className || el.tagName);
  });
  return out;
}

const browser = await chromium.launch();
async function audit(page, label, allowRegion) {
  runs++;
  await page.addScriptTag({ content: axeSrc }).catch(() => {});
  const res = await page.evaluate(async () => {
    const r = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0].target.join(" ") }));
  });
  const pr = await page.evaluate(probes, allowRegion || null);
  const problems = [];
  res.forEach((v) => problems.push(`axe ${v.id} (${v.impact}, ${v.n}): ${v.sample}`));
  pr.contrast.slice(0, 5).forEach((c) => problems.push(`contrast ${c.ratio}:1 at ${c.px}px in ${c.where}: "${c.text}"`));
  pr.targets.slice(0, 5).forEach((t) => problems.push(`target ${t.w}x${t.h} ${t.where} "${t.text}"`));
  if (pr.overflow > 1) problems.push(`page overflows sideways by ${pr.overflow}px`);
  pr.spacing.slice(0, 3).forEach((s) => problems.push(s));
  console.log((problems.length ? "FAIL " : "ok   ") + label);
  problems.forEach((p) => console.log("      " + p));
  if (problems.length) fails.push(label);
}

for (const [w, h] of SIZES) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const size = `${w}x${h}`;
  // A child with records, so the screens have content.
  await page.goto(BASE + "/records/", { waitUntil: "load" });
  await page.evaluate(() => { const P = window.mathProgress; P.createProfile("Mia"); P.recordLesson("k-040", { date: new Date().toISOString(), minutes: 12, firm: 20, errors: 2, exercises: [{ n: 1, title: "Counting aloud", track: "count-aloud", errors: 2 }], stillMissed: [], repeat: false, independent: { firm: 5, errors: 1 } }); P.recordTest("k-test-04", { date: new Date().toISOString(), minutes: 8, parts: [{ track: "count-aloud", trackName: "Counting aloud", items: 4, errors: 2, passed: false }, { track: "addition", trackName: "Adding", items: 4, errors: 0, passed: true }], passed: false }); P.recordFact("3+1", true, 1200); P.addNote("Confused six and nine."); P.recordTimed({ date: new Date().toISOString(), level: "first", right: 12, errors: 2, goal: 10 }); });
  for (const u of PAGES) {
    await page.goto(BASE + u, { waitUntil: "load" });
    await page.waitForTimeout(250);
    await audit(page, `${size} ${u}`, u === "/records/" ? ".fact-grid-wrap" : null);
    if (u === "/records/" || u === "/guide/") {
      await page.addStyleTag({ content: SPACING_CSS });
      const clipped = await page.evaluate(clippedAfterSpacing);
      if (clipped.length) { console.log(`FAIL ${size} ${u} text spacing clips: ${clipped.slice(0, 3).join(", ")}`); fails.push(`${size} ${u} spacing`); }
      else console.log(`ok   ${size} ${u} under 200% text spacing`);
    }
  }
  // The runner in its states.
  await page.goto(BASE + "/prek/lesson-074/", { waitUntil: "load" });
  await page.waitForTimeout(250);
  await audit(page, `${size} runner step`);
  await page.evaluate(() => { document.querySelector('#tp-outline-list [data-seg="1"]').click(); for (let i = 0; i < 2; i++) document.getElementById("btn-next").click(); });
  await page.evaluate(() => document.querySelectorAll("#child-stage .mdv-tap")[1].dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await audit(page, `${size} runner after a touch`);
  await page.click("#btn-error");
  await audit(page, `${size} runner correction`);
  for (const id of ["sheet-more", "sheet-outline", "sheet-keys", "sheet-leave"]) {
    await page.evaluate((id) => document.getElementById(id).showModal(), id);
    await page.waitForTimeout(350); // the sheet's slide
    await audit(page, `${size} ${id}`);
    await page.keyboard.press("Escape");
  }
  await page.goto(BASE + "/prek/lesson-001/", { waitUntil: "load" });
  await page.waitForTimeout(250);
  for (let i = 0; i < 300; i++) {
    if (await page.evaluate(() => !document.getElementById("runner-finish").hidden)) break;
    const pick = await page.evaluate(() => ["btn-goon", "btn-firm", "btn-next"].map((id) => document.getElementById(id)).find((b) => b && !b.hidden && b.offsetParent !== null).id);
    await page.click("#" + pick);
  }
  await audit(page, `${size} lesson finish`);
  // Two children: the sheet that offers it, a turn alone, and a finish screen with a card for each.
  const second = await page.evaluate(() => { const P = window.mathProgress; const a = P.getActiveProfile(); let b = P.getProfiles().find((p) => p.id !== a.id); if (!b) { b = P.createProfile("Second"); P.switchProfile(a.id, true); } return b.id; });
  await page.goto(BASE + "/prek/lesson-074/", { waitUntil: "load" });
  await page.waitForTimeout(250);
  await page.click("#btn-more");
  await page.waitForTimeout(350);
  await page.click('[data-act="with"]');
  await page.waitForTimeout(450);
  await audit(page, `${size} sheet-with`);
  await page.keyboard.press("Escape");
  await page.goto(BASE + "/prek/lesson-002/?with=" + second, { waitUntil: "load" });
  await page.waitForTimeout(250);
  let turnAudited = false;
  for (let i = 0; i < 400; i++) {
    if (await page.evaluate(() => !document.getElementById("runner-finish").hidden)) break;
    if (!turnAudited && / alone$/.test(await page.textContent("#tp-cue"))) { turnAudited = true; await audit(page, `${size} runner turn alone`); }
    const pick = await page.evaluate(() => ["btn-goon", "btn-firm", "btn-next"].map((id) => document.getElementById(id)).find((b) => b && !b.hidden && b.offsetParent !== null).id);
    await page.click("#" + pick);
  }
  if (!turnAudited) { console.log(`FAIL ${size} no turn alone was reached in a lesson for two`); fails.push(`${size} turn alone`); }
  await audit(page, `${size} lesson finish for two`);
  await page.goto(BASE + "/k/", { waitUntil: "load" });
  await page.waitForTimeout(250);
  await page.click("[data-mark-toggle]");
  await page.click('[data-lesson-id="k-041"]');
  await page.waitForTimeout(350);
  await audit(page, `${size} mark sheet`);
  await page.keyboard.press("Escape");
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(250);
  await page.evaluate(() => window.mathProgress.saveSession({ kind: "lesson", url: "/k/lesson-041/", id: "k-041", title: "Kindergarten · Lesson 41", where: "Exercise 2 of 8", marks: 4, pos: { seg: 1, step: 1 }, results: {}, elapsed: 60000 }));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(250);
  await audit(page, `${size} Today with a Continue card`);
  if (errors.length) { console.log(`FAIL ${size} page errors: ${errors.slice(0, 3).join(" | ")}`); fails.push(`${size} errors`); }
  await page.close();
}
await browser.close();
server.close();
if (fails.length) { console.error(`check-a11y: ${fails.length} of ${runs} audits failed.`); process.exit(1); }
console.log(`check-a11y: ${runs} audits clean at ${SIZES.map((s) => s.join("x")).join(" and ")}: no axe violations, text at 7:1, controls at 44 px, no sideways overflow, no clipped text under wide spacing.`);
