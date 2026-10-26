# Teach Direct

Free, scripted Direct Instruction lessons a parent teaches from a phone. The math program covers Pre-K, Kindergarten, and First Grade, with an optional bridge to second grade. The reading program, moved from Open Phonics, covers Reading 1 and Reading 2 on the same design, with a teaching guide at `/guide/reading/`, the sounds at `/sounds/`, the word list at `/words/`, and the stories at `/stories/`. A parent or teacher reads the script; the child answers; the parent marks each answer Firm or Error. There are no games, points, or prizes.

The app was called Math Direct until the reading program joined it; its records in a browser are kept under the old name, and a Math Direct or Open Phonics backup loads into it.

## Addresses and the move

The site is deployed from `main` by Cloudflare Pages. It is meant to serve three addresses from one build: `teachdirect.com` (the primary address, once registered and added to the Pages project), `mathdirect.com`, and `openphonics.com`. The old addresses are kept as extra domains rather than redirects, since each keeps its own records in the browser. When the new domain is live, set `NEW_HOST=teachdirect.com` in the Pages build settings: Today on an old domain then shows a card with the new address and the advice to save a backup and load it there. `docs/open-phonics-moved/index.html` is the one page openphonics.com should serve before it switches to this build: it lets a parent save the Open Phonics records as a backup that this app loads.

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
npm run check:all      # the curriculum, a clean build, the PWA files, the copy rules, and the style guide
npm run check:style    # the stylesheets, templates, and icons keep to the tokens (also run by check:all)
npm run check:fit      # every step of a sample of runner pages fits one phone screen at four sizes
npm run check:session  # a sitting is saved, continued, and cleared
npm run check:program  # first-try scoring, retests, On your own, the test gate, signals, the timed check, two children
npm run check:a11y     # axe-core over every screen at two sizes, plus contrast, target, reflow, and spacing probes
npm run check:keys     # a keyboard walk of the runner and the app shell
npm run check:import   # records from version 4 and from Open Phonics load into the store
npm run check:hint     # every new picture draws, and a puzzle's hints come one at a time and are recorded
npm run check:browser  # all of the browser checks above
```

The browser checks need Playwright with Chromium: `npm i -g playwright && npx playwright install chromium`. The manual checks (screen readers, zoom, an installed app offline) are listed in `docs/a11y-checklist.md`.

## How the curriculum is built

The lessons are not stored as files. They are generated at build time from the code in `curriculum/`, and the build stops if any lesson breaks a rule.

- `curriculum/tracks/reading1.js` and `reading2.js` define the two reading levels, from the data in `curriculum/reading/` (the sound sequence, the word list, the sentences, the thirty stories with their questions, and the tokenizer that draws words in the child's alphabet). Its tracks include the stories, read line by line and then the fast way, and the checkouts from lesson 40: a passage read alone against the clock, kept as words a minute. Its mastery tests end with such a passage from lesson 50, and its placement test (`/placement/reading/`) begins with a readiness section. `curriculum/tracks/prek.js`, `k.js`, `first.js`, `bridge.js` define the four math levels. Each level is a list of **tracks**. A track is one skill taught across many lessons (counting aloud, reading numbers, adding facts, shapes). It lists its **units**, each with the lesson where it begins, and it supplies four kinds of content:
  - `newEx`: the new-teaching exercise for a unit, with a model ("My turn"), a lead ("Together"), and tests ("Your turn").
  - `reviewEx` (and optionally `firmEx`): firming and review exercises.
  - `testItems`: items for mastery tests, the placement test, practice, the spare items of review exercises, and the On your own segment.
- `curriculum/lib/schedule.js` builds each lesson. A unit's first lesson gets new teaching; the next three lessons firm it, with the lead fading out over those days; after that the track returns for review at widening intervals. Warm-up tracks appear in every lesson. Lessons are filled to a minimum and capped at a maximum number of exercises, and most end with an On your own segment of three to eight items answered by one touch.
- `curriculum/lib/tests.js` builds a mastery test after every tenth lesson (four to eight items a part, drawn from every unit the part covers, with a reteaching list that opens the exercise) and the placement test sections, beginning with a readiness section.
- `curriculum/lib/validate.js` checks every lesson, test, practice item, spare item, and On your own item. Among its rules: every new teaching has a model, a lead, and a test; every correction states the answer; no counting step shows a numeral; no reading step shows dots; no number is printed before the child is taught to read it; no exclamation marks or effusive praise; no track goes unreviewed for too long; every On your own item is answered by one touch. It warns on lessons outside their level's band of minutes or under three answers a minute.
- `curriculum/lib/v.js` describes the pictures on the child's screen as plain data. `src/assets/js/visuals.js` draws them as SVG. The two must stay in step.

To change what a lesson teaches, edit the track's units or its exercise functions, then run `npm run check`.

## The site

The site is an app for a phone held in one hand: five tabs at the bottom (Today, Lessons, Practice, Records, More), every control at the bottom, one light theme, no audio, no paper. The runner fills one screen and never scrolls while teaching. `docs/design.md` holds the palette, the rules, and the design of the runner, the scoring, and the program's depth.

- `src/levels/` generates the lesson, test, level, and placement pages from `src/_data/program.js`, which calls the builder.
- `src/assets/js/lesson-engine.js` runs lessons, tests, the placement test, practice, fact review, and the timed check. It scores the first try, asks a missed item again two items later, saves the sitting after every move, and adapts review to items missed recently. A lesson can be taught to two children at once: they answer together, each takes a turn alone at the end of every exercise, and each child's record stays their own.
- `src/assets/js/progress.js` keeps each child's records in the browser's localStorage: lessons, tests by part, facts with response times, per-item results, timed checks, notes, and the saved sitting. Nothing is sent to a server.
- `src/assets/js/records.js` draws the Records screen; `today.js` the Today screen; `lessons-index.js` the level screens and the mark sheet; `app.js` the sheets, toasts, and install prompt.
- `docs/curriculum-plan.md` is the evaluation and plan the program was built from; `docs/a11y-checklist.md` lists the accessibility checks done by hand.

## License

MIT
