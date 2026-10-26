// Numbers beyond the whole numbers a child first reads: fractions, mixed
// numbers, and decimals, said as a child says them, and the parsing of an
// answer back to a value. Shared by the validator, On your own, and the
// browser (it is copied to /assets/js/numbers.js and sets window.MDNum).
//
// A value is { kind: "int" | "frac" | "mixed" | "dec", value, n, d, whole, places }.
import { word, cap } from "./words.js";

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const DENOM = { half: 2, halves: 2, third: 3, thirds: 3, fourth: 4, fourths: 4, quarter: 4, quarters: 4, fifth: 5, fifths: 5, sixth: 6, sixths: 6, seventh: 7, sevenths: 7, eighth: 8, eighths: 8, ninth: 9, ninths: 9, tenth: 10, tenths: 10, eleventh: 11, elevenths: 11, twelfth: 12, twelfths: 12, hundredth: 100, hundredths: 100, thousandth: 1000, thousandths: 1000 };
const DENOM_WORD = { 2: ["half", "halves"], 3: ["third", "thirds"], 4: ["fourth", "fourths"], 5: ["fifth", "fifths"], 6: ["sixth", "sixths"], 7: ["seventh", "sevenths"], 8: ["eighth", "eighths"], 9: ["ninth", "ninths"], 10: ["tenth", "tenths"], 11: ["eleventh", "elevenths"], 12: ["twelfth", "twelfths"], 100: ["hundredth", "hundredths"], 1000: ["thousandth", "thousandths"] };

// ── Saying ──
export function fractionWord(n, d) {
  const w = DENOM_WORD[d];
  if (!w) return `${word(n)} over ${word(d)}`;
  return `${word(n)} ${n === 1 ? w[0] : w[1]}`;
}
export function mixedWord(whole, n, d) {
  return `${word(whole)} and ${fractionWord(n, d)}`;
}
// "four and five tenths"; with point: true, "four point five".
export function decimalWord(x, places, opts = {}) {
  const s = places !== undefined ? Number(x).toFixed(places) : String(x);
  const [ip, fp] = s.split(".");
  if (!fp) return word(Number(ip));
  if (opts.point) return `${word(Number(ip))} point ${fp.split("").map((c) => ONES[Number(c)]).join(" ")}`;
  const d = Math.pow(10, fp.length), n = Number(fp);
  return (Number(ip) ? word(Number(ip)) + " and " : "") + fractionWord(n, d);
}
// A value, said. ints by word(), the rest by the helpers above.
export function answerWord(v) {
  if (typeof v === "number") v = int(v);
  switch (v.kind) {
    case "frac": return fractionWord(v.n, v.d);
    case "mixed": return mixedWord(v.whole, v.n, v.d);
    case "dec": return decimalWord(v.value, v.places);
    default: return word(v.value);
  }
}
export function AnswerWord(v) { return cap(answerWord(v)); }
// A value as it is printed: 7, 3/4, 2 1/2, 4.5.
export function answerText(v) {
  if (typeof v === "number") v = int(v);
  switch (v.kind) {
    case "frac": return `${v.n}/${v.d}`;
    case "mixed": return `${v.whole} ${v.n}/${v.d}`;
    case "dec": return v.places !== undefined ? v.value.toFixed(v.places) : String(v.value);
    default: return String(v.value);
  }
}
// The picture of a value for a choice on the child's screen.
export function valueVisual(v, size = "md") {
  if (typeof v === "number") v = int(v);
  if (v.kind === "frac" || v.kind === "mixed") return { t: "frac", n: v.n, d: v.d, whole: v.kind === "mixed" ? v.whole : undefined, size };
  if (v.kind === "dec") return { t: "num", v: answerText(v), size };
  return { t: "num", v: v.value, size };
}

export function int(n) { return { kind: "int", value: n }; }
export function frac(n, d, whole) {
  if (whole) return { kind: "mixed", value: whole + n / d, n, d, whole };
  return { kind: "frac", value: n / d, n, d };
}
export function dec(value, places) { return { kind: "dec", value, places }; }

// ── Parsing ──
function wordsToInt(str) {
  const toks = str.split(/[\s-]+/).filter(Boolean);
  if (!toks.length) return null;
  let total = 0, cur = 0, any = false;
  for (const t of toks) {
    const o = ONES.indexOf(t);
    if (o !== -1) { cur += o; any = true; continue; }
    if (TENS[t]) { cur += TENS[t]; any = true; continue; }
    if (t === "hundred") { cur = (cur || 1) * 100; any = true; continue; }
    if (t === "thousand") { total += (cur || 1) * 1000; cur = 0; any = true; continue; }
    if (t === "million") { total += (cur || 1) * 1000000; cur = 0; any = true; continue; }
    if (t === "and" || t === "a") continue;
    return null;
  }
  return any ? total + cur : null;
}
function fracWords(str) {
  // "three fourths", "a half", "one quarter"
  const m = /^(.*?)\s*(halves|half|quarters?|[a-z]+ths?)$/.exec(str.trim());
  if (!m || !DENOM[m[2]]) return null;
  const n = m[1] === "" || m[1] === "a" || m[1] === "an" ? 1 : wordsToInt(m[1]);
  if (n === null) return null;
  return frac(n, DENOM[m[2]]);
}
// The value an answer names, or null when it is not a number.
export function parseAnswer(text) {
  if (text === null || text === undefined) return null;
  let s = String(text).trim().toLowerCase().replace(/[.?!,]+$/, "").trim();
  if (!s || s.startsWith("(")) return null;
  let m;
  if ((m = /^-?\d{1,3}(,\d{3})+$|^-?\d+$/.exec(s))) return int(Number(s.replace(/,/g, "")));
  if ((m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(s))) return frac(Number(m[2]), Number(m[3]), Number(m[1]));
  if ((m = /^(\d+)\/(\d+)$/.exec(s))) return frac(Number(m[1]), Number(m[2]));
  if ((m = /^-?\d+\.(\d+)$/.exec(s))) return dec(Number(s), m[1].length);
  if ((m = /^(.+?) point ((?:[a-z]+ ?)+)$/.exec(s))) {
    const ip = wordsToInt(m[1]);
    const digits = m[2].trim().split(/\s+/).map((w) => ONES.indexOf(w));
    if (ip === null || digits.some((d) => d < 0 || d > 9)) return null;
    return dec(Number(`${ip}.${digits.join("")}`), digits.length);
  }
  if ((m = /^(.+?) and (.+)$/.exec(s))) {
    const whole = wordsToInt(m[1]), f = fracWords(m[2]);
    if (whole !== null && f) {
      // "four and five tenths" is a decimal; "two and a half" is a mixed number.
      if (f.d === 10 || f.d === 100 || f.d === 1000) return dec(whole + f.value, String(f.d).length - 1);
      return frac(f.n, f.d, whole);
    }
  }
  const f = fracWords(s);
  if (f) return f;
  const n = wordsToInt(s);
  return n === null ? null : int(n);
}

// ── What a child can read at a lesson ──
// A level's readable(n) returns a Set of whole numbers (the early levels), a
// descriptor { max, frac: [denominators], dec: places }, or a predicate of
// its own with has(value) and sample(rand, value, k). readableOf wraps the
// first two so every caller sees has() and sample(): has takes a number or a
// value, and sample gives k other readable values near it, for a choice.
function near(rand, cands, v, k, ok) {
  const seen = new Set([answerText(v)]);
  const out = [];
  const pool = cands.filter((c) => ok(c) && !seen.has(answerText(c)) && (seen.add(answerText(c)), true));
  while (out.length < k && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return out.length === k ? out : null;
}
function intCandidates(v) {
  const x = v.value, out = [];
  for (const dlt of [1, 2, 3]) out.push(int(x + dlt), int(x - dlt));
  if (x >= 10) out.push(int(x + 10), int(x - 10));
  if (x >= 100) out.push(int(x + 100), int(x - 100));
  if (x >= 1000) out.push(int(x + 1000), int(x - 1000));
  const s = String(x);
  if (s.length >= 2 && s[0] !== s[1]) out.push(int(Number(s[1] + s[0] + s.slice(2))));
  if (x % 10 === 0 && x >= 10) out.push(int(x / 10));
  out.push(int(x * 10));
  return out;
}
function fracCandidates(v) {
  const out = [];
  for (const dn of [1, 2, -1, -2]) if (v.n + dn > 0 && v.n + dn <= v.d * 2) out.push(frac(v.n + dn, v.d, v.whole));
  for (const dd of [1, -1, 2]) if (v.d + dd >= 2 && v.n < v.d + dd) out.push(frac(v.n, v.d + dd, v.whole));
  if (v.whole) out.push(frac(v.n, v.d, v.whole + 1), frac(v.n, v.d, v.whole - 1 || 1), frac(v.n, v.d));
  else out.push(frac(v.d - v.n || 1, v.d));
  return out;
}
function decCandidates(v) {
  const p = v.places || 1, unit = Math.pow(10, -p), out = [];
  for (const dlt of [1, 2, -1, -2]) out.push(dec(Number((v.value + dlt * unit).toFixed(p)), p));
  out.push(dec(Number((v.value + 1).toFixed(p)), p), dec(Number((v.value - 1).toFixed(p)), p), dec(Number((v.value * 10).toFixed(p)), p), dec(Number((v.value / 10).toFixed(p + 1)), p + 1));
  return out;
}
export function candidatesFor(v) {
  if (v.kind === "int") return intCandidates(v);
  if (v.kind === "dec") return decCandidates(v);
  return fracCandidates(v);
}
export function readableOf(level, n) {
  if (!level || !level.readable) return null;
  const r = level.readable(n);
  if (!r) return null;
  if (r instanceof Set) {
    const has = (v) => { const x = typeof v === "number" ? v : v && v.kind === "int" ? v.value : NaN; return r.has(x); };
    return {
      has,
      sample(rand, v, k) {
        if (typeof v === "number") v = int(v);
        const pool = [...r].filter((x) => typeof x === "number" && x !== v.value);
        const pick = (list) => near(rand, list.map(int), v, k, () => true);
        const close = pool.filter((x) => Math.abs(x - v.value) <= 3), wide = pool.filter((x) => Math.abs(x - v.value) <= 10);
        return (close.length >= k && pick(close)) || (wide.length >= k && pick(wide)) || pick(pool);
      },
    };
  }
  if (typeof r.has === "function") return r;
  // A descriptor.
  const max = r.max ?? Infinity, min = r.min ?? 0, fracs = r.frac || [], places = r.dec ?? -1;
  const has = (v) => {
    if (typeof v === "number") v = Number.isInteger(v) ? int(v) : dec(v, String(v).split(".")[1].length);
    if (!v) return false;
    if (v.kind === "int") return v.value >= min && v.value <= max;
    if (v.kind === "dec") return (v.places || 0) <= places && v.value >= min && v.value <= max;
    return fracs.includes(v.d) && (v.whole || 0) <= max && v.n > 0;
  };
  return { has, sample: (rand, v, k) => near(rand, candidatesFor(typeof v === "number" ? int(v) : v), typeof v === "number" ? int(v) : v, k, has) };
}

export const MDNum = { parseAnswer, answerWord, answerText, fractionWord, mixedWord, decimalWord, int, frac, dec };
if (typeof globalThis !== "undefined") globalThis.MDNum = MDNum;
