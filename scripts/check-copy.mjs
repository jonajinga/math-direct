// The app has no paper, no printing, no numeral writing, and no dark mode.
// This fails the build if any of those words appear in what the parent reads:
// page text, the lesson scripts, and the strings the scripts show.
// Usage: node scripts/check-copy.mjs [siteDir]
import fs from "node:fs";
import path from "node:path";

const site = process.argv[2] || "_site";
const words = /\b(printable|print(?:s|ed|ing)?|worksheets?|pencils?|crayons?|trac(?:e|ing)|dark mode|handwriting|click(?:s|ed|ing)?|sliders?)\b|\bwrite (?:the|a|an|each) (?:number|numeral|digit)s?\b|\bon (?:your |the )?paper\b/i;
// Words from the method or from software that the parent does not need, and
// abbreviations: one word for each thing is the rule (see /design/, which
// names these words and is left out of this check).
const jargon = /\b(?:a|the|this|each|one|saved|unfinished) sittings?\b|\b(sittings|sessions?|segments?|firming|checkouts?|retests?|released|sync|wpm)\b|\bs left\b|\bEx \d|\b\d+ min\b/;
// Looks like a hit but is not: "paper clips" is a real object the child counts.
const allowed = /paper clips?|fingerprint|footprint|blueprint|addEventListener\("click"|\.click\(\)/gi;
// Lesson data keys whose text the parent reads.
const COPY_KEYS = new Set(["say", "do", "answer", "confirm", "correct", "title", "label", "materials", "summary", "name", "prompt", "text", "description", "endsWith", "tagline"]);

const hits = [];
function flag(file, where, text, prose) {
  const clean = text.replace(allowed, "");
  const m = words.exec(clean) || (prose && !/[\\/]design[\\/]/.test(file) ? jargon.exec(clean) : null);
  if (m) hits.push(`${file} ${where}: "${m[0]}" in: ${text.trim().slice(0, 110)}`);
}
function walkJson(file, node, trail) {
  if (Array.isArray(node)) node.forEach((n, i) => walkJson(file, n, trail));
  else if (node && typeof node === "object") for (const k of Object.keys(node)) {
    if (typeof node[k] === "string") { if (COPY_KEYS.has(k)) flag(file, k, node[k], true); }
    else walkJson(file, node[k], k);
  }
}
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|css)$/.test(f)) files.push(p);
  }
})(site);

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (file.endsWith(".html")) {
    // Data blocks are checked by key; everything else as page text.
    const re = /<script[^>]*type=["']?application\/json["']?[^>]*>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(text))) { try { walkJson(file, JSON.parse(m[1]), ""); } catch (e) { /* not JSON */ } }
    const page = text.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
    page.split(/(?<=[.?!])\s+/).forEach((sentence) => flag(file, "text", sentence, true));
  } else if (file.endsWith(".js")) {
    // Only strings with more than one word are copy; a lone "pencil" names a drawn picture.
    const re = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g;
    let m;
    while ((m = re.exec(text))) { const str = m[1] != null ? m[1] : m[2]; if (/\s/.test(str.trim())) flag(file, "string", str); }
  } else {
    text.split("\n").forEach((line, i) => { if (!/^\s*\/\*/.test(line)) flag(file, "line " + (i + 1), line); });
  }
}
if (hits.length) { console.error("check-copy: " + hits.length + " hit(s)\n  " + hits.slice(0, 60).join("\n  ")); process.exit(1); }
console.log("check-copy: no paper, printing, writing, clicking, slider, dark-mode, or jargon words in " + files.length + " files.");
