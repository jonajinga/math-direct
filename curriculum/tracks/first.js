// First Grade: 150 lessons, 20 to 30 minutes each, for children of about six.

import {
  V, model, lead, test, note, fix, fixPoint, fixChain, word, Word, chain, Chain, plural,
  countTest, readNum, touchNum, touchChoice, iconSeq, favorNew, others,
} from "./common.js";
import { factStep, families as kFamilies } from "./k.js";
import { retrack, TAKE_VERBS } from "./prek.js";

const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Reading ranges: the child arrives reading 0 to 20.
const READ = [
  { id: "r20", lesson: 1, lo: 0, hi: 20, label: "Read 0 to 20" },
  { id: "r50", lesson: 2, lo: 21, hi: 50, label: "Read 21 to 50" },
  { id: "r100", lesson: 10, lo: 51, hi: 100, label: "Read 51 to 100" },
  { id: "r120", lesson: 34, lo: 101, hi: 120, label: "Read 101 to 120" },
];
const numMax = (n) => Math.max(...READ.filter((u) => u.lesson <= n).map((u) => u.hi));

// ─────────────────────────────────────────────────────────────
// Counting aloud to 120
// ─────────────────────────────────────────────────────────────

const countAloud = {
  id: "count-aloud",
  name: "Counting aloud",
  warmup: true,
  summary: "Count forward and backward from any number, count to 120, count by tens from any number, and count by twos and fives.",
  standard: "1.NBT.1",
  units: [
    { id: "from", lesson: 1, type: "from", max: 100, label: "Count on from any number to 100" },
    { id: "back20", lesson: 6, type: "back", max: 20, label: "Count backward from any number to 20" },
    { id: "tensfrom", lesson: 24, type: "tensfrom", label: "Count by tens from any number" },
    { id: "to110", lesson: 30, type: "to", to: 110, label: "Count past 100 to 110" },
    { id: "to120", lesson: 36, type: "to", to: 120, label: "Count to 120" },
    { id: "back100", lesson: 44, type: "back", max: 100, label: "Count backward from any number to 100" },
    { id: "twos", lesson: 56, type: "by", by: 2, to: 20, label: "Count by twos to 20" },
    { id: "fives", lesson: 66, type: "by", by: 5, to: 50, label: "Count by fives to 50" },
    { id: "fives100", lesson: 76, type: "by", by: 5, to: 100, label: "Count by fives to 100" },
  ],
  item(r, u) {
    if (u.type === "from") { const a = r.int(11, 88); return countTest(a, a + r.int(6, 12)); }
    if (u.type === "back") { const a = r.int(u.max === 20 ? 12 : 25, u.max); return countTest(a, a - r.int(5, 8), -1); }
    if (u.type === "tensfrom") { const a = r.int(1, 9) + 10 * r.int(0, 2); return countTest(a, a + 50, 10); }
    if (u.type === "to") return countTest(u.to - 15, u.to);
    return countTest(u.by, u.to, u.by);
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const steps = [];
    if (u.type === "from") {
      steps.push(model(V.say(), "My turn. I start at forty-seven and count to fifty-three. Forty-seven... forty-eight, forty-nine, fifty, fifty-one, fifty-two, fifty-three. Listen to the change at fifty.", { do: "Stress the move to the next ten." }));
      steps.push(lead(V.say(), "Do it with me. Start at sixty-eight. Count to seventy-four. Get it going.", Chain(68, 74)));
    } else if (u.type === "back") {
      const a = u.max === 20 ? 17 : 63;
      steps.push(model(V.say(), `Counting backward, the numbers get smaller. My turn. ${Chain(a, a - 6, -1)}`));
      steps.push(lead(V.say(), `Do it with me. Start at ${word(a)}. Count backward. Get it going.`, Chain(a, a - 6, -1)));
    } else if (u.type === "tensfrom") {
      steps.push(model(V.say(), "When we count by tens from any number, only the tens change. The ones stay the same. My turn. Start at three: three, thirteen, twenty-three, thirty-three, forty-three, fifty-three."));
      steps.push(lead(V.say(), "Do it with me. Start at six. Count by tens to sixty-six. Get it going.", Chain(6, 66, 10)));
    } else if (u.type === "to") {
      const from = u.to - 13;
      steps.push(model(V.say(), `After one hundred we keep going: one hundred one, one hundred two, and so on. My turn. ${Chain(from, u.to)}`));
      steps.push(lead(V.say(), "Say it with me. Get ready.", Chain(from, u.to)));
    } else {
      steps.push(model(V.say(), `Now we count by ${u.by === 2 ? "twos" : "fives"}. Each number is ${word(u.by)} more. My turn. ${Chain(u.by, u.to, u.by)}`, { do: u.by === 5 ? "Hold up one hand for each five." : "Clap on each number." }));
      steps.push(lead(V.say(), `Count by ${u.by === 2 ? "twos" : "fives"} with me. Get ready.`, Chain(u.by, u.to, u.by)));
      steps.push(lead(V.say(), "Again. Get ready.", Chain(u.by, u.to, u.by)));
    }
    steps.push(this.item(r, u), this.item(r, u));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const picks = favorNew(r, intro, 3);
    return { title: "Counting aloud", steps: picks.map((u) => this.item(r, u)) };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return [this.item(r, units[units.length - 1]), this.item(r, r.pick(units))];
  },
};

// ─────────────────────────────────────────────────────────────
// Reading and writing numbers to 120
// ─────────────────────────────────────────────────────────────

const numerals = {
  id: "numerals",
  name: "Reading numbers",
  summary: "Read every number to 120. A two-digit number is read tens first: 47 is forty-seven, four tens and seven ones.",
  standard: "1.NBT.1",
  units: READ,
  pool(intro) {
    return intro.flatMap((u) => range(u.lo, u.hi));
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "r20") {
      return {
        title: u.label, steps: [
          model(V.num(16), "We will read numbers. My turn. This is sixteen.", { skill: "read" }),
          lead(V.num(12), "Read it with me.", "Twelve.", { skill: "read" }),
          ...r.sample(range(0, 20), 5).map((d) => readNum(d)),
        ],
      };
    }
    if (u.id === "r120") {
      return {
        title: u.label, steps: [
          model(V.num(100), "My turn. This is one hundred. It has three digits.", { skill: "read" }),
          model(V.num(107), "This is one hundred seven. One hundred, and seven more.", { skill: "read" }),
          model(V.num(115), "This is one hundred fifteen.", { skill: "read" }),
          lead(V.num(112), "Read it with me.", "One hundred twelve.", { skill: "read" }),
          ...r.sample(range(101, 120), 4).map((d) => readNum(d)),
        ],
      };
    }
    const a = r.int(u.lo, u.hi), b = r.int(u.lo, u.hi);
    const t = Math.floor(a / 10);
    return {
      title: u.label, steps: [
        model(V.num(a), `My turn. We read the first digit as a ten word, then the second digit. ${String(t)} in the first place means ${word(t * 10)}. ${a % 10 ? `Then ${word(a % 10)}. ${Word(a)}.` : `${Word(a)}.`}`, { skill: "read", do: "Touch the first digit, then the second." }),
        lead(V.num(b), "Read it with me. Get ready.", Word(b) + ".", { skill: "read" }),
        ...r.sample(range(u.lo, u.hi), 4).map((d) => readNum(d)),
        this.reversedTouch(r, u),
      ],
    };
  },
  // Touch a number among its digit-reversal (34 and 43), a common confusion.
  reversedTouch(r, u) {
    const d = r.int(Math.max(u.lo, 12), u.hi - 2);
    const rev = Number(String(d).split("").reverse().join(""));
    const opts = [rev, d + 1].filter((x) => x !== d && x >= 0 && x <= numMax(u.lesson));
    return touchNum(d, opts.length ? opts : [d - 1], r);
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const latest = intro[intro.length - 1];
    const picks = [...r.sample(range(latest.lo, latest.hi), 3), ...r.sample(this.pool(intro), 2)];
    return { title: "Read the numbers", steps: picks.map((d) => readNum(d)) };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const latest = units[units.length - 1];
    return r.sample(range(latest.lo, latest.hi), 3).map((d) => readNum(d));
  },
};

const dictation = {
  id: "dictation",
  name: "Writing numbers",
  summary: "Write numbers to 120 when they are said aloud, tens digit first.",
  standard: "1.NBT.1",
  units: [
    { id: "d2", lesson: 4, max: 50, label: "Write two-digit numbers" },
    { id: "d100", lesson: 14, max: 100, label: "Write numbers to 100" },
    { id: "d120", lesson: 38, max: 120, label: "Write numbers to 120" },
  ],
  item(r, max) {
    const n = r.int(max > 100 ? 101 : 21, max);
    return test(V.say(), `Write ${word(n)} on your paper.`, `(Writes ${n}.)`, fixPoint(`${Word(n)} is ${n >= 100 ? "one hundred and " + word(n - 100) : `${word(Math.floor(n / 10))} tens and ${word(n % 10)} ones`}. I write ${String(n).split("").join(", then ")}.`, `Write ${word(n)}.`), { skill: "write", item: `dict:${n}`, confirm: `Yes, ${n}.` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const ex = u.max > 100 ? 113 : 46;
    return {
      title: u.label,
      materials: "paper and a pencil",
      steps: [
        model(V.num(ex), `When I hear a number, I write the tens digit first, then the ones. My turn. ${Word(ex)}. I write ${String(ex).split("").join(", then ")}.`),
        lead(V.say(), u.max > 100 ? "Write one hundred eight with me." : "Write thirty-two with me. Three tens, two ones.", u.max > 100 ? "(Writes 108.)" : "(Writes 32.)"),
        this.item(r, u.max), this.item(r, u.max), this.item(r, u.max),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const max = intro[intro.length - 1].max;
    return { title: "Write the numbers I say", materials: "paper and a pencil", steps: [this.item(r, max), this.item(r, max), this.item(r, max)] };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    return [this.item(r, units[units.length - 1].max), this.item(r, units[units.length - 1].max)];
  },
};

// ─────────────────────────────────────────────────────────────
// Place value
// ─────────────────────────────────────────────────────────────

const placeValue = {
  id: "place-value",
  name: "Place value",
  summary: "Tens and ones: ten ones make a ten; read a number from tens and ones and split a number into tens and ones; ten more and ten less; compare two-digit numbers with >, <, and =.",
  standard: "1.NBT.2, 1.NBT.3, 1.NBT.5",
  units: [
    { id: "bundle", lesson: 8, label: "Ten ones make a ten" },
    { id: "build", lesson: 12, label: "Tens and ones make a number" },
    { id: "split", lesson: 18, label: "Split a number into tens and ones" },
    { id: "tenmore", lesson: 48, label: "Ten more and ten less" },
    { id: "greater", lesson: 64, label: "The greater-than sign" },
    { id: "less", lesson: 72, label: "The less-than sign" },
    { id: "compare", lesson: 80, label: "Compare with >, <, and =" },
  ],
  buildItem(r, max) {
    const n = r.int(11, Math.min(max, 99));
    const t = Math.floor(n / 10), o = n % 10;
    const ans = `${Word(t)} ${t === 1 ? "ten" : "tens"}, ${word(o)} ${o === 1 ? "one" : "ones"}. ${Word(n)}.`;
    return test(V.pv(t, o), "How many tens? How many ones? What number is it?", ans,
      fix(ans, "What number is it?", "Count the tens sticks, then the ones."), { skill: "place-value", item: `pv-build:${n}` });
  },
  splitItem(r, max) {
    const n = r.int(11, Math.min(max, 99));
    const t = Math.floor(n / 10), o = n % 10;
    const ans = `${Word(t)} ${t === 1 ? "ten" : "tens"} and ${word(o)} ${o === 1 ? "one" : "ones"}.`;
    return test(V.num(n), `${Word(n)}. How many tens and how many ones?`, ans,
      fix(ans, `How many tens and how many ones in ${word(n)}?`, "The first digit tells the tens. The second digit tells the ones."), { skill: "read", item: `pv-split:${n}` });
  },
  tenMoreItem(r, max) {
    const n = r.int(12, Math.min(max, 99) - 10);
    const more = r() < 0.5;
    const ans = more ? n + 10 : n - 10;
    return test(V.num(n), `What is ten ${more ? "more" : "less"} than ${word(n)}?`, Word(ans) + ".",
      fix(Word(ans) + ".", `What is ten ${more ? "more" : "less"} than ${word(n)}?`, `Ten ${more ? "more" : "less"} changes only the tens digit, by one. The ones stay the same.`), { skill: "place-value", item: `ten${more ? "more" : "less"}:${n}` });
  },
  compareItem(r, max, signs) {
    const top = Math.min(max, 99);
    const kind = r.pick(signs);
    let a, b;
    if (kind === "=") { a = r.int(10, top); b = a; }
    else {
      const hi = r.int(20, top);
      // Sometimes the tens are the same, so the ones decide.
      const lo = r() < 0.4 && hi % 10 > 0 ? hi - r.int(1, hi % 10) : r.int(10, hi - 1);
      [a, b] = kind === ">" ? [hi, lo] : [lo, hi];
    }
    const sign = a > b ? ">" : a < b ? "<" : "=";
    const read = sign === ">" ? "is greater than" : sign === "<" ? "is less than" : "equals";
    const ans = `${cap(sign === ">" ? "greater than" : sign === "<" ? "less than" : "equals")}. ${Word(a)} ${read} ${word(b)}.`;
    return test(V.eq(a, "?", b), "Which sign goes in the box: greater than, less than, or equals? Then read it.", ans,
      fix(ans, "Which sign goes in the box? Read it.", sign === "=" ? "The numbers are the same, so they are equal." : `Compare the tens first. The open side of the sign faces the greater number.`), { skill: "place-value", item: `cmp:${a}:${b}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const max = numMax(ctx.lesson);
    if (u.id === "bundle") {
      return {
        title: u.label, steps: [
          model(V.pv(0, 10), "Here are ten ones. My turn. When we have ten ones, we can bundle them into one ten.", { do: "If you have ten straws or sticks, bundle them with a rubber band as you say this." }),
          model(V.pv(1, 0), "This stick is one ten. It is the same as ten ones."),
          lead(V.pv(1, 0), "How many ones are in one ten? Say it with me.", "Ten."),
          test(V.pv(2, 0), "How many tens?", "Two tens.", fix("Two tens.", "How many tens?"), { skill: "place-value", item: "pv-tens:2" }),
          test(V.pv(2, 0), "Two tens is how many ones?", "Twenty.", fix("Twenty.", "Two tens is how many ones?", "Count by tens: ten, twenty."), { skill: "place-value", item: "pv-tens:20" }),
          test(V.pv(4, 0), "How many tens? How many ones is that?", "Four tens. Forty.", fix("Four tens. Forty.", "How many tens? How many ones is that?", "Count by tens: ten, twenty, thirty, forty."), { skill: "place-value", item: "pv-tens:40" }),
        ],
        materials: "ten straws or craft sticks and a rubber band (optional)",
      };
    }
    if (u.id === "build") {
      return {
        title: u.label, steps: [
          model(V.pv(3, 4, { chart: true }), "My turn. I count the tens: ten, twenty, thirty. Three tens. I count the ones: one, two, three, four. Four ones. Three tens and four ones make thirty-four."),
          lead(V.pv(2, 6, { chart: true }), "How many tens? How many ones? What number? Say it with me.", "Two tens, six ones. Twenty-six."),
          this.buildItem(r, max), this.buildItem(r, max), this.buildItem(r, max),
        ],
      };
    }
    if (u.id === "split") {
      return {
        title: u.label, steps: [
          model(V.num(47), "My turn. In forty-seven, the four is in the tens place. That means four tens. The seven is in the ones place. That means seven ones. Forty-seven is four tens and seven ones.", { skill: "read" }),
          lead(V.num(52), "How many tens and how many ones in fifty-two? Say it with me.", "Five tens and two ones.", { skill: "read" }),
          this.splitItem(r, max), this.splitItem(r, max), this.splitItem(r, max),
          test(V.num(16), "Sixteen. How many tens and how many ones?", "One ten and six ones.", fix("One ten and six ones.", "How many tens and ones in sixteen?"), { skill: "read", item: "pv-split:16" }),
        ],
      };
    }
    if (u.id === "tenmore") {
      return {
        title: u.label, steps: [
          model(V.row(V.pv(3, 4), V.pv(4, 4)), "My turn. Thirty-four. Ten more adds one more ten. Four tens and four ones: forty-four. Ten more than thirty-four is forty-four. Only the tens digit changed."),
          model(V.row(V.pv(5, 2), V.pv(4, 2)), "Ten less takes away one ten. Ten less than fifty-two is forty-two."),
          lead(V.num(63), "What is ten more than sixty-three? Say it with me.", "Seventy-three.", { skill: "read" }),
          this.tenMoreItem(r, max), this.tenMoreItem(r, max), this.tenMoreItem(r, max), this.tenMoreItem(r, max),
        ],
      };
    }
    if (u.id === "greater") {
      return {
        title: u.label, steps: [
          model(V.eq(52, ">", 38), "This sign means greater than. The open side faces the greater number. My turn. Fifty-two is greater than thirty-eight. Five tens is more than three tens."),
          model(V.eq(41, ">", 47), "Is this right? Forty-one and forty-seven have the same tens. So I look at the ones. Seven is more than one. Forty-one is not greater than forty-seven. The sign is wrong here."),
          lead(V.eq(70, ">", 29), "Read it with me.", "Seventy is greater than twenty-nine."),
          ...[0, 1, 2].map(() => {
            let a = r.int(20, Math.min(max, 99)), b = r.int(10, a - 1);
            return test(V.eq(a, ">", b), "Read it.", `${Word(a)} is greater than ${word(b)}.`, fix(`${Word(a)} is greater than ${word(b)}.`, "Read it.", "The open side faces the greater number."), { skill: "place-value", item: `read-gt:${a}:${b}` });
          }),
        ],
      };
    }
    if (u.id === "less") {
      return {
        title: u.label, steps: [
          model(V.eq(24, "<", 61), "This sign means less than. The point faces the number that is less. The open side still faces the greater number. My turn. Twenty-four is less than sixty-one."),
          lead(V.eq(35, "<", 39), "Read it with me.", "Thirty-five is less than thirty-nine."),
          this.compareItem(r, max, ["<"]), this.compareItem(r, max, [">"]), this.compareItem(r, max, ["<"]),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.eq(46, "?", 46), "When two numbers are the same, we use the equals sign. Forty-six equals forty-six."),
        lead(V.eq(58, "?", 85), "Which sign goes in the box? Compare the tens first. Say it with me.", "Less than. Fifty-eight is less than eighty-five."),
        this.compareItem(r, max, [">", "<", "="]), this.compareItem(r, max, [">", "<", "="]), this.compareItem(r, max, [">", "<", "="]),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const max = numMax(ctx.lesson);
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [];
    if (has("split")) steps.push(this.splitItem(r, max));
    if (has("build")) steps.push(this.buildItem(r, max));
    if (has("tenmore")) steps.push(this.tenMoreItem(r, max));
    if (has("greater")) steps.push(this.compareItem(r, max, has("compare") ? [">", "<", "="] : has("less") ? [">", "<"] : [">"]));
    if (!steps.length) steps.push(test(V.pv(r.int(2, 9), 0), "How many tens?", "(Says the number of tens.)", fixPoint("Count the sticks with me.", "How many tens?"), { skill: "place-value", item: "pv-tens" }));
    return { title: "Place value", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const max = numMax(ctx.lesson);
    const u = units[units.length - 1];
    if (u.id === "bundle") return [test(V.pv(3, 0), "How many tens? How many ones is that?", "Three tens. Thirty.", fix("Three tens. Thirty.", "How many tens? How many ones is that?"), { skill: "place-value", item: "pv-tens:30" })];
    if (u.id === "build") return [this.buildItem(r, max), this.buildItem(r, max)];
    if (u.id === "split") return [this.splitItem(r, max), this.splitItem(r, max)];
    if (u.id === "tenmore") return [this.tenMoreItem(r, max), this.tenMoreItem(r, max)];
    return [this.compareItem(r, max, u.id === "greater" ? [">"] : u.id === "less" ? ["<", ">"] : [">", "<", "="]), this.compareItem(r, max, [">", "<"])];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    const max = numMax(ctx.lesson);
    if (intro.some((u) => u.id === "greater")) {
      const signs = intro.some((u) => u.id === "compare") ? [">", "<", "="] : intro.some((u) => u.id === "less") ? [">", "<"] : [">"];
      const it = this.compareItem(r, max, signs);
      const [a, , b] = it.screen[0].parts;
      return { kind: "write", prompt: "Write >, <, or = in the box.", show: V.eq(a, "_", b), answer: a > b ? ">" : a < b ? "<" : "=" };
    }
    const n = r.int(11, Math.min(max, 99));
    return { kind: "write", prompt: "How many tens and ones? Write the number.", show: V.pv(Math.floor(n / 10), n % 10), answer: String(n) };
  },
};

// ─────────────────────────────────────────────────────────────
// Addition facts to 20
// ─────────────────────────────────────────────────────────────

const ADD_UNITS = [
  { id: "plus12", lesson: 1, label: "Plus zero, one, and two" },
  { id: "turn", lesson: 10, label: "Turn-around facts" },
  { id: "doubles5", lesson: 16, label: "Doubles to 5 + 5" },
  { id: "doubles10", lesson: 26, label: "Doubles to 10 + 10" },
  { id: "plus10", lesson: 34, label: "Plus ten" },
  { id: "near", lesson: 42, label: "Doubles plus one" },
  { id: "plus9", lesson: 52, label: "Plus nine: make a ten" },
  { id: "make8", lesson: 62, label: "Make a ten with 8" },
  { id: "make7", lesson: 72, label: "Make a ten with 7" },
  { id: "three", lesson: 94, label: "Adding three numbers" },
];

// Facts that each strategy covers.
function addFactsFor(id) {
  const out = [];
  const push = (a, b) => { if (a + b <= 20) out.push([a, b]); };
  for (let a = 0; a <= 10; a++) {
    if (id === "plus12") { push(a, 0); push(a, 1); push(a, 2); }
    if (id === "turn") { push(0, a); push(1, a); push(2, a); }
    if (id === "doubles5" && a >= 1 && a <= 5) push(a, a);
    if (id === "doubles10" && a >= 6) push(a, a);
    if (id === "plus10") { push(a, 10); push(10, a); }
    if (id === "near" && a >= 1 && a <= 9) { push(a, a + 1); push(a + 1, a); }
    if (id === "plus9" && a >= 2 && a <= 9) { push(9, a); push(a, 9); }
    if (id === "make8" && a >= 3 && a <= 8) { push(8, a); push(a, 8); }
    if (id === "make7" && a >= 4 && a <= 7) { push(7, a); push(a, 7); }
  }
  // Within-10 facts not covered above become fair game with turn-arounds.
  if (id === "turn") for (let a = 3; a <= 7; a++) for (let b = 3; b <= 10 - a; b++) push(a, b);
  return out;
}

const addFacts = {
  id: "add-facts",
  name: "Adding to 20",
  summary: "Learn the addition facts to 20 in an order that builds on what is known: plus one and two, turn-arounds, doubles, plus ten, doubles plus one, plus nine, and making a ten.",
  standard: "1.OA.3, 1.OA.6",
  units: ADD_UNITS,
  pool(intro) {
    return intro.flatMap((u) => addFactsFor(u.id));
  },
  item(r, pool) {
    const [a, b] = r.pick(pool);
    return factStep(a, "+", b);
  },
  threeItem(r) {
    const a = r.int(1, 9), b = 10 - a, c = r.int(1, 9);
    const order = r.shuffle([a, c, b]);
    return test(V.eq(order[0], "+", order[1], "+", order[2], "=", "?"), "Look for two numbers that make ten. Add them first. Then add the third. What is the answer?", Word(a + b + c) + ".",
      fix(Word(a + b + c) + ".", "What is the answer?", `${Word(a)} and ${word(b)} make ten. Ten plus ${word(c)} is ${word(10 + c)}.`), { skill: "add", item: `three:${order.join("+")}` });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const pool = addFactsFor(u.id);
    const steps = [];
    switch (u.id) {
      case "plus12":
        steps.push(model(V.eq(7, "+", 2, "=", "?"), "We know some rules for adding. Plus zero: the number stays the same. Plus one: the next number. Plus two: count on two. My turn. Seven plus two: seeven... eight, nine. Nine."));
        steps.push(lead(V.eq(5, "+", 1, "=", "?"), "Five plus one. Say it with me.", "Six."));
        break;
      case "turn":
        steps.push(model([V.eq(2, "+", 7, "=", 9), V.eq(7, "+", 2, "=", 9)], "Here is a rule. When we turn the numbers around, the answer stays the same. My turn. Seven plus two is nine. So two plus seven is nine too. These are turn-around facts."));
        steps.push(model(V.eq(1, "+", 8, "=", "?"), "One plus eight. Turn it around: eight plus one. Nine. So one plus eight is nine."));
        steps.push(lead(V.eq(2, "+", 6, "=", "?"), "Two plus six. Turn it around with me: six plus two is eight. Two plus six is how many?", "Eight."));
        break;
      case "doubles5":
      case "doubles10": {
        const ex = u.id === "doubles5" ? [3, 3] : [7, 7];
        steps.push(model([V.eq(ex[0], "+", ex[1], "=", ex[0] * 2), V.dots(ex[0] * 2, { arr: "row" })], `A double is a number plus the same number. My turn. ${Word(ex[0])} plus ${word(ex[1])} is ${word(ex[0] * 2)}. Doubles are easy to remember.`));
        const list = u.id === "doubles5" ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10];
        steps.push(lead(V.say(), "Say the doubles with me. Get ready.", list.map((d) => `${Word(d)} plus ${word(d)} is ${word(d * 2)}.`).join(" ")));
        break;
      }
      case "plus10":
        steps.push(model([V.eq(10, "+", 6, "=", 16), V.frame(10, 16, { frames: 2 })], "Here is a rule. Ten plus a number is a teen number. Ten plus six is sixteen: one ten and six ones."));
        steps.push(lead(V.eq(10, "+", 3, "=", "?"), "Ten plus three. Say it with me.", "Thirteen."));
        break;
      case "near":
        steps.push(model(V.eq(6, "+", 7, "=", "?"), "Six plus seven is close to a double. Six plus six is twelve. Seven is one more than six, so the answer is one more than twelve. Six plus seven is thirteen."));
        steps.push(lead(V.eq(4, "+", 5, "=", "?"), "Four plus five. Four plus four is eight, and one more is nine. Say it with me.", "Nine."));
        break;
      case "plus9":
        steps.push(model([V.eq(9, "+", 5, "=", "?"), V.frame(10, 9, { n2: 5, frames: 2 })], "To add nine, make a ten. Nine needs one more to make ten. Take one from the five. That leaves four. Ten plus four is fourteen. Nine plus five is fourteen.", { do: "Point to the empty box in the first frame, then to the dot that moves to fill it." }));
        steps.push(lead(V.eq(9, "+", 3, "=", "?"), "Nine plus three. Nine and one make ten. Two are left. Ten plus two. Say it with me.", "Twelve."));
        break;
      case "make8":
        steps.push(model([V.eq(8, "+", 5, "=", "?"), V.frame(10, 8, { n2: 5, frames: 2 })], "Eight needs two more to make ten. Take two from the five. That leaves three. Ten plus three is thirteen. Eight plus five is thirteen."));
        steps.push(lead(V.eq(8, "+", 4, "=", "?"), "Eight plus four. Eight and two make ten. Two are left. Ten plus two. Say it with me.", "Twelve."));
        break;
      case "make7":
        steps.push(model([V.eq(7, "+", 5, "=", "?"), V.frame(10, 7, { n2: 5, frames: 2 })], "Seven needs three more to make ten. Take three from the five. That leaves two. Ten plus two is twelve. Seven plus five is twelve."));
        steps.push(lead(V.eq(7, "+", 6, "=", "?"), "Seven plus six. Seven and three make ten. Three are left. Ten plus three. Say it with me.", "Thirteen."));
        break;
      case "three":
        steps.push(model(V.eq(4, "+", 3, "+", 6, "=", "?"), "To add three numbers, add two of them first, then add the third. Look for two that make ten. Four and six make ten. Ten plus three is thirteen."));
        steps.push(lead(V.eq(2, "+", 5, "+", 8, "=", "?"), "Which two make ten? Two and eight. Ten plus five. Say it with me.", "Fifteen."));
        steps.push(this.threeItem(r), this.threeItem(r), this.threeItem(r));
        return { title: u.label, steps };
    }
    for (const [a, b] of r.sample(pool, 5)) steps.push(factStep(a, "+", b));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const recent = intro.slice(-2).flatMap((u) => addFactsFor(u.id));
    const all = this.pool(intro);
    const steps = [];
    for (let i = 0; i < 3; i++) steps.push(this.item(r, recent.length ? recent : all));
    for (let i = 0; i < 2; i++) steps.push(this.item(r, all));
    if (intro.some((u) => u.id === "three") && r() < 0.5) steps.push(this.threeItem(r));
    return { title: "Addition facts", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "three") return [this.threeItem(r), this.threeItem(r)];
    const pool = addFactsFor(u.id);
    return [this.item(r, pool), this.item(r, pool), this.item(r, this.pool(units))];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    const [a, b] = r.pick(this.pool(intro));
    return { kind: "write", prompt: "Write the answer.", show: V.eq(a, "+", b, "=", "_"), answer: String(a + b) };
  },
};

// ─────────────────────────────────────────────────────────────
// Subtraction facts to 20
// ─────────────────────────────────────────────────────────────

const SUB_UNITS = [
  { id: "minus12", lesson: 6, label: "Minus zero, one, and two" },
  { id: "from10", lesson: 22, label: "Subtract from ten" },
  { id: "think", lesson: 30, label: "Think addition to subtract" },
  { id: "minus10", lesson: 40, label: "Minus ten" },
  { id: "minus9", lesson: 60, label: "Minus nine" },
  { id: "to20", lesson: 70, label: "Subtract within 20 with number families" },
];

function subFactsFor(id) {
  const out = [];
  if (id === "minus12") for (let a = 2; a <= 12; a++) { out.push([a, 0]); out.push([a, 1]); out.push([a, 2]); }
  if (id === "from10") for (let b = 1; b <= 9; b++) out.push([10, b]);
  if (id === "think") for (let a = 3; a <= 10; a++) for (let b = 3; b < a; b++) out.push([a, b]);
  if (id === "minus10") for (let a = 10; a <= 20; a++) out.push([a, 10]);
  if (id === "minus9") for (let a = 10; a <= 18; a++) out.push([a, 9]);
  if (id === "to20") for (let a = 11; a <= 18; a++) for (let b = 3; b <= 8; b++) if (a - b <= 10) out.push([a, b]);
  return out;
}

const subFacts = {
  id: "sub-facts",
  name: "Subtracting to 20",
  summary: "Learn subtraction facts to 20 by connecting them to addition: minus one and two, subtracting from ten, thinking of the missing part, minus ten, and minus nine.",
  standard: "1.OA.4, 1.OA.6",
  units: SUB_UNITS,
  pool(intro) { return intro.flatMap((u) => subFactsFor(u.id)); },
  item(r, pool) { const [a, b] = r.pick(pool); return factStep(a, "−", b); },
  newEx(u, ctx) {
    const r = ctx.rand;
    const steps = [];
    switch (u.id) {
      case "minus12":
        steps.push(model(V.eq(9, "−", 2, "=", "?"), "Our subtraction rules. Minus zero: the number stays the same. Minus one: the number before. Minus two: count back two. My turn. Nine minus two: nine... eight, seven. Seven."));
        steps.push(lead(V.eq(6, "−", 1, "=", "?"), "Six minus one. Say it with me.", "Five."));
        break;
      case "from10":
        steps.push(model([V.eq(10, "−", 3, "=", "?"), V.frame(10, 7, { n2: 3 })], "We know the partners of ten. Seven and three make ten. So ten minus three is seven."));
        steps.push(lead(V.eq(10, "−", 6, "=", "?"), "Ten minus six. Six and four make ten. Say it with me.", "Four."));
        break;
      case "think":
        steps.push(model([V.eq(9, "−", 5, "=", "?"), V.family(5, "?", 9, "b")], "To subtract, think of the number family. Nine is the big number. Five is one small number. What goes with five to make nine? Four. So nine minus five is four."));
        steps.push(lead(V.eq(8, "−", 3, "=", "?"), "Eight minus three. Three and what make eight? Say it with me.", "Five."));
        break;
      case "minus10":
        steps.push(model([V.eq(16, "−", 10, "=", "?"), V.frame(10, 16, { frames: 2 })], "Here is a rule. A teen number minus ten leaves the ones. Sixteen minus ten is six. We take away the full ten."));
        steps.push(lead(V.eq(13, "−", 10, "=", "?"), "Thirteen minus ten. Say it with me.", "Three."));
        break;
      case "minus9":
        steps.push(model(V.eq(15, "−", 9, "=", "?"), "To take away nine, take away ten and give one back. Fifteen minus ten is five. Give back one: six. Fifteen minus nine is six."));
        steps.push(lead(V.eq(13, "−", 9, "=", "?"), "Thirteen minus nine. Thirteen minus ten is three. Give back one. Say it with me.", "Four."));
        break;
      case "to20":
        steps.push(model([V.eq(14, "−", 6, "=", "?"), V.family(6, "?", 14, "b")], "Fourteen minus six. Think of the family: six and what make fourteen? Six and eight make fourteen. So fourteen minus six is eight."));
        steps.push(lead(V.eq(12, "−", 5, "=", "?"), "Twelve minus five. Five and what make twelve? Say it with me.", "Seven."));
        break;
    }
    for (const [a, b] of r.sample(subFactsFor(u.id), 5)) steps.push(factStep(a, "−", b));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const recent = intro.slice(-2).flatMap((u) => subFactsFor(u.id));
    const all = this.pool(intro);
    const steps = [];
    for (let i = 0; i < 3; i++) steps.push(this.item(r, recent));
    for (let i = 0; i < 2; i++) steps.push(this.item(r, all));
    return { title: "Subtraction facts", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const pool = subFactsFor(units[units.length - 1].id);
    return [this.item(r, pool), this.item(r, pool), this.item(r, this.pool(units))];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    const [a, b] = r.pick(this.pool(intro));
    return { kind: "write", prompt: "Write the answer.", show: V.eq(a, "−", b, "=", "_"), answer: String(a - b) };
  },
};

// ─────────────────────────────────────────────────────────────
// Number families to 20 and fact families
// ─────────────────────────────────────────────────────────────

const families = {
  id: "families",
  name: "Number families",
  summary: "Use number families to 20: add when the big number is missing, subtract when a small number is missing, and write the four facts of a family.",
  standard: "1.OA.4, 1.OA.6",
  units: [
    { id: "review", lesson: 3, max: 10, label: "Number families: review" },
    { id: "to20", lesson: 44, max: 20, label: "Number families to 20" },
    { id: "four", lesson: 50, max: 20, label: "The four facts of a family" },
  ],
  fourItem(r, max) {
    const c = r.int(6, max), a = r.int(2, Math.min(9, c - 2)), b = c - a;
    return test(V.family(a, b, c), "Say the four facts in this family: two plus facts and two minus facts.", `${Word(a)} plus ${word(b)} equals ${word(c)}. ${Word(b)} plus ${word(a)} equals ${word(c)}. ${Word(c)} minus ${word(a)} equals ${word(b)}. ${Word(c)} minus ${word(b)} equals ${word(a)}.`,
      fix(`${Word(a)} plus ${word(b)} equals ${word(c)}. ${Word(b)} plus ${word(a)} equals ${word(c)}. ${Word(c)} minus ${word(a)} equals ${word(b)}. ${Word(c)} minus ${word(b)} equals ${word(a)}.`, "Say the four facts.", "The plus facts start with the small numbers. The minus facts start with the big number."), { skill: "family", item: `four:${a}:${b}` });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    if (u.id === "review") {
      return {
        title: u.label, steps: [
          model([V.family(4, 3, 7, "c")], "A number family has two small numbers and a big number. When the big number is missing, we add. When a small number is missing, we start with the big number and subtract. My turn. The big number is missing. Four plus three is seven."),
          lead(V.family(6, 2, 8, "a"), "Is the big number missing? (No.) So do we add or subtract? Say it with me.", "Subtract. Eight minus two equals six."),
          ...kFamilies.bigItem(r, 10), ...kFamilies.smallItem(r, 10),
        ],
      };
    }
    if (u.id === "to20") {
      return {
        title: u.label, steps: [
          model([V.family(8, 5, 13, "b"), V.eq(13, "−", 8, "=", "?")], "Families work the same way with bigger numbers. A small number is missing, so I subtract. Thirteen minus eight is five."),
          lead(V.family(9, 6, 15, "c"), "The big number is missing. Nine plus six. Say it with me.", "Fifteen."),
          ...kFamilies.bigItem(r, 18), ...kFamilies.smallItem(r, 18),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.family(3, 5, 8), "Every family has four facts. My turn. Two plus facts: three plus five equals eight, and five plus three equals eight. Two minus facts: eight minus three equals five, and eight minus five equals three."),
        lead(V.family(2, 7, 9), "Say the four facts with me.", "Two plus seven equals nine. Seven plus two equals nine. Nine minus two equals seven. Nine minus seven equals two."),
        this.fourItem(r, 12), this.fourItem(r, 18),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const max = Math.max(...intro.map((u) => u.max));
    const steps = [...kFamilies.smallItem(r, max), ...kFamilies.bigItem(r, max).slice(1)];
    if (intro.some((u) => u.id === "four") && r() < 0.5) steps.push(this.fourItem(r, max));
    return { title: "Number families", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "four") return [this.fourItem(r, 18)];
    return [kFamilies.smallItem(r, u.max)[1], kFamilies.bigItem(r, u.max)[1]];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    const max = Math.max(...intro.map((u) => u.max));
    const c = r.int(5, max), a = r.int(1, c - 1), b = c - a;
    const miss = r.pick(["a", "c"]);
    return { kind: "write", prompt: "Find the missing number in the family.", show: V.family(a, b, c, miss), answer: String(miss === "a" ? a : c) };
  },
};

// ─────────────────────────────────────────────────────────────
// Fact fluency
// ─────────────────────────────────────────────────────────────

const fluency = {
  id: "fluency",
  name: "Quick facts",
  summary: "A short daily drill on the facts taught so far, so that the facts within 10, and then within 20, are answered without counting.",
  standard: "1.OA.6",
  units: [{ id: "daily", lesson: 2, label: "Quick facts" }],
  reviewEvery: 1,
  newEx(u, ctx) {
    const r = ctx.rand;
    const add = addFacts.pool(ctx.known("add-facts"));
    return {
      title: u.label, steps: [
        model(V.eq(4, "+", 2, "=", "?"), "Every day we answer some facts quickly. I say the fact. You say the answer, fast. My turn. Four plus two? Six."),
        lead(V.eq(5, "+", 1, "=", "?"), "Five plus one? Say it with me.", "Six."),
        ...r.sample(add, 6).map(([a, b]) => factStep(a, "+", b, { say: `${Word(a)} plus ${word(b)}?` })),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const add = addFacts.pool(ctx.known("add-facts"));
    const sub = subFacts.pool(ctx.known("sub-facts"));
    const steps = [];
    for (let i = 0; i < 6; i++) {
      if (sub.length && i % 2 === 1) { const [a, b] = r.pick(sub); steps.push(factStep(a, "−", b, { say: `${Word(a)} minus ${word(b)}?` })); }
      else { const [a, b] = r.pick(add); steps.push(factStep(a, "+", b, { say: `${Word(a)} plus ${word(b)}?` })); }
    }
    return { title: "Quick facts", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const add = addFacts.pool(ctx.known("add-facts"));
    return r.sample(add, 4).map(([a, b]) => factStep(a, "+", b));
  },
};

// ─────────────────────────────────────────────────────────────
// The equal sign
// ─────────────────────────────────────────────────────────────

const equalSign = {
  id: "equal-sign",
  name: "The equal sign",
  summary: "Equals means the same amount on both sides. Tell whether equations are true or false, and find an unknown number in any position.",
  standard: "1.OA.7, 1.OA.8",
  units: [
    { id: "same", lesson: 38, label: "Equals means the same amount" },
    { id: "truefalse", lesson: 46, label: "True or false" },
    { id: "unknown", lesson: 58, label: "The missing number can be anywhere" },
  ],
  tfItem(r) {
    const kinds = [
      () => { const a = r.int(2, 9), b = r.int(1, 9); return [[a, "+", b, "=", b, "+", a], true]; },
      () => { const a = r.int(2, 9), b = r.int(1, 9); return [[a + b, "=", a, "+", b], true]; },
      () => { const a = r.int(2, 9); return [[a, "=", a], true]; },
      () => { const a = r.int(2, 9), b = r.int(1, 9); return [[a, "+", b, "=", a + b + 1], false]; },
      () => { const a = r.int(2, 9), b = r.int(1, 9); return [[a, "+", b, "=", a, "+", b + 1], false]; },
      () => { const a = r.int(5, 9), b = r.int(1, 4); return [[a, "−", b, "=", a + b], false]; },
      () => { const a = r.int(4, 8), b = r.int(1, 3); return [[a, "+", b, "=", a + b + 2, "−", 2], true]; },
    ];
    const [parts, isTrue] = r.pick(kinds)();
    const ans = isTrue ? "True." : "False.";
    return test(V.eq(...parts), "Is this true or false? Work out each side.", ans, fix(ans, "Is it true or false?", isTrue ? "Both sides are the same amount." : "The two sides are not the same amount."), { skill: "equal", item: `tf:${parts.join("")}` });
  },
  unknownItem(r) {
    const c = r.int(6, 18), a = r.int(2, Math.min(9, c - 1)), b = c - a;
    const forms = [
      [[a, "+", "?", "=", c], b], [["?", "+", b, "=", c], a], [[c, "=", a, "+", "?"], b],
      [[c, "−", "?", "=", a], b], [["?", "−", a, "=", b], c], [[a, "=", c, "−", "?"], b],
    ];
    const [parts, ans] = r.pick(forms);
    return test(V.eq(...parts), "What number goes in the box?", Word(ans) + ".", fix(Word(ans) + ".", "What number goes in the box?", `Think of the family: ${word(a)}, ${word(b)}, and ${word(c)}.`), { skill: "equal", item: `unknown:${parts.join("")}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "same") {
      return {
        title: u.label, steps: [
          model([V.eq(5, "=", 3, "+", 2), V.row(V.dots(5, { size: "sm" }), V.sign("="), V.dots(3, { size: "sm" }), V.sign("+"), V.dots(2, { size: "sm" }))], "The equal sign means the same amount is on both sides. It does not mean the answer comes next. My turn. Five equals three plus two. Five on this side. Three plus two, five, on that side. The same."),
          model(V.eq(4, "+", 4, "=", 6, "+", 2), "Four plus four is eight. Six plus two is eight. Both sides are eight, so they are equal."),
          lead(V.eq(7, "=", 7), "Read it with me.", "Seven equals seven."),
          test(V.eq(9, "=", 5, "+", 4), "Read it. Is it the same on both sides?", "Nine equals five plus four. Yes.", fix("Nine equals five plus four. Yes.", "Read it. Is it the same on both sides?"), { skill: "equal", item: "same:9" }),
          test(V.eq(3, "+", 5, "=", 5, "+", 3), "Read it. Is it the same on both sides?", "Three plus five equals five plus three. Yes.", fix("Three plus five equals five plus three. Yes.", "Read it. Is it the same on both sides?"), { skill: "equal", item: "same:turn" }),
        ],
      };
    }
    if (u.id === "truefalse") {
      return {
        title: u.label, steps: [
          model(V.eq(6, "+", 1, "=", 8), "A true equation has the same amount on both sides. A false one does not. My turn. Six plus one is seven. Seven is not eight. This is false."),
          model(V.eq(10, "=", 6, "+", 4), "Ten. Six plus four is ten. Ten and ten. This is true."),
          lead(V.eq(2, "+", 5, "=", 5, "+", 2), "True or false? Say it with me.", "True."),
          this.tfItem(r), this.tfItem(r), this.tfItem(r), this.tfItem(r),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model([V.eq(8, "+", "?", "=", 13), V.family(8, "?", 13, "b")], "The box can be anywhere. Use the number family. Eight plus how many equals thirteen? Thirteen is the big number. Eight is a small number. Thirteen minus eight is five. The box is five."),
        model([V.eq("?", "−", 4, "=", 6), V.family(4, 6, "?", "c")], "How many minus four equals six? The box is the number we start with, the big number. Four plus six is ten. The box is ten."),
        lead(V.eq(5, "+", "?", "=", 12), "Five plus how many equals twelve? Twelve minus five. Say it with me.", "Seven."),
        this.unknownItem(r), this.unknownItem(r), this.unknownItem(r), this.unknownItem(r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [];
    if (has("truefalse")) steps.push(this.tfItem(r), this.tfItem(r));
    else steps.push(test(V.eq(r.int(3, 9), "=", r.int(3, 9)), "Read it. Is it the same on both sides?", "(Reads it and says yes or no.)", fixPoint("Both sides must be the same amount.", "Is it the same on both sides?"), { skill: "equal", item: "same" }));
    if (has("unknown")) steps.push(this.unknownItem(r), this.unknownItem(r));
    return { title: "The equal sign", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "unknown") return [this.unknownItem(r), this.unknownItem(r)];
    if (u.id === "truefalse") return [this.tfItem(r), this.tfItem(r)];
    return [test(V.eq(8, "=", 4, "+", 4), "Read it. Is it the same on both sides?", "Eight equals four plus four. Yes.", fix("Eight equals four plus four. Yes.", "Read it. Is it the same on both sides?"), { skill: "equal", item: "same:8" })];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    if (intro.some((u) => u.id === "unknown")) {
      const it = this.unknownItem(r);
      return { kind: "write", prompt: "Write the missing number.", show: V.eq(...it.screen[0].parts.map((p) => (p === "?" ? "_" : p))), answer: it.answer.replace(".", "") };
    }
    return [];
  },
};

// ─────────────────────────────────────────────────────────────
// Story problems of every kind
// ─────────────────────────────────────────────────────────────

const NAMES = ["Ana", "Ben", "Cora", "Dev", "Eli", "Faye", "Gus", "Hana", "Ivy", "Jon", "Kai", "Lena", "Max", "Nell", "Omar", "Pia", "Ray", "Sam", "Tess", "Will"];
const THINGS = ["stickers", "marbles", "shells", "crayons", "stamps", "acorns", "rocks", "beads", "cards", "buttons"];

const stories = {
  id: "stories",
  name: "Story problems",
  summary: "Solve story problems within 20 of every kind: adding to, taking from, putting together, taking apart, and comparing, with the unknown in any place, using number families to decide whether to add or subtract.",
  standard: "1.OA.1, 1.OA.2",
  units: [
    { id: "result", lesson: 5, label: "Adding to and taking from" },
    { id: "parts", lesson: 15, label: "Putting together and taking apart" },
    { id: "change", lesson: 28, label: "How many came or went" },
    { id: "more", lesson: 40, label: "How many more" },
    { id: "fewer", lesson: 54, label: "How many fewer" },
    { id: "start", lesson: 68, label: "How many at the start" },
    { id: "three", lesson: 96, label: "Three numbers in one story" },
  ],
  // Each kind returns [story text, family a, b, c, which is missing].
  make(r, kind, max) {
    const name = r.pick(NAMES), other = r.pick(NAMES.filter((n) => n !== name)), thing = r.pick(THINGS);
    const c = r.int(6, max), a = r.int(2, Math.min(c - 2, 12)), b = c - a;
    switch (kind) {
      case "result+": return { text: `${name} had ${word(a)} ${thing}. ${name} got ${word(b)} more. How many ${thing} does ${name} have now?`, a, b, c, miss: "c" };
      case "result-": return { text: `${name} had ${word(c)} ${thing}. ${name} gave away ${word(a)}. How many ${thing} does ${name} have now?`, a, b, c, miss: "b" };
      case "together": return { text: `${name} has ${word(a)} red ${thing} and ${word(b)} blue ${thing}. How many ${thing} does ${name} have in all?`, a, b, c, miss: "c" };
      case "apart": return { text: `${name} has ${word(c)} ${thing}. ${Word(a)} are red. The rest are blue. How many are blue?`, a, b, c, miss: "b" };
      case "change+": return { text: `${name} had ${word(a)} ${thing}. ${name} found some more. Now ${name} has ${word(c)}. How many did ${name} find?`, a, b, c, miss: "b" };
      case "change-": return { text: `${name} had ${word(c)} ${thing}. ${name} lost some. Now ${name} has ${word(a)}. How many did ${name} lose?`, a, b: c - a, c, miss: "b" };
      case "more": return { text: `${name} has ${word(c)} ${thing}. ${other} has ${word(a)} ${thing}. How many more ${thing} does ${name} have than ${other}?`, a, b, c, miss: "b" };
      case "fewer": return { text: `${name} has ${word(a)} ${thing}. ${other} has ${word(c)} ${thing}. How many fewer ${thing} does ${name} have than ${other}?`, a, b, c, miss: "b" };
      case "start+": return { text: `${name} had some ${thing}. ${name} got ${word(b)} more. Now ${name} has ${word(c)}. How many did ${name} have at the start?`, a, b, c, miss: "a" };
      case "start-": return { text: `${name} had some ${thing}. ${name} gave away ${word(a)}. Now ${name} has ${word(b)}. How many did ${name} have at the start?`, a, b, c, miss: "c" };
      default: return null;
    }
  },
  kindsFor(intro) {
    const k = [];
    const has = (id) => intro.some((u) => u.id === id);
    k.push("result+", "result-");
    if (has("parts")) k.push("together", "apart");
    if (has("change")) k.push("change+", "change-");
    if (has("more")) k.push("more");
    if (has("fewer")) k.push("fewer");
    if (has("start")) k.push("start+", "start-");
    return k;
  },
  steps(p, full) {
    const big = p.miss === "c";
    const ans = p.miss === "a" ? p.a : p.miss === "b" ? p.b : p.c;
    const knownSmall = p.miss === "a" ? p.b : p.a;
    const opLine = big ? `${Word(p.a)} plus ${word(p.b)} equals ${word(p.c)}.` : `${Word(p.c)} minus ${word(knownSmall)} equals ${word(ans)}.`;
    const out = [];
    if (full) {
      out.push(test(V.family(p.miss === "a" ? "?" : p.a, p.miss === "b" ? "?" : p.b, p.miss === "c" ? "?" : p.c, p.miss), `${p.text} Is the big number missing?`, big ? "Yes." : "No.",
        fix(big ? "Yes." : "No.", "Is the big number missing?", big ? "We are finding the total, so the big number is missing." : `The big number is ${word(p.c)}. We know it.`), { skill: "story", item: `story-big:${p.miss}` }));
      out.push(test(V.family(p.miss === "a" ? "?" : p.a, p.miss === "b" ? "?" : p.b, p.miss === "c" ? "?" : p.c, p.miss), "So do we add or subtract? Say the number problem.", `${big ? "Add" : "Subtract"}. ${opLine}`,
        fix(`${big ? "Add" : "Subtract"}. ${opLine}`, "Do we add or subtract? Say the number problem.", big ? "When the big number is missing, we add." : "When a small number is missing, we subtract from the big number."), { skill: "story", item: `story-op:${p.miss}` }));
    }
    out.push(test(V.say(), full ? "What is the answer to the story?" : `${p.text}`, Word(ans) + ".", fix(Word(ans) + ".", "What is the answer?", opLine), { skill: "story", item: `story:${p.a}:${p.b}:${p.c}` }));
    return out;
  },
  threeItem(r) {
    const name = r.pick(NAMES), thing = r.pick(THINGS);
    const a = r.int(2, 6), b = r.int(2, 6), c = r.int(1, 20 - a - b > 6 ? 6 : 20 - a - b);
    return test(V.say(), `${name} found ${word(a)} ${thing} on Monday, ${word(b)} on Tuesday, and ${word(c)} on Wednesday. How many ${thing} did ${name} find in all?`, Word(a + b + c) + ".",
      fix(Word(a + b + c) + ".", "How many in all?", `Add two numbers first, then the third. ${Word(a)} plus ${word(b)} is ${word(a + b)}. ${Word(a + b)} plus ${word(c)} is ${word(a + b + c)}.`), { skill: "story", item: "story-three" });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const max = 20;
    const fams = {
      result: V.family(5, 3, "?", "c"), parts: V.family(6, 4, "?", "c"), change: V.family(7, "?", 12, "b"),
      more: V.family(7, "?", 11, "b"), fewer: V.family(6, "?", 10, "b"), start: V.family("?", 5, 13, "a"),
    };
    const intros = {
      result: ["result+", "Listen. Ana had five shells. Ana found three more. How many shells does Ana have now? My turn. We make a number family. Ana got more, so we are finding the big number. The big number is missing, so we add. Five plus three equals eight. Ana has eight shells."],
      parts: ["together", "Listen. Ben has six red crayons and four blue crayons. How many crayons in all? The red and blue are the small numbers. In all is the big number. It is missing, so we add. Six plus four equals ten."],
      change: ["change+", "Listen. Cora had seven stamps. She got some more. Now she has twelve. How many did she get? My turn. Twelve is the big number. Seven is a small number. The other small number is missing, so we subtract. Twelve minus seven equals five. Cora got five stamps."],
      more: ["more", "Listen. Dev has eleven marbles. Eli has seven marbles. How many more marbles does Dev have than Eli? My turn. Dev has more, so eleven is the big number. Eli's seven is a small number. How many more is the missing small number. We subtract. Eleven minus seven equals four. Dev has four more."],
      fewer: ["fewer", "Listen. Faye has six rocks. Gus has ten rocks. How many fewer rocks does Faye have than Gus? My turn. Gus has more, so ten is the big number. Faye's six is a small number. How many fewer is the other small number. Ten minus six equals four. Faye has four fewer."],
      start: ["start+", "Listen. Hana had some beads. She got five more. Now she has thirteen. How many did she have at the start? My turn. Thirteen is the big number. Five is a small number. The start is the missing small number. Thirteen minus five equals eight. She had eight at the start."],
    };
    if (u.id === "three") {
      return {
        title: u.label, steps: [
          model(V.say(), "Listen. Ivy read three books on Monday, four on Tuesday, and six on Wednesday. How many books did she read in all? My turn. In all means add all three. Three plus four is seven. Seven plus six is thirteen. Ivy read thirteen books."),
          lead(V.say(), "Jon has two red cars, five blue cars, and eight green cars. How many cars in all? Look for two that make ten: two and eight. Ten plus five. Say it with me.", "Fifteen."),
          this.threeItem(r), this.threeItem(r),
        ],
      };
    }
    const [kind, script] = intros[u.id];
    const p = this.make(r, kind, max);
    const steps = [
      model(fams[u.id], script, { do: "As you talk, point to the family: the two small numbers on the arrow, the big number at the end." }),
      lead(V.family(p.miss === "a" ? "?" : p.a, p.miss === "b" ? "?" : p.b, p.miss === "c" ? "?" : p.c, p.miss), `${p.text} Is the big number missing? Do we add or subtract? Work it out with me.`, `${p.miss === "c" ? "Add" : "Subtract"}. ${Word(p.miss === "a" ? p.a : p.miss === "b" ? p.b : p.c)}.`),
      ...this.steps(this.make(r, kind, max), true),
      ...this.steps(this.make(r, r.pick(this.kindsFor(intro)), max), true),
    ];
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const kinds = this.kindsFor(intro);
    const steps = [...this.steps(this.make(r, r.pick(kinds.slice(-3)), 20), true), ...this.steps(this.make(r, r.pick(kinds), 20), false)];
    if (intro.some((u) => u.id === "three") && r() < 0.4) steps.push(this.threeItem(r));
    return { title: "Story problems", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "three") return [this.threeItem(r)];
    const kinds = this.kindsFor(units);
    return [...this.steps(this.make(r, kinds[kinds.length - 1], 20), false), ...this.steps(this.make(r, r.pick(kinds), 20), false)];
  },
};

// ─────────────────────────────────────────────────────────────
// Two-digit adding and subtracting
// ─────────────────────────────────────────────────────────────

const twoDigit = {
  id: "two-digit",
  name: "Two-digit adding",
  summary: "Add a one-digit number or a multiple of ten to a two-digit number, sometimes making a new ten, and subtract tens, using tens-and-ones drawings.",
  standard: "1.NBT.4, 1.NBT.6",
  units: [
    { id: "plusone", lesson: 84, label: "Two-digit plus one-digit" },
    { id: "plustens", lesson: 92, label: "Two-digit plus tens" },
    { id: "newten", lesson: 102, label: "Making a new ten" },
    { id: "minustens", lesson: 112, label: "Subtract tens from tens" },
    { id: "twominustens", lesson: 120, label: "Two-digit minus tens" },
    { id: "twotwo", lesson: 128, label: "Two-digit plus two-digit" },
  ],
  gen(r, id) {
    let a, b, op = "+";
    if (id === "plusone") { a = r.int(2, 8) * 10 + r.int(1, 5); b = r.int(1, 9 - (a % 10)); }
    else if (id === "plustens") { a = r.int(12, 59); b = r.int(1, 9 - Math.floor(a / 10)) * 10; }
    else if (id === "newten") { a = r.int(1, 8) * 10 + r.int(5, 9); b = r.int(10 - (a % 10), 9); }
    else if (id === "minustens") { a = r.int(3, 9) * 10; b = r.int(1, a / 10 - 1) * 10; op = "−"; }
    else if (id === "twominustens") { a = r.int(31, 99); b = r.int(1, Math.floor(a / 10) - 1) * 10; op = "−"; }
    else {
      const t1 = r.int(1, 6), o1 = r.int(1, 4);
      a = t1 * 10 + o1;
      b = r.int(1, 8 - t1) * 10 + r.int(1, 9 - o1);
    }
    return { a, b, op, ans: op === "+" ? a + b : a - b };
  },
  item(r, id, withPv) {
    const p = this.gen(r, id);
    const screen = withPv ? [V.eq(p.a, p.op, p.b, "=", "?"), V.row(V.pv(Math.floor(p.a / 10), p.a % 10), V.sign(p.op), V.pv(Math.floor(p.b / 10), p.b % 10))] : V.eq(p.a, p.op, p.b, "=", "?");
    const how = p.op === "−" ? "Take away the tens. The ones stay the same." : id === "newten" ? "Add the ones. If there are ten or more ones, make a new ten." : "Add the tens to the tens and the ones to the ones.";
    return test(screen, `${Word(p.a)} ${p.op === "+" ? "plus" : "minus"} ${word(p.b)} equals how many?`, Word(p.ans) + ".",
      fix(Word(p.ans) + ".", `${Word(p.a)} ${p.op === "+" ? "plus" : "minus"} ${word(p.b)} equals how many?`, how), { skill: "add", item: `2d:${p.a}${p.op}${p.b}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const models = {
      plusone: [[V.eq(43, "+", 5, "=", "?"), V.row(V.pv(4, 3), V.sign("+"), V.pv(0, 5))], "Forty-three plus five. We add ones to ones. Three ones plus five ones is eight ones. The tens stay the same: four tens. Four tens and eight ones is forty-eight."],
      plustens: [[V.eq(26, "+", 30, "=", "?"), V.row(V.pv(2, 6), V.sign("+"), V.pv(3, 0))], "Twenty-six plus thirty. We add tens to tens. Two tens plus three tens is five tens. The ones stay the same: six. Fifty-six."],
      newten: [[V.eq(38, "+", 5, "=", "?"), V.row(V.pv(3, 8), V.sign("+"), V.pv(0, 5))], "Thirty-eight plus five. Eight ones plus five ones is thirteen ones. That is enough for a new ten. Thirteen ones is one ten and three ones. Now there are four tens and three ones. Forty-three."],
      minustens: [[V.eq(70, "−", 30, "=", "?"), V.pv(7, 0)], "Seventy minus thirty. Seven tens take away three tens is four tens. Forty."],
      twominustens: [[V.eq(64, "−", 20, "=", "?"), V.pv(6, 4)], "Sixty-four minus twenty. Take away two tens. Six tens minus two tens is four tens. The ones stay the same: four. Forty-four."],
      twotwo: [[V.eq(32, "+", 45, "=", "?"), V.row(V.pv(3, 2), V.sign("+"), V.pv(4, 5))], "Thirty-two plus forty-five. Ones first: two plus five is seven. Then tens: three tens plus four tens is seven tens. Seventy-seven."],
    };
    const [screen, say] = models[u.id];
    const p = this.gen(r, u.id);
    return {
      title: u.label, steps: [
        model(screen, `My turn. ${say}`, { do: "Point to the ones, then the tens, as you say them." }),
        lead([V.eq(p.a, p.op, p.b, "=", "?"), V.row(V.pv(Math.floor(p.a / 10), p.a % 10), V.sign(p.op), V.pv(Math.floor(p.b / 10), p.b % 10))], "Work it out with me. Ones first, then tens.", Word(p.ans) + "."),
        this.item(r, u.id, true), this.item(r, u.id, true), this.item(r, u.id, false), this.item(r, u.id, false),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const ids = favorNew(r, intro.map((u) => u.id), 3);
    return { title: "Two-digit adding", steps: ids.map((id, i) => this.item(r, id, i === 0)) };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    return [this.item(r, u.id, false), this.item(r, u.id, false)];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    const id = r.pick(intro.map((u) => u.id));
    const p = this.gen(r, id);
    return { kind: "write", prompt: "Solve. You can draw tens and ones to help.", show: V.eq(p.a, p.op, p.b, "=", "_"), answer: String(p.ans) };
  },
};

// ─────────────────────────────────────────────────────────────
// Length
// ─────────────────────────────────────────────────────────────

const length = {
  id: "length",
  name: "Length",
  summary: "Order three objects by length, compare two lengths by using a third, and measure length with same-size units laid end to end with no gaps or overlaps.",
  standard: "1.MD.1, 1.MD.2",
  units: [
    { id: "order", lesson: 20, label: "Longest and shortest" },
    { id: "indirect", lesson: 32, label: "Comparing with a third object" },
    { id: "measure", lesson: 42, label: "Measuring with units" },
    { id: "nogaps", lesson: 54, label: "No gaps, no overlaps" },
  ],
  orderItem(r) {
    const sizes = r.shuffle([1, 0.7, 0.4]);
    const want = r() < 0.5 ? "longest" : "shortest";
    const ans = sizes.indexOf(want === "longest" ? 1 : 0.4);
    return test(V.size("long", sizes, { icon: r.pick(["pencil", "ribbon"]), tap: true, ans }), `Touch the ${want} one.`, `(Touches the ${want}.)`, fixPoint(`The ends are lined up. The ${want} one ${want === "longest" ? "goes farthest" : "stops first"}. (Touch it.)`, `Touch the ${want} one.`), { skill: "measure", item: `len:${want}` });
  },
  indirectItem(r) {
    const [x, y, z] = r.sample(["the rope", "the ribbon", "the string", "the stick", "the belt"], 3);
    return test(V.say(), `${cap(x)} is longer than ${y}. ${cap(y)} is longer than ${z}. Is ${x} longer or shorter than ${z}?`, "Longer.",
      fix("Longer.", `Is ${x} longer or shorter than ${z}?`, `${cap(x)} is longer than ${y}, and ${y} is longer than ${z}. So ${x} is longer than ${z}.`), { skill: "measure", item: "indirect" });
  },
  measureItem(r) {
    const n = r.int(3, 8);
    return test(V.measure("pencil", n), "How many paper clips long is the pencil?", `${Word(n)} paper clips.`, fix(`${Word(n)} paper clips.`, "How many paper clips long is the pencil?", "Count the clips from one end to the other."), { skill: "measure", item: `measure:${n}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "order") {
      return {
        title: u.label, steps: [
          model(V.size("long", [0.7, 1, 0.4], { icon: "ribbon" }), "To put things in order by length, line up the ends. My turn. This ribbon is longest. This one is shortest. This one is in the middle."),
          lead(V.size("long", [0.4, 0.7, 1], { icon: "pencil", tap: true, ans: 2 }), "Touch the longest pencil with me.", "(Touches the longest.)"),
          this.orderItem(r), this.orderItem(r), this.orderItem(r),
        ],
      };
    }
    if (u.id === "indirect") {
      return {
        title: u.label, steps: [
          model(V.say(), "Sometimes we cannot put two things side by side. We can use a third thing. My turn. The rug is longer than the string. The string is longer than the bed. So the rug is longer than the bed."),
          lead(V.say(), "The hose is longer than the rope. The rope is longer than the jump rope. Is the hose longer or shorter than the jump rope? Say it with me.", "Longer."),
          this.indirectItem(r), this.indirectItem(r),
        ],
      };
    }
    if (u.id === "measure") {
      return {
        title: u.label, steps: [
          model(V.measure("pencil", 5), "We can measure how long something is with units that are all the same size. My turn. These paper clips go from one end of the pencil to the other. One, two, three, four, five. The pencil is five paper clips long."),
          lead(V.measure("pencil", 4), "Count the clips with me.", "One, two, three, four. Four paper clips."),
          this.measureItem(r), this.measureItem(r),
          note(V.say(), "Now measure something real. Lay paper clips, or any small things that are all the same size, end to end along a spoon. How many long is it?", { do: "Make sure the clips touch end to end.", materials: true }),
        ],
        materials: "about ten paper clips, or other small objects all the same size",
      };
    }
    return {
      title: u.label, steps: [
        model(V.measure("pencil", 5), "When we measure, the units must touch end to end. No gaps between them, and no overlaps. If there are gaps, the count will be too small. If they overlap, the count will be too big."),
        lead(V.say(), "Can there be gaps between the units? Say it with me.", "No."),
        test(V.say(), "Can the units overlap?", "No.", fix("No.", "Can the units overlap?", "Each unit starts where the last one ends."), { skill: "measure", item: "overlap" }),
        this.measureItem(r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [this.orderItem(r)];
    if (has("indirect")) steps.push(this.indirectItem(r));
    if (has("measure")) steps.push(this.measureItem(r));
    return { title: "Length", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "order") return [this.orderItem(r)];
    if (u.id === "indirect") return [this.indirectItem(r)];
    return [this.measureItem(r)];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    if (intro.some((u) => u.id === "measure")) {
      const n = r.int(3, 8);
      return { kind: "write", prompt: "How many paper clips long?", show: V.measure("pencil", n), answer: String(n) };
    }
    return [];
  },
};

// ─────────────────────────────────────────────────────────────
// Time
// ─────────────────────────────────────────────────────────────

const time = {
  id: "time",
  name: "Telling time",
  summary: "Tell and write time to the hour and half hour on clock faces and digital clocks.",
  standard: "1.MD.3",
  units: [
    { id: "hands", lesson: 82, label: "The hour hand and the minute hand" },
    { id: "oclock", lesson: 88, label: "Time to the hour" },
    { id: "half", lesson: 100, label: "Time to the half hour" },
    { id: "digital", lesson: 110, label: "Digital clocks" },
    { id: "match", lesson: 118, label: "Match clock faces and digital clocks" },
  ],
  say(h, m) {
    return m === 0 ? `${Word(h)} o'clock.` : `Half past ${word(h)}.`;
  },
  readItem(r, half, digital) {
    const h = r.int(1, 12), m = half && r() < 0.6 ? 30 : 0;
    return test(V.clock(h, m, { digital }), "What time is it?", this.say(h, m), fix(this.say(h, m), "What time is it?", m === 0 ? `The minute hand points to twelve, so it is o'clock. The hour hand points to ${word(h)}.` : `The minute hand points to six, so it is half past. The hour hand is just past ${word(h)}.`), { skill: "time", item: `time:${h}:${m}` });
  },
  matchItem(r) {
    const h = r.int(1, 12), m = r.pick([0, 30]);
    const wrong = [[h, m === 0 ? 30 : 0], [(h % 12) + 1, m]];
    const opts = r.shuffle([[h, m], ...wrong]);
    const ans = opts.findIndex(([a, b]) => a === h && b === m);
    return test(V.row(V.clock(h, m, { size: "md" }), V.choices(opts.map(([a, b]) => V.clock(a, b, { digital: true })), ans)), "Touch the digital clock that shows the same time.", `(Touches ${h}:${m === 0 ? "00" : "30"}.)`, fixPoint(`This clock shows ${this.say(h, m).toLowerCase()} That is ${h}:${m === 0 ? "00" : "30"}. (Touch it.)`, "Touch the digital clock that shows the same time."), { skill: "time", item: "time-match" });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "hands") {
      return {
        title: u.label, steps: [
          model(V.clock(3, 0), "This is a clock. It has two hands. The short hand is the hour hand. It points to the hour. The long hand is the minute hand. My turn. The short hand points to three."),
          lead(V.clock(5, 0), "Which hand is the short hand? Say it with me.", "The hour hand."),
          test(V.clock(8, 0), "What number does the hour hand point to?", "Eight.", fix("Eight.", "What number does the hour hand point to?", "The hour hand is the short hand."), { skill: "time", item: "hour-hand" }),
          test(V.clock(2, 0), "Which hand is the long hand?", "The minute hand.", fix("The minute hand.", "Which hand is the long hand?"), { skill: "time", item: "minute-hand" }),
        ],
      };
    }
    if (u.id === "oclock") {
      return {
        title: u.label, steps: [
          model(V.clock(4, 0), "When the minute hand points straight up to twelve, it is o'clock. The hour hand tells which o'clock. My turn. The hour hand points to four. It is four o'clock."),
          lead(V.clock(9, 0), "What time is it? Say it with me.", "Nine o'clock."),
          this.readItem(r, false), this.readItem(r, false), this.readItem(r, false),
        ],
      };
    }
    if (u.id === "half") {
      return {
        title: u.label, steps: [
          model(V.clock(2, 30), "When the minute hand points straight down to six, it is half past. The hour hand is halfway between two numbers. We say the number it has passed. My turn. Half past two."),
          lead(V.clock(7, 30), "What time is it? Say it with me.", "Half past seven."),
          this.readItem(r, true), this.readItem(r, true), this.readItem(r, true),
        ],
      };
    }
    if (u.id === "digital") {
      return {
        title: u.label, steps: [
          model(V.clock(6, 0, { digital: true }), "A digital clock shows time with numbers. The number before the dots is the hour. The numbers after the dots are the minutes. Six, zero, zero means six o'clock."),
          model(V.clock(6, 30, { digital: true }), "Six, thirty means thirty minutes past six. That is half past six."),
          lead(V.clock(11, 0, { digital: true }), "What time is it? Say it with me.", "Eleven o'clock."),
          this.readItem(r, true, true), this.readItem(r, true, true),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.row(V.clock(3, 30, { size: "md" }), V.clock(3, 30, { digital: true })), "These two clocks show the same time: half past three, three thirty."),
        lead(V.row(V.clock(10, 0, { size: "md" }), V.clock(10, 0, { digital: true })), "Do these show the same time? Say it with me.", "Yes. Ten o'clock."),
        this.matchItem(r), this.matchItem(r),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    if (!has("oclock")) return { title: "Telling time", steps: [test(V.clock(r.int(1, 12), 0), "What number does the hour hand point to?", "(Says the hour.)", fixPoint("The short hand is the hour hand.", "What number does the hour hand point to?"), { skill: "time", item: "hour-hand" })] };
    const steps = [this.readItem(r, has("half")), this.readItem(r, has("half"), has("digital") && r() < 0.5)];
    if (has("match")) steps.push(this.matchItem(r));
    return { title: "Telling time", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const has = (id) => units.some((u) => u.id === id);
    if (!has("oclock")) return [test(V.clock(6, 0), "Which hand is the short hand?", "The hour hand.", fix("The hour hand.", "Which hand is the short hand?"), { skill: "time", item: "hands" })];
    if (has("match")) return [this.matchItem(r), this.readItem(r, true)];
    return [this.readItem(r, has("half"), has("digital")), this.readItem(r, has("half"))];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    if (!intro.some((u) => u.id === "oclock")) return [];
    const h = r.int(1, 12), m = intro.some((u) => u.id === "half") && r() < 0.5 ? 30 : 0;
    return { kind: "write", prompt: "Write the time.", show: V.clock(h, m, { size: "sm" }), answer: `${h}:${m === 0 ? "00" : "30"}` };
  },
};

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

const data = {
  id: "data",
  name: "Graphs and tallies",
  summary: "Read and make tally marks, picture graphs, and tally charts with up to three groups; tell how many in each, how many in all, and how many more.",
  standard: "1.MD.4",
  units: [
    { id: "tally", lesson: 58, label: "Tally marks" },
    { id: "picture", lesson: 66, label: "Reading a picture graph" },
    { id: "compare", lesson: 78, label: "How many more, how many in all" },
    { id: "chart", lesson: 90, label: "Tally charts" },
  ],
  tallyItem(r) {
    const n = r.int(3, 14);
    return test(V.tally(n), "How many tally marks? Count the bundles by fives, then the rest.", Word(n) + ".", fix(Word(n) + ".", "How many tally marks?", "Each bundle with a line across is five."), { skill: "data", item: `tally:${n}` });
  },
  graphQ(r, kind) {
    const icons = r.sample(["apple", "ball", "star", "fish", "duck"], 3);
    const ns = r.sample([2, 3, 4, 5, 6, 7, 8], 3);
    const g = V.graph(kind === "chart" ? "tally" : "picture", icons.map((icon, i) => ({ icon, n: ns[i] })));
    const qs = [
      () => { const i = r.int(0, 2); return [`How many ${plural(icons[i])}?`, Word(ns[i]) + "."]; },
      () => [`How many in all?`, Word(ns[0] + ns[1] + ns[2]) + "."],
      () => { const [i, j] = r.sample([0, 1, 2], 2); const big = ns[i] > ns[j] ? i : j, small = big === i ? j : i; return [`How many more ${plural(icons[big])} than ${plural(icons[small])}?`, Word(ns[big] - ns[small]) + "."]; },
    ];
    const pick = kind === "picture" || kind === "tally" ? qs[0] : r.pick(qs);
    const [q, a] = pick();
    return test(g, q, a, fix(a, q, "Count each row carefully."), { skill: "data", item: `graph:${q}` });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "tally") {
      return {
        title: u.label, steps: [
          model(V.tally(7), "Tally marks are a quick way to count. We make one mark for each thing. The fifth mark goes across the other four to make a bundle of five. My turn. Five, six, seven. Seven tally marks.", { do: "Touch the bundle and say five, then count on." }),
          lead(V.tally(12), "Count with me. Count each bundle by fives: five, ten. Then the rest.", "Five, ten, eleven, twelve. Twelve."),
          this.tallyItem(r), this.tallyItem(r),
        ],
      };
    }
    if (u.id === "picture") {
      return {
        title: u.label, steps: [
          model(V.graph("picture", [{ icon: "apple", n: 4 }, { icon: "ball", n: 6 }, { icon: "star", n: 3 }]), "This is a picture graph. Each row shows one group. My turn. Apples: four. Balls: six. Stars: three."),
          lead(V.graph("picture", [{ icon: "fish", n: 5 }, { icon: "duck", n: 2 }, { icon: "apple", n: 7 }]), "How many ducks? Say it with me.", "Two."),
          this.graphQ(r, "picture"), this.graphQ(r, "picture"),
        ],
      };
    }
    if (u.id === "compare") {
      return {
        title: u.label, steps: [
          model(V.graph("picture", [{ icon: "apple", n: 7 }, { icon: "ball", n: 3 }, { icon: "star", n: 5 }]), "My turn. How many more apples than balls? Seven apples. Three balls. Seven minus three is four. Four more apples. How many in all? Seven plus three plus five is fifteen."),
          lead(V.graph("picture", [{ icon: "fish", n: 6 }, { icon: "duck", n: 4 }, { icon: "apple", n: 2 }]), "How many more fish than ducks? Six minus four. Say it with me.", "Two."),
          this.graphQ(r, "compare"), this.graphQ(r, "compare"),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.graph("tally", [{ icon: "apple", n: 6 }, { icon: "ball", n: 9 }, { icon: "star", n: 4 }]), "This is a tally chart. Each row has tally marks for one group. My turn. Apples: five, six. Balls: five, six, seven, eight, nine. Stars: four."),
        lead(V.graph("tally", [{ icon: "fish", n: 7 }, { icon: "duck", n: 3 }, { icon: "apple", n: 5 }]), "How many fish? Say it with me.", "Seven."),
        this.graphQ(r, "chart"), this.graphQ(r, "chart"),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [this.tallyItem(r)];
    if (has("picture")) steps.push(this.graphQ(r, has("compare") ? "compare" : "picture"));
    if (has("chart")) steps.push(this.graphQ(r, "chart"));
    return { title: "Graphs and tallies", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "tally") return [this.tallyItem(r)];
    return [this.graphQ(r, u.id === "picture" ? "picture" : u.id === "chart" ? "chart" : "compare")];
  },
  worksheet(intro, ctx) {
    const r = ctx.rand;
    const n = r.int(4, 14);
    return { kind: "write", prompt: "How many tally marks? Write the number.", show: V.tally(n), answer: String(n) };
  },
};

// ─────────────────────────────────────────────────────────────
// Shapes and equal parts
// ─────────────────────────────────────────────────────────────

const shapes = {
  id: "shapes",
  name: "Shapes and equal parts",
  summary: "Tell which features make a shape what it is, name trapezoids and half-circles, build shapes from shapes, and cut circles and rectangles into halves and fourths.",
  standard: "1.G.1, 1.G.2, 1.G.3",
  units: [
    { id: "attributes", lesson: 18, label: "What makes a shape a shape" },
    { id: "names", lesson: 28, label: "Trapezoids and half-circles" },
    { id: "compose", lesson: 48, label: "Building shapes from shapes" },
    { id: "halves", lesson: 104, label: "Halves" },
    { id: "fourths", lesson: 114, label: "Fourths" },
    { id: "equal", lesson: 124, label: "Equal parts and unequal parts" },
    { id: "smaller", lesson: 134, label: "More parts means smaller parts" },
  ],
  attrItem(r) {
    const qs = [
      ["Does color change what shape it is?", "No.", "Color does not matter."],
      ["Does size change what shape it is?", "No.", "Size does not matter."],
      ["Does turning a shape change what shape it is?", "No.", "Turning does not matter."],
      ["How many sides does every triangle have?", "Three.", "Every triangle has three straight sides."],
      ["How many sides does every rectangle have?", "Four.", "Every rectangle has four sides and four square corners."],
      ["Is a shape with a curved side a triangle?", "No.", "A triangle has three straight sides."],
      ["Is a shape that is not closed a triangle?", "No.", "A triangle is closed all the way around."],
    ];
    const [q, a, why] = r.pick(qs);
    return test(V.shape(r.pick(["triangle", "rectangle", "square", "hexagon"]), { c: r.pick(["red", "blue", "green", "orange"]), rot: r.pick([0, 30, 90]) }), q, a, fix(a, q, why), { skill: "shape", item: `attr:${q}` });
  },
  nameItem(r, pool) {
    const s = r.pick(pool);
    const names = { "semicircle": "A half-circle." };
    const ans = names[s] || `A ${s}.`;
    return test(V.shape(s, { c: r.pick(["red", "blue", "green", "orange", "purple"]), rot: s === "semicircle" ? 0 : r.pick([0, 0, 180]) }), "What shape is this?", ans, fix(ans, "What shape is this?"), { skill: "shape", item: `name:${s}` });
  },
  partsItem(r, kind) {
    if (kind === "count") {
      const cut = r.pick(["halves", "fourths"]);
      const s = r.pick(["circle", "rect"]);
      const n = cut === "halves" ? 2 : 4;
      return test(V.parts(s, cut, { c: "blue" }), "How many equal parts?", Word(n) + ".", fix(Word(n) + ".", "How many equal parts?"), { skill: "fraction", item: `parts:${cut}` });
    }
    if (kind === "name") {
      const cut = r.pick(["halves", "fourths"]);
      const ans = cut === "halves" ? "Halves." : "Fourths.";
      return test(V.parts(r.pick(["circle", "rect"]), cut, { shade: 1, c: "orange" }), "Is this cut into halves or fourths?", ans, fix(ans, "Halves or fourths?", cut === "halves" ? "Two equal parts are halves." : "Four equal parts are fourths. We also call them quarters."), { skill: "fraction", item: `name:${cut}` });
    }
    if (kind === "equal") {
      const eq = r() < 0.5;
      const cut = eq ? r.pick(["halves", "fourths"]) : r.pick(["unequal2", "unequal4"]);
      const ans = eq ? "Yes." : "No.";
      return test(V.parts(r.pick(["circle", "rect"]), cut, { c: "green" }), "Are these equal parts?", ans, fix(ans, "Are these equal parts?", eq ? "All the parts are the same size." : "The parts are not the same size."), { skill: "fraction", item: `equal:${eq}` });
    }
    const ans = "Halves.";
    return test(V.row(V.parts("rect", "halves", { shade: 1, c: "purple", size: "md" }), V.parts("rect", "fourths", { shade: 1, c: "purple", size: "md" })), "Which is bigger, one half or one fourth of the same shape?", "One half.", fix("One half.", "Which is bigger, one half or one fourth?", "When a shape is cut into more equal parts, each part is smaller."), { skill: "fraction", item: "bigger:half" });
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "attributes") {
      return {
        title: u.label, steps: [
          model(V.row(V.shape("triangle", { c: "red", size: "md" }), V.shape("triangle", { c: "blue", rot: 90, scale: 0.6, size: "md" })), "Some things about a shape matter, and some do not. Color, size, and which way it is turned do not matter. What matters for a triangle: three straight sides, and closed all the way around. My turn. Both of these are triangles."),
          model(V.shape("triangle-open", { c: "green" }), "This is not a triangle. It is not closed."),
          lead(V.shape("rectangle", { c: "yellow", rot: 90 }), "Does turning a shape change what shape it is? Say it with me.", "No."),
          this.attrItem(r), this.attrItem(r), this.attrItem(r),
        ],
      };
    }
    if (u.id === "names") {
      return {
        title: u.label, steps: [
          model(V.shape("trapezoid", { c: "red" }), "This is a trapezoid. It has four sides. The top and the bottom go the same way, and the top is shorter."),
          model(V.shape("semicircle", { c: "blue" }), "This is a half-circle. It is a circle cut in half: one curved side and one straight side."),
          lead(V.shape("trapezoid", { c: "green" }), "What shape is this? Say it with me.", "A trapezoid."),
          this.nameItem(r, ["trapezoid", "semicircle", "hexagon", "rectangle"]), this.nameItem(r, ["trapezoid", "semicircle"]), this.nameItem(r, ["triangle", "square", "trapezoid"]),
        ],
      };
    }
    if (u.id === "compose") {
      return {
        title: u.label, steps: [
          model(V.row(V.shape("semicircle", { c: "orange", size: "md" }), V.shape("semicircle", { c: "orange", rot: 180, size: "md" })), "Shapes put together make new shapes. My turn. Two half-circles make a circle."),
          model(V.row(V.shape("triangle", { c: "green", size: "md" }), V.shape("triangle", { c: "green", rot: 180, size: "md" })), "Two triangles can make a square, or a rectangle, or a bigger triangle, depending on how they fit."),
          lead(V.row(V.shape("square", { c: "blue", size: "md" }), V.shape("square", { c: "blue", size: "md" })), "Two squares side by side make what shape? Say it with me.", "A rectangle."),
          test(V.row(V.shape("semicircle", { c: "red", size: "md" }), V.shape("semicircle", { c: "red", rot: 180, size: "md" })), "Two half-circles make what shape?", "A circle.", fix("A circle.", "Two half-circles make what shape?"), { skill: "shape", item: "compose:circle" }),
          note(V.say(), "If you have pattern blocks or paper shapes, let the child build a hexagon from triangles: six triangles make a hexagon.", { do: "This is optional, but worth doing once." }),
        ],
      };
    }
    if (u.id === "halves") {
      return {
        title: u.label, steps: [
          model(V.parts("circle", "halves", { c: "blue" }), "This circle is cut into two equal parts. Each part is a half. Two halves make the whole circle."),
          model(V.parts("rect", "halves", { shade: 1, c: "orange" }), "This rectangle is cut into halves. One half is shaded."),
          lead(V.parts("rect", "halves-h", { c: "green" }), "How many equal parts? Say it with me. Two. What is each part called?", "A half."),
          this.partsItem(r, "count"), this.partsItem(r, "name"),
        ],
      };
    }
    if (u.id === "fourths") {
      return {
        title: u.label, steps: [
          model(V.parts("circle", "fourths", { c: "purple" }), "This circle is cut into four equal parts. Each part is a fourth. We also say a quarter. Four fourths make the whole."),
          model(V.parts("rect", "fourths-strips", { shade: 1, c: "orange" }), "This rectangle is cut into fourths a different way. One fourth is shaded."),
          lead(V.parts("rect", "fourths", { c: "green" }), "How many equal parts? What is each part called? Say it with me.", "Four. A fourth."),
          this.partsItem(r, "name"), this.partsItem(r, "count"), this.partsItem(r, "name"),
        ],
      };
    }
    if (u.id === "equal") {
      return {
        title: u.label, steps: [
          model(V.parts("rect", "unequal2", { c: "red" }), "Halves must be equal: the same size. This rectangle is cut into two parts, but they are not the same size. These are not halves."),
          lead(V.parts("circle", "halves", { c: "blue" }), "Are these equal parts? Say it with me.", "Yes."),
          this.partsItem(r, "equal"), this.partsItem(r, "equal"), this.partsItem(r, "equal"),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.row(V.parts("circle", "halves", { shade: 1, c: "orange", size: "md" }), V.parts("circle", "fourths", { shade: 1, c: "orange", size: "md" })), "Here is the same circle cut into halves and into fourths. One half is bigger than one fourth. When we cut a shape into more equal parts, each part is smaller."),
        lead(V.say(), "Which is bigger, one half or one fourth of the same pizza? Say it with me.", "One half."),
        this.partsItem(r, "smaller"),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const has = (id) => intro.some((u) => u.id === id);
    const steps = [this.attrItem(r)];
    if (has("names")) steps.push(this.nameItem(r, ["trapezoid", "semicircle", "hexagon", "rectangle", "triangle"]));
    if (has("halves")) steps.push(this.partsItem(r, has("fourths") ? "name" : "count"));
    if (has("equal")) steps.push(this.partsItem(r, "equal"));
    return { title: "Shapes and equal parts", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const u = units[units.length - 1];
    if (u.id === "attributes") return [this.attrItem(r)];
    if (u.id === "names") return [this.nameItem(r, ["trapezoid", "semicircle"])];
    if (u.id === "compose") return [test(V.row(V.shape("square", { c: "blue", size: "md" }), V.shape("square", { c: "blue", size: "md" })), "Two squares side by side make what shape?", "A rectangle.", fix("A rectangle.", "Two squares side by side make what shape?"), { skill: "shape", item: "compose:rect" })];
    if (u.id === "halves") return [this.partsItem(r, "count")];
    if (u.id === "fourths") return [this.partsItem(r, "name")];
    if (u.id === "equal") return [this.partsItem(r, "equal")];
    return [this.partsItem(r, "smaller")];
  },
};

// ─────────────────────────────────────────────────────────────
// Money (optional)
// ─────────────────────────────────────────────────────────────

const COIN = { penny: 1, nickel: 5, dime: 10, quarter: 25 };
const COIN_LOOK = {
  penny: "A penny is brown, the color of copper.",
  nickel: "A nickel is silver and bigger than a penny. Its edge is smooth.",
  dime: "A dime is silver and the smallest coin.",
  quarter: "A quarter is silver and the biggest of these coins.",
};

const money = {
  id: "money",
  name: "Coins (optional)",
  summary: "Name the penny, nickel, dime, and quarter, know what each is worth, and count a group of the same coins. The Common Core places money in second grade; skip this track if you wish.",
  standard: "2.MD.8 (early)",
  units: [
    { id: "penny", lesson: 106, coin: "penny", label: "Pennies" },
    { id: "nickel", lesson: 116, coin: "nickel", label: "Nickels" },
    { id: "dime", lesson: 122, coin: "dime", label: "Dimes" },
    { id: "quarter", lesson: 130, coin: "quarter", label: "Quarters" },
    { id: "count", lesson: 138, coin: null, label: "Counting coins of one kind" },
  ],
  known(intro) { return intro.filter((u) => u.coin).map((u) => u.coin); },
  nameItem(r, known) {
    const c = r.pick(known);
    return test(V.coins([c]), "What coin is this? How much is it worth?", `A ${c}. ${Word(COIN[c])} ${COIN[c] === 1 ? "cent" : "cents"}.`, fix(`A ${c}. ${Word(COIN[c])} cents.`, "What coin is this? How much is it worth?", COIN_LOOK[c]), { skill: "money", item: `coin:${c}` });
  },
  countItem(r, known) {
    const c = r.pick(known.filter((x) => x !== "quarter").length ? known.filter((x) => x !== "quarter") : known);
    const n = r.int(2, c === "penny" ? 9 : 6);
    const total = n * COIN[c];
    return test(V.coins(Array(n).fill(c)), `Count the ${c === "penny" ? "pennies" : c + "s"}. How many cents in all?`, `${Word(total)} cents.`, fix(`${Word(total)} cents.`, "How many cents in all?", c === "penny" ? "Count by ones." : c === "nickel" ? "Count by fives." : "Count by tens."), { skill: "money", item: `count:${c}:${n}` });
  },
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    if (!u.coin) {
      return {
        title: u.label, steps: [
          model(V.coins(["dime", "dime", "dime", "dime"]), "To count dimes, count by tens. My turn. Ten, twenty, thirty, forty. Forty cents."),
          model(V.coins(["nickel", "nickel", "nickel"]), "To count nickels, count by fives. Five, ten, fifteen. Fifteen cents."),
          lead(V.coins(["dime", "dime", "dime"]), "Count the dimes with me.", "Ten, twenty, thirty. Thirty cents."),
          this.countItem(r, this.known(intro)), this.countItem(r, this.known(intro)),
        ],
      };
    }
    const c = u.coin;
    const known = this.known(intro);
    const steps = [
      model(V.coins([c]), `This coin is a ${c}. ${COIN_LOOK[c]} A ${c} is worth ${word(COIN[c])} ${COIN[c] === 1 ? "cent" : "cents"}.`),
      lead(V.coins([c]), `What coin is this, and how much is it worth? Say it with me.`, `A ${c}. ${Word(COIN[c])} ${COIN[c] === 1 ? "cent" : "cents"}.`),
      this.nameItem(r, [c]),
    ];
    if (known.length > 1) {
      const opts = r.shuffle(known.slice(-3));
      steps.push(test(V.choices(opts.map((x) => V.coins([x])), opts.indexOf(c)), `Touch the ${c}.`, `(Touches the ${c}.)`, fixPoint(`${COIN_LOOK[c]} (Touch it.)`, `Touch the ${c}.`), { skill: "money", item: `touch:${c}` }));
      steps.push(this.nameItem(r, known.filter((x) => x !== c)));
    }
    return { title: u.label, steps, materials: "a real coin of this kind, if you have one" };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const known = this.known(intro);
    const steps = [this.nameItem(r, known), this.nameItem(r, known)];
    if (intro.some((u) => u.id === "count")) steps.push(this.countItem(r, known));
    return { title: "Coins", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const known = this.known(units);
    const u = units[units.length - 1];
    if (u.id === "count") return [this.countItem(r, known)];
    return [this.nameItem(r, [u.coin]), this.nameItem(r, known)];
  },
};

// Facts the First Grade fact review may draw on.
const firstFacts = [];
const seenFact = new Set();
for (const u of ADD_UNITS) {
  if (u.id === "three") continue;
  for (const [a, b] of addFactsFor(u.id)) {
    const key = `${a}+${b}`;
    if (seenFact.has(key)) continue;
    seenFact.add(key);
    firstFacts.push({ key, a, op: "+", b, ans: a + b, lesson: u.lesson });
  }
}
for (const u of SUB_UNITS) {
  for (const [a, b] of subFactsFor(u.id)) {
    const key = `${a}-${b}`;
    if (seenFact.has(key)) continue;
    seenFact.add(key);
    firstFacts.push({ key, a, op: "−", b, ans: a - b, lesson: u.lesson });
  }
}

export { addFacts, subFacts, stories as firstStories, placeValue, numMax as firstNumMax };

export default {
  id: "first",
  slug: "first",
  name: "First Grade",
  longName: "First Grade",
  age: "about 6",
  lessons: 150,
  minutes: "20 to 30",
  minExercises: 7,
  maxExercises: 8,
  minReviewSteps: 4,
  maxSteps: 70,
  maxGap: 12,
  worksheetItems: 5,
  reviewIntervals: [2, 4, 6],
  placementPoints: [1, 40, 80, 115],
  description: "First Grade covers the Common Core first-grade standards: counting, reading, and writing to 120; tens and ones; addition and subtraction facts to 20 learned through strategies; the meaning of the equal sign; story problems of every kind; adding two-digit numbers; length, time, graphs, shapes, halves and fourths; and, as an option, coins.",
  endsWith: "By the end of First Grade, the child counts, reads, and writes to 120, knows the addition and subtraction facts within 10 without counting and can work out any fact within 20, solves every kind of one-step story problem within 20, adds within 100 using tens and ones, tells time to the half hour, and reads simple graphs.",
  materials: ["Paper and a pencil", "Ten straws or craft sticks and a rubber band, for bundling tens (optional)", "About ten paper clips", "A few real coins (optional)"],
  facts: firstFacts,
  readable(n) {
    return new Set(range(0, numMax(n)));
  },
  tracks: [countAloud, numerals, dictation, placeValue, addFacts, subFacts, families, fluency, equalSign, stories, twoDigit, length, time, data, shapes, money],
};
