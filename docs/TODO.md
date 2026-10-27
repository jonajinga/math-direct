# To do

The outstanding work on Teach Direct, as of October 27, 2026. The plan
these items come from is summarized in `docs/design.md`; the standing
rules (no audio, no dark mode, every control at the bottom, nothing
printed, WCAG 2.2 AA, copy in the manner of Strunk and White, no
gamification, Direct Instruction density, two children) bind every item.

## State of the branches

- `main` is live. It holds Phases 1 to 4: the style system, every screen
  and string, the framework for grades 2 to 5 and four subjects, and
  Second Grade (150 math lessons, 16 tracks, a puzzle in every lesson).
- `best-in-class-5` holds the start of Phase 5: the library brief
  (`curriculum/reading/library/BRIEF.md`), 24 raw texts under
  `curriculum/reading/library/raw/` (three books of Aesop, twelve folk
  and fairy tales retold, six informational texts, about 78 readings with
  vocabulary and questions), the comprehension passages
  (`curriculum/reading/passages3.js`, 54 passages for nine skills), and
  the ingestion script (`scripts/ingest-text.mjs`). Nothing of Phase 5 is
  wired into the site yet.

## 1. Finish verifying Second Grade at the smallest size

The fit walk (`node scripts/check-fit.mjs --level second`) passes at
375x667, 667x375, and 740x360. At 320x568 the last full walk found 65
steps where a long column-work correction overflowed the panel in the
error state (lessons 76, 83, 85, 89, 91, 93 and the like). The
corrections in `curriculum/tracks/second/operations.js` were shortened
after that walk, but the walk at 320x568 was not re-run. Run
`npm run build`, then `node scripts/check-fit.mjs --level second --sizes
320x568`, shorten anything that still overflows, and re-run until clean.

## 2. Phase 5: Reading 3, sight words, and the library

In order; each depends on the one before.

1. **Sight words.** Write `curriculum/reading/sight-words.js`: `DOLCH`
   (prePrimer, primer, first, second, third; 220 words), `FRY` (1000
   words in order, by hundreds), `SKIP` (words not taught: gun, killed,
   death, died, dead, printed), and `BANDS` (band 1 = Dolch 220 with Fry
   1 to 100; band 2 = Fry 101 to 300; band 3 = 301 to 500; band 4 = 501 to
   700; band 5 = 701 to 1000; each band leaves out words in an earlier
   band). The ingestion script imports `FRY` from it. Add a self-check
   (1000 unique Fry words, 220 Dolch).
2. **Ingest the texts.** `node scripts/ingest-text.mjs --all` writes
   `curriculum/reading/library/<slug>.js` and `index.js` (ladder order);
   `--check` verifies them. Reading 3 needs rungs 3 to 5 in its first
   half and 5 to 8 in its second. If a text measures far from its aim,
   swap rare nouns for common ones in the raw file (names and nouns such
   as beanstalk count as outside the Fry 1000) and ingest again.
3. **The Reading 3 level** (`curriculum/tracks/reading3.js`): id
   `reading-3`, subject reading, "about seven", 120 lessons of 15 to 20
   minutes, prompts plain, no `readableText` rule, `testEvery` 10,
   `placementPoints` [1, 40, 80], `placementTracks` 4. Tracks:
   - Sight words, the warm-up: five new words a lesson from bands 1 and 2
     through lesson 88, then review; each test step is a whole-word token
     (`{ s, whole: true, sound: "word" }`) with a `sightWord` key, which
     the engine records like `sound`.
   - Long words by syllable type: compound, closed, open, silent e, vowel
     team, r-controlled, consonant-le, three syllables; tokens carry
     `syl: true` for a small gap, which `visuals.js` and `visuals.css`
     must add as `.mdv-tok--syl`; read the parts, then the word.
   - Word parts: un-, re-, dis-, pre-, mis-, -ful and -less, -ment,
     -ness, -tion, -able, -er and -est, -ly; read the part, then the
     word; say what the word means.
   - Vocabulary, from the readings' V lines: "What does X mean?" and a
     choice of three words for a spoken meaning.
   - Understanding, from `passages3.js`: each strategy taught model, lead,
     test, then passages reviewed.
   - Readings from the library: vocabulary first, the text by screens of
     up to five prose lines, then the questions; one re-read day; tests
     use literal questions with their page shown.
   - Timed readings every fifth lesson from the latest reading, pages as
     prose screens, the goal rising from 90 to 110 words a minute, three
     errors allowed; tests end with a passage part.
   - The validator must allow prose on checkout steps and in reading On
     your own items, and gain the above-grade-level rule: a reading's
     rung is at least 3, and at least 5 from lesson 61.
4. **Screens, engine, records, guide, checks.**
   - `/library/` (texts in ladder order with words, readings, grade, and
     what the child has read), `/library/<slug>/` (the readings as rows),
     `/library/<slug>/reading-<n>/` (a start card with Read it and Timed
     reading: the run is an ordered practice set; the timed reading is a
     checkout segment in practice mode that records words a minute
     against the text), `/quick-sight-words/` (twelve words from the
     bands taught so far, missed first, like Quick sounds).
   - Engine: record `st.sightWord` in `mark()` like `st.sound`; a
     checkout in practice mode (`DATA.checkout`) with its own finish;
     record a reading read (`P.recordReadingFor`) when a library run
     finishes; the checkout record carries `text` and `reading`.
   - Records: a sight-word chart by band with the words missed recently;
     readings read; timed readings naming the text.
   - Practice and More get rows for Quick sight words and the Library;
     `sw.js` precaches the new pages; `check-a11y`, `check-fit`,
     `check-lighthouse`, and `check-pwa` list them; `check-program` gets
     Reading 3 assertions (120 lessons, 12 tests ending with a passage,
     placement sections at 1, 40, 80, a library run recorded, a sight word
     recorded); `npm run check:all` runs `node scripts/ingest-text.mjs
     --check`. The reading guide gains Reading 3 and the library; README
     and `docs/design.md` gain the phase.
5. **Verify and merge.** `npm run check:all`, `check:browser` (with
   `check-fit --level reading-3`), `check:lighthouse`, the snapshot
   (`npm run check -- --snapshot` once the level is final), a contact
   sheet of the new screens for the owner; then commit on
   `best-in-class-5`, merge into `main` with `--no-ff` and the owner's
   authorship, push `main`, and start `best-in-class-6`.

## 3. The remaining phases

Each is a branch, the full checks, screenshots, and a merge to `main`.

- **Phase 6, Poetry**: 24 public domain poems as data, Poetry 1 (72
  lessons at two a week), the memorization script with fading, `/poems/`,
  recitation records, `check-poem`.
- **Phase 7, Science K to 1 and 2 to 3**: two levels of 72 lessons, facts
  and vocabulary, classification, cause and effect, one experiment a
  week, the diagrams.
- **Phase 8, Math grade 3**: multiplication and division, fractions, time,
  measurement, area and perimeter, puzzles.
- **Phase 9, Reading 4 and Science 4 to 5.**
- **Phase 10, Math grade 4.**
- **Phase 11, Math grade 5 and Reading 5 to 6.**

## 4. Owner-side items

- Register teachdirect.com and add the domains in Cloudflare.
- Set `NEW_HOST` and deploy the Open Phonics moved page.
- Rename the GitHub repository from `math-direct`.
- Allow gutenberg.org under the environment's Network access if texts are
  to be fetched rather than entered through the repository
  (https://code.claude.com/docs/en/cloud-environments#network-access).
