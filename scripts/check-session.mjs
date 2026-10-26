// Checks that a sitting left in the middle can be continued. Marks three
// answers in a lesson, leaves through the Leave sheet, finds the Continue
// card on Today, continues, checks the place and the marks, and finishes;
// then checks that finishing cleared the sitting and that "Start from the
// beginning" clears it too.
//
//   node scripts/check-session.mjs
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
  console.error("check-session: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-session: build the site first (npm run build)."); process.exit(2); }

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
function check(name, ok, detail) { console.log((ok ? "ok   " : "FAIL ") + name + (detail ? "  " + detail : "")); if (!ok) fails.push(name); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const $ = (sel) => page.$(sel);
const visible = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && e.offsetParent !== null; }, sel);
const sitting = () => page.evaluate(() => window.mathProgress.loadSession());

// 1. Mark three answers.
await page.goto(BASE + "/k/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(300);
let marked = 0;
for (let i = 0; i < 60 && marked < 3; i++) {
  if (await visible("#btn-firm")) { await page.click(marked % 2 ? "#btn-error" : "#btn-firm"); marked++; if (await visible("#btn-goon")) await page.click("#btn-goon"); }
  else await page.click("#btn-next");
  await page.waitForTimeout(40);
}
let s = await sitting();
const posBefore = await page.evaluate(() => JSON.stringify(window.mdRunner.pos()));
check("sitting saved after three marks", s && s.marks === 3, s && JSON.stringify({ marks: s.marks, where: s.where }));

// 2. Leave through the sheet.
await page.click("#btn-more");
await page.click('[data-act="leave"]');
await page.waitForTimeout(200);
check("leave sheet says the marks are saved", /saved/.test(await page.textContent("#sheet-leave-text")));
await Promise.all([page.waitForNavigation(), page.click("#sheet-leave-go")]);
check("left to the level screen", /\/k\/$/.test(page.url()), page.url());
s = await sitting();
check("sitting still there after leaving", !!s && s.marks === 3);

// 3. Today offers to continue.
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForTimeout(300);
check("Today shows a Continue card", await visible("[data-continue-card]"));
await Promise.all([page.waitForNavigation(), page.click('[data-continue-card] a.btn--primary')]);
await page.waitForTimeout(300);
check("continue link carries ?continue=1", /continue=1/.test(page.url()), page.url());
const posAfter = await page.evaluate(() => JSON.stringify(window.mdRunner.pos()));
const resultsAfter = await page.evaluate(() => Object.keys(window.mdRunner.results()).length);
check("place restored", posAfter === posBefore, posAfter + " vs " + posBefore);
check("marks restored", resultsAfter === 3, String(resultsAfter));
check("no continue sheet when ?continue=1", !(await page.evaluate(() => document.getElementById("sheet-continue").open)));

// 4. Opening the page plainly offers the sheet; Start from the beginning clears it.
await page.goto(BASE + "/k/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(300);
check("continue sheet offered", await page.evaluate(() => document.getElementById("sheet-continue").open));
check("sheet names the place and marks", /Exercise .* answers marked/.test(await page.textContent("#sheet-continue-text")), await page.textContent("#sheet-continue-text"));
await page.click('#sheet-continue [value="restart"]');
await page.waitForTimeout(200);
s = await sitting();
check("start from the beginning clears the sitting", !s);
check("back at the first step", (await page.evaluate(() => JSON.stringify(window.mdRunner.pos()))) === '{"seg":0,"step":0}');

// 5. Finish a lesson: the sitting is cleared.
for (let i = 0; i < 400; i++) {
  if (await visible("#runner-finish")) break;
  const pick = (await visible("#btn-goon")) ? "#btn-goon" : (await visible("#btn-firm")) ? "#btn-firm" : "#btn-next";
  await page.click(pick);
}
check("lesson finished", await visible("#runner-finish"));
s = await sitting();
check("finishing clears the sitting", !s);
await page.goto(BASE + "/", { waitUntil: "load" });
await page.waitForTimeout(300);
check("Today shows no Continue card", !(await visible("[data-continue-card]")));

// 6. Placement: a section in progress can be continued.
await page.goto(BASE + "/placement/math/", { waitUntil: "load" });
await page.waitForTimeout(300);
await (await page.$$("[data-start]"))[1].click();
await page.waitForTimeout(200);
await page.click("#btn-firm"); await page.click("#btn-firm");
s = await sitting();
check("placement sitting saved", !!s && s.kind === "placement" && s.marks === 2, s && JSON.stringify({ kind: s.kind, marks: s.marks }));
await page.goto(BASE + "/placement/math/?continue=1", { waitUntil: "load" });
await page.waitForTimeout(300);
check("placement continued without the chooser", (await visible("#runner-shell")) && !(await visible("#placement-start")));
check("placement marks restored", (await page.evaluate(() => Object.keys(window.mdRunner.results()).length)) === 2);

check("no page errors", !errors.length, errors.join(" | "));
await browser.close();
server.close();
if (fails.length) { console.error("check-session: " + fails.length + " check(s) failed."); process.exit(1); }
console.log("check-session: a sitting is saved, continued, and cleared as it should be.");
