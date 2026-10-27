// Second Grade: numbers to 1,000, mental math, and the facts to 20. See BRIEF.md.
//
//   numbers  hundreds, three-digit numbers, expanded form, zeros, comparing,
//            ordering, counting on, and one thousand
//   mental   ten and a hundred more or less, adding tens and hundreds, plus
//            and minus nine and eleven, what makes a hundred, and doubles
//   facts    the facts to 20, known from memory, with the one-minute check

import { V, model, lead, test, note, fix, fixPoint, fixChain, word, Word, chain, Chain, favorNew, factStep, digits, hundreds, tens, ones, readableMax, intWhere } from "./common2.js";

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

// Steps made by the makers in turn, with no item repeated: a maker whose
// item is already in the list is tried again, and dropped if it still repeats.
function draw(makers) {
  const steps = [], seen = new Set();
  for (const make of makers) {
    let st = make();
    for (let i = 0; i < 12 && seen.has(st.item); i++) st = make();
    if (seen.has(st.item)) continue;
    seen.add(st.item);
    steps.push(st);
  }
  return steps;
}

// The units to review: when a unit is being firmed, half the items are its;
// otherwise the newest units are favored.
function picksFor(r, intro, firm, n) {
  if (firm) return [firm, firm, ...favorNew(r, intro, n - 2)];
  return favorNew(r, intro, n);
}

// ─────────────────────────────────────────────────────────────
// Numbers to 1,000
// ─────────────────────────────────────────────────────────────

// A three-digit number up to max. mode: "plain" (tens and ones both
// present), "zeros" (a zero in the tens or the ones, or both), or "any".
function threeDigit(r, max, mode = "plain") {
  const top = Math.min(max, 999);
  return intWhere(r, 101, top, (n) => {
    const { t, o } = digits(n);
    if (mode === "zeros") return t === 0 || o === 0;
    if (mode === "plain") return t > 0 && o > 0;
    return true;
  });
}

// "three hundreds, four tens, five ones"
function partsOf(n) {
  const { h, t, o } = digits(n);
  return `${hundreds(h)}, ${tens(t)}, ${ones(o)}`;
}

function zeroRule(n) {
  const { h, t, o } = digits(n);
  if (t === 0 && o === 0) return `The zeros hold the tens place and the ones place: no tens, no ones. ${cap(hundreds(h))}: ${word(n)}.`;
  if (t === 0) return `The zero holds the tens place: no tens. ${cap(hundreds(h))}, no tens, ${ones(o)}: ${word(n)}.`;
  return `The zero holds the ones place: no ones. ${cap(hundreds(h))}, ${tens(t)}, no ones: ${word(n)}.`;
}

// ── Hundreds ──
function hundredsItem(r) {
  const h = r.int(2, 9);
  const ask = "How many hundreds? What number is that?";
  const ans = `${Word(h)} hundreds. ${Word(h * 100)}.`;
  return test(V.blocks(0, h, 0, 0), ask, ans, fix(ans, ask, `Each flat is one hundred. I count by hundreds: ${chain(100, h * 100, 100)}.`), { skill: "place-value", item: `pv-h:${h}` });
}
function hundredsNum(r) {
  const h = r.int(2, 9);
  const ask = "Each flat is one hundred. What number do the blocks show?";
  return test(V.blocks(0, h, 0, 0), ask, Word(h * 100) + ".", fix(Word(h * 100) + ".", ask, `I count by hundreds: ${chain(100, h * 100, 100)}. ${Word(h)} hundreds is ${word(h * 100)}.`), { skill: "place-value", item: `pv-h00:${h}` });
}
function tensInHundred() {
  const ask = "How many tens make one hundred?";
  return test(V.say(), ask, "Ten.", fix("Ten.", ask, `Ten tens make one hundred. Count by tens: ${chain(10, 100, 10)}.`), { skill: "place-value", item: "pv-tens-in-100" });
}

// ── Three-digit numbers from blocks and numerals ──
function blocksItem(r, max, mode) {
  const n = threeDigit(r, max, mode);
  const { h, t, o } = digits(n);
  const ask = "Say the hundreds, tens, and ones. Then say the number.";
  const ans = `${cap(partsOf(n))}. ${Word(n)}.`;
  return test(V.row(V.blocks(0, h, t, o), V.num(n)), ask, ans, fix(ans, ask, `The flats are hundreds: ${hundreds(h)}. The rods are tens: ${tens(t)}. The small blocks are ones: ${ones(o)}.`), { skill: "place-value", item: `pv-blocks:${n}` });
}
function blocksNum(r, max, mode) {
  const n = threeDigit(r, max, mode);
  const { h, t, o } = digits(n);
  const ask = "What number do the blocks show?";
  return test(V.blocks(0, h, t, o), ask, Word(n) + ".", fix(Word(n) + ".", ask, `${cap(partsOf(n))}: ${word(n)}.`), { skill: "place-value", item: `pv-show:${n}` });
}
function readItem(r, max, mode) {
  const n = threeDigit(r, max, mode);
  const { h, t, o } = digits(n);
  const ask = "What number is this?";
  const rule = t === 0 || o === 0 ? zeroRule(n) : `The first digit tells the hundreds: ${word(h * 100)}. The last two digits tell the tens and ones: ${word(n % 100)}. ${Word(n)}.`;
  return test(V.num(n), ask, Word(n) + ".", fix(Word(n) + ".", ask, rule), { skill: "place-value", item: `pv-read:${n}` });
}

// ── Expanded form ──
function expandItem(r, max) {
  const n = threeDigit(r, max);
  const { h, t, o } = digits(n);
  const ask = `${Word(n)}. Say it the long way: hundreds plus tens plus ones.`;
  const ans = `${Word(h * 100)} plus ${word(t * 10)} plus ${word(o)}.`;
  return test(V.num(n), ask, ans, fix(ans, ask, `The ${word(h)} is ${hundreds(h)}: ${word(h * 100)}. The ${word(t)} is ${tens(t)}: ${word(t * 10)}. The ${word(o)} is ${ones(o)}: ${word(o)}.`), { skill: "place-value", item: `pv-expand:${n}` });
}
function collapseItem(r, max) {
  const n = threeDigit(r, max);
  const { h, t, o } = digits(n);
  const ask = `${Word(h * 100)} plus ${word(t * 10)} plus ${word(o)}. What number is that?`;
  return test(V.eq(h * 100, "+", t * 10, "+", o, "=", "?"), ask, Word(n) + ".", fix(Word(n) + ".", ask, `Put the parts together: ${partsOf(n)} make ${word(n)}.`), { skill: "place-value", item: `pv-collapse:${n}` });
}

// ── Zeros ──
function zeroTouch(r, max) {
  const n = threeDigit(r, max, "zeros");
  const { h, t, o } = digits(n);
  // The usual slips: the zero in the other place, and the zero left out.
  let wrong;
  if (t === 0 && o === 0) wrong = [h * 10, h];
  else if (t === 0) wrong = [h * 100 + o * 10, h * 10 + o];
  else wrong = [h * 100 + t, h * 10 + t];
  const opts = r.shuffle([n, ...wrong]);
  const ask = `Touch ${word(n)}.`;
  return test(V.choices(opts.map((x) => V.num(x)), opts.indexOf(n)), ask, `(Touches ${n}.)`,
    fixPoint(`${Word(n)}: ${word(h)} in the hundreds place, ${word(t)} in the tens place, ${word(o)} in the ones place. (Touch ${n}.)`, ask),
    { skill: "place-value", item: `pv-touch:${n}`, confirm: `Yes, that is ${word(n)}.` });
}

// ── Comparing ──
// Two different numbers that are decided at one place: "h" the hundreds,
// "t" the tens (same hundreds), "o" the ones (same hundreds and tens).
function comparePair(r, max, place) {
  const top = Math.min(max, 999);
  if (place === "h") {
    const a = threeDigit(r, top, "any");
    const b = intWhere(r, 101, top, (x) => digits(x).h !== digits(a).h);
    return [a, b];
  }
  const a = threeDigit(r, top - 100, "any");
  const { h, t, o } = digits(a);
  if (place === "t") return [a, h * 100 + intWhere(r, 0, 9, (x) => x !== t) * 10 + o];
  return [a, h * 100 + t * 10 + intWhere(r, 0, 9, (x) => x !== o)];
}
function compareRule(a, b) {
  if (a === b) return "The numbers are the same, so they are equal.";
  const big = Math.max(a, b), small = Math.min(a, b);
  const B = digits(big), S = digits(small);
  if (B.h !== S.h) return `Compare the hundreds first. ${cap(hundreds(B.h))} is more than ${hundreds(S.h)}, so ${word(big)} is more.`;
  if (B.t !== S.t) return `The hundreds are the same, so compare the tens. ${cap(tens(B.t))} is more than ${tens(S.t)}, so ${word(big)} is more.`;
  return `The hundreds and tens are the same, so compare the ones. ${Word(B.o)} is more than ${word(S.o)}, so ${word(big)} is more.`;
}
function compareRead(r, max, place) {
  const [a, b] = comparePair(r, max, place);
  const sign = a > b ? ">" : "<";
  const ans = `${Word(a)} is ${sign === ">" ? "more" : "less"} than ${word(b)}.`;
  return test(V.eq(a, sign, b), "Read it.", ans, fix(ans, "Read it.", `${compareRule(a, b)} The open side of the sign faces the number that is more.`), { skill: "compare", item: `cmp:${a}${sign}${b}` });
}
function compareSign(r, max, place, allowEqual) {
  let [a, b] = comparePair(r, max, place);
  if (allowEqual && r() < 0.2) b = a;
  const sign = a > b ? ">" : a < b ? "<" : "=";
  const name = sign === ">" ? "more than" : sign === "<" ? "less than" : "equals";
  const ask = "Which sign goes in the box: more than, less than, or equals? Then read it.";
  const read = sign === "=" ? `${Word(a)} equals ${word(b)}.` : `${Word(a)} is ${name} ${word(b)}.`;
  const ans = `${cap(name)}. ${read}`;
  return test(V.eq(a, "?", b), ask, ans, fix(ans, ask, compareRule(a, b)), { skill: "compare", item: `cmp-sign:${a}:${b}` });
}
function compareTouch(r, max, place) {
  const [a, b] = comparePair(r, max, place);
  const sign = a > b ? ">" : "<";
  const name = sign === ">" ? "more than" : "less than";
  const signs = [">", "<", "="];
  const ask = "Touch the sign that goes in the box.";
  return test([V.eq(a, "?", b), V.choices(signs.map((s) => V.sign(s)), signs.indexOf(sign))], ask, `(Touches the ${name} sign.)`,
    fixPoint(`${compareRule(a, b)} The open side faces ${word(Math.max(a, b))}. (Touch the ${name} sign.)`, ask),
    { skill: "compare", item: `cmp-touch:${a}:${b}`, confirm: `Yes. ${Word(a)} is ${name} ${word(b)}.` });
}

// ── Ordering ──
// Three different numbers; often two share their hundreds, so the tens decide.
function trio(r, max) {
  const top = Math.min(max, 999);
  const a = threeDigit(r, top - 100, "any");
  const { h } = digits(a);
  const b = r() < 0.6 ? intWhere(r, h * 100, h * 100 + 99, (x) => x !== a) : intWhere(r, 101, top, (x) => x !== a && digits(x).h !== h);
  const c = intWhere(r, 101, top, (x) => x !== a && x !== b && digits(x).h !== h);
  return r.shuffle([a, b, c]);
}
function orderRule(sorted) {
  const H = sorted.map((n) => digits(n).h);
  if (H[0] !== H[1] && H[1] !== H[2]) return `Compare the hundreds first: ${hundreds(H[0])}, ${hundreds(H[1])}, ${hundreds(H[2])}. The number with the fewest hundreds comes first.`;
  const [p, q] = H[0] === H[1] ? [sorted[0], sorted[1]] : [sorted[1], sorted[2]];
  const next = digits(p).t === digits(q).t ? "tens, then their ones" : "tens";
  return `Compare the hundreds first. The number with the fewest hundreds comes first. ${Word(p)} and ${word(q)} have the same hundreds, so compare their ${next}.`;
}
function orderItem(r, max) {
  const nums = trio(r, max);
  const sorted = nums.slice().sort((x, y) => x - y);
  const ask = "Say these numbers from least to greatest.";
  const ans = cap(sorted.map(word).join(", ")) + ".";
  return test(V.num(nums), ask, ans, fix(ans, ask, orderRule(sorted)), { skill: "compare", item: `order:${nums.join(":")}` });
}
function leastItem(r, max) {
  const nums = trio(r, max);
  const least = r() < 0.5;
  const which = least ? "least" : "greatest";
  const target = least ? Math.min(...nums) : Math.max(...nums);
  const sorted = nums.slice().sort((x, y) => x - y);
  const ask = `Touch the number that is ${which}.`;
  return test(V.choices(nums.map((x) => V.num(x)), nums.indexOf(target)), ask, `(Touches ${target}.)`,
    fixPoint(`${orderRule(sorted)} ${Word(target)} is ${which}. (Touch ${target}.)`, ask),
    { skill: "compare", item: `order-${which}:${nums.join(":")}`, confirm: `Yes, ${word(target)} is ${which}.` });
}

// ── Counting on ──
function countOn(r, max, across) {
  const top = Math.min(max, 999);
  let from, to;
  if (across === "hundred") {
    const h = r.int(1, Math.floor(top / 100) - 1);
    from = h * 100 + 90 + r.int(4, 7);
    to = (h + 1) * 100 + r.int(1, 3);
  } else {
    const h = r.int(1, Math.floor(top / 100) - 1), t = r.int(0, 8);
    from = h * 100 + t * 10 + r.int(4, 7);
    to = h * 100 + (t + 1) * 10 + r.int(1, 3);
  }
  const ask = `Start at ${word(from)}. Count by ones to ${word(to)}. Get it going.`;
  const ans = Chain(from, to);
  return test(V.num(from), ask, ans, fixChain(ans, ask.replace(/ Get it going\.$/, "")), {
    skill: "count-aloud",
    item: `count:${from}:${to}`,
    do: `Signal: pause, then nod for the child to begin. Listen at the new ${across}.`,
  });
}
function nextItem(r, max) {
  const top = Math.min(max, 999);
  const acrossHundred = r() < 0.5;
  const n = acrossHundred ? r.int(1, Math.floor(top / 100) - 1) * 100 + 99 : r.int(1, Math.floor(top / 100) - 1) * 100 + r.int(0, 8) * 10 + 9;
  const ask = `What number comes right after ${word(n)}?`;
  const rule = acrossHundred ? `After a number that ends in ninety-nine comes the next hundred. ${Word(n)}, ${word(n + 1)}.` : `After a number that ends in nine comes the next ten. ${Word(n)}, ${word(n + 1)}.`;
  return test(V.num(n), ask, Word(n + 1) + ".", fix(Word(n + 1) + ".", ask, rule), { skill: "place-value", item: `next:${n}` });
}

// ── One thousand ──
function thousandRead() {
  const ask = "What number is this?";
  return test(V.num(1000), ask, "One thousand.", fix("One thousand.", ask, "A one and three zeros is one thousand. One thousand is ten hundreds."), { skill: "place-value", item: "pv-read:1000" });
}
function hundredsMake() {
  const ask = "How many hundreds make one thousand?";
  return test(V.say(), ask, "Ten.", fix("Ten.", ask, `Ten hundreds make one thousand. Count by hundreds: ${chain(100, 1000, 100)}. That is ten hundreds.`), { skill: "place-value", item: "pv-hundreds-in-1000" });
}
function byHundreds(r) {
  const from = r.int(1, 6) * 100;
  const ask = `Start at ${word(from)}. Count by hundreds to one thousand. Get it going.`;
  const ans = Chain(from, 1000, 100);
  return test(V.say(), ask, ans, fixChain(ans, ask.replace(/ Get it going\.$/, "")), {
    skill: "count-aloud",
    item: `count100:${from}`,
    confirm: "Yes.",
    do: "Signal: pause, then nod for the child to begin. The chain ends at one thousand.",
  });
}
function hundredsIn(r) {
  const h = r.int(2, 9);
  const ask = `How many hundreds are in ${word(h * 100)}?`;
  return test(V.num(h * 100), ask, Word(h) + ".", fix(Word(h) + ".", ask, `The first digit tells the hundreds. ${Word(h * 100)} is ${hundreds(h)}.`), { skill: "place-value", item: `pv-hundreds-in:${h * 100}` });
}

export const numbers = {
  id: "numbers",
  name: "Numbers to 1,000",
  summary: "Hundreds, tens, and ones to 1,000: a hundred is ten tens; read, build, and expand three-digit numbers; zeros that hold a place; compare with more than, less than, and equals; order from least to greatest; count on across tens and hundreds; and one thousand as ten hundreds.",
  standard: "2.NBT.1, 2.NBT.3, 2.NBT.4",
  units: [
    { id: "hundreds", lesson: 2, label: "A hundred is ten tens" },
    { id: "three-digit", lesson: 4, label: "Hundreds, tens, and ones" },
    { id: "expanded", lesson: 8, label: "The long way: hundreds plus tens plus ones" },
    { id: "zeros", lesson: 12, label: "A zero holds the place" },
    { id: "compare", lesson: 16, label: "More than and less than" },
    { id: "order", lesson: 22, label: "Least to greatest" },
    { id: "count-on", lesson: 26, label: "Counting on across a ten and a hundred" },
    { id: "thousand", lesson: 35, label: "One thousand is ten hundreds" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand, max = readableMax(ctx.lesson);
    let steps;
    switch (u.id) {
      case "hundreds":
        steps = [
          model(V.row(V.pv(10, 0), V.blocks(0, 1, 0, 0)), "Here are ten tens. My turn. Ten tens make one hundred. This flat is one hundred. It is the same as ten tens.", { do: "Point to the ten sticks, then to the flat." }),
          model(V.blocks(0, 3, 0, 0), "We count flats by hundreds. My turn. One hundred, two hundred, three hundred. Three hundreds. Three hundred."),
          lead(V.blocks(0, 4, 0, 0), "Count the hundreds with me. Get ready.", Chain(100, 400, 100)),
          lead(V.blocks(0, 1, 0, 0), "How many tens make one hundred? Say it with me.", "Ten."),
          ...draw([() => hundredsItem(r), () => hundredsItem(r), () => tensInHundred(), () => hundredsItem(r)]),
        ];
        break;
      case "three-digit":
        steps = [
          model(V.row(V.blocks(0, 3, 4, 5), V.num(345)), "A number can have hundreds, tens, and ones. My turn. Three flats: three hundreds. Four rods: four tens. Five small blocks: five ones. Three hundred forty-five.", { do: "Point to each group of blocks, then to its digit." }),
          model(V.num(345), "In three hundred forty-five, the three is in the hundreds place. The four is in the tens place. The five is in the ones place."),
          lead(V.row(V.blocks(0, 2, 6, 3), V.num(263)), "Say the hundreds, tens, and ones with me. Then the number.", "Two hundreds, six tens, three ones. Two hundred sixty-three."),
          ...draw([() => blocksItem(r, max), () => blocksItem(r, max), () => readItem(r, max), () => blocksItem(r, max)]),
        ];
        break;
      case "expanded":
        steps = [
          model(V.eq(345, "=", 300, "+", 40, "+", 5), "We can say a number the long way: hundreds plus tens plus ones. My turn. Three hundred forty-five is three hundred plus forty plus five."),
          model(V.eq(200, "+", 70, "+", 8, "=", "?"), "It works the other way too. Two hundred plus seventy plus eight. Two hundreds, seven tens, eight ones: two hundred seventy-eight."),
          lead(V.num(416), "Four hundred sixteen. Say it the long way with me.", "Four hundred plus ten plus six."),
          ...draw([() => expandItem(r, max), () => collapseItem(r, max), () => expandItem(r, max), () => collapseItem(r, max)]),
        ];
        break;
      case "zeros":
        steps = [
          model(V.row(V.blocks(0, 3, 0, 5), V.num(305)), "Sometimes a place has nothing in it. My turn. Three hundreds, no tens, five ones. We write a zero in the tens place to hold it. Three hundred five."),
          model(V.num([340, 500]), "Three hundred forty: four tens and no ones, so a zero holds the ones place. Five hundred: no tens and no ones, so two zeros hold their places."),
          lead(V.row(V.blocks(0, 2, 0, 7), V.num(207)), "Say the hundreds, tens, and ones with me. Then the number.", "Two hundreds, no tens, seven ones. Two hundred seven."),
          ...draw([() => blocksItem(r, max, "zeros"), () => readItem(r, max, "zeros"), () => zeroTouch(r, max), () => readItem(r, max, "zeros")]),
        ];
        break;
      case "compare":
        steps = [
          model(V.eq(345, ">", 298), "This sign means more than. The open side faces the number that is more. My turn. Three hundred forty-five is more than two hundred ninety-eight."),
          model(V.eq(345, ">", 298), "How do I know? I compare the hundreds first. Three hundreds is more than two hundreds. When the hundreds are the same, I compare the tens, then the ones."),
          model(V.eq(452, "<", 471), "This sign means less than. The point faces the number that is less. Same hundreds, so I compare the tens. Four hundred fifty-two is less than four hundred seventy-one."),
          lead(V.eq(386, ">", 384), "The hundreds are the same. The tens are the same. So we compare the ones. Read it with me.", "Three hundred eighty-six is more than three hundred eighty-four."),
          ...draw([() => compareRead(r, max, "h"), () => compareRead(r, max, "t"), () => compareSign(r, max, r.pick(["h", "t", "o"]))]),
        ];
        break;
      case "order":
        steps = [
          model(V.num([350, 210, 305]), "To order numbers from least to greatest, compare the hundreds first. My turn. Two hundred ten has two hundreds; the others have three. So two hundred ten is least."),
          model(V.num([350, 210, 305]), "Three hundred five and three hundred fifty have the same hundreds. Compare the tens: no tens is less than five tens. Two hundred ten, three hundred five, three hundred fifty."),
          lead(V.num([480, 136, 412]), "Which has the fewest hundreds? One hundred thirty-six. The other two have the same hundreds, so compare their tens. Say them from least to greatest with me.", "One hundred thirty-six, four hundred twelve, four hundred eighty."),
          ...draw([() => orderItem(r, max), () => leastItem(r, max), () => orderItem(r, max), () => orderItem(r, max)]),
        ];
        break;
      case "count-on":
        steps = [
          model(V.num(347), `We can count on from any number. Listen for the new ten. My turn. ${Chain(347, 351)}`),
          model(V.num(597), `Now across a hundred. After five hundred ninety-nine comes six hundred. My turn. ${Chain(597, 601)}`),
          lead(V.num(296), "Count with me. Start at two hundred ninety-six. Count by ones to three hundred two. Get it going.", Chain(296, 302)),
          ...draw([() => countOn(r, max, "ten"), () => countOn(r, max, "hundred"), () => nextItem(r, max), () => countOn(r, max, "hundred")]),
        ];
        break;
      default:
        steps = [
          model(V.row(V.blocks(0, 9, 0, 0), V.num(900)), "Nine flats: nine hundreds. Nine hundred. One more hundred would make ten hundreds."),
          model(V.row(V.blocks(1, 0, 0, 0), V.num(1000)), "My turn. Ten hundreds make one thousand. This big cube is one thousand. We write it with a one and three zeros."),
          lead(V.say(), "Count by hundreds with me. Start at one hundred. Count to one thousand. Get it going.", Chain(100, 1000, 100)),
          ...draw([() => hundredsMake(), () => thousandRead(), () => byHundreds(r), () => hundredsIn(r)]),
        ];
    }
    return { title: u.label, steps };
  },
  // One review item for a unit.
  reviewItem(u, r, max, intro) {
    const mode = intro.some((x) => x.id === "zeros") ? "any" : "plain";
    switch (u.id) {
      case "hundreds": return r() < 0.6 ? hundredsItem(r) : r() < 0.5 ? hundredsNum(r) : tensInHundred();
      case "three-digit": return r() < 0.5 ? blocksItem(r, max, mode) : readItem(r, max, mode);
      case "expanded": return r() < 0.5 ? expandItem(r, max) : collapseItem(r, max);
      case "zeros": return r.pick([() => readItem(r, max, "zeros"), () => zeroTouch(r, max), () => blocksItem(r, max, "zeros")])();
      case "compare": return r() < 0.5 ? compareRead(r, max, r.pick(["h", "t", "o"])) : compareSign(r, max, r.pick(["h", "t", "o"]), true);
      case "order": return r() < 0.6 ? orderItem(r, max) : leastItem(r, max);
      case "count-on": return r() < 0.6 ? countOn(r, max, r.pick(["ten", "hundred"])) : nextItem(r, max);
      default: return r.pick([() => byHundreds(r), () => hundredsIn(r), () => hundredsMake(), () => thousandRead()])();
    }
  },
  // One item answered alone: a spoken number or one touch.
  testItem(u, r, max) {
    switch (u.id) {
      case "hundreds": return hundredsNum(r);
      case "three-digit": return r() < 0.5 ? blocksNum(r, max, "plain") : readItem(r, max, "plain");
      case "expanded": return collapseItem(r, max);
      case "zeros": return r() < 0.5 ? zeroTouch(r, max) : readItem(r, max, "zeros");
      case "compare": return compareTouch(r, max, r.pick(["h", "t", "o"]));
      case "order": return leastItem(r, max);
      case "count-on": return nextItem(r, max);
      default: return r() < 0.5 ? hundredsIn(r) : hundredsMake();
    }
  },
  reviewEx(intro, ctx, firm) {
    const r = ctx.rand, max = readableMax(ctx.lesson);
    const picks = picksFor(r, intro, firm, 4);
    return { title: "Numbers to 1,000", steps: draw(picks.map((u) => () => this.reviewItem(u, r, max, intro))) };
  },
  testItems(units, ctx, count = 3) {
    const r = ctx.rand, max = readableMax(ctx.lesson);
    const u = units[units.length - 1];
    const earlier = units.slice(0, -1);
    const makers = [];
    if (earlier.length) makers.push(() => this.testItem(r.pick(earlier), r, max));
    makers.push(() => this.testItem(u, r, max), () => this.testItem(u, r, max));
    while (makers.length < count) makers.push(() => this.testItem(r.pick(units), r, max));
    return draw(makers);
  },
};

// ─────────────────────────────────────────────────────────────
// Mental math
// ─────────────────────────────────────────────────────────────

// A mental-math item: the screen, the question, the answer as a number, the
// rule that gives it, and the key.
function mentalItem(screen, ask, ans, rule, key) {
  return test(screen, ask, Word(ans) + ".", fix(Word(ans) + ".", ask, rule), { skill: "mental", item: `mental:${key}` });
}
// Half the items are spoken only; the rest show the problem with a blank.
const spokenOr = (r, eq) => (r() < 0.5 ? V.say() : eq);
// The kind of an item: by k, the item's place in a new-teaching exercise,
// so that both kinds are taught; at random in a review.
const kindOf = (r, k) => (k === undefined ? r() < 0.5 : k % 2 === 0);

function tenMore(r, k) {
  const more = kindOf(r, k);
  const n = more ? r.int(11, 89) : r.int(21, 99);
  const ans = more ? n + 10 : n - 10;
  const ask = `Ten ${more ? "more" : "less"} than ${word(n)}?`;
  const rule = more ? "Ten more is one more ten. The tens digit goes up one, and the ones stay the same." : "Ten less is one ten fewer. The tens digit goes down one, and the ones stay the same.";
  return mentalItem(spokenOr(r, V.eq(n, more ? "+" : "−", 10, "=", "?")), ask, ans, `${rule} ${Word(n)}, ${word(ans)}.`, `${n}${more ? "+" : "-"}10`);
}
function hundredMore(r, max, k) {
  const top = Math.min(max, 999);
  const more = kindOf(r, k);
  const n = more ? r.int(101, top - 100) : r.int(201, top);
  const ans = more ? n + 100 : n - 100;
  const ask = `A hundred ${more ? "more" : "less"} than ${word(n)}?`;
  const rule = more ? "A hundred more is one more hundred. The hundreds digit goes up one. The tens and ones stay the same." : "A hundred less is one hundred fewer. The hundreds digit goes down one. The tens and ones stay the same.";
  return mentalItem(spokenOr(r, V.eq(n, more ? "+" : "−", 100, "=", "?")), ask, ans, `${rule} ${Word(n)}, ${word(ans)}.`, `${n}${more ? "+" : "-"}100`);
}
function tenAcross(r, max, k) {
  const top = Math.min(max, 999);
  const more = kindOf(r, k);
  const h = r.int(1, Math.floor(top / 100) - 1);
  const n = more ? h * 100 + 90 + r.int(0, 9) : (h + 1) * 100 + r.int(0, 9);
  const ans = more ? n + 10 : n - 10;
  const ask = `Ten ${more ? "more" : "less"} than ${word(n)}?`;
  const rule = more
    ? `Ten more than ${word(n % 100)} is ${word(n % 100 + 10)}: the tens make a new hundred. So ten more than ${word(n)} is ${word(ans)}.`
    : `Ten less than ${word(100 + n % 100)} is ${word(90 + n % 100)}: a hundred opens into tens. So ten less than ${word(n)} is ${word(ans)}.`;
  return mentalItem(spokenOr(r, V.eq(n, more ? "+" : "−", 10, "=", "?")), ask, ans, rule, `${n}${more ? "+" : "-"}10`);
}
function addTens(r, k) {
  const add = kindOf(r, k);
  const n = add ? r.int(11, 79) : r.int(31, 99);
  const { t } = digits(n);
  const c = add ? r.int(2, 9 - t) : r.int(2, t - 1);
  const m = c * 10, ans = add ? n + m : n - m;
  const ask = `${Word(n)} ${add ? "plus" : "minus"} ${word(m)}?`;
  const rule = add
    ? `${Word(m)} is ${tens(c)}. ${cap(tens(t))} and ${tens(c)} more is ${tens(t + c)}. The ones stay the same.`
    : `${Word(m)} is ${tens(c)}. ${cap(tens(t))} take away ${tens(c)} is ${tens(t - c)}. The ones stay the same.`;
  return mentalItem(spokenOr(r, V.eq(n, add ? "+" : "−", m, "=", "?")), ask, ans, rule, `${n}${add ? "+" : "-"}${m}`);
}
function addHundreds(r, max, k) {
  const top = Math.min(max, 999);
  const add = kindOf(r, k);
  const n = add ? r.int(101, top - 200) : r.int(301, top);
  const { h } = digits(n);
  const c = add ? r.int(2, Math.floor(top / 100) - h) : r.int(2, h - 1);
  const m = c * 100, ans = add ? n + m : n - m;
  const ask = `${Word(n)} ${add ? "plus" : "minus"} ${word(m)}?`;
  const rule = add
    ? `${Word(m)} is ${hundreds(c)}. ${cap(hundreds(h))} and ${hundreds(c)} more is ${hundreds(h + c)}. The tens and ones stay the same.`
    : `${Word(m)} is ${hundreds(c)}. ${cap(hundreds(h))} take away ${hundreds(c)} is ${hundreds(h - c)}. The tens and ones stay the same.`;
  return mentalItem(spokenOr(r, V.eq(n, add ? "+" : "−", m, "=", "?")), ask, ans, rule, `${n}${add ? "+" : "-"}${m}`);
}
function nearTen(r, k) {
  // Plus nine, plus eleven, minus nine, minus eleven, in that order when taught.
  const add = k === undefined ? r() < 0.5 : k < 2;
  const by = k === undefined ? r.pick([9, 11]) : [9, 11][k % 2];
  const n = add ? r.int(12, 88) : r.int(22, 99);
  const ans = add ? n + by : n - by;
  const ask = `${Word(n)} ${add ? "plus" : "minus"} ${word(by)}?`;
  const ten = add ? n + 10 : n - 10;
  const rule = add
    ? (by === 9 ? `To add nine, add ten and take one back. ${Word(n)} plus ten is ${word(ten)}. One back: ${word(ans)}.` : `To add eleven, add ten and one more. ${Word(n)} plus ten is ${word(ten)}. One more: ${word(ans)}.`)
    : (by === 9 ? `To take away nine, take away ten and give one back. ${Word(n)} minus ten is ${word(ten)}. One back: ${word(ans)}.` : `To take away eleven, take away ten and one more. ${Word(n)} minus ten is ${word(ten)}. One more: ${word(ans)}.`);
  return mentalItem(spokenOr(r, V.eq(n, add ? "+" : "−", by, "=", "?")), ask, ans, rule, `${n}${add ? "+" : "-"}${by}`);
}
function makeHundred(r, k) {
  // What makes a hundred with tens, then with fives; then one hundred minus tens, minus fives.
  const sub = k === undefined ? r() < 0.4 : k >= 2;
  const fives = k === undefined ? r() < 0.4 : k % 2 === 1;
  const n = fives ? 10 * r.int(0, 8) + 5 : 10 * r.int(1, 9);
  const ans = 100 - n;
  const ask = sub ? `One hundred minus ${word(n)}?` : `${Word(n)} plus what makes one hundred?`;
  const screen = sub ? V.eq(100, "−", n, "=", "?") : V.eq(n, "+", "?", "=", 100);
  let rule;
  if (n % 10 === 0) rule = `${cap(tens(n / 10))} and ${tens(ans / 10)} make ten tens. Ten tens is one hundred. ${Word(n)} and ${word(ans)} make one hundred.`;
  else if (n === 95) rule = "Ninety-five and five make one hundred.";
  else rule = `${Word(n)} and five make ${word(n + 5)}. ${Word(n + 5)} and ${word(95 - n)} make one hundred. Five and ${word(95 - n)} is ${word(ans)}.`;
  return mentalItem(screen, ask, ans, rule, sub ? `100-${n}` : `${n}+?=100`);
}
function doubleItem(r, k) {
  const ofTens = k === undefined ? r() < 0.4 : k === 0;
  const n = ofTens ? 10 * r.int(2, 5) : intWhere(r, 11, 50, (x) => x % 10 !== 0);
  const ans = 2 * n;
  const { t, o } = digits(n);
  const ask = `${Word(n)} plus ${word(n)}?`;
  const rule = ofTens
    ? `Double the tens. ${cap(tens(t))} and ${tens(t)} is ${tens(2 * t)}: ${word(ans)}.`
    : `Double the tens, then double the ones. ${Word(t * 10)} and ${word(t * 10)} is ${word(2 * t * 10)}. ${Word(o)} and ${word(o)} is ${word(2 * o)}. ${Word(2 * t * 10)} and ${word(2 * o)} is ${word(ans)}.`;
  return mentalItem(spokenOr(r, V.eq(n, "+", n, "=", "?")), ask, ans, rule, `${n}+${n}`);
}

export const mental = {
  id: "mental",
  name: "Mental math",
  summary: "Sums and differences said without paper: ten and a hundred more or less, including across a hundred; adding and subtracting tens and hundreds; plus and minus nine and eleven by way of ten; what makes a hundred; and doubles of tens and of numbers to fifty.",
  standard: "2.NBT.8, 2.OA.2",
  units: [
    { id: "ten-more", lesson: 6, label: "Ten more and ten less" },
    { id: "hundred-more", lesson: 18, label: "A hundred more and a hundred less" },
    { id: "ten-across", lesson: 28, label: "Ten more and ten less across a hundred" },
    { id: "add-tens", lesson: 40, label: "Adding and subtracting tens" },
    { id: "add-hundreds", lesson: 48, label: "Adding and subtracting hundreds" },
    { id: "near-ten", lesson: 60, label: "Plus and minus nine and eleven" },
    { id: "make-hundred", lesson: 70, label: "What makes a hundred" },
    { id: "doubles", lesson: 90, label: "Doubles of tens and of numbers to fifty" },
  ],
  // One item of unit u; k, when given, fixes its kind (see kindOf).
  item(u, r, max, k) {
    switch (u.id) {
      case "ten-more": return tenMore(r, k);
      case "hundred-more": return hundredMore(r, max, k);
      case "ten-across": return tenAcross(r, max, k);
      case "add-tens": return addTens(r, k);
      case "add-hundreds": return addHundreds(r, max, k);
      case "near-ten": return nearTen(r, k);
      case "make-hundred": return makeHundred(r, k);
      default: return doubleItem(r, k);
    }
  },
  newEx(u, ctx) {
    const r = ctx.rand, max = readableMax(ctx.lesson);
    const tests = draw([0, 1, 2, 3].map((k) => () => this.item(u, r, max, k)));
    let steps;
    switch (u.id) {
      case "ten-more":
        steps = [
          model(V.eq(43, "+", 10, "=", "?"), "Ten more than a number is one more ten. My turn. Ten more than forty-three? Four tens and one more ten is five tens. The ones stay the same. Fifty-three."),
          model(V.say(), "Ten less is one ten fewer. Ten less than sixty-eight? Fifty-eight. Only the tens digit changed."),
          lead(V.say(), "Ten more than twenty-seven? Say it with me.", "Thirty-seven."),
        ];
        break;
      case "hundred-more":
        steps = [
          model(V.eq(245, "+", 100, "=", "?"), "A hundred more is one more hundred. My turn. A hundred more than two hundred forty-five? Two hundreds and one more is three hundreds. Three hundred forty-five."),
          model(V.say(), "A hundred less is one hundred fewer. A hundred less than four hundred sixty? Three hundred sixty. Only the hundreds digit changed. The tens and ones stay the same."),
          lead(V.say(), "A hundred more than one hundred thirty-two? Say it with me.", "Two hundred thirty-two."),
        ];
        break;
      case "ten-across":
        steps = [
          model(V.eq(295, "+", 10, "=", "?"), "Ten more can cross into a new hundred. My turn. Ten more than two hundred ninety-five? Ten more than ninety-five is one hundred five. So it is three hundred five."),
          model(V.eq(403, "−", 10, "=", "?"), "Ten less can cross back. Ten less than four hundred three? Ten less than one hundred three is ninety-three. So it is three hundred ninety-three."),
          lead(V.say(), "Ten more than five hundred ninety-eight? Ten more than ninety-eight is one hundred eight. Say it with me.", "Six hundred eight."),
        ];
        break;
      case "add-tens":
        steps = [
          model(V.eq(34, "+", 20, "=", "?"), "Tens go with tens. My turn. Thirty-four plus twenty? Twenty is two tens. Three tens and two tens is five tens. The ones stay the same. Fifty-four."),
          model(V.eq(67, "−", 30, "=", "?"), "To take away tens, take them from the tens. Sixty-seven minus thirty? Six tens take away three tens is three tens. Thirty-seven."),
          lead(V.say(), "Forty-two plus thirty? Four tens and three tens. Say it with me.", "Seventy-two."),
        ];
        break;
      case "add-hundreds":
        steps = [
          model(V.eq(245, "+", 300, "=", "?"), "Hundreds go with hundreds. My turn. Two hundred forty-five plus three hundred? Two hundreds and three hundreds is five hundreds. The tens and ones stay the same. Five hundred forty-five."),
          model(V.eq(781, "−", 400, "=", "?"), "Seven hundred eighty-one minus four hundred? Seven hundreds take away four hundreds is three hundreds. Three hundred eighty-one."),
          lead(V.say(), "One hundred sixty plus five hundred? Say it with me.", "Six hundred sixty."),
        ];
        break;
      case "near-ten":
        steps = [
          model(V.eq(46, "+", 9, "=", "?"), "To add nine, add ten and take one back. My turn. Forty-six plus nine? Forty-six plus ten is fifty-six. One back: fifty-five."),
          model(V.eq(63, "−", 9, "=", "?"), "To take away nine, take away ten and give one back. Sixty-three minus nine? Sixty-three minus ten is fifty-three. One back: fifty-four."),
          lead(V.eq(46, "+", 11, "=", "?"), "To add eleven, add ten and one more. Forty-six plus eleven? Forty-six plus ten is fifty-six. One more. Say it with me.", "Fifty-seven."),
        ];
        break;
      case "make-hundred":
        steps = [
          model(V.eq(60, "+", "?", "=", 100), "One hundred is ten tens. My turn. Sixty plus what makes one hundred? Sixty is six tens. Six tens and four tens make ten tens. Forty."),
          model(V.eq(100, "−", 35, "=", "?"), "One hundred minus thirty-five? Think: thirty-five and what make one hundred? Thirty-five and five make forty. Forty and sixty make one hundred. Five and sixty is sixty-five."),
          lead(V.eq(30, "+", "?", "=", 100), "Thirty plus what makes one hundred? Three tens and how many tens make ten tens? Say it with me.", "Seventy."),
        ];
        break;
      default:
        steps = [
          model(V.eq(25, "+", 25, "=", "?"), "To double, double the tens, then the ones. My turn. Twenty-five plus twenty-five? Twenty and twenty is forty. Five and five is ten. Forty and ten is fifty."),
          model(V.eq(40, "+", 40, "=", "?"), "Forty plus forty? Four tens and four tens is eight tens. Eighty."),
          lead(V.say(), "Thirty-two plus thirty-two? Thirty and thirty is sixty. Two and two is four. Say it with me.", "Sixty-four."),
        ];
    }
    return { title: u.label, steps: steps.concat(tests) };
  },
  reviewEx(intro, ctx, firm) {
    const r = ctx.rand, max = readableMax(ctx.lesson);
    const picks = picksFor(r, intro, firm, 4);
    return { title: "Mental math", steps: draw(picks.map((u) => () => this.item(u, r, max))) };
  },
  testItems(units, ctx, count = 3) {
    const r = ctx.rand, max = readableMax(ctx.lesson);
    const u = units[units.length - 1];
    const earlier = units.slice(0, -1);
    const makers = [];
    if (earlier.length) makers.push(() => this.item(r.pick(earlier), r, max));
    makers.push(() => this.item(u, r, max), () => this.item(u, r, max));
    while (makers.length < count) makers.push(() => this.item(r.pick(units), r, max));
    return draw(makers);
  },
};

// ─────────────────────────────────────────────────────────────
// Facts to 20
// ─────────────────────────────────────────────────────────────

// The facts each unit drills, as [a, op, b].
const POOLS = {
  "within-10"() {
    // Plus one and minus one are left out: the child has those from Kindergarten.
    const out = [];
    for (let a = 2; a <= 8; a++) for (let b = 2; a + b <= 10; b++) out.push([a, "+", b]);
    for (let c = 4; c <= 10; c++) for (let b = 2; b <= c - 2; b++) out.push([c, "−", b]);
    return out;
  },
  "make-ten"() {
    const out = [];
    for (let b = 2; b <= 9; b++) out.push([9, "+", b], [b, "+", 9]);
    for (let b = 3; b <= 9; b++) out.push([8, "+", b], [b, "+", 8]);
    return out;
  },
  doubles() {
    const out = [];
    for (let a = 2; a <= 10; a++) out.push([a, "+", a]);
    for (let a = 2; a <= 9; a++) out.push([a, "+", a + 1], [a + 1, "+", a]);
    return out;
  },
  "teen-minus"() {
    const out = [];
    for (let c = 11; c <= 18; c++) for (let b = 2; b <= 9; b++) if (c - b >= 2 && c - b <= 9) out.push([c, "−", b]);
    return out;
  },
  families() {
    const out = [];
    for (let c = 11; c <= 18; c++) for (let a = 2; a <= 9; a++) { const b = c - a; if (b >= 2 && b <= 9) out.push([a, "+", b], [c, "−", a]); }
    return out;
  },
  mixed() { return [...POOLS["within-10"](), ...POOLS["make-ten"](), ...POOLS.doubles(), ...POOLS["teen-minus"](), ...POOLS.families()]; },
  goal() { return POOLS.mixed(); },
};

// n facts drawn from the pools in turn, no fact twice. quick: the short
// phrasing of a drill, "Nine plus six?"
function drawFacts(r, pools, n, quick = true) {
  const steps = [], seen = new Set();
  for (let i = 0, tries = 0; steps.length < n && tries < 80; i++, tries++) {
    const [a, op, b] = r.pick(pools[i % pools.length]);
    const key = `${a}${op}${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    steps.push(factStep(a, op, b, quick ? { say: `${Word(a)} ${op === "+" ? "plus" : "minus"} ${word(b)}?` } : {}));
  }
  return steps;
}

// The four facts of a teen family, said from the picture.
function familyItem(r) {
  const c = r.int(11, 18), a = r.int(Math.max(2, c - 9), Math.min(9, c - 2)), b = c - a;
  const ask = "Say the four facts in this family: two plus facts and two minus facts.";
  const facts = `${Word(a)} plus ${word(b)} equals ${word(c)}. ${Word(b)} plus ${word(a)} equals ${word(c)}. ${Word(c)} minus ${word(a)} equals ${word(b)}. ${Word(c)} minus ${word(b)} equals ${word(a)}.`;
  // The facts are printed once; the parent leads them again from the same line.
  return test(V.family(a, b, c), ask, facts,
    `The plus facts start with the small numbers. The minus facts start with the big number. My turn: ${lowerFirst(facts)} Say them with me. (Say the same four facts together.) Your turn. ${ask}`,
    { skill: "family", item: `family:${a}:${b}`, confirm: "Yes. Those are the four facts." });
}

export const facts = {
  id: "facts",
  name: "Facts to 20",
  summary: "The addition and subtraction facts to 20, met in First Grade, now said from memory: within ten, making ten, doubles, subtracting from teens, families, and mixed drills, with a one-minute check whose goal rises.",
  standard: "2.OA.2",
  keep: true,
  reviewEvery: 2,
  units: [
    { id: "within-10", lesson: 1, label: "Facts within ten, fast" },
    { id: "make-ten", lesson: 3, label: "Plus nine and plus eight: make ten" },
    { id: "doubles", lesson: 7, label: "Doubles and doubles plus one" },
    { id: "teen-minus", lesson: 11, label: "Subtracting from a teen number" },
    { id: "families", lesson: 15, label: "The four facts of a family" },
    { id: "mixed", lesson: 19, label: "Plus and minus, mixed" },
    { id: "goal", lesson: 24, label: "The one-minute check" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    const pool = POOLS[u.id]();
    let steps;
    switch (u.id) {
      case "within-10":
        steps = [
          model(V.eq(6, "+", 3, "=", "?"), "We know these facts from First Grade. Now we say them fast, from memory. My turn. Six plus three? Nine. I did not count."),
          lead(V.eq(8, "−", 5, "=", "?"), "Eight minus five? Say it with me.", "Three."),
          ...drawFacts(r, [pool], 5),
        ];
        break;
      case "make-ten":
        steps = [
          model([V.eq(9, "+", 6, "=", "?"), V.frame(10, 9, { n2: 6, frames: 2 })], "To add nine, make a ten. Nine needs one more. Take one from the six: five are left. Ten plus five is fifteen. Nine plus six is fifteen."),
          model([V.eq(8, "+", 7, "=", "?"), V.frame(10, 8, { n2: 7, frames: 2 })], "Eight needs two more to make ten. Take two from the seven: five are left. Ten plus five is fifteen. Eight plus seven is fifteen."),
          lead(V.eq(9, "+", 4, "=", "?"), "Nine plus four? Nine and one make ten. Three are left. Ten plus three. Say it with me.", "Thirteen."),
          ...drawFacts(r, [pool], 5),
        ];
        break;
      case "doubles":
        steps = [
          model(V.eq(7, "+", 7, "=", 14), "A double is a number plus itself. My turn. Seven plus seven is fourteen. Eight plus eight is sixteen. Nine plus nine is eighteen."),
          model(V.eq(7, "+", 8, "=", "?"), "Seven plus eight is a double plus one. Seven plus seven is fourteen, and one more is fifteen."),
          lead(V.eq(6, "+", 7, "=", "?"), "Six plus seven? Six plus six is twelve, and one more. Say it with me.", "Thirteen."),
          ...drawFacts(r, [pool], 5),
        ];
        break;
      case "teen-minus":
        steps = [
          model(V.eq(14, "−", 6, "=", "?"), "Fourteen minus six. One way: go down through ten. Fourteen minus four is ten. Two more to take away: ten minus two is eight."),
          model([V.eq(14, "−", 6, "=", "?"), V.family(6, "?", 14, "b")], "Another way: think the family. Six and what make fourteen? Six and eight. So fourteen minus six is eight."),
          lead(V.eq(13, "−", 5, "=", "?"), "Thirteen minus five? Thirteen minus three is ten. Two more: eight. Say it with me.", "Eight."),
          ...drawFacts(r, [pool], 5),
        ];
        break;
      case "families":
        steps = [
          model(V.family(6, 8, 14), "Every family has four facts. My turn. Six plus eight equals fourteen. Eight plus six equals fourteen. Fourteen minus six equals eight. Fourteen minus eight equals six."),
          lead(V.family(5, 9, 14), "Say the four facts with me.", "Five plus nine equals fourteen. Nine plus five equals fourteen. Fourteen minus five equals nine. Fourteen minus nine equals five."),
          ...draw([() => familyItem(r), () => familyItem(r)]),
          ...drawFacts(r, [pool], 2),
        ];
        break;
      case "mixed":
        steps = [
          model(V.eq(13, "−", 9, "=", "?"), "Now plus and minus facts come mixed. Listen for the sign. My turn. Thirteen minus nine? Four. Six plus seven? Thirteen."),
          lead(V.eq(15, "−", 8, "=", "?"), "Fifteen minus eight? Say it with me.", "Seven."),
          ...drawFacts(r, [pool], 6),
        ];
        break;
      default:
        steps = [
          note(V.say(), "Tell the child about the one-minute check: In Timed facts, under Practice, you say as many facts as you can in a minute. The goal rises as you learn more."),
          model(V.eq(8, "+", 7, "=", "?"), "My turn. Eight plus seven? Fifteen. I say it at once, without counting."),
          lead(V.eq(16, "−", 9, "=", "?"), "Sixteen minus nine? Say it with me.", "Seven."),
          ...drawFacts(r, [pool], 6),
        ];
    }
    return { title: u.label, steps };
  },
  reviewEx(intro, ctx, firm) {
    const r = ctx.rand;
    const n = r.int(5, 6);
    const picks = firm ? [firm, firm, firm, ...favorNew(r, intro, n - 3)] : favorNew(r, intro, n);
    return { title: "Facts to 20", steps: drawFacts(r, picks.map((u) => POOLS[u.id]()), n) };
  },
  testItems(units, ctx, count = 4) {
    const r = ctx.rand;
    const newest = POOLS[units[units.length - 1].id]();
    const all = units.flatMap((u) => POOLS[u.id]());
    return drawFacts(r, [all, newest, newest, all], count, false);
  },
};
