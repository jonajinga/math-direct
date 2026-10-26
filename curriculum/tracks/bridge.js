// Bridge to Second Grade: 20 lessons on adding and subtracting two-digit
// numbers in columns, with and without regrouping. Optional.

import { V, model, lead, test, note, fix, fixPoint, word, Word, favorNew } from "./common.js";
import { factStep } from "./k.js";
import { addFacts, subFacts } from "./first.js";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function digits(n) {
  return { t: Math.floor(n / 10), o: n % 10 };
}

// A column problem generator.
function gen(r, kind) {
  let a, b;
  for (let tries = 0; tries < 200; tries++) {
    a = r.int(12, 89); b = r.int(11, 89);
    const A = digits(a), B = digits(b);
    if (kind === "add" && A.o + B.o <= 9 && a + b <= 99) break;
    if (kind === "addR" && A.o + B.o >= 10 && a + b <= 99) break;
    if (kind === "sub" && a > b && A.o >= B.o) break;
    if (kind === "subR" && a > b && A.o < B.o && A.t > B.t) break;
  }
  const op = kind.startsWith("add") ? "+" : "−";
  return { a, b, op, ans: op === "+" ? a + b : a - b, regroup: kind.endsWith("R") };
}

// "one ten", "three tens", "no ones"
const tens = (k) => (k === 0 ? "no tens" : k === 1 ? "one ten" : `${word(k)} tens`);
const ones = (k) => (k === 0 ? "no ones" : k === 1 ? "one one" : `${word(k)} ones`);

function script(p) {
  const A = digits(p.a), B = digits(p.b), Ans = digits(p.ans);
  if (p.op === "+") {
    const sum = A.o + B.o;
    if (!p.regroup) return `Ones first: ${word(A.o)} plus ${word(B.o)} is ${word(sum)}. ${Word(sum)} goes under the ones. Tens: ${word(A.t)} plus ${word(B.t)} is ${word(A.t + B.t)}. ${Word(A.t + B.t)} goes under the tens. The answer is ${word(p.ans)}.`;
    const left = sum - 10;
    const split = left ? `That is one ten and ${word(left)} more.` : "That is exactly one ten.";
    return `Ones first: ${word(A.o)} plus ${word(B.o)} is ${word(sum)}. ${split} ${Word(left)} goes under the ones, and the new ten goes to the top of the tens column. Tens: one plus ${word(A.t)} plus ${word(B.t)} is ${word(A.t + B.t + 1)}. The answer is ${word(p.ans)}.`;
  }
  if (!p.regroup) return `Ones first: ${word(A.o)} minus ${word(B.o)} is ${word(A.o - B.o)}. ${Word(A.o - B.o)} goes under the ones. Tens: ${word(A.t)} minus ${word(B.t)} is ${word(A.t - B.t)}. ${Word(A.t - B.t)} goes under the tens. The answer is ${word(p.ans)}.`;
  return `Ones first: ${word(A.o)} minus ${word(B.o)}. We cannot take ${word(B.o)} from ${word(A.o)}, so we trade one ten for ten ones. Now we have ${tens(A.t - 1)} and ${ones(A.o + 10)}. ${Word(A.o + 10)} minus ${word(B.o)} is ${word(A.o + 10 - B.o)}. Tens: ${word(A.t - 1)} minus ${word(B.t)} is ${word(Ans.t)}. The answer is ${word(p.ans)}.`;
}

function colItem(r, kind) {
  const p = gen(r, kind);
  const problem = `${Word(p.a)} ${p.op === "+" ? "plus" : "minus"} ${word(p.b)}.`;
  const say = `${problem} Work it in columns, ones first. What is the answer?`;
  return test(V.col(p.a, p.op, p.b, { ans: p.ans, labels: true }), say, Word(p.ans) + ".", fix(Word(p.ans) + ".", `${problem} What is the answer?`, script(p)), {
    skill: p.op === "+" ? "add" : "subtract",
    item: `col:${p.a}${p.op}${p.b}`,
  });
}

const columns = {
  id: "columns",
  name: "Numbers in columns",
  summary: "Set two-digit problems in columns, tens under tens and ones under ones, and always start with the ones.",
  standard: "2.NBT.5 (preparation)",
  units: [{ id: "cols", lesson: 1, label: "Tens under tens, ones under ones" }],
  item(r) {
    const n = r.int(12, 89);
    const { t, o } = digits(n);
    const ask = `In the top number, ${word(n)}, which digit is in the tens column?`;
    return test(V.col(n, "+", r.int(11, 89), { labels: true }), ask, Word(t) + ".", fix(Word(t) + ".", ask, `${Word(n)} is ${tens(t)} and ${ones(o)}. The tens digit is on the left.`), { skill: "place-value", item: `colpv:${n}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    return {
      title: u.label,
      steps: [
        model(V.col(34, "+", 25, { labels: true }), "When we work with bigger numbers, we line them up in columns. Tens go under tens. Ones go under ones. My turn. Thirty-four: three in the tens column, four in the ones column. Twenty-five: two under the three, five under the four."),
        model(V.col(34, "+", 25, { labels: true }), "Here is the rule. We always start with the ones column, on the right."),
        lead(V.col(47, "+", 31, { labels: true }), "Which column do we start with? Say it with me.", "The ones column."),
        this.item(r), this.item(r),
        test(V.say(), "Which column do we start with?", "The ones column.", fix("The ones column.", "Which column do we start with?", "We always start with the ones column, on the right."), { skill: "place-value", item: "start-ones" }),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: "Columns", steps: [this.item(r), test(V.say(), "Which column do we start with?", "The ones column.", fix("The ones column.", "Which column do we start with?", "We always start with the ones column, on the right."), { skill: "place-value", item: "start-ones" })] };
  },
  testItems(units, ctx) { return [this.item(ctx.rand)]; },
};

const addCols = {
  id: "add-columns",
  name: "Adding in columns",
  summary: "Add two-digit numbers in columns, first without and then with a new ten carried to the tens column.",
  standard: "2.NBT.5",
  units: [
    { id: "add", lesson: 2, label: "Adding without carrying" },
    { id: "addR", lesson: 5, label: "Carrying a new ten" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "add") {
      const p = gen(r, "add");
      return {
        title: u.label, steps: [
          model(V.col(p.a, "+", p.b, { ans: p.ans, show: true, labels: true }), `My turn. ${Word(p.a)} plus ${word(p.b)}. ${script(p)}`),
          lead(V.col(42, "+", 35, { labels: true }), "Work it with me. Ones: two plus five. Tens: four plus three. What is the answer?", "Seventy-seven."),
          colItem(r, "add"), colItem(r, "add"), colItem(r, "add"),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model([V.col(38, "+", 25, { ans: 63, show: true, labels: true, carry: 1 }), V.row(V.pv(3, 8), V.sign("+"), V.pv(2, 5))], `My turn. Thirty-eight plus twenty-five. ${script({ a: 38, b: 25, op: "+", ans: 63, regroup: true })}`, { do: "Point to the eight ones and five ones; show that ten of them make a new ten." }),
        model(V.col(47, "+", 36, { ans: 83, show: true, labels: true, carry: 1 }), `Again. Forty-seven plus thirty-six. ${script({ a: 47, b: 36, op: "+", ans: 83, regroup: true })}`),
        lead(V.col(29, "+", 14, { labels: true }), "Work it with me. Ones: nine plus four is thirteen. Three goes under the ones, and the new ten goes to the top of the tens column. Tens: one plus two plus one. What is the answer?", "Forty-three."),
        colItem(r, "addR"), colItem(r, "addR"), colItem(r, "add"), colItem(r, "addR"),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const hasR = intro.some((u) => u.id === "addR");
    return { title: "Adding in columns", steps: [colItem(r, hasR ? "addR" : "add"), colItem(r, "add"), colItem(r, hasR ? "addR" : "add")] };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const hasR = units.some((u) => u.id === "addR");
    return [colItem(r, hasR ? "addR" : "add"), colItem(r, "add")];
  },
};

const subCols = {
  id: "sub-columns",
  name: "Subtracting in columns",
  summary: "Subtract two-digit numbers in columns, first without and then with trading a ten for ten ones.",
  standard: "2.NBT.5",
  units: [
    { id: "sub", lesson: 9, label: "Subtracting without trading" },
    { id: "subR", lesson: 12, label: "Trading a ten for ten ones" },
    { id: "mixed", lesson: 16, label: "Adding or subtracting: read the sign" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "sub") {
      const p = gen(r, "sub");
      return {
        title: u.label, steps: [
          model(V.col(p.a, "−", p.b, { ans: p.ans, show: true, labels: true }), `My turn. ${Word(p.a)} minus ${word(p.b)}. ${script(p)}`),
          lead(V.col(68, "−", 25, { labels: true }), "Work it with me. Ones: eight minus five. Tens: six minus two. What is the answer?", "Forty-three."),
          colItem(r, "sub"), colItem(r, "sub"), colItem(r, "sub"),
        ],
      };
    }
    if (u.id === "subR") {
      return {
        title: u.label, steps: [
          model([V.col(42, "−", 17, { ans: 25, show: true, labels: true, cross: { tens: 3, ones: 12 } }), V.pv(4, 2)], `My turn. Forty-two minus seventeen. ${script({ a: 42, b: 17, op: "−", ans: 25, regroup: true })}`, { do: "Point to one ten stick and show that it becomes ten ones." }),
          lead(V.col(53, "−", 28, { labels: true }), "Work it with me. Ones: three minus eight. Can we? No. Trade a ten: four tens and thirteen ones. Thirteen minus eight is five. Tens: four minus two. What is the answer?", "Twenty-five."),
          test(V.col(61, "−", 34, { labels: true }), "Look at the ones: one minus four. Do we need to trade a ten?", "Yes.", fix("Yes.", "Look at the ones: one minus four. Do we need to trade a ten?", "One is less than four, so we cannot take four from one."), { skill: "subtract", item: "trade?:61-34" }),
          colItem(r, "subR"), colItem(r, "subR"), colItem(r, "sub"), colItem(r, "subR"),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.col(56, "+", 27, { labels: true }), "Before we start, we read the sign. Plus means add. Minus means subtract. Then we look at the ones: will we need to carry or trade? My turn. The sign is plus, so we add. Six plus seven is thirteen, so I will carry a new ten."),
        lead(V.col(56, "−", 27, { labels: true }), "Read the sign with me. Plus or minus? Do we need to trade?", "Minus. Yes. We cannot take seven from six, so we trade a ten."),
        colItem(r, "addR"), colItem(r, "subR"), colItem(r, r.pick(["add", "sub"])), colItem(r, r.pick(["addR", "subR"])),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const hasR = intro.some((u) => u.id === "subR");
    return { title: "Subtracting in columns", steps: [colItem(r, hasR ? "subR" : "sub"), colItem(r, "sub"), colItem(r, hasR ? "subR" : "sub")] };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const hasR = units.some((u) => u.id === "subR");
    return [colItem(r, hasR ? "subR" : "sub"), colItem(r, "sub")];
  },
};

// Each name with the word the story uses for that child after the first mention.
const NAMES = [["Ana", "she"], ["Ben", "he"], ["Cora", "she"], ["Dev", "he"], ["Eli", "he"], ["Faye", "she"], ["Gus", "he"], ["Hana", "she"]];
const stories2 = {
  id: "stories",
  name: "Two-digit story problems",
  summary: "Solve story problems with two-digit numbers, using number families to decide whether to add or subtract.",
  standard: "2.OA.1",
  units: [{ id: "s2", lesson: 14, label: "Story problems with bigger numbers" }],
  item(r) {
    const [name, pro] = r.pick(NAMES);
    const add = r() < 0.5;
    const p = gen(r, add ? r.pick(["add", "addR"]) : r.pick(["sub", "subR"]));
    const ask = add ? `How many apples did ${pro} pick in all?` : `How many stickers does ${pro} have left?`;
    const text = add
      ? `${name} picked ${word(p.a)} apples in the morning and ${word(p.b)} in the afternoon. ${ask}`
      : `${name} had ${word(p.a)} stickers and gave away ${word(p.b)}. ${ask}`;
    return test(V.say(), text, Word(p.ans) + ".", fix(Word(p.ans) + ".", ask, `${add ? "In all is the big number. It is missing, so we add." : `${Word(p.a)} is the big number. A small number is missing, so we subtract.`} ${script(p)}`), { skill: "story", item: `story2:${p.a}${p.op}${p.b}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    return {
      title: u.label, steps: [
        model(V.family(36, 25, "?", "c"), "Story problems with big numbers work the same way. Listen. Cora has thirty-six red beads and twenty-five blue beads. How many beads does she have in all? My turn. In all is the big number. It is missing, so we add. Thirty-six plus twenty-five. Six plus five is eleven: one goes under the ones, and the new ten goes to the top of the tens column. One plus three plus two is six. Sixty-one."),
        lead(V.family(52, "?", 70, "b"), "Ben had seventy marbles. He gave some away. Now he has fifty-two. How many did he give away? Seventy is the big number. A small number is missing. Do we add or subtract? Say it with me.", "Subtract. Seventy minus fifty-two."),
        this.item(r), this.item(r),
      ],
    };
  },
  reviewEx(intro, ctx) { const r = ctx.rand; return { title: "Story problems", steps: [this.item(r), this.item(r)] }; },
  testItems(units, ctx) { return [this.item(ctx.rand)]; },
};

const factsReview = {
  id: "facts",
  name: "Quick facts",
  warmup: true,
  summary: "A daily warm-up of addition and subtraction facts to 20.",
  standard: "2.OA.2",
  units: [{ id: "f20", lesson: 1, label: "Facts to 20" }],
  newEx(u, ctx) { return this.reviewEx([u], ctx); },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const add = addFacts.pool(addFacts.units);
    const sub = subFacts.pool(subFacts.units);
    const steps = [];
    for (let i = 0; i < 5; i++) {
      if (i % 2) { const [a, b] = r.pick(sub); steps.push(factStep(a, "−", b, { say: `${Word(a)} minus ${word(b)}?` })); }
      else { const [a, b] = r.pick(add); steps.push(factStep(a, "+", b, { say: `${Word(a)} plus ${word(b)}?` })); }
    }
    if (intro.length === 1 && ctx.lesson === 1) {
      steps.unshift(lead(V.eq(8, "+", 7, "=", "?"), "We start each lesson with quick facts. Eight plus seven? Say it with me.", "Fifteen."));
      steps.unshift(model(V.eq(9, "+", 6, "=", "?"), "My turn. Nine plus six is fifteen. I know it without counting."));
    }
    return { title: "Quick facts", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return r.sample(addFacts.pool(addFacts.units), 3).map(([a, b]) => factStep(a, "+", b));
  },
};

export default {
  id: "bridge",
  slug: "bridge",
  subject: "math",
  name: "Bridge to Second Grade",
  longName: "Bridge to Second Grade",
  age: "after First Grade",
  lessons: 20,
  minutes: "5 to 8",
  minutesBand: [5, 8],
  optional: true,
  minExercises: 6,
  maxExercises: 8,
  minReviewSteps: 5,
  maxSteps: 80,
  maxGap: 6,
  testEvery: 10,
  reviewIntervals: [2, 2, 3],
  placementPoints: [1],
  tagline: "Adding and subtracting two-digit numbers in columns, with carrying and trading.",
  description: "An optional unit for a child who finishes First Grade early: adding and subtracting two-digit numbers in columns, carrying and trading tens, and story problems with bigger numbers. This is second-grade work.",
  endsWith: "By the end of the Bridge, the child adds and subtracts two-digit numbers in columns, carrying and trading tens correctly, and solves two-digit story problems.",
  materials: ["Ten straws or craft sticks, for showing a trade (optional)"],
  readable() {
    const s = new Set();
    for (let i = 0; i <= 200; i++) s.add(i);
    return s;
  },
  tracks: [factsReview, columns, addCols, subCols, stories2],
};
