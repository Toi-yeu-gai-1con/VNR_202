import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const markup = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(runtime, /optionId,\s*id: `\$\{chapterId\}\.\$\{decision\.id\}`/, "Narrative events preserve the selected option before the report is rendered.");
assert.match(runtime, /function updateEndingLesson\(ending\)/, "Ending UI renders the authored historical takeaway.");
assert.match(markup, /id="ending-lesson"/, "Ending UI includes one focused historical takeaway panel.");
assert.doesNotMatch(markup, /id="end-run-report-toggle"/, "Ending UI does not compete with the historical takeaway using a run report.");

console.log("PASS: ending UI prioritizes one focused historical takeaway over a run report.");
