// Mastery tests (every ten lessons) and the placement test.

import { trackItems } from "./schedule.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

// A part is passed with every item right, or one error in five or more
// (at least four in five right).
export function allowedErrors(items) {
  return items >= 5 ? 1 : 0;
}

const PART_RANGE = [4, 8];
const MAX_PARTS = 6;

// Items for one part of a mastery test: one or two from the newest unit, one
// from each other unit the part covers (the block's units, or every unit on
// the final test), one from before the block for retention, and then fresh
// draws until the part has at least four.
function partItems(level, track, upTo, start, end, t, final) {
  const [PART_MIN, PART_MAX] = level.partRange || PART_RANGE;
  const items = [];
  const seen = new Set();
  const add = (list, limit) => {
    let n = 0;
    for (const x of list) {
      const k = x.say + JSON.stringify(x.screen);
      if (seen.has(k) || items.length >= PART_MAX) continue;
      seen.add(k);
      items.push(x);
      n++;
      if (limit && n >= limit) break;
    }
  };
  const inBlock = upTo.filter((u) => u.lesson >= start);
  const cover = final ? upTo : inBlock.length ? inBlock : upTo.slice(-2);
  for (let i = cover.length - 1; i >= 0; i--) {
    const idx = upTo.indexOf(cover[i]);
    add(trackItems(level, track, upTo.slice(0, idx + 1), end, `test${t}-u${idx}`), i === cover.length - 1 ? 2 : 1);
  }
  if (!final && inBlock.length && upTo.length > inBlock.length) {
    add(trackItems(level, track, upTo.slice(0, upTo.length - inBlock.length), end, `test${t}-prev`), 1);
  }
  for (let salt = 2; items.length < PART_MIN && salt < 10; salt++) {
    add(trackItems(level, track, upTo, end, `test${t}-${salt}`), PART_MIN - items.length);
  }
  return items;
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
    const testTracks = (level.testTracks ? level.tracks.filter((tr) => level.testTracks.includes(tr.id)) : level.tracks).filter((tr) => !tr.puzzle);
    // Tracks with a new unit in the block come first; the rest take turns
    // from test to test, so a test holds at most six parts (maxParts).
    const withNew = [], rest = [];
    for (const track of testTracks) {
      const upTo = track.units.filter((u) => u.lesson <= end);
      if (!upTo.length || !track.testItems) continue;
      const inBlock = track.units.filter((u) => u.lesson >= start && u.lesson <= end);
      // A track with no new unit in the block is left out, unless the level
      // names it as tested every time (reading the fast way) or it is the
      // final test.
      if (inBlock.length || (level.testAlways || []).includes(track.id)) withNew.push(track);
      else if (final) rest.push(track);
    }
    // The final test sweeps the whole level; the others hold at most six parts.
    const cap = final ? Infinity : level.maxParts || MAX_PARTS;
    const turn = rest.length ? t % rest.length : 0;
    const chosen = withNew.concat(rest.slice(turn), rest.slice(0, turn)).slice(0, Math.max(cap, withNew.length));
    for (const track of chosen) {
      const upTo = track.units.filter((u) => u.lesson <= end);
      const inBlock = track.units.filter((u) => u.lesson >= start && u.lesson <= end);
      const items = partItems(level, track, upTo, start, end, t, final);
      if (!items.length) continue;
      const remedyUnits = inBlock.length ? inBlock : upTo.slice(-2);
      const remedy = remedyUnits
        .map((u) => {
          const home = built.unitHome[`${track.id}:${u.id}`];
          if (!home) return null;
          return { lesson: home.lesson, exercise: home.exercise, label: u.label, url: `/${level.slug}/lesson-${String(home.lesson).padStart(3, "0")}/#ex${home.exercise}` };
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
    // Problem solving: two puzzles from the level's puzzle track, with no
    // hints, as the passage part is built in reading.
    for (const track of level.tracks.filter((tr) => tr.puzzle && tr.testItems)) {
      const upTo = track.units.filter((u) => u.lesson <= end);
      if (!upTo.length) continue;
      const items = trackItems(level, track, upTo, end, `test${t}-puzzle`).slice(0, 2).map((s) => { const c = { ...s }; delete c.hints; return c; });
      if (!items.length) continue;
      const inBlock = track.units.filter((u) => u.lesson >= start && u.lesson <= end);
      const remedy = (inBlock.length ? inBlock : upTo.slice(-2)).map((u) => {
        const home = built.unitHome[`${track.id}:${u.id}`];
        return home ? { lesson: home.lesson, exercise: home.exercise, label: u.label, url: `/${level.slug}/lesson-${String(home.lesson).padStart(3, "0")}/#ex${home.exercise}` } : null;
      }).filter(Boolean);
      parts.push({ track: track.id, trackName: "Problem solving", items, allowed: 0, remedy, kind: "puzzle" });
    }
    // A passage read alone against the clock, where the level has one.
    if (level.testPassage) {
      const pp = level.testPassage(end);
      if (pp) parts.push(pp);
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
        .filter((t) => t.testItems && !t.puzzle && t.units.some((u) => u.lesson >= from && u.lesson <= to))
        .map((t) => ({ t, k: t.units.filter((u) => u.lesson >= from && u.lesson <= to).length }))
        .sort((a, b) => b.k - a.k)
        .slice(0, level.placementTracks || 6)
        .map((x) => x.t);
      const items = [];
      for (const track of ranked) {
        const upTo = track.units.filter((u) => u.lesson <= to);
        const got = trackItems(level, track, upTo, to, `placement${from}`).slice(0, 3);
        items.push(...got);
      }
      if (!items.length) continue;
      if (i === 0 && level.readiness && level.readiness.length) {
        // Before the first lessons: can the child repeat a word, answer on a
        // signal, and touch a named picture? If not, the readiness exercises
        // in the first lessons come first.
        sections.push({
          id: `${level.id}-ready`,
          subject: level.subject || "math",
          level: level.id,
          levelName: level.name,
          levelSlug: level.slug,
          from: 0,
          to: 0,
          readiness: true,
          start: { level: level.id, lesson: 1, url: `/${level.slug}/lesson-001/`, label: `${level.name}, Lesson 1, with the readiness exercises` },
          title: `${level.name}, readiness`,
          items: level.readiness.map((s) => ({ ...s, cue: "test", track: "readiness", trackName: "Readiness" })),
          allowed: 0,
        });
      }
      sections.push({
        id: `${level.id}-${from}`,
        subject: level.subject || "math",
        level: level.id,
        levelName: level.name,
        levelSlug: level.slug,
        age: level.age,
        from,
        to,
        start: { level: level.id, lesson: from, url: `/${level.slug}/lesson-${String(from).padStart(3, "0")}/` },
        title: `${level.name}, lessons ${from} to ${to}`,
        items,
        allowed: Math.floor(items.length / 7),
      });
    }
  }
  return sections;
}
