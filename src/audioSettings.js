const BGM_ENABLED_KEY = "night-er-bgm-enabled-v1";

const browserStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const loadBgmPreference = (storage = browserStorage()) => {
  if (!storage) return null;
  try {
    const saved = storage.getItem(BGM_ENABLED_KEY);
    if (saved === "on") return true;
    if (saved === "off") return false;
    return null;
  } catch {
    return null;
  }
};

export const saveBgmPreference = (enabled, storage = browserStorage()) => {
  if (!storage) return false;
  try {
    storage.setItem(BGM_ENABLED_KEY, enabled ? "on" : "off");
    return true;
  } catch {
    return false;
  }
};
