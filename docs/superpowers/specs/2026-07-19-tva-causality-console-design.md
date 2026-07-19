# TVA Causality Console Design

## Decision

Replace the current grid-and-buttons presentation of the TVA **Bản đồ Nhân quả** with a themed, interactive **Causality Console**. The feature retains the same five relic nodes, progression data, reset data, and dossier details; it changes only the presentation and interaction hierarchy.

The console must make a player understand, at a glance:

- their run progresses from 1922 to 1986 through five collected relics;
- bright connections are understood/constructive branches;
- red broken connections are unresolved risk or a bad branch;
- a reset is a recorded loop back to the relevant decision, not lost progress;
- each relic node opens the existing historical and gameplay explanation.

## Visual direction

The map is a brass-and-verdigris TVA instrument rather than a generic graph.

- A wide engraved housing frames the entire map, with restrained gear, cable, and clock markings at the outer edges.
- The horizontal central rail is the historical timeline, labelled `1922`, `1930`, `1945`, `1975`, and `1986`.
- Each of the five nodes uses the actual collected relic art, not a text-only box. The relic remains bottom-center anchored in a metal socket.
- Nodes sit in a deliberate arc around the rail: Khu 1 at the left, Khu 2 upper-left, Khu 3A centre, Khu 3B upper-right, and Khu 4 at the right.
- The selected node has a clear gold ring and a small, calm pulse. Reconstructed nodes also emit a restrained green-teal aura. The UI honors reduced motion by removing the pulse and line travel.
- Historical years and node labels are directly readable without opening a detail card.

The palette is inherited from TVA: charcoal/verdigris body, aged brass borders, warm gold for a known route, teal for a reconstructed chain, and muted vermilion for a fractured branch. It must not introduce bright sci-fi blue, neon effects, or a dashboard-like card grid.

## Connections and reset

Links are rendered as physical inlaid conduits rather than thin graph lines.

| State | Visual treatment | Meaning |
| --- | --- | --- |
| Locked | dark brass conduit, no glow | chapter not discovered |
| Collected | warm gold current, slow travel from left to right | relic obtained |
| Reconstructed | gold core with teal outline | memory reconstruction completed |
| Fractured | interrupted vermilion conduit with two separated ends | risky branch / area bad ending recorded |
| Reset | a short clock-shaped loop beneath the affected socket, with `RESET WAVE` tag | the run returned to the decision point |

Only an actual reset trace creates a reset loop. A generic label must never appear just because a node is selected. A fractured link remains explanatory, but does not block a player from viewing another node or opening the memory reconstruction.

## Node interaction and dossier detail

All nodes remain keyboard and pointer accessible.

- Click, Enter, or Space selects an unlocked, collected, reconstructed, or fractured node.
- Locked nodes are viewable but muted; their dossier says the file is not yet opened.
- Selection updates the existing detail record below the console without scene reload or a new modal.
- The detail record contains the historic era, relic image, gameplay effect, recorded choice path, reset explanation when applicable, and either the reconstructed history lesson or an invitation to reconstruct the memory.
- The active node should stay visible when the view is narrow; the rail may scroll horizontally on phones, while the detail remains below it.

No change is made to ending thresholds, relic collection, reset rules, narrative choices, or save compatibility.

## Motion and sound

This is a dossier screen, so motion communicates state rather than constantly attracting attention.

- On first open, sockets and the rail fade in over 300–450 ms; no screen-covering animation is used.
- Existing collected/reconstructed state determines whether a current moves through a conduit.
- Selecting a node uses the existing quiet UI selection sound. It must not reintroduce keyboard beeps.
- Reset loop visibility may animate once when the dossier is opened; it stays static afterward.

## Implementation boundaries

- Keep causal node state and choice history in the existing data and save systems.
- Keep rendering local to the TVA dossier renderer and scoped CSS classes.
- Add a small view-model/helper layer for node presentation classes and connector paths so visual state is testable separately from DOM creation.
- Reuse the five relic assets already shipped in `assets/story/relics/`; do not add generic fallback art.
- Continue using the existing pixel font, respect semantic button controls, focus outlines, and `prefers-reduced-motion`.

## Verification

Automated checks must prove that all five data nodes still render, all five status classes route to the right presentation, reset loops only appear for saved reset traces, and selecting a node preserves the current historical dossier detail.

Browser playtests must cover:

1. fresh run: five locked sockets and no fabricated reset trace;
2. one collected relic: warm rail/node treatment and intact click/keyboard selection;
3. reconstructed relic: teal route and full historical takeaway;
4. zone bad branch plus reset: fractured conduit plus exactly one reset loop on the affected node;
5. all five relics: complete console at desktop and presentation resolutions;
6. narrow viewport and reduced-motion preference;
7. no input beep, no gameplay movement beneath dossier, and reload/save restoration.

## Out of scope

- Replacing the cinematic five-relic map.
- Changing the separate `Tái dựng ký ức` interaction.
- Depicting a geographic Vietnam map inside this TVA dossier.
- Adding a new gameplay reward or changing ending outcomes.
