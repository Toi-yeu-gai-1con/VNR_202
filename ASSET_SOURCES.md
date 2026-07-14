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
- Original zone landmarks
  - Created for this project with the built-in image generation workflow, then background-keyed to transparent PNG.
  - Used for the four persistent zone landmarks in `assets/landmarks/`: storm shelter beacon, archive lens tower, faction standard, and restoration engine.
- Original animated zone-landmark sprite strips
  - Created for this project with the built-in image generation workflow, then background-keyed to transparent PNG.
  - Four-frame strips are normalized to a common bottom-center anchor before the persistent landmarks load their frames from `assets/landmarks/frames/`: lantern/flag, archive lens, flag/brazier, and waterwheel/water animations.
- Original Đổi Mới irrigation station
  - Created for this project with the built-in image generation workflow, then background-keyed to transparent PNG.
  - Used for the restored rural cooperative scene in `assets/recovery/doi-moi-irrigation-station.png`.

## Original Cục Lưu Trữ Niên Tuyến (CLTNT) time-archive art pack

- Generated for this project with the built-in image generation workflow; no Marvel/TVA artwork, logos, or traced character likenesses were used.
- Source prompts and processing notes are recorded in `docs/asset-prompts/time-archive-pack.md`.
- Character strips were generated from one approved M-90 seed, background-keyed, normalized with nearest-neighbor sampling to 62px content inside the existing 96x96 NPC frame contract, and packed with the current bottom-center anchor.
- Used for `assets/time-archive/characters/agent-m90/` (down, left, up, downleft, upleft; right is mirrored by the existing NPC renderer).
- The Chronicle Door, archive tools, and Reset Charge were background-keyed and normalized into fixed-size PNG strips. The reset-wave VFX used luminance-to-alpha conversion from a black source so additive blending preserves the colored glow.
- The brutalist office plate is an original lossless WEBP: `assets/time-archive/environment/chronicle-office.webp`.
- M-90's non-looping `reset_activate` action was authored from the approved seed with Aseprite MCP, exported as `reset-activate.aseprite` / `reset-activate.png`, and tagged with per-frame durations plus reset event metadata.

## Music

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

