// Second Grade: adding and subtracting in columns, within 100 and then within
// 1,000, with carrying and trading; and story problems read from the screen.
// See BRIEF.md. The child works each column problem on the whiteboard; the
// screen shows the problem, and in a model the worked problem.

import { V, model, lead, test, note, fix, fixWork, fixPoint, word, Word, chain, favorNew, digits, hundreds, tens, ones, readableMax, intWhere, prose, WHITEBOARD, NAMES, cap } from "./common2.js";

const PLACE = ["ones", "tens", "hundreds"];
const UNIT = ["one", "ten", "hundred"];
const COUNT = [ones, tens, hundreds];
const digitAt = (n, i) => Math.floor(n / 10 ** i) % 10;
const widthOf = (rows) => Math.max(...rows.map((n) => String(n).length));
const plus = (list) => list.map(word).join(" plus ");
const opWord = (op) => (op === "+" ? "plus" : "minus");

// The problem in words: "Forty-six plus thirty-seven."
function spoken(p) {
  return `${Word(p.rows[0])} ${p.rows.slice(1).map((n) => `${opWord(p.op)} ${word(n)}`).join(" ")}.`;
}

// ── The working, column by column from the ones ──
// Each column gets the full working for a model or a correction (say), the
// short form for a lead (lead), and what it writes above the columns.
function work(p) {
  const w = widthOf(p.rows);
  const cols = [];
  const carries = Array(w).fill("");
  const above = {}; // struck digit of the top row, by column: the digit written above
  const head = (i) => (i === 0 ? "Ones first" : cap(PLACE[i]));
  if (p.op === "+") {
    let carry = 0;
    for (let i = 0; i < w; i++) {
      const ds = p.rows.map((n) => digitAt(n, i));
      const terms = (carry ? [carry] : []).concat(ds);
      const sum = terms.reduce((a, b) => a + b, 0);
      const last = i === w - 1;
      const out = last ? 0 : Math.floor(sum / 10);
      const under = last ? sum : sum % 10;
      let say = `${head(i)}: ${plus(terms)} is ${word(sum)}.`;
      let lead = say;
      if (out) {
        const newOnes = out === 1 ? `the new ${UNIT[i + 1]} goes` : `the ${word(out)} new ${PLACE[i + 1]} go`;
        // Short, since the picture shows the carry: "eleven: one under the ones, the new ten above the tens."
        say = `${head(i)}: ${plus(terms)} is ${word(sum)}: ${word(under)} under the ${PLACE[i]}, and ${newOnes.replace(/ goes?$/, "")} above the ${PLACE[i + 1]}.`;
        lead += ` ${Word(under)} goes down, and ${newOnes} up.`;
        carries[i + 1] = String(out);
      } else if (last && sum >= 10) {
        say += ` We write ${word(sum)}.`;
      }
      if (last) lead = `${head(i)}: ${plus(terms)}.`;
      cols.push({ i, say, lead, carries: carries.slice(), above: { ...above } });
      carry = out;
    }
  } else {
    const top = Array.from({ length: w }, (_, i) => digitAt(p.rows[0], i));
    const bot = Array.from({ length: w }, (_, i) => digitAt(p.rows[1], i));
    for (let i = 0; i < w; i++) {
      const b = bot[i];
      const last = i === w - 1;
      let t = top[i], say, lead;
      if (t >= b) {
        say = `${head(i)}: ${word(t)} minus ${word(b)} is ${word(t - b)}.`;
        lead = last ? `${head(i)}: ${word(t)} minus ${word(b)}.` : `${head(i)}: ${word(t)} minus ${word(b)} is ${word(t - b)}.`;
      } else if (top[i + 1] > 0) {
        top[i + 1] -= 1;
        above[i + 1] = String(top[i + 1]);
        carries[i] = String(t + 10);
        const now = `${COUNT[i + 1](top[i + 1])} and ${COUNT[i](t + 10)}`;
        say = `${head(i)}: ${word(t)} minus ${word(b)}. We cannot, so we trade a ${UNIT[i + 1]}: ${word(t + 10)} minus ${word(b)} is ${word(t + 10 - b)}.`;
        lead = `${head(i)}: ${word(t)} minus ${word(b)}. Can we? No. Trade a ${UNIT[i + 1]}: ${now}. ${Word(t + 10)} minus ${word(b)} is ${word(t + 10 - b)}.`;
      } else {
        // Across a zero: no tens to trade, so a hundred becomes ten tens, and one of them becomes ten ones.
        top[2] -= 1; top[1] = 9;
        above[2] = String(top[2]); above[1] = "9";
        carries[0] = String(t + 10);
        const now = `${hundreds(top[2])}, nine tens, and ${ones(t + 10)}`;
        say = `Ones first: ${word(t)} minus ${word(b)}. We cannot, and there are no tens, so we trade a hundred for ten tens, then a ten: ${word(t + 10)} minus ${word(b)} is ${word(t + 10 - b)}.`;
        lead = `Ones first: ${word(t)} minus ${word(b)}. Can we? No. No tens to trade, so trade a hundred for ten tens, then a ten for ten ones: ${now}. ${Word(t + 10)} minus ${word(b)} is ${word(t + 10 - b)}.`;
      }
      cols.push({ i, say, lead, carries: carries.slice(), above: { ...above } });
    }
  }
  return cols;
}

// The whole working, for a model or a correction.
// The working, column by column, for a correction (fixWork gives the answer).
function script(p) {
  return work(p).map((c) => c.say).join(" ");
}

// The working said with the child, the last column left for the child to finish.
function leadSay(p) {
  return `Work it with me. ${work(p).map((c) => c.lead).join(" ")} What is the answer?`;
}

// The problem in columns. show: the worked problem, with carries and trades;
// upTo: how many columns of the working are shown (all, when left out).
function pic(p, o = {}) {
  if (!o.show || o.upTo === 0) return V.colx(p.rows, p.op, { ans: p.ans });
  const cols = work(p);
  const upTo = Math.min(o.upTo ?? cols.length, cols.length);
  const last = cols[upTo - 1];
  const ans = String(p.ans);
  const shown = upTo >= cols.length ? ans : ans.slice(ans.length - upTo);
  const trades = Object.keys(last.above).map((col) => ({ row: 0, col: Number(col), to: last.above[col] }));
  const opts = { ans: shown, show: true };
  if (last.carries.some(Boolean)) opts.carries = last.carries;
  if (trades.length) opts.trades = trades;
  return V.colx(p.rows, p.op, opts);
}

// The model steps for a worked problem: the rule and the problem first,
// then the columns, a few at a time, the screen filling in as the parent
// works. close: a sentence after the answer.
const wc = (t) => t.split(/\s+/).filter(Boolean).length;
function modelSteps(p, o = {}) {
  const cols = work(p);
  const chunks = [];
  let cur = null;
  if (o.open) chunks.push({ text: `${o.open} ${spoken(p)}`, upTo: 0, first: true });
  for (const c of cols) {
    if (cur && wc(cur.text) + wc(c.say) <= 36) { cur.text += ` ${c.say}`; cur.upTo = c.i + 1; continue; }
    cur = { text: cur || o.open ? c.say : `My turn. ${spoken(p)} ${c.say}`, upTo: c.i + 1 };
    chunks.push(cur);
  }
  cur.text += ` The answer is ${word(p.ans)}.${o.close ? " " + o.close : ""}`;
  const doAt = Math.min(1, chunks.length - 1); // the first column chunk, where the carry or trade shows
  return chunks.map((ch, k) => model([pic(p, { show: true, upTo: ch.upTo }), ...(o.beside || [])], ch.text, k === doAt && o.do ? { do: o.do } : {}));
}

// A column problem the child works on the whiteboard.
function colTest(p, o = {}) {
  // The problem is on the screen; a long one is not read out as well.
  const three = widthOf(p.rows) > 2 || p.rows.length > 2;
  const ask = o.ask || `${three ? "" : spoken(p) + " "}Work it in columns, ones first. What is the answer?`;
  return test(pic(p), ask, Word(p.ans) + ".", fixWork(Word(p.ans) + ".", "What is the answer?", script(p)), {
    skill: p.op === "+" ? "add" : "subtract",
    item: `col:${p.rows.join(p.op === "+" ? "+" : "-")}`,
    do: WHITEBOARD,
    secs: o.secs || (three ? 40 : 30),
  });
}

// ── Problems of a kind ──
// Each kind has a draw and a test; gen draws until the test passes, so a
// problem is always of the kind asked for.
const KIND = {
  add2: { draw: (r) => [r.int(12, 89), r.int(11, 89)], ok: ([a, b]) => digitAt(a, 0) + digitAt(b, 0) <= 9 && a + b <= 99 && a + b >= 30, fallback: [34, 25] },
  add2c: { draw: (r) => [r.int(12, 89), r.int(11, 89)], ok: ([a, b]) => digitAt(a, 0) + digitAt(b, 0) >= 10 && a + b <= 99, fallback: [38, 25] },
  add3: { draw: (r) => [r.int(11, 60), r.int(11, 60), r.int(11, 60)], ok: (rs) => rs.reduce((a, b) => a + b) <= 99 && rs.every((n) => n % 10 !== 0), fallback: [24, 31, 15] },
  add4: { draw: (r) => [r.int(11, 39), r.int(11, 39), r.int(11, 39), r.int(11, 39)], ok: (rs) => rs.reduce((a, b) => a + b) <= 99 && rs.reduce((a, n) => a + digitAt(n, 0), 0) >= 20, fallback: [17, 28, 19, 26] },
  sub2: { draw: (r) => [r.int(23, 99), r.int(11, 88)], ok: ([a, b]) => a > b && digitAt(a, 0) >= digitAt(b, 0) && a - b >= 10 && a - b <= 80, fallback: [68, 25] },
  sub2t: { draw: (r) => [r.int(31, 99), r.int(12, 88)], ok: ([a, b]) => digitAt(a, 0) < digitAt(b, 0) && a - b >= 10, fallback: [42, 17] },
  add3d: { draw: (r) => [r.int(101, 899), r.int(101, 899)], ok: ([a, b]) => cols3(a, b).every((s) => s <= 9), fallback: [346, 231] },
  add3dO: { draw: (r) => [r.int(101, 899), r.int(101, 899)], ok: ([a, b]) => { const [o, t, h] = cols3(a, b); return o >= 10 && t <= 9 && h <= 9; }, fallback: [346, 237] },
  add3dT: { draw: (r) => [r.int(101, 899), r.int(101, 899)], ok: ([a, b]) => { const [o, t, h] = cols3(a, b); return o <= 9 && t >= 10 && h <= 9; }, fallback: [364, 272] },
  add3d2: { draw: (r) => [r.int(101, 899), r.int(101, 899)], ok: ([a, b]) => { const [o, t, h] = cols3(a, b); return o >= 10 && t >= 10 && h <= 9; }, fallback: [346, 287] },
  sub3d: { draw: (r) => [r.int(211, 999), r.int(101, 888)], ok: ([a, b]) => a - b >= 100 && digitAt(a, 0) >= digitAt(b, 0) && digitAt(a, 1) >= digitAt(b, 1), fallback: [578, 234] },
  sub3dT: { draw: (r) => [r.int(211, 999), r.int(101, 888)], ok: ([a, b]) => a - b >= 100 && digitAt(a, 0) < digitAt(b, 0) && digitAt(a, 1) >= 1 && digitAt(a, 1) - 1 >= digitAt(b, 1), fallback: [532, 218] },
  sub3dH: { draw: (r) => [r.int(211, 999), r.int(101, 888)], ok: ([a, b]) => a - b >= 100 && digitAt(a, 0) >= digitAt(b, 0) && digitAt(a, 1) < digitAt(b, 1), fallback: [528, 263] },
  sub3d2: { draw: (r) => [r.int(211, 999), r.int(101, 888)], ok: ([a, b]) => a - b >= 100 && digitAt(a, 0) < digitAt(b, 0) && digitAt(a, 1) >= 1 && digitAt(a, 1) - 1 < digitAt(b, 1), fallback: [523, 268] },
  zeros: { draw: (r) => [r.int(2, 9) * 100 + r.pick([0, 0, r.int(1, 8)]), r.int(101, 888)], ok: ([a, b]) => a - b >= 100 && digitAt(a, 1) === 0 && digitAt(a, 0) < digitAt(b, 0), fallback: [500, 234] },
};
// The column sums of a three-digit addition, with the carries: [ones, tens, hundreds].
function cols3(a, b) {
  const o = digitAt(a, 0) + digitAt(b, 0);
  const t = digitAt(a, 1) + digitAt(b, 1) + (o >= 10 ? 1 : 0);
  const h = digitAt(a, 2) + digitAt(b, 2) + (t >= 10 ? 1 : 0);
  return [o, t, h];
}
const ADD_KINDS = ["add2", "add2c", "add3", "add4", "add3d", "add3dO", "add3dT", "add3d2"];
function gen(r, kind) {
  const k = KIND[kind];
  let rows = k.fallback;
  for (let tries = 0; tries < 400; tries++) {
    const d = k.draw(r);
    if (k.ok(d)) { rows = d; break; }
  }
  const op = ADD_KINDS.includes(kind) ? "+" : "−";
  const ans = op === "+" ? rows.reduce((a, b) => a + b, 0) : rows[0] - rows[1];
  return { rows, op, ans, kind };
}

// ── A missing digit ──
// One digit of the problem is hidden and the answer is shown; the child finds
// the digit from its column. The problem has no carry or trade, so each
// column is one fact.
function missing(p, row, place) {
  const rows = p.rows.map((n, i) => {
    const s = String(n);
    return i === row ? s.slice(0, s.length - 1 - place) + "?" + s.slice(s.length - place) : n;
  });
  const hidden = digitAt(p.rows[row], place);
  const other = digitAt(p.rows[1 - row], place);
  const result = digitAt(p.ans, place);
  const col = `Look at the ${PLACE[place]} column.`;
  let fact, reason;
  if (p.op === "+") {
    fact = row === 0 ? `Something plus ${word(other)} is ${word(result)}.` : `${Word(other)} plus something is ${word(result)}.`;
    reason = `${Word(row === 0 ? hidden : other)} plus ${word(row === 0 ? other : hidden)} is ${word(result)}, so the missing digit is ${word(hidden)}.`;
  } else if (row === 0) {
    fact = `Something minus ${word(other)} is ${word(result)}.`;
    reason = `${Word(hidden)} minus ${word(other)} is ${word(result)}, so the missing digit is ${word(hidden)}.`;
  } else {
    fact = `${Word(other)} minus something is ${word(result)}.`;
    reason = `${Word(other)} minus ${word(hidden)} is ${word(result)}, so the missing digit is ${word(hidden)}.`;
  }
  return { screen: V.colx(rows, p.op, { ans: p.ans, show: true }), hidden, col, fact, reason, key: `miss:${rows.join(p.op === "+" ? "+" : "-")}=${p.ans}` };
}
function missingTest(p, row, place) {
  const m = missing(p, row, place);
  const ask = "This problem has a digit missing. What is the missing digit?";
  return test(m.screen, ask, Word(m.hidden) + ".", fix(Word(m.hidden) + ".", "What is the missing digit?", `${m.col} ${m.fact} ${m.reason}`), {
    skill: p.op === "+" ? "add" : "subtract",
    item: m.key,
    secs: 20,
  });
}

// ── Checking a subtraction by adding ──
// The answer added to the number taken away gives the number we started
// with. A wrong answer is the common one: the tens not lowered after a trade,
// or a fact missed by one.
function checkSteps(r, right, alone) {
  const p = gen(r, r.pick(["sub2", "sub2t"]));
  const [a, b] = p.rows;
  let shown = p.ans;
  if (!right) shown = p.kind === "sub2t" && a <= 89 ? p.ans + 10 : p.ans + (digitAt(p.ans, 0) === 9 ? -1 : 1);
  const sum = shown + b;
  const q = { rows: [shown, b], op: "+", ans: sum };
  const screen = V.colx([a, b], "−", { ans: shown, show: true });
  const ask = `${Word(a)} minus ${word(b)}. The answer written is ${word(shown)}. Check it: add ${word(shown)} and ${word(b)}. What do you get?`;
  const first = test(screen, ask, Word(sum) + ".", fixWork(Word(sum) + ".", "What do you get?", script(q)), { skill: "subtract", item: `check:${a}-${b}=${shown}`, do: WHITEBOARD, secs: 30 });
  if (alone) return [first];
  const why = right
    ? `${Word(shown)} plus ${word(b)} is ${word(a)}, the number we started with. The answer checks.`
    : `${Word(shown)} plus ${word(b)} is ${word(sum)}, not ${word(a)}. The answer does not check. The right answer is ${word(p.ans)}.`;
  const second = test(screen, `We started with ${word(a)}. The check gave ${word(sum)}. Does the answer check?`, right ? "Yes." : "No.",
    fix(right ? "Yes." : "No.", "Does the answer check?", why), { skill: "subtract", item: `check?:${a}-${b}=${shown}` });
  return [first, second];
}

// ── Drawing items across the units taught ──
// Review: the units taught, the newest favored, one item each, none twice.
function drawSteps(r, units, n, make) {
  const steps = [], seen = new Set();
  for (const u of favorNew(r, units, n)) {
    for (let t = 0; t < 8; t++) {
      const made = make(u, r);
      const list = Array.isArray(made) ? made : [made];
      if (seen.has(list[0].item)) continue;
      list.forEach((s) => seen.add(s.item));
      steps.push(...list);
      break;
    }
  }
  return steps;
}
// Tests: two to four items (more when count asks), the newest unit always in, hardest last.
function testDraw(r, units, count, make) {
  const n = count || 3;
  const picks = favorNew(r, units, n);
  const newest = units[units.length - 1];
  if (!picks.includes(newest)) picks[picks.length - 1] = newest;
  const order = picks.slice().sort((a, b) => units.indexOf(a) - units.indexOf(b));
  const steps = [], seen = new Set();
  for (const u of order) {
    for (let t = 0; t < 8; t++) {
      const made = make(u, r);
      const list = Array.isArray(made) ? made : [made];
      if (seen.has(list[0].item)) continue;
      list.forEach((s) => seen.add(s.item));
      steps.push(...list);
      break;
    }
  }
  return steps;
}
const decideTest = (p, say, yes, why) => test(pic(p), say, yes ? "Yes." : "No.", fix(yes ? "Yes." : "No.", say.replace(/^.*?\. /, ""), why), { skill: p.op === "+" ? "add" : "subtract", item: `decide:${p.rows.join(p.op === "+" ? "+" : "-")}` });

// ── Adding within 100 ──
export const add100 = {
  id: "add-100",
  name: "Adding within 100",
  summary: "Add two-digit numbers in columns, ones first, carrying a new ten; add three and then four two-digit numbers; find a missing digit in an addition.",
  standard: "2.NBT.5, 2.NBT.6",
  units: [
    { id: "nocarry", lesson: 3, label: "Adding in columns without carrying" },
    { id: "carry", lesson: 9, label: "Carrying a new ten" },
    { id: "three", lesson: 21, label: "Adding three numbers" },
    { id: "missing", lesson: 33, label: "A missing digit in an addition" },
    { id: "four", lesson: 45, label: "Adding four numbers" },
  ],
  item(u, r) {
    switch (u.id) {
      case "nocarry": return colTest(gen(r, "add2"));
      case "carry": return colTest(gen(r, "add2c"));
      case "three": return colTest(gen(r, "add3"));
      case "missing": return missingTest(gen(r, "add2"), r.int(0, 1), r.int(0, 1));
      default: return colTest(gen(r, "add4"));
    }
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "nocarry") {
      const P = gen(r, "add2");
      return {
        title: u.label, steps: [
          ...modelSteps(gen(r, "add2"), { open: "We line up the numbers: tens under tens, ones under ones. We always start with the ones. My turn.", do: "Point to each column as you work it: the ones, then the tens." }),
          lead(pic(P), leadSay(P), Word(P.ans) + "."),
          colTest(gen(r, "add2"), { full: true }), colTest(gen(r, "add2")), colTest(gen(r, "add2")),
        ],
      };
    }
    if (u.id === "carry") {
      const P = gen(r, "add2c");
      return {
        title: u.label, steps: [
          ...modelSteps(gen(r, "add2c"), { open: "When the ones make ten or more, we carry the new ten. My turn.", do: "Point to the small one above the tens column: that is the new ten." }),
          lead(pic(P), leadSay(P), Word(P.ans) + "."),
          colTest(gen(r, "add2c"), { full: true }), colTest(gen(r, "add2c")), colTest(gen(r, "add2")), colTest(gen(r, "add2c")),
        ],
      };
    }
    if (u.id === "three") {
      const P = gen(r, "add3");
      return {
        title: u.label, steps: [
          ...modelSteps(gen(r, "add3"), { open: "Three numbers add the same way. Ones first, all the ones together. My turn.", do: "Point down the ones column as you add the three digits." }),
          lead(pic(P), leadSay(P), Word(P.ans) + "."),
          colTest(gen(r, "add3"), { full: true }), colTest(gen(r, "add3")), colTest(gen(r, "add3")), colTest(gen(r, "add2c")),
        ],
      };
    }
    if (u.id === "missing") {
      const m = missing(gen(r, "add2"), 0, 0), m2 = missing(gen(r, "add2"), 1, 1);
      return {
        title: u.label, steps: [
          model(m.screen, `This problem has a digit missing, and the answer is written. My turn. ${m.col} ${m.fact} ${m.reason}`, { do: "Point to the question mark, then down its column to the answer." }),
          lead(m2.screen, `Do it with me. ${m2.col} ${m2.fact} What is the missing digit?`, Word(m2.hidden) + "."),
          missingTest(gen(r, "add2"), 0, 0), missingTest(gen(r, "add2"), 1, 0), missingTest(gen(r, "add2"), 0, 1), colTest(gen(r, "add2c")),
        ],
      };
    }
    const P = gen(r, "add4");
    return {
      title: u.label, steps: [
        ...modelSteps(gen(r, "add4"), { open: "Four numbers. The ones may make twenty or more, so we may carry two tens. My turn.", do: "Point to the small two above the tens column: two new tens." }),
        lead(pic(P), leadSay(P), Word(P.ans) + "."),
        colTest(gen(r, "add4"), { full: true }), colTest(gen(r, "add4")), colTest(gen(r, "add3")), colTest(gen(r, "add4")),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: this.name, steps: drawSteps(r, intro, r.int(3, 4), (u) => this.item(u, r)) };
  },
  testItems(units, ctx, count) {
    return testDraw(ctx.rand, units, count, (u, r) => this.item(u, r));
  },
};

// ── Subtracting within 100 ──
export const sub100 = {
  id: "sub-100",
  name: "Subtracting within 100",
  summary: "Subtract two-digit numbers in columns, trading a ten for ten ones when the ones are too few; find a missing digit; check a subtraction by adding the answer to the number taken away.",
  standard: "2.NBT.5, 2.NBT.9",
  units: [
    { id: "notrade", lesson: 14, label: "Subtracting in columns without trading" },
    { id: "trade", lesson: 24, label: "Trading a ten for ten ones" },
    { id: "missing", lesson: 38, label: "A missing digit in a subtraction" },
    { id: "check", lesson: 50, label: "Checking a subtraction by adding" },
  ],
  item(u, r, alone) {
    switch (u.id) {
      case "notrade": return colTest(gen(r, "sub2"));
      case "trade": return colTest(gen(r, "sub2t"));
      case "missing": return missingTest(gen(r, "sub2"), r.int(0, 1), r.int(0, 1));
      default: return checkSteps(r, r() < 0.6, alone);
    }
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "notrade") {
      const P = gen(r, "sub2");
      return {
        title: u.label, steps: [
          ...modelSteps(gen(r, "sub2"), { open: "We subtract in columns the same way: ones first, then tens. My turn.", do: "Point to each column as you work it: the ones, then the tens." }),
          lead(pic(P), leadSay(P), Word(P.ans) + "."),
          colTest(gen(r, "sub2"), { full: true }), colTest(gen(r, "sub2")), colTest(gen(r, "sub2")),
        ],
      };
    }
    if (u.id === "trade") {
      const P = gen(r, "sub2t"), D = gen(r, "sub2t");
      const [a, b] = D.rows;
      return {
        title: u.label, steps: [
          ...modelSteps(gen(r, "sub2t"), { open: "Sometimes the ones are too few to take from. Then we trade one ten for ten ones. My turn.", do: "Point to the struck tens digit, then to the new number above the ones: one ten became ten ones." }),
          lead(pic(P), leadSay(P), Word(P.ans) + "."),
          decideTest(D, `Look at the ones: ${word(digitAt(a, 0))} minus ${word(digitAt(b, 0))}. Do we need to trade a ten?`, true, `${Word(digitAt(a, 0))} is less than ${word(digitAt(b, 0))}, so we cannot take ${word(digitAt(b, 0))} from ${word(digitAt(a, 0))}. We trade.`),
          colTest(gen(r, "sub2t"), { full: true }), colTest(gen(r, "sub2t")), colTest(gen(r, "sub2")), colTest(gen(r, "sub2t")),
        ],
      };
    }
    if (u.id === "missing") {
      const m = missing(gen(r, "sub2"), 0, 0), m2 = missing(gen(r, "sub2"), 1, 0);
      return {
        title: u.label, steps: [
          model(m.screen, `A subtraction with a digit missing, and the answer written. My turn. ${m.col} ${m.fact} ${m.reason}`, { do: "Point to the question mark, then down its column to the answer." }),
          lead(m2.screen, `Do it with me. ${m2.col} ${m2.fact} What is the missing digit?`, Word(m2.hidden) + "."),
          missingTest(gen(r, "sub2"), 0, 0), missingTest(gen(r, "sub2"), 1, 0), missingTest(gen(r, "sub2"), 0, 1), colTest(gen(r, "sub2t")),
        ],
      };
    }
    const P = gen(r, "sub2t"), [a, b] = P.rows, Q = { rows: [P.ans, b], op: "+", ans: a };
    const L = gen(r, "sub2"), LQ = { rows: [L.ans, L.rows[1]], op: "+", ans: L.rows[0] };
    return {
      title: u.label, steps: [
        model(pic(P, { show: true }), `We can check a subtraction by adding. My turn. ${spoken(P)} The answer is ${word(P.ans)}.`),
        ...modelSteps(Q, { open: "To check, I add the answer to the number I took away.", beside: [pic(P, { show: true })], close: "That is the number I started with, so the answer checks.", do: "Point to the subtraction, then to the addition beside it." }),
        lead([pic(L, { show: true }), pic(LQ)], `Check it with me. ${spoken(L)} The answer is ${word(L.ans)}. Add ${word(L.ans)} and ${word(L.rows[1])}. What do we get?`, Word(L.rows[0]) + "."),
        ...checkSteps(r, true), ...checkSteps(r, false), ...checkSteps(r, true),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: this.name, steps: drawSteps(r, intro, 3, (u) => this.item(u, r)) };
  },
  testItems(units, ctx, count) {
    return testDraw(ctx.rand, units, count, (u, r) => this.item(u, r, true));
  },
};

// Reading a three-digit addition before working it: which columns carry.
function readSay(p) {
  const [a, b] = p.rows;
  const o = digitAt(a, 0) + digitAt(b, 0), t = digitAt(a, 1) + digitAt(b, 1) + (o >= 10 ? 1 : 0);
  const onesLine = `The ones: ${word(digitAt(a, 0))} plus ${word(digitAt(b, 0))} is ${word(o)}, ${o >= 10 ? "so I will carry a ten" : "no carry"}.`;
  const tensLine = `The tens: ${o >= 10 ? "one plus " : ""}${word(digitAt(a, 1))} plus ${word(digitAt(b, 1))} is ${word(t)}, ${t >= 10 ? "so I will carry a hundred" : "no carry"}.`;
  return `${onesLine} ${tensLine}`;
}

// ── Adding within 1,000 ──
const blocksOf = (n) => V.blocks(0, digitAt(n, 2), digitAt(n, 1), digitAt(n, 0), { labels: true });
export const add1000 = {
  id: "add-1000",
  name: "Adding within 1,000",
  summary: "Add three-digit numbers in columns: ones, tens, then hundreds, carrying a new ten or a new hundred where a column makes ten or more.",
  standard: "2.NBT.7",
  units: [
    { id: "nocarry", lesson: 52, label: "Adding three-digit numbers" },
    { id: "carry-ones", lesson: 58, label: "Carrying from the ones" },
    { id: "carry-tens", lesson: 64, label: "Carrying from the tens to the hundreds" },
    { id: "two-carries", lesson: 72, label: "Carrying twice" },
    { id: "mixed", lesson: 100, label: "Read the problem and decide" },
  ],
  kindOf: { nocarry: "add3d", "carry-ones": "add3dO", "carry-tens": "add3dT", "two-carries": "add3d2" },
  item(u, r) {
    const kind = this.kindOf[u.id] || r.pick(["add3d", "add3dO", "add3dT", "add3d2"]);
    return colTest(gen(r, kind));
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const kind = this.kindOf[u.id];
    if (u.id === "nocarry") {
      const M = gen(r, "add3d"), P = gen(r, "add3d");
      return {
        title: u.label, steps: [
          ...modelSteps(M, { open: "Three-digit numbers have a hundreds column too. Ones first, then tens, then hundreds. My turn.", beside: [V.row(blocksOf(M.rows[0]), V.sign("+"), blocksOf(M.rows[1]))], do: "Point to the blocks: the ones, the tens rods, the hundreds flats, as you add each column." }),
          lead(pic(P), leadSay(P), Word(P.ans) + "."),
          colTest(gen(r, "add3d"), { full: true }), colTest(gen(r, "add3d")), colTest(gen(r, "add3d")),
        ],
      };
    }
    if (u.id === "mixed") {
      const M = gen(r, "add3dT"), D1 = gen(r, "add3dO"), D2 = gen(r, "add3d");
      const o1 = [digitAt(D1.rows[0], 0), digitAt(D1.rows[1], 0)], o2 = [digitAt(D2.rows[0], 0), digitAt(D2.rows[1], 0)];
      return {
        title: u.label, steps: [
          model(pic(M), `Before we work a problem, we read it. Some columns carry and some do not. My turn. ${readSay(M)}`, { do: "Point to the ones column, then the tens column, as you read each." }),
          lead(pic(D1), `Read it with me. Ones: ${word(o1[0])} plus ${word(o1[1])}. Is that ten or more? Do we carry?`, "Yes."),
          decideTest(D2, `Look at the ones: ${word(o2[0])} plus ${word(o2[1])}. Will you carry a ten?`, false, `${Word(o2[0])} plus ${word(o2[1])} is ${word(o2[0] + o2[1])}. That is less than ten, so there is no carry.`),
          colTest(gen(r, "add3dO")), colTest(gen(r, "add3d")), colTest(gen(r, "add3d2")), colTest(gen(r, "add3dT")),
        ],
      };
    }
    const opens = {
      "carry-ones": ["When the ones make ten or more, the new ten goes to the top of the tens column. My turn.", "Point to the small one above the tens column."],
      "carry-tens": ["When the tens make ten or more, that is a new hundred. It goes to the top of the hundreds column. My turn.", "Point to the small one above the hundreds column."],
      "two-carries": ["Sometimes we carry twice: a new ten, then a new hundred. My turn.", "Point to the small one above the tens, then the one above the hundreds."],
    };
    const P = gen(r, kind);
    const easier = { "carry-ones": "add3d", "carry-tens": "add3dO", "two-carries": "add3dT" }[u.id];
    return {
      title: u.label, steps: [
        ...modelSteps(gen(r, kind), { open: opens[u.id][0], do: opens[u.id][1] }),
        lead(pic(P), leadSay(P), Word(P.ans) + "."),
        colTest(gen(r, kind), { full: true }), colTest(gen(r, kind)), colTest(gen(r, easier)), colTest(gen(r, kind)),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: this.name, steps: drawSteps(r, intro, 3, (u) => this.item(u, r)) };
  },
  testItems(units, ctx, count) {
    return testDraw(ctx.rand, units, count, (u, r) => this.item(u, r));
  },
};

// ── Subtracting within 1,000 ──
export const sub1000 = {
  id: "sub-1000",
  name: "Subtracting within 1,000",
  summary: "Subtract three-digit numbers in columns, trading a ten for ten ones or a hundred for ten tens, twice when needed, and across a zero; find a missing digit.",
  standard: "2.NBT.7",
  units: [
    { id: "notrade", lesson: 68, label: "Subtracting three-digit numbers" },
    { id: "trade-ten", lesson: 76, label: "Trading a ten for ten ones" },
    { id: "trade-hundred", lesson: 84, label: "Trading a hundred for ten tens" },
    { id: "two-trades", lesson: 92, label: "Trading twice" },
    { id: "zeros", lesson: 104, label: "Subtracting across a zero" },
    { id: "missing", lesson: 112, label: "A missing digit in a subtraction" },
  ],
  kindOf: { notrade: "sub3d", "trade-ten": "sub3dT", "trade-hundred": "sub3dH", "two-trades": "sub3d2", zeros: "zeros" },
  item(u, r) {
    if (u.id === "missing") return missingTest(gen(r, "sub3d"), r.int(0, 1), r.int(0, 2));
    return colTest(gen(r, this.kindOf[u.id]));
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "missing") {
      const m = missing(gen(r, "sub3d"), 0, 1), m2 = missing(gen(r, "sub3d"), 1, 2);
      return {
        title: u.label, steps: [
          model(m.screen, `A digit is missing, and the answer is written. My turn. ${m.col} ${m.fact} ${m.reason}`, { do: "Point to the question mark, then down its column to the answer." }),
          lead(m2.screen, `Do it with me. ${m2.col} ${m2.fact} What is the missing digit?`, Word(m2.hidden) + "."),
          missingTest(gen(r, "sub3d"), 0, 0), missingTest(gen(r, "sub3d"), 1, 1), missingTest(gen(r, "sub3d"), 0, 2), colTest(gen(r, "zeros")),
        ],
      };
    }
    const kind = this.kindOf[u.id];
    const opens = {
      notrade: ["Three-digit numbers subtract the same way: ones, then tens, then hundreds. My turn.", "Point to each column as you work it."],
      "trade-ten": ["When the ones are too few, we trade one ten for ten ones, just as before. My turn.", "Point to the struck tens digit, then to the new number above the ones."],
      "trade-hundred": ["When the tens are too few, we trade one hundred for ten tens. My turn.", "Point to the struck hundreds digit, then to the new number above the tens."],
      "two-trades": ["Sometimes we trade twice: a ten for ten ones, then a hundred for ten tens. My turn.", "Point to each struck digit and the new number above it."],
      zeros: ["When there are no tens to trade, we go to the hundreds first. A hundred becomes ten tens, and one of those tens becomes ten ones. My turn.", "Point to the struck hundreds digit, the nine above the tens, and the new number above the ones."],
    };
    const easier = { notrade: "sub3d", "trade-ten": "sub3d", "trade-hundred": "sub3dT", "two-trades": "sub3dH", zeros: "sub3d2" }[u.id];
    const P = gen(r, kind);
    const steps = [
      ...modelSteps(gen(r, kind), { open: opens[u.id][0], do: opens[u.id][1] }),
      lead(pic(P), leadSay(P), Word(P.ans) + "."),
    ];
    if (u.id === "trade-hundred" || u.id === "zeros") {
      const D = gen(r, kind), [a, b] = D.rows;
      const place = u.id === "zeros" ? 0 : 1;
      const t = digitAt(a, place), bb = digitAt(b, place);
      const which = u.id === "zeros" ? "Do we trade a hundred first?" : "Do we need to trade a hundred?";
      const why = u.id === "zeros"
        ? `${Word(t)} is less than ${word(bb)}, and there are no tens to trade. So we trade a hundred first.`
        : `${Word(t)} is less than ${word(bb)}, so we cannot take ${word(bb)} from ${word(t)}. We trade a hundred for ten tens.`;
      steps.push(decideTest(D, `Look at the ${PLACE[place]}: ${word(t)} minus ${word(bb)}. ${which}`, true, why));
    }
    steps.push(colTest(gen(r, kind), { full: true }), colTest(gen(r, kind)), colTest(gen(r, easier)), colTest(gen(r, kind)));
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: this.name, steps: drawSteps(r, intro, 3, (u) => this.item(u, r)) };
  },
  testItems(units, ctx, count) {
    return testDraw(ctx.rand, units, count, (u, r) => this.item(u, r));
  },
};

// ── Story problems ──
// A story is printed on the screen with numerals and read aloud with number
// words, so each story is told twice from one template.
function tell(strings, ...vals) {
  let print = "", say = "";
  strings.forEach((s, i) => {
    print += s; say += s;
    if (i < vals.length) { const v = vals[i]; print += String(v); say += typeof v === "number" ? word(v) : v; }
  });
  return { print, say };
}
// Prose lines under 90 characters: whole sentences, packed in order.
function linesOf(text) {
  const out = [];
  for (const s of text.split(/(?<=[.?])\s+/)) {
    if (out.length && (out[out.length - 1] + " " + s).length <= 86) out[out.length - 1] += " " + s;
    else out.push(s);
  }
  return out;
}
const who = (r) => {
  const [name, pro] = r.pick(NAMES);
  const other = r.pick(NAMES.filter((n) => n[0] !== name))[0];
  return { name, pro, Pro: cap(pro), other };
};
// The things of the stories, with the verbs for getting and losing some.
const THINGS = {
  stickers: { get: "got", lose: "gave away", getBase: "get", loseBase: "give away" },
  marbles: { get: "won", lose: "lost", getBase: "win", loseBase: "lose" },
  coins: { get: "earned", lose: "spent", getBase: "earn", loseBase: "spend" },
  apples: { get: "picked", lose: "gave away", getBase: "pick", loseBase: "give away" },
};
const COUNTABLE = Object.keys(THINGS);

// One step, the result unknown: the stories by thing, each [body, question].
function oneStory(r, w, add, a, b) {
  const { name, pro, Pro } = w;
  const thing = r.pick(["apples", "stickers", "marbles", "pages", "minutes", "steps", "coins"]);
  const T = add ? {
    apples: [tell`${name} picked ${a} apples. Then ${pro} picked ${b} more.`, tell`How many apples did ${name} pick in all?`],
    stickers: [tell`${name} had ${a} stickers. ${Pro} got ${b} more.`, tell`How many stickers does ${name} have now?`],
    marbles: [tell`${name} had ${a} marbles. ${Pro} won ${b} more in a game.`, tell`How many marbles does ${name} have now?`],
    pages: [tell`${name} read ${a} pages on Monday and ${b} pages on Tuesday.`, tell`How many pages did ${pro} read in all?`],
    minutes: [tell`${name} played outside for ${a} minutes before lunch and ${b} minutes after.`, tell`How many minutes did ${pro} play in all?`],
    steps: [tell`${name} took ${a} steps to the corner and ${b} more steps to the park.`, tell`How many steps did ${pro} take in all?`],
    coins: [tell`${name} has ${a} coins in a jar and ${b} coins in a box.`, tell`How many coins does ${pro} have in all?`],
  } : {
    apples: [tell`${name} had ${a} apples. ${Pro} gave ${b} to the class.`, tell`How many apples does ${name} have left?`],
    stickers: [tell`${name} had ${a} stickers. ${Pro} used ${b} on a card.`, tell`How many stickers are left?`],
    marbles: [tell`${name} had ${a} marbles. ${Pro} lost ${b} of them.`, tell`How many marbles does ${name} have now?`],
    pages: [tell`A book has ${a} pages. ${name} has read ${b} of them.`, tell`How many pages are left to read?`],
    minutes: [tell`${name} has ${a} minutes to play. ${Pro} has used ${b} minutes.`, tell`How many minutes are left?`],
    steps: [tell`${name} has ${a} steps to walk to school. ${Pro} has taken ${b} steps.`, tell`How many steps are left?`],
    coins: [tell`${name} had ${a} coins. ${Pro} spent ${b} of them.`, tell`How many coins does ${name} have left?`],
  };
  return { thing, body: T[thing][0], ask: T[thing][1] };
}

// The two steps of a story, with the running totals: shape is "-+", "+-", "++", or "--".
function twoNumbers(r, big) {
  let best = big ? { shape: "+-", a: 325, b: 248, c: 143 } : { shape: "-+", a: 48, b: 19, c: 24 };
  for (let tries = 0; tries < 400; tries++) {
    const shape = r.pick(["-+", "+-", "++", "--"]);
    const a = big ? r.int(250, 700) : r.int(30, 89), b = big ? r.int(105, 380) : r.int(11, 45), c = big ? r.int(105, 380) : r.int(11, 45);
    const first = shape[0] === "-" ? a - b : a + b;
    const ans = shape[1] === "-" ? first - c : first + c;
    const lo = big ? 100 : 10, hi = big ? 999 : 99;
    if (first >= lo && first <= hi && ans >= (big ? 50 : 5) && ans <= hi) { best = { shape, a, b, c }; break; }
  }
  const { shape, a, b, c } = best;
  const first = shape[0] === "-" ? a - b : a + b;
  return { shape, a, b, c, first, ans: shape[1] === "-" ? first - c : first + c };
}
function twoStory(r, w, big) {
  const { name, pro, Pro } = w;
  const n = twoNumbers(r, big);
  const { shape, a, b, c, first, ans } = n;
  let thing, body, ask;
  if (big && shape === "--" && r() < 0.5) {
    thing = "pages";
    body = tell`${name} is reading a book with ${a} pages. ${Pro} read ${b} pages last week and ${c} pages this week.`;
    ask = tell`How many pages are left to read?`;
  } else if (big && shape === "++" && r() < 0.5) {
    thing = "steps";
    body = tell`${name} walked ${a} steps to the park, ${b} steps around the pond, and ${c} steps home.`;
    ask = tell`How many steps did ${pro} walk in all?`;
  } else {
    thing = r.pick(COUNTABLE);
    const v = THINGS[thing];
    const s1 = shape[0] === "-" ? tell`${Pro} ${v.lose} ${b} ${thing}.` : tell`${Pro} ${v.get} ${b} more.`;
    const s2 = shape[1] === "-" ? tell`Then ${pro} ${v.lose} ${c} ${thing}.` : tell`Then ${pro} ${v.get} ${c} more.`;
    const s0 = tell`${name} had ${a} ${thing}.`;
    body = { print: `${s0.print} ${s1.print} ${s2.print}`, say: `${s0.say} ${s1.say} ${s2.say}` };
    ask = tell`How many ${thing} does ${name} have now?`;
  }
  const step = (x, op, y, z) => `${Word(x)} ${op === "-" ? "minus" : "plus"} ${word(y)} is ${word(z)}.`;
  const working = `First, ${step(a, shape[0], b, first).toLowerCase()} Then, ${step(first, shape[1], c, ans).toLowerCase()}`;
  return {
    print: `${body.print} ${ask.print}`, say: `${body.say} ${ask.say}`, ask: ask.say, ans, two: true,
    reason: "Two steps, the first answer used in the second.", brief: `${working} The answer is ${word(ans)}.`,
    plan: `Two steps. ${Word(a)} ${shape[0] === "-" ? "minus" : "plus"} ${word(b)}, then ${shape[1] === "-" ? "minus" : "plus"} ${word(c)}.`,
    why: `Two steps. ${working} The answer is ${word(ans)}.`,
    key: `story:${big ? "big" : "two"}:${a}${shape[0]}${b}${shape[1]}${c}`,
  };
}

// A story of a unit: printed text, spoken text, the question, the answer,
// the reason (add or subtract, and why), the brief working (a model), the
// plan (said in a lead), the full working (a correction), and anything
// shown beside the text (keep: on the test screen too).
const briefOf = (p) => `${spoken(p).slice(0, -1)} is ${word(p.ans)}.`;
const VERBS = { pages: { past: "read", base: "read" }, minutes: { past: "practiced for", base: "practice" }, steps: { past: "took", base: "take" } };
function storyOf(r, id) {
  const w = who(r);
  const { name, pro, Pro, other } = w;
  if (id === "one-step" || id === "extra") {
    const add = r() < 0.5;
    const p = gen(r, add ? r.pick(["add2", "add2c"]) : r.pick(["sub2", "sub2t"]));
    const [a, b] = p.rows;
    let s = oneStory(r, w, add, a, b);
    let extra = "", short = "";
    if (id === "extra") {
      // A sentence with a number that is not about the question.
      while (!COUNTABLE.includes(s.thing)) s = oneStory(r, w, add, a, b);
      const k = r.int(2, 9);
      const e = r.pick([
        [tell`${Pro} is ${k} years old.`, `${Word(k)} years old tells ${name}'s age, not how many ${s.thing}.`],
        [tell`${Pro} has ${k} friends over.`, `${Word(k)} friends tells who is there, not how many ${s.thing}.`],
        [tell`${Pro} keeps them in ${k} boxes.`, `${Word(k)} boxes tells where the ${s.thing} are, not how many.`],
      ]);
      const cut = (t) => t.indexOf(". ") + 2;
      s.body = { print: s.body.print.slice(0, cut(s.body.print)) + e[0].print + " " + s.body.print.slice(cut(s.body.print)), say: s.body.say.slice(0, cut(s.body.say)) + e[0].say + " " + s.body.say.slice(cut(s.body.say)) };
      extra = `The question asks about ${s.thing}. ${e[1]} We leave it out. `;
      short = `${e[1]} We leave it out. `;
    }
    const reason = extra + (add
      ? (/in all/.test(s.ask.say) ? "In all is the big number. It is missing, so we add." : `${name} got more, so the number ${pro} has now is the big number. It is missing, so we add.`)
      : `${Word(a)} is the big number. A small number is missing, so we subtract.`);
    return {
      print: `${s.body.print} ${s.ask.print}`, say: `${s.body.say} ${s.ask.say}`, ask: s.ask.say, ans: p.ans,
      reason, brief: briefOf(p),
      plan: `${short}We ${add ? "add" : "subtract"}. ${spoken(p)}`,
      why: `${reason} ${briefOf(p)}`,
      key: `story:${id === "extra" ? "extra" : "one"}:${a}${p.op === "+" ? "+" : "-"}${b}`,
    };
  }
  if (id === "compare") {
    const p = gen(r, r.pick(["sub2", "sub2t"]));
    const [big, small] = p.rows;
    const more = r() < 0.5;
    const thing = r.pick(["stickers", "marbles", "coins", "apples", "pages", "minutes", "steps"]);
    const verb = VERBS[thing];
    const has = (n) => (verb ? tell`${name} ${verb.past} ${n} ${thing}.` : tell`${name} has ${n} ${thing}.`);
    const hasO = (n) => (verb ? tell`${other} ${verb.past} ${n} ${thing}.` : tell`${other} has ${n} ${thing}.`);
    const s1 = has(more ? big : small), s2 = hasO(more ? small : big);
    const ask = verb
      ? tell`How many ${more ? "more" : "fewer"} ${thing} did ${name} ${verb.base} than ${other}?`
      : tell`How many ${more ? "more" : "fewer"} ${thing} does ${name} have than ${other}?`;
    const reason = `${more ? name : other} ${verb ? verb.past.split(" ")[0] : "has"} more, so ${word(big)} is the big number. How many ${more ? "more" : "fewer"} is a small number. It is missing, so we subtract.`;
    return {
      print: `${s1.print} ${s2.print} ${ask.print}`, say: `${s1.say} ${s2.say} ${ask.say}`, ask: ask.say, ans: p.ans,
      reason, brief: briefOf(p), plan: `We subtract. ${spoken(p)}`, why: `${reason} ${briefOf(p)}`,
      beside: [V.col2(V.tape([{ len: big, label: String(big) }]), V.tape([{ len: small, label: String(small) }, { len: p.ans, label: "?" }], { unknown: 1 }))],
      key: `story:cmp:${big}-${small}`,
    };
  }
  if (id === "two-step" || id === "big") return twoStory(r, w, id === "big");
  // A letter stands for the unknown: the start, or the change.
  const L = r.pick(["a", "b", "n"]);
  const thing = r.pick(COUNTABLE), v = THINGS[thing];
  const form = r.pick(["start+", "change+", "change-", "start-"]);
  const p = gen(r, form.endsWith("+") ? r.pick(["add2", "add2c"]) : r.pick(["sub2", "sub2t"]));
  const [x, y] = p.rows, z = p.ans;
  let body, ask, eq, ans, work, short, reason;
  if (form === "start+") {
    body = tell`${name} had some ${thing}. ${Pro} ${v.get} ${y} more. Now ${pro} has ${z} ${thing}.`;
    ask = tell`How many ${thing} did ${name} have at the start?`;
    eq = V.eq(L, "+", y, "=", z); ans = x; work = { rows: [z, y], op: "−", ans: x };
    short = `${L} is the start.`;
    reason = `${short} ${Word(z)} is the big number. A small number is missing, so we subtract.`;
  } else if (form === "change+") {
    body = tell`${name} had ${x} ${thing}. ${Pro} ${v.get} some more. Now ${pro} has ${z} ${thing}.`;
    ask = tell`How many ${thing} did ${name} ${v.getBase}?`;
    eq = V.eq(x, "+", L, "=", z); ans = y; work = { rows: [z, x], op: "−", ans: y };
    short = `${L} is how many ${name} got.`;
    reason = `${short} ${Word(z)} is the big number. A small number is missing, so we subtract.`;
  } else if (form === "change-") {
    body = tell`${name} had ${x} ${thing}. ${Pro} ${v.lose} some. Now ${pro} has ${z} ${thing}.`;
    ask = tell`How many ${thing} did ${name} ${v.loseBase}?`;
    eq = V.eq(x, "−", L, "=", z); ans = y; work = { rows: [x, z], op: "−", ans: y };
    short = `${L} is how many ${name} ${v.lose}.`;
    reason = `${short} ${Word(x)} is the big number. A small number is missing, so we subtract.`;
  } else {
    body = tell`${name} had some ${thing}. ${Pro} ${v.lose} ${y} ${thing}. Now ${pro} has ${z} ${thing}.`;
    ask = tell`How many ${thing} did ${name} have at the start?`;
    eq = V.eq(L, "−", y, "=", z); ans = x; work = { rows: [z, y], op: "+", ans: x };
    short = `${L} is the start, before ${name} ${v.lose} any.`;
    reason = `${short} The start is the big number. It is missing, so we add.`;
  }
  return {
    print: `${body.print} ${ask.print}`, say: `${body.say} ${ask.say}`, test: `The letter ${L} stands for the number we do not know. What number is ${L}?`, ask: `What number is ${L}?`, ans,
    reason, brief: `${briefOf(work)} ${L} is ${word(ans)}.`,
    plan: `${short} We ${work.op === "+" ? "add" : "subtract"}. ${spoken(work)}`,
    why: `${reason} ${briefOf(work)} ${L} is ${word(ans)}.`,
    beside: [eq], keep: true,
    key: `story:letter:${eq.parts.join("")}`,
  };
}
function storyScreen(s, withBeside) {
  return [prose(linesOf(s.print)), ...(withBeside && s.beside ? s.beside : [])];
}
// The story is on the screen: the child reads it, works it, and answers.
// The script says only the question, so the panel stays short.
function storyTest(s) {
  return test(storyScreen(s, s.keep), `Read the problem to yourself, then work it. ${s.test || s.ask}`, Word(s.ans) + ".", fixWork(Word(s.ans) + ".", s.ask, s.why), {
    skill: "story", item: s.key, ...(s.two ? { do: WHITEBOARD, secs: 50 } : { secs: 25 }),
  });
}

export const stories = {
  id: "stories",
  name: "Story problems",
  summary: "Solve story problems read from the screen: one step within 100, how many more and how many fewer, two steps, a number to leave out, two steps within 1,000, and a letter standing for the unknown.",
  standard: "2.OA.1",
  units: [
    { id: "one-step", lesson: 10, label: "One step: add or subtract" },
    { id: "compare", lesson: 30, label: "How many more, how many fewer" },
    { id: "two-step", lesson: 46, label: "Two steps" },
    { id: "extra", lesson: 62, label: "A number to leave out" },
    { id: "big", lesson: 96, label: "Two steps with bigger numbers" },
    { id: "letter", lesson: 120, label: "A letter for the unknown" },
  ],
  item(u, r) { return storyTest(storyOf(r, u.id)); },
  newEx(u, ctx) {
    const r = ctx.rand;
    const intro = {
      "one-step": "The story is on the screen. I read it, then I decide: add or subtract.",
      compare: "How many more and how many fewer both ask for the difference. The bars show it.",
      "two-step": "This story has two steps. I do the first step, then use its answer in the second.",
      extra: "This story has a number we do not need. I read the question first, then use only the numbers that answer it.",
      big: "Two steps, with bigger numbers. Each step is worked in columns on the whiteboard.",
      letter: "The letter stands for the number we do not know. The equation on the screen shows where it goes.",
    }[u.id];
    const m = storyOf(r, u.id), l = storyOf(r, u.id);
    const doLine = u.id === "compare" ? "Point to the two bars: the longer one, the shorter one, and the part marked with a question mark." : u.id === "letter" ? "Point to the letter in the equation." : "Run a finger under the lines as you read.";
    return {
      title: u.label, steps: [
        model(storyScreen(m, true), `${intro} ${m.say}`, { do: doLine }),
        model(storyScreen(m, true), `My turn. ${m.reason} ${m.brief}`, m.two ? { do: "Work each step on the whiteboard as you say it." } : {}),
        lead(storyScreen(l, true), `${l.say} Do it with me. ${l.plan} What is the answer?`, Word(l.ans) + ".", l.two ? { do: WHITEBOARD } : {}),
        storyTest(storyOf(r, u.id)), storyTest(storyOf(r, u.id)), storyTest(storyOf(r, u.id)),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: this.name, steps: drawSteps(r, intro, 3, (u) => this.item(u, r)) };
  },
  testItems(units, ctx, count) {
    return testDraw(ctx.rand, units, count || 2, (u, r) => this.item(u, r));
  },
};
