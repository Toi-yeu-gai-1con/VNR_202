import assert from "node:assert/strict";
import { createMiniMapRenderer } from "../src/rendering/minimap-renderer.js";

const operations = [];
const classNames = new Set();
const minimap = {
  title: "",
  classList: { toggle(name, hidden) { hidden ? classNames.add(name) : classNames.delete(name); } },
  setAttribute() {},
};
const minimapCtx = {
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  clearRect(...args) { operations.push(["clear", ...args]); },
  fillRect(...args) { operations.push(["fill", this.fillStyle, ...args]); },
  strokeRect(...args) { operations.push(["stroke", this.strokeStyle, ...args]); },
};
const state = { mode: "playing", blockedExitIds: new Set() };
const renderer = createMiniMapRenderer({
  minimap,
  minimapCanvas: { width: 80, height: 64 },
  minimapCtx,
  world: { width: 160, height: 128 },
  viewport: { width: 80, height: 64 },
  getState: () => state,
  getCurrentLevel: () => ({
    id: "village",
    exits: [{ id: "exit-1", x: 20, y: 20, width: 10, height: 10 }],
    interactables: [],
    monsters: [{ x: 40, y: 40, defeated: false, isBoss: false }],
  }),
  getExitCenter: (exit) => ({ x: exit.x + 5, y: exit.y + 5 }),
  getInteractionPoint: (item) => item,
  shouldDrawInteractable: () => true,
  isMonsterActive: () => true,
  getNavigationObjective: () => ({ x: 60, y: 20, color: "#ffffff" }),
  getCamera: () => ({ x: 0, y: 0 }),
  getPlayer: () => ({ x: 10, y: 10 }),
});

renderer.draw();
assert.equal(classNames.has("hidden"), false, "The minimap is visible during gameplay.");
assert.equal(minimap.title.includes("boss"), true, "The minimap keeps an accessible legend.");
assert.equal(operations.some((operation) => operation[0] === "fill" && operation[1] === "#f3d777"), true, "Exits receive a gold minimap marker.");
assert.equal(operations.some((operation) => operation[0] === "fill" && operation[1] === "#e96558"), true, "Active monsters receive a red minimap marker.");

state.mode = "paused";
operations.length = 0;
renderer.draw();
assert.equal(classNames.has("hidden"), true, "The minimap hides outside gameplay.");
assert.equal(operations.length, 0, "A hidden minimap does not redraw.");

console.log("PASS: minimap rendering is isolated and preserves gameplay markers.");
