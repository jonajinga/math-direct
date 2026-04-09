export default [
  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: Number Recognition & Counting (Lessons 1–20)
  // Skills: counting objects, number identification, comparing,
  //         what comes next/before, ordering
  // ═══════════════════════════════════════════════════════════════

  // Counting dots 1–5
  { problem: "How many dots? \u2022", answer: 1, phase: 1, lesson: 1, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022 \u2022", answer: 2, phase: 1, lesson: 2, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022 \u2022 \u2022", answer: 3, phase: 1, lesson: 3, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022 \u2022\u2022", answer: 4, phase: 1, lesson: 5, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022\u2022 \u2022\u2022", answer: 5, phase: 1, lesson: 7, type: "counting", difficulty: 1 },

  // Counting dots 6–10
  { problem: "How many dots? \u2022\u2022\u2022 \u2022\u2022\u2022", answer: 6, phase: 1, lesson: 8, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022\u2022\u2022 \u2022\u2022\u2022", answer: 7, phase: 1, lesson: 9, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022", answer: 8, phase: 1, lesson: 10, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022", answer: 9, phase: 1, lesson: 10, type: "counting", difficulty: 1 },
  { problem: "How many dots? \u2022\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022\u2022", answer: 10, phase: 1, lesson: 10, type: "counting", difficulty: 1 },

  // Number identification 0–10
  { problem: "What number is zero?", answer: 0, phase: 1, lesson: 1, type: "number-id", difficulty: 1 },
  { problem: "Show the number 3", answer: 3, phase: 1, lesson: 3, type: "number-id", difficulty: 1 },
  { problem: "Show the number 6", answer: 6, phase: 1, lesson: 8, type: "number-id", difficulty: 1 },
  { problem: "Show the number 8", answer: 8, phase: 1, lesson: 10, type: "number-id", difficulty: 1 },
  { problem: "Show the number 10", answer: 10, phase: 1, lesson: 10, type: "number-id", difficulty: 1 },

  // What comes after
  { problem: "What comes after 1?", answer: 2, phase: 1, lesson: 11, type: "counting", difficulty: 1 },
  { problem: "What comes after 3?", answer: 4, phase: 1, lesson: 11, type: "counting", difficulty: 1 },
  { problem: "What comes after 5?", answer: 6, phase: 1, lesson: 11, type: "counting", difficulty: 1 },
  { problem: "What comes after 6?", answer: 7, phase: 1, lesson: 11, type: "counting", difficulty: 1 },
  { problem: "What comes after 8?", answer: 9, phase: 1, lesson: 12, type: "counting", difficulty: 1 },
  { problem: "What comes after 9?", answer: 10, phase: 1, lesson: 12, type: "counting", difficulty: 1 },
  { problem: "What comes after 4?", answer: 5, phase: 1, lesson: 12, type: "counting", difficulty: 1 },

  // What comes before
  { problem: "What comes before 2?", answer: 1, phase: 1, lesson: 14, type: "counting", difficulty: 1 },
  { problem: "What comes before 5?", answer: 4, phase: 1, lesson: 14, type: "counting", difficulty: 1 },
  { problem: "What comes before 7?", answer: 6, phase: 1, lesson: 15, type: "counting", difficulty: 1 },
  { problem: "What comes before 9?", answer: 8, phase: 1, lesson: 15, type: "counting", difficulty: 1 },
  { problem: "What comes before 10?", answer: 9, phase: 1, lesson: 15, type: "counting", difficulty: 1 },
  { problem: "What comes before 4?", answer: 3, phase: 1, lesson: 14, type: "counting", difficulty: 1 },
  { problem: "What comes before 8?", answer: 7, phase: 1, lesson: 15, type: "counting", difficulty: 1 },

  // Comparing numbers
  { problem: "Which is more: 3 or 5?", answer: 5, phase: 1, lesson: 18, type: "comparing", difficulty: 1 },
  { problem: "Which is less: 7 or 4?", answer: 4, phase: 1, lesson: 18, type: "comparing", difficulty: 1 },
  { problem: "Which is more: 2 or 8?", answer: 8, phase: 1, lesson: 18, type: "comparing", difficulty: 1 },
  { problem: "Which is less: 6 or 3?", answer: 3, phase: 1, lesson: 18, type: "comparing", difficulty: 1 },
  { problem: "Which is more: 9 or 6?", answer: 9, phase: 1, lesson: 19, type: "comparing", difficulty: 1 },
  { problem: "Which is less: 10 or 5?", answer: 5, phase: 1, lesson: 19, type: "comparing", difficulty: 1 },
  { problem: "Which is more: 1 or 7?", answer: 7, phase: 1, lesson: 19, type: "comparing", difficulty: 1 },
  { problem: "Which is less: 9 or 2?", answer: 2, phase: 1, lesson: 19, type: "comparing", difficulty: 1 },
  { problem: "Which is more: 4 or 4?", answer: 4, phase: 1, lesson: 20, type: "comparing", difficulty: 2 },
  { problem: "Which is more: 10 or 3?", answer: 10, phase: 1, lesson: 20, type: "comparing", difficulty: 1 },
  { problem: "Which is less: 8 or 1?", answer: 1, phase: 1, lesson: 20, type: "comparing", difficulty: 1 },
  { problem: "Which is more: 5 or 7?", answer: 7, phase: 1, lesson: 20, type: "comparing", difficulty: 1 },
  { problem: "Which is less: 6 or 9?", answer: 6, phase: 1, lesson: 20, type: "comparing", difficulty: 1 },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: Numbers 11–20, One More/Less, Simple +1 (Lessons 21–40)
  // Skills: teen number ID, counting to 20, one more, one less,
  //         adding 1 to single digits
  // ═══════════════════════════════════════════════════════════════

  // Teen number identification
  { problem: "Show the number 11", answer: 11, phase: 2, lesson: 21, type: "number-id", difficulty: 1 },
  { problem: "Show the number 12", answer: 12, phase: 2, lesson: 22, type: "number-id", difficulty: 1 },
  { problem: "Show the number 13", answer: 13, phase: 2, lesson: 23, type: "number-id", difficulty: 1 },
  { problem: "Show the number 14", answer: 14, phase: 2, lesson: 24, type: "number-id", difficulty: 1 },
  { problem: "Show the number 15", answer: 15, phase: 2, lesson: 25, type: "number-id", difficulty: 1 },
  { problem: "Show the number 16", answer: 16, phase: 2, lesson: 26, type: "number-id", difficulty: 1 },
  { problem: "Show the number 17", answer: 17, phase: 2, lesson: 27, type: "number-id", difficulty: 1 },
  { problem: "Show the number 18", answer: 18, phase: 2, lesson: 28, type: "number-id", difficulty: 1 },
  { problem: "Show the number 19", answer: 19, phase: 2, lesson: 29, type: "number-id", difficulty: 1 },
  { problem: "Show the number 20", answer: 20, phase: 2, lesson: 30, type: "number-id", difficulty: 1 },

  // Counting to 20 — what comes after
  { problem: "What comes after 10?", answer: 11, phase: 2, lesson: 31, type: "counting", difficulty: 1 },
  { problem: "What comes after 12?", answer: 13, phase: 2, lesson: 31, type: "counting", difficulty: 1 },
  { problem: "What comes after 14?", answer: 15, phase: 2, lesson: 32, type: "counting", difficulty: 1 },
  { problem: "What comes after 16?", answer: 17, phase: 2, lesson: 32, type: "counting", difficulty: 1 },
  { problem: "What comes after 18?", answer: 19, phase: 2, lesson: 33, type: "counting", difficulty: 1 },
  { problem: "What comes after 19?", answer: 20, phase: 2, lesson: 33, type: "counting", difficulty: 1 },
  { problem: "What comes after 11?", answer: 12, phase: 2, lesson: 31, type: "counting", difficulty: 1 },
  { problem: "What comes after 15?", answer: 16, phase: 2, lesson: 32, type: "counting", difficulty: 1 },

  // One more
  { problem: "What is one more than 5?", answer: 6, phase: 2, lesson: 34, type: "one-more", difficulty: 1 },
  { problem: "What is one more than 9?", answer: 10, phase: 2, lesson: 34, type: "one-more", difficulty: 1 },
  { problem: "What is one more than 10?", answer: 11, phase: 2, lesson: 35, type: "one-more", difficulty: 1 },
  { problem: "What is one more than 13?", answer: 14, phase: 2, lesson: 35, type: "one-more", difficulty: 1 },
  { problem: "What is one more than 17?", answer: 18, phase: 2, lesson: 36, type: "one-more", difficulty: 1 },
  { problem: "What is one more than 19?", answer: 20, phase: 2, lesson: 36, type: "one-more", difficulty: 1 },
  { problem: "What is one more than 7?", answer: 8, phase: 2, lesson: 34, type: "one-more", difficulty: 1 },
  { problem: "What is one more than 14?", answer: 15, phase: 2, lesson: 35, type: "one-more", difficulty: 1 },

  // One less
  { problem: "What is one less than 3?", answer: 2, phase: 2, lesson: 37, type: "one-less", difficulty: 1 },
  { problem: "What is one less than 6?", answer: 5, phase: 2, lesson: 37, type: "one-less", difficulty: 1 },
  { problem: "What is one less than 10?", answer: 9, phase: 2, lesson: 37, type: "one-less", difficulty: 1 },
  { problem: "What is one less than 12?", answer: 11, phase: 2, lesson: 38, type: "one-less", difficulty: 1 },
  { problem: "What is one less than 15?", answer: 14, phase: 2, lesson: 38, type: "one-less", difficulty: 1 },
  { problem: "What is one less than 18?", answer: 17, phase: 2, lesson: 39, type: "one-less", difficulty: 1 },
  { problem: "What is one less than 20?", answer: 19, phase: 2, lesson: 39, type: "one-less", difficulty: 1 },
  { problem: "What is one less than 8?", answer: 7, phase: 2, lesson: 37, type: "one-less", difficulty: 1 },

  // Simple +1 (bridge to Phase 3)
  { problem: "1 + 1", answer: 2, phase: 2, lesson: 40, type: "addition", difficulty: 1 },
  { problem: "3 + 1", answer: 4, phase: 2, lesson: 40, type: "addition", difficulty: 1 },
  { problem: "5 + 1", answer: 6, phase: 2, lesson: 40, type: "addition", difficulty: 1 },
  { problem: "7 + 1", answer: 8, phase: 2, lesson: 40, type: "addition", difficulty: 1 },
  { problem: "9 + 1", answer: 10, phase: 2, lesson: 40, type: "addition", difficulty: 1 },
  { problem: "0 + 1", answer: 1, phase: 2, lesson: 40, type: "addition", difficulty: 1 },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: Addition Within 10 (Lessons 41–65)
  // Skills: +1, +2, +3, doubles, +0, missing addend,
  //         commutative property, number bonds
  // ═══════════════════════════════════════════════════════════════

  // Adding 1
  { problem: "1 + 1", answer: 2, phase: 3, lesson: 41, type: "addition", difficulty: 1 },
  { problem: "2 + 1", answer: 3, phase: 3, lesson: 41, type: "addition", difficulty: 1 },
  { problem: "3 + 1", answer: 4, phase: 3, lesson: 42, type: "addition", difficulty: 1 },
  { problem: "4 + 1", answer: 5, phase: 3, lesson: 42, type: "addition", difficulty: 1 },
  { problem: "5 + 1", answer: 6, phase: 3, lesson: 43, type: "addition", difficulty: 1 },
  { problem: "6 + 1", answer: 7, phase: 3, lesson: 43, type: "addition", difficulty: 1 },
  { problem: "7 + 1", answer: 8, phase: 3, lesson: 44, type: "addition", difficulty: 1 },
  { problem: "8 + 1", answer: 9, phase: 3, lesson: 44, type: "addition", difficulty: 1 },
  { problem: "9 + 1", answer: 10, phase: 3, lesson: 44, type: "addition", difficulty: 1 },

  // Adding 2
  { problem: "1 + 2", answer: 3, phase: 3, lesson: 45, type: "addition", difficulty: 1 },
  { problem: "2 + 2", answer: 4, phase: 3, lesson: 45, type: "addition", difficulty: 1 },
  { problem: "3 + 2", answer: 5, phase: 3, lesson: 46, type: "addition", difficulty: 1 },
  { problem: "4 + 2", answer: 6, phase: 3, lesson: 46, type: "addition", difficulty: 1 },
  { problem: "5 + 2", answer: 7, phase: 3, lesson: 47, type: "addition", difficulty: 1 },
  { problem: "6 + 2", answer: 8, phase: 3, lesson: 47, type: "addition", difficulty: 1 },
  { problem: "7 + 2", answer: 9, phase: 3, lesson: 48, type: "addition", difficulty: 1 },
  { problem: "8 + 2", answer: 10, phase: 3, lesson: 48, type: "addition", difficulty: 1 },

  // Adding 3
  { problem: "1 + 3", answer: 4, phase: 3, lesson: 49, type: "addition", difficulty: 1 },
  { problem: "2 + 3", answer: 5, phase: 3, lesson: 49, type: "addition", difficulty: 1 },
  { problem: "3 + 3", answer: 6, phase: 3, lesson: 50, type: "addition", difficulty: 1 },
  { problem: "4 + 3", answer: 7, phase: 3, lesson: 50, type: "addition", difficulty: 1 },
  { problem: "5 + 3", answer: 8, phase: 3, lesson: 51, type: "addition", difficulty: 1 },
  { problem: "6 + 3", answer: 9, phase: 3, lesson: 51, type: "addition", difficulty: 1 },
  { problem: "7 + 3", answer: 10, phase: 3, lesson: 52, type: "addition", difficulty: 1 },

  // Doubles
  { problem: "1 + 1", answer: 2, phase: 3, lesson: 53, type: "doubles", difficulty: 1 },
  { problem: "2 + 2", answer: 4, phase: 3, lesson: 53, type: "doubles", difficulty: 1 },
  { problem: "3 + 3", answer: 6, phase: 3, lesson: 53, type: "doubles", difficulty: 1 },
  { problem: "4 + 4", answer: 8, phase: 3, lesson: 53, type: "doubles", difficulty: 1 },
  { problem: "5 + 5", answer: 10, phase: 3, lesson: 54, type: "doubles", difficulty: 1 },

  // Adding 0
  { problem: "0 + 3", answer: 3, phase: 3, lesson: 55, type: "addition", difficulty: 1 },
  { problem: "5 + 0", answer: 5, phase: 3, lesson: 55, type: "addition", difficulty: 1 },
  { problem: "7 + 0", answer: 7, phase: 3, lesson: 56, type: "addition", difficulty: 1 },
  { problem: "0 + 9", answer: 9, phase: 3, lesson: 56, type: "addition", difficulty: 1 },
  { problem: "0 + 0", answer: 0, phase: 3, lesson: 55, type: "addition", difficulty: 1 },
  { problem: "10 + 0", answer: 10, phase: 3, lesson: 56, type: "addition", difficulty: 1 },

  // Commutative property
  { problem: "3 + 4", answer: 7, phase: 3, lesson: 57, type: "commutative", difficulty: 1 },
  { problem: "4 + 3", answer: 7, phase: 3, lesson: 57, type: "commutative", difficulty: 1 },
  { problem: "2 + 5", answer: 7, phase: 3, lesson: 57, type: "commutative", difficulty: 1 },
  { problem: "5 + 2", answer: 7, phase: 3, lesson: 57, type: "commutative", difficulty: 1 },
  { problem: "1 + 6", answer: 7, phase: 3, lesson: 58, type: "commutative", difficulty: 1 },
  { problem: "6 + 1", answer: 7, phase: 3, lesson: 58, type: "commutative", difficulty: 1 },
  { problem: "3 + 5", answer: 8, phase: 3, lesson: 58, type: "commutative", difficulty: 1 },
  { problem: "5 + 3", answer: 8, phase: 3, lesson: 58, type: "commutative", difficulty: 1 },

  // Missing addend
  { problem: "2 + ? = 5", answer: 3, phase: 3, lesson: 59, type: "missing-addend", difficulty: 2 },
  { problem: "? + 3 = 7", answer: 4, phase: 3, lesson: 59, type: "missing-addend", difficulty: 2 },
  { problem: "4 + ? = 9", answer: 5, phase: 3, lesson: 59, type: "missing-addend", difficulty: 2 },
  { problem: "? + 6 = 10", answer: 4, phase: 3, lesson: 60, type: "missing-addend", difficulty: 2 },
  { problem: "1 + ? = 8", answer: 7, phase: 3, lesson: 60, type: "missing-addend", difficulty: 2 },
  { problem: "? + 2 = 6", answer: 4, phase: 3, lesson: 60, type: "missing-addend", difficulty: 2 },
  { problem: "3 + ? = 10", answer: 7, phase: 3, lesson: 61, type: "missing-addend", difficulty: 2 },
  { problem: "? + 5 = 9", answer: 4, phase: 3, lesson: 61, type: "missing-addend", difficulty: 2 },

  // Number bonds to 10
  { problem: "1 + ? = 10", answer: 9, phase: 3, lesson: 62, type: "number-bonds", difficulty: 2 },
  { problem: "2 + ? = 10", answer: 8, phase: 3, lesson: 62, type: "number-bonds", difficulty: 2 },
  { problem: "3 + ? = 10", answer: 7, phase: 3, lesson: 62, type: "number-bonds", difficulty: 2 },
  { problem: "4 + ? = 10", answer: 6, phase: 3, lesson: 63, type: "number-bonds", difficulty: 2 },
  { problem: "5 + ? = 10", answer: 5, phase: 3, lesson: 63, type: "number-bonds", difficulty: 2 },
  { problem: "6 + ? = 10", answer: 4, phase: 3, lesson: 63, type: "number-bonds", difficulty: 2 },
  { problem: "7 + ? = 10", answer: 3, phase: 3, lesson: 64, type: "number-bonds", difficulty: 2 },
  { problem: "8 + ? = 10", answer: 2, phase: 3, lesson: 64, type: "number-bonds", difficulty: 2 },
  { problem: "9 + ? = 10", answer: 1, phase: 3, lesson: 64, type: "number-bonds", difficulty: 2 },

  // Mixed addition practice
  { problem: "5 + 4", answer: 9, phase: 3, lesson: 65, type: "addition", difficulty: 2 },
  { problem: "6 + 4", answer: 10, phase: 3, lesson: 65, type: "addition", difficulty: 2 },
  { problem: "3 + 7", answer: 10, phase: 3, lesson: 65, type: "addition", difficulty: 2 },
  { problem: "2 + 6", answer: 8, phase: 3, lesson: 65, type: "addition", difficulty: 2 },
  { problem: "4 + 5", answer: 9, phase: 3, lesson: 65, type: "addition", difficulty: 2 },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: Subtraction Within 10 (Lessons 66–85)
  // Skills: −1, −2, −3, −0, subtracting from self, fact families,
  //         mixed addition & subtraction
  // ═══════════════════════════════════════════════════════════════

  // Subtracting 1
  { problem: "2 \u2212 1", answer: 1, phase: 4, lesson: 66, type: "subtraction", difficulty: 1 },
  { problem: "3 \u2212 1", answer: 2, phase: 4, lesson: 66, type: "subtraction", difficulty: 1 },
  { problem: "4 \u2212 1", answer: 3, phase: 4, lesson: 67, type: "subtraction", difficulty: 1 },
  { problem: "5 \u2212 1", answer: 4, phase: 4, lesson: 67, type: "subtraction", difficulty: 1 },
  { problem: "6 \u2212 1", answer: 5, phase: 4, lesson: 67, type: "subtraction", difficulty: 1 },
  { problem: "7 \u2212 1", answer: 6, phase: 4, lesson: 68, type: "subtraction", difficulty: 1 },
  { problem: "8 \u2212 1", answer: 7, phase: 4, lesson: 68, type: "subtraction", difficulty: 1 },
  { problem: "9 \u2212 1", answer: 8, phase: 4, lesson: 68, type: "subtraction", difficulty: 1 },
  { problem: "10 \u2212 1", answer: 9, phase: 4, lesson: 69, type: "subtraction", difficulty: 1 },

  // Subtracting 2
  { problem: "3 \u2212 2", answer: 1, phase: 4, lesson: 70, type: "subtraction", difficulty: 1 },
  { problem: "4 \u2212 2", answer: 2, phase: 4, lesson: 70, type: "subtraction", difficulty: 1 },
  { problem: "5 \u2212 2", answer: 3, phase: 4, lesson: 70, type: "subtraction", difficulty: 1 },
  { problem: "6 \u2212 2", answer: 4, phase: 4, lesson: 71, type: "subtraction", difficulty: 1 },
  { problem: "7 \u2212 2", answer: 5, phase: 4, lesson: 71, type: "subtraction", difficulty: 1 },
  { problem: "8 \u2212 2", answer: 6, phase: 4, lesson: 72, type: "subtraction", difficulty: 1 },
  { problem: "9 \u2212 2", answer: 7, phase: 4, lesson: 72, type: "subtraction", difficulty: 1 },
  { problem: "10 \u2212 2", answer: 8, phase: 4, lesson: 72, type: "subtraction", difficulty: 1 },

  // Subtracting 3
  { problem: "4 \u2212 3", answer: 1, phase: 4, lesson: 73, type: "subtraction", difficulty: 1 },
  { problem: "5 \u2212 3", answer: 2, phase: 4, lesson: 73, type: "subtraction", difficulty: 1 },
  { problem: "6 \u2212 3", answer: 3, phase: 4, lesson: 74, type: "subtraction", difficulty: 1 },
  { problem: "7 \u2212 3", answer: 4, phase: 4, lesson: 74, type: "subtraction", difficulty: 1 },
  { problem: "8 \u2212 3", answer: 5, phase: 4, lesson: 75, type: "subtraction", difficulty: 1 },
  { problem: "9 \u2212 3", answer: 6, phase: 4, lesson: 75, type: "subtraction", difficulty: 1 },
  { problem: "10 \u2212 3", answer: 7, phase: 4, lesson: 76, type: "subtraction", difficulty: 1 },

  // Subtracting 0 and self
  { problem: "5 \u2212 0", answer: 5, phase: 4, lesson: 77, type: "subtraction", difficulty: 1 },
  { problem: "8 \u2212 0", answer: 8, phase: 4, lesson: 77, type: "subtraction", difficulty: 1 },
  { problem: "9 \u2212 0", answer: 9, phase: 4, lesson: 77, type: "subtraction", difficulty: 1 },
  { problem: "3 \u2212 3", answer: 0, phase: 4, lesson: 78, type: "subtraction", difficulty: 1 },
  { problem: "7 \u2212 7", answer: 0, phase: 4, lesson: 78, type: "subtraction", difficulty: 1 },
  { problem: "10 \u2212 10", answer: 0, phase: 4, lesson: 78, type: "subtraction", difficulty: 1 },

  // Subtraction within 10 — harder
  { problem: "10 \u2212 5", answer: 5, phase: 4, lesson: 79, type: "subtraction", difficulty: 2 },
  { problem: "10 \u2212 4", answer: 6, phase: 4, lesson: 79, type: "subtraction", difficulty: 2 },
  { problem: "10 \u2212 7", answer: 3, phase: 4, lesson: 79, type: "subtraction", difficulty: 2 },
  { problem: "10 \u2212 8", answer: 2, phase: 4, lesson: 79, type: "subtraction", difficulty: 2 },
  { problem: "10 \u2212 6", answer: 4, phase: 4, lesson: 80, type: "subtraction", difficulty: 2 },
  { problem: "10 \u2212 9", answer: 1, phase: 4, lesson: 80, type: "subtraction", difficulty: 2 },

  // Fact families
  { problem: "3 + 4 = 7, so 7 \u2212 4 = ?", answer: 3, phase: 4, lesson: 81, type: "fact-family", difficulty: 2 },
  { problem: "2 + 5 = 7, so 7 \u2212 2 = ?", answer: 5, phase: 4, lesson: 81, type: "fact-family", difficulty: 2 },
  { problem: "6 + 4 = 10, so 10 \u2212 6 = ?", answer: 4, phase: 4, lesson: 82, type: "fact-family", difficulty: 2 },
  { problem: "3 + 5 = 8, so 8 \u2212 5 = ?", answer: 3, phase: 4, lesson: 82, type: "fact-family", difficulty: 2 },
  { problem: "4 + 5 = 9, so 9 \u2212 4 = ?", answer: 5, phase: 4, lesson: 83, type: "fact-family", difficulty: 2 },
  { problem: "1 + 9 = 10, so 10 \u2212 1 = ?", answer: 9, phase: 4, lesson: 83, type: "fact-family", difficulty: 2 },

  // Mixed addition and subtraction
  { problem: "6 + 3", answer: 9, phase: 4, lesson: 84, type: "mixed", difficulty: 1 },
  { problem: "9 \u2212 3", answer: 6, phase: 4, lesson: 84, type: "mixed", difficulty: 1 },
  { problem: "4 + 5", answer: 9, phase: 4, lesson: 84, type: "mixed", difficulty: 1 },
  { problem: "8 \u2212 4", answer: 4, phase: 4, lesson: 84, type: "mixed", difficulty: 1 },
  { problem: "7 + 2", answer: 9, phase: 4, lesson: 85, type: "mixed", difficulty: 1 },
  { problem: "10 \u2212 3", answer: 7, phase: 4, lesson: 85, type: "mixed", difficulty: 1 },
  { problem: "5 + 5", answer: 10, phase: 4, lesson: 85, type: "mixed", difficulty: 1 },
  { problem: "6 \u2212 4", answer: 2, phase: 4, lesson: 85, type: "mixed", difficulty: 1 },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 5: Place Value & Addition/Subtraction Within 20 (Lessons 86–105)
  // Skills: tens and ones, skip counting by 2s/5s/10s,
  //         addition within 20, subtraction within 20
  // ═══════════════════════════════════════════════════════════════

  // Place value — tens and ones
  { problem: "How many tens in 14?", answer: 1, phase: 5, lesson: 86, type: "place-value", difficulty: 1 },
  { problem: "How many ones in 14?", answer: 4, phase: 5, lesson: 86, type: "place-value", difficulty: 1 },
  { problem: "How many tens in 17?", answer: 1, phase: 5, lesson: 87, type: "place-value", difficulty: 1 },
  { problem: "How many ones in 17?", answer: 7, phase: 5, lesson: 87, type: "place-value", difficulty: 1 },
  { problem: "How many tens in 20?", answer: 2, phase: 5, lesson: 88, type: "place-value", difficulty: 1 },
  { problem: "How many ones in 20?", answer: 0, phase: 5, lesson: 88, type: "place-value", difficulty: 1 },
  { problem: "How many tens in 11?", answer: 1, phase: 5, lesson: 86, type: "place-value", difficulty: 1 },
  { problem: "How many ones in 11?", answer: 1, phase: 5, lesson: 86, type: "place-value", difficulty: 1 },
  { problem: "How many tens in 19?", answer: 1, phase: 5, lesson: 87, type: "place-value", difficulty: 1 },
  { problem: "How many ones in 15?", answer: 5, phase: 5, lesson: 87, type: "place-value", difficulty: 1 },
  { problem: "1 ten and 3 ones = ?", answer: 13, phase: 5, lesson: 89, type: "place-value", difficulty: 1 },
  { problem: "1 ten and 6 ones = ?", answer: 16, phase: 5, lesson: 89, type: "place-value", difficulty: 1 },
  { problem: "1 ten and 8 ones = ?", answer: 18, phase: 5, lesson: 90, type: "place-value", difficulty: 1 },
  { problem: "2 tens and 0 ones = ?", answer: 20, phase: 5, lesson: 90, type: "place-value", difficulty: 1 },

  // Skip counting by 2s
  { problem: "Count by 2s: 2, 4, 6, ?", answer: 8, phase: 5, lesson: 91, type: "skip-counting", difficulty: 1 },
  { problem: "Count by 2s: 6, 8, 10, ?", answer: 12, phase: 5, lesson: 91, type: "skip-counting", difficulty: 1 },
  { problem: "Count by 2s: 10, 12, 14, ?", answer: 16, phase: 5, lesson: 92, type: "skip-counting", difficulty: 1 },
  { problem: "Count by 2s: 14, 16, 18, ?", answer: 20, phase: 5, lesson: 92, type: "skip-counting", difficulty: 1 },

  // Skip counting by 5s
  { problem: "Count by 5s: 5, 10, ?", answer: 15, phase: 5, lesson: 93, type: "skip-counting", difficulty: 1 },
  { problem: "Count by 5s: 10, 15, ?", answer: 20, phase: 5, lesson: 93, type: "skip-counting", difficulty: 1 },

  // Skip counting by 10s
  { problem: "Count by 10s: 10, 20, ?", answer: 30, phase: 5, lesson: 94, type: "skip-counting", difficulty: 1 },
  { problem: "Count by 10s: 20, 30, ?", answer: 40, phase: 5, lesson: 94, type: "skip-counting", difficulty: 1 },

  // Addition within 20
  { problem: "9 + 2", answer: 11, phase: 5, lesson: 95, type: "addition", difficulty: 2 },
  { problem: "8 + 3", answer: 11, phase: 5, lesson: 95, type: "addition", difficulty: 2 },
  { problem: "7 + 4", answer: 11, phase: 5, lesson: 96, type: "addition", difficulty: 2 },
  { problem: "9 + 3", answer: 12, phase: 5, lesson: 96, type: "addition", difficulty: 2 },
  { problem: "8 + 4", answer: 12, phase: 5, lesson: 97, type: "addition", difficulty: 2 },
  { problem: "9 + 5", answer: 14, phase: 5, lesson: 97, type: "addition", difficulty: 2 },
  { problem: "7 + 6", answer: 13, phase: 5, lesson: 98, type: "addition", difficulty: 2 },
  { problem: "8 + 5", answer: 13, phase: 5, lesson: 98, type: "addition", difficulty: 2 },
  { problem: "9 + 7", answer: 16, phase: 5, lesson: 99, type: "addition", difficulty: 2 },
  { problem: "8 + 7", answer: 15, phase: 5, lesson: 100, type: "addition", difficulty: 2 },
  { problem: "9 + 6", answer: 15, phase: 5, lesson: 100, type: "addition", difficulty: 2 },
  { problem: "7 + 7", answer: 14, phase: 5, lesson: 99, type: "addition", difficulty: 2 },
  { problem: "6 + 6", answer: 12, phase: 5, lesson: 99, type: "addition", difficulty: 2 },
  { problem: "9 + 9", answer: 18, phase: 5, lesson: 101, type: "addition", difficulty: 2 },
  { problem: "8 + 8", answer: 16, phase: 5, lesson: 101, type: "addition", difficulty: 2 },

  // Subtraction within 20
  { problem: "11 \u2212 2", answer: 9, phase: 5, lesson: 102, type: "subtraction", difficulty: 2 },
  { problem: "12 \u2212 3", answer: 9, phase: 5, lesson: 102, type: "subtraction", difficulty: 2 },
  { problem: "13 \u2212 4", answer: 9, phase: 5, lesson: 102, type: "subtraction", difficulty: 2 },
  { problem: "14 \u2212 5", answer: 9, phase: 5, lesson: 103, type: "subtraction", difficulty: 2 },
  { problem: "14 \u2212 6", answer: 8, phase: 5, lesson: 103, type: "subtraction", difficulty: 2 },
  { problem: "15 \u2212 7", answer: 8, phase: 5, lesson: 103, type: "subtraction", difficulty: 2 },
  { problem: "16 \u2212 8", answer: 8, phase: 5, lesson: 104, type: "subtraction", difficulty: 2 },
  { problem: "16 \u2212 9", answer: 7, phase: 5, lesson: 104, type: "subtraction", difficulty: 2 },
  { problem: "17 \u2212 8", answer: 9, phase: 5, lesson: 104, type: "subtraction", difficulty: 2 },
  { problem: "18 \u2212 9", answer: 9, phase: 5, lesson: 105, type: "subtraction", difficulty: 2 },
  { problem: "15 \u2212 6", answer: 9, phase: 5, lesson: 105, type: "subtraction", difficulty: 2 },
  { problem: "13 \u2212 7", answer: 6, phase: 5, lesson: 105, type: "subtraction", difficulty: 2 },
  { problem: "12 \u2212 5", answer: 7, phase: 5, lesson: 105, type: "subtraction", difficulty: 2 },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 6: Fluency Strategies (Lessons 106–125)
  // Skills: make 10, doubles+1, 2-digit + 1-digit (no regroup),
  //         2-digit + tens
  // ═══════════════════════════════════════════════════════════════

  // Make 10 strategy
  { problem: "8 + 5", answer: 13, phase: 6, lesson: 106, type: "make-ten", difficulty: 2 },
  { problem: "9 + 4", answer: 13, phase: 6, lesson: 106, type: "make-ten", difficulty: 2 },
  { problem: "7 + 5", answer: 12, phase: 6, lesson: 107, type: "make-ten", difficulty: 2 },
  { problem: "8 + 6", answer: 14, phase: 6, lesson: 107, type: "make-ten", difficulty: 2 },
  { problem: "9 + 3", answer: 12, phase: 6, lesson: 108, type: "make-ten", difficulty: 2 },
  { problem: "7 + 6", answer: 13, phase: 6, lesson: 108, type: "make-ten", difficulty: 2 },
  { problem: "8 + 4", answer: 12, phase: 6, lesson: 109, type: "make-ten", difficulty: 2 },
  { problem: "9 + 8", answer: 17, phase: 6, lesson: 109, type: "make-ten", difficulty: 2 },
  { problem: "6 + 5", answer: 11, phase: 6, lesson: 109, type: "make-ten", difficulty: 2 },

  // Doubles + 1
  { problem: "6 + 7", answer: 13, phase: 6, lesson: 110, type: "doubles-plus-one", difficulty: 2 },
  { problem: "7 + 8", answer: 15, phase: 6, lesson: 110, type: "doubles-plus-one", difficulty: 2 },
  { problem: "5 + 6", answer: 11, phase: 6, lesson: 111, type: "doubles-plus-one", difficulty: 2 },
  { problem: "8 + 9", answer: 17, phase: 6, lesson: 111, type: "doubles-plus-one", difficulty: 2 },
  { problem: "3 + 4", answer: 7, phase: 6, lesson: 112, type: "doubles-plus-one", difficulty: 1 },
  { problem: "4 + 5", answer: 9, phase: 6, lesson: 112, type: "doubles-plus-one", difficulty: 1 },
  { problem: "7 + 6", answer: 13, phase: 6, lesson: 112, type: "doubles-plus-one", difficulty: 2 },

  // 2-digit + 1-digit (no regrouping)
  { problem: "12 + 3", answer: 15, phase: 6, lesson: 113, type: "addition", difficulty: 2 },
  { problem: "14 + 2", answer: 16, phase: 6, lesson: 113, type: "addition", difficulty: 2 },
  { problem: "21 + 5", answer: 26, phase: 6, lesson: 114, type: "addition", difficulty: 2 },
  { problem: "33 + 4", answer: 37, phase: 6, lesson: 114, type: "addition", difficulty: 2 },
  { problem: "24 + 5", answer: 29, phase: 6, lesson: 115, type: "addition", difficulty: 2 },
  { problem: "41 + 6", answer: 47, phase: 6, lesson: 115, type: "addition", difficulty: 2 },
  { problem: "52 + 3", answer: 55, phase: 6, lesson: 116, type: "addition", difficulty: 2 },
  { problem: "60 + 7", answer: 67, phase: 6, lesson: 116, type: "addition", difficulty: 2 },
  { problem: "73 + 4", answer: 77, phase: 6, lesson: 117, type: "addition", difficulty: 2 },
  { problem: "81 + 8", answer: 89, phase: 6, lesson: 117, type: "addition", difficulty: 2 },
  { problem: "45 + 2", answer: 47, phase: 6, lesson: 117, type: "addition", difficulty: 2 },

  // 2-digit + tens
  { problem: "15 + 10", answer: 25, phase: 6, lesson: 118, type: "addition", difficulty: 2 },
  { problem: "23 + 10", answer: 33, phase: 6, lesson: 118, type: "addition", difficulty: 2 },
  { problem: "35 + 20", answer: 55, phase: 6, lesson: 119, type: "addition", difficulty: 2 },
  { problem: "42 + 30", answer: 72, phase: 6, lesson: 119, type: "addition", difficulty: 2 },
  { problem: "51 + 40", answer: 91, phase: 6, lesson: 120, type: "addition", difficulty: 2 },
  { problem: "27 + 10", answer: 37, phase: 6, lesson: 120, type: "addition", difficulty: 2 },
  { problem: "64 + 20", answer: 84, phase: 6, lesson: 121, type: "addition", difficulty: 2 },
  { problem: "18 + 30", answer: 48, phase: 6, lesson: 121, type: "addition", difficulty: 2 },
  { problem: "36 + 40", answer: 76, phase: 6, lesson: 122, type: "addition", difficulty: 2 },
  { problem: "11 + 50", answer: 61, phase: 6, lesson: 122, type: "addition", difficulty: 2 },

  // Mixed fluency review
  { problem: "9 + 5", answer: 14, phase: 6, lesson: 123, type: "addition", difficulty: 2 },
  { problem: "34 + 3", answer: 37, phase: 6, lesson: 123, type: "addition", difficulty: 2 },
  { problem: "47 + 20", answer: 67, phase: 6, lesson: 124, type: "addition", difficulty: 2 },
  { problem: "8 + 7", answer: 15, phase: 6, lesson: 124, type: "addition", difficulty: 2 },
  { problem: "53 + 6", answer: 59, phase: 6, lesson: 125, type: "addition", difficulty: 2 },
  { problem: "29 + 30", answer: 59, phase: 6, lesson: 125, type: "addition", difficulty: 2 },

  // ═══════════════════════════════════════════════════════════════
  // PHASE 7: Mastery — 2-Digit Operations & Word Problems (Lessons 126–150)
  // Skills: 2-digit + 2-digit (no regroup), 2-digit + 2-digit (regroup),
  //         2-digit − 2-digit (no regroup), 2-digit − 2-digit (regroup),
  //         word problems
  // ═══════════════════════════════════════════════════════════════

  // 2-digit + 2-digit (no regrouping)
  { problem: "21 + 13", answer: 34, phase: 7, lesson: 126, type: "addition", difficulty: 2 },
  { problem: "34 + 25", answer: 59, phase: 7, lesson: 126, type: "addition", difficulty: 2 },
  { problem: "42 + 31", answer: 73, phase: 7, lesson: 127, type: "addition", difficulty: 2 },
  { problem: "50 + 24", answer: 74, phase: 7, lesson: 127, type: "addition", difficulty: 2 },
  { problem: "11 + 45", answer: 56, phase: 7, lesson: 128, type: "addition", difficulty: 2 },
  { problem: "63 + 14", answer: 77, phase: 7, lesson: 128, type: "addition", difficulty: 2 },
  { problem: "22 + 37", answer: 59, phase: 7, lesson: 128, type: "addition", difficulty: 2 },
  { problem: "40 + 53", answer: 93, phase: 7, lesson: 129, type: "addition", difficulty: 2 },

  // 2-digit + 2-digit (with regrouping)
  { problem: "28 + 15", answer: 43, phase: 7, lesson: 130, type: "addition-regrouping", difficulty: 3 },
  { problem: "37 + 26", answer: 63, phase: 7, lesson: 130, type: "addition-regrouping", difficulty: 3 },
  { problem: "19 + 14", answer: 33, phase: 7, lesson: 131, type: "addition-regrouping", difficulty: 3 },
  { problem: "46 + 27", answer: 73, phase: 7, lesson: 131, type: "addition-regrouping", difficulty: 3 },
  { problem: "35 + 38", answer: 73, phase: 7, lesson: 132, type: "addition-regrouping", difficulty: 3 },
  { problem: "29 + 25", answer: 54, phase: 7, lesson: 132, type: "addition-regrouping", difficulty: 3 },
  { problem: "48 + 16", answer: 64, phase: 7, lesson: 133, type: "addition-regrouping", difficulty: 3 },
  { problem: "57 + 34", answer: 91, phase: 7, lesson: 133, type: "addition-regrouping", difficulty: 3 },
  { problem: "66 + 18", answer: 84, phase: 7, lesson: 134, type: "addition-regrouping", difficulty: 3 },
  { problem: "39 + 43", answer: 82, phase: 7, lesson: 134, type: "addition-regrouping", difficulty: 3 },

  // 2-digit − 2-digit (no regrouping)
  { problem: "56 \u2212 23", answer: 33, phase: 7, lesson: 135, type: "subtraction", difficulty: 2 },
  { problem: "78 \u2212 34", answer: 44, phase: 7, lesson: 135, type: "subtraction", difficulty: 2 },
  { problem: "49 \u2212 16", answer: 33, phase: 7, lesson: 136, type: "subtraction", difficulty: 2 },
  { problem: "65 \u2212 42", answer: 23, phase: 7, lesson: 136, type: "subtraction", difficulty: 2 },
  { problem: "87 \u2212 53", answer: 34, phase: 7, lesson: 137, type: "subtraction", difficulty: 2 },
  { problem: "99 \u2212 61", answer: 38, phase: 7, lesson: 137, type: "subtraction", difficulty: 2 },
  { problem: "74 \u2212 30", answer: 44, phase: 7, lesson: 137, type: "subtraction", difficulty: 2 },
  { problem: "58 \u2212 25", answer: 33, phase: 7, lesson: 138, type: "subtraction", difficulty: 2 },

  // 2-digit − 2-digit (with regrouping)
  { problem: "42 \u2212 17", answer: 25, phase: 7, lesson: 139, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "53 \u2212 28", answer: 25, phase: 7, lesson: 139, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "61 \u2212 34", answer: 27, phase: 7, lesson: 140, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "75 \u2212 49", answer: 26, phase: 7, lesson: 140, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "80 \u2212 36", answer: 44, phase: 7, lesson: 141, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "93 \u2212 57", answer: 36, phase: 7, lesson: 141, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "44 \u2212 19", answer: 25, phase: 7, lesson: 142, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "72 \u2212 38", answer: 34, phase: 7, lesson: 142, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "60 \u2212 25", answer: 35, phase: 7, lesson: 142, type: "subtraction-regrouping", difficulty: 3 },
  { problem: "81 \u2212 46", answer: 35, phase: 7, lesson: 143, type: "subtraction-regrouping", difficulty: 3 },

  // Word problems — addition
  { problem: "Sam has 5 apples. He gets 3 more. How many apples does Sam have now?", answer: 8, phase: 7, lesson: 144, type: "word-problem", difficulty: 2 },
  { problem: "There are 7 birds on a tree. 4 more birds fly in. How many birds are on the tree?", answer: 11, phase: 7, lesson: 144, type: "word-problem", difficulty: 2 },
  { problem: "Mia has 12 stickers. She gets 5 more. How many stickers does Mia have?", answer: 17, phase: 7, lesson: 145, type: "word-problem", difficulty: 2 },
  { problem: "A box has 23 crayons. Another box has 14 crayons. How many crayons are there in all?", answer: 37, phase: 7, lesson: 145, type: "word-problem", difficulty: 3 },
  { problem: "There are 16 red marbles and 18 blue marbles. How many marbles are there altogether?", answer: 34, phase: 7, lesson: 146, type: "word-problem", difficulty: 3 },

  // Word problems — subtraction
  { problem: "Jake has 9 cookies. He eats 4. How many cookies are left?", answer: 5, phase: 7, lesson: 147, type: "word-problem", difficulty: 2 },
  { problem: "There are 15 fish in a tank. 6 swim away. How many fish are left?", answer: 9, phase: 7, lesson: 147, type: "word-problem", difficulty: 2 },
  { problem: "Emma had 20 beads. She gave 8 to a friend. How many beads does Emma have now?", answer: 12, phase: 7, lesson: 148, type: "word-problem", difficulty: 2 },
  { problem: "A farmer has 45 eggs. He sells 23. How many eggs are left?", answer: 22, phase: 7, lesson: 148, type: "word-problem", difficulty: 3 },
  { problem: "There are 52 books on a shelf. 27 are taken out. How many books are left on the shelf?", answer: 25, phase: 7, lesson: 149, type: "word-problem", difficulty: 3 },

  // Word problems — mixed / comparison
  { problem: "Lily has 8 pencils. Tom has 13 pencils. How many more pencils does Tom have than Lily?", answer: 5, phase: 7, lesson: 149, type: "word-problem", difficulty: 3 },
  { problem: "A team scored 34 points in the first half and 29 points in the second half. How many points did they score in total?", answer: 63, phase: 7, lesson: 150, type: "word-problem", difficulty: 3 },
  { problem: "A store had 72 toys. It sold 35 toys. How many toys are left in the store?", answer: 37, phase: 7, lesson: 150, type: "word-problem", difficulty: 3 },
  { problem: "Maya read 14 pages on Monday and 19 pages on Tuesday. How many pages did she read in all?", answer: 33, phase: 7, lesson: 150, type: "word-problem", difficulty: 3 },
  { problem: "Ben has 30 baseball cards. He gives away 16. How many cards does Ben have left?", answer: 14, phase: 7, lesson: 150, type: "word-problem", difficulty: 3 },
];
