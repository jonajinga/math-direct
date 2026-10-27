// Turns a plain-text file into a library module for the reading program.
//
//   node scripts/ingest-text.mjs curriculum/reading/library/raw/<slug>.txt   write the module
//   node scripts/ingest-text.mjs --measure <raw.txt>   print each reading's measures, write nothing
//   node scripts/ingest-text.mjs --all                 ingest every raw file (modules are rewritten)
//   node scripts/ingest-text.mjs --check               recompute every module's measures and compare
//
// The raw format is described in curriculum/reading/library/BRIEF.md: a
// header (Title, Author, Year, Source, License, Note), then readings that
// begin with "# Title" lines, each of paragraphs followed by "V: word =
// meaning" and "Q: question | answer | kind" lines. A Project Gutenberg
// plain-text file also works: the header and footer between the *** START
// and *** END markers are stripped, and the text is cut into readings of
// about 200 words at paragraph ends, with no questions.
//
// Each reading's sentences become lines of at most twelve words, and the
// measures are computed: words, sentences, words a sentence, syllables a
// word, the share of words outside the Fry 1000, a grade, and a rung from 1
// to 12. The modules are listed in curriculum/reading/library/index.js,
// which --all and a single ingestion rewrite in rung order.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { FRY } from "../curriculum/reading/sight-words.js";

const RAW_DIR = "curriculum/reading/library/raw";
const OUT_DIR = "curriculum/reading/library";
const MAX_LINE = 12;
const TARGET = 200;
const FRY_SET = new Set(FRY.map((w) => w.toLowerCase()));
const KINDS = new Set(["literal", "inference", "vocabulary", "idea"]);

export function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const s = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = s.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}
export function measures(lines) {
  const text = lines.join(" ");
  const words = text.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  const sentences = Math.max(1, (text.match(/[.!?]+["')]*(\s|$)/g) || []).length);
  const syl = words.reduce((a, w) => a + syllables(w), 0);
  const outside = words.filter((w) => !FRY_SET.has(w.toLowerCase().replace(/[^a-z']/g, "").replace(/'s$/, ""))).length;
  const wps = words.length / sentences, spw = syl / Math.max(1, words.length), out = outside / Math.max(1, words.length);
  // Flesch-Kincaid, nudged by the share of words outside the Fry 1000.
  const grade = Math.max(1, Math.min(8, 0.39 * wps + 11.8 * spw - 15.59 + out * 12));
  const rung = Math.max(1, Math.min(12, Math.round((grade - 1) * 2) + 1));
  return { words: words.length, sentences, wordsPerSentence: Math.round(wps * 10) / 10, syllablesPerWord: Math.round(spw * 100) / 100, outsideFry: Math.round(out * 100) / 100, grade: Math.round(grade * 10) / 10, rung };
}
export function splitSentences(paragraph) {
  return paragraph.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["')]*|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [];
}
// A sentence becomes lines of at most twelve words, cut at a comma or a
// clause word when one falls in the right place.
export function linesOf(sentence) {
  const words = sentence.split(/\s+/);
  const out = [];
  let i = 0;
  while (i < words.length) {
    const left = words.length - i;
    if (left <= MAX_LINE) { out.push(words.slice(i).join(" ")); break; }
    let cut = -1;
    for (let k = Math.min(i + MAX_LINE, words.length) - 1; k > i + 3; k--) { if (/[,;:]$/.test(words[k])) { cut = k + 1; break; } }
    if (cut === -1) for (let k = Math.min(i + MAX_LINE, words.length) - 1; k > i + 3; k--) { if (/^(and|but|or|so|then|because|when|while|that|which|who)$/i.test(words[k])) { cut = k; break; } }
    if (cut === -1) cut = i + Math.ceil(left / Math.ceil(left / MAX_LINE));
    out.push(words.slice(i, cut).join(" "));
    i = cut;
  }
  return out;
}
// A paragraph's lines; a paragraph break is kept as a blank line marker so
// the screens can start a new paragraph.
function paragraphLines(p) { return splitSentences(p).flatMap(linesOf); }
export function readingsOf(paragraphs) {
  const readings = [];
  let cur = [], count = 0;
  for (const p of paragraphs) {
    const lines = paragraphLines(p);
    const n = lines.join(" ").split(/\s+/).length;
    if (count && count + n > TARGET * 1.35) { readings.push(cur); cur = []; count = 0; }
    cur.push(...lines);
    count += n;
    if (count >= TARGET) { readings.push(cur); cur = []; count = 0; }
  }
  if (cur.length) { if (readings.length && count < TARGET * 0.4) readings[readings.length - 1].push(...cur); else readings.push(cur); }
  return readings.map((lines) => ({ title: "", lines, vocabulary: [], questions: [] }));
}
function parseRaw(file) {
  let text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const start = text.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/);
  const end = text.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG EBOOK/);
  if (start !== -1 && end !== -1) text = text.slice(text.indexOf("\n", start) + 1, end);
  const head = {};
  const lines = text.split("\n");
  let i = 0;
  for (; i < lines.length; i++) {
    const m = /^(Title|Author|Year|Source|License|Note):\s*(.*)$/.exec(lines[i]);
    if (!m) break;
    head[m[1].toLowerCase()] = m[2].trim();
  }
  const body = lines.slice(i).join("\n").replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/\s*--\s*|\u2014|\u2013/g, ", ").replace(/[ \t]+/g, " ");
  // Readings: "# Title" starts one; V: and Q: lines belong to the current one.
  const readings = [];
  let cur = null, para = [];
  const flushPara = () => { if (para.length && cur) { cur.paragraphs.push(para.join(" ").trim()); } para = []; };
  const open = (title) => { flushPara(); cur = { title, paragraphs: [], vocabulary: [], questions: [] }; readings.push(cur); };
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (/^# /.test(line)) { open(line.slice(2).trim()); continue; }
    if (!cur) open("");
    if (/^V:/.test(line)) { flushPara(); const m = /^V:\s*([^=]+?)\s*=\s*(.+)$/.exec(line); if (m) cur.vocabulary.push({ word: m[1].trim(), meaning: m[2].trim().replace(/\.$/, "") }); continue; }
    if (/^Q:/.test(line)) { flushPara(); const parts = line.slice(2).split("|").map((s) => s.trim()); cur.questions.push({ q: parts[0], a: parts[1] || "", kind: parts[2] || "literal" }); continue; }
    if (!line) { flushPara(); continue; }
    para.push(line);
  }
  flushPara();
  // A text with no "# " lines and no questions is cut by length.
  const explicit = readings.some((r) => r.title || r.questions.length || r.vocabulary.length);
  const out = explicit
    ? readings.filter((r) => r.paragraphs.length).map((r) => ({ title: r.title, lines: r.paragraphs.flatMap((p) => paragraphLines(p)), paragraphs: r.paragraphs.map((p) => paragraphLines(p).length), vocabulary: r.vocabulary, questions: r.questions }))
    : readingsOf(readings.flatMap((r) => r.paragraphs));
  return { head, readings: out, raw: text };
}
export function build(file) {
  const slug = path.basename(file, ".txt");
  const { head, readings, raw } = parseRaw(file);
  const list = readings.map((r, i) => ({ n: i + 1, title: r.title || "", measures: measures(r.lines), lines: r.lines, paragraphs: r.paragraphs || [r.lines.length], vocabulary: r.vocabulary, questions: r.questions }));
  const all = measures(list.flatMap((r) => r.lines));
  return {
    slug, title: head.title || slug, author: head.author || "", year: head.year ? Number(head.year) || head.year : "", source: head.source || "", license: head.license || "", note: head.note || "",
    provenance: { file: path.relative(".", file), sha1: createHash("sha1").update(raw).digest("hex") },
    measures: all, readings: list,
  };
}
export function problems(t) {
  const out = [];
  if (!t.title) out.push("no title");
  for (const r of t.readings) {
    const R = `reading ${r.n}${r.title ? ` (${r.title})` : ""}`;
    if (r.measures.words < 120 || r.measures.words > 260) out.push(`${R}: ${r.measures.words} words`);
    if (r.lines.some((l) => l.split(/\s+/).length > MAX_LINE)) out.push(`${R}: a line of more than ${MAX_LINE} words`);
    if (r.lines.some((l) => /!/.test(l))) out.push(`${R}: an exclamation mark`);
    if (r.lines.some((l) => /[\u2014\u2013]|--/.test(l))) out.push(`${R}: a dash`);
    if (r.questions.length < 3) out.push(`${R}: ${r.questions.length} questions, fewer than three`);
    for (const q of r.questions) {
      if (!q.q || !q.a) out.push(`${R}: a question without an answer`);
      if (!KINDS.has(q.kind)) out.push(`${R}: question kind "${q.kind}"`);
      if (/!/.test(q.q + q.a)) out.push(`${R}: an exclamation mark in a question`);
    }
    for (const v of r.vocabulary) if (!new RegExp(`\\b${v.word.replace(/[^A-Za-z']/g, "")}`, "i").test(r.lines.join(" "))) out.push(`${R}: the vocabulary word ${v.word} is not in the reading`);
    if (r.vocabulary.length > 4) out.push(`${R}: ${r.vocabulary.length} vocabulary words, more than four`);
  }
  return out;
}
function moduleText(t) {
  const j = (x) => JSON.stringify(x);
  return `// ${t.title}${t.author ? ", " + t.author : ""}. Generated by scripts/ingest-text.mjs from ${t.provenance.file}.
// Edit the raw file and run the script again; run it with --check after editing this file by hand.
export default {
  slug: ${j(t.slug)},
  title: ${j(t.title)},
  author: ${j(t.author)},
  year: ${j(t.year)},
  source: ${j(t.source)},
  license: ${j(t.license)},
  note: ${j(t.note)},
  provenance: ${j(t.provenance)},
  measures: ${j(t.measures)},
  readings: [
${t.readings.map((r) => `    {
      n: ${r.n},
      title: ${j(r.title)},
      measures: ${j(r.measures)},
      paragraphs: ${j(r.paragraphs)},
      lines: [
${r.lines.map((l) => `        ${j(l)},`).join("\n")}
      ],
      vocabulary: [
${r.vocabulary.map((v) => `        ${j(v)},`).join("\n")}
      ],
      questions: [
${r.questions.map((q) => `        ${j(q)},`).join("\n")}
      ],
    },`).join("\n")}
  ],
};
`;
}
const slugOf = (f) => path.basename(f, ".js");
function writeIndex() {
  const files = fs.readdirSync(OUT_DIR).filter((x) => x.endsWith(".js") && x !== "index.js");
  const mods = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(OUT_DIR, f), "utf8");
    const m = /measures: (\{[^}]*\})/.exec(src);
    const meas = m ? JSON.parse(m[1]) : { rung: 99 };
    const t = /title: ("(?:[^"\\]|\\.)*")/.exec(src);
    mods.push({ slug: slugOf(f), rung: meas.rung, grade: meas.grade, title: t ? JSON.parse(t[1]) : f });
  }
  mods.sort((a, b) => a.rung - b.rung || a.grade - b.grade || a.title.localeCompare(b.title));
  const ident = (s) => "t_" + s.replace(/-/g, "_");
  const text = `// Every text in the library, in ladder order (by rung, then grade, then
// title). Written by scripts/ingest-text.mjs; do not edit by hand.
${mods.map((m) => `import ${ident(m.slug)} from "./${m.slug}.js";`).join("\n")}

export default [
${mods.map((m) => `  ${ident(m.slug)}, // rung ${m.rung}: ${m.title}`).join("\n")}
];
`;
  fs.writeFileSync(path.join(OUT_DIR, "index.js"), text);
  return mods.length;
}
function report(t) {
  return `${t.slug}: ${t.readings.length} reading(s), ${t.measures.words} words, grade ${t.measures.grade}, rung ${t.measures.rung}\n` +
    t.readings.map((r) => `  ${r.n}. ${r.title || "(untitled)"}: ${r.measures.words} words, ${r.measures.wordsPerSentence} a sentence, ${r.measures.syllablesPerWord} syllables a word, ${Math.round(r.measures.outsideFry * 100)}% outside the Fry 1000, grade ${r.measures.grade}, rung ${r.measures.rung}, ${r.questions.length} questions, ${r.vocabulary.length} vocabulary`).join("\n");
}

const args = process.argv.slice(2);
if (args.includes("--check")) {
  let bad = 0;
  for (const f of fs.readdirSync(OUT_DIR).filter((x) => x.endsWith(".js") && x !== "index.js")) {
    const mod = (await import(path.resolve(OUT_DIR, f))).default;
    for (const r of mod.readings) {
      const m = measures(r.lines);
      if (JSON.stringify(m) !== JSON.stringify(r.measures)) { console.log(`${f} reading ${r.n}: measures differ (stored ${JSON.stringify(r.measures)}, now ${JSON.stringify(m)})`); bad++; }
    }
    for (const p of problems(mod)) { console.log(`${f}: ${p}`); bad++; }
    if (fs.existsSync(mod.provenance.file)) {
      const sha = createHash("sha1").update(fs.readFileSync(mod.provenance.file, "utf8").replace(/\r\n/g, "\n")).digest("hex");
      if (sha !== mod.provenance.sha1) { console.log(`${f}: the raw file has changed since the module was made; run the script on it again`); bad++; }
    }
  }
  const idx = fs.existsSync(path.join(OUT_DIR, "index.js")) ? fs.readFileSync(path.join(OUT_DIR, "index.js"), "utf8") : "";
  for (const f of fs.readdirSync(OUT_DIR).filter((x) => x.endsWith(".js") && x !== "index.js")) if (!idx.includes(`./${f}"`)) { console.log(`${f} is not in index.js; run the script with --all`); bad++; }
  if (bad) { console.error(`ingest-text: ${bad} problem(s).`); process.exit(1); }
  console.log("ingest-text: every library module's measures, lines, questions, and provenance check out.");
} else if (args.includes("--measure")) {
  const file = args[args.indexOf("--measure") + 1];
  const t = build(file);
  console.log(report(t));
  const probs = problems(t);
  if (probs.length) { console.log("Problems:\n  " + probs.join("\n  ")); process.exit(1); }
} else if (args.includes("--all")) {
  let n = 0, bad = 0;
  for (const f of fs.readdirSync(RAW_DIR).filter((x) => x.endsWith(".txt"))) {
    const t = build(path.join(RAW_DIR, f));
    const probs = problems(t);
    if (probs.length) { console.log(`${f}:\n  ${probs.join("\n  ")}`); bad++; continue; }
    fs.writeFileSync(path.join(OUT_DIR, t.slug + ".js"), moduleText(t));
    console.log(report(t).split("\n")[0]);
    n++;
  }
  console.log(`ingest-text: wrote ${n} module(s); index.js lists ${writeIndex()}.`);
  if (bad) { console.error(`ingest-text: ${bad} raw file(s) have problems and were not written.`); process.exit(1); }
} else if (args[0]) {
  const t = build(args[0]);
  const probs = problems(t);
  if (probs.length) { console.error(`${args[0]}:\n  ${probs.join("\n  ")}`); process.exit(1); }
  fs.writeFileSync(path.join(OUT_DIR, t.slug + ".js"), moduleText(t));
  console.log(report(t));
  console.log(`index.js lists ${writeIndex()} text(s).`);
} else {
  console.log("usage: node scripts/ingest-text.mjs <raw.txt> | --measure <raw.txt> | --all | --check");
}
