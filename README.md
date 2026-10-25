# Math Direct

Free, scripted Direct Instruction math lessons for Pre-K, Kindergarten, and First Grade, with an optional bridge to second grade. A parent or teacher reads the script; the child answers; the parent marks each answer Firm or Error. There are no games, points, or prizes.

## Running it

```
npm install
npm start          # site at http://localhost:8080, rebuilt on save
npm run build      # build into _site/
npm run check      # validate every lesson and print a summary
```

`npm run check -- --list k` prints one line per Kindergarten lesson. `npm run check -- --show first 52` prints the full script of First Grade lesson 52.

More checks, each run against a built site (`npm run build` first):

```
npm run check:all      # the curriculum, a clean build, the PWA files, and the copy rules
npm run check:fit      # every step of a sample of runner pages fits one phone screen at four sizes
npm run check:session  # a sitting is saved, continued, and cleared
npm run check:program  # first-try scoring, retests, On your own, the test gate, signals, the timed check
npm run check:a11y     # axe-core over every screen at two sizes, plus contrast, target, reflow, and spacing probes
npm run check:keys     # a keyboard walk of the runner and the app shell
npm run check:browser  # all of the browser checks above
```

The browser checks need Playwright with Chromium: `npm i -g playwright && npx playwright install chromium`. The manual checks (screen readers, zoom, an installed app offline) are listed in `docs/a11y-checklist.md`.

## How the curriculum is built

The lessons are not stored as files. They are generated at build time from the code in `curriculum/`, and the build stops if any lesson breaks a rule.

- `curriculum/tracks/prek.js`, `k.js`, `first.js`, `bridge.js` define the four levels. Each level is a list of **tracks**. A track is one skill taught across many lessons (counting aloud, reading numbers, adding facts, shapes). It lists its **units**, each with the lesson where it begins, and it supplies four kinds of content:
  - `newEx`: the new-teaching exercise for a unit, with a model ("My turn"), a lead ("Together"), and tests ("Your turn").
  - `reviewEx` (and optionally `firmEx`): firming and review exercises.
  - `testItems`: items for mastery tests, the placement test, and practice.
  - `worksheet`: items for the printable worksheet.
- `curriculum/lib/schedule.js` builds each lesson. A unit's first lesson gets new teaching, the next two lessons firm it, and after that the track returns for review at widening intervals. Warm-up tracks appear in every lesson. Lessons are filled to a minimum and capped at a maximum number of exercises.
- `curriculum/lib/tests.js` builds a mastery test after every tenth lesson, with a reteaching list for each part, and the placement test sections.
- `curriculum/lib/validate.js` checks every lesson, test, practice item, and worksheet. Among its rules: every new teaching has a model, a lead, and a test; every correction states the answer; no counting step shows a numeral; no reading step shows dots; no number is printed before the child is taught to read it; no exclamation marks or effusive praise; no track goes unreviewed for too long.
- `curriculum/lib/v.js` describes the pictures on the child's screen as plain data. `src/assets/js/visuals.js` draws them as SVG. The two must stay in step.

To change what a lesson teaches, edit the track's units or its exercise functions, then run `npm run check`.

## The site

- `src/levels/` generates the lesson, test, worksheet, level, and placement pages from `src/_data/program.js`, which calls the builder.
- `src/assets/js/lesson-engine.js` runs lessons, tests, the placement test, and practice.
- `src/assets/js/progress.js` keeps each child's records in the browser's localStorage. Nothing is sent to a server.
- `src/assets/js/dashboard.js` draws the teacher dashboard.
- `docs/curriculum-plan.md` is the evaluation and plan this version was built from.

## License

MIT
