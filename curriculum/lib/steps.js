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

// "Five." -> "Yes, five."
export function yes(answer) {
  if (!answer) return "Yes.";
  if (answer.startsWith("(")) return "Yes.";
  if (answer === "Yes." || answer === "No.") return "Right.";
  // "Six... seven, eight, nine. Nine." -> "Yes, nine."
  const sentences = answer.split(/(?<=\.)\s+/).filter(Boolean);
  if (sentences.length > 1) return "Yes, " + lowerFirst(sentences[sentences.length - 1]);
  // A counting chain: "One, two, three." -> "Yes."
  if ((answer.match(/,/g) || []).length >= 2) return "Yes.";
  return "Yes, " + lowerFirst(answer);
}

export function model(screen, say, opts = {}) {
  return { cue: "model", screen: arr(screen), say, ...opts };
}

export function lead(screen, say, answer, opts = {}) {
  return { cue: "lead", screen: arr(screen), say, answer, ...opts };
}

export function test(screen, say, answer, correct, opts = {}) {
  return {
    cue: "test",
    screen: arr(screen),
    say,
    answer,
    confirm: opts.confirm || yes(answer),
    correct,
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
  const a = lowerFirst(answer.replace(/\.$/, ""));
  return `${preface ? preface + " " : ""}My turn: ${a}. Say it with me: ${a}. Your turn. ${question}`;
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
