export const SAVE_KEY = "night-er-full-shift-progress-v1";
export const SAVE_VERSION = 2;

const browserStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const normalizeSnapshot = (game) => {
  if (!game) return game;
  const hospitalId = game.hospitalId ?? "secondary";
  return {
    ...game,
    hospitalId,
    hospitalTitle: game.hospitalTitle ?? (
      hospitalId === "tertiary"
        ? "三次救急・救命救急センター"
        : hospitalId === "secret"
          ? "断らない救急"
          : "二次救急病院"
    ),
    bedCount: hospitalId === "secret" ? 10 : 4,
  };
};

const isValidSnapshot = (game) => (
  game
  && game.modeId === "full"
  && typeof game.levelId === "string"
  && ["secondary", "tertiary", "secret"].includes(game.hospitalId)
  && typeof game.t === "number"
  && Array.isArray(game.beds)
  && game.beds.length === (game.hospitalId === "secret" ? 10 : 4)
  && Array.isArray(game.order)
  && game.stats
);

export const loadSavedProgress = (storage = browserStorage()) => {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (![1, SAVE_VERSION].includes(saved.version) || typeof saved.savedAt !== "string") {
      return null;
    }
    const game = normalizeSnapshot(saved.game);
    if (!isValidSnapshot(game)) return null;
    return { ...saved, version: SAVE_VERSION, game };
  } catch {
    return null;
  }
};

export const saveProgress = (game, storage = browserStorage()) => {
  const normalized = normalizeSnapshot(game);
  if (!storage || !isValidSnapshot(normalized)) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({
      version: SAVE_VERSION,
      savedAt: new Date().toISOString(),
      game: {
        ...normalized,
        phase: "play",
        fx: null,
      },
    }));
    return true;
  } catch {
    return false;
  }
};

export const clearSavedProgress = (storage = browserStorage()) => {
  if (!storage) return false;
  try {
    storage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
};
