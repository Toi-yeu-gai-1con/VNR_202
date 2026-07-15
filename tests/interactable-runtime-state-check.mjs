import assert from "node:assert/strict";
import { captureInteractableRuntimeState, restoreInteractableRuntimeState } from "../src/systems/interactable-runtime-state.js";

const levels = {
  village: {
    interactables: [{
      id: "red-compass-reward",
      interactionType: "rewardCompass",
      dialogueKey: "compass-verdict",
      prompt: "nhận Chiếc La Bàn Đỏ",
      collected: false,
      used: false,
      purified: false,
      activated: false,
    }],
  },
};

const authored = captureInteractableRuntimeState(levels);
const compass = levels.village.interactables[0];
compass.interactionType = "compassVerdict";
compass.dialogueKey = "lost-compass";
compass.prompt = "chốt La Bàn Đỏ";
compass.collected = true;
compass.used = true;
restoreInteractableRuntimeState(levels, authored);

assert.deepEqual(compass, {
  id: "red-compass-reward",
  interactionType: "rewardCompass",
  dialogueKey: "compass-verdict",
  prompt: "nhận Chiếc La Bàn Đỏ",
  collected: false,
  used: false,
  purified: false,
  activated: false,
}, "A new run restores authored interactable behavior instead of retaining a stale final verdict.");

console.log("PASS: interactable runtime state restores authored replay behavior.");
