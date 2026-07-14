# Ending collection and New Game+ light design

## Purpose

Keep a player's witnessed narrative endings available as historical case files while every new journey starts with a clean playable state. The collection is a record and reference surface, not a progression shortcut.

## Chosen approach

Persist a small, versioned ending collection in browser storage independently from the campaign save. This is preferred over keeping it only in `crossroads-save-v1`: beginning a new campaign deliberately clears that campaign save, while the collection must survive.

## Data boundary

- `src/systems/ending-collection.js` owns storage parsing, versioning, validation, deduplication and safe failure behavior.
- Only IDs present in `NARRATIVE_ENDING_DEFINITIONS` are accepted. Unknown, malformed and stale entries are discarded.
- A collected ending is an ID only; the source of title, explanatory text and art remains `ENDING_DEFINITIONS` / `NARRATIVE_ENDING_DEFINITIONS`.
- Storage failure must never stop an ending overlay or a new campaign from working.

## Runtime behavior

1. Every data-driven ending records its ID before displaying the ending overlay.
2. Starting a new game resets campaign save, quests, inventory, corruption and in-run narrative choices as it does today. It must not clear the independent ending collection.
3. The existing `Sách lịch sử` button remains compact and only appears while playing. Its count includes ordinary unlocked historical pages plus collected ending case files.
4. Each collected ending is exposed in the existing book as `ending:<endingId>`, reusing its authored ending title, copy and generated art. It does not run a cinematic, change player state or reopen an ending.
5. The book makes the distinction explicit with the kicker `Hồ sơ kết cục đã chứng kiến`.

## Non-goals

- No combat-stat, inventory, portal or quest carryover.
- No generic `bad` fallback entry: only authored narrative endings are collectable.
- No new static stand-in artwork; the book reuses existing approved ending art.
- No change to combat, maps, balance, audio, or save format for the active campaign.

## Verification

- Unit check proves valid IDs persist and deduplicate, bad storage is safe, and unsupported IDs are rejected.
- Runtime bridge check proves the collection is separate from campaign reset and book routing.
- Browser test opens an ending case file after an ending is recorded, then begins a new campaign and confirms the case file remains while gameplay progress resets.
- Full unit suite, build and browser suite pass.
