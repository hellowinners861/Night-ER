import { useCallback, useEffect } from "react";

// Set a URL for either cue when that asset is available. Keeping these values
// null means the hook has no audio side effects (including no fetch requests).
export const RUSH_SFX = {
  drunk: { warning: null, start: null },
  traffic: { warning: null, start: null },
  festival: { warning: null, start: null },
  stadium: { warning: null, start: null },
  fire: { warning: null, start: null },
  food: { warning: null, start: null },
};

const preloadedAudio = new Map();

const getUrl = (rushId, kind) => {
  if (kind !== "warning" && kind !== "start") return null;
  const url = RUSH_SFX[rushId]?.[kind];
  return typeof url === "string" && url.length > 0 ? url : null;
};

const preload = (url) => {
  if (!url || typeof Audio === "undefined") return null;

  let audio = preloadedAudio.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = "auto";
    audio.load();
    preloadedAudio.set(url, audio);
  }
  return audio;
};

const preloadAllRushSfx = () => {
  Object.values(RUSH_SFX).forEach((cues) => {
    Object.values(cues).forEach((url) => {
      if (typeof url === "string" && url.length > 0) preload(url);
    });
  });
};

if (typeof window !== "undefined") {
  preloadAllRushSfx();
}

export function useRushSfx() {
  useEffect(() => {
    preloadAllRushSfx();
  }, []);

  const playRushSfx = useCallback((rushId, kind) => {
    const url = getUrl(rushId, kind);
    if (!url) return;

    const audio = preload(url);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Playback can be rejected until a browser has received user input.
    });
  }, []);

  return { playRushSfx };
}
