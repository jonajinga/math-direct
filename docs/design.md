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
