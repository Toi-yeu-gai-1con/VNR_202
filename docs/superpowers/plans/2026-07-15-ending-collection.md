# Ending Collection and New Game+ Light Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve authored ending records across a clean new campaign and show them in the existing Sách lịch sử.

**Architecture:** A focused `ending-collection` system owns a versioned local-storage record of known narrative ending IDs. The Canvas runtime calls it when a data-driven ending resolves and contributes read-only case-file slides to the existing DOM book; campaign save/reset remains unchanged.

**Tech Stack:** Vanilla ES modules, browser `localStorage`, Canvas 2D runtime, DOM book overlay, Node assertion checks, Playwright.

## Global Constraints

- Keep Canvas 2D and existing DOM book UI; do not migrate engines or add dependencies.
- Accept only IDs from `NARRATIVE_ENDING_DEFINITIONS`.
- New Game+ carries no combat, inventory, quest, portal, corruption, choice or balance state.
- Reuse approved ending art; do not add a static fallback.
- Use Vietnamese UTF-8 copy and preserve the existing accessible button/modal behavior.

---

### Task 1: Persistent collection system

**Files:**
- Create: `src/systems/ending-collection.js`
- Create: `tests/ending-collection-check.mjs`

**Interfaces:**
- Produces `createEndingCollection({ storage, storageKey, isSupportedEndingId })`.
- Returned API: `getEntries(): string[]`, `record(endingId: string): boolean`.

- [ ] **Step 1: Write the failing test**

```js
const collection = createEndingCollection({ storage, storageKey: "ending-test", isSupportedEndingId: (id) => id === "neutral" });
assert.deepEqual(collection.getEntries(), []);
assert.equal(collection.record("neutral"), true);
assert.deepEqual(collection.getEntries(), ["neutral"]);
assert.equal(collection.record("unknown"), false);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/ending-collection-check.mjs`

Expected: failure because `src/systems/ending-collection.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
export function createEndingCollection({ storage, storageKey, isSupportedEndingId }) {
  const read = () => { /* parse JSON, filter supported string IDs, deduplicate */ };
  const write = (entries) => { /* store { version: 1, endingIds: entries }; return false on storage errors */ };
  return {
    getEntries: () => read(),
    record: (endingId) => isSupportedEndingId(endingId) && write([...new Set([...read(), endingId])]),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/ending-collection-check.mjs`

Expected: `PASS: ending collection safely preserves authored case files.`

### Task 2: Runtime recording and case-file slides

**Files:**
- Modify: `src/runtime/game-runtime.js`
- Modify: `tests/narrative-runtime-bridge-check.mjs`

**Interfaces:**
- Consumes `createEndingCollection` and `ENDING_DEFINITIONS` / `NARRATIVE_ENDING_DEFINITIONS`.
- Adds book IDs named `ending:<endingId>` to `storyRegistry`.

- [ ] **Step 1: Write the failing runtime-bridge assertions**

```js
assert.match(runtime, /createEndingCollection/, "Runtime owns a separate persistent ending collection.");
assert.match(runtime, /recordEndingCollection\(candidate\.id\)/, "Every resolved narrative ending records a case file.");
assert.match(runtime, /ending:\$\{endingId\}/, "The book receives stable ending case-file IDs.");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/narrative-runtime-bridge-check.mjs`

Expected: failure because no persistent collection is routed into the runtime.

- [ ] **Step 3: Implement focused runtime integration**

```js
const endingCollection = createEndingCollection({
  storage: localStorage,
  storageKey: ENDING_COLLECTION_STORAGE_KEY,
  isSupportedEndingId: (endingId) => Boolean(NARRATIVE_ENDING_DEFINITIONS[endingId]),
});

function getEndingCaseFileIds() {
  return endingCollection.getEntries().map((endingId) => `ending:${endingId}`);
}

function recordEndingCollection(endingId) {
  endingCollection.record(endingId);
}
```

Build registry pages from each collected ID using `ENDING_DEFINITIONS[endingId]`, `gallery` artwork, `kicker: "Hồ sơ kết cục đã chứng kiến"`, then merge them with `state.unlockedStoryIds` when counting and opening the book. Call `recordEndingCollection` in both data-driven ending functions before the overlay is shown.

- [ ] **Step 4: Run focused checks**

Run: `node tests/ending-collection-check.mjs; node tests/narrative-runtime-bridge-check.mjs`

Expected: both checks pass.

### Task 3: Browser regression and verification

**Files:**
- Modify: `tests/e2e/game-flow.spec.mjs`

**Interfaces:**
- Uses the existing debug ending route to record `neutral`, returns to the start screen, starts a clean game, and opens the ending case file from the book.

- [ ] **Step 1: Write a failing E2E scenario**

```js
test("ending case files survive a clean new journey", async ({ page }) => {
  await page.goto("/?debugEnding=neutral");
  await expect(page.locator("#end-overlay")).toBeVisible();
  await page.locator("#return-start-button").click();
  await page.locator("#start-button").click();
  await expect(page.locator("#story-book-button")).toContainText("1");
});
```

- [ ] **Step 2: Run scenario to verify it fails**

Run: `npx playwright test tests/e2e/game-flow.spec.mjs --grep "ending case files survive"`

Expected: the book has no durable ending entry after starting the new campaign.

- [ ] **Step 3: Complete scenario and verify visual state**

Advance the opening, click the book, assert the `Hồ sơ kết cục đã chứng kiến` kicker and neutral ending image are visible. Take a screenshot of the modal at its real game scale.

- [ ] **Step 4: Run final verification**

Run: `npm run test:unit; npm run build; npm run test:e2e`

Expected: all checks pass. Inspect the ending-case screenshot for no playfield obstruction outside the modal and no missing artwork.
