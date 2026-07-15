const AUTHORED_FIELDS = Object.freeze(["interactionType", "dialogueKey", "prompt"]);
const RUNTIME_FLAGS = Object.freeze(["collected", "used", "purified", "activated"]);

function cloneValue(value) {
  return typeof value === "object" && value !== null ? structuredClone(value) : value;
}

function captureItem(item) {
  const snapshot = {};
  for (const field of AUTHORED_FIELDS) {
    if (field in item) {
      snapshot[field] = cloneValue(item[field]);
    }
  }
  return snapshot;
}

export function captureInteractableRuntimeState(levels) {
  return new Map(Object.entries(levels).map(([levelId, level]) => [
    levelId,
    new Map((level.interactables ?? []).map((item) => [item.id, captureItem(item)])),
  ]));
}

export function restoreInteractableRuntimeState(levels, snapshots) {
  for (const [levelId, level] of Object.entries(levels)) {
    const itemSnapshots = snapshots.get(levelId);
    for (const item of level.interactables ?? []) {
      const authored = itemSnapshots?.get(item.id) ?? {};
      for (const field of AUTHORED_FIELDS) {
        if (field in authored) {
          item[field] = cloneValue(authored[field]);
        } else {
          delete item[field];
        }
      }
      for (const flag of RUNTIME_FLAGS) {
        item[flag] = false;
      }
    }
  }
}
