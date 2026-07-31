import { useCallback, useEffect, useRef } from "react";

const SFX = {
  menuDecision: {
    url: `${import.meta.env.BASE_URL}audio/decision-51.mp3`,
    volume: 0.9,
  },
  gameChoice: {
    url: `${import.meta.env.BASE_URL}audio/decision-53.mp3`,
    volume: 0.95,
  },
  patientWarning: {
    url: `${import.meta.env.BASE_URL}audio/warning-red.mp3`,
    volume: 1,
  },
  icuWarning: {
    url: `${import.meta.env.BASE_URL}audio/warning-icu.mp3`,
    volume: 1,
  },
  goodDoctor: {
    url: `${import.meta.env.BASE_URL}audio/success-good-doctor.mp3`,
    volume: 1,
  },
  incomingCall: {
    url: `${import.meta.env.BASE_URL}audio/incoming-phone-ring.mp3`,
    volume: 0.82,
  },
  bedAdmission: {
    url: `${import.meta.env.BASE_URL}audio/bed-admission-confirm.mp3`,
    volume: 0.95,
  },
};

const SILENCE_THRESHOLD_RATIO = 10 ** (-50 / 20);
const SILENCE_PRE_ROLL_SECONDS = 0.005;
const FALLBACK_POOL_SIZE = 3;

const decodedSfx = new Map();
const loadingSfx = new Map();
const failedSfx = new Set();
const fallbackPools = new Map();
let decodeContext = null;
let playbackContext = null;

const getDecodeContext = () => {
  if (decodeContext) return decodeContext;
  if (typeof window === "undefined") return null;

  const OfflineAudioContextClass =
    window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (OfflineAudioContextClass) {
    try {
      decodeContext = new OfflineAudioContextClass(1, 1, 44100);
      return decodeContext;
    } catch {
      // 通常のAudioContextでのデコードへフォールバックする。
    }
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    decodeContext = new AudioContextClass();
    return decodeContext;
  } catch {
    return null;
  }
};

const getPlaybackContext = () => {
  if (playbackContext && playbackContext.state !== "closed") {
    return playbackContext;
  }
  if (typeof window === "undefined") return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    playbackContext = new AudioContextClass({ latencyHint: "interactive" });
  } catch {
    try {
      playbackContext = new AudioContextClass();
    } catch {
      return null;
    }
  }
  return playbackContext;
};

const findAudibleStart = (buffer) => {
  const channels = Array.from(
    { length: buffer.numberOfChannels },
    (_, index) => buffer.getChannelData(index),
  );
  const blockSize = Math.max(32, Math.round(buffer.sampleRate * 0.003));
  const blockCount = Math.ceil(buffer.length / blockSize);
  const rmsByBlock = new Float32Array(blockCount);
  let peakRms = 0;

  for (let block = 0; block < blockCount; block += 1) {
    const start = block * blockSize;
    const end = Math.min(buffer.length, start + blockSize);
    let sum = 0;
    let sampleCount = 0;

    for (const samples of channels) {
      for (let index = start; index < end; index += 1) {
        sum += samples[index] ** 2;
        sampleCount += 1;
      }
    }

    const rms = Math.sqrt(sum / Math.max(1, sampleCount));
    rmsByBlock[block] = rms;
    peakRms = Math.max(peakRms, rms);
  }

  if (peakRms === 0) return 0;
  const threshold = peakRms * SILENCE_THRESHOLD_RATIO;

  for (let block = 0; block < blockCount; block += 1) {
    if (rmsByBlock[block] >= threshold) {
      return Math.max(
        0,
        block * blockSize / buffer.sampleRate - SILENCE_PRE_ROLL_SECONDS,
      );
    }
  }

  return 0;
};

const loadSfx = (config) => {
  const cached = decodedSfx.get(config.url);
  if (cached) return Promise.resolve(cached);
  if (failedSfx.has(config.url)) return Promise.resolve(null);

  const pending = loadingSfx.get(config.url);
  if (pending) return pending;

  const context = getDecodeContext();
  if (!context) return Promise.resolve(null);

  const request = fetch(config.url)
    .then((response) => {
      if (!response.ok) throw new Error(`SFX load failed: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((bytes) => new Promise((resolve, reject) => {
      context.decodeAudioData(bytes, resolve, reject);
    }))
    .then((buffer) => {
      const decoded = {
        buffer,
        startAt: findAudibleStart(buffer),
      };
      decodedSfx.set(config.url, decoded);
      return decoded;
    })
    .catch(() => {
      failedSfx.add(config.url);
      return null;
    })
    .finally(() => {
      loadingSfx.delete(config.url);
    });

  loadingSfx.set(config.url, request);
  return request;
};

const preloadAllSfx = () => {
  Object.values(SFX).forEach((config) => {
    getFallbackPool(config);
    void loadSfx(config);
  });
};

const createFallbackAudio = (config) => {
  const audio = new Audio(config.url);
  audio.preload = "auto";
  audio.load();
  return audio;
};

const getFallbackPool = (config) => {
  if (typeof Audio === "undefined") return [];

  const cached = fallbackPools.get(config.url);
  if (cached) return cached;

  const pool = [createFallbackAudio(config)];
  fallbackPools.set(config.url, pool);
  return pool;
};

const playFallback = (config) => {
  const pool = getFallbackPool(config);
  if (pool.length === 0) return () => {};

  let audio = pool.find((candidate) => candidate.paused || candidate.ended);
  if (!audio && pool.length < FALLBACK_POOL_SIZE) {
    audio = createFallbackAudio(config);
    pool.push(audio);
  }
  audio ??= pool[0];
  audio.pause();
  audio.currentTime = 0;
  audio.volume = config.volume;
  audio.play().catch(() => {
    // ブラウザ側で再生が拒否された場合も、ボタン操作自体は妨げない。
  });
  return () => {
    audio.pause();
    audio.currentTime = 0;
  };
};

const playDecoded = (config, decoded) => {
  const context = getPlaybackContext();
  if (!context) {
    return playFallback(config);
  }

  let source = null;
  let gain = null;
  let fallbackStop = null;
  let stopped = false;
  const cleanup = () => {
    source?.disconnect();
    gain?.disconnect();
    source = null;
    gain = null;
  };
  const stop = () => {
    stopped = true;
    fallbackStop?.();
    fallbackStop = null;
    if (!source) return;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // 既に終了済みの場合は何もしない。
    }
    cleanup();
  };
  const useFallback = () => {
    if (!stopped) fallbackStop = playFallback(config);
  };
  const start = () => {
    if (stopped) return;
    source = context.createBufferSource();
    gain = context.createGain();
    source.buffer = decoded.buffer;
    gain.gain.value = config.volume;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = cleanup;
    source.start(0, decoded.startAt);
  };

  if (context.state === "running") {
    start();
    return stop;
  }

  void context.resume()
    .then(() => {
      if (context.state === "running") start();
      else useFallback();
    })
    .catch(() => {
      useFallback();
    });
  return stop;
};

const playOneShot = (config) => {
  const cached = decodedSfx.get(config.url);
  if (cached) {
    return playDecoded(config, cached);
  }

  const stop = playFallback(config);
  void loadSfx(config);
  return stop;
};

const primePlaybackContext = () => {
  window.removeEventListener("pointerdown", primePlaybackContext, true);
  window.removeEventListener("keydown", primePlaybackContext, true);

  const context = getPlaybackContext();
  if (context && context.state !== "running" && context.state !== "closed") {
    void context.resume().catch(() => {
      // 実際の再生操作でもう一度resumeする。
    });
  }
};

if (typeof window !== "undefined") {
  preloadAllSfx();
  window.addEventListener("pointerdown", primePlaybackContext, {
    capture: true,
    once: true,
    passive: true,
  });
  window.addEventListener("keydown", primePlaybackContext, {
    capture: true,
    once: true,
  });
}

export function useButtonSfx() {
  const incomingStopRef = useRef(null);
  const stopIncomingCall = useCallback(() => {
    incomingStopRef.current?.();
    incomingStopRef.current = null;
  }, []);

  useEffect(() => {
    preloadAllSfx();
    return stopIncomingCall;
  }, [stopIncomingCall]);

  const playMenuDecision = useCallback(() => {
    playOneShot(SFX.menuDecision);
  }, []);

  const playGameChoice = useCallback(() => {
    playOneShot(SFX.gameChoice);
  }, []);

  const playPatientWarning = useCallback(() => {
    playOneShot(SFX.patientWarning);
  }, []);

  const playIcuWarning = useCallback(() => {
    playOneShot(SFX.icuWarning);
  }, []);

  const playGoodDoctor = useCallback(() => {
    playOneShot(SFX.goodDoctor);
  }, []);

  const playIncomingCall = useCallback(() => {
    stopIncomingCall();
    incomingStopRef.current = playOneShot(SFX.incomingCall);
  }, [stopIncomingCall]);

  const playBedAdmission = useCallback(() => {
    playOneShot(SFX.bedAdmission);
  }, []);

  return {
    playMenuDecision,
    playGameChoice,
    playPatientWarning,
    playIcuWarning,
    playGoodDoctor,
    playIncomingCall,
    stopIncomingCall,
    playBedAdmission,
  };
}
