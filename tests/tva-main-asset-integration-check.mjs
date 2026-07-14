import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [runtime, styles, manifest, ignore] = await Promise.all([
  readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../src/data/asset-manifest.js", import.meta.url), "utf8"),
  readFile(new URL("../.gitignore", import.meta.url), "utf8"),
]);

for (const excluded of [
  ".codex-run",
  "debug.log",
  "assets/environment/generated-worlds/tva-office-hub.webp",
  "assets/npcs/tva-employee",
]) {
  await assert.rejects(access(new URL(excluded, root)), undefined, `${excluded} must not ship in the integrated branch.`);
}

assert.doesNotMatch(runtime, /assets\/npcs\/tva-employee/, "TVA flow must use M-90 instead of the removed employee sheets.");
assert.doesNotMatch(runtime, /assets\/environment\/generated-worlds\/tva-office-hub\.webp/, "Runtime must not load the removed TVA office plate.");
assert.doesNotMatch(styles, /assets\/environment\/generated-worlds\/tva-office-hub\.webp/, "CSS must not load the removed TVA office plate.");
assert.match(runtime, /assets\/time-archive\/characters\/agent-m90\//, "The TVA employee actor must render with the main-branch M-90 sheets.");
assert.match(runtime, /assets\/time-archive\/environment\/chronicle-office\.webp/, "The hub must render with the main-branch Chronicle Office plate.");
assert.match(runtime, /m90ResetActivate/, "Bad-ending recovery must load the M-90 reset action strip.");
assert.match(runtime, /m90ResetWave/, "Bad-ending recovery must load the reset-wave strip.");
assert.match(runtime, /drawM90ResetSequence/, "Bad-ending recovery must render the M-90 reset sequence instead of a static actor.");
assert.match(manifest, /time-archive/, "M-90 and Chronicle assets must remain in the critical hub asset group.");
assert.match(ignore, /^\.codex-run\/$/m);
assert.match(ignore, /^debug\.log$/m);

for (const required of [
  "assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.png",
  "assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.json",
  "assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.events.json",
  "assets/time-archive/effects/reset-wave-sheet.png",
]) {
  await access(new URL(required, root));
}

console.log("PASS: TVA mechanics use main-branch M-90/Chronicle assets and preserve reset animation.");
