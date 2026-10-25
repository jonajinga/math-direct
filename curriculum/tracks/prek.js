// Pre-K: 100 lessons, 8 to 12 minutes each, for children of about four.

import {
  V, model, lead, test, note, fix, fixPoint, fixChain, word, Word, chain, Chain, plural, capFirst,
  countTest, countAnswer, touchCount, readNum, touchNum, flashTest, touchChoice, iconSeq,
  favorNew, others,
} from "./common.js";
import { tok } from "../lib/v.js";
import readiness, { readinessItems } from "./readiness.js";

// ─────────────────────────────────────────────────────────────
// Counting aloud
// ─────────────────────────────────────────────────────────────

const countAloud = {
  id: "count-aloud",
  name: "Counting aloud",
  warmup: true,
  summary: "Count aloud from one to 3, 5, 7, 10, 13, 15, and finally 20, and stop at a given number.",
  standard: "ELOF: counting and cardinality",
  units: [
    { id: "to3", lesson: 1, to: 3, label: "Count to 3" },
    { id: "to5", lesson: 4, to: 5, label: "Count to 5" },
    { id: "to7", lesson: 15, to: 7, label: "Count to 7" },
    { id: "to10", lesson: 26, to: 10, label: "Count to 10" },
    { id: "to13", lesson: 46, to: 13, label: "Count to 13" },
    { id: "to15", lesson: 56, to: 15, label: "Count to 15" },
    { id: "to20", lesson: 72, to: 20, label: "Count to 20" },
  ],
  newEx(u, ctx, intro) {
    const to = u.to;
    const prev = intro.length > 1 ? intro[intro.length - 2].to : 0;
    const steps = [];
    if (prev === 0) {
      steps.push(model(V.say(), `We are going to count out loud. Listen to me first. My turn to count to ${word(to)}. ${Chain(1, to)}`, {
        do: "Count at a steady pace, about one number each second. Hold up one finger for each number.",
      }));
    } else {
      steps.push(model(V.say(), `You know how to count to ${word(prev)}. Today we will count to ${word(to)}. Listen. My turn. ${Chain(1, to)}`, {
        do: `Say the new numbers, ${chain(prev + 1, to)}, a little more slowly and clearly.`,
      }));
      if (to - prev >= 3) {
        steps.push(model(V.say(), `Listen to the new part. ${Chain(prev, to)}`, { do: "Say only the new part of the count." }));
        steps.push(lead(V.say(), `Say the new part with me. Get ready.`, Chain(prev, to)));
      }
    }
    steps.push(lead(V.say(), "Count with me. Get ready.", Chain(1, to), {
      do: "Count together. Keep your voice strong so the child can follow.",
    }));
    steps.push(lead(V.say(), "Again. Count with me. Get ready.", Chain(1, to)));
    steps.push(countTest(1, to, 1, { prefix: "Your turn." }));
    steps.push(countTest(1, to, 1, { prefix: "Again." }));
    return { title: u.label, steps };
  },
  firmEx(intro, ctx, u) {
    const to = u.to;
    return {
      title: u.label,
      steps: [
        lead(V.say(), `Count to ${word(to)} with me. Get ready.`, Chain(1, to)),
        countTest(1, to, 1, { prefix: "Your turn." }),
        countTest(1, to, 1, { prefix: "Again." }),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const to = intro[intro.length - 1].to;
    const steps = [countTest(1, to, 1)];
    if (to >= 5) {
      const stop = ctx.rand.int(3, to - 1);
      steps.push(countTest(1, stop, 1, {
        do: `Listen for a clean stop at ${word(stop)}. Stopping on the right number matters as much as saying the numbers in order.`,
      }));
    }
    return { title: `Count to ${word(to)}`, steps };
  },
  testItems(units, ctx) {
    const to = units[units.length - 1].to;
    const out = [countTest(1, to)];
    if (to > 4) out.push(countTest(1, ctx.rand.int(3, to - 1)));
    return out;
  },
};

// ─────────────────────────────────────────────────────────────
// Counting objects
// ─────────────────────────────────────────────────────────────

const countObjects = {
  id: "count-objects",
  name: "Counting objects",
  summary: "Touch and count up to ten objects in a row, up to eight scattered, and up to six in a circle. The last number counted tells how many.",
  standard: "ELOF: counting and cardinality",
  units: [
    { id: "r3", lesson: 1, max: 3, arr: "row", label: "Count up to 3 objects" },
    { id: "r5", lesson: 6, max: 5, arr: "row", label: "Count up to 5 objects" },
    { id: "r7", lesson: 22, max: 7, arr: "row", label: "Count up to 7 objects" },
    { id: "r10", lesson: 34, max: 10, arr: "row", label: "Count up to 10 objects" },
    { id: "s5", lesson: 43, max: 5, arr: "scatter", label: "Count scattered objects to 5" },
    { id: "c6", lesson: 62, max: 6, arr: "circle", label: "Count objects in a circle" },
    { id: "s8", lesson: 78, max: 8, arr: "scatter", label: "Count scattered objects to 8" },
  ],
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const icons = iconSeq(r, 4);
    const steps = [];
    if (u.id === "r3") {
      const s = V.obj(icons[0], 3, { tap: true });
      steps.push(model(s, `My turn to count the ${plural(icons[0])}. I touch each one once and say one number for each. ${Chain(1, 3)}`, {
        do: "Touch each picture on the screen as you say each number.",
      }));
      steps.push(model(s, `The last number I said was three. So there are three ${plural(icons[0])}. How many ${plural(icons[0])}? Three.`, {
        do: "Stress the last number.",
      }));
      steps.push(lead(s, "Touch and count with me. Get ready.", Chain(1, 3), { do: "Guide the child's finger to each picture as you count together." }));
      steps.push(lead(s, `How many ${plural(icons[0])}? Say it with me.`, "Three."));
      steps.push(...touchCount(icons[1], 2, "row"));
      steps.push(...touchCount(icons[2], 3, "row"));
      return { title: u.label, steps };
    }
    const prevMax = intro.length > 1 ? intro[intro.length - 2].max : 3;
    const s = V.obj(icons[0], u.max, { arr: u.arr, tap: true, seed: ctx.lesson, start: u.arr === "circle" });
    if (u.arr === "scatter") {
      steps.push(model(s, `These ${plural(icons[0])} are all mixed up. My turn. When I touch one, it gets a mark, so I do not count it twice. ${Chain(1, u.max)} There are ${word(u.max)} ${plural(icons[0])}.`, {
        do: "Touch each picture once. A ring appears on each one you touch.",
      }));
    } else if (u.arr === "circle") {
      steps.push(model(s, `These ${plural(icons[0])} are in a circle. My turn. I start at the one with the dot under it, and I go around. I stop when I get back to the start. ${Chain(1, u.max)} There are ${word(u.max)} ${plural(icons[0])}.`, {
        do: "Start at the marked picture and go around once.",
      }));
    } else {
      steps.push(model(s, `My turn. I touch each one once. ${Chain(1, u.max)} The last number I said was ${word(u.max)}. There are ${word(u.max)} ${plural(icons[0])}.`, {
        do: "Touch each picture as you say each number.",
      }));
    }
    const k = r.int(Math.max(2, prevMax), u.max);
    const s2 = V.obj(icons[1], k, { arr: u.arr, tap: true, seed: ctx.lesson + 1, start: u.arr === "circle" });
    steps.push(lead(s2, "Touch and count with me. Get ready.", Chain(1, k)));
    steps.push(lead(s2, `How many ${plural(icons[1])}? Say it with me.`, Word(k) + "."));
    steps.push(...touchCount(icons[2], u.max, u.arr, { seed: ctx.lesson + 2 }));
    steps.push(...touchCount(icons[3], r.int(Math.max(2, prevMax - 1), u.max), u.arr, { seed: ctx.lesson + 3 }));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const units = favorNew(r, intro, 2);
    const icons = iconSeq(r, 2);
    const steps = [];
    units.forEach((u, i) => {
      steps.push(...touchCount(icons[i], r.int(2, u.max), u.arr, { seed: ctx.lesson * 7 + i }));
    });
    return { title: "Count the objects", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const icons = iconSeq(r, 2);
    const u = units[units.length - 1];
    return [
      ...touchCount(icons[0], u.max, u.arr, { seed: 11 }),
      ...touchCount(icons[1], r.int(2, u.max - 1), u.arr, { seed: 12 }),
    ];
  },
};

// ─────────────────────────────────────────────────────────────
// Counting out a set
// ─────────────────────────────────────────────────────────────

const countOut = {
  id: "count-out",
  name: "Counting out",
  summary: "Touch or take a given number of objects from a larger group, and stop at that number.",
  standard: "ELOF: counting and cardinality",
  units: [
    { id: "to3", lesson: 24, max: 3, label: "Count out up to 3" },
    { id: "to5", lesson: 41, max: 5, label: "Count out up to 5" },
    { id: "to8", lesson: 59, max: 8, label: "Count out up to 8" },
    { id: "to10", lesson: 76, max: 10, label: "Count out up to 10" },
  ],
  item(icon, k, total, seed) {
    const s = V.obj(icon, total, { arr: "row", tap: true, seed });
    return test(s, `Touch ${word(k)} ${plural(icon, k)}. Stop at ${word(k)}.`, `(Touches ${word(k)}, saying ${chain(1, k)}, and stops.)`,
      fixPoint(`I count as I touch, and I stop at ${word(k)}. ${Chain(1, k)} Stop.`, `Touch ${word(k)} ${plural(icon, k)}. Stop at ${word(k)}.`), {
        do: `If marks are left from before, clear them first with the eraser. The child should stop at ${word(k)}.`,
        skill: "count",
        item: `count-out:${k}`,
        confirm: `Yes, ${word(k)}. You stopped at ${word(k)}.`,
      });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const icons = iconSeq(r, 4);
    const total = Math.min(10, u.max + 3);
    const k1 = u.max;
    const k2 = r.int(2, u.max);
    const steps = [
      model(V.obj(icons[0], total, { tap: true }), `There are lots of ${plural(icons[0])}. I only want ${word(k1)}. My turn. I count as I touch, and I stop at ${word(k1)}. ${Chain(1, k1)} Stop. I have ${word(k1)}.`, {
        do: `Touch ${word(k1)} pictures, counting aloud, then stop and hold up your hand.`,
      }),
      lead(V.obj(icons[1], total, { tap: true }), `Do it with me. Touch ${word(k2)} ${plural(icons[1], k2)}. Stop at ${word(k2)}. Get ready.`, Chain(1, k2) + " Stop.", {
        do: "Count together and stop together.",
      }),
      this.item(icons[2], k1, total, ctx.lesson),
      this.item(icons[3], r.int(2, u.max), total, ctx.lesson + 1),
      note(V.say(), `Now with real things. Put ${word(total)} small objects on the table, such as blocks or buttons. Say: Give me ${word(k2)}.`, {
        do: `The child pushes ${word(k2)} objects to you, counting each one. If the child takes too many, say: My turn. (Count out ${word(k2)}.) Your turn.`,
        materials: true,
      }),
    ];
    return { title: u.label, steps, materials: `${total} small objects, such as blocks or buttons` };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const u = intro[intro.length - 1];
    const icons = iconSeq(r, 2);
    const total = Math.min(10, u.max + 3);
    return {
      title: "Count out",
      steps: [this.item(icons[0], r.int(2, u.max), total, ctx.lesson), this.item(icons[1], r.int(2, u.max), total, ctx.lesson + 5), this.item(icons[0], r.int(2, u.max), total, ctx.lesson + 9)],
    };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    const icons = iconSeq(r, 2);
    return [this.item(icons[0], u.max, Math.min(10, u.max + 3), 3), this.item(icons[1], r.int(2, u.max - 1), Math.min(10, u.max + 3), 4)];
  },
};

// ─────────────────────────────────────────────────────────────
// Small amounts at a glance
// ─────────────────────────────────────────────────────────────

const subitize = {
  id: "subitize",
  name: "Small amounts at a glance",
  summary: "Say how many dots, from one to five, after seeing them for a moment, without counting.",
  standard: "ELOF: counting and cardinality (subitizing)",
  units: [
    { id: "n2", lesson: 3, n: 2, arrs: ["dice", "line"], label: "See 1 and 2 at a glance" },
    { id: "n3", lesson: 8, n: 3, arrs: ["dice", "line"], label: "See 3 at a glance" },
    { id: "n4", lesson: 13, n: 4, arrs: ["dice", "line"], label: "See 4 at a glance" },
    { id: "n5", lesson: 18, n: 5, arrs: ["dice", "line"], label: "See 5 at a glance" },
    { id: "five", lesson: 30, n: 5, arrs: ["dice", "line", "five"], label: "Five-frame patterns to 5" },
    { id: "mixed", lesson: 48, n: 5, arrs: ["dice", "line", "five", "scatter"], label: "Scattered dots to 5" },
  ],
  ms: 2000,
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const ms = this.ms;
    const steps = [];
    const known = Math.max(...intro.map((x) => x.n));
    if (u.id === "n2") {
      steps.push(model(V.dots(1, { arr: "dice" }), "Look at the screen. I will show you some dots for a short time. My turn. One. I see one dot. I did not need to count.", { flash: ms, do: "The dots show for two seconds, then hide. Show again, the curved arrow, brings them back." }));
      steps.push(model(V.dots(2, { arr: "dice" }), "Look. My turn. Two. I see two dots without counting.", { flash: ms }));
      steps.push(lead(V.dots(2, { arr: "line" }), "Look. How many dots? Say it with me.", "Two.", { flash: ms }));
      steps.push(flashTest(1, "dice", ms));
      steps.push(flashTest(2, "dice", ms));
      steps.push(flashTest(2, "line", ms));
      steps.push(flashTest(1, "dice", ms));
      return { title: u.label, steps };
    }
    if (u.id === "five") {
      steps.push(model(V.frame(5, 5), "This is a five-frame. It has five boxes. When every box has a dot, there are five. My turn. Five.", { flash: 3000 }));
      steps.push(model(V.frame(5, 3), "Look. Three boxes have dots. Two are empty. My turn. Three.", { flash: ms }));
      steps.push(lead(V.frame(5, 4), "Look. How many dots? Say it with me.", "Four.", { flash: ms }));
      for (const n of r.seq([2, 3, 4, 5], 4)) steps.push(flashTest(n, "five", ms));
      return { title: u.label, steps };
    }
    const n = u.n;
    steps.push(model(V.dots(n, { arr: "dice" }), `Look. My turn. ${Word(n)}. I see ${word(n)} dots without counting.`, { flash: ms }));
    steps.push(model(V.dots(n, { arr: u.id === "mixed" ? "scatter" : "line", seed: ctx.lesson }), `These dots are in a different pattern, but there are still ${word(n)}. ${Word(n)}.`, { flash: ms }));
    steps.push(lead(V.dots(n, { arr: "dice" }), "Look. How many dots? Say it with me.", Word(n) + ".", { flash: ms }));
    const pool = [];
    for (let i = 1; i <= known; i++) pool.push(i);
    const seq = [n, ...r.seq(pool.filter((x) => x !== n), 2), n];
    seq.forEach((m, i) => steps.push(flashTest(m, r.pick(u.arrs), ms, ctx.lesson + i)));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const u = intro[intro.length - 1];
    const max = Math.max(...intro.map((x) => x.n));
    const pool = [];
    for (let i = 1; i <= max; i++) pool.push(i);
    const steps = r.seq(pool, 4).map((m, i) => flashTest(m, r.pick(u.arrs), this.ms, ctx.lesson + i));
    return { title: "How many dots?", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    const pool = [];
    for (let i = 1; i <= u.n; i++) pool.push(i);
    return r.seq(pool, 3).map((m, i) => flashTest(m, r.pick(u.arrs), this.ms, i));
  },
};

// ─────────────────────────────────────────────────────────────
// Reading numbers 0 to 10
// ─────────────────────────────────────────────────────────────

const NUM_ORDER = [
  [1, 11], [2, 14], [3, 19], [4, 25], [0, 29], [5, 33], [6, 38], [7, 44], [8, 50], [9, 58], [10, 66],
];

const numerals = {
  id: "numerals",
  name: "Reading numbers",
  summary: "Read the numbers 0 to 10 and touch a named number. Numbers that look alike (6 and 9, 2 and 5, 1 and 7) are taught far apart.",
  standard: "ELOF: number recognition",
  units: NUM_ORDER.map(([d, lesson]) => ({ id: "n" + d, lesson, d, label: `Read ${d}` })),
  pool(intro) {
    return intro.map((u) => u.d);
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const d = u.d;
    const known = this.pool(intro).filter((x) => x !== d);
    const steps = [];
    let first = `My turn. This is ${word(d)}. ${Word(d)}.`;
    if (d === 0) first = "My turn. This is zero. Zero means none at all. Zero.";
    if (d === 10) first = "My turn. This is ten. Ten is written with a one and a zero. Ten.";
    if (d === 1) first = "Now we will learn to read numbers. My turn. This is one. One.";
    steps.push(model(V.num(d), first, { do: "Touch the number as you say its name.", skill: "read" }));
    steps.push(lead(V.num(d), "What number is this? Say it with me.", Word(d) + ".", { skill: "read" }));
    steps.push(test(V.num(d), "Your turn. What number is this?", Word(d) + ".", fix(Word(d) + ".", "What number is this?"), { skill: "read", item: `read:${d}` }));
    if (known.length) {
      const k = Math.min(2, known.length);
      steps.push(touchNum(d, others(r, known, d, k), r));
      const o = r.pick(known);
      steps.push(readNum(o));
      steps.push(readNum(d));
      if (known.length >= 2) steps.push(touchNum(d, others(r, known, d, 2), r));
    } else {
      steps.push(readNum(d, { say: "Again. What number is this?" }));
    }
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const pool = this.pool(intro);
    const picks = favorNew(r, pool, 5);
    const steps = picks.map((d, i) => (i % 2 === 1 && pool.length >= 3 ? touchNum(d, others(r, pool, d, 2), r) : readNum(d)));
    return { title: "Read the numbers", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const pool = units.map((u) => u.d);
    const picks = r.sample(pool, Math.min(3, pool.length));
    return picks.map((d, i) => (i === 1 && pool.length >= 3 ? touchNum(d, others(r, pool, d, 2), r) : readNum(d)));
  },
};

// ─────────────────────────────────────────────────────────────
// Matching numbers and amounts
// ─────────────────────────────────────────────────────────────

const matchTrack = {
  id: "match",
  name: "Numbers and amounts",
  summary: "Match a number to a group of dots with that many, and a group to the number that tells how many.",
  standard: "ELOF: counting and cardinality",
  units: [
    { id: "m3", lesson: 35, max: 3, label: "Match numbers and groups to 3" },
    { id: "m5", lesson: 45, max: 5, label: "Match numbers and groups to 5" },
    { id: "m7", lesson: 60, max: 7, label: "Match numbers and groups to 7" },
    { id: "m10", lesson: 71, max: 10, label: "Match numbers and groups to 10" },
  ],
  numToGroup(k, max, r, seed) {
    const pool = [];
    for (let i = 1; i <= max; i++) pool.push(i);
    const opts = r.shuffle([k, ...others(r, pool, k, 2)]);
    return [
      readNum(k, { say: "What number is this?" }),
      test(V.row(V.num(k, { size: "md" }), V.choices(opts.map((x) => V.dots(x, { arr: "row", size: "sm" })), opts.indexOf(k))),
        `Touch the group with ${word(k)} ${plural("dot", k)}.`, `(Touches the group of ${word(k)}.)`,
        fixPoint(`I count each group. (Touch and count.) This group has ${word(k)}. (Touch it.)`, `Touch the group with ${word(k)} ${plural("dot", k)}.`),
        { skill: "match", item: `match:${k}`, confirm: `Yes, ${word(k)} ${plural("dot", k)}.` }),
    ];
  },
  groupToNum(k, max, r) {
    const pool = [];
    for (let i = 1; i <= max; i++) pool.push(i);
    const opts = r.shuffle([k, ...others(r, pool, k, 2)]);
    return [
      test(V.dots(k, { arr: "row" }), "Count the dots.", Chain(1, k), fixChain(Chain(1, k), "Count the dots."), { skill: "count", item: `count-dots:${k}` }),
      test(V.row(V.dots(k, { arr: "row", size: "sm" }), V.choices(opts.map((x) => V.num(x, { size: "sm" })), opts.indexOf(k))),
        "Touch the number that tells how many.", `(Touches ${k}.)`,
        fixPoint(`There are ${word(k)} dots. This number is ${word(k)}. (Touch ${k}.)`, "Touch the number that tells how many."),
        { skill: "match", item: `match-num:${k}`, confirm: `Yes, ${word(k)}.` }),
    ];
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const k1 = r.int(2, u.max);
    const pool = [];
    for (let i = 1; i <= u.max; i++) pool.push(i);
    const opts = r.shuffle([k1, ...others(r, pool, k1, 2)]);
    const s1 = V.row(V.num(k1, { size: "md" }), V.choices(opts.map((x) => V.dots(x, { arr: "row", size: "sm" })), opts.indexOf(k1)));
    const k2 = r.pick(pool.filter((x) => x !== k1));
    const opts2 = r.shuffle([k2, ...others(r, pool, k2, 2)]);
    const s2 = V.row(V.num(k2, { size: "md" }), V.choices(opts2.map((x) => V.dots(x, { arr: "row", size: "sm" })), opts2.indexOf(k2)));
    return {
      title: u.label,
      steps: [
        model(s1, `My turn. This number is ${word(k1)}. I look for the group with ${word(k1)} dots. I count each group. (Touch and count.) This group has ${word(k1)} dots. It goes with the number ${word(k1)}.`, {
          do: "Touch and count each group aloud, then touch the matching group.",
        }),
        lead(s2, `This number is ${word(k2)}. Find the group with ${word(k2)} ${plural("dot", k2)} with me. Get ready.`, `(Together, touches the group of ${word(k2)}.)`),
        ...this.numToGroup(r.int(1, u.max), u.max, r),
        model(V.row(V.dots(k2, { arr: "row", size: "sm" }), V.choices(opts2.map((x) => V.num(x, { size: "sm" })), opts2.indexOf(k2))),
          `Now the other way. My turn. I count the dots. ${Chain(1, k2)} There ${k2 === 1 ? "is one dot" : `are ${word(k2)} dots`}. This is the number ${word(k2)}. (Touch it.)`),
        ...this.groupToNum(r.int(2, u.max), u.max, r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const max = intro[intro.length - 1].max;
    return {
      title: "Match numbers and groups",
      steps: [...this.numToGroup(r.int(2, max), max, r), ...this.groupToNum(r.int(2, max), max, r)],
    };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const max = units[units.length - 1].max;
    return [...this.numToGroup(r.int(2, max), max, r).slice(1), ...this.groupToNum(r.int(2, max), max, r).slice(1)];
  },
};

// ─────────────────────────────────────────────────────────────
// More, fewer, same
// ─────────────────────────────────────────────────────────────

const compare = {
  id: "compare",
  name: "More, fewer, same",
  summary: "Compare two groups by matching them one to one: which has more, which has fewer, or whether they are the same.",
  standard: "ELOF: comparing quantities",
  units: [
    { id: "more", lesson: 12, max: 5, label: "Which has more" },
    { id: "same", lesson: 27, max: 5, label: "The same number" },
    { id: "fewer", lesson: 40, max: 6, label: "Which has fewer" },
    { id: "spread", lesson: 84, max: 8, label: "A longer row is not always more" },
  ],
  pair(r, max, same) {
    if (same) {
      const a = r.int(2, max);
      return [a, a];
    }
    let a = r.int(1, max), b = r.int(1, max);
    while (a === b) b = r.int(1, max);
    return [a, b];
  },
  moreTest(r, max, icon, opts = {}) {
    const [a, b] = this.pair(r, max);
    const ans = a > b ? 0 : 1;
    const which = opts.fewer ? (a < b ? 0 : 1) : ans;
    const word2 = opts.fewer ? "fewer" : "more";
    return test(V.match(a, b, { icon, tap: true, ans: which, lines: !opts.noLines, spread: opts.spread }),
      `Touch the row that has ${word2}.`, `(Touches the ${which === 0 ? "top" : "bottom"} row.)`,
      fixPoint(opts.fewer
        ? `I match each one with a partner. The ${ans === 0 ? "top" : "bottom"} row has extras, so it has more. The other row has fewer. (Touch the ${which === 0 ? "top" : "bottom"} row.)`
        : `I match each one with a partner. These have no partners. They are extra. This row has more. (Touch the ${ans === 0 ? "top" : "bottom"} row.)`,
        `Touch the row that has ${word2}.`),
      { skill: "compare", item: `${word2}:${a}:${b}`, confirm: `Yes, that row has ${word2}.` });
  },
  sameTest(r, max, icon, isSame) {
    const [a, b] = this.pair(r, max, isSame);
    const ans = a === b ? "Yes." : "No.";
    return test(V.match(a, b, { icon, lines: true }), "Do these rows have the same number?", ans,
      fix(ans, "Do these rows have the same number?", a === b ? "Every one has a partner. There are no extras." : "Some have no partners. They are extras."),
      { skill: "compare", item: `same:${a}:${b}` });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const icons = iconSeq(r, 5);
    if (u.id === "more") {
      return {
        title: u.label,
        steps: [
          model(V.match(5, 3, { icon: icons[0] }), `My turn. Look at these two rows of ${plural(icons[0])}. Each one on top gets a partner on the bottom. (Touch each pair.) These two on top have no partners. They are extra. The top row has more.`, {
            do: "Touch each matched pair, then the extras.",
          }),
          model(V.match(2, 4, { icon: icons[1] }), `This time the bottom row has extras. The bottom row has more.`),
          lead(V.match(4, 2, { icon: icons[2], tap: true, ans: 0 }), "Touch the row that has more with me. Get ready.", "(Touches the top row.)"),
          this.moreTest(r, 5, icons[3]),
          this.moreTest(r, 5, icons[4]),
          this.moreTest(r, 5, icons[0]),
        ],
      };
    }
    if (u.id === "same") {
      return {
        title: u.label,
        steps: [
          model(V.match(3, 3, { icon: icons[0] }), `My turn. Every ${icons[0]} on top has a partner on the bottom. There are no extras. The rows have the same number.`),
          model(V.match(4, 2, { icon: icons[1] }), "Here there are extras. These rows do not have the same number."),
          lead(V.match(5, 5, { icon: icons[2] }), "Do these rows have the same number? Say it with me.", "Yes."),
          this.sameTest(r, 5, icons[3], true),
          this.sameTest(r, 5, icons[4], false),
          this.sameTest(r, 5, icons[0], true),
          this.moreTest(r, 5, icons[1]),
        ],
      };
    }
    if (u.id === "fewer") {
      return {
        title: u.label,
        steps: [
          model(V.match(5, 2, { icon: icons[0] }), "My turn. The top row has extras. It has more. The bottom row has no extras. It has fewer. (Touch the bottom row.) This row has fewer.", {
            do: "Point to the extras in the top row, then touch the bottom row.",
          }),
          model(V.match(2, 6, { icon: icons[1] }), "Which row has fewer? The top row. It has no extras."),
          lead(V.match(4, 1, { icon: icons[2], tap: true, ans: 1 }), "Touch the row that has fewer with me. Get ready.", "(Touches the bottom row.)"),
          this.moreTest(r, 6, icons[3], { fewer: true }),
          this.moreTest(r, 6, icons[4], { fewer: true }),
          this.moreTest(r, 6, icons[0]),
          this.moreTest(r, 6, icons[1], { fewer: true }),
        ],
      };
    }
    return {
      title: u.label,
      steps: [
        model(V.match(4, 6, { icon: icons[0], lines: false, spread: 0 }), `Look. The top row is spread out, so it is longer. My turn. I match each one with a partner. (Touch each pair.) The bottom row has extras. The bottom row has more, even though the top row looks longer.`),
        model(V.match(4, 6, { icon: icons[0], lines: true, spread: 0 }), "Here are the partners. The bottom row has two extras. It has more."),
        lead(V.match(5, 3, { icon: icons[1], lines: false, spread: 1, tap: true, ans: 0 }), "Match them in your head with me. Then touch the row that has more.", "(Touches the top row.)"),
        this.moreTest(r, 8, icons[2], { noLines: true, spread: r.int(0, 1) }),
        this.moreTest(r, 8, icons[3], { noLines: true, spread: r.int(0, 1), fewer: true }),
        this.moreTest(r, 8, icons[4], { noLines: true, spread: r.int(0, 1) }),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const icons = iconSeq(r, 3);
    const max = intro[intro.length - 1].max;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [this.moreTest(r, max, icons[0], { noLines: has("spread") && r() < 0.5 })];
    if (has("same")) steps.push(this.sameTest(r, max, icons[1], r() < 0.5));
    if (has("fewer")) steps.push(this.moreTest(r, max, icons[2], { fewer: true }));
    else steps.push(this.moreTest(r, max, icons[2]));
    steps.push(this.moreTest(r, max, icons[0], { fewer: has("fewer") && r() < 0.5 }));
    return { title: "More, fewer, same", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const icons = iconSeq(r, 3);
    const max = units[units.length - 1].max;
    const has = (id) => units.some((u) => u.id === id);
    const out = [this.moreTest(r, max, icons[0])];
    if (has("same")) out.push(this.sameTest(r, max, icons[1], true));
    if (has("fewer")) out.push(this.moreTest(r, max, icons[2], { fewer: true }));
    if (has("spread")) out.push(this.moreTest(r, max, icons[1], { noLines: true, spread: 0 }));
    return out;
  },
};

// ─────────────────────────────────────────────────────────────
// Shapes
// ─────────────────────────────────────────────────────────────

const SHAPE_INFO = {
  circle: {
    rule: "A circle is round all the way around. It has no corners.",
    yes: [{ s: "circle", c: "red" }, { s: "circle", c: "blue", scale: 0.55, note: "It is small, and it is blue. It is still a circle." }, { s: "circle", c: "green", scale: 1.15 }],
    no: [{ s: "triangle", c: "red", why: "It has straight sides and corners." }, { s: "square", c: "yellow", why: "It has corners." }],
  },
  square: {
    rule: "A square has four sides that are all the same length, and four square corners.",
    yes: [{ s: "square", c: "blue" }, { s: "square", c: "orange", rot: 45, note: "This square is turned. It is still a square." }, { s: "square", c: "green", scale: 0.55 }],
    no: [{ s: "rectangle", c: "blue", why: "Two sides are long and two sides are short." }, { s: "circle", c: "orange", why: "It is round. It has no corners." }],
  },
  triangle: {
    rule: "A triangle has three sides and three corners.",
    yes: [{ s: "triangle", c: "green" }, { s: "triangle", c: "purple", rot: 180, note: "This triangle is upside down. It is still a triangle." }, { s: "triangle", c: "red", tall: true, note: "This triangle is tall and thin. It is still a triangle." }],
    no: [{ s: "triangle-open", c: "green", why: "It is not closed. A triangle is closed all the way around." }, { s: "square", c: "purple", why: "It has four sides." }],
  },
  rectangle: {
    rule: "A rectangle has four sides and four square corners. Two sides are long, and two sides are short.",
    yes: [{ s: "rectangle", c: "orange" }, { s: "rectangle", c: "blue", rot: 90, note: "This rectangle stands up tall. It is still a rectangle." }, { s: "rectangle", c: "green", thin: true }],
    no: [{ s: "triangle", c: "orange", why: "It has three sides." }, { s: "circle", c: "blue", why: "It is round. It has no corners." }],
  },
};

const SHAPE_COLORS = ["red", "blue", "yellow", "green", "purple", "orange"];

function shapeVis(o) {
  return V.shape(o.s, { c: o.c, rot: o.rot || 0, scale: o.scale || 1, tall: o.tall, thin: o.thin });
}

const shapes = {
  id: "shapes",
  name: "Shapes",
  summary: "Name circles, squares, triangles, and rectangles of any size, color, and turn, and tell shapes that are not examples.",
  standard: "ELOF: geometry and spatial sense",
  units: [
    { id: "circle", lesson: 5, s: "circle", label: "Circles" },
    { id: "square", lesson: 20, s: "square", label: "Squares" },
    { id: "triangle", lesson: 31, s: "triangle", label: "Triangles" },
    { id: "rectangle", lesson: 47, s: "rectangle", label: "Rectangles" },
  ],
  randomShape(r, s) {
    const o = { s, c: r.pick(SHAPE_COLORS), rot: r.pick([0, 0, 15, 45, 90, 180]), scale: r.pick([0.6, 0.8, 1, 1.1]) };
    if (s === "circle") o.rot = 0;
    if (s === "square") o.rot = r.pick([0, 0, 45, 20]);
    if (s === "rectangle") o.rot = r.pick([0, 0, 90]);
    return shapeVis(o);
  },
  nameTest(r, s) {
    return test(this.randomShape(r, s), "What shape is this?", `A ${s}.`, fix(`A ${s}.`, "What shape is this?", SHAPE_INFO[s] && SHAPE_INFO[s].rule), { skill: "shape", item: `name:${s}` });
  },
  touchTest(r, s, pool) {
    const opts = r.shuffle([s, ...r.sample(pool.filter((x) => x !== s), 2)]);
    return test(V.choices(opts.map((x) => this.randomShape(r, x)), opts.indexOf(s)), `Touch the ${s}.`, `(Touches the ${s}.)`,
      fixPoint(`This is the ${s}. ${SHAPE_INFO[s] ? SHAPE_INFO[s].rule : ""} (Touch it.)`, `Touch the ${s}.`), { skill: "shape", item: `touch:${s}`, confirm: `Yes, that is the ${s}.` });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const s = u.s;
    const info = SHAPE_INFO[s];
    const known = intro.map((x) => x.s);
    const steps = [];
    steps.push(model(shapeVis(info.yes[0]), `My turn. This is a ${s}. ${info.rule}`, { do: "Run your finger around the edge of the shape as you talk." }));
    for (const y of info.yes.slice(1)) {
      steps.push(model(shapeVis(y), y.note || `This is a ${s} too.`));
    }
    for (const n of info.no) {
      steps.push(model(shapeVis(n), `This is not a ${s}. ${n.why}`));
    }
    steps.push(lead(shapeVis({ s, c: "purple", scale: 0.9, rot: s === "circle" ? 0 : 30 }), `Is this a ${s}? Say it with me.`, "Yes."));
    const isItems = r.shuffle([
      { v: shapeVis({ s, c: r.pick(SHAPE_COLORS), scale: 0.5 }), a: "Yes." },
      { v: shapeVis(info.no[0]), a: "No.", why: info.no[0].why },
      { v: shapeVis({ s, c: r.pick(SHAPE_COLORS), rot: s === "circle" ? 0 : 60, scale: 1.1 }), a: "Yes." },
      { v: shapeVis(info.no[1]), a: "No.", why: info.no[1].why },
    ]);
    for (const [i, it] of isItems.entries()) {
      steps.push(test(it.v, `${i === 0 ? "Your turn. " : ""}Is this a ${s}?`, it.a, fix(it.a, `Is this a ${s}?`, it.a === "Yes." ? info.rule : `It is not a ${s}. ${it.why}`), { skill: "shape", item: `is:${s}` }));
    }
    const pool = Array.from(new Set([...known, "circle", "square", "triangle"]));
    steps.push(this.touchTest(r, s, pool));
    if (known.length > 1) steps.push(this.nameTest(r, r.pick(known.filter((x) => x !== s))));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const known = intro.map((x) => x.s);
    const picks = favorNew(r, known, 4);
    const steps = picks.map((s, i) => (i === 1 || i === 3 ? this.touchTest(r, s, Array.from(new Set([...known, "circle", "square", "triangle"]))) : known.length > 1 ? this.nameTest(r, s) : test(this.randomShape(r, s), `Is this a ${s}?`, "Yes.", fix("Yes.", `Is this a ${s}?`, SHAPE_INFO[s].rule), { skill: "shape", item: `is:${s}` })));
    return { title: "Shapes", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const known = units.map((x) => x.s);
    const pool = Array.from(new Set([...known, "circle", "square", "triangle"]));
    return known.slice(-2).flatMap((s) => [this.touchTest(r, s, pool)]).concat(known.length > 1 ? [this.nameTest(r, known[known.length - 1])] : []);
  },
};

// ─────────────────────────────────────────────────────────────
// Position words
// ─────────────────────────────────────────────────────────────

const POS = {
  on: { phrase: "on", ref: "table" },
  under: { phrase: "under", ref: "table" },
  next: { phrase: "next to", ref: "table" },
  in: { phrase: "in", ref: "box" },
  above: { phrase: "above", ref: "table" },
  front: { phrase: "in front of", ref: "box" },
  behind: { phrase: "behind", ref: "box" },
};

const position = {
  id: "position",
  name: "Position words",
  summary: "Use on, under, next to, in, above, in front of, behind, first, and last to tell where something is.",
  standard: "ELOF: geometry and spatial sense",
  units: [
    { id: "on", lesson: 10, label: "The word on" },
    { id: "under", lesson: 16, label: "The word under" },
    { id: "next", lesson: 28, label: "The words next to" },
    { id: "in", lesson: 36, label: "The word in" },
    { id: "above", lesson: 49, label: "The word above" },
    { id: "front", lesson: 57, label: "The words in front of" },
    { id: "behind", lesson: 63, label: "The word behind" },
    { id: "firstlast", lesson: 74, label: "First and last" },
  ],
  sceneOf(rel, obj) {
    return V.scene(rel, { obj, ref: POS[rel].ref });
  },
  whereTest(rel, obj) {
    const p = POS[rel];
    const ans = `${p.phrase.charAt(0).toUpperCase() + p.phrase.slice(1)} the ${p.ref}.`;
    return test(this.sceneOf(rel, obj), `Where is the ${obj}?`, ans, fix(ans, `Where is the ${obj}?`, `Look. The ${obj} is ${p.phrase} the ${p.ref}.`), { skill: "position", item: `where:${rel}` });
  },
  touchTest(r, rel, known, obj) {
    const sameRef = known.filter((x) => x !== rel && x !== "firstlast" && POS[x].ref === POS[rel].ref);
    const pool = sameRef.length ? sameRef : known.filter((x) => x !== rel && x !== "firstlast");
    if (!pool.length) return null;
    const other = r.pick(pool);
    const opts = r.shuffle([rel, other]);
    return test(V.choices(opts.map((x) => this.sceneOf(x, obj)), opts.indexOf(rel)),
      `Touch the picture where the ${obj} is ${POS[rel].phrase} the ${POS[rel].ref}.`, "(Touches the right picture.)",
      fixPoint(`In this picture the ${obj} is ${POS[rel].phrase} the ${POS[rel].ref}. (Touch it.)`, `Touch the picture where the ${obj} is ${POS[rel].phrase} the ${POS[rel].ref}.`),
      { skill: "position", item: `touch:${rel}` });
  },
  lineTest(r, which) {
    const icons = iconSeq(r, 5);
    const idx = which === "first" ? 0 : icons.length - 1;
    return test(V.lineup(icons, { tap: true, ans: idx }), `Touch the ${which} one.`, `(Touches the ${icons[idx]}.)`,
      fixPoint(`The flag is at the front of the line. The ${icons[idx]} is at the ${which === "first" ? "front" : "end"}, so it is ${which}. (Touch it.)`, `Touch the ${which} one.`),
      { skill: "position", item: `line:${which}` });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const known = intro.map((x) => x.id);
    if (u.id === "firstlast") {
      const icons = iconSeq(r, 5);
      return {
        title: u.label,
        steps: [
          model(V.lineup(icons), `These things are in a line. The flag shows the front of the line. My turn. The ${icons[0]} is at the front. It is first. The ${icons[4]} is at the end. It is last.`, { do: "Touch the first picture, then the last." }),
          lead(V.lineup(icons, { tap: true, ans: 0 }), "Touch the first one with me.", `(Touches the ${icons[0]}.)`),
          this.lineTest(r, "first"),
          this.lineTest(r, "last"),
          this.lineTest(r, "first"),
        ],
      };
    }
    const p = POS[u.id];
    const objs = r.shuffle(["ball", "cat", "duck"]);
    const steps = [
      model(this.sceneOf(u.id, objs[0]), `My turn. The ${objs[0]} is ${p.phrase} the ${p.ref}.`, { do: `Point to the ${objs[0]}, then to the ${p.ref}.` }),
    ];
    const contrast = known.filter((x) => x !== u.id && x !== "firstlast" && POS[x].ref === p.ref);
    if (contrast.length) {
      const c = r.pick(contrast);
      steps.push(model(this.sceneOf(c, objs[0]), `Now the ${objs[0]} is not ${p.phrase} the ${p.ref}. It is ${POS[c].phrase} the ${p.ref}.`));
    }
    steps.push(lead(this.sceneOf(u.id, objs[1]), `Where is the ${objs[1]}? Say it with me.`, `${p.phrase.charAt(0).toUpperCase() + p.phrase.slice(1)} the ${p.ref}.`));
    steps.push(this.whereTest(u.id, objs[2]));
    const t = this.touchTest(r, u.id, known, objs[1]);
    if (t) steps.push(t);
    if (contrast.length) steps.push(this.whereTest(r.pick(contrast), objs[0]));
    steps.push(this.whereTest(u.id, objs[0]));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const known = intro.map((x) => x.id);
    const rels = known.filter((x) => x !== "firstlast");
    const picks = favorNew(r, rels, 2);
    const objs = r.shuffle(["ball", "cat", "duck"]);
    const steps = [this.whereTest(picks[0], objs[0])];
    const t = this.touchTest(r, picks[1], rels, objs[1]);
    steps.push(t || this.whereTest(picks[1], objs[1]));
    if (known.includes("firstlast")) steps.push(this.lineTest(r, r.pick(["first", "last"])));
    return { title: "Where is it?", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const known = units.map((x) => x.id);
    const rels = known.filter((x) => x !== "firstlast");
    const out = rels.slice(-2).map((rel, i) => this.whereTest(rel, ["ball", "cat"][i]));
    if (known.includes("firstlast")) out.push(this.lineTest(r, "last"));
    return out;
  },
};

// ─────────────────────────────────────────────────────────────
// Size
// ─────────────────────────────────────────────────────────────

const SIZE = {
  big: { a: "big", b: "small", icons: ["ball", "apple", "car", "fish", "duck", "star"], kind: "big" },
  long: { a: "long", b: "short", icons: ["ribbon", "stick", "snake"], kind: "long" },
  tall: { a: "tall", b: "short", icons: ["tower", "tree"], kind: "tall" },
  heavy: { a: "heavy", b: "light", icons: ["scale"], kind: "heavy" },
};

const size = {
  id: "size",
  name: "Size",
  summary: "Tell big from small, long from short, tall from short, and heavy from light.",
  standard: "ELOF: measurement",
  units: [
    { id: "big", lesson: 23, label: "Big and small" },
    { id: "long", lesson: 37, label: "Long and short" },
    { id: "tall", lesson: 52, label: "Tall and short" },
    { id: "heavy", lesson: 65, label: "Heavy and light" },
  ],
  pairVis(kind, icon, flip, tapAns) {
    const items = flip ? [0.5, 1] : [1, 0.5];
    if (kind === "heavy") {
      const pairs = [["block", "leaf"], ["rock", "feather"], ["melon", "grape"]];
      const p = pairs[(icon || 0) % pairs.length];
      return V.size("heavy", items, { names: flip ? [p[1], p[0]] : p, tap: tapAns !== undefined, ans: tapAns });
    }
    return V.size(kind, items, { icon, tap: tapAns !== undefined, ans: tapAns });
  },
  word(kind, which, icon) {
    if (kind === "heavy") return which;
    return `${which} ${icon}`;
  },
  touchTest(r, kind, wantA) {
    const info = SIZE[kind];
    const flip = r() < 0.5;
    const icon = kind === "heavy" ? r.int(0, 2) : r.pick(info.icons);
    const wantWord = wantA ? info.a : info.b;
    // items[0] is the bigger one unless flipped
    const bigIndex = flip ? 1 : 0;
    const ans = wantA ? bigIndex : 1 - bigIndex;
    const what = kind === "heavy" ? `the ${wantWord} one` : `the ${wantWord} ${icon}`;
    const reason = {
      big: `This ${icon} is bigger than the other one. It is big.`,
      small: `This ${icon} is smaller than the other one. It is small.`,
      long: `These start at the same place. This ${icon} goes farther, so it is long.`,
      tall: `These stand on the same floor. This ${icon} goes up higher, so it is tall.`,
      short: kind === "tall" ? `These stand on the same floor. This ${icon} does not go up as high, so it is short.` : `These start at the same place. This ${icon} does not go as far, so it is short.`,
    };
    const fixLine = kind === "heavy"
      ? `The heavy side of the scale goes down. ${wantA ? "This one is heavy." : "The light side stays up. This one is light."} (Touch it.)`
      : `${reason[wantWord]} (Touch it.)`;
    return test(this.pairVis(kind, icon, flip, ans), `Touch ${what}.`, `(Touches ${what}.)`, fixPoint(fixLine, `Touch ${what}.`),
      { skill: "size", item: `${kind}:${wantWord}`, confirm: `Yes, that one is ${wantWord}.` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const info = SIZE[u.id];
    const steps = [];
    if (u.id === "big") {
      steps.push(model(this.pairVis("big", "ball", false), "My turn. This ball is big. (Point.) This ball is small. (Point.)"));
      steps.push(model(this.pairVis("big", "apple", true), "This apple is small. This apple is big."));
      steps.push(lead(this.pairVis("big", "car", false, 0), "Touch the big car with me.", "(Touches the big car.)"));
    } else if (u.id === "long") {
      steps.push(model(this.pairVis("long", "ribbon", false), "My turn. These ribbons start at the same place. This ribbon goes farther. It is long. This ribbon is short."));
      steps.push(model(this.pairVis("long", "stick", true), "This stick is short. This stick is long."));
      steps.push(lead(this.pairVis("long", "snake", false, 0), "Touch the long snake with me.", "(Touches the long snake.)"));
    } else if (u.id === "tall") {
      steps.push(model(this.pairVis("tall", "tower", false), "My turn. These towers stand on the same floor. This tower goes up higher. It is tall. This tower is short."));
      steps.push(model(this.pairVis("tall", "tree", true), "This tree is short. This tree is tall."));
      steps.push(lead(this.pairVis("tall", "tower", true, 1), "Touch the tall tower with me.", "(Touches the tall tower.)"));
    } else {
      steps.push(model(this.pairVis("heavy", 0, false), "This is a scale. It shows which thing is heavy. The heavy side goes down. My turn. The block is heavy. The leaf is light.", { do: "Point to the low side, then the high side." }));
      steps.push(model(this.pairVis("heavy", 1, true), "This side went down, so the rock is heavy. The feather is light."));
      steps.push(lead(this.pairVis("heavy", 2, false, 0), "Touch the heavy one with me.", "(Touches the melon.)"));
    }
    steps.push(this.touchTest(r, u.id, true));
    steps.push(this.touchTest(r, u.id, false));
    steps.push(this.touchTest(r, u.id, r() < 0.5));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const kinds = favorNew(r, intro.map((x) => x.id), 3);
    return { title: "Size", steps: favorNew(r, intro.map((x) => x.id), 4).map((k) => this.touchTest(r, k, r() < 0.5)) };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return units.slice(-2).map((u) => this.touchTest(r, u.id, r() < 0.5));
  },
};

// ─────────────────────────────────────────────────────────────
// Patterns
// ─────────────────────────────────────────────────────────────

const PATTERN_ICONS = [["apple", "star"], ["duck", "fish"], ["ball", "flower"], ["car", "boat"], ["leaf", "bird"], ["frog", "cookie"]];
const CORES = { ab: [0, 1], aab: [0, 0, 1], abb: [0, 1, 1], abc: [0, 1, 2] };

const patterns = {
  id: "patterns",
  name: "Patterns",
  summary: "Say, copy, and continue patterns of the kinds AB, AAB, ABB, and ABC.",
  standard: "ELOF: patterning",
  units: [
    { id: "ab", lesson: 42, label: "AB patterns" },
    { id: "aab", lesson: 55, label: "AAB patterns" },
    { id: "abb", lesson: 67, label: "ABB patterns" },
    { id: "abc", lesson: 81, label: "ABC patterns" },
  ],
  build(r, type, reps = 3) {
    const pair = r.pick(PATTERN_ICONS);
    const third = r.pick(["heart", "ball", "star", "leaf"].filter((x) => !pair.includes(x)));
    const icons = [pair[0], pair[1], third];
    const core = CORES[type];
    const seq = [];
    for (let i = 0; i < reps; i++) for (const c of core) seq.push(icons[c]);
    return { icons, core, seq };
  },
  nextTest(r, type) {
    const p = this.build(r, type, 3);
    const cut = p.seq.length - r.int(1, Math.min(2, p.core.length));
    const shown = p.seq.slice(0, cut);
    const next = p.seq[cut];
    const choices = Array.from(new Set(p.core.map((c) => p.icons[c])));
    const opts = r.shuffle(choices);
    return [
      lead(V.pattern(shown.map((i) => ({ icon: i })), { blanks: 1 }), "Say the pattern with me. Get ready.", capFirst(shown.join(", ")) + ".", { do: "Touch each picture as you say it together." }),
      test(V.row(V.pattern(shown.map((i) => ({ icon: i })), { blanks: 1 }), V.choices(opts.map((i) => V.obj(i, 1)), opts.indexOf(next))),
        "What comes next? Touch it.", `(Touches the ${next}.)`,
        fixPoint(`Listen to the pattern: ${shown.join(", ")}, ${next}. ${next.charAt(0).toUpperCase() + next.slice(1)} comes next. (Touch it.)`, "What comes next? Touch it."),
        { skill: "pattern", item: `pattern:${type}`, confirm: `Yes, ${next} comes next.` }),
    ];
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const p = this.build(r, u.id, 3);
    const names = p.seq.join(", ");
    const coreNames = p.core.map((c) => p.icons[c]).join(", ");
    const shown = p.seq.slice(0, p.seq.length - 1);
    const steps = [
      model(V.pattern(p.seq.map((i) => ({ icon: i }))), `My turn. Listen. ${capFirst(names)}. The part "${coreNames}" happens again and again. That is a pattern.`, { do: "Touch each picture as you say it." }),
      lead(V.pattern(p.seq.map((i) => ({ icon: i }))), "Say it with me. Get ready.", capFirst(names) + "."),
      model(V.pattern(shown.map((i) => ({ icon: i })), { blanks: 1 }), `What comes next? My turn. ${capFirst(shown.join(", "))}, ${p.seq[p.seq.length - 1]}. ${capFirst(p.seq[p.seq.length - 1])} comes next.`),
      ...this.nextTest(r, u.id),
      ...this.nextTest(r, u.id),
    ];
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const type = favorNew(r, intro.map((x) => x.id), 1)[0];
    const s = this.nextTest(r, type);
    return { title: "Patterns", steps: [...s, this.nextTest(r, r.pick(intro.map((x) => x.id)))[1]] };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return units.slice(-2).map((u) => this.nextTest(r, u.id)[1]);
  },
};

// ─────────────────────────────────────────────────────────────
// Sorting
// ─────────────────────────────────────────────────────────────

const SORT_COLORS = ["red", "blue", "yellow", "green", "purple", "orange"];
const SORT_SHAPES = ["circle", "square", "triangle"];

const sorting = {
  id: "sorting",
  name: "Sorting",
  summary: "Find the one that does not belong, and say how the others are the same: by color, by shape, or by size.",
  standard: "ELOF: classification",
  units: [
    { id: "color", lesson: 39, label: "Sort by color" },
    { id: "shape", lesson: 51, label: "Sort by shape" },
    { id: "size", lesson: 61, label: "Sort by size" },
  ],
  set(r, by) {
    if (by === "color") {
      const [c1, c2] = r.sample(SORT_COLORS, 2);
      const items = r.sample(["circle", "square", "triangle", "circle"], 3).map((s) => ({ s, c: c1 }));
      const odd = { s: r.pick(SORT_SHAPES), c: c2 };
      return { items, odd, same: `They are all ${c1}.`, why: "It is a different color.", oddName: `the ${c2} one` };
    }
    if (by === "shape") {
      const [s1, s2] = r.sample(SORT_SHAPES, 2);
      const items = r.sample(SORT_COLORS, 3).map((c) => ({ s: s1, c }));
      const odd = { s: s2, c: r.pick(SORT_COLORS) };
      return { items, odd, same: `They are all ${s1}s.`, why: "It is a different shape.", oddName: `the ${s2}` };
    }
    const icon = r.pick(["ball", "apple", "fish", "star"]);
    const bigSet = r() < 0.5;
    const items = [1, 2, 3].map(() => ({ icon, scale: bigSet ? 1 : 0.5 }));
    const odd = { icon, scale: bigSet ? 0.5 : 1 };
    return { items, odd, same: `They are all ${bigSet ? "big" : "small"}.`, why: "It is a different size.", oddName: `the ${bigSet ? "small" : "big"} one` };
  },
  vis(it) {
    if (it.icon) return V.obj(it.icon, 1, { scale: it.scale });
    return V.shape(it.s, { c: it.c, scale: 0.8 });
  },
  oddTest(r, by) {
    const st = this.set(r, by);
    const all = r.shuffle([...st.items.map((x) => ({ ...x, odd: false })), { ...st.odd, odd: true }]);
    const ans = all.findIndex((x) => x.odd);
    const screen = V.choices(all.map((x) => this.vis(x)), ans);
    return [
      test(screen, "Touch the one that does not belong.", `(Touches ${st.oddName}.)`,
        fixPoint(`${st.same.replace("They are", "These are")} This one is not. It does not belong. (Touch ${st.oddName}.)`, "Touch the one that does not belong."),
        { skill: "sort", item: `odd:${by}`, confirm: "Yes, that one does not belong." }),
      test(screen, "Why doesn't it belong?", st.why, fix(st.why, "Why doesn't it belong?", `${st.same.replace("They are", "These are")} This one is not.`), { skill: "sort", item: `why:${by}` }),
    ];
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const a = this.set(r, u.id);
    const allA = r.shuffle([...a.items.map((x) => ({ ...x, odd: false })), { ...a.odd, odd: true }]);
    const b = this.set(r, u.id);
    const allB = r.shuffle([...b.items.map((x) => ({ ...x, odd: false })), { ...b.odd, odd: true }]);
    return {
      title: u.label,
      steps: [
        model(V.choices(allA.map((x) => this.vis(x)), allA.findIndex((x) => x.odd)),
          `My turn. ${a.same.replace("They are all", "Three of these are")} One is not. It does not belong with the others. (Touch it.) Why? ${a.why}`, {
            do: "Touch each one that is the same, then the one that is different.",
          }),
        lead(V.choices(allB.map((x) => this.vis(x)), allB.findIndex((x) => x.odd)), "Let's find it together. Touch the one that does not belong. Get ready.", `(Touches ${b.oddName}.)`),
        lead(V.choices(allB.map((x) => this.vis(x)), allB.findIndex((x) => x.odd)), "Why doesn't it belong? Say it with me.", b.why),
        ...this.oddTest(r, u.id),
        ...this.oddTest(r, u.id),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const by = favorNew(r, intro.map((x) => x.id), 1)[0];
    return { title: "Which does not belong?", steps: [...this.oddTest(r, by), this.oddTest(r, r.pick(intro.map((x) => x.id)))[0]] };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return units.slice(-2).map((u) => this.oddTest(r, u.id)[0]);
  },
};

// ─────────────────────────────────────────────────────────────
// Adding to and taking away (spoken stories within 5)
// ─────────────────────────────────────────────────────────────

const STORY_PLACES = {
  duck: "in the pond", bird: "on the grass", fish: "in the water", frog: "on the log",
  apple: "on the plate", cookie: "on the plate", ball: "in the yard", car: "on the road",
  boat: "on the lake", ladybug: "on the leaf", flower: "in the garden", star: "in the sky",
};

// Singular and plural verbs for things that leave.
export const TAKE_VERBS = {
  bird: ["flies away", "fly away"], duck: ["swims away", "swim away"], fish: ["swims away", "swim away"],
  frog: ["hops away", "hop away"], car: ["drives away", "drive away"], boat: ["sails away", "sail away"],
  ladybug: ["flies away", "fly away"], ball: ["rolls away", "roll away"], star: ["goes behind a cloud", "go behind a cloud"],
  apple: ["is eaten", "are eaten"], cookie: ["is eaten", "are eaten"], flower: ["is picked", "are picked"],
  leaf: ["blows away", "blow away"], block: ["is put away", "are put away"],
};

const stories = {
  id: "stories",
  name: "Adding to and taking away",
  summary: "Listen to short stories, act them out with pictures, and count to find how many there are now, within 5.",
  standard: "ELOF: operations and algebraic thinking",
  units: [
    { id: "join", lesson: 69, label: "Some more come" },
    { id: "take", lesson: 83, label: "Some go away" },
  ],
  joinItem(r, icon) {
    const total = r.int(2, 5);
    const add = r.int(1, total - 1);
    const start = total - add;
    const place = STORY_PLACES[icon] || "here";
    const comes = icon === "apple" || icon === "cookie" || icon === "ball" || icon === "flower" || icon === "star" ? (add === 1 ? "is added" : "are added") : (add === 1 ? "comes" : "come");
    return [
      test(V.story(icon, start, { add }), `Listen. ${Word(start)} ${plural(icon, start)} ${start === 1 ? "is" : "are"} ${place}. ${Word(add)} more ${comes}. Touch and count all the ${plural(icon)}.`, Chain(1, total),
        fixChain(Chain(1, total), `Touch and count all the ${plural(icon)}.`), { skill: "story", item: `join:${start}+${add}` }),
      test(V.story(icon, start, { add }), `How many ${plural(icon)} now?`, Word(total) + ".", fix(Word(total) + ".", `How many ${plural(icon)} now?`, `The last number we counted was ${word(total)}, so there are ${word(total)} ${plural(icon)} now.`), { skill: "story", item: `join-total:${total}` }),
    ];
  },
  takeItem(r, icon) {
    const start = r.int(2, 5);
    const take = r.int(1, start - 1);
    const left = start - take;
    const verbs = TAKE_VERBS[icon] || ["goes away", "go away"];
    const past = take === 1 ? verbs[0] : verbs[1];
    return [
      test(V.story(icon, start, { take }), `Listen. There are ${word(start)} ${plural(icon, start)}. ${Word(take)} ${past}. We do not count the ones that are crossed out. Touch and count the ${plural(icon)} that are left.`, Chain(1, left),
        fixChain(Chain(1, left), `Touch and count the ${plural(icon)} that are left.`), { skill: "story", item: `take:${start}-${take}` }),
      test(V.story(icon, start, { take }), `How many ${plural(icon)} are left?`, Word(left) + ".", fix(Word(left) + ".", `How many ${plural(icon)} are left?`, `The last number we counted was ${word(left)}, so ${word(left)} ${left === 1 ? "is" : "are"} left.`), { skill: "story", item: `take-left:${left}` }),
    ];
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "join") {
      return {
        title: u.label,
        steps: [
          model(V.story("duck", 2), "Listen to a story. Two ducks are in the pond. (Point to the ducks.)"),
          model(V.story("duck", 2, { add: 1 }), "One more duck comes. (Point to the new duck.) Now let's count all the ducks. My turn. One, two, three. Now there are three ducks."),
          lead(V.story("bird", 3, { add: 1 }), "Three birds are on the grass. One more comes. Count all the birds with me. Get ready.", Chain(1, 4)),
          lead(V.story("bird", 3, { add: 1 }), "How many birds now? Say it with me.", "Four."),
          ...this.joinItem(r, "fish"),
          ...this.joinItem(r, r.pick(["frog", "apple", "car"])),
        ],
      };
    }
    return {
      title: u.label,
      steps: [
        model(V.story("apple", 4), "Listen to a story. There are four apples on the plate."),
        model(V.story("apple", 4, { take: 1 }), "One apple is eaten. It is crossed out, so we do not count it. My turn. I count the apples that are left. One, two, three. Three apples are left."),
        lead(V.story("bird", 5, { take: 2 }), "There are five birds. Two fly away. Count the birds that are left with me. Get ready.", Chain(1, 3)),
        lead(V.story("bird", 5, { take: 2 }), "How many birds are left? Say it with me.", "Three."),
        ...this.takeItem(r, "cookie"),
        ...this.takeItem(r, r.pick(["frog", "duck", "boat"])),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const icon = r.pick(["duck", "fish", "frog", "bird", "apple", "car", "boat", "ladybug"]);
    const hasTake = intro.some((x) => x.id === "take");
    const icon2 = r.pick(["duck", "fish", "frog", "bird", "apple", "car", "boat", "ladybug"].filter((x) => x !== icon));
    const steps = hasTake
      ? (r() < 0.5 ? [...this.joinItem(r, icon), ...this.takeItem(r, icon2)] : [...this.takeItem(r, icon), ...this.joinItem(r, icon2)])
      : [...this.joinItem(r, icon), ...this.joinItem(r, icon2)];
    return { title: "Story problems", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const out = [this.joinItem(r, "duck")[1]];
    if (units.some((x) => x.id === "take")) out.push(this.takeItem(r, "cookie")[1]);
    return out;
  },
};

export default {
  id: "prek",
  slug: "prek",
  name: "Pre-K",
  longName: "Pre-K",
  age: "about 4",
  lessons: 100,
  minutes: "8 to 12",
  minutesBand: [8, 12],
  minExercises: 6,
  minReviewSteps: 5,
  maxExercises: 8,
  maxSteps: 70,
  placementPoints: [1, 35, 70],
  maxGap: 9,
  reviewIntervals: [2, 3, 4],
  tagline: "Counting to 20, reading numbers to 10, seeing small amounts at a glance, shapes, patterns, and the first story problems.",
  description: "Pre-K builds the foundation: counting aloud to 20, counting objects, seeing small amounts at a glance, reading numbers to 10, comparing groups, shapes, position and size words, patterns, sorting, and the first spoken story problems.",
  endsWith: "By the end of Pre-K, the child counts to 20, counts out up to 10 objects, reads the numbers 0 to 10, sees amounts to 5 at a glance, names four shapes, continues simple patterns, and solves spoken story problems within 5 with pictures.",
  materials: ["Ten small objects, such as blocks or buttons"],
  readable(n) {
    return new Set(NUM_ORDER.filter(([, lesson]) => lesson <= n).map(([d]) => d));
  },
  readiness: readinessItems,
  tracks: [readiness, countAloud, countObjects, subitize, numerals, compare, shapes, position, size, countOut, matchTrack, sorting, patterns, stories],
};

// Formats reused by later levels.
export { countObjects, compare, shapes, position, size, sorting, patterns, numerals, subitize, SHAPE_INFO, POS };

// A copy of a track with different units (and any other changes).
export function retrack(track, units, extra = {}) {
  return Object.assign(Object.create(track), { units }, extra);
}
