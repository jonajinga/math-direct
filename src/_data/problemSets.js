export default [
  // Phase 1: Number recognition
  { problem: "How many dots? \u2022", answer: 1, phase: 1, lesson: 1, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022 \u2022", answer: 2, phase: 1, lesson: 2, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022 \u2022 \u2022", answer: 3, phase: 1, lesson: 3, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022 \u2022\u2022", answer: 4, phase: 1, lesson: 5, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022\u2022 \u2022\u2022", answer: 5, phase: 1, lesson: 7, type: "counting", difficulty: 1 },
  { problem: "Which is more: 3 or 5?", answer: 5, phase: 1, lesson: 18, type: "comparing", difficulty: 1 },
  { problem: "Which is less: 7 or 4?", answer: 4, phase: 1, lesson: 18, type: "comparing", difficulty: 1 },
  { problem: "What comes after 6?", answer: 7, phase: 1, lesson: 11, type: "counting", difficulty: 1 },
  { problem: "What comes before 9?", answer: 8, phase: 1, lesson: 15, type: "counting", difficulty: 1 },

  // Phase 3: Addition
  { problem: "1 + 1", answer: 2, phase: 3, lesson: 41, type: "addition", difficulty: 1 },
  { problem: "2 + 1", answer: 3, phase: 3, lesson: 41, type: "addition", difficulty: 1 },
  { problem: "3 + 1", answer: 4, phase: 3, lesson: 42, type: "addition", difficulty: 1 },
  { problem: "4 + 1", answer: 5, phase: 3, lesson: 42, type: "addition", difficulty: 1 },
  { problem: "5 + 1", answer: 6, phase: 3, lesson: 43, type: "addition", difficulty: 1 },
  { problem: "1 + 2", answer: 3, phase: 3, lesson: 45, type: "addition", difficulty: 1 },
  { problem: "2 + 2", answer: 4, phase: 3, lesson: 45, type: "addition", difficulty: 1 },
  { problem: "3 + 2", answer: 5, phase: 3, lesson: 46, type: "addition", difficulty: 1 },
  { problem: "4 + 2", answer: 6, phase: 3, lesson: 46, type: "addition", difficulty: 1 },
  { problem: "5 + 2", answer: 7, phase: 3, lesson: 47, type: "addition", difficulty: 1 },
  { problem: "1 + 3", answer: 4, phase: 3, lesson: 49, type: "addition", difficulty: 1 },
  { problem: "2 + 3", answer: 5, phase: 3, lesson: 49, type: "addition", difficulty: 1 },
  { problem: "3 + 3", answer: 6, phase: 3, lesson: 53, type: "addition", difficulty: 1 },
  { problem: "4 + 4", answer: 8, phase: 3, lesson: 53, type: "addition", difficulty: 1 },
  { problem: "5 + 5", answer: 10, phase: 3, lesson: 54, type: "addition", difficulty: 1 },
  { problem: "7 + 0", answer: 7, phase: 3, lesson: 56, type: "addition", difficulty: 1 },
  { problem: "4 + 3", answer: 7, phase: 3, lesson: 50, type: "addition", difficulty: 1 },
  { problem: "5 + 4", answer: 9, phase: 3, lesson: 60, type: "addition", difficulty: 2 },
  { problem: "6 + 4", answer: 10, phase: 3, lesson: 61, type: "addition", difficulty: 2 },
  { problem: "3 + 7", answer: 10, phase: 3, lesson: 62, type: "addition", difficulty: 2 },

  // Phase 4: Subtraction
  { problem: "2 \u2212 1", answer: 1, phase: 4, lesson: 66, type: "subtraction", difficulty: 1 },
  { problem: "3 \u2212 1", answer: 2, phase: 4, lesson: 66, type: "subtraction", difficulty: 1 },
  { problem: "5 \u2212 1", answer: 4, phase: 4, lesson: 67, type: "subtraction", difficulty: 1 },
  { problem: "4 \u2212 2", answer: 2, phase: 4, lesson: 70, type: "subtraction", difficulty: 1 },
  { problem: "6 \u2212 2", answer: 4, phase: 4, lesson: 71, type: "subtraction", difficulty: 1 },
  { problem: "7 \u2212 3", answer: 4, phase: 4, lesson: 74, type: "subtraction", difficulty: 1 },
  { problem: "8 \u2212 3", answer: 5, phase: 4, lesson: 75, type: "subtraction", difficulty: 1 },
  { problem: "10 \u2212 5", answer: 5, phase: 4, lesson: 79, type: "subtraction", difficulty: 2 },
  { problem: "9 \u2212 0", answer: 9, phase: 4, lesson: 80, type: "subtraction", difficulty: 1 },

  // Phase 5: Place value and within-20
  { problem: "8 + 7", answer: 15, phase: 5, lesson: 100, type: "addition", difficulty: 2 },
  { problem: "9 + 6", answer: 15, phase: 5, lesson: 101, type: "addition", difficulty: 2 },
  { problem: "14 \u2212 6", answer: 8, phase: 5, lesson: 103, type: "subtraction", difficulty: 2 },
  { problem: "16 \u2212 9", answer: 7, phase: 5, lesson: 104, type: "subtraction", difficulty: 2 },

  // Phase 6: Fluency
  { problem: "8 + 5", answer: 13, phase: 6, lesson: 106, type: "addition", difficulty: 2 },
  { problem: "6 + 7", answer: 13, phase: 6, lesson: 110, type: "addition", difficulty: 2 },
  { problem: "24 + 5", answer: 29, phase: 6, lesson: 115, type: "addition", difficulty: 2 },
  { problem: "35 + 20", answer: 55, phase: 6, lesson: 120, type: "addition", difficulty: 2 },

  // Phase 7: Mastery
  { problem: "34 + 25", answer: 59, phase: 7, lesson: 126, type: "addition", difficulty: 3 },
  { problem: "28 + 15", answer: 43, phase: 7, lesson: 130, type: "addition-regrouping", difficulty: 3 },
  { problem: "56 \u2212 23", answer: 33, phase: 7, lesson: 135, type: "subtraction", difficulty: 3 },
  { problem: "42 \u2212 17", answer: 25, phase: 7, lesson: 140, type: "subtraction-regrouping", difficulty: 3 },
];
