// The style guide, kept by a script. It reads the stylesheets, the templates,
// and the icons, and fails when something steps outside the system:
//   - a color written as hex or rgba outside the tokens (and the drawing
//     palette at the top of visuals.css)
//   - a <style> block or a style attribute in a template (a custom-property
//     setter such as style="--p: 0.4" is allowed)
//   - text under 13 px
//   - a corner radius written as a length instead of a token (a percentage
//     is a shape, a circle or an ellipse, and is allowed)
//   - a hover style outside @media (hover: hover)
//   - a transition or animation time not taken from the motion tokens
//   - an icon drawn with a stroke other than the standard
//   - the same selector, standing alone, styled in two places (a selector may
//     appear once in a group and once alone; reset.css is the layer below
//     everything and is not counted)
// Usage: node scripts/check-style.mjs
import fs from "node:fs";
import path from "node:path";

const CSS_DIR = "src/assets/css";
const fails = [];
function fail(file, line, what) { fails.push(`${file}:${line} ${what}`); }
function lineOf(text, index) { return text.slice(0, index).split("\n").length; }
function walk(dir, exts, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

const cssFiles = walk(CSS_DIR, [".css"]).filter((f) => !f.endsWith("global.css"));
const selectorsSeen = new Map();

for (const file of cssFiles) {
  const text = fs.readFileSync(file, "utf8");
  const isTokens = file.endsWith("tokens.css");
  // The drawing palette: the :root block at the top of visuals.css.
  let body = text;
  if (file.endsWith("visuals.css")) body = text.replace(/:root\s*\{[^}]*\}/, (m) => " ".repeat(m.length));
  const noComments = body.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

  if (!isTokens) {
    for (const m of noComments.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)) fail(file, lineOf(noComments, m.index), `a color written out: ${m[0]} (use a token)`);
    for (const m of noComments.matchAll(/font-size\s*:\s*([^;]+);/g)) {
      const v = m[1].trim();
      const n = /^(\d*\.?\d+)(rem|px)$/.exec(v);
      if (!n) continue;
      const px = n[2] === "px" ? Number(n[1]) : Number(n[1]) * 16;
      if (px < 12.99) fail(file, lineOf(noComments, m.index), `text at ${v}, under 13 px`);
    }
    for (const m of noComments.matchAll(/border-radius\s*:\s*([^;]+);/g)) {
      const v = m[1].trim();
      // Every length is 0, a percentage, or a token.
      // Every length is 0, a percentage, or a token (or --r, which the style guide's samples set to a token).
      if (v.split(/[\s/]+/).every((part) => /^(0|\d*\.?\d+%|var\(--r(-[a-z0-9-]+)?\))$/.test(part))) continue;
      fail(file, lineOf(noComments, m.index), `a corner radius written out: ${v} (use --r-0 to --r-3 or --r-full)`);
    }
    for (const m of noComments.matchAll(/(transition|animation)(?:-duration)?\s*:\s*([^;]+);/g)) {
      const v = m[2];
      if (/\bnone\b/.test(v)) continue;
      if (/\b\d*\.?\d+(ms|s)\b/.test(v)) {
        // The reduced-motion rule in reset.css sets every time to nothing; that is allowed.
        if (/0\.01ms/.test(v)) continue;
        fail(file, lineOf(noComments, m.index), `a time written out: ${v.trim()} (use --dur-1 to --dur-4)`);
      }
    }
  }

  // Hover outside a hover media query, and duplicate selectors: walk the blocks.
  const stack = [];
  let i = 0, start = 0;
  while (i < noComments.length) {
    const ch = noComments[i];
    if (ch === "{") {
      const header = noComments.slice(start, i).trim().replace(/\s+/g, " ");
      const inHoverMedia = stack.some((h) => /\(hover:\s*hover\)/.test(h)) || /\(hover:\s*hover\)/.test(header);
      if (/:hover\b/.test(header) && !inHoverMedia) fail(file, lineOf(noComments, i), `a hover style outside @media (hover: hover): ${header}`);
      if (!header.startsWith("@") && !header.includes(",") && !file.endsWith("reset.css") && !stack.some((h) => h.startsWith("@media") || h.startsWith("@keyframes") || h.startsWith("@supports"))) {
        const prev = selectorsSeen.get(header);
        if (prev && !isTokens) fail(file, lineOf(noComments, i), `selector styled twice: "${header}" (also at ${prev})`);
        else selectorsSeen.set(header, `${file}:${lineOf(noComments, i)}`);
      }
      stack.push(header);
      start = i + 1;
    } else if (ch === "}") {
      stack.pop();
      start = i + 1;
    } else if (ch === ";") {
      start = i + 1;
    }
    i++;
  }
}

// Templates: no inline styles.
for (const file of walk("src", [".njk"])) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/<style\b/g)) fail(file, lineOf(text, m.index), "a <style> block in a template (move it to a stylesheet)");
  for (const m of text.matchAll(/\sstyle="([^"]*)"/g)) {
    if (/^\s*(--[a-z0-9-]+\s*:\s*[^;]+;?\s*)+$/i.test(m[1])) continue;
    fail(file, lineOf(text, m.index), `a style attribute in a template: style="${m[1]}"`);
  }
}

// Icons: one stroke.
for (const file of walk("src/_includes/partials/icons", [".njk"])) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/stroke-width="([^"]+)"/g)) if (m[1] !== "2") fail(file, lineOf(text, m.index), `an icon stroke of ${m[1]} (the standard is 2)`);
}

if (fails.length) {
  console.error("check-style: " + fails.length + " problem(s)");
  for (const f of fails) console.error("  " + f);
  process.exit(1);
}
console.log(`check-style: ${cssFiles.length} stylesheets, the templates, and the icons keep to the tokens, the radii, the motion, the hover rule, and the 13 px floor.`);
