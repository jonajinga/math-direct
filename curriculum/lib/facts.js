// Facts: one ready-made test step for a fact in any of the four operations,
// with the rule a child uses to work it out said as part of the correction.
// The math levels list their facts; Quick facts, Timed facts, and the fact
// chart on Records read them from here.
import { V } from "./v.js";
import { test, fix } from "./steps.js";
import { word, Word, chain } from "./words.js";

export const OP_WORD = { "+": "plus", "−": "minus", "-": "minus", "×": "times", "÷": "divided by" };
export const OP_KEY = { "+": "+", "−": "-", "-": "-", "×": "x", "÷": "/" };
export const OP_SKILL = { "+": "add", "−": "subtract", "-": "subtract", "×": "multiply", "÷": "divide" };

export function factAnswer(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "×": return a * b;
    case "÷": return a / b;
    default: return a - b;
  }
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
  if (op === "×") {
    const ans = a * b;
    if (a === 0 || b === 0) return "Times zero is zero. Zero groups of anything is nothing.";
    if (a === 1 || b === 1) return `Times one is the number itself. One group of ${word(Math.max(a, b))} is ${word(ans)}.`;
    if (a === 10 || b === 10) return `Times ten: the number with a zero after it. ${Word(Math.min(a, b))} tens is ${word(ans)}.`;
    if (a === 2 || b === 2) return `Times two is a double. ${Word(Math.max(a, b))} plus ${word(Math.max(a, b))} is ${word(ans)}.`;
    if (a === 5 || b === 5) return `Count by fives ${word(Math.max(a, b) === 5 ? Math.min(a, b) : Math.max(a, b))} times: ${chain(5, ans, 5)}.`;
    if (a === 9 || b === 9) { const o = a === 9 ? b : a; return `Nine times a number is ten times it, minus the number. Ten times ${word(o)} is ${word(10 * o)}, minus ${word(o)} is ${word(ans)}.`; }
    if (a === b) return `It is a square. ${Word(a)} rows of ${word(a)} make ${word(ans)}.`;
    return `Count by ${word(b)}s ${word(a)} times: ${chain(b, ans, b)}.`;
  }
  if (op === "÷") {
    const ans = a / b;
    if (b === 1) return `Divided by one is the number itself. ${Word(a)} in groups of one is ${word(ans)} groups.`;
    if (a === b) return "A number divided by itself is one.";
    if (b === 10) return `Divided by ten takes the zero away. ${Word(a)} is ${word(ans)} tens.`;
    return `Think of the times fact: ${word(b)} times what is ${word(a)}? ${Word(b)} times ${word(ans)} is ${word(a)}. So ${word(a)} divided by ${word(b)} is ${word(ans)}.`;
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

// A test step for one fact. op: "+", "−", "×", or "÷".
export function factStep(a, op, b, opts = {}) {
  const sym = op === "-" ? "−" : op;
  const ans = factAnswer(a, sym, b);
  const opWord = OP_WORD[sym];
  const ask = opts.say || `${Word(a)} ${opWord} ${word(b)} is how many?`;
  return test(V.eq(a, sym, b, "=", "?"), ask, Word(ans) + ".",
    fix(Word(ans) + ".", `${Word(a)} ${opWord} ${word(b)} is how many?`, opts.preface !== undefined ? opts.preface : factHint(a, sym, b)), {
      skill: OP_SKILL[sym],
      item: `fact:${a}${OP_KEY[sym]}${b}`,
      fact: `${a}${OP_KEY[sym]}${b}`,
    });
}

// Every fact of a level, each with the lesson after which it is fair game,
// as a list for the fact pages and the fact chart.
export function factList(level) {
  return (level.facts || []).map((f) => ({ ...factStep(f.a, f.op, f.b), key: f.key, lesson: f.lesson, set: f.set || 1 }));
}
