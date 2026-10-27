# Writing a text for the library

The library holds public domain texts, cut into readings of about 200
words, for the reading levels from Reading 3 on. A text enters as a plain
text file under `curriculum/reading/library/raw/<slug>.txt`, and
`node scripts/ingest-text.mjs raw/<slug>.txt` turns it into the module
`curriculum/reading/library/<slug>.js` with the measures (words, sentences,
syllables, the share of words outside the Fry 1000, a grade, and a rung
from 1 to 12). Run `node scripts/ingest-text.mjs --check` after editing a
module by hand.

## The raw file

```
Title: The Lion and the Mouse, and Other Fables
Author: Aesop, retold
Year: 2026
Source: retold from the fables, which are in the public domain
License: public domain (the fables); this retelling is dedicated to the public domain (CC0)
Note: Five fables, one to a reading.

# The Lion and the Mouse

A lion lay asleep in the sun. A small mouse ran across his nose and woke
him. The lion caught the mouse under his great paw.

"Let me go," said the mouse. "Some day I may help you."

The lion laughed. How could a mouse help a lion? But he lifted his paw and
let the mouse go.

...

V: paw = the foot of an animal with claws
V: gnaw = to chew on something hard, a little at a time
Q: What woke the lion? | A mouse ran across his nose. | literal
Q: Why did the lion laugh at the mouse? | He did not think a mouse could help a lion. | inference
Q: What does gnaw mean? | To chew on something hard, a little at a time. | vocabulary
Q: What does the story teach? | A small friend can be a great help. | idea

# The Tortoise and the Hare

...
```

- The header is one field a line: Title, Author, Year, Source, License,
  Note. Then a blank line.
- A line beginning `# ` starts a reading and gives its title. A text with
  one reading needs no `# ` line. A reading is 150 to 230 words. A long
  tale is three to five readings, each ending where a reader could stop.
- Paragraphs are separated by a blank line. Dialogue is in double quotes.
  No exclamation marks anywhere: use a period. No dashes; use a comma or a
  period. No chapter numbers, no illustrations, no notes in the text.
- After a reading's paragraphs come its vocabulary and questions:
  - `V: word = meaning`: two or three words a reading that a child of
    seven or eight may not know. The meaning is a short phrase, not a
    sentence, so that "Gnaw means to chew on something hard" reads well:
    for a verb, "to ..."; for a noun, "a ..." or "the ..."; for an
    adjective, "very large" and the like. At most ten words.
  - `Q: question | answer | kind`: three to five questions, in this order
    of kinds: `literal` (the answer is in the text), `inference` (the
    answer must be worked out from the text), `vocabulary` (what a V word
    means, in that reading), `idea` (the main idea, the lesson, or what
    the reading is mostly about). At least one of each of literal,
    inference, and idea. The answer is one short sentence a parent can
    judge an answer against, eight to fourteen words, with a period.
- Sentences are 6 to 14 words long, most of them 8 to 11. Say things once,
  plainly, in the active voice; use the words a child knows, and the few
  new ones the V lines explain. A retelling keeps the story's shape and
  its lesson and leaves out cruelty that a modern child's book would leave
  out; nobody is killed or beaten on the page.
- A text's readings grow a little harder from the first to the last.

## Levels

The ingestion script gives each reading a grade and a rung. Reading 3
(about grade 2) takes texts of rung 3 to 9: a text for its first half aims
at grade 2 to 3 (rungs 3 to 5, sentences of 7 to 10 words, nearly every
word common), a text for its second half at grade 3 to 4 (rungs 5 to 8,
sentences of 9 to 12 words, a few long words a reading). The script's
`--all` prints each text's grade and rung as it writes the module.
