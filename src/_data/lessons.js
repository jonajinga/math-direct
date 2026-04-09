export default [
  // ═══════════════════════════════════════════════════
  // PHASE 1: FOUNDATION — Lessons 1-20
  // Numbers 0-10, counting, comparing
  // ═══════════════════════════════════════════════════

  {
    id: 1,
    title: "Lesson 1",
    target: "0, 1",
    phase: 1,
    steps: [
      {
        display: "<span class='math-num'>0</span>",
        visual: "none",
        action: "show",
        say: "This is the number zero. Zero means nothing — no objects, no dots, nothing at all. Say 'zero'.",
        do: "Point to the number on screen.",
        praise: "Good! Zero means nothing!",
        correct: "This is zero. It means nothing. Say 'zero'.",
      },
      {
        display: "<span class='math-num'>0</span>",
        visual: "none",
        action: "show",
        say: "How many dots do you see? Zero. There are no dots. Zero means none.",
        do: "Gesture at the empty space below the number.",
        praise: "That's right — zero dots. Nothing there!",
        correct: "There are no dots. That's zero. Zero means none.",
      },
      {
        display: "<span class='math-num'>1</span>",
        visual: "dots",
        dotCount: 1,
        action: "count",
        say: "This is the number one. One means this many. Count the dot: one.",
        do: "Point to the dot, then the number.",
        praise: "Yes! One dot. One!",
        correct: "This is one. Count the dot: one. Say 'one'.",
      },
      {
        display: "<span class='math-num'>1</span>",
        visual: "dots",
        dotCount: 1,
        action: "count",
        say: "Your turn. What number is this? How many dots?",
        do: "Point to the number, then the dot. Wait for the child to say 'one'.",
        praise: "That's right! One!",
        correct: "This is one. One dot. Say 'one'.",
      },
      {
        display: "<span class='math-num'>0</span> &nbsp;&nbsp; <span class='math-num'>1</span>",
        visual: "none",
        action: "show",
        say: "Here are two numbers. Point to zero. Now point to one. Zero, one.",
        do: "Point to each number as you say it.",
        praise: "Great job! Zero, one!",
        correct: "This is zero. This is one. Zero, one.",
      },
      {
        display: "<span class='math-num'>1</span>",
        visual: "dots",
        dotCount: 1,
        action: "show",
        say: "What number is this? How many dots?",
        do: "Point to the number. Wait for the child to respond.",
        praise: "One! You got it!",
        correct: "This is one. One dot.",
      },
    ],
  },
  {
    id: 2,
    title: "Lesson 2",
    target: "2",
    phase: 1,
    steps: [
      {
        display: "<span class='math-num'>0</span> &nbsp;&nbsp; <span class='math-num'>1</span>",
        visual: "none",
        action: "show",
        say: "Let's review. What number is this? And this one?",
        do: "Point to 0, then 1. Wait for the child.",
        praise: "Good! Zero and one!",
        correct: "Zero. One. Say them with me: zero, one.",
      },
      {
        display: "<span class='math-num'>2</span>",
        visual: "dots",
        dotCount: 2,
        action: "count",
        say: "This is the number two. Two means this many. Let's count the dots: one, two.",
        do: "Point to each dot as you count.",
        praise: "Two dots! Two!",
        correct: "Let's count together. One, two. This is two.",
      },
      {
        display: "<span class='math-num'>2</span>",
        visual: "dots",
        dotCount: 2,
        action: "count",
        say: "Your turn. What number is this? Count the dots.",
        do: "Wait for the child to count and say 'two'.",
        praise: "That's right! One, two — two!",
        correct: "Count with me: one, two. The number is two.",
      },
      {
        display: "<span class='math-num'>0</span> &nbsp;&nbsp; <span class='math-num'>1</span> &nbsp;&nbsp; <span class='math-num'>2</span>",
        visual: "none",
        action: "show",
        say: "Here are three numbers in order. Let's say them: zero, one, two.",
        do: "Point to each number as you say it.",
        praise: "Zero, one, two — great counting!",
        correct: "Zero, one, two. Say them with me.",
      },
      {
        display: "<span class='math-num'>2</span>",
        visual: "dots",
        dotCount: 2,
        action: "show",
        say: "What number is this?",
        do: "Point to the number. Wait.",
        praise: "Two! You know it!",
        correct: "This is two. Two dots. Two.",
      },
    ],
  },
  {
    id: 3,
    title: "Lesson 3",
    target: "3",
    phase: 1,
    steps: [
      {
        display: "<span class='math-num'>0</span> &nbsp;&nbsp; <span class='math-num'>1</span> &nbsp;&nbsp; <span class='math-num'>2</span>",
        visual: "none",
        action: "show",
        say: "Review time. Say these numbers: zero, one, two.",
        do: "Point to each number. Wait for the child.",
        praise: "Good! Zero, one, two!",
        correct: "Zero, one, two. Let's say them together.",
      },
      {
        display: "<span class='math-num'>3</span>",
        visual: "dots",
        dotCount: 3,
        action: "count",
        say: "This is the number three. Three means this many. Count: one, two, three.",
        do: "Point to each dot as you count.",
        praise: "Three! You counted three dots!",
        correct: "Let's count together: one, two, three. This is three.",
      },
      {
        display: "<span class='math-num'>3</span>",
        visual: "dots",
        dotCount: 3,
        action: "count",
        say: "Your turn. How many dots? What number?",
        do: "Wait for the child to count and say 'three'.",
        praise: "One, two, three — that's right!",
        correct: "Count with me: one, two, three. The number is three.",
      },
      {
        display: "<span class='math-num'>1</span>",
        visual: "dots",
        dotCount: 1,
        action: "show",
        say: "Quick review — what number?",
        do: "Point to the number.",
        praise: "One!",
        correct: "This is one.",
      },
      {
        display: "<span class='math-num'>2</span>",
        visual: "dots",
        dotCount: 2,
        action: "show",
        say: "What number?",
        do: "Point to the number.",
        praise: "Two!",
        correct: "This is two.",
      },
      {
        display: "<span class='math-num'>3</span>",
        visual: "dots",
        dotCount: 3,
        action: "show",
        say: "What number?",
        do: "Point to the number.",
        praise: "Three!",
        correct: "This is three.",
      },
      {
        display: "<span class='math-num'>0</span> &nbsp; <span class='math-num'>1</span> &nbsp; <span class='math-num'>2</span> &nbsp; <span class='math-num'>3</span>",
        visual: "none",
        action: "show",
        say: "Let's count from zero to three. Zero, one, two, three.",
        do: "Point to each number in order.",
        praise: "Zero, one, two, three — excellent!",
        correct: "Zero, one, two, three. Say them with me.",
      },
    ],
  },
  {
    id: 4,
    title: "Lesson 4",
    target: "equals (=)",
    phase: 1,
    steps: [
      {
        display: "<span class='math-num'>1</span> &nbsp; <span class='math-num'>2</span> &nbsp; <span class='math-num'>3</span>",
        visual: "none",
        action: "show",
        say: "Quick review — say these numbers.",
        do: "Point to each number.",
        praise: "One, two, three!",
        correct: "One, two, three.",
      },
      {
        display: "<span class='math-num'>2</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022 \u2022</span>",
        visual: "equation",
        action: "show",
        say: "This is a new symbol. It's called 'equals'. It means 'is the same as'. Two equals two dots. They are the same amount.",
        do: "Point to the = sign, then from the number to the dots.",
        praise: "That's right — two and two dots are the same!",
        correct: "This means 'equals' — is the same as. Two equals two dots.",
      },
      {
        display: "<span class='math-num'>3</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022 \u2022 \u2022</span>",
        visual: "equation",
        action: "show",
        say: "Three equals three dots. They are the same. How many dots? Three.",
        do: "Point to the number, the equals sign, then the dots.",
        praise: "Three equals three dots!",
        correct: "Count the dots: one, two, three. Three equals three dots.",
      },
      {
        display: "<span class='math-num'>1</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022</span>",
        visual: "equation",
        action: "show",
        say: "Your turn. What does this say?",
        do: "Point to the equation. Wait.",
        praise: "One equals one dot — perfect!",
        correct: "One equals one dot. They are the same.",
      },
      {
        display: "<span class='math-symbol'>=</span>",
        visual: "none",
        action: "show",
        say: "What is this symbol called?",
        do: "Point to the equals sign. Wait.",
        praise: "Equals! It means 'is the same as'!",
        correct: "This is called 'equals'. It means 'is the same as'.",
      },
    ],
  },
  {
    id: 5,
    title: "Lesson 5",
    target: "4",
    phase: 1,
    steps: [
      {
        display: "<span class='math-num'>0</span> &nbsp; <span class='math-num'>1</span> &nbsp; <span class='math-num'>2</span> &nbsp; <span class='math-num'>3</span>",
        visual: "none",
        action: "show",
        say: "Count with me: zero, one, two, three.",
        do: "Point to each number.",
        praise: "Good counting!",
        correct: "Zero, one, two, three.",
      },
      {
        display: "<span class='math-num'>4</span>",
        visual: "dots",
        dotCount: 4,
        action: "count",
        say: "New number! This is four. Count the dots: one, two, three, four.",
        do: "Point to each dot as you count.",
        praise: "Four! One, two, three, four!",
        correct: "Let's count: one, two, three, four. This is four.",
      },
      {
        display: "<span class='math-num'>4</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022\u2022 \u2022\u2022</span>",
        visual: "equation",
        action: "show",
        say: "Four equals four dots. Count them.",
        do: "Point from number to dots.",
        praise: "Four equals four dots!",
        correct: "One, two, three, four. Four equals four dots.",
      },
      {
        display: "<span class='math-num'>4</span>",
        visual: "dots",
        dotCount: 4,
        action: "show",
        say: "Your turn. What number? How many dots?",
        do: "Wait for the child.",
        praise: "Four!",
        correct: "This is four. Four dots.",
      },
      {
        display: "<span class='math-num'>0</span> &nbsp; <span class='math-num'>1</span> &nbsp; <span class='math-num'>2</span> &nbsp; <span class='math-num'>3</span> &nbsp; <span class='math-num'>4</span>",
        visual: "none",
        action: "show",
        say: "Count from zero to four.",
        do: "Point to each number.",
        praise: "Zero, one, two, three, four — great!",
        correct: "Zero, one, two, three, four.",
      },
    ],
  },

  // Lesson 6: Review 0-4
  {
    id: 6,
    title: "Lesson 6",
    target: "Review 0-4",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>3</span>", visual: "dots", dotCount: 3, action: "show", say: "What number?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>1</span>", visual: "dots", dotCount: 1, action: "show", say: "What number?", do: "Wait.", praise: "One!", correct: "One." },
      { display: "<span class='math-num'>4</span>", visual: "dots", dotCount: 4, action: "show", say: "What number?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>0</span>", visual: "none", action: "show", say: "What number? How many dots?", do: "Wait.", praise: "Zero — nothing!", correct: "Zero means nothing." },
      { display: "<span class='math-num'>2</span>", visual: "dots", dotCount: 2, action: "show", say: "What number?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "<span class='math-num'>0</span> &nbsp; <span class='math-num'>1</span> &nbsp; <span class='math-num'>2</span> &nbsp; <span class='math-num'>3</span> &nbsp; <span class='math-num'>4</span>", visual: "none", action: "show", say: "Count them all.", do: "Point in order.", praise: "Zero, one, two, three, four!", correct: "Zero, one, two, three, four." },
    ],
  },

  // Lesson 7: Introduce 5
  {
    id: 7,
    title: "Lesson 7",
    target: "5",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>3</span> &nbsp; <span class='math-num'>4</span>", visual: "none", action: "show", say: "Quick review. What are these numbers?", do: "Point to each.", praise: "Three and four!", correct: "Three, four." },
      { display: "<span class='math-num'>5</span>", visual: "dots", dotCount: 5, action: "count", say: "New number! This is five. Count: one, two, three, four, five.", do: "Point to each dot.", praise: "Five!", correct: "One, two, three, four, five. This is five." },
      { display: "<span class='math-num'>5</span>", visual: "dots", dotCount: 5, action: "show", say: "Your turn. How many?", do: "Wait.", praise: "Five — you got it!", correct: "Five." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022\u2022\u2022 \u2022\u2022</span>", visual: "equation", action: "show", say: "Five equals five dots.", do: "Point from number to dots.", praise: "Five equals five!", correct: "Five equals five dots." },
      { display: "Count: 0 to 5", visual: "numberline", nlStart: 0, nlEnd: 5, action: "show", say: "Count from zero to five.", do: "Point to each number on the number line.", praise: "Zero through five — excellent!", correct: "Zero, one, two, three, four, five." },
    ],
  },

  // Lesson 8: Review 0-5
  {
    id: 8,
    title: "Lesson 8",
    target: "Review 0-5",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>5</span>", visual: "dots", dotCount: 5, action: "show", say: "What number?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>2</span>", visual: "dots", dotCount: 2, action: "show", say: "What number?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "<span class='math-num'>4</span>", visual: "dots", dotCount: 4, action: "show", say: "What number?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>0</span>", visual: "none", action: "show", say: "What number?", do: "Wait.", praise: "Zero!", correct: "Zero." },
      { display: "<span class='math-num'>3</span>", visual: "dots", dotCount: 3, action: "show", say: "What number?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>1</span>", visual: "dots", dotCount: 1, action: "show", say: "What number?", do: "Wait.", praise: "One!", correct: "One." },
    ],
  },

  // Lesson 9: Introduce 6
  {
    id: 9,
    title: "Lesson 9",
    target: "6",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>4</span> &nbsp; <span class='math-num'>5</span>", visual: "none", action: "show", say: "Review: what numbers?", do: "Point.", praise: "Four and five!", correct: "Four, five." },
      { display: "<span class='math-num'>6</span>", visual: "dots", dotCount: 6, action: "count", say: "New number! This is six. Count: one, two, three, four, five, six.", do: "Point to each dot.", praise: "Six!", correct: "One, two, three, four, five, six. Six." },
      { display: "<span class='math-num'>6</span>", visual: "dots", dotCount: 6, action: "show", say: "How many dots?", do: "Wait.", praise: "Six!", correct: "Six dots. Six." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022\u2022\u2022 \u2022\u2022\u2022</span>", visual: "equation", action: "show", say: "Six equals six dots.", do: "Point.", praise: "Six equals six!", correct: "Six equals six dots." },
      { display: "Count: 0 to 6", visual: "numberline", nlStart: 0, nlEnd: 6, action: "show", say: "Count from zero to six.", do: "Point to each number on the number line.", praise: "Perfect counting!", correct: "Zero, one, two, three, four, five, six." },
    ],
  },

  // Lesson 10: Review 0-6
  {
    id: 10,
    title: "Lesson 10",
    target: "Review 0-6",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>6</span>", visual: "dots", dotCount: 6, action: "show", say: "What number?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>3</span>", visual: "dots", dotCount: 3, action: "show", say: "What number?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>5</span>", visual: "tally", dotCount: 5, action: "show", say: "Here is another way to show five — tally marks! Four lines with a slash through them means five. What number?", do: "Point to the tally marks.", praise: "Five! The slash makes a group of five!", correct: "Four marks with a slash is five." },
      { display: "<span class='math-num'>1</span>", visual: "dots", dotCount: 1, action: "show", say: "What number?", do: "Wait.", praise: "One!", correct: "One." },
      { display: "<span class='math-num'>4</span>", visual: "tally", dotCount: 4, action: "show", say: "How many tally marks? No slash this time — it's not five yet.", do: "Wait.", praise: "Four!", correct: "Four marks, no slash. Four." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022 \u2022</span>", visual: "equation", action: "show", say: "Read this.", do: "Wait.", praise: "Two equals two dots!", correct: "Two equals two dots." },
    ],
  },

  // Lesson 11: Introduce 7
  {
    id: 11,
    title: "Lesson 11",
    target: "7",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>5</span> &nbsp; <span class='math-num'>6</span>", visual: "none", action: "show", say: "Review: what numbers?", do: "Point.", praise: "Five and six!", correct: "Five, six." },
      { display: "<span class='math-num'>7</span>", visual: "dots", dotCount: 7, action: "count", say: "New number! This is seven. Count: one, two, three, four, five, six, seven.", do: "Point to each dot.", praise: "Seven!", correct: "Count with me: one through seven. Seven." },
      { display: "<span class='math-num'>7</span>", visual: "dots", dotCount: 7, action: "show", say: "How many dots?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "Count: 0 to 7", visual: "numberline", nlStart: 0, nlEnd: 7, action: "show", say: "Count zero to seven.", do: "Point to each number on the number line.", praise: "Zero through seven!", correct: "Zero, one, two, three, four, five, six, seven." },
    ],
  },

  // Lesson 12: Review 0-7
  {
    id: 12,
    title: "Lesson 12",
    target: "Review 0-7",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>7</span>", visual: "dots", dotCount: 7, action: "show", say: "What number?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>4</span>", visual: "dots", dotCount: 4, action: "show", say: "What number?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>6</span>", visual: "dots", dotCount: 6, action: "show", say: "What number?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>2</span>", visual: "dots", dotCount: 2, action: "show", say: "What number?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "<span class='math-num'>5</span>", visual: "dots", dotCount: 5, action: "show", say: "What number?", do: "Wait.", praise: "Five!", correct: "Five." },
    ],
  },

  // Lesson 13: Introduce 8
  {
    id: 13,
    title: "Lesson 13",
    target: "8",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>6</span> &nbsp; <span class='math-num'>7</span>", visual: "none", action: "show", say: "Review: what numbers?", do: "Point.", praise: "Six and seven!", correct: "Six, seven." },
      { display: "<span class='math-num'>8</span>", visual: "dots", dotCount: 8, action: "count", say: "New number! This is eight. Count the dots: one, two, three, four, five, six, seven, eight.", do: "Point to each dot.", praise: "Eight!", correct: "Count with me: one through eight. Eight." },
      { display: "<span class='math-num'>8</span>", visual: "dots", dotCount: 8, action: "show", say: "How many?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022</span>", visual: "equation", action: "show", say: "Eight equals eight dots.", do: "Point.", praise: "Eight equals eight!", correct: "Eight equals eight dots." },
    ],
  },

  // Lesson 14: Review 0-8
  {
    id: 14,
    title: "Lesson 14",
    target: "Review 0-8",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>8</span>", visual: "dots", dotCount: 8, action: "show", say: "What number?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span>", visual: "dots", dotCount: 3, action: "show", say: "What number?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>7</span>", visual: "dots", dotCount: 7, action: "show", say: "What number?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>5</span>", visual: "dots", dotCount: 5, action: "show", say: "What number?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>1</span>", visual: "dots", dotCount: 1, action: "show", say: "What number?", do: "Wait.", praise: "One!", correct: "One." },
    ],
  },

  // Lesson 15: Introduce 9
  {
    id: 15,
    title: "Lesson 15",
    target: "9",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>7</span> &nbsp; <span class='math-num'>8</span>", visual: "none", action: "show", say: "Review: what numbers?", do: "Point.", praise: "Seven and eight!", correct: "Seven, eight." },
      { display: "<span class='math-num'>9</span>", visual: "dots", dotCount: 9, action: "count", say: "New number! This is nine. Count: one, two, three, four, five, six, seven, eight, nine.", do: "Point to each dot.", praise: "Nine!", correct: "Count with me. Nine." },
      { display: "<span class='math-num'>9</span>", visual: "dots", dotCount: 9, action: "show", say: "How many?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "Count: 0 to 9", visual: "numberline", nlStart: 0, nlEnd: 9, action: "show", say: "Count zero to nine.", do: "Point to each number on the number line.", praise: "All the way to nine!", correct: "Zero through nine." },
    ],
  },

  // Lesson 16: Review 0-9
  {
    id: 16,
    title: "Lesson 16",
    target: "Review 0-9",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>9</span>", visual: "dots", dotCount: 9, action: "show", say: "What number?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>6</span>", visual: "dots", dotCount: 6, action: "show", say: "What number?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>4</span>", visual: "dots", dotCount: 4, action: "show", say: "What number?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>8</span>", visual: "dots", dotCount: 8, action: "show", say: "What number?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>2</span>", visual: "dots", dotCount: 2, action: "show", say: "What number?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "<span class='math-num'>7</span>", visual: "dots", dotCount: 7, action: "show", say: "What number?", do: "Wait.", praise: "Seven!", correct: "Seven." },
    ],
  },

  // Lesson 17: Introduce 10
  {
    id: 17,
    title: "Lesson 17",
    target: "10",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>8</span> &nbsp; <span class='math-num'>9</span>", visual: "none", action: "show", say: "Review: what numbers?", do: "Point.", praise: "Eight and nine!", correct: "Eight, nine." },
      { display: "<span class='math-num'>10</span>", visual: "dots", dotCount: 10, action: "count", say: "New number! This is ten. It's special — it uses two digits: a 1 and a 0. Count the dots: one, two, three, four, five, six, seven, eight, nine, ten.", do: "Point to each dot.", praise: "Ten! The big one-zero!", correct: "Count with me. Ten." },
      { display: "<span class='math-num'>10</span>", visual: "dots", dotCount: 10, action: "show", say: "How many dots?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "Count: 0 to 10", visual: "numberline", nlStart: 0, nlEnd: 10, action: "show", say: "Count from zero all the way to ten!", do: "Point to each number on the number line.", praise: "Zero to ten — amazing!", correct: "Zero, one, two, three, four, five, six, seven, eight, nine, ten." },
    ],
  },

  // Lesson 18: Introduce > and <
  {
    id: 18,
    title: "Lesson 18",
    target: ">, <",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>3</span> &nbsp;&nbsp; <span class='math-num'>7</span>", visual: "dots", dotCount: 0, action: "show", say: "Look at these two numbers: 3 and 7. Which is more?", do: "Point to each number.", praise: "Seven is more!", correct: "Seven is more than three." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>&lt;</span> <span class='math-num'>7</span>", visual: "none", action: "show", say: "This symbol means 'less than'. Three is less than seven. The pointy end points to the smaller number.", do: "Point to the < symbol.", praise: "Three is less than seven!", correct: "Three is less than seven. The point aims at the smaller number." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>&gt;</span> <span class='math-num'>3</span>", visual: "none", action: "show", say: "This symbol means 'greater than'. Seven is greater than three. The open end faces the bigger number.", do: "Point to the > symbol.", praise: "Seven is greater than three!", correct: "Seven is greater than three. The open end faces the bigger number." },
      { display: "<span class='math-num'>5</span> &nbsp; <span class='math-symbol-question'>?</span> &nbsp; <span class='math-num'>2</span>", visual: "compare", compareAnswer: ">", action: "show", say: "Which symbol goes here? Tap the right answer. Is 5 more or less than 2?", do: "Let the child tap >, <, or =.", praise: "Greater than! 5 > 2!", correct: "Five is more, so 5 is greater than 2. 5 > 2." },
      { display: "<span class='math-num'>4</span> &nbsp; <span class='math-symbol-question'>?</span> &nbsp; <span class='math-num'>9</span>", visual: "compare", compareAnswer: "<", action: "show", say: "What about 4 and 9? Tap the right symbol.", do: "Let the child tap.", praise: "Less than! 4 < 9!", correct: "Four is less than nine. 4 < 9." },
    ],
  },

  // Lesson 19: Review comparing
  {
    id: 19,
    title: "Lesson 19",
    target: "Review comparing",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>6</span> &nbsp; <span class='math-symbol-question'>?</span> &nbsp; <span class='math-num'>8</span>", visual: "compare", compareAnswer: "<", action: "show", say: "Tap the right symbol.", do: "Let the child tap.", praise: "6 < 8! Less than!", correct: "Six is less than eight." },
      { display: "<span class='math-num'>10</span> &nbsp; <span class='math-symbol-question'>?</span> &nbsp; <span class='math-num'>3</span>", visual: "compare", compareAnswer: ">", action: "show", say: "Tap the right symbol.", do: "Let the child tap.", praise: "10 > 3! Greater than!", correct: "Ten is greater than three." },
      { display: "<span class='math-num'>5</span> &nbsp; <span class='math-symbol-question'>?</span> &nbsp; <span class='math-num'>5</span>", visual: "compare", compareAnswer: "=", action: "show", say: "5 and 5. They are the same! Which symbol? Tap it.", do: "Let the child tap.", praise: "5 = 5! Equals!", correct: "Five equals five. They are the same." },
      { display: "<span class='math-num'>7</span> &nbsp; <span class='math-symbol-question'>?</span> &nbsp; <span class='math-num'>1</span>", visual: "compare", compareAnswer: ">", action: "show", say: "Tap the right symbol.", do: "Let the child tap.", praise: "7 > 1!", correct: "Seven is greater than one." },
    ],
  },

  // Lesson 20: Phase 1 Review
  {
    id: 20,
    title: "Lesson 20",
    target: "Phase 1 Review",
    phase: 1,
    steps: [
      { display: "Count: 0 to 10", visual: "numberline", nlStart: 0, nlEnd: 10, action: "show", say: "Count from zero to ten!", do: "Point to each number on the number line.", praise: "Zero to ten — you know them all!", correct: "Zero through ten." },
      { display: "<span class='math-num'>8</span>", visual: "dots", dotCount: 8, action: "show", say: "What number?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span>", visual: "dots", dotCount: 3, action: "show", say: "What number?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022\u2022\u2022 \u2022\u2022\u2022</span>", visual: "equation", action: "show", say: "Read this.", do: "Wait.", praise: "Six equals six dots!", correct: "Six equals six dots." },
      { display: "<span class='math-num'>4</span> &nbsp; <span class='math-symbol-question'>?</span> &nbsp; <span class='math-num'>9</span>", visual: "compare", compareAnswer: "<", action: "show", say: "Tap the right symbol.", do: "Let the child tap.", praise: "4 < 9! Less than!", correct: "Four is less than nine." },
      { display: "Count back: 10 to 0", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 10, action: "show", say: "Now count backward from ten to zero!", do: "Point to each number on the number line, right to left.", praise: "Ten, nine, eight, seven, six, five, four, three, two, one, zero! Phase 1 complete!", correct: "Ten, nine, eight, seven, six, five, four, three, two, one, zero." },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 2: COUNTING & COMPARING — Lessons 21-40
  // Numbers 11-20, patterns, intro to +, number line
  // ═══════════════════════════════════════════════════

  // Lesson 21: Introduce 11
  {
    id: 21,
    title: "Lesson 21",
    target: "11",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>10</span>", visual: "dots", dotCount: 10, action: "show", say: "Review. What number is this? How many dots?", do: "Point to the number and dots.", praise: "Ten!", correct: "This is ten. Ten dots." },
      { display: "<span class='math-num'>11</span>", visual: "dots", dotCount: 11, action: "count", say: "New number! This is eleven. Eleven is ten and one more. Count: one, two, three... all the way to eleven.", do: "Point to each dot as you count.", praise: "Eleven! Ten and one more!", correct: "Let's count together. One through eleven. This is eleven." },
      { display: "<span class='math-num'>11</span>", visual: "dots", dotCount: 11, action: "show", say: "Your turn. What number? How many dots?", do: "Wait for the child.", praise: "Eleven!", correct: "This is eleven. Eleven dots." },
      { display: "<span class='math-num'>10</span> &nbsp; <span class='math-num'>11</span>", visual: "none", action: "show", say: "Ten, eleven. What comes after ten?", do: "Point to each number.", praise: "Eleven comes after ten!", correct: "After ten comes eleven. Ten, eleven." },
      { display: "<span class='math-num'>11</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>1</span>", visual: "equation", dotGroups: [10, 1], groupSymbols: ["+"], action: "show", say: "Eleven equals ten plus one. Eleven is ten and one more. Look at the dots — a full ten, plus one more.", do: "Point to each part of the equation, then the dot groups.", praise: "Eleven is ten plus one!", correct: "Eleven equals ten plus one." },
    ],
  },

  // Lesson 22: Introduce 12
  {
    id: 22,
    title: "Lesson 22",
    target: "12",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>11</span>", visual: "dots", dotCount: 11, action: "show", say: "Review. What number?", do: "Wait.", praise: "Eleven!", correct: "Eleven." },
      { display: "<span class='math-num'>12</span>", visual: "dots", dotCount: 12, action: "count", say: "New number! This is twelve. Twelve is ten and two more. Count the dots.", do: "Point to each dot.", praise: "Twelve!", correct: "Count with me. Twelve." },
      { display: "<span class='math-num'>12</span>", visual: "dots", dotCount: 12, action: "show", say: "How many dots?", do: "Wait.", praise: "Twelve!", correct: "Twelve dots." },
      { display: "<span class='math-num'>12</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>2</span>", visual: "equation", action: "show", say: "Twelve equals ten plus two.", do: "Point to each part.", praise: "Ten plus two is twelve!", correct: "Twelve equals ten plus two." },
      { display: "<span class='math-num'>10</span> &nbsp; <span class='math-num'>11</span> &nbsp; <span class='math-num'>12</span>", visual: "none", action: "show", say: "Count: ten, eleven, twelve.", do: "Point in order.", praise: "Ten, eleven, twelve!", correct: "Ten, eleven, twelve." },
    ],
  },

  // Lesson 23: Introduce 13
  {
    id: 23,
    title: "Lesson 23",
    target: "13",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>11</span> &nbsp; <span class='math-num'>12</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Eleven, twelve!", correct: "Eleven, twelve." },
      { display: "<span class='math-num'>13</span>", visual: "dots", dotCount: 13, action: "count", say: "New number! This is thirteen. Thirteen is ten and three. The name 'thirteen' has 'three' in it — thir-teen.", do: "Point to each dot.", praise: "Thirteen! Ten and three!", correct: "Thirteen. Count with me." },
      { display: "<span class='math-num'>13</span>", visual: "dots", dotCount: 13, action: "show", say: "What number? How many dots?", do: "Wait.", praise: "Thirteen!", correct: "Thirteen." },
      { display: "<span class='math-num'>13</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>3</span>", visual: "equation", action: "show", say: "Thirteen equals ten plus three.", do: "Point.", praise: "Ten plus three is thirteen!", correct: "Thirteen equals ten plus three." },
      { display: "Count: 10 to 13", visual: "numberline", nlStart: 10, nlEnd: 13, action: "show", say: "Count from ten to thirteen.", do: "Point to each number on the number line.", praise: "Ten through thirteen!", correct: "Ten, eleven, twelve, thirteen." },
    ],
  },

  // Lesson 24: Introduce 14
  {
    id: 24,
    title: "Lesson 24",
    target: "14",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>12</span> &nbsp; <span class='math-num'>13</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Twelve, thirteen!", correct: "Twelve, thirteen." },
      { display: "<span class='math-num'>14</span>", visual: "dots", dotCount: 14, action: "count", say: "New number! This is fourteen. Fourteen is ten and four. 'Four-teen' — hear the 'four'?", do: "Point to dots.", praise: "Fourteen!", correct: "Fourteen. Count with me." },
      { display: "<span class='math-num'>14</span>", visual: "dots", dotCount: 14, action: "show", say: "What number?", do: "Wait.", praise: "Fourteen!", correct: "Fourteen." },
      { display: "<span class='math-num'>14</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>4</span>", visual: "equation", action: "show", say: "Fourteen equals ten plus four.", do: "Point.", praise: "Ten plus four!", correct: "Fourteen equals ten plus four." },
    ],
  },

  // Lesson 25: Introduce 15, review 11-15
  {
    id: 25,
    title: "Lesson 25",
    target: "15, review 11-15",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>13</span> &nbsp; <span class='math-num'>14</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Thirteen, fourteen!", correct: "Thirteen, fourteen." },
      { display: "<span class='math-num'>15</span>", visual: "dots", dotCount: 15, action: "count", say: "New number! This is fifteen. Fifteen is ten and five. 'Fif-teen' — hear the 'five'?", do: "Point to dots.", praise: "Fifteen!", correct: "Fifteen. Count with me." },
      { display: "<span class='math-num'>15</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>5</span>", visual: "equation", action: "show", say: "Fifteen equals ten plus five.", do: "Point.", praise: "Ten plus five is fifteen!", correct: "Fifteen equals ten plus five." },
      { display: "<span class='math-num'>11</span>", visual: "dots", dotCount: 11, action: "show", say: "Quick review. What number?", do: "Wait.", praise: "Eleven!", correct: "Eleven." },
      { display: "<span class='math-num'>13</span>", visual: "dots", dotCount: 13, action: "show", say: "What number?", do: "Wait.", praise: "Thirteen!", correct: "Thirteen." },
      { display: "<span class='math-num'>14</span>", visual: "dots", dotCount: 14, action: "show", say: "What number?", do: "Wait.", praise: "Fourteen!", correct: "Fourteen." },
      { display: "Count: 10 to 15", visual: "numberline", nlStart: 10, nlEnd: 15, action: "show", say: "Count from ten to fifteen.", do: "Point to each number on the number line.", praise: "Ten through fifteen — great!", correct: "Ten, eleven, twelve, thirteen, fourteen, fifteen." },
    ],
  },

  // Lesson 26: Introduce 16
  {
    id: 26,
    title: "Lesson 26",
    target: "16",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>14</span> &nbsp; <span class='math-num'>15</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Fourteen, fifteen!", correct: "Fourteen, fifteen." },
      { display: "<span class='math-num'>16</span>", visual: "dots", dotCount: 16, action: "count", say: "New number! Sixteen. Ten and six. 'Six-teen'.", do: "Point to dots.", praise: "Sixteen!", correct: "Sixteen." },
      { display: "<span class='math-num'>16</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>6</span>", visual: "equation", action: "show", say: "Sixteen equals ten plus six.", do: "Point.", praise: "Ten plus six!", correct: "Sixteen equals ten plus six." },
      { display: "<span class='math-num'>16</span>", visual: "dots", dotCount: 16, action: "show", say: "What number?", do: "Wait.", praise: "Sixteen!", correct: "Sixteen." },
    ],
  },

  // Lesson 27: Introduce 17
  {
    id: 27,
    title: "Lesson 27",
    target: "17",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>15</span> &nbsp; <span class='math-num'>16</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Fifteen, sixteen!", correct: "Fifteen, sixteen." },
      { display: "<span class='math-num'>17</span>", visual: "dots", dotCount: 17, action: "count", say: "New number! Seventeen. Ten and seven. 'Seven-teen'.", do: "Point to dots.", praise: "Seventeen!", correct: "Seventeen." },
      { display: "<span class='math-num'>17</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>7</span>", visual: "equation", action: "show", say: "Seventeen equals ten plus seven.", do: "Point.", praise: "Ten plus seven!", correct: "Seventeen equals ten plus seven." },
      { display: "<span class='math-num'>17</span>", visual: "dots", dotCount: 17, action: "show", say: "What number?", do: "Wait.", praise: "Seventeen!", correct: "Seventeen." },
    ],
  },

  // Lesson 28: Introduce 18
  {
    id: 28,
    title: "Lesson 28",
    target: "18",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>16</span> &nbsp; <span class='math-num'>17</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Sixteen, seventeen!", correct: "Sixteen, seventeen." },
      { display: "<span class='math-num'>18</span>", visual: "dots", dotCount: 18, action: "count", say: "New number! Eighteen. Ten and eight. 'Eight-teen'.", do: "Point to dots.", praise: "Eighteen!", correct: "Eighteen." },
      { display: "<span class='math-num'>18</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>8</span>", visual: "equation", action: "show", say: "Eighteen equals ten plus eight.", do: "Point.", praise: "Ten plus eight!", correct: "Eighteen equals ten plus eight." },
      { display: "<span class='math-num'>18</span>", visual: "dots", dotCount: 18, action: "show", say: "What number?", do: "Wait.", praise: "Eighteen!", correct: "Eighteen." },
    ],
  },

  // Lesson 29: Introduce 19
  {
    id: 29,
    title: "Lesson 29",
    target: "19",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>17</span> &nbsp; <span class='math-num'>18</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Seventeen, eighteen!", correct: "Seventeen, eighteen." },
      { display: "<span class='math-num'>19</span>", visual: "dots", dotCount: 19, action: "count", say: "New number! Nineteen. Ten and nine. 'Nine-teen'. This is the last teen number!", do: "Point to dots.", praise: "Nineteen!", correct: "Nineteen." },
      { display: "<span class='math-num'>19</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>9</span>", visual: "equation", action: "show", say: "Nineteen equals ten plus nine.", do: "Point.", praise: "Ten plus nine!", correct: "Nineteen equals ten plus nine." },
      { display: "<span class='math-num'>19</span>", visual: "dots", dotCount: 19, action: "show", say: "What number?", do: "Wait.", praise: "Nineteen!", correct: "Nineteen." },
    ],
  },

  // Lesson 30: Introduce 20, review 16-20
  {
    id: 30,
    title: "Lesson 30",
    target: "20, review 16-20",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>18</span> &nbsp; <span class='math-num'>19</span>", visual: "none", action: "show", say: "Review. What numbers?", do: "Point.", praise: "Eighteen, nineteen!", correct: "Eighteen, nineteen." },
      { display: "<span class='math-num'>20</span>", visual: "dots", dotCount: 20, action: "count", say: "New number! Twenty. Twenty means two tens. It's special — like ten, it ends in a zero.", do: "Point to dots.", praise: "Twenty! Two tens!", correct: "Twenty. Count with me." },
      { display: "<span class='math-num'>20</span> <span class='math-symbol'>=</span> <span class='math-num'>10</span> + <span class='math-num'>10</span>", visual: "equation", action: "show", say: "Twenty equals ten plus ten. Two groups of ten.", do: "Point.", praise: "Ten plus ten is twenty!", correct: "Twenty equals ten plus ten." },
      { display: "<span class='math-num'>16</span>", visual: "dots", dotCount: 16, action: "show", say: "Quick review. What number?", do: "Wait.", praise: "Sixteen!", correct: "Sixteen." },
      { display: "<span class='math-num'>18</span>", visual: "dots", dotCount: 18, action: "show", say: "What number?", do: "Wait.", praise: "Eighteen!", correct: "Eighteen." },
      { display: "Count: 0 to 20", visual: "numberline", nlStart: 0, nlEnd: 20, action: "show", say: "Count from zero all the way to twenty!", do: "Point to each number on the number line.", praise: "Zero to twenty — incredible!", correct: "Zero through twenty. You know all these numbers!" },
    ],
  },

  // Lesson 31: Introduce the plus symbol (+)
  {
    id: 31,
    title: "Lesson 31",
    target: "plus (+)",
    phase: 2,
    steps: [
      { display: "<span class='math-symbol'>+</span>", visual: "none", action: "show", say: "This is a new symbol. It's called 'plus'. Plus means 'add' or 'put together'. Say 'plus'.", do: "Point to the plus sign.", praise: "Plus! It means add!", correct: "This is plus. It means add — put things together." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "dots", dotCount: 2, action: "show", say: "One plus one. We start with one dot, then add one more dot. How many dots altogether?", do: "Show one dot, then add another.", praise: "Two! One plus one is two!", correct: "One dot, plus one more dot. That's two dots. One plus one equals two." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> <span class='math-num'>2</span>", visual: "equation", action: "show", say: "One plus one equals two. Read the whole thing with me.", do: "Point to each part as you read.", praise: "One plus one equals two!", correct: "One plus one equals two." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "dots", dotCount: 3, action: "show", say: "Two plus one. Start with two dots, add one more. How many?", do: "Show two dots, then one more.", praise: "Three! Two plus one is three!", correct: "Two dots plus one more. Three. Two plus one equals three." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> <span class='math-num'>3</span>", visual: "equation", action: "show", say: "Two plus one equals three. Read it.", do: "Point.", praise: "Two plus one equals three!", correct: "Two plus one equals three." },
      { display: "<span class='math-symbol'>+</span>", visual: "none", action: "show", say: "What is this symbol called? What does it mean?", do: "Wait.", praise: "Plus — it means add!", correct: "Plus. It means add — put things together." },
    ],
  },

  // Lesson 32: Plus one facts
  {
    id: 32,
    title: "Lesson 32",
    target: "+1 practice",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "dots", dotCount: 4, action: "show", say: "Three plus one. Start with three, add one more. How many?", do: "Wait.", praise: "Four! Three plus one is four!", correct: "Three plus one. Count: one, two, three, four. Four." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "dots", dotCount: 5, action: "show", say: "Four plus one. How many?", do: "Wait.", praise: "Five!", correct: "Four plus one is five." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "dots", dotCount: 6, action: "show", say: "Five plus one?", do: "Wait.", praise: "Six!", correct: "Five plus one is six." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "dots", dotCount: 7, action: "show", say: "Six plus one?", do: "Wait.", praise: "Seven!", correct: "Six plus one is seven." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "dots", dotCount: 10, action: "show", say: "Nine plus one? This is a big one!", do: "Wait.", praise: "Ten! Nine plus one is ten!", correct: "Nine plus one is ten." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Your turn. One plus one equals what?", do: "Wait.", praise: "Two!", correct: "One plus one equals two." },
    ],
  },

  // Lesson 33: Introduce the number line
  {
    id: 33,
    title: "Lesson 33",
    target: "number line",
    phase: 2,
    steps: [
      { display: "Number Line: 0 to 10", visual: "numberline", nlStart: 0, nlEnd: 10, action: "show", say: "This is a number line. It shows numbers in order from zero to ten. Each number has its own spot.", do: "Point along the number line from left to right.", praise: "That's a number line!", correct: "A number line shows numbers in order. Zero is on the left, bigger numbers go right." },
      { display: "Find 5", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 5, action: "show", say: "Point to the number 5 on the number line.", do: "Wait for the child to point. Help if needed.", praise: "You found five!", correct: "Five is right here in the middle. Zero, one, two, three, four, five." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 3, action: "show", say: "We can use the number line to add! Start at three. Now hop one space to the right. Where did we land?", do: "Point to 3, then move finger one hop right to 4.", praise: "Four! We hopped from three to four!", correct: "Start at three, hop one. We land on four. Three plus one is four." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span>", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 5, action: "show", say: "Start at five. Hop one to the right. Where do we land?", do: "Point to 5, hop to 6.", praise: "Six! Five plus one is six!", correct: "Start at five, hop one. Six." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span>", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 7, action: "show", say: "Let's try two hops. Start at seven. Hop one, hop two. Where are we?", do: "Point to 7, hop to 8, hop to 9.", praise: "Nine! Seven plus two is nine!", correct: "Seven, hop to eight, hop to nine. Seven plus two is nine." },
    ],
  },

  // Lesson 34: Number line addition practice
  {
    id: 34,
    title: "Lesson 34",
    target: "number line +1, +2",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 2, action: "show", say: "Use the number line. Start at two, hop one. Where do you land?", do: "Wait.", praise: "Three!", correct: "Two, hop one, three. Two plus one is three." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 4, action: "show", say: "Start at four, hop two times. Where?", do: "Wait.", praise: "Six! Four plus two is six!", correct: "Four, hop five, hop six. Four plus two is six." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 8, action: "show", say: "Start at eight, hop one.", do: "Wait.", praise: "Nine!", correct: "Eight, hop nine. Eight plus one is nine." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 6, action: "show", say: "Start at six, hop two.", do: "Wait.", praise: "Eight! Six plus two is eight!", correct: "Six, hop seven, hop eight. Six plus two is eight." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 3, action: "show", say: "Start at three, hop two.", do: "Wait.", praise: "Five!", correct: "Three, hop four, hop five. Three plus two is five." },
    ],
  },

  // Lesson 35: One more, one less
  {
    id: 35,
    title: "Lesson 35",
    target: "one more, one less",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>7</span>", visual: "none", action: "show", say: "What is one more than seven? Think: seven plus one.", do: "Wait.", praise: "Eight! One more than seven is eight!", correct: "Seven plus one is eight. One more than seven is eight." },
      { display: "<span class='math-num'>7</span>", visual: "none", action: "show", say: "What is one less than seven? Think: the number before seven.", do: "Wait.", praise: "Six! One less than seven is six!", correct: "The number before seven is six. One less than seven is six." },
      { display: "<span class='math-num'>12</span>", visual: "none", action: "show", say: "What is one more than twelve?", do: "Wait.", praise: "Thirteen!", correct: "Twelve plus one is thirteen." },
      { display: "<span class='math-num'>12</span>", visual: "none", action: "show", say: "What is one less than twelve?", do: "Wait.", praise: "Eleven!", correct: "The number before twelve is eleven." },
      { display: "<span class='math-num'>15</span>", visual: "none", action: "show", say: "One more than fifteen?", do: "Wait.", praise: "Sixteen!", correct: "Sixteen." },
      { display: "<span class='math-num'>15</span>", visual: "none", action: "show", say: "One less than fifteen?", do: "Wait.", praise: "Fourteen!", correct: "Fourteen." },
    ],
  },

  // Lesson 36: Counting backward from 10
  {
    id: 36,
    title: "Lesson 36",
    target: "counting backward",
    phase: 2,
    steps: [
      { display: "Count back: 10 to 0", visual: "numberline", nlStart: 0, nlEnd: 10, nlHighlight: 10, action: "show", say: "Let's count backward from ten. Ten, nine, eight, seven, six, five, four, three, two, one, zero!", do: "Point to each number on the number line, right to left.", praise: "Backward from ten to zero!", correct: "Ten, nine, eight, seven, six, five, four, three, two, one, zero." },
      { display: "Count back: 5 to 0", visual: "numberline", nlStart: 0, nlEnd: 5, nlHighlight: 5, action: "show", say: "Your turn. Count backward from five.", do: "Point right to left on the number line.", praise: "Five, four, three, two, one, zero!", correct: "Five, four, three, two, one, zero." },
      { display: "<span class='math-num'>?</span>", visual: "none", action: "show", say: "I say a number, you say the number that comes before it. Ready? Seven.", do: "Wait.", praise: "Six!", correct: "Before seven is six." },
      { display: "<span class='math-num'>?</span>", visual: "none", action: "show", say: "What comes before four?", do: "Wait.", praise: "Three!", correct: "Before four is three." },
      { display: "<span class='math-num'>?</span>", visual: "none", action: "show", say: "What comes before ten?", do: "Wait.", praise: "Nine!", correct: "Before ten is nine." },
      { display: "Count back: 20 to 10", visual: "numberline", nlStart: 10, nlEnd: 20, nlHighlight: 20, action: "show", say: "Challenge! Count backward from twenty to ten.", do: "Point to each number on the number line, right to left.", praise: "Twenty down to ten!", correct: "Twenty, nineteen, eighteen, seventeen, sixteen, fifteen, fourteen, thirteen, twelve, eleven, ten." },
    ],
  },

  // Lesson 37: Adding with dots (sums to 5)
  {
    id: 37,
    title: "Lesson 37",
    target: "adding to 5",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "Two plus two. Count all the dots.", do: "Show two dots, then two more dots.", praise: "Four! Two plus two is four!", correct: "Two plus two is four." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "One plus three?", do: "Wait.", praise: "Four!", correct: "One plus three is four." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Two plus three?", do: "Wait.", praise: "Five!", correct: "Two plus three is five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Four plus one?", do: "Wait.", praise: "Five!", correct: "Four plus one is five." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Try without dots. Three plus one?", do: "Wait.", praise: "Four! You did it without dots!", correct: "Three plus one is four." },
    ],
  },

  // Lesson 38: Review teen numbers
  {
    id: 38,
    title: "Lesson 38",
    target: "review 11-20",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>14</span>", visual: "none", action: "show", say: "What number?", do: "Wait.", praise: "Fourteen!", correct: "Fourteen." },
      { display: "<span class='math-num'>17</span>", visual: "none", action: "show", say: "What number?", do: "Wait.", praise: "Seventeen!", correct: "Seventeen." },
      { display: "<span class='math-num'>11</span>", visual: "none", action: "show", say: "What number?", do: "Wait.", praise: "Eleven!", correct: "Eleven." },
      { display: "<span class='math-num'>19</span>", visual: "none", action: "show", say: "What number?", do: "Wait.", praise: "Nineteen!", correct: "Nineteen." },
      { display: "<span class='math-num'>13</span>", visual: "none", action: "show", say: "What number? How much is ten plus what?", do: "Wait.", praise: "Thirteen! Ten plus three!", correct: "Thirteen. Ten plus three." },
      { display: "<span class='math-num'>20</span>", visual: "none", action: "show", say: "What number?", do: "Wait.", praise: "Twenty!", correct: "Twenty. Ten plus ten." },
    ],
  },

  // Lesson 39: Mixed addition practice
  {
    id: 39,
    title: "Lesson 39",
    target: "addition review",
    phase: 2,
    steps: [
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus two?", do: "Wait.", praise: "Five!", correct: "Three plus two is five." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One plus one?", do: "Wait.", praise: "Two!", correct: "One plus one is two." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus one?", do: "Wait.", praise: "Five!", correct: "Four plus one is five." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Two plus two?", do: "Wait.", praise: "Four!", correct: "Two plus two is four." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven plus one?", do: "Wait.", praise: "Eight!", correct: "Seven plus one is eight." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus two?", do: "Wait.", praise: "Seven!", correct: "Five plus two is seven." },
    ],
  },

  // Lesson 40: Phase 2 Review
  {
    id: 40,
    title: "Lesson 40",
    target: "Phase 2 Review",
    phase: 2,
    steps: [
      { display: "Count: 0 to 20", visual: "numberline", nlStart: 0, nlEnd: 20, action: "show", say: "Count from zero to twenty!", do: "Point to each number on the number line.", praise: "Zero to twenty!", correct: "Zero all the way to twenty." },
      { display: "<span class='math-num'>15</span>", visual: "none", action: "show", say: "What number? How much is ten plus what?", do: "Wait.", praise: "Fifteen! Ten plus five!", correct: "Fifteen. Ten plus five." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus one?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus two?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>12</span>", visual: "none", action: "show", say: "What is one more than twelve?", do: "Wait.", praise: "Thirteen!", correct: "Thirteen." },
      { display: "Count back: 20 to 10", visual: "numberline", nlStart: 10, nlEnd: 20, nlHighlight: 20, action: "show", say: "Count backward from twenty to ten!", do: "Point to each number on the number line, right to left.", praise: "Phase 2 complete! You know numbers to twenty and you can add!", correct: "Twenty, nineteen, eighteen... all the way to ten." },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 3: ADDITION — Lessons 41-65
  // +1, +2, +3 facts, doubles, +0, commutative, number bonds
  // ═══════════════════════════════════════════════════

  // Lesson 41: +1 facts (1+1 through 5+1)
  {
    id: 41, title: "Lesson 41", target: "+1 facts", phase: 3,
    steps: [
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 2, action: "show", say: "Adding one means counting one more. One plus one. Start at one, count one more. What do you get?", do: "Point to the dots.", praise: "Two! One plus one is two!", correct: "One, then one more is two." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 3, action: "show", say: "Two plus one?", do: "Wait.", praise: "Three!", correct: "Two, count one more: three." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "Three plus one?", do: "Wait.", praise: "Four!", correct: "Three, one more: four." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Four plus one?", do: "Wait.", praise: "Five!", correct: "Four, one more: five." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 6, action: "show", say: "Five plus one?", do: "Wait.", praise: "Six!", correct: "Five, one more: six." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Without dots now. Three plus one?", do: "Wait.", praise: "Four! You don't need dots!", correct: "Four." },
    ],
  },

  // Lesson 42: +1 facts (6+1 through 9+1)
  {
    id: 42, title: "Lesson 42", target: "+1 facts", phase: 3,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 7, action: "show", say: "Six plus one?", do: "Wait.", praise: "Seven!", correct: "Six, one more: seven." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 8, action: "show", say: "Seven plus one?", do: "Wait.", praise: "Eight!", correct: "Seven, one more: eight." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 9, action: "show", say: "Eight plus one?", do: "Wait.", praise: "Nine!", correct: "Eight, one more: nine." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 10, action: "show", say: "Nine plus one?", do: "Wait.", praise: "Ten! The big one!", correct: "Nine, one more: ten." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "No dots. Seven plus one?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine plus one?", do: "Wait.", praise: "Ten!", correct: "Ten." },
    ],
  },

  // Lesson 43: +1 mixed drill
  {
    id: 43, title: "Lesson 43", target: "+1 drill", phase: 3,
    steps: [
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus one?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One plus one?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight plus one?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus one?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Two plus one?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus one?", do: "Wait.", praise: "Six!", correct: "Six." },
    ],
  },

  // Lesson 44: +1 with tally marks
  {
    id: 44, title: "Lesson 44", target: "+1 with tallies", phase: 3,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "tally", dotCount: 6, action: "show", say: "Five plus one. Look at the tally marks — one group of five, then one more mark. How many?", do: "Point to the group of 5, then the extra mark.", praise: "Six!", correct: "A group of five plus one more is six." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "tally", dotCount: 8, action: "show", say: "Seven plus one? Count the tallies.", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "tally", dotCount: 4, action: "show", say: "Three plus one?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "tally", dotCount: 10, action: "show", say: "Nine plus one? How many groups of five?", do: "Wait.", praise: "Ten! Two groups of five!", correct: "Ten. Two full groups of five." },
    ],
  },

  // Lesson 45: Introduce +2 facts
  {
    id: 45, title: "Lesson 45", target: "+2 facts", phase: 3,
    steps: [
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 3, action: "show", say: "Now we add two. That means count on two more. One plus two: one... two, three. Three!", do: "Point to dots.", praise: "Three! One plus two is three!", correct: "One, then count two more: two, three. The answer is three." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "Two plus two?", do: "Wait.", praise: "Four!", correct: "Two, count on two: three, four." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Three plus two?", do: "Wait.", praise: "Five!", correct: "Three, four, five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 6, action: "show", say: "Four plus two?", do: "Wait.", praise: "Six!", correct: "Four, five, six." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 7, action: "show", say: "Five plus two?", do: "Wait.", praise: "Seven!", correct: "Five, six, seven." },
    ],
  },

  // Lesson 46: +2 facts (6-8)
  {
    id: 46, title: "Lesson 46", target: "+2 facts", phase: 3,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 8, action: "show", say: "Six plus two?", do: "Wait.", praise: "Eight!", correct: "Six, seven, eight." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 9, action: "show", say: "Seven plus two?", do: "Wait.", praise: "Nine!", correct: "Seven, eight, nine." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 10, action: "show", say: "Eight plus two?", do: "Wait.", praise: "Ten!", correct: "Eight, nine, ten." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "No dots. Four plus two?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven plus two?", do: "Wait.", praise: "Nine!", correct: "Nine." },
    ],
  },

  // Lesson 47: +2 drill
  {
    id: 47, title: "Lesson 47", target: "+2 drill", phase: 3,
    steps: [
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus two?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight plus two?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One plus two?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus two?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus two?", do: "Wait.", praise: "Seven!", correct: "Seven." },
    ],
  },

  // Lesson 48: Mixed +1 and +2
  {
    id: 48, title: "Lesson 48", target: "+1 and +2 mixed", phase: 3,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus one?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus two?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus one?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus two?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine plus one?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight plus two?", do: "Wait.", praise: "Ten!", correct: "Ten." },
    ],
  },

  // Lesson 49: Introduce +3 facts
  {
    id: 49, title: "Lesson 49", target: "+3 facts", phase: 3,
    steps: [
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "Now we add three. Count on three: one... two, three, four!", do: "Point.", praise: "Four! One plus three is four!", correct: "One, then two, three, four." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Two plus three?", do: "Wait.", praise: "Five!", correct: "Two, three, four, five." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 6, action: "show", say: "Three plus three?", do: "Wait.", praise: "Six!", correct: "Three, four, five, six." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 7, action: "show", say: "Four plus three?", do: "Wait.", praise: "Seven!", correct: "Four, five, six, seven." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 8, action: "show", say: "Five plus three?", do: "Wait.", praise: "Eight!", correct: "Five, six, seven, eight." },
    ],
  },

  // Lesson 50: +3 facts (6-7)
  {
    id: 50, title: "Lesson 50", target: "+3 facts", phase: 3,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 9, action: "show", say: "Six plus three?", do: "Wait.", praise: "Nine!", correct: "Six, seven, eight, nine." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 10, action: "show", say: "Seven plus three?", do: "Wait.", praise: "Ten!", correct: "Seven, eight, nine, ten." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "No dots. Four plus three?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Two plus three?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus three?", do: "Wait.", praise: "Nine!", correct: "Nine." },
    ],
  },

  // Lesson 51: +3 drill
  {
    id: 51, title: "Lesson 51", target: "+3 drill", phase: 3,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus three?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One plus three?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven plus three?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus three?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus three?", do: "Wait.", praise: "Seven!", correct: "Seven." },
    ],
  },

  // Lesson 52: Mixed +1, +2, +3
  {
    id: 52, title: "Lesson 52", target: "+1, +2, +3 mixed", phase: 3,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus one?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus two?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus three?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven plus two?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus three?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight plus one?", do: "Wait.", praise: "Nine!", correct: "Nine." },
    ],
  },

  // Lesson 53: Introduce doubles
  {
    id: 53, title: "Lesson 53", target: "doubles", phase: 3,
    steps: [
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 2, action: "show", say: "Doubles! When both numbers are the same, it's a double. One plus one?", do: "Show two groups of 1 dot.", praise: "Two! Double one is two!", correct: "One plus one is two." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "Double two. Two plus two?", do: "Show two groups of 2.", praise: "Four! Double two is four!", correct: "Two plus two is four." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 6, action: "show", say: "Double three. Three plus three?", do: "Show two groups of 3.", praise: "Six! Double three is six!", correct: "Three plus three is six." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 8, action: "show", say: "Double four. Four plus four?", do: "Show two groups of 4.", praise: "Eight! Double four is eight!", correct: "Four plus four is eight." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>5</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 10, action: "show", say: "Double five. Five plus five?", do: "Show two groups of 5.", praise: "Ten! Double five is ten!", correct: "Five plus five is ten." },
    ],
  },

  // Lesson 54: Doubles drill
  {
    id: 54, title: "Lesson 54", target: "doubles drill", phase: 3,
    steps: [
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double three?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>5</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double five?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double two?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double four?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double one?", do: "Wait.", praise: "Two!", correct: "Two." },
    ],
  },

  // Lesson 55: Doubles and near-doubles
  {
    id: 55, title: "Lesson 55", target: "doubles review", phase: 3,
    steps: [
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double four?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double three?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>5</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double five?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "This is not a double. Two plus three?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus three?", do: "Wait.", praise: "Seven!", correct: "Seven." },
    ],
  },

  // Lesson 56: Introduce +0
  {
    id: 56, title: "Lesson 56", target: "+0", phase: 3,
    steps: [
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 3, action: "show", say: "Three plus zero. Zero means nothing. When you add nothing, the number stays the same! Three plus zero is... three!", do: "Point to 3 dots — no extra dots appear.", praise: "Three! Adding zero changes nothing!", correct: "Three plus zero is three. Adding zero means nothing changes." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven plus zero?", do: "Wait.", praise: "Seven! Nothing changed!", correct: "Seven. Adding zero changes nothing." },
      { display: "<span class='math-num'>0</span> <span class='math-symbol'>+</span> <span class='math-num'>5</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Zero plus five? Start with nothing, add five.", do: "Wait.", praise: "Five!", correct: "Zero plus five is five." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten plus zero?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>0</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Zero plus zero? Nothing plus nothing?", do: "Wait.", praise: "Zero! Nothing plus nothing is still nothing!", correct: "Zero." },
    ],
  },

  // Lesson 57: +0 mixed practice
  {
    id: 57, title: "Lesson 57", target: "+0 mixed", phase: 3,
    steps: [
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus zero?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus one?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus two?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>0</span> <span class='math-symbol'>+</span> <span class='math-num'>8</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Zero plus eight?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus zero?", do: "Wait.", praise: "Six!", correct: "Six." },
    ],
  },

  // Lesson 58: Introduce commutative property
  {
    id: 58, title: "Lesson 58", target: "commutative property", phase: 3,
    steps: [
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Two plus three equals five.", do: "Point to 2 dots then 3 dots.", praise: "Five!", correct: "Two plus three is five." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Three plus two. Same dots, just in a different order. How many?", do: "Point to 3 dots then 2 dots.", praise: "Five! The same answer!", correct: "Three plus two is also five." },
      { display: "<span class='math-num'>2</span> + <span class='math-num'>3</span> = <span class='math-num'>3</span> + <span class='math-num'>2</span>", visual: "none", action: "show", say: "Two plus three equals three plus two. When you add, the order doesn't matter! You always get the same answer.", do: "Point to both sides.", praise: "The order doesn't matter!", correct: "Two plus three and three plus two both equal five." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One plus four?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus one? Same answer as one plus four?", do: "Wait.", praise: "Five! Same answer — order doesn't matter!", correct: "Five. The order doesn't matter." },
    ],
  },

  // Lesson 59: Commutative practice
  {
    id: 59, title: "Lesson 59", target: "commutative practice", phase: 3,
    steps: [
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus one?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One plus three? Same or different answer?", do: "Wait.", praise: "Four! Same answer!", correct: "Four. Same answer." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>6</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Two plus six? Hint: think six plus two instead — it might be easier!", do: "Wait.", praise: "Eight!", correct: "Eight. You can always flip the numbers to make it easier." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>7</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus seven? Or think: seven plus three.", do: "Wait.", praise: "Ten!", correct: "Ten." },
    ],
  },

  // Lesson 60: Introduce number bonds
  {
    id: 60, title: "Lesson 60", target: "number bonds to 5", phase: 3,
    steps: [
      { display: "<span class='math-num'>5</span> = ? + ?", visual: "dots", dotCount: 5, action: "show", say: "Number bonds are all the ways to make a number. Let's find all the ways to make five. Zero plus five is one way.", do: "Point to 5 dots.", praise: "Five equals zero plus five!", correct: "0 + 5 = 5." },
      { display: "<span class='math-num'>5</span> = <span class='math-num'>1</span> + <span class='math-num'>4</span>", visual: "dots", dotCount: 5, action: "show", say: "One plus four makes five.", do: "Point to 1 dot, then 4 dots.", praise: "One plus four is five!", correct: "1 + 4 = 5." },
      { display: "<span class='math-num'>5</span> = <span class='math-num'>2</span> + <span class='math-num'>3</span>", visual: "dots", dotCount: 5, action: "show", say: "Two plus three makes five.", do: "Point to 2, then 3.", praise: "Two plus three is five!", correct: "2 + 3 = 5." },
      { display: "<span class='math-num'>5</span> = <span class='math-num'>3</span> + ?", visual: "none", action: "show", say: "Three plus what makes five?", do: "Wait.", praise: "Two! Three plus two is five!", correct: "Three plus two is five." },
      { display: "<span class='math-num'>5</span> = <span class='math-num'>4</span> + ?", visual: "none", action: "show", say: "Four plus what makes five?", do: "Wait.", praise: "One!", correct: "Four plus one is five." },
    ],
  },

  // Lesson 61: Number bonds to 10
  {
    id: 61, title: "Lesson 61", target: "number bonds to 10", phase: 3,
    steps: [
      { display: "<span class='math-num'>10</span> = <span class='math-num'>5</span> + ?", visual: "dots", dotCount: 10, action: "show", say: "Five plus what makes ten? Count on from five.", do: "Point to the two rows of 5.", praise: "Five! Five plus five is ten!", correct: "Five plus five is ten." },
      { display: "<span class='math-num'>10</span> = <span class='math-num'>9</span> + ?", visual: "none", action: "show", say: "Nine plus what makes ten?", do: "Wait.", praise: "One!", correct: "Nine plus one is ten." },
      { display: "<span class='math-num'>10</span> = <span class='math-num'>8</span> + ?", visual: "none", action: "show", say: "Eight plus what makes ten?", do: "Wait.", praise: "Two!", correct: "Eight plus two is ten." },
      { display: "<span class='math-num'>10</span> = <span class='math-num'>7</span> + ?", visual: "none", action: "show", say: "Seven plus what makes ten?", do: "Wait.", praise: "Three!", correct: "Seven plus three is ten." },
      { display: "<span class='math-num'>10</span> = <span class='math-num'>6</span> + ?", visual: "none", action: "show", say: "Six plus what makes ten?", do: "Wait.", praise: "Four!", correct: "Six plus four is ten." },
      { display: "<span class='math-num'>10</span> = <span class='math-num'>4</span> + ?", visual: "none", action: "show", say: "Four plus what makes ten?", do: "Wait.", praise: "Six!", correct: "Four plus six is ten." },
    ],
  },

  // Lesson 62: Missing addend practice
  {
    id: 62, title: "Lesson 62", target: "missing addend", phase: 3,
    steps: [
      { display: "<span class='math-num'>3</span> + ? = <span class='math-num'>5</span>", visual: "none", action: "show", say: "Three plus what equals five?", do: "Wait.", praise: "Two!", correct: "Three plus two equals five." },
      { display: "? + <span class='math-num'>4</span> = <span class='math-num'>7</span>", visual: "none", action: "show", say: "What plus four equals seven?", do: "Wait.", praise: "Three!", correct: "Three plus four is seven." },
      { display: "<span class='math-num'>6</span> + ? = <span class='math-num'>10</span>", visual: "none", action: "show", say: "Six plus what equals ten?", do: "Wait.", praise: "Four!", correct: "Six plus four is ten." },
      { display: "? + <span class='math-num'>2</span> = <span class='math-num'>8</span>", visual: "none", action: "show", say: "What plus two equals eight?", do: "Wait.", praise: "Six!", correct: "Six plus two is eight." },
      { display: "<span class='math-num'>5</span> + ? = <span class='math-num'>9</span>", visual: "none", action: "show", say: "Five plus what equals nine?", do: "Wait.", praise: "Four!", correct: "Five plus four is nine." },
    ],
  },

  // Lesson 63: Number bonds review
  {
    id: 63, title: "Lesson 63", target: "bonds review", phase: 3,
    steps: [
      { display: "<span class='math-num'>10</span> = <span class='math-num'>3</span> + ?", visual: "none", action: "show", say: "Three plus what makes ten?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>10</span> = ? + <span class='math-num'>2</span>", visual: "none", action: "show", say: "What plus two makes ten?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>7</span> = <span class='math-num'>4</span> + ?", visual: "none", action: "show", say: "Four plus what makes seven?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>8</span> = ? + <span class='math-num'>3</span>", visual: "none", action: "show", say: "What plus three makes eight?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>6</span> = <span class='math-num'>2</span> + ?", visual: "none", action: "show", say: "Two plus what makes six?", do: "Wait.", praise: "Four!", correct: "Four." },
    ],
  },

  // Lesson 64: Phase 3 review — mixed facts
  {
    id: 64, title: "Lesson 64", target: "addition review", phase: 3,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six plus three?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double four?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven plus zero?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>+</span> <span class='math-num'>8</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Two plus eight? Remember, you can flip it: eight plus two.", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>10</span> = <span class='math-num'>5</span> + ?", visual: "none", action: "show", say: "Five plus what makes ten?", do: "Wait.", praise: "Five! Double five!", correct: "Five." },
      { display: "<span class='math-num'>3</span> + ? = <span class='math-num'>6</span>", visual: "none", action: "show", say: "Three plus what equals six?", do: "Wait.", praise: "Three! Double three!", correct: "Three." },
    ],
  },

  // Lesson 65: Phase 3 comprehensive review
  {
    id: 65, title: "Lesson 65", target: "Phase 3 Review", phase: 3,
    steps: [
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight plus two?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus three?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Double three?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>+</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine plus zero?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>10</span> = <span class='math-num'>7</span> + ?", visual: "none", action: "show", say: "Seven plus what makes ten?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>+</span> <span class='math-num'>9</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One plus nine? Flip it: nine plus one.", do: "Wait.", praise: "Ten! Phase 3 complete! You know all your addition facts to ten!", correct: "Ten." },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASE 4: SUBTRACTION — Lessons 66-85
  // −1, −2, −3 facts, fact families, −0, review
  // ═══════════════════════════════════════════════════

  // Lesson 66: Introduce minus (−) and −1
  {
    id: 66, title: "Lesson 66", target: "minus (−), −1", phase: 4,
    steps: [
      { display: "<span class='math-symbol'>−</span>", visual: "none", action: "show", say: "New symbol! This is called 'minus'. Minus means 'take away'. When we subtract, we start with a group and take some away. Say 'minus'.", do: "Point to the minus sign.", praise: "Minus! It means take away!", correct: "This is minus. It means take away." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 3, action: "show", say: "Three minus one. Start with three dots. Take away one. How many are left?", do: "Point to 3 dots. Cover or remove one.", praise: "Two! Three minus one is two!", correct: "Three dots, take away one, two are left." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "Four minus one. Start with four, take away one.", do: "Wait.", praise: "Three!", correct: "Four take away one is three." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Five minus one?", do: "Wait.", praise: "Four!", correct: "Five take away one is four." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 2, action: "show", say: "Two minus one?", do: "Wait.", praise: "One!", correct: "Two take away one is one." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 1, action: "show", say: "One minus one? Take away the only one.", do: "Wait.", praise: "Zero! Nothing left!", correct: "One take away one is zero." },
    ],
  },

  // Lesson 67: −1 facts (6-10)
  {
    id: 67, title: "Lesson 67", target: "−1 facts", phase: 4,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 6, action: "show", say: "Six minus one?", do: "Wait.", praise: "Five!", correct: "Six take away one is five." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 7, action: "show", say: "Seven minus one?", do: "Wait.", praise: "Six!", correct: "Seven take away one is six." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 8, action: "show", say: "Eight minus one?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "No dots. Nine minus one?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus one?", do: "Wait.", praise: "Nine!", correct: "Nine." },
    ],
  },

  // Lesson 68: −1 drill
  {
    id: 68, title: "Lesson 68", target: "−1 drill", phase: 4,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five minus one?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus one?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three minus one?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus one?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven minus one?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Two minus one?", do: "Wait.", praise: "One!", correct: "One." },
    ],
  },

  // Lesson 69: −1 connection to counting backward
  {
    id: 69, title: "Lesson 69", target: "−1 = count back", phase: 4,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Minus one means count back one. Six, count back one: five!", do: "Wait.", praise: "Five!", correct: "Six, count back: five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four, count back one?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine, count back one?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>1</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "One, count back one?", do: "Wait.", praise: "Zero!", correct: "Zero." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>+</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Now compare: six plus one?", do: "Wait.", praise: "Seven! Plus one counts forward, minus one counts back!", correct: "Seven. Plus counts forward, minus counts back." },
    ],
  },

  // Lesson 70: Introduce −2
  {
    id: 70, title: "Lesson 70", target: "−2 facts", phase: 4,
    steps: [
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 4, action: "show", say: "Four minus two. Start with four, take away two. Count back two: four, three, two.", do: "Point to 4 dots, remove 2.", praise: "Two!", correct: "Four, three, two. Two left." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Five minus two?", do: "Wait.", praise: "Three!", correct: "Five, four, three." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 6, action: "show", say: "Six minus two?", do: "Wait.", praise: "Four!", correct: "Six, five, four." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 7, action: "show", say: "Seven minus two?", do: "Wait.", praise: "Five!", correct: "Seven, six, five." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "No dots. Three minus two?", do: "Wait.", praise: "One!", correct: "One." },
    ],
  },

  // Lesson 71: −2 facts (8-10)
  {
    id: 71, title: "Lesson 71", target: "−2 facts", phase: 4,
    steps: [
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus two?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine minus two?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus two?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>2</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Two minus two?", do: "Wait.", praise: "Zero! Nothing left!", correct: "Zero." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five minus two?", do: "Wait.", praise: "Three!", correct: "Three." },
    ],
  },

  // Lesson 72: Mixed −1 and −2
  {
    id: 72, title: "Lesson 72", target: "−1 and −2 mixed", phase: 4,
    steps: [
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven minus one?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven minus two?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine minus one?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine minus two?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four minus two?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus one?", do: "Wait.", praise: "Five!", correct: "Five." },
    ],
  },

  // Lesson 73: −2 with tally marks
  {
    id: 73, title: "Lesson 73", target: "−2 with tallies", phase: 4,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "tally", dotCount: 5, action: "show", say: "Five tally marks. Cross out two. How many are left?", do: "Point to the group of 5.", praise: "Three!", correct: "Five take away two is three." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "tally", dotCount: 7, action: "show", say: "Seven tallies, take away two?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "tally", dotCount: 10, action: "show", say: "Ten tallies — two full groups of five! Take away two?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "No tallies. Eight minus two?", do: "Wait.", praise: "Six!", correct: "Six." },
    ],
  },

  // Lesson 74: Introduce −3
  {
    id: 74, title: "Lesson 74", target: "−3 facts", phase: 4,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Five minus three. Start at five, count back three: five, four, three, two.", do: "Point to dots, remove 3.", praise: "Two!", correct: "Five, four, three, two." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 6, action: "show", say: "Six minus three?", do: "Wait.", praise: "Three!", correct: "Six, five, four, three." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 7, action: "show", say: "Seven minus three?", do: "Wait.", praise: "Four!", correct: "Seven, six, five, four." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "No dots. Eight minus three?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four minus three?", do: "Wait.", praise: "One!", correct: "One." },
    ],
  },

  // Lesson 75: −3 facts (9-10)
  {
    id: 75, title: "Lesson 75", target: "−3 facts", phase: 4,
    steps: [
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine minus three?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus three?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three minus three?", do: "Wait.", praise: "Zero!", correct: "Zero." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus three?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five minus three?", do: "Wait.", praise: "Two!", correct: "Two." },
    ],
  },

  // Lesson 76: Mixed −1, −2, −3
  {
    id: 76, title: "Lesson 76", target: "−1, −2, −3 mixed", phase: 4,
    steps: [
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus one?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus two?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus three?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus two?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus three?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four minus one?", do: "Wait.", praise: "Three!", correct: "Three." },
    ],
  },

  // Lesson 77: Subtraction from 10
  {
    id: 77, title: "Lesson 77", target: "subtract from 10", phase: 4,
    steps: [
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus one?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus two?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus three?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>5</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 10, action: "show", say: "Ten minus five? Look at the dots — two rows of five. Take away one whole row.", do: "Point to the rows.", praise: "Five! Half of ten!", correct: "Five." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus four?", do: "Wait.", praise: "Six!", correct: "Six." },
    ],
  },

  // Lesson 78: Introduce fact families
  {
    id: 78, title: "Lesson 78", target: "fact families", phase: 4,
    steps: [
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> <span class='math-num'>7</span>", visual: "dots", dotCount: 7, action: "show", say: "Three plus four equals seven. Now watch — we can turn this into a subtraction fact!", do: "Point to 3 dots and 4 dots.", praise: "Three plus four is seven!", correct: "Three plus four is seven." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 7, action: "show", say: "Seven minus three. If three plus four is seven, then seven minus three is... four! The numbers are related.", do: "Point to 7 dots, cover 3.", praise: "Four! Subtraction is the opposite of addition!", correct: "Seven minus three is four. Addition and subtraction are related." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven minus four? Use the same family: three, four, seven.", do: "Wait.", praise: "Three!", correct: "Three. Same fact family: 3, 4, 7." },
      { display: "3 + 4 = 7 &nbsp;&nbsp; 4 + 3 = 7 &nbsp;&nbsp; 7 − 3 = 4 &nbsp;&nbsp; 7 − 4 = 3", visual: "none", action: "show", say: "Here is the whole fact family for three, four, and seven. Four facts from three numbers!", do: "Point to each equation.", praise: "A whole fact family!", correct: "3 + 4 = 7, 4 + 3 = 7, 7 − 3 = 4, 7 − 4 = 3." },
      { display: "2 + 5 = 7 &nbsp; 7 − 2 = ?", visual: "none", action: "show", say: "If two plus five is seven, then seven minus two is...?", do: "Wait.", praise: "Five! You used the fact family!", correct: "Five." },
    ],
  },

  // Lesson 79: Fact families practice
  {
    id: 79, title: "Lesson 79", target: "fact families", phase: 4,
    steps: [
      { display: "4 + 6 = 10 &nbsp; 10 − 4 = ?", visual: "none", action: "show", say: "Four plus six is ten. So ten minus four is...?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "3 + 5 = 8 &nbsp; 8 − 5 = ?", visual: "none", action: "show", say: "Three plus five is eight. Eight minus five?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>6</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine minus six? Think: what plus six equals nine?", do: "Wait.", praise: "Three! Three plus six is nine!", correct: "Three." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>7</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus seven? What plus seven makes ten?", do: "Wait.", praise: "Three!", correct: "Three. Seven plus three is ten." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>5</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus five?", do: "Wait.", praise: "Three!", correct: "Three. Five plus three is eight." },
    ],
  },

  // Lesson 80: Introduce −0
  {
    id: 80, title: "Lesson 80", target: "−0", phase: 4,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "dots", dotCount: 5, action: "show", say: "Five minus zero. Take away nothing. How many are left?", do: "Point to 5 dots — nothing changes.", praise: "Five! Taking away nothing changes nothing!", correct: "Five minus zero is five." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus zero?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three minus zero?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus zero?", do: "Wait.", praise: "Ten!", correct: "Ten." },
      { display: "<span class='math-num'>0</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Zero minus zero?", do: "Wait.", praise: "Zero! Nothing take away nothing is still nothing!", correct: "Zero." },
    ],
  },

  // Lesson 81: −0 mixed with other subtraction
  {
    id: 81, title: "Lesson 81", target: "−0 mixed", phase: 4,
    steps: [
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus zero?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>1</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus one?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus two?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus three?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>6</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus six? Take away all of them!", do: "Wait.", praise: "Zero!", correct: "Zero." },
    ],
  },

  // Lesson 82: Subtraction with missing numbers
  {
    id: 82, title: "Lesson 82", target: "missing numbers", phase: 4,
    steps: [
      { display: "<span class='math-num'>7</span> − ? = <span class='math-num'>5</span>", visual: "none", action: "show", say: "Seven minus what equals five? What did we take away?", do: "Wait.", praise: "Two! Seven minus two is five!", correct: "Two." },
      { display: "<span class='math-num'>9</span> − ? = <span class='math-num'>7</span>", visual: "none", action: "show", say: "Nine minus what equals seven?", do: "Wait.", praise: "Two!", correct: "Two." },
      { display: "? − <span class='math-num'>3</span> = <span class='math-num'>4</span>", visual: "none", action: "show", say: "What minus three equals four? Hint: think addition — four plus three.", do: "Wait.", praise: "Seven! Four plus three is seven!", correct: "Seven." },
      { display: "<span class='math-num'>10</span> − ? = <span class='math-num'>6</span>", visual: "none", action: "show", say: "Ten minus what equals six?", do: "Wait.", praise: "Four!", correct: "Four. Six plus four is ten." },
      { display: "? − <span class='math-num'>1</span> = <span class='math-num'>8</span>", visual: "none", action: "show", say: "What minus one equals eight?", do: "Wait.", praise: "Nine!", correct: "Nine." },
    ],
  },

  // Lesson 83: Addition and subtraction together
  {
    id: 83, title: "Lesson 83", target: "add & subtract mixed", phase: 4,
    steps: [
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five plus three?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus three? Same fact family!", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>4</span> <span class='math-symbol'>+</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Four plus two?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus two?", do: "Wait.", praise: "Four! Addition and subtraction undo each other!", correct: "Four." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven minus three?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "<span class='math-num'>3</span> <span class='math-symbol'>+</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Three plus four?", do: "Wait.", praise: "Seven! Same family!", correct: "Seven." },
    ],
  },

  // Lesson 84: Subtraction review
  {
    id: 84, title: "Lesson 84", target: "subtraction review", phase: 4,
    steps: [
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine minus three?", do: "Wait.", praise: "Six!", correct: "Six." },
      { display: "<span class='math-num'>7</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Seven minus two?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>5</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus five?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Five minus zero?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>8</span> <span class='math-symbol'>−</span> <span class='math-num'>4</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Eight minus four? Think: what plus four makes eight?", do: "Wait.", praise: "Four! Double four!", correct: "Four." },
    ],
  },

  // Lesson 85: Phase 4 comprehensive review
  {
    id: 85, title: "Lesson 85", target: "Phase 4 Review", phase: 4,
    steps: [
      { display: "<span class='math-num'>10</span> <span class='math-symbol'>−</span> <span class='math-num'>3</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Ten minus three?", do: "Wait.", praise: "Seven!", correct: "Seven." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>−</span> <span class='math-num'>2</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Six minus two?", do: "Wait.", praise: "Four!", correct: "Four." },
      { display: "3 + 4 = 7 &nbsp; so &nbsp; 7 − 4 = ?", visual: "none", action: "show", say: "Use the fact family. Seven minus four?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>9</span> <span class='math-symbol'>−</span> <span class='math-num'>0</span> <span class='math-symbol'>=</span> ?", visual: "none", action: "show", say: "Nine minus zero?", do: "Wait.", praise: "Nine!", correct: "Nine." },
      { display: "<span class='math-num'>8</span> − ? = <span class='math-num'>5</span>", visual: "none", action: "show", say: "Eight minus what equals five?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>5</span> <span class='math-symbol'>+</span> <span class='math-num'>3</span> = ? &nbsp;&nbsp; ? <span class='math-symbol'>−</span> <span class='math-num'>3</span> = <span class='math-num'>5</span>", visual: "none", action: "show", say: "Five plus three is eight. So eight minus three is five. You know addition AND subtraction! Phase 4 complete!", do: "Point to both equations.", praise: "Phase 4 complete! You know all subtraction facts to 10!", correct: "Eight. Addition and subtraction are opposites." },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASES 5-7: STUB LESSONS
  // Each has 3 starter steps to be expanded later
  // ═══════════════════════════════════════════════════

  ...generateStubLessons(86, 105, 5, [
    { range: [86, 89], target: "tens and ones" },
    { range: [90, 94], target: "counting to 50" },
    { range: [95, 99], target: "counting to 100" },
    { range: [100, 103], target: "+/\u2212 within 20" },
    { range: [104, 105], target: "review" },
  ]),

  ...generateStubLessons(106, 125, 6, [
    { range: [106, 109], target: "make 10" },
    { range: [110, 114], target: "doubles +1" },
    { range: [115, 119], target: "2-digit + 1-digit" },
    { range: [120, 123], target: "2-digit + tens" },
    { range: [124, 125], target: "review" },
  ]),

  ...generateStubLessons(126, 150, 7, [
    { range: [126, 129], target: "2-digit + 2-digit" },
    { range: [130, 134], target: "carrying" },
    { range: [135, 139], target: "2-digit \u2212 2-digit" },
    { range: [140, 144], target: "borrowing" },
    { range: [145, 148], target: "word problems" },
    { range: [149, 150], target: "mastery review" },
  ]),
];

function generateStubLessons(start, end, phase, groups) {
  const lessons = [];
  for (let id = start; id <= end; id++) {
    const group = groups.find(g => id >= g.range[0] && id <= g.range[1]) || groups[groups.length - 1];
    lessons.push({
      id,
      title: `Lesson ${id}`,
      target: group.target,
      phase,
      steps: [
        {
          display: `<span class='math-num'>${id}</span>`,
          visual: "none",
          action: "show",
          say: `Lesson ${id}: ${group.target}. (Full script coming soon.)`,
          do: "Follow the teacher guide for this lesson.",
          praise: "Good work!",
          correct: "Let\u2019s try again.",
        },
        {
          display: `<span class='math-num'>${id}</span>`,
          visual: "none",
          action: "show",
          say: "Practice time. (Full steps coming soon.)",
          do: "Work through the practice problems.",
          praise: "Great practice!",
          correct: "Keep trying.",
        },
        {
          display: `<span class='math-num'>${id}</span>`,
          visual: "none",
          action: "show",
          say: "Review what we learned today.",
          do: "Review the key concept from this lesson.",
          praise: "You did it!",
          correct: "We\u2019ll practice more next time.",
        },
      ],
    });
  }
  return lessons;
}
