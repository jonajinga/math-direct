// Formats shared by more than one level. A format is a fixed script that is
// applied to different items, the way Engelmann's programs reuse one wording
// for every numeral, every fact, or every shape.

import { V, ICONS } from "../lib/v.js";
import { model, lead, test, note, fix, fixPoint, fixChain } from "../lib/steps.js";
import { word, Word, chain, Chain, plural, an } from "../lib/words.js";

export { V, model, lead, test, note, fix, fixPoint, fixChain, word, Word, chain, Chain, plural, an, ICONS };

// "duck, fish" -> "Duck, fish"
export function capFirst(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ── Counting aloud ──

export function countSay(from, to, by = 1) {
  if (by === 10 && from === 10) return `Count by tens to ${word(to)}. Get ready.`;
  if (by === 10) return `Start at ${word(from)}. Count by tens to ${word(to)}. Get it going.`;
  if (by === 2) return `Count by twos to ${word(to)}. Get ready.`;
  if (by === 5) return `Count by fives to ${word(to)}. Get ready.`;
  if (by < 0) return `Start at ${word(from)}. Count backward to ${word(to)}. Get it going.`;
  if (from === 1) return `Count to ${word(to)}. Get ready.`;
  return `Start at ${word(from)}. Count to ${word(to)}. Get it going.`;
}

export function countAnswer(from, to, by = 1) {
  return Chain(from, to, by);
}

export function countTest(from, to, by = 1, opts = {}) {
  const ans = countAnswer(from, to, by);
  const ask = countSay(from, to, by);
  return test(V.say(), (opts.prefix ? opts.prefix + " " : "") + ask, ans,
    fixChain(ans, ask.replace(/ Get (ready|it going)\.$/, "")), {
      do: opts.do || "Signal: pause, then nod for the child to begin. Listen for skipped or repeated numbers.",
      skill: "count-aloud",
      item: `count:${from}:${to}:${by}`,
      ...opts.extra,
    });
}

// ── Counting objects ──

export function touchCount(icon, n, arr, opts = {}) {
  const name = plural(icon, n);
  const screen = V.obj(icon, n, { arr, tap: true, seed: opts.seed, start: arr === "circle" });
  const steps = [
    test(screen, `Touch and count the ${plural(icon)}.`, Chain(1, n),
      fixPoint(`I touch each picture once and say one number for each. ${Chain(1, n)}`, `Touch and count the ${plural(icon)}.`, "Stop."), {
        do: "Watch that the child touches each picture once and says one number for each touch.",
        skill: "count",
        item: `count-obj:${n}`,
      }),
    test(screen, `How many ${plural(icon)}?`, Word(n) + ".",
      fix(Word(n) + ".", `How many ${plural(icon)}?`, `The last number we count tells how many. ${Chain(1, n)} The last number is ${word(n)}, so there ${n === 1 ? "is" : "are"} ${word(n)} ${name}.`), {
        skill: "count",
        item: `how-many:${n}`,
      }),
  ];
  return steps;
}

// ── Reading numerals ──

export function readNum(d, opts = {}) {
  return test(V.num(d), opts.say || "What number is this?", Word(d) + ".",
    fix(Word(d) + ".", "What number is this?"), { skill: "read", item: `read:${d}` });
}

export function touchNum(d, others, rand, opts = {}) {
  const opts2 = rand.shuffle([d, ...others]);
  const ans = opts2.indexOf(d);
  return test(V.choices(opts2.map((x) => V.num(x)), ans), `Touch ${word(d)}.`, `(Touches ${d}.)`,
    fixPoint(`This is ${word(d)}. (Touch ${d}.)`, `Touch ${word(d)}.`), {
      skill: "read",
      item: `touch-num:${d}`,
      confirm: `Yes, that is ${word(d)}.`,
    });
}

// ── Seeing small amounts at a glance ──

export function flashTest(n, arr, ms, seed) {
  return test(V.dots(n, { arr, seed }), "Look. How many dots?", Word(n) + ".",
    fix(Word(n) + ".", "Look. How many dots?", "Look at the dots. They stay up now."), {
      flash: ms,
      skill: "subitize",
      item: `flash:${n}:${arr}`,
      do: "The dots show for a moment, then hide. Show again, the curved arrow, brings them back.",
    });
}

// ── Choosing among pictures ──

export function touchChoice(opts, ans, say, show, confirm, extra = {}) {
  return test(V.choices(opts, ans), say, extra.answer || "(Touches the right picture.)",
    fixPoint(show, say), { confirm: confirm || "Yes.", ...extra });
}

// Pick objects to count, avoiding repeats.
export function iconSeq(rand, n) {
  return rand.seq(ICONS.filter((i) => i !== "block"), n);
}

// Weighted pick: favor the newest items.
export function favorNew(rand, items, n) {
  if (!items.length) return [];
  const out = [];
  const recent = items.slice(-3);
  for (let i = 0; i < n; i++) {
    out.push(rand() < 0.6 ? rand.pick(recent) : rand.pick(items));
  }
  // Avoid identical neighbours.
  for (let i = 1; i < out.length; i++) {
    if (out[i] === out[i - 1] && items.length > 1) {
      out[i] = rand.pick(items.filter((x) => x !== out[i - 1]));
    }
  }
  return out;
}

// Numbers other than d from a pool, for distractors.
export function others(rand, pool, d, k) {
  return rand.sample(pool.filter((x) => x !== d), k);
}
