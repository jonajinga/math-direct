// Confirms the built site can install as an app: the manifest is sound, its
// icons exist, and every path the service worker precaches is in the build.
// Usage: node scripts/check-pwa.mjs [siteDir]
import fs from "node:fs";
import path from "node:path";

const site = process.argv[2] || "_site";
const errors = [];
const exists = (p) => fs.existsSync(path.join(site, p.replace(/^\//, ""), p.endsWith("/") ? "index.html" : ""));

const manifest = JSON.parse(fs.readFileSync("src/manifest.json", "utf8"));
if (manifest.display !== "standalone") errors.push("manifest.display is not standalone");
if (!manifest.start_url.startsWith(manifest.scope)) errors.push("start_url is outside scope");
const purposes = new Set((manifest.icons || []).map((i) => i.purpose));
if (!purposes.has("any") || !purposes.has("maskable")) errors.push("manifest needs an icon with purpose any and one with purpose maskable");
for (const icon of manifest.icons || []) if (!exists(icon.src)) errors.push(`manifest icon missing: ${icon.src}`);
for (const s of manifest.shortcuts || []) if (!exists(s.url)) errors.push(`shortcut target missing: ${s.url}`);

const sw = fs.readFileSync("src/sw.js", "utf8");
const m = /var CORE_ASSETS = \[([\s\S]*?)\];/.exec(sw);
if (!m) errors.push("CORE_ASSETS not found in sw.js");
else for (const q of m[1].match(/"[^"]+"/g) || []) { const p = q.slice(1, -1); if (!exists(p)) errors.push(`precached path missing: ${p}`); }

const home = fs.readFileSync(path.join(site, "index.html"), "utf8");
const tag = /<meta[^>]*theme-color[^>]*>/.exec(home);
const tc = tag && /content=["']?(#[0-9a-fA-F]{6})/.exec(tag[0]);
if (!tc) errors.push("theme-color meta missing");
else if (tc[1].toLowerCase() !== manifest.theme_color.toLowerCase()) errors.push(`theme-color ${tc[1]} differs from manifest ${manifest.theme_color}`);
if (!/rel=["']?manifest/.test(home)) errors.push("manifest link missing on the home page");

if (errors.length) { console.error("check-pwa: " + errors.length + " problem(s)\n  " + errors.join("\n  ")); process.exit(1); }
console.log("check-pwa: manifest, icons, and " + (m[1].match(/"[^"]+"/g) || []).length + " precached paths are all present.");
