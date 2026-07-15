const ACHIEVEMENT_COLLECTION_VERSION = 1;

function normalizeEntries(entries, isSupportedAchievementId) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return [...new Set(entries.filter((id) => typeof id === "string" && isSupportedAchievementId(id)))];
}

export function createAchievementCollection({ storage, storageKey, isSupportedAchievementId }) {
  function getEntries() {
    try {
      const saved = JSON.parse(storage.getItem(storageKey) ?? "null");
      if (saved?.version !== ACHIEVEMENT_COLLECTION_VERSION) {
        return [];
      }
      return normalizeEntries(saved.achievementIds, isSupportedAchievementId);
    } catch {
      return [];
    }
  }

  function record(achievementId) {
    if (typeof achievementId !== "string" || !isSupportedAchievementId(achievementId)) {
      return false;
    }

    const entries = getEntries();
    if (entries.includes(achievementId)) {
      return false;
    }

    try {
      storage.setItem(storageKey, JSON.stringify({
        version: ACHIEVEMENT_COLLECTION_VERSION,
        achievementIds: [...entries, achievementId],
      }));
      return true;
    } catch {
      return false;
    }
  }

  return { getEntries, record };
}
