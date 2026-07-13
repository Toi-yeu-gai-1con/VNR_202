import assert from "node:assert/strict";
import { createPageLifecycleController } from "../src/core/page-lifecycle.js";

function createDocumentTarget() {
  const target = new EventTarget();
  let hidden = false;

  Object.defineProperty(target, "hidden", {
    get: () => hidden,
  });

  return {
    target,
    setHidden(next) {
      hidden = next;
      target.dispatchEvent(new Event("visibilitychange"));
    },
  };
}

const documentTarget = createDocumentTarget();
const windowTarget = new EventTarget();
const calls = [];
const lifecycle = createPageLifecycleController({
  documentTarget: documentTarget.target,
  windowTarget,
  clearInput: () => calls.push("clear"),
  suspendRuntime: () => calls.push("suspend-runtime"),
  resumeRuntime: () => calls.push("resume-runtime"),
  suspendAudio: () => calls.push("suspend-audio"),
  resumeAudio: () => calls.push("resume-audio"),
});

lifecycle.install();
windowTarget.dispatchEvent(new Event("blur"));
assert.deepEqual(calls, ["clear"], "Blur clears held input without changing the current game scene.");

documentTarget.setHidden(true);
assert.deepEqual(
  calls,
  ["clear", "clear", "suspend-runtime", "suspend-audio"],
  "Hiding the page clears input and freezes runtime plus looping audio."
);

documentTarget.setHidden(false);
assert.deepEqual(
  calls,
  ["clear", "clear", "suspend-runtime", "suspend-audio", "resume-runtime", "resume-audio"],
  "Returning to the page resumes the same game session and audio position."
);

lifecycle.destroy();
documentTarget.setHidden(true);
assert.equal(calls.length, 6, "Destroyed lifecycle controllers no longer handle browser events.");

console.log("PASS: page lifecycle freezes and resumes a running session safely.");
