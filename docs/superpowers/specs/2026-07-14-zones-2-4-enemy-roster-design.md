# Zones 2–4 Enemy Roster — Art and Runtime Design

## Goal

Replace the remaining eleven Zone 2–4 enemy visuals with production-quality animated pixel characters that match the approved Zone 4 Crop Saboteur. Finish and validate every asset pack before routing any of the new enemies into the runtime. The final runtime integration must replace all twelve Zone 2–4 combat actors in one coordinated change.

## Scope

This design covers:

- four Zone 2 enemies;
- four Zone 3 enemies;
- the three unfinished Zone 4 enemies;
- the already approved Zone 4 Crop Saboteur as the visual and technical quality reference;
- generation, normalization, preview, automated validation, runtime routing, and Canvas playtesting.

It does not change combat balance, enemy AI, map structure, story progression, the renderer, or the current custom Canvas 2D architecture.

## Shared Art Direction

All enemies must fit the existing Vietnamese historical and educational setting. Clothing, tools, weapons, documents, and symbols must be appropriate to the period represented by each zone. The designs must avoid foreign fantasy iconography, cultural stereotypes, gratuitous gore, and anachronistic equipment.

Each enemy needs a distinct silhouette, body shape, palette, weapon or prop, and motion language. Recoloring an existing enemy, reusing another zone's body, static pictures, geometric primitives, debug shapes, and low-quality fallback art are prohibited.

The three bosses deliberately use a mixed treatment:

- Zone 2: a supernatural archival entity;
- Zone 3: a corrupted human commander;
- Zone 4: a symbolic bureaucratic monster with an organic humanoid silhouette.

## Zone 2 — Archive and Three-Compartment Wooden House

### Archive Raider — “Bóng Đen Phá Kho”

A slim intruder in worn indigo-brown clothing with a half-face wrap, short pry bar, oil pouch, and compact satchel. The melee animation uses a pull-back followed by a hooked horizontal strike. Its motion remains physical and contains no magical effect.

### Cipher Marksman — “Xạ Thủ Mật Mã”

A tall blue-grey operative carrying a modified wooden crossbow and document tube. The attack sequence visibly raises the crossbow, releases the string, recoils, and recovers. The weapon cannot remain static while the body performs the attack.

### Corrupted Archivist — “Thủ Thư Tha Hóa”

A purple-brown scholar carrying a catalogue ledger and oil lamp. Support actions animate loose paper and ink around nearby enemies. The design must not rely on foreign talismans or unrelated occult symbols.

### Shadow Curator — “Bóng Ma Lưu Trữ”

A large supernatural figure in layered indigo robes with a face lost in shadow, a ring of keys, and a cracked lens staff. Its combat language includes a staff sweep, lens slam, and paper-and-ink command pulse. Robes, papers, keys, and the staff must move coherently without whole-sprite jitter.

## Zone 3 — Red Square and Broken Bridge

### Bridge Raider — “Kẻ Cướp Cầu Gãy”

A stocky fighter in dark indigo clothing and a worn conical hat, using a rope-mounted pole hook. The rope swings during locomotion; the attack draws the pole back before a broad hooked sweep.

### Division Marksman — “Xạ Thủ Chia Cắt”

An olive-clad mercenary using a hand crossbow and small rattan buckler. The shield creates a recognizable silhouette without hiding the crossbow's aim, release, recoil, and recovery frames.

### Shadow Propagandist — “Kẻ Tuyên Truyền Bóng Tối”

A red-brown agitator with a pamphlet satchel, hand bell, and period-appropriate bamboo speaking horn. Support actions use animated paper disturbance and sound-wave effects. No modern loudspeaker is permitted.

### Southern Tyrant — “Bộ Máy Áp Bức”

A tall corrupted human commander in worn black and dull-gold military clothing, wielding a long polearm and a torn faction standard. The standard must not reproduce or degrade the Vietnamese national flag. Combat includes a polearm sweep, heavy stomp, and command action. Phase-two intensity is communicated by stronger cloak, smoke, and torn-standard motion rather than a model replacement.

## Zone 4 — Đổi Mới Valley

### Crop Saboteur — “Kẻ Phá Hoại Mùa Màng”

The existing approved pack is the quality reference and remains unchanged unless a global normalization fix is required. Its preview establishes the expected consistency, animation coverage, transparency, scale, and readability.

### Bureau Marksman — “Xạ Thủ Quan Liêu”

A faded blue-grey coercive official with an old pith helmet and period-appropriate old rifle. The attack shows cocking, aiming, firing, shoulder recoil, muzzle smoke, and recovery. Weapon and hands must move together.

### Ration Chanter — “Kẻ Tụng Niệm Bao Cấp”

A brown-grey ration-store clerk carrying a distribution ledger, wooden stamp, ration slips, and hand bell. The support action stamps the ledger and emits an animated paper-and-ink ring. Ration slips and hanging equipment must react during locomotion.

### Bureaucracy Beast — “Quái Thú Quan Liêu”

A large symbolic storekeeper-like creature hunched beneath layered clothing and document straps, with a cracked wooden mask, warehouse chain, and oversized stamp weapon. It must retain an asymmetrical organic humanoid silhouette and must not resemble a block or document golem. Combat includes a chain sweep, stamp slam, and paperwork pulse. Phase two loosens the document straps and intensifies chain motion without swapping to an unrelated design.

## Animation Contract

Every enemy uses one approved identity seed and five state atlases derived from that identity:

| State | Frames per direction |
| --- | ---: |
| `idle` | 4 |
| `walk` | 4 |
| `attack` | 4 |
| `hurt` | 3 |
| `death` | 6 |

Each atlas contains three direction rows in this fixed order:

1. `south`;
2. `north`;
3. `east`.

The runtime derives `west` from `east` by horizontal mirroring. Bosses may express phase-two intensity inside their existing attack or command animation, but the base runtime contract remains the same.

Every normalized frame must:

- use a transparent 64×64 canvas;
- preserve the source aspect ratio;
- share one scale within the character pack;
- use a stable bottom-centre anchor;
- retain consistent pixel density, palette, proportions, facing direction, costume, weapon, and identifying details;
- remain inside its frame slot without clipping or crossing boundaries;
- contain no chroma-key residue or unrelated fragments;
- animate the subject rather than translating the entire sprite.

## Generation and Normalization Pipeline

Production is divided into three art batches: Zone 2, Zone 3, and the unfinished Zone 4 roster. A batch boundary is for review and error isolation only; no batch is independently routed into the game.

For each enemy:

1. create and retain one identity seed;
2. generate all five multi-direction state atlases from that identity;
3. remove the generation background without damaging internal colours;
4. normalize the complete atlas with one shared scale and stable anchor;
5. export the fifteen directional strips;
6. produce a labelled full-animation preview showing all directions and states;
7. inspect the preview at source size and expected in-game scale.

Each zone also receives a roster preview so silhouette, palette, scale, and role readability can be compared across its four enemies.

## Quality Gates

An enemy pack is accepted only when all of the following pass:

- seed and atlas identity are visually consistent;
- all fifteen directional strips exist with correct dimensions and transparency;
- all required frames are present;
- body and weapon remain recognizable at in-game scale;
- feet and ground contact do not jitter;
- attack anticipation, impact, and recovery are readable;
- hurt visibly reacts to impact;
- death resolves to a believable final pose without aspect-ratio distortion;
- no frame clips, bleeds into an adjacent slot, or contains chroma residue;
- the pack is visually distinct from every other enemy;
- the design remains culturally and historically appropriate.

If a pack fails, it is regenerated or corrected. It cannot be replaced by an existing enemy, a recolour, a still image, a rectangle, or any other fallback.

## Runtime Integration

Runtime integration happens once, after all twelve Zone 2–4 packs pass their quality gates. The integration will:

- add all asset paths to the existing manifest and preload flow;
- map each combat roster ID and boss ID to its own animation pack;
- preserve the existing enemy AI, stats, hitboxes, combat timing, scene progression, and custom Canvas renderer;
- use the approved animation state and direction selection already established by Zone 1;
- mirror east frames for west-facing movement where the renderer currently supports it;
- keep the rejection test active so missing or unapproved art cannot silently fall back to procedural or generic visuals.

Asset-loading failure must remain visible during development and testing. It must not silently substitute prohibited placeholder art in a shipped path.

## Verification

Automated checks must cover:

- expected files and manifest mappings for all twelve enemies;
- strip dimensions, frame counts, and usable alpha content;
- stable aspect-ratio normalization, including wide death poses;
- complete roster-to-animation routing;
- rejection of procedural, generic, or unapproved Zone 2–4 art;
- existing combat and asset-manifest regression suites.

Browser playtesting must cover Zones 2, 3, and 4 at actual Canvas scale. For every role and boss, verify idle, held movement, direction changes, attack, receiving damage, death, and scene reload. Also test key release, window blur, tab visibility changes, pause or modal transitions, collisions, and progression states affected by combat.

The final evidence includes screenshots of all three zones and close-up combat captures demonstrating the new silhouettes and animations. Completion cannot be claimed from source inspection or DOM assertions alone.

## Acceptance Criteria

- Eleven new enemy packs and the approved Crop Saboteur form a complete twelve-enemy Zone 2–4 roster.
- Each enemy has fifteen normalized strips covering all required states and directions.
- No enemy is a recolour, static stand-in, geometric primitive, or reused Zone 1 body.
- All packs pass automated asset validation and visual review before runtime routing.
- All twelve enemies are integrated in one runtime change.
- Relevant unit tests pass.
- Canvas playtests and screenshots confirm correct animation, facing, combat readability, and scene stability in Zones 2–4.
