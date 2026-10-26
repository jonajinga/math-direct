// A sample math lesson, built with the curriculum helpers, for the checks and
// the screenshots: every picture the grades 2 to 5 framework adds, and a
// puzzle with hints. It is listed nowhere, and nothing taught from it is
// recorded.
import { V } from "../../curriculum/lib/v.js";
import { model, test, note, fix, fixPoint, exercise } from "../../curriculum/lib/steps.js";
import { validateStep } from "../../curriculum/lib/validate.js";

const columns = { id: "columns", name: "Column work" };
const fractions = { id: "fractions", name: "Fractions and blocks" };
const models = { id: "models", name: "Lines, grids, and graphs" };
const figures = { id: "figures", name: "Figures and measures" };
const text = { id: "text", name: "Text and diagrams" };
const puzzles = { id: "puzzles", name: "Puzzles" };

const exercises = [
  exercise(columns, "review", "Column work", [
    note(V.colx([3458, 2167], "+", { ans: 5625, show: true, carries: ["", "1", "1", ""] }), "Column addition with two carries, the answer shown."),
    note(V.colx([5203, 1847], "−", { ans: 3356, blank: true, trades: [{ row: 0, col: 2, to: "1" }, { row: 0, col: 3, to: "4" }] }), "Column subtraction with a trade, the answer blank."),
    note(V.mult(23, 4, { partials: [{ value: 12, label: "4 × 3" }, { value: 80, label: "4 × 20" }], show: 2 }), "Partial products, both shown."),
    note(V.ldiv(96, 4, { steps: [{ q: 2, prod: 8, rem: 16, at: 0 }, { q: 4, prod: 16, rem: 0, at: 1 }], show: 2 }), "Long division, both steps shown."),
    test(V.colx([46, 37], "+", { ans: 83, blank: true }), "Forty-six plus thirty-seven. The child works it on the whiteboard. What is the sum?", "Eighty-three.", fix("Eighty-three.", "What is the sum?", "Six plus seven is thirteen: write three, carry one. One plus four plus three is eight."), { skill: "add", item: "colx:46+37", secs: 30, signal: "watch" }),
  ], { n: 1 }),
  exercise(fractions, "review", "Fractions and blocks", [
    note(V.blocks(1, 2, 3, 4, { labels: true }), "Base-ten blocks for one thousand two hundred thirty-four."),
    note(V.row(V.frac(3, 4), V.frac(1, 2, { whole: 2 })), "Three fourths, and two and one half."),
    note(V.bar(0, 0, { bars: [{ d: 4, shade: 3, label: "3/4" }, { d: 8, shade: 6, label: "6/8" }] }), "Two bars to compare: three fourths and six eighths."),
    test(V.choices([V.frac(1, 2, { size: "md" }), V.frac(3, 4, { size: "md" }), V.frac(1, 4, { size: "md" })], 1), "Touch three fourths.", "(Touches 3/4.)", fixPoint("This is three fourths: three over four.", "Touch three fourths."), { skill: "fraction", item: "frac:3/4", signal: "touch" }),
  ], { n: 2 }),
  exercise(models, "review", "Lines, grids, and graphs", [
    note(V.nl(0, 100, { by: 10, hl: 70 }), "A number line by tens with seventy marked."),
    note(V.nl(0, 2, { denom: 4, points: [{ v: 0.75, label: "3/4" }, { v: 1.5, label: "1 1/2" }] }), "A number line in fourths with two points."),
    note(V.grid(4, 6, { labels: true, split: [2, 3], partLabels: ["6", "6", "6", "6"] }), "An area model, four by six, cut in four."),
    note(V.tape([{ len: 3, label: "12" }, { len: 2, label: "8" }], { total: "?" }), "A tape model with the whole unknown."),
    note(V.graph("bar", [{ label: "Mon", n: 6 }, { label: "Tue", n: 10 }, { label: "Wed", n: 4 }], { scale: 2, title: "Books read" }), "A bar graph with a scale of two."),
    note(V.graph("plot", [{ v: 1, n: 2 }, { v: 2, n: 4 }, { v: 3, n: 1 }, { v: 4, n: 3 }], { title: "Pets at home" }), "A line plot."),
    note(V.table(["Day", "Books"], [["Mon", 6], ["Tue", 10], ["Wed", "?"]]), "A table with a blank."),
  ], { n: 3 }),
  exercise(figures, "review", "Figures and measures", [
    note(V.geo("rect", { w: 1.6, h: 1, sides: ["8 cm", "5 cm", "8 cm", "5 cm"], right: [0, 1, 2, 3], names: ["A", "B", "C", "D"] }), "A rectangle with its sides labeled and its right angles marked."),
    note(V.angle(60, { protractor: true, label: true }), "A sixty-degree angle under a protractor."),
    note(V.coord(8, 6, { points: [{ x: 2, y: 3, label: "A" }, { x: 6, y: 5, label: "B" }], lines: [[0, 1]] }), "A coordinate grid with two points joined."),
    note(V.ruler(8, { unit: "cm", obj: 5, start: 1 }), "A ruler in centimeters with a bar laid on it."),
    note(V.cubes(4, 3, 2, { labels: true }), "A box of unit cubes, four by three by two."),
  ], { n: 4 }),
  exercise(text, "review", "Text and diagrams", [
    note(V.prose(["Mia had 48 stickers. She gave 19 to Sam.", "Then she bought a pack of 24.", "How many stickers does Mia have now?"]), "A word problem, written out."),
    note(V.poem([["The fog comes", "on little cat feet."], ["It sits looking", "over harbor and city", "on silent haunches", "and then moves on."]], { fade: 0.3, seed: 3 }), "A poem with three tenths of its words faded."),
    note(V.poem([["The fog comes", "on little cat feet."]], { fade: "first" }), "The same lines with first letters only."),
    note(V.poem([["The fog comes", "on little cat feet."]], { fade: "rules" }), "The same lines as rules."),
    note(V.diagram("plant", { labels: ["flower", "leaf", "stem", "roots"] }), "A plant with its parts labeled."),
    note(V.diagram("circuit", { labels: ["battery", "wire", "bulb", "switch"] }), "A circuit, closed."),
    test(V.diagram("food-chain", { labels: ["grass", "grasshopper", "frog", "hawk"], tap: true, ans: 2 }), "Touch the animal that eats the grasshopper.", "(Touches frog.)", fixPoint("The arrow from the grasshopper points to the frog. The frog eats the grasshopper.", "Touch the animal that eats the grasshopper."), { skill: "science", item: "chain:frog", signal: "touch" }),
  ], { n: 5 }),
  exercise(puzzles, "puzzle", "Puzzle: the greatest sum", [
    model(V.prose(["Use the digits 3, 5, and 8 once each.", "Make a two-digit number and a one-digit number.", "What is the greatest sum you can make?"]), "Read the problem with the child. The child works it on the whiteboard. A hint is on the Hint button if the child is stuck."),
    test(V.prose(["Use the digits 3, 5, and 8 once each.", "Make a two-digit number and a one-digit number.", "What is the greatest sum you can make?"]), "Ask for the answer when the child says done. What is the greatest sum?", "Eighty-eight.",
      fix("Eighty-eight.", "What is the greatest sum?", "The tens digit counts most, so the eight goes in the tens place. Then eighty-five plus three and eighty-three plus five both make eighty-eight."), {
        skill: "puzzle", item: "pz:sample:greatest-sum", secs: 240, signal: "watch",
        hints: ["Which place makes a number big, the tens or the ones?", "Put the biggest digit where it counts most, then try the other two digits both ways."],
      }),
  ], { n: 6 }),
];

const errors = [];
exercises.forEach((ex) => ex.steps.forEach((st, i) => validateStep(st, `math sample, ${ex.title}, step ${i + 1}`, errors)));
if (errors.length) throw new Error("The math sample has errors:\n  " + errors.join("\n  "));

export default {
  level: "math-sample",
  levelName: "Sample",
  levelSlug: "math-sample",
  number: 1,
  id: "math-sample-001",
  url: "/math-sample/",
  title: "Math sample",
  newUnits: [],
  exercises,
};
