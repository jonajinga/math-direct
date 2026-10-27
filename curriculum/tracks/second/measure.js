// Second Grade: even and odd numbers and arrays, length, time, money, and
// data. See BRIEF.md. Every answer is a spoken number or word, or one touch.

import { V, model, lead, test, fix, fixPoint, fixChain, word, Word, chain, Chain, plural, favorNew, prose, WHITEBOARD, NAMES, cap } from "./common2.js";

// ── Shared ──

// Three to five test steps for a review: one for each unit favorNew picks,
// the newest favored, with no item repeated.
function pickSteps(r, intro, make, want = 4) {
  const steps = [];
  const seen = new Set();
  const picks = favorNew(r, intro, want);
  for (let tries = 0; steps.length < want && tries < 14; tries++) {
    const u = picks.length ? picks.shift() : favorNew(r, intro, 1)[0];
    const st = make(u, r);
    if (!st || seen.has(st.item)) continue;
    seen.add(st.item);
    steps.push(st);
  }
  return steps;
}

// Two to four test steps for a test: one from an earlier unit, then the
// newest unit, hardest last.
function pickTests(r, units, make, count) {
  const want = Math.min(Math.max(count || 3, 2), 4);
  const newest = units[units.length - 1];
  const steps = [];
  const seen = new Set();
  const add = (u) => {
    for (let tries = 0; tries < 6; tries++) {
      const st = make(u, r);
      if (st && !seen.has(st.item)) { seen.add(st.item); steps.push(st); return; }
    }
  };
  if (units.length > 1) add(r.pick(units.slice(0, -1)));
  add(newest);
  while (steps.length < want) { const before = steps.length; add(newest); if (steps.length === before) break; }
  return steps;
}

const s = (n) => (n === 1 ? "" : "s");

// ─────────────────────────────────────────────────────────────
// Even, odd, and arrays
// ─────────────────────────────────────────────────────────────

const EVEN_RULE = "Zero, two, four, six, and eight are even.";
const ODD_RULE = "One, three, five, seven, and nine are odd.";
const onesOf = (n) => `${Word(n)} ends in ${word(n % 10)}.`;
const evenWhy = (n) => `${onesOf(n)} A number is even when it ends in zero, two, four, six, or eight. ${n % 2 ? `${Word(n % 10)} is not one of those, so ${word(n)} is not even.` : `So ${word(n)} is even.`}`;
const eoWhy = (n) => `${onesOf(n)} ${EVEN_RULE} ${ODD_RULE} ${Word(n)} is ${n % 2 ? "odd" : "even"}.`;

function pairsCount(r) {
  const n = 2 * r.int(2, 10);
  const ask = "The dots are in pairs. Count by twos. How many dots?";
  return test(V.grid(2, n / 2, { dots: true }), ask, Word(n) + ".", fix(Word(n) + ".", ask, `Each pair is two, so I count by twos: ${chain(2, n, 2)}.`), { skill: "even-odd", item: `pairs:${n}` });
}
function isEven(r, max, parity) {
  let n = r.int(1, max);
  if (parity !== undefined && n % 2 !== parity) n = n === max ? n - 1 : n + 1;
  const ask = "Is this number even?";
  const a = n % 2 ? "No." : "Yes.";
  return test(V.num(n), ask, a, fix(a, ask, evenWhy(n)), { skill: "even-odd", item: `even?:${n}` });
}
function evenOrOdd(r, max) {
  const n = r.int(1, max);
  const ask = "Even or odd?";
  const a = n % 2 ? "Odd." : "Even.";
  return test(V.num(n), ask, a, fix(a, ask, eoWhy(n)), { skill: "even-odd", item: `eo:${n}` });
}
function leftover(r) {
  const n = r.int(5, 16);
  const ask = "Look at the pairs. Is the number of dots even or odd?";
  const a = n % 2 ? "Odd." : "Even.";
  const why = n % 2
    ? `One dot has no partner. One is left over, so the number is odd. ${Word(n)} is odd.`
    : `Every dot has a partner. None is left over, so the number is even. ${Word(n)} is even.`;
  return test(V.grid(2, Math.ceil(n / 2), { dots: true, fill: n }), ask, a, fix(a, ask, why), { skill: "even-odd", item: `pairs:eo:${n}` });
}

function arrayDims(r, maxTotal = 25) {
  let a = r.int(2, 5), b = r.int(2, 5);
  for (let i = 0; i < 20 && a * b > maxTotal; i++) { a = r.int(2, 5); b = r.int(2, 5); }
  return [a, b];
}
// "four plus four is eight, eight plus four is twelve"
function addUp(b, a) {
  const parts = [];
  for (let t = b, i = 1; i < a; i++, t += b) parts.push(`${word(t)} plus ${word(b)} is ${word(t + b)}`);
  return parts.join(", ");
}
function rowsItem(r) {
  const [a, b] = arrayDims(r);
  const ask = "How many rows?";
  return test(V.grid(a, b, { dots: true }), ask, Word(a) + ".", fix(Word(a) + ".", ask, `A row goes across. I count the rows from the top: ${chain(1, a)}. ${Word(a)} rows.`), { skill: "array", item: `rows:${a}x${b}` });
}
function inRowItem(r) {
  const [a, b] = arrayDims(r);
  const ask = "How many dots in each row?";
  return test(V.grid(a, b, { dots: true }), ask, Word(b) + ".", fix(Word(b) + ".", ask, `I count across one row: ${chain(1, b)}. Each row has ${word(b)}.`), { skill: "array", item: `inrow:${a}x${b}` });
}
function rowsOfItem(r) {
  const [a, b] = arrayDims(r);
  const ask = "Say the array: how many rows of how many?";
  const ans = `${Word(a)} rows of ${word(b)}.`;
  return test(V.grid(a, b, { dots: true }), ask, ans, fix(ans, ask, `${Word(a)} rows, and ${word(b)} dots in each row.`), { skill: "array", item: `rowsof:${a}x${b}` });
}
const eqOf = (rows, each) => V.eq(...Array(rows).fill(each).flatMap((x, i) => (i ? ["+", x] : [x])), "=", "?");
function addRowsItem(r) {
  const [a, b] = arrayDims(r);
  const ask = "Add the rows. How many dots in all?";
  const n = a * b;
  return test([V.grid(a, b, { dots: true }), eqOf(a, b)], ask, Word(n) + ".", fix(Word(n) + ".", ask, `Each row has ${word(b)}, so I add ${word(b)} ${word(a)} times: ${addUp(b, a)}. ${Word(n)} dots.`), { skill: "array", item: `array:${a}x${b}` });
}
function whichEq(r) {
  const [a, b] = arrayDims(r);
  const wrongs = [[b, a], [a + 1, b], [a, b + 1]].filter(([x, y]) => !(x === a && y === b));
  const opts = r.shuffle([[a, b], ...r.sample(wrongs, 2)]);
  const ans = opts.findIndex(([x, y]) => x === a && y === b);
  const ask = "Touch the addition that matches the array.";
  const said = Array(a).fill(word(b)).join(" plus ");
  const bare = (rows, each) => V.eq(...Array(rows).fill(each).flatMap((x, i) => (i ? ["+", x] : [x])));
  return test(V.col2(V.grid(a, b, { dots: true }), V.choices(opts.map(([x, y]) => bare(x, y)), ans)), ask, `(Touches ${Array(a).fill(b).join(" + ")}.)`,
    fixPoint(`${Word(a)} rows of ${word(b)}: one ${word(b)} for each row. ${cap(said)}. (Touch it.)`, ask), { skill: "array", item: `array:eq:${a}x${b}`, confirm: `Yes, ${said}.` });
}
const BY_WORD = { 2: "twos", 5: "fives", 10: "tens" };
function skipItem(r) {
  const b = r.pick([2, 5, 10]), a = r.int(3, 5);
  const ask = `Each row has ${word(b)}. Count the rows by ${BY_WORD[b]}. How many dots in all?`;
  const ans = `${Chain(b, a * b, b)} ${Word(a * b)} dots.`;
  return test(V.grid(a, b, { dots: true }), ask, ans, fixChain(ans, ask), { skill: "array", item: `skip:${a}x${b}`, do: "Point to each row as the child says its number." });
}

function evenOddItem(u, r, lesson) {
  switch (u.id) {
    case "even": return r() < 0.4 ? pairsCount(r) : isEven(r, 20);
    case "odd": return r() < 0.35 ? leftover(r) : evenOrOdd(r, lesson >= 8 ? 100 : 20);
    case "arrays": return r.pick([rowsItem, inRowItem, rowsOfItem])(r);
    case "equation": return r() < 0.6 ? addRowsItem(r) : whichEq(r);
    default: return skipItem(r);
  }
}

export const evenOdd = {
  id: "even-odd",
  name: "Even, odd, and arrays",
  summary: "Tell even from odd by pairing and by the ones digit, to 100; read an array as rows of a number, write its repeated addition, and count it by skip counting the rows.",
  standard: "2.OA.3, 2.OA.4",
  units: [
    { id: "even", lesson: 5, label: "Even numbers: pairs with none left over" },
    { id: "odd", lesson: 7, label: "Odd numbers: one left over" },
    { id: "arrays", lesson: 25, label: "Rows and columns" },
    { id: "equation", lesson: 37, label: "Adding the rows of an array" },
    { id: "skip", lesson: 55, label: "Skip counting an array" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "even") {
      return {
        title: u.label, steps: [
          model(V.grid(2, 4, { dots: true }), "Eight dots. I put them in pairs: two, four, six, eight. Every dot has a partner. None is left over. Eight is an even number.", { do: "Touch each pair as you count by twos." }),
          model(V.num([2, 4, 6, 8, 10]), "Here is the rule. A number is even when it ends in zero, two, four, six, or eight. Twelve ends in two, so twelve is even."),
          lead(V.grid(2, 3, { dots: true }), "Count the pairs by twos with me: two, four, six. Is one left over? No. So six is what kind of number? Say it with me.", "Even."),
          pairsCount(r), isEven(r, 20, 0), isEven(r, 20, 1),
          test(V.say(), "Say the digits an even number ends in.", "Zero, two, four, six, eight.", fix("Zero, two, four, six, eight.", "Say the digits an even number ends in.", "A number is even when it ends in one of these five digits."), { skill: "even-odd", item: "even:rule" }),
        ],
      };
    }
    if (u.id === "odd") {
      return {
        title: u.label, steps: [
          model(V.grid(2, 4, { dots: true, fill: 7 }), "Seven dots. I pair them: two, four, six, and one more. This last dot has no partner. One is left over. Seven is an odd number.", { do: "Touch the dot with no partner." }),
          model(V.num([1, 3, 5, 7, 9]), "A number is odd when it ends in one, three, five, seven, or nine. Thirteen ends in three, so thirteen is odd. Thirty ends in zero, so thirty is even."),
          lead(V.num(15), "Fifteen ends in five. Even or odd? Say it with me.", "Odd."),
          leftover(r), evenOrOdd(r, 20), evenOrOdd(r, 20), evenOrOdd(r, 100),
        ],
      };
    }
    if (u.id === "arrays") {
      return {
        title: u.label, steps: [
          model(V.grid(3, 4, { dots: true, labels: true }), "This is an array: dots in rows and columns. A row goes across. My turn. One, two, three rows. Each row has four dots. Three rows of four.", { do: "Sweep a finger across each row as you count the rows." }),
          model(V.grid(3, 4, { dots: true, labels: true }), "A column goes down. Three rows of four is four plus four plus four: one four for each row."),
          lead(V.grid(2, 5, { dots: true, labels: true }), "How many rows? How many in each row? Say it with me.", "Two rows of five."),
          rowsItem(r), inRowItem(r), rowsOfItem(r), rowsOfItem(r),
        ],
      };
    }
    if (u.id === "equation") {
      return {
        title: u.label, steps: [
          model([V.grid(3, 4, { dots: true, labels: true }), V.eq(4, "+", 4, "+", 4, "=", "?")], "Three rows of four. I write a four for each row: four plus four plus four. Four plus four is eight. Eight plus four is twelve. Twelve dots in all."),
          lead([V.grid(2, 5, { dots: true }), V.eq(5, "+", 5, "=", "?")], "Two rows of five. Five plus five is how many? Say it with me.", "Ten."),
          addRowsItem(r), addRowsItem(r), whichEq(r), addRowsItem(r),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.grid(4, 5, { dots: true }), "Each row has five. I do not add one row at a time. I count by fives, one number for each row: five, ten, fifteen, twenty. Twenty dots.", { do: "Point to each row as you say its number." }),
        lead(V.grid(3, 10, { dots: true }), "Each row has ten. Count the rows by tens with me.", "Ten, twenty, thirty. Thirty dots."),
        skipItem(r), skipItem(r), skipItem(r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    return { title: "Even, odd, and arrays", steps: pickSteps(ctx.rand, intro, (u, r) => evenOddItem(u, r, ctx.lesson)) };
  },
  testItems(units, ctx, count) {
    return pickTests(ctx.rand, units, (u, r) => evenOddItem(u, r, ctx.lesson), count);
  },
};

// ─────────────────────────────────────────────────────────────
// Length
// ─────────────────────────────────────────────────────────────

const UNIT = { in: ["inch", "inches"], cm: ["centimeter", "centimeters"] };
const uw = (u, n) => UNIT[u][n === 1 ? 0 : 1];
const lenWord = (n, u) => `${Word(n)} ${uw(u, n)}.`;
const rulerLen = (u) => (u === "in" ? 8 : 12);

function rulerItem(r, u) {
  const len = rulerLen(u), n = r.int(1, len);
  const ask = `How many ${UNIT[u][1]} long is the bar?`;
  const a = lenWord(n, u);
  return test(V.ruler(len, { unit: u, obj: n, start: 0 }), ask, a, fix(a, ask, `The bar starts at zero. Its end is at the ${word(n)} mark, so the bar is ${word(n)} ${uw(u, n)} long.`), { skill: "measure", item: `ruler:${u}:${n}` });
}
function smallerItem() {
  const ask = "Which is smaller, an inch or a centimeter?";
  return test(V.say(), ask, "A centimeter.", fix("A centimeter.", ask, "It takes about two and a half centimeters to make one inch, so a centimeter is the smaller unit."), { skill: "measure", item: "cm<in" });
}
const THINGS = [
  ["a new pencil", "pencil", 7, "in", 70, "A ruler is twelve inches, and a pencil is shorter than a ruler."],
  ["a paper clip", "clip", 3, "cm", 30, "A paper clip is tiny. Thirty centimeters is as long as a ruler."],
  ["a door", "door", 80, "in", 8, "A door is taller than a grown-up. Eight inches is shorter than this phone."],
  ["your hand", "hand", 6, "in", 60, "Sixty inches is as tall as a grown-up. A hand is about half a ruler."],
  ["a crayon", "crayon", 9, "cm", 90, "Ninety centimeters is as long as a baseball bat. A crayon is short."],
  ["a spoon", "spoon", 15, "cm", 150, "A spoon is about half a ruler. One hundred fifty centimeters is taller than you."],
  ["a book", "book", 10, "in", 100, "A book is a little shorter than a ruler. One hundred inches is longer than a car is tall."],
];
function guessItem(r) {
  const [thing, key, n, u, far, why] = r.pick(THINGS);
  const [x, y] = r.shuffle([n, far]);
  const ask = `About how long is ${thing}: ${word(x)} ${uw(u, x)} or ${word(y)} ${uw(u, y)}?`;
  const a = lenWord(n, u);
  return test(V.say(), ask, a, fix(a, ask, `${why} About ${word(n)} ${uw(u, n)}.`), { skill: "measure", item: `guess:${key}` });
}
function nearItem(r, u) {
  const len = rulerLen(u), n = r.int(1, len - 1), part = r.pick([0.2, 0.8]);
  const near = part < 0.5 ? n : n + 1;
  const ask = `The bar ends between two marks. Is it closer to ${word(n)} ${uw(u, n)} or to ${word(n + 1)} ${uw(u, n + 1)}?`;
  const a = lenWord(near, u);
  const why = part < 0.5 ? `The end is just past ${word(n)}, closer to ${word(n)} than to ${word(n + 1)}.` : `The end is almost at ${word(n + 1)}, closer to ${word(n + 1)} than to ${word(n)}.`;
  return test(V.ruler(len, { unit: u, obj: n + part, start: 0 }), ask, a, fix(a, ask, `${why} The bar is about ${word(near)} ${uw(u, near)}.`), { skill: "measure", item: `near:${u}:${n + part}` });
}
function compareItem(r, u) {
  const len = rulerLen(u), b = r.int(1, len - 2), a = r.int(b + 1, len), d = a - b;
  const ask = "How much longer is the red bar than the blue bar?";
  const ans = lenWord(d, u);
  return test(V.col2(V.ruler(len, { unit: u, obj: a, start: 0, c: "red" }), V.ruler(len, { unit: u, obj: b, start: 0, c: "blue" })), ask, ans,
    fix(ans, ask, `The red bar is ${word(a)} ${uw(u, a)}. The blue bar is ${word(b)} ${uw(u, b)}. ${Word(a)} minus ${word(b)} is ${word(d)}, so the red bar is ${word(d)} ${uw(u, d)} longer.`), { skill: "measure", item: `longer:${u}:${a}-${b}` });
}
function pointItem(r) {
  const v = 10 * r.int(1, 9);
  const ask = "The dot marks the length of a string in centimeters. How long is the string?";
  const a = `${Word(v)} centimeters.`;
  return test(V.nl(0, 100, { by: 10, points: [{ v }] }), ask, a, fix(a, ask, `Each tick is ten. I count by tens from zero to the dot: ${chain(10, v, 10)}. ${Word(v)} centimeters.`), { skill: "measure", item: `nl:point:${v}` });
}
function hopsItem(r, kind) {
  const a = 10 * r.int(1, 6), k = r.int(2, 4), b = Math.min(a + 10 * k, 100), d = b - a;
  const nl = V.nl(0, 100, { by: 10, hops: [a, b] });
  if (kind === "far") {
    const ask = `The arrow starts at ${word(a)} and hops by tens to ${word(b)}. How far is it from ${word(a)} to ${word(b)}?`;
    return test(nl, ask, Word(d) + ".", fix(Word(d) + ".", ask, `Each hop is ten. I count the hops: ${chain(10, d, 10)}. ${Word(d / 10)} hops of ten is ${word(d)}.`), { skill: "measure", item: `nl:far:${a}-${b}` });
  }
  const ask = `Start at ${word(a)}. Count the hops by tens. Where does the arrow land?`;
  return test(nl, ask, Word(b) + ".", fix(Word(b) + ".", ask, `From ${word(a)} I count by tens, one number for each hop: ${chain(a + 10, b, 10)}. The arrow lands on ${word(b)}.`), { skill: "measure", item: `nl:land:${a}-${b}` });
}
function lenStory(r) {
  const [name, pro] = r.pick(NAMES);
  const [other] = r.pick(NAMES.filter(([n]) => n !== name));
  const u = r.pick(["in", "cm"]);
  const ab = u === "in" ? "inches" : "cm";
  const kind = r.pick(["cut", "join", "taller", "grow"]);
  const add = kind === "join" || kind === "grow";
  let A, B;
  if (add) { A = r.int(21, 60); B = r.int(12, Math.min(39, 99 - A)); }
  else { B = r.int(12, 45); A = B + r.int(11, 45); }
  const ans = add ? A + B : A - B;
  const lines = {
    cut: [`${name} has a ribbon ${A} ${ab} long.`, `${cap(pro)} cuts off ${B} ${ab}.`, "How long is the ribbon now?"],
    join: [`${name} lays two sticks end to end.`, `One stick is ${A} ${ab} long. The other is ${B} ${ab} long.`, "How long are they together?"],
    taller: [`${name} is ${A} ${ab} tall.`, `${other} is ${B} ${ab} tall.`, `How much taller is ${name} than ${other}?`],
    grow: [`A plant was ${A} ${ab} tall.`, `It grew ${B} ${ab} more.`, "How tall is the plant now?"],
  }[kind];
  const ask = lines[lines.length - 1];
  const a = lenWord(ans, u);
  const why = add
    ? `The two lengths are put together, so we add. ${Word(A)} plus ${word(B)} is ${word(ans)}.`
    : `${Word(A)} is the big number and we want the difference, so we subtract. ${Word(A)} minus ${word(B)} is ${word(ans)}.`;
  return test(prose(lines), `Read the story. ${ask}`, a, fix(a, ask, why), { skill: "measure", item: `lenstory:${kind}:${A}${add ? "+" : "-"}${B}`, do: WHITEBOARD, secs: 30 });
}
const UNIT_FACTS = [
  ["How many inches are in a foot?", 12, "A foot is twelve inches: the length of a ruler.", "in-ft"],
  ["How many feet are in a yard?", 3, "A yard is three feet: about one big step.", "ft-yd"],
  ["How many centimeters are in a meter?", 100, "A meter is one hundred centimeters: about one big step.", "cm-m"],
];
const WHICH = [
  ["a book", "inches", "feet", "A book is small. Inches are the small unit."],
  ["a car", "feet", "inches", "A car is long. It would take hundreds of inches, so we use feet."],
  ["a football field", "yards", "inches", "A football field is very long. Yards are the biggest unit."],
  ["a crayon", "centimeters", "meters", "A crayon is small. It is not even one meter, so we use centimeters."],
  ["a room", "meters", "centimeters", "A room is big. Meters are the big unit."],
  ["a shoe", "inches", "yards", "A shoe is small. A yard is about one big step, far too big."],
  ["a swimming pool", "meters", "centimeters", "A pool is long. It would take hundreds of centimeters, so we use meters."],
  ["a ladybug", "centimeters", "meters", "A ladybug is tiny. Centimeters are the small unit."],
];
function factItem(r) {
  const [ask, n, why, key] = r.pick(UNIT_FACTS);
  return test(V.say(), ask, Word(n) + ".", fix(Word(n) + ".", ask, why), { skill: "measure", item: `unit:${key}` });
}
function whichItem(r) {
  const [thing, right, wrong, why] = r.pick(WHICH);
  const [x, y] = r.shuffle([right, wrong]);
  const ask = `To measure ${thing}, would you use ${x} or ${y}?`;
  const a = cap(right) + ".";
  return test(V.say(), ask, a, fix(a, ask, why), { skill: "measure", item: `which:${thing.replace(/^an? /, "")}` });
}

function lengthItem(u, r) {
  switch (u.id) {
    case "inches": return rulerItem(r, "in");
    case "centimeters": return r() < 0.75 ? rulerItem(r, "cm") : smallerItem();
    case "estimate": return r() < 0.5 ? guessItem(r) : nearItem(r, r.pick(["in", "cm"]));
    case "compare": return compareItem(r, r.pick(["in", "cm"]));
    case "line": return r.pick([pointItem, (x) => hopsItem(x, "far"), (x) => hopsItem(x, "land")])(r);
    case "stories": return lenStory(r);
    default: return r() < 0.5 ? factItem(r) : whichItem(r);
  }
}

export const length = {
  id: "length",
  name: "Length",
  summary: "Measure with a ruler in inches and centimeters, estimate and measure to the nearest unit, find how much longer one thing is than another, show lengths on a number line, solve length stories, and choose feet, yards, and meters for bigger things.",
  standard: "2.MD.1, 2.MD.2, 2.MD.3, 2.MD.4, 2.MD.5, 2.MD.6",
  units: [
    { id: "inches", lesson: 13, label: "Measuring in inches" },
    { id: "centimeters", lesson: 19, label: "Measuring in centimeters" },
    { id: "estimate", lesson: 27, label: "Estimating a length" },
    { id: "compare", lesson: 41, label: "How much longer" },
    { id: "line", lesson: 57, label: "Lengths on a number line" },
    { id: "stories", lesson: 75, label: "Length stories" },
    { id: "units", lesson: 88, label: "Feet, yards, and meters" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "inches") {
      return {
        title: u.label, steps: [
          model(V.ruler(8, { unit: "in", obj: 5, start: 0 }), "This ruler measures in inches. The numbers count the inches from zero. My turn. The bar starts at zero. It ends at the five. The bar is five inches long."),
          model(V.ruler(8, { unit: "in", obj: 3, start: 0 }), "The bar must start at zero. Then the number at its end tells the length. This bar ends at the three. Three inches."),
          lead(V.ruler(8, { unit: "in", obj: 6, start: 0 }), "Where does the bar start? Zero. Where does it end? How many inches? Say it with me.", "Six inches."),
          rulerItem(r, "in"), rulerItem(r, "in"), rulerItem(r, "in"),
          test(V.say(), "When we measure with a ruler, where must the bar start?", "At zero.", fix("At zero.", "When we measure with a ruler, where must the bar start?", "The ruler counts from zero. If the bar starts somewhere else, the number at its end is not the length."), { skill: "measure", item: "ruler:zero" }),
        ],
        materials: "a ruler marked in inches, to measure a pencil after the exercise",
      };
    }
    if (u.id === "centimeters") {
      return {
        title: u.label, steps: [
          model(V.col2(V.ruler(4, { unit: "in", obj: 4, start: 0 }), V.ruler(10, { unit: "cm", obj: 10, start: 0 })), "The top ruler measures in inches. The bottom ruler measures in centimeters. Look how close together the centimeter marks are. A centimeter is smaller than an inch."),
          model(V.ruler(12, { unit: "cm", obj: 7, start: 0 }), "We read a centimeter ruler the same way. My turn. The bar starts at zero and ends at the seven. Seven centimeters."),
          lead(V.ruler(12, { unit: "cm", obj: 10, start: 0 }), "How many centimeters? Say it with me.", "Ten centimeters."),
          rulerItem(r, "cm"), rulerItem(r, "cm"), smallerItem(), rulerItem(r, "in"),
        ],
      };
    }
    if (u.id === "estimate") {
      return {
        title: u.label, steps: [
          model(V.say(), "Before we measure, we estimate. An estimate is a careful guess. My turn. About how long is a new pencil: seven inches or seventy inches?"),
          model(V.say(), "A ruler is twelve inches, and a pencil is shorter than a ruler. About seven inches. Seventy inches would be taller than you."),
          model(V.ruler(8, { unit: "in", obj: 5.8, start: 0 }), "Sometimes the end of a bar is between two marks. Then I say the nearer mark. This end is almost at six. The bar is about six inches."),
          lead(V.say(), "About how long is a paper clip: three centimeters or thirty centimeters? Say it with me.", "Three centimeters."),
          guessItem(r), nearItem(r, "in"), guessItem(r), nearItem(r, "cm"),
        ],
      };
    }
    if (u.id === "compare") {
      return {
        title: u.label, steps: [
          model(V.col2(V.ruler(8, { unit: "in", obj: 7, start: 0, c: "red" }), V.ruler(8, { unit: "in", obj: 4, start: 0, c: "blue" })), "The red bar is seven inches. The blue bar is four inches. How much longer is the red bar? I subtract: seven minus four is three. Three inches longer."),
          lead(V.col2(V.ruler(12, { unit: "cm", obj: 9, start: 0, c: "red" }), V.ruler(12, { unit: "cm", obj: 5, start: 0, c: "blue" })), "The red bar is nine centimeters. The blue bar is five. Nine minus five is how many? Say it with me.", "Four centimeters."),
          compareItem(r, "in"), compareItem(r, "cm"), compareItem(r, r.pick(["in", "cm"])),
        ],
      };
    }
    if (u.id === "line") {
      return {
        title: u.label, steps: [
          model(V.nl(0, 100, { by: 10, hops: [30, 60] }), "A number line can show lengths. The arrow starts at thirty and hops by tens to sixty. My turn. I count the hops: ten, twenty, thirty. It hopped thirty.", { do: "Touch each hop as you count." }),
          lead(V.nl(0, 100, { by: 10, hops: [20, 50] }), "Start at twenty. Count the hops by tens with me: thirty, forty, fifty. Where does the arrow land? Say it with me.", "Fifty."),
          pointItem(r), hopsItem(r, "land"), hopsItem(r, "far"), hopsItem(r, "far"),
        ],
      };
    }
    if (u.id === "stories") {
      return {
        title: u.label, steps: [
          model(prose("Ana has a ribbon 45 cm long.", "She cuts off 20 cm.", "How long is the ribbon now?"), "My turn. The ribbon was forty-five centimeters. Twenty centimeters are cut off: a part is taken away, so I subtract. Forty-five minus twenty is twenty-five. Twenty-five centimeters."),
          lead(prose("Ben lays two sticks end to end.", "One is 30 inches long. The other is 25 inches long.", "How long are they together?"), "Together means we put the lengths together, so we add. Thirty plus twenty-five is how many? Say it with me.", "Fifty-five inches."),
          lenStory(r), lenStory(r), lenStory(r),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.say(), "Bigger things take bigger units. Twelve inches make one foot: a ruler is one foot long."),
          model(V.say(), "Three feet make one yard, about one big step. One hundred centimeters make one meter, also about one big step."),
        model(V.say(), "My turn. To measure a book, I use inches. To measure a room, I use feet or meters. To measure a football field, I use yards."),
        lead(V.say(), "How many inches are in a foot? Say it with me.", "Twelve."),
        factItem(r), whichItem(r), factItem(r), whichItem(r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    return { title: "Length", steps: pickSteps(ctx.rand, intro, lengthItem) };
  },
  testItems(units, ctx, count) {
    return pickTests(ctx.rand, units, lengthItem, count);
  },
};

// ─────────────────────────────────────────────────────────────
// Time
// ─────────────────────────────────────────────────────────────

// "three twenty-five", "four o'clock", "seven oh five"
function timeWords(h, m) {
  if (m === 0) return `${word(h)} o'clock`;
  if (m < 10) return `${word(h)} oh ${word(m)}`;
  return `${word(h)} ${word(m)}`;
}
// The answer begins "It is", so On your own never mistakes it for a number.
const timeAns = (h, m) => `It is ${timeWords(h, m)}.`;
const next = (h) => (h % 12) + 1;
const prev = (h) => ((h + 10) % 12) + 1;
function clockWhy(h, m) {
  if (m === 0) return `The minute hand points straight up to the twelve, so it is o'clock. The hour hand points to ${word(h)}. ${cap(timeWords(h, m))}.`;
  const hour = m >= 35
    ? `The hour hand is close to ${word(next(h))}, but it has not reached it, so the hour is still ${word(h)}.`
    : `The hour hand has passed ${word(h)}, so the hour is ${word(h)}.`;
  return `The minute hand points to the ${word(m / 5)}. Each number is five minutes, so I count by fives: ${chain(5, m, 5)}. ${hour} ${cap(timeWords(h, m))}.`;
}
function clockItem(r, band) {
  const h = r.int(1, 12);
  const m = band === "easy" ? 5 * r.int(1, 6) : band === "hard" ? 5 * r.int(7, 11) : 5 * r.int(1, 11);
  const ask = "What time is it?";
  const a = timeAns(h, m);
  return test(V.clock(h, m), ask, a, fix(a, ask, clockWhy(h, m)), { skill: "time", item: `clock:${h}:${m}` });
}
function digitalRead(r) {
  const h = r.int(1, 12), m = 5 * r.int(1, 11);
  const ask = "What time is it?";
  const a = timeAns(h, m);
  const mins = m < 10 ? `zero ${word(m)}, which is ${word(m)} minutes` : `${word(m)} minutes`;
  return test(V.clock(h, m, { digital: true }), ask, a, fix(a, ask, `The number before the dots is the hour: ${word(h)}. The numbers after the dots are the minutes: ${mins}. ${cap(timeWords(h, m))}.`), { skill: "time", item: `digital:read:${h}:${m}` });
}
function matchItem(r) {
  const h = r.int(1, 12), m = 5 * r.int(1, 11);
  const wrong1 = [next(h), m];
  const wrong2 = [h, m === 5 ? 35 : m / 5];
  const opts = r.shuffle([[h, m], wrong1, wrong2]);
  const ans = opts.findIndex(([x, y]) => x === h && y === m);
  const ask = "Touch the digital clock that shows the same time.";
  const mm = String(m).padStart(2, "0");
  return test(V.row(V.clock(h, m, { size: "md" }), V.choices(opts.map(([x, y]) => V.clock(x, y, { digital: true })), ans)), ask, `(Touches ${h}:${mm}.)`,
    fixPoint(`The clock shows ${timeWords(h, m)}. On a digital clock the hour comes first, then the minutes: ${word(h)}, then ${m < 10 ? "zero " : ""}${word(m)}. (Touch it.)`, ask), { skill: "time", item: `digital:${h}:${m}`, confirm: `Yes, ${timeWords(h, m)}.` });
}
const AMPM_RULE = "From midnight to noon is a.m.: the morning. From noon to midnight is p.m.: the afternoon, the evening, and the night.";
const EVENTS = [
  ["eats breakfast", 7, 30, "a.m.", "Breakfast is in the morning.", "breakfast"],
  ["gets to school", 8, 0, "a.m.", "School starts in the morning.", "school"],
  ["has morning recess", 10, 15, "a.m.", "Morning recess comes before noon.", "recess"],
  ["eats lunch", 12, 0, "p.m.", "Lunch is at noon, and noon is p.m.", "lunch"],
  ["gets home from school", 3, 30, "p.m.", "School lets out in the afternoon.", "home"],
  ["plays outside after school", 4, 45, "p.m.", "After school is the afternoon.", "play"],
  ["eats dinner", 6, 0, "p.m.", "Dinner is in the evening.", "dinner"],
  ["goes to bed", 8, 30, "p.m.", "Bedtime is at night.", "bed"],
  ["wakes up", 6, 45, "a.m.", "Waking up starts the morning.", "wake"],
];
const timeAP = (h, m, ap) => (m === 0 ? `${word(h)} ${ap}` : `${timeWords(h, m)} ${ap}`);
function ampmItem(r) {
  const [name] = r.pick(NAMES);
  const [ev, h, m, ap, why, key] = r.pick(EVENTS);
  const ask = `${name} ${ev} at ${timeWords(h, m)}. Is that a.m. or p.m.?`;
  const a = cap(ap);
  return test(V.say(), ask, a, fix(a, ask, `${why} ${AMPM_RULE}`), { skill: "time", item: `ampm:${key}` });
}
function eventClock(r) {
  const [name] = r.pick(NAMES);
  const [ev, h, m, ap, why, key] = r.pick(EVENTS);
  const ask = `${name} ${ev} at this time. What time is it? Say a.m. or p.m.`;
  const a = `It is ${timeAP(h, m, ap)}`;
  return test(V.clock(h, m), ask, a, fix(a, ask, `The clock shows ${timeWords(h, m)}. ${why} So it is ${timeAP(h, m, ap)}`), { skill: "time", item: `ampm:clock:${key}` });
}
function laterItem(r, dir) {
  const h = r.int(1, 12), m = r.pick([0, 0, 30]);
  const h2 = dir > 0 ? next(h) : prev(h);
  const ask = dir > 0 ? `It is ${timeWords(h, m)}. What time will it be one hour later?` : `It is ${timeWords(h, m)}. What time was it one hour earlier?`;
  const a = timeAns(h2, m);
  const why = dir > 0
    ? `In one hour the minute hand goes all the way around, back to the same place, and the hour hand moves to the next number. ${Word(h)} and one more hour is ${word(h2)}.`
    : `One hour earlier, the minute hand was in the same place and the hour hand was one number back. One hour before ${word(h)} is ${word(h2)}.`;
  return test(V.clock(h, m), ask, a, fix(a, ask, `${why} ${cap(timeWords(h2, m))}.`), { skill: "time", item: `${dir > 0 ? "later" : "earlier"}:${h}:${m}` });
}
function spanItem(r) {
  const a = r.int(1, 8), k = r.int(1, 4), b = a + k;
  const ask = "The game starts at the first time and ends at the second time. How long is the game?";
  const ans = `${Word(k)} hour${s(k)}.`;
  return test(V.row(V.clock(a, 0, { size: "md" }), V.clock(b, 0, { size: "md" })), ask, ans, fix(ans, ask, `It starts at ${word(a)} o'clock and ends at ${word(b)} o'clock. I count the hours from ${word(a)}: ${chain(a + 1, b)}. ${Word(k)} hour${s(k)}.`), { skill: "time", item: `elapsed:${a}-${b}` });
}

function timeItem(u, r) {
  switch (u.id) {
    case "five": return clockItem(r);
    case "digital": return r() < 0.55 ? matchItem(r) : digitalRead(r);
    case "ampm": return r() < 0.5 ? ampmItem(r) : eventClock(r);
    default: return r.pick([(x) => laterItem(x, 1), (x) => laterItem(x, -1), spanItem])(r);
  }
}

export const time = {
  id: "time",
  name: "Time",
  summary: "Tell time to five minutes on a clock face, match it to a digital clock, say a.m. or p.m., and find an hour later, an hour earlier, and how long from one hour to another.",
  standard: "2.MD.7",
  units: [
    { id: "five", lesson: 31, label: "Time to five minutes" },
    { id: "digital", lesson: 43, label: "Clock faces and digital clocks" },
    { id: "ampm", lesson: 65, label: "A.m. and p.m." },
    { id: "elapsed", lesson: 109, label: "An hour later, an hour earlier" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "five") {
      return {
        title: u.label, steps: [
          model(V.clock(3, 25), "The numbers on a clock count minutes too. One number to the next is five minutes. My turn. I count by fives from the twelve to the minute hand."),
          model(V.clock(3, 25), "Five, ten, fifteen, twenty, twenty-five. The minute hand is at twenty-five. The hour hand has passed three. It is three twenty-five.", { do: "Touch each number as you count by fives." }),
          model(V.clock(8, 40), "The hour hand is close to nine, but has not reached it. The hour is still eight. Minutes: five, ten, fifteen, twenty, twenty-five, thirty, thirty-five, forty. It is eight forty."),
          lead(V.clock(7, 10), "Count by fives with me to the minute hand: five, ten. What time is it? Say it with me.", "It is seven ten."),
          clockItem(r, "easy"), clockItem(r), clockItem(r, "hard"), clockItem(r),
        ],
      };
    }
    if (u.id === "digital") {
      return {
        title: u.label, steps: [
          model(V.row(V.clock(3, 25, { size: "md" }), V.clock(3, 25, { digital: true })), "A digital clock shows the same time with numbers. The hour comes first, then the dots, then the minutes. Three, then twenty-five. Both clocks say three twenty-five."),
          model(V.clock(7, 5, { digital: true }), "When the minutes are less than ten, the clock shows a zero first. Zero five is five minutes. Seven oh five."),
          lead(V.row(V.clock(10, 40, { size: "md" }), V.clock(10, 40, { digital: true })), "Do these show the same time? Say the time with me.", "It is ten forty."),
          matchItem(r), digitalRead(r), matchItem(r), matchItem(r),
        ],
      };
    }
    if (u.id === "ampm") {
      return {
        title: u.label, steps: [
          model(V.say(), "A day has twenty-four hours, but a clock shows only twelve. So we say a.m. or p.m."),
          model(V.say(), AMPM_RULE),
          model(V.clock(7, 30), "My turn. Ana eats breakfast at this time. Breakfast is in the morning, so it is seven thirty a.m. Dinner at this time would be seven thirty p.m."),
          lead(V.say(), "Ben eats lunch at twelve o'clock. Is that a.m. or p.m.? Say it with me.", "P.m."),
          ampmItem(r), ampmItem(r), eventClock(r), eventClock(r),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.row(V.clock(2, 0, { size: "md" }), V.clock(3, 0, { size: "md" })), "In one hour the minute hand goes all the way around, and the hour hand moves to the next number."),
          model(V.row(V.clock(2, 0, { size: "md" }), V.clock(3, 0, { size: "md" })), "My turn. It is two o'clock. One hour later, it is three o'clock. One hour earlier than two o'clock was one o'clock."),
        model(V.row(V.clock(1, 0, { size: "md" }), V.clock(4, 0, { size: "md" })), "A movie starts at one o'clock and ends at four o'clock. How long is it? I count the hours from one: two, three, four. Three hours."),
        lead(V.clock(5, 30), "It is five thirty. One hour later? Say it with me.", "It is six thirty."),
        laterItem(r, 1), laterItem(r, -1), spanItem(r), spanItem(r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    return { title: "Time", steps: pickSteps(ctx.rand, intro, timeItem) };
  },
  testItems(units, ctx, count) {
    return pickTests(ctx.rand, units, timeItem, count);
  },
};

// ─────────────────────────────────────────────────────────────
// Money
// ─────────────────────────────────────────────────────────────

const COINS = [["quarter", 25], ["dime", 10], ["nickel", 5], ["penny", 1]];
const centsWord = (n) => `${word(n)} cent${s(n)}`;
const dollarsWord = (d, c) => (d === 0 ? centsWord(c) : `${word(d)} dollar${s(d)}${c ? ` and ${centsWord(c)}` : ""}`);
const mm = (c) => String(c).padStart(2, "0");

// A handful of coins: counts of each kind, the list, and the total.
function coinSet(r, max = 99, lo = 10, hi = 7) {
  for (let tries = 0; tries < 60; tries++) {
    const set = { quarter: r.int(0, 3), dime: r.int(0, 4), nickel: r.int(0, 2), penny: r.int(0, 4) };
    const list = COINS.flatMap(([c]) => Array(set[c]).fill(c));
    const total = COINS.reduce((a, [c, v]) => a + set[c] * v, 0);
    if (total >= lo && total <= max && list.length >= 3 && list.length <= hi) return { set, list, total, code: COINS.map(([c]) => c[0] + set[c]).join("") };
  }
  return { set: { quarter: 1, dime: 1, nickel: 1, penny: 0 }, list: ["quarter", "dime", "nickel"], total: 40, code: "q1d1n1p0" };
}
// "Quarters: twenty-five, fifty. Dime: sixty. Pennies: sixty-one, sixty-two."
function countScript(set) {
  let t = 0;
  const parts = [];
  for (const [c, v] of COINS) {
    const k = set[c];
    if (!k) continue;
    const seq = [];
    for (let i = 0; i < k; i++) { t += v; seq.push(word(t)); }
    parts.push(`${cap(k === 1 ? c : plural(c))}: ${seq.join(", ")}.`);
  }
  return parts.join(" ");
}
function coinsItem(r, mixed) {
  const { set, list, total, code } = coinSet(r);
  const ask = "How much money? Count the biggest coins first.";
  const a = `${Word(total)} cents.`;
  return test(V.coins(mixed ? r.shuffle(list) : list), ask, a, fix(a, ask, `I find the biggest coins first. ${countScript(set)} ${Word(total)} cents.`), { skill: "money", item: `coins:${code}${mixed ? ":mix" : ""}` });
}
function dollarItem() {
  const ask = "How much money?";
  const a = "One hundred cents. One dollar.";
  return test(V.coins(["quarter", "quarter", "quarter", "quarter"]), ask, a, fix(a, ask, "Four quarters: twenty-five, fifty, seventy-five, one hundred. One hundred cents is one dollar."), { skill: "money", item: "coins:dollar" });
}
function billsItem(r) {
  const d = r.int(1, 5);
  const { set, total } = coinSet(r, 99, 5, 6);
  const lines = [`${d} dollar bill${s(d)}`, ...COINS.filter(([c]) => set[c]).map(([c]) => `${set[c]} ${set[c] === 1 ? c : plural(c)}`)];
  const ask = "How much money? Say the dollars, then the cents.";
  const a = cap(dollarsWord(d, total)) + ".";
  return test(prose(lines), ask, a, fix(a, ask, `${Word(d)} dollar bill${s(d)}: ${word(d)} dollar${s(d)}. Now the coins. ${countScript(set)} ${cap(dollarsWord(d, total))}.`), { skill: "money", item: `bills:${d}:${total}` });
}
function readDollars(r, small) {
  const d = r.int(1, 9);
  const c = small ? r.int(1, 9) : r.pick([5 * r.int(2, 19), r.int(10, 99)]);
  const ask = "Read this amount.";
  const a = cap(dollarsWord(d, c)) + ".";
  const after = c < 10 ? `zero ${word(c)}, which is ${word(c)} cents` : `${word(c)} cents`;
  return test(V.num(`$${d}.${mm(c)}`), ask, a, fix(a, ask, `The dollar sign means dollars. Before the dot: ${word(d)} dollar${s(d)}. After the dot: ${after}. ${cap(dollarsWord(d, c))}.`), { skill: "money", item: `read:$${d}.${mm(c)}` });
}
function readCents(r) {
  const c = r.pick([5 * r.int(1, 19), r.int(5, 99)]);
  const ask = "Read this amount.";
  const a = `${Word(c)} cents.`;
  return test(V.num(`${c}¢`), ask, a, fix(a, ask, `The cent sign means cents, with no dollars. ${Word(c)} cents.`), { skill: "money", item: `read:${c}¢` });
}
function touchMoney(r) {
  const d = r.int(1, 9), c = r.int(10, 99);
  const swap = (c % 10) * 10 + Math.floor(c / 10);
  const alt1 = swap !== c && swap >= 10 ? [d, swap] : [d, (c + 10) % 100 || 10];
  const alt2 = [d === 9 ? 8 : d + 1, c];
  const text = ([x, y]) => `$${x}.${mm(y)}`;
  const opts = r.shuffle([[d, c], alt1, alt2]);
  const ans = opts.findIndex((o) => text(o) === text([d, c]));
  const ask = `Touch ${dollarsWord(d, c)}.`;
  return test(V.choices(opts.map((o) => V.num(text(o))), ans), ask, `(Touches ${text([d, c])}.)`,
    fixPoint(`${cap(dollarsWord(d, c))}: ${word(d)} before the dot, and ${word(c)} after the dot. (Touch it.)`, ask), { skill: "money", item: `touch:${text([d, c])}`, confirm: `Yes, ${dollarsWord(d, c)}.` });
}
// The fewest coins for an amount: the biggest coin that fits, again and again.
function fewest(amount) {
  const out = [];
  let left = amount;
  for (const [c, v] of COINS) while (left >= v) { out.push(c); left -= v; }
  return out;
}
// "a quarter, a dime, and a nickel: twenty-five, thirty-five, forty"
function fewestScript(list) {
  const names = list.map((c) => `a ${c}`);
  const joined = names.length === 1 ? names[0] : names.length === 2 ? names.join(" and ") : names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  let t = 0;
  const seq = list.map((c) => { t += COINS.find(([k]) => k === c)[1]; return word(t); });
  return `${cap(joined)}: ${seq.join(", ")}`;
}
function fewestItem(r) {
  const amount = 5 * r.int(2, 19);
  const list = fewest(amount);
  const ask = `What is the fewest coins that make ${centsWord(amount)}?`;
  const a = Word(list.length) + ".";
  return test(V.say(), ask, a, fix(a, ask, `Start with the biggest coin that fits, then the next. ${fewestScript(list)}. ${Word(list.length)} coin${s(list.length)}.`), { skill: "money", item: `fewest:${amount}` });
}
function fewestTouch(r) {
  const amount = 5 * r.int(6, 12);
  const best = fewest(amount);
  const i = best.indexOf("quarter");
  const alt1 = [...best.slice(0, i), "dime", "dime", "nickel", ...best.slice(i + 1)];
  const alt2 = [...best.slice(0, i), "dime", "nickel", "nickel", "nickel", ...best.slice(i + 1)];
  const opts = r.shuffle([best, alt1, alt2]);
  const ans = opts.indexOf(best);
  const ask = `Each row makes ${centsWord(amount)}. Touch the row with the fewest coins.`;
  return test(V.choices(opts.map((l) => V.coins(l, { size: "sm" })), ans), ask, `(Touches the row of ${word(best.length)} coins.)`,
    fixPoint(`The fewest coins start with the biggest coin. ${fewestScript(best)}. ${Word(best.length)} coins. (Touch that row.)`, ask), { skill: "money", item: `fewest:touch:${amount}`, confirm: `Yes, ${word(best.length)} coins.` });
}
const WARES = ["a pencil", "a sticker", "an eraser", "a toy ring", "a balloon", "a bookmark"];
function changeItem(r) {
  const [name] = r.pick(NAMES);
  const p = r() < 0.7 ? 5 * r.int(3, 19) : r.int(21, 94);
  const ask = `${name} buys ${r.pick(WARES)} for ${centsWord(p)} and pays with a dollar. How much change?`;
  const a = `${Word(100 - p)} cents.`;
  return test(V.say(), ask, a, fix(a, ask, `A dollar is one hundred cents. One hundred minus ${word(p)} is ${word(100 - p)}. ${Word(100 - p)} cents change.`), { skill: "money", item: `change:${p}` });
}
function moneyStory(r) {
  const [name, pro] = r.pick(NAMES);
  const [w1, w2] = r.sample(WARES, 2);
  const kind = r.pick(["get", "spend", "two", "change", "dollars"]);
  let lines, ans, why, key;
  if (kind === "get") {
    const A = r.int(15, 70), B = r.pick([5, 10, 25, r.int(11, 29)]);
    lines = [`${name} has ${A}¢.`, `${cap(pro)} finds ${B}¢ more.`, `How much money does ${pro} have now?`];
    ans = `${Word(A + B)} cents.`; why = `More money comes, so we add. ${Word(A)} plus ${word(B)} is ${word(A + B)}.`; key = `${A}+${B}`;
  } else if (kind === "spend") {
    const B = r.int(12, 45), A = B + r.int(10, 50);
    lines = [`${name} has ${A}¢.`, `${cap(pro)} buys ${w1} for ${B}¢.`, "How much money is left?"];
    ans = `${Word(A - B)} cents.`; why = `Money is spent, so we subtract. ${Word(A)} minus ${word(B)} is ${word(A - B)}.`; key = `${A}-${B}`;
  } else if (kind === "two") {
    const A = r.int(15, 55), B = r.int(10, Math.min(44, 99 - A));
    lines = [`${cap(w1)} costs ${A}¢.`, `${cap(w2)} costs ${B}¢.`, "How much do both cost together?"];
    ans = `${Word(A + B)} cents.`; why = `Together means we add. ${Word(A)} plus ${word(B)} is ${word(A + B)}.`; key = `${A}+${B}`;
  } else if (kind === "change") {
    const A = 5 * r.int(3, 19);
    lines = [`${cap(w1)} costs ${A}¢.`, `${name} pays with a dollar.`, "How much change does " + pro + " get?"];
    ans = `${Word(100 - A)} cents.`; why = `A dollar is one hundred cents. One hundred minus ${word(A)} is ${word(100 - A)}.`; key = `100-${A}`;
  } else {
    const d = r.int(1, 4), k = r.int(2, 4), q = r.int(0, 2);
    const c = 10 * k + 25 * q;
    lines = [`${name} has ${d} dollar bill${s(d)}, ${k} dimes,`, `and ${q === 0 ? "no quarters" : `${q} quarter${s(q)}`}.`, "How much money is that?"];
    ans = cap(dollarsWord(d, c)) + "."; why = `The bills are ${word(d)} dollar${s(d)}. Now the coins. ${countScript({ quarter: q, dime: k, nickel: 0, penny: 0 })}`; key = `${d}:${c}`;
  }
  const ask = lines[lines.length - 1];
  return test(prose(lines), `Read the story. ${ask}`, ans, fix(ans, ask, `${why} ${ans}`), { skill: "money", item: `money:${kind}:${key}`, do: WHITEBOARD, secs: 30 });
}

function moneyItem(u, r, lesson) {
  switch (u.id) {
    case "coins": return r() < 0.12 ? dollarItem() : coinsItem(r, lesson > 25 && r() < 0.5);
    case "bills": return billsItem(r);
    case "notation": return r.pick([(x) => readDollars(x), readCents, touchMoney, (x) => readDollars(x, true)])(r);
    case "make": return r.pick([fewestItem, fewestTouch, changeItem])(r);
    default: return moneyStory(r);
  }
}

export const money = {
  id: "money",
  name: "Money",
  summary: "Count mixed coins to a dollar, count dollar bills with coins, read and write amounts with the dollar sign and the cent sign, make an amount with the fewest coins, give change from a dollar, and solve money stories.",
  standard: "2.MD.8",
  units: [
    { id: "coins", lesson: 17, label: "Counting mixed coins" },
    { id: "bills", lesson: 47, label: "Dollars and cents" },
    { id: "notation", lesson: 59, label: "The dollar sign and the cent sign" },
    { id: "make", lesson: 79, label: "The fewest coins, and change from a dollar" },
    { id: "stories", lesson: 100, label: "Money stories" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "coins") {
      return {
        title: u.label, steps: [
          model(V.coins(["quarter", "quarter", "dime", "nickel", "penny", "penny"]), "To count mixed coins, start with the biggest coins. My turn. Quarters: twenty-five, fifty. Dime: sixty. Nickel: sixty-five. Pennies: sixty-six, sixty-seven. Sixty-seven cents.", { do: "Touch each coin as you count it." }),
          model(V.coins(["quarter", "quarter", "quarter", "quarter"]), "Four quarters: twenty-five, fifty, seventy-five, one hundred. One hundred cents is one dollar."),
          lead(V.coins(["quarter", "dime", "dime", "nickel"]), "Count with me. Quarter: twenty-five. Dimes: thirty-five, forty-five. Nickel: fifty. How much?", "Fifty cents."),
          coinsItem(r), coinsItem(r), coinsItem(r), dollarItem(),
        ],
        materials: "a few real coins, if you have them",
      };
    }
    if (u.id === "bills") {
      return {
        title: u.label, steps: [
          model(prose("2 dollar bills", "3 quarters", "1 dime"), "A dollar bill is one dollar: one hundred cents. We count the dollars first, then the cents."),
          model(prose("2 dollar bills", "3 quarters", "1 dime"), "My turn. Two dollar bills: two dollars. Quarters: twenty-five, fifty, seventy-five. Dime: eighty-five. Two dollars and eighty-five cents."),
          lead(prose("3 dollar bills", "1 quarter", "2 pennies"), "Dollars first: three dollars. Cents: twenty-five, twenty-six, twenty-seven. How much? Say it with me.", "Three dollars and twenty-seven cents."),
          billsItem(r), billsItem(r), billsItem(r),
        ],
      };
    }
    if (u.id === "notation") {
      return {
        title: u.label, steps: [
          model(V.num("$2.85"), "This is how we write money. The dollar sign means dollars. Before the dot is the dollars: two. After the dot is the cents: eighty-five. Two dollars and eighty-five cents."),
          model(V.num("85¢"), "This is the cent sign. Eighty-five cents, with no dollars."),
          model(V.num("$3.05"), "Watch the zero. After the dot: zero five. That is five cents. Three dollars and five cents."),
          lead(V.num("$4.60"), "Read it with me.", "Four dollars and sixty cents."),
          readDollars(r), readCents(r), touchMoney(r), readDollars(r, true),
        ],
      };
    }
    if (u.id === "make") {
      return {
        title: u.label, steps: [
          model(V.coins(["quarter", "dime", "nickel"]), "To make an amount with the fewest coins, start with the biggest coin that fits. My turn. Forty cents. Quarter: twenty-five. Dime: thirty-five. Nickel: forty. Three coins."),
          model(V.say(), "Change. Cora buys a pencil for sixty cents and pays with a dollar. A dollar is one hundred cents. One hundred minus sixty is forty. Forty cents change."),
          lead(V.say(), "Thirty cents with the fewest coins. A quarter is twenty-five. What coin makes thirty? Say it with me.", "A nickel. Two coins."),
          fewestItem(r), fewestTouch(r), changeItem(r), changeItem(r),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(prose("Eli has 45¢.", "He finds a quarter.", "How much money does he have now?"), "A money story. My turn. Eli has forty-five cents. A quarter is twenty-five cents more. Forty-five plus twenty-five is seventy. Seventy cents."),
        lead(prose("A sticker costs 30¢.", "Hana pays with a dollar.", "How much change does she get?"), "A dollar is one hundred cents. One hundred minus thirty is how many? Say it with me.", "Seventy cents."),
        moneyStory(r), moneyStory(r), moneyStory(r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    return { title: "Money", steps: pickSteps(ctx.rand, intro, (u, r) => moneyItem(u, r, ctx.lesson)) };
  },
  testItems(units, ctx, count) {
    return pickTests(ctx.rand, units, (u, r) => moneyItem(u, r, ctx.lesson), count);
  },
};

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

// Bar graph scenarios: short labels for the bars, full names for the script.
const SETS = [
  {
    key: "books", title: "Books read", unit: "books",
    cats: [["Mon", "Monday"], ["Tue", "Tuesday"], ["Wed", "Wednesday"], ["Thu", "Thursday"], ["Fri", "Friday"]],
    how: (f) => `How many books were read on ${f}?`,
    more: (a, b) => `How many more books were read on ${a} than on ${b}?`,
    fewer: (a, b) => `How many fewer books were read on ${a} than on ${b}?`,
    most: "On which day were the most books read?",
    fewest: "On which day were the fewest books read?",
    both: (a, b) => `How many books were read on ${a} and ${b} together?`,
    all: "How many books were read in all?",
    moreThan: (a, b, c) => `${a} and ${b} together: how many more books than ${c}?`,
  },
  {
    key: "pets", title: "Our pets", unit: "pets",
    cats: [["Cats", "cats"], ["Dogs", "dogs"], ["Fish", "fish"], ["Birds", "birds"]],
    how: (f) => `How many ${f}?`,
    more: (a, b) => `How many more ${a} than ${b}?`,
    fewer: (a, b) => `How many fewer ${a} than ${b}?`,
    most: "Which pet is there the most of?",
    fewest: "Which pet is there the fewest of?",
    both: (a, b) => `How many ${a} and ${b} together?`,
    all: "How many pets in all?",
    moreThan: (a, b, c) => `${cap(a)} and ${b} together: how many more than ${c}?`,
  },
  {
    key: "fruit", title: "Fruit picked", unit: "pieces of fruit",
    cats: [["Apples", "apples"], ["Pears", "pears"], ["Plums", "plums"], ["Peaches", "peaches"]],
    how: (f) => `How many ${f} were picked?`,
    more: (a, b) => `How many more ${a} than ${b} were picked?`,
    fewer: (a, b) => `How many fewer ${a} than ${b} were picked?`,
    most: "Which fruit was picked the most?",
    fewest: "Which fruit was picked the fewest?",
    both: (a, b) => `How many ${a} and ${b} were picked together?`,
    all: "How many pieces of fruit were picked in all?",
    moreThan: (a, b, c) => `${cap(a)} and ${b} together: how many more than ${c}?`,
  },
];
// A bar graph: the set, the categories shown, their counts, and the scale.
function barGraph(r, o = {}) {
  const set = o.set || r.pick(SETS);
  const k = Math.min(o.k || r.int(3, 4), set.cats.length);
  const cats = set.key === "books" ? set.cats.slice(0, k) : r.sample(set.cats, k);
  const scale = o.scale || r.pick([1, 2]);
  const pool = scale === 1 ? [2, 3, 4, 5, 6, 7, 8, 9] : o.odd ? [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [2, 4, 6, 8, 10, 12];
  const ns = r.sample(pool, k);
  const g = V.graph("bar", cats.map(([label], i) => ({ label, n: ns[i] })), { scale, title: set.title });
  return { set, cats, ns, scale, g };
}
function endsAt(scale, n) {
  if (scale === 2 && n % 2) return `The numbers go by twos. The bar ends halfway between ${word(n - 1)} and ${word(n + 1)}, so it is ${word(n)}.`;
  return `The bar ends at the ${word(n)} line.`;
}
function barRead(r, o) {
  const { set, cats, ns, scale, g } = barGraph(r, o);
  const i = r.int(0, cats.length - 1);
  const [label, full] = cats[i], n = ns[i];
  const ask = set.how(full);
  return test(g, ask, Word(n) + ".", fix(Word(n) + ".", ask, `I find the ${full} bar and look where it ends. ${endsAt(scale, n)} ${Word(n)}.`), { skill: "data", item: `bar:read:${label.toLowerCase()}:${n}` });
}
function barCompare(r, kind) {
  const { set, cats, ns, scale, g } = barGraph(r, { odd: true });
  if (kind === "most" || kind === "fewest") {
    const i = ns.indexOf(kind === "most" ? Math.max(...ns) : Math.min(...ns));
    const [label, full] = cats[i];
    const ask = set[kind];
    const a = cap(full) + ".";
    return test(g, ask, a, fix(a, ask, `The ${kind === "most" ? "tallest" : "shortest"} bar is ${full}: ${word(ns[i])}. ${cap(full)}.`), { skill: "data", item: `bar:${kind}:${label.toLowerCase()}` });
  }
  const [i, j] = r.sample(cats.map((c, idx) => idx), 2);
  const big = ns[i] > ns[j] ? i : j, small = big === i ? j : i;
  const d = ns[big] - ns[small];
  const [a, b] = kind === "more" ? [big, small] : [small, big];
  const ask = set[kind](cats[a][1], cats[b][1]);
  return test(g, ask, Word(d) + ".", fix(Word(d) + ".", ask, `${cap(cats[big][1])}: ${word(ns[big])}. ${cap(cats[small][1])}: ${word(ns[small])}. ${Word(ns[big])} minus ${word(ns[small])} is ${word(d)}.`), { skill: "data", item: `bar:${kind}:${cats[a][0].toLowerCase()}-${cats[b][0].toLowerCase()}` });
}
function barTwoStep(r, kind) {
  const { set, cats, ns, g } = barGraph(r, { k: 3, scale: 1 });
  const idx = cats.map((c, i) => i);
  if (kind === "all") {
    const sum = ns.reduce((x, y) => x + y, 0);
    const ask = set.all;
    const steps = `${Word(ns[0])} plus ${word(ns[1])} is ${word(ns[0] + ns[1])}, and ${word(ns[0] + ns[1])} plus ${word(ns[2])} is ${word(sum)}.`;
    return test(g, ask, Word(sum) + ".", fix(Word(sum) + ".", ask, `I read every bar, then add: ${cats.map((c, i) => `${c[1]} ${word(ns[i])}`).join(", ")}. ${steps}`), { skill: "data", item: `bar:all:${ns.join("-")}`, secs: 20 });
  }
  const [i, j, k] = r.shuffle(idx);
  const sum = ns[i] + ns[j];
  if (kind === "both") {
    const ask = set.both(cats[i][1], cats[j][1]);
    return test(g, ask, Word(sum) + ".", fix(Word(sum) + ".", ask, `First I read both bars: ${cats[i][1]} ${word(ns[i])}, ${cats[j][1]} ${word(ns[j])}. Then I add: ${word(ns[i])} plus ${word(ns[j])} is ${word(sum)}.`), { skill: "data", item: `bar:both:${cats[i][0].toLowerCase()}-${cats[j][0].toLowerCase()}`, secs: 20 });
  }
  const d = sum - ns[k];
  if (d <= 0) return barTwoStep(r, "both");
  const ask = set.moreThan(cap(cats[i][1]), cats[j][1], cats[k][1]);
  return test(g, ask, Word(d) + ".", fix(Word(d) + ".", ask, `First I add ${cats[i][1]} and ${cats[j][1]}: ${word(ns[i])} plus ${word(ns[j])} is ${word(sum)}. Then I subtract ${cats[k][1]}: ${word(sum)} minus ${word(ns[k])} is ${word(d)}.`), { skill: "data", item: `bar:two:${cats[i][0].toLowerCase()}+${cats[j][0].toLowerCase()}-${cats[k][0].toLowerCase()}`, secs: 24, do: WHITEBOARD });
}
const PICT_ICONS = ["apple", "star", "duck", "fish", "ball", "flower", "bird", "frog", "leaf", "boat"];
const KEY = V.prose("Each picture stands for 2.");
function pictGraph(r) {
  const icons = r.sample(PICT_ICONS, 3);
  const ns = r.sample([1, 2, 3, 4, 5, 6], 3);
  return { icons, ns, g: [V.graph("picture", icons.map((icon, i) => ({ icon, n: ns[i] }))), KEY] };
}
function pictItem(r) {
  const { icons, ns, g } = pictGraph(r);
  if (r() < 0.25) {
    const i = ns.indexOf(Math.max(...ns));
    const ask = "Which row has the most?";
    const a = cap(plural(icons[i])) + ".";
    return test(g, ask, a, fix(a, ask, `The row with the most pictures is the ${icons[i]} row: ${word(ns[i])} pictures, ${word(2 * ns[i])} ${plural(icons[i])}.`), { skill: "data", item: `pict2:most:${icons[i]}` });
  }
  const i = r.int(0, 2), n = 2 * ns[i];
  const ask = `Each picture stands for two. How many ${plural(icons[i])}?`;
  return test(g, ask, Word(n) + ".", fix(Word(n) + ".", ask, `Each picture is two, so I count the pictures in the ${icons[i]} row by twos: ${chain(2, n, 2)}. ${Word(n)} ${plural(icons[i], n)}.`), { skill: "data", item: `pict2:${icons[i]}:${n}` });
}
const PLOT_TITLE = "Pencil lengths in inches";
function plotData(r) {
  const vals = [3, 4, 5, 6, 7, 8];
  let ns;
  do { ns = vals.map(() => r.pick([0, 1, 1, 2, 2, 3, 4])); } while (ns.filter(Boolean).length < 3 || ns.reduce((a, b) => a + b, 0) > 12);
  return { vals, ns, g: V.graph("plot", vals.map((v, i) => ({ v, n: ns[i] })), { title: PLOT_TITLE }) };
}
function plotItem(r, kind) {
  const { vals, ns, g } = plotData(r);
  const total = ns.reduce((a, b) => a + b, 0);
  if (kind === "at") {
    const i = r.pick(vals.map((v, idx) => idx).filter((idx) => ns[idx] > 0));
    const ask = `How many pencils were ${word(vals[i])} inches long?`;
    return test(g, ask, Word(ns[i]) + ".", fix(Word(ns[i]) + ".", ask, `I find ${word(vals[i])} on the line and count the marks above it: ${chain(1, ns[i])}. ${Word(ns[i])} pencil${s(ns[i])}.`), { skill: "data", item: `plot:at:${vals[i]}:${ns[i]}` });
  }
  if (kind === "all") {
    const ask = "How many pencils were measured in all?";
    return test(g, ask, Word(total) + ".", fix(Word(total) + ".", ask, `Each mark is one pencil. I count every mark: ${chain(1, total)}. ${Word(total)} pencils.`), { skill: "data", item: `plot:all:${ns.join("")}` });
  }
  const i = kind === "longest" ? ns.length - 1 - [...ns].reverse().findIndex((n) => n > 0) : ns.findIndex((n) => n > 0);
  const ask = `How long was the ${kind} pencil?`;
  const a = `${Word(vals[i])} inches.`;
  return test(g, ask, a, fix(a, ask, `The ${kind} length with a mark above it is ${word(vals[i])}. ${Word(vals[i])} inches.`), { skill: "data", item: `plot:${kind}:${vals[i]}` });
}
const TABLE_SETS = [
  { head: ["Pet", "How many"], cats: SETS[1].cats, icons: ["duck", "frog", "fish", "bird"] },
  { head: ["Fruit", "How many"], cats: SETS[2].cats, icons: ["apple", "star", "leaf", "flower"] },
];
function tableData(r) {
  const set = r.pick(TABLE_SETS);
  const cats = r.sample(set.cats, 3);
  const ns = r.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3);
  return { cats, ns, t: V.table(set.head, cats.map(([label], i) => [label, ns[i]])), icons: r.sample(set.icons, 3) };
}
function tableItem(r, kind) {
  const { cats, ns, t, icons } = tableData(r);
  if (kind === "tally") {
    const tn = r.sample([3, 4, 6, 7, 8, 9], 3);
    const i = r.int(0, 2);
    const ask = `We will make a bar graph from this tally chart. How tall is the bar for ${plural(icons[i])}?`;
    const bundles = Math.floor(tn[i] / 5), rest = tn[i] % 5;
    const count = [...Array(bundles).keys()].map((b) => word(5 * (b + 1))).concat([...Array(rest).keys()].map((k) => word(5 * bundles + k + 1))).join(", ");
    return test(V.graph("tally", icons.map((icon, idx) => ({ icon, n: tn[idx] }))), ask, Word(tn[i]) + ".", fix(Word(tn[i]) + ".", ask, `I count the tally marks in the ${icons[i]} row, bundles by fives: ${count}. The bar for ${plural(icons[i])} goes up to ${word(tn[i])}.`), { skill: "data", item: `tally:bar:${icons[i]}:${tn[i]}` });
  }
  if (kind === "more") {
    const [i, j] = r.sample([0, 1, 2], 2);
    const big = ns[i] > ns[j] ? i : j, small = big === i ? j : i;
    const ask = `Which has more, ${cats[i][1]} or ${cats[j][1]}?`;
    const a = cap(cats[big][1]) + ".";
    return test(t, ask, a, fix(a, ask, `${cap(cats[i][1])}: ${word(ns[i])}. ${cap(cats[j][1])}: ${word(ns[j])}. ${Word(ns[big])} is more than ${word(ns[small])}, so ${cats[big][1]}.`), { skill: "data", item: `table:more:${cats[i][0]}-${cats[j][0]}` });
  }
  const i = r.int(0, 2);
  if (kind === "bar") {
    const ask = `If we made a bar graph from this table, how tall would the ${cats[i][1]} bar be?`;
    return test(t, ask, Word(ns[i]) + ".", fix(Word(ns[i]) + ".", ask, `The table says ${word(ns[i])} ${cats[i][1]}, so the bar goes up to ${word(ns[i])}.`), { skill: "data", item: `table:bar:${cats[i][0]}:${ns[i]}` });
  }
  const ask = `How many ${cats[i][1]}?`;
  return test(t, ask, Word(ns[i]) + ".", fix(Word(ns[i]) + ".", ask, `I find the ${cats[i][1]} row and read the number beside it: ${word(ns[i])}.`), { skill: "data", item: `table:read:${cats[i][0]}:${ns[i]}` });
}

function dataItem(u, r) {
  switch (u.id) {
    case "picture": return pictItem(r);
    case "bar": return barRead(r);
    case "compare": return barCompare(r, r.pick(["more", "fewer", "most", "fewest"]));
    case "plot": return plotItem(r, r.pick(["at", "at", "longest", "shortest", "all"]));
    case "table": return tableItem(r, r.pick(["read", "more", "bar", "tally"]));
    default: return barTwoStep(r, r.pick(["both", "both", "all", "moreThan"]));
  }
}

const BOOKS = V.graph("bar", [{ label: "Mon", n: 4 }, { label: "Tue", n: 6 }, { label: "Wed", n: 3 }], { scale: 1, title: "Books read" });
const PETS = V.graph("bar", [{ label: "Cats", n: 8 }, { label: "Dogs", n: 6 }, { label: "Fish", n: 4 }], { scale: 2, title: "Our pets" });
const PLOT = V.graph("plot", [{ v: 3, n: 1 }, { v: 4, n: 3 }, { v: 5, n: 2 }, { v: 6, n: 4 }, { v: 7, n: 0 }, { v: 8, n: 1 }], { title: PLOT_TITLE });
const TABLE = V.table(["Pet", "How many"], [["Cats", 7], ["Dogs", 9], ["Fish", 4]]);

export const data = {
  id: "data",
  name: "Data",
  summary: "Read picture graphs where each picture stands for two, bar graphs with a scale of one or two, line plots of measured lengths, and tables; compare, and answer two-step questions from a graph.",
  standard: "2.MD.9, 2.MD.10",
  units: [
    { id: "picture", lesson: 36, label: "A picture graph where each picture is two" },
    { id: "bar", lesson: 49, label: "Reading a bar graph" },
    { id: "compare", lesson: 61, label: "How many more, the most, the fewest" },
    { id: "plot", lesson: 83, label: "Line plots of lengths" },
    { id: "table", lesson: 95, label: "Tables, and tallies into bars" },
    { id: "two-step", lesson: 115, label: "Two-step questions from a graph" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "picture") {
      return {
        title: u.label, steps: [
          model([V.graph("picture", [{ icon: "apple", n: 3 }, { icon: "star", n: 5 }, { icon: "ball", n: 2 }]), KEY], "In this picture graph, each picture stands for two, not one. The key says so. My turn. Apples: three pictures. I count by twos: two, four, six. Six apples.", { do: "Touch each picture as you count by twos." }),
          model([V.graph("picture", [{ icon: "apple", n: 3 }, { icon: "star", n: 5 }, { icon: "ball", n: 2 }]), KEY], "Stars: five pictures. Two, four, six, eight, ten. Ten stars. Balls: two pictures. Two, four. Four balls."),
          lead([V.graph("picture", [{ icon: "fish", n: 4 }, { icon: "duck", n: 1 }, { icon: "frog", n: 3 }]), KEY], "Each picture is two. Count the fish by twos with me: two, four, six, eight. How many fish?", "Eight."),
          pictItem(r), pictItem(r), pictItem(r),
        ],
      };
    }
    if (u.id === "bar") {
      return {
        title: u.label, steps: [
          model(BOOKS, "This is a bar graph. Each bar stands for one day. The taller the bar, the more books."),
          model(BOOKS, "To read a bar, I look where it ends and read the number on the left. My turn. Tuesday: the bar ends at six. Six books.", { do: "Run a finger from the top of the bar to the number on the left." }),
          model(PETS, "Watch the numbers on this graph. They go by twos: zero, two, four, six, eight. The dogs bar ends at six. Six dogs."),
          lead(BOOKS, "How many books were read on Wednesday? Say it with me.", "Three."),
          barRead(r, { scale: 1 }), barRead(r, { scale: 1 }), barRead(r, { scale: 2 }),
        ],
      };
    }
    if (u.id === "compare") {
      return {
        title: u.label, steps: [
          model(BOOKS, "My turn. How many more books on Tuesday than on Monday? Tuesday: six. Monday: four. Six minus four is two. Two more books on Tuesday."),
          model(BOOKS, "Which day had the most? The tallest bar: Tuesday. Which day had the fewest? The shortest bar: Wednesday."),
          lead(PETS, "How many more cats than fish? Cats: eight. Fish: four. Eight minus four is how many? Say it with me.", "Four."),
          barCompare(r, "more"), barCompare(r, "most"), barCompare(r, "fewer"), barCompare(r, "fewest"),
        ],
      };
    }
    if (u.id === "plot") {
      return {
        title: u.label, steps: [
          model(PLOT, "This is a line plot. We measured pencils in inches. Each X stands for one pencil, above its length."),
          model(PLOT, "My turn. How many pencils were four inches? I find four and count the marks above it: one, two, three. Three pencils.", { do: "Touch each mark as you count." }),
          model(PLOT, "The longest pencil? The last length with a mark above it is eight. Eight inches."),
          lead(PLOT, "How many pencils were six inches? Count the marks with me.", "Four."),
          plotItem(r, "at"), plotItem(r, "longest"), plotItem(r, "at"), plotItem(r, "all"),
        ],
      };
    }
    if (u.id === "table") {
      return {
        title: u.label, steps: [
          model(TABLE, "A table shows the same facts as a graph, with numbers. Each row is one pet. My turn. Dogs: I find the dogs row and read across. Nine dogs."),
          model(TABLE, "Which has more, cats or fish? Cats: seven. Fish: four. Seven is more than four. Cats."),
          model(V.graph("tally", [{ icon: "duck", n: 7 }, { icon: "frog", n: 4 }]), "A tally chart can become a bar graph. Ducks: five, six, seven marks, so the duck bar goes up to seven. Frogs: four marks, so the frog bar is four."),
          lead(TABLE, "If we made a bar graph from this table, how tall would the fish bar be? Say it with me.", "Four."),
          tableItem(r, "read"), tableItem(r, "more"), tableItem(r, "tally"), tableItem(r, "bar"),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(BOOKS, "Some questions take two steps. My turn. Books on Monday and Tuesday together? First I read both bars: Monday four, Tuesday six. Then I add: four plus six is ten books."),
        lead(BOOKS, "How many books in all? Four plus six is ten, and ten plus three is how many? Say it with me.", "Thirteen."),
        barTwoStep(r, "both"), barTwoStep(r, "all"), barTwoStep(r, "moreThan"),
      ],
    };
  },
  reviewEx(intro, ctx) {
    return { title: "Data", steps: pickSteps(ctx.rand, intro, dataItem) };
  },
  testItems(units, ctx, count) {
    return pickTests(ctx.rand, units, dataItem, count);
  },
};
