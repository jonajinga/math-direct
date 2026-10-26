// A sample reading lesson, built with the curriculum helpers, for the checks
// and the screenshots: the child's letters, the arrow, and the dot in every
// mode. It is listed nowhere, and nothing taught from it is recorded.
import { V, T } from "../../curriculum/lib/v.js";
import { model, lead, test, note, fix, exercise } from "../../curriculum/lib/steps.js";
import { validateStep } from "../../curriculum/lib/validate.js";

const m = T.l("m"), s = T.l("s"), S = T.l("S"), a = T.l("a"), t = T.l("t", { stop: true }), r = T.l("r"), i = T.l("i"), d = T.l("d", { stop: true });
const e = T.m("e"), th = T.j("th"), longA = T.m("a"), silentE = T.q("e"), was = T.w("was"), dot = T.p(".");

const sounds = { id: "sounds", name: "Sounds" };
const blending = { id: "say-fast", name: "Say it fast" };
const reading = { id: "sound-out", name: "Sounding out" };
const stories = { id: "story", name: "Stories" };

const exercises = [
  exercise(sounds, "new", "A new sound", [
    model(V.sound([m]), "Here is a new sound. My turn. Hold the dot under it and say it as long as the dot is there. mmm.", { signal: "hold" }),
    lead(V.sound([m]), "Say it with me. Get ready.", "Mmm.", { signal: "hold" }),
    test(V.sound([m]), "Your turn. What sound? Get ready.", "Mmm.", fix("Mmm.", "What sound?"), { skill: "sound", item: "sound:m" }),
    test(V.sound([s]), "What sound? Get ready.", "Sss.", fix("Sss.", "What sound?"), { skill: "sound", item: "sound:s" }),
    test(V.sound([t]), "What sound? Get ready.", "T.", fix("T.", "What sound?"), { skill: "sound", item: "sound:t" }),
  ], { n: 1 }),
  exercise(blending, "review", "Say it fast", [
    test(V.say(), "Listen. mmm...at. Say it fast.", "Mat.", fix("Mat.", "Say it fast. mmm...at."), { skill: "blend", item: "fast:mat", signal: "drop" }),
    test(V.say(), "Listen. sss...at. Say it fast.", "Sat.", fix("Sat.", "Say it fast. sss...at."), { skill: "blend", item: "fast:sat", signal: "drop" }),
  ], { n: 2 }),
  exercise(reading, "new", "Sounding out", [
    model(V.word([m, a, t]), "My turn to sound it out. Hold the dot under each sound. mmmaaat.", { signal: "hold" }),
    test(V.word([m, a, t]), "Your turn. Sound it out. Get ready.", "Mmmaaat.", fix("Mmmaaat.", "Sound it out."), { skill: "read", item: "word:mat" }),
    test(V.word([m, a, t], { dot: "fast" }), "Say it fast.", "Mat.", fix("Mat.", "Say it fast."), { skill: "read", item: "word:mat" }),
    test(V.word([th, i, s]), "Sound it out. Get ready.", "Thththiiisss.", fix("Thththiiisss.", "Sound it out."), { skill: "read", item: "word:this" }),
    test(V.word([m, e]), "Sound it out. Get ready.", "Mmmeee.", fix("Mmmeee.", "Sound it out."), { skill: "read", item: "word:me" }),
    test(V.word([r, longA, t, silentE]), "Sound it out. Get ready.", "Rrraaat.", fix("Rrraaat.", "Sound it out."), { skill: "read", item: "word:rate" }),
    test(V.word([was]), "This word is was. What word?", "Was.", fix("Was.", "What word?"), { skill: "read", item: "word:was", signal: "sweep" }),
    test(V.word([s, a, d], { prompts: "plain" }), "Sound it out. Get ready.", "Sssaaad.", fix("Sssaaad.", "Sound it out."), { skill: "read", item: "word:sad" }),
  ], { n: 3 }),
  exercise(stories, "review", "A line to read", [
    note(V.line([[S, a, m], [s, a, t, dot]]), "The child reads the line. Press Dot to put the dot under each word in turn."),
    test(V.line([[S, a, m], [s, a, t, dot]]), "Sound out the first word.", "Sssaaammm.", fix("Sssaaammm.", "Sound out the first word."), { skill: "story", item: "line:sam-sat:1" }),
    test(V.line([[S, a, m], [s, a, t, dot]]), "Say it fast.", "Sam.", fix("Sam.", "Say it fast.", "", { keep: true }), { skill: "story", item: "line:sam-sat:1f", confirm: "Yes, Sam." }),
    test(V.line([[S, a, m], [s, a, t, dot]]), "Next word. Sound it out.", "Sssaaat.", fix("Sssaaat.", "Sound it out."), { skill: "story", item: "line:sam-sat:2" }),
    test(V.passage([[[S, a, m], [s, a, t, dot]], [[S, a, m], [i, s], [m, a, d, dot]]], { prompts: "light" }), "Read the story the fast way. Say each word.", "Sam sat. Sam is mad.", fix("Sam sat. Sam is mad.", "Read the story.", "", { keep: true }), { skill: "story", item: "story:sam", confirm: "Yes. Sam sat. Sam is mad." }),
  ], { n: 4 }),
];

const errors = [];
exercises.forEach((ex, i) => ex.steps.forEach((st, j) => validateStep(st, `reading sample, exercise ${i + 1} step ${j + 1}`, errors)));
if (errors.length) throw new Error("The reading sample fails the checks:\n  " + errors.join("\n  "));

export default {
  id: "reading-sample-001",
  number: 1,
  levelName: "Reading sample",
  levelSlug: "lessons",
  url: "/reading-sample/",
  minutes: 6,
  totalLessons: 1,
  exercises,
  independent: null,
  next: null,
  testAfter: null,
};
