# Accessibility checklist

Target: WCAG 2.2 AA on every screen, plus 1.4.6 (7:1 for body and script
text), 2.5.5 (44 by 44 px targets), and 2.4.9 (link purpose from the link
text alone).

## Checked by scripts

Run after `npm run build`:

- `npm run check:a11y`: axe-core over every kind of screen at 390x844 and
  320x568, in the runner's states and with a child's records in place; every
  text node at 7:1 against its background (4.5:1 for large text); every
  control at least 44 by 44 px; no sideways overflow except inside the fact
  chart's own region; no clipped text under 200% text spacing.
- `npm run check:keys`: Tab reaches More within three presses; the bar is
  walked in order; F, X, Enter, O, ?, B, M, and Escape do what the Keys
  sheet says; sheets trap focus, close on Escape, and return focus to their
  opener; on an app screen the skip links come first and the tab bar last;
  every control shows a focus ring.
- `npm run check:fit`: nothing in the runner overflows, is clipped, or drops
  under 16 px at 375x667, 667x375, 740x360, and 320x568; the primary button
  never moves; a child's touch never shows a verdict.

## Checked by hand

Do these on a phone before a release, and note the date and the result at
the bottom of this file.

1. **VoiceOver (iOS) through a lesson.** Open a lesson. Swipe through the
   strip, the stage's description ("The child's screen shows..."), the cue,
   the script, the boxes, and the four controls. Mark Firm, mark Error, go
   on. The live region should announce each step's cue and script, each
   mark, a child's touch, and "The dots are hidden" after a flash. Open More,
   Outline, Keys, and Leave; each should trap focus and return it.
2. **TalkBack (Android) through the same lesson.** The same checks.
3. **200% zoom** (browser text size at 200%). Today, Lessons, a level, the
   runner, Records, More. Nothing should be cut off; the runner's panel may
   scroll as a last resort.
4. **Landscape.** A lesson on a phone held sideways: stage left, panel
   right, bar under the panel; the primary button under the right thumb.
5. **Reduce Motion on.** Sheets should appear without sliding.
6. **One hand.** Teach three exercises holding the phone in one hand. Every
   control should be reachable with the thumb and nothing should need a
   second hand but the child's touch.
7. **Installed app, offline.** Install from the More screen, turn on
   airplane mode, open the app. Today, a taught lesson, and the fonts
   should all work.

## Results

| Date | Device | Checks | Result |
|---|---|---|---|
| | | | |
