// The reading stage in a real browser:
//   - a word's letters render with the lesson alphabet (joined pairs, a
//     macron, a small silent letter) and fade to plain print when asked;
//   - every sound group gets a stop, centred under its letters, and the
//     arrow runs under the whole word;
//   - press moves the dot to the next stop and holds it; release keeps it;
//     a quick tap at the start sweeps the word; the end, then the start;
//   - a fast step sweeps on every press; a line moves word by word;
//   - the Dot button sits in the tool slot, works by pointer and by key,
//     and each move is announced.
//
//   node scripts/check-dot.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch (e) {}
  try { return require(join(execSync("npm root -g").toString().trim(), "playwright")); } catch (e) {}
  console.error("check-dot: Playwright is not installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}
const { chromium } = loadPlaywright();
const ROOT = "_site";
if (!existsSync(join(ROOT, "index.html"))) { console.error("check-dot: build the site first (npm run build)."); process.exit(2); }

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
const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const visible = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && e.offsetParent !== null; }, sel);
const state = () => page.evaluate(() => window.MDDot.state());
const live = () => page.evaluate(() => document.getElementById("rn-live").textContent);
const say = () => page.textContent("#tp-say");
const next = async () => { const pick = (await visible("#btn-goon")) ? "#btn-goon" : (await visible("#btn-firm")) ? "#btn-firm" : "#btn-next"; await page.click(pick); await page.waitForTimeout(60); };
// The letters' boxes, measured from the text box's corner, for the current step.
const tokens = () => page.evaluate(() => { const t = document.querySelector(".mdv-text"); const b = t.getBoundingClientRect(); return [...t.querySelectorAll(".mdv-tok")].map((e) => { const r = e.getBoundingClientRect(); return { text: e.textContent, cls: e.className, left: r.left - b.left, right: r.right - b.left, bottom: r.bottom - b.top, stop: e.getAttribute("data-stop"), fs: parseFloat(getComputedStyle(e).fontSize) }; }); });

await page.goto(BASE + "/reading-sample/", { waitUntil: "load" });
await page.waitForTimeout(400);
await page.evaluate(() => document.fonts.ready);

// ── A sound: the arrow, one stop, the Dot button ──
check("the sample opens on a sound with the Dot button in the tool slot", /What sound|new sound/.test(await say()) && (await visible("#btn-dot")) && !(await visible("#btn-show")) && !(await visible("#btn-clear")));
let s = await state();
check("a sound has one stop and the dot starts at the ball", s.mode === "sound" && s.count === 1 && s.idx === -1 && s.dot && s.dot.x < s.stops[0].x, JSON.stringify({ idx: s.idx, dot: s.dot, stop: s.stops[0] }));
// Press by pointer: the dot moves under the letter and is held.
const btn = await page.locator("#btn-dot").boundingBox();
await page.mouse.move(btn.x + btn.width / 2, btn.y + btn.height / 2);
await page.mouse.down();
await page.waitForTimeout(250);
s = await state();
let toks = await tokens();
check("a press moves the dot under the sound and holds it", s.idx === 0 && s.held && Math.abs(s.dot.x - s.stops[0].x) < 2 && s.stops[0].x > toks[0].left && s.stops[0].x < toks[0].right, JSON.stringify({ dot: s.dot, stop: s.stops[0], token: [toks[0].left, toks[0].right] }));
check("the move is announced", /Dot under m/.test(await live()), await live());
check("the button shows it is held", await page.evaluate(() => document.getElementById("btn-dot").classList.contains("is-held")));
await page.mouse.up();
await page.waitForTimeout(100);
s = await state();
check("a release keeps the dot where it is", s.idx === 0 && !s.held);
await page.mouse.down(); await page.waitForTimeout(80); await page.mouse.up(); await page.waitForTimeout(100);
s = await state();
check("after the last sound a press goes to the end of the arrow", s.idx === 1 && s.dot.x > s.stops[0].x);
await page.mouse.down(); await page.waitForTimeout(80); await page.mouse.up(); await page.waitForTimeout(100);
s = await state();
check("then back to the start", s.idx === -1);
for (let i = 0; i < 4; i++) { if (/Your turn\. What sound/.test(await say())) break; await next(); }
check("a test step on a continuous sound shows the hold signal", /Hold/.test(await page.textContent("#tp-signal")), await page.textContent("#tp-signal"));

// ── A stop sound taps ──
for (let i = 0; i < 6; i++) { if (/What sound/.test(await say()) && (await tokens())[0].text === "t") break; await next(); }
toks = await tokens();
check("t is a stop sound", toks[0].text === "t" && toks[0].stop === "tap" && /Tap/.test(await page.textContent("#tp-signal")), JSON.stringify([toks[0].text, toks[0].stop]));

// ── Sounding out a word: a stop under each sound, a quick tap sweeps ──
for (let i = 0; i < 12; i++) { if (/Sound it out\. Get ready/.test(await say())) break; await next(); }
s = await state();
toks = await tokens();
check("a word has a stop under each of its sounds", s.mode === "word" && s.count === 3 && s.stops.every((st, k) => st.x > toks[k].left && st.x < toks[k].right), JSON.stringify(s.stops.map((x) => x.text)));
check("the stops sit below the letters, on the arrow", s.stops.every((st) => st.y > toks[0].bottom), JSON.stringify([s.stops[0].y, toks[0].bottom]));
await page.evaluate(() => { window.MDDot.press(); window.MDDot.release(); });
await page.waitForTimeout(700);
s = await state();
check("a quick tap at the start sweeps the whole word", s.idx === 3 && !s.sweeping && /Swept under mat/.test(await live()), JSON.stringify({ idx: s.idx, live: await live() }));
await page.evaluate(() => window.MDDot.reset());
// Hold Space: press and release by key.
await page.keyboard.down("Space"); await page.waitForTimeout(300);
s = await state();
check("holding Space presses the dot", s.held && s.idx === 0);
await page.keyboard.up("Space"); await page.waitForTimeout(100);
s = await state();
check("letting Space go releases it, without a sweep", !s.held && s.idx === 0);
await page.keyboard.press("d"); await page.waitForTimeout(100);
s = await state();
check("D steps the dot one sound on", s.idx === 1 && !s.held);

// ── Say it fast: every press sweeps ──
await next();
s = await state();
check("the fast step shows the sweep signal", s.mode === "fast" && /Sweep/.test(await page.textContent("#tp-signal")));
await page.evaluate(() => { window.MDDot.press(); window.MDDot.release(); });
await page.waitForTimeout(700);
s = await state();
check("a press in a fast step sweeps the word", s.idx === 3 && /Swept/.test(await live()));

// ── The lesson alphabet: joined pair, macron, small silent letter, then plain ──
await next();
toks = await tokens();
check("th is drawn as a joined pair with one stop", toks[0].text === "th" && /mdv-tok--joined/.test(toks[0].cls) && (await state()).count === 3);
await next();
toks = await tokens();
check("a long vowel carries the macron", /mdv-tok--macron/.test(toks[1].cls));
await next();
toks = await tokens();
s = await state();
check("a silent letter is small and gets no stop", /mdv-tok--silent/.test(toks[3].cls) && toks[3].fs < toks[0].fs * 0.7 && s.count === 3, JSON.stringify([toks[3].fs, toks[0].fs, s.count]));
check("the macron letter is described as a plain letter", /the word rate, with an arrow under it/.test(await page.textContent("#stage-alt")), await page.textContent("#stage-alt"));
await next();
s = await state();
check("a whole word has one stop and the sweep signal", s.count === 1 && /Sweep/.test(await page.textContent("#tp-signal")));
await next();
toks = await tokens();
check("plain print shows no marks", toks.every((x) => !/joined|macron|silent/.test(x.cls)) && (await page.evaluate(() => document.querySelector(".mdv-text").getAttribute("data-prompts"))) === "plain");

// ── A line: the dot moves word by word ──
await next();
check("the line step says what to do", /Press Dot/.test(await say()));
s = await state();
check("a line has a stop under each word and no dot until a press", s.mode === "line" && s.count === 2 && s.dot === null);
await page.evaluate(() => { window.MDDot.press(); window.MDDot.release(); });
await page.waitForTimeout(250);
s = await state();
check("a press puts the dot under the first word", s.idx === 0 && s.dot && /Dot under Sam/.test(await live()), await live());
await page.evaluate(() => { window.MDDot.press(); window.MDDot.release(); });
await page.waitForTimeout(250);
s = await state();
check("the next press moves it to the second word", s.idx === 1 && s.dot.x > s.stops[0].x);
await page.evaluate(() => { window.MDDot.press(); window.MDDot.release(); });
await page.waitForTimeout(250);
s = await state();
check("after the last word the dot goes away", s.idx === 2 && s.dot === null);
check("the line is described", /a line of text: Sam sat/.test(await page.textContent("#stage-alt")), await page.textContent("#stage-alt"));
for (let i = 0; i < 5; i++) { if (/Read the story/.test(await say())) break; await next(); }
const story = await page.evaluate(() => { const t = document.querySelector(".mdv-text"); return { lines: t.querySelectorAll(".mdv-text__line").length, prompts: t.getAttribute("data-prompts"), small: !!t.querySelector(".mdv-tok--silent, .mdv-tok--macron") }; });
check("a story shows its lines in the light stage, with no macrons or small letters", story.lines === 2 && story.prompts === "light" && !story.small, JSON.stringify(story));
check("nothing in the sample scrolls the panel or the stage", await page.evaluate(() => { const b = document.getElementById("tp-body"), st = document.getElementById("child-stage"); return b.scrollHeight <= b.clientHeight + 1 && st.scrollWidth <= st.clientWidth + 1 && st.scrollHeight <= st.clientHeight + 1; }));

// ── Nothing is recorded from the sample ──
for (let i = 0; i < 40; i++) { if (await visible("#runner-finish")) break; await next(); }
check("the sample finishes as a rehearsal", await visible("#runner-finish") && /rehearsal/i.test(await page.textContent("#runner-finish")));
check("the sample recorded nothing", await page.evaluate(() => { const p = window.mathProgress.getActiveProfile(); return !p.lessons["reading-sample-001"] && !p.last.reading; }));

check("no page errors", !errors.length, errors.join(" | "));
await browser.close();
server.close();
if (fails.length) { console.error("check-dot: " + fails.length + " check(s) failed."); process.exit(1); }
console.log("check-dot: the letters, the arrow, and the dot behave as the guide says, by pointer and by key.");
