# Progression Recovery and TVA Dossier Design

## Purpose

Repair the progression failures around replayed zones and Bad Ending recovery; remove the non-essential TVA training room; and keep history learning material separate from persistent gameplay collections. The game remains a Canvas 2D browser RPG with DOM overlays, its existing renderer, current combat balance, and Vietnamese historical framing.

## Approved player-facing outcomes

1. The TVA training console and the separate training map are removed. No empty room, disabled console, or static stand-in remains in TVA.
2. Starting a new journey restores every authored interaction to its original state. A reward or final-verdict object never appears early because a previous run changed its runtime interaction type.
3. A zone Bad Ending is a recoverable hypothetical branch. David's reset returns the player to the final decision in the affected zone with prerequisite work preserved, the reward unclaimed, the return portal sealed, and a clear prompt to make a different decision. It must not strand the player in TVA without a relic or a next coordinate.
4. The ending scene, including the M-90 reset wave, never renders the underlying portal label, navigation arrow, or "Quay về trung tâm" guidance.
5. Good, Neutral, the generic corruption ending, the five zone Bad Endings, and the secret corruption ending each resolve to a deliberate ending music track. Existing Good Ending music remains; every other ending receives a distinct, appropriate, licensed track.
6. Sách lịch sử contains only historical slides and relic-linked learning material for the current journey. It must not contain ending case files, achievements, combat records, or monster codex entries.
7. The existing Trạm Ký ức TVA becomes a separate Hồ sơ TVA overlay. It exposes persistent Ending case files, Achievements, and Monster Codex entries without putting those records in the history book.

## Architecture

### 1. Remove the training feature as a closed vertical slice

Remove the TVA training console interaction, the `training` level definition, training-session runtime state and helpers, training-only asset-group routing, and its obsolete tests. Keep the shared combat, parry, player sprites, and training-related assets only if another shipped surface still references them; do not add an inert object to replace the console. Remove the generated training equipment from the playable TVA hub composition if it identifies the removed feature.

### 2. Reset authored interaction data, not only transient flags

Level definitions are authored input and runtime currently mutates fields such as `interactionType` and `dialogueKey`. At runtime initialization, retain the authored values for every interactable. A new journey reset restores these authored values along with `collected`, `used`, `purified`, and `activated`. This makes the same reset mechanism safe for La Bàn Đỏ, Huy hiệu Thống nhất, both Khu 3 verdicts, and Bánh răng Đổi Mới.

Save/load continues to persist only genuine runtime flags and quest state. Authored interaction metadata is never serialized as mutable progress.

### 3. Recover Bad Endings at the final decision checkpoint

Before applying a final verdict option, capture a recovery checkpoint containing the active level, spawn, inventory, quest state, narrative state, and transient interaction state necessary to show that final verdict again. A zone Bad Ending records its durable ending case file, but does not persist the destructive choice as the campaign's continuation save.

When the M-90 sequence finishes:

- restore the decision checkpoint;
- set health and stamina to their safe values and Tha hóa to 0%;
- close ending and dialogue UI, clear combat/projectiles/input, and respawn in the affected zone;
- leave prerequisite objectives complete, but leave the final relic/reward unclaimed;
- restore the final verdict interaction and its guidance;
- keep the zone return portal sealed until the actual relic has been awarded;
- save this restored, playable checkpoint.

The generic non-zone corruption ending continues to recover at the existing playable respawn checkpoint because it has no specific verdict object to rewind. All end overlays suppress world portal art and navigation assistance while `state.mode === "ending"`.

### 4. Data-owned ending audio routing

Create explicit ending audio identifiers and a resolver keyed by ending id. The resolver chooses one unique track for each of:

- Good Ending (existing Good Ending track);
- Neutral Ending (new reflective but unresolved track);
- generic corruption ending;
- `zone1-lost-compass`;
- `zone2-fading-fires`;
- `zone3a-missed-moment`;
- `zone3b-divided-border`;
- `zone4-stalled-machine`;
- `secret-corruption`.

Source the eight new tracks only from sources with a compatible, documented licence. Prefer CC0 or equally permissive licensed audio that can be redistributed in the repository. Convert or package browser-compatible OGG/MP3 pairs, register them in the ending asset group, and record source URL, author, license, modifications, and in-game usage in `ASSET_SOURCES.md`. A loaded ending resumes its own track after the lazy ending asset group completes; leaving an ending resets only ending tracks and restores the hub/zone mix.

### 5. Separate history learning from TVA collections

The history book derives its pages from an explicit historical-story predicate, so legacy saves containing a monster story id cannot leak it into the book. Relics keep their historical slide behaviour and current-journey save semantics.

The TVA dossier is a separate DOM modal opened by the existing Trạm Ký ức TVA. It has three compact tabs:

- **Kết cục:** persistent ending case files with title, branch label, art and first-opened date;
- **Đối thủ:** persistent Monster Codex entries using the existing animated preview;
- **Dấu mốc:** persistent achievements with their existing text.

It uses the existing dark TVA paper-and-brass visual language, opens only on demand, respects reduced motion, traps gameplay input while open, and remains usable on a narrow mobile viewport. The HUD history-book count counts only historical pages. Empty dossier tabs explain what unlocks them without using world placeholders.

Monster codex discovery becomes its own persistent collection instead of calling the history-book unlock path. Existing achievement and ending collection persistence is retained and rendered only in the dossier.

## Error handling and save compatibility

- Old campaign saves with mutated runtime interaction metadata remain valid because authored metadata wins on fresh/new-game reset.
- Old saved monster/ending story ids are filtered from Sách lịch sử without deleting their durable collections.
- If a required ending music asset fails, the ending scene uses the existing mandatory-asset retry overlay; it does not silently replace the track with unrelated music.
- A Bad Ending reload cannot resume the destructive decision state: campaign persistence stays at the recoverable checkpoint.

## Validation plan

Unit and data tests will prove:

- the training level and console route no longer exist;
- a new journey restores authored interaction types and reward visibility;
- every zone Bad Ending restores a playable verdict checkpoint with zero corruption, an unclaimed reward, and a sealed return portal;
- no portal/navigation rendering is active during Ending or reset-wave rendering;
- the ending-audio resolver covers all nine ending ids and each id maps to a distinct registered source;
- the history-book list excludes ending, achievement, and monster ids, including legacy save values;
- dossier collections preserve valid existing ending/achievement data and persist Monster Codex discovery.

Browser playtests will cover:

- a full Zone 1 replay through La Bàn Đỏ before and after a fresh journey reset;
- a Zone 1 Bad Ending through reset wave to a different verdict, then back to TVA and onward;
- ending audio routing for Good, Neutral, generic corruption, every zone Bad Ending, and secret corruption;
- TVA dossier tabs on desktop and mobile;
- held movement, key release, blur, modal close, pause, reload, and portal collision behaviour around the affected scenes;
- screenshots of reset wave, restored decision point, sealed portal, history book, and each dossier tab.

## Explicit exclusions

- Do not change combat numbers, AI, map layouts outside removing the training feature, historical story text, player art, monster art, or the renderer architecture.
- Do not leave a static replacement for the training console or use visual fallback shapes for dossier content.
- Do not publish, merge, or push as part of this work unless separately requested.
