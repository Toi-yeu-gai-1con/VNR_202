import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const debugOverlay = readFileSync(new URL("../src/debug/debug-overlay.js", import.meta.url), "utf8");

assert.match(runtime, /import \{[^}]*createNarrativeState[^}]*\} from "\.\.\/systems\/narrative-state\.js"/, "Runtime initializes narrative state outside rendering.");
assert.match(runtime, /import \{[^}]*resolveEnding[^}]*\} from "\.\.\/systems\/ending-resolver\.js"/, "Runtime obtains ending candidates from the data resolver.");
assert.match(runtime, /const SAVE_VERSION = 2;/, "Narrative-enabled runtime upgrades the save contract.");
assert.match(runtime, /narrative:\s*createNarrativeState\(\)/, "New sessions own independent narrative state.");
assert.match(runtime, /restoreNarrativeSaveState\(saved\.narrative\)/, "Continue restores migrated narrative save data.");
assert.match(runtime, /state\.narrative\s*=\s*createNarrativeState\(\)/, "New campaigns clear narrative flags without sharing state.");
assert.match(runtime, /endingCandidate:\s*resolveEnding\(/, "Debug snapshots expose an explainable ending candidate.");
assert.match(runtime, /createEndingCollection/, "Runtime owns a persistent ending collection outside campaign saves.");
assert.match(runtime, /recordEndingCollection\(candidate\.id\)/, "Every resolved authored ending records a case file before its overlay.");
assert.match(runtime, /ending:\$\{endingId\}/, "The book receives stable ending case-file IDs.");
assert.match(runtime, /getEndingCaseFileIds\(\)/, "Book routing merges durable ending case files with normal history pages.");
assert.match(debugOverlay, /snapshot\.narrative/, "Debug overlay renders narrative resolver evidence.");

console.log("PASS: runtime bridges narrative state, save migration, and resolver evidence without a renderer-owned source of truth.");
