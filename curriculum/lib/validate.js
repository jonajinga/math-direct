// Checks every lesson against the rules in docs/curriculum-plan.md. Any
// error stops the build, so a broken lesson can never reach a child.

const STEP_SECONDS = { model: 18, lead: 14, test: 12, note: 20 };
const BANNED = /\b(brilliant|fantastic|awesome|amazing|super job|great job|good job|way to go|superstar|genius|wow)\b/i;
const NUMERAL_TYPES = new Set(["num", "seq", "eq", "col", "family"]);
const QUANTITY_TYPES = new Set(["dots", "obj", "frame", "story", "match", "pv"]);

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
    for (const st of ex.steps) {
      let t = STEP_SECONDS[st.cue] || 10;
      if (st.skill === "count" || st.skill === "story") t += 8;
      if (st.answer && st.answer.length > 60) t += 6;
      s += t;
    }
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
    if (tapGroups(st.screen) !== 1) errors.push(`${where}: needs exactly one group to touch`);
    if (!/^\(Touches/.test(st.answer || "")) errors.push(`${where}: the answer is not a touch`);
  });
}

// Every number printed on the child's screen.
function printedNumbers(screen) {
  const out = [];
  walk(screen, (v) => {
    const add = (x) => { if (typeof x === "number") out.push(x); };
    if (v.t === "num") (Array.isArray(v.v) ? v.v : [v.v]).forEach(add);
    if (v.t === "eq") v.parts.forEach(add);
    if (v.t === "seq") v.items.forEach(add);
    if (v.t === "family") { if (v.miss !== "a") add(v.a); if (v.miss !== "b") add(v.b); if (v.miss !== "c") add(v.c); }
    if (v.t === "col") { add(v.a); add(v.b); if (v.show) add(v.ans); }
    if (v.t === "nl") for (let i = v.from; i <= v.to; i++) add(i);
  });
  return out;
}

export function checkReadable(level, n, st, where, errors) {
  if (!level.readable) return;
  const known = level.readable(n);
  for (const x of printedNumbers(st.screen)) {
    if (!known.has(x)) { errors.push(`${where}: shows ${x}, which is not taught to read until later`); break; }
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
      } else if (!ex.steps.some((s) => s.cue === "test")) {
        errors.push(`${E}: ${ex.kind} exercise without a test step`);
      }
      ex.steps.forEach((st, i) => {
        validateStep(st, `${E}, step ${i + 1}`, errors);
        checkReadable(level, lesson.number, st, `${E}, step ${i + 1}`, errors);
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
    // Direct Instruction density: a band of minutes, and several answers a minute.
    if (level.minutesBand && lesson.number > 3) {
      const [lo, hi] = level.minutesBand;
      if (lesson.minutes < lo - 2 || lesson.minutes > hi + 2) warnings.push(`${L}: about ${lesson.minutes} minutes, outside ${lo} to ${hi}`);
    }
    if (lesson.minutes >= 4 && responses / lesson.minutes < 2.5) warnings.push(`${L}: ${responses} answers in about ${lesson.minutes} minutes, fewer than three a minute`);
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
      if (n - last > level.maxGap && last <= end) {
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
