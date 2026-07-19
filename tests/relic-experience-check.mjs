import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  CAUSALITY_MAP_NODES,
  CAUSALITY_MAP_LINKS,
  MEMORY_RECONSTRUCTIONS,
  RELIC_CONVERGENCE,
  RELIC_VISUALS,
} from "../src/data/relic-experience.js";
import { getAssetGroupForSource } from "../src/data/asset-manifest.js";

const relicIds = ["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"];
assert.deepEqual(Object.keys(RELIC_VISUALS), relicIds, "The relic archive has one distinct visual sheet for every required relic.");
assert.deepEqual(Object.keys(MEMORY_RECONSTRUCTIONS), relicIds, "Every relic unlocks a reconstruction record.");
assert.ok(
  Object.values(MEMORY_RECONSTRUCTIONS).every((memory) => memory.briefing?.length > 100 && memory.reflection?.length > 80),
  "Every memory reconstruction includes enough historical framing and reflection for an intentional voluntary reading experience.",
);
assert.equal(CAUSALITY_MAP_NODES.length, relicIds.length, "The causality map has one node per relic.");
assert.equal(CAUSALITY_MAP_LINKS.length, relicIds.length - 1, "The causality map records the links between consecutive historical chapters.");
assert.ok(CAUSALITY_MAP_NODES.every((node) => typeof node.gameplay === "string" && node.gameplay.length > 30), "Every causality node explains its gameplay consequence.");
assert.equal(
  new Set(CAUSALITY_MAP_NODES.map((node) => node.memoryMapSlot)).size,
  relicIds.length,
  "Every relic owns a unique placement on the Vietnam memory map.",
);
assert.ok(
  CAUSALITY_MAP_NODES.every((node) => Number.isFinite(node.memoryX) && Number.isFinite(node.memoryY)),
  "Every relic has deterministic memory-map coordinates.",
);
assert.deepEqual(
  CAUSALITY_MAP_NODES.map((node) => node.memoryMapSlot),
  ["star-top", "star-upper-right", "star-lower-right", "star-lower-left", "star-upper-left"],
  "The five relics occupy the five points of one invisible star in clockwise historical order.",
);
assert.deepEqual(
  CAUSALITY_MAP_NODES.map((node) => [node.memoryX, node.memoryY]),
  [[50, 15], [78, 37], [68, 75], [32, 75], [22, 37]],
  "The invisible five-point star remains symmetrical around the Vietnam map.",
);
assert.deepEqual(
  CAUSALITY_MAP_NODES.map((node) => node.memoryYear),
  ["1922–1929", "1930", "1941–1945", "1954–1975", "1986"],
  "Every memory seal makes the historical chronology visible.",
);
assert.equal(
  "islandLabels" in RELIC_CONVERGENCE,
  false,
  "The convergence artifact keeps Hoàng Sa and Trường Sa on its central map without UI callout labels.",
);

for (const relicId of relicIds) {
  const src = RELIC_VISUALS[relicId].src;
  assert.equal(getAssetGroupForSource(src), "core", `${relicId} is loaded before the convergence cinematic starts.`);
  const path = fileURLToPath(new URL(`../${src}`, import.meta.url));
  await access(path);
  const metadata = await sharp(path).metadata();
  assert.equal(metadata.width, 256, `${relicId} uses a 4x64 frame sprite sheet.`);
  assert.equal(metadata.height, 64, `${relicId} uses a 4x64 frame sprite sheet.`);
}

const mapPath = fileURLToPath(new URL(`../${RELIC_CONVERGENCE.mapArt}`, import.meta.url));
await access(mapPath);
const mapMetadata = await sharp(mapPath).metadata();
assert.ok(mapMetadata.width >= 1280 && mapMetadata.height >= 720, "The five-relic cinematic has a presentation-resolution map artifact.");

for (const soundFile of [
  "assets/audio/sfx/relic-convergence.wav",
  "assets/audio/sfx/relic-convergence-neutral.wav",
  "assets/audio/sfx/relic-convergence-fractured.wav",
]) {
  await access(fileURLToPath(new URL(`../${soundFile}`, import.meta.url)));
}

const runtimePath = fileURLToPath(new URL("../src/runtime/game-runtime.js", import.meta.url));
const runtimeSource = await readFile(runtimePath, "utf8");
assert.match(runtimeSource, /function drawRelicReceipt\(/, "Relic collection renders a dedicated receipt using the acquired relic sheet.");
assert.match(runtimeSource, /drawRelicReceipt\(\);/, "The receipt renderer is included in the live canvas render pass.");
assert.match(runtimeSource, /state\.relicReceipt = \{/, "Every collected relic schedules its visual receipt.");
assert.match(runtimeSource, /function drawPendingRelicForInteractable\(/, "Each unfinished relic hand-off can render its own animated world sheet.");
assert.match(runtimeSource, /interactionType === "doiMoiVerdict"\) return "doi-moi-gear"/, "The final Đổi Mới hand-off uses the gear sheet, not a generic relic image.");
assert.match(runtimeSource, /getRelicConvergenceSoundKey\(/, "The convergence route picks an ending-specific transition cue.");
assert.match(runtimeSource, /playCinematicSfx\(/, "The convergence cue routes through the mute-aware SFX channel instead of dialogue blips.");
assert.match(runtimeSource, /function drawFracturedConvergenceMap\(/, "The Secret convergence splits the map into irregular fragments instead of drawing UI-like bars over it.");
assert.match(runtimeSource, /corruptionBloom/, "The Secret convergence has a distinct intact-to-corrupted red phase before fragmentation.");
assert.match(runtimeSource, /tva-memory-map/, "The TVA causality renderer creates the Vietnam memory-map composition.");
assert.match(runtimeSource, /tva-memory-map-art/, "The memory map renders the production unified-territory artwork.");
assert.match(runtimeSource, /tva-memory-seal/, "The memory map renders interactive relic seals instead of text-only graph nodes.");
assert.match(runtimeSource, /tva-memory-relic-art/, "Every memory seal uses its relic's real sprite sheet.");
assert.match(runtimeSource, /aria-pressed/, "Memory seals expose their selected state to assistive technology.");
assert.match(
  runtimeSource,
  /if \(!resetZones\.has\(getCausalityZoneId\(node\.relicId\)\)\) continue;/,
  "Reset ripples are rendered only for recorded reset traces.",
);

const stylesPath = fileURLToPath(new URL("../styles.css", import.meta.url));
const stylesSource = await readFile(stylesPath, "utf8");
assert.match(stylesSource, /\.tva-memory-map\s*\{/, "The Vietnam memory map has a scoped visual shell.");
assert.match(stylesSource, /\.tva-memory-map-spotlight/, "The selected memory focuses light onto the map.");
assert.match(stylesSource, /\.tva-memory-seal\.is-fractured/, "Fractured memories have a distinct visual state.");
assert.match(stylesSource, /\.tva-memory-reset-ripple/, "Recorded resets have a dedicated rewind-ripple treatment.");
assert.match(stylesSource, /prefers-reduced-motion:\s*reduce/, "The memory map respects the browser's reduced-motion preference.");
const beginConvergenceSource = runtimeSource.slice(
  runtimeSource.indexOf("function beginRelicConvergence"),
  runtimeSource.indexOf("function endRelicConvergence"),
);
assert.match(
  beginConvergenceSource,
  /playCinematicSfx\(getRelicConvergenceSoundKey\(candidate\.id\)/,
  "The five-relic cue starts inside the ending interaction event, while browser audio activation is still valid.",
);
assert.match(runtimeSource, /relicFracture:\s*loadSound\("assets\/audio\/sfx\/relic-fracture\.wav"/, "The fracture one-shot is loaded through the cinematic SFX group.");
assert.match(beginConvergenceSource, /fractureSoundPlayed:\s*false/, "Every convergence starts with a fresh one-shot fracture guard.");
assert.match(runtimeSource, /fractured\s*&&\s*elapsed\s*>=\s*10000\s*&&\s*!sequence\.fractureSoundPlayed/, "Only fractured endings schedule the split sound at ten seconds.");
assert.match(runtimeSource, /sequence\.fractureSoundPlayed\s*=\s*true;[\s\S]*playCinematicSfx\("relicFracture"/, "The fracture guard is set before the one-shot plays.");
const fractureRendererSource = runtimeSource.slice(
  runtimeSource.indexOf("function drawFracturedConvergenceMap"),
  runtimeSource.indexOf("function renderRelicConvergence"),
);
assert.match(fractureRendererSource, /const faultPath = \[/, "The Secret split follows one continuous jagged fault instead of polygon cutout artifacts.");
assert.doesNotMatch(fractureRendererSource, /const fragments = \[/, "The Secret split no longer uses three screen-space polygon fragments.");

console.log("PASS: TVA relic sheets, memory records, causal map and unified-territory cinematic are complete.");
