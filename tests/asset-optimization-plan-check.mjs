import assert from "node:assert/strict";
import { IMAGE_OPTIMIZATION_SOURCES, getOptimizedImagePath } from "../scripts/optimize-assets.mjs";

assert.ok(IMAGE_OPTIMIZATION_SOURCES.includes("assets/environment/generated-worlds/history-hub-hero.png"), "Large painted world art should be optimized.");
assert.ok(IMAGE_OPTIMIZATION_SOURCES.includes("assets/story/level1/duong-kach-menh.png"), "Large story art should be optimized.");
assert.equal(IMAGE_OPTIMIZATION_SOURCES.some((source) => source.includes("/frames/")), false, "Animation frame sets must remain lossless PNG.");
assert.equal(getOptimizedImagePath("assets/environment/generated-worlds/history-hub-hero.png"), "assets/environment/generated-worlds/history-hub-hero.webp");

console.log("PASS: asset optimization targets painted art without touching pixel animation frames.");
