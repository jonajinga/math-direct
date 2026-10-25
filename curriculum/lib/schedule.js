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
import { word } from "./words.js";

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
      } else if (since <= (track.firmLessons ?? 3)) {
        must.push({ track, kind: "firm", units: [latest], intro, pri: 1, order, stage: since });
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
        ctx.stage = w.stage;
        made = asList((w.track.firmEx || w.track.reviewEx).call(w.track, w.intro, ctx, w.units[0]));
        // The format fades: the day after new teaching the lead comes back
        // before the tests, the next day one brief lead, and then tests only.
        if (!w.track.firmEx && made[0] && !made[0].steps.some((s) => s.cue === "lead" || s.cue === "model")) {
          const fresh = asList(w.track.newEx(w.units[0], makeCtx(level, n, w.track.id, "fade"), w.intro))[0];
          const leads = fresh ? fresh.steps.filter((s) => s.cue === "lead") : [];
          if (w.stage === 1 && leads.length) made[0].steps = leads.concat(made[0].steps);
          else if (w.stage === 2 && leads.length) made[0].steps = [leads[0]].concat(made[0].steps);
        }
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
        // Spare items let the runner put an item the child missed recently in
        // place of one that is firm, and give a repeated lesson fresh items.
        if (ex.kind !== "new" && w.track.testItems) {
          const have = new Set(ex.steps.map((s) => s.say + JSON.stringify(s.screen)));
          const spare = [];
          for (const salt of ["spare", "spare2"]) {
            for (const it of trackItems(level, w.track, w.intro, n, salt)) {
              const k = it.say + JSON.stringify(it.screen);
              if (have.has(k)) continue;
              have.add(k);
              spare.push(it);
              if (spare.length >= 3) break;
            }
            if (spare.length >= 3) break;
          }
          if (spare.length) ex.spare = spare;
        }
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

    const lesson = {
      level: level.id,
      levelName: level.name,
      levelSlug: level.slug,
      number: n,
      id: lessonId(level, n),
      url: lessonUrl(level, n),
      title: `Lesson ${n}`,
      newUnits,
      exercises,
    };
    const own = buildIndependent(level, lesson, chosen);
    if (own) lesson.independent = own;
    lessons.push(lesson);
  }

  return { lessons, unitHome };
}

// ── On your own ──
// A short piece of independent work at the end of a lesson: three to eight
// items from the day's firmed and reviewed tracks, each answered by one touch
// on the screen. The parent reads the line once and marks the answer. Items
// that are answered aloud become a choice of three numbers when the numbers
// can be read at this lesson.

const WORD_TO_NUM = new Map();
for (let i = 0; i <= 120; i++) WORD_TO_NUM.set(word(i), i);

export function tapGroups(screen) {
  let groups = 0;
  (function walk(v) {
    if (!v) return;
    if (Array.isArray(v)) return v.forEach(walk);
    if (v.t === "choices" && Array.isArray(v.opts)) groups++;
    else if (v.tap && v.t !== "obj" && typeof v.ans === "number") groups++;
    if (v.items && v.t !== "pattern" && v.t !== "size") walk(v.items);
  })(screen);
  return groups;
}

function hasMarks(screen) {
  let found = false;
  (function walk(v) {
    if (!v || found) return;
    if (Array.isArray(v)) return v.forEach(walk);
    if (v.t === "obj" && v.tap) found = true;
    if (v.items && v.t !== "pattern" && v.t !== "size") walk(v.items);
  })(screen);
  return found;
}

function numericAnswer(answer) {
  const m = /^([A-Za-z-]+(?: hundred(?: [a-z-]+)?)?)\.$/.exec(String(answer || "").trim());
  if (!m) return null;
  const v = WORD_TO_NUM.get(m[1].toLowerCase());
  return typeof v === "number" ? v : null;
}

function pickOthers(rand, pool, ans, k) {
  const near = pool.filter((x) => x !== ans && Math.abs(x - ans) <= 3);
  const wide = pool.filter((x) => x !== ans && Math.abs(x - ans) <= 10);
  const any = pool.filter((x) => x !== ans);
  const src = near.length >= k ? near : wide.length >= k ? wide : any;
  const out = [];
  const bag = src.slice();
  while (out.length < k && bag.length) out.push(bag.splice(Math.floor(rand() * bag.length), 1)[0]);
  return out.length === k ? out : null;
}

function shuffled(rand, list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Turn an item into one the child answers by touch, or return null.
function toTappable(it, readable, rand) {
  const groups = tapGroups(it.screen);
  if (groups > 1) return null;
  if (groups === 1) {
    if (hasMarks(it.screen)) return null;
    return { ...it, independent: true };
  }
  if (hasMarks(it.screen)) return null;
  if (it.skill === "count" || it.skill === "subitize" || it.skill === "count-aloud") return null;
  const ans = numericAnswer(it.answer);
  if (ans === null || !readable.has(ans)) return null;
  const pool = [...readable].filter((x) => typeof x === "number");
  const others = pickOthers(rand, pool, ans, 2);
  if (!others) return null;
  const opts = shuffled(rand, [ans, ...others]);
  const choices = { t: "choices", opts: opts.map((v) => ({ t: "num", v, size: "md" })), ans: opts.indexOf(ans) };
  const screen = Array.isArray(it.screen) ? it.screen : [it.screen];
  const isSay = screen.length === 1 && screen[0] && screen[0].t === "say";
  if (it.skill === "read") {
    // The screen showed the number; now the child finds it among three.
    return { ...it, independent: true, screen: [choices], say: `Touch ${word(ans)}.`, answer: `(Touches ${ans}.)`, confirm: `Yes, ${word(ans)}.`, signal: "touch" };
  }
  // "Say the next number" becomes "touch the next number"; otherwise the
  // line ends with "Touch the answer."
  const say = /\bsay\b/i.test(it.say) ? it.say.replace(/\bSay\b/g, "Touch").replace(/\bsay\b/g, "touch") : `${it.say} Touch the answer.`;
  return {
    ...it,
    independent: true,
    screen: isSay ? [choices] : [...screen, choices],
    say,
    answer: `(Touches ${ans}.)`,
    confirm: `Yes, ${word(ans)}.`,
    signal: "touch",
  };
}

export function buildIndependent(level, lesson, chosen) {
  const n = lesson.number;
  const readable = level.readable ? level.readable(n) : new Set();
  const rand = rng(`${level.id}:${n}:own`);
  const perTrack = [];
  const seen = new Set();
  for (const w of chosen) {
    if (w.kind === "new" || !w.track.testItems) continue;
    const units = w.track.units.filter((u) => u.lesson <= n);
    const list = [];
    for (const salt of ["own", "own2"]) {
      for (const it of trackItems(level, w.track, units, n, salt)) {
        const k = it.say + JSON.stringify(it.screen);
        if (seen.has(k)) continue;
        seen.add(k);
        const made = toTappable(it, readable, rand);
        if (made) list.push(made);
        if (list.length >= 3) break;
      }
      if (list.length >= 3) break;
    }
    if (list.length) perTrack.push(list);
  }
  // One from each track in turn, so no track dominates.
  const steps = [];
  for (let round = 0; steps.length < 8; round++) {
    let took = false;
    for (const list of perTrack) {
      if (list[round] && steps.length < 8) { steps.push(list[round]); took = true; }
    }
    if (!took) break;
  }
  if (steps.length < 3) return null;
  return { title: "On your own", steps };
}

// Items for tests and practice: test steps drawn from a track's units.
export function trackItems(level, track, units, n, salt, count) {
  const ctx = makeCtx(level, n, track.id, salt);
  const items = track.testItems(units, ctx, count) || [];
  return items.map((s) => ({ ...s, cue: "test", track: track.id, trackName: track.name }));
}

