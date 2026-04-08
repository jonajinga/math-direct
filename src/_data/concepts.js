export default [
  // Phase 1: Foundation (Lessons 1-20)
  { symbol: "0", name: "zero", visual: "empty set", type: "number", lesson: 1, note: "nothing, none" },
  { symbol: "1", name: "one", visual: "\u2022", type: "number", lesson: 1 },
  { symbol: "2", name: "two", visual: "\u2022 \u2022", type: "number", lesson: 2 },
  { symbol: "3", name: "three", visual: "\u2022 \u2022 \u2022", type: "number", lesson: 3 },
  { symbol: "=", name: "equals", visual: "=", type: "symbol", lesson: 4, note: "is the same as" },
  { symbol: "4", name: "four", visual: "\u2022\u2022 \u2022\u2022", type: "number", lesson: 5 },
  { symbol: "5", name: "five", visual: "\u2022\u2022\u2022 \u2022\u2022", type: "number", lesson: 7 },
  { symbol: "6", name: "six", visual: "\u2022\u2022\u2022 \u2022\u2022\u2022", type: "number", lesson: 9 },
  { symbol: "7", name: "seven", visual: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022", type: "number", lesson: 11 },
  { symbol: "8", name: "eight", visual: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022", type: "number", lesson: 13 },
  { symbol: "9", name: "nine", visual: "\u2022\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022", type: "number", lesson: 15 },
  { symbol: "10", name: "ten", visual: "\u2022\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022\u2022", type: "number", lesson: 17 },
  { symbol: ">", name: "greater than", visual: ">", type: "symbol", lesson: 18, note: "more than" },
  { symbol: "<", name: "less than", visual: "<", type: "symbol", lesson: 18, note: "fewer than" },

  // Phase 2: Counting & Comparing (Lessons 21-40)
  { symbol: "11", name: "eleven", visual: "10 + 1", type: "number", lesson: 21 },
  { symbol: "12", name: "twelve", visual: "10 + 2", type: "number", lesson: 22 },
  { symbol: "13", name: "thirteen", visual: "10 + 3", type: "number", lesson: 23 },
  { symbol: "14", name: "fourteen", visual: "10 + 4", type: "number", lesson: 24 },
  { symbol: "15", name: "fifteen", visual: "10 + 5", type: "number", lesson: 25 },
  { symbol: "16", name: "sixteen", visual: "10 + 6", type: "number", lesson: 26 },
  { symbol: "17", name: "seventeen", visual: "10 + 7", type: "number", lesson: 27 },
  { symbol: "18", name: "eighteen", visual: "10 + 8", type: "number", lesson: 28 },
  { symbol: "19", name: "nineteen", visual: "10 + 9", type: "number", lesson: 29 },
  { symbol: "20", name: "twenty", visual: "10 + 10", type: "number", lesson: 30 },
  { symbol: "+", name: "plus", visual: "+", type: "symbol", lesson: 31, note: "add, combine" },
  { symbol: "number line", name: "number line", visual: "0\u2014\u2014\u2014\u201420", type: "tool", lesson: 33, note: "shows number positions and hops" },

  // Phase 3: Addition (Lessons 41-65)
  { symbol: "+1", name: "plus one", visual: "counting on", type: "operation", lesson: 41 },
  { symbol: "+2", name: "plus two", visual: "count on twice", type: "operation", lesson: 45 },
  { symbol: "+3", name: "plus three", visual: "count on three", type: "operation", lesson: 49 },
  { symbol: "doubles", name: "doubles", visual: "3+3, 4+4, 5+5", type: "strategy", lesson: 53, note: "same number added to itself" },
  { symbol: "+0", name: "plus zero", visual: "5+0=5", type: "operation", lesson: 56, note: "adding zero changes nothing" },
  { symbol: "commutative", name: "commutative property", visual: "2+3 = 3+2", type: "property", lesson: 58, note: "order does not matter" },
  { symbol: "number bonds", name: "number bonds", visual: "5 = 2+3 = 1+4", type: "concept", lesson: 60, note: "ways to make a number" },

  // Phase 4: Subtraction (Lessons 66-85)
  { symbol: "\u2212", name: "minus", visual: "\u2212", type: "symbol", lesson: 66, note: "take away, subtract" },
  { symbol: "\u22121", name: "minus one", visual: "counting back", type: "operation", lesson: 66 },
  { symbol: "\u22122", name: "minus two", visual: "count back twice", type: "operation", lesson: 70 },
  { symbol: "\u22123", name: "minus three", visual: "count back three", type: "operation", lesson: 74 },
  { symbol: "fact families", name: "fact families", visual: "3,4,7", type: "concept", lesson: 78, note: "addition and subtraction are related" },
  { symbol: "\u22120", name: "minus zero", visual: "5\u22120=5", type: "operation", lesson: 80, note: "subtracting zero changes nothing" },

  // Phase 5: Place Value (Lessons 86-105)
  { symbol: "tens", name: "tens place", visual: "||||||||||\u00a0= 10", type: "place value", lesson: 86 },
  { symbol: "ones", name: "ones place", visual: "|||", type: "place value", lesson: 86 },
  { symbol: "skip count 2s", name: "skip counting by 2", visual: "2,4,6,8,10", type: "strategy", lesson: 92 },
  { symbol: "skip count 5s", name: "skip counting by 5", visual: "5,10,15,20", type: "strategy", lesson: 94 },
  { symbol: "skip count 10s", name: "skip counting by 10", visual: "10,20,30,40", type: "strategy", lesson: 96 },

  // Phase 6: Fluency (Lessons 106-125)
  { symbol: "make 10", name: "make 10 strategy", visual: "8+5 = 8+2+3 = 13", type: "strategy", lesson: 106 },
  { symbol: "doubles +1", name: "doubles plus one", visual: "6+7 = 6+6+1 = 13", type: "strategy", lesson: 110 },
  { symbol: "2-digit + 1-digit", name: "two-digit plus one-digit", visual: "24+5=29", type: "operation", lesson: 115 },
  { symbol: "2-digit + tens", name: "two-digit plus tens", visual: "35+20=55", type: "operation", lesson: 120 },

  // Phase 7: Mastery (Lessons 126-150)
  { symbol: "2-digit + 2-digit", name: "two-digit addition", visual: "34+25=59", type: "operation", lesson: 126 },
  { symbol: "carrying", name: "regrouping (carrying)", visual: "28+15=43", type: "concept", lesson: 130 },
  { symbol: "2-digit \u2212 2-digit", name: "two-digit subtraction", visual: "56\u221223=33", type: "operation", lesson: 135 },
  { symbol: "borrowing", name: "regrouping (borrowing)", visual: "42\u221217=25", type: "concept", lesson: 140 },
  { symbol: "word problems", name: "word problems", visual: "story \u2192 equation", type: "application", lesson: 145 },
];
