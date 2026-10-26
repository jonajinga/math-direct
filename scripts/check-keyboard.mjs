// A keyboard walk of the runner and the app shell:
//   - Tab reaches More within three presses on a lesson;
//   - every control in the bar can be reached and pressed with the keyboard;
//   - a sheet traps focus while open, closes on Escape, and returns focus to
//     the button that opened it;
//   - the shortcut keys do what the Keys sheet says;
//   - on an app screen the skip links come first and the tab bar last;
//   - every focused control shows a focus ring (an outline).
//
//   node scripts/check-keyboard.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch (e) {}
  try { return require(join(execSync("npm root -g").toString().trim(), "playwright")); } catch (e) {}
  console.error("check-keyboard: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-keyboard: build the site first (npm run build)."); process.exit(2); }

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
const active = () => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.getAttribute("aria-label") || a.className || a.tagName) : ""; });
const activeInDialog = (id) => page.evaluate((id) => { const d = document.getElementById(id); return !!(d && d.open && d.contains(document.activeElement)); }, id);
const ring = () => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return false; const cs = getComputedStyle(a); return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2; });

// ── The runner ──
await page.goto(BASE + "/k/lesson-040/", { waitUntil: "load" });
await page.waitForTimeout(300);
let n = 0, id = "";
for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); n++; id = await active(); if (id === "btn-more") break; }
check("Tab reaches More within three presses", id === "btn-more" && n <= 3, `${n} presses, on ${id}`);
check("the focused control shows a ring", await ring());
// Through the bar: More, (tool), Error, primary.
const order = [id];
for (let i = 0; i < 4; i++) { await page.keyboard.press("Tab"); order.push(await active()); }
check("Tab walks the bar in order: More, Error, then the primary", order.indexOf("btn-error") > order.indexOf("btn-more") && order.indexOf("btn-firm") > order.indexOf("btn-error"), order.join(" > "));
// Keys.
await page.keyboard.press("f");
const r1 = await page.evaluate(() => Object.values(window.mdRunner.results()).length);
check("F marks Firm and moves on", r1 === 1);
await page.keyboard.press("ArrowLeft");
await page.keyboard.press("x");
check("X marks Error and shows the correction", await page.evaluate(() => document.getElementById("tp-correct").classList.contains("is-active")));
check("the primary is Go on during a correction", await page.evaluate(() => !document.getElementById("btn-goon").hidden));
await page.keyboard.press("Enter");
check("Enter goes on", await page.evaluate(() => document.getElementById("btn-goon").hidden));
// Sheets trap focus and return it.
await page.focus("#btn-more");
await page.keyboard.press("Enter");
await page.waitForTimeout(150);
check("Enter on More opens the sheet", await page.evaluate(() => document.getElementById("sheet-more").open));
check("focus moves into the sheet", await activeInDialog("sheet-more"));
let inside = true;
for (let i = 0; i < 14; i++) {
  await page.keyboard.press("Tab");
  // Focus may pass to the browser's own controls (activeElement is then the body), never to the page behind the sheet.
  const where = await page.evaluate(() => { const a = document.activeElement; const d = document.getElementById("sheet-more"); return a === document.body || (d && d.contains(a)) ? "fine" : (a.id || a.className || a.tagName); });
  if (where !== "fine") { inside = false; console.log("      focus escaped to " + where); break; }
}
check("Tab never leaves the open sheet for the page behind it", inside);
await page.keyboard.press("Escape");
await page.waitForTimeout(100);
check("Escape closes the sheet", await page.evaluate(() => !document.getElementById("sheet-more").open));
check("focus returns to More", (await active()) === "btn-more", await active());
await page.keyboard.press("o");
await page.waitForTimeout(100);
check("O opens the outline", await page.evaluate(() => document.getElementById("sheet-outline").open));
await page.keyboard.press("Escape");
await page.keyboard.press("?");
await page.waitForTimeout(100);
check("? opens the keys", await page.evaluate(() => document.getElementById("sheet-keys").open));
await page.keyboard.press("Escape");
await page.keyboard.press("Escape");
await page.waitForTimeout(100);
check("Escape on the lesson asks before leaving", await page.evaluate(() => document.getElementById("sheet-leave").open));
check("the Leave sheet starts on Stay", /Stay/.test(await page.evaluate(() => document.activeElement.textContent)));
await page.keyboard.press("Escape");
await page.keyboard.press("b");
await page.waitForTimeout(100);
check("B gives the big picture and focuses its button", (await active()) === "btn-big-back");
await page.keyboard.press("Escape");
check("Escape leaves the big picture", (await active()) === "btn-more");
await page.keyboard.press("m");
await page.waitForTimeout(100);
check("M opens More", await page.evaluate(() => document.getElementById("sheet-more").open));
await page.keyboard.press("Escape");

// ── An app screen ──
await page.goto(BASE + "/lessons/", { waitUntil: "load" });
await page.waitForTimeout(200);
await page.keyboard.press("Tab");
check("the first Tab lands on Skip to content", /Skip to content/.test(await page.evaluate(() => document.activeElement.textContent)));
await page.keyboard.press("Tab");
check("the second Tab lands on Skip to menu", /Skip to menu/.test(await page.evaluate(() => document.activeElement.textContent)));
await page.keyboard.press("Enter");
await page.waitForTimeout(100);
check("Skip to menu moves focus to the tab bar", await page.evaluate(() => { const a = document.activeElement; return !!(a && (a.id === "tabbar" || a.closest("#tabbar"))); }), await active());
const tabCount = await page.evaluate(() => document.querySelectorAll("#tabbar a").length);
check("the tab bar has five tabs", tabCount === 5, String(tabCount));
const last = await page.evaluate(() => { const all = [...document.querySelectorAll("a, button, input, select, textarea, summary, [tabindex]:not([tabindex='-1'])")].filter((e) => !e.closest("[hidden], dialog") && e.offsetParent !== null); return all[all.length - 1].closest("#tabbar") ? "tabbar" : all[all.length - 1].textContent.trim(); });
check("the tab bar is last in the tab order", last === "tabbar", last);
// Every control shows a ring when focused.
const noRing = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("a, button, summary").forEach((el) => {
    if (el.closest("[hidden], dialog") || el.offsetParent === null) return;
    el.focus();
    const cs = getComputedStyle(el);
    if (!(cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2)) out.push(el.id || el.className || el.textContent.trim().slice(0, 20));
  });
  return out;
});
check("every control on Lessons shows a focus ring", noRing.length === 0, noRing.slice(0, 5).join(", "));
// A sheet on an app screen: the mark sheet.
await page.goto(BASE + "/k/", { waitUntil: "load" });
await page.waitForTimeout(200);
await page.focus("[data-mark-toggle]");
await page.keyboard.press("Enter");
await page.focus('[data-lesson-id="k-002"]');
await page.keyboard.press("Enter");
await page.waitForTimeout(200);
check("Enter on a chip in marking mode opens the mark sheet", await page.evaluate(() => document.getElementById("mark-dialog").open));
check("focus is inside the mark sheet", await activeInDialog("mark-dialog"));
await page.keyboard.press("Escape");
await page.waitForTimeout(100);
check("focus returns to the chip", (await page.evaluate(() => document.activeElement.getAttribute("data-lesson-id"))) === "k-002", await active());

check("no page errors", !errors.length, errors.join(" | "));
await browser.close();
server.close();
if (fails.length) { console.error("check-keyboard: " + fails.length + " check(s) failed."); process.exit(1); }
console.log("check-keyboard: the runner and the app shell work from the keyboard, sheets trap and return focus, and every control shows a ring.");
