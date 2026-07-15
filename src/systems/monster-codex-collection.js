const MONSTER_CODEX_COLLECTION_VERSION = 1;

function normalizeEntries(entries, isSupportedMonsterId) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return [...new Set(entries.filter((id) => typeof id === "string" && isSupportedMonsterId(id)))];
}

export function createMonsterCodexCollection({ storage, storageKey, isSupportedMonsterId }) {
  function getEntries() {
    try {
      const saved = JSON.parse(storage.getItem(storageKey) ?? "null");
      if (saved?.version !== MONSTER_CODEX_COLLECTION_VERSION) {
        return [];
      }
      return normalizeEntries(saved.monsterIds, isSupportedMonsterId);
    } catch {
      return [];
    }
  }

  function record(monsterId) {
    if (typeof monsterId !== "string" || !isSupportedMonsterId(monsterId)) {
      return false;
    }

    const entries = getEntries();
    if (entries.includes(monsterId)) {
      return false;
    }

    try {
      storage.setItem(storageKey, JSON.stringify({
        version: MONSTER_CODEX_COLLECTION_VERSION,
        monsterIds: [...entries, monsterId],
      }));
      return true;
    } catch {
      return false;
    }
  }

  return { getEntries, record };
}
