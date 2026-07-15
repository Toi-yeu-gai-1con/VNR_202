import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const markup = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(runtime, /import \{ createFinalRunReport \} from "\.\.\/systems\/final-run-report\.js";/, "Runtime uses the report model instead of reconstructing end data in the overlay.");
assert.match(runtime, /optionId,\s*id: `\$\{chapterId\}\.\$\{decision\.id\}`/, "Narrative events preserve the selected option before the report is rendered.");
assert.match(runtime, /function updateEndingRunReport\(\)/, "Ending UI has a dedicated report renderer.");
assert.match(runtime, /replaceEndingReportList\(\s*endRunTimeline,\s*report\.timeline/, "The timeline is rendered as dynamic DOM, not a hard-coded text block.");
assert.match(markup, /id="end-run-report-toggle"/, "Ending UI exposes the detailed report with a keyboard-accessible control.");
assert.match(markup, /id="end-run-timeline"/, "Ending UI includes a timeline region.");

console.log("PASS: runtime wires persistent choices into the detailed ending report.");
