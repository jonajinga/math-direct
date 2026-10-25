// Lesson assembly. Each level is a list of tracks. A track is a skill taught
// across many lessons: it names its units (what is taught, and in which lesson
// it begins) and supplies the exercises for new teaching, firming, and review.
//
// The scheduler decides, for every lesson, which tracks appear:
//   - a unit's first lesson gets a new-teaching exercise;
//   - the next few lessons get a firming exercise on that unit;
//   - after that the track returns for review at widening intervals, and it
//     never disappears for long.
// Warm-up tracks (counting aloud) appear in every lesson.

import { rng } from "./rand.js";

function pad3(n) {
  return String(n).padStart(3, "0");
}

export function lessonId(level, n) {
  return `${level.id}-${pad3(n)}`;
}

export function lessonUrl(level, n) {
  return `/${level.slug}/lesson-${pad3(n)}/`;
}

function reviewInterval(level, sinceLatest) {
  const base = level.reviewIntervals || [2, 3, 4];
  if (sinceLatest < 10) return base[0];
  if (sinceLatest < 25) return base[1];
  return base[2];
}

// Context handed to every track function.
function makeCtx(level, n, trackId, salt) {
  const rand = rng(`${level.id}:${n}:${trackId}:${salt || ""}`);
  return {
    level,
    lesson: n,
    rand,
    // Units of any track in this level introduced on or before this lesson.
    known(id) {
      const t = level.tracks.find((x) => x.id === id);
      if (!t) return [];
      return t.units.filter((u) => u.lesson <= n);
    },
    has(id, unitId) {
      return this.known(id).some((u) => u.id === unitId);
    },
  };
}

function introduced(track, n) {
  return track.units.filter((u) => u.lesson <= n);
}

function asList(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

export function buildLevel(level) {
  const lessons = [];
  const lastSeen = {};
  const unitHome = {}; // unit key -> { lesson, exercise index }

  for (let n = 1; n <= level.lessons; n++) {
    const must = [];
    const may = [];
    for (const track of level.tracks) {
      const intro = introduced(track, n);
      if (!intro.length) continue;
      const today = track.units.filter((u) => u.lesson === n);
      const latest = intro[intro.length - 1];
      const since = n - latest.lesson;
      const order = level.tracks.indexOf(track);
      if (today.length) {
        must.push({ track, kind: "new", units: today, intro, pri: 0, order });
      } else if (since <= (track.firmLessons ?? 2)) {
        must.push({ track, kind: "firm", units: [latest], intro, pri: 1, order });
      } else if (track.warmup) {
        must.push({ track, kind: "review", units: intro, intro, pri: 1, order });
      } else if (!track.retired || n <= track.retired) {
        const gap = n - (lastSeen[track.id] ?? 0);
        const want = track.reviewEvery || reviewInterval(level, since);
        may.push({ track, kind: "review", units: intro, intro, score: gap / want, order });
      }
    }

    // New teaching, firming, and the warm-up always come. Then reviews that are
    // due, most overdue first, up to the maximum; then, if the lesson is still
    // short, the reviews closest to due.
    must.sort((a, b) => a.pri - b.pri || a.order - b.order);
    const chosen = must.slice(0, Math.max(level.maxExercises, must.filter((w) => w.kind === "new" || w.track.warmup).length));
    may.sort((a, b) => b.score - a.score || a.order - b.order);
    for (const w of may) {
      if (chosen.length >= level.maxExercises) break;
      if (w.score >= 1 || chosen.length < (level.minExercises || 0)) chosen.push(w);
    }

    // Order: warm-up, new teaching, then the rest in track order.
    chosen.sort((a, b) => {
      const ra = a.track.warmup ? 0 : a.kind === "new" ? 1 : 2;
      const rb = b.track.warmup ? 0 : b.kind === "new" ? 1 : 2;
      return ra - rb || a.order - b.order;
    });

    const exercises = [];
    for (const w of chosen) {
      const ctx = makeCtx(level, n, w.track.id, w.kind);
      let made;
      if (w.kind === "new") {
        made = w.units.flatMap((u) => asList(w.track.newEx(u, ctx, w.intro)));
      } else if (w.kind === "firm") {
        made = asList((w.track.firmEx || w.track.reviewEx).call(w.track, w.intro, ctx, w.units[0]));
      } else {
        made = asList(w.track.reviewEx(w.units, ctx));
        // Lengthen short reviews with more items from the same track.
        const want = level.minReviewSteps || 0;
        const ex = made[0];
        let salt = 0;
        while (ex && ex.steps.filter((s) => s.cue === "test").length < want && salt < 4) {
          salt++;
          const more = asList(w.track.reviewEx(w.units, makeCtx(level, n, w.track.id, "more" + salt)))[0];
          if (!more) break;
          const seen = new Set(ex.steps.map((s) => s.say + JSON.stringify(s.screen)));
          for (const s of more.steps) {
            if (s.cue !== "test" || seen.has(s.say + JSON.stringify(s.screen))) continue;
            ex.steps.push(s);
            if (ex.steps.filter((x) => x.cue === "test").length >= want) break;
          }
        }
      }
      for (const ex of made) {
        ex.track = w.track.id;
        ex.trackName = w.track.name;
        ex.kind = ex.kind || w.kind;
        ex.units = ex.units || w.units.map((u) => u.id);
        exercises.push(ex);
      }
      lastSeen[w.track.id] = n;
    }

    exercises.forEach((ex, i) => {
      ex.n = i + 1;
      if (ex.kind === "new") {
        for (const u of ex.units) {
          const key = `${ex.track}:${u}`;
          if (!unitHome[key]) unitHome[key] = { lesson: n, exercise: i + 1 };
        }
      }
    });

    const newUnits = chosen
      .filter((w) => w.kind === "new")
      .flatMap((w) => w.units.map((u) => ({ track: w.track.name, label: u.label })));

    lessons.push({
      level: level.id,
      levelName: level.name,
      levelSlug: level.slug,
      number: n,
      id: lessonId(level, n),
      url: lessonUrl(level, n),
      title: `Lesson ${n}`,
      newUnits,
      exercises,
    });
  }

  return { lessons, unitHome };
}

// Items for tests and practice: test steps drawn from a track's units.
export function trackItems(level, track, units, n, salt, count) {
  const ctx = makeCtx(level, n, track.id, salt);
  const items = track.testItems(units, ctx, count) || [];
  return items.map((s) => ({ ...s, cue: "test", track: track.id, trackName: track.name }));
}

