import assert from "node:assert/strict";
import { getParallaxOffset } from "../src/rendering/parallax.js";

assert.deepEqual(
  getParallaxOffset({ x: 200, y: 120 }, 0.72),
  { x: 144, y: 86 },
  "A distant atmosphere layer moves more slowly than the playfield."
);

assert.deepEqual(
  getParallaxOffset({ x: 200, y: 120 }, 0.72, { reducedMotion: true }),
  { x: 200, y: 120 },
  "Reduced Motion disables camera-relative parallax while keeping the layer positioned correctly."
);

assert.deepEqual(
  getParallaxOffset({ x: 200, y: 120 }, 2),
  { x: 200, y: 120 },
  "Unsafe depth values are clamped so an atmosphere layer cannot outrun the world camera."
);

console.log("PASS: parallax remains subtle, bounded, and accessible.");
