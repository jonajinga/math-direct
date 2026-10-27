// Second Grade: shapes and equal shares (2.G.1, 2.G.2, 2.G.3). The child
// names shapes by their sides and corners, learns the cube, sorts the kinds
// of quadrilaterals, cuts a rectangle into rows and columns of squares, and
// names halves, thirds, and fourths of a whole. See BRIEF.md.
//
// The stage draws halves and fourths with V.parts but has no cut for
// thirds, so a whole cut into thirds is V.grid(1, 3): a rectangle of three
// same-size squares, with fill of them shaded.
//
// An item with a given key always draws the same picture (its color and
// turn come from the key), so the scheduler and the tests, which tell items
// apart by their words and picture, never ask one item twice.

import { V, model, lead, test, fix, fixPoint, word, Word, chain, cap, favorNew } from "./common2.js";

const COLORS = ["red", "blue", "green", "orange", "purple"];

// A small hash of an item key, for the color and turn of its picture.
function hashOf(key) {
  let h = 7;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}
const hue = (key) => COLORS[hashOf(key) % COLORS.length];
const turn = (key, turns) => turns[hashOf(key) % turns.length];
// Three choices in an order set by the seed: the item's key and the lesson,
// so the right answer moves from lesson to lesson but not within one test.
const ORDERS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
const arrange = (list, seed) => ORDERS[hashOf(seed) % 6].map((i) => list[i]);

// ── Sides and corners ──

const BY_SIDES = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon" };
const RULE_SIDES = {
  3: "A shape with three sides is a triangle.",
  4: "A quadrilateral is any shape with four sides.",
  5: "A shape with five sides is a pentagon.",
  6: "A shape with six sides is a hexagon.",
};
const HEX_PTS = [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]];

// Every figure the child counts sides on: the colored shapes, and the plain
// lopsided figures V.geo draws, so a quadrilateral is not always a square.
const FIG = { triangle: 3, square: 4, rectangle: 4, rhombus: 4, trapezoid: 4, pentagon: 5, hexagon: 6, tri: 3, "right-tri": 3, quad: 4, para: 4, trap: 4, poly5: 5, poly6: 6 };
const GEO = new Set(["tri", "right-tri", "quad", "para", "trap"]);
const ALL_FIGS = Object.keys(FIG);
const FOUR = ALL_FIGS.filter((k) => FIG[k] === 4);
const NOT_FOUR = ALL_FIGS.filter((k) => FIG[k] !== 4);

// The picture of a figure for an item: the same picture for the same key.
function figure(fig, key) {
  if (fig === "poly5") return V.geo("poly", { w: 1.1, h: 1 });
  if (fig === "poly6") return V.geo("poly", { pts: HEX_PTS, w: 1.2, h: 1 });
  if (GEO.has(fig)) return V.geo(fig);
  const rot = fig === "square" || fig === "rhombus" ? 0 : fig === "trapezoid" ? turn(key, [0, 180]) : turn(key, [0, 0, 90]);
  return V.shape(fig, { c: hue(key), rot });
}

// kind: sides | corners | name | quad?
function sidesItem(r, kind, fig) {
  fig = fig || r.pick(ALL_FIGS);
  const n = FIG[fig], name = BY_SIDES[n];
  const key = `sides:${kind === "sides" ? "count" : kind}:${fig}`;
  const pic = figure(fig, key);
  if (kind === "sides") {
    const q = "How many sides?";
    return test(pic, q, Word(n) + ".", fix(Word(n) + ".", q, `I touch each side as I count: ${chain(1, n)}. ${Word(n)} sides.`), { skill: "shape", item: key });
  }
  if (kind === "corners") {
    const q = "How many corners?";
    return test(pic, q, Word(n) + ".", fix(Word(n) + ".", q, `A shape has as many corners as sides. I touch each corner as I count: ${chain(1, n)}. ${Word(n)} corners.`), { skill: "shape", item: key });
  }
  if (kind === "name") {
    const q = n === 4 ? "This shape has four sides. What do we call any shape with four sides?" : "What shape is this? Name it by its sides.";
    const a = `A ${name}.`;
    const why = n === 4 ? RULE_SIDES[4] : `It has ${word(n)} sides. ${RULE_SIDES[n]}`;
    return test(pic, q, a, fix(a, q, why), { skill: "shape", item: key });
  }
  const yes = n === 4;
  const q = "Is this shape a quadrilateral?";
  const a = yes ? "Yes." : "No.";
  const why = yes ? "It has four sides. A quadrilateral is any shape with four sides." : `It has ${word(n)} sides, not four. A quadrilateral has four sides. This is a ${name}.`;
  return test(pic, q, a, fix(a, q, why), { skill: "shape", item: key });
}

// Spoken, with no picture: the name from the sides, or the sides from the name.
function sidesWord(r) {
  const n = r.pick([3, 4, 5, 6]);
  const name = BY_SIDES[n];
  if (r() < 0.5) {
    const q = `What do we call a shape with ${word(n)} sides?`;
    return test(V.say(), q, `A ${name}.`, fix(`A ${name}.`, q, RULE_SIDES[n]), { skill: "shape", item: `sides:word:${n}` });
  }
  const q = `How many sides does a ${name} have?`;
  return test(V.say(), q, Word(n) + ".", fix(Word(n) + ".", q, RULE_SIDES[n]), { skill: "shape", item: `sides:howmany:${name}` });
}

// ── The cube ──

const CUBE = {
  faces: [6, "The flat sides of a cube are its faces. A cube has six faces: top, bottom, front, back, and two sides."],
  edges: [12, "An edge is where two faces meet. A cube has twelve edges: four around the top, four around the bottom, and four going down."],
  corners: [8, "A corner is where edges meet. A cube has eight corners: four on top and four on the bottom."],
};

function cubeItem(part) {
  const [n, rule] = CUBE[part];
  const key = `cube:${part}`;
  const q = `How many ${part} does a cube have?`;
  return test(V.solid("cube", { c: hue(key) }), q, Word(n) + ".", fix(Word(n) + ".", q, rule), { skill: "shape", item: key });
}

// which: cube | flat. A square, a cube, and another solid to choose from;
// the order changes from lesson n to lesson.
function touchCube(which, n) {
  const key = `cube:touch:${which}`, c = hue(key), seed = `${key}:${n}`;
  const opts = arrange(["square", "cube", turn(seed, ["sphere", "cylinder", "cone"])], seed);
  const pics = opts.map((s) => (s === "square" ? V.shape(s, { c }) : V.solid(s, { c })));
  if (which === "cube") {
    return test(V.choices(pics, opts.indexOf("cube")), "Touch the cube.", "(Touches the cube.)", fixPoint("This is the cube: solid, with six square faces. (Touch it.)", "Touch the cube."), { skill: "shape", item: key, confirm: "Yes, that is the cube." });
  }
  return test(V.choices(pics, opts.indexOf("square")), "Touch the shape that is flat.", "(Touches the square.)", fixPoint("The square is flat, like a drawing. The others are solid. (Touch the square.)", "Touch the shape that is flat."), { skill: "shape", item: key, confirm: "Yes, the square is flat." });
}

function flatSolid(r) {
  const cube = r() < 0.5;
  const key = `cube:flat?:${cube ? "cube" : "square"}`, c = hue(key);
  const q = cube ? "Is a cube flat or solid?" : "Is a square flat or solid?";
  const a = cube ? "Solid." : "Flat.";
  const why = cube ? "A cube is solid. You could pick it up and hold it. A square is flat, like a drawing." : "A square is flat, like a drawing. A cube is solid: you could pick it up.";
  return test(V.row(V.shape("square", { c, size: "md" }), V.solid("cube", { c, size: "md" })), q, a, fix(a, q, why), { skill: "shape", item: key });
}

// ── Kinds of quadrilaterals ──

const QUADS = ["square", "rectangle", "rhombus", "trapezoid"];
const QUAD_RULE = {
  square: "A square has four equal sides and four square corners.",
  rectangle: "A rectangle has four square corners. Two sides are long and two are short.",
  rhombus: "A rhombus has four equal sides, but its corners are not square. It is like a square pushed over.",
  trapezoid: "A trapezoid has four sides. The top and the bottom go the same way, and one is shorter than the other.",
};

function quadPic(s, key) {
  const rot = s === "rectangle" ? turn(key + s, [0, 90]) : s === "trapezoid" ? turn(key + s, [0, 180]) : 0;
  return V.shape(s, { c: hue(key), rot });
}

// Touch the quadrilateral named among three, in an order set by the lesson n.
function touchQuad(s, n) {
  const key = `quad:touch:${s}`, seed = `${key}:${n}`;
  const rest = QUADS.filter((x) => x !== s), drop = turn(seed, rest);
  const opts = arrange([s, ...rest.filter((x) => x !== drop)], seed);
  return test(V.choices(opts.map((x) => quadPic(x, key)), opts.indexOf(s)), `Touch the ${s}.`, `(Touches the ${s}.)`, fixPoint(`This is the ${s}. ${QUAD_RULE[s]} (Touch it.)`, `Touch the ${s}.`), { skill: "shape", item: key, confirm: `Yes, that is the ${s}.` });
}

function nameQuad(s) {
  const key = `quad:name:${s}`;
  const q = "What kind of quadrilateral is this?";
  const a = `A ${s}.`;
  return test(quadPic(s, key), q, a, fix(a, q, QUAD_RULE[s]), { skill: "shape", item: key });
}

// kind: special | square?
function squareItem(r, kind) {
  if (kind === "special") {
    const q = "What makes a square special?";
    const a = "Four equal sides and four square corners.";
    return test(V.shape("square", { c: hue("quad:special") }), q, a, fix(a, q, "A square needs both: four equal sides and four square corners."), { skill: "shape", item: "quad:special" });
  }
  const s = r.pick(["square", "rhombus", "rectangle"]);
  const key = `quad:square?:${s}`;
  const q = "Is this a square?";
  const a = s === "square" ? "Yes." : "No.";
  const why = {
    square: "It has four equal sides and four square corners, so it is a square.",
    rhombus: "Its four sides are equal, but its corners are not square. A square needs square corners. This is a rhombus.",
    rectangle: "Its corners are square, but its sides are not all equal. A square needs four equal sides. This is a rectangle.",
  }[s];
  return test(quadPic(s, key), q, a, fix(a, q, why), { skill: "shape", item: key });
}

// ── Rows and columns of squares ──

// kind: rows | cols | total. dims: [rows, cols], or random from 2 to 5.
function gridItem(r, kind, dims) {
  const [rows, cols] = dims || [r.int(2, 5), r.int(2, 5)];
  const key = `rows:${kind}:${rows}x${cols}`;
  if (kind === "rows") {
    const q = "How many rows?";
    return test(V.grid(rows, cols), q, Word(rows) + ".", fix(Word(rows) + ".", q, `A row goes across. I count the rows from the top: ${chain(1, rows)}. ${Word(rows)} rows.`), { skill: "shape", item: key });
  }
  if (kind === "cols") {
    const q = "How many columns?";
    return test(V.grid(rows, cols), q, Word(cols) + ".", fix(Word(cols) + ".", q, `A column goes up and down. I count the columns from the left: ${chain(1, cols)}. ${Word(cols)} columns.`), { skill: "shape", item: key });
  }
  const total = rows * cols;
  const q = `${Word(rows)} rows of ${word(cols)}. How many squares in all?`;
  const why = `Each row has ${word(cols)} squares. I count by rows: ${chain(cols, total, cols)}. ${Word(rows)} rows of ${word(cols)} is ${word(total)}.`;
  return test(V.grid(rows, cols, { labels: true }), q, Word(total) + ".", fix(Word(total) + ".", q, why), { skill: "shape", item: key });
}

// ── Halves, thirds, and fourths ──

const CUTS = ["halves", "thirds", "fourths"];
const PARTS = { halves: 2, thirds: 3, fourths: 4 };
const ONE = { halves: "half", thirds: "third", fourths: "fourth" };
const SHAPE_NAME = { circle: "circle", rect: "rectangle", square: "square" };

// A whole cut into equal parts, shade of them shaded. The shape of the whole
// is chosen here and written into the item's key (keyOf gets "circle",
// "rect", "square", or "grid"); the key then sets the color and, for a
// rectangle, whether it is cut the other way (halves across, fourths in
// strips). Thirds are a 1 by 3 grid, since V.parts draws no thirds.
function wholeOf(r, cut, shade, keyOf, o = {}) {
  if (cut === "thirds") return { pic: V.grid(1, 3, { fill: shade }), name: "rectangle", key: keyOf("grid") };
  const s = o.s || r.pick(["circle", "rect", "square"]);
  const key = keyOf(s);
  const across = s === "rect" && hashOf(key) % 2 === 1;
  const c = across ? (cut === "halves" ? "halves-h" : "fourths-strips") : cut;
  const opts = { shade, c: hue(key) };
  if (o.size) opts.size = o.size;
  return { pic: V.parts(s, c, opts), name: SHAPE_NAME[s], key };
}

// kind: count | name | shaded
function shareItem(r, kind, cut) {
  cut = cut || r.pick(CUTS);
  const n = PARTS[cut];
  if (kind === "count") {
    const { pic, key } = wholeOf(r, cut, 0, (tag) => `share:count:${cut}:${tag}`);
    const q = "How many equal parts?";
    return test(pic, q, Word(n) + ".", fix(Word(n) + ".", q, `I count the parts: ${chain(1, n)}. ${Word(n)} equal parts.`), { skill: "share", item: key });
  }
  if (kind === "name") {
    const { pic, key } = wholeOf(r, cut, 0, (tag) => `share:name:${cut}:${tag}`);
    const q = "What do we call these equal parts?";
    const a = cap(cut) + ".";
    return test(pic, q, a, fix(a, q, `There are ${word(n)} equal parts. ${Word(n)} equal parts are ${cut}.`), { skill: "share", item: key });
  }
  const { pic, name, key } = wholeOf(r, cut, 1, (tag) => `share:shaded:${cut}:1:${tag}`);
  const q = `What part of the ${name} is shaded?`;
  const a = `One ${ONE[cut]}.`;
  return test(pic, q, a, fix(a, q, `The ${name} is cut into ${word(n)} equal parts. One of ${word(n)} equal parts is a ${ONE[cut]}.`), { skill: "share", item: key });
}

// kind: both (two wholes of different shapes) | same (one whole cut two
// ways) | make (how many parts make a whole). force: yes | no, for the
// answer the first teaching wants.
function wholeItem(r, kind, cut, force) {
  if (kind === "make") {
    cut = cut || r.pick(CUTS);
    const n = PARTS[cut];
    const { pic, key } = wholeOf(r, cut, n, (tag) => `whole:make:${cut}:${tag}`);
    const q = `How many ${cut} make a whole?`;
    const all = n === 2 ? "both are shaded" : `all ${word(n)} are shaded`;
    return test(pic, q, Word(n) + ".", fix(Word(n) + ".", q, `The whole is cut into ${word(n)} equal parts, and ${all}. ${Word(n)} ${cut} make a whole.`), { skill: "share", item: key });
  }
  cut = cut === "thirds" ? "fourths" : cut || r.pick(["halves", "fourths"]);
  const n = PARTS[cut], one = ONE[cut];
  const yes = force ? force === "yes" : r() < 0.6;
  if (kind === "both") {
    const cut2 = yes ? cut : cut === "halves" ? "fourths" : "halves";
    const key = `whole:both:${cut}:${cut2}`, c = hue(key);
    const rectCut = cut2 === "halves" && turn(key, [true, false]) ? "halves-h" : cut2;
    const pics = V.row(V.parts("circle", cut, { shade: 1, c, size: "md" }), V.parts("rect", rectCut, { shade: 1, c, size: "md" }));
    const q = `A circle and a rectangle. One part of each is shaded. Are both shaded parts ${cut}?`;
    const why = yes
      ? `Each whole is cut into ${word(n)} equal parts. One of ${word(n)} equal parts is a ${one}, whatever the shape of the whole. Both are ${cut}.`
      : `The circle is cut into ${word(n)} equal parts, so its shaded part is a ${one}. The rectangle is cut into ${word(PARTS[cut2])} equal parts, so its shaded part is a ${ONE[cut2]}, not a ${one}.`;
    return test(pics, q, yes ? "Yes." : "No.", fix(yes ? "Yes." : "No.", q, why), { skill: "share", item: key });
  }
  const key = `whole:same:${cut}:${yes ? "equal" : "unequal"}`, c = hue(key);
  const shape = cut === "halves" ? "squares" : "rectangles";
  const s = cut === "halves" ? "square" : "rect";
  const first = V.parts(s, cut, { shade: 1, c, size: "md" });
  const second = V.parts(s, !yes ? (cut === "halves" ? "unequal2" : "unequal4") : cut === "halves" ? "halves-h" : "fourths-strips", { shade: 1, c, size: "md" });
  const q = `Two ${shape} the same size, each cut into ${word(n)} parts. Is each shaded part a ${one}?`;
  const why = yes
    ? `The parts are not the same shape, but each is one of ${word(n)} equal parts of the same whole. So each is a ${one}.`
    : `The first is cut into ${word(n)} equal parts, so its shaded part is a ${one}. The second is cut into ${word(n)} parts that are not equal. A ${one} is one of ${word(n)} equal parts.`;
  return test(V.row(first, second), q, yes ? "Yes." : "No.", fix(yes ? "Yes." : "No.", q, why), { skill: "share", item: key });
}

// kind: whole (the whole as so many parts) | in (how many parts in a whole)
// | two (how many parts in two wholes)
function describeItem(r, kind, cut) {
  cut = cut || r.pick(CUTS);
  const n = PARTS[cut];
  if (kind === "whole") {
    const { pic, name, key } = wholeOf(r, cut, n, (tag) => `desc:whole:${cut}:${tag}`);
    const q = `This ${name} is one whole, cut into ${cut}. How many ${cut} is the whole?`;
    const a = `${Word(n)} ${cut}.`;
    return test(pic, q, a, fix(a, q, `The whole is all of its parts. I count them: ${chain(1, n)}. The whole is ${word(n)} ${cut}.`), { skill: "share", item: key });
  }
  if (kind === "in") {
    const q = `How many ${cut} are in a whole?`;
    return test(V.say(), q, Word(n) + ".", fix(Word(n) + ".", q, `${Word(n)} ${cut} make a whole, so a whole has ${word(n)} ${cut}.`), { skill: "share", item: `desc:in:${cut}` });
  }
  const key = `desc:two:${cut}`, c = hue(key), s = turn(key, ["circle", "rect"]);
  const one = () => (cut === "thirds" ? V.grid(1, 3, { fill: 3 }) : V.parts(s, cut, { shade: n, c, size: "md" }));
  const total = 2 * n;
  const q = `Two wholes, each cut into ${cut}. How many ${cut} in two wholes?`;
  const why = `Each whole has ${word(n)} ${cut}. ${Word(n)} and ${word(n)} is ${word(total)}. Two wholes have ${word(total)} ${cut}.`;
  return test(V.row(one(), one()), q, Word(total) + ".", fix(Word(total) + ".", q, why), { skill: "share", item: key });
}

// One review or test item for a unit, the kind chosen at random. The kinds
// answered by a number or a touch are favored, so On your own has items.
const ITEMS = {
  sides: (r) => { const k = r.pick(["sides", "sides", "corners", "name", "quad?", "word"]); return k === "word" ? sidesWord(r) : sidesItem(r, k); },
  cube: (r, n) => { const k = r.pick(["faces", "edges", "corners", "cube", "flat", "either"]); return k === "cube" || k === "flat" ? touchCube(k, n) : k === "either" ? flatSolid(r) : cubeItem(k); },
  quads: (r, n) => { const k = r.pick(["touch", "touch", "name", "special", "square?"]); return k === "touch" ? touchQuad(r.pick(QUADS), n) : k === "name" ? nameQuad(r.pick(QUADS)) : squareItem(r, k); },
  rows: (r) => gridItem(r, r.pick(["rows", "cols", "total", "total"])),
  shares: (r) => shareItem(r, r.pick(["count", "name", "shaded", "shaded"])),
  "same-whole": (r) => wholeItem(r, r.pick(["both", "same", "make", "make"])),
  describe: (r) => describeItem(r, r.pick(["whole", "in", "two"])),
};

// How hard an item is, by its kind: counting first, naming and touching
// next, deciding and describing last.
const RANK = { count: 0, faces: 0, edges: 0, corners: 0, rows: 0, cols: 0, make: 0, in: 0, howmany: 0, total: 1, name: 1, touch: 1, word: 1, shaded: 1, special: 1, "flat?": 2, "quad?": 2, "square?": 2, both: 2, same: 2, whole: 2, two: 2 };
const rank = (st) => RANK[st.item.split(":")[1]] ?? 1;

// Items for a list of units, one per pick, no item twice.
function itemsFor(ctx, picks, units, want) {
  const r = ctx.rand;
  const steps = [], seen = new Set();
  for (let tries = 0; steps.length < want && tries < 20; tries++) {
    const u = tries < picks.length ? picks[tries] : r.pick(units);
    const st = ITEMS[u.id](r, ctx.lesson);
    if (seen.has(st.item)) continue;
    seen.add(st.item);
    steps.push({ st, i: units.indexOf(u) });
  }
  return steps;
}

export const shapes = {
  id: "shapes",
  name: "Shapes and equal shares",
  summary: "Name shapes by their sides and corners, know the cube, tell squares, rectangles, rhombuses, and trapezoids apart, cut rectangles into rows and columns of squares, and name halves, thirds, and fourths of a whole.",
  standard: "2.G.1, 2.G.2, 2.G.3",
  units: [
    { id: "sides", lesson: 23, label: "Naming shapes by their sides" },
    { id: "cube", lesson: 44, label: "The cube: faces, edges, and corners" },
    { id: "quads", lesson: 71, label: "Kinds of quadrilaterals" },
    { id: "rows", lesson: 87, label: "Rows and columns of squares" },
    { id: "shares", lesson: 103, label: "Halves, thirds, and fourths" },
    { id: "same-whole", lesson: 118, label: "Equal shares of the same whole" },
    { id: "describe", lesson: 130, label: "A whole as halves, thirds, and fourths" },
  ],
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "sides") {
      return {
        title: u.label, steps: [
          model(V.shape("triangle", { c: "red" }), "We name a shape by its sides. My turn. I count the sides: one, two, three. Three sides. A shape with three sides is a triangle.", { do: "Run a finger along each side as you count it." }),
          model(V.geo("quad"), "I count the sides: one, two, three, four. Four sides. Any shape with four sides is a quadrilateral. Squares, rectangles, and trapezoids are all quadrilaterals."),
          model(V.row(V.shape("pentagon", { c: "green", size: "md" }), V.shape("hexagon", { c: "orange", size: "md" })), "Five sides: a pentagon. Six sides: a hexagon. A shape has as many corners as sides. A hexagon has six sides and six corners."),
          lead(V.shape("pentagon", { c: "purple" }), "Count the sides with me: one, two, three, four, five. Five sides. What shape is it? Say it with me.", "A pentagon."),
          lead(V.shape("trapezoid", { c: "blue" }), "Count the sides with me: one, two, three, four. Four sides. What do we call any shape with four sides? Say it with me.", "A quadrilateral."),
          sidesItem(r, "sides", "hexagon"),
          sidesItem(r, "name", "triangle"),
          sidesItem(r, "name", r.pick(["pentagon", "poly5"])),
          sidesItem(r, "quad?", r.pick(FOUR)),
          sidesItem(r, "quad?", r.pick(NOT_FOUR)),
        ],
      };
    }
    if (u.id === "cube") {
      return {
        title: u.label, steps: [
          model(V.solid("cube", { c: "blue" }), "This is a cube. A cube is solid: you could hold it in your hand. Its flat sides are called faces. My turn. A cube has six faces, and every face is a square.", { do: "Point to the three faces you can see. Say that three more are hidden behind." }),
          model(V.solid("cube", { c: "blue" }), "Where two faces meet is an edge. A cube has twelve edges. Where edges meet is a corner. A cube has eight corners.", { do: "Run a finger along one edge, then touch one corner." }),
          model(V.row(V.shape("square", { c: "green", size: "md" }), V.solid("cube", { c: "green", size: "md" })), "A square is flat, like a drawing. It has four sides. A cube is solid, like a block. It has six faces."),
          lead(V.solid("cube", { c: "red" }), "Six faces, twelve edges, eight corners. Say it with me.", "Six faces, twelve edges, eight corners."),
          lead(V.row(V.shape("square", { c: "orange", size: "md" }), V.solid("cube", { c: "orange", size: "md" })), "Which one is solid, the square or the cube? Say it with me.", "The cube."),
          cubeItem("faces"),
          cubeItem("edges"),
          cubeItem("corners"),
          touchCube("cube", ctx.lesson),
          flatSolid(r),
        ],
      };
    }
    if (u.id === "quads") {
      return {
        title: u.label, steps: [
          model(V.row(...QUADS.map((s) => V.shape(s, { c: "blue", size: "sm" }))), "All four of these have four sides, so all four are quadrilaterals. Each kind has its own name. My turn. Square. Rectangle. Rhombus. Trapezoid.", { do: "Point to each shape as you name it." }),
          model(V.row(V.shape("square", { c: "green", size: "md" }), V.shape("rhombus", { c: "green", size: "md" })), "What makes a square special? Four equal sides and four square corners. The rhombus has four equal sides too, but its corners are not square. It is not a square."),
          model(V.row(V.shape("square", { c: "orange", size: "md" }), V.shape("rectangle", { c: "orange", size: "md" })), "The rectangle has four square corners, but two sides are long and two are short. It is not a square. A square needs both: equal sides and square corners."),
          lead(V.shape("rhombus", { c: "purple" }), "Four equal sides, but the corners are not square. What is it? Say it with me.", "A rhombus."),
          lead(V.say(), "What makes a square special? Say it with me.", "Four equal sides and four square corners."),
          touchQuad("rhombus", ctx.lesson),
          touchQuad("trapezoid", ctx.lesson),
          nameQuad(r.pick(["rectangle", "trapezoid"])),
          squareItem(r, "special"),
          squareItem(r, "square?"),
        ],
      };
    }
    if (u.id === "rows") {
      return {
        title: u.label, steps: [
          model(V.grid(3, 4, { labels: true }), "We can cut a rectangle into rows and columns of squares, all the same size. My turn. A row goes across. I count the rows: one, two, three. Three rows.", { do: "Sweep a finger across each row as you count it." }),
          model(V.grid(3, 4, { labels: true }), "A column goes up and down. I count the columns: one, two, three, four. Four columns.", { do: "Sweep a finger down each column as you count it." }),
          model(V.grid(3, 4, { labels: true }), "To count all the squares, I count by rows. Each row has four squares. Four, eight, twelve. Three rows of four is twelve."),
          lead(V.grid(2, 5, { labels: true }), "Count the rows with me: one, two. Each row has five squares. Count by fives with me: five, ten. Two rows of five is how many? Say it with me.", "Ten."),
          gridItem(r, "rows"),
          gridItem(r, "cols"),
          gridItem(r, "total", [2, 3]),
          gridItem(r, "total", [3, 4]),
          gridItem(r, "total"),
        ],
      };
    }
    if (u.id === "shares") {
      return {
        title: u.label, steps: [
          model(V.row(V.parts("circle", "halves", { shade: 1, c: "blue", size: "md" }), V.parts("circle", "fourths", { shade: 1, c: "blue", size: "md" })), "You know halves and fourths. Two equal parts are halves. Four equal parts are fourths. My turn. Here one half is shaded. Here one fourth is shaded.", { do: "Point to each circle as you name its shaded part." }),
          model(V.grid(1, 3, { fill: 1 }), "Here is something new. This rectangle is cut into three equal parts. Three equal parts are thirds. One of three equal parts is a third. One third is shaded."),
          lead(V.grid(1, 3), "Three equal parts. What do we call them? Say it with me.", "Thirds."),
          lead(V.grid(1, 3, { fill: 1 }), "One of three equal parts is shaded. What part is shaded? Say it with me.", "One third."),
          shareItem(r, "count", "thirds"),
          shareItem(r, "name", "thirds"),
          shareItem(r, "shaded", r.pick(["halves", "fourths"])),
          shareItem(r, "shaded", "thirds"),
          shareItem(r, "name", r.pick(["halves", "fourths"])),
        ],
      };
    }
    if (u.id === "same-whole") {
      return {
        title: u.label, steps: [
          model(V.row(V.parts("circle", "halves", { shade: 1, c: "orange", size: "md" }), V.parts("rect", "halves", { shade: 1, c: "orange", size: "md" })), "Half of a circle and half of a rectangle. They do not look alike. My turn. Each is one of two equal parts of its whole, so each is a half."),
          model(V.row(V.parts("rect", "fourths", { shade: 1, c: "green", size: "md" }), V.parts("rect", "fourths-strips", { shade: 1, c: "green", size: "md" })), "Two rectangles the same size, both cut into fourths. Here the fourths are small rectangles. Here they are strips. Each is one of four equal parts, so each is a fourth.", { do: "Point to a part in each rectangle." }),
          model(V.row(V.parts("circle", "halves", { shade: 2, c: "blue", size: "md" }), V.grid(1, 3, { fill: 3 })), "Two halves make a whole. Three thirds make a whole. Four fourths make a whole."),
          lead(V.row(V.parts("square", "halves", { shade: 1, c: "purple", size: "md" }), V.parts("square", "halves-h", { shade: 1, c: "purple", size: "md" })), "Two squares the same size. One is cut up and down, one is cut across. Is each shaded part a half? Say it with me.", "Yes."),
          lead(V.grid(1, 3, { fill: 3 }), "How many thirds make a whole? Say it with me.", "Three."),
          wholeItem(r, "both", "halves", "yes"),
          wholeItem(r, "same", "fourths", "yes"),
          wholeItem(r, "make", "halves"),
          wholeItem(r, "make", "thirds"),
          wholeItem(r, r.pick(["both", "same"]), r.pick(["halves", "fourths"])),
        ],
      };
    }
    return {
      title: u.label, steps: [
        model(V.row(V.parts("circle", "halves", { shade: 2, c: "red", size: "sm" }), V.grid(1, 3, { fill: 3 }), V.parts("circle", "fourths", { shade: 4, c: "red", size: "sm" })), "We can say a whole by its parts. My turn. This whole is two halves. This whole is three thirds. This whole is four fourths.", { do: "Point to each whole as you say it." }),
        model(V.row(V.parts("rect", "halves", { shade: 2, c: "blue", size: "md" }), V.parts("rect", "halves", { shade: 2, c: "blue", size: "md" })), "Two wholes, each cut into halves. How many halves? I count: one, two, three, four. Two wholes make four halves."),
        lead(V.parts("circle", "fourths", { shade: 4, c: "green" }), "How many fourths are in a whole? Say it with me.", "Four."),
        lead(V.row(V.grid(1, 3, { fill: 3 }), V.grid(1, 3, { fill: 3 })), "Two wholes, each cut into thirds. Count the thirds with me: one, two, three, four, five, six. How many thirds in two wholes? Say it with me.", "Six."),
        describeItem(r, "whole", "thirds"),
        describeItem(r, "in", "fourths"),
        describeItem(r, "two", "halves"),
        describeItem(r, "whole", r.pick(["halves", "fourths"])),
        describeItem(r, "two", r.pick(["thirds", "fourths"])),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const want = intro.length >= 3 ? 4 : 3;
    const picks = favorNew(r, intro, want);
    return { title: "Shapes and equal shares", steps: itemsFor(ctx, picks, intro, want).map((x) => x.st) };
  },
  // The newest unit leads, since a mastery test takes the first item or two
  // as that unit's; within a unit the easy kinds come before the hard.
  testItems(units, ctx, count) {
    const r = ctx.rand;
    const want = Math.max(count || 0, Math.min(units.length + 1, 3));
    const latest = units[units.length - 1];
    const picks = [latest, ...favorNew(r, units, want - 1)];
    return itemsFor(ctx, picks, units, want).sort((a, b) => b.i - a.i || rank(a.st) - rank(b.st)).map((x) => x.st);
  },
};
