import assert from "node:assert/strict";
import { NARRATIVE_CHOICE_DEFINITIONS } from "../src/data/narrative-definitions.js";
import { createNarrativeState, recordNarrativeChoice, restoreNarrativeState, serializeNarrativeState } from "../src/systems/narrative-state.js";
import { resolveEnding } from "../src/systems/ending-resolver.js";
import { findMissingPairs, generatePairwiseRows } from "./support/pairwise.mjs";

const factors = Object.entries(NARRATIVE_CHOICE_DEFINITIONS).flatMap(([chapterId, decisions]) =>
  decisions.map((decision) => ({
    id: `${chapterId}/${decision.id}`,
    chapterId,
    decision,
    values: decision.options.map((option) => option.id),
  }))
);

assert.equal(factors.length, 13, "Pairwise coverage must include all 13 authored decisions.");
const rows = generatePairwiseRows(factors);
const repeatedRows = generatePairwiseRows(factors);
assert.deepEqual(rows, repeatedRows, "Pairwise generation must be deterministic and definition-order stable.");
assert.deepEqual(findMissingPairs(factors, rows), [], "Every legal cross-decision option pair must appear in at least one row.");

const allRelics = new Set(["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"]);
for (const [rowIndex, row] of rows.entries()) {
  const narrative = createNarrativeState();
  let corruption = 0;
  for (let factorIndex = 0; factorIndex < factors.length; factorIndex += 1) {
    const factor = factors[factorIndex];
    const optionId = row[factorIndex];
    const option = factor.decision.options.find((entry) => entry.id === optionId);
    assert.ok(option, `Row ${rowIndex} uses a live option for ${factor.id}.`);
    recordNarrativeChoice(narrative, {
      ...option,
      id: `${factor.chapterId}.${factor.decision.id}`,
      chapterId: factor.chapterId,
      optionId,
    });
    corruption += option.corruption ?? 0;
  }

  const restored = restoreNarrativeState(serializeNarrativeState(narrative));
  assert.equal(restored.choiceHistory.length, factors.length, `Row ${rowIndex} survives a save round-trip without losing decisions.`);
  assert.deepEqual(
    restored.choiceHistory.map((entry) => entry.optionId),
    row,
    `Row ${rowIndex} preserves deterministic option order across save/restore.`,
  );
  const ending = resolveEnding({ narrative: restored, inventory: allRelics, saDoa: Math.min(100, corruption) });
  assert.ok(typeof ending.id === "string" && ending.id.length > 0, `Row ${rowIndex} resolves to an explainable ending candidate.`);
}

console.log(`PASS: ${rows.length} deterministic pairwise rows cover every pair across 13 decisions and survive save/restore.`);
