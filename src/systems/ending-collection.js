const ENDING_COLLECTION_VERSION = 2;

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

function normalizeOpenedAt(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : null;
}

function normalizeCaseFiles(caseFiles, isSupportedEndingId) {
  if (!Array.isArray(caseFiles)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();
  for (const entry of caseFiles) {
    const id = typeof entry === "string" ? entry : entry?.id;
    if (typeof id !== "string" || seen.has(id) || !isSupportedEndingId(id)) {
      continue;
    }

    seen.add(id);
    normalized.push({ id, unlockedAt: normalizeOpenedAt(entry?.unlockedAt) });
  }
  return normalized;
}

export function createEndingCollection({ storage, storageKey, isSupportedEndingId, now = () => new Date().toISOString() }) {
  function getCaseFiles() {
    try {
      const saved = JSON.parse(storage.getItem(storageKey) ?? "null");
      if (saved?.version === ENDING_COLLECTION_VERSION) {
        return normalizeCaseFiles(saved.endings, isSupportedEndingId);
      }
      if (saved?.version === 1) {
        return normalizeEndingIds(saved.endingIds, isSupportedEndingId)
          .map((id) => ({ id, unlockedAt: null }));
      }
      return [];
    } catch {
      return [];
    }
  }

  function getEntries() {
    return getCaseFiles().map((entry) => entry.id);
  }

  function record(endingId) {
    if (typeof endingId !== "string" || !isSupportedEndingId(endingId)) {
      return false;
    }

    const caseFiles = getCaseFiles();
    if (caseFiles.some((entry) => entry.id === endingId)) {
      return true;
    }

    try {
      storage.setItem(storageKey, JSON.stringify({
        version: ENDING_COLLECTION_VERSION,
        endings: [...caseFiles, { id: endingId, unlockedAt: normalizeOpenedAt(now()) }],
      }));
      return true;
    } catch {
      return false;
    }
  }

  return { getCaseFiles, getEntries, record };
}
