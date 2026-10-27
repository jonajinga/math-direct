// Second Grade: 150 lessons of 18 to 24 minutes for a child of about seven.
// Numbers to 1,000; adding and subtracting within 100 and then 1,000 in
// columns; facts to 20 with a timed goal; story problems in print; even and
// odd and arrays; length, time, money, and data; shapes and equal shares;
// and a puzzle in every lesson. The tracks live in ./second/.

import { V, model, lead, test, fixChain, word, Word, Chain, favorNew } from "./common.js";
import { readableMax } from "./second/common2.js";
import { numbers, mental, facts as factsTrack } from "./second/numbers.js";
import { add100, sub100, add1000, sub1000, stories } from "./second/operations.js";
import { evenOdd, length, time, money, data } from "./second/measure.js";
import { shapes } from "./second/geometry.js";
import { puzzles } from "./second/puzzles.js";

// ── The warm-up: skip counting, in every lesson ──
const SKIP = [
  { id: "by5", lesson: 1, label: "Count by fives to 100", from: 5, to: 100, by: 5 },
  { id: "by10from", lesson: 5, label: "Count by tens from any number", by: 10, anyStart: true },
  { id: "by2", lesson: 10, label: "Count by twos to 50", from: 2, to: 50, by: 2 },
  { id: "by100", lesson: 20, label: "Count by hundreds to 1,000", from: 100, to: 1000, by: 100 },
  { id: "back10", lesson: 30, label: "Count back by tens", by: -10, anyStart: true },
  { id: "by5from", lesson: 45, label: "Count by fives from any five", by: 5, anyStart: true },
  { id: "by100from", lesson: 60, label: "Count by hundreds from any number", by: 100, anyStart: true },
  { id: "by25", lesson: 80, label: "Count by twenty-fives to 100", from: 25, to: 100, by: 25 },
  { id: "by3", lesson: 110, label: "Count by threes to 30", from: 3, to: 30, by: 3 },
  { id: "by4", lesson: 125, label: "Count by fours to 40", from: 4, to: 40, by: 4 },
];
const BY_WORD = { 2: "twos", 3: "threes", 4: "fours", 5: "fives", 10: "tens", 25: "twenty-fives", 100: "hundreds" };
function chainFor(u, r, n) {
  if (!u.anyStart) return { from: u.from, to: u.to, by: u.by };
  const max = readableMax(n);
  if (u.by === 10) { const from = r.int(1, Math.min(9, 9)) + 10 * r.int(1, max >= 500 ? 20 : 5); return { from, to: from + 10 * r.int(5, 8), by: 10 }; }
  if (u.by === -10) { const from = 10 * r.int(8, Math.min(50, Math.floor(max / 10) - 1)) + r.int(0, 9); return { from, to: from - 10 * r.int(5, 7), by: -10 }; }
  if (u.by === 5) { const from = 5 * r.int(3, 12); return { from, to: from + 5 * r.int(6, 10), by: 5 }; }
  const from = r.int(1, 9) * 100 + r.int(1, 99) - (max < 1000 ? 100 : 0);
  const stop = Math.min(from + 100 * r.int(4, 7), 999);
  return { from: Math.max(from, 101), to: stop, by: 100 };
}
function skipSay(c) {
  const by = BY_WORD[Math.abs(c.by)] || `${word(Math.abs(c.by))}s`;
  if (c.by < 0) return `Start at ${word(c.from)}. Count back by ${by} to ${word(c.to)}. Get it going.`;
  if (c.from === c.by) return `Count by ${by} to ${word(c.to)}. Get ready.`;
  return `Start at ${word(c.from)}. Count by ${by} to ${word(c.to)}. Get it going.`;
}
function skipTest(c) {
  const ans = Chain(c.from, c.to, c.by);
  const ask = skipSay(c);
  return test(V.say(), ask, ans, fixChain(ans, ask.replace(/ Get (ready|it going)\.$/, "")), {
    do: "Signal: pause, then nod for the child to begin. Listen for a skipped or repeated number.",
    skill: "count-aloud",
    item: `skip:${c.from}:${c.to}:${c.by}`,
  });
}
const skip = {
  id: "skip",
  name: "Skip counting",
  warmup: true,
  summary: "A daily warm-up of counting by fives, tens, twos, hundreds, and later by threes, fours, and twenty-fives, from any starting number, forward and back.",
  standard: "2.NBT.2",
  units: SKIP.map(({ id, lesson, label }) => ({ id, lesson, label })),
  unitOf(u) { return SKIP.find((s) => s.id === u.id); },
  newEx(u, ctx, intro) {
    const r = ctx.rand, s = this.unitOf(u), c = chainFor(s, r, ctx.lesson);
    const by = BY_WORD[Math.abs(c.by)] || `${word(Math.abs(c.by))}s`;
    const steps = [
      model(V.say(), `My turn to count ${c.by < 0 ? "back " : ""}by ${by}${s.anyStart ? `, starting at ${word(c.from)}` : ""}. ${Chain(c.from, c.to, c.by)}`),
      lead(V.say(), `Count with me. ${skipSay(c)}`, Chain(c.from, c.to, c.by)),
      skipTest(c),
    ];
    const earlier = intro.filter((x) => x.id !== u.id);
    if (earlier.length) steps.push(skipTest(chainFor(this.unitOf(r.pick(earlier)), r, ctx.lesson)));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const picks = favorNew(r, intro, 3);
    const seen = new Set();
    const steps = [];
    for (const u of picks) {
      const c = chainFor(this.unitOf(u), r, ctx.lesson);
      const k = `${c.from}:${c.to}:${c.by}`;
      if (seen.has(k)) continue;
      seen.add(k);
      steps.push(skipTest(c));
    }
    return { title: "Skip counting", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return [skipTest(chainFor(this.unitOf(units[units.length - 1]), r, ctx.lesson))];
  },
};

// ── The facts to 20, for Quick facts, Timed facts, and the fact chart ──
// Facts within ten are fair game from the first lesson; the teen facts come
// in sets of twelve, two lessons apart, through lesson 24.
const secondFacts = [];
{
  const within10 = [], teens = [];
  for (let a = 0; a <= 10; a++) for (let b = 0; b <= 10; b++) {
    if (a + b <= 10) within10.push({ key: `${a}+${b}`, a, op: "+", b, ans: a + b });
    else if (a + b <= 20) teens.push({ key: `${a}+${b}`, a, op: "+", b, ans: a + b });
  }
  for (let c = 0; c <= 20; c++) for (let a = 0; a <= 10; a++) {
    const d = c - a;
    if (d < 0 || d > 10) continue;
    (c <= 10 ? within10 : teens).push({ key: `${c}-${a}`, a: c, op: "−", b: a, ans: d });
  }
  within10.forEach((f) => secondFacts.push({ ...f, lesson: 1, set: 1 }));
  teens.forEach((f, i) => secondFacts.push({ ...f, lesson: 2 + Math.floor(i / 12) * 2, set: 2 + Math.floor(i / 12) }));
}

const tracks = [skip, numbers, mental, factsTrack, add100, sub100, add1000, sub1000, stories, evenOdd, length, time, money, data, shapes, puzzles].filter(Boolean);

export default {
  id: "second",
  slug: "second",
  subject: "math",
  name: "Second Grade",
  longName: "Second Grade",
  age: "about seven",
  lessons: 150,
  minutes: "18 to 24",
  minutesBand: [18, 24],
  capMinutes: true,
  minExercises: 9,
  maxExercises: 10,
  minReviewSteps: 5,
  maxSteps: 130,
  maxGap: 12,
  testEvery: 10,
  reviewSchedule: [[6, 2], [20, 3], [50, 5], [Infinity, 7]],
  placementPoints: [1, 50, 100],
  tagline: "Numbers to 1,000, adding and subtracting in columns, facts to 20 against the clock, story problems in print, length, time, money, graphs, shapes, and a puzzle every day.",
  description: "Second Grade covers the Common Core second-grade standards: reading, comparing, and counting numbers to 1,000 by hundreds, tens, and ones; the addition and subtraction facts to 20 from memory; adding and subtracting within 100 and then within 1,000 in columns, with carrying and trading; story problems in one and two steps, read from the screen; even and odd numbers and arrays; measuring length in inches and centimeters; time to five minutes; dollars and cents; picture graphs, bar graphs, and line plots; and shapes, with halves, thirds, and fourths. Every lesson ends with a puzzle that asks the child to think, with hints on the panel.",
  endsWith: "By the end of Second Grade, the child reads and compares numbers to 1,000, knows the facts to 20 without counting, adds and subtracts three-digit numbers in columns, solves two-step story problems, measures and tells time, reads graphs, and works a puzzle a day.",
  materials: ["A whiteboard and marker, or paper and pencil, for column work and puzzles", "A ruler marked in inches and centimeters", "A few coins and a dollar bill (optional)"],
  facts: secondFacts,
  // The one-minute check's goal: base, plus step for every per facts taught, up to max.
  timed: { base: 12, per: 12, step: 2, max: 30 },
  readable(n) { return { max: readableMax(n) }; },
  tracks,
};
