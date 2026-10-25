// Old addresses from the first version of Math Direct, sent to their
// nearest new page so bookmarks keep working.
const OLD_PRACTICE = [
  "addition-to-10", "addition-to-5", "addition-within-20", "adding-tens", "comparing-numbers", "counting-to-10",
  "counting-to-20", "doubles", "fact-families", "make-ten", "mixed-add-subtract", "number-bonds", "number-recognition",
  "one-more-one-less", "place-value", "plus-one", "regrouping-addition", "regrouping-subtraction", "subtraction-to-10",
  "subtraction-to-5", "subtraction-within-20", "two-digit-addition", "two-digit-plus-two-digit", "two-digit-subtraction",
  "word-problems",
];

const list = [
  { from: "/flashcards/", to: "/facts/" },
  { from: "/student/", to: "/teacher/" },
  { from: "/roadmap/", to: "/curriculum/" },
  { from: "/parent-guide/", to: "/guide/" },
];
for (let i = 1; i <= 7; i++) list.push({ from: `/phases/phase-${i}/`, to: "/curriculum/" });
for (let i = 1; i <= 150; i++) list.push({ from: `/lessons/lesson-${String(i).padStart(2, "0")}/`, to: "/lessons/" });
for (const slug of OLD_PRACTICE) list.push({ from: `/practice/${slug}/`, to: "/practice/" });

export default list;
