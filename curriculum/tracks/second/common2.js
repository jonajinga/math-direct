// Helpers shared by the Second Grade modules.
import { V, model, lead, test, note, fix, fixPoint, fixChain, word, Word, chain, Chain, plural, favorNew, others } from "../common.js";
import { factStep, factHint } from "../../lib/facts.js";

export { V, model, lead, test, note, fix, fixPoint, fixChain, word, Word, chain, Chain, plural, favorNew, others, factStep, factHint };

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const isAre = (n) => (n === 1 ? "is" : "are");

// The child works on the whiteboard beside the phone.
export const WHITEBOARD = "The child works it on the whiteboard. Ask for the answer when the child says done.";

// Names for story problems, each with its pronoun.
export const NAMES = [["Ana", "she"], ["Ben", "he"], ["Cora", "she"], ["Dev", "he"], ["Eli", "he"], ["Faye", "she"], ["Gus", "he"], ["Hana", "she"], ["Ivy", "she"], ["Jon", "he"], ["Kai", "he"], ["Lila", "she"]];

// The digits of a number, from the right: ones, tens, hundreds.
export function digits(n) {
  return { o: n % 10, t: Math.floor(n / 10) % 10, h: Math.floor(n / 100) % 10 };
}

// "three hundreds", "one ten", "no ones"
export const hundreds = (k) => (k === 0 ? "no hundreds" : k === 1 ? "one hundred" : `${word(k)} hundreds`);
export const tens = (k) => (k === 0 ? "no tens" : k === 1 ? "one ten" : `${word(k)} tens`);
export const ones = (k) => (k === 0 ? "no ones" : k === 1 ? "one one" : `${word(k)} ones`);

// A number as a numeral string, for screens; a number as words, for the script.
export const num = (n) => String(n);

// The whole numbers readable at a lesson of this level.
export function readableMax(n) {
  return n < 4 ? 120 : n < 26 ? 500 : 1000;
}

// Pick an integer in [lo, hi] that passes a test, or the last try.
export function intWhere(r, lo, hi, ok, tries = 200) {
  let v = r.int(lo, hi);
  for (let i = 0; i < tries && !ok(v); i++) v = r.int(lo, hi);
  return v;
}

// A printed problem for the stage: lines of prose, each under 90 characters.
export function prose(...lines) {
  return V.prose(lines.flat().filter(Boolean));
}
