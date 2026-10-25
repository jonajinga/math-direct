// Visual specifications for the child's screen. These are plain data; the
// browser renderer (src/assets/js/visuals.js) draws them. Keep the two in step.

export const ICONS = [
  "apple", "star", "duck", "fish", "ball", "car", "flower", "bird",
  "cookie", "leaf", "block", "frog", "ladybug", "boat",
];
export const COLORS = ["red", "blue", "yellow", "green", "purple", "orange"];

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
  // Equation tokens, e.g. eq(3, "+", 2, "=", "?").
  eq: (...parts) => ({ t: "eq", parts }),
  // Column problem: col(34, "+", 25). show: show the answer row.
  col: (a, op, b, o = {}) => ({ t: "col", a, op, b, ...o }),
  // Options the child touches; ans is the index of the right one.
  choices: (opts, ans, o = {}) => ({ t: "choices", opts, ans, ...o }),
  // Two rows of objects matched one to one. tap with ans 0 (top) or 1 (bottom).
  match: (a, b, o = {}) => ({ t: "match", a, b, icon: "cookie", lines: true, ...o }),
  // A single shape: s circle | oval | square | rectangle | triangle | hexagon |
  // rhombus | trapezoid | pentagon | triangle-open | square-open
  shape: (s, o = {}) => ({ t: "shape", s, ...o }),
  // A solid: sphere | cube | cylinder | cone | box
  solid: (s, o = {}) => ({ t: "solid", s, ...o }),
  // Position picture: rel on | under | next | above | in | front | behind
  scene: (rel, o = {}) => ({ t: "scene", rel, obj: "ball", ...o }),
  // A line of pictures facing the flag at the front (for first, second, last...).
  lineup: (icons, o = {}) => ({ t: "lineup", icons, ...o }),
  // Comparison: kind big | long | tall | heavy | holds. items: sizes (0 to 1).
  size: (kind, items, o = {}) => ({ t: "size", kind, items, ...o }),
  // Pattern of tokens {icon} or {s, c}; blanks at the end shown as boxes.
  pattern: (items, o = {}) => ({ t: "pattern", items, blanks: 0, ...o }),
  // Story picture. start objects; add arrive; take leave (crossed out).
  story: (icon, start, o = {}) => ({ t: "story", icon, start, ...o }),
  // Number family: two small numbers and the big number. miss: "a" | "b" | "c".
  family: (a, b, c, miss) => ({ t: "family", a, b, c, miss: miss || null }),
  // Tens and ones: sticks for tens, dots for ones. chart: draw a two-column chart.
  pv: (tens, ones, o = {}) => ({ t: "pv", tens, ones, ...o }),
  // Number line from..to. hl: highlighted number. hops: [from, to] arrow.
  nl: (from, to, o = {}) => ({ t: "nl", from, to, ...o }),
  // Clock face. digital: show a digital clock instead.
  clock: (h, m, o = {}) => ({ t: "clock", h, m, ...o }),
  // Graph. kind picture | tally. cats: [{icon, n}]
  graph: (kind, cats, o = {}) => ({ t: "graph", kind, cats, ...o }),
  tally: (n) => ({ t: "tally", n }),
  // Shape cut into parts. cut: halves | fourths | unequal2 | unequal4. shade: parts shaded.
  parts: (s, cut, o = {}) => ({ t: "parts", s, cut, shade: 0, ...o }),
  // Coins: penny | nickel | dime | quarter
  coins: (list, o = {}) => ({ t: "coins", list, ...o }),
  // Measuring: an object of length len (in units) with units shown below.
  measure: (icon, len, o = {}) => ({ t: "measure", icon, len, ...o }),
  // Watch me write: an animated numeral.
  write: (d) => ({ t: "write", d: String(d) }),
  // Several visuals in a row or column.
  row: (...items) => ({ t: "row", items }),
  col2: (...items) => ({ t: "stack", items }),
  // A plus/minus or comparison sign alone, large.
  sign: (s) => ({ t: "sign", s }),
};

// A shape token for patterns and sorting.
export function tok(s, c, o = {}) {
  return { s, c, ...o };
}
