const ENDING_COLLECTION_VERSION = 1;

function normalizeEndingIds(endingIds, isSupportedEndingId) {
  if (!Array.isArray(endingIds)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();

  for (const endingId of endingIds) {
    if (typeof endingId !== "string" || seen.has(endingId) || !isSupportedEndingId(endingId)) {
      continue;
    }

    seen.add(endingId);
    normalized.push(endingId);
  }

  return normalized;
}

export function createEndingCollection({ storage, storageKey, isSupportedEndingId }) {
  function getEntries() {
    try {
      const saved = JSON.parse(storage.getItem(storageKey) ?? "null");
      if (saved?.version !== ENDING_COLLECTION_VERSION) {
        return [];
      }

      return normalizeEndingIds(saved.endingIds, isSupportedEndingId);
    } catch {
      return [];
    }
  }

  function record(endingId) {
    if (typeof endingId !== "string" || !isSupportedEndingId(endingId)) {
      return false;
    }

    const entries = getEntries();
    if (entries.includes(endingId)) {
      return true;
    }

    try {
      storage.setItem(storageKey, JSON.stringify({
        version: ENDING_COLLECTION_VERSION,
        endingIds: [...entries, endingId],
      }));
      return true;
    } catch {
      return false;
    }
  }

  return { getEntries, record };
}
