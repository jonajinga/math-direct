// Kindergarten: 140 lessons, 15 to 20 minutes each, for children of about five.

import {
  V, model, lead, test, note, fix, fixPoint, fixChain, word, Word, chain, Chain, plural,
  countTest, touchCount, readNum, touchNum, flashTest, touchChoice, iconSeq, favorNew, others,
} from "./common.js";
const isAre = (n) => (n === 1 ? "is" : "are");
import {
  compare as prekCompare, position as prekPosition, numerals as prekNumerals, retrack,
  SHAPE_INFO, TAKE_VERBS,
} from "./prek.js";

const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
// The largest number the child has been taught to read by this lesson.
const numMax = (ctx) => Math.max(10, ...ctx.known("numerals").flatMap((u) => u.ds));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ─────────────────────────────────────────────────────────────
// Counting aloud: to 100 by ones and tens, from any number, backward
// ─────────────────────────────────────────────────────────────

const countAloud = {
  id: "count-aloud",
  name: "Counting aloud",
  warmup: true,
  summary: "Count to 100 by ones and by tens, count forward from any number, say the number after or before, and count backward from 10 and from 20.",
  standard: "K.CC.1, K.CC.2",
  units: [
    { id: "to10", lesson: 1, type: "to", to: 10, label: "Count to 10" },
    { id: "to20", lesson: 3, type: "to", to: 20, label: "Count to 20" },
    { id: "from10", lesson: 10, type: "from", max: 10, label: "Count on from a number, to 10" },
    { id: "to30", lesson: 18, type: "to", to: 30, label: "Count to 30" },
    { id: "after", lesson: 24, type: "after", max: 20, label: "The number after" },
    { id: "tens", lesson: 28, type: "tens", label: "Count by tens to 100" },
    { id: "from20", lesson: 32, type: "from", max: 20, label: "Count on from a number, to 20" },
    { id: "to40", lesson: 36, type: "to", to: 40, label: "Count to 40" },
    { id: "to50", lesson: 44, type: "to", to: 50, label: "Count to 50" },
    { id: "back10", lesson: 52, type: "back", from: 10, label: "Count backward from 10" },
    { id: "before", lesson: 58, type: "before", max: 10, label: "The number before" },
    { id: "to60", lesson: 64, type: "to", to: 60, label: "Count to 60" },
    { id: "to70", lesson: 72, type: "to", to: 70, label: "Count to 70" },
    { id: "to80", lesson: 80, type: "to", to: 80, label: "Count to 80" },
    { id: "to90", lesson: 88, type: "to", to: 90, label: "Count to 90" },
    { id: "to100", lesson: 96, type: "to", to: 100, label: "Count to 100" },
    { id: "from100", lesson: 104, type: "from", max: 100, label: "Count on from any number to 100" },
    { id: "back20", lesson: 112, type: "back", from: 20, label: "Count backward from 20" },
  ],
  maxTo(intro) {
    return Math.max(...intro.filter((u) => u.type === "to").map((u) => u.to));
  },
  afterTest(n) {
    return test(V.say(), `What number comes after ${word(n)}?`, Word(n + 1) + ".",
      fix(Word(n + 1) + ".", `What number comes after ${word(n)}?`, `Listen: ${word(n)}, ${word(n + 1)}. ${Word(n + 1)} comes after ${word(n)}.`),
      { skill: "count-aloud", item: `after:${n}` });
  },
  beforeTest(n) {
    return test(V.say(), `What number comes before ${word(n)}?`, Word(n - 1) + ".",
      fix(Word(n - 1) + ".", `What number comes before ${word(n)}?`, `Listen: ${word(n - 1)}, ${word(n)}. ${Word(n - 1)} comes just before ${word(n)}.`),
      { skill: "count-aloud", item: `before:${n}` });
  },
  // A count segment that fits a warm-up: long counts are broken into stretches.
  segment(r, max) {
    if (max <= 30) return [1, max];
    const end = r.pick(range(3, max / 10).map((t) => t * 10));
    return [Math.max(1, end - r.pick([10, 12, 15])), end];
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const steps = [];
    if (u.type === "to") {
      const prevMax = intro.filter((x) => x.type === "to" && x.id !== u.id).reduce((m, x) => Math.max(m, x.to), 0);
      const from = Math.max(1, prevMax - 2);
      const fromOne = from === 1;
      steps.push(model(V.say(), fromOne
        ? `Today we count to ${word(u.to)}. Listen. My turn. ${Chain(1, u.to)}`
        : `You can count to ${word(prevMax)}. Today we count to ${word(u.to)}. Listen to the new part. I start a little before it. My turn. ${Chain(from, u.to)}`, {
        do: prevMax >= 20 ? `Stress the change at each new ten: for example, "${word(prevMax - 1)}, ${word(prevMax)}."` : "Say each number clearly.",
      }));
      steps.push(lead(V.say(), fromOne ? `Count to ${word(u.to)} with me. Get ready.` : "Say the new part with me. Get ready.", Chain(from, u.to)));
      steps.push(lead(V.say(), "Again. Get ready.", Chain(from, u.to)));
      steps.push(countTest(from, u.to, 1, { prefix: "Your turn." }));
      const longFrom = u.to <= 30 ? 1 : u.to - 15;
      steps.push(countTest(longFrom, u.to, 1, { prefix: longFrom < from ? "Now a longer count." : "Again." }));
    } else if (u.type === "from") {
      const max = u.max;
      const a = r.int(2, max - 4), b = Math.min(max, a + r.int(3, 6));
      steps.push(model(V.say(), `Now we start at a number that is not one. My turn. I start at ${word(a)} and count to ${word(b)}. I get it going by saying the first number long: ${word(a)}... ${chain(a + 1, b)}.`, {
        do: `Say the first number slowly and stretched out, "${word(a)}...", then count on.`,
      }));
      steps.push(lead(V.say(), `Do it with me. Start at ${word(a)}. Count to ${word(b)}. Get it going.`, Chain(a, b)));
      const c = r.int(2, max - 4), d = Math.min(max, c + r.int(3, 6));
      steps.push(countTest(c, d, 1, { prefix: "Your turn." }));
      const e = r.int(2, max - 4), f = Math.min(max, e + r.int(3, 6));
      steps.push(countTest(e, f));
    } else if (u.type === "after") {
      steps.push(model(V.say(), "Listen. When we count, every number has a number that comes after it. Six, seven. Seven comes after six. My turn. What number comes after six? Seven."));
      steps.push(lead(V.say(), "What number comes after four? Say it with me.", "Five."));
      for (const n of r.seq(range(1, 19), 4)) steps.push(this.afterTest(n));
    } else if (u.type === "before") {
      steps.push(model(V.say(), "Listen. The number before is the one we say just before. Seven, eight. Seven comes before eight. My turn. What number comes before eight? Seven."));
      steps.push(lead(V.say(), "What number comes before five? Say it with me.", "Four."));
      for (const n of r.seq(range(2, 10), 4)) steps.push(this.beforeTest(n));
    } else if (u.type === "tens") {
      steps.push(model(V.say(), `Now we count by tens. Listen. ${Chain(10, 100, 10)}`, { do: "Hold up both hands for each ten." }));
      steps.push(lead(V.say(), "Count by tens with me. Get ready.", Chain(10, 100, 10)));
      steps.push(lead(V.say(), "Again. Get ready.", Chain(10, 100, 10)));
      steps.push(countTest(10, 100, 10, { prefix: "Your turn." }));
    } else if (u.type === "back") {
      steps.push(model(V.say(), `Now we count backward. The numbers go down. Listen. ${Chain(u.from, 0, -1)}`, { do: "Lower one finger at a time as you count down." }));
      steps.push(lead(V.say(), `Count backward from ${word(u.from)} with me. Get ready.`, Chain(u.from, 0, -1)));
      steps.push(lead(V.say(), "Again. Get ready.", Chain(u.from, 0, -1)));
      steps.push(countTest(u.from, 0, -1, { prefix: "Your turn." }));
      const s = r.int(Math.max(4, u.from - 6), u.from);
      steps.push(countTest(s, Math.max(0, s - 5), -1));
    }
    return { title: u.label, steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    const ex = this.newEx(u, ctx, intro);
    // Keep the lead and tests; drop the first model.
    ex.steps = ex.steps.filter((s, i) => !(i === 0 && s.cue === "model"));
    if (ex.steps.length > 4) ex.steps = ex.steps.slice(-4);
    if (!ex.steps.some((s) => s.cue === "test")) ex.steps.push(countTest(1, 10));
    return ex;
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const max = this.maxTo(intro);
    const has = (t) => intro.some((u) => u.type === t);
    const steps = [];
    const [a, b] = this.segment(r, max);
    steps.push(countTest(a, b));
    const extra = [];
    if (has("from")) {
      const fm = Math.max(...intro.filter((u) => u.type === "from").map((u) => u.max));
      const s = r.int(2, fm - 5);
      extra.push(countTest(s, s + r.int(4, 7)));
    }
    if (has("tens")) extra.push(countTest(10, 100, 10));
    if (has("after")) extra.push(this.afterTest(r.int(1, Math.min(max, 99) - 1)));
    if (has("before")) extra.push(this.beforeTest(r.int(2, 20)));
    if (has("back")) {
      const bf = Math.max(...intro.filter((u) => u.type === "back").map((u) => u.from));
      extra.push(countTest(bf, 0, -1));
    }
    steps.push(...r.sample(extra, Math.min(2, extra.length)));
    return { title: "Counting aloud", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    const max = this.maxTo(units);
    const out = [];
    if (u.type === "to") out.push(countTest(Math.max(1, u.to - 12), u.to));
    else if (u.type === "from") { const s = r.int(2, u.max - 6); out.push(countTest(s, s + 5)); }
    else if (u.type === "after") out.push(this.afterTest(r.int(3, 18)));
    else if (u.type === "before") out.push(this.beforeTest(r.int(3, 10)));
    else if (u.type === "tens") out.push(countTest(10, 100, 10));
    else if (u.type === "back") out.push(countTest(u.from, 0, -1));
    if (u.type !== "to") out.push(countTest(Math.max(1, max - 10), max));
    return out;
  },
};

// ─────────────────────────────────────────────────────────────
// Counting objects: arrangements, one more, counting out to 20
// ─────────────────────────────────────────────────────────────

const countObjects = {
  id: "count-objects",
  name: "Counting objects",
  summary: "Count up to 20 objects in rows and arrays, up to 10 in a circle or scattered; know that one more is the next number; count out up to 20.",
  standard: "K.CC.4, K.CC.5",
  units: [
    { id: "row10", lesson: 1, type: "count", max: 10, arr: "row", label: "Count up to 10 in a row" },
    { id: "array", lesson: 12, type: "count", max: 12, arr: "array", label: "Count objects in an array" },
    { id: "circle", lesson: 22, type: "count", max: 10, arr: "circle", label: "Count objects in a circle" },
    { id: "scatter", lesson: 30, type: "count", max: 10, arr: "scatter", label: "Count scattered objects" },
    { id: "onemore", lesson: 34, type: "onemore", max: 10, label: "One more is the next number" },
    { id: "row20", lesson: 50, type: "count", max: 20, arr: "row", label: "Count up to 20 objects" },
    { id: "out20", lesson: 58, type: "out", max: 20, label: "Count out up to 20" },
  ],
  countItem(r, u, seed) {
    const icon = r.pick(["apple", "star", "duck", "fish", "ball", "flower", "leaf", "frog", "ladybug", "car"]);
    const n = r.int(Math.max(4, Math.floor(u.max / 2)), u.max);
    return touchCount(icon, n, u.arr, { seed });
  },
  oneMoreItem(r, max) {
    const icon = r.pick(["duck", "bird", "fish", "frog", "boat"]);
    const n = r.int(3, max - 1);
    return test(V.story(icon, n, { add: 1 }), `There were ${word(n)} ${plural(icon)}. One more came. How many now? Do not count. Just say the next number.`, Word(n + 1) + ".",
      fix(Word(n + 1) + ".", "How many now?", `One more is the next number. ${Word(n)}, ${word(n + 1)}. ${Word(n + 1)} comes after ${word(n)}.`), { skill: "add", item: `onemore:${n}` });
  },
  outItem(r, k, total) {
    const icon = r.pick(["star", "block", "ball", "apple", "leaf"]);
    return test(V.obj(icon, total, { tap: true, size: total > 10 ? "md" : "lg" }), `Touch ${word(k)} ${plural(icon, k)}. Stop at ${word(k)}.`, `(Touches ${word(k)}, counting, and stops.)`,
      fixPoint(`I count as I touch, and I stop at ${word(k)}. ${Chain(1, k)} Stop.`, `Touch ${word(k)} ${plural(icon, k)}. Stop at ${word(k)}.`),
      { skill: "count", item: `count-out:${k}`, confirm: `Yes, you stopped at ${word(k)}.` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.type === "onemore") {
      return {
        title: u.label,
        steps: [
          model(V.story("duck", 5, { add: 1 }), "My turn. There were five ducks. One more came. I do not need to count them all. One more is the next number. Five, six. Now there are six.", { do: "Point to the five, then to the new duck." }),
          model(V.story("bird", 7, { add: 1 }), "There were seven birds. One more came. Seven, eight. Now there are eight."),
          lead(V.story("fish", 3, { add: 1 }), "There were three fish. One more came. How many now? Say it with me.", "Four."),
          this.oneMoreItem(r, 9),
          this.oneMoreItem(r, 9),
          this.oneMoreItem(r, 10),
        ],
      };
    }
    if (u.type === "out") {
      const total = 20;
      return {
        title: u.label,
        steps: [
          model(V.obj("star", total, { tap: true, size: "md" }), "My turn to touch fourteen stars. I count as I touch. When I get to fourteen, I stop. (Touch and count to fourteen.) Stop. Fourteen.", { do: "Touch each star you count. Marks show which ones are counted." }),
          lead(V.obj("ball", total, { tap: true, size: "md" }), "Touch twelve balls with me. Stop at twelve. Get ready.", Chain(1, 12) + " Stop."),
          this.outItem(r, r.int(11, 16), total),
          this.outItem(r, r.int(15, 19), total),
          note(V.say(), "Now with real objects. Put twenty small objects in a pile. Say: Give me seventeen.", { do: "The child moves seventeen objects to you, one at a time, counting. Then ask: How many did you give me?", materials: true }),
        ],
        materials: "20 small objects, such as blocks, buttons, or beans",
      };
    }
    const icons = iconSeq(r, 4);
    const steps = [];
    const n1 = u.max;
    const screen = V.obj(icons[0], n1, { arr: u.arr, tap: true, seed: ctx.lesson, cols: u.arr === "array" ? 4 : undefined, start: u.arr === "circle", size: n1 > 10 ? "md" : "lg" });
    const how = {
      array: "These are in rows. I count across the top row, then the next row, then the next. I do not skip a row.",
      circle: "These are in a circle. I start at the one with the dot under it and go around. I stop when I get back to the start.",
      scatter: "These are mixed up. I touch each one so it gets a mark. A mark means I counted it.",
      row: n1 > 10 ? "There are a lot. I count the top row first, then the next row. I touch each one once." : "I touch each one once.",
    }[u.arr];
    steps.push(model(screen, `My turn. ${how} ${Chain(1, n1)} There are ${word(n1)} ${plural(icons[0])}.`, { do: "Touch each picture as you count. A ring marks each one." }));
    const n2 = r.int(Math.max(5, n1 - 4), n1);
    steps.push(lead(V.obj(icons[1], n2, { arr: u.arr, tap: true, seed: ctx.lesson + 1, cols: u.arr === "array" ? 4 : undefined, start: u.arr === "circle", size: n2 > 10 ? "md" : "lg" }), "Touch and count with me. Get ready.", Chain(1, n2)));
    steps.push(...touchCount(icons[2], r.int(Math.max(5, n1 - 5), n1), u.arr, { seed: ctx.lesson + 2 }));
    steps.push(...touchCount(icons[3], r.int(Math.max(5, n1 - 5), n1), u.arr, { seed: ctx.lesson + 3 }));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const counts = intro.filter((u) => u.type === "count");
    const steps = [];
    const u1 = favorNew(r, counts, 1)[0];
    steps.push(...this.countItem(r, u1, ctx.lesson));
    if (intro.some((u) => u.type === "onemore")) steps.push(this.oneMoreItem(r, 19));
    if (intro.some((u) => u.type === "out")) steps.push(this.outItem(r, r.int(8, 18), 20));
    else steps.push(...this.countItem(r, r.pick(counts), ctx.lesson + 1));
    return { title: "Counting objects", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.type === "onemore") return [this.oneMoreItem(r, 9), this.oneMoreItem(r, 15)];
    if (u.type === "out") return [this.outItem(r, r.int(12, 18), 20)];
    return this.countItem(r, u, 5);
  },
};

// ─────────────────────────────────────────────────────────────
// Reading numbers 0 to 20
// ─────────────────────────────────────────────────────────────

const K_NUMS = [
  { id: "r0to10", lesson: 1, ds: range(0, 10), label: "Read 0 to 10" },
  { id: "r11", lesson: 60, ds: [11], label: "Read 11" },
  { id: "r12", lesson: 62, ds: [12], label: "Read 12" },
  { id: "r13", lesson: 66, ds: [13], label: "Read 13" },
  { id: "r14", lesson: 70, ds: [14], label: "Read 14" },
  { id: "r15", lesson: 74, ds: [15], label: "Read 15" },
  { id: "r16", lesson: 78, ds: [16], label: "Read 16" },
  { id: "r17", lesson: 82, ds: [17], label: "Read 17" },
  { id: "r18", lesson: 86, ds: [18], label: "Read 18" },
  { id: "r19", lesson: 90, ds: [19], label: "Read 19" },
  { id: "r20", lesson: 94, ds: [20], label: "Read 20" },
];

const numerals = {
  id: "numerals",
  name: "Reading numbers",
  summary: "Read the numbers 0 to 20. The teen numbers are read as ten and some more: 14 is a one for one ten and a four for four ones.",
  standard: "K.CC.3",
  units: K_NUMS,
  pool(intro) {
    return intro.flatMap((u) => u.ds);
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    if (u.id === "r0to10") {
      const order = r.shuffle(range(0, 10));
      const steps = [
        model(V.num(7), "We will read numbers. My turn. This is seven.", { skill: "read" }),
        lead(V.num(3), "What number is this? Read it with me.", "Three.", { skill: "read" }),
      ];
      for (const d of order.slice(0, 5)) steps.push(readNum(d));
      steps.push(touchNum(6, [9, 0], r));
      steps.push(touchNum(2, [5, 7], r));
      return { title: u.label, steps };
    }
    const d = u.ds[0];
    const ones = d - 10;
    const how = d === 20 ? "Twenty is written with a two and a zero. The two means two tens." : d === 11 ? "Eleven is written with two ones. The first one means one ten. The next one means one more." : d === 12 ? "Twelve is written with a one and a two. The one means one ten. The two means two more." : `${Word(d)} is written with a one and a ${word(ones)}. The one means one ten. The ${word(ones)} means ${word(ones)} more. Ten and ${word(ones)} is ${word(d)}.`;
    const known = this.pool(intro).filter((x) => x !== d);
    const near = known.filter((x) => x >= 10);
    const steps = [
      model(V.num(d), `My turn. This is ${word(d)}. ${how}`, { skill: "read", do: "Touch each digit as you explain it." }),
      lead(V.num(d), "What number is this? Read it with me.", Word(d) + ".", { skill: "read" }),
      test(V.num(d), "Your turn. What number is this?", Word(d) + ".", fix(Word(d) + ".", "What number is this?"), { skill: "read", item: `read:${d}` }),
    ];
    if (ones >= 2 && ones <= 9) steps.push(readNum(ones));
    steps.push(touchNum(d, others(r, near.length >= 2 ? near : known, d, 2), r));
    steps.push(readNum(r.pick(near.length ? near : known)));
    steps.push(readNum(d));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const pool = this.pool(intro);
    const recent = pool.filter((x) => x >= 10);
    const picks = recent.length >= 2 ? [...favorNew(r, recent, 3), ...r.sample(pool, 2)] : r.sample(pool, 5);
    const steps = picks.map((d, i) => (i === 2 ? touchNum(d, others(r, pool, d, 2), r) : readNum(d)));
    return { title: "Read the numbers", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const pool = units.flatMap((u) => u.ds);
    const last = units[units.length - 1].ds;
    const picks = [last[0], ...r.sample(pool.filter((x) => x !== last[0]), 2)];
    return [readNum(picks[0]), readNum(picks[1]), touchNum(picks[2], others(r, pool, picks[2], 2), r)];
  },
};

// ─────────────────────────────────────────────────────────────
// Five-frames and ten-frames
// ─────────────────────────────────────────────────────────────

const frames = {
  id: "frames",
  name: "Five-frames and ten-frames",
  summary: "See amounts in five-frames and ten-frames at a glance: five and some more, a full ten, and how many boxes are empty.",
  standard: "K.OA.3, K.OA.4 (preparation)",
  units: [
    { id: "five", lesson: 6, label: "Five-frames" },
    { id: "ten", lesson: 16, label: "Ten-frames: a full frame is ten" },
    { id: "fivemore", lesson: 26, label: "Five and some more" },
    { id: "empty", lesson: 46, label: "How many empty boxes" },
  ],
  howMany(n, size, ms) {
    return test(V.frame(size, n), "Look. How many dots?", Word(n) + ".", fix(Word(n) + ".", "Look. How many dots?", n > 5 ? `The top row is five. ${Word(n - 5)} more makes ${word(n)}.` : ""), { skill: "subitize", flash: ms, item: `frame:${n}` });
  },
  emptyItem(n) {
    return test(V.frame(10, n), "How many boxes are empty?", Word(10 - n) + ".", fix(Word(10 - n) + ".", "How many boxes are empty?", `${Word(n)} ${n === 1 ? "box has a dot" : "boxes have dots"}. ${Word(10 - n)} ${10 - n === 1 ? "is" : "are"} empty. ${Word(n)} and ${word(10 - n)} make ten.`), { skill: "subitize", item: `empty:${n}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "five") {
      return {
        title: u.label, steps: [
          model(V.frame(5, 5), "This is a five-frame. It has five boxes. When every box has a dot, there are five. My turn. Five."),
          model(V.frame(5, 3), "Here, three boxes have dots. Two are empty. Three."),
          lead(V.frame(5, 4), "How many dots? Say it with me.", "Four.", { flash: 2000 }),
          ...r.seq([1, 2, 3, 4, 5], 4).map((n) => this.howMany(n, 5, 2000)),
        ],
      };
    }
    if (u.id === "ten") {
      return {
        title: u.label, steps: [
          model(V.frame(10, 10), "This is a ten-frame. It has two rows of five boxes. When every box has a dot, there are ten. My turn. Ten."),
          model(V.frame(10, 5), "The top row is full. That is five."),
          lead(V.frame(10, 10), "How many dots in a full ten-frame? Say it with me.", "Ten."),
          this.howMany(10, 10, 2000),
          this.howMany(5, 10, 2000),
          this.howMany(10, 10, 2000),
        ],
      };
    }
    if (u.id === "fivemore") {
      return {
        title: u.label, steps: [
          model(V.frame(10, 7), "My turn. The top row is five. The bottom row has two more. Five and two more is seven. I do not need to count them all."),
          model(V.frame(10, 9), "The top row is five. Four more. Five and four more is nine."),
          lead(V.frame(10, 6), "How many dots? Five and one more. Say it with me.", "Six."),
          ...r.seq([6, 7, 8, 9, 10], 4).map((n) => this.howMany(n, 10, 2500)),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.frame(10, 7), "My turn. Seven boxes have dots. Three boxes are empty. Seven and three make ten."),
        model(V.frame(10, 9), "Nine boxes have dots. One box is empty. Nine and one make ten."),
        lead(V.frame(10, 6), "How many boxes are empty? Say it with me.", "Four."),
        ...r.seq([5, 6, 7, 8, 9, 4], 4).map((n) => this.emptyItem(n)),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [];
    if (has("fivemore")) steps.push(...r.seq([6, 7, 8, 9, 10], 3).map((n) => this.howMany(n, 10, 2000)));
    else if (has("ten")) steps.push(...r.seq([5, 10, 4, 3], 3).map((n) => this.howMany(n, 10, 2000)));
    else steps.push(...r.seq([1, 2, 3, 4, 5], 3).map((n) => this.howMany(n, 5, 2000)));
    if (has("empty")) steps.push(this.emptyItem(r.int(4, 9)));
    return { title: "Frames", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "empty") return [this.emptyItem(r.int(5, 9)), this.emptyItem(r.int(2, 4))];
    if (u.id === "fivemore") return [this.howMany(r.int(6, 9), 10, 2000), this.howMany(r.int(6, 9), 10, 2000)];
    if (u.id === "ten") return [this.howMany(10, 10, 2000)];
    return [this.howMany(r.int(2, 5), 5, 2000)];
  },
};

// ─────────────────────────────────────────────────────────────
// Comparing groups and numbers
// ─────────────────────────────────────────────────────────────

const compare = {
  id: "compare",
  name: "Comparing",
  summary: "Compare groups by matching and by counting, and compare two numbers from 1 to 10: which is greater, which is less.",
  standard: "K.CC.6, K.CC.7",
  units: [
    { id: "match", lesson: 2, label: "Compare groups by matching" },
    { id: "count", lesson: 20, label: "Compare groups by counting" },
    { id: "greater", lesson: 42, label: "The greater number" },
    { id: "less", lesson: 54, label: "The number that is less" },
  ],
  countItem(r, fewer) {
    let a = r.int(2, 10), b = r.int(2, 10);
    while (Math.abs(a - b) < 1) b = r.int(2, 10);
    const icon = r.pick(["apple", "star", "fish", "duck", "car"]);
    const ans = fewer ? (a < b ? 0 : 1) : (a > b ? 0 : 1);
    const big = Math.max(a, b), small = Math.min(a, b);
    return [
      test(V.match(a, b, { icon, lines: false, spread: r.pick([0, 1, undefined]) }), "Count each row. How many on top? How many on the bottom?", `${Word(a)} on top. ${Word(b)} on the bottom.`,
        `My turn. (Touch and count each row.) ${Chain(1, a)} ${Word(a)} on top. ${Chain(1, b)} ${Word(b)} on the bottom. Say it with me: ${word(a)} on top, ${word(b)} on the bottom. Your turn. Count each row. How many on top? How many on the bottom?`,
        { skill: "count", item: `cmp-count:${a}:${b}`, confirm: `Yes, ${word(a)} on top and ${word(b)} on the bottom.` }),
      test(V.match(a, b, { icon, lines: false, tap: true, ans }), `Which row has ${fewer ? "fewer" : "more"}? Touch it.`, `(Touches the ${ans === 0 ? "top" : "bottom"} row.)`,
        fixPoint(fewer
          ? `${Word(small)} is less than ${word(big)}, because ${word(small)} comes first when we count. The row with ${word(small)} has fewer. (Touch the row with ${small}.)`
          : `${Word(big)} is more than ${word(small)}, because ${word(big)} comes later when we count. The row with ${word(big)} has more. (Touch the row with ${big}.)`, `Which row has ${fewer ? "fewer" : "more"}? Touch it.`),
        { skill: "compare", item: `cmp:${a}:${b}`, confirm: `Yes. That row has ${fewer ? "fewer" : "more"}.` }),
    ];
  },
  numItem(r, less) {
    let a = r.int(1, 10), b = r.int(1, 10);
    while (a === b) b = r.int(1, 10);
    const ansN = less ? Math.min(a, b) : Math.max(a, b);
    const opts = [a, b];
    const ask = less ? "Which number is less? Touch it." : "Which number is greater? Touch it.";
    const why = less ? `${Word(ansN)} comes first when we count, so ${word(ansN)} is less.` : `${Word(ansN)} comes later when we count, so ${word(ansN)} is greater.`;
    return test(V.choices(opts.map((x) => V.num(x)), opts.indexOf(ansN)), ask, `(Touches ${ansN}.)`, fixPoint(`${why} (Touch ${ansN}.)`, ask),
      { skill: "compare", item: `${less ? "less" : "greater"}:${a}:${b}`, confirm: `Yes, ${word(ansN)} is ${less ? "less" : "greater"}.` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "match") {
      const ex = prekCompare.newEx({ id: "fewer", max: 8 }, ctx);
      ex.steps.unshift(model(V.match(6, 4, { icon: "cookie" }), "We match to compare. Each cookie on top gets a partner. The top row has extras, so it has more. The bottom row has fewer."));
      ex.title = u.label;
      return ex;
    }
    if (u.id === "count") {
      return {
        title: u.label, steps: [
          model(V.match(7, 5, { icon: "star", lines: false, spread: 1 }), "My turn. These rows are not lined up, so I count. The top row has seven. The bottom row has five. Seven comes later when we count, so seven is more. The top row has more."),
          lead(V.match(4, 9, { icon: "fish", lines: false, tap: true, ans: 1 }), "Count with me. Top: four. Bottom: nine. Nine comes later, so nine is more. Touch the row with more.", "(Touches the bottom row.)"),
          ...this.countItem(r, false),
          ...this.countItem(r, true),
        ],
      };
    }
    if (u.id === "greater") {
      return {
        title: u.label, steps: [
          model(V.num([4, 7]), "My turn. Which number is greater, four or seven? I count: one, two, three, four, five, six, seven. Seven comes later. The number that comes later when we count is greater. Seven is greater than four.", { skill: "read" }),
          model(V.num([9, 6]), "Nine or six? Nine comes later when we count. Nine is greater.", { skill: "read" }),
          lead(V.choices([V.num(3), V.num(8)], 1), "Which number is greater? Touch it with me.", "(Touches 8.)"),
          this.numItem(r, false), this.numItem(r, false), this.numItem(r, false),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.num([5, 2]), "My turn. Which number is less, five or two? Two comes first when we count. The number that comes first is less. Two is less than five.", { skill: "read" }),
        lead(V.choices([V.num(9), V.num(4)], 1), "Which number is less? Touch it with me.", "(Touches 4.)"),
        this.numItem(r, true), this.numItem(r, false), this.numItem(r, true), this.numItem(r, true),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [];
    if (has("greater")) steps.push(this.numItem(r, has("less") && r() < 0.5), this.numItem(r, has("less") && r() < 0.5));
    if (has("count")) steps.push(...this.countItem(r, r() < 0.5));
    else steps.push(prekCompare.moreTest(r, 8, "cookie"), prekCompare.moreTest(r, 8, "star", { fewer: true }));
    return { title: "Comparing", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const has = (id) => units.some((u) => u.id === id);
    if (has("less")) return [this.numItem(r, true), this.numItem(r, false), this.numItem(r, true)];
    if (has("greater")) return [this.numItem(r, false), this.numItem(r, false)];
    if (has("count")) return [this.countItem(r, false)[1], this.countItem(r, true)[1]];
    return [prekCompare.moreTest(r, 8, "cookie"), prekCompare.moreTest(r, 8, "duck", { fewer: true })];
  },
};

// ─────────────────────────────────────────────────────────────
// Teen numbers: ten and some more
// ─────────────────────────────────────────────────────────────

const teens = {
  id: "teens",
  name: "Teen numbers",
  summary: "Build the numbers 11 to 19 as ten ones and some more ones, using two ten-frames, and say twenty as two tens.",
  standard: "K.NBT.1",
  units: [
    { id: "t11", lesson: 59, set: [11, 12, 13], label: "Ten and some more: 11 to 13" },
    { id: "t14", lesson: 67, set: [14, 15, 16], label: "Ten and some more: 14 to 16" },
    { id: "t17", lesson: 75, set: [17, 18, 19], label: "Ten and some more: 17 to 19" },
    { id: "t20", lesson: 83, set: [20], label: "Twenty is two tens" },
  ],
  pool(intro) { return intro.flatMap((u) => u.set); },
  tenAndItem(n) {
    const k = n - 10;
    return test(V.frame(10, n, { frames: 2 }), `How many in the full frame? (Ten.) How many more? (${Word(k)}.) Ten and ${word(k)} is how many?`, Word(n) + ".",
      fix(Word(n) + ".", `Ten and ${word(k)} is how many?`, `The full frame is ten. ${Word(k)} more. Ten and ${word(k)} is ${word(n)}.`), { skill: "teens", item: `tenand:${n}` });
  },
  splitItem(n) {
    const k = n - 10;
    return test(V.say(), `${Word(n)} is ten and how many more?`, Word(k) + ".", fix(Word(k) + ".", `${Word(n)} is ten and how many more?`, `${Word(n)} is ten and ${word(k)}.`), { skill: "teens", item: `teensplit:${n}` });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    if (u.id === "t20") {
      return {
        title: u.label, steps: [
          model(V.frame(10, 20, { frames: 2 }), "My turn. This frame is full. That is ten. This frame is full too. That is ten more. Ten and ten is twenty. Twenty is two tens."),
          lead(V.frame(10, 20, { frames: 2 }), "Ten and ten is how many? Say it with me.", "Twenty."),
          test(V.frame(10, 20, { frames: 2 }), "Your turn. Ten and ten is how many?", "Twenty.", fix("Twenty.", "Ten and ten is how many?"), { skill: "teens", item: "tenand:20" }),
          this.tenAndItem(r.pick(this.pool(intro).filter((x) => x < 20))),
          this.splitItem(r.pick(this.pool(intro).filter((x) => x < 20))),
        ],
      };
    }
    const [a, b, c] = u.set;
    return {
      title: u.label, steps: [
        model(V.frame(10, a, { frames: 2 }), `My turn. This frame is full. That is ten. Here ${isAre(a - 10)} ${word(a - 10)} more. Ten and ${word(a - 10)} is ${word(a)}.`, { do: "Sweep your hand over the full frame and say ten, then touch each extra dot." }),
        model(V.frame(10, b, { frames: 2 }), `Ten and ${word(b - 10)} is ${word(b)}.`),
        lead(V.frame(10, c, { frames: 2 }), `Ten and ${word(c - 10)} is how many? Say it with me.`, Word(c) + "."),
        this.tenAndItem(b),
        this.tenAndItem(a),
        this.tenAndItem(c),
        model(V.say(), `Now without the frames. ${Word(b)} is ten and ${word(b - 10)}.`),
        this.splitItem(a),
        this.splitItem(c),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const pool = this.pool(intro).filter((x) => x < 20);
    const picks = favorNew(r, pool, 3);
    return { title: "Teen numbers", steps: [this.tenAndItem(picks[0]), this.splitItem(picks[1]), this.tenAndItem(picks[2])] };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "t20") return [test(V.say(), "Ten and ten is how many?", "Twenty.", fix("Twenty.", "Ten and ten is how many?"), { skill: "teens", item: "tenand:20" }), this.splitItem(r.int(11, 19))];
    return [this.tenAndItem(r.pick(u.set)), this.splitItem(r.pick(u.set))];
  },
};

// ─────────────────────────────────────────────────────────────
// Adding
// ─────────────────────────────────────────────────────────────

function addScreen(a, b, icon, ans) {
  return [V.eq(a, "+", b, "=", ans === undefined ? "?" : ans), V.row(V.obj(icon, a, { size: "md" }), V.sign("+"), V.obj(icon, b, { size: "md" }))];
}

// The rule a child uses to work out a fact, said as part of the correction.
export function factHint(a, op, b) {
  if (op === "+") {
    const big = Math.max(a, b), small = Math.min(a, b);
    if (b === 0) return "Plus zero: the number stays the same.";
    if (a === 0) return `Zero plus a number is that number. Zero plus ${word(b)} is ${word(b)}.`;
    if (small === 1) return `Plus one is the next number. ${Word(big)}, ${word(big + 1)}. ${Word(big + 1)} comes after ${word(big)}.`;
    if (small === 2) return `Start with ${word(big)} and count on two: ${word(big + 1)}, ${word(big + 2)}.`;
    if (a === b) return `It is a double. ${Word(a)} plus ${word(a)} is ${word(2 * a)}.`;
    if (Math.abs(a - b) === 1) return `It is a double plus one. ${Word(small)} plus ${word(small)} is ${word(2 * small)}, and one more is ${word(2 * small + 1)}.`;
    if (big === 10) return `Ten plus a number is a teen number. Ten and ${word(small)} make ${word(10 + small)}.`;
    if (a + b > 10 && big >= 7) {
      const need = 10 - big, left = small - need;
      return `${Word(big)} needs ${word(need)} more to make ten. Take ${word(need)} from the ${word(small)}. ${Word(left)} ${left === 1 ? "is" : "are"} left. Ten plus ${word(left)} is ${word(10 + left)}.`;
    }
    if (a < b) return `Turn it around and start with the bigger number: ${word(b)}... ${chain(b + 1, a + b)}.`;
    return `Start with ${word(big)} and count on ${word(small)}: ${chain(big + 1, big + small)}.`;
  }
  const ans = a - b;
  if (b === 0) return "Minus zero: the number stays the same.";
  if (b === a) return "A number minus itself is zero.";
  if (b === 1) return `Minus one is the number before. ${Word(a - 1)} comes just before ${word(a)}.`;
  if (b === 2) return `Start at ${word(a)} and count back two: ${word(a - 1)}, ${word(a - 2)}.`;
  if (b === 10 && a === 20) return "Twenty is two tens. Take away one ten, and one ten is left. That is ten.";
  if (b === 10) return `${Word(a)} is ten and ${word(ans)}. Take away the ten. ${Word(ans)} ${ans === 1 ? "is" : "are"} left.`;
  if (a === 10) return `${Word(b)} and ${word(ans)} make ten.`;
  if (b === 9) return `Take away ten, then give one back. ${Word(a)} minus ten is ${word(a - 10)}, and one more is ${word(ans)}.`;
  return `Think of the family: ${word(b)} and what make ${word(a)}? ${Word(b)} and ${word(ans)}.`;
}

export function factStep(a, op, b, opts = {}) {
  const ans = op === "+" ? a + b : a - b;
  const opWord = op === "+" ? "plus" : "minus";
  return test(V.eq(a, op, b, "=", "?"), opts.say || `${Word(a)} ${opWord} ${word(b)} is how many?`, Word(ans) + ".",
    fix(Word(ans) + ".", `${Word(a)} ${opWord} ${word(b)} is how many?`, opts.preface !== undefined ? opts.preface : factHint(a, op === "+" ? "+" : "−", b)), {
      skill: op === "+" ? "add" : "subtract",
      item: `fact:${a}${op}${b}`,
      fact: `${a}${op === "+" ? "+" : "-"}${b}`,
    });
}

const addition = {
  id: "addition",
  name: "Adding",
  summary: "Add by putting groups together. The rule for plus one, the plus and equals signs, counting all, counting on from the first number, and plus zero.",
  standard: "K.OA.1, K.OA.2, K.OA.5",
  units: [
    { id: "plusone", lesson: 40, label: "Plus one is the next number" },
    { id: "equals", lesson: 45, label: "Reading plus problems with the equals sign" },
    { id: "countall", lesson: 52, max: 5, label: "Add by counting all, within 5" },
    { id: "countall10", lesson: 62, max: 10, label: "Add by counting all, within 10" },
    { id: "counton", lesson: 72, max: 10, label: "Count on from the first number" },
    { id: "pluszero", lesson: 84, max: 10, label: "Plus zero" },
    { id: "plustwo", lesson: 94, max: 10, label: "Plus two: count on two" },
  ],
  plusOneItem(r, max) {
    const a = r.int(1, max - 1);
    return test(V.eq(a, "+", 1, "=", "?"), `${Word(a)} plus one is how many?`, Word(a + 1) + ".",
      fix(Word(a + 1) + ".", `${Word(a)} plus one is how many?`, `Plus one is the next number. ${Word(a)}, ${word(a + 1)}. ${Word(a + 1)} comes after ${word(a)}.`), { skill: "add", item: `fact:${a}+1`, fact: `${a}+1` });
  },
  countAllItem(r, max) {
    const total = r.int(3, max);
    const a = r.int(1, total - 1), b = total - a;
    const icon = r.pick(["apple", "star", "ball", "duck", "fish"]);
    return [
      lead(addScreen(a, b, icon), `Read the problem with me. Get ready.`, `${Word(a)} plus ${word(b)} equals how many?`),
      test(addScreen(a, b, icon), "Count all the pictures. How many in all?", Word(total) + ".", fix(Word(total) + ".", "How many in all?", `I count them all: ${chain(1, total)}. The last number is ${word(total)}.`), { skill: "add", item: `countall:${a}+${b}` }),
      test(V.eq(a, "+", b, "=", "?"), `So ${word(a)} plus ${word(b)} equals how many?`, Word(total) + ".", fix(Word(total) + ".", `${Word(a)} plus ${word(b)} equals how many?`, `We counted ${word(total)} in all. So ${word(a)} plus ${word(b)} equals ${word(total)}.`), { skill: "add", item: `fact:${a}+${b}`, fact: `${a}+${b}` }),
    ];
  },
  countOnItem(r, b) {
    const a = r.int(3, 8);
    const ans = a + b;
    return test([V.eq(a, "+", b, "=", "?"), V.row(V.obj("star", b, { size: "sm" }))], `${Word(a)} plus ${word(b)}. Start with ${word(a)} and count on ${word(b)}. How many?`, `${cap(word(a))}... ${chain(a + 1, ans)}. ${Word(ans)}.`,
      fix(`${cap(word(a))}... ${chain(a + 1, ans)}. ${Word(ans)}.`, `${Word(a)} plus ${word(b)}. How many?`, `Get ${word(a)} going, then count one more for each star.`), { skill: "add", item: `fact:${a}+${b}`, fact: `${a}+${b}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "plusone") {
      return {
        title: u.label, steps: [
          model(V.sign("+"), "This sign is plus. Plus means we put more with it, so we get more.", { do: "Touch the sign." }),
          model([V.eq(4, "+", 1), V.row(V.obj("duck", 4, { size: "md" }), V.sign("+"), V.obj("duck", 1, { size: "md" }))], "Here is a rule. Listen. Plus one is the next number. My turn. Four plus one. The number after four is five. Four plus one is five."),
          lead(V.eq(6, "+", 1, "=", "?"), "Say the rule with me. Plus one is the next number. Six plus one is how many?", "Seven."),
          lead(V.eq(2, "+", 1, "=", "?"), "Again. Two plus one is how many?", "Three."),
          this.plusOneItem(r, 9), this.plusOneItem(r, 9), this.plusOneItem(r, 9), this.plusOneItem(r, numMax(ctx)),
        ],
      };
    }
    if (u.id === "equals") {
      return {
        title: u.label, steps: [
          model(V.eq(3, "+", 1, "=", 4), "This sign is equals. Equals means \"is the same as.\" My turn to read this. Three plus one equals four.", { do: "Touch each part as you read it." }),
          model(V.eq(5, "+", 1, "=", "?"), "This box means how many. I read it: five plus one equals how many? Five plus one is six. Five plus one equals six."),
          lead(V.eq(7, "+", 1, "=", "?"), "Read it with me. Get ready.", "Seven plus one equals how many?"),
          lead(V.eq(7, "+", 1, "=", "?"), "Seven plus one equals how many?", "Eight."),
          test(V.eq(2, "+", 1, "=", "?"), "Your turn. Read the problem.", "Two plus one equals how many?", fix("Two plus one equals how many?", "Read the problem."), { skill: "read", item: "read-eq:2+1", confirm: "Yes." }),
          this.plusOneItem(r, 9),
          test(V.eq(8, "+", 1, "=", "?"), "Read the problem.", "Eight plus one equals how many?", fix("Eight plus one equals how many?", "Read the problem."), { skill: "read", item: "read-eq:8+1", confirm: "Yes." }),
          this.plusOneItem(r, 9),
        ],
      };
    }
    if (u.id === "countall" || u.id === "countall10") {
      const a = u.max === 5 ? 2 : 4, b = u.max === 5 ? 3 : 5;
      return {
        title: u.label, steps: [
          model(addScreen(a, b, "apple"), `My turn. ${Word(a)} plus ${word(b)} equals how many? Here are ${word(a)} apples. Plus ${word(b)} more apples. I count them all. ${Chain(1, a + b)} ${Word(a)} plus ${word(b)} equals ${word(a + b)}.`, { do: "Touch each apple as you count them all." }),
          ...this.countAllItem(r, u.max),
          ...this.countAllItem(r, u.max).slice(1),
        ],
      };
    }
    if (u.id === "counton") {
      return {
        title: u.label, steps: [
          model([V.eq(5, "+", 3, "=", "?"), V.row(V.obj("star", 3, { size: "sm" }))], "Here is a faster way to add. Start with the first number, and count on for the second number. My turn. Five plus three. I get five going: fiiive. Then I count three more, one for each star: six, seven, eight. Five plus three is eight.", { do: "Hold the first number long. Touch one star for each number you count on." }),
          lead([V.eq(6, "+", 2, "=", "?"), V.row(V.obj("star", 2, { size: "sm" }))], "Do it with me. Six plus two. Get six going. Count on two.", "Siiix... seven, eight. Eight."),
          this.countOnItem(r, 2), this.countOnItem(r, 3), this.countOnItem(r, 2), this.countOnItem(r, 3),
        ],
      };
    }
    if (u.id === "pluszero") {
      return {
        title: u.label, steps: [
          model([V.eq(6, "+", 0, "=", "?"), V.row(V.obj("ball", 6, { size: "md" }))], "Here is a rule. Plus zero means we get no more. The number stays the same. My turn. Six plus zero is six."),
          lead(V.eq(9, "+", 0, "=", "?"), "Say the rule with me. Plus zero, the number stays the same. Nine plus zero is how many?", "Nine."),
          factStep(4, "+", 0), factStep(7, "+", 0), this.plusOneItem(r, 9), factStep(r.int(1, 10), "+", 0),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model([V.eq(6, "+", 2, "=", "?")], "Plus two means count on two. My turn. Six plus two. Siiix... seven, eight. Six plus two is eight."),
        lead(V.eq(3, "+", 2, "=", "?"), "Do it with me. Three plus two. Get three going and count on two.", "Threee... four, five. Five."),
        factStep(r.int(2, 8), "+", 2), factStep(r.int(2, 8), "+", 2), this.plusOneItem(r, 9), factStep(r.int(2, 8), "+", 2),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [];
    if (has("countall10") && !has("counton")) steps.push(...this.countAllItem(r, 10).slice(1));
    else if (has("countall") && !has("counton")) steps.push(...this.countAllItem(r, 5).slice(1));
    if (has("counton")) steps.push(this.countOnItem(r, r.int(2, 3)), this.countOnItem(r, r.int(2, 3)));
    steps.push(this.plusOneItem(r, numMax(ctx)));
    if (has("pluszero")) steps.push(factStep(r.int(1, 10), "+", 0));
    if (has("plustwo")) steps.push(factStep(r.int(1, 8), "+", 2));
    return { title: "Adding", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "plusone" || u.id === "equals") return [this.plusOneItem(r, 9), this.plusOneItem(r, numMax(ctx))];
    if (u.id === "countall" || u.id === "countall10") return this.countAllItem(r, u.max).slice(1);
    if (u.id === "counton") return [this.countOnItem(r, 2), this.countOnItem(r, 3)];
    if (u.id === "pluszero") return [factStep(r.int(1, 9), "+", 0), this.plusOneItem(r, 9)];
    return [factStep(r.int(2, 8), "+", 2), factStep(r.int(2, 8), "+", 2)];
  },
};

// ─────────────────────────────────────────────────────────────
// Subtracting
// ─────────────────────────────────────────────────────────────

function subScreen(a, b, icon) {
  return [V.eq(a, "−", b, "=", "?"), V.obj(icon, a, { cross: b, size: "md" })];
}

const subtraction = {
  id: "subtraction",
  name: "Subtracting",
  summary: "Subtract by taking away. The minus sign, the rule for minus one, taking away within 10, counting back two, and minus zero.",
  standard: "K.OA.1, K.OA.2, K.OA.5",
  units: [
    { id: "takeaway", lesson: 76, max: 5, label: "Take away, within 5" },
    { id: "minusone", lesson: 88, label: "Minus one is the number before" },
    { id: "takeaway10", lesson: 98, max: 10, label: "Take away, within 10" },
    { id: "countback", lesson: 108, label: "Minus two: count back two" },
    { id: "minuszero", lesson: 118, label: "Minus zero and minus the same number" },
  ],
  takeItem(r, max) {
    const a = r.int(3, max), b = r.int(1, a - 1);
    const icon = r.pick(["apple", "cookie", "fish", "bird", "star"]);
    return [
      lead(subScreen(a, b, icon), "Read the problem with me. Get ready.", `${Word(a)} minus ${word(b)} equals how many?`),
      test(subScreen(a, b, icon), `${Word(b)} ${b === 1 ? "is" : "are"} crossed out. Count the ones that are left.`, Chain(1, a - b), fixChain(Chain(1, a - b), "Count the ones that are left."), { skill: "subtract", item: `takeleft:${a}-${b}` }),
      test(V.eq(a, "−", b, "=", "?"), `So ${word(a)} minus ${word(b)} equals how many?`, Word(a - b) + ".", fix(Word(a - b) + ".", `${Word(a)} minus ${word(b)} equals how many?`, `We counted ${word(a - b)} left. So ${word(a)} minus ${word(b)} equals ${word(a - b)}.`), { skill: "subtract", item: `fact:${a}-${b}`, fact: `${a}-${b}` }),
    ];
  },
  minusOneItem(r, max) {
    const a = r.int(2, max);
    return test(V.eq(a, "−", 1, "=", "?"), `${Word(a)} minus one is how many?`, Word(a - 1) + ".", fix(Word(a - 1) + ".", `${Word(a)} minus one is how many?`, `Minus one is the number before. ${Word(a - 1)} comes just before ${word(a)}.`), { skill: "subtract", item: `fact:${a}-1`, fact: `${a}-1` });
  },
  countBackItem(r) {
    const a = r.int(4, 10);
    return test(V.eq(a, "−", 2, "=", "?"), `${Word(a)} minus two. Start at ${word(a)} and count back two. How many?`, `${cap(word(a))}... ${word(a - 1)}, ${word(a - 2)}. ${Word(a - 2)}.`,
      fix(`${cap(word(a))}... ${word(a - 1)}, ${word(a - 2)}. ${Word(a - 2)}.`, `${Word(a)} minus two. How many?`, `Start at ${word(a)} and count back two.`), { skill: "subtract", item: `fact:${a}-2`, fact: `${a}-2` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "takeaway" || u.id === "takeaway10") {
      const steps = [];
      if (u.id === "takeaway") {
        steps.push(model(V.sign("−"), "This sign is minus. Minus means take away, so we end up with fewer.", { do: "Touch the sign." }));
      }
      const a = u.max === 5 ? 5 : 9, b = u.max === 5 ? 2 : 4;
      steps.push(model(subScreen(a, b, "apple"), `My turn. ${Word(a)} minus ${word(b)} equals how many? There were ${word(a)} apples. ${Word(b)} are taken away. They are crossed out. I count the apples that are left. ${Chain(1, a - b)} ${Word(a)} minus ${word(b)} equals ${word(a - b)}.`, { do: "Point to the crossed-out apples, then touch and count the rest." }));
      steps.push(...this.takeItem(r, u.max), ...this.takeItem(r, u.max).slice(1));
      return { title: u.label, steps };
    }
    if (u.id === "minusone") {
      return {
        title: u.label, steps: [
          model(V.eq(6, "−", 1, "=", "?"), "Here is a rule. Minus one is the number before. My turn. Six minus one. The number before six is five. Six minus one is five."),
          lead(V.eq(4, "−", 1, "=", "?"), "Say the rule with me. Minus one is the number before. Four minus one is how many?", "Three."),
          this.minusOneItem(r, 10), this.minusOneItem(r, 10), this.minusOneItem(r, 10), this.minusOneItem(r, numMax(ctx)),
        ],
      };
    }
    if (u.id === "countback") {
      return {
        title: u.label, steps: [
          model(V.eq(8, "−", 2, "=", "?"), "Minus two means count back two. My turn. Eight minus two. Start at eight and count back two: seven, six. Eight minus two is six.", { do: "Fold down one finger for each number you count back." }),
          lead(V.eq(5, "−", 2, "=", "?"), "Do it with me. Five minus two. Start at five, count back two.", "Five... four, three. Three."),
          this.countBackItem(r), this.countBackItem(r), this.minusOneItem(r, 10), this.countBackItem(r),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.eq(7, "−", 0, "=", "?"), "Here is a rule. Minus zero means we take away nothing. The number stays the same. Seven minus zero is seven."),
        model(V.eq(7, "−", 7, "=", "?"), "Here is another rule. When we take away all of them, none are left. Seven minus seven is zero."),
        lead(V.eq(5, "−", 0, "=", "?"), "Five minus zero is how many? Say it with me.", "Five."),
        lead(V.eq(5, "−", 5, "=", "?"), "Five minus five is how many? Say it with me.", "Zero."),
        factStep(9, "−", 0), factStep(4, "−", 4), factStep(r.int(1, 8), "−", 0), factStep(6, "−", 6),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [];
    steps.push(...this.takeItem(r, has("takeaway10") ? 10 : 5).slice(1));
    if (has("minusone")) steps.push(this.minusOneItem(r, 10));
    if (has("countback")) steps.push(this.countBackItem(r));
    if (has("minuszero")) steps.push(r() < 0.5 ? factStep(r.int(1, 9), "−", 0) : (() => { const n = r.int(2, 9); return factStep(n, "−", n); })());
    return { title: "Subtracting", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "takeaway" || u.id === "takeaway10") return this.takeItem(r, u.max).slice(2).concat(this.takeItem(r, u.max).slice(2));
    if (u.id === "minusone") return [this.minusOneItem(r, 10), this.minusOneItem(r, 10)];
    if (u.id === "countback") return [this.countBackItem(r), this.countBackItem(r)];
    const n = r.int(2, 9);
    return [factStep(r.int(1, 9), "−", 0), factStep(n, "−", n)];
  },
};

// ─────────────────────────────────────────────────────────────
// Ways to make a number (number pairs)
// ─────────────────────────────────────────────────────────────

const pairs = {
  id: "pairs",
  name: "Ways to make a number",
  summary: "Break numbers up to 10 into two parts in more than one way, and find the number that goes with any number to make 10.",
  standard: "K.OA.3, K.OA.4",
  units: [
    { id: "p3", lesson: 56, ns: [3, 4], label: "Ways to make 3 and 4" },
    { id: "p5", lesson: 64, ns: [5], label: "Ways to make 5" },
    { id: "p6", lesson: 80, ns: [6, 7], label: "Ways to make 6 and 7" },
    { id: "p8", lesson: 92, ns: [8, 9], label: "Ways to make 8 and 9" },
    { id: "p10", lesson: 100, ns: [10], label: "Ways to make 10" },
    { id: "partner", lesson: 110, ns: [10], label: "The partner that makes 10" },
  ],
  splitVis(n, a) {
    return n <= 5 ? V.frame(5, a, { n2: n - a }) : V.frame(10, a, { n2: n - a });
  },
  partItem(r, n) {
    const a = r.int(1, n - 1);
    return test(this.splitVis(n, a), `${Word(n)} is ${word(a)} and how many more?`, Word(n - a) + ".",
      fix(Word(n - a) + ".", `${Word(n)} is ${word(a)} and how many more?`, `Look: ${word(a)} blue and ${word(n - a)} red make ${word(n)}.`), { skill: "pairs", item: `part:${n}:${a}` });
  },
  partnerItem(r) {
    const a = r.int(1, 9);
    return test(V.frame(10, a), `${Word(a)} and how many make ten?`, Word(10 - a) + ".",
      fix(Word(10 - a) + ".", `${Word(a)} and how many make ten?`, `Look at the empty boxes. ${Word(a)} and ${word(10 - a)} make ten.`), { skill: "pairs", item: `partner:${a}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "partner") {
      return {
        title: u.label, steps: [
          model(V.frame(10, 6), "Every number has a partner that makes ten. My turn. Six and four make ten. I can see it: six dots and four empty boxes.", { do: "Point to the dots, then to the empty boxes." }),
          model(V.frame(10, 8), "Eight and two make ten."),
          lead(V.frame(10, 3), "Three and how many make ten? Say it with me.", "Seven."),
          this.partnerItem(r), this.partnerItem(r), this.partnerItem(r), this.partnerItem(r),
          test(V.say(), "No frame this time. Five and how many make ten?", "Five.", fix("Five.", "Five and how many make ten?", "Five and five make ten."), { skill: "pairs", item: "partner:5" }),
        ],
      };
    }
    const n = u.ns[u.ns.length - 1];
    const ways = range(1, n - 1);
    const steps = [
      model(this.splitVis(n, 1), `My turn. Here are ${word(n)} dots. Some are blue and some are red. ${Word(n)} is one and ${word(n - 1)}.`),
      model(this.splitVis(n, Math.floor(n / 2)), `${Word(n)} is also ${word(Math.floor(n / 2))} and ${word(n - Math.floor(n / 2))}. There is more than one way to make ${word(n)}.`),
      lead(this.splitVis(n, n - 1), `${Word(n)} is ${word(n - 1)} and how many more? Say it with me.`, "One."),
    ];
    for (const m of u.ns) for (let i = 0; i < 2; i++) steps.push(this.partItem(r, m));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const ns = intro.flatMap((u) => u.ns);
    const steps = favorNew(r, ns, 3).map((n) => this.partItem(r, n));
    if (intro.some((u) => u.id === "partner")) steps.push(this.partnerItem(r));
    return { title: "Ways to make a number", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "partner") return [this.partnerItem(r), this.partnerItem(r)];
    return [this.partItem(r, r.pick(u.ns)), this.partItem(r, r.pick(u.ns))];
  },
};

// ─────────────────────────────────────────────────────────────
// Number families
// ─────────────────────────────────────────────────────────────

export const families = {
  id: "families",
  name: "Number families",
  summary: "Three numbers that go together: two small numbers and the big number they make. When the big number is missing, add. When a small number is missing, subtract.",
  standard: "K.OA.1 to K.OA.5; the number-family device used in Engelmann's Connecting Math Concepts",
  units: [
    { id: "intro", lesson: 102, max: 10, label: "What a number family is" },
    { id: "big", lesson: 106, max: 10, label: "The big number is missing: add" },
    { id: "small", lesson: 114, max: 10, label: "A small number is missing: subtract" },
  ],
  fam(r, max) {
    const c = r.int(3, max), a = r.int(1, c - 1);
    return [a, c - a, c];
  },
  partsItem(r, max) {
    const [a, b, c] = this.fam(r, max);
    return test(V.family(a, b, c), "What is the big number?", Word(c) + ".", fix(Word(c) + ".", "What is the big number?", "The big number is at the end of the arrow."), { skill: "family", item: `fam-big:${a}:${b}` });
  },
  bigItem(r, max) {
    const [a, b, c] = this.fam(r, max);
    return [
      test(V.family(a, b, c, "c"), "Is the big number missing? (Yes.) So do we add or subtract?", "Add.", fix("Add.", "Do we add or subtract?", "When the big number is missing, we add the small numbers."), { skill: "family", item: "fam-op-add" }),
      test([V.family(a, b, c, "c"), V.eq(a, "+", b, "=", "?")], `${Word(a)} plus ${word(b)} equals how many?`, Word(c) + ".", fix(Word(c) + ".", `${Word(a)} plus ${word(b)} equals how many?`, `The big number is missing, so we add. ${Word(a)} plus ${word(b)} equals ${word(c)}.`), { skill: "add", item: `fact:${a}+${b}`, fact: `${a}+${b}` }),
    ];
  },
  smallItem(r, max) {
    const [a, b, c] = this.fam(r, max);
    const missA = r() < 0.5;
    const known = missA ? b : a, ans = missA ? a : b;
    return [
      test(V.family(a, b, c, missA ? "a" : "b"), "Is the big number missing? (No.) A small number is missing. So do we add or subtract?", "Subtract.", fix("Subtract.", "Do we add or subtract?", "When a small number is missing, we start with the big number and subtract."), { skill: "family", item: "fam-op-sub" }),
      test([V.family(a, b, c, missA ? "a" : "b"), V.eq(c, "−", known, "=", "?")], `${Word(c)} minus ${word(known)} equals how many?`, Word(ans) + ".", fix(Word(ans) + ".", `${Word(c)} minus ${word(known)} equals how many?`, `A small number is missing, so we start with the big number and subtract. ${Word(c)} minus ${word(known)} equals ${word(ans)}.`), { skill: "subtract", item: `fact:${c}-${known}`, fact: `${c}-${known}` }),
    ];
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "intro") {
      return {
        title: u.label, steps: [
          model(V.family(3, 4, 7), "This is a number family. It has three numbers. The two small numbers are on the arrow: three and four. The big number is at the end of the arrow: seven. Three and four make seven.", { do: "Touch each small number, then slide your finger along the arrow to the big number." }),
          model(V.family(2, 6, 8), "In this family, the small numbers are two and six. The big number is eight."),
          lead(V.family(5, 1, 6), "What is the big number? Say it with me.", "Six."),
          lead(V.family(5, 1, 6), "What are the small numbers? Say them with me.", "Five and one."),
          this.partsItem(r, 10), this.partsItem(r, 10),
          test(V.family(4, 2, 6), "What are the small numbers?", "Four and two.", fix("Four and two.", "What are the small numbers?", "The small numbers are on the arrow."), { skill: "family", item: "fam-small" }),
        ],
      };
    }
    if (u.id === "big") {
      return {
        title: u.label, steps: [
          model([V.family(3, 5, 8, "c"), V.eq(3, "+", 5, "=", "?")], "Here is a rule. When the big number is missing, we add the small numbers. My turn. The big number is missing, so I add. Three plus five equals eight. The big number is eight."),
          lead(V.family(2, 4, 6, "c"), "The big number is missing, so we add. Two plus four equals how many? Say it with me.", "Six."),
          ...this.bigItem(r, 10), ...this.bigItem(r, 10),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model([V.family(3, 4, 7, "b"), V.eq(7, "−", 3, "=", "?")], "Here is a rule. When a small number is missing, we start with the big number and subtract the small number we know. My turn. A small number is missing, so I subtract. Seven minus three equals four. The missing small number is four."),
        lead(V.family(2, 6, 8, "b"), "A small number is missing. So we subtract. Start with the big number. Eight minus two equals how many? Say it with me.", "Six."),
        ...this.smallItem(r, 10), ...this.smallItem(r, 10),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [this.partsItem(r, 10)];
    if (has("big")) steps.push(...this.bigItem(r, 10));
    if (has("small")) steps.push(...this.smallItem(r, 10));
    return { title: "Number families", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "small") return [this.smallItem(r, 10)[1], this.bigItem(r, 10)[1]];
    if (u.id === "big") return this.bigItem(r, 10);
    return [this.partsItem(r, 10)];
  },
};

// ─────────────────────────────────────────────────────────────
// Story problems
// ─────────────────────────────────────────────────────────────

const PLACES = {
  duck: "in the pond", bird: "in the tree", fish: "in the tank", frog: "on the log", apple: "in the basket",
  cookie: "on the plate", ball: "in the box", car: "in the lot", boat: "at the dock", ladybug: "on the leaf", flower: "in the vase",
};

const stories = {
  id: "stories",
  name: "Story problems",
  summary: "Solve spoken story problems within 10: some are added, some are taken away, two groups are put together, or a group is split into two parts.",
  standard: "K.OA.1, K.OA.2",
  units: [
    { id: "addto", lesson: 68, label: "Some more come" },
    { id: "takefrom", lesson: 90, label: "Some go away" },
    { id: "together", lesson: 104, label: "Two groups put together" },
    { id: "apart", lesson: 120, label: "A group in two parts" },
    { id: "sentence", lesson: 128, label: "Say the number problem for a story" },
  ],
  addItem(r, withEq) {
    const icon = r.pick(["duck", "bird", "fish", "frog", "boat", "ladybug"]);
    const total = r.int(4, 10), b = r.int(1, Math.min(4, total - 1)), a = total - b;
    const verb = b === 1 ? "comes" : "come";
    const say = `Listen. ${Word(a)} ${plural(icon, a)} ${isAre(a)} ${PLACES[icon]}. ${Word(b)} more ${verb}. How many ${plural(icon)} are there now?`;
    const steps = [test(V.story(icon, a, { add: b }), say, Word(total) + ".", fix(Word(total) + ".", `How many ${plural(icon)} are there now?`, `More came, so I count them all: ${chain(1, total)}. There are ${word(total)} ${plural(icon)} now.`), { skill: "story", item: `story-add:${a}+${b}` })];
    if (withEq) steps.push(test(V.story(icon, a, { add: b }), "Say the number problem.", `${Word(a)} plus ${word(b)} equals ${word(total)}.`, fix(`${Word(a)} plus ${word(b)} equals ${word(total)}.`, "Say the number problem.", "More came, so it is a plus problem."), { skill: "story", item: "story-eq-add" }));
    return steps;
  },
  takeItem(r, withEq) {
    const icon = r.pick(["bird", "duck", "fish", "frog", "cookie", "apple", "boat"]);
    const a = r.int(4, 10), b = r.int(1, Math.min(4, a - 1));
    const v = TAKE_VERBS[icon] || ["goes away", "go away"];
    const say = `Listen. There are ${word(a)} ${plural(icon, a)}. ${Word(b)} ${b === 1 ? v[0] : v[1]}. How many ${plural(icon)} are left?`;
    const steps = [test(V.story(icon, a, { take: b }), say, Word(a - b) + ".", fix(Word(a - b) + ".", `How many ${plural(icon)} are left?`, `I count the ones that are not crossed out: ${chain(1, a - b)}. ${Word(a - b)} ${isAre(a - b)} left.`), { skill: "story", item: `story-take:${a}-${b}` })];
    if (withEq) steps.push(test(V.story(icon, a, { take: b }), "Say the number problem.", `${Word(a)} minus ${word(b)} equals ${word(a - b)}.`, fix(`${Word(a)} minus ${word(b)} equals ${word(a - b)}.`, "Say the number problem.", "Some are gone, so it is a minus problem."), { skill: "story", item: "story-eq-sub" }));
    return steps;
  },
  togetherItem(r) {
    const pairs2 = [["red", "green", "apple"], ["big", "small", "fish"], ["yellow", "blue", "ball"]];
    const [c1, c2, icon] = r.pick(pairs2);
    const a = r.int(1, 6), b = r.int(1, 10 - a);
    return test(V.row(V.obj(icon, a, { size: "md" }), V.obj(icon, b, { size: "md" })), `Listen. There are ${word(a)} ${c1} ${plural(icon, a)} and ${word(b)} ${c2} ${plural(icon, b)}. How many ${plural(icon)} are there in all?`, Word(a + b) + ".",
      fix(Word(a + b) + ".", `How many ${plural(icon)} are there in all?`, `We put the two groups together. ${Word(a)} plus ${word(b)} equals ${word(a + b)}.`), { skill: "story", item: `story-tog:${a}+${b}` });
  },
  apartItem(r) {
    const c = r.int(4, 10), a = r.int(1, c - 1);
    const rest = c - a;
    return test(V.frame(10, a, { n2: rest }), `Listen. There are ${word(c)} balloons. ${Word(a)} ${isAre(a)} blue. The rest are red. How many are red?`, Word(rest) + ".",
      fix(Word(rest) + ".", "How many are red?", `${Word(c)} balloons in all. ${Word(a)} ${isAre(a)} blue. ${Word(c)} minus ${word(a)} equals ${word(rest)}, so ${word(rest)} ${isAre(rest)} red. You can count the red ones to check.`), { skill: "story", item: `story-apart:${c}:${a}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "addto") {
      return {
        title: u.label, steps: [
          model(V.story("frog", 3, { add: 2 }), "Listen to a story. Three frogs are on the log. Two more come. How many frogs are there now? My turn. More frogs came, so there are more now. I count them all. One, two, three, four, five. There are five frogs now."),
          lead(V.story("duck", 4, { add: 1 }), "Four ducks are in the pond. One more comes. How many ducks now? Count them all with me.", "One, two, three, four, five. Five."),
          ...this.addItem(r), ...this.addItem(r),
        ],
      };
    }
    if (u.id === "takefrom") {
      return {
        title: u.label, steps: [
          model(V.story("bird", 6, { take: 2 }), "Listen. There are six birds. Two fly away. How many birds are left? My turn. Some went away, so there are fewer now. The ones that flew away are crossed out. I count the rest. One, two, three, four. Four birds are left."),
          lead(V.story("cookie", 5, { take: 1 }), "There are five cookies. One is eaten. How many are left? Count the rest with me.", "One, two, three, four. Four."),
          ...this.takeItem(r), ...this.addItem(r), ...this.takeItem(r),
        ],
      };
    }
    if (u.id === "together") {
      return {
        title: u.label, steps: [
          model(V.row(V.obj("apple", 3, { size: "md" }), V.obj("apple", 2, { size: "md" })), "Listen. There are three red apples and two green apples. How many apples are there in all? My turn. In all means put them together. Three plus two equals five. There are five apples in all."),
          lead(V.row(V.obj("fish", 4, { size: "md" }), V.obj("fish", 4, { size: "md" })), "Four big fish and four small fish. How many fish in all? Four plus four. Say it with me.", "Eight."),
          this.togetherItem(r), this.togetherItem(r), ...this.takeItem(r),
        ],
      };
    }
    if (u.id === "apart") {
      return {
        title: u.label, steps: [
          model(V.frame(10, 3, { n2: 4 }), "Listen. There are seven balloons. Three are blue. The rest are red. How many are red? My turn. Seven in all. Three are blue. Seven minus three equals four. Four are red. I can count the red ones to check: one, two, three, four."),
          lead(V.frame(10, 5, { n2: 3 }), "Eight balloons. Five are blue. The rest are red. How many are red? Eight minus five. Say it with me.", "Three."),
          this.apartItem(r), this.apartItem(r), this.togetherItem(r),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.story("bird", 4, { add: 3 }), "Listen. Four birds are in the tree. Three more come. My turn to say the number problem. More came, so it is a plus problem. Four plus three equals seven."),
        model(V.story("apple", 6, { take: 2 }), "Six apples. Two are eaten. Some are gone, so it is a minus problem. Six minus two equals four."),
        lead(V.story("duck", 5, { add: 2 }), "Five ducks. Two more come. Say the number problem with me.", "Five plus two equals seven."),
        ...this.addItem(r, true), ...this.takeItem(r, true),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const eq = has("sentence");
    const steps = [...this.addItem(r, eq)];
    if (has("takefrom")) steps.push(...this.takeItem(r, eq));
    if (has("together") && r() < 0.6) steps.push(this.togetherItem(r));
    if (has("apart") && r() < 0.6) steps.push(this.apartItem(r));
    return { title: "Story problems", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "addto") return this.addItem(r);
    if (u.id === "takefrom") return this.takeItem(r);
    if (u.id === "together") return [this.togetherItem(r)];
    if (u.id === "apart") return [this.apartItem(r)];
    return [this.addItem(r, true)[1], this.takeItem(r, true)[1]];
  },
};

// ─────────────────────────────────────────────────────────────
// Measuring and sorting
// ─────────────────────────────────────────────────────────────

const measure = {
  id: "measure",
  name: "Measuring and sorting",
  summary: "Compare two objects by length, height, weight, and how much they hold; sort objects into groups and count each group.",
  standard: "K.MD.1, K.MD.2, K.MD.3",
  units: [
    { id: "longer", lesson: 9, kind: "long", label: "Longer and shorter" },
    { id: "taller", lesson: 14, kind: "tall", label: "Taller and shorter" },
    { id: "heavier", lesson: 25, kind: "heavy", label: "Heavier and lighter" },
    { id: "holds", lesson: 35, kind: "holds", label: "Holds more and holds less" },
    { id: "sort", lesson: 48, kind: "sort", label: "Sort and count each group" },
    { id: "most", lesson: 57, kind: "most", label: "Which group has the most" },
  ],
  pairTest(r, kind) {
    if (kind === "holds") {
      const bigFirst = r() < 0.5;
      const want = r() < 0.5 ? "more" : "less";
      const ans = (want === "more") === bigFirst ? 0 : 1;
      return test(V.size("big", bigFirst ? [1, 0.55] : [0.55, 1], { icon: "cup", tap: true, ans, holds: true }), `Touch the cup that holds ${want}.`, `(Touches the ${want === "more" ? "bigger" : "smaller"} cup.)`,
        fixPoint(`The bigger cup holds more water. The smaller cup holds less. (Touch the one that holds ${want}.)`, `Touch the cup that holds ${want}.`), { skill: "measure", item: `holds:${want}`, confirm: `Yes, that cup holds ${want}.` });
    }
    const words = { long: ["longer", "shorter", "stick"], tall: ["taller", "shorter", "tower"], heavy: ["heavier", "lighter", null] }[kind];
    const want = r() < 0.5 ? 0 : 1;
    const flip = r() < 0.5;
    const bigIndex = flip ? 1 : 0;
    const ans = want === 0 ? bigIndex : 1 - bigIndex;
    const items = flip ? [0.5, 1] : [1, 0.5];
    const vis = kind === "heavy"
      ? V.size("heavy", items, { names: (() => { const p = r.pick([["melon", "grape"], ["block", "feather"], ["rock", "leaf"]]); return flip ? [p[1], p[0]] : p; })(), tap: true, ans })
      : V.size(kind, items, { icon: kind === "long" ? r.pick(["stick", "ribbon", "snake"]) : r.pick(["tower", "tree"]), tap: true, ans });
    const what = kind === "heavy" ? "one" : vis.icon;
    const rule = {
      long: ["When the ends start at the same place, the one that goes farther is longer.", "When the ends start at the same place, the one that does not go as far is shorter."],
      tall: ["When they stand on the same floor, the one that goes higher is taller.", "When they stand on the same floor, the one that does not go as high is shorter."],
      heavy: ["The heavier side of the scale goes down.", "The heavier side of the scale goes down, so the lighter side stays up."],
    }[kind][want];
    return test(vis, `Touch the ${what} that is ${words[want]}.`, `(Touches the ${words[want]} ${what}.)`, fixPoint(`${rule} (Touch the ${words[want]} one.)`, `Touch the ${what} that is ${words[want]}.`), { skill: "measure", item: `${kind}:${words[want]}`, confirm: `Yes, that one is ${words[want]}.` });
  },
  sortItem(r) {
    const icons = r.sample(["apple", "star", "ball", "fish", "duck"], 2);
    const a = r.int(2, 6), b = r.int(2, 6);
    const items = r.shuffle([...Array(a).fill(icons[0]), ...Array(b).fill(icons[1])]);
    return [
      test(V.row(...items.map((i) => V.obj(i, 1, { size: "sm" }))), `Count only the ${plural(icons[0])}. How many ${plural(icons[0])}?`, Word(a) + ".", fix(Word(a) + ".", `How many ${plural(icons[0])}?`, `I count only the ${plural(icons[0])}: ${chain(1, a)}. ${Word(a)} ${plural(icons[0], a)}.`), { skill: "count", item: `sort:${a}` }),
      test(V.row(...items.map((i) => V.obj(i, 1, { size: "sm" }))), `Now count only the ${plural(icons[1])}. How many ${plural(icons[1])}?`, Word(b) + ".", fix(Word(b) + ".", `How many ${plural(icons[1])}?`, `I count only the ${plural(icons[1])}: ${chain(1, b)}. ${Word(b)} ${plural(icons[1], b)}.`), { skill: "count", item: `sort:${b}` }),
    ];
  },
  mostItem(r) {
    const icons = r.sample(["apple", "star", "ball", "fish"], 3);
    const ns = r.sample([2, 3, 4, 5, 6, 7], 3);
    const best = ns.indexOf(Math.max(...ns));
    return test(V.graph("picture", icons.map((icon, i) => ({ icon, n: ns[i] }))), "Each row is one group. Which group has the most? Touch the picture at the start of its row.", `(Touches the ${icons[best]}.)`,
      fixPoint(`Count each row: ${icons.map((ic, i) => `${word(ns[i])} ${plural(ic, ns[i])}`).join(", ")}. ${Word(ns[best])} is the most. (Touch the ${icons[best]}.)`, "Which group has the most? Touch the picture at the start of its row."), { skill: "data", item: "most" });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.kind === "sort") {
      return {
        title: u.label, steps: [
          model(V.row(V.obj("apple", 1, { size: "sm" }), V.obj("star", 1, { size: "sm" }), V.obj("apple", 1, { size: "sm" }), V.obj("apple", 1, { size: "sm" }), V.obj("star", 1, { size: "sm" })), "My turn. These are mixed up. I sort them into two groups: apples and stars. I count the apples: one, two, three. Three apples. I count the stars: one, two. Two stars."),
          lead(V.row(V.obj("ball", 1, { size: "sm" }), V.obj("fish", 1, { size: "sm" }), V.obj("fish", 1, { size: "sm" }), V.obj("ball", 1, { size: "sm" }), V.obj("fish", 1, { size: "sm" })), "Count only the fish with me.", "One, two, three. Three fish."),
          ...this.sortItem(r), ...this.sortItem(r),
        ],
      };
    }
    if (u.kind === "most") {
      return {
        title: u.label, steps: [
          model(V.graph("picture", [{ icon: "apple", n: 3 }, { icon: "star", n: 6 }, { icon: "ball", n: 4 }]), "This picture sorts things into rows. Each row is one group. My turn. Apples: three. Stars: six. Balls: four. Six is the most. The stars have the most."),
          lead(V.graph("picture", [{ icon: "fish", n: 5 }, { icon: "duck", n: 2 }, { icon: "frog", n: 3 }]), "Which group has the most? Count with me. Fish: five. Ducks: two. Frogs: three. Which is the most?", "The fish."),
          this.mostItem(r), this.mostItem(r),
        ],
      };
    }
    const intros = {
      long: [V.size("long", [1, 0.6], { icon: "stick" }), "My turn. To compare length, I line up the ends. This stick goes farther. It is longer. This one is shorter."],
      tall: [V.size("tall", [0.5, 1], { icon: "tower" }), "My turn. These towers stand on the same floor. This one goes higher. It is taller. This one is shorter."],
      heavy: [V.size("heavy", [1, 0.5], { names: ["melon", "grape"] }), "My turn. On a scale, the heavier side goes down. The melon is heavier. The grape is lighter."],
      holds: [V.size("big", [1, 0.55], { icon: "cup", holds: true }), "My turn. Which cup holds more water? The bigger cup holds more. The smaller cup holds less."],
    };
    const [vis, say] = intros[u.kind];
    return {
      title: u.label, steps: [
        model(vis, say),
        lead(vis, { long: "Touch the one that is longer with me.", tall: "Touch the one that is taller with me.", heavy: "Touch the one that is heavier with me.", holds: "Touch the cup that holds more with me." }[u.kind], "(Touches it.)"),
        this.pairTest(r, u.kind), this.pairTest(r, u.kind), this.pairTest(r, u.kind),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const kinds = intro.map((u) => u.kind);
    const pairKinds = kinds.filter((k) => ["long", "tall", "heavy", "holds"].includes(k));
    const steps = favorNew(r, pairKinds, 2).map((k) => this.pairTest(r, k));
    if (kinds.includes("most") && r() < 0.5) steps.push(this.mostItem(r));
    else if (kinds.includes("sort")) steps.push(...this.sortItem(r));
    return { title: "Measuring and sorting", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.kind === "sort") return this.sortItem(r);
    if (u.kind === "most") return [this.mostItem(r)];
    return [this.pairTest(r, u.kind), this.pairTest(r, u.kind)];
  },
};

// ─────────────────────────────────────────────────────────────
// Shapes: flat and solid
// ─────────────────────────────────────────────────────────────

const SOLIDS = {
  sphere: { rule: "A sphere is round all over, like a ball. It rolls.", like: "a ball" },
  cube: { rule: "A cube has six flat faces, and every face is a square. It stacks.", like: "a block" },
  cylinder: { rule: "A cylinder has two flat circle faces and a curved side, like a can. It rolls and it stacks.", like: "a can" },
  cone: { rule: "A cone has one flat circle face and comes to a point, like an ice cream cone.", like: "an ice cream cone" },
};
const FLAT = ["circle", "square", "triangle", "rectangle", "hexagon"];
const SHAPE_RULES = { ...Object.fromEntries(Object.entries(SHAPE_INFO).map(([k, v]) => [k, v.rule])), hexagon: "A hexagon has six sides and six corners." };
const SIDES = { triangle: 3, square: 4, rectangle: 4, hexagon: 6 };

const shapes = {
  id: "shapes",
  name: "Shapes",
  summary: "Name flat shapes in any size and turn, count their sides and corners, name solid shapes, tell flat from solid, and put shapes together to make new ones.",
  standard: "K.G.1 to K.G.6",
  units: [
    { id: "flat4", lesson: 5, label: "Shapes turned any way" },
    { id: "hexagon", lesson: 17, label: "Hexagons" },
    { id: "sides", lesson: 30, label: "Sides and corners" },
    { id: "sphere", lesson: 39, solid: "sphere", label: "Spheres" },
    { id: "cube", lesson: 47, solid: "cube", label: "Cubes" },
    { id: "cylinder", lesson: 55, solid: "cylinder", label: "Cylinders" },
    { id: "cone", lesson: 63, solid: "cone", label: "Cones" },
    { id: "flatsolid", lesson: 71, label: "Flat or solid" },
    { id: "compose", lesson: 86, label: "Put shapes together" },
  ],
  shapeVis(r, s) {
    const rot = s === "circle" ? 0 : r.pick([0, 0, 20, 45, 90, 180]);
    return V.shape(s, { c: r.pick(["red", "blue", "yellow", "green", "purple", "orange"]), rot, scale: r.pick([0.6, 0.8, 1]) });
  },
  flatKnown(intro) {
    return intro.some((u) => u.id === "hexagon") ? FLAT : FLAT.slice(0, 4);
  },
  solidKnown(intro) {
    return intro.filter((u) => u.solid).map((u) => u.solid);
  },
  nameItem(r, s) {
    return test(this.shapeVis(r, s), "What shape is this?", `A ${s}.`, fix(`A ${s}.`, "What shape is this?", SHAPE_RULES[s]), { skill: "shape", item: `name:${s}` });
  },
  solidItem(r, s) {
    return test(V.solid(s, { c: r.pick(["red", "blue", "green", "orange", "purple"]) }), "What solid shape is this?", `A ${s}.`, fix(`A ${s}.`, "What solid shape is this?", SOLIDS[s].rule), { skill: "shape", item: `solid:${s}` });
  },
  sidesItem(r) {
    const s = r.pick(Object.keys(SIDES));
    return test(this.shapeVis(r, s), "Touch and count the sides. How many sides?", Word(SIDES[s]) + ".", fix(Word(SIDES[s]) + ".", "Touch and count the sides. How many sides?", `My turn. (Touch each side.) ${Chain(1, SIDES[s])} A ${s} has ${word(SIDES[s])} sides.`), { skill: "shape", item: `sides:${s}` });
  },
  flatSolidItem(r, intro) {
    const solid = r() < 0.5 && this.solidKnown(intro).length;
    const vis = solid ? V.solid(r.pick(this.solidKnown(intro))) : this.shapeVis(r, r.pick(this.flatKnown(intro)));
    const ans = solid ? "Solid." : "Flat.";
    return test(vis, "Is this shape flat or solid?", ans, fix(ans, "Is this shape flat or solid?", solid ? "It is not flat like a picture. You could hold it in your hand." : "It is flat, like a picture."), { skill: "shape", item: "flatsolid" });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    if (u.id === "flat4") {
      const steps = [
        model(V.shape("triangle", { c: "green", rot: 180 }), "A shape keeps its name when it is turned, big or small, or any color. My turn. This is a triangle. It is upside down, and it is still a triangle. It has three sides."),
        model(V.shape("square", { c: "blue", rot: 45 }), "This is a square. It is turned, and it is still a square."),
        lead(V.shape("rectangle", { c: "orange", rot: 90 }), "What shape is this? Say it with me.", "A rectangle."),
      ];
      for (const s of r.shuffle(FLAT.slice(0, 4))) steps.push(this.nameItem(r, s));
      return { title: u.label, steps };
    }
    if (u.id === "hexagon") {
      return {
        title: u.label, steps: [
          model(V.shape("hexagon", { c: "yellow" }), "My turn. This is a hexagon. A hexagon has six sides and six corners."),
          model(V.shape("pentagon", { c: "yellow" }), "This is not a hexagon. It has only five sides."),
          lead(V.shape("hexagon", { c: "green", rot: 30 }), "What shape is this? Say it with me.", "A hexagon."),
          this.nameItem(r, "hexagon"), this.nameItem(r, r.pick(FLAT.slice(0, 4))), this.nameItem(r, "hexagon"),
        ],
      };
    }
    if (u.id === "sides") {
      return {
        title: u.label, steps: [
          model(V.shape("triangle", { c: "red" }), "Shapes have sides and corners. A side is a straight edge. A corner is where two sides meet. My turn. I touch and count the sides of this triangle: one, two, three. Three sides. And three corners.", { do: "Touch each side as you count." }),
          model(V.shape("square", { c: "blue" }), "A square: one, two, three, four. Four sides and four corners."),
          lead(V.shape("hexagon", { c: "yellow" }), "Count the sides of the hexagon with me.", "One, two, three, four, five, six. Six."),
          this.sidesItem(r), this.sidesItem(r), this.sidesItem(r),
          test(V.shape("circle", { c: "green" }), "How many corners does a circle have?", "None.", fix("None.", "How many corners does a circle have?", "A circle is round all the way around. It has no corners."), { skill: "shape", item: "circle-corners", confirm: "Right. A circle has no corners." }),
        ],
      };
    }
    if (u.solid) {
      const s = u.solid;
      const known = this.solidKnown(intro).filter((x) => x !== s);
      const steps = [
        model(V.solid(s, { c: "blue" }), `This is a solid shape. It is not flat. You could hold it in your hand. My turn. This is a ${s}. ${SOLIDS[s].rule}`),
        lead(V.solid(s, { c: "orange" }), `What solid shape is this? Say it with me.`, `A ${s}.`),
        this.solidItem(r, s),
      ];
      if (known.length) {
        const opts = r.shuffle([s, ...r.sample(known, Math.min(2, known.length))]);
        steps.push(test(V.choices(opts.map((x) => V.solid(x, { c: r.pick(["red", "blue", "green", "purple"]) })), opts.indexOf(s)), `Touch the ${s}.`, `(Touches the ${s}.)`, fixPoint(`This is the ${s}. ${SOLIDS[s].rule} (Touch it.)`, `Touch the ${s}.`), { skill: "shape", item: `touch-solid:${s}` }));
        steps.push(this.solidItem(r, r.pick(known)));
      }
      steps.push(note(V.solid(s, { c: "green" }), `Find something at home shaped like a ${s}, such as ${SOLIDS[s].like}. Hold it and say: This is a ${s}.`, { do: "Let the child hold the object and turn it over." }));
      return { title: u.label, steps };
    }
    if (u.id === "flatsolid") {
      return {
        title: u.label, steps: [
          model(V.row(V.shape("square", { c: "blue", size: "md" }), V.solid("cube", { c: "blue", size: "md" })), "My turn. This square is flat, like a picture. This cube is solid. You could pick it up. A square is flat. A cube is solid."),
          model(V.row(V.shape("circle", { c: "red", size: "md" }), V.solid("sphere", { c: "red", size: "md" })), "A circle is flat. A sphere is solid."),
          lead(V.solid("cylinder"), "Is this flat or solid? Say it with me.", "Solid."),
          this.flatSolidItem(r, intro), this.flatSolidItem(r, intro), this.flatSolidItem(r, intro),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.row(V.shape("triangle", { c: "green", size: "md", rot: 0 }), V.shape("triangle", { c: "green", size: "md", rot: 180 })), "Shapes can be put together to make new shapes. My turn. If I put two triangles together along their long sides, they make a square."),
        model(V.row(V.shape("square", { c: "blue", size: "md" }), V.shape("square", { c: "blue", size: "md" })), "Two squares side by side make a rectangle."),
        lead(V.row(V.shape("square", { c: "blue", size: "md" }), V.shape("square", { c: "blue", size: "md" })), "Two squares side by side make what shape? Say it with me.", "A rectangle."),
        test(V.row(V.shape("triangle", { c: "red", size: "md" }), V.shape("triangle", { c: "red", size: "md", rot: 180 })), "Two triangles like these, put together, make what shape?", "A square.", fix("A square.", "Two triangles put together make what shape?"), { skill: "shape", item: "compose:tri" }),
        test(V.row(V.shape("square", { c: "orange", size: "md" }), V.shape("square", { c: "orange", size: "md" })), "Two squares side by side make what shape?", "A rectangle.", fix("A rectangle.", "Two squares side by side make what shape?"), { skill: "shape", item: "compose:sq" }),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const flat = this.flatKnown(intro);
    const solids = this.solidKnown(intro);
    const steps = [this.nameItem(r, r.pick(flat))];
    if (intro.some((u) => u.id === "sides")) steps.push(this.sidesItem(r));
    if (solids.length) steps.push(this.solidItem(r, favorNew(r, solids, 1)[0]));
    if (intro.some((u) => u.id === "flatsolid")) steps.push(this.flatSolidItem(r, intro));
    if (steps.length < 3) steps.push(this.nameItem(r, r.pick(flat)));
    return { title: "Shapes", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.solid) return [this.solidItem(r, u.solid), this.nameItem(r, r.pick(this.flatKnown(units)))];
    if (u.id === "sides") return [this.sidesItem(r), this.sidesItem(r)];
    if (u.id === "flatsolid") return [this.flatSolidItem(r, units), this.flatSolidItem(r, units)];
    if (u.id === "compose") return [test(V.row(V.shape("triangle", { c: "red", size: "md" }), V.shape("triangle", { c: "red", size: "md", rot: 180 })), "Two triangles like these, put together, make what shape?", "A square.", fix("A square.", "Two triangles put together make what shape?"), { skill: "shape", item: "compose:tri" })];
    return [this.nameItem(r, r.pick(this.flatKnown(units))), this.nameItem(r, r.pick(this.flatKnown(units)))];
  },
};

// ─────────────────────────────────────────────────────────────
// Position words (review from Pre-K, then retired)
// ─────────────────────────────────────────────────────────────

const position = retrack(prekPosition, [
  { id: "on", lesson: 7, label: "The word on" },
  { id: "under", lesson: 8, label: "The word under" },
  { id: "next", lesson: 11, label: "The words next to" },
  { id: "above", lesson: 15, label: "The word above" },
  { id: "front", lesson: 19, label: "The words in front of" },
  { id: "behind", lesson: 23, label: "The word behind" },
], {
  summary: "Review the position words from Pre-K and use them to tell where things are: on, under, next to, above, in front of, behind.",
  standard: "K.G.1",
  retired: 70,
  reviewEvery: 5,
});

// ─────────────────────────────────────────────────────────────
// Order words: first to tenth
// ─────────────────────────────────────────────────────────────

const ORD = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];

const ordinals = {
  id: "ordinals",
  name: "Order words",
  summary: "Use first through tenth, and last, to tell the place of something in a line.",
  standard: "Common practice in kindergarten programs",
  units: [
    { id: "o3", lesson: 79, max: 3, label: "First, second, third" },
    { id: "o5", lesson: 93, max: 5, label: "Fourth and fifth" },
    { id: "o10", lesson: 107, max: 10, label: "Sixth to tenth" },
  ],
  item(r, max) {
    const len = Math.max(5, max);
    const icons = iconSeq(r, len);
    const k = r.int(1, max);
    return test(V.lineup(icons, { tap: true, ans: k - 1 }), `The flag is at the front. Touch the ${ORD[k]} one.`, `(Touches the ${icons[k - 1]}.)`,
      fixPoint(k === 1 ? `The ${icons[0]} is right at the front, so it is first. (Touch it.)` : `I count places from the front: ${ORD.slice(1, k + 1).join(", ")}. The ${icons[k - 1]} is ${ORD[k]}. (Touch it.)`, `Touch the ${ORD[k]} one.`), { skill: "position", item: `ord:${k}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const icons = iconSeq(r, Math.max(5, u.max));
    const from = u.max === 3 ? 1 : u.max === 5 ? 4 : 6;
    return {
      title: u.label, steps: [
        model(V.lineup(icons), `Order words tell where something is in a line. We start at the flag, at the front. My turn. ${icons.slice(0, u.max).map((ic, i) => `The ${ic} is ${ORD[i + 1]}.`).join(" ")}`, { do: "Touch each picture as you say its place." }),
        lead(V.lineup(icons), "Say the order words with me, starting at the front.", cap(ORD.slice(1, u.max + 1).join(", ")) + "."),
        lead(V.lineup(icons, { tap: true, ans: from - 1 }), `Touch the ${ORD[from]} one with me.`, `(Touches the ${icons[from - 1]}.)`),
        this.item(r, u.max), this.item(r, u.max), this.item(r, u.max),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const max = intro[intro.length - 1].max;
    return { title: "Order words", steps: [this.item(r, max), this.item(r, max)] };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const max = units[units.length - 1].max;
    return [this.item(r, max), this.item(r, max)];
  },
};

// ─────────────────────────────────────────────────────────────
// Fact fluency within 5
// ─────────────────────────────────────────────────────────────

function factsWithin(max, op) {
  const out = [];
  for (let a = 0; a <= max; a++) for (let b = 0; b <= max; b++) {
    if (op === "+" && a + b <= max) out.push([a, "+", b]);
    if (op === "−" && b <= a && a <= max) out.push([a, "−", b]);
  }
  return out;
}

const facts = {
  id: "facts",
  name: "Facts within 5",
  summary: "Answer every addition and subtraction fact within 5 quickly and without counting.",
  standard: "K.OA.5",
  units: [
    { id: "add5", lesson: 100, op: "+", label: "Addition facts within 5" },
    { id: "sub5", lesson: 122, op: "−", label: "Subtraction facts within 5" },
  ],
  reviewEvery: 2,
  pool(intro) {
    return intro.flatMap((u) => factsWithin(5, u.op)).filter(([a, , b]) => !(a === 0 && b === 0));
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const pool = factsWithin(5, u.op).filter(([a, , b]) => a > 0 && b > 0);
    const picks = r.seq(pool, 6);
    return {
      title: u.label, steps: [
        model(V.eq(3, u.op, u.op === "+" ? 2 : 1, "=", "?"), `Now we learn some facts so well that we just know them, without counting. My turn. ${u.op === "+" ? "Three plus two is five" : "Three minus one is two"}. I just know it.`),
        lead(V.eq(u.op === "+" ? 2 : 4, u.op, 2, "=", "?"), `Say the fact with me. ${u.op === "+" ? "Two plus two is how many?" : "Four minus two is how many?"}`, u.op === "+" ? "Four." : "Two."),
        ...picks.map(([a, op, b]) => factStep(a, op, b, { say: `${Word(a)} ${op === "+" ? "plus" : "minus"} ${word(b)}? Answer fast.` })),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const picks = r.seq(this.pool(intro), 6);
    return { title: "Quick facts", steps: picks.map(([a, op, b]) => factStep(a, op, b, { say: `${Word(a)} ${op === "+" ? "plus" : "minus"} ${word(b)}?` })) };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return r.seq(this.pool(units), 4).map(([a, op, b]) => factStep(a, op, b));
  },
};

// Facts the K fact review may draw on, with the lesson where each becomes fair game.
const kFacts = [];
for (const [a, op, b] of factsWithin(10, "+")) {
  if (a === 0 && b === 0) continue;
  const lesson = b === 1 ? 40 : b === 0 ? 84 : b === 2 ? 94 : a + b <= 5 ? 100 : 108;
  kFacts.push({ key: `${a}+${b}`, a, op: "+", b, ans: a + b, lesson });
}
for (const [a, op, b] of factsWithin(10, "−")) {
  if (a === 0) continue;
  const lesson = b === 1 ? 88 : b === 0 || b === a ? 118 : b === 2 ? 108 : a <= 5 ? 122 : 114;
  kFacts.push({ key: `${a}-${b}`, a, op: "−", b, ans: a - b, lesson });
}

export default {
  id: "k",
  slug: "k",
  subject: "math",
  name: "Kindergarten",
  longName: "Kindergarten",
  age: "about five",
  lessons: 140,
  minutes: "12 to 15",
  minutesBand: [12, 15],
  minExercises: 8,
  minReviewSteps: 6,
  maxExercises: 9,
  maxSteps: 90,
  maxGap: 10,
  reviewIntervals: [2, 4, 5],
  placementPoints: [1, 35, 70, 105],
  tagline: "Counting to 100, numbers to 20, adding and subtracting within 10, ways to make 10, measuring, and shapes.",
  description: "Kindergarten covers the counting, number, and shape work of the Common Core kindergarten standards: counting to 100, reading numbers to 20, teen numbers as ten and some more, adding and subtracting within 10, ways to make 10, number families, story problems, measuring, sorting, and flat and solid shapes.",
  endsWith: "By the end of Kindergarten, the child counts to 100 by ones and tens, reads numbers to 20, adds and subtracts within 10 with objects or by counting on and back, knows the addition and subtraction facts within 5 without counting, finds the partner that makes 10, solves spoken story problems, and names flat and solid shapes.",
  materials: ["Twenty small objects, such as blocks, buttons, or beans", "A few household objects shaped like a ball, a block, a can, and a cone"],
  facts: kFacts,
  readable(n) {
    return new Set(K_NUMS.filter((u) => u.lesson <= n).flatMap((u) => u.ds));
  },
  tracks: [countAloud, countObjects, numerals, frames, compare, teens, addition, subtraction, pairs, families, stories, facts, measure, shapes, position, ordinals],
};
