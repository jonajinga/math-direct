// Second Grade: the puzzle track. See BRIEF.md, "Puzzles". One puzzle ends
// every lesson once the track begins at lesson 2. Each unit is a family of
// puzzles with a generator; the child works the puzzle on the whiteboard and
// the parent has one to three hints on the Hint button. A puzzle uses only
// what the other tracks have taught by its lesson, has a twist, and rewards a
// clever way of looking. Every answer is computed, never typed.

import { V, model, test, note, fix, fixWork, word, Word, favorNew, prose, WHITEBOARD, NAMES, cap, intWhere } from "./common2.js";

const INTRO = "Read the puzzle with the child. The child works it on the whiteboard. Hints are on the Hint button.";

// Text that is printed as numerals and spoken as words: a line builder takes
// a formatter f (String for the screen, word for the script); F(f) starts a
// sentence with it.
const F = (f) => (n) => cap(f(n));
const list = (items) => (items.length <= 2 ? items.join(" and ") : items.slice(0, -1).join(", ") + ", and " + items[items.length - 1]);
const plural = (n, one, many) => (n === 1 ? one : many || one + "s");
// A pronoun set for a name from NAMES.
function who(entry) {
  const [name, pro] = entry;
  return { name, she: pro, She: cap(pro), her: pro === "she" ? "her" : "him", hers: pro === "she" ? "her" : "his" };
}
const unique = (r, list) => r.shuffle(list);
const sum = (a) => a.reduce((x, y) => x + y, 0);
// All orderings of a short list.
function perms(list) {
  if (list.length <= 1) return [list];
  const out = [];
  list.forEach((x, i) => perms(list.filter((_, j) => j !== i)).forEach((p) => out.push([x, ...p])));
  return out;
}

// The scheduler pads a short review with more test steps from the same
// track, which would make a puzzle of four. A puzzle is one puzzle: its
// step list takes no appended steps.
// A generated puzzle: { screen, read, ask, answer, think, hints, key, confirm? }.
//   read   the puzzle in words, as the parent says it
//   ask    the question, asked again after an error
//   think  the way to the answer, said in the model and before the correction
function puzzleStep(p) {
  return test(p.screen, `${p.read} ${p.ask}`, p.answer, p.keep ? fix(p.answer, p.ask, p.think, { keep: true }) : fixWork(p.answer, p.ask, p.think), {
    skill: "puzzle", item: p.key, secs: 200, signal: "watch", do: WHITEBOARD, hints: p.hints, ...(p.confirm ? { confirm: p.confirm } : {}),
  });
}

// The way to an answer, said in model steps short enough for one breath,
// split at the ends of sentences.
function modelSteps(screen, think) {
  const sentences = think.match(/[^.?]+[.?]+/g) || [think];
  const parts = [];
  let cur = "";
  for (const sent of sentences) {
    const next = `${cur} ${sent.trim()}`.trim();
    if (cur && next.split(/\s+/).length > 26) { parts.push(cur); cur = sent.trim(); } else cur = next;
  }
  if (cur) parts.push(cur);
  return parts.map((t, i) => model(screen, i === 0 ? `My turn. ${t}` : t));
}

// ─────────────────────────────────────────────────────────────
// Digit cards (lesson 2): place the digits for the greatest or least result
// ─────────────────────────────────────────────────────────────
function digitCards(r, lesson) {
  if (lesson < 30) {
    const greatest = r() < 0.5;
    let ds, best;
    // Before carrying is taught (lesson 9), the two digits added stay within the ten.
    for (let tries = 0; tries < 50; tries++) {
      ds = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3);
      const all = perms(ds).map(([a, b, c]) => ({ n: 10 * a + b, c, v: 10 * a + b + c }));
      best = all.reduce((x, y) => (greatest ? (y.v > x.v ? y : x) : (y.v < x.v ? y : x)));
      if (lesson >= 9 || best.n % 10 + best.c <= 9) break;
    }
    const goal = greatest ? "greatest" : "least";
    const sorted = ds.slice().sort((a, b) => a - b);
    const tensDigit = greatest ? sorted[2] : sorted[0];
    const lines = (f) => [`Use the digits ${list(ds.map(f))} once each.`, "Make a two-digit number and a one-digit number.", `What is the ${goal} sum you can make?`];
    return {
      screen: prose(lines(String)), read: lines(word).slice(0, 2).join(" "), ask: lines(word)[2],
      answer: `${Word(best.v)}.`,
      think: `The tens digit counts most, so the ${greatest ? "biggest" : "smallest"} digit, ${word(tensDigit)}, goes in the tens place. The other two digits are added either way: ${word(best.n)} plus ${word(best.c)} is ${word(best.v)}.`,
      hints: ["Which place makes a number big, the tens or the ones?", `Put the ${greatest ? "biggest" : "smallest"} digit where it counts most.`, "Try the other two digits both ways. Does the sum change?"],
      key: `pz:digit-cards:${ds.join("")}:${goal}`,
    };
  }
  const ds = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
  const kind = r.pick(["greatest sum", "least sum", "greatest difference", "least difference"]);
  const [adj, op] = kind.split(" ");
  const all = perms(ds).map(([a, b, c, d]) => {
    const n1 = 10 * a + b, n2 = 10 * c + d;
    return { n1, n2, v: op === "sum" ? n1 + n2 : n1 - n2 };
  }).filter((x) => x.v > 0);
  const best = all.reduce((x, y) => (adj === "greatest" ? (y.v > x.v ? y : x) : (y.v < x.v ? y : x)));
  const lines = (f) => [`Use the digits ${list(ds.map(f))} once each.`, "Make two two-digit numbers.", `What is the ${kind} you can make?`];
  const tens = [Math.floor(best.n1 / 10), Math.floor(best.n2 / 10)], ones = [best.n1 % 10, best.n2 % 10];
  let think, hints;
  if (op === "sum") {
    think = `The tens digits count most, so ${word(tens[0])} and ${word(tens[1])} go in the tens places and ${word(ones[0])} and ${word(ones[1])} in the ones. ${Word(best.n1)} plus ${word(best.n2)} is ${word(best.v)}.`;
    hints = ["Which place counts most, the tens or the ones?", `Put the two ${adj === "greatest" ? "biggest" : "smallest"} digits in the tens places.`, "The other two digits go in the ones places. Then add."];
  } else if (adj === "greatest") {
    think = `Make one number as big as it can be, ${word(best.n1)}, and the other as small as it can be, ${word(best.n2)}. ${Word(best.n1)} minus ${word(best.n2)} is ${word(best.v)}.`;
    hints = ["To make a difference big, one number should be big and the other small.", "Make the biggest two-digit number you can, and the smallest.", "Subtract the small number from the big one."];
  } else {
    think = `Tens digits that are next to each other keep the numbers close. Then give the bigger number a small ones digit and the smaller number a big ones digit: ${word(best.n1)} and ${word(best.n2)}. ${Word(best.n1)} minus ${word(best.n2)} is ${word(best.v)}.`;
    hints = ["To make a difference small, both numbers should be close together.", "Which digits are next to each other in size? Try them as the tens digits.", "Give the bigger number a small ones digit and the smaller number a big ones digit."];
  }
  return {
    screen: prose(lines(String)), read: lines(word).slice(0, 2).join(" "), ask: lines(word)[2],
    answer: `${Word(best.v)}.`, think, hints, key: `pz:digit-cards:${ds.join("")}:${kind.replace(" ", "-")}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Patterns (lesson 6): skip counts with gaps; later, growing steps
// ─────────────────────────────────────────────────────────────
function patterns(r, lesson) {
  const kinds = ["by5", "by10from"];
  if (lesson >= 10) kinds.push("by2");
  if (lesson >= 26) kinds.push("by100");
  if (lesson >= 30) kinds.push("back10", "back5");
  if (lesson >= 40) kinds.push("grow", "grow", "shrink");
  if (lesson >= 45) kinds.push("by5from");
  const kind = r.pick(kinds);
  const len = 6;
  let terms = [], by = 0, rule;
  if (kind === "grow" || kind === "shrink") {
    // The step changes by one each time: 1, 2, 4, 7, 11, 16 or 40, 38, 35, 31, 26, 20.
    const first = r.int(1, 4), start = kind === "grow" ? r.int(1, 30) : r.int(40, 90);
    let v = start, step = first;
    for (let i = 0; i < len; i++) { terms.push(v); v += kind === "grow" ? step : -step; step++; }
    rule = "grows";
  } else {
    by = { by5: 5, by10from: 10, by2: 2, by100: 100, back10: -10, back5: -5, by5from: 5 }[kind];
    const start = kind === "by5" ? 5 * r.int(1, 8)
      : kind === "by10from" ? r.int(2, 9) + 10 * r.int(0, 5)
      : kind === "by2" ? 2 * r.int(1, 20)
      : kind === "by100" ? r.int(1, 3) * 100 + r.int(0, 99)
      : kind === "back10" ? r.int(70, 99)
      : kind === "back5" ? 5 * r.int(10, 19)
      : 5 * r.int(2, 15) + r.int(1, 4);
    for (let i = 0; i < len; i++) terms.push(start + i * by);
    rule = by > 0 ? `counts by ${word(by)}` : `counts back by ${word(-by)}`;
  }
  // One or two blanks, never the first two terms, never two blanks in a row
  // at the start, so the step can be seen.
  const spots = [2, 3, 4, 5];
  const blanks = r.sample(spots, r.int(1, 2)).sort((a, b) => a - b);
  const items = terms.map((t, i) => (blanks.includes(i) ? "?" : t));
  const missing = blanks.map((i) => terms[i]);
  const spoken = items.map((x) => (x === "?" ? "blank" : word(x)));
  // The numbers are on the screen; a child reads them, so the script does not.
  const read = "Read the numbers. Say blank for a blank.";
  const ask = blanks.length === 1 ? "What is the missing number?" : "What are the missing numbers?";
  let think;
  if (kind === "grow" || kind === "shrink") {
    const d = terms.slice(1).map((t, i) => Math.abs(t - terms[i]));
    think = `Look at the jumps. ${Word(terms[0])} to ${word(terms[1])} is ${kind === "grow" ? "up" : "down"} ${word(d[0])}, then ${kind === "grow" ? "up" : "down"} ${word(d[1])}. Each jump is one more than the last. So the jumps go ${list(d.map(word))}. The missing ${plural(missing.length, "number is", "numbers are")} ${list(missing.map(word))}.`;
  } else {
    const i = terms.findIndex((t, k) => !blanks.includes(k) && !blanks.includes(k + 1) && k + 1 < len);
    think = `${Word(terms[i])} to ${word(terms[i + 1])} is ${by > 0 ? "up" : "down"} ${word(Math.abs(by))}, so the pattern ${rule}. ${missing.map((m, k) => `${Word(terms[blanks[k] - 1])} ${by > 0 ? "and" : "take away"} ${word(Math.abs(by))} is ${word(m)}.`).join(" ")}`;
  }
  const hints = kind === "grow" || kind === "shrink"
    ? ["Look at two numbers that sit next to each other. How big is the jump between them?", "Now look at the next jump. Is it the same, or does it change?", "Each jump changes by the same amount. Keep that going into the blanks."]
    : ["Find two numbers next to each other with no blank between them. How much does the pattern go up or down?", "The pattern jumps the same amount every time.", "Start at the number before a blank and jump once more."];
  return {
    screen: [prose(["Find the missing numbers."]), V.seq(items)], read, ask,
    answer: `${list(missing.map(Word))}.`.replace(/ and (\w)/, (m, c) => ` and ${c.toLowerCase()}`),
    think, hints, key: `pz:patterns:${items.join(".")}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Chains (lesson 11): who has the most; later, with numbers
// ─────────────────────────────────────────────────────────────
function chains(r, lesson) {
  const names = r.sample(NAMES, 3).map(who);
  const item = r.pick(["marbles", "stickers", "shells", "cards", "beads", "stamps"]);
  if (lesson < 50) {
    const order = unique(r, names); // most to fewest
    const pair = (hi, lo) => (r() < 0.5 ? `${hi.name} has more ${item} than ${lo.name}.` : `${lo.name} has fewer ${item} than ${hi.name}.`);
    const clues = r.shuffle([pair(order[0], order[1]), pair(order[1], order[2])]);
    const most = r() < 0.5;
    const ans = most ? order[0] : order[2];
    const ask = `Who has the ${most ? "most" : "fewest"} ${item}?`;
    return {
      screen: prose([...clues, ask]), read: clues.join(" "), ask,
      answer: `${ans.name}.`, keep: true, confirm: `Yes, ${ans.name}.`,
      think: `${order[0].name} has more than ${order[1].name}, and ${order[1].name} has more than ${order[2].name}. From most to fewest: ${order.map((n) => n.name).join(", ")}. The ${most ? "most" : "fewest"} is ${ans.name}.`,
      hints: ["Put the three children in a line from most to fewest.", "Take one clue. Who is ahead of whom? Then fit the other clue in.", "'Fewer than' means the other child has more."],
      key: `pz:chains:${order.map((n) => n.name[0]).join("")}:${clues.map((c) => c[0] + (c.includes(" more ") ? "+" : "-")).join("")}:${most ? "most" : "fewest"}:${item}`,
    };
  }
  const [a, b, c] = names;
  const v0 = r.int(12, 60);
  const more1 = r() < 0.5, more2 = r() < 0.5;
  const d1 = intWhere(r, 3, 30, (d) => (more1 ? v0 + d <= 90 : v0 - d >= 5));
  const v1 = more1 ? v0 + d1 : v0 - d1;
  const d2 = intWhere(r, 3, 30, (d) => (more2 ? v1 + d <= 99 : v1 - d >= 2));
  const v2 = more2 ? v1 + d2 : v1 - d2;
  const lines = (f) => [`${a.name} has ${f(v0)} ${item}.`, `${b.name} has ${f(d1)} ${more1 ? "more" : "fewer"} than ${a.name}.`, `${c.name} has ${f(d2)} ${more2 ? "more" : "fewer"} than ${b.name}.`];
  const orderIdx = r.shuffle([0, 1, 2]);
  const ask = `How many ${item} does ${c.name} have?`;
  return {
    screen: prose([...orderIdx.map((i) => lines(String)[i]), ask]), read: orderIdx.map((i) => lines(word)[i]).join(" "), ask,
    answer: `${Word(v2)}.`,
    think: `Start with the number you know: ${a.name} has ${word(v0)}. ${b.name} has ${word(d1)} ${more1 ? "more" : "fewer"}: ${word(v0)} ${more1 ? "plus" : "minus"} ${word(d1)} is ${word(v1)}. ${c.name} has ${word(d2)} ${more2 ? "more" : "fewer"} than ${b.name}: ${word(v1)} ${more2 ? "plus" : "minus"} ${word(d2)} is ${word(v2)}.`,
    hints: ["Which child's number do you know for sure? Start there.", "Find the second child's number from the first. Then the third child's from the second.", "'More than' means add. 'Fewer than' means subtract."],
    key: `pz:chains:n:${v0}:${more1 ? "+" : "-"}${d1}:${more2 ? "+" : "-"}${d2}:${names.map((n) => n.name[0]).join("")}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Perimeter (lesson 26): how far around a shape made of squares
// ─────────────────────────────────────────────────────────────
function gridPerimeter(rows, cols, fill) {
  const on = (i, j) => i >= 0 && j >= 0 && i < rows && j < cols && i * cols + j < fill;
  let p = 0;
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    if (!on(i, j)) continue;
    for (const [y, x] of [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]) if (!on(y, x)) p++;
  }
  return p;
}
function perimeter(r, lesson) {
  const kind = r.pick(["grid", "grid", "rect", "square"]);
  if (kind === "grid") {
    const rows = r.int(2, 3), cols = r.int(3, 5);
    const fill = r.int(cols + 1, rows * cols);
    const P = gridPerimeter(rows, cols, fill);
    const k = Math.floor(fill / cols), m = fill % cols;
    const lines = ["The blue shape is made of squares. Each small square has sides of 1.", "How far is it around the blue shape?"];
    const read = "The blue shape is made of squares. Each small square has sides of one.";
    const side = m ? k + 1 : k;
    const think = `Walk around the outside and count the square sides. Across the top: ${word(cols)}. Down the right side: ${word(side)}${m ? ", counting the step" : ""}. Along the bottom edges: ${word(cols)} in all. Up the left side: ${word(side)}. ${Word(cols)} plus ${word(cols)} is ${word(2 * cols)}, and ${word(side)} plus ${word(side)} is ${word(2 * side)}. ${Word(2 * cols)} plus ${word(2 * side)} is ${word(P)}.`;
    return {
      screen: [V.grid(rows, cols, { fill }), prose(lines)], read, ask: lines[1],
      answer: `${Word(P)}.`, think,
      hints: ["Put your finger on one corner and walk around the outside of the blue shape.", "Count one for each square side you pass. Do not count the lines inside the shape.", "Add the top, the bottom, and the two sides."],
      key: `pz:perimeter:g:${rows}x${cols}:${fill}`,
    };
  }
  if (kind === "rect") {
    const L = r.int(5, 12), W = intWhere(r, 2, 9, (w) => w !== L);
    const P = 2 * (L + W);
    const lines = ["Only two sides of this rectangle are labeled.", "How far is it around the rectangle?"];
    return {
      screen: [V.geo("rect", { w: L, h: W, sides: [String(L), String(W), "", ""] }), prose(lines)], read: lines[0], ask: lines[1],
      answer: `${Word(P)}.`,
      think: `Opposite sides of a rectangle are the same length. So the four sides are ${word(L)}, ${word(W)}, ${word(L)}, and ${word(W)}. ${Word(L)} plus ${word(W)} is ${word(L + W)}, and ${word(L + W)} plus ${word(L + W)} is ${word(P)}.`,
      hints: ["How many sides does a rectangle have? Only two are labeled.", "Opposite sides of a rectangle are the same length.", "Write the length on all four sides, then add them."],
      key: `pz:perimeter:r:${L}x${W}`,
    };
  }
  const s = r.int(3, 12);
  const P = 4 * s;
  const lines = ["One side of this square is labeled.", "How far is it around the square?"];
  return {
    screen: [V.geo("square", { sides: [String(s), "", "", ""] }), prose(lines)], read: lines[0], ask: lines[1],
    answer: `${Word(P)}.`,
    think: `All four sides of a square are the same, so every side is ${word(s)}. ${Word(s)} plus ${word(s)} is ${word(2 * s)}, and ${word(2 * s)} plus ${word(2 * s)} is ${word(P)}.`,
    hints: ["How many sides does a square have? Are they all the same?", "Write the length on every side.", "Add the sides, or add the length to itself and then double that."],
    key: `pz:perimeter:s:${s}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Rectangles (lesson 42): how many rectangles or squares in a figure
// ─────────────────────────────────────────────────────────────
// The rectangles (or only the squares) inside the filled cells of a grid,
// grouped by how many small squares each is made of.
function countInRegion(rows, cols, fill, squaresOnly) {
  const on = (i, j) => i * cols + j < fill;
  const byArea = new Map();
  for (let h = 1; h <= rows; h++) for (let w = 1; w <= cols; w++) {
    if (squaresOnly && h !== w) continue;
    for (let i = 0; i + h <= rows; i++) for (let j = 0; j + w <= cols; j++) {
      let ok = true;
      for (let y = i; y < i + h && ok; y++) for (let x = j; x < j + w; x++) if (!on(y, x)) { ok = false; break; }
      if (ok) byArea.set(h * w, (byArea.get(h * w) || 0) + 1);
    }
  }
  const groups = [...byArea.entries()].sort((a, b) => a[0] - b[0]);
  return { total: sum(groups.map((g) => g[1])), groups };
}
function rectangles(r, lesson) {
  // rows, cols, filled cells (0 for the whole grid), squares only
  const choice = r.pick([[2, 2, 0, true], [2, 3, 0, true], [3, 3, 0, true], [2, 4, 0, true], [3, 4, 0, true], [3, 3, 7, true], [3, 3, 8, true], [3, 4, 9, true], [3, 4, 11, true], [2, 4, 7, true],
    [1, 2, 0, false], [1, 3, 0, false], [1, 4, 0, false], [2, 2, 0, false], [1, 5, 0, false], [2, 3, 0, false], [2, 3, 5, false], [2, 4, 6, false]]);
  const [rows, cols, part, squaresOnly] = choice;
  const fill = part || rows * cols;
  const { total, groups } = countInRegion(rows, cols, fill, squaresOnly);
  const what = squaresOnly ? "squares" : "rectangles";
  const where = part ? "the blue shape" : "this figure";
  const lines = [`How many ${what} can you count in ${where}?`, `Big ${what} made of small squares count too.`];
  const parts = groups.map(([area, n]) => `${area === 1 ? (squaresOnly ? "Small squares" : "Single squares") : `${cap(what)} made of ${word(area)} small squares`}: ${word(n)}.`);
  const think = `Count by size. ${parts.join(" ")} ${cap(list(groups.map((g) => word(g[1]))))} ${groups.length > 1 ? "add up to" : "is"} ${word(total)}.`;
  return {
    screen: [V.grid(rows, cols, part ? { fill } : {}), prose(lines)], read: lines[1], ask: lines[0],
    answer: `${Word(total)}.`, think,
    hints: squaresOnly
      ? ["Count the small squares first.", "Now look for bigger squares made of several small squares. Trace each with your finger.", "Find the biggest square there is. Then add up every size."]
      : ["Count the single squares first. Each is a rectangle.", "Now count rectangles made of squares side by side, from the smallest to the biggest.", "Trace each rectangle with your finger so you count each just once."],
    key: `pz:rectangles:${rows}x${cols}:${fill}:${what}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Twist (lesson 54): two-step stories with a catch
// ─────────────────────────────────────────────────────────────
function twist(r, lesson) {
  const [A, B, C] = r.sample(NAMES, 3).map(who);
  const items = r.pick(["stickers", "shells", "marbles", "cards", "beads", "stamps"]);
  const kind = r.pick(["twice", "extra", "backwards", "pages", "putback", "together"]);
  let lines, ans, think, hints, key;
  if (kind === "twice") {
    const n = r.int(40, 90), k = intWhere(r, 8, 25, (x) => n - 2 * x >= 5);
    ans = n - 2 * k;
    lines = (f) => [`${A.name} had ${f(n)} ${items}.`, `${A.She} gave ${f(k)} to ${B.name} and ${f(k)} to ${C.name}.`, `How many ${items} does ${A.she} have left?`];
    think = `${A.She} gave ${word(k)} away twice: ${word(k)} plus ${word(k)} is ${word(2 * k)}. ${Word(n)} minus ${word(2 * k)} is ${word(ans)}.`;
    hints = [`${A.She} gave ${items} away twice. How many did ${A.she} give away in all?`, "Add the two gifts first. Then take that from what she had.", "Or take away the first gift, then take away the second."];
    key = `pz:twist:twice:${n}:${k}`;
  } else if (kind === "extra") {
    const age = r.int(6, 9), n = r.int(25, 60), m = intWhere(r, 12, 39, (x) => n + x <= 99);
    ans = n + m;
    lines = (f) => [`${A.name} is ${f(age)} years old.`, `${A.She} has ${f(n)} ${items} and gets ${f(m)} more.`, `How many ${items} does ${A.she} have now?`];
    think = `${A.hers.charAt(0).toUpperCase() + A.hers.slice(1)} age is not about ${items}, so we leave it out. ${Word(n)} plus ${word(m)} is ${word(ans)}.`;
    hints = ["Is every number in the story needed? Read it again.", `Which numbers tell about ${items}? Use only those.`, "Getting more means add."];
    key = `pz:twist:extra:${age}:${n}:${m}`;
  } else if (kind === "backwards") {
    const m = r.int(12, 39), t = intWhere(r, 40, 99, (x) => x - m >= 8);
    ans = t - m;
    lines = (f) => [`${A.name} had some ${items}.`, `${A.She} found ${f(m)} more. Now ${A.she} has ${f(t)}.`, `How many ${items} did ${A.she} have at first?`];
    think = `${A.She} ended with ${word(t)} after finding ${word(m)}. To find the start, undo the finding: ${word(t)} minus ${word(m)} is ${word(ans)}.`;
    hints = [`${A.She} finished with more than ${A.she} started with. Did the story add or take away?`, "To find the start, go backwards and undo the adding.", `Take the ${items} ${A.she} found away from what ${A.she} has now.`];
    key = `pz:twist:back:${m}:${t}`;
  } else if (kind === "pages") {
    const t = r.int(50, 99), a = r.int(10, 30), b = intWhere(r, 10, 30, (x) => t - a - x >= 5);
    ans = t - a - b;
    lines = (f) => [`${A.name}'s book has ${f(t)} pages.`, `${A.She} read ${f(a)} pages on Monday and ${f(b)} on Tuesday.`, "How many pages are left to read?"];
    think = `First find the pages read: ${word(a)} plus ${word(b)} is ${word(a + b)}. Then take them from the book: ${word(t)} minus ${word(a + b)} is ${word(ans)}.`;
    hints = ["Pages read and pages left make the whole book.", "First find how many pages were read in all, on both days.", "Then take that from the pages in the book."];
    key = `pz:twist:pages:${t}:${a}:${b}`;
  } else if (kind === "putback") {
    const n = r.int(40, 90), k = r.int(12, 30), j = intWhere(r, 3, 11, (x) => x < k);
    ans = n - k + j;
    lines = (f) => [`A box held ${f(n)} crayons.`, `${A.name} took out ${f(k)}, then put ${f(j)} back.`, "How many crayons are in the box now?"];
    think = `Do the two changes in order. Taking out: ${word(n)} minus ${word(k)} is ${word(n - k)}. Putting back: ${word(n - k)} plus ${word(j)} is ${word(ans)}.`;
    hints = ["Two things happened. Do them one at a time, in order.", "Taking out means subtract. Putting back means add.", "First take out. Then put back."];
    key = `pz:twist:putback:${n}:${k}:${j}`;
  } else {
    const n = r.int(30, 49), k = r.int(5, 20);
    ans = n + (n - k);
    lines = (f) => [`${A.name} has ${f(n)} ${items}.`, `${B.name} has ${f(k)} fewer than ${A.name}.`, `How many ${items} do they have together?`];
    think = `First find ${B.name}'s number: ${word(n)} minus ${word(k)} is ${word(n - k)}. Then add the two: ${word(n)} plus ${word(n - k)} is ${word(ans)}.`;
    hints = [`First find how many ${B.name} has.`, `'Fewer than' means subtract to find ${B.name}'s number.`, "Then add the two children's numbers."];
    key = `pz:twist:together:${n}:${k}`;
  }
  const L = lines(String), S = lines(word);
  return { screen: prose(L), read: S.slice(0, -1).join(" "), ask: S[S.length - 1], answer: `${Word(ans)}.`, think, hints, key };
}

// ─────────────────────────────────────────────────────────────
// Missing digits (lesson 66): a column problem with two digits hidden
// ─────────────────────────────────────────────────────────────
const PLACES = ["ones", "tens", "hundreds"];
// X + Y = Z, worked from the ones; a hidden digit in X (column hx), Y (hy),
// or Z (hz) is found from the other two.
function columnThink(X, Y, Z, hx, hy, hz, n) {
  const d = (v, i) => Math.floor(v / 10 ** i) % 10;
  const out = [];
  let carry = 0;
  for (let i = 0; i < n; i++) {
    const x = d(X, i), y = d(Y, i), z = d(Z, i), s = x + y + carry, place = cap(PLACES[i]);
    const c = carry ? " plus one carried" : "";
    if (i === hx) out.push(`${place}: ${word(y)}${c} plus what ends in ${word(z)}? ${Word(x)}, because ${word(y + carry)} plus ${word(x)} is ${word(s)}.`);
    else if (i === hy) out.push(`${place}: ${word(x)}${c} plus what ends in ${word(z)}? ${Word(y)}, because ${word(x + carry)} plus ${word(y)} is ${word(s)}.`);
    else if (i === hz) out.push(`${place}: ${word(x)} plus ${word(y)}${c} is ${word(s)}, so the top digit is ${word(s % 10)}.`);
    else out.push(`${place}: ${word(x)} plus ${word(y)}${c} is ${word(s)}.`);
    carry = s >= 10 ? 1 : 0;
  }
  return out.join(" ");
}
function missingDigits(r, lesson) {
  const three = lesson >= 90 && r() < 0.5;
  const n = three ? 3 : 2;
  for (let tries = 0; tries < 60; tries++) {
    const add = r() < 0.5;
    let a, b;
    if (add) { a = three ? r.int(101, 599) : r.int(12, 79); b = three ? r.int(101, 399) : r.int(12, 79); }
    else { a = three ? r.int(250, 999) : r.int(30, 99); b = three ? r.int(101, a - 100) : r.int(11, a - 10); }
    const res = add ? a + b : a - b;
    const [ca, cb] = r.pick(three ? [[0, 2], [2, 0], [0, 1], [1, 0], [1, 2], [2, 1]] : [[0, 1], [1, 0]]);
    const hide = (v, c) => String(v).split("").map((ch, i) => (n - 1 - i === c ? "?" : ch)).join("");
    const rowA = hide(a, ca), rowB = hide(b, cb);
    const sols = [];
    for (let x = 0; x <= 9; x++) for (let y = 0; y <= 9; y++) {
      const A = Number(rowA.replace("?", x)), B = Number(rowB.replace("?", y));
      if (String(A).length !== n || String(B).length !== n) continue;
      if ((add ? A + B : A - B) === res) sols.push([x, y]);
    }
    if (sols.length !== 1) continue;
    const [da, db] = sols[0];
    const think = add
      ? columnThink(a, b, res, ca, cb, -1, n)
      : `The bottom number plus the answer makes the top number, so add them from the ones. ${columnThink(b, res, a, cb, -1, ca, n)}`;
    const lines = ["Two digits are missing.", "What digits are missing? Say the top one first."];
    return {
      screen: [V.colx([rowA, rowB], add ? "+" : "−", { ans: res, show: true }), prose(lines)],
      read: `Two digits are missing from this ${add ? "adding" : "subtracting"} problem. The answer is ${word(res)}.`, ask: lines[1],
      answer: `${Word(da)} and ${word(db)}.`, think,
      hints: add
        ? ["Start with the ones column. Which digit added to the digit you see makes the ones digit of the answer?", "Did the ones make a new ten? Carry it to the next column before you look there.", "Now the next column. Which digit makes it come out right?"]
        : ["Think of it as adding: the bottom number plus the answer makes the top number.", "Start with the ones column. Which digit added to the digit you see makes the ones digit on top?", "Did the ones make a new ten? Carry it to the next column, then find the other digit."],
      key: `pz:missing:${rowA}${add ? "+" : "-"}${rowB}=${res}`,
    };
  }
  return missingDigits(r, lesson - 90); // never reached: a two-digit pattern always resolves
}

// ─────────────────────────────────────────────────────────────
// Coins (lesson 80): ways to make an amount; the fewest coins
// ─────────────────────────────────────────────────────────────
const COIN = { quarter: 25, dime: 10, nickel: 5, penny: 1 };
const coinName = (k, c) => `${word(k)} ${plural(k, c, c === "penny" ? "pennies" : c + "s")}`;
function coins(r, lesson) {
  if (r() < 0.5) {
    const [big, small] = r.pick([["dime", "nickel"], ["dime", "nickel"], ["quarter", "nickel"], ["quarter", "dime"]]);
    const options = { "dime nickel": [20, 25, 30, 35, 40, 45, 50], "quarter nickel": [50, 55, 60, 65, 70, 75], "quarter dime": [50, 60, 70, 80, 90, 100] };
    const N = r.pick(options[`${big} ${small}`]);
    const ways = [];
    for (let nb = Math.floor(N / COIN[big]); nb >= 0; nb--) {
      const rest = N - nb * COIN[big];
      if (rest % COIN[small] === 0) ways.push([nb, rest / COIN[small]]);
    }
    const desc = ways.map(([nb, ns]) => (nb === 0 ? coinName(ns, small) : ns === 0 ? coinName(nb, big) : `${coinName(nb, big)} and ${coinName(ns, small)}`));
    const lines = (f) => [`How many ways can you make ${f(N)} cents with ${big}s and ${small}s?`, `A way may use only ${big}s or only ${small}s.`];
    return {
      screen: [V.coins([big, small]), prose(lines(String))], read: lines(word)[1], ask: lines(word)[0],
      answer: `${Word(ways.length)}.`,
      think: `Start with the most ${big}s and trade one ${big} at a time. ${desc.map((d) => `${cap(d)}.`).join(" ")} That is ${word(ways.length)} ways.`,
      hints: [`Start with as many ${big}s as you can. Then trade one ${big} for ${small}s.`, `Each time, use one ${big} fewer. How many ${small}s make up the rest?`, "Write each way on its own line, so you miss none and count none twice."],
      key: `pz:coins:ways:${N}:${big[0]}${small[0]}`,
    };
  }
  const greedy = (N) => { const out = []; let rest = N; for (const c of ["quarter", "dime", "nickel", "penny"]) { const k = Math.floor(rest / COIN[c]); if (k) out.push([k, c]); rest -= k * COIN[c]; } return out; };
  const N = intWhere(r, 16, 99, (x) => x % 25 !== 0 && sum(greedy(x).map((g) => g[0])) >= 3);
  const used = greedy(N), count = sum(used.map((g) => g[0]));
  let run = 0;
  const steps = used.map(([k, c], i) => { run += k * COIN[c]; return `${coinName(k, c)}${i ? " more" : ""} make${k === 1 ? "s" : ""} ${word(run)}`; });
  const lines = (f) => [`Make ${f(N)} cents with the fewest coins you can.`, "How many coins do you use?"];
  return {
    screen: prose(lines(String)), read: lines(word)[0], ask: lines(word)[1],
    answer: `${Word(count)} coins.`,
    think: `Take the biggest coin that fits, again and again. ${steps.map((d) => `${cap(d)}.`).join(" ")} That is ${word(count)} coins.`,
    hints: ["Start with the biggest coin that fits, and see how much is left.", "Keep taking the biggest coin that fits what is left.", "Count the coins you used, not the cents."],
    key: `pz:coins:fewest:${N}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Balance (lesson 94): what one thing weighs
// ─────────────────────────────────────────────────────────────
function balance(r, lesson) {
  if (r() < 0.5) {
    const [small, big] = r.pick([["apple", "melon"], ["pear", "pumpkin"], ["plum", "pineapple"], ["lemon", "coconut"]]);
    const K = r.int(2, 4), a = r.int(2, 9), T = (K + 1) * a;
    const askSmall = r() < 0.6;
    const ans = askSmall ? a : K * a;
    const lines = (f) => [`${F(f)(K)} ${small}s weigh the same as one ${big}.`, `One ${big} and one ${small} weigh ${f(T)} pounds.`, `What does one ${askSmall ? small : big} weigh?`];
    const adds = (k, v) => Array(k).fill(word(v)).join(" plus ");
    const think = `Trade the ${big} for ${small}s: one ${big} and one ${small} weigh the same as ${word(K + 1)} ${small}s. ${Word(K + 1)} ${small}s weigh ${word(T)}, so one ${small} weighs ${word(a)}: ${adds(K + 1, a)} is ${word(T)}.${askSmall ? "" : ` The ${big} is ${word(K)} ${small}s: ${adds(K, a)} is ${word(K * a)}.`}`;
    return {
      screen: prose(lines(String)), read: lines(word).slice(0, 2).join(" "), ask: lines(word)[2],
      answer: `${Word(ans)} pounds.`, think,
      hints: [`Trade the ${big} for ${small}s. How many ${small}s is that in all?`, `Those ${small}s all weigh the same, and together they make the total.`, askSmall ? "What number added that many times makes the total?" : `Find what one ${small} weighs first. Then the ${big} is several ${small}s.`],
      key: `pz:balance:a:${K}:${a}:${askSmall ? small : big}`,
    };
  }
  const [X, Y] = r.pick([["box", "ball"], ["bag", "book"], ["brick", "cup"], ["pot", "pan"]]);
  const x = r.int(4, 30), y = intWhere(r, 2, 30, (v) => v !== x);
  const S1 = x + y, S2 = 2 * x + y;
  const askX = r() < 0.6;
  const ans = askX ? x : y;
  const lines = (f) => [`A ${X} and a ${Y} weigh ${f(S1)} pounds.`, `Two ${X}s and a ${Y} weigh ${f(S2)} pounds.`, `What does the ${askX ? X : Y} weigh?`];
  const think = `The second weighing has one more ${X} and the same ${Y}, so the extra ${X} makes the difference: ${word(S2)} minus ${word(S1)} is ${word(x)}.${askX ? "" : ` Then the ${Y} is ${word(S1)} minus ${word(x)}: ${word(y)}.`}`;
  return {
    screen: prose(lines(String)), read: lines(word).slice(0, 2).join(" "), ask: lines(word)[2],
    answer: `${Word(ans)} pounds.`, think,
    hints: ["Compare the two weighings. What is the same, and what is extra?", "The difference between the two totals is the weight of the extra thing.", askX ? "Subtract the smaller total from the bigger one." : `Once you know the ${X}, take it from the first total.`],
    key: `pz:balance:b:${x}:${y}:${askX ? X : Y}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Hops (lesson 108): hops on the number line
// ─────────────────────────────────────────────────────────────
function hops(r, lesson) {
  const A = who(r.pick(NAMES));
  const kind = r.pick(["forward", "forward", "mixed", "backwards"]);
  const big = r() < 0.5 ? 10 : 100, small = big === 100 && r() < 0.5 ? 10 : 1;
  const n1 = r.int(2, 4), n2 = r.int(1, 3);
  const times = (f) => (k) => (k === 1 ? "once" : k === 2 ? "twice" : `${f(k)} times`);
  const chainFrom = (from, by, k) => Array.from({ length: k }, (_, i) => word(from + by * (i + 1))).join(", ");
  const hintBig = "Hopping by tens changes only the tens digit. By hundreds, only the hundreds digit.";
  let start, end, lines, think, hints, label;
  if (kind === "backwards") {
    end = big === 10 ? r.int(11 + 10 * n1, 99) : r.int(101 + 100 * n1, 999);
    start = end - big * n1;
    lines = (f) => [`${A.name} started at a number.`, `${A.She} hopped forward by ${f(big)} ${times(f)(n1)} and landed on ${f(end)}.`, `Where did ${A.she} start?`];
    think = `Undo the hops. From ${word(end)}, hop back by ${word(big)} ${times(word)(n1)}: ${chainFrom(end, -big, n1)}. ${A.She} started at ${word(start)}.`;
    hints = ["Work backwards: undo the hops.", `${A.She} hopped forward to land there. Hop back the same way, the same number of times.`, hintBig];
    label = [{ v: end, label: "Landed" }];
  } else {
    start = big === 10 ? r.int(11, 60) : r.int(101, 599);
    end = start + big * n1 - small * n2;
    const fwd = `${chainFrom(start, big, n1)}`, back = chainFrom(start + big * n1, -small, n2);
    if (kind === "forward") {
      lines = (f) => [`Start at ${f(start)}.`, `Hop forward by ${f(big)} ${times(f)(n1)} and back by ${f(small)} ${times(f)(n2)}.`, "Where are you?"];
      think = `Forward by ${word(big)}: ${fwd}. Then back by ${word(small)}: ${back}. You are at ${word(end)}.`;
    } else {
      lines = (f) => [`Start at ${f(start)}.`, `Hop back by ${f(small)} ${times(f)(n2)}, then forward by ${f(big)} ${times(f)(n1)}.`, "Where are you?"];
      think = `Back by ${word(small)}: ${chainFrom(start, -small, n2)}. Then forward by ${word(big)}: ${chainFrom(start - small * n2, big, n1)}. You are at ${word(end)}.`;
    }
    hints = ["Hop one hop at a time. Say where you land after each hop.", hintBig, "Do the hops in the order the puzzle gives them."];
    label = [{ v: start, label: "Start" }];
  }
  const lo = Math.floor(Math.min(start, end) / big) * big, hi = Math.ceil(Math.max(start, end) / big) * big;
  const L = lines(String), S = lines(word);
  return {
    screen: [V.nl(lo, hi, { by: big, points: label }), prose(L)], read: S.slice(0, 2).join(" "), ask: S[2],
    answer: `${Word(kind === "backwards" ? start : end)}.`, think, hints,
    key: `pz:hops:${kind}:${start}:${big}x${n1}:${small}x${n2}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Magic shapes (lesson 122): a magic triangle or a magic square
// ─────────────────────────────────────────────────────────────
// Every way to put 1 to 6 on a triangle (corners A, B, C and the middles of
// the sides AB, BC, CA) so that each side adds to the same total.
const TRIANGLES = perms([1, 2, 3, 4, 5, 6]).filter(([A, B, C, ab, bc, ca]) => A + ab + B === B + bc + C && B + bc + C === C + ca + A);
const LO_SHU = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
const rot = (m) => m[0].map((_, j) => m.map((row) => row[j]).reverse());
const flip = (m) => m.map((row) => row.slice().reverse());
function magic(r, lesson) {
  if (r() < 0.5) {
    const k = r.int(0, 3);
    const t = r.pick(TRIANGLES).map((v) => v + k);
    const [A, B, C, ab, bc, ca] = t;
    const S = A + ab + B;
    // Corners 0, 1, 2 are the top, bottom right, and bottom left; side i
    // runs from corner i to corner i + 1: the right, the bottom, the left.
    const corner = ["top", "bottom right", "bottom left"], sideName = ["right", "bottom", "left"];
    const sides = [[A, ab, B], [B, bc, C], [C, ca, A]];
    const two = r() < 0.4;
    const h = two ? 0 : r.int(0, 2), h2 = two ? r.int(1, 2) : -1;
    const corners = [A, B, C].map((v, i) => (i === h || i === h2 ? "?" : String(v)));
    const figure = V.geo("tri", { angles: corners, sides: [String(ab), String(bc), String(ca)] });
    let lines, said, ans, think, hints;
    if (!two) {
      ans = [A, B, C][h];
      const full = (h + 1) % 3; // the side that does not touch the hidden corner
      const [u, v] = [sides[h][1], sides[h][2]]; // the rest of side h, which starts at the hidden corner
      lines = ["The three numbers along each side of the triangle add to the same total.", `What number goes in the ${corner[h]} corner, where the ? is?`];
      said = [lines[0], `What number goes in the ${corner[h]} corner, where the question mark is?`];
      think = `The ${sideName[full]} side has no question mark: ${list(sides[full].map(word))} make ${word(S)}. So every side makes ${word(S)}. On the ${sideName[h]} side, ${word(u)} plus ${word(v)} is ${word(u + v)}, and ${word(S)} minus ${word(u + v)} is ${word(ans)}.`;
      hints = ["Find the side with no question mark on it. What do its numbers add to?", "Every side must add to that same total.", "Take a side with the question mark. Add the numbers you can see. How far is that from the total?"];
    } else {
      ans = A;
      const full = h2 === 1 ? 2 : 0; // the side where only the top is hidden
      const [u, v] = h2 === 1 ? [C, ca] : [ab, B];
      lines = [`Each side of the triangle adds to ${S}.`, "What number goes in the top corner?"];
      said = [`Each side of the triangle adds to ${word(S)}.`, lines[1]];
      think = `The top corner is on the left side and on the right side. The ${sideName[full]} side shows its other two numbers: ${word(u)} plus ${word(v)} is ${word(u + v)}, and ${word(S)} minus ${word(u + v)} is ${word(ans)}.`;
      hints = ["The top corner sits on the left side and on the right side. Which of those sides shows both of its other numbers?", "Add the numbers you can see on that side.", "How far is that from the total each side must make?"];
    }
    return { screen: [figure, prose(lines)], read: said[0], ask: said[1], answer: `${Word(ans)}.`, think, hints, key: `pz:magic:t:${t.join("")}:${h}${h2 >= 0 ? h2 : ""}` };
  }
  let m = LO_SHU;
  for (let i = r.int(0, 3); i > 0; i--) m = rot(m);
  if (r() < 0.5) m = flip(m);
  const k = r.int(0, 5);
  m = m.map((row) => row.map((v) => v + k));
  const S = sum(m[0]);
  const two = r() < 0.5;
  const row = r.int(0, 2);
  const cols = two ? r.sample([0, 1, 2], 2).sort((a, b) => a - b) : [r.int(0, 2)];
  const cells = m.map((rw, i) => rw.map((v, j) => (i === row && cols.includes(j) ? "?" : v)));
  const ans = m[row][cols[0]];
  const fullRow = (row + 1) % 3;
  const colVals = [0, 1, 2].filter((i) => i !== row).map((i) => m[i][cols[0]]);
  const rowVals = [0, 1, 2].filter((j) => j !== cols[0]).map((j) => m[row][j]);
  const lines = ["In this magic square, every row and every column adds to the same total.", two ? "Two numbers are missing. What number goes in the left ?" : "What is the missing number?"];
  const ask = two ? "Two numbers are missing. What number goes in the left question mark?" : lines[1];
  const think = `A row with no question mark shows the total: ${list(m[fullRow].map(word))} make ${word(S)}. ${two
    ? `The row with the question marks is missing too much, so use the column: ${word(colVals[0])} plus ${word(colVals[1])} is ${word(sum(colVals))}, and ${word(S)} minus ${word(sum(colVals))} is ${word(ans)}.`
    : `In the row with the question mark, ${word(rowVals[0])} plus ${word(rowVals[1])} is ${word(sum(rowVals))}, and ${word(S)} minus ${word(sum(rowVals))} is ${word(ans)}.`}`;
  return {
    screen: [V.table(null, cells), prose(lines)], read: lines[0], ask,
    answer: `${Word(ans)}.`, think,
    hints: ["Find a row with no question mark. What do its numbers add to?", two ? "The row with the question marks has too much missing. Use a column instead." : "Every row and every column adds to that same total.", two ? "Go down the column of the left question mark. Add the numbers you can see. How far is that from the total?" : "In the row with the question mark, add the numbers you can see. How far is that from the total?"],
    key: `pz:magic:s:${m.flat().join(".")}:${row}${cols.join("")}`,
  };
}

// ─────────────────────────────────────────────────────────────
// Logic (lesson 136): who is who
// ─────────────────────────────────────────────────────────────
const DOMAINS = [
  { thing: "pet", things: ["dog", "cat", "fish"], has: "has", not: "does not have", does: "does", askWhat: (n) => `Which pet does ${n} have?` },
  { thing: "hat", things: ["red hat", "blue hat", "green hat"], has: "wears", not: "does not wear", does: "does", askWhat: (n) => `Which hat does ${n} wear?` },
  { thing: "fruit", things: ["apple", "banana", "pear"], has: "ate", not: "did not eat", does: "did", askWhat: (n) => `Which fruit did ${n} eat?` },
];
// Solve by elimination, telling the way; null when elimination is not enough.
function deduce(names, things, truth, clues, d) {
  const poss = names.map(() => new Set(things));
  const fixed = new Set();
  const steps = [];
  for (const c of clues) {
    if (c.yes) { poss[c.i] = new Set([c.t]); fixed.add(c.i); names.forEach((_, j) => { if (j !== c.i) poss[j].delete(c.t); }); steps.push(`${names[c.i]} ${d.has} the ${c.t}, so nobody else ${d.does}.`); }
    else poss[c.i].delete(c.t);
  }
  let changed = true;
  while (changed && fixed.size < names.length) {
    changed = false;
    names.forEach((n, i) => {
      if (fixed.has(i) || poss[i].size !== 1) return;
      const t = [...poss[i]][0];
      const out = things.filter((x) => x !== t);
      steps.push(`${n} ${d.not} the ${out[0]} or the ${out[1]}, so ${n} ${d.has} the ${t}.`);
      fixed.add(i); changed = true;
      names.forEach((_, j) => { if (j !== i) poss[j].delete(t); });
    });
    things.forEach((t) => {
      const can = names.map((_, i) => i).filter((i) => poss[i].has(t));
      if (can.length !== 1 || fixed.has(can[0])) return;
      const i = can[0];
      steps.push(`Only ${names[i]} is left for the ${t}, so ${names[i]} ${d.has} it.`);
      poss[i] = new Set([t]); fixed.add(i); changed = true;
      names.forEach((_, j) => { if (j !== i) poss[j].delete(t); });
    });
  }
  if (fixed.size < names.length) return null;
  if (names.some((_, i) => [...poss[i]][0] !== truth[i])) return null;
  return steps;
}
function logic(r, lesson) {
  const d = r.pick(DOMAINS);
  const names = r.sample(NAMES, 3).map((n) => n[0]);
  const things = r.shuffle(d.things);
  const truth = r.shuffle(things); // truth[i]: what child i has
  const all = perms(things);
  const cands = [];
  names.forEach((_, i) => things.forEach((t) => cands.push({ i, t, yes: truth[i] === t })));
  for (let tries = 0; tries < 200; tries++) {
    const clues = r.sample(cands, r.int(2, 3));
    if (!clues.some((c) => !c.yes)) continue;
    const fitting = (set) => all.filter((p) => set.every((c) => (p[c.i] === c.t) === c.yes)).length;
    if (fitting(clues) !== 1) continue;
    // Every clue is needed: without any one of them the answer is not settled.
    if (clues.some((_, k) => fitting(clues.filter((__, j) => j !== k)) === 1)) continue;
    const steps = deduce(names, things, truth, clues, d);
    if (!steps) continue;
    const askWho = r() < 0.5;
    const i = r.int(0, 2), t = truth[i];
    if (clues.some((c) => c.yes && c.i === i)) continue; // the answer must not be given outright
    const text = clues.map((c) => `${names[c.i]} ${c.yes ? d.has : d.not} the ${c.t}.`);
    const ask = askWho ? `Who ${d.has} the ${t}?` : d.askWhat(names[i]);
    const answer = askWho ? `${names[i]}.` : `The ${t}.`;
    return {
      screen: prose([`Three children, three ${d.thing}s.`, ...text, ask]), read: text.join(" "), ask,
      answer, keep: askWho, confirm: askWho ? `Yes, ${names[i]}.` : undefined,
      think: `${steps.join(" ")} So ${askWho ? `the ${t} is ${names[i]}'s` : `${names[i]} ${d.has} the ${t}`}.`,
      hints: [`Make a chart: the children down the side and the ${d.thing}s across the top. Mark what each clue tells you.`, `A clue that says who ${d.has} what settles one child and one ${d.thing}. Cross both off for everyone else.`, `When a child has only one ${d.thing} left, that one is theirs.`],
      key: `pz:logic:${d.thing}:${names.map((n) => n[0]).join("")}:${truth.map((t) => t[0]).join("")}:${clues.map((c) => `${c.i}${c.yes ? "+" : "-"}${c.t[0]}`).join("")}:${askWho ? "who" : i}`,
    };
  }
  return logic(r, lesson);
}

// ─────────────────────────────────────────────────────────────
// The track
// ─────────────────────────────────────────────────────────────
const FAMILIES = [
  { id: "digit-cards", lesson: 2, label: "Digit cards", gen: digitCards },
  { id: "patterns", lesson: 6, label: "Patterns with gaps", gen: patterns },
  { id: "chains", lesson: 11, label: "Who has more", gen: chains },
  { id: "perimeter", lesson: 26, label: "Around the shape", gen: perimeter },
  { id: "rectangles", lesson: 42, label: "Counting rectangles", gen: rectangles },
  { id: "twist", lesson: 54, label: "Stories with a twist", gen: twist },
  { id: "missing-digits", lesson: 66, label: "Missing digits", gen: missingDigits },
  { id: "coins", lesson: 80, label: "Coin puzzles", gen: coins },
  { id: "balance", lesson: 94, label: "Balance puzzles", gen: balance },
  { id: "hops", lesson: 108, label: "Hops on the number line", gen: hops },
  { id: "magic", lesson: 122, label: "Magic shapes", gen: magic },
  { id: "logic", lesson: 136, label: "Who is who", gen: logic },
];
const familyOf = (u) => FAMILIES.find((f) => f.id === u.id);

// Two different puzzles of a family from one seed.
function pair(fam, ctx) {
  const a = fam.gen(ctx.rand, ctx.lesson);
  let b = fam.gen(ctx.rand, ctx.lesson);
  for (let i = 0; i < 20 && b.key === a.key; i++) b = fam.gen(ctx.rand, ctx.lesson);
  return [a, b];
}

function puzzleEx(fam, p) {
  return { title: `Puzzle: ${fam.label.toLowerCase()}`, kind: "puzzle", steps: [note(p.screen, INTRO), puzzleStep(p)] };
}

export const puzzles = {
  id: "puzzles",
  name: "Puzzles",
  puzzle: true,
  keep: true,
  last: true,
  reviewEvery: 1,
  summary: "A puzzle in every lesson, worked on the whiteboard with hints on the panel: digit cards, patterns with gaps, who has more, how far around, counting rectangles, stories with a twist, missing digits, coins, balances, hops on the number line, magic shapes, and who is who.",
  standard: "2.OA.1, 2.NBT.7, 2.MD.8, 2.G.1 (reasoning)",
  units: FAMILIES.map(({ id, lesson, label }) => ({ id, lesson, label })),
  // A new family: one puzzle thought through aloud, then one to work.
  newEx(u, ctx) {
    const fam = familyOf(u);
    const [shown, worked] = pair(fam, ctx);
    return {
      title: `Puzzle: ${fam.label.toLowerCase()}`, kind: "puzzle",
      steps: [
        model(shown.screen, `Listen. ${shown.read} ${shown.ask}`),
        ...modelSteps(shown.screen, shown.think),
        note(worked.screen, `Now a puzzle for the child. ${INTRO}`),
        puzzleStep(worked),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const fam = familyOf(favorNew(ctx.rand, intro, 1)[0]);
    return puzzleEx(fam, fam.gen(ctx.rand, ctx.lesson));
  },
  // Two puzzles, from two families where there are two, the newest favored.
  testItems(units, ctx) {
    const picks = favorNew(ctx.rand, units, 2);
    if (picks[0] === picks[1] && units.length > 1) picks[1] = ctx.rand.pick(units.filter((u) => u !== picks[0]));
    const seen = new Set();
    return picks.map((u) => {
      const fam = familyOf(u);
      let p = fam.gen(ctx.rand, ctx.lesson);
      for (let i = 0; i < 20 && seen.has(p.key); i++) p = fam.gen(ctx.rand, ctx.lesson);
      seen.add(p.key);
      return puzzleStep(p);
    });
  },
};
