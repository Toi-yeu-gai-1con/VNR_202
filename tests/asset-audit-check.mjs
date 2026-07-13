import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { auditAssets } from "../scripts/asset-audit.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "crossroads-asset-audit-"));

try {
  await mkdir(path.join(root, "assets", "sprites"), { recursive: true });
  await mkdir(path.join(root, "assets", "audio"), { recursive: true });
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(path.join(root, "assets", "sprites", "hero.png"), "hero");
  await writeFile(path.join(root, "assets", "sprites", "walk-01.png"), "walk");
  await writeFile(path.join(root, "assets", "sprites", "walk-02.png"), "walk");
  await writeFile(path.join(root, "assets", "unused.png"), "unused");
  await writeFile(path.join(root, "assets", "LICENSE.txt"), "license");
  await writeFile(path.join(root, "assets", "audio", "ambient loop.mp3"), "audio");
  await writeFile(path.join(root, "src", "game.js"), [
    'const hero = "assets/sprites/hero.png";',
    'const ambience = "assets/audio/ambient loop.mp3";',
    'const missing = "assets/does-not-exist.png";',
    'const walk = `assets/sprites/${frame}.png`;',
  ].join("\n"));
  await writeFile(path.join(root, "scripts", "build.mjs"), 'const generated = `assets/${fileName}`;');

  const report = await auditAssets(root);
  assert.deepEqual(report.unreferenced, ["assets/unused.png"], "Only truly unreferenced assets can be candidates for cleanup.");
  assert.deepEqual(report.retainedUnreferenced, ["assets/LICENSE.txt"], "License and provenance files must be retained even when runtime does not load them.");
  assert.deepEqual(report.duplicateGroups, [["assets/sprites/walk-01.png", "assets/sprites/walk-02.png"]], "Exact binary duplicates must be reported.");
  assert.equal(report.referencedCount, 4, "Literal, spaced, and dynamic asset references must all be recognized.");
  assert.deepEqual(report.missingReferenced, ["assets/does-not-exist.png"], "Broken runtime asset references must be reported before release.");
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log("PASS: asset audit distinguishes live, dynamic, duplicate, and orphaned assets.");
