# TVA Vietnam Memory Map Design

## Goal

Replace the current button graph in the TVA `Bản đồ Nhân quả` dossier with the approved Direction 2, **Việt Nam bằng ký ức**. The existing causality data, relic ownership, reconstruction state, reset traces, detail copy, and ending logic remain unchanged.

## Visual direction

- The complete pixel-art Vietnam map from the relic-convergence sequence is the visual anchor, including the existing Hoàng Sa and Trường Sa representation.
- Five real relic sheets appear as interactive memory seals around the S-shaped mainland, following a north-to-south reading rhythm.
- A soft green-gold memory current connects understood history. Fractured choices turn the relevant current red and broken. A reset trace appears as a clearly labeled rewind ripple near its relic, rather than as an unexplained line.
- The selected memory receives a restrained halo and a focused beam into the map. Locked memories remain visible only as dim silhouettes so later content is not spoiled.
- The console caption becomes the emotional thesis: “Một Việt Nam không chỉ được vẽ bằng đường biên, mà bằng những lựa chọn đã nối con người và thời đại lại với nhau.”

## Interaction and accessibility

- Each relic seal is a semantic button with `aria-pressed` and a descriptive `aria-label`.
- Pointer click, Enter, and Space select a memory and preserve the existing dossier detail flow.
- Focus-visible styling is unambiguous. Reduced-motion settings remove pulsing, traveling light, and reset-ripple animation without hiding state.
- On presentation-sized desktop viewports, the complete map and all five seals fit without scrolling inside the visual. On narrow screens the map scales down and labels collapse to shorter forms while controls remain tappable.

## State language

- `locked`: desaturated silhouette, quiet connector.
- `collected`: warm gold seal and connector.
- `reconstructed`: teal-gold seal, continuous luminous current.
- `fractured`: red crack treatment and interrupted current.
- `reset`: one dashed rewind ripple and “RESET WAVE” label at the affected relic only.
- `selected`: gold focus ring, map spotlight, and detail panel update.

## Architecture

Keep `CAUSALITY_MAP_NODES`, `CAUSALITY_MAP_LINKS`, `RELIC_VISUALS`, and the current state helpers as sources of truth. Add memory-map placement metadata to each node, render a scoped `.tva-memory-map` DOM/SVG composition inside `renderTvaCausalityMap()`, and implement the art direction in `styles.css`. No ending, quest, save, or dialogue behavior changes.

## Verification

- Unit/source contracts require five memory placements, the map artwork, five real relic images, semantic button state, and a conditional reset ripple.
- Browser tests verify all five states are selectable by keyboard, one recorded reset produces one marker, no reset produces none, reduced motion disables decorative animation, and the complete composition fits a 1366×768 presentation viewport.
- Screenshot review is mandatory for a full five-relic state and a fractured/reset state.
