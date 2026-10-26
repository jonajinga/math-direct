// Reading 1: 100 lessons, 12 to 18 minutes each, for a child of about five.
// The formats of Engelmann's reading program: sounds, say it fast, say the
// sounds, rhyming, sounding out, reading the fast way, words read whole, and
// sentences read twice. The sound order, the words, and the sentences come
// from curriculum/reading/.

import { V } from "../lib/v.js";
import { model, lead, test, note, fix } from "../lib/steps.js";
import { SOUNDS, SOUND_BY_ID, soundsTaughtBy } from "../reading/sounds.js";
import WORDS from "../reading/words.js";
import SENTENCES from "../reading/sentences.js";
import STORIES from "../reading/stories.js";
import { tokensFor, soundedOut, soundIdsOf } from "../reading/tokens.js";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const LESSONS = 100;

// ── The words, with the lesson at which each can be read ──
const TOKENS = new Map();
for (const w of WORDS) TOKENS.set(w.word, tokensFor(w.word, w.sounds, { irregular: w.irregular }));
const SOUND_LESSON = Object.fromEntries(SOUNDS.map((s) => [s.id, s.lesson]));
function readableAt(w) {
  const t = TOKENS.get(w.word);
  if (!t) return 999;
  if (w.irregular) return w.lesson;
  return Math.max(w.lesson, ...soundIdsOf(t).map((id) => SOUND_LESSON[id] ?? 999));
}
const REGULAR = WORDS.filter((w) => !w.irregular).map((w) => ({ ...w, at: readableAt(w) })).filter((w) => w.at <= LESSONS);
const WHOLE = WORDS.filter((w) => w.irregular && w.lesson <= LESSONS).map((w) => ({ ...w, at: w.lesson }));
const BY_WORD = new Map(WORDS.map((w) => [w.word.toLowerCase(), w]));
function regularBy(n) { return REGULAR.filter((w) => w.at <= n); }
function wholeBy(n) { return WHOLE.filter((w) => w.at <= n); }
function groupByLesson(list) {
  const map = new Map();
  for (const w of list) { if (!map.has(w.at)) map.set(w.at, []); map.get(w.at).push(w); }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}
const isName = (w) => /^[A-Z]/.test(w) && w !== "I";

// ── Steps ──
function soundTok(s) {
  return [{ s: s.letters, ...(s.joined ? { joined: true } : {}), ...(s.macron ? { macron: true } : {}), ...(s.stop ? { stop: true } : {}), sound: s.id }];
}
function soundStep(s, ctx, say) {
  const a = s.say + ".";
  return test(V.sound(soundTok(s), { prompts: ctx.prompts }), say || "What sound? Get ready.", a, fix(a, "What sound?"), {
    skill: "sound", item: "sound:" + s.id, sound: s.id, lesson: s.lesson, signal: s.stop ? "tap" : "hold", secs: 6,
    do: s.stop ? "Tap the dot under the letters and let go at once." : "Hold the dot under the letters while the child says the sound.",
  });
}
function soundOutStep(w, ctx, say) {
  const t = TOKENS.get(w.word);
  const slow = soundedOut(t) + ".";
  return test(V.word(t, { prompts: ctx.prompts }), say || "Sound it out. Get ready.", slow, fix(slow, "Sound it out."), {
    skill: "read", item: "word:" + w.word.toLowerCase(), secs: 10, confirm: "Yes, " + soundedOut(t) + ".",
    do: "Hold the dot under each sound in turn. The child says each sound as long as the dot rests on it, with no stop between sounds.",
  });
}
function fastStep(w, ctx, say) {
  const t = TOKENS.get(w.word);
  const ask = say || "Say it fast.";
  return test(V.word(t, { prompts: ctx.prompts, dot: "fast" }), ask, cap(w.word) + ".", fix(cap(w.word) + ".", ask, "", { keep: isName(w.word) || w.word === "I" }), {
    skill: "read", item: "read:" + w.word.toLowerCase(), secs: 6, confirm: "Yes, " + w.word + ".",
  });
}
function wholeStep(w, ctx, first) {
  const t = TOKENS.get(w.word);
  const say = first ? `This word is ${w.word}. What word?` : "What word?";
  return test(V.word(t, { prompts: ctx.prompts, dot: "fast" }), say, cap(w.word) + ".", `My turn: ${w.word}. Say it with me: ${w.word}. Your turn. What word?`, {
    skill: "read", item: "whole:" + w.word.toLowerCase(), secs: 6, confirm: "Yes, " + w.word + ".",
  });
}
// One item for tests, practice, and On your own: sound it out, then say it fast.
function wordItem(w, ctx) {
  if (w.irregular) return wholeStep(w, ctx, false);
  const t = TOKENS.get(w.word);
  const a = soundedOut(t) + ", then " + w.word + ".";
  return test(V.word(t, { prompts: ctx.prompts }), "Sound it out, then say it fast.", a, fix(a, "Sound it out, then say it fast."), {
    skill: "read", item: "word:" + w.word.toLowerCase(), secs: 12, confirm: "Yes, " + w.word + ".",
  });
}

// ── Sounds: a new sound every lesson or two, and a review of six to eight ──
const sounds = {
  id: "sounds",
  name: "Sounds",
  warmup: true,
  summary: "Say each sound when the dot rests under its letters: continuous sounds held, stop sounds short. A new sound every lesson or two, and a review of six to eight sounds in every lesson.",
  units: SOUNDS.map((s) => ({ id: s.id, lesson: s.lesson, label: `The sound ${s.letters}` + (s.note ? ` (${s.note})` : "") })),
  newEx(u, ctx, intro) {
    const s = SOUND_BY_ID[u.id];
    const r = ctx.rand;
    const a = s.say + ".";
    const steps = [
      model(V.sound(soundTok(s), { prompts: ctx.prompts }), s.stop
        ? `Here is a new sound. It is a quick sound. My turn. I tap the dot under it and say it: ${s.say}.`
        : `Here is a new sound. My turn. I hold the dot under it and say the sound as long as the dot stays: ${s.say}.`,
        { do: s.stop ? `Say "${s.say}" short, with no "uh" after it.` : `Hold the sound for about two seconds. ${s.voiced ? "Your voice is on." : "It is whispered: no voice, just air."}` }),
      lead(V.sound(soundTok(s), { prompts: ctx.prompts }), "Say it with me. Get ready.", a),
      soundStep(s, ctx, "Your turn. What sound? Get ready."),
      soundStep(s, ctx, "Again. What sound? Get ready."),
    ];
    const others = intro.filter((x) => x.id !== u.id).map((x) => SOUND_BY_ID[x.id]);
    for (const o of r.sample(others, Math.min(6, others.length))) steps.push(soundStep(o, ctx));
    return { title: `New sound: ${s.letters}`, steps };
  },
  firmEx(intro, ctx, u) {
    const s = SOUND_BY_ID[u.id];
    const r = ctx.rand;
    const steps = [];
    if (ctx.stage === 1) steps.push(lead(V.sound(soundTok(s), { prompts: ctx.prompts }), "Say it with me. Get ready.", s.say + "."));
    steps.push(soundStep(s, ctx, "What sound? Get ready."));
    const others = intro.filter((x) => x.id !== u.id).map((x) => SOUND_BY_ID[x.id]);
    for (const o of r.sample(others, Math.min(6, others.length))) steps.push(soundStep(o, ctx));
    steps.push(soundStep(s, ctx, "Once more. What sound? Get ready."));
    return { title: "Sounds", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const all = intro.map((x) => SOUND_BY_ID[x.id]);
    const newest = all.slice(-2);
    const rest = all.slice(0, -2);
    const pick = newest.concat(r.sample(rest, Math.min(7, rest.length)));
    return { title: "Sounds", steps: r.shuffle(pick).map((s) => soundStep(s, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const list = units.map((x) => SOUND_BY_ID[x.id]);
    const newest = list[list.length - 1];
    const rest = r.shuffle(list.slice(0, -1));
    return [newest].concat(rest).slice(0, count || 8).map((s) => soundStep(s, ctx));
  },
};

// ── Say it fast: the parent says a word slowly; the child says it at speed ──
const PARTS = ["mo tor", "sis ter", "ham mer", "ice cream", "hot dog", "rab bit", "win dow", "tea cher", "pup py", "kit ten", "base ball", "bath tub", "gar den", "mon key", "but ter", "sun set", "din ner", "lad der", "tur tle", "pock et", "ap ple", "cook ie", "bas ket", "pan cake"];
function slowForm(w) {
  const t = TOKENS.get(w.word);
  return t.filter((x) => !x.silent).map((x) => (SOUND_BY_ID[x.sound] ? SOUND_BY_ID[x.sound].say : x.s)).join(" ");
}
function fastItem(slow, word, ctx) {
  const a = cap(word) + ".";
  return test(V.say(), `Listen. ${slow}. Say it fast.`, a, fix(a, `Say it fast. ${slow}.`, "", { keep: isName(word) }), {
    skill: "blend", item: "fast:" + word.toLowerCase(), signal: "drop", secs: 7,
    do: "Say the parts with a pause between them, then drop your hand. The child says the whole word at once.",
  });
}
const sayFast = {
  id: "say-fast",
  name: "Say it fast",
  summary: "The parent says a word in parts, slowly; the child says it fast. Two-part words first, then words sound by sound.",
  retired: 45,
  units: [
    { id: "parts", lesson: 1, label: "Say it fast: words in two parts" },
    { id: "sounds", lesson: 4, label: "Say it fast: words sound by sound" },
  ],
  pool(u, ctx) {
    const parts = PARTS.map((p) => [p.replace(" ", "..."), p.replace(" ", "")]);
    if (u.id === "parts") return parts;
    const bySound = regularBy(ctx.lesson).filter((w) => w.word.length <= 4 && !isName(w.word)).map((w) => [slowForm(w).replace(/ /g, "..."), w.word]);
    // Until enough words can be read, two-part words fill the set.
    return bySound.length >= 8 ? bySound : bySound.concat(parts);
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const pool = this.pool(u, ctx);
    const [m1, m2] = r.sample(pool, 2);
    const steps = [
      model(V.say(), `Listen. I can say a word slowly, then say it fast. My turn. ${m1[0]}. Say it fast. ${m1[1]}.`, { do: "Pause between the parts. Then say the whole word at once." }),
      lead(V.say(), `Say it fast with me. ${m2[0]}. Get ready.`, cap(m2[1]) + "."),
    ];
    for (const [slow, word] of r.sample(pool.filter((p) => p !== m1 && p !== m2), 4)) steps.push(fastItem(slow, word, ctx));
    return { title: u.id === "parts" ? "Say it fast" : "Say it fast, sound by sound", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const pool = this.pool(intro[intro.length - 1], ctx);
    return { title: "Say it fast", steps: r.sample(pool, Math.min(5, pool.length)).map(([slow, word]) => fastItem(slow, word, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const pool = this.pool(units[units.length - 1], ctx);
    return r.sample(pool, Math.min(count || 3, pool.length)).map(([slow, word]) => fastItem(slow, word, ctx));
  },
};

// ── Say the sounds: the child says a spoken word slowly ──
function soundsItem(w, ctx) {
  const slow = soundedOut(TOKENS.get(w.word)) + ".";
  return test(V.say(), `Listen. ${w.word}. Say the sounds in ${w.word}. Get ready.`, slow, fix(slow, `Say the sounds in ${w.word}.`), {
    skill: "segment", item: "sounds:" + w.word.toLowerCase(), signal: "drop", secs: 8,
    do: "Hold up one finger for each sound as the child says it.",
  });
}
const saySounds = {
  id: "say-sounds",
  name: "Say the sounds",
  summary: "The parent says a word; the child says it slowly, sound by sound.",
  retired: 50,
  units: [{ id: "sounds", lesson: 9, label: "Say the sounds in a word" }],
  pool(ctx) { return regularBy(ctx.lesson).filter((w) => w.word.length <= 4 && !isName(w.word)); },
  newEx(u, ctx) {
    const r = ctx.rand;
    const pool = this.pool(ctx);
    const [m1, m2] = r.sample(pool, 2);
    const steps = [
      model(V.say(), `Listen. I can say a word slowly, one sound at a time. My turn. ${m1.word}. ${soundedOut(TOKENS.get(m1.word))}.`, { do: "Hold each sound for about a second, with no stop between sounds." }),
      lead(V.say(), `Say the sounds in ${m2.word} with me. Get ready.`, soundedOut(TOKENS.get(m2.word)) + "."),
    ];
    const rest = pool.length > 5 ? pool.filter((x) => x !== m1 && x !== m2) : pool;
    for (const w of r.sample(rest, Math.min(4, rest.length))) steps.push(soundsItem(w, ctx));
    return { title: "Say the sounds", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: "Say the sounds", steps: r.sample(this.pool(ctx), 5).map((w) => soundsItem(w, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    return r.sample(this.pool(ctx), count || 3).map((w) => soundsItem(w, ctx));
  },
};

// ── Rhyming: a word that rhymes with a given ending and starts with a sound ──
function rime(w) { const m = /[aeiou][a-z]*$/.exec(w.word.toLowerCase()); return m ? m[0] : null; }
function rhymeItem(w, ctx) {
  const t = TOKENS.get(w.word);
  const first = t.find((x) => !x.silent);
  const r = rime(w);
  const a = cap(w.word) + ".";
  return test(V.say(), `Rhyming. The word rhymes with ${r}. It starts with ${SOUND_BY_ID[first.sound].say}. Say the word.`, a, fix(a, `It rhymes with ${r} and starts with ${SOUND_BY_ID[first.sound].say}. Say the word.`), {
    skill: "rhyme", item: "rhyme:" + w.word.toLowerCase(), signal: "drop", secs: 8,
  });
}
const rhyming = {
  id: "rhyming",
  name: "Rhyming",
  summary: "The parent gives an ending and a first sound; the child says the word that rhymes.",
  retired: 55,
  units: [{ id: "rhyme", lesson: 10, label: "Rhyming words" }],
  pool(ctx) {
    const words = regularBy(ctx.lesson).filter((w) => !isName(w.word) && w.word.length >= 3 && w.word.length <= 4);
    const families = new Map();
    for (const w of words) { const r = rime(w); if (!r || r.length < 2) continue; if (!families.has(r)) families.set(r, []); families.get(r).push(w); }
    return [...families.values()].filter((f) => f.length >= 2).flat();
  },
  newEx(u, ctx) {
    const r = ctx.rand;
    const pool = this.pool(ctx);
    const [m, m2] = r.sample(pool, 2);
    const steps = [
      model(V.say(), `Listen. Words that rhyme end the same way. ${cap(m.word)} rhymes with ${rime(m)}. My turn. Rhymes with ${rime(m)}. It starts with ${SOUND_BY_ID[TOKENS.get(m.word)[0].sound].say}. ${m.word}.`),
      lead(V.say(), `Say it with me. Rhymes with ${rime(m2)}. It starts with ${SOUND_BY_ID[TOKENS.get(m2.word)[0].sound].say}. Get ready.`, cap(m2.word) + "."),
    ];
    const rest = pool.length > 6 ? pool.filter((x) => x !== m && x !== m2) : pool;
    for (const w of r.sample(rest, Math.min(5, rest.length))) steps.push(rhymeItem(w, ctx));
    return { title: "Rhyming", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    return { title: "Rhyming", steps: r.sample(this.pool(ctx), 5).map((w) => rhymeItem(w, ctx)) };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    return r.sample(this.pool(ctx), count || 3).map((w) => rhymeItem(w, ctx));
  },
};

// ── Sounding out: new words as their sounds arrive ──
const WORD_UNITS = groupByLesson(REGULAR).map(([n, list]) => ({ id: "w" + n, lesson: n, words: list, label: "Words: " + list.slice(0, 4).map((w) => w.word).join(", ") + (list.length > 4 ? "..." : "") }));
const soundOut = {
  id: "sound-out",
  name: "Sounding out",
  summary: "Read a word by saying each sound as the dot rests under it, without stopping between sounds, then saying the word fast.",
  units: WORD_UNITS,
  firmLessons: 2,
  newEx(u, ctx) {
    const r = ctx.rand;
    const words = u.words.slice(0, 6);
    const first = words[0];
    const t = TOKENS.get(first.word);
    const steps = [
      model(V.word(t, { prompts: ctx.prompts }), `My turn to sound it out. I hold the dot under each sound and say it: ${soundedOut(t)}. Now I say it fast: ${first.word}.`, { do: "Move the dot from sound to sound without stopping between them." }),
      lead(V.word(t, { prompts: ctx.prompts }), "Sound it out with me. Get ready.", soundedOut(t) + "."),
    ];
    for (const w of words) { steps.push(soundOutStep(w, ctx)); steps.push(fastStep(w, ctx)); }
    return { title: "New words", steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    const steps = [];
    const words = r.shuffle(u.words).slice(0, 4);
    if (ctx.stage === 1) steps.push(lead(V.word(TOKENS.get(words[0].word), { prompts: ctx.prompts }), "Sound it out with me. Get ready.", soundedOut(TOKENS.get(words[0].word)) + "."));
    for (const w of words) { steps.push(soundOutStep(w, ctx)); steps.push(fastStep(w, ctx)); }
    return { title: "Sounding out", steps };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const recent = intro.slice(-2).flatMap((u) => u.words);
    const older = intro.slice(0, -2).flatMap((u) => u.words);
    const pick = r.sample(recent, Math.min(3, recent.length)).concat(r.sample(older, Math.min(3, older.length)));
    const steps = [];
    for (const w of r.shuffle(pick)) { steps.push(soundOutStep(w, ctx)); steps.push(fastStep(w, ctx)); }
    return { title: "Sounding out", steps };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const newest = units[units.length - 1].words;
    const rest = units.slice(0, -1).flatMap((u) => u.words);
    const pick = r.sample(newest, Math.min(2, newest.length)).concat(r.sample(rest, Math.min((count || 4) - 2, rest.length)));
    return pick.map((w) => wordItem(w, ctx));
  },
};

// ── Reading the fast way: words read without sounding out ──
const fastWay = {
  id: "fast-way",
  name: "Reading the fast way",
  summary: "Read words taught earlier without sounding them out: the dot sweeps, the child says the word.",
  reviewEvery: 1,
  units: [{ id: "fast", lesson: 20, label: "Read words the fast way" }],
  pool(ctx) { return regularBy(ctx.lesson - 3).filter((w) => w.word.length >= 2); },
  newEx(u, ctx) {
    const r = ctx.rand;
    const pool = this.pool(ctx);
    const [m1, m2] = r.sample(pool, 2);
    const steps = [
      model(V.word(TOKENS.get(m1.word), { prompts: ctx.prompts, dot: "fast" }), `Now we read words the fast way. We do not stop on each sound. My turn. I tap the dot once, and it runs under the word: ${m1.word}.`),
      lead(V.word(TOKENS.get(m2.word), { prompts: ctx.prompts, dot: "fast" }), "Read it the fast way with me. Get ready.", cap(m2.word) + "."),
    ];
    for (const w of r.sample(pool.filter((x) => x !== m1 && x !== m2), 6)) steps.push(fastStep(w, ctx, "Read it the fast way. Get ready."));
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

// ── Words read whole: the irregular words ──
const WHOLE_UNITS = groupByLesson(WHOLE).map(([n, list]) => ({ id: "irr" + n, lesson: n, words: list, label: "Read whole: " + list.map((w) => w.word).join(", ") }));
const wholeWords = {
  id: "whole-words",
  name: "Words read whole",
  summary: "Words that do not follow the sounds, such as was and said, learned as whole words and reviewed often.",
  units: WHOLE_UNITS,
  newEx(u, ctx, intro) {
    const r = ctx.rand;
    const steps = [];
    for (const w of u.words) {
      steps.push(model(V.word(TOKENS.get(w.word), { prompts: ctx.prompts, dot: "fast" }), `This word is ${w.word}. It does not follow the sounds, so we learn it as a whole. My turn: ${w.word}.`));
      steps.push(lead(V.word(TOKENS.get(w.word), { prompts: ctx.prompts, dot: "fast" }), `Say it with me: ${w.word}.`, cap(w.word) + "."));
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

// ── Sentences: read word by word, then the fast way ──
function sentenceWords(text, loose) {
  // "Sam sat at a mat." -> words with their punctuation as tokens. A word
  // the list does not have ends the sentence (null), unless loose, when it
  // is shown whole, as the library shows a story from a later level.
  const parts = text.match(/[A-Za-z']+|[^A-Za-z'\s]+/g) || [];
  const words = [];
  for (const p of parts) {
    if (/[A-Za-z]/.test(p)) {
      const entry = BY_WORD.get(p.toLowerCase());
      const t = entry ? tokensFor(p, entry.sounds, { irregular: entry.irregular }) : null;
      if (!t && !loose) return null;
      words.push({ word: p, entry: entry || { word: p, lesson: 999, irregular: true }, tokens: t || [{ s: p, whole: true, sound: "word" }] });
    } else if (words.length) {
      words[words.length - 1].tokens = words[words.length - 1].tokens.concat([{ s: p, punct: true }]);
    } else {
      // A sentence that opens with a quotation mark: carry it on the first word.
      words.push({ word: "", entry: null, tokens: [{ s: p, punct: true }], lead: true });
    }
  }
  // Fold a leading mark into the first real word.
  if (words.length > 1 && words[0].lead) { words[1].tokens = words[0].tokens.concat(words[1].tokens); words.shift(); }
  return words;
}
const SENTENCE_UNITS = (() => {
  const map = new Map();
  for (const s of SENTENCES) {
    if (s.lesson > LESSONS) continue;
    const words = sentenceWords(s.text);
    if (!words) continue;
    const at = Math.max(s.lesson, ...words.map((w) => (w.entry.irregular ? w.entry.lesson : readableAt(w.entry))));
    if (at > LESSONS) continue;
    if (!map.has(at)) map.set(at, []);
    map.get(at).push({ text: s.text, words });
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([n, list]) => ({ id: "s" + n, lesson: n, sentences: list, label: "Read: " + list[0].text }));
})();
function lineOf(sent, ctx) { return V.line(sent.words.map((w) => w.tokens), { prompts: ctx.prompts }); }
function firstReading(sent, ctx, teach) {
  const steps = [];
  const w0 = sent.words[0];
  if (teach) {
    const first = w0.entry.irregular ? `This word is ${w0.word}. ${w0.word}.` : `I sound it out: ${soundedOut(w0.tokens)}. Then I say it fast: ${w0.word}.`;
    steps.push(model(lineOf(sent, ctx), `Here is a sentence. We read it one word at a time. My turn to read the first word. ${first}`, { do: "Press Dot to put the dot under the first word." }));
    steps.push(lead(lineOf(sent, ctx), w0.entry.irregular ? `Say the first word with me. ${w0.word}.` : "Sound out the first word with me, then say it fast.", w0.entry.irregular ? cap(w0.word) + "." : soundedOut(w0.tokens) + ", then " + w0.word + "."));
  } else {
    steps.push(note(lineOf(sent, ctx), "The child reads each word: sounds it out, then says it fast. Press Dot to move the dot from word to word."));
  }
  sent.words.forEach((w, i) => {
    const where = i === 0 ? "First word." : "Next word.";
    if (w.entry.irregular) {
      steps.push(test(lineOf(sent, ctx), `${where} What word?`, cap(w.word) + ".", `My turn: ${w.word}. Your turn. What word?`, { skill: "story", item: `line:${w.word.toLowerCase()}`, secs: 6, confirm: "Yes, " + w.word + "." }));
    } else {
      const slow = soundedOut(w.tokens) + ", then " + w.word + ".";
      steps.push(test(lineOf(sent, ctx), `${where} Sound it out, then say it fast.`, slow, fix(slow, "Sound it out, then say it fast."), { skill: "story", item: `line:${w.word.toLowerCase()}`, secs: 10, confirm: "Yes, " + w.word + "." }));
    }
  });
  steps.push(secondReading(sent, ctx, "Now read the whole sentence the fast way."));
  return steps;
}
function secondReading(sent, ctx, say) {
  return test(lineOf(sent, ctx), say || "Read the sentence the fast way.", sent.text, fix(sent.text, "Read the sentence the fast way.", "", { keep: true }), {
    skill: "story", item: "sentence:" + sent.text.toLowerCase().replace(/[^a-z]+/g, "-"), secs: 12, confirm: "Yes. " + sent.text,
    do: "Move the dot under each word as the child reads it.",
  });
}
const sentences = {
  id: "sentences",
  name: "Sentences",
  summary: "A sentence read twice: first word by word, sounding out and saying each fast, then the whole sentence the fast way.",
  units: SENTENCE_UNITS,
  firmLessons: 2,
  newEx(u, ctx) {
    const steps = firstReading(u.sentences[0], ctx, true);
    if (u.sentences[1]) steps.push(...firstReading(u.sentences[1], ctx, false));
    return { title: "A sentence", steps };
  },
  firmEx(intro, ctx, u) {
    const r = ctx.rand;
    const sent = r.pick(u.sentences);
    return { title: "A sentence again", steps: [secondReading(sent, ctx)] };
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

// ── Stories: read twice, then talked about ──
// A story is placed two lessons after the last of its sounds and whole
// words is taught, and no two stories share a lesson. Its lines are
// sentences; the parent reads the questions after the second reading.
const plainText = (t) => t.replace(/!/g, ".");
function soundsAt(entry) {
  const t = TOKENS.get(entry.word);
  if (!t) return 999;
  if (entry.irregular) return entry.lesson;
  return Math.max(...soundIdsOf(t).map((id) => SOUND_LESSON[id] ?? 999));
}
const toSent = (words) => ({ text: words.map((w) => w.tokens.map((t) => t.s).join("")).join(" "), words });
const STORY_UNITS = (() => {
  const list = [];
  for (const story of STORIES) {
    const title = sentenceWords(story.title);
    const lines = story.lines.map((l) => sentenceWords(l));
    if (!title || lines.some((l) => !l)) continue;
    const at = Math.max(...[...title, ...lines.flat()].map((w) => soundsAt(w.entry))) + 2;
    list.push({ story, title: toSent(title), lines: lines.map(toSent), at });
  }
  list.sort((a, b) => a.at - b.at || a.story.order - b.story.order);
  let last = 0;
  for (const u of list) { if (u.at <= last + 1) u.at = last + 2; last = u.at; }
  return list.filter((u) => u.at <= LESSONS).map((u) => ({
    id: u.story.slug, lesson: u.at, label: `Story: ${u.story.title}`, story: u.story, title: u.title, lines: u.lines,
    words: u.lines.reduce((a, l) => a + l.words.length, 0),
  }));
})();
const STORY_BY_SLUG = new Map(STORY_UNITS.map((u) => [u.id, u]));
function lineFast(u, i, ctx) {
  const s = u.lines[i];
  return test(lineOf(s, ctx), "Read the line the fast way.", plainText(s.text), fix(plainText(s.text), "Read the line the fast way.", "", { keep: true }), {
    skill: "story", item: `story:${u.id}:${i}`, secs: 3 + s.words.length, confirm: "Yes. " + plainText(s.text),
    do: i === 0 ? "Press Dot to move the dot under each word as the child reads." : undefined,
  });
}
function lineSlow(u, i, ctx) {
  const s = u.lines[i];
  return test(lineOf(s, ctx), "Read this line. Sound out each word, then say it fast.", plainText(s.text), fix(plainText(s.text), "Read the line.", "", { keep: true }), {
    skill: "story", item: `story:${u.id}:${i}`, secs: 4 + s.words.length * 3, confirm: "Yes. " + plainText(s.text),
    do: i === 0 ? "Press Dot to put the dot under the first word, and again for each word as the child reads it." : undefined,
  });
}
function titleStep(u, ctx) {
  const t = plainText(u.title.text);
  return test(lineOf(u.title, ctx), "The title of the story. Read it the fast way.", t, fix(t, "Read the title.", "", { keep: true }), {
    skill: "story", item: `title:${u.id}`, secs: 6, confirm: "Yes. " + t,
  });
}
function questionStep(u, i, ctx) {
  const q = u.story.questions[i];
  const a = plainText(q.a);
  return test(V.passage(u.lines.map((s) => s.words.map((w) => w.tokens)), { prompts: ctx.prompts }), q.q, a, `My turn: ${a} Your turn. ${q.q}`, {
    skill: "comprehension", item: `q:${u.id}:${i}`, secs: 10, confirm: "Yes. " + a, signal: "watch",
    do: i === 0 ? "The child answers from the story. Point to the line that tells it if the child is stuck." : undefined,
  });
}
// The story's words least practiced: read before the story, as the word
// attack comes before the story in Direct Instruction.
function storyWordsToRead(u, n) {
  const seen = new Set();
  const out = [];
  const lateness = (w) => Math.max(soundsAt(w.entry), w.entry.lesson);
  for (const w of [...u.lines.flatMap((s) => s.words)].sort((a, b) => lateness(b) - lateness(a))) {
    const k = w.word.toLowerCase();
    if (seen.has(k) || w.entry.irregular || !TOKENS.get(w.entry.word)) continue;
    seen.add(k);
    out.push(w.entry);
    if (out.length >= 5) break;
  }
  return out;
}
const stories = {
  id: "stories",
  name: "Stories",
  summary: "A story read line by line, sounding out each word, with questions after; the next two lessons read it again the fast way. Each story comes two lessons after the last of its sounds.",
  units: STORY_UNITS,
  firmLessons: 2,
  newEx(u, ctx) {
    const steps = [];
    const words = storyWordsToRead(u, ctx.lesson);
    steps.push(note(V.words(words.map((w) => TOKENS.get(w.word)), { prompts: ctx.prompts }), `A new story, ${u.story.title}. First, the words from it that are newest.`, { do: "Read each word before the story, so the story goes well." }));
    for (const w of words) steps.push(wordItem(w, ctx));
    steps.push(titleStep(u, ctx));
    steps.push(model(lineOf(u.lines[0], ctx), `My turn to read the first line. I sound out each word, then say it fast: ${u.lines[0].words.map((w) => (w.entry.irregular ? w.word : soundedOut(w.tokens) + ", " + w.word)).join("; ")}.`, { do: "Move the dot under each word as you read it." }));
    steps.push(lead(lineOf(u.lines[0], ctx), "Read the first line with me. Sound out each word, then say it fast.", plainText(u.lines[0].text)));
    u.lines.forEach((s, i) => steps.push(lineSlow(u, i, ctx)));
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
    steps[0].say = `From ${u.story.title}. Read the line the fast way.`;
    if (u.story.questions.length) steps.push(questionStep(u, u.story.questions.indexOf(r.pick(u.story.questions)), ctx));
    return { title: "A story", steps };
  },
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const all = units.slice(-3).flatMap((u) => u.lines.map((s, i) => [u, i]));
    return r.sample(all, Math.min(count || 2, all.length)).map(([u, i]) => lineFast(u, i, ctx));
  },
};

// ── Checkouts: rate and accuracy, from lesson 40, every fifth lesson ──
// The child reads a passage alone while the clock runs; the parent counts
// the errors. The goal rises from 24 words a minute at lesson 40 to 60 at
// lesson 100, with two errors or fewer. The goals are parameters to set
// from real sittings.
export function checkoutGoal(n) { return Math.max(24, Math.min(60, Math.round(30 + (n - 50) * 0.6))); }
const CHECKOUT_LESSONS = [];
for (let n = 40; n <= LESSONS; n += 5) CHECKOUT_LESSONS.push(n);
function checkoutPassage(n) {
  // The story of a recent lesson; otherwise sentences read lately, newest first.
  const story = [...STORY_UNITS].reverse().find((u) => u.lesson < n && u.lesson >= n - 8 && u.words >= 20);
  if (story) return { title: story.story.title, lines: story.lines };
  const target = checkoutGoal(n);
  const lines = [];
  let words = 0;
  for (const u of [...SENTENCE_UNITS].reverse()) {
    if (u.lesson >= n) continue;
    for (const s of u.sentences) { if (words >= target) break; lines.push(s); words += s.words.length; }
    if (words >= target) break;
  }
  return { title: "", lines };
}
const checkouts = {
  id: "checkouts",
  name: "Checkouts",
  summary: "From lesson 40, every fifth lesson: the child reads a passage alone while the clock runs. Words a minute and errors are kept against a goal that rises with the lessons.",
  units: CHECKOUT_LESSONS.map((n) => ({ id: "c" + n, lesson: n, label: `Checkout: ${checkoutGoal(n)} words a minute` })),
  firmLessons: 0,
  last: true,
  newEx(u, ctx) {
    const p = checkoutPassage(u.lesson);
    const words = p.lines.reduce((a, s) => a + s.words.length, 0);
    const steps = p.lines.map((s, i) => note(lineOf(s, ctx), plainText(s.text), {
      secs: 2 + s.words.length * 1.5,
      ...(i === 0 ? { do: (p.title ? `The story ${p.title}, read alone. ` : "Lines the child has read, read alone. ") + "Tap Start as the child begins, Error for each word missed, Next at the end of each line, and Stop at the end." } : {}),
    }));
    return { title: "Checkout", kind: "checkout", words, goal: checkoutGoal(u.lesson), allowed: 2, passage: p.title, steps };
  },
};

// Every story, for the library under Practice: the lines the fast way and
// the questions, at the alphabet stage of the lesson it is readable at.
// A story whose words go past this level is listed for the next level.
const STAGE_AT = (n) => (n <= 74 ? "full" : n <= 90 ? "light" : "plain");
const storyLibrary = STORIES.map((story) => {
  const u = STORY_BY_SLUG.get(story.slug);
  const prompts = u ? STAGE_AT(u.lesson) : "plain";
  const ctx = { prompts };
  const unit = u || { id: story.slug, story, title: toSent(sentenceWords(story.title, true)), lines: story.lines.map((l) => toSent(sentenceWords(l, true))) };
  const items = [titleStep(unit, ctx), ...unit.lines.map((s, i) => lineFast(unit, i, ctx)), ...story.questions.map((q, i) => questionStep(unit, i, ctx))];
  items.forEach((it) => { it.lesson = 0; });
  return { slug: story.slug, title: story.title, order: story.order, lesson: u ? u.lesson : null, words: unit.lines.reduce((a, s) => a + s.words.length, 0), questions: story.questions.length, items };
});

export default {
  id: "reading-1",
  slug: "reading-1",
  subject: "reading",
  name: "Reading 1",
  longName: "Reading 1",
  age: "about five",
  lessons: LESSONS,
  minutes: "10 to 16",
  minutesBand: [10, 16],
  minExercises: 7,
  maxExercises: 10,
  minReviewSteps: 6,
  maxSteps: 130,
  reviewIntervals: [2, 3, 5],
  tagline: "Sounds, sounding out, reading the fast way, and the first sentences and stories.",
  description: "Reading 1 is the first hundred lessons of reading, built on Engelmann's program: forty-odd sounds in a careful order, blending by ear, sounding out words as the dot moves under their sounds, reading the fast way, the words that must be learned whole, and sentences read twice. The child's letters carry marks that fade away by the end.",
  endsWith: "By the end of Reading 1, the child says every sound, sounds out and reads words made from them, reads the common irregular words whole, and reads short sentences and stories in ordinary letters.",
  materials: [],
  // The alphabet's marks fade: joined pairs, macrons, and small letters at first; the bars alone from lesson 75; ordinary letters from lesson 91.
  prompts: [{ to: 74, stage: "full" }, { to: 90, stage: "light" }, { to: LESSONS, stage: "plain" }],
  readableText(n) {
    return { sounds: new Set(soundsTaughtBy(n).map((s) => s.id)), words: new Set(wholeBy(n).map((w) => w.word.toLowerCase())) };
  },
  // For the records chart and the quick sound review.
  soundList: SOUNDS.map((s) => ({ id: s.id, letters: s.letters, say: s.say, lesson: s.lesson, note: s.note || "" })),
  tracks: [sounds, sayFast, saySounds, rhyming, soundOut, fastWay, wholeWords, sentences, stories, checkouts],
  storyLibrary,
  checkoutGoal,
};
