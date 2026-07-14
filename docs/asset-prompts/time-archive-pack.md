# Cục Lưu Trữ Niên Tuyến art pack

This pack gives the game a retro-bureaucratic time-archive layer without using Marvel/TVA names, marks, set designs, or character likenesses. The in-game organization is called **Cục Lưu Trữ Niên Tuyến (CLTNT)**. Its staff are overworked historical clerks who carry paperwork, coffee, coordinate pads, and branch-reset charges.

## Runtime scale contract

The current Canvas renderer uses the existing NPC contract from `src/data/render-config.js`:

- source frame: `96x96`
- source crop: `x=30, y=18, width=36, height=62`
- in-game draw: `24x40` at scale `1`
- anchor: bottom-center at the entity position
- idle: first 4 columns of the top row
- walk: 8 columns of the bottom row

M-90 was generated as 11 normalized source frames (4 idle + 7 walk), then the first walk frame is repeated as the eighth walk frame to satisfy the existing 8-frame loader. Every direction uses the same 62px content canvas and bottom-center placement. The runtime mirrors `left.png` for right-facing movement, matching the existing NPC path.

## Final assets

- `assets/time-archive/characters/agent-m90/{down,left,up,downleft,upleft}.png` — animated M-90 sheets.
- `assets/time-archive/environment/chronicle-office.webp` — 1536x1024 top-down office plate with brutalist concrete, mustard carpet, CRTs, typewriters, rotary phones, paper runs, and a clear center aisle.
- `assets/time-archive/environment/chronicle-door-sheet.png` — 6-frame rectangular amber/green Chronicle Door activation.
- `assets/time-archive/props/archive-tools-sheet.png` — closed/active Chronicle Pad and inactive/armed Branch Reset Charge.
- `assets/time-archive/effects/reset-wave-sheet.png` — 8-frame violet/amber prune pulse and blue reconstruction pulse.

## Generation and cleanup

The built-in image generator was used with the existing VNR202 player/NPC art as style references. Character and object strips were requested as one horizontal strip per action/direction so silhouette, palette, and equipment stay consistent across frames. The generated magenta backgrounds were removed with the installed chroma-key helper. Frames were normalized with nearest-neighbor resampling; portal and VFX frames use a center anchor, while characters and floor props use bottom-center. The reset-wave strip was generated on black and converted from luminance to alpha to preserve its colored glow for additive blending.

The raw generated source strips remain under `assets/time-archive/sources/` for auditability. `scripts/prepare-time-archive-assets.py` and `scripts/normalize_centered_strip.py` reproduce the packing and center-anchor normalization.
