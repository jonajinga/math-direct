// The records store across versions and apps:
//   - a version 4 profile (one placement, one last lesson) is read as version
//     5 (a placement and a last lesson for each subject) without loss;
//   - a Teach Direct backup loads and merges by name;
//   - an Open Phonics backup (finished lessons as numbers 1 to 150) loads as
//     Reading 1 and Reading 2 lessons.
//
//   node scripts/check-import.mjs
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, statSync, mkdtempSync } from "node:fs";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch (e) {}
  try { return require(join(execSync("npm root -g").toString().trim(), "playwright")); } catch (e) {}
  console.error("check-import: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-import: build the site first (npm run build)."); process.exit(2); }

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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const dir = mkdtempSync(join(tmpdir(), "check-import-"));

// ── A version 4 profile is read as version 5 ──
await page.goto(BASE + "/more/", { waitUntil: "load" });
await page.evaluate(() => {
  const v4 = [{ id: "v4child", name: "Mia", completed: ["k-001", "k-002"], redo: [], lessons: { "k-002": [{ date: "2026-10-01T10:00:00.000Z", minutes: 12, firm: 30, errors: 2, exercises: [], stillMissed: [], repeat: false }] }, tests: {}, facts: {}, items: {}, timed: [], notes: [], placement: { level: "k", lesson: 1, url: "/k/lesson-001/", label: "Kindergarten, Lesson 1", date: "2026-09-30T10:00:00.000Z" }, lastLesson: { id: "k-002", date: "2026-10-01T10:00:00.000Z" } }];
  localStorage.setItem("math-direct-profiles", JSON.stringify(v4));
  localStorage.setItem("math-direct-active-profile", "v4child");
});
await page.goto(BASE + "/more/", { waitUntil: "load" });
await page.waitForTimeout(200);
const v5 = await page.evaluate(() => { const P = window.mathProgress; const p = P.getActiveProfile(); return { placements: p.placements, last: p.last, hadOld: "placement" in p, level: P.currentLevel("math"), reading: P.currentLevel("reading"), next: P.nextLesson("k", 140), lastResult: P.lastResult("math") && P.lastResult("math").id, sounds: p.sounds, checkouts: p.checkouts }; });
check("the placement moves under the math subject", v5.placements && v5.placements.math && v5.placements.math.level === "k" && !v5.hadOld, JSON.stringify(v5.placements));
check("the last lesson moves under the math subject", v5.last && v5.last.math && v5.last.math.id === "k-002", JSON.stringify(v5.last));
check("the current math level and the next lesson still come out", v5.level === "k" && v5.next === 3 && v5.lastResult === "k-002", JSON.stringify([v5.level, v5.next, v5.lastResult]));
check("reading has no level yet", v5.reading === null);
check("sounds and checkouts start empty", v5.sounds && Object.keys(v5.sounds).length === 0 && Array.isArray(v5.checkouts) && v5.checkouts.length === 0);

// ── An Open Phonics backup loads as reading lessons ──
const opFile = join(dir, "open-phonics-profiles.json");
writeFileSync(opFile, JSON.stringify({ profiles: [{ id: "op1", name: "Mia", completed: [1, 2, 3, 105] }, { id: "op2", name: "Zoe", completed: [1] }], version: 2 }));
await page.setInputFiles("#import-progress-input", opFile);
await page.waitForLoadState("load");
await page.waitForTimeout(300);
const afterOp = await page.evaluate(() => { const P = window.mathProgress; const ps = P.getProfiles(); return { names: ps.map((p) => p.name), mia: ps.find((p) => p.name === "Mia"), zoe: ps.find((p) => p.name === "Zoe") }; });
check("the profiles merge by name", afterOp.names.length === 2 && afterOp.names.indexOf("Zoe") !== -1, afterOp.names.join(", "));
check("lessons 1 to 100 become Reading 1 and 101 to 150 Reading 2", afterOp.mia && ["reading-1-001", "reading-1-002", "reading-1-003", "reading-2-005"].every((id) => afterOp.mia.completed.indexOf(id) !== -1), JSON.stringify(afterOp.mia && afterOp.mia.completed));
check("the math records of the same child are kept", afterOp.mia && afterOp.mia.completed.indexOf("k-002") !== -1 && afterOp.mia.placements.math);
check("the import is noted on the record", afterOp.mia && afterOp.mia.readingImport && afterOp.mia.readingImport.lessons === 4, JSON.stringify(afterOp.mia && afterOp.mia.readingImport));
check("the new child's record is a full profile", afterOp.zoe && Array.isArray(afterOp.zoe.notes) && afterOp.zoe.completed[0] === "reading-1-001");

// ── A Teach Direct backup loads ──
const tdFile = join(dir, "teach-direct-backup.json");
writeFileSync(tdFile, JSON.stringify({ app: "teach-direct", version: 5, exported: new Date().toISOString(), profiles: [{ id: "x", name: "Zoe", completed: ["prek-001"], redo: [], lessons: {}, tests: {}, facts: {}, sounds: { th: { r: [1, 1, 1], t: [1.2, 1.1, 0.9], last: "2026-10-02T00:00:00.000Z" } }, items: {}, timed: [], checkouts: [{ date: "2026-10-02T00:00:00.000Z", level: "reading-1", lesson: 40, words: 50, seconds: 100, errors: 1, wpm: 30, goal: 30 }], placements: { reading: { level: "reading-1", lesson: 12, url: "/reading-1/lesson-012/", label: "Reading 1, Lesson 12", date: "2026-10-02T00:00:00.000Z" } }, last: {}, notes: [] }] }));
await page.setInputFiles("#import-progress-input", tdFile);
await page.waitForLoadState("load");
await page.waitForTimeout(300);
const afterTd = await page.evaluate(() => { const P = window.mathProgress; const z = P.getProfiles().find((p) => p.name === "Zoe"); return { completed: z.completed, sounds: z.sounds, checkouts: z.checkouts, placements: z.placements, soundStatus: P.soundStatus(z.sounds.th) }; });
check("sounds, checkouts, and placements merge into the child", afterTd.completed.indexOf("prek-001") !== -1 && afterTd.completed.indexOf("reading-1-001") !== -1 && afterTd.sounds.th && afterTd.checkouts.length === 1 && afterTd.placements.reading && afterTd.placements.reading.lesson === 12, JSON.stringify(afterTd));
check("a sound said three times within two seconds is automatic", afterTd.soundStatus === "automatic", afterTd.soundStatus);

check("no page errors", !errors.length, errors.join(" | "));
await browser.close();
server.close();
if (fails.length) { console.error("check-import: " + fails.length + " check(s) failed."); process.exit(1); }
console.log("check-import: version 4 records read as version 5, and Teach Direct and Open Phonics backups load.");
