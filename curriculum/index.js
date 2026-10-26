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
import { factStep } from "./tracks/k.js";

export const LEVELS = [prek, k, first, bridge].filter(Boolean);

// The subjects, in the order the app shows them. A level names its subject;
// a subject appears only when a level of it is built.
const SUBJECTS = {
  reading: { id: "reading", name: "Reading", guideUrl: "/guide/reading/", placementUrl: "/placement/reading/", placementNote: "Reading 1 and Reading 2." },
  math: { id: "math", name: "Math", guideUrl: "/guide/", placementUrl: "/placement/math/", placementNote: "Pre-K through First Grade." },
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

  // Fact review: one ready-made step for every fact, tagged with the lesson
  // after which it is fair game.
  const facts = {};
  for (const level of LEVELS) {
    if (!level.facts) continue;
    facts[level.id] = level.facts.map((f) => ({ ...factStep(f.a, f.op, f.b), key: f.key, lesson: f.lesson, set: f.set || 1 }));
    facts[level.id].forEach((st) => validateItems([st], `fact ${st.key}`, errors));
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
    facts: (facts[lv.id] || []).map((f) => ({ key: f.key, lesson: f.lesson })),
    minutes: lv.minutes,
    // One short row per lesson: minutes, the real objects it needs, what is new.
    brief: lv.lessonList.map((l) => [l.minutes, l.materials.join("; "), l.newUnits.map((u) => u.label).join(", ")]),
  }));
  const subjects = Object.keys(SUBJECTS)
    .filter((s) => levels.some((l) => l.subject === s))
    .map((s) => ({ ...SUBJECTS[s], levels: levels.filter((l) => l.subject === s).map((l) => l.id) }));
  return { levels, lessons, tests, practice, placement, facts, summary, subjects, errors, warnings };
}
