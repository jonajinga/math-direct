// Builds the whole program: every level's lessons, mastery tests, practice
// items, the placement test, and the scope and sequence. Eleventy
// calls this at build time (src/_data/program.js); `npm run check` calls it
// to validate without building the site.

import { buildLevel, trackItems } from "./lib/schedule.js";
import { buildMasteryTests, buildPlacement } from "./lib/tests.js";
import { validateLevel, validateItems, checkReadable } from "./lib/validate.js";
import prek from "./tracks/prek.js";
import k from "./tracks/k.js";
import first from "./tracks/first.js";
import bridge from "./tracks/bridge.js";
import second from "./tracks/second.js";
import reading1 from "./tracks/reading1.js";
import reading2 from "./tracks/reading2.js";
import { factList } from "./lib/facts.js";

export const LEVELS = [reading1, reading2, prek, k, first, second, bridge].filter(Boolean);

// The subjects, in the order the app shows them. A level names its subject;
// a subject appears only when a level of it is built.
// cadence: lessons a week, where a subject is not taught daily.
const SUBJECTS = {
  reading: { id: "reading", name: "Reading", guideUrl: "/guide/reading/", placementUrl: "/placement/reading/", placementNote: "Reading 1 and Reading 2.", cadence: 5 },
  math: { id: "math", name: "Math", guideUrl: "/guide/", placementUrl: "/placement/math/", placementNote: "Pre-K through First Grade.", cadence: 5 },
  science: { id: "science", name: "Science", guideUrl: "/guide/science/", placementUrl: null, placementNote: "", cadence: 2 },
  poetry: { id: "poetry", name: "Poetry", guideUrl: "/guide/poetry/", placementUrl: null, placementNote: "", cadence: 2 },
};

function practiceFor(level) {
  const sets = [];
  for (const track of level.tracks) {
    if (!track.testItems) continue;
    const items = [];
    track.units.forEach((u, ui) => {
      const upTo = track.units.slice(0, ui + 1);
      for (let rep = 0; rep < 3; rep++) {
        const got = trackItems(level, track, upTo, u.lesson, `practice${rep}`);
        for (const it of got) items.push({ ...it, lesson: u.lesson });
      }
    });
    if (!items.length) continue;
    sets.push({
      id: `${level.id}-${track.id}`,
      level: level.id,
      levelName: level.name,
      levelSlug: level.slug,
      track: track.id,
      title: track.name,
      summary: track.summary,
      startsAt: track.units[0].lesson,
      total: level.lessons,
      url: `/practice/${level.slug}/${track.id}/`,
      items,
    });
  }
  return sets;
}

export function buildProgram({ strict = true } = {}) {
  const levels = [];
  const lessons = [];
  const tests = [];
  const practice = [];
  const errors = [];
  const warnings = [];

  for (const level of LEVELS) {
    const built = buildLevel(level);
    for (const lesson of built.lessons) lesson.totalLessons = level.lessons;
    const v = validateLevel(level, built);
    errors.push(...v.errors);
    warnings.push(...v.warnings);

    const mt = buildMasteryTests(level, built);
    for (const t of mt) {
      t.parts.forEach((p) => {
        validateItems(p.items, `${t.id} ${p.trackName}`, errors);
        p.items.forEach((st, i) => checkReadable(level, t.afterLesson, st, `${t.id} ${p.trackName} item ${i + 1}`, errors));
      });
    }
    // Tell each lesson which test, if any, follows it, and each test what comes next.
    for (const t of mt) {
      const l = built.lessons[t.afterLesson - 1];
      if (l) l.testAfter = { url: t.url, title: t.title };
      const next = built.lessons[t.afterLesson];
      t.next = next ? { url: next.url, title: `Next: ${next.title}` } : null;
      t.exitUrl = `/${level.slug}/`;
    }
    built.lessons.forEach((l, i) => {
      const next = built.lessons[i + 1];
      l.next = next ? { url: next.url, title: next.title } : null;
      const prev = built.lessons[i - 1];
      l.prev = prev ? { url: prev.url, title: prev.title } : null;
    });

    const ps = practiceFor(level);
    ps.forEach((s) => {
      validateItems(s.items, `practice ${s.id}`, errors);
      s.items.forEach((st, i) => checkReadable(level, st.lesson, st, `practice ${s.id} item ${i + 1}`, errors));
    });

    levels.push({
      id: level.id,
      slug: level.slug,
      subject: level.subject || "math",
      name: level.name,
      longName: level.longName || level.name,
      age: level.age,
      minutes: level.minutes,
      lessons: level.lessons,
      description: level.description,
      tagline: level.tagline,
      endsWith: level.endsWith,
      materials: level.materials || [],
      optional: !!level.optional,
      url: `/${level.slug}/`,
      firstLesson: built.lessons[0].url,
      sounds: level.soundList || [],
      timed: level.timed || null,
      tracks: level.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        summary: t.summary,
        standard: t.standard,
        units: t.units.map((u) => ({ id: u.id, label: u.label, lesson: u.lesson, standard: u.standard || "" })),
      })),
      lessonList: built.lessons.map((l) => ({
        id: l.id,
        number: l.number,
        url: l.url,
        minutes: l.minutes,
        newUnits: l.newUnits,
        tracks: l.exercises.map((e) => e.trackName),
        materials: [...new Set(l.exercises.map((e) => e.materials).filter(Boolean))],
        independent: l.independent ? l.independent.steps.length : 0,
        testAfter: l.testAfter || null,
      })),
      tests: mt.map((t) => ({ id: t.id, url: t.url, title: t.title, afterLesson: t.afterLesson })),
    });
    lessons.push(...built.lessons);
    tests.push(...mt);
    practice.push(...ps);
  }

  const placement = buildPlacement(LEVELS);
  placement.forEach((s) => validateItems(s.items, `placement ${s.id}`, errors));
  // The placement test runs one subject at a time.
  const placements = {};
  for (const s of placement) (placements[s.subject] = placements[s.subject] || []).push(s);

  // Fact review: one ready-made step for every fact, tagged with the lesson
  // after which it is fair game.
  const facts = {};
  for (const level of LEVELS) {
    if (!level.facts) continue;
    facts[level.id] = factList(level);
    facts[level.id].forEach((st) => validateItems([st], `fact ${st.key}`, errors));
  }

  // Quick sounds: every sound of a reading level as a ready-made step, with
  // the alphabet's marks shown, tagged with the lesson it is taught in.
  const soundItems = {};
  for (const level of LEVELS) {
    if (!level.soundList) continue;
    const track = level.tracks.find((t) => t.id === "sounds");
    if (!track) continue;
    soundItems[level.id] = trackItems(level, track, track.units, level.lessons, "quick", track.units.length)
      .map((st) => ({ ...st, screen: st.screen.map((v) => (v.t === "text" ? { ...v, prompts: "full" } : v)) }))
      .sort((a, b) => a.lesson - b.lesson);
    soundItems[level.id].forEach((st) => validateItems([st], `quick sound ${st.sound}`, errors));
  }

  // The stories, for the library under Practice: each with the level and
  // lesson it is readable at, or none yet, and its lines and questions as
  // ready-made steps.
  const stories = [];
  for (const level of LEVELS) {
    for (const st of level.storyLibrary || []) {
      const placed = st.lesson !== null;
      const have = stories.findIndex((x) => x.slug === st.slug);
      // A level that places a story wins over one that only lists it.
      if (have !== -1) { if (!placed || stories[have].level) continue; stories.splice(have, 1); }
      stories.push({ ...st, level: placed ? level.id : null, levelName: placed ? level.name : "", url: `/stories/${st.slug}/` });
      validateItems(st.items, `story ${st.slug}`, errors);
      if (placed) st.items.forEach((it, i) => checkReadable(level, st.lesson, it, `story ${st.slug} item ${i + 1}`, errors));
    }
  }
  stories.sort((a, b) => a.order - b.order);
  // The word list: every word the reading levels read, by level and lesson.
  const words = [];
  for (const level of LEVELS) for (const w of level.wordList || []) words.push({ word: w.word, level: level.id, levelName: level.name, lesson: w.lesson, whole: !!w.whole, taught: w.taught !== false });
  words.sort((a, b) => a.level.localeCompare(b.level) || a.lesson - b.lesson || a.word.toLowerCase().localeCompare(b.word.toLowerCase()));
  // The same words grouped by level and lesson, for the word list page.
  const wordGroups = [];
  for (const level of LEVELS) {
    if (!level.wordList) continue;
    const byLesson = new Map();
    for (const w of words) { if (w.level !== level.id) continue; if (!byLesson.has(w.lesson)) byLesson.set(w.lesson, []); byLesson.get(w.lesson).push(w); }
    wordGroups.push({ level: level.id, levelName: level.name, count: words.filter((w) => w.level === level.id).length, lessons: [...byLesson.entries()].sort((a, b) => a[0] - b[0]).map(([lesson, list]) => ({ lesson, words: list })) });
  }

  if (strict && errors.length) {
    const head = errors.slice(0, 40).join("\n  ");
    throw new Error(`Curriculum check failed with ${errors.length} error(s):\n  ${head}${errors.length > 40 ? "\n  ..." : ""}`);
  }
  // The dashboard needs a compact map of every level, lesson, test, and track.
  const summary = levels.map((lv) => ({
    id: lv.id, slug: lv.slug, subject: lv.subject, name: lv.name, lessons: lv.lessons, url: lv.url,
    tests: lv.tests,
    tracks: Object.fromEntries(lv.tracks.map((t) => [t.id, t.name])),
    facts: (facts[lv.id] || []).map((f) => ({ key: f.key, lesson: f.lesson, set: f.set })),
    timed: lv.timed,
    sounds: lv.sounds || [],
    minutes: lv.minutes,
    // One short row per lesson: minutes, the real objects it needs, what is new.
    brief: lv.lessonList.map((l) => [l.minutes, l.materials.join("; "), l.newUnits.map((u) => u.label).join(", ")]),
  }));
  const subjects = Object.keys(SUBJECTS)
    .filter((s) => levels.some((l) => l.subject === s))
    .map((s) => ({ ...SUBJECTS[s], levels: levels.filter((l) => l.subject === s).map((l) => l.id) }));
  return { levels, lessons, tests, practice, placement, placements, facts, soundItems, stories, words, wordGroups, summary, subjects, errors, warnings };
}
