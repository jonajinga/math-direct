// Reading 2: 50 lessons, 12 to 18 minutes each, for a child who has finished
// Reading 1. Ordinary letters throughout. The child reads words with blends,
// new sounds spelled with two or three letters, silent letters, doubled
// letters, endings, and final syllables; reads longer stories the fast way
// and answers questions on them; and reads a passage against the clock every
// fifth lesson. The words, sentences, and stories come from curriculum/reading/.

import { V } from "../lib/v.js";
import { model, lead, test, note, fix } from "../lib/steps.js";
import { SOUNDS, SOUND_BY_ID } from "../reading/sounds.js";
import { PARTS, PART_BY_ID, ENDINGS } from "../reading/parts.js";
import STORIES from "../reading/stories.js";
import SENTENCES from "../reading/sentences.js";
import { idOf, soundedOut } from "../reading/tokens.js";
import { BANNED } from "../lib/validate.js";
import R1, {
  TOKENS, BY_WORD, WORDS_ALL, cap, isName, plainText, sentenceWords, toSent, lineOf, groupByLesson,
  soundStep, soundOutStep, fastStep, wholeStep, wordItem,
  secondReading, lineFast, titleStep, questionStep, passageFrom, checkoutExercise, passagePart,
} from "./reading1.js";

const LESSONS = 50;
const PLAIN = { prompts: "plain" };

// ── When a word can be read ──
// Blends are not sounds: the child sounds out each letter. They are taught
// in this order, by the lesson each comes in.
const BLEND_LESSON = {
  bl: 1, cl: 1, fl: 2, sl: 2, br: 3, cr: 3, dr: 4, fr: 4, gr: 5, pr: 5, tr: 7, str: 7, sp: 8, st: 8, sm: 9, sn: 9, sw: 9,
  pl: 11, sk: 11, sc: 11, nd: 12, nk: 12, mp: 13, lt: 13, ft: 13, ct: 25, nt: 25, gl: 26, spr: 26, scr: 27, squ: 27,
  ld: 31, lf: 31, lp: 31, lk: 31, pt: 32,
};
const BLEND_GROUPS = [
  { id: "bl-cl", lesson: 1, blends: ["bl", "cl"] }, { id: "fl-sl", lesson: 2, blends: ["fl", "sl"] }, { id: "br-cr", lesson: 3, blends: ["br", "cr"] },
  { id: "dr-fr", lesson: 4, blends: ["dr", "fr"] }, { id: "gr-pr", lesson: 5, blends: ["gr", "pr"] }, { id: "tr-str", lesson: 7, blends: ["tr", "str"] },
  { id: "sp-st", lesson: 8, blends: ["sp", "st"] }, { id: "sm-sn-sw", lesson: 9, blends: ["sm", "sn", "sw"] }, { id: "pl-sk-sc", lesson: 11, blends: ["pl", "sk", "sc"] },
  { id: "nd-nk", lesson: 12, blends: ["nd", "nk"], end: true }, { id: "mp-lt-ft", lesson: 13, blends: ["mp", "lt", "ft"], end: true },
  { id: "ct-nt", lesson: 25, blends: ["ct", "nt"], end: true }, { id: "gl-spr", lesson: 26, blends: ["gl", "spr"] }, { id: "scr-squ", lesson: 27, blends: ["scr", "squ"] },
  { id: "ld-lf-lp-lk", lesson: 31, blends: ["ld", "lf", "lp", "lk"], end: true }, { id: "pt", lesson: 32, blends: ["pt"], end: true },
];
const R1_SOUNDS = new Set(SOUNDS.map((s) => s.id));
// The Reading 2 lesson at which a word's sounds, parts, and blends are all
// taught: 0 for a word of Reading 1's sounds alone.
function wordAt(w) {
  if (!w) return 999;
  if (w.irregular) return w.lesson > 100 ? w.lesson - 100 : 0;
  let at = 0;
  for (const sym of w.sounds || []) {
    const id = idOf(sym);
    if (R1_SOUNDS.has(id)) continue;
    if (PART_BY_ID[id]) at = Math.max(at, PART_BY_ID[id].lesson);
    else if (BLEND_LESSON[id] !== undefined) at = Math.max(at, BLEND_LESSON[id]);
    else at = Math.max(at, Math.max(0, w.lesson - 100));
  }
  return at;
}
// Words and lines that read as praise are left out of the lessons.
const R2 = WORDS_ALL.filter((w) => w.lesson > 100 && !BANNED.test(w.word));
const REGULAR = R2.filter((w) => !w.irregular && TOKENS.get(w.word));
const IRREGULAR = R2.filter((w) => w.irregular);

// ── Stories and sentences, placed by their words ──
// A word a story uses that the list does not have is taught whole on the
// story's day, and read whole after.
const EXTRA = new Map();
const isExtra = (w) => !BY_WORD.get(w.word.toLowerCase());
function lineAt(words) { return Math.max(0, ...words.map((w) => (isExtra(w) ? 0 : wordAt(w.entry)))); }
const R1_STORY_IDS = new Set(R1.tracks.find((t) => t.id === "stories").units.map((u) => u.id));
const STORY_UNITS = (() => {
  const list = [];
  for (const story of STORIES) {
    if (R1_STORY_IDS.has(story.slug)) continue;
    if (story.lines.some((l) => BANNED.test(l)) || BANNED.test(story.title)) continue;
    const title = sentenceWords(story.title, true);
    const lines = story.lines.map((l) => sentenceWords(l, true));
    const all = [...title, ...lines.flat()];
    const at = Math.max(1, lineAt(all) + 1);
    const extras = [...new Set(all.filter(isExtra).map((w) => w.word))];
    list.push({ story, title: toSent(title), lines: lines.map(toSent), at, extras });
  }
  list.sort((a, b) => a.at - b.at || a.story.order - b.story.order);
  let last = 0;
  for (const u of list) { if (u.at <= last) u.at = last + 1; last = u.at; }
  return list.filter((u) => u.at <= LESSONS).map((u) => {
    for (const x of u.extras) { if (!EXTRA.has(x.toLowerCase()) || EXTRA.get(x.toLowerCase()).lesson > u.at) EXTRA.set(x.toLowerCase(), { word: x, lesson: u.at }); }
    return { id: u.story.slug, lesson: u.at, label: `Story: ${u.story.title}`, story: u.story, title: u.title, lines: u.lines, extras: u.extras, words: u.lines.reduce((a, l) => a + l.words.length, 0) };
  });
})();
for (const [k, x] of EXTRA) if (!TOKENS.has(x.word)) TOKENS.set(x.word, [{ s: x.word, whole: true, sound: "word" }]);
const SENTENCE_UNITS = (() => {
  const map = new Map();
  for (const s of SENTENCES) {
    if (s.lesson <= 100 || BANNED.test(s.text)) continue;
    const words = sentenceWords(s.text);
    if (!words || words.length > 12) continue;
    const at = Math.max(1, lineAt(words));
    if (at > LESSONS) continue;
    if (!map.has(at)) map.set(at, []);
    map.get(at).push({ text: s.text, words });
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([n, list]) => ({ id: "s" + n, lesson: n, sentences: list, label: "Read: " + list[0].text }));
})();

// ── The words taught, six to a lesson ──
// Words that stories and sentences use come first; the rest follow in the
// order of the word list. A word the lessons never reach is still read in
// the fast way review and in stories, once its parts are taught.
const USED = new Set([...STORY_UNITS.flatMap((u) => [...u.title.words, ...u.lines.flatMap((l) => l.words)]), ...SENTENCE_UNITS.flatMap((u) => u.sentences.flatMap((s) => s.words))].map((w) => w.word.toLowerCase()));
const WORD_UNITS = (() => {
  const sorted = REGULAR.map((w) => ({ ...w, at: Math.max(1, wordAt(w)) })).sort((a, b) => a.at - b.at || (USED.has(a.word.toLowerCase()) ? 0 : 1) - (USED.has(b.word.toLowerCase()) ? 0 : 1) || a.lesson - b.lesson);
  const per = new Map();
  for (const w of sorted) {
    let n = w.at;
    while (n <= LESSONS && (per.get(n) || []).length >= 6) n++;
    if (n > LESSONS) continue;
    if (!per.has(n)) per.set(n, []);
    per.get(n).push({ ...w, at: n });
  }
  return [...per.entries()].sort((a, b) => a[0] - b[0]).map(([n, words]) => ({ id: "w" + n, lesson: n, words, label: "Read: " + words.map((w) => w.word).join(", ") }));
})();
const TAUGHT = new Map(WORD_UNITS.flatMap((u) => u.words.map((w) => [w.word.toLowerCase(), u.lesson])));
function regularBy(n) { return REGULAR.filter((w) => Math.max(1, wordAt(w)) <= n); }
const WHOLE_UNITS = groupByLesson([...IRREGULAR.map((w) => ({ ...w, at: Math.max(1, w.lesson - 100) })), ...[...EXTRA.values()].map((x) => ({ word: x.word, lesson: x.lesson + 100, irregular: true, at: x.lesson }))])
  .map(([n, list]) => ({ id: "irr" + n, lesson: n, words: list, label: "Read whole: " + list.map((w) => w.word).join(", ") }));

// ── Sounds and parts: the warm-up ──
function partModel(p) {
  if (p.kind === "silent") return `Here is a new part: ${p.letters}. One letter is silent. The letters say ${p.say}, as in ${p.asIn}. My turn: ${p.say}.`;
  if (p.kind === "double") return `Here is a new part: ${p.letters}. Two letters, one sound. They say ${p.say}, as in ${p.asIn}. My turn: ${p.say}.`;
  if (p.kind === "suffix" || p.kind === "syllable") return `Here is a new part that ends a word: ${p.letters}. It says ${p.say}, as in ${p.asIn}. My turn: ${p.say}.`;
  return `Here is a new sound: ${p.letters}. It says ${p.say}, as in ${p.asIn}. My turn: ${p.say}.`;
}
const REVIEW_SOUNDS = SOUNDS.filter((s) => s.letters.length > 1 || s.macron);
const partTok = (p) => [{ s: p.letters, joined: true, sound: p.id, ...(p.stop ? { stop: true } : {}) }];
// The parts that come in one lesson are one unit, taught together.
const PART_UNITS = [...new Set(PARTS.map((p) => p.lesson))].sort((a, b) => a - b).map((n) => {
  const parts = PARTS.filter((p) => p.lesson === n);
  return { id: "p" + n, lesson: n, parts, label: (parts.length > 1 ? "The parts " : "The part ") + parts.map((p) => p.letters).join(", ") + (parts[0].note && parts.length === 1 ? ` (${parts[0].note})` : "") };
});
const sounds = {
  id: "sounds",
  name: "Sounds and parts",
  warmup: true,
  summary: "A new sound or word part most lessons, with a review of the parts and of the sounds of Reading 1 spelled with two letters.",
  units: PART_UNITS,
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const steps = [];
    for (const p of u.parts) {
      steps.push(model(V.sound(partTok(p), PLAIN), partModel(p), { do: p.stop ? `Say "${p.say}" short.` : "Hold the sound for about two seconds." }));
      steps.push(lead(V.sound(partTok(p), PLAIN), "Say it with me. Get ready.", p.say + "."));
      steps.push(soundStep(p, ctx, "Your turn. What sound? Get ready."));
    }
    const others = intro.filter((x) => x.id !== u.id).flatMap((x) => x.parts).concat(r.sample(REVIEW_SOUNDS, 3));
    for (const o of r.sample(others, Math.min(4, others.length))) steps.push(soundStep(o, ctx));
    for (const p of u.parts) steps.push(soundStep(p, ctx, "Once more. What sound? Get ready."));
    return { title: (u.parts.length > 1 ? "New parts: " : "New part: ") + u.parts.map((p) => p.letters).join(", "), steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    const steps = [];
    if (ctx.stage === 1) steps.push(lead(V.sound(partTok(u.parts[0]), PLAIN), "Say it with me. Get ready.", u.parts[0].say + "."));
    for (const p of u.parts) steps.push(soundStep(p, ctx, "What sound? Get ready."));
    const others = intro.filter((x) => x.id !== u.id).flatMap((x) => x.parts).concat(r.sample(REVIEW_SOUNDS, 3));
    for (const o of r.sample(others, Math.min(5, others.length))) steps.push(soundStep(o, ctx));
    steps.push(soundStep(r.pick(u.parts), ctx, "Once more. What sound? Get ready."));
    return { title: "Sounds and parts", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const parts = intro.flatMap((x) => x.parts);
    const newest = parts.slice(-2);
    const rest = parts.slice(0, -2).concat(r.sample(REVIEW_SOUNDS, 4));
    const pick = newest.concat(r.sample(rest, Math.min(6, rest.length)));
    return { title: "Sounds and parts", steps: r.shuffle(pick).map((s) => soundStep(s, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const parts = units.flatMap((x) => x.parts);
    const newest = parts.slice(-2);
    const rest = parts.slice(0, -2).concat(r.sample(REVIEW_SOUNDS, 3));
    return newest.concat(r.sample(rest, Math.max(0, (count || 6) - newest.length))).map((s) => soundStep(s, ctx));
  },
};

// ── Blends: two or three letters sounded out together ──
function hasBlend(w, group) {
  return (w.sounds || []).some((s) => group.blends.includes(idOf(s)));
}
const BLEND_UNITS = BLEND_GROUPS.map((g) => ({ ...g, words: REGULAR.filter((w) => hasBlend(w, g) && Math.max(1, wordAt(w)) <= g.lesson + 2), label: `Blends ${g.blends.join(", ")}` })).filter((g) => g.words.length >= 2);
const blends = {
  id: "blends",
  name: "Blends",
  summary: "Words that begin or end with two or three consonants said close together: sound out each letter, then say the word fast.",
  units: BLEND_UNITS,
  firmLessons: 2,
  newEx(u, ctx) {
    const r = ctx.rand;
    const words = r.shuffle(u.words).slice(0, 5);
    const first = words[0];
    const t = TOKENS.get(first.word);
    const where = u.end ? "end" : "start";
    const steps = [
      model(V.word(t, PLAIN), `These words ${where} with letters that go close together: ${u.blends.join(", ")}. We sound out each letter and say the word fast. My turn: ${soundedOut(t)}. ${first.word}.`, { do: "Hold the dot under each sound in turn, with no stop between the letters of the blend." }),
      lead(V.word(t, PLAIN), "Sound it out with me. Get ready.", soundedOut(t) + "."),
    ];
    for (const w of words) { steps.push(soundOutStep(w, ctx)); steps.push(fastStep(w, ctx)); }
    return { title: `Blends: ${u.blends.join(", ")}`, steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    const steps = [];
    const words = r.shuffle(u.words).slice(0, 4);
    if (ctx.stage === 1) steps.push(lead(V.word(TOKENS.get(words[0].word), PLAIN), "Sound it out with me. Get ready.", soundedOut(TOKENS.get(words[0].word)) + "."));
    for (const w of words) { steps.push(soundOutStep(w, ctx)); steps.push(fastStep(w, ctx)); }
    return { title: "Blends", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const recent = intro.slice(-2).flatMap((u) => u.words);
    const older = intro.slice(0, -2).flatMap((u) => u.words);
    const pick = r.sample(recent, Math.min(3, recent.length)).concat(r.sample(older, Math.min(3, older.length)));
    return { title: "Blends", steps: r.shuffle(pick).map((w) => fastStep(w, ctx, "Read it the fast way. Get ready.")) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const newest = units[units.length - 1].words;
    const rest = units.slice(0, -1).flatMap((u) => u.words);
    return r.sample(newest, Math.min(2, newest.length)).concat(r.sample(rest, Math.min((count || 4) - 2, rest.length))).map((w) => wordItem(w, ctx));
  },
};

// ── New words: six a lesson, sounded out then read fast ──
const soundOut = {
  id: "sound-out",
  name: "New words",
  summary: "The words of the lesson: each sounded out as the dot rests under its sounds, then said fast.",
  units: WORD_UNITS,
  firmLessons: 2,
  newEx(u, ctx) {
    const first = u.words[0];
    const t = TOKENS.get(first.word);
    const steps = [
      model(V.word(t, PLAIN), `My turn to sound it out. I hold the dot under each sound and say it: ${soundedOut(t)}. Now I say it fast: ${first.word}.`, { do: "Move the dot from sound to sound without stopping between them." }),
      lead(V.word(t, PLAIN), "Sound it out with me. Get ready.", soundedOut(t) + "."),
    ];
    for (const w of u.words) { steps.push(soundOutStep(w, ctx)); steps.push(fastStep(w, ctx)); }
    return { title: "New words", steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    const words = r.shuffle(u.words).slice(0, 4);
    const steps = [];
    if (ctx.stage === 1) steps.push(lead(V.word(TOKENS.get(words[0].word), PLAIN), "Sound it out with me. Get ready.", soundedOut(TOKENS.get(words[0].word)) + "."));
    for (const w of words) steps.push(wordItem(w, ctx));
    return { title: "The new words again", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const recent = intro.slice(-3).flatMap((u) => u.words);
    const older = intro.slice(0, -3).flatMap((u) => u.words);
    const pick = r.sample(recent, Math.min(4, recent.length)).concat(r.sample(older, Math.min(2, older.length)));
    return { title: "Words", steps: r.shuffle(pick).map((w) => wordItem(w, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const newest = units[units.length - 1].words;
    const rest = units.slice(0, -1).flatMap((u) => u.words);
    return r.sample(newest, Math.min(2, newest.length)).concat(r.sample(rest, Math.min((count || 4) - 2, rest.length))).map((w) => wordItem(w, ctx));
  },
};

// ── Reading the fast way: every lesson, from both levels' words ──
const R1_REGULAR = R1.tracks.find((t) => t.id === "sound-out").units.flatMap((u) => u.words).filter((w) => w.word.length >= 3);
const fastWay = {
  id: "fast-way",
  name: "Reading the fast way",
  summary: "Words from this level and the last, read without sounding out: the dot sweeps, the child says the word.",
  reviewEvery: 1,
  units: [{ id: "fast", lesson: 4, label: "Read words the fast way" }],
  pool(ctx) {
    const r2 = regularBy(ctx.lesson - 3).filter((w) => w.word.length >= 3);
    return r2.length >= 8 ? r2.concat(ctx.rand.sample(R1_REGULAR, 6)) : r2.concat(ctx.rand.sample(R1_REGULAR, 12));
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const pool = r.sample(R1_REGULAR, 10);
    const [m1, m2] = pool;
    const steps = [
      model(V.word(TOKENS.get(m1.word), { ...PLAIN, dot: "fast" }), `In Reading 2 the letters are plain, and we read most words the fast way. My turn. I tap the dot once, and it runs under the word: ${m1.word}.`),
      lead(V.word(TOKENS.get(m2.word), { ...PLAIN, dot: "fast" }), "Read it the fast way with me. Get ready.", cap(m2.word) + "."),
    ];
    for (const w of pool.slice(2, 8)) steps.push(fastStep(w, ctx, "Read it the fast way. Get ready."));
    return { title: "Reading the fast way", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: "Reading the fast way", steps: r.sample(this.pool(ctx), 8).map((w) => fastStep(w, ctx, "Read it the fast way. Get ready.")) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    return r.sample(this.pool(ctx), count || 4).map((w) => fastStep(w, ctx, "Read it the fast way. Get ready."));
  },
};

// ── Words read whole ──
const wholeWords = {
  id: "whole-words",
  name: "Words read whole",
  summary: "Words that do not follow the sounds, learned as whole words and reviewed often.",
  units: WHOLE_UNITS,
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const steps = [];
    for (const w of u.words) {
      steps.push(model(V.word(TOKENS.get(w.word), { ...PLAIN, dot: "fast" }), `This word is ${w.word}. It does not follow the sounds, so we learn it as a whole. My turn: ${w.word}.`));
      steps.push(lead(V.word(TOKENS.get(w.word), { ...PLAIN, dot: "fast" }), `Say it with me: ${w.word}.`, cap(w.word) + "."));
      steps.push(wholeStep(w, ctx, true));
    }
    const known = intro.filter((x) => x.id !== u.id).flatMap((x) => x.words);
    for (const w of r.sample(known, Math.min(3, known.length))) steps.push(wholeStep(w, ctx, false));
    return { title: "Words read whole", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const all = intro.flatMap((u) => u.words);
    return { title: "Words read whole", steps: r.sample(all, Math.min(5, all.length)).map((w) => wholeStep(w, ctx, false)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const all = units.flatMap((u) => u.words);
    return r.sample(all, Math.min(count || 4, all.length)).map((w) => wholeStep(w, ctx, false));
  },
};

// ── Word endings: the first part, then the whole word ──
// Words with the ending: those the list places at or after the ending's
// lesson, or whose first part is a word in its own right (help in helpful).
function endingWords(e) {
  return REGULAR.filter((w) => {
    const word = w.word.toLowerCase();
    if (!word.endsWith(e.letters) || word.length <= e.letters.length + 2) return false;
    const base = word.slice(0, word.length - e.letters.length);
    if (e.id === "ed" && base.endsWith("e")) return false;
    return w.lesson - 100 >= e.lesson - 1 || BY_WORD.has(base);
  }).map((w) => ({ ...w, at: Math.max(e.lesson, wordAt(w), TAUGHT.get(w.word.toLowerCase()) || 0) }));
}
const ENDING_UNITS = ENDINGS.map((e) => {
  const words = endingWords(e);
  if (!words.length) return null;
  const lesson = Math.min(LESSONS, Math.max(e.lesson, Math.min(...words.map((w) => w.at))));
  return { id: "end-" + e.id, lesson, ending: e, words, label: `The ending -${e.letters}` };
}).filter(Boolean).sort((a, b) => a.lesson - b.lesson);
function endingTokens(w, e) {
  const base = w.word.slice(0, w.word.length - e.letters.length);
  return [{ s: base, sound: "part" }, { s: w.word.slice(base.length), joined: true, sound: "part" }];
}
function endingStep(w, e, ctx) {
  const base = w.word.slice(0, w.word.length - e.letters.length);
  const a = `${base}, then ${w.word}.`;
  return test(V.word(endingTokens(w, e), PLAIN), `This word ends in ${e.letters}. Read the first part, then the whole word.`, a, `My turn: ${base}, then ${w.word}. Your turn. Read the first part, then the whole word.`, {
    skill: "read", item: "ending:" + w.word.toLowerCase(), secs: 8, confirm: "Yes, " + w.word + ".",
    do: "Hold the dot under the first part, then under the ending.",
  });
}
const endings = {
  id: "endings",
  name: "Word endings",
  summary: "Words with an ending such as -ed, -er, -ly, -ful, or -ness: read the first part, then the whole word.",
  units: ENDING_UNITS,
  firmLessons: 2,
  newEx(u, ctx) {
    const r = ctx.rand;
    const e = u.ending;
    const words = u.words.filter((w) => w.at <= ctx.lesson);
    const pick = r.shuffle(words.length ? words : u.words).slice(0, 5);
    const first = pick[0];
    const base = first.word.slice(0, first.word.length - e.letters.length);
    const steps = [
      model(V.word(endingTokens(first, e), PLAIN), `Here is an ending: ${e.letters}. It says ${e.say}.${e.note ? " " + cap(e.note) + "." : ""} We read the first part, then the whole word. My turn: ${base}, ${first.word}.`, { do: "Hold the dot under the first part, then under the ending." }),
      lead(V.word(endingTokens(first, e), PLAIN), "Read the first part with me, then the whole word.", `${base}, then ${first.word}.`),
    ];
    for (const w of pick) steps.push(endingStep(w, e, ctx));
    return { title: `The ending ${e.letters}`, steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    const words = u.words.filter((w) => w.at <= ctx.lesson);
    return { title: "Word endings", steps: r.shuffle(words.length ? words : u.words).slice(0, 4).map((w) => endingStep(w, u.ending, ctx)) };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const pairs = intro.flatMap((u) => u.words.filter((w) => w.at <= ctx.lesson).map((w) => [w, u.ending]));
    const pool = pairs.length ? pairs : intro.flatMap((u) => u.words.map((w) => [w, u.ending]));
    return { title: "Word endings", steps: r.sample(pool, Math.min(5, pool.length)).map(([w, e]) => endingStep(w, e, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const pool = units.flatMap((u) => u.words.filter((w) => w.at <= ctx.lesson).map((w) => [w, u.ending]));
    const all = pool.length ? pool : units.flatMap((u) => u.words.map((w) => [w, u.ending]));
    return r.sample(all, Math.min(count || 4, all.length)).map(([w, e]) => endingStep(w, e, ctx));
  },
};

// ── Sentences, read the fast way ──
const sentences = {
  id: "sentences",
  name: "Sentences",
  summary: "A sentence read the fast way, with the dot moving word by word.",
  units: SENTENCE_UNITS,
  firmLessons: 1,
  newEx(u, ctx) {
    const s = u.sentences[0];
    const steps = [
      model(lineOf(s, ctx), `My turn to read the sentence the fast way: ${plainText(s.text)}`, { do: "Move the dot under each word as you read it." }),
      lead(lineOf(s, ctx), "Read it with me, the fast way.", plainText(s.text)),
      secondReading(s, ctx, "Your turn. Read the sentence the fast way."),
    ];
    if (u.sentences[1]) steps.push(secondReading(u.sentences[1], ctx));
    return { title: "A sentence", steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    return { title: "A sentence again", steps: [secondReading(r.pick(u.sentences), ctx)] };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const recent = intro.slice(-3).flatMap((u) => u.sentences);
    return { title: "Sentences", steps: r.sample(recent, Math.min(3, recent.length)).map((s) => secondReading(s, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const all = units.slice(-4).flatMap((u) => u.sentences);
    return r.sample(all, Math.min(count || 2, all.length)).map((s) => secondReading(s, ctx));
  },
};

// ── Stories: read the fast way, then talked about ──
function storyWordsToRead(u) {
  const seen = new Set();
  const out = [];
  const lateness = (w) => Math.max(wordAt(w.entry), (TAUGHT.get(w.word.toLowerCase()) || 0));
  for (const w of [...u.lines.flatMap((s) => s.words)].sort((a, b) => lateness(b) - lateness(a))) {
    const k = w.word.toLowerCase();
    if (seen.has(k) || w.entry.irregular || !TOKENS.get(w.entry.word)) continue;
    seen.add(k);
    out.push(w.entry);
    if (out.length >= 5) break;
  }
  return out;
}
const titleOf = (u) => u.story.title.replace(/[!.]+$/, "");
const stories = {
  id: "stories",
  name: "Stories",
  summary: "A story read the fast way, line by line, with questions after; its new words first. The next two lessons read it again.",
  units: STORY_UNITS,
  firmLessons: 2,
  newEx(u, ctx) {
    const steps = [];
    const words = storyWordsToRead(u).slice(0, u.extras.length >= 4 ? 3 : 5);
    steps.push(note(V.words(words.map((w) => TOKENS.get(w.word)), PLAIN), `A new story, ${titleOf(u)}. First, the words from it that are newest.`, { do: "Read each word before the story, so the story goes well." }));
    if (u.extras.length) {
      // Words the list does not have are read whole: told once, then read.
      steps.push(model(V.words(u.extras.map((x) => TOKENS.get(x)), PLAIN), `These words are in the story. We read them as whole words. My turn: ${u.extras.join(", ")}.`, { do: "Say each word as you point to it." }));
      for (const x of u.extras) steps.push(wholeStep({ word: x, irregular: true }, ctx, true));
    }
    for (const w of words) steps.push(wordItem(w, ctx));
    steps.push(titleStep(u, ctx));
    steps.push(model(lineOf(u.lines[0], ctx), `My turn to read the first line the fast way: ${plainText(u.lines[0].text)}`, { do: "Move the dot under each word as you read it." }));
    steps.push(lead(lineOf(u.lines[0], ctx), "Read the first line with me, the fast way.", plainText(u.lines[0].text)));
    u.lines.forEach((s, i) => { const st = lineFast(u, i, ctx); if (i === 0) st.say = "Your turn. Read the first line the fast way."; steps.push(st); });
    u.story.questions.forEach((q, i) => steps.push(questionStep(u, i, ctx)));
    return { title: `Story: ${u.story.title}`, steps };
  },
  firmEx(intro, ctx, u) {
    const steps = [titleStep(u, ctx)];
    u.lines.forEach((s, i) => { const st = lineFast(u, i, ctx); if (i === 0) st.say = "Read the story again, the fast way. Read the first line."; steps.push(st); });
    const qs = ctx.stage === 1 ? u.story.questions.slice(0, 2) : u.story.questions.slice(-1);
    qs.forEach((q) => steps.push(questionStep(u, u.story.questions.indexOf(q), ctx)));
    return { title: "The story again", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const u = r.pick(intro.slice(-2));
    const idx = r.sample(u.lines.map((s, i) => i), Math.min(3, u.lines.length)).sort((a, b) => a - b);
    const steps = idx.map((i) => lineFast(u, i, ctx));
    steps[0].say = `From ${titleOf(u)}. Read the line the fast way.`;
    if (u.story.questions.length) steps.push(questionStep(u, u.story.questions.indexOf(r.pick(u.story.questions)), ctx));
    return { title: "A story", steps };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const all = units.slice(-3).flatMap((u) => u.lines.map((s, i) => [u, i]));
    return r.sample(all, Math.min(count || 2, all.length)).map(([u, i]) => lineFast(u, i, ctx));
  },
};

// ── Checkouts: every fifth lesson, the goal rising from 63 to 90 words a minute ──
export function checkoutGoal(n) { return Math.round(60 + n * 0.6); }
const CHECKOUT_LESSONS = [];
for (let n = 5; n <= LESSONS; n += 5) CHECKOUT_LESSONS.push(n);
function checkoutPassage(n) { return passageFrom(STORY_UNITS, SENTENCE_UNITS, n, checkoutGoal(n)); }
const checkouts = {
  id: "checkouts",
  name: "Checkouts",
  summary: "Every fifth lesson: the child reads a passage alone while the clock runs. Words a minute and errors are kept against a goal that rises with the lessons.",
  units: CHECKOUT_LESSONS.map((n) => ({ id: "c" + n, lesson: n, label: `Checkout: ${checkoutGoal(n)} words a minute` })),
  firmLessons: 0,
  last: true,
  newEx(u, ctx) { return checkoutExercise(checkoutPassage(u.lesson), ctx, checkoutGoal(u.lesson)); },
};
function testPassage(end) {
  return passagePart(checkoutPassage(end + 1), PLAIN, checkoutGoal(end), "reading-2");
}

// The stories placed in this level, for the library.
const storyLibrary = STORY_UNITS.map((u) => {
  const items = [titleStep(u, PLAIN), ...u.lines.map((s, i) => lineFast(u, i, PLAIN)), ...u.story.questions.map((q, i) => questionStep(u, i, PLAIN))];
  items.forEach((it) => { it.lesson = 0; });
  return { slug: u.story.slug, title: u.story.title, order: u.story.order, lesson: u.lesson, words: u.words, questions: u.story.questions.length, items };
});

const LETTERS = new Set("abcdefghijklmnopqrstuvwxyz".split(""));
export { wordAt, STORY_UNITS, SENTENCE_UNITS, WORD_UNITS, EXTRA };
export default {
  id: "reading-2",
  slug: "reading-2",
  subject: "reading",
  name: "Reading 2",
  longName: "Reading 2",
  age: "about six",
  lessons: LESSONS,
  minutes: "12 to 18",
  minutesBand: [12, 18],
  minExercises: 7,
  maxExercises: 10,
  minReviewSteps: 6,
  maxSteps: 130,
  capMinutes: true,
  reviewIntervals: [2, 3, 5],
  tagline: "Blends, new sounds and word parts, silent letters, endings, longer stories, and reading against the clock.",
  description: "Reading 2 takes a child who has finished Reading 1 through fifty lessons in ordinary letters: words with blends at the start and end, the sounds spelled with two or three letters that come after the first forty, silent letters, doubled letters, the common endings, and the final syllables of longer words. The stories grow longer and are read the fast way, with questions after, and every fifth lesson the child reads a passage against the clock.",
  endsWith: "By the end of Reading 2, the child reads words with blends, endings, and two syllables, reads a story of sixty words the fast way and answers questions on it, and reads about ninety words a minute with two errors or fewer.",
  materials: [],
  prompts: [{ to: LESSONS, stage: "plain" }],
  readableText(n) {
    const sounds = new Set([...SOUNDS.map((s) => s.id), ...PARTS.filter((p) => p.lesson <= n).map((p) => p.id), ...LETTERS, "part"]);
    const words = new Set([
      ...R1.readableText(100).words,
      ...IRREGULAR.filter((w) => w.lesson - 100 <= n).map((w) => w.word.toLowerCase()),
      ...[...EXTRA.values()].filter((x) => x.lesson <= n).map((x) => x.word.toLowerCase()),
    ]);
    return { sounds, words };
  },
  soundList: PARTS.map((p) => ({ id: p.id, letters: p.letters, say: p.say, lesson: p.lesson, note: p.note || "" })),
  tracks: [sounds, blends, soundOut, fastWay, wholeWords, endings, sentences, stories, checkouts],
  storyLibrary,
  checkoutGoal,
  // Every word of this level: taught in a lesson, or readable once its parts are, or read whole.
  wordList: [
    ...REGULAR.map((w) => ({ word: w.word, lesson: TAUGHT.get(w.word.toLowerCase()) || Math.max(1, wordAt(w)), whole: false, taught: TAUGHT.has(w.word.toLowerCase()) })),
    ...IRREGULAR.map((w) => ({ word: w.word, lesson: Math.max(1, w.lesson - 100), whole: true })),
    ...[...EXTRA.values()].map((x) => ({ word: x.word, lesson: x.lesson, whole: true })),
  ],
  testTracks: ["sounds", "blends", "sound-out", "fast-way", "whole-words", "endings", "sentences", "stories"],
  testAlways: ["fast-way"],
  testPassage,
  placementPoints: [1, 25],
  placementTracks: 4,
};
