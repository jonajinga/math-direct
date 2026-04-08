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
      { display: "<span class='math-num'>0</span> <span class='math-num'>1</span> <span class='math-num'>2</span> <span class='math-num'>3</span> <span class='math-num'>4</span> <span class='math-num'>5</span>", visual: "none", action: "show", say: "Count from zero to five.", do: "Point in order.", praise: "Zero through five — excellent!", correct: "Zero, one, two, three, four, five." },
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
      { display: "<span class='math-num'>0</span> <span class='math-num'>1</span> <span class='math-num'>2</span> <span class='math-num'>3</span> <span class='math-num'>4</span> <span class='math-num'>5</span> <span class='math-num'>6</span>", visual: "none", action: "show", say: "Count from zero to six.", do: "Point in order.", praise: "Perfect counting!", correct: "Zero, one, two, three, four, five, six." },
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
      { display: "<span class='math-num'>5</span>", visual: "dots", dotCount: 5, action: "show", say: "What number?", do: "Wait.", praise: "Five!", correct: "Five." },
      { display: "<span class='math-num'>1</span>", visual: "dots", dotCount: 1, action: "show", say: "What number?", do: "Wait.", praise: "One!", correct: "One." },
      { display: "<span class='math-num'>4</span>", visual: "dots", dotCount: 4, action: "show", say: "What number?", do: "Wait.", praise: "Four!", correct: "Four." },
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
      { display: "<span class='math-num'>0</span> <span class='math-num'>1</span> <span class='math-num'>2</span> <span class='math-num'>3</span> <span class='math-num'>4</span> <span class='math-num'>5</span> <span class='math-num'>6</span> <span class='math-num'>7</span>", visual: "none", action: "show", say: "Count zero to seven.", do: "Point in order.", praise: "Zero through seven!", correct: "Zero, one, two, three, four, five, six, seven." },
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
      { display: "<span class='math-num'>0</span> <span class='math-num'>1</span> <span class='math-num'>2</span> <span class='math-num'>3</span> <span class='math-num'>4</span> <span class='math-num'>5</span> <span class='math-num'>6</span> <span class='math-num'>7</span> <span class='math-num'>8</span> <span class='math-num'>9</span>", visual: "none", action: "show", say: "Count zero to nine.", do: "Point.", praise: "All the way to nine!", correct: "Zero through nine." },
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
      { display: "<span class='math-num'>0</span> <span class='math-num'>1</span> <span class='math-num'>2</span> <span class='math-num'>3</span> <span class='math-num'>4</span> <span class='math-num'>5</span> <span class='math-num'>6</span> <span class='math-num'>7</span> <span class='math-num'>8</span> <span class='math-num'>9</span> <span class='math-num'>10</span>", visual: "none", action: "show", say: "Count from zero all the way to ten!", do: "Point to each.", praise: "Zero to ten — amazing!", correct: "Zero, one, two, three, four, five, six, seven, eight, nine, ten." },
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
      { display: "<span class='math-num'>5</span> &nbsp; <span class='math-symbol'>?</span> &nbsp; <span class='math-num'>2</span>", visual: "none", action: "show", say: "Which symbol goes here — greater than or less than? Is 5 more or less than 2?", do: "Wait.", praise: "Greater than! 5 > 2!", correct: "Five is more, so 5 is greater than 2. 5 > 2." },
      { display: "<span class='math-num'>4</span> &nbsp; <span class='math-symbol'>?</span> &nbsp; <span class='math-num'>9</span>", visual: "none", action: "show", say: "What about 4 and 9?", do: "Wait.", praise: "Less than! 4 < 9!", correct: "Four is less than nine. 4 < 9." },
    ],
  },

  // Lesson 19: Review comparing
  {
    id: 19,
    title: "Lesson 19",
    target: "Review comparing",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>6</span> &nbsp; <span class='math-symbol'>?</span> &nbsp; <span class='math-num'>8</span>", visual: "none", action: "show", say: "Greater than or less than?", do: "Wait.", praise: "6 < 8! Less than!", correct: "Six is less than eight." },
      { display: "<span class='math-num'>10</span> &nbsp; <span class='math-symbol'>?</span> &nbsp; <span class='math-num'>3</span>", visual: "none", action: "show", say: "Greater than or less than?", do: "Wait.", praise: "10 > 3! Greater than!", correct: "Ten is greater than three." },
      { display: "<span class='math-num'>5</span> &nbsp; <span class='math-symbol'>?</span> &nbsp; <span class='math-num'>5</span>", visual: "none", action: "show", say: "What about 5 and 5? They are the same! We use equals.", do: "Wait.", praise: "5 = 5! Equals!", correct: "Five equals five. They are the same." },
      { display: "<span class='math-num'>7</span> &nbsp; <span class='math-symbol'>?</span> &nbsp; <span class='math-num'>1</span>", visual: "none", action: "show", say: "Greater than, less than, or equals?", do: "Wait.", praise: "7 > 1!", correct: "Seven is greater than one." },
    ],
  },

  // Lesson 20: Phase 1 Review
  {
    id: 20,
    title: "Lesson 20",
    target: "Phase 1 Review",
    phase: 1,
    steps: [
      { display: "<span class='math-num'>0</span> <span class='math-num'>1</span> <span class='math-num'>2</span> <span class='math-num'>3</span> <span class='math-num'>4</span> <span class='math-num'>5</span> <span class='math-num'>6</span> <span class='math-num'>7</span> <span class='math-num'>8</span> <span class='math-num'>9</span> <span class='math-num'>10</span>", visual: "none", action: "show", say: "Count from zero to ten!", do: "Point to each.", praise: "Zero to ten — you know them all!", correct: "Zero through ten." },
      { display: "<span class='math-num'>8</span>", visual: "dots", dotCount: 8, action: "show", say: "What number?", do: "Wait.", praise: "Eight!", correct: "Eight." },
      { display: "<span class='math-num'>3</span>", visual: "dots", dotCount: 3, action: "show", say: "What number?", do: "Wait.", praise: "Three!", correct: "Three." },
      { display: "<span class='math-num'>6</span> <span class='math-symbol'>=</span> <span class='math-dots'>\u2022\u2022\u2022 \u2022\u2022\u2022</span>", visual: "equation", action: "show", say: "Read this.", do: "Wait.", praise: "Six equals six dots!", correct: "Six equals six dots." },
      { display: "<span class='math-num'>4</span> &nbsp; <span class='math-symbol'>?</span> &nbsp; <span class='math-num'>9</span>", visual: "none", action: "show", say: "Greater than, less than, or equals?", do: "Wait.", praise: "4 < 9! Less than!", correct: "Four is less than nine." },
      { display: "<span class='math-num'>10</span> <span class='math-num'>9</span> <span class='math-num'>8</span> <span class='math-num'>7</span> <span class='math-num'>6</span> <span class='math-num'>5</span> <span class='math-num'>4</span> <span class='math-num'>3</span> <span class='math-num'>2</span> <span class='math-num'>1</span> <span class='math-num'>0</span>", visual: "none", action: "show", say: "Now count backward from ten to zero!", do: "Point to each.", praise: "Ten, nine, eight, seven, six, five, four, three, two, one, zero! Phase 1 complete!", correct: "Ten, nine, eight, seven, six, five, four, three, two, one, zero." },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PHASES 2-7: STUB LESSONS
  // Each has 3 starter steps to be expanded later
  // ═══════════════════════════════════════════════════

  ...generateStubLessons(21, 40, 2, [
    { range: [21, 25], target: "11-15" },
    { range: [26, 30], target: "16-20" },
    { range: [31, 35], target: "intro +" },
    { range: [36, 40], target: "number line" },
  ]),

  ...generateStubLessons(41, 65, 3, [
    { range: [41, 44], target: "+1 facts" },
    { range: [45, 48], target: "+2 facts" },
    { range: [49, 52], target: "+3 facts" },
    { range: [53, 55], target: "doubles" },
    { range: [56, 57], target: "+0" },
    { range: [58, 59], target: "commutative" },
    { range: [60, 63], target: "number bonds" },
    { range: [64, 65], target: "review" },
  ]),

  ...generateStubLessons(66, 85, 4, [
    { range: [66, 69], target: "\u22121 facts" },
    { range: [70, 73], target: "\u22122 facts" },
    { range: [74, 77], target: "\u22123 facts" },
    { range: [78, 79], target: "fact families" },
    { range: [80, 81], target: "\u22120" },
    { range: [82, 85], target: "review" },
  ]),

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
