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

// ── Signals, pace, missed-last-time, the timed check, readiness ──
check("every placement section has three items a track or more", program.placement.every((s) => s.readiness || s.items.length >= 6), program.placement.map((s) => s.items.length).join(","));
check("the placement test begins with a readiness section", program.placement[0].readiness === true && program.placement[0].items.length === 3);
check("firming fades: most firming exercises carry a lead", program.lessons.flatMap((l) => l.exercises.filter((e) => e.kind === "firm")).filter((e) => e.steps.some((s) => s.cue === "lead")).length > 400);
check("review exercises carry spare items", program.lessons.flatMap((l) => l.exercises.filter((e) => e.kind !== "new")).filter((e) => e.spare && e.spare.length).length > 2000);
check("First Grade facts are released in sets", program.facts.first.some((f) => f.set === 2));
await page.goto(BASE + "/k/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(300);
check("a test step shows its signal", await visible("#tp-signal") && /Touch|Drop|Rhythm|Watch/.test(await page.textContent("#tp-signal")), await page.textContent("#tp-signal"));
// Finish the lesson to record its pace.
for (let i = 0; i < 400; i++) {
  if (await visible("#runner-finish")) break;
  const pick = (await visible("#btn-goon")) ? "#btn-goon" : (await visible("#btn-firm")) ? "#btn-firm" : "#btn-next";
  await page.click(pick);
}
const paced = await page.evaluate(() => { const h = window.mathProgress.getActiveProfile().lessons["k-040"]; return h[h.length - 1]; });
check("the summary records a pace", typeof paced.pace === "number" && paced.pace > 0, String(paced.pace));
// Adaptive review: mark an item missed in two sittings, then see it come first with a note.
const swap = await page.evaluate(() => {
  const P = window.mathProgress;
  const p = P.getActiveProfile();
  // The first review exercise of lesson 41 and one of its spare items.
  return null;
});
await page.goto(BASE + "/k/lesson-041/", { waitUntil: "load" });
await page.waitForTimeout(300);
const ex = await page.evaluate(() => { const segs = window.mdRunner.segments(); const i = segs.findIndex((s) => s.kind !== "new" && s.steps.some((st) => st.item)); const seg = segs[i]; return { i, items: seg.steps.filter((st) => st.cue === "test").map((st) => st.item) }; });
await page.evaluate((ex) => { const P = window.mathProgress; const items = {}; items[ex.items[ex.items.length - 1]] = { first: false, last: false }; P.recordItems(items); P.recordItems(items); }, ex);
await page.goto(BASE + "/k/lesson-041/", { waitUntil: "load" });
await page.waitForTimeout(300);
const after = await page.evaluate((i) => { const seg = window.mdRunner.segments()[i]; const tests = seg.steps.filter((st) => st.cue === "test"); return tests.map((st) => ({ item: st.item, note: !!st.missedNote })); }, ex.i);
const target = ex.items[ex.items.length - 1];
const firstPlain = after.findIndex((x) => !x.note);
const lastNoted = after.map((x) => x.note).lastIndexOf(true);
check("items missed recently come first in their review exercise, with a note", after.some((x) => x.item === target && x.note) && (firstPlain === -1 || lastNoted < firstPlain), JSON.stringify({ was: ex.items, now: after }));
await page.evaluate(() => window.mathProgress.clearSession());
// The timed check.
await page.evaluate(() => window.mathProgress.setLessonStatus("first-003", "done"));
await page.goto(BASE + "/practice/", { waitUntil: "load" });
await page.waitForTimeout(200);
check("Practice offers the timed check once the child is in First Grade", await visible("[data-timed-row]"));
await page.goto(BASE + "/timed/", { waitUntil: "load" });
await page.waitForTimeout(300);
await page.click("[data-start-timed]");
await page.waitForTimeout(200);
check("the timed check runs with a clock in the strip", /s left/.test(await page.textContent("#rn-where")), await page.textContent("#rn-where"));
for (let i = 0; i < 12; i++) { await page.click(i % 4 === 3 ? "#btn-error" : "#btn-firm"); await page.waitForTimeout(30); }
await page.evaluate(() => { /* end the minute now */ window.dispatchEvent(new Event("md-end-timed")); });
await page.waitForFunction(() => !document.getElementById("runner-finish").hidden, null, { timeout: 70000 }).catch(() => {});
const timedRec = await page.evaluate(() => { const t = window.mathProgress.getActiveProfile().timed; return t[t.length - 1]; });
check("the timed check records facts right, errors, and a goal", timedRec && timedRec.right === 9 && timedRec.errors === 3 && timedRec.goal >= 8, JSON.stringify(timedRec));
const factRec = await page.evaluate(() => { const f = window.mathProgress.getActiveProfile().facts; const k = Object.keys(f)[0]; return f[k]; });
check("facts record a response time", factRec && factRec.t && typeof factRec.t[factRec.t.length - 1] === "number", JSON.stringify(factRec));

check("no page errors", !errors.length, errors.join(" | "));
await browser.close();
server.close();
if (fails.length) { console.error("check-program: " + fails.length + " check(s) failed."); process.exit(1); }
console.log("check-program: scoring, retests, On your own, the test gate, signals, pace, adaptive review, and the timed check all hold.");
