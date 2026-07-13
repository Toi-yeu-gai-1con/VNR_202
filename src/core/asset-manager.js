function createDefaultImageLoader(entry) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error(`Unable to load image: ${entry.src}`)), { once: true });
    image.src = entry.src;
  });
}

function createDefaultAudioLoader(entry) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.loop = Boolean(entry.loop);
    audio.volume = entry.volume ?? 1;
    audio.addEventListener("canplaythrough", () => resolve(audio), { once: true });
    audio.addEventListener("error", () => reject(new Error(`Unable to load audio: ${entry.src}`)), { once: true });
    audio.src = entry.src;
    audio.load();
  });
}

export function createAssetManager(manifest, adapters = {}) {
  const loadImage = adapters.loadImage ?? createDefaultImageLoader;
  const loadAudio = adapters.loadAudio ?? createDefaultAudioLoader;
  const entriesByKey = new Map();
  const assetsByKey = new Map();
  const errorsByKey = new Map();
  const pendingByKey = new Map();

  for (const entries of Object.values(manifest)) {
    for (const entry of entries) {
      if (entriesByKey.has(entry.key)) {
        throw new Error(`Duplicate asset key: ${entry.key}`);
      }
      entriesByKey.set(entry.key, entry);
    }
  }

  async function loadEntry(entry, { retry = false } = {}) {
    if (assetsByKey.has(entry.key)) {
      return assetsByKey.get(entry.key);
    }

    if (!retry && pendingByKey.has(entry.key)) {
      return pendingByKey.get(entry.key);
    }

    if (retry) {
      errorsByKey.delete(entry.key);
    }

    const loader = entry.type === "audio" ? loadAudio : loadImage;
    const pending = loader(entry)
      .then((asset) => {
        assetsByKey.set(entry.key, asset);
        errorsByKey.delete(entry.key);
        return asset;
      })
      .catch((error) => {
        errorsByKey.set(entry.key, error);
        throw error;
      })
      .finally(() => pendingByKey.delete(entry.key));

    pendingByKey.set(entry.key, pending);
    return pending;
  }

  async function loadGroup(groupId, options = {}) {
    const entries = manifest[groupId];
    if (!entries) {
      throw new Error(`Unknown asset group: ${groupId}`);
    }

    await Promise.all(
      entries.map((entry) => loadEntry(entry, options).catch(() => null))
    );

    const failedKeys = entries
      .filter((entry) => errorsByKey.has(entry.key))
      .map((entry) => entry.key);
    const criticalFailures = entries.filter((entry) => entry.critical && errorsByKey.has(entry.key));

    return {
      groupId,
      ready: criticalFailures.length === 0,
      failedKeys,
      criticalFailedKeys: criticalFailures.map((entry) => entry.key),
    };
  }

  return {
    loadGroup,
    preloadGroup(groupId) {
      return loadGroup(groupId);
    },
    retryGroup(groupId) {
      return loadGroup(groupId, { retry: true });
    },
    getImage(key) {
      const entry = entriesByKey.get(key);
      return entry?.type === "image" ? assetsByKey.get(key) ?? null : null;
    },
    getAudio(key) {
      const entry = entriesByKey.get(key);
      return entry?.type === "audio" ? assetsByKey.get(key) ?? null : null;
    },
    getGroupStatus(groupId) {
      const entries = manifest[groupId];
      if (!entries) {
        throw new Error(`Unknown asset group: ${groupId}`);
      }
      const failedKeys = entries.filter((entry) => errorsByKey.has(entry.key)).map((entry) => entry.key);
      return {
        groupId,
        ready: !entries.some((entry) => entry.critical && errorsByKey.has(entry.key)),
        failedKeys,
      };
    },
  };
}
