import { useCallback, useEffect, useRef, useState } from "react";

const MIN_BPM = 76;
const MAX_BPM = 142;
const SCHEDULE_AHEAD_SECONDS = 0.12;
const SCHEDULER_INTERVAL_MS = 30;
const SIXTEENTH_STEPS = 16;
const MASTER_FADE_SECONDS = 0.45;

// E minorを中心にした、タイトル画面とは別系統の緊張感ある進行。
const BAR_ROOTS = [82.41, 65.41, 73.42, 61.74]; // Em - C - D - Bm
const ARPEGGIO = [0, null, 2, 1, null, 2, 0, 3, 0, null, 2, 1, null, 3, 2, 1];
const MINOR_RATIOS = [1, 1.1892, 1.4983, 2];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const getGameplayMusicProfile = (game = {}) => {
  const beds = Array.isArray(game.beds) ? game.beds : [];
  const occupied = beds.filter(Boolean).length;
  let amberCount = 0;
  let redCount = 0;

  beds.forEach((bed) => {
    if (!bed) return;
    const remaining = Math.max(0, bed.arrivedAt + bed.limit - (game.t ?? 0));
    const ratio = bed.limit > 0 ? remaining / bed.limit : 0;
    if (ratio <= 0.25) redCount += 1;
    else if (ratio <= 0.5) amberCount += 1;
  });

  const fever = (game.praise ?? 0) - (game.bad ?? 0) > 5;
  const hasIncoming = Boolean(game.incoming);
  let bpm = MIN_BPM
    + occupied * 7
    + amberCount * 5
    + redCount * 16
    + (hasIncoming ? 3 : 0)
    + (fever ? 8 : 0);

  if (redCount > 0) {
    bpm = Math.max(bpm, 112 + occupied * 3 + (redCount - 1) * 10 + (fever ? 6 : 0));
  }

  const intensity = clamp(
    0.18
      + occupied * 0.13
      + amberCount * 0.08
      + redCount * 0.22
      + (hasIncoming ? 0.05 : 0)
      + (fever ? 0.12 : 0),
    0.18,
    1,
  );
  const density = clamp(
    occupied + amberCount + redCount * 2 + (fever ? 1 : 0),
    0,
    5,
  );

  return {
    bpm: Math.round(clamp(bpm, MIN_BPM, MAX_BPM)),
    intensity,
    density,
    occupied,
    amberCount,
    redCount,
    fever,
    hasIncoming,
  };
};

const createNoiseBuffer = (context) => {
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 0x6d2b79f5;
  for (let index = 0; index < data.length; index += 1) {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
    data[index] = (((seed ^ (seed >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  }
  return buffer;
};

const scheduleKick = (engine, startsAt, strength = 1) => {
  const { context, bus } = engine;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(108, startsAt);
  oscillator.frequency.exponentialRampToValueAtTime(48, startsAt + 0.11);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.052 * strength, startsAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.2);
  oscillator.connect(gain);
  gain.connect(bus);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + 0.22);
};

const scheduleHat = (engine, startsAt, strength = 1, open = false) => {
  const { context, bus, noiseBuffer } = engine;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const duration = open ? 0.12 : 0.045;
  source.buffer = noiseBuffer;
  filter.type = "highpass";
  filter.frequency.value = open ? 4200 : 5600;
  filter.Q.value = 0.5;
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.009 * strength, startsAt + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(bus);
  source.start(startsAt, (engine.step % 8) * 0.073);
  source.stop(startsAt + duration + 0.01);
};

const scheduleBass = (engine, startsAt, frequency, strength = 1) => {
  const { context, bus, intensity } = engine;
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  filter.type = "lowpass";
  filter.frequency.value = 260 + intensity * 360;
  filter.Q.value = 1.1;
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.028 * strength, startsAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.32);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(bus);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + 0.35);
};

const schedulePluck = (engine, startsAt, frequency, strength = 1) => {
  const { context, bus, intensity } = engine;
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  filter.type = "bandpass";
  filter.frequency.value = 720 + intensity * 520;
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.021 * strength, startsAt + 0.009);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.21);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(bus);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + 0.24);
};

const scheduleTensionTick = (engine, startsAt, step) => {
  const { context, bus } = engine;
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = step % 8 < 4 ? 523.25 : 554.37;
  filter.type = "lowpass";
  filter.frequency.value = 1500;
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(0.0065, startsAt + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.07);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(bus);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + 0.08);
};

const scheduleStep = (engine, startsAt) => {
  const step = engine.step % SIXTEENTH_STEPS;
  const bar = Math.floor(engine.step / SIXTEENTH_STEPS) % BAR_ROOTS.length;
  const root = BAR_ROOTS[bar];
  const intensity = engine.intensity;
  const density = engine.density;

  if (step % 4 === 0) {
    scheduleBass(engine, startsAt, root, 0.82 + intensity * 0.28);
  }
  if (step === 0 || step === 8) {
    scheduleKick(engine, startsAt, 0.78 + intensity * 0.35);
  }
  if (density >= 3 && (step === 6 || step === 14)) {
    scheduleKick(engine, startsAt, 0.45 + intensity * 0.2);
  }

  if (density >= 1 && step % 2 === 0) {
    scheduleHat(engine, startsAt, 0.55 + intensity * 0.45, step === 14);
  }
  if ((density >= 4 || engine.redCount > 0) && step % 2 === 1) {
    scheduleHat(engine, startsAt, 0.35 + intensity * 0.35);
  }

  const degree = ARPEGGIO[step];
  if (degree !== null && (density >= 1 || step === 0 || step === 8)) {
    schedulePluck(
      engine,
      startsAt,
      root * 2 * MINOR_RATIOS[degree],
      0.55 + intensity * 0.5,
    );
  }

  if (engine.redCount > 0 && step % 4 === 3) {
    scheduleTensionTick(engine, startsAt, step);
  }
};

const runScheduler = (engine) => {
  if (engine.stopped || !engine.active || engine.context.state !== "running") {
    engine.nextStepAt = engine.context.currentTime + 0.06;
    return;
  }

  const horizon = engine.context.currentTime + SCHEDULE_AHEAD_SECONDS;
  while (engine.nextStepAt < horizon) {
    engine.currentBpm += (engine.targetBpm - engine.currentBpm) * 0.08;
    scheduleStep(engine, engine.nextStepAt);
    engine.nextStepAt += 60 / engine.currentBpm / 4;
    engine.step += 1;
  }
};

const createEngine = (profile) => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error("unsupported");

  const context = new AudioContextClass();
  const bus = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const master = context.createGain();
  const droneFilter = context.createBiquadFilter();
  const droneGain = context.createGain();
  const droneA = context.createOscillator();
  const droneB = context.createOscillator();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();

  bus.gain.value = 1;
  compressor.threshold.value = -24;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.18;
  master.gain.value = 0;

  droneA.type = "triangle";
  droneA.frequency.value = 41.2;
  droneB.type = "sine";
  droneB.frequency.value = 61.74;
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 210;
  droneFilter.Q.value = 0.7;
  droneGain.gain.value = 0.006;
  lfo.type = "sine";
  lfo.frequency.value = 0.11;
  lfoGain.gain.value = 0.0018;

  droneA.connect(droneFilter);
  droneB.connect(droneFilter);
  droneFilter.connect(droneGain);
  lfo.connect(lfoGain);
  lfoGain.connect(droneGain.gain);
  droneGain.connect(bus);
  bus.connect(compressor);
  compressor.connect(master);
  master.connect(context.destination);

  const startsAt = context.currentTime + 0.03;
  droneA.start(startsAt);
  droneB.start(startsAt);
  lfo.start(startsAt);

  const engine = {
    context,
    bus,
    master,
    droneFilter,
    droneGain,
    persistentSources: [droneA, droneB, lfo],
    noiseBuffer: createNoiseBuffer(context),
    timer: null,
    stopped: false,
    active: false,
    step: 0,
    nextStepAt: startsAt + 0.05,
    currentBpm: profile.bpm,
    targetBpm: profile.bpm,
    intensity: profile.intensity,
    density: profile.density,
    redCount: profile.redCount,
  };
  engine.timer = window.setInterval(
    () => runScheduler(engine),
    SCHEDULER_INTERVAL_MS,
  );
  return engine;
};

const updateEngine = (engine, profile) => {
  if (!engine || engine.stopped) return;
  engine.targetBpm = profile.bpm;
  engine.intensity = profile.intensity;
  engine.density = profile.density;
  engine.redCount = profile.redCount;
  const now = engine.context.currentTime;
  engine.droneFilter.frequency.setTargetAtTime(
    175 + profile.intensity * 260,
    now,
    0.28,
  );
  engine.droneGain.gain.setTargetAtTime(
    0.0045 + profile.intensity * 0.006,
    now,
    0.32,
  );
};

const setEngineActive = (engine, active) => {
  if (!engine || engine.stopped) return;
  engine.active = active;
  const now = engine.context.currentTime;
  engine.master.gain.cancelScheduledValues(now);
  engine.master.gain.setValueAtTime(engine.master.gain.value, now);
  if (active) {
    engine.nextStepAt = Math.max(engine.nextStepAt, now + 0.05);
    const target = 0.43 + engine.intensity * 0.04;
    engine.master.gain.linearRampToValueAtTime(target, now + 0.7);
  } else {
    engine.master.gain.linearRampToValueAtTime(0, now + 0.25);
  }
};

const stopEngine = (engine) => {
  if (!engine || engine.stopped) return;
  engine.stopped = true;
  engine.active = false;
  window.clearInterval(engine.timer);
  const now = engine.context.currentTime;
  engine.master.gain.cancelScheduledValues(now);
  engine.master.gain.setValueAtTime(engine.master.gain.value, now);
  engine.master.gain.linearRampToValueAtTime(0, now + MASTER_FADE_SECONDS);
  engine.persistentSources.forEach((source) => {
    try {
      source.stop(now + MASTER_FADE_SECONDS + 0.05);
    } catch {
      // 既に停止している場合は何もしない。
    }
  });
  window.setTimeout(
    () => engine.context.close().catch(() => {}),
    (MASTER_FADE_SECONDS + 0.15) * 1000,
  );
};

export function useGameplayBgm({ phase, profile }) {
  const engineRef = useRef(null);
  const phaseRef = useRef(phase);
  const profileRef = useRef(profile);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  phaseRef.current = phase;
  profileRef.current = profile;

  const start = useCallback(() => {
    if (engineRef.current && !engineRef.current.stopped) {
      engineRef.current.context.resume().catch(() => {});
      setPlaying(true);
      return;
    }
    try {
      const engine = createEngine(profileRef.current);
      engineRef.current = engine;
      updateEngine(engine, profileRef.current);
      engine.context.resume().catch(() => {});
      setEngineActive(engine, phaseRef.current === "play");
      setError("");
      setPlaying(true);
    } catch {
      setError("プレイ中BGMを開始できませんでした。");
      setPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (engineRef.current) {
      stopEngine(engineRef.current);
      engineRef.current = null;
      setPlaying(false);
      return;
    }
    start();
  }, [start]);

  const resume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.context.resume().catch(() => {});
    } else {
      start();
    }
  }, [start]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    updateEngine(engine, profile);
    if (phase === "play") {
      engine.context.resume().catch(() => {});
      setEngineActive(engine, true);
    } else if (phase === "paused") {
      setEngineActive(engine, false);
    } else {
      stopEngine(engine);
      engineRef.current = null;
      setPlaying(false);
    }
  }, [
    phase,
    profile.bpm,
    profile.intensity,
    profile.density,
    profile.redCount,
  ]);

  useEffect(() => () => {
    stopEngine(engineRef.current);
    engineRef.current = null;
  }, []);

  return { playing, error, start, toggle, resume };
}
