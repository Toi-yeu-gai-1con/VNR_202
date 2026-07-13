function createDefaultImageLoader(entry) {
  return new Promise((resolve, reject) => {
    const image = entry.handle ?? new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error(`Unable to load image: ${entry.src}`)), { once: true });
    image.src = entry.src;
  });
}

function createDefaultAudioLoader(entry) {
  return new Promise((resolve, reject) => {
    const audio = entry.handle ?? new Audio();
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
  const groups = new Map(Object.entries(manifest).map(([groupId, entries]) => [groupId, [...entries]]));
  const entriesByKey = new Map();
  const assetsByKey = new Map();
  const errorsByKey = new Map();
  const pendingByKey = new Map();
  const listeners = new Set();

  for (const entries of groups.values()) {
    for (const entry of entries) {
      if (entriesByKey.has(entry.key)) {
        throw new Error(`Duplicate asset key: ${entry.key}`);
      }
      entriesByKey.set(entry.key, entry);
    }
  }

  function emit(event) {
    for (const listener of listeners) {
      listener(event);
    }
  }

  function register(entry) {
    if (!entry?.key || !entry.group || !entry.type || !entry.src) {
      throw new Error("Asset entries require key, group, type, and src.");
    }

    const existing = entriesByKey.get(entry.key);
    if (existing) {
      if (existing.src !== entry.src || existing.type !== entry.type) {
        throw new Error(`Duplicate asset key: ${entry.key}`);
      }
      return existing;
    }

    const groupEntries = groups.get(entry.group) ?? [];
    groupEntries.push(entry);
    groups.set(entry.group, groupEntries);
    entriesByKey.set(entry.key, entry);
    emit({ type: "registered", entry });
    return entry;
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
        emit({ type: "loaded", entry, asset });
        return asset;
      })
      .catch((error) => {
        errorsByKey.set(entry.key, error);
        emit({ type: "failed", entry, error });
        throw error;
      })
      .finally(() => pendingByKey.delete(entry.key));

    pendingByKey.set(entry.key, pending);
    return pending;
  }

  async function loadGroup(groupId, options = {}) {
    const entries = groups.get(groupId);
    if (!entries) {
      throw new Error(`Unknown asset group: ${groupId}`);
    }

    const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, entries.length));
    let nextEntryIndex = 0;
    const loadNextEntry = async () => {
      while (nextEntryIndex < entries.length) {
        const entry = entries[nextEntryIndex];
        nextEntryIndex += 1;
        await loadEntry(entry, options).catch(() => null);
      }
    };

    await Promise.all(Array.from({ length: concurrency }, loadNextEntry));

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
    register,
    getImage(key) {
      const entry = entriesByKey.get(key);
      return entry?.type === "image" ? assetsByKey.get(key) ?? null : null;
    },
    getAudio(key) {
      const entry = entriesByKey.get(key);
      return entry?.type === "audio" ? assetsByKey.get(key) ?? null : null;
    },
    getGroupStatus(groupId) {
      const entries = groups.get(groupId);
      if (!entries) {
        throw new Error(`Unknown asset group: ${groupId}`);
      }
      const failedKeys = entries.filter((entry) => errorsByKey.has(entry.key)).map((entry) => entry.key);
      return {
        groupId,
        ready: !entries.some((entry) => entry.critical && !assetsByKey.has(entry.key)),
        failedKeys,
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
