// Checks every lesson against the rules in docs/curriculum-plan.md. Any
// error stops the build, so a broken lesson can never reach a child.

import { readableOf, parseAnswer, answerText } from "./numbers.js";
import { DIAGRAMS } from "./v.js";

export const STEP_SECONDS = { model: 18, lead: 14, test: 12, note: 20 };
// About how long one step takes, for the lesson estimate and the density cap.
export function stepSeconds(st) {
  let t = st.secs || STEP_SECONDS[st.cue] || 10;
  if (st.skill === "count" || st.skill === "story") t += 8;
  if (st.answer && st.answer.length > 60) t += 6;
  return t;
}
export const BANNED = /\b(brilliant|fantastic|awesome|amazing|super job|great job|good job|way to go|superstar|genius|wow)\b/i;
const NUMERAL_TYPES = new Set(["num", "seq", "eq", "col", "family", "colx", "mult", "ldiv", "frac"]);
const QUANTITY_TYPES = new Set(["dots", "obj", "frame", "story", "match", "pv", "blocks"]);
const KNOWN_TYPES = new Set(["say", "num", "sign", "seq", "dots", "obj", "frame", "eq", "col", "choices", "row", "stack", "match", "shape", "solid", "scene", "lineup", "size", "pattern", "story", "family", "pv", "nl", "clock", "graph", "tally", "parts", "coins", "measure", "text", "blank",
  "colx", "mult", "ldiv", "blocks", "frac", "bar", "grid", "tape", "table", "geo", "angle", "coord", "ruler", "cubes", "prose", "poem", "diagram"]);

function walk(vis, fn) {
  if (!vis) return;
  if (Array.isArray(vis)) return vis.forEach((v) => walk(v, fn));
  fn(vis);
  if (vis.items && Array.isArray(vis.items) && vis.t !== "pattern" && vis.t !== "size") walk(vis.items, fn);
  if (vis.opts) walk(vis.opts, fn);
}

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function estimateMinutes(lesson) {
  let s = 0;
  for (const ex of lesson.exercises) {
    s += 10; // moving between exercises
    for (const st of ex.steps) s += stepSeconds(st);
  }
  if (lesson.independent) s += 10 + lesson.independent.steps.length * STEP_SECONDS.test;
  return Math.round(s / 60);
}

// One touch answers each On your own item: exactly one group to touch, no
// pictures to mark one by one.
function tapGroups(screen) {
  let groups = 0;
  walk(screen, (v) => {
    if (v.t === "choices" && Array.isArray(v.opts)) groups++;
    else if (v.tap && v.t !== "obj" && typeof v.ans === "number") groups++;
  });
  return groups;
}
export function validateIndependent(level, lesson, errors) {
  const own = lesson.independent;
  if (!own) return;
  const L = `${level.id} lesson ${lesson.number}, On your own`;
  if (own.steps.length < 3 || own.steps.length > 8) errors.push(`${L}: ${own.steps.length} items, not 3 to 8`);
  own.steps.forEach((st, i) => {
    const where = `${L}, item ${i + 1}`;
    validateStep(st, where, errors);
    checkReadable(level, lesson.number, st, where, errors);
    if (st.cue !== "test") errors.push(`${where}: not a test step`);
    if (level.subject === "reading") {
      if (!hasTextVisual(st.screen)) errors.push(`${where}: a reading item must show letters`);
      return;
    }
    if (tapGroups(st.screen) !== 1) errors.push(`${where}: needs exactly one group to touch`);
    if (!/^\(Touches/.test(st.answer || "")) errors.push(`${where}: the answer is not a touch`);
  });
}

// Every number printed on the child's screen: whole numbers as numbers,
// fractions and decimals as values (see numbers.js).
function printedNumbers(screen) {
  const out = [];
  walk(screen, (v) => {
    const add = (x) => { if (typeof x === "number") out.push(x); else if (typeof x === "string" && /^\d/.test(x)) { const p = parseAnswer(x); if (p) out.push(p.kind === "int" ? p.value : p); } };
    if (v.t === "num") (Array.isArray(v.v) ? v.v : [v.v]).forEach(add);
    if (v.t === "eq") v.parts.forEach(add);
    if (v.t === "seq") v.items.forEach(add);
    if (v.t === "family") { if (v.miss !== "a") add(v.a); if (v.miss !== "b") add(v.b); if (v.miss !== "c") add(v.c); }
    if (v.t === "col") { add(v.a); add(v.b); if (v.show) add(v.ans); }
    if (v.t === "colx") { (v.rows || []).forEach(add); if (v.show) add(v.ans); }
    if (v.t === "mult") { add(v.a); add(v.b); (v.partials || []).slice(0, v.show || 0).forEach((p) => add(p.value)); }
    if (v.t === "ldiv") { add(v.a); add(v.b); }
    if (v.t === "frac") out.push({ kind: v.whole ? "mixed" : "frac", n: v.n, d: v.d, whole: v.whole, value: (v.whole || 0) + v.n / v.d });
    if (v.t === "nl") {
      const by = v.by || 1;
      if (v.denom) { for (let i = v.from; i <= v.to; i++) add(i); }
      else for (let x = v.from; x <= v.to + 1e-9; x += by) add(Number.isInteger(by) ? x : Number(x.toFixed(String(by).split(".")[1]?.length || 1)));
      (v.points || []).forEach((p) => add(p.v));
    }
    if (v.t === "grid" && v.labels) { add(v.rows); add(v.cols); }
    if (v.t === "table") (v.rows || []).forEach((r) => r.forEach(add));
    if (v.t === "coord") (v.points || []).forEach((p) => { add(p.x); add(p.y); });
    if (v.t === "ruler") for (let i = 0; i <= v.len; i++) add(i);
    if (v.t === "graph" && v.kind === "bar") { const top = Math.max(...v.cats.map((c) => c.n), 0), sc = v.scale || 1; for (let y = 0; y <= top; y += sc) add(y); }
    if (v.t === "graph" && v.kind === "plot") v.cats.forEach((c) => add(c.v !== undefined ? c.v : c.label));
  });
  return out;
}

function hasTextVisual(screen) {
  let found = false;
  walk(screen, (v) => { if (v.t === "text") found = true; });
  return found;
}
export function checkReadable(level, n, st, where, errors) {
  if (level.readableText) {
    // Every sound the letters need, and every word read whole, has been taught.
    const known = level.readableText(n);
    walk(st.screen, (v) => {
      if (v.t !== "text") return;
      for (const line of v.lines) for (const w of line) for (const t of w) {
        if (t.silent || t.punct) continue;
        if (t.whole) { if (!known.words.has(t.s.toLowerCase())) errors.push(`${where}: shows the word ${t.s}, which is not taught until later`); }
        else if (!known.sounds.has(t.sound)) errors.push(`${where}: shows ${t.s} (the sound ${t.sound}), which is not taught until later`);
      }
      if (v.prompts && level.prompts) {
        const stage = (level.prompts.find((p) => n <= p.to) || {}).stage || "plain";
        if (v.prompts !== stage) errors.push(`${where}: alphabet stage ${v.prompts}, but lesson ${n} is ${stage}`);
      }
    });
  }
  const known = readableOf(level, n);
  if (!known) return;
  for (const x of printedNumbers(st.screen)) {
    if (!known.has(x)) { errors.push(`${where}: shows ${typeof x === "number" ? x : answerText(x)}, which is not taught to read until later`); break; }
  }
}

export function validateStep(st, where, errors) {
  if (!["model", "lead", "test", "note"].includes(st.cue)) errors.push(`${where}: unknown cue "${st.cue}"`);
  if (!st.say || !st.say.trim()) errors.push(`${where}: no words for the parent to say`);
  for (const field of ["say", "do", "answer", "confirm", "correct"]) {
    const v = st[field];
    if (!v) continue;
    if (/!/.test(v)) errors.push(`${where}: exclamation mark in ${field}: "${v}"`);
    if (BANNED.test(v)) errors.push(`${where}: effusive praise in ${field}: "${v}"`);
    if (/undefined|NaN|\[object/.test(v)) errors.push(`${where}: broken text in ${field}: "${v}"`);
  }
  // Hints on a puzzle: one to three, each a plain line that does not give
  // the answer away.
  if (st.hints !== undefined) {
    if (!Array.isArray(st.hints) || !st.hints.length || st.hints.length > 3) errors.push(`${where}: a puzzle has one to three hints`);
    else {
      const a = norm(st.answer).split(" ").filter((w) => w.length > 0);
      const key = a.slice(0, Math.min(a.length, 4)).join(" ");
      const val = parseAnswer(st.answer);
      st.hints.forEach((h, i) => {
        if (typeof h !== "string" || !h.trim()) errors.push(`${where}: hint ${i + 1} is empty`);
        else {
          if (/!/.test(h)) errors.push(`${where}: exclamation mark in hint ${i + 1}`);
          if (BANNED.test(h)) errors.push(`${where}: effusive praise in hint ${i + 1}`);
          const hn = norm(h);
          if (key && !st.answer.startsWith("(") && hn.includes(key)) errors.push(`${where}: hint ${i + 1} gives the answer away`);
          if (val && val.kind === "int" && new RegExp(`\\b${val.value}\\b|\\bis ${norm(answerText(val))}\\b`).test(hn)) errors.push(`${where}: hint ${i + 1} names the answer`);
        }
      });
    }
    if (st.cue !== "test") errors.push(`${where}: hints belong on a test step`);
  }
  if (st.cue === "lead" && !st.answer) errors.push(`${where}: lead step has no answer`);
  if (st.cue === "test") {
    if (!st.answer) errors.push(`${where}: test step has no answer`);
    if (!st.correct) errors.push(`${where}: test step has no correction`);
    if (!st.confirm) errors.push(`${where}: test step has no confirmation`);
    if (st.answer && st.correct && !st.answer.startsWith("(")) {
      const a = norm(st.answer).split(" ").filter((w) => w.length > 0);
      const c = norm(st.correct);
      const key = a.slice(0, Math.min(a.length, 4)).join(" ");
      if (key && !c.includes(key)) errors.push(`${where}: correction does not state the answer "${st.answer}"`);
    }
  }
  const types = [];
  walk(st.screen, (v) => types.push(v));
  if (st.skill === "count" || st.skill === "subitize") {
    if (types.some((v) => NUMERAL_TYPES.has(v.t))) errors.push(`${where}: counting step shows a numeral`);
  }
  if (st.skill === "read") {
    if (types.some((v) => QUANTITY_TYPES.has(v.t))) errors.push(`${where}: reading step shows a quantity`);
    if (types.some((v) => v.t === "num" && v.dots)) errors.push(`${where}: reading step shows dots under the numeral`);
  }
  for (const v of types) {
    if (v.t && !KNOWN_TYPES.has(v.t)) errors.push(`${where}: unknown picture type "${v.t}"`);
    if (v.t === "colx") {
      if (!Array.isArray(v.rows) || v.rows.length < 2) errors.push(`${where}: column work needs two or more rows`);
      else if (v.rows.some((r) => String(r).replace(/\D/g, "").length > 6)) errors.push(`${where}: column work holds at most six digits`);
      if (!["+", "−", "-", "×"].includes(v.op)) errors.push(`${where}: bad column operator "${v.op}"`);
    }
    if (v.t === "mult" && v.partials && v.show > v.partials.length) errors.push(`${where}: shows more partial products than it has`);
    if (v.t === "ldiv" && v.show > (v.steps || []).length) errors.push(`${where}: shows more division steps than it has`);
    if (v.t === "blocks" && [v.th, v.h, v.tens, v.ones].some((x) => !(x >= 0) || x > 9)) errors.push(`${where}: blocks hold 0 to 9 of each kind`);
    if (v.t === "frac" && (!(v.d >= 2) || !(v.n >= 0))) errors.push(`${where}: a fraction needs a denominator of 2 or more`);
    if (v.t === "bar") {
      const bars = v.bars || [{ d: v.d, shade: v.shade }];
      if (bars.some((b) => !(b.d >= 1) || b.d > 12 || b.shade > b.d)) errors.push(`${where}: a fraction bar has 1 to 12 parts, with no more shaded than it has`);
    }
    if (v.t === "grid" && (!(v.rows >= 1) || !(v.cols >= 1) || v.rows * v.cols > 144)) errors.push(`${where}: a grid is 1 to 144 cells`);
    if (v.t === "tape" && (!Array.isArray(v.parts) || !v.parts.length || v.parts.length > 6)) errors.push(`${where}: a tape model has 1 to 6 parts`);
    if (v.t === "table" && (!Array.isArray(v.rows) || v.rows.length > 8 || (v.head && v.head.length > 5))) errors.push(`${where}: a table has at most 8 rows and 5 columns`);
    if (v.t === "coord" && (v.points || []).some((p) => p.x < 0 || p.y < 0 || p.x > v.w || p.y > v.h)) errors.push(`${where}: a point is off the grid`);
    if (v.t === "angle" && !(v.deg > 0 && v.deg < 360)) errors.push(`${where}: an angle is between 0 and 360 degrees`);
    if (v.t === "ruler" && (!(v.len >= 1) || v.len > 30)) errors.push(`${where}: a ruler is 1 to 30 units`);
    if (v.t === "cubes" && [v.l, v.w, v.h].some((x) => !(x >= 1) || x > 6)) errors.push(`${where}: a box of cubes is 1 to 6 each way`);
    if (v.t === "prose") {
      if (!Array.isArray(v.lines) || !v.lines.length || v.lines.length > 8) errors.push(`${where}: prose is one to eight lines`);
      else if (v.lines.some((l) => String(l).length > 90)) errors.push(`${where}: a prose line of more than 90 characters`);
      if ((v.lines || []).some((l) => /!/.test(l))) errors.push(`${where}: exclamation mark in prose`);
    }
    if (v.t === "poem") {
      if (!Array.isArray(v.stanzas) || !v.stanzas.length) errors.push(`${where}: a poem with no stanzas`);
      else if (v.stanzas.some((s) => !Array.isArray(s) || !s.length || s.length > 4)) errors.push(`${where}: a poem shows one to four lines a stanza`);
      if (!(v.fade === 0 || v.fade === undefined || (typeof v.fade === "number" && v.fade > 0 && v.fade < 1) || v.fade === "first" || v.fade === "rules")) errors.push(`${where}: bad poem fade "${v.fade}"`);
    }
    if (v.t === "diagram" && !DIAGRAMS.includes(v.kind)) errors.push(`${where}: unknown diagram "${v.kind}"`);
    if (v.t === "graph" && !["picture", "tally", "bar", "plot"].includes(v.kind || "picture")) errors.push(`${where}: bad graph kind "${v.kind}"`);
    if (v.t === "choices") {
      if (!Array.isArray(v.opts) || !v.opts.length) errors.push(`${where}: choices without options`);
      const ans = Array.isArray(v.ans) ? v.ans : [v.ans];
      for (const a of ans) if (typeof a !== "number" || a < 0 || a >= v.opts.length) errors.push(`${where}: choice answer out of range`);
    }
    if ((v.t === "match" || v.t === "lineup" || v.t === "size") && v.tap && (typeof v.ans !== "number")) {
      errors.push(`${where}: ${v.t} is tappable but has no answer`);
    }
    if (v.t === "eq" && st.value !== undefined && v.check) {
      // optional arithmetic check supplied by formats
    }
    if ((v.t === "dots" || v.t === "obj") && (!(v.n >= 0) || v.n > 30)) errors.push(`${where}: bad count ${v.n}`);
    if (v.t === "frame" && v.size !== 5 && v.size !== 10) errors.push(`${where}: a frame must have 5 or 10 boxes, not "${v.size}"`);
    if (v.t === "text") {
      if (!Array.isArray(v.lines) || !v.lines.length) errors.push(`${where}: text with no lines`);
      else v.lines.forEach((line) => {
        if (!Array.isArray(line) || !line.length) { errors.push(`${where}: a line with no words`); return; }
        line.forEach((w) => { if (!Array.isArray(w) || !w.length || w.some((t) => !t || typeof t.s !== "string" || !t.s)) errors.push(`${where}: a word with a bad token`); });
        if (line.length > 12) errors.push(`${where}: a line of ${line.length} words, more than 12`);
      });
      if (!["sound", "word", "fast", "line", "none"].includes(v.dot || "none")) errors.push(`${where}: bad dot mode "${v.dot}"`);
      if (!["full", "light", "plain"].includes(v.prompts || "full")) errors.push(`${where}: bad alphabet stage "${v.prompts}"`);
      if ((v.kind === "sound" || v.kind === "word") && (v.lines.length !== 1 || v.lines[0].length !== 1)) errors.push(`${where}: a ${v.kind} must be one word`);
    }
  }
  if (typeof st.check === "function") {
    const msg = st.check();
    if (msg) errors.push(`${where}: ${msg}`);
  }
}

export function validateLevel(level, built) {
  const errors = [];
  const warnings = [];
  for (const t of level.tracks) {
    let prev = 0;
    for (const u of t.units) {
      if (u.lesson < 1 || u.lesson > level.lessons) errors.push(`${level.id}/${t.id}/${u.id}: lesson ${u.lesson} out of range`);
      if (u.lesson < prev) errors.push(`${level.id}/${t.id}/${u.id}: units out of order`);
      prev = u.lesson;
      if (!u.label) errors.push(`${level.id}/${t.id}/${u.id}: no label`);
    }
  }
  const seen = {};
  for (const lesson of built.lessons) {
    const L = `${level.id} lesson ${lesson.number}`;
    if (!lesson.exercises.length) errors.push(`${L}: no exercises`);
    let steps = 0;
    const newCount = lesson.exercises.filter((e) => e.kind === "new").length;
    if (newCount > 3) warnings.push(`${L}: ${newCount} new-teaching exercises`);
    lesson.exercises.forEach((ex) => {
      const E = `${L}, exercise ${ex.n} (${ex.trackName})`;
      if (!ex.title) errors.push(`${E}: no title`);
      if (!ex.steps.length) errors.push(`${E}: no steps`);
      if (ex.kind === "new") {
        const cues = new Set(ex.steps.map((s) => s.cue));
        if (!cues.has("model")) errors.push(`${E}: new teaching without a model step`);
        if (!cues.has("lead")) errors.push(`${E}: new teaching without a lead step`);
        if (!cues.has("test")) errors.push(`${E}: new teaching without a test step`);
      } else if (ex.kind === "checkout") {
        if (!(ex.words > 0) || !(ex.goal > 0)) errors.push(`${E}: a checkout needs its word count and goal`);
        if (ex.steps.some((s) => s.cue !== "note" || !hasTextVisual(s.screen))) errors.push(`${E}: a checkout shows lines of text and nothing else`);
      } else if (ex.kind === "puzzle") {
        const tests = ex.steps.filter((s) => s.cue === "test");
        if (!tests.length || tests.length > 2) errors.push(`${E}: a puzzle has one or two test steps`);
        if (!tests.some((s) => s.hints && s.hints.length)) errors.push(`${E}: a puzzle needs hints on its test step`);
      } else if (!ex.steps.some((s) => s.cue === "test")) {
        errors.push(`${E}: ${ex.kind} exercise without a test step`);
      }
      ex.steps.forEach((st, i) => {
        validateStep(st, `${E}, step ${i + 1}`, errors);
        checkReadable(level, lesson.number, st, `${E}, step ${i + 1}`, errors);
        // A line the parent reads aloud should fit in one breath.
        const said = (st.say || "").split(/\s+/).filter(Boolean).length;
        if (said > 30) warnings.push(`${E}, step ${i + 1}: a say line of ${said} words`);
      });
      (ex.spare || []).forEach((st, i) => {
        validateStep(st, `${E}, spare item ${i + 1}`, errors);
        checkReadable(level, lesson.number, st, `${E}, spare item ${i + 1}`, errors);
      });
      steps += ex.steps.length;
      seen[ex.track] = seen[ex.track] || [];
      seen[ex.track].push(lesson.number);
    });
    lesson.steps = steps;
    validateIndependent(level, lesson, errors);
    lesson.minutes = estimateMinutes(lesson);
    const responses = lesson.exercises.reduce((a, e) => a + e.steps.filter((st) => st.cue === "test").length, 0) + (lesson.independent ? lesson.independent.steps.length : 0);
    lesson.responses = responses;
    if (steps > (level.maxSteps || 80)) errors.push(`${L}: ${steps} steps, more than the ${level.maxSteps} allowed`);
    // Direct Instruction density: a band of minutes, and several answers a
    // minute. A puzzle is slow by design: its time is left out of the pace,
    // and puzzles may not take more than two fifths of a lesson.
    const puzzleSeconds = lesson.exercises.filter((e) => e.kind === "puzzle").reduce((a, e) => a + 10 + e.steps.reduce((b, st) => b + stepSeconds(st), 0), 0);
    const paceMinutes = Math.max(0, lesson.minutes - puzzleSeconds / 60);
    const paceResponses = responses - lesson.exercises.filter((e) => e.kind === "puzzle").reduce((a, e) => a + e.steps.filter((st) => st.cue === "test").length, 0);
    if (level.minutesBand && lesson.number > 3) {
      const [lo, hi] = level.minutesBand;
      if (lesson.minutes < lo - 2 || lesson.minutes > hi + 2) warnings.push(`${L}: about ${lesson.minutes} minutes, outside ${lo} to ${hi}`);
    }
    if (paceMinutes >= 4 && paceResponses / paceMinutes < 2.5) warnings.push(`${L}: ${paceResponses} answers in about ${Math.round(paceMinutes)} minutes, fewer than three a minute`);
    if (puzzleSeconds > 0 && puzzleSeconds > lesson.minutes * 60 * 0.4) warnings.push(`${L}: puzzles take ${Math.round(puzzleSeconds / 60)} of ${lesson.minutes} minutes, more than two fifths`);
  }
  // Gaps: once a track has begun, it must come back often.
  for (const t of level.tracks) {
    const lessons = seen[t.id] || [];
    if (!lessons.length) {
      errors.push(`${level.id}/${t.id}: never appears`);
      continue;
    }
    const first = t.units[0].lesson;
    const end = t.retired || level.lessons;
    let last = first;
    for (const n of lessons.concat([end + 1])) {
      if (n < first) continue;
      if (n - last > (t.maxGap || level.maxGap) && last <= end) {
        errors.push(`${level.id}/${t.id}: not seen between lessons ${last} and ${n}`);
      }
      last = n;
    }
  }
  return { errors, warnings };
}

export function validateItems(items, where, errors) {
  items.forEach((st, i) => validateStep(st, `${where}, item ${i + 1}`, errors));
}
