import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { M90_RESET_ANIMATION } from "../src/data/render-config.js";

assert.deepEqual(
  {
    cropX: M90_RESET_ANIMATION.cropX,
    cropY: M90_RESET_ANIMATION.cropY,
    cropWidth: M90_RESET_ANIMATION.cropWidth,
    cropHeight: M90_RESET_ANIMATION.cropHeight,
    drawWidth: M90_RESET_ANIMATION.drawWidth,
    drawHeight: M90_RESET_ANIMATION.drawHeight,
  },
  { cropX: 30, cropY: 18, cropWidth: 36, cropHeight: 62, drawWidth: 24, drawHeight: 40 },
  "M-90 reset keeps its own 96px atlas crop and draw contract.",
);

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const resetRenderer = runtime.slice(
  runtime.indexOf("function drawM90ResetSequence("),
  runtime.indexOf("function drawEndingSceneFigures("),
);
assert.doesNotMatch(resetRenderer, /TVA_EMPLOYEE_SPRITE/, "M-90 reset rendering cannot inherit David's high-resolution atlas contract.");
assert.match(resetRenderer, /M90_RESET_ANIMATION\.cropWidth/, "M-90 reset rendering uses its dedicated crop metadata.");

console.log("PASS: M-90 reset and wave rendering are isolated from David's sprite dimensions.");
