function cloneCheckpoint(value) {
  return structuredClone(value);
}

export function createFinalVerdictCheckpoint(state) {
  return cloneCheckpoint(state);
}

export function restoreFinalVerdictCheckpoint(checkpoint) {
  return cloneCheckpoint(checkpoint);
}
