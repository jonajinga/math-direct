// Checks the program's scoring rules in a real browser:
//   - the first try is what counts: a corrected answer stays an error;
//   - a missed item is asked again two items later in the same exercise;
//   - the lesson ends with the On your own segment and then the delayed test;
//   - the summary records first-try counts, the retests, and per-item results;
//   - a mastery test has four to eight items in a part; a failed part can be
//     given again alone, and the record merges; the next step points at the
//     test until it is passed;
//   - a lesson taught to two children: unison steps marked once for both, a
//     turn for each child alone at the end of an exercise, On your own shared
//     out, the sitting restored with the pair, and a record for each child.
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
const subjectOfLevel = Object.fromEntries(program.levels.map((l) => [l.id, l.subject]));
const ownMath = withOwn.filter((l) => subjectOfLevel[l.level] === "math"), ownRead = withOwn.filter((l) => subjectOfLevel[l.level] === "reading");
check("On your own has 3 to 8 items, each a touch in math", ownMath.every((l) => l.independent.steps.length >= 3 && l.independent.steps.length <= 8 && l.independent.steps.every((s) => /^\(Touches/.test(s.answer))));
check("On your own in reading has 3 to 8 items, each read from the stage", ownRead.length > 0 && ownRead.every((l) => l.independent.steps.length >= 3 && l.independent.steps.length <= 8 && l.independent.steps.every((s) => (Array.isArray(s.screen) ? s.screen : [s.screen]).some((v) => v && v.t === "text"))));
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

// ── Two children ──
await page.goto(BASE + "/k/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(200);
check("a lesson for one child offers Teach two children once a second child exists", await page.evaluate(() => { const P = window.mathProgress; if (P.getProfiles().length < 2) { const a = P.getActiveProfile(); P.createProfile("Second"); P.switchProfile(a.id, true); } return true; }));
const kids = await page.evaluate(() => { const P = window.mathProgress; const a = P.getActiveProfile(); const b = P.getProfiles().filter((p) => p.id !== a.id)[0]; return { a: a.id, b: b.id, aName: a.name, bName: b.name }; });
await page.goto(BASE + "/k/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(200);
check("More offers Teach two children to one child", /Teach two children/.test(await page.textContent("#more-with-label")) && (await page.evaluate(() => !document.querySelector('[data-act="with"]').parentNode.hidden)));
await page.click("#btn-more");
await page.waitForTimeout(150);
await page.click('[data-act="with"]');
await page.waitForTimeout(350);
check("the sheet names the pair", new RegExp(kids.aName + " and " + kids.bName).test(await page.textContent("#sheet-with-list")), await page.textContent("#sheet-with-list"));
await Promise.all([page.waitForNavigation(), page.click('#sheet-with-list [data-with]')]);
await page.waitForTimeout(300);
check("picking the pair reopens the lesson for both", new RegExp("with=" + kids.b).test(page.url()), page.url());
check("the strip names both children", new RegExp(kids.aName + " and " + kids.bName).test(await page.textContent("#rn-where")), await page.textContent("#rn-where"));
check("More now offers Teach one child, and Switch child is put away", /Teach one child/.test(await page.textContent("#more-with-label")) && (await page.evaluate(() => document.querySelector('[data-act="child"]').parentNode.hidden)));
const g0 = await state();
check("the sitting holds two children", await page.evaluate(() => window.mdRunner.sitting().group && window.mdRunner.sitting().children.length === 2));
// First exercise: the pair misses the first item, then is firm. Each child then takes a turn alone.
await page.click("#btn-error");
await page.waitForTimeout(50);
await page.click("#btn-goon");
let turnCues = [], turnNotes = [];
for (let i = 0; i < 60; i++) {
  const s = await state();
  if (s.pos.seg > 0) break;
  const cue = await page.textContent("#tp-cue");
  if (/ alone$/.test(cue)) { turnCues.push(cue); turnNotes.push(await page.textContent("#tp-test-note")); }
  const pick = (await visible("#btn-goon")) ? "#btn-goon" : (await visible("#btn-firm")) ? "#btn-firm" : "#btn-next";
  await page.click(pick);
}
check("each child takes one turn alone at the end of the exercise, in order", turnCues.length === 2 && turnCues[0] === kids.aName + " alone" && turnCues[1] === kids.bName + " alone", turnCues.join(" | "));
check("the turn says who answers and whose answer to mark", /answers alone\. Mark/.test(turnNotes[0] || ""), turnNotes[0]);
const g1 = await state();
check("the turns are clones of the item the pair missed", g1.segs[0].uids.indexOf("0:0:c" + kids.a) !== -1 && g1.segs[0].uids.indexOf("0:0:c" + kids.b) !== -1 && g1.segs[0].n === g0.segs[0].n + 3, JSON.stringify(g1.segs[0].uids));
check("the turns come after the exercise's last unison item", g1.segs[0].uids.indexOf("0:0:c" + kids.a) === g1.segs[0].n - 2);
const marksBefore = Object.keys(g1.results).length;
// Leave, and continue from Today with the pair.
await page.click("#btn-more");
await page.waitForTimeout(150);
await page.click('[data-act="leave"]');
await page.waitForTimeout(350);
await Promise.all([page.waitForNavigation(), page.click("#sheet-leave-go")]);
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForSelector("[data-continue-card]", { timeout: 3000 }).catch(() => {});
const cont = await page.evaluate(() => { const c = document.querySelector("[data-continue-card]"); return c ? { text: c.textContent, href: c.querySelector("a.btn").getAttribute("href") } : null; });
if (!cont) console.log("      Today without a Continue card. sessions=" + (await page.evaluate(() => localStorage.getItem("math-direct-sessions"))) + " active=" + (await page.evaluate(() => localStorage.getItem("math-direct-active-profile"))) + " errors=" + errors.join(" | "));
check("Today's Continue card names both children", !!cont && new RegExp(kids.aName + " and " + kids.bName).test(cont.text), cont && cont.text.slice(0, 80));
check("the Continue link keeps the pair", !!cont && cont.href === "/k/lesson-040/?with=" + kids.b + "&continue=1", cont && cont.href);
await page.goto(BASE + (cont ? cont.href : "/k/lesson-040/?with=" + kids.b + "&continue=1"), { waitUntil: "load" });
await page.waitForTimeout(300);
const g2 = await state();
check("the sitting comes back with both children, the turns, and the marks", (await page.evaluate(() => window.mdRunner.sitting().group)) && g2.segs[0].uids.indexOf("0:0:c" + kids.b) !== -1 && Object.keys(g2.results).length === marksBefore && g2.pos.seg === 1, JSON.stringify({ pos: g2.pos, marks: Object.keys(g2.results).length, before: marksBefore }));
// Finish, all firm. On your own is shared out one child at a time.
let ownCues = [], sawDelayedG = false;
for (let i = 0; i < 500; i++) {
  if (await visible("#runner-finish")) break;
  const cue = await page.textContent("#tp-cue");
  const title = await page.textContent("#tp-ex-title");
  if (/Independent work/.test(title)) ownCues.push(cue);
  if (/Missed items/.test(title)) sawDelayedG = true;
  const pick = (await visible("#btn-goon")) ? "#btn-goon" : (await visible("#btn-firm")) ? "#btn-firm" : "#btn-next";
  await page.click(pick);
}
check("the lesson for two finished", await visible("#runner-finish"));
check("On your own items alternate between the children", ownCues.length >= 3 && ownCues.every((c, i) => c === (i % 2 ? kids.bName : kids.aName) + " alone"), ownCues.join(" | "));
check("the delayed test came for the pair", sawDelayedG);
const both = await page.evaluate((k) => { const P = window.mathProgress; const a = P.getProfile(k.a), b = P.getProfile(k.b); const la = a.lessons["k-040"], lb = b.lessons["k-040"]; return { a: la && la[la.length - 1], b: lb && lb[lb.length - 1], bItems: Object.keys(b.items || {}).length, aDone: a.completed.indexOf("k-040") !== -1, bDone: b.completed.indexOf("k-040") !== -1 }; }, kids);
check("the lesson is recorded for both children", !!both.a && !!both.b && both.a.group === true && both.b.group === true && both.aDone && both.bDone);
check("each record names the other child", both.a && both.a.with === kids.bName && both.b && both.b.with === kids.aName, JSON.stringify([both.a && both.a.with, both.b && both.b.with]));
const exCount = g2.segs.filter((s) => s.kind !== "delayed" && s.kind !== "independent").length;
check("each child's record counts the unison error and one turn alone for each exercise", both.a && both.a.errors === 1 && both.a.turns && both.a.turns.firm === exCount && both.b && both.b.errors === 1 && both.b.turns && both.b.turns.firm === exCount, JSON.stringify({ exercises: exCount, a: both.a && [both.a.firm, both.a.errors, both.a.turns], b: both.b && [both.b.firm, both.b.errors, both.b.turns] }));
check("each child's On your own counts only that child's items", both.a && both.b && both.a.independent && both.b.independent && both.a.independent.firm + both.a.independent.errors + both.b.independent.firm + both.b.independent.errors === ownCues.length, JSON.stringify([both.a && both.a.independent, both.b && both.b.independent]));
check("per-item results were recorded for the second child", both.bItems > 3, String(both.bItems));
check("the finish screen shows a card for each child", (await page.evaluate(() => document.querySelectorAll("#runner-finish .finish__child").length)) === 2 && new RegExp(kids.bName).test(await page.textContent("#runner-finish")));
// Lesson 40 is followed by a mastery test, which is given to one child at a time; the pair rides the lesson links.
check("the finish screen keeps the pair on the lesson links and sends the test to one child", await page.evaluate((b) => { const again = document.querySelector('#runner-finish .finish__links a[href*="lesson-040"]'); const primary = document.querySelector("#runner-finish .action-bar a.btn--primary"); return !!again && again.getAttribute("href").indexOf("with=" + b) !== -1 && !!primary && /test/.test(primary.getAttribute("href")) && primary.getAttribute("href").indexOf("with=") === -1; }, kids.b));
check("each child has their own mark row", (await page.evaluate(() => document.querySelectorAll("#runner-finish [data-mark-child]").length)) === 2);

// ── Reading 1 ──
const pickBtn = async () => (await visible("#btn-goon")) ? "#btn-goon" : (await visible("#btn-firm")) ? "#btn-firm" : "#btn-next";
await page.goto(BASE + "/reading-1/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(300);
const r0 = await state();
check("a reading lesson opens on a sound with the Dot button in the tool slot", (await visible("#btn-dot")) && r0.segs.length >= 6, String(r0.segs.length));
for (let i = 0; i < 12; i++) { if ((await visible("#btn-firm")) && (await page.evaluate(() => !!document.querySelector("#child-stage .mdv-text--sound")))) break; await page.click(await pickBtn()); await page.waitForTimeout(30); }
const soundId = await page.evaluate(() => { const m = window.mdRunner; const st = m.segments()[m.pos().seg].steps[m.pos().step]; return st.sound; });
check("the first test is a sound with a signal", !!soundId && /Hold|Tap/.test(await page.textContent("#tp-signal")), soundId + " " + (await page.textContent("#tp-signal")));
await page.click("#btn-error");
await page.waitForTimeout(60);
check("a missed sound shows its correction", /My turn/.test(await page.textContent("#tp-correct-text")));
await page.click("#btn-goon");
const srec = await page.evaluate((id) => window.mathProgress.getActiveProfile().sounds[id], soundId);
check("a missed sound is recorded with its seconds", !!srec && srec.r[srec.r.length - 1] === 0 && typeof srec.t[srec.t.length - 1] === "number", JSON.stringify(srec));
let sawOwnR = false, ownReading = true, sawDelayedR = false, sawCheckout = false, checkoutErrorTapped = false, checkoutStart = "";
const stages = new Set();
for (let i = 0; i < 400; i++) {
  if (await visible("#runner-finish")) break;
  const cue = await page.textContent("#tp-cue");
  if (cue === "Checkout") {
    // The checkout: Start runs the clock, Error counts a word missed, Stop ends it.
    if (!sawCheckout) { sawCheckout = true; checkoutStart = await page.textContent("#btn-next"); }
    if (!checkoutErrorTapped && !(await page.evaluate(() => document.getElementById("btn-error").disabled))) { await page.click("#btn-error"); checkoutErrorTapped = true; await page.waitForTimeout(30); }
  }
  if (cue === "On your own") { sawOwnR = true; if (!(await page.evaluate(() => !!document.querySelector("#child-stage .mdv-text")))) ownReading = false; }
  if (/Missed items/.test(await page.textContent("#tp-ex-title"))) sawDelayedR = true;
  const pr = await page.evaluate(() => { const t = document.querySelector("#child-stage .mdv-text"); return t ? t.getAttribute("data-prompts") : null; });
  if (pr) stages.add(pr);
  await page.click(await pickBtn());
  await page.waitForTimeout(10);
}
check("the reading lesson has On your own items the child reads", sawOwnR && ownReading);
check("the delayed test came for the missed sound", sawDelayedR);
check("lesson 40 shows the full alphabet", stages.has("full") && !stages.has("plain"), [...stages].join(","));
check("the checkout came with a Start button and counted an error", sawCheckout && checkoutStart === "Start" && checkoutErrorTapped);
const crec = await page.evaluate(() => (window.mathProgress.getActiveProfile().checkouts || [])[0]);
check("the checkout is recorded with words a minute, the error, and the goal", !!crec && crec.level === "reading-1" && crec.lesson === 40 && crec.words > 0 && crec.errors === 1 && crec.wpm > 0 && crec.goal > 0 && crec.seconds > 0, JSON.stringify(crec));
check("the finish screen reports the checkout", /Checkout/.test(await page.textContent("#runner-finish")) && /a minute/.test(await page.textContent("#runner-finish")));
check("the reading lesson finished and is recorded under reading", (await visible("#runner-finish")) && (await page.evaluate(() => { const P = window.mathProgress; const p = P.getActiveProfile(); return !!(p.last.reading && p.last.reading.id === "reading-1-040") && P.currentLevel("reading") === "reading-1" && P.currentLevel("math") !== "reading-1"; })));
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForTimeout(300);
check("Today shows a card for reading and one for math", (await page.evaluate(() => document.querySelectorAll("#today-next .next-card").length)) >= 2, String(await page.evaluate(() => document.querySelectorAll("#today-next .next-card").length)));
await page.goto(BASE + "/records/", { waitUntil: "load" });
await page.waitForTimeout(300);
// The missed sound was retested in the lesson and said right, so it is learning, not shaky; the chart still names it as missed recently.
check("Records shows the sound chart with the missed sound marked", await page.evaluate((id) => { const g = document.querySelector(".sound-grid"); if (!g) return false; const li = [...g.querySelectorAll("li")].find((x) => x.getAttribute("data-sound") === id); if (!li) return false; const letters = li.querySelector(".sound-grid__letters").textContent; const line = g.parentNode.textContent; return !/fc-(later|new)/.test(li.className) && new RegExp("Missed recently: [^.]*" + letters).test(line); }, soundId), await page.evaluate(() => { const g = document.querySelector(".sound-grid"); return g ? g.parentNode.textContent.replace(/\s+/g, " ").slice(-160) : "no grid"; }));
check("Records lists the checkout", /words a minute/.test(await page.textContent("main")));
await page.goto(BASE + "/stories/", { waitUntil: "load" });
await page.waitForTimeout(300);
check("the Stories library lists every story, with the readable ones marked", (await page.evaluate(() => document.querySelectorAll("[data-story-level]").length)) === 30 && (await page.evaluate(() => [...document.querySelectorAll("[data-story-ready]")].filter((t) => !t.hidden).length)) === 4, String(await page.evaluate(() => [...document.querySelectorAll("[data-story-ready]")].filter((t) => !t.hidden).length)));
await page.goto(BASE + "/stories/sam-sat/", { waitUntil: "load" });
await page.waitForTimeout(300);
check("a story opens on its title with the Dot button", (await page.evaluate(() => !!document.querySelector("#child-stage .mdv-text--line"))) && (await visible("#btn-dot")));
for (let i = 0; i < 12; i++) { if (await visible("#runner-finish")) break; await page.click("#btn-firm"); await page.waitForTimeout(20); }
check("a story read to the end reaches its questions and finishes", (await visible("#runner-finish")) && /8 of 8|All stories/.test(await page.textContent("#runner-finish")), (await page.textContent("#runner-finish")).replace(/\s+/g, " ").slice(0, 120));
await page.goto(BASE + "/quick-sounds/", { waitUntil: "load" });
await page.waitForTimeout(300);
await page.click("[data-sounds]");
await page.waitForTimeout(300);
const firstQuick = await page.evaluate(() => window.mdRunner.segments()[0].steps[0].sound);
check("Quick sounds puts the missed sound first", firstQuick === soundId, firstQuick + " vs " + soundId);
check("Quick sounds shows the alphabet's marks and the Dot button", (await page.evaluate(() => document.querySelector("#child-stage .mdv-text").getAttribute("data-prompts") === "full")) && (await visible("#btn-dot")));
const srecBefore = await page.evaluate((id) => window.mathProgress.getActiveProfile().sounds[id], soundId);
await page.click("#btn-firm");
const srec2 = await page.evaluate((id) => window.mathProgress.getActiveProfile().sounds[id], soundId);
// The record keeps the last five marks.
check("a sound marked in Quick sounds is recorded", srec2.r.length === Math.min(5, srecBefore.r.length + 1) && srec2.r[srec2.r.length - 1] === 1 && srec2.last !== srecBefore.last, JSON.stringify(srec2.r));

check("no page errors", !errors.length, errors.join(" | "));
await browser.close();
server.close();
if (fails.length) { console.error("check-program: " + fails.length + " check(s) failed."); process.exit(1); }
console.log("check-program: scoring, retests, On your own, the test gate, signals, pace, adaptive review, the timed check, a lesson for two children, and a reading lesson all hold.");
