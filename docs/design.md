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
stage fits whatever the layout gives it. The child's screen shows pictures
only: a tap rings the touched part and locks the group, and the panel tells
the parent what was touched and whether it was right. The parent marks.

Fit steps, in order, when the panel's text does not fit: hide the meta
line; fold a waiting correction behind one line; step the boxes down to
14 px (the script never drops under 16 px); tighten the spacing; give the
panel part of the stage. The panel scrolls only after all of these.

Menus and confirmations are bottom sheets (`<dialog>`): More, Outline,
Keys, Switch child, Leave. A polite live region announces the cue and
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
