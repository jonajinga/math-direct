# Writing a Second Grade track

This file is the brief for the modules in this folder. Read it, then
`curriculum/tracks/bridge.js` (a complete small level), `curriculum/lib/v.js`
(every picture the stage can draw), `curriculum/lib/steps.js`, and the rules
in `curriculum/lib/validate.js`. The level is `curriculum/tracks/second.js`;
it imports each module's tracks by name, so a module must export exactly the
names it is asked for. `curriculum/tracks/second/common2.js` holds helpers
shared by the modules.

## The level

Second Grade: 150 lessons of 18 to 24 minutes for a child of about seven,
after First Grade or the Bridge. Each lesson is nine exercises or so: the
skip-counting warm-up, any new teaching, the firming of the last few units,
reviews that are due, a puzzle, and On your own. The scheduler assembles
lessons from the tracks; a track never writes lessons, only units and the
exercises for them.

## A track

```js
export const addCols = {
  id: "add-100",                       // stable; used in records
  name: "Adding within 100",           // shown on the panel and in the outline
  summary: "One or two sentences for the scope and sequence.",
  standard: "2.NBT.5",                 // the Common Core code(s)
  units: [                             // in lesson order; the lesson a unit begins
    { id: "nocarry", lesson: 3, label: "Adding in columns without carrying" },
    { id: "carry", lesson: 9, label: "Carrying a new ten" },
  ],
  newEx(u, ctx, intro) { ... },        // the exercise that teaches unit u (model, lead, tests)
  firmEx(intro, ctx, u) { ... },       // optional: the next three lessons' practice of u
  reviewEx(intro, ctx) { ... },        // the review once a track is firm: 3 to 5 test steps
  testItems(units, ctx, count) { ... },// test steps for mastery tests, placement, practice, On your own
};
```

- `ctx` is `{ level, lesson, rand, known(trackId), has(trackId, unitId), stage }`.
  `ctx.rand` is seeded: `r()` in [0,1), `r.int(lo, hi)`, `r.pick(list)`,
  `r.shuffle(list)`, `r.sample(list, n)`, `r.seq(list, n)` (no neighbour
  repeats). Use it for every random choice, so a lesson is the same every
  time it is taught.
- `intro` and `units` are the track's units taught so far (a prefix of
  `units`). Draw items only from what is taught by that lesson.
- `newEx` returns `{ title, steps }` (or a list of them). A new unit is
  taught model, lead, test: show it ("My turn."), do it together ("Say it
  with me." / "Do it with me."), then test alone, three or more test
  steps, with easy items before hard ones.
- If `firmEx` is missing, the scheduler uses `reviewEx` and fades the
  format itself: the day after new teaching it puts the lead steps of
  `newEx` in front, the next day one lead, then tests only. Write `firmEx`
  only when the practice should differ from the review.
- `reviewEx` returns `{ title, steps }` with three to five test steps drawn
  from every unit taught so far, the newest favored (`favorNew` in
  `common.js`). It is called with a fresh seed when the scheduler wants
  more items, so do not depend on its length.
- `testItems(units, ctx, count)` returns two to four test steps (more if
  `count` asks) covering the units given, hardest last. Every test step
  here must be answerable alone: a spoken number, or one touch on the
  screen. Give each an `item:` key.
- Optional flags: `warmup: true` (every lesson, first), `keep: true` (never
  dropped when a lesson runs long), `reviewEvery: n` (reviewed every n
  lessons once taught), `firmLessons: n` (days of firming, default 3),
  `maxGap: n`, `puzzle: true` (the puzzle track; see below).

## Steps

From `curriculum/lib/steps.js`:

- `model(screen, say, opts)`: "My turn." The parent shows. Nothing is marked.
- `lead(screen, say, answer, opts)`: "Together." The child answers with the parent.
- `test(screen, say, answer, correct, opts)`: "Your turn." The parent marks Firm or Error.
  `correct` is read after an error and must state the answer: use
  `fix(answer, question, preface)` for a spoken answer ("My turn: seven.
  Say it with me: seven. Your turn. How many?") with `preface` the rule
  that gives the answer, or `fixPoint(show, question)` for a touch.
- `note(screen, say, opts)`: an instruction to the parent, such as "The child works it on the whiteboard."
- `opts`: `skill` (a short name for records: "add", "subtract", "place-value",
  "compare", "story", "measure", "time", "money", "data", "shape",
  "puzzle"), `item` (a key unique to the item, such as `` `col:${a}+${b}` ``),
  `confirm` (what to say when right; default "Yes, <answer>."), `signal`
  (touch | drop | rhythm | watch; inferred when left out), `secs` (seconds
  the step takes, when more than usual), `do` (an instruction to the
  parent for this step), `hints` (puzzles only).
- `screen` is one picture or a list: `V.say()` for a spoken item, or any of
  `V.num`, `V.eq`, `V.colx`, `V.blocks`, `V.nl`, `V.grid`, `V.tape`,
  `V.graph`, `V.table`, `V.geo`, `V.ruler`, `V.clock`, `V.coins`, `V.parts`,
  `V.shape`, `V.choices`, `V.prose`, `V.row`, and the rest in `v.js`. Read
  each constructor's comment for its options. `V.col` (two rows) and
  `V.colx` (any rows, up to six digits, with `carries` and `trades`) both
  draw column work.

## Rules the validator enforces (the build fails otherwise)

- Every test step has an answer and a correction, and the correction
  contains the answer's first words. Every lead has an answer.
- No exclamation mark anywhere. No praise words (good, great, brilliant,
  and the like): praise is the answer itself, "Yes, seven."
- A number printed on the screen must be readable at that lesson: whole
  numbers to 120 before lesson 4, to 500 before lesson 26, then to 1000.
  No fractions in notation in this level (equal shares use `V.parts`).
- `V.dots` and `V.obj` hold at most 30 things; use `V.grid` for arrays.
- A `V.prose` line has at most 90 characters, at most eight lines.
- A `say` line of more than 30 words is warned about; keep lines short.
- Every exercise has a title and steps; a `new` exercise has model, lead,
  and test steps.
- On your own takes three to eight items from the day's reviewed tracks,
  each answered by one touch. A spoken number answer is turned into a
  choice of three automatically; a `V.choices` item is used as it is.

## Copy

Strunk and White, applied to a script: short declarative sentences in the
active voice, concrete words, no needless words. Keep the Direct Instruction
signals exactly: "My turn." "Say it with me." "Do it with me." "Your turn."
"Get ready." Numbers in a `say` line are words ("forty-six"); on the screen
they are numerals. Say "child", "lesson", "exercise"; never "student",
"session", "track". A `do` line is an imperative to the parent. No "!" and
no "Good" or "Great".

From this grade the child often works on a whiteboard or paper beside the
phone. For a column problem or a two-step story, say so in the `do` line:
`do: "The child works it on the whiteboard. Ask for the answer when the child says done."`
(`WHITEBOARD` in `common2.js`). The screen still shows the problem.

## Puzzles (the puzzles module only)

The puzzle track has `puzzle: true, keep: true, reviewEvery: 1`, so a puzzle
comes in every lesson once the track begins. Each unit is a family of
puzzles with a generator. A puzzle exercise is `{ title, kind: "puzzle",
steps }` with one or two test steps (a `note` or `model` may come first),
`secs: 180` to `240`, `skill: "puzzle"`, `item: "pz:<family>:<key>"`, and
`hints: [h1, h2, h3]`: one to three hints that lead toward the method and
never state the answer or its number. The child works on the whiteboard; the
screen shows the problem as `V.prose` lines (or a picture plus prose). The
answer is a spoken number or a touch. Think Beast Academy: a puzzle has a
twist, rewards a clever way, and can be reasoned out from what the lessons
have taught by that point. `reviewEx` picks one puzzle, the newest family
favored, and `testItems` returns two puzzles.

## Verifying

From `/home/user/math-direct`: `npm run check` builds every level and fails
on any rule above; `npm run check -- --list second` prints one line per
lesson; `npm run check -- --show second 40` prints lesson 40's script. The
warnings about minutes and density will settle once every module is in;
errors must be fixed. Do not edit files outside your module. Do not commit.
