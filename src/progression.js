export const PROGRESSION_KEY = "night-er-emergency-level-progress-v1";
export const PROGRESSION_VERSION = 1;

const emptyProgress = () => ({
  secondary: false,
  tertiary: false,
});

const browserStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const loadEmergencyProgress = (storage = browserStorage()) => {
  if (!storage) return emptyProgress();
  try {
    const raw = storage.getItem(PROGRESSION_KEY);
    if (!raw) return emptyProgress();
    const saved = JSON.parse(raw);
    if (saved.version !== PROGRESSION_VERSION || !saved.cleared) {
      return emptyProgress();
    }
    return {
      secondary: saved.cleared.secondary === true,
      tertiary: saved.cleared.tertiary === true,
    };
  } catch {
    return emptyProgress();
  }
};

export const isSecretUnlocked = (progress) => (
  progress?.secondary === true && progress?.tertiary === true
);

export const recordHospitalClear = (
  hospitalId,
  storage = browserStorage(),
) => {
  if (!storage || !["secondary", "tertiary"].includes(hospitalId)) {
    return loadEmergencyProgress(storage);
  }
  const next = {
    ...loadEmergencyProgress(storage),
    [hospitalId]: true,
  };
  try {
    storage.setItem(PROGRESSION_KEY, JSON.stringify({
      version: PROGRESSION_VERSION,
      cleared: next,
    }));
  } catch {
    return loadEmergencyProgress(storage);
  }
  return next;
};
