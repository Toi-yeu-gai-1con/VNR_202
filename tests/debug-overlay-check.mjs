import assert from "node:assert/strict";
import { createDebugOverlay } from "../src/debug/debug-overlay.js";

function createClassList() {
  const values = new Set(["hidden"]);
  return {
    toggle(name, force) {
      if (force) {
        values.add(name);
      } else {
        values.delete(name);
      }
    },
    contains(name) {
      return values.has(name);
    },
  };
}

const operations = [];
const panel = { classList: createClassList(), setAttribute() {} };
const canvas = { classList: createClassList(), setAttribute() {} };
const values = { textContent: "" };
const overlay = createDebugOverlay({
  panel,
  canvas,
  values,
  ctx: {
    clearRect: (...args) => operations.push(["clearRect", ...args]),
    strokeRect: (...args) => operations.push(["strokeRect", ...args]),
    beginPath: () => operations.push(["beginPath"]),
    arc: (...args) => operations.push(["arc", ...args]),
    stroke: () => operations.push(["stroke"]),
    set strokeStyle(value) {
      operations.push(["strokeStyle", value]);
    },
    set lineWidth(value) {
      operations.push(["lineWidth", value]);
    },
  },
  viewport: { width: 416, height: 234 },
  getSnapshot: () => ({
    fps: 59.8,
    mode: "playing",
    currentLevelId: "village",
    player: { x: 144, y: 96, screenX: 72, screenY: 48, direction: "right" },
    camera: { x: 72, y: 48, zoom: 1 },
    respawnLevelId: "village",
    questSummary: "Công nhân 1/3",
    activeMonsterCount: 2,
    suspended: false,
  }),
  getGeometry: () => ({
    playerFootprint: { x: 140, y: 96, width: 8, height: 6 },
    colliders: [{ x: 120, y: 80, width: 20, height: 14 }],
    exits: [{ x: 180, y: 110, width: 20, height: 20 }],
    interactables: [{ x: 160, y: 100, radius: 30 }],
    monsters: [{ x: 200, y: 120, aggroRadius: 150 }],
  }),
  worldRectToScreenRect: (rect) => ({ ...rect }),
  worldToScreen: (point) => ({ ...point }),
});

assert.equal(overlay.isVisible(), false, "Debug overlay starts hidden.");
overlay.toggle();
overlay.update();
assert.equal(overlay.isVisible(), true, "F3 can reveal the debug overlay in a debug session.");
assert.equal(panel.classList.contains("hidden"), false, "The text panel becomes visible with the overlay.");
assert.match(values.textContent, /FPS 59\.8/, "The overlay reports frame-rate evidence.");
assert.match(values.textContent, /Công nhân 1\/3/, "The overlay reports quest progress.");
assert.equal(operations.some(([name]) => name === "strokeRect"), true, "The overlay draws player and collider rectangles.");
assert.equal(operations.some(([name]) => name === "arc"), true, "The overlay draws interaction and aggro ranges.");

overlay.setVisible(false);
assert.equal(canvas.classList.contains("hidden"), true, "Hiding the overlay hides its Canvas layer too.");

console.log("PASS: debug overlay exposes runtime state and world geometry without gameplay input.");
