// The whole program, built from curriculum/ at build time. The build stops
// if any lesson fails the checks in curriculum/lib/validate.js.
import { buildProgram } from "../../curriculum/index.js";

export default function () {
  return buildProgram({ strict: true });
}
