// Turns a word and its sound groups into the tokens the child's stage draws
// (see curriculum/lib/v.js): one token for each letter or joined pair, a
// macron on a long vowel, a small silent letter where the spelling has a
// letter the sounds do not use, and a whole-word token for an irregular
// word. Also builds the sounded-out form the parent listens for.

import { SOUNDS, SOUND_BY_ID, SYMBOL_TO_ID } from "./sounds.js";

const MACRON = { ā: "a", ē: "e", ī: "i", ō: "o", ū: "u", ȳ: "y" };
// Letter pairs that are two sounds, not one: blends are split into letters.
const BLENDS = new Set(["bl", "cl", "fl", "sl", "br", "cr", "dr", "fr", "gr", "pr", "tr", "str", "sp", "st", "sm", "sn", "sw", "pl", "sk", "sc", "nd", "nk", "mp", "lt", "ft", "ct", "nt", "gl", "spr", "scr", "squ", "ld", "lf", "lp", "lk", "pt", "ng"]);
const JOINED = new Set(SOUNDS.filter((s) => s.joined).map((s) => s.letters));
// Vowel teams the book writes as the marked vowel and a small silent letter:
// "eat" is ē with a small a.
const TEAMS = { ea: "ē", ee: "ē", ai: "ā", ay: "ā", oa: "ō", ie: "ī", oe: "ō", ue: "ū", ui: "ū" };
// A letter that says another letter's sound: c as sss, g as j.
const SOFT = { c: "s", g: "j" };
const VOWELS = "aeiou";

// The sound id for a symbol from the word list: "ē" -> "ē", "th (unvoiced)" -> "th2".
export function idOf(symbol) {
  if (SYMBOL_TO_ID[symbol]) return SYMBOL_TO_ID[symbol];
  return symbol;
}
// A symbol's printed letters and whether it carries a macron.
function lettersOf(symbol) {
  if (symbol === "ŏŏ") return { letters: "oo", macron: false };
  if (symbol === "oo") return { letters: "oo", macron: true };
  if (symbol.length === 1 && MACRON[symbol]) return { letters: MACRON[symbol], macron: true };
  return { letters: symbol.replace(/[āēīōūȳ]/g, (c) => MACRON[c]), macron: false };
}

function isStopLetter(letter) {
  const s = SOUND_BY_ID[letter];
  return !!(s && s.stop);
}

// tokensFor("mat", ["m","a","t"]) -> [{s:"m"},{s:"a"},{s:"t",stop:true}]
// Returns null when the sounds cannot be laid over the spelling.
export function tokensFor(word, sounds, opts = {}) {
  if (opts.irregular) return [{ s: word, whole: true, sound: "word" }];
  const letters = word;
  const lower = word.toLowerCase();
  const out = [];
  let pos = 0;
  for (const symbol of sounds || []) {
    const { letters: base, macron } = lettersOf(symbol);
    const id = idOf(symbol);
    const stop = !!(SOUND_BY_ID[id] && SOUND_BY_ID[id].stop);
    const pair = lower.slice(pos, pos + 2);
    if (macron && base.length === 1 && TEAMS[pair] === symbol) {
      // A vowel team: the vowel that says the sound is marked, the other is small.
      out.push({ s: letters[pos], macron: true, sound: id });
      out.push({ s: letters[pos + 1], silent: true });
      pos += 2;
    } else if (lower.startsWith(base, pos)) {
      if (base.length > 1 && !JOINED.has(base) && !macron) {
        // A blend: each letter is its own sound.
        for (const ch of base) {
          out.push({ s: letters[pos], ...(isStopLetter(ch) ? { stop: true } : {}), sound: ch });
          pos++;
        }
      } else {
        out.push({ s: letters.slice(pos, pos + base.length), ...(base.length > 1 ? { joined: true } : {}), ...(macron ? { macron: true } : {}), ...(stop ? { stop: true } : {}), sound: id });
        pos += base.length;
      }
    } else if (base.length === 1 && lower[pos] === base[0] && lower[pos + 1] === base[0]) {
      // A doubled letter says its sound once; the second is silent.
      out.push({ s: letters[pos], ...(macron ? { macron: true } : {}), ...(stop ? { stop: true } : {}), sound: id });
      out.push({ s: letters[pos + 1], silent: true });
      pos += 2;
    } else if (TEAMS[pair] && SOUND_BY_ID[TEAMS[pair]] && SOUND_BY_ID[TEAMS[pair]].say === (SOUND_BY_ID[id] || {}).say) {
      // The spelling is a vowel team that says this sound: marked vowel, small letter.
      out.push({ s: letters[pos], macron: true, sound: TEAMS[pair] });
      out.push({ s: letters[pos + 1], silent: true });
      pos += 2;
    } else if (JOINED.has(pair) && SOUND_BY_ID[pair] && SOUND_BY_ID[pair].say === (SOUND_BY_ID[id] || {}).say) {
      // The spelling is another pair that says the same sound: "ur" for er.
      out.push({ s: letters.slice(pos, pos + 2), joined: true, ...(SOUND_BY_ID[pair].macron ? { macron: true } : {}), ...(SOUND_BY_ID[pair].stop ? { stop: true } : {}), sound: pair });
      pos += 2;
    } else if (base === "k" && lower.startsWith("ck", pos)) {
      // ck: the c is small, the k says the sound.
      out.push({ s: letters[pos], silent: true });
      out.push({ s: letters[pos + 1], stop: true, sound: "k" });
      pos += 2;
    } else if (base.length === 1 && SOFT[lower[pos]] === base) {
      // A soft c or g: the letter is printed as it is and says the other sound.
      out.push({ s: letters[pos], ...(stop ? { stop: true } : {}), sound: id, says: base });
      pos += 1;
    } else if (lower[pos] && !VOWELS.includes(lower[pos]) && lower.startsWith(base, pos + 1)) {
      // A silent consonant before the sound: the l in folk.
      out.push({ s: letters[pos], silent: true });
      pos += 1;
      out.push({ s: letters.slice(pos, pos + base.length), ...(base.length > 1 ? { joined: true } : {}), ...(macron ? { macron: true } : {}), ...(stop ? { stop: true } : {}), sound: id });
      pos += base.length;
    } else {
      return null;
    }
  }
  // Letters left over say nothing.
  while (pos < lower.length) {
    if (!/[a-z]/.test(lower[pos])) return null;
    out.push({ s: letters[pos], silent: true });
    pos++;
  }
  return out;
}

// The word as the parent sounds it out: "mmmaaat", "ththth iii sss" run together.
export function soundedOut(tokens) {
  return tokens.filter((t) => !t.silent && !t.punct).map((t) => (t.whole ? t.s : (SOUND_BY_ID[t.sound] ? SOUND_BY_ID[t.sound].say : t.s))).join("");
}

// The plain spelling of the tokens.
export function spelled(tokens) {
  return tokens.filter((t) => !t.punct).map((t) => t.s).join("");
}

// The sound ids a token list needs the child to know.
export function soundIdsOf(tokens) {
  return tokens.filter((t) => !t.silent && !t.punct && !t.whole).map((t) => t.sound);
}
