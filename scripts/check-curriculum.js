// Validates every lesson, test, and practice item, and prints a summary.
// Usage: npm run check            (summary)
//        npm run check -- --list  (one line per lesson)
//        npm run check -- --show prek 12   (print one lesson's script)

import { buildProgram } from "../curriculum/index.js";

const args = process.argv.slice(2);
const program = buildProgram({ strict: false });

if (args[0] === "--show") {
  const [, level, n] = args;
  const lesson = program.lessons.find((l) => l.level === level && l.number === Number(n));
  if (!lesson) {
    console.error("No such lesson.");
    process.exit(1);
  }
  console.log(`${lesson.levelName} ${lesson.title}  (${lesson.steps} steps, about ${lesson.minutes} min)`);
  for (const ex of lesson.exercises) {
    console.log(`\n  ${ex.n}. ${ex.title}  [${ex.trackName}, ${ex.kind}]`);
    for (const st of ex.steps) {
      const vis = st.screen.map((v) => v.t + (v.n !== undefined ? ":" + v.n : v.v !== undefined ? ":" + v.v : v.s ? ":" + v.s : "")).join(" ");
      console.log(`     ${st.cue.padEnd(5)} [${vis}] ${st.say}`);
      if (st.answer) console.log(`           child: ${st.answer}`);
      if (st.correct) console.log(`           if wrong: ${st.correct}`);
    }
  }
  process.exit(0);
}

for (const lv of program.levels) {
  const ls = program.lessons.filter((l) => l.level === lv.id);
  const steps = ls.map((l) => l.steps);
  const mins = ls.map((l) => l.minutes);
  const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  console.log(`${lv.name.padEnd(12)} ${String(ls.length).padStart(3)} lessons  steps ${Math.min(...steps)}-${Math.max(...steps)} (avg ${avg(steps)})  minutes ${Math.min(...mins)}-${Math.max(...mins)} (avg ${avg(mins)})  tests ${lv.tests.length}`);
  if (args[0] === "--list" && (!args[1] || args[1] === lv.id)) {
    for (const l of ls) {
      console.log(`   ${String(l.number).padStart(3)}  ${String(l.steps).padStart(2)} st ${String(l.minutes).padStart(2)}m  ${l.exercises.map((e) => (e.kind === "new" ? "*" : "") + e.track).join(", ")}`);
    }
  }
}
console.log(`Practice sets: ${program.practice.length}, items: ${program.practice.reduce((a, s) => a + s.items.length, 0)}`);
console.log(`Placement sections: ${program.placement.length}`);
if (program.warnings.length) {
  console.log(`\n${program.warnings.length} warning(s):`);
  for (const w of program.warnings.slice(0, 30)) console.log("  " + w);
}
if (program.errors.length) {
  console.log(`\n${program.errors.length} error(s):`);
  for (const e of program.errors.slice(0, 60)) console.log("  " + e);
  process.exit(1);
}
console.log("\nAll checks passed.");
