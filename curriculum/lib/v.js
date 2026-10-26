// Visual specifications for the child's screen. These are plain data; the
// browser renderer (src/assets/js/visuals.js) draws them. Keep the two in step.

export const ICONS = [
  "apple", "star", "duck", "fish", "ball", "car", "flower", "bird",
  "cookie", "leaf", "block", "frog", "ladybug", "boat",
];
export const COLORS = ["red", "blue", "yellow", "green", "purple", "orange"];
// The hand-drawn diagrams in src/assets/js/diagrams.js, by kind.
export const DIAGRAMS = ["plant", "insect", "body", "earth-sun-moon", "water-cycle", "circuit", "food-chain"];

export const V = {
  // Speech picture: an exercise that is only spoken.
  say: () => ({ t: "say" }),
  // A numeral or several numerals side by side. dots: show a dot pattern under it.
  num: (v, o = {}) => ({ t: "num", v, ...o }),
  // A row of numbers in boxes; "?" marks a blank. hl: index to highlight.
  seq: (items, o = {}) => ({ t: "seq", items, ...o }),
  // Dots. arr: row (rows of five) | dice | five | scatter | circle | array | line
  dots: (n, o = {}) => ({ t: "dots", n, arr: "row", ...o }),
  // Pictures of objects. tap: child can touch each to mark it. cross: number crossed out.
  obj: (icon, n, o = {}) => ({ t: "obj", icon, n, arr: "row", ...o }),
  // Five-frame or ten-frame. n filled counters; n2 counters of a second color after them.
  frame: (size, n, o = {}) => ({ t: "frame", size, n, ...o }),
  // Equation tokens, e.g. eq(3, "+", 2, "=", "?"). Operators: + − × ÷ = < >
  eq: (...parts) => ({ t: "eq", parts }),
  // Column problem: col(34, "+", 25). show: show the answer row.
  col: (a, op, b, o = {}) => ({ t: "col", a, op, b, ...o }),
  // Options the child touches; ans is the index of the right one.
  choices: (opts, ans, o = {}) => ({ t: "choices", opts, ans, ...o }),
  // Two rows of objects matched one to one. tap with ans 0 (top) or 1 (bottom).
  match: (a, b, o = {}) => ({ t: "match", a, b, icon: "cookie", lines: true, ...o }),
  // A flat shape. s: circle | square | rectangle | triangle | hexagon | ... c: color.
  shape: (s, o = {}) => ({ t: "shape", s, ...o }),
  // A solid. s: cube | sphere | cone | cylinder
  solid: (s, o = {}) => ({ t: "solid", s, ...o }),
  // Position scene: rel on | under | next | above | behind | in | front | beside
  scene: (rel, o = {}) => ({ t: "scene", rel, obj: "ball", ...o }),
  // A line of pictures for ordinals, with an arrow showing which end is first.
  lineup: (icons, o = {}) => ({ t: "lineup", icons, ...o }),
  // Size comparison. kind: big | long | tall | heavy. items: relative sizes.
  size: (kind, items, o = {}) => ({ t: "size", kind, items, ...o }),
  // Pattern of shape or icon tokens, with blanks to fill.
  pattern: (items, o = {}) => ({ t: "pattern", items, blanks: 0, ...o }),
  // Story picture. start objects; add arrive; take leave (crossed out).
  story: (icon, start, o = {}) => ({ t: "story", icon, start, ...o }),
  // Number family: two small numbers and the big number. miss: "a" | "b" | "c".
  family: (a, b, c, miss) => ({ t: "family", a, b, c, miss: miss || null }),
  // Tens and ones: sticks for tens, dots for ones. chart: draw a two-column chart.
  pv: (tens, ones, o = {}) => ({ t: "pv", tens, ones, ...o }),
  // Number line from..to. hl: highlighted number. hops: [from, to] arrow.
  // by: the step between ticks (10, 100, 0.1); denom: ticks at fractions of
  // a unit (4 for fourths); labelsEvery: label every nth tick; points:
  // [{ v, label }] marks at values.
  nl: (from, to, o = {}) => ({ t: "nl", from, to, ...o }),
  // Clock face. digital: show a digital clock instead.
  clock: (h, m, o = {}) => ({ t: "clock", h, m, ...o }),
  // Graph. kind picture | tally | bar | plot. cats: [{icon | label, n}].
  // bar: a scaled bar graph (scale: units per gridline). plot: a line plot
  // (cats are the values, n the count of x marks above each).
  graph: (kind, cats, o = {}) => ({ t: "graph", kind, cats, ...o }),
  tally: (n) => ({ t: "tally", n }),
  // Shape cut into parts. cut: halves | fourths | unequal2 | unequal4. shade: parts shaded.
  parts: (s, cut, o = {}) => ({ t: "parts", s, cut, shade: 0, ...o }),
  // Coins: penny | nickel | dime | quarter
  coins: (list, o = {}) => ({ t: "coins", list, ...o }),
  // Measuring: an object of length len (in units) with units shown below.
  measure: (icon, len, o = {}) => ({ t: "measure", icon, len, ...o }),
  // Several visuals in a row or column.
  row: (...items) => ({ t: "row", items }),
  col2: (...items) => ({ t: "stack", items }),
  // A plus/minus or comparison sign alone, large.
  sign: (s) => ({ t: "sign", s }),

  // ── Grades 2 to 5 ──
  // Column work with any number of rows and up to six digits. rows: the
  // numbers; op: + − ×; ans: the answer; show: true shows it; blank: true
  // shows ? for each digit; carries: digits written above, by column from
  // the right (an array, "" for none); trades: { col, from, to } for a ten
  // or hundred traded (the digit struck and the new one written above).
  colx: (rows, op, o = {}) => ({ t: "colx", rows, op, ...o }),
  // Multiplication with the partial products revealed in turn. a × b, with
  // partials: [{ label, value }] and show: how many to reveal (0 to all).
  mult: (a, b, o = {}) => ({ t: "mult", a, b, show: 0, ...o }),
  // The long division bracket. a ÷ b with steps: [{ q, prod, rem, at }]
  // (quotient digit, the product written under, the remainder, and the
  // digit's place from the left) and show: how many steps to reveal.
  ldiv: (a, b, o = {}) => ({ t: "ldiv", a, b, show: 0, steps: [], ...o }),
  // Base-ten blocks: thousands cubes, hundreds flats, tens rods, ones.
  blocks: (th, h, t, ones, o = {}) => ({ t: "blocks", th, h, tens: t, ones, ...o }),
  // Fraction notation: n over d, with whole for a mixed number.
  frac: (n, d, o = {}) => ({ t: "frac", n, d, ...o }),
  // A fraction bar in d parts with shade of them shaded, or several bars to
  // compare: bars: [{ d, shade, label }].
  bar: (d, shade, o = {}) => ({ t: "bar", d, shade, ...o }),
  // An array or area model: rows by cols cells. fill: cells filled from the
  // start; labels: true writes the counts on the edges; split: [r, c] draws
  // a line that cuts the grid into four parts (the area model); dots: true
  // draws dots in the cells instead of squares.
  grid: (rows, cols, o = {}) => ({ t: "grid", rows, cols, ...o }),
  // A tape (bar) model: parts: [{ len, label }], with total: the label over
  // the whole, and unknown: the index of the part marked ?.
  tape: (parts, o = {}) => ({ t: "tape", parts, ...o }),
  // A table: head: the column labels; rows: the cells.
  table: (head, rows, o = {}) => ({ t: "table", head, rows, ...o }),
  // A labeled figure. s: rect | square | tri | right-tri | quad | para |
  // trap | poly; sides: labels by side; angles: labels by vertex; right:
  // vertices marked with the right-angle square; w, h: the proportions.
  geo: (s, o = {}) => ({ t: "geo", s, ...o }),
  // An angle of deg degrees, with protractor: true laying a protractor on it.
  angle: (deg, o = {}) => ({ t: "angle", deg, ...o }),
  // A coordinate grid w by h with points: [{ x, y, label }] and lines:
  // [[i, j]] joining points by index.
  coord: (w, h, o = {}) => ({ t: "coord", w, h, points: [], ...o }),
  // A ruler of len units (unit: in | cm), with an object of length obj
  // laid along it, from start.
  ruler: (len, o = {}) => ({ t: "ruler", len, unit: "cm", ...o }),
  // A box of unit cubes l by w by h, for volume.
  cubes: (l, w, h, o = {}) => ({ t: "cubes", l, w, h, ...o }),
  // Text in the interface face: a word problem, a science note, a hint.
  // lines: up to eight lines of up to ninety characters.
  prose: (lines, o = {}) => ({ t: "prose", lines: Array.isArray(lines) ? lines : [lines], ...o }),
  // A poem by stanzas: stanzas: [[line, ...], ...]. fade: 0 (all shown), a
  // share of the words hidden (0.3, 0.6), "first" (first letters only), or
  // "rules" (a line for each line, nothing shown). seed: which words fade.
  poem: (stanzas, o = {}) => ({ t: "poem", stanzas, fade: 0, ...o }),
  // A hand-drawn diagram by kind (DIAGRAMS), with labels: the names shown,
  // tap: true for a label the child touches, ans: the index of the right one.
  diagram: (kind, o = {}) => ({ t: "diagram", kind, ...o }),

  // ── Reading: letters in the child's alphabet ──
  // A word is a list of tokens: { s: "m" } a letter; { s: "th", joined: true }
  // letters that make one sound; { s: "e", macron: true } a long vowel, marked;
  // { s: "e", silent: true } a letter that says nothing; { s: "was", whole: true }
  // a word read whole. stop: true marks a stop sound, so the dot taps.
  // dot: sound | word | fast | line | none, how the dot moves. prompts: full |
  // light | plain, the alphabet's fade stage (light keeps the joined pairs only).
  sound: (tokens, o = {}) => ({ t: "text", kind: "sound", lines: [[tokens]], dot: "sound", ...o }),
  word: (tokens, o = {}) => ({ t: "text", kind: "word", lines: [[tokens]], dot: "word", ...o }),
  words: (list, o = {}) => ({ t: "text", kind: "words", lines: list.map((w) => [w]), dot: "none", ...o }),
  line: (words, o = {}) => ({ t: "text", kind: "line", lines: [words], dot: "line", ...o }),
  passage: (lines, o = {}) => ({ t: "text", kind: "story", lines, dot: "line", ...o }),
};

// Token helpers for the child's alphabet.
export const T = {
  l: (s, o = {}) => ({ s, ...o }),
  j: (s, o = {}) => ({ s, joined: true, ...o }),
  m: (s, o = {}) => ({ s, macron: true, ...o }),
  q: (s, o = {}) => ({ s, silent: true, ...o }),
  w: (s, o = {}) => ({ s, whole: true, ...o }),
  // Punctuation, carried by the word it follows; the dot never rests on it.
  p: (s) => ({ s, punct: true }),
};
// The plain spelling of a token list.
export function spelling(tokens) { return (tokens || []).map((t) => t.s).join(""); }

// A shape token for patterns and sorting.
export function tok(s, c, o = {}) {
  return { s, c, ...o };
}
