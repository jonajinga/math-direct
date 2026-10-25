// Old addresses, sent to their nearest new screen so bookmarks keep working.
import { buildProgram } from "../../curriculum/index.js";

const OLD_PRACTICE = [
  "addition-to-10", "addition-to-5", "addition-within-20", "adding-tens", "comparing-numbers", "counting-to-10",
  "counting-to-20", "doubles", "fact-families", "make-ten", "mixed-add-subtract", "number-bonds", "number-recognition",
  "one-more-one-less", "place-value", "plus-one", "regrouping-addition", "regrouping-subtraction", "subtraction-to-10",
  "subtraction-to-5", "subtraction-within-20", "two-digit-addition", "two-digit-plus-two-digit", "two-digit-subtraction",
  "word-problems",
];

const list = [
  { from: "/flashcards/", to: "/facts/" },
  { from: "/student/", to: "/records/" },
  { from: "/teacher/", to: "/records/" },
  { from: "/roadmap/", to: "/curriculum/" },
  { from: "/parent-guide/", to: "/guide/" },
  { from: "/features/", to: "/about/" },
  { from: "/support/", to: "/about/" },
  { from: "/contact/", to: "/about/" },
  { from: "/changelog/", to: "/about/" },
  { from: "/style-guide/", to: "/" },
  { from: "/materials/", to: "/more/" },
];
for (let i = 1; i <= 7; i++) list.push({ from: `/phases/phase-${i}/`, to: "/curriculum/" });
for (let i = 1; i <= 150; i++) list.push({ from: `/lessons/lesson-${String(i).padStart(2, "0")}/`, to: "/lessons/" });
for (const slug of OLD_PRACTICE) list.push({ from: `/practice/${slug}/`, to: "/practice/" });
// Every lesson once had a worksheet address; it now opens the lesson.
for (const lesson of buildProgram({ strict: false }).lessons) list.push({ from: `${lesson.url}worksheet/`, to: lesson.url });

export default list;
