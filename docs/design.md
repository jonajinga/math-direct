# Design notes

## Palette and contrast

One light theme. Ratios are WCAG relative-luminance contrast against white
(`#ffffff`) and against the child's stage (`#fffdf6`). Text uses only
`--ink` and `--ink-2`; `--ink-3` is for icons.

| Token | Hex | On white | On stage | White on it |
|---|---|---|---|---|
| `--ink` | #14212b | 16.4 | 16.1 | |
| `--ink-2` | #3f4a57 | 9.0 | 8.9 | |
| `--ink-3` | #5f6b78 | 5.4 | 5.3 | |
| `--primary` | #0b4f8a | 8.4 | 8.3 | 8.4 |
| `--firm` | #166534 | 7.1 | 7.0 | 7.1 |
| `--error` | #991b1b | 8.3 | 8.2 | 8.3 |
| `--lead` | #5b21b6 | 9.0 | 8.8 | 9.0 |
| `--note` | #9a3412 | 7.3 | 7.2 | 7.3 |
| `--line-strong` | #6b7684 | 4.6 | 4.5 | |

Ink on the soft tints (`--primary-soft`, `--firm-soft`, `--error-soft`,
`--note-soft`) is 13:1 or better. Because `--primary`, `--firm`, and
`--error` are close in luminance, no state is carried by color alone: a
label, an icon, or a fixed place carries it.

## Rules

- Every control is at least 44 by 44 pixels (`--tap`).
- Nothing is cut short with an ellipsis; text wraps or folds behind a note.
- Navigation and actions sit at the bottom of the screen.
- No dark mode, no audio, no paper, no numeral writing.
- Copy follows Strunk and White: plain words, the active voice, no needless
  words, no exclamation marks.

## The runner

One screen, never scrolled while teaching. From the top: a one-line strip
(child, level, lesson, exercise) that shortens itself rather than clip, a
progress rail with one hatched segment per exercise with errors, the
child's stage, the teacher's panel, and a control bar with four fixed slots:
More, a tool (Show again or Clear marks), Error, and the primary action
(Next, Firm, Go on, or Finish). Buttons that share a slot toggle `hidden`,
so the primary button's box never moves between steps.

The stage is a size container; every picture is sized in `cqh` and `cqw`
of it, and every rem floor is capped by a share of the stage height, so the
stage fits whatever the layout gives it. Each choice cell is a width
container of its own, and a numeral inside one is also capped by the cell's
width (the renderer sets `--chars`, the widest item in characters), so a
three-digit choice shrinks in a narrow landscape stage instead of crossing
the cell's border. The child's screen shows pictures
only: a tap rings the touched part and locks the group, and the panel tells
the parent what was touched and whether it was right. The parent marks.

Fit steps, in order, when the panel's text does not fit: hide the meta
line; fold a waiting correction behind one line; step the boxes down to
14 px (the script never drops under 16 px); tighten the spacing; give the
panel part of the stage. The panel scrolls only after all of these.

Menus and confirmations are bottom sheets (`<dialog>`): More, Outline,
Keys, Switch child, Teach two children, Leave. A polite live region announces the cue and
script, the mark, the child's touch, and the end of a flash. `npm run
check:fit` walks every step of a sample of pages at 375x667, 667x375,
740x360, and 320x568 and fails on any overflow, clipped text, moved
primary button, or a tap that shows a verdict.

The sitting is saved to the browser after every move and mark (one per
child, kept twelve hours) and cleared when the lesson, test, or placement
finishes. Opening the same page again offers to continue; Today shows a
Continue card. Practice sets draw new items each time and are not saved.
`npm run check:session` marks three answers, leaves, returns, continues, and
finishes, and checks the sitting at each step.

## Scoring

The first try is what counts. A step's record keeps its first mark and its
last; a corrected answer stays an error in the lesson's totals and in the
repeat rule. After a correction the same item is asked again two items
later in the same exercise (counted apart as "Asked again"), and every item
missed on its first try returns once more in the delayed test at the end.
Most lessons end with On your own: three to eight items from firmed and
reviewed tracks, each answered by one touch, read once with no help and no
correction. Mastery test parts hold four to eight items drawn from every
step the part covers; a part passes with every item right, or one error in
five or more. Failed parts can be given again alone, and the record merges.
The next step stays on the latest due test until it is passed.
`npm run check:program` exercises all of this in a browser.

## The reading stage

A reading step shows letters instead of pictures: `V.sound`, `V.word`,
`V.words`, `V.line`, and `V.passage` in `curriculum/lib/v.js`, each a list of
lines of words, and each word a list of tokens (`T.l` a letter, `T.j` letters
joined for one sound, `T.m` a long vowel with its macron, `T.q` a silent
letter, `T.w` a word read whole, `T.p` punctuation; `stop: true` marks a stop
sound). The renderer (`R.text` in `src/assets/js/visuals.js`) draws the
tokens in the child font with the lesson alphabet's marks: a bar under a
joined pair, a line over a long vowel, a silent letter at about half size.
The visual's `prompts` stage fades them: `full`, then `light` (the joined
bars only), then `plain` print. The validator checks every text visual's
shape and stage.

Under a sound or a word runs the arrow: a ball, a rail, and a head, sized
from the rendered word, with a stop under every token that makes a sound.
`src/assets/js/dot.js` moves the dot. The parent presses and holds the Dot
button in the tool slot (or holds Space, or steps with D): on the press the
dot moves to the next stop and rests there while held; a release keeps it
there; a quick tap at the start sweeps the whole word; after the last stop
a press goes to the end of the arrow, and the next back to the start. A
`fast` step sweeps on every press; a `line` or passage has a stop under
each word and no arrow. A stop sound shows a tap. Every move is announced.
The signals for reading are hold, tap, and sweep, inferred from the visual
by `inferSignal` in `curriculum/lib/steps.js` unless a step names its own.
`/reading-sample/` is a hand-built lesson of every mode, listed nowhere and
recorded nowhere, that `npm run check:dot` and the fit and accessibility
checks walk.

## The reading program

Reading 1 (`curriculum/tracks/reading1.js`) is generated like the math
levels. Its data lives in `curriculum/reading/`: the sound sequence
(`sounds.js`, hand-written in the order of Engelmann's program, each sound
with how it is said, whether it is a stop sound, and its lesson), the word
list (`words.js`, converted from Open Phonics by
`scripts/convert-open-phonics.mjs`, each word with its sound groups and
whether it is read whole), the sentences the old lessons showed
(`sentences.js`, each placed at the first lesson where every word has been
taught), and the tokenizer (`tokens.js`) that lays a word's sound groups over
its spelling: joined pairs for one sound, a macron on a long vowel, a vowel
team as the marked vowel and a small silent letter, a doubled or silent
letter small, a soft c or g printed as it is, and the rest read whole.

The tracks follow the daily formats of the program: Sounds (every lesson: a
new sound every lesson or two, then a review of eight), Say it fast
(auditory blending, until lesson 45), Say the sounds (segmenting, from
lesson 9 to 50), Rhyming (10 to 55), Sounding out (a unit for each lesson
that brings new words), Reading the fast way (from lesson 20, every lesson),
Words read whole (the irregular words, as they arrive), and Sentences (from
lesson 11: first reading word by word, sounding out and saying each fast,
then the whole sentence the fast way). On your own, in reading, is a set of
words the child reads alone. The alphabet's stage comes from the level's
`prompts` schedule through `ctx.prompts`: full to lesson 74, light to 90,
plain after. The validator checks that every sound a word needs and every
word read whole has been taught by the lesson, and that each visual's stage
matches the lesson's.

Sounds are recorded like facts (`sounds` in the records store, automatic
under two seconds), shown on Records as a sound chart in teaching order, and
reviewed in Quick sounds (`/quick-sounds/`), which brings missed sounds up
first. Mastery tests and practice sets come from the tracks' `testItems` as
for math.

### Stories

The thirty stories (`curriculum/reading/stories.js`, converted from Open
Phonics: title, lines, questions, and nothing else) are placed by their
words: a story comes two lessons after the last of its sounds and whole
words is taught, and no two stories share a lesson. Thirteen fall within
Reading 1; the rest wait for Reading 2 and are listed under it. A story's
new day (the Stories track, `newEx`) reads the five words from it least
practiced, then the title, then each line with the dot under each word,
sounding out and saying it fast, and ends with the questions over the whole
story on the stage. The next two lessons read it again the fast way with
questions; later reviews take three lines and a question. A line is a
sentence; a sentence of more than twelve words is broken at a comma in the
conversion, and the validator refuses a longer line.

The library at `/stories/` lists every story with its word count and the
lesson it becomes readable at, marks the ones the selected child can read
now, and opens each as an ordered practice set at `/stories/<slug>/`: the
title and the lines the fast way, then the questions. The old Open Phonics
addresses are the same.

### Checkouts

From lesson 40, every fifth lesson ends with a checkout (the Checkouts
track, an exercise of `kind: "checkout"`): a passage the child reads alone
while the clock runs. The passage is the story of a recent lesson when there
is one, or else sentences read lately, about as many words as the goal.
The goal rises from 24 words a minute at lesson 40 to 60 at lesson 100,
with two errors or fewer (`checkoutGoal` in `reading1.js`; the numbers are
parameters to set from real sittings). In the runner the segment's primary
button reads Start, then Next for each line, then Stop; Error counts a word
missed and the strip shows the clock. The result is read out, recorded with
`recordCheckout` (`{ date, level, lesson, words, seconds, errors, wpm, goal,
allowed, met }`, the last forty kept), shown on the finish screen, and
listed on Records. With two children, each reads the passage in turn and
each gets a record.

### Tests and placement

A reading mastery test takes its parts from the tracks the level names
(`testTracks`: sounds, sounding out, the fast way, words read whole,
sentences, stories), with the same item counts, allowed errors, and
remedies as math. From the test after lesson 50, a last part is a passage
read alone (`testPassage`): the story of a recent lesson or sentences read
lately, run as a checkout against the lesson's goal. The part is passed
when the goal is met with two errors or fewer; its remedy is the story in
the library, or the sentences practice. The result is kept with the test
(`wpm` and `goal` on the part) and as a checkout record.

The placement test is built per subject (`program.placements.reading`,
`program.placements.math`) and runs at `/placement/reading/` and
`/placement/math/`. The reading test begins with a readiness section (say
a sound after the parent, say a word fast from its parts), then a section
for each span of twenty lessons, four tracks and three items each; the
rules for passing, going back, and naming the lesson to begin with are the
math test's. The record goes to the reading placement alone, and the test
gate, the next-step logic, and Today read it by subject.

## Two children

A lesson can be taught to two children at once: the runner's More sheet
offers "Teach two children", which reopens the lesson with `?with=<childId>`
for the second child (the active child is the first). Every step is then
answered in unison and marked once for both. When the last test step of an
exercise has been marked, the engine inserts one turn for each child, the
child with more errors so far first: a clone of the item the pair missed in
that exercise, or else of the exercise's last item. A turn step carries
`forChild`, and its uid is the source step's uid plus `:c<childId>`; the cue
reads "<Name> alone". A turn that is missed is corrected and asked again
like any other step, for that child. On your own items are shared out, one
child at a time. Tallies, item results, facts, and the lesson summary are
computed for each child from the unison steps plus that child's own, and
recorded with `recordLessonFor`, `recordItemsFor`, and `recordFactFor`; the
summary carries `group`, `with`, and `turns`. The finish screen shows a card
for each child with its own advice and mark row. The saved sitting keeps the
pair (its url carries `?with=`), Today's Continue card restores it, and the
"Next" link on the finish screen carries the pair to the next lesson. Tests,
placement, and practice stay one child at a time. "Teach one child" in the
More sheet drops the marks and starts the lesson over for the child picked.
`npm run check:program` teaches a lesson to two children and checks the
turns, the restored sitting, and both records.

## Program depth

Lessons are denser than before: six to nine exercises, five or six review
items each, and thirty to fifty answers a lesson. The estimate is twelve
seconds an answer, so the claimed minutes (Pre-K 8 to 12, Kindergarten and
First Grade 12 to 15) come from that estimate until real sittings
calibrate it; the validator warns on lessons outside the band and on fewer
than three answers a minute. The finish screen shows the pace of a sitting
in answers a minute, and the summary keeps it.

A firming format fades over three lessons: the day after new teaching the
lead returns before the tests, the next day one brief lead, then tests
only. Every test step carries a signal (touch, drop, rhythm, or watch),
shown beside the step count and taught in the guide with a drawing; story
problems add three seconds of think time.

Every review exercise carries spare items. At the start of a lesson the
runner puts a spare item the child missed in a recent sitting in place of
one that is firm, moves items missed recently to the front with the note
"Missed last time", and, when a lesson is taught again, swaps in fresh
items for the ones still firm.

First Grade facts are released six to a set, one set a lesson from the
lesson a strategy begins, and the daily drill mixes the newest set with
facts already known. Each fact keeps its last five response times; a fact
is automatic when its last three answers were right and under three
seconds. The timed check gives one minute of released facts, marks at
once, and records facts right against a goal that rises with the sets
released.

Pre-K begins with a readiness track (say what I say, answer on the signal,
touch the one I name) over its first three lessons, and the placement test
opens with a readiness section that a child who fails the first Pre-K
section is given. Every other placement section has three items a track.
