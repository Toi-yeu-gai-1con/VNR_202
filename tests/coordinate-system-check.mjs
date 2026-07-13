import assert from "node:assert/strict";
import { createCoordinateSystem } from "../src/rendering/coordinate-system.js";

const camera = { x: 200, y: 120, zoom: 0.7 };
const coordinates = createCoordinateSystem({
  world: { width: 960, height: 640 },
  viewport: { width: 416, height: 234 },
  getCamera: () => camera,
  getRenderOffset: () => ({ x: 3, y: -2 }),
});

const worldPoint = { x: 400, y: 220 };
const screenPoint = coordinates.worldToScreen(worldPoint);
assert.deepEqual(screenPoint, { x: 140, y: 70 }, "World coordinates scale through the current camera zoom.");
assert.deepEqual(coordinates.screenToWorld(screenPoint), worldPoint, "World-to-screen conversion round-trips without changing gameplay coordinates.");
assert.deepEqual(
  coordinates.worldToScreen(worldPoint, { includeRenderOffset: true }),
  { x: 143, y: 68 },
  "Camera shake is a render-only offset and is opt-in for screen conversion."
);

assert.deepEqual(
  coordinates.worldRectToScreenRect({ x: 300, y: 180, width: 20, height: 10 }),
  { x: 70, y: 42, width: 14, height: 7 },
  "World rectangles preserve their geometry while being rendered at zoom."
);

const visible = coordinates.getVisibleWorldRect();
assert.equal(visible.width, 416 / 0.7, "Visible world width accounts for camera zoom.");
assert.equal(visible.height, 234 / 0.7, "Visible world height accounts for camera zoom.");

const clamped = coordinates.clampCameraPosition({ x: 1000, y: -40, zoom: 0.7 });
assert.equal(clamped.x, 960 - 416 / 0.7, "Camera x cannot reveal space beyond the world edge.");
assert.equal(clamped.y, 0, "Camera y cannot reveal space above the world edge.");

console.log("PASS: world, screen, camera, and render-offset coordinates stay separate.");
