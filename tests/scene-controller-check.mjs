import assert from "node:assert/strict";
import { SCENES, createSceneController } from "../src/core/scene-controller.js";

const scenes = createSceneController();

assert.equal(scenes.current, SCENES.START, "The scene controller starts at the title screen.");
assert.equal(scenes.canTransition(SCENES.OPENING), true, "The title screen opens the introduction.");
assert.equal(scenes.transition(SCENES.OPENING), true, "A valid scene transition succeeds.");
assert.equal(scenes.current, SCENES.OPENING, "The active scene updates after transition.");
assert.equal(scenes.transition(SCENES.PLAYING), true, "The introduction enters gameplay.");
assert.equal(scenes.isSimulationRunning(), true, "Only gameplay advances the simulation.");
assert.equal(scenes.transition(SCENES.TRANSITION), true, "Gameplay can enter an input-locked portal transition.");
assert.equal(scenes.isSimulationRunning(), false, "A portal transition freezes gameplay simulation until its handoff completes.");
assert.equal(scenes.transition(SCENES.PLAYING), true, "A completed portal transition returns to gameplay.");
assert.equal(scenes.transition(SCENES.PAUSED), true, "Gameplay can pause.");
assert.equal(scenes.isSimulationRunning(), false, "Paused gameplay stops the simulation.");
assert.equal(scenes.transition(SCENES.ENDING), false, "Invalid transitions are rejected without changing scene.");
assert.equal(scenes.current, SCENES.PAUSED, "Rejected transitions keep the previous scene.");

const badEndingRecovery = createSceneController(SCENES.ENDING);
assert.equal(
  badEndingRecovery.transition(SCENES.PLAYING),
  true,
  "A recovered bad ending can resume gameplay at its checkpoint."
);

console.log("PASS: scene transitions are explicit and gameplay-only updates are enforced.");
