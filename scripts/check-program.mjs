// Checks the program's scoring rules in a real browser:
//   - the first try is what counts: a corrected answer stays an error;
//   - a missed item is asked again two items later in the same exercise;
//   - the lesson ends with the On your own segment and then the delayed test;
//   - the summary records first-try counts, the retests, and per-item results;
//   - a mastery test has four to eight items in a part; a failed part can be
//     given again alone, and the record merges; the next step points at the
//     test until it is passed.
//
//   node scripts/check-program.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch (e) {}
  try { return require(join(execSync("npm root -g").toString().trim(), "playwright")); } catch (e) {}
  console.error("check-program: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-program: build the site first (npm run build)."); process.exit(2); }
const { buildProgram } = require("../curriculum/index.js");
const program = buildProgram({ strict: true });

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

const fails = [];
function check(name, ok, detail) { console.log((ok ? "ok   " : "FAIL ") + name + (detail !== undefined ? "  " + detail : "")); if (!ok) fails.push(name); }

// ── The data ──
const sizes = {};
program.tests.forEach((t) => t.parts.forEach((p) => { sizes[p.items.length] = (sizes[p.items.length] || 0) + 1; }));
const parts = program.tests.flatMap((t) => t.parts);
check("most test parts have 4 to 8 items", parts.filter((p) => p.items.length >= 4 && p.items.length <= 8).length / parts.length > 0.85, JSON.stringify(sizes));
check("no part has more than 8 items", parts.every((p) => p.items.length <= 8));
check("a part of 5 or more allows one error, fewer allows none", parts.every((p) => p.allowed === (p.items.length >= 5 ? 1 : 0)));
check("remedy links open the exercise", parts.every((p) => p.remedy.every((r) => /#ex\d+$/.test(r.url))));
const withOwn = program.lessons.filter((l) => l.independent);
check("most lessons end with On your own", withOwn.length / program.lessons.length > 0.9, withOwn.length + " of " + program.lessons.length);
check("On your own has 3 to 8 items, each a touch", withOwn.every((l) => l.independent.steps.length >= 3 && l.independent.steps.length <= 8 && l.independent.steps.every((s) => /^\(Touches/.test(s.answer))));
check("every test step carries a signal", program.lessons.every((l) => l.exercises.every((e) => e.steps.every((s) => s.cue !== "test" || s.signal))));

// ── A lesson in the browser ──
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const visible = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && e.offsetParent !== null; }, sel);
const state = () => page.evaluate(() => ({ pos: window.mdRunner.pos(), segs: window.mdRunner.segments().map((s) => ({ kind: s.kind, n: s.steps.length, uids: s.steps.map((x) => x.uid) })), results: window.mdRunner.results() }));

// Kindergarten lesson 40 begins with a review exercise of test steps.
await page.goto(BASE + "/k/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(300);
const before = await state();
const n0 = before.segs[0].n;
await page.click("#btn-error"); // first item missed
await page.waitForTimeout(50);
check("the correction shows after Error", await visible("#tp-correct.is-active"));
check("Start over sits in the third slot during a correction", await visible("#btn-over"));
let st = await state();
check("the missed item is inserted two items later", st.segs[0].n === n0 + 1 && st.segs[0].uids[3] === "0:0:r1", JSON.stringify(st.segs[0].uids.slice(0, 5)));
await page.click("#btn-goon");
await page.click("#btn-firm"); // item 2
await page.click("#btn-firm"); // item 3
await page.waitForTimeout(50);
check("the retest step says it is asked again", /Asked again/.test(await page.textContent("#tp-test-note")));
await page.click("#btn-firm"); // the retest, now firm
st = await state();
check("the first try stays an error after a firm retest", st.results["0:0"].first === "error" && st.results["0:0"].last === "error" && st.results["0:0:r1"].first === "firm");
check("the rail hatches the exercise with the error", await page.evaluate(() => document.querySelector(".rn-rail__seg").classList.contains("has-errors")));

// Finish the rest, all firm. Look for On your own, then the delayed test.
let sawOwn = false, sawDelayed = false, ownNote = "";
for (let i = 0; i < 400; i++) {
  if (await visible("#runner-finish")) break;
  const cue = await page.textContent("#tp-cue");
  if (cue === "On your own") { sawOwn = true; ownNote = await page.textContent("#tp-test-note"); check("On your own hides the correction and confirmation", !(await visible("#tp-confirm")) && !(await visible("#tp-correct")), "once"); }
  if (/Missed items/.test(await page.textContent("#tp-ex-title"))) sawDelayed = true;
  const pick = (await visible("#btn-goon")) ? "#btn-goon" : (await visible("#btn-firm")) ? "#btn-firm" : "#btn-next";
  await page.click(pick);
}
check("the lesson reached On your own", sawOwn);
check("On your own tells the parent to read once and give no help", /Read the line once/.test(ownNote), ownNote);
check("the delayed test came after On your own", sawDelayed);
check("the lesson finished", await visible("#runner-finish"));
const rec = await page.evaluate(() => { const p = window.mathProgress.getActiveProfile(); const h = p.lessons["k-040"]; return { summary: h[h.length - 1], items: Object.keys(p.items || {}).length }; });
check("the summary counts the first try", rec.summary.errors === 1 && rec.summary.firstTry === true, JSON.stringify({ firm: rec.summary.firm, errors: rec.summary.errors }));
check("the summary counts the retest apart", rec.summary.retestFirm === 1 && rec.summary.retestErrors === 0);
check("the summary records On your own", rec.summary.independent && rec.summary.independent.firm + rec.summary.independent.errors >= 3, JSON.stringify(rec.summary.independent));
check("per-item results were recorded", rec.items > 5, String(rec.items));
check("the finish screen shows Asked again and On your own", /Asked again/.test(await page.textContent("#runner-finish")) && /On your own/.test(await page.textContent("#runner-finish")));

// ── A mastery test, one part failed, given again alone ──
const test = program.tests.find((t) => t.id === "k-test-04");
await page.goto(BASE + test.url, { waitUntil: "load" });
await page.waitForTimeout(300);
// Miss every item of part 2, pass the rest.
for (let i = 0; i < 200; i++) {
  if (await visible("#runner-finish")) break;
  const seg = (await state()).pos.seg;
  await page.click(seg === 1 ? "#btn-error" : "#btn-firm");
}
check("the test finished", await visible("#runner-finish"));
let fin = await page.textContent("#runner-finish");
check("one part needs reteaching", /1 part needs reteaching/.test(fin));
const again = await page.getAttribute(".action-bar a.btn--primary", "href");
check("the main action gives that part again", /\?parts=2$/.test(again || ""), again);
const remedyHref = await page.getAttribute("#runner-finish .finish__list a", "href");
check("the remedy link names an exercise", /#ex\d+/.test(remedyHref || ""), remedyHref);
let rt = await page.evaluate(() => { const p = window.mathProgress.getActiveProfile(); const h = p.tests["k-test-04"]; return h[h.length - 1]; });
check("the record holds every part, one failed", rt.parts.length === test.parts.length && rt.parts.filter((p) => !p.passed).length === 1 && rt.passed === false);
// Mark the next lesson finished by hand: the gate still points at the test.
const gate = await page.evaluate((lv) => { const P = window.mathProgress; P.setLessonStatus("k-041", "done"); const s = P.nextStep("k", lv.lessons, lv.tests, "k"); return s; }, program.summary.find((l) => l.id === "k"));
check("the next step is the test until it is passed", gate.test === true && /test-04/.test(gate.url), JSON.stringify(gate));
// The remedy opens the exercise.
await page.goto(BASE + remedyHref, { waitUntil: "load" });
await page.waitForTimeout(300);
const exN = Number(/#ex(\d+)/.exec(remedyHref)[1]);
check("the remedy link opens that exercise", (await state()).pos.seg === exN - 1, JSON.stringify((await state()).pos));
// Give part 2 again and pass it.
await page.goto(BASE + again, { waitUntil: "load" });
await page.waitForTimeout(300);
st = await state();
check("only the failed part is given", st.segs.length === 1, String(st.segs.length));
check("the strip says the part is given again", /again/.test(await page.textContent("#rn-where")), await page.textContent("#rn-where"));
for (let i = 0; i < 50; i++) { if (await visible("#runner-finish")) break; await page.click("#btn-firm"); }
rt = await page.evaluate(() => { const p = window.mathProgress.getActiveProfile(); const h = p.tests["k-test-04"]; return h[h.length - 1]; });
check("the record merges the retaken part and passes", rt.parts.length === test.parts.length && rt.passed === true && rt.retested && rt.retested.length === 1, JSON.stringify({ passed: rt.passed, retested: rt.retested }));
fin = await page.textContent("#runner-finish");
check("the finish screen says every part was passed", /Every part was passed/.test(fin));
const gate2 = await page.evaluate((lv) => window.mathProgress.nextStep("k", lv.lessons, lv.tests, "k"), program.summary.find((l) => l.id === "k"));
check("the next step moves on once the test is passed", gate2.test === false, JSON.stringify(gate2));

check("no page errors", !errors.length, errors.join(" | "));
await browser.close();
server.close();
if (fails.length) { console.error("check-program: " + fails.length + " check(s) failed."); process.exit(1); }
console.log("check-program: first-try scoring, retests, On your own, and the mastery test gate all hold.");
