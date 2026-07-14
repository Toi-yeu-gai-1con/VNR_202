# Zone 4 Crop Saboteur — Asset Design

## Goal

Replace the rejected Zone 4 placeholder-like enemy with one production-quality animated pixel character. This is an art-first vertical slice: no new runtime route is added until the visual asset is reviewed in a real Canvas scene.

## Character

- **Role:** Kẻ Phá Hoại Mùa Màng, a hostile saboteur who threatens a rural restoration area.
- **Setting fit:** worn brown-olive work jacket and trousers, dark khăn bịt mặt, cloth shoulder bag, and a wooden-handled sickle. The design avoids military cosplay, fantasy armour, modern tactical gear, caricature, and culturally inappropriate imagery.
- **Silhouette:** narrow human torso, low cloth cap, shoulder bag on the back hip, and a long curved sickle extending beyond the right side. It must remain distinguishable from the player and nearby farmers at the game’s rendered size.
- **Palette:** seven to nine deliberate colors: ink outline, cool olive shadow, olive midtone, warm brown leather/wood, muted wheat highlight, skin, dark cloth, and a restrained red-brown wound/impact accent. Lighting comes from upper-left; no airbrushed gradients or background-specific anti-aliasing.

## Asset Contract

- Transparent PNG strips; 64×64 per frame; bottom-centre anchor.
- South, north, and east facings. West mirrors east in the existing renderer.
- One coherent character seed establishes costume, proportions, pixel density, and palette.
- Animation strips generated from that seed, not independently invented frames:
  - idle: 4 frames, breathing plus bag/sickle settle;
  - walk: 4 frames, alternating foot contact and counter-swinging sickle;
  - attack: 4 frames, wind-up, low sickle cut, contact, recovery;
  - hurt: 3 frames, recoil and weapon dip;
  - death: 6 frames, stagger, knee, collapse, stillness.

## Integration Boundary

1. Store candidate source and normalized strips under `assets/monsters/zone4-crop-saboteur/` only after review.
2. Produce a preview sheet and a Canvas screenshot in Zone 4 before changing `getMonsterArtKey`, sprite loading, or render configuration.
3. After visual approval, add the zone-specific sprite key and data-owned configuration, then add a regression check for fixed frame dimensions, transparent background, stable anchor, and the approved runtime route.
4. No canvas rectangles, procedural block figures, or static fallback art may be used for the character at any stage.

## Acceptance Criteria

- The actor reads as a human saboteur, not a block person, at in-game scale.
- Sickle, bag, clothing, and silhouette stay consistent across all frames and directions.
- Walk motion comes from legs, torso, bag, and weapon—not whole-sprite jitter.
- Attack has visible anticipation, contact, and recovery.
- No opaque chroma key, clipped weapon, slot boundary crossing, or unintentional frame drift.
- User sees and approves both preview sheet and Zone 4 Canvas screenshot before the asset becomes live.
