export const SAVE_KEY = "night-er-full-shift-progress-v1";
export const SAVE_VERSION = 1;

const browserStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isValidSnapshot = (game) => (
  game
  && game.modeId === "full"
  && typeof game.levelId === "string"
  && typeof game.t === "number"
  && Array.isArray(game.beds)
  && game.beds.length === 4
  && Array.isArray(game.order)
  && game.stats
);

export const loadSavedProgress = (storage = browserStorage()) => {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (
      saved.version !== SAVE_VERSION
      || typeof saved.savedAt !== "string"
      || !isValidSnapshot(saved.game)
    ) return null;
    return saved;
  } catch {
    return null;
  }
};

export const saveProgress = (game, storage = browserStorage()) => {
  if (!storage || !isValidSnapshot(game)) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({
      version: SAVE_VERSION,
      savedAt: new Date().toISOString(),
      game: {
        ...game,
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
