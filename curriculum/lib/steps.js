// Step builders. Every exercise is a list of steps; each step is one thing the
// parent says and one response from the child.
//
//   model  "My turn."       The parent shows the answer. Nothing is recorded.
//   lead   "Together."      Parent and child respond together. Nothing is recorded.
//   test   "Your turn."     The child responds alone. The parent marks Firm or Error.
//   note   (no cue)         An instruction to the parent, such as setting out objects.

function arr(screen) {
  if (!screen) return [];
  return Array.isArray(screen) ? screen : [screen];
}

function lowerFirst(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

// A spoken list of numbers, such as "One, two, three." or "Ten, nine."
const NUMBER_WORD = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(-[a-z]+)?( hundred( [a-z-]+)?)?$/i;
function isCountingChain(answer) {
  const parts = answer.replace(/\.$/, "").split(", ");
  return parts.length > 1 && parts.every((p) => NUMBER_WORD.test(p.trim()));
}

// The confirmation after a firm answer.
//   "Five."                        -> "Yes, five."
//   "Six... seven, eight. Eight."  -> "Yes, eight."
//   "One, two, three."             -> "Yes."   (a count is confirmed, not repeated)
//   "Yes." / "No."                 -> "Right."
export function yes(answer) {
  if (!answer) return "Yes.";
  if (answer.startsWith("(")) return "Yes.";
  if (answer === "Yes." || answer === "No.") return "Right.";
  const sentences = answer.split(/(?<=[.?])\s+/).filter(Boolean);
  const last = sentences[sentences.length - 1];
  if (last === "Yes." || last === "No.") return "Right.";
  // Several sentences, such as the four facts of a family: confirm without repeating them.
  if (sentences.length > 2) return "Yes.";
  if (sentences.length > 1) return "Yes, " + lowerFirst(last);
  if (isCountingChain(answer)) return "Yes.";
  return "Yes, " + lowerFirst(answer);
}

export function model(screen, say, opts = {}) {
  return { cue: "model", screen: arr(screen), say, ...opts };
}

export function lead(screen, say, answer, opts = {}) {
  return { cue: "lead", screen: arr(screen), say, answer, ...opts };
}

// The signal the parent gives for a response: a touch on the screen, a hand
// drop after "Get ready", a rhythm for a counting chain, or a watch for the
// child's action.
function hasTap(screen) {
  let found = false;
  (function walk(v) {
    if (!v || found) return;
    if (Array.isArray(v)) return v.forEach(walk);
    if (v.tap || v.t === "choices") found = true;
    if (v.items && v.t !== "pattern" && v.t !== "size") walk(v.items);
  })(screen);
  return found;
}
export function inferSignal(screen, say, answer) {
  if (hasTap(screen) || /^\(Touches/.test(answer || "")) return "touch";
  if (/\bcount\b/i.test(say || "")) return "rhythm";
  if (/get ready\.?$/i.test(say || "")) return "drop";
  return "watch";
}

export function test(screen, say, answer, correct, opts = {}) {
  const scr = arr(screen);
  return {
    cue: "test",
    screen: scr,
    say,
    answer,
    confirm: opts.confirm || yes(answer),
    correct,
    signal: inferSignal(scr, say, answer),
    ...(opts.skill === "story" ? { pause: 3 } : {}),
    ...opts,
  };
}

export function note(screen, say, opts = {}) {
  return { cue: "note", screen: arr(screen), say, ...opts };
}

// Correction for a spoken answer: model, lead, test.
//   fix("Five.", "How many dots?")
//   -> "My turn: five. Say it with me: five. Your turn. How many dots?"
export function fix(answer, question, preface) {
  const end = answer.endsWith("?") ? "?" : ".";
  const a = lowerFirst(answer.replace(/[.?]$/, ""));
  return `${preface ? preface + " " : ""}My turn: ${a}${end} Say it with me: ${a}${end} Your turn. ${question}`;
}

// Correction for a pointing answer: show it, then test again.
export function fixPoint(show, question, preface) {
  return `${preface ? preface + " " : ""}My turn. ${show} Your turn. ${question}`;
}

// Correction for a chain (counting): model, lead, test. A long chain is
// printed once; the parent leads it again from the same line.
export function fixChain(chainText, question) {
  const c = lowerFirst(chainText);
  const long = chainText.split(",").length > 6;
  return `Stop. My turn: ${c} Do it with me${long ? ". (Say the same numbers together.)" : `: ${c}`} Your turn. ${question}`;
}

export function exercise(track, kind, title, steps, extra = {}) {
  return { track: track.id, trackName: track.name, kind, title, steps, ...extra };
}
