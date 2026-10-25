// Mastery tests (every ten lessons) and the placement test.

import { trackItems } from "./schedule.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function allowedErrors(items) {
  return items >= 4 ? 1 : 0;
}

export function buildMasteryTests(level, built) {
  const tests = [];
  const every = level.testEvery || 10;
  const count = Math.floor(level.lessons / every);
  for (let t = 1; t <= count; t++) {
    const end = t * every;
    const start = end - every + 1;
    const final = t === count;
    const parts = [];
    for (const track of level.tracks) {
      const upTo = track.units.filter((u) => u.lesson <= end);
      if (!upTo.length || !track.testItems) continue;
      const inBlock = track.units.filter((u) => u.lesson >= start && u.lesson <= end);
      if (!final && !inBlock.length) continue;
      const items = trackItems(level, track, upTo, end, `test${t}`);
      // At least two items per part where the skill allows, so each part checks
      // more than one example.
      for (let salt = 2; items.length < 2 && salt < 6; salt++) {
        const seen = new Set(items.map((x) => x.say + JSON.stringify(x.screen)));
        for (const extra of trackItems(level, track, upTo, end, `test${t}-${salt}`)) {
          if (items.length >= 3) break;
          if (!seen.has(extra.say + JSON.stringify(extra.screen))) items.push(extra);
        }
      }
      // Some skills give one fixed item for their newest unit. Add one from an
      // earlier unit, so the part checks the newest step and one before it.
      for (let k = upTo.length - 1; items.length < 2 && k >= 1; k--) {
        const seen = new Set(items.map((x) => x.say + JSON.stringify(x.screen)));
        const extra = trackItems(level, track, upTo.slice(0, k), end, `test${t}-prev${k}`).find((x) => !seen.has(x.say + JSON.stringify(x.screen)));
        if (extra) items.push(extra);
      }
      if (!items.length) continue;
      const remedyUnits = inBlock.length ? inBlock : upTo.slice(-2);
      const remedy = remedyUnits
        .map((u) => {
          const home = built.unitHome[`${track.id}:${u.id}`];
          if (!home) return null;
          return { lesson: home.lesson, exercise: home.exercise, label: u.label, url: `/${level.slug}/lesson-${String(home.lesson).padStart(3, "0")}/` };
        })
        .filter(Boolean);
      parts.push({
        track: track.id,
        trackName: track.name,
        items,
        allowed: allowedErrors(items.length),
        remedy,
      });
    }
    tests.push({
      id: `${level.id}-test-${pad2(t)}`,
      level: level.id,
      levelName: level.name,
      levelSlug: level.slug,
      number: t,
      afterLesson: end,
      final,
      url: `/${level.slug}/test-${pad2(t)}/`,
      title: final ? `Mastery Test ${t} (end of level)` : `Mastery Test ${t}`,
      parts,
    });
  }
  return tests;
}

// The placement test is a series of sections. Each section checks the skills
// taught in one span of lessons. The child starts at the first span whose
// section she does not pass.
export function buildPlacement(levels) {
  const sections = [];
  for (const level of levels) {
    const points = level.placementPoints;
    if (!points) continue;
    for (let i = 0; i < points.length; i++) {
      const from = points[i];
      const to = (points[i + 1] || level.lessons + 1) - 1;
      // Tracks with the most teaching in this span go first.
      const ranked = level.tracks
        .filter((t) => t.testItems && t.units.some((u) => u.lesson >= from && u.lesson <= to))
        .map((t) => ({ t, k: t.units.filter((u) => u.lesson >= from && u.lesson <= to).length }))
        .sort((a, b) => b.k - a.k)
        .slice(0, level.placementTracks || 5)
        .map((x) => x.t);
      const items = [];
      for (const track of ranked) {
        const upTo = track.units.filter((u) => u.lesson <= to);
        const got = trackItems(level, track, upTo, to, `placement${from}`).slice(0, 2);
        items.push(...got);
      }
      if (!items.length) continue;
      sections.push({
        id: `${level.id}-${from}`,
        level: level.id,
        levelName: level.name,
        levelSlug: level.slug,
        from,
        to,
        start: { level: level.id, lesson: from, url: `/${level.slug}/lesson-${String(from).padStart(3, "0")}/` },
        title: `${level.name}, lessons ${from} to ${to}`,
        items,
        allowed: items.length >= 8 ? 1 : 0,
      });
    }
  }
  return sections;
}
