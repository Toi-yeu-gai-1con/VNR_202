import assert from "node:assert/strict";
import { createRuntimeLoop } from "../src/core/runtime-loop.js";

function createScheduler() {
  let nextId = 1;
  const callbacks = new Map();

  return {
    request(callback) {
      const id = nextId;
      nextId += 1;
      callbacks.set(id, callback);
      return id;
    },
    cancel(id) {
      callbacks.delete(id);
    },
    run(timestamp) {
      const [id, callback] = callbacks.entries().next().value ?? [];
      assert.ok(callback, "Expected exactly one scheduled animation frame.");
      callbacks.delete(id);
      callback(timestamp);
    },
    get size() {
      return callbacks.size;
    },
  };
}

const scheduler = createScheduler();
const frames = [];
const loop = createRuntimeLoop({
  requestFrame: (callback) => scheduler.request(callback),
  cancelFrame: (id) => scheduler.cancel(id),
  onFrame: (frame) => frames.push(frame),
});

loop.start();
scheduler.run(100);
scheduler.run(116);

assert.deepEqual(
  frames.map(({ now, deltaSeconds }) => ({ now, deltaSeconds })),
  [
    { now: 0, deltaSeconds: 0 },
    { now: 16, deltaSeconds: 0.016 },
  ],
  "The loop owns a logical clock instead of leaking wall-clock time into game state."
);

loop.suspend();
assert.equal(scheduler.size, 0, "Suspending cancels the pending animation frame.");
assert.equal(loop.isSuspended(), true, "Suspension is observable to lifecycle and debug tools.");

loop.resume();
loop.resume();
assert.equal(scheduler.size, 1, "Repeated resume calls do not create concurrent animation loops.");
scheduler.run(5116);
scheduler.run(5132);

assert.deepEqual(
  frames.slice(2).map(({ now, deltaSeconds }) => ({ now, deltaSeconds })),
  [
    { now: 16, deltaSeconds: 0 },
    { now: 32, deltaSeconds: 0.016 },
  ],
  "Time remains frozen while hidden and the first resumed frame cannot jump simulation state."
);

loop.stop();
assert.equal(scheduler.size, 0, "Stopping removes the final pending animation frame.");

console.log("PASS: runtime loop freezes logical time and resumes without duplicate frames.");
