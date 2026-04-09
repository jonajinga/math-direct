/**
 * Math Direct — Lesson Generator
 *
 * Generates all 150 lessons following Direct Instruction methodology:
 * - ~10% new material, ~90% review
 * - 18-22 steps per lesson
 * - Sections: warm-up review → recent review → new material (model-lead-test) → guided practice → mixed practice → firm-up
 * - Cumulative review: previously learned material cycles back regularly
 */

// ─── Helpers ───

function num(n) { return `<span class='math-num'>${n}</span>`; }
function sym(s) { return `<span class='math-symbol'>${s}</span>`; }
function dots(text) { return `<span class='math-dots'>${text}</span>`; }
function q() { return `<span class='math-symbol-question'>?</span>`; }

function shuffle(arr, seed) {
  // Simple deterministic shuffle for reproducibility
  const a = arr.slice();
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, count, seed) {
  return shuffle(arr, seed).slice(0, count);
}

const numberWords = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];

function word(n) { return numberWords[n] || String(n); }
function cap(s) { if (!s) return s; return s.charAt(0).toUpperCase() + s.slice(1); }
function Word(n) { return cap(word(n)); }

// ─── Step builders ───

function showStep(display, visual, say, doText, praise, correct, extra) {
  const step = {
    display, visual: visual || "none", action: "show",
    say, do: doText, praise, correct
  };
  if (extra) Object.assign(step, extra);
  return step;
}

function countStep(display, dotCount, say, doText, praise, correct) {
  return {
    display, visual: "dots", dotCount, action: "count",
    say, do: doText, praise, correct
  };
}

function dotsStep(n, say, doText, praise, correct) {
  return showStep(num(n), "dots", say, doText, praise, correct, { dotCount: n });
}

function identifyStep(n, say, praise, correct) {
  return showStep(num(n), "dots", say || "What number is this?", "Wait.", praise || `${Word(n)}!`, correct || `That's ${word(n)}.`, { dotCount: n > 0 ? n : undefined });
}

function addStep(a, b, visual, say, praise, correct) {
  const ans = a + b;
  const display = `${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${q()}`;
  return showStep(display, visual || "dots",
    say || `${Word(a)} plus ${word(b)}?`, "Wait.",
    praise || `${Word(ans)}!`,
    correct || `${Word(a)} plus ${word(b)} is ${word(ans)}.`,
    { dotCount: ans, answer: ans });
}

function subStep(a, b, visual, say, praise, correct) {
  const ans = a - b;
  const display = `${num(a)} ${sym('−')} ${num(b)} ${sym('=')} ${q()}`;
  return showStep(display, visual || "dots",
    say || `${Word(a)} minus ${word(b)}?`, "Wait.",
    praise || `${Word(ans)}!`,
    correct || `${Word(a)} minus ${word(b)} is ${word(ans)}.`,
    { dotCount: a, answer: ans });
}

function compareStep(a, b) {
  const answer = a > b ? ">" : a < b ? "<" : "=";
  const display = `${num(a)} ${q()} ${num(b)}`;
  return showStep(display, "compare",
    `Which is bigger: ${word(a)} or ${word(b)}? Is ${a} greater than, less than, or equal to ${b}?`,
    "Wait for the child to choose.",
    `Yes! ${a} ${answer === ">" ? "is greater than" : answer === "<" ? "is less than" : "equals"} ${b}.`,
    `${a} ${answer === ">" ? "is greater than" : answer === "<" ? "is less than" : "equals"} ${b}. The answer is ${answer}.`,
    { compareAnswer: answer });
}

function numberLineStep(target, start, end) {
  return showStep(num(target), "numberline",
    `Find ${word(target)} on the number line.`, "Point to the number.",
    `${Word(target)}!`,
    `${Word(target)} is right here.`,
    { nlStart: start || 0, nlEnd: end || 10, nlHighlight: target });
}

// ─── Phase 1: Foundation (Lessons 1-20) ───
// Numbers 0-10, counting, comparing

function generatePhase1() {
  const lessons = [];

  // Lesson 1: Introduce 0 and 1
  lessons.push({
    id: 1, title: "Lesson 1", target: "0, 1", phase: 1,
    steps: [
      // New: Introduce 0
      showStep(num(0), "none", "This is the number zero. Zero means nothing — no objects, no dots, nothing at all. Say 'zero'.", "Point to the number on screen.", "Good! Zero means nothing!", "This is zero. It means nothing. Say 'zero'."),
      showStep(num(0), "none", "How many dots do you see? Zero. There are no dots. Zero means none.", "Gesture at the empty space.", "That's right — zero dots!", "There are no dots. That's zero."),
      showStep(num(0), "none", "What number is this?", "Wait.", "Zero!", "This is zero. Zero means nothing."),
      // New: Introduce 1
      countStep(num(1), 1, "This is the number one. One means this many. Count the dot: one.", "Point to the dot, then the number.", "Yes! One dot. One!", "This is one. Count the dot: one. Say 'one'."),
      dotsStep(1, "Your turn. How many dots?", "Wait.", "One! Great job!", "One dot. Say 'one'."),
      identifyStep(1, "What number is this?", "One!", "This is one."),
      // Guided practice
      showStep(num(0), "none", "What number is this?", "Wait.", "Zero!", "This is zero."),
      dotsStep(1, "What number is this?", "Wait.", "One!", "This is one. One dot."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(1, "How many dots?", "Wait.", "One!", "One dot."),
      // Mixed practice
      showStep(`${num(0)} &nbsp;&nbsp; ${num(1)}`, "none", "Point to zero.", "Wait for the child to point.", "Good! That's zero!", "This is zero."),
      showStep(`${num(0)} &nbsp;&nbsp; ${num(1)}`, "none", "Point to one.", "Wait for the child to point.", "Good! That's one!", "This is one."),
      showStep(`${num(1)} &nbsp;&nbsp; ${num(0)}`, "none", "Point to zero.", "Wait.", "Right! Zero!", "This is zero. It means nothing."),
      showStep(`${num(1)} &nbsp;&nbsp; ${num(0)}`, "none", "Point to one.", "Wait.", "Right! One!", "This is one."),
      // Firm-up
      dotsStep(1, "Last one. How many dots?", "Wait.", "One! You know your numbers!", "One dot. One."),
      showStep(num(0), "none", "And this number?", "Wait.", "Zero! Great lesson!", "Zero. Zero means nothing."),
    ]
  });

  // Lesson 2: Introduce 2
  lessons.push({
    id: 2, title: "Lesson 2", target: "2", phase: 1,
    steps: [
      // Warm-up review (0, 1)
      showStep(num(0), "none", "What number is this?", "Wait.", "Zero!", "Zero."),
      dotsStep(1, "How many dots?", "Wait.", "One!", "One dot."),
      showStep(num(1), "none", "What number?", "Wait.", "One!", "One."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero means nothing."),
      // New: Introduce 2
      countStep(num(2), 2, "New number! This is two. Count with me: one, two.", "Point to each dot.", "Two!", "Count: one, two. Two."),
      countStep(num(2), 2, "Your turn. Count the dots.", "Wait for the child to count.", "One, two. Two!", "One, two. There are two dots."),
      dotsStep(2, "How many dots?", "Wait.", "Two!", "Two dots. Two."),
      // Guided practice
      identifyStep(2, "What number is this?", "Two!", "This is two."),
      dotsStep(2, "How many dots? Don't count — just look and say the number.", "Wait.", "Two! Quick!", "Two."),
      // Mixed practice (0, 1, 2)
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(1, "How many dots?", "Wait.", "One!", "One."),
      dotsStep(2, "How many dots?", "Wait.", "Two!", "Two."),
      showStep(num(1), "none", "What number?", "Wait.", "One!", "One."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      showStep(`${num(0)} &nbsp; ${num(1)} &nbsp; ${num(2)}`, "none", "Say the numbers in order.", "Point to each.", "Zero, one, two!", "Zero, one, two."),
      // Firm-up
      dotsStep(2, "Last one. How many dots?", "Wait.", "Two! Great work!", "Two."),
    ]
  });

  // Lesson 3: Introduce 3
  lessons.push({
    id: 3, title: "Lesson 3", target: "3", phase: 1,
    steps: [
      // Warm-up review
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(1, "How many dots?", "Wait.", "One!", "One."),
      dotsStep(2, "How many dots?", "Wait.", "Two!", "Two."),
      showStep(num(2), "none", "What number?", "Wait.", "Two!", "Two."),
      // New: Introduce 3
      countStep(num(3), 3, "New number! This is three. Count: one, two, three.", "Point to each dot.", "Three!", "One, two, three. Three."),
      countStep(num(3), 3, "Count the dots.", "Wait for the child.", "One, two, three. Three!", "One, two, three. Three."),
      dotsStep(3, "How many dots?", "Wait.", "Three!", "Three dots."),
      // Guided practice
      identifyStep(3, "What number is this?", "Three!", "Three."),
      dotsStep(3, "How many? Quick!", "Wait.", "Three!", "Three."),
      // Mixed practice (0, 1, 2, 3)
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      showStep(`${num(0)} &nbsp; ${num(1)} &nbsp; ${num(2)} &nbsp; ${num(3)}`, "none", "Count in order: zero, one, two, three.", "Point to each.", "Zero, one, two, three!", "Zero, one, two, three."),
      // Firm-up
      dotsStep(3, "How many dots?", "Wait.", "Three! Excellent!", "Three."),
      dotsStep(2, "And this one?", "Wait.", "Two!", "Two."),
    ]
  });

  // Lesson 4: Introduce equals (=)
  lessons.push({
    id: 4, title: "Lesson 4", target: "equals (=)", phase: 1,
    steps: [
      // Warm-up
      dotsStep(1, "How many dots?", "Wait.", "One!", "One."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      // New: Introduce =
      showStep(`${num(2)} ${sym('=')} ${dots('• •')}`, "equation", "This is a new symbol. It's called 'equals'. It means 'is the same as'. Two equals two dots. They are the same amount.", "Point to the = sign, then from the number to the dots.", "That's right — two and two dots are the same!", "This means 'equals' — is the same as."),
      showStep(`${num(3)} ${sym('=')} ${dots('• • •')}`, "equation", "Three equals three dots. They are the same.", "Point to number, equals, dots.", "Three equals three dots!", "Three equals three dots."),
      showStep(sym('='), "none", "What does this symbol mean?", "Point to the = sign. Wait.", "Equals! Is the same as!", "This is the equals sign. It means 'is the same as'."),
      // Guided practice
      showStep(`${num(1)} ${sym('=')} ${dots('•')}`, "equation", "What does this say?", "Wait.", "One equals one dot!", "One equals one dot."),
      showStep(`${num(3)} ${sym('=')} ${dots('• • •')}`, "equation", "Read this.", "Wait.", "Three equals three dots!", "Three equals three dots."),
      showStep(`${num(2)} ${sym('=')} ${dots('• •')}`, "equation", "Read this.", "Wait.", "Two equals two dots!", "Two equals two dots."),
      // Mixed practice
      dotsStep(3, "How many dots?", "Wait.", "Three!", "Three."),
      showStep(num(1), "none", "What number?", "Wait.", "One!", "One."),
      showStep(`${num(1)} ${sym('=')} ${dots('•')}`, "equation", "Read this.", "Wait.", "One equals one dot!", "One equals one dot."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      showStep(sym('='), "none", "What does this mean?", "Wait.", "Equals!", "Equals. Is the same as."),
      // Firm-up
      showStep(`${num(3)} ${sym('=')} ${dots('• • •')}`, "equation", "Last one. Read this.", "Wait.", "Three equals three dots! Great job!", "Three equals three dots."),
      dotsStep(1, "How many dots?", "Wait.", "One!", "One."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero! Perfect!", "Zero."),
    ]
  });

  // Lesson 5: Introduce 4
  lessons.push({
    id: 5, title: "Lesson 5", target: "4", phase: 1,
    steps: [
      // Warm-up (0-3, =)
      dotsStep(2, "How many dots?", "Wait.", "Two!", "Two."),
      showStep(num(3), "dots", "What number?", "Wait.", "Three!", "Three.", { dotCount: 3 }),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      showStep(sym('='), "none", "What does this symbol mean?", "Wait.", "Equals!", "Equals. Is the same as."),
      // New: 4
      countStep(num(4), 4, "New number! This is four. Count: one, two, three, four.", "Point to each dot.", "Four!", "One, two, three, four. Four."),
      countStep(num(4), 4, "Count the dots.", "Wait.", "One, two, three, four!", "Four dots."),
      dotsStep(4, "How many dots?", "Wait.", "Four!", "Four."),
      // Guided
      identifyStep(4, "What number?", "Four!", "Four."),
      showStep(`${num(4)} ${sym('=')} ${dots('•• ••')}`, "equation", "Four equals four dots.", "Point.", "Four equals four dots!", "Four equals four dots."),
      // Mixed (0-4)
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      showStep(num(2), "dots", "What number?", "Wait.", "Two!", "Two.", { dotCount: 2 }),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      showStep(`${num(0)} &nbsp; ${num(1)} &nbsp; ${num(2)} &nbsp; ${num(3)} &nbsp; ${num(4)}`, "none", "Count in order.", "Point to each.", "Zero, one, two, three, four!", "Zero, one, two, three, four."),
      // Firm-up
      dotsStep(4, "How many dots?", "Wait.", "Four! Excellent!", "Four."),
    ]
  });

  // Lesson 6: Review 0-4
  lessons.push({
    id: 6, title: "Lesson 6", target: "Review 0-4", phase: 1,
    steps: [
      dotsStep(3, "How many dots?", "Wait.", "Three!", "Three."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      showStep(`${num(2)} ${sym('=')} ${dots('• •')}`, "equation", "Read this.", "Wait.", "Two equals two dots!", "Two equals two dots."),
      showStep(`${num(4)} ${sym('=')} ${dots('•• ••')}`, "equation", "Read this.", "Wait.", "Four equals four dots!", "Four equals four dots."),
      dotsStep(4, "How many dots? Quick!", "Wait.", "Four!", "Four."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      showStep(num(2), "dots", "What number?", "Wait.", "Two!", "Two.", { dotCount: 2 }),
      showStep(num(4), "dots", "What number?", "Wait.", "Four!", "Four.", { dotCount: 4 }),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      showStep(`${num(0)} &nbsp; ${num(1)} &nbsp; ${num(2)} &nbsp; ${num(3)} &nbsp; ${num(4)}`, "none", "Count forward: zero to four.", "Point to each.", "Zero, one, two, three, four!", "Zero, one, two, three, four."),
      showStep(`${num(4)} &nbsp; ${num(3)} &nbsp; ${num(2)} &nbsp; ${num(1)} &nbsp; ${num(0)}`, "none", "Now count backward: four to zero.", "Point to each.", "Four, three, two, one, zero!", "Four, three, two, one, zero."),
    ]
  });

  // Lesson 7: Introduce 5
  lessons.push({
    id: 7, title: "Lesson 7", target: "5", phase: 1,
    steps: [
      // Warm-up
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      showStep(num(1), "dots", "What number?", "Wait.", "One!", "One.", { dotCount: 1 }),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      // New: 5
      countStep(num(5), 5, "New number! This is five. Count: one, two, three, four, five. Five fills a whole row of dots!", "Point to each dot.", "Five!", "One, two, three, four, five. Five."),
      countStep(num(5), 5, "Count the dots.", "Wait.", "One, two, three, four, five!", "Five dots."),
      dotsStep(5, "How many dots?", "Wait.", "Five!", "Five! A full row."),
      // Guided
      identifyStep(5, "What number?", "Five!", "Five."),
      dotsStep(5, "How many dots? Quick!", "Wait.", "Five!", "Five."),
      // Mixed (0-5)
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      showStep(`${num(0)} &nbsp; ${num(1)} &nbsp; ${num(2)} &nbsp; ${num(3)} &nbsp; ${num(4)} &nbsp; ${num(5)}`, "none", "Count: zero to five.", "Point to each.", "Zero, one, two, three, four, five!", "Zero, one, two, three, four, five."),
      // Firm-up
      dotsStep(5, "How many dots?", "Wait.", "Five! Wonderful!", "Five."),
    ]
  });

  // Lesson 8: Review 0-5
  lessons.push({
    id: 8, title: "Lesson 8", target: "Review 0-5", phase: 1,
    steps: [
      dotsStep(5, "How many dots?", "Wait.", "Five!", "Five."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      showStep(`${num(3)} ${sym('=')} ${dots('• • •')}`, "equation", "Read this.", "Wait.", "Three equals three dots!", "Three equals three dots."),
      showStep(`${num(5)} ${sym('=')} ${dots('••• ••')}`, "equation", "Read this.", "Wait.", "Five equals five dots!", "Five equals five dots."),
      dotsStep(5, "How many dots? Quick!", "Wait.", "Five!", "Five."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      showStep(num(5), "dots", "What number?", "Wait.", "Five!", "Five.", { dotCount: 5 }),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      showStep(`${num(5)} &nbsp; ${num(4)} &nbsp; ${num(3)} &nbsp; ${num(2)} &nbsp; ${num(1)} &nbsp; ${num(0)}`, "none", "Count backward: five to zero.", "Point to each.", "Five, four, three, two, one, zero!", "Five, four, three, two, one, zero."),
      dotsStep(3, "How many?", "Wait.", "Three! Nice work!", "Three."),
    ]
  });

  // Lesson 9: Introduce 6
  lessons.push({
    id: 9, title: "Lesson 9", target: "6", phase: 1,
    steps: [
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      countStep(num(6), 6, "New number! This is six. Count: one, two, three, four, five, six. That's five in one row and one more!", "Point to each dot.", "Six!", "One, two, three, four, five, six."),
      countStep(num(6), 6, "Count the dots.", "Wait.", "Six!", "Six dots."),
      dotsStep(6, "How many dots?", "Wait.", "Six!", "Six."),
      identifyStep(6, "What number?", "Six!", "Six."),
      dotsStep(6, "How many? Quick!", "Wait.", "Six!", "Six."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      dotsStep(6, "How many?", "Wait.", "Six!", "Six."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(6, "How many?", "Wait.", "Six!", "Six."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      dotsStep(6, "How many dots?", "Wait.", "Six! Great!", "Six."),
    ]
  });

  // Lesson 10: Review 0-6
  lessons.push({
    id: 10, title: "Lesson 10", target: "Review 0-6", phase: 1,
    steps: [
      dotsStep(6, "How many?", "Wait.", "Six!", "Six."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(6, "How many?", "Wait.", "Six!", "Six."),
      showStep(`${num(6)} ${sym('=')} ${dots('••• •••')}`, "equation", "Read this.", "Wait.", "Six equals six dots!", "Six equals six dots."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      dotsStep(4, "How many?", "Wait.", "Four!", "Four."),
      dotsStep(6, "How many?", "Wait.", "Six!", "Six."),
      dotsStep(3, "How many?", "Wait.", "Three!", "Three."),
      dotsStep(1, "How many?", "Wait.", "One!", "One."),
      dotsStep(2, "How many?", "Wait.", "Two!", "Two."),
      dotsStep(5, "How many?", "Wait.", "Five!", "Five."),
      dotsStep(6, "How many dots?", "Wait.", "Six!", "Six."),
      dotsStep(4, "How many?", "Wait.", "Four! Great work!", "Four."),
    ]
  });

  // Lessons 11-20: 7, review, 8, review, 9, review, 10, >/< intro, review comparing, Phase 1 final review
  const laterNumbers = [
    { id: 11, n: 7 }, { id: 12, n: null, title: "Review 0-7" },
    { id: 13, n: 8 }, { id: 14, n: null, title: "Review 0-8" },
    { id: 15, n: 9 }, { id: 16, n: null, title: "Review 0-9" },
    { id: 17, n: 10 },
  ];

  for (const item of laterNumbers) {
    if (item.n !== null) {
      // New number lesson
      const n = item.n;
      const prev = [];
      for (let i = 0; i <= n - 1; i++) prev.push(i);
      const reviewNums = pick(prev.filter(x => x > 0), 4, item.id);
      const steps = [];
      // Warm-up: 4 review steps
      for (const r of reviewNums) {
        steps.push(dotsStep(r, "How many dots?", "Wait.", `${Word(r)}!`, `${Word(r)}.`));
      }
      // New number
      steps.push(countStep(num(n), n, `New number! This is ${word(n)}. Count: ${Array.from({length: n}, (_, i) => word(i + 1)).join(', ')}.`, "Point to each dot.", `${Word(n)}!`, `${cap(Array.from({length: n}, (_, i) => word(i + 1)).join(', '))}. ${Word(n)}.`));
      steps.push(countStep(num(n), n, "Count the dots.", "Wait.", `${Word(n)}!`, `${Word(n)} dots.`));
      steps.push(dotsStep(n, "How many dots?", "Wait.", `${Word(n)}!`, `${Word(n)}.`));
      // Guided
      steps.push(identifyStep(n));
      steps.push(dotsStep(n, "How many dots? Quick!", "Wait.", `${Word(n)}!`, `${Word(n)}.`));
      // Mixed practice: 8 items from 0 to n, shuffled
      const mixNums = pick(Array.from({length: n + 1}, (_, i) => i), 8, item.id * 7);
      for (const m of mixNums) {
        if (m === 0) {
          steps.push(showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."));
        } else {
          steps.push(dotsStep(m, "How many?", "Wait.", `${Word(m)}!`, `${Word(m)}.`));
        }
      }
      // Firm-up
      steps.push(dotsStep(n, "How many dots?", "Wait.", `${Word(n)}! Great!`, `${Word(n)}.`));
      steps.push(dotsStep(n > 2 ? n - 2 : 1, "And this?", "Wait.", `${Word(n > 2 ? n - 2 : 1)}!`, `${Word(n > 2 ? n - 2 : 1)}.`));

      lessons.push({ id: item.id, title: `Lesson ${item.id}`, target: String(n), phase: 1, steps });
    } else {
      // Review lesson
      const maxN = item.id === 12 ? 7 : item.id === 14 ? 8 : 9;
      const steps = [];
      // 18 rapid-fire review steps
      const allNums = Array.from({length: maxN + 1}, (_, i) => i);
      const reviewOrder = shuffle(allNums.concat(allNums), item.id * 3).slice(0, 18);
      for (let i = 0; i < reviewOrder.length; i++) {
        const m = reviewOrder[i];
        const isLast = i === reviewOrder.length - 1;
        if (m === 0) {
          steps.push(showStep(num(0), "none", isLast ? "What number? Last one!" : "What number?", "Wait.", isLast ? "Zero! Great work!" : "Zero!", "Zero."));
        } else {
          steps.push(dotsStep(m, isLast ? "How many dots? Last one!" : "How many dots?", "Wait.", isLast ? `${Word(m)}! Excellent!` : `${Word(m)}!`, `${Word(m)}.`));
        }
      }
      lessons.push({ id: item.id, title: `Lesson ${item.id}`, target: item.title, phase: 1, steps });
    }
  }

  // Lesson 18: Introduce > and <
  {
    const steps = [];
    // Warm-up
    steps.push(dotsStep(7, "How many?", "Wait.", "Seven!", "Seven."));
    steps.push(dotsStep(10, "How many?", "Wait.", "Ten!", "Ten."));
    steps.push(dotsStep(5, "How many?", "Wait.", "Five!", "Five."));
    steps.push(dotsStep(3, "How many?", "Wait.", "Three!", "Three."));
    // New: > and <
    steps.push(showStep(`${num(5)} &nbsp; ${sym('>')} &nbsp; ${num(3)}`, "none", "This symbol means 'greater than'. Five is greater than three. Five is more than three.", "Point to the > sign.", "Greater than! Five is more than three.", "This is greater than. Five is greater than three."));
    steps.push(showStep(`${num(2)} &nbsp; ${sym('<')} &nbsp; ${num(7)}`, "none", "This symbol means 'less than'. Two is less than seven. Two is fewer than seven.", "Point to the < sign.", "Less than! Two is fewer than seven.", "This is less than. Two is less than seven."));
    steps.push(showStep(sym('>'), "none", "What does this symbol mean?", "Wait.", "Greater than!", "Greater than. More than."));
    steps.push(showStep(sym('<'), "none", "What does this symbol mean?", "Wait.", "Less than!", "Less than. Fewer than."));
    // Guided compare
    steps.push(compareStep(6, 2));
    steps.push(compareStep(1, 8));
    steps.push(compareStep(5, 5));
    // Mixed
    steps.push(dotsStep(8, "How many?", "Wait.", "Eight!", "Eight."));
    steps.push(compareStep(9, 4));
    steps.push(dotsStep(6, "How many?", "Wait.", "Six!", "Six."));
    steps.push(compareStep(3, 7));
    steps.push(dotsStep(10, "How many?", "Wait.", "Ten!", "Ten."));
    steps.push(compareStep(8, 8));
    // Firm-up
    steps.push(compareStep(4, 9));
    steps.push(dotsStep(7, "How many?", "Wait.", "Seven! Great job!", "Seven."));
    lessons.push({ id: 18, title: "Lesson 18", target: ">, <", phase: 1, steps });
  }

  // Lesson 19: Review comparing
  {
    const steps = [];
    steps.push(dotsStep(9, "How many?", "Wait.", "Nine!", "Nine."));
    steps.push(dotsStep(4, "How many?", "Wait.", "Four!", "Four."));
    steps.push(showStep(sym('>'), "none", "What does this mean?", "Wait.", "Greater than!", "Greater than."));
    steps.push(showStep(sym('<'), "none", "What does this mean?", "Wait.", "Less than!", "Less than."));
    steps.push(compareStep(7, 3));
    steps.push(compareStep(2, 9));
    steps.push(compareStep(6, 6));
    steps.push(dotsStep(5, "How many?", "Wait.", "Five!", "Five."));
    steps.push(compareStep(1, 4));
    steps.push(compareStep(10, 5));
    steps.push(dotsStep(8, "How many?", "Wait.", "Eight!", "Eight."));
    steps.push(compareStep(3, 8));
    steps.push(compareStep(5, 2));
    steps.push(dotsStep(10, "How many?", "Wait.", "Ten!", "Ten."));
    steps.push(compareStep(9, 9));
    steps.push(compareStep(4, 7));
    steps.push(dotsStep(6, "How many?", "Wait.", "Six!", "Six."));
    steps.push(compareStep(8, 1));
    lessons.push({ id: 19, title: "Lesson 19", target: "Review comparing", phase: 1, steps });
  }

  // Lesson 20: Phase 1 Final Review
  {
    const steps = [];
    // Comprehensive review of 0-10, =, >, <
    const nums = shuffle([0,1,2,3,4,5,6,7,8,9,10], 20);
    for (let i = 0; i < 8; i++) {
      const m = nums[i];
      if (m === 0) steps.push(showStep(num(0), "none", "What number?", "Wait.", "Zero!", "Zero."));
      else steps.push(dotsStep(m, "How many dots?", "Wait.", `${Word(m)}!`, `${Word(m)}.`));
    }
    steps.push(showStep(sym('='), "none", "What does this mean?", "Wait.", "Equals!", "Equals. Is the same as."));
    steps.push(showStep(sym('>'), "none", "What does this mean?", "Wait.", "Greater than!", "Greater than."));
    steps.push(showStep(sym('<'), "none", "What does this mean?", "Wait.", "Less than!", "Less than."));
    steps.push(compareStep(8, 3));
    steps.push(compareStep(5, 10));
    steps.push(compareStep(7, 7));
    // Final rapid fire
    steps.push(dotsStep(10, "How many?", "Wait.", "Ten!", "Ten."));
    steps.push(dotsStep(6, "How many?", "Wait.", "Six!", "Six."));
    steps.push(dotsStep(9, "How many?", "Wait.", "Nine!", "Nine."));
    steps.push(dotsStep(4, "How many? Last one!", "Wait.", "Four! Phase 1 complete!", "Four. Excellent work!"));
    lessons.push({ id: 20, title: "Lesson 20", target: "Phase 1 Review", phase: 1, steps });
  }

  return lessons;
}

// ─── Phase 2: Counting & Comparing (Lessons 21-40) ───

function generatePhase2() {
  const lessons = [];

  // Lessons 21-30: Numbers 11-20
  const teens = [
    { id: 21, n: 11 }, { id: 22, n: 12 }, { id: 23, n: 13 },
    { id: 24, n: 14 }, { id: 25, n: 15 }, { id: 26, n: 16 },
    { id: 27, n: 17 }, { id: 28, n: 18 }, { id: 29, n: 19 },
    { id: 30, n: 20 },
  ];

  for (const item of teens) {
    const n = item.n;
    const steps = [];
    // Warm-up: review 4 previous numbers
    const reviewPool = [];
    for (let i = Math.max(1, n - 6); i < n; i++) reviewPool.push(i);
    const reviewNums = pick(reviewPool, 4, item.id);
    for (const r of reviewNums) {
      steps.push(dotsStep(r, "How many dots?", "Wait.", `${Word(r)}!`, `${Word(r)}.`));
    }
    // New number
    steps.push(countStep(num(n), n, `New number! This is ${word(n)}. ${n >= 13 && n <= 19 ? `It's ${word(n - 10)}-teen — that means ten and ${word(n - 10)}.` : n === 11 ? "Eleven — ten and one more." : n === 12 ? "Twelve — ten and two more." : n === 20 ? "Twenty — two tens!" : ""} Count the dots.`, "Point to dots.", `${Word(n)}!`, `${Word(n)}.`));
    steps.push(countStep(num(n), n, "Count the dots again.", "Wait.", `${Word(n)}!`, `${Word(n)} dots.`));
    steps.push(dotsStep(n, "How many dots?", "Wait.", `${Word(n)}!`, `${Word(n)}.`));
    // Guided
    steps.push(identifyStep(n));
    steps.push(dotsStep(n, "How many? Quick!", "Wait.", `${Word(n)}!`, `${Word(n)}.`));
    // Mixed: 7 items
    const mixPool = [];
    for (let i = Math.max(1, n - 4); i <= n; i++) mixPool.push(i);
    // Add some earlier numbers
    mixPool.push(...pick([1,2,3,4,5,6,7,8,9,10], 2, item.id * 3));
    const mixed = pick(mixPool, 7, item.id * 5);
    for (const m of mixed) {
      steps.push(dotsStep(m, "How many dots?", "Wait.", `${Word(m)}!`, `${Word(m)}.`));
    }
    // Firm-up
    steps.push(dotsStep(n, "How many dots?", "Wait.", `${Word(n)}! Great!`, `${Word(n)}.`));
    steps.push(dotsStep(pick(reviewNums, 1, item.id * 9)[0], "And this one?", "Wait.", "Correct!", "Good."));

    lessons.push({ id: item.id, title: `Lesson ${item.id}`, target: String(n), phase: 2, steps });
  }

  // Lesson 31: Introduce + symbol
  {
    const steps = [];
    steps.push(dotsStep(15, "How many?", "Wait.", "Fifteen!", "Fifteen."));
    steps.push(dotsStep(10, "How many?", "Wait.", "Ten!", "Ten."));
    steps.push(dotsStep(20, "How many?", "Wait.", "Twenty!", "Twenty."));
    steps.push(dotsStep(8, "How many?", "Wait.", "Eight!", "Eight."));
    // New: + symbol
    steps.push(showStep(`${num(2)} ${sym('+')} ${num(1)}`, "none", "This symbol is called 'plus'. It means 'add' or 'put together'. Two plus one.", "Point to the + sign.", "Plus! It means add.", "This is plus. It means add or put together."));
    steps.push(showStep(`${num(2)} ${sym('+')} ${num(1)} ${sym('=')} ${num(3)}`, "dots", "Two plus one equals three. When we put two and one together, we get three.", "Point to each part.", "Two plus one is three!", "Two plus one equals three.", { dotCount: 3 }));
    steps.push(showStep(`${num(1)} ${sym('+')} ${num(1)} ${sym('=')} ${num(2)}`, "dots", "One plus one equals two.", "Point.", "One plus one is two!", "One plus one equals two.", { dotCount: 2 }));
    steps.push(showStep(sym('+'), "none", "What does this symbol mean?", "Wait.", "Plus! Add!", "Plus. It means add."));
    // Guided
    steps.push(addStep(1, 2, "dots"));
    steps.push(addStep(2, 2, "dots"));
    steps.push(addStep(3, 1, "dots"));
    // Mixed
    steps.push(dotsStep(12, "How many?", "Wait.", "Twelve!", "Twelve."));
    steps.push(addStep(1, 1, "dots"));
    steps.push(dotsStep(18, "How many?", "Wait.", "Eighteen!", "Eighteen."));
    steps.push(addStep(2, 1, "dots"));
    steps.push(dotsStep(7, "How many?", "Wait.", "Seven!", "Seven."));
    steps.push(showStep(sym('+'), "none", "What does this mean?", "Wait.", "Plus!", "Plus."));
    // Firm-up
    steps.push(addStep(3, 2, "dots"));
    steps.push(addStep(1, 3, "dots"));
    lessons.push({ id: 31, title: "Lesson 31", target: "plus (+)", phase: 2, steps });
  }

  // Lessons 32-34: +1 practice with number line
  for (let lid = 32; lid <= 34; lid++) {
    const steps = [];
    // Warm-up
    const warmup = pick([5,8,12,15,18,20], 3, lid);
    for (const w of warmup) steps.push(dotsStep(w, "How many?", "Wait.", `${Word(w)}!`, `${Word(w)}.`));
    steps.push(showStep(sym('+'), "none", "What does this mean?", "Wait.", "Plus!", "Plus. Add."));
    // +1 practice
    const bases = pick([1,2,3,4,5,6,7,8,9], 6, lid * 7);
    for (const b of bases) {
      steps.push(addStep(b, 1, "dots"));
    }
    // Number line steps
    steps.push(numberLineStep(bases[0] + 1, 0, 10));
    steps.push(numberLineStep(bases[2] + 1, 0, 10));
    // Mixed review
    const review = pick([10,13,16,19], 3, lid * 11);
    for (const r of review) steps.push(dotsStep(r, "How many?", "Wait.", `${Word(r)}!`, `${Word(r)}.`));
    // More +1
    steps.push(addStep(pick([3,6,8], 1, lid * 13)[0], 1, "numberline", undefined, undefined, undefined));
    // Firm-up
    steps.push(addStep(pick([4,5,7,9], 1, lid * 17)[0], 1, "dots"));
    lessons.push({ id: lid, title: `Lesson ${lid}`, target: "+1 practice", phase: 2, steps });
  }

  // Lessons 35-38: Counting patterns, number order, one more/one less
  for (let lid = 35; lid <= 38; lid++) {
    const steps = [];
    const warmup = pick([3,7,11,14,17,20], 4, lid);
    for (const w of warmup) steps.push(dotsStep(w, "How many?", "Wait.", `${Word(w)}!`, `${Word(w)}.`));

    // One more / one less
    const oneMoreBases = pick([4,6,8,10,12,15], 3, lid * 3);
    for (const b of oneMoreBases) {
      steps.push(showStep(num(b), "dots", `What is one more than ${word(b)}?`, "Wait.", `${Word(b + 1)}!`, `One more than ${word(b)} is ${word(b + 1)}.`, { dotCount: b }));
    }
    const oneLessBases = pick([5,7,9,11,13,16], 3, lid * 5);
    for (const b of oneLessBases) {
      steps.push(showStep(num(b), "dots", `What is one less than ${word(b)}?`, "Wait.", `${Word(b - 1)}!`, `One less than ${word(b)} is ${word(b - 1)}.`, { dotCount: b }));
    }
    // +1 review
    steps.push(addStep(pick([2,5,7,9], 1, lid * 7)[0], 1, "dots"));
    steps.push(addStep(pick([3,6,8], 1, lid * 9)[0], 1, "dots"));
    // Compare
    const [ca, cb] = pick([[8,3],[12,15],[6,6],[18,9]], 1, lid * 11)[0];
    steps.push(compareStep(ca, cb));
    // More dots
    const dotReview = pick([4,9,13,17,20], 3, lid * 13);
    for (const d of dotReview) steps.push(dotsStep(d, "How many?", "Wait.", `${Word(d)}!`, `${Word(d)}.`));
    // Firm-up
    steps.push(dotsStep(pick([6,10,15,19], 1, lid * 15)[0], "How many? Last one!", "Wait.", "Correct! Great job!", "Good work."));
    lessons.push({ id: lid, title: `Lesson ${lid}`, target: "one more, one less", phase: 2, steps });
  }

  // Lessons 39-40: Phase 2 review
  for (let lid = 39; lid <= 40; lid++) {
    const steps = [];
    const allNums = shuffle([1,3,5,7,9,11,13,15,17,19,2,4,6,8,10,12,14,16,18,20], lid);
    for (let i = 0; i < 10; i++) {
      steps.push(dotsStep(allNums[i], "How many dots?", "Wait.", `${Word(allNums[i])}!`, `${Word(allNums[i])}.`));
    }
    // Add some +1 and compare
    steps.push(addStep(pick([3,6,8], 1, lid * 3)[0], 1, "dots"));
    steps.push(addStep(pick([5,7,9], 1, lid * 5)[0], 1, "dots"));
    steps.push(compareStep(...pick([[12,7],[5,16],[10,10]], 1, lid * 7)[0]));
    steps.push(compareStep(...pick([[18,3],[8,14],[20,20]], 1, lid * 9)[0]));
    // More dots
    for (let i = 10; i < 14; i++) {
      steps.push(dotsStep(allNums[i], "How many?", "Wait.", `${Word(allNums[i])}!`, `${Word(allNums[i])}.`));
    }
    steps.push(addStep(pick([4,6,9], 1, lid * 11)[0], 1, "dots"));
    steps.push(dotsStep(20, lid === 40 ? "Last problem! How many dots?" : "How many?", "Wait.", lid === 40 ? "Twenty! Phase 2 complete!" : "Twenty!", "Twenty."));
    lessons.push({ id: lid, title: `Lesson ${lid}`, target: lid === 40 ? "Phase 2 Review" : "Review 11-20", phase: 2, steps });
  }

  return lessons;
}

// ─── Phase 3: Addition (Lessons 41-65) ───

function generatePhase3() {
  const lessons = [];

  // Structure: +1 mastery (41-44), +2 (45-48), +3 (49-52), doubles (53-55), +0 (56-57), commutative (58-59), number bonds (60-62), mixed (63-65)

  function addLessonBlock(startId, addend, count) {
    for (let i = 0; i < count; i++) {
      const lid = startId + i;
      const steps = [];
      // Warm-up: review from recent lessons
      const warmupAdds = pick([1,2,3,4,5,6,7,8,9].filter(x => x + addend <= 10), 3, lid);
      for (const w of warmupAdds) {
        if (i > 0 || addend > 1) {
          // Review previous addition type or number identification
          const prevAddend = addend > 1 ? addend - 1 : 1;
          steps.push(addStep(w, Math.min(prevAddend, 10 - w), "dots"));
        } else {
          steps.push(dotsStep(w, "How many dots?", "Wait.", `${Word(w)}!`, `${Word(w)}.`));
        }
      }
      // Review a number from phase 1-2
      steps.push(dotsStep(pick([11,13,15,17,19], 1, lid * 3)[0], "How many dots?", "Wait.", "Correct!", "Good."));

      // New/practice: +addend problems
      const bases = pick([0,1,2,3,4,5,6,7,8,9,10].filter(x => x + addend <= 20 && x + addend >= 0), i === 0 ? 3 : 5, lid * 7);
      if (i === 0 && addend >= 2) {
        // First lesson of block: model-lead-test
        const b = bases[0];
        steps.push(showStep(`${num(b)} ${sym('+')} ${num(addend)} ${sym('=')} ${num(b + addend)}`, "dots",
          `${Word(b)} plus ${word(addend)} equals ${word(b + addend)}. Count on from ${word(b)}: ${Array.from({length: addend}, (_, j) => word(b + j + 1)).join(', ')}.`,
          "Point to dots as you count.", `${Word(b + addend)}!`, `${Word(b)} plus ${word(addend)} equals ${word(b + addend)}.`, { dotCount: b + addend }));
      }
      for (const b of bases) {
        if (b + addend <= 10) steps.push(addStep(b, addend, "dots"));
      }

      // Mixed practice
      const mixedPool = [];
      // Add some from current addend
      for (const b of pick([1,2,3,4,5,6,7], 2, lid * 11)) {
        if (b + addend <= 10) mixedPool.push([b, addend]);
      }
      // Add some from previous addends
      if (addend > 1) {
        for (const b of pick([2,4,6,8], 2, lid * 13)) {
          if (b + addend - 1 <= 10) mixedPool.push([b, addend - 1]);
        }
      }
      // Number identification
      const dotNums = pick([3,5,7,9,12,16], 2, lid * 15);

      for (const [a, b] of pick(mixedPool, Math.min(3, mixedPool.length), lid * 17)) {
        steps.push(addStep(a, b, "dots"));
      }
      for (const d of dotNums) {
        steps.push(dotsStep(d, "How many dots?", "Wait.", `${Word(d)}!`, `${Word(d)}.`));
      }

      // Firm-up
      const firmBase = pick([2,3,5,7], 1, lid * 19)[0];
      if (firmBase + addend <= 10) steps.push(addStep(firmBase, addend, "dots"));
      steps.push(dotsStep(pick([4,6,8,10], 1, lid * 21)[0], "How many?", "Wait.", "Correct! Well done!", "Good."));

      lessons.push({ id: lid, title: `Lesson ${lid}`, target: `+${addend}${i > 0 ? " practice" : ""}`, phase: 3, steps });
    }
  }

  addLessonBlock(41, 1, 4);  // +1 (41-44)
  addLessonBlock(45, 2, 4);  // +2 (45-48)
  addLessonBlock(49, 3, 4);  // +3 (49-52)

  // Doubles (53-55)
  for (let i = 0; i < 3; i++) {
    const lid = 53 + i;
    const steps = [];
    // Warm-up
    steps.push(addStep(pick([3,5,7], 1, lid)[0], 2, "dots"));
    steps.push(addStep(pick([2,4,6], 1, lid * 3)[0], 3, "dots"));
    steps.push(dotsStep(pick([9,14,18], 1, lid * 5)[0], "How many?", "Wait.", "Correct!", "Good."));
    steps.push(addStep(pick([1,4,8], 1, lid * 7)[0], 1, "dots"));

    // Doubles
    const doubles = [[1,1],[2,2],[3,3],[4,4],[5,5]];
    const targetDoubles = i === 0 ? doubles.slice(0, 3) : i === 1 ? doubles.slice(2, 5) : doubles;

    if (i === 0) {
      steps.push(showStep(`${num(2)} ${sym('+')} ${num(2)} ${sym('=')} ${num(4)}`, "dots",
        "Two plus two is a 'double'. Both numbers are the same! Two plus two equals four.",
        "Point.", "Double two is four!", "Two plus two — a double — equals four.", { dotCount: 4 }));
    }

    for (const [a, b] of targetDoubles) {
      steps.push(addStep(a, b, "dots", `Double ${word(a)}. ${Word(a)} plus ${word(a)}?`));
    }

    // Mixed
    steps.push(addStep(pick([3,5,7], 1, lid * 9)[0], 1, "dots"));
    steps.push(addStep(pick([2,4,6], 1, lid * 11)[0], 2, "dots"));
    for (const [a, b] of pick(targetDoubles, 2, lid * 13)) {
      steps.push(addStep(a, b, "dots"));
    }
    steps.push(dotsStep(pick([7,11,16], 1, lid * 15)[0], "How many?", "Wait.", "Correct!", "Good."));
    steps.push(addStep(pick([1,3,5], 1, lid * 17)[0], 3, "dots"));

    // Firm-up
    steps.push(addStep(pick(targetDoubles, 1, lid * 19)[0][0], pick(targetDoubles, 1, lid * 19)[0][1], "dots"));
    steps.push(addStep(pick([4,6,8], 1, lid * 21)[0], 1, "dots"));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: i === 0 ? "doubles" : "doubles practice", phase: 3, steps });
  }

  // +0 (56-57)
  for (let i = 0; i < 2; i++) {
    const lid = 56 + i;
    const steps = [];
    steps.push(addStep(pick([3,5], 1, lid)[0], 2, "dots"));
    steps.push(addStep(pick([2,4], 1, lid * 3)[0], 3, "dots"));
    steps.push(addStep(pick([1,1,2,2,3,3], 1, lid * 5)[0], pick([1,1,2,2,3,3], 1, lid * 5)[0], "dots"));
    steps.push(dotsStep(pick([8,13,17], 1, lid * 7)[0], "How many?", "Wait.", "Correct!", "Good."));

    if (i === 0) {
      steps.push(showStep(`${num(5)} ${sym('+')} ${num(0)} ${sym('=')} ${num(5)}`, "dots",
        "Five plus zero equals five. Adding zero changes nothing! The number stays the same.",
        "Point to the zero.", "Five! Adding zero changes nothing!", "Five plus zero is still five.", { dotCount: 5 }));
    }

    const bases = pick([1,2,3,4,5,6,7,8,9,10], i === 0 ? 4 : 5, lid * 9);
    for (const b of bases) {
      steps.push(addStep(b, 0, "dots", `${Word(b)} plus zero?`, `${Word(b)}! Adding zero changes nothing!`));
    }

    // Mixed
    steps.push(addStep(pick([3,5,7], 1, lid * 11)[0], 2, "dots"));
    steps.push(addStep(pick([2,4], 1, lid * 13)[0], 1, "dots"));
    steps.push(addStep(pick([1,2,3,4,5], 1, lid * 15)[0], pick([1,2,3,4,5], 1, lid * 15)[0], "dots"));
    steps.push(dotsStep(pick([6,10,15], 1, lid * 17)[0], "How many?", "Wait.", "Correct!", "Good."));

    steps.push(addStep(pick([7,8,9], 1, lid * 19)[0], 0, "dots"));
    steps.push(addStep(pick([4,6], 1, lid * 21)[0], 3, "dots"));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: "+0", phase: 3, steps });
  }

  // Commutative property (58-59)
  for (let i = 0; i < 2; i++) {
    const lid = 58 + i;
    const steps = [];
    steps.push(addStep(pick([4,6,8], 1, lid)[0], 2, "dots"));
    steps.push(addStep(pick([3,5], 1, lid * 3)[0], 0, "dots"));
    steps.push(addStep(pick([2,3,4,5], 1, lid * 5)[0], pick([2,3,4,5], 1, lid * 5)[0], "dots"));
    steps.push(dotsStep(pick([7,12,16], 1, lid * 7)[0], "How many?", "Wait.", "Correct!", "Good."));

    if (i === 0) {
      steps.push(showStep(`${num(2)} ${sym('+')} ${num(3)} ${sym('=')} ${num(5)}`, "dots",
        "Two plus three equals five.", "Point.", "Five!", "Two plus three equals five.", { dotCount: 5 }));
      steps.push(showStep(`${num(3)} ${sym('+')} ${num(2)} ${sym('=')} ${num(5)}`, "dots",
        "Three plus two also equals five! The order doesn't matter. Two plus three and three plus two give the same answer.",
        "Point to both.", "Same answer! Five!", "The order doesn't matter in addition.", { dotCount: 5 }));
    }

    const pairs = [[1,4],[2,3],[1,3],[2,5],[3,4]];
    const targetPairs = pick(pairs, i === 0 ? 3 : 4, lid * 9);
    for (const [a, b] of targetPairs) {
      steps.push(addStep(a, b, "dots"));
      steps.push(addStep(b, a, "dots", `Now flip it. ${word(b)} plus ${word(a)}?`, "Same answer!"));
    }

    // Mixed
    steps.push(addStep(pick([5,7,9], 1, lid * 11)[0], 1, "dots"));
    steps.push(addStep(pick([3,4,5], 1, lid * 13)[0], pick([3,4,5], 1, lid * 13)[0], "dots"));
    steps.push(dotsStep(pick([8,14,19], 1, lid * 15)[0], "How many?", "Wait.", "Correct!", "Good."));

    steps.push(addStep(pick([2,3], 1, lid * 17)[0], pick([1,2,3], 1, lid * 17)[0], "dots"));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: "commutative", phase: 3, steps });
  }

  // Number bonds (60-62)
  for (let i = 0; i < 3; i++) {
    const lid = 60 + i;
    const targetSum = [5, 10, 10][i]; // bonds to 5, then bonds to 10
    const steps = [];
    steps.push(addStep(pick([3,5,7], 1, lid)[0], 2, "dots"));
    steps.push(addStep(pick([2,4], 1, lid * 3)[0], 3, "dots"));
    steps.push(addStep(pick([1,2,3,4], 1, lid * 5)[0], 1, "dots"));
    steps.push(dotsStep(pick([6,9,13], 1, lid * 7)[0], "How many?", "Wait.", "Correct!", "Good."));

    if (i === 0) {
      steps.push(showStep(`${num(5)} ${sym('=')} ${num(2)} ${sym('+')} ${num(3)}`, "dots",
        "Five can be made from two plus three. These are called 'number bonds' — different ways to make a number.",
        "Point to each part.", "Two plus three makes five!", "Five equals two plus three. A number bond!", { dotCount: 5 }));
    }

    // Generate bonds for target sum
    const bonds = [];
    for (let a = 0; a <= targetSum; a++) {
      const b = targetSum - a;
      if (a <= b) bonds.push([a, b]);
    }
    const targetBonds = pick(bonds, Math.min(5, bonds.length), lid * 9);
    for (const [a, b] of targetBonds) {
      steps.push(addStep(a, b, "dots", `What makes ${word(targetSum)}? ${word(a)} plus?`));
    }

    // Missing addend
    for (const [a, b] of pick(targetBonds, 2, lid * 11)) {
      const display = `${num(a)} ${sym('+')} ${q()} ${sym('=')} ${num(targetSum)}`;
      steps.push(showStep(display, "dots",
        `${Word(a)} plus what equals ${word(targetSum)}?`, "Wait.",
        `${Word(b)}!`,
        `${Word(a)} plus ${word(b)} equals ${word(targetSum)}.`,
        { dotCount: targetSum, answer: b }));
    }

    // Mixed
    steps.push(addStep(pick([2,4,6], 1, lid * 13)[0], pick([1,2,3], 1, lid * 13)[0], "dots"));
    steps.push(dotsStep(pick([8,11,17], 1, lid * 15)[0], "How many?", "Wait.", "Correct!", "Good."));
    steps.push(addStep(pick(targetBonds, 1, lid * 17)[0][0], pick(targetBonds, 1, lid * 17)[0][1], "dots"));

    // Firm-up
    steps.push(addStep(pick(targetBonds, 1, lid * 19)[0][0], pick(targetBonds, 1, lid * 19)[0][1], "dots"));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: i === 0 ? "number bonds" : `bonds to ${targetSum}`, phase: 3, steps });
  }

  // Mixed practice and review (63-65)
  for (let i = 0; i < 3; i++) {
    const lid = 63 + i;
    const steps = [];
    // 18 mixed addition problems spanning all types
    const allTypes = [];
    // +1
    for (const b of pick([2,4,6,8], 2, lid)) allTypes.push([b, 1]);
    // +2
    for (const b of pick([1,3,5,7], 2, lid * 3)) allTypes.push([b, 2]);
    // +3
    for (const b of pick([2,4,6], 2, lid * 5)) allTypes.push([b, 3]);
    // doubles
    for (const d of pick([1,2,3,4,5], 2, lid * 7)) allTypes.push([d, d]);
    // +0
    allTypes.push([pick([5,7,9], 1, lid * 9)[0], 0]);
    // commutative
    allTypes.push([pick([3,4], 1, lid * 11)[0], pick([1,2], 1, lid * 11)[0]]);

    const selected = pick(allTypes.filter(([a, b]) => a + b <= 10), 14, lid * 13);
    for (const [a, b] of selected) {
      steps.push(addStep(a, b, "dots"));
    }
    // Sprinkle in number identification
    steps.push(dotsStep(pick([7,12,16,20], 1, lid * 15)[0], "How many dots?", "Wait.", "Correct!", "Good."));
    steps.push(dotsStep(pick([5,9,14,18], 1, lid * 17)[0], "How many?", "Wait.", "Correct!", "Good."));
    // Compare
    steps.push(compareStep(...pick([[8,3],[5,9],[7,7]], 1, lid * 19)[0]));
    steps.push(addStep(pick([2,3,4], 1, lid * 21)[0], pick([2,3], 1, lid * 21)[0], "dots"));

    const target = lid === 65 ? "Phase 3 Review" : "mixed addition";
    lessons.push({ id: lid, title: `Lesson ${lid}`, target, phase: 3, steps });
  }

  return lessons;
}

// ─── Phase 4: Subtraction (Lessons 66-85) ───

function generatePhase4() {
  const lessons = [];

  function subLessonBlock(startId, subtrahend, count) {
    for (let i = 0; i < count; i++) {
      const lid = startId + i;
      const steps = [];
      // Warm-up: mix of addition and previous subtraction
      const warmupBases = pick([3,5,7,8,9], 2, lid);
      for (const w of warmupBases) {
        steps.push(addStep(w, pick([1,2,3], 1, lid * w)[0], "dots"));
      }
      if (subtrahend > 1 || i > 0) {
        const prevSub = subtrahend > 1 ? subtrahend - 1 : 1;
        steps.push(subStep(pick([5,6,7,8,9], 1, lid * 3)[0], prevSub, "dots"));
      } else {
        steps.push(dotsStep(pick([10,14,18], 1, lid * 3)[0], "How many?", "Wait.", "Correct!", "Good."));
      }
      steps.push(dotsStep(pick([6,9,12,16], 1, lid * 5)[0], "How many?", "Wait.", "Correct!", "Good."));

      // New/practice: -subtrahend
      if (i === 0) {
        const b = Math.max(subtrahend + 1, 5);
        steps.push(showStep(`${num(b)} ${sym('−')} ${num(subtrahend)} ${sym('=')} ${num(b - subtrahend)}`, "dots",
          subtrahend === 1 ? `${Word(b)} minus one equals ${word(b - 1)}. Minus means 'take away'. ${Word(b)} take away one is ${word(b - 1)}.` :
          `${Word(b)} minus ${word(subtrahend)} equals ${word(b - subtrahend)}. Count back ${word(subtrahend)} from ${word(b)}.`,
          "Point to the dots.", `${Word(b - subtrahend)}!`,
          `${Word(b)} minus ${word(subtrahend)} equals ${word(b - subtrahend)}.`, { dotCount: b }));
      }

      const bases = pick([2,3,4,5,6,7,8,9,10].filter(x => x >= subtrahend), i === 0 ? 4 : 6, lid * 7);
      for (const b of bases) {
        steps.push(subStep(b, subtrahend, "dots"));
      }

      // Mixed
      steps.push(addStep(pick([2,4,6], 1, lid * 9)[0], pick([1,2,3], 1, lid * 9)[0], "dots"));
      for (const b of pick(bases, 2, lid * 11)) {
        steps.push(subStep(b, subtrahend, "dots"));
      }
      steps.push(dotsStep(pick([5,8,13,17], 1, lid * 13)[0], "How many?", "Wait.", "Correct!", "Good."));
      steps.push(addStep(pick([3,5,7], 1, lid * 15)[0], pick([1,2], 1, lid * 15)[0], "dots"));

      // Firm-up
      steps.push(subStep(pick([6,7,8,9,10], 1, lid * 17)[0], subtrahend, "dots"));
      steps.push(addStep(pick([2,4], 1, lid * 19)[0], pick([2,3], 1, lid * 19)[0], "dots"));

      lessons.push({ id: lid, title: `Lesson ${lid}`, target: `−${subtrahend}${i > 0 ? " practice" : ""}`, phase: 4, steps });
    }
  }

  subLessonBlock(66, 1, 4);   // -1 (66-69)
  subLessonBlock(70, 2, 4);   // -2 (70-73)
  subLessonBlock(74, 3, 4);   // -3 (74-77)

  // Fact families (78-79)
  for (let i = 0; i < 2; i++) {
    const lid = 78 + i;
    const steps = [];
    steps.push(addStep(pick([3,5], 1, lid)[0], 2, "dots"));
    steps.push(subStep(pick([7,8,9], 1, lid * 3)[0], 2, "dots"));
    steps.push(addStep(pick([2,4], 1, lid * 5)[0], 3, "dots"));
    steps.push(subStep(pick([6,8,10], 1, lid * 7)[0], 3, "dots"));

    // Fact family concept
    const families = [[3,4,7],[2,5,7],[4,6,10],[3,7,10],[2,8,10]];
    const targetFamilies = pick(families, i === 0 ? 2 : 3, lid * 9);

    if (i === 0) {
      const [a, b, s] = targetFamilies[0];
      steps.push(showStep(`${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${num(s)}`, "dots",
        `${Word(a)} plus ${word(b)} equals ${word(s)}.`, "Point.", `${Word(s)}!`, `${Word(a)} plus ${word(b)} equals ${word(s)}.`, { dotCount: s }));
      steps.push(showStep(`${num(s)} ${sym('−')} ${num(b)} ${sym('=')} ${num(a)}`, "dots",
        `Now: ${word(s)} minus ${word(b)} equals ${word(a)}! Addition and subtraction are related. This is called a 'fact family'.`,
        "Point.", `${Word(a)}! They're connected!`, `${Word(s)} minus ${word(b)} equals ${word(a)}. A fact family!`, { dotCount: s }));
    }

    for (const [a, b, s] of targetFamilies) {
      steps.push(addStep(a, b, "dots"));
      steps.push(addStep(b, a, "dots"));
      steps.push(subStep(s, a, "dots"));
      steps.push(subStep(s, b, "dots"));
    }

    // Mixed
    steps.push(dotsStep(pick([9,14,18], 1, lid * 11)[0], "How many?", "Wait.", "Correct!", "Good."));
    steps.push(addStep(pick([4,6], 1, lid * 13)[0], pick([1,2], 1, lid * 13)[0], "dots"));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: "fact families", phase: 4, steps });
  }

  // -0 (80)
  {
    const steps = [];
    steps.push(subStep(pick([7,8,9], 1, 80)[0], 2, "dots"));
    steps.push(addStep(pick([3,5], 1, 240)[0], 3, "dots"));
    steps.push(subStep(pick([6,8], 1, 400)[0], 1, "dots"));
    steps.push(dotsStep(pick([10,15,20], 1, 560)[0], "How many?", "Wait.", "Correct!", "Good."));

    steps.push(showStep(`${num(5)} ${sym('−')} ${num(0)} ${sym('=')} ${num(5)}`, "dots",
      "Five minus zero equals five. Subtracting zero changes nothing!",
      "Point.", "Five! Subtracting zero changes nothing!", "Five minus zero is still five.", { dotCount: 5 }));

    for (const b of pick([1,2,3,4,5,6,7,8,9,10], 6, 720)) {
      steps.push(subStep(b, 0, "dots", `${Word(b)} minus zero?`, `${Word(b)}! Same number!`));
    }

    steps.push(addStep(pick([4,6], 1, 880)[0], 0, "dots"));
    steps.push(subStep(pick([3,7,9], 1, 1040)[0], 0, "dots"));
    steps.push(addStep(pick([2,5], 1, 1200)[0], pick([2,3], 1, 1200)[0], "dots"));
    steps.push(subStep(pick([8,10], 1, 1360)[0], 3, "dots"));
    steps.push(subStep(pick([6,9], 1, 1520)[0], 0, "dots"));

    lessons.push({ id: 80, title: "Lesson 80", target: "−0", phase: 4, steps });
  }

  // Mixed subtraction and review (81-85)
  for (let i = 0; i < 5; i++) {
    const lid = 81 + i;
    const steps = [];
    // Mix addition and subtraction
    const subs = [];
    for (const s of pick([1,2,3], 3, lid)) {
      const base = pick([4,5,6,7,8,9,10].filter(x => x >= s), 1, lid * s)[0];
      subs.push([base, s]);
    }
    const adds = [];
    for (const a of pick([1,2,3], 2, lid * 3)) {
      const base = pick([1,2,3,4,5,6,7].filter(x => x + a <= 10), 1, lid * a * 3)[0];
      adds.push([base, a]);
    }

    // Interleave
    const all = [...subs.map(([a,b]) => ({type:'sub',a,b})), ...adds.map(([a,b]) => ({type:'add',a,b}))];
    const mixed = shuffle(all, lid * 7);

    // Warm-up (4 from mixed)
    for (let j = 0; j < Math.min(4, mixed.length); j++) {
      const m = mixed[j];
      if (m.type === 'add') steps.push(addStep(m.a, m.b, "dots"));
      else steps.push(subStep(m.a, m.b, "dots"));
    }

    // More practice (6 new problems)
    for (let j = 0; j < 6; j++) {
      const isAdd = j % 2 === 0;
      if (isAdd) {
        const a = pick([1,2,3,4,5,6,7], 1, lid * j * 3)[0];
        const b = pick([1,2,3], 1, lid * j * 5)[0];
        if (a + b <= 10) steps.push(addStep(a, b, "dots"));
        else steps.push(addStep(a, 1, "dots"));
      } else {
        const a = pick([4,5,6,7,8,9,10], 1, lid * j * 7)[0];
        const b = pick([1,2,3], 1, lid * j * 9)[0];
        steps.push(subStep(a, Math.min(b, a), "dots"));
      }
    }

    // Dots review
    steps.push(dotsStep(pick([8,12,16,20], 1, lid * 11)[0], "How many?", "Wait.", "Correct!", "Good."));
    steps.push(dotsStep(pick([5,9,14,18], 1, lid * 13)[0], "How many?", "Wait.", "Correct!", "Good."));

    // More mixed
    steps.push(subStep(pick([7,8,9,10], 1, lid * 15)[0], pick([1,2,3], 1, lid * 15)[0], "dots"));
    steps.push(addStep(pick([3,4,5], 1, lid * 17)[0], pick([2,3,4], 1, lid * 17)[0], "dots"));
    steps.push(subStep(pick([5,6,8], 1, lid * 19)[0], pick([1,2], 1, lid * 19)[0], "dots"));

    // Firm-up
    steps.push(subStep(pick([6,8,10], 1, lid * 21)[0], pick([2,3], 1, lid * 21)[0], "dots"));

    const target = lid === 85 ? "Phase 4 Review" : "mixed +/−";
    lessons.push({ id: lid, title: `Lesson ${lid}`, target, phase: 4, steps });
  }

  return lessons;
}

// ─── Phase 5: Place Value (Lessons 86-105) ───

function generatePhase5() {
  const lessons = [];

  // 86-89: Tens and ones introduction
  // 90-94: Counting to 50
  // 95-99: Counting to 100
  // 100-105: Addition/subtraction within 20

  // Tens and ones (86-89)
  for (let i = 0; i < 4; i++) {
    const lid = 86 + i;
    const steps = [];
    // Warm-up
    steps.push(addStep(pick([3,5,7], 1, lid)[0], pick([2,3], 1, lid)[0], "dots"));
    steps.push(subStep(pick([8,9,10], 1, lid * 3)[0], pick([1,2,3], 1, lid * 3)[0], "dots"));
    steps.push(dotsStep(pick([6,9,14], 1, lid * 5)[0], "How many?", "Wait.", "Correct!", "Good."));
    steps.push(addStep(pick([4,6], 1, lid * 7)[0], pick([1,2], 1, lid * 7)[0], "dots"));

    const targetNums = i === 0 ? [10,13,15] : i === 1 ? [11,14,17] : i === 2 ? [12,16,19] : [18,20,13];

    if (i === 0) {
      steps.push(showStep(`${num(13)}`, "placevalue",
        "Thirteen. That's one ten and three ones. The 1 means one group of ten. The 3 means three extra ones.",
        "Point to tens column, then ones.", "One ten and three ones!", "Thirteen is one ten and three ones."));
    }

    for (const n of targetNums) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      steps.push(showStep(num(n), "placevalue",
        `${Word(n)}. How many tens? How many ones?`, "Wait.",
        `${tens} ten${tens !== 1 ? 's' : ''} and ${ones} one${ones !== 1 ? 's' : ''}!`,
        `${Word(n)} is ${tens} ten${tens !== 1 ? 's' : ''} and ${ones} one${ones !== 1 ? 's' : ''}.`));
    }

    // Mixed
    steps.push(subStep(pick([7,8,9], 1, lid * 9)[0], pick([1,2], 1, lid * 9)[0], "dots"));
    steps.push(addStep(pick([3,5], 1, lid * 11)[0], pick([2,3], 1, lid * 11)[0], "dots"));
    for (const n of pick(targetNums, 2, lid * 13)) {
      steps.push(dotsStep(n, "How many dots?", "Wait.", `${Word(n)}!`, `${Word(n)}.`));
    }
    steps.push(dotsStep(pick([4,7,11,15], 1, lid * 15)[0], "How many?", "Wait.", "Correct!", "Good."));

    // More place value
    const moreNums = pick([10,11,12,13,14,15,16,17,18,19,20], 3, lid * 17);
    for (const n of moreNums) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      steps.push(showStep(num(n), "none",
        `${Word(n)}. How many tens and ones?`, "Wait.",
        `${tens} ten${tens !== 1 ? 's' : ''}, ${ones} one${ones !== 1 ? 's' : ''}!`,
        `${tens} ten${tens !== 1 ? 's' : ''} and ${ones} one${ones !== 1 ? 's' : ''}.`));
    }

    // Firm-up
    steps.push(addStep(pick([4,6,8], 1, lid * 19)[0], pick([1,2], 1, lid * 19)[0], "dots"));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: i === 0 ? "tens, ones" : "place value", phase: 5, steps });
  }

  // Counting to 50 (90-94)
  for (let i = 0; i < 5; i++) {
    const lid = 90 + i;
    const rangeStart = 20 + i * 6;
    const rangeEnd = Math.min(rangeStart + 6, 50);
    const steps = [];

    // Warm-up
    steps.push(addStep(pick([5,7,9], 1, lid)[0], pick([1,2], 1, lid)[0], "dots"));
    steps.push(subStep(pick([8,9,10], 1, lid * 3)[0], pick([2,3], 1, lid * 3)[0], "dots"));
    // Place value review
    const pvNum = pick([12,15,18,20], 1, lid * 5)[0];
    steps.push(showStep(num(pvNum), "none", `${Word(pvNum)}. Tens and ones?`, "Wait.", `${Math.floor(pvNum/10)} ten${Math.floor(pvNum/10)>1?'s':''}, ${pvNum%10} one${pvNum%10!==1?'s':''}!`, "Correct."));
    steps.push(dotsStep(pick([6,10,14], 1, lid * 7)[0], "How many?", "Wait.", "Correct!", "Good."));

    // New range
    for (let n = rangeStart; n <= rangeEnd; n++) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      steps.push(showStep(num(n), "none",
        n === rangeStart ? `New number: ${n}. That's ${tens} tens and ${ones} ones. Say '${n}'.` : `What is this number?`,
        n === rangeStart ? "Point to the number." : "Wait.",
        `${n}!`, `${n}. ${tens} tens and ${ones} ones.`));
    }

    // Skip counting by 10s
    if (i >= 2) {
      steps.push(showStep(`${num(10)} &nbsp; ${num(20)} &nbsp; ${num(30)} &nbsp; ${num(40)}`, "none",
        "Count by tens: ten, twenty, thirty, forty.", "Point to each.", "Ten, twenty, thirty, forty!", "Count by tens."));
    }

    // Mixed
    steps.push(addStep(pick([3,5,7], 1, lid * 9)[0], pick([2,3], 1, lid * 9)[0], "dots"));
    steps.push(subStep(pick([6,8,10], 1, lid * 11)[0], pick([1,2], 1, lid * 11)[0], "dots"));
    steps.push(dotsStep(pick([7,11,16,19], 1, lid * 13)[0], "How many?", "Wait.", "Correct!", "Good."));

    // Firm-up
    const firmNum = pick(Array.from({length: rangeEnd - rangeStart + 1}, (_, j) => rangeStart + j), 1, lid * 15)[0];
    steps.push(showStep(num(firmNum), "none", `What number?`, "Wait.", `${firmNum}! Great!`, `${firmNum}.`));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: `${rangeStart}-${rangeEnd}`, phase: 5, steps });
  }

  // Counting to 100 (95-99)
  for (let i = 0; i < 5; i++) {
    const lid = 95 + i;
    const rangeStart = 50 + i * 10;
    const rangeEnd = Math.min(rangeStart + 10, 100);
    const steps = [];

    steps.push(addStep(pick([4,6,8], 1, lid)[0], pick([1,2,3], 1, lid)[0], "dots"));
    steps.push(subStep(pick([7,9,10], 1, lid * 3)[0], pick([1,2], 1, lid * 3)[0], "dots"));
    steps.push(showStep(num(pick([25,33,41,48], 1, lid * 5)[0]), "none", "What number?", "Wait.", "Correct!", "Good."));
    steps.push(dotsStep(pick([8,12,17], 1, lid * 7)[0], "How many?", "Wait.", "Correct!", "Good."));

    // Show numbers in the range
    const rangeNums = [];
    for (let n = rangeStart; n <= rangeEnd; n += 2) rangeNums.push(n);
    for (const n of rangeNums.slice(0, 6)) {
      steps.push(showStep(num(n), "none",
        n === rangeStart ? `New number: ${n}. Say '${n}'.` : `What number?`,
        "Wait.", `${n}!`, `${n}.`));
    }

    // Skip count by 10s
    const skipNums = [];
    for (let n = 10; n <= rangeEnd; n += 10) skipNums.push(n);
    steps.push(showStep(skipNums.map(n => num(n)).join(' &nbsp; '), "none",
      `Count by tens: ${skipNums.join(', ')}.`, "Point to each.", `${skipNums.join(', ')}!`, "Good counting!"));

    // Mixed
    steps.push(addStep(pick([3,5,7], 1, lid * 9)[0], pick([2,3], 1, lid * 9)[0], "dots"));
    steps.push(subStep(pick([6,8,9], 1, lid * 11)[0], pick([1,2,3], 1, lid * 11)[0], "dots"));

    // More from range
    for (const n of pick(rangeNums, 3, lid * 13)) {
      steps.push(showStep(num(n), "none", "What number?", "Wait.", `${n}!`, `${n}.`));
    }

    steps.push(dotsStep(pick([5,10,15,20], 1, lid * 15)[0], "How many?", "Wait.", "Correct!", "Good."));
    steps.push(showStep(num(pick(rangeNums, 1, lid * 17)[0]), "none", "What number? Last one!", "Wait.", "Correct! Great work!", "Good."));

    lessons.push({ id: lid, title: `Lesson ${lid}`, target: `${rangeStart}-${rangeEnd}`, phase: 5, steps });
  }

  // Addition/subtraction within 20 (100-105)
  for (let i = 0; i < 6; i++) {
    const lid = 100 + i;
    const steps = [];

    // Warm-up
    steps.push(addStep(pick([5,7,9], 1, lid)[0], pick([1,2,3], 1, lid)[0], "dots"));
    steps.push(subStep(pick([8,9,10], 1, lid * 3)[0], pick([2,3], 1, lid * 3)[0], "dots"));
    steps.push(showStep(num(pick([35,52,71,88], 1, lid * 5)[0]), "none", "What number?", "Wait.", "Correct!", "Good."));
    steps.push(dotsStep(pick([6,10,14,18], 1, lid * 7)[0], "How many?", "Wait.", "Correct!", "Good."));

    // Within-20 problems
    const addProblems = [];
    const subProblems = [];
    for (let a = 5; a <= 10; a++) {
      for (let b = 2; b <= 10; b++) {
        if (a + b <= 20 && a + b > 10) addProblems.push([a, b]);
      }
    }
    for (let a = 11; a <= 18; a++) {
      for (let b = 1; b <= Math.min(a - 1, 9); b++) {
        subProblems.push([a, b]);
      }
    }

    const isAdd = i % 2 === 0;
    const problems = isAdd ? pick(addProblems, 6, lid * 9) : pick(subProblems, 6, lid * 9);

    for (const [a, b] of problems) {
      if (isAdd) steps.push(addStep(a, b, "dots"));
      else steps.push(subStep(a, b, "dots"));
    }

    // Mixed within 10
    steps.push(addStep(pick([3,4,5], 1, lid * 11)[0], pick([2,3], 1, lid * 11)[0], "dots"));
    steps.push(subStep(pick([7,8,9], 1, lid * 13)[0], pick([1,2], 1, lid * 13)[0], "dots"));

    // More within 20
    const more = isAdd ? pick(addProblems, 3, lid * 15) : pick(subProblems, 3, lid * 15);
    for (const [a, b] of more) {
      if (isAdd) steps.push(addStep(a, b, "dots"));
      else steps.push(subStep(a, b, "dots"));
    }

    // Number identification
    steps.push(dotsStep(pick([7,12,16,20], 1, lid * 17)[0], "How many?", "Wait.", "Correct!", "Good."));

    // Firm-up
    const [fa, fb] = isAdd ? pick(addProblems, 1, lid * 19)[0] : pick(subProblems, 1, lid * 19)[0];
    if (isAdd) steps.push(addStep(fa, fb, "dots"));
    else steps.push(subStep(fa, fb, "dots"));

    const target = isAdd ? `addition to 20` : `subtraction within 20`;
    lessons.push({ id: lid, title: `Lesson ${lid}`, target: lid === 105 ? "Phase 5 Review" : target, phase: 5, steps });
  }

  return lessons;
}

// ─── Phase 6: Fluency (Lessons 106-125) ───

function generatePhase6() {
  const lessons = [];

  // 106-109: Make 10 strategy
  // 110-113: Doubles +1
  // 114-119: Two-digit + one-digit
  // 120-125: Two-digit + tens

  for (let i = 0; i < 20; i++) {
    const lid = 106 + i;
    const steps = [];

    // Warm-up (4 steps)
    steps.push(addStep(pick([6,7,8,9], 1, lid)[0], pick([3,4,5], 1, lid)[0], "dots"));
    steps.push(subStep(pick([13,14,15,16], 1, lid * 3)[0], pick([4,5,6], 1, lid * 3)[0], "dots"));
    steps.push(showStep(num(pick([42,57,73,86,91], 1, lid * 5)[0]), "none", "What number?", "Wait.", "Correct!", "Good."));
    steps.push(addStep(pick([4,5,6,7], 1, lid * 7)[0], pick([1,2,3], 1, lid * 7)[0], "dots"));

    if (i < 4) {
      // Make 10 strategy (106-109)
      if (i === 0) {
        steps.push(showStep(`${num(8)} ${sym('+')} ${num(5)} ${sym('=')} ${q()}`, "dots",
          "Eight plus five. Here's a trick: make ten first! Eight needs two more to make ten. Take two from the five, leaving three. Ten plus three is thirteen!",
          "Show the decomposition.", "Thirteen! Make ten first!",
          "Eight plus five: make ten (8+2=10), then add the rest (10+3=13).", { dotCount: 13, answer: 13 }));
      }
      const make10problems = [[8,3],[9,4],[7,5],[8,6],[9,7],[6,5],[7,4],[9,2],[8,4],[7,6]];
      const selected = pick(make10problems, 6, lid * 9);
      for (const [a, b] of selected) {
        const ans = a + b;
        const toTen = 10 - a;
        steps.push(addStep(a, b, "dots",
          `${Word(a)} plus ${word(b)}. Make ten: ${word(a)} plus ${word(toTen)} is ten, plus ${word(b - toTen)} more is?`));
      }
    } else if (i < 8) {
      // Doubles +1 (110-113)
      if (i === 4) {
        steps.push(showStep(`${num(6)} ${sym('+')} ${num(7)} ${sym('=')} ${q()}`, "dots",
          "Six plus seven. Think: double six is twelve, plus one more is thirteen! When numbers are one apart, use the double of the smaller number plus one.",
          "Point.", "Thirteen! Doubles plus one!",
          "Six plus seven: double six (12) plus one (13).", { dotCount: 13, answer: 13 }));
      }
      const doublesPlusOne = [[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[2,3],[4,3],[5,4],[6,5],[7,6],[8,7]];
      const selected = pick(doublesPlusOne, 6, lid * 9);
      for (const [a, b] of selected) {
        const smaller = Math.min(a, b);
        steps.push(addStep(a, b, "dots",
          `${Word(a)} plus ${word(b)}. Double ${word(smaller)} is ${word(smaller * 2)}, plus one?`));
      }
    } else if (i < 14) {
      // Two-digit + one-digit (114-119)
      if (i === 8) {
        steps.push(showStep(`${num(24)} ${sym('+')} ${num(5)} ${sym('=')} ${q()}`, "none",
          "Twenty-four plus five. The tens stay the same — two tens. Just add the ones: four plus five is nine. Twenty-nine!",
          "Point.", "Twenty-nine!",
          "Twenty-four plus five: 2 tens stay, 4+5=9 ones. Twenty-nine.", { answer: 29 }));
      }
      const twoDigitProblems = [];
      for (let a = 21; a <= 48; a += 3) {
        for (const b of [2,3,4,5]) {
          if ((a % 10) + b < 10) twoDigitProblems.push([a, b]);
        }
      }
      const selected = pick(twoDigitProblems, 6, lid * 9);
      for (const [a, b] of selected) {
        const ans = a + b;
        const display = `${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none",
          `${a} plus ${b}?`, "Wait.", `${ans}!`, `${a} plus ${b} is ${ans}.`, { answer: ans }));
      }
    } else {
      // Two-digit + tens (120-125)
      if (i === 14) {
        steps.push(showStep(`${num(35)} ${sym('+')} ${num(20)} ${sym('=')} ${q()}`, "none",
          "Thirty-five plus twenty. Add the tens: three tens plus two tens is five tens. The ones stay: five. Fifty-five!",
          "Point.", "Fifty-five!",
          "35 + 20: add tens (30+20=50), keep ones (5). Fifty-five.", { answer: 55 }));
      }
      const tensProblems = [];
      for (let a = 12; a <= 67; a += 5) {
        for (const b of [10,20,30]) {
          if (a + b <= 99) tensProblems.push([a, b]);
        }
      }
      const selected = pick(tensProblems, 6, lid * 9);
      for (const [a, b] of selected) {
        const ans = a + b;
        const display = `${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none",
          `${a} plus ${b}?`, "Wait.", `${ans}!`, `${a} plus ${b} is ${ans}.`, { answer: ans }));
      }
    }

    // Mixed review (4 steps)
    steps.push(addStep(pick([5,6,7,8], 1, lid * 11)[0], pick([2,3,4], 1, lid * 11)[0], "dots"));
    steps.push(subStep(pick([12,14,16,18], 1, lid * 13)[0], pick([3,5,7], 1, lid * 13)[0], "dots"));
    steps.push(dotsStep(pick([7,10,15,20], 1, lid * 15)[0], "How many dots?", "Wait.", "Correct!", "Good."));
    steps.push(addStep(pick([3,4,5], 1, lid * 17)[0], pick([3,4,5], 1, lid * 17)[0], "dots"));

    // Firm-up
    if (i < 4) {
      const [a, b] = pick([[8,5],[9,6],[7,4],[8,3]], 1, lid * 19)[0];
      steps.push(addStep(a, b, "dots"));
    } else if (i < 8) {
      const [a, b] = pick([[5,6],[6,7],[7,8]], 1, lid * 19)[0];
      steps.push(addStep(a, b, "dots"));
    } else {
      const [a, b] = i < 14 ? [pick([23,34,45], 1, lid * 19)[0], pick([3,4,5], 1, lid * 19)[0]] : [pick([25,38,44], 1, lid * 19)[0], pick([10,20], 1, lid * 19)[0]];
      const display = `${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${q()}`;
      steps.push(showStep(display, "none", `${a} plus ${b}?`, "Wait.", `${a + b}! Great!`, `${a + b}.`, { answer: a + b }));
    }

    let target;
    if (i < 4) target = "make 10";
    else if (i < 8) target = "doubles +1";
    else if (i < 14) target = "2-digit + 1-digit";
    else target = "2-digit + tens";
    if (lid === 125) target = "Phase 6 Review";

    lessons.push({ id: lid, title: `Lesson ${lid}`, target, phase: 6, steps });
  }

  return lessons;
}

// ─── Phase 7: Mastery (Lessons 126-150) ───

function generatePhase7() {
  const lessons = [];

  // 126-129: Two-digit + two-digit (no regrouping)
  // 130-134: Two-digit + two-digit (with regrouping)
  // 135-139: Two-digit - two-digit (no regrouping)
  // 140-144: Two-digit - two-digit (with regrouping)
  // 145-149: Word problems
  // 150: Final review

  for (let i = 0; i < 25; i++) {
    const lid = 126 + i;
    const steps = [];

    // Warm-up (4 steps)
    steps.push(addStep(pick([7,8,9], 1, lid)[0], pick([4,5,6], 1, lid)[0], "dots"));
    steps.push(subStep(pick([14,16,18], 1, lid * 3)[0], pick([5,6,7], 1, lid * 3)[0], "dots"));

    if (i >= 4) {
      // Review previous phase 7 type
      const prevA = pick([23,34,45,56], 1, lid * 5)[0];
      const prevB = pick([12,21,15,23], 1, lid * 5)[0];
      if (i < 9) {
        const display = `${num(prevA)} ${sym('+')} ${num(prevB)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none", `${prevA} plus ${prevB}?`, "Wait.", `${prevA + prevB}!`, `${prevA + prevB}.`, { answer: prevA + prevB }));
      } else if (i < 14) {
        const sa = pick([56,67,78], 1, lid * 5)[0];
        const sb = pick([12,23,34], 1, lid * 5)[0];
        const display = `${num(sa)} ${sym('−')} ${num(sb)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none", `${sa} minus ${sb}?`, "Wait.", `${sa - sb}!`, `${sa - sb}.`, { answer: sa - sb }));
      } else {
        steps.push(addStep(pick([5,6,7], 1, lid * 5)[0], pick([3,4,5], 1, lid * 5)[0], "dots"));
      }
    } else {
      steps.push(addStep(pick([5,6], 1, lid * 5)[0], pick([3,4], 1, lid * 5)[0], "dots"));
    }
    steps.push(showStep(num(pick([43,58,72,86,95], 1, lid * 7)[0]), "none", "What number?", "Wait.", "Correct!", "Good."));

    if (i < 4) {
      // Two-digit + two-digit, no regrouping (126-129)
      if (i === 0) {
        steps.push(showStep(`${num(34)} ${sym('+')} ${num(25)} ${sym('=')} ${q()}`, "none",
          "Thirty-four plus twenty-five. Add the ones: four plus five is nine. Add the tens: three plus two is five. Fifty-nine!",
          "Point to each digit.", "Fifty-nine!",
          "34 + 25: ones (4+5=9), tens (30+20=50). Fifty-nine.", { answer: 59 }));
      }
      const problems = [];
      for (let a = 21; a <= 54; a += 7) {
        for (let b = 12; b <= 43; b += 8) {
          if ((a % 10) + (b % 10) < 10 && a + b < 100) problems.push([a, b]);
        }
      }
      const selected = pick(problems, 7, lid * 9);
      for (const [a, b] of selected) {
        const display = `${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none", `${a} plus ${b}?`, "Wait.", `${a + b}!`, `${a + b}.`, { answer: a + b }));
      }
    } else if (i < 9) {
      // Two-digit + two-digit, with regrouping (130-134)
      if (i === 4) {
        steps.push(showStep(`${num(28)} ${sym('+')} ${num(15)} ${sym('=')} ${q()}`, "none",
          "Twenty-eight plus fifteen. Add the ones: eight plus five is thirteen. That's more than nine, so we 'regroup' — carry the extra ten. One ten carries over. Add the tens: two plus one is three, plus the carried one is four. Forty-three!",
          "Point.", "Forty-three! We carried the ten!",
          "28 + 15: ones (8+5=13, write 3, carry 1), tens (2+1+1=4). Forty-three.", { answer: 43 }));
      }
      const problems = [];
      for (let a = 15; a <= 59; a += 6) {
        for (let b = 13; b <= 48; b += 7) {
          if ((a % 10) + (b % 10) >= 10 && a + b < 100) problems.push([a, b]);
        }
      }
      const selected = pick(problems, 7, lid * 9);
      for (const [a, b] of selected) {
        const display = `${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none", `${a} plus ${b}? Remember to regroup if the ones add up to ten or more.`, "Wait.", `${a + b}!`, `${a + b}.`, { answer: a + b }));
      }
    } else if (i < 14) {
      // Two-digit - two-digit, no regrouping (135-139)
      if (i === 9) {
        steps.push(showStep(`${num(56)} ${sym('−')} ${num(23)} ${sym('=')} ${q()}`, "none",
          "Fifty-six minus twenty-three. Subtract the ones: six minus three is three. Subtract the tens: five minus two is three. Thirty-three!",
          "Point.", "Thirty-three!",
          "56 − 23: ones (6-3=3), tens (50-20=30). Thirty-three.", { answer: 33 }));
      }
      const problems = [];
      for (let a = 35; a <= 89; a += 6) {
        for (let b = 11; b <= a - 10; b += 8) {
          if ((a % 10) >= (b % 10)) problems.push([a, b]);
        }
      }
      const selected = pick(problems, 7, lid * 9);
      for (const [a, b] of selected) {
        const display = `${num(a)} ${sym('−')} ${num(b)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none", `${a} minus ${b}?`, "Wait.", `${a - b}!`, `${a - b}.`, { answer: a - b }));
      }
    } else if (i < 19) {
      // Two-digit - two-digit, with regrouping (140-144)
      if (i === 14) {
        steps.push(showStep(`${num(42)} ${sym('−')} ${num(17)} ${sym('=')} ${q()}`, "none",
          "Forty-two minus seventeen. Ones: two minus seven — we can't do that! Borrow a ten. Now it's twelve minus seven: five. Tens: three minus one is two. Twenty-five!",
          "Point.", "Twenty-five! We borrowed a ten!",
          "42 − 17: borrow (12-7=5 ones), tens (3-1=2). Twenty-five.", { answer: 25 }));
      }
      const problems = [];
      for (let a = 31; a <= 82; a += 5) {
        for (let b = 13; b <= a - 5; b += 7) {
          if ((a % 10) < (b % 10)) problems.push([a, b]);
        }
      }
      const selected = pick(problems, 7, lid * 9);
      for (const [a, b] of selected) {
        const display = `${num(a)} ${sym('−')} ${num(b)} ${sym('=')} ${q()}`;
        steps.push(showStep(display, "none", `${a} minus ${b}? You may need to borrow.`, "Wait.", `${a - b}!`, `${a - b}.`, { answer: a - b }));
      }
    } else if (i < 24) {
      // Word problems (145-149)
      const wordProblems = [
        { text: "Sam has 12 apples. He gives away 5. How many are left?", display: `${num(12)} ${sym('−')} ${num(5)} ${sym('=')} ${q()}`, answer: 7 },
        { text: "There are 8 birds in a tree. 6 more land. How many birds now?", display: `${num(8)} ${sym('+')} ${num(6)} ${sym('=')} ${q()}`, answer: 14 },
        { text: "A box has 15 crayons. 7 are broken. How many are not broken?", display: `${num(15)} ${sym('−')} ${num(7)} ${sym('=')} ${q()}`, answer: 8 },
        { text: "Emma reads 9 pages on Monday and 9 on Tuesday. How many total?", display: `${num(9)} ${sym('+')} ${num(9)} ${sym('=')} ${q()}`, answer: 18 },
        { text: "There are 20 chairs. 8 are taken. How many are empty?", display: `${num(20)} ${sym('−')} ${num(8)} ${sym('=')} ${q()}`, answer: 12 },
        { text: "A farmer has 34 eggs. He sells 12. How many are left?", display: `${num(34)} ${sym('−')} ${num(12)} ${sym('=')} ${q()}`, answer: 22 },
        { text: "One shelf has 25 books. Another has 14. How many altogether?", display: `${num(25)} ${sym('+')} ${num(14)} ${sym('=')} ${q()}`, answer: 39 },
        { text: "A jar has 43 marbles. 28 are blue. How many are not blue?", display: `${num(43)} ${sym('−')} ${num(28)} ${sym('=')} ${q()}`, answer: 15 },
        { text: "Class A has 17 students. Class B has 16. How many total?", display: `${num(17)} ${sym('+')} ${num(16)} ${sym('=')} ${q()}`, answer: 33 },
        { text: "A bus has 50 seats. 23 are taken. How many are empty?", display: `${num(50)} ${sym('−')} ${num(23)} ${sym('=')} ${q()}`, answer: 27 },
      ];

      if (i === 19) {
        steps.push(showStep("", "none",
          "Now we're going to solve word problems. Listen carefully, find the numbers, and decide if you add or subtract.",
          "Encourage the child.", "Let's do this!", "Word problems use the math you already know."));
      }

      const selected = pick(wordProblems, 6, lid * 9);
      for (const wp of selected) {
        steps.push(showStep(wp.display, "none",
          wp.text, "Read the problem. Wait for the child to work it out.",
          `${wp.answer}! Great thinking!`, `The answer is ${wp.answer}.`, { answer: wp.answer }));
      }
    } else {
      // Lesson 150: Final review — mixed everything
      steps.push(showStep("", "none",
        "This is it — the final lesson! Let's show what you know.", "Encourage the child.", "Let's go!", "Final review!"));
      steps.push(addStep(7, 8, "dots"));
      steps.push(subStep(16, 9, "dots"));
      const display1 = `${num(45)} ${sym('+')} ${num(23)} ${sym('=')} ${q()}`;
      steps.push(showStep(display1, "none", "45 plus 23?", "Wait.", "68!", "68.", { answer: 68 }));
      const display2 = `${num(37)} ${sym('+')} ${num(28)} ${sym('=')} ${q()}`;
      steps.push(showStep(display2, "none", "37 plus 28? Regroup!", "Wait.", "65!", "65.", { answer: 65 }));
      const display3 = `${num(76)} ${sym('−')} ${num(34)} ${sym('=')} ${q()}`;
      steps.push(showStep(display3, "none", "76 minus 34?", "Wait.", "42!", "42.", { answer: 42 }));
      const display4 = `${num(52)} ${sym('−')} ${num(27)} ${sym('=')} ${q()}`;
      steps.push(showStep(display4, "none", "52 minus 27? Borrow!", "Wait.", "25!", "25.", { answer: 25 }));
      steps.push(showStep("", "none", "A store has 36 apples. 19 are sold. How many are left?", "Wait.", "17! You're a math master!", "36 minus 19 is 17.", { answer: 17 }));
    }

    // Mixed review (3 steps)
    steps.push(addStep(pick([5,6,7,8], 1, lid * 11)[0], pick([3,4,5], 1, lid * 11)[0], "dots"));
    steps.push(subStep(pick([12,15,18], 1, lid * 13)[0], pick([4,6,8], 1, lid * 13)[0], "dots"));
    steps.push(dotsStep(pick([8,13,17,20], 1, lid * 15)[0], "How many dots?", "Wait.", "Correct!", "Good."));

    // Firm-up
    if (i < 4) {
      const a = pick([32,44,53], 1, lid * 17)[0];
      const b = pick([15,23,31], 1, lid * 17)[0];
      if ((a%10)+(b%10) < 10 && a+b < 100) {
        const d = `${num(a)} ${sym('+')} ${num(b)} ${sym('=')} ${q()}`;
        steps.push(showStep(d, "none", `${a} plus ${b}?`, "Wait.", `${a+b}! Great!`, `${a+b}.`, { answer: a+b }));
      } else {
        steps.push(addStep(pick([4,5,6], 1, lid * 17)[0], pick([3,4], 1, lid * 17)[0], "dots"));
      }
    } else {
      steps.push(addStep(pick([6,7,8], 1, lid * 17)[0], pick([4,5], 1, lid * 17)[0], "dots"));
    }

    let target;
    if (i < 4) target = "2-digit + 2-digit";
    else if (i < 9) target = "regrouping (carrying)";
    else if (i < 14) target = "2-digit − 2-digit";
    else if (i < 19) target = "regrouping (borrowing)";
    else if (i < 24) target = "word problems";
    else target = "Final Review";
    if (lid === 150) target = "Math Master!";

    lessons.push({ id: lid, title: `Lesson ${lid}`, target, phase: 7, steps });
  }

  return lessons;
}

// ─── Generate all lessons ───

const allLessons = [
  ...generatePhase1(),
  ...generatePhase2(),
  ...generatePhase3(),
  ...generatePhase4(),
  ...generatePhase5(),
  ...generatePhase6(),
  ...generatePhase7(),
];

// Validate
let errors = 0;
for (const l of allLessons) {
  if (l.steps.length < 15) {
    console.error(`WARNING: Lesson ${l.id} has only ${l.steps.length} steps (target: 15-22)`);
    errors++;
  }
  if (l.steps.length > 25) {
    console.error(`WARNING: Lesson ${l.id} has ${l.steps.length} steps (target: 15-22)`);
    errors++;
  }
}

// Stats
let totalSteps = 0;
let minSteps = Infinity;
let maxSteps = 0;
for (const l of allLessons) {
  totalSteps += l.steps.length;
  if (l.steps.length < minSteps) minSteps = l.steps.length;
  if (l.steps.length > maxSteps) maxSteps = l.steps.length;
}
console.log(`Generated ${allLessons.length} lessons, ${totalSteps} total steps`);
console.log(`Average: ${(totalSteps / allLessons.length).toFixed(1)} steps/lesson`);
console.log(`Range: ${minSteps}-${maxSteps} steps`);
if (errors) console.log(`${errors} warnings`);

// Output
const output = `export default ${JSON.stringify(allLessons, null, 2)};\n`;
import fs from 'fs';
fs.writeFileSync('src/_data/lessons.js', output);
console.log('Wrote src/_data/lessons.js');
