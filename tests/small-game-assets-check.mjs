import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const runtime = await readFile(new URL("src/runtime/game-runtime.js", root), "utf8");
const renderConfig = await readFile(new URL("src/data/render-config.js", root), "utf8");
const levelDefinitions = await readFile(new URL("src/systems/level-definitions.js", root), "utf8");

const assets = [
  ["assets/props/animated/vietnam-flag-small.png", 256, 64],
  ["assets/items/pickups/health-tonic.png", 96, 24],
  ["assets/items/pickups/stamina-tonic.png", 96, 24],
  ["assets/effects/combat/timeline-projectile.png", 64, 16],
  ["assets/effects/combat/timeline-projectile-reflected.png", 64, 16],
  ["assets/props/breakables/wooden-supply-crate.png", 128, 32],
  ["assets/props/breakables/bamboo-provisions-basket.png", 128, 32],
];

for (const [relativePath, width, height] of assets) {
  const metadata = await sharp(fileURLToPath(new URL(relativePath, root))).metadata();
  assert.equal(metadata.width, width, `${relativePath} must keep four fixed-width frames.`);
  assert.equal(metadata.height, height, `${relativePath} must keep its native pixel frame height.`);
  assert.equal(metadata.hasAlpha, true, `${relativePath} must retain a transparent background.`);
}

assert.match(renderConfig, /SMALL_GAME_ASSET_ANIMATIONS/, "Small animated props need data-owned frame timing.");
assert.match(runtime, /vietnam-flag-small\.png/, "Vietnamese flags must load their authored animation strip.");
assert.match(runtime, /health-tonic\.png/, "Health drops must load authored item art.");
assert.match(runtime, /stamina-tonic\.png/, "Stamina drops must load authored item art.");
assert.match(runtime, /timeline-projectile\.png/, "Enemy projectiles must load authored effect art.");
assert.match(runtime, /timeline-projectile-reflected\.png/, "Reflected projectiles must have a distinct warm read.");
assert.match(runtime, /Math\.atan2\(projectile\.velocityY, projectile\.velocityX\)/, "Arcade bullets must rotate to follow their travel direction.");
assert.match(runtime, /wooden-supply-crate\.png/, "Breakables must use the authored wooden supply crate.");
assert.match(runtime, /bamboo-provisions-basket\.png/, "Breakables must use the authored bamboo provisions basket.");
assert.match(runtime, /drawAnimatedVietnamFlags\(hamletFlags\)/, "Zone 3 recovery must draw authored flags at freed hamlets.");
assert.match(runtime, /flag\.hamletId && !state\.quests\.zone3HamletsFreed\.has\(flag\.hamletId\)/, "Zone 3 flags must stay hidden until their matching hamlet is freed.");
assert.doesNotMatch(levelDefinitions, /function createRedSquareDecorations\(\)[\s\S]*?flags:\s*\[/, "Zone 3 must not place flags at the start-of-map decorations.");
assert.match(runtime, /breakable\.destroyedAt = state\.lastTimestamp/, "Breakables must expose a timed destruction animation.");
assert.doesNotMatch(runtime, /function drawBreakableSprite[\s\S]*?drawKenneyRoguelikeSprite/, "Breakables cannot fall back to the generic Kenney crate renderer.");
assert.doesNotMatch(runtime, /function drawWorldDrops\(\)[\s\S]*?ctx\.fillRect\(drop\.x - 4/, "World drops cannot remain rectangle placeholders.");
assert.doesNotMatch(runtime, /function drawEnemyProjectiles\(\)[\s\S]*?ctx\.fillRect\(projectile\.x - 3/, "Projectiles cannot remain rectangle placeholders.");

console.log("PASS: flags, recovery tonics, arcade bullets, and breakables use normalized animated pixel art.");
