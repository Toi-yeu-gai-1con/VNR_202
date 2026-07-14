# Asset Sources

This project uses a small subset of free game assets:

- Adventurer 2D Top-Down by Mattz Art: https://xzany.itch.io/top-down-adventurer-character
  - License/terms: included in `assets/FREE_Adventurer 2D Pixel Art/License.txt`; free/commercial project use and modification are allowed, with no standalone asset redistribution.
  - Used for the player idle/run/attack1/attack2 sheets and the player action strips in `assets/player/`.
  - Attack sheets are copied from the supplied free pack. Dash, heal, hurt, and death strips are normalized from the user-provided preview GIFs (`fall.gif`, `ZQXPQf.gif`, and `TwpTcu.gif`) using the fixed 96x80 canvas and nearest-neighbour pixel sampling.

- Kenney UI Pack RPG Expansion: https://kenney.nl/assets/ui-pack-rpg-expansion
  - License: Creative Commons CC0
  - Used for menu panels, dialog panels, buttons, and close icon assets.
- Kenney Particle Pack: https://kenney.nl/assets/particle-pack
  - License: Creative Commons CC0
  - Used for glow, ember, magic, and sparkle effect sprites.
- Kenney Roguelike/RPG Pack: https://kenney.nl/assets/roguelike-rpg-pack
  - License: Creative Commons CC0
  - Used for cleaner prop, lamp, fence, tree, and small terrain-detail sprites.
- Pixel Crawler Free Pack by Anokolisa: https://anokolisa.itch.io/free-pixel-art-asset-pack-topdown-tileset-rpg-16x16-sprites
  - License/terms: included in `assets/Pixel Crawler - Free Pack/Terms.txt`
  - Used for character, monster, vegetation, prop, and terrain tile sprites.
- Pixel Art Top Down - Basic by Cainos: https://cainos.itch.io/pixel-art-top-down-basic
  - License/terms: free and commercial use, modification allowed, no credit required; redistribution/resale not allowed.
  - Used for outdoor cargo, barrel, bench, and statue props.
- Pixel Art Door by bonzille: https://opengameart.org/content/pixel-art-door
  - License: Creative Commons CC0
  - Used for the large History Gate door in the hub.
- MutterPixel Ruined Village Buildings - Pixel Art Assets: https://mutterpixel-studio.itch.io/ruined-village-buildings-pixel-art-assets
  - License: included in `assets/environment/mutterpixel-ruined-village/README.txt`
  - Used for ruined village building sprites in Level 1.
- Fences, Walls and a Gate: https://opengameart.org/content/fences-walls-and-a-gate
  - License: Creative Commons CC0
  - Used for ruined village fence and gate sprites.
- 16x16 boxes, crates, chests: https://opengameart.org/content/16x16-boxes-crates-chests
  - License: Creative Commons CC0
  - Used for village crate props.
- 16x16 fantasy pixel art vehicles: https://opengameart.org/content/16x16-fantasy-pixel-art-vehicles
  - License: CC-BY 3.0
  - Attribution: Art by DualR. Commissioned by OpenGameArt.org (http://opengameart.org)
  - Used for village cart props.
- `assets/effects/petal-pink.png`
  - Created for this project.
- Original player skill SFX
  - Generated locally by `scripts/generate-skill-sfx.py` with deterministic oscillator/noise synthesis; no external samples or third-party recordings.
  - Used for dash, heal, hurt, and death feedback in `assets/audio/sfx/`.
- Pixabay sword combat SFX
  - `player-attack1.mp3`: “Sword sound 2” by Merrick079 (Freesound community), https://pixabay.com/sound-effects/sword-sound-2-36274/
  - `player-attack2.mp3`: “Sword Slash 01” by u_xjrmmgxfru, https://pixabay.com/sound-effects/sword-slash-01-266296/
  - `player-parry.mp3`: “Sword Deflection - The Ballad of the Blades” by VoiceBosch, https://pixabay.com/sound-effects/sword-deflection-the-ballad-of-the-blades-255962/
  - License: Pixabay Content License; included as in-game effects, not redistributed as standalone stock audio.
- PixelLab generated character art
  - Used for the melee raider, corrupted chanter, and boss warden enemy sprites in `assets/monsters/pixellab/`.
  - Generated for this project through the configured PixelLab account; not redistributed as a third-party asset pack.
- Military Character Pack by DravnirCreates: https://dravnircreates.itch.io/military-character-pack
  - License: CC BY 4.0; character art by DravnirCreates. The game crops and animates the supplied soldier walk sheets for ranged enemies.
  - Used for `assets/monsters/military-soldier/`.
- Original Zone 1 adversary sprite set
  - Created for this project with the built-in image-generation workflow, background-keyed, normalized to shared canvases, then assembled and tagged in Aseprite. No third-party character pixels were used.
  - Editable sources include paired `*-walk.aseprite` and `*-attack.aseprite` files for the patrol, raider, signalman, and captain under `assets/monsters/zone1-*/`.
  - Each source has four separately posed frames tagged as `walk` or `attack`; exports are 64x64 bottom-center anchored strips. They replace only Zone 1's ranged, melee, support, and boss adversaries respectively.
  - Captain directional seed: `assets/monsters/zone1-enforcer-captain/enforcer-captain-directional-source.png`, generated with the built-in image-generation workflow on a magenta chroma key; alpha-cleaned and normalized into south/north/east strips by `scripts/prepare-captain-directional-strips.mjs`. West is deliberately mirrored at runtime from east.
  - Raider, patrol rifleman, and signalman directional seeds are stored next to their respective sprite strips as `*-directional-source.png`; each was generated with the same built-in workflow, alpha-cleaned, and normalized by `scripts/prepare-captain-directional-strips.mjs`. Their west-facing animation intentionally mirrors the corresponding east strip at runtime.
- Original zone landmarks
  - Created for this project with the built-in image generation workflow, then background-keyed to transparent PNG.
  - Used for the four persistent zone landmarks in `assets/landmarks/`: storm shelter beacon, archive lens tower, faction standard, and restoration engine.
- Original animated zone-landmark sprite strips
  - Created for this project with the built-in image generation workflow, then background-keyed to transparent PNG.
  - Four-frame strips are normalized to a common bottom-center anchor before the persistent landmarks load their frames from `assets/landmarks/frames/`: lantern/flag, archive lens, flag/brazier, and waterwheel/water animations.
- Original Đổi Mới irrigation station
  - Created for this project with the built-in image generation workflow, then background-keyed to transparent PNG.
  - Used for the restored rural cooperative scene in `assets/recovery/doi-moi-irrigation-station.png`.

## Original Khu 1 ending art

- `assets/environment/generated-worlds/zone1-lost-compass-ending.png`
  - Original project art generated with the built-in image-generation workflow on 2026-07-15.
  - Prompted as a rain-swept Vietnamese colonial-era port circa the 1920s, with period-appropriate workers, wooden piers, boats, Le Paria bundles and a fractured time-rift portal.
  - Used only by the hypothetical Khu 1 ending “Con tàu không la bàn”; no third-party character, logo, or stock asset was imported.

- `assets/environment/generated-worlds/zone2-fading-fires-ending.png`
  - Original project art generated with the built-in image-generation workflow on 2026-07-15.
  - Prompted as a Vietnamese colonial-era meeting/archive room circa 1930: rain, a weathered round table, three separate oil lamps, dossiers, and a subtle fractured time-rift.
  - Used only by the hypothetical Khu 2 ending “Ba ngọn lửa lụi tàn”; no third-party character, logo, or stock asset was imported.

- `assets/environment/generated-worlds/zone3a-missed-moment-ending.png`
  - Original project art generated with the built-in image-generation workflow on 2026-07-15.
  - Prompted as a rainy 1941–1945 northern Vietnamese communal meeting house, with unlit lanterns, an abandoned planning table, liaison maps, and an unraveling red thread.
  - Used only by the hypothetical Khu 3A ending “Thời cơ Tháng Tám vụt qua”; no third-party character, logo, or stock asset was imported.

- `assets/environment/generated-worlds/zone3b-divided-border-ending.png`
  - Original project art generated with the built-in image-generation workflow on 2026-07-15.
  - Prompted as two Vietnamese riverside homes separated by a broken bridge and river in rain, with a severed red thread across a map; it intentionally avoids presenting the hypothetical branch as historical fact.
  - Used only by the hypothetical Khu 3B ending “Vĩ tuyến thành biên giới”; no third-party character, logo, or stock asset was imported.

## Original Cục Lưu Trữ Niên Tuyến (CLTNT) time-archive art pack

- Generated for this project with the built-in image generation workflow; no Marvel/TVA artwork, logos, or traced character likenesses were used.
- Source prompts and processing notes are recorded in `docs/asset-prompts/time-archive-pack.md`.
- Character strips were generated from one approved M-90 seed, background-keyed, normalized with nearest-neighbor sampling to 62px content inside the existing 96x96 NPC frame contract, and packed with the current bottom-center anchor.
- Used for `assets/time-archive/characters/agent-m90/` (down, left, up, downleft, upleft; right is mirrored by the existing NPC renderer).
- The Chronicle Door, archive tools, and Reset Charge were background-keyed and normalized into fixed-size PNG strips. The reset-wave VFX used luminance-to-alpha conversion from a black source so additive blending preserves the colored glow.
- The brutalist office plate is an original lossless WEBP: `assets/time-archive/environment/chronicle-office.webp`.
- M-90's non-looping `reset_activate` action was authored from the approved seed with Aseprite MCP, exported as `reset-activate.aseprite` / `reset-activate.png`, and tagged with per-frame durations plus reset event metadata.

## Restored TVA office and David character art

- `assets/environment/generated-worlds/tva-office-hub.webp`
  - Existing project-owned generated world plate restored from `codex/tva-office-bad-ending` for the playable TVA office.
- `assets/npcs/tva-employee/*.png`
  - Supplied by the project owner and normalized from the original high-resolution David character sheets.
  - Five directional sheets use transparent 192 × 384 frames, shared bottom-center anchors, and separate idle/walk rows; right-facing views mirror the corresponding left-facing sheets in the renderer.
- The M-90 `reset-activate` strip and reset-wave remain the authored special-action sequence for bad-ending recovery.

## Music

## Combat sound effects

- `assets/audio/combat/*.{ogg,mp3}`
  - Created for this project with `scripts/generate-combat-sfx.mjs` using deterministic FFmpeg synthesis; no third-party recording or sample is included.
  - Used for baton impacts, rifle shots, signal lantern pulse, captain command/slam, enemy hurt/death, and parry confirmation.
  - Dual Opus/MP3 exports retain browser compatibility while allowing modern browsers to prefer the smaller Opus source.

- Unexplored Expansion by Bo Jingles and TAD: https://opengameart.org/content/unexplored-expansion
  - License: CC0.
  - Used for the central hub.
- Cave Theme by Brandon75689: https://opengameart.org/content/cave-theme
  - License: CC0.
  - Used for Zone 2 (archive).
- Ancient Power Of Serpents by Kevin MacLeod (via josepharaoh99): https://opengameart.org/content/ancient-power-of-serpents
  - License: CC0.
  - Used for Zone 3 (crossroads).
- Town Theme RPG by cynicmusic: https://opengameart.org/content/town-theme-rpg
  - License: CC0.
  - Used for Zone 4 (spring valley).
- A Legend Will Rise (Orchestral) by CodeManu: https://opengameart.org/content/a-legend-will-rise-orchestral
  - License: CC0.
  - Used for the good ending.

