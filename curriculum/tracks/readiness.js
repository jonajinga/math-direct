// Readiness: the three habits every lesson depends on, taught in the first
// three Pre-K lessons and checked by the placement test's first section.
//   1. Repeat what the teacher says.
//   2. Answer on the signal, not before.
//   3. Touch the picture that is named.

import { V, model, lead, test, note } from "./common.js";

const NAMES = { ball: "ball", duck: "duck", apple: "apple", fish: "fish", star: "star", cup: "cup" };

function repeatStep(wordSaid) {
  return test(V.say(), `My turn: ${wordSaid}. Your turn. Say ${wordSaid}.`, `${wordSaid.charAt(0).toUpperCase() + wordSaid.slice(1)}.`,
    `My turn: ${wordSaid}. Say it with me: ${wordSaid}. Your turn. Say ${wordSaid}.`, {
      confirm: "Yes.",
      skill: "ready",
      item: `ready-say:${wordSaid}`,
      do: "Say the word clearly once. The child says the same word.",
    });
}

function signalStep(wordSaid) {
  return test(V.say(), `I will say a word. You say it when I touch the screen, not before. Get ready: ${wordSaid}.`, `(Waits, then says ${wordSaid} on the signal.)`,
    `Wait for my signal. My turn: ${wordSaid}. I wait. I touch the screen. Then I say ${wordSaid}. Your turn. Get ready: ${wordSaid}.`, {
      confirm: "Yes. You waited for the signal.",
      skill: "ready",
      item: `ready-signal:${wordSaid}`,
      do: "Pause a full second, then touch the screen. Mark Error if the child answers before the touch.",
      signal: "touch",
    });
}

function touchStep(icons, idx) {
  const name = NAMES[icons[idx]] || icons[idx];
  return test(V.choices(icons.map((i) => V.obj(i, 1, { size: "md" })), idx), `Touch the ${name}.`, `(Touches the ${name}.)`,
    `This is the ${name}. (Touch it.) Your turn. Touch the ${name}.`, {
      confirm: `Yes, the ${name}.`,
      skill: "ready",
      item: `ready-touch:${icons[idx]}`,
      do: "The child touches one picture.",
    });
}

const readiness = {
  id: "readiness",
  name: "Readiness",
  summary: "Repeat what the teacher says, answer on the signal, and touch the picture that is named.",
  standard: "ELOF, approaches to learning",
  units: [
    { id: "say", lesson: 1, label: "Say what I say" },
    { id: "signal", lesson: 2, label: "Answer on the signal" },
    { id: "touch", lesson: 3, label: "Touch the one I name" },
  ],
  firmLessons: 2,
  retired: 8,
  reviewEvery: 2,
  newEx(u, ctx) {
    const r = ctx.rand;
    if (u.id === "say") {
      const words = r.seq(["ball", "duck", "apple", "cup", "fish"], 3);
      return {
        title: u.label, steps: [
          note(V.say(), "Sit beside the child, close enough to touch the screen together. Say each word once, clearly."),
          model(V.say(), "In our lessons, you say what I say. My turn: ball."),
          lead(V.say(), "Say it with me: ball.", "Ball."),
          ...words.map(repeatStep),
        ],
      };
    }
    if (u.id === "signal") {
      const words = r.seq(["duck", "star", "cup"], 2);
      return {
        title: u.label, steps: [
          model(V.say(), "Sometimes I say, get ready. Then you wait. When I touch the screen, you answer. My turn. Get ready: duck. (Pause. Touch the screen.) Duck."),
          lead(V.say(), "Do it with me. Get ready: duck. (Pause. Touch the screen.)", "Duck."),
          ...words.map(signalStep),
        ],
      };
    }
    const sets = [r.seq(["ball", "duck", "apple"], 3), r.seq(["fish", "star", "cup"], 3)];
    return {
      title: u.label, steps: [
        model(V.choices([V.obj("ball", 1, { size: "md" }), V.obj("duck", 1, { size: "md" })], 0), "When I say touch, you touch one picture. My turn. Touch the ball. (Touch the ball.)"),
        lead(V.choices([V.obj("ball", 1, { size: "md" }), V.obj("duck", 1, { size: "md" })], 1), "Do it with me. Touch the duck.", "(Touches the duck.)"),
        ...sets.map((icons, i) => touchStep(icons, i === 0 ? 1 : 2)),
      ],
    };
  },
  reviewEx(intro, ctx) {
    const r = ctx.rand;
    const steps = [];
    if (intro.some((u) => u.id === "say")) steps.push(repeatStep(r.pick(["ball", "fish", "cup"])));
    if (intro.some((u) => u.id === "signal")) steps.push(signalStep(r.pick(["star", "apple"])));
    if (intro.some((u) => u.id === "touch")) steps.push(touchStep(r.seq(["ball", "duck", "apple", "fish"], 3), r.int(0, 2)));
    return { title: "Ready to learn", steps };
  },
  testItems(units, ctx) {
    const r = ctx.rand;
    const items = [];
    if (units.some((u) => u.id === "say")) items.push(repeatStep(r.pick(["ball", "cup"])));
    if (units.some((u) => u.id === "signal")) items.push(signalStep(r.pick(["duck", "star"])));
    if (units.some((u) => u.id === "touch")) items.push(touchStep(r.seq(["ball", "duck", "apple"], 3), r.int(0, 2)));
    return items;
  },
};

// The placement test's readiness section: one item of each kind.
export const readinessItems = [repeatStep("ball"), signalStep("duck"), touchStep(["apple", "fish", "star"], 1)];

export default readiness;
