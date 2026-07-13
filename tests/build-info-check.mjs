import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BUILD_VERSION, withAssetVersion } from "../src/data/build-info.js";

assert.equal(BUILD_VERSION, "dev", "Raw static development must have a predictable version label.");
assert.equal(withAssetVersion("assets/player/hero.png"), "assets/player/hero.png?v=dev");
assert.equal(withAssetVersion("assets/player/hero.png?frame=1"), "assets/player/hero.png?frame=1&v=dev");
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.doesNotMatch(indexHtml, /\?v=\d{8}/, "Production hashing must replace hand-written cache query strings.");

console.log("PASS: runtime asset URLs carry the current build version.");
