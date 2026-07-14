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
]) {
  await assert.rejects(access(new URL(excluded, root)), undefined, `${excluded} must not ship in the integrated branch.`);
}

assert.match(runtime, /assets\/npcs\/tva-employee/, "David must render with the approved high-resolution TVA sheets.");
assert.match(runtime, /assets\/environment\/generated-worlds\/tva-office-hub\.webp/, "Runtime must load the restored TVA office plate.");
assert.match(styles, /assets\/environment\/generated-worlds\/tva-office-hub\.webp/, "CSS must use the restored TVA office plate.");
assert.doesNotMatch(runtime, /tvaOffice: loadSprite\("assets\/time-archive\/environment\/chronicle-office\.webp"/, "The TVA scene must not silently substitute the Chronicle Office plate.");
assert.match(runtime, /m90ResetActivate/, "Bad-ending recovery must load the M-90 reset action strip.");
assert.match(runtime, /m90ResetWave/, "Bad-ending recovery must load the reset-wave strip.");
assert.match(runtime, /drawM90ResetSequence/, "Bad-ending recovery must render the M-90 reset sequence instead of a static actor.");
assert.match(manifest, /tva-office|tva-employee/, "The restored TVA office and David sheets must belong to the critical hub group.");
assert.match(ignore, /^\.codex-run\/$/m);
assert.match(ignore, /^debug\.log$/m);

for (const required of [
  "assets/environment/generated-worlds/tva-office-hub.webp",
  "assets/npcs/tva-employee/down.png",
  "assets/npcs/tva-employee/downleft.png",
  "assets/npcs/tva-employee/left.png",
  "assets/npcs/tva-employee/up.png",
  "assets/npcs/tva-employee/upleft.png",
  "assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.png",
  "assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.json",
  "assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.events.json",
  "assets/time-archive/effects/reset-wave-sheet.png",
]) {
  await access(new URL(required, root));
}

console.log("PASS: TVA mechanics use the restored office/high-resolution David assets and preserve M-90 reset animation.");
