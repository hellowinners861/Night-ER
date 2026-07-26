import { useCallback, useEffect, useRef, useState } from "react";

const LOOP_SECONDS = 32;
const CHORD_SECONDS = 8;
const CROSSFADE_SECONDS = 2;
const PIANO_RELEASE_SECONDS = 5;
const MONITOR_GAIN = 0.11;

// D minorを中心に、夜の救急外来をイメージしたオリジナル進行。
const CHORDS = [
  [146.83, 174.61, 220.0, 329.63], // Dm(add9)
  [116.54, 146.83, 174.61, 220.0], // Bbmaj7
  [87.31, 110.0, 130.81, 164.81], // Fmaj7
  [130.81, 164.81, 196.0, 293.66], // C(add9)
];

// 心電図音は60 BPM。各ビープが収まる0.38秒後にピアノを置く。
const PIANO_NOTES = [
  [1.38, 293.66, 0.9],
  [3.38, 440.0, 0.68],
  [5.38, 349.23, 0.78],
  [7.38, 329.63, 0.62],
  [9.38, 233.08, 0.84],
  [11.38, 349.23, 0.66],
  [13.38, 440.0, 0.76],
  [15.38, 293.66, 0.6],
  [17.38, 349.23, 0.86],
  [19.38, 523.25, 0.67],
  [21.38, 440.0, 0.76],
  [23.38, 329.63, 0.58],
  [25.38, 261.63, 0.82],
  [27.38, 392.0, 0.66],
  [29.38, 587.33, 0.72],
  [31.38, 329.63, 0.56],
];

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smoothstep = (value) => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};
const loopSafeFrequency = (frequency) => (
  Math.round(frequency * LOOP_SECONDS) / LOOP_SECONDS
);

const chordTone = (notes, time) => {
  let value = 0;
  for (const rawFrequency of notes) {
    const frequency = loopSafeFrequency(rawFrequency);
    value += Math.sin(2 * Math.PI * frequency * time);
    value += 0.16 * Math.sin(4 * Math.PI * frequency * time + 0.35);
  }
  return value / notes.length;
};

const addPiano = (samples, sampleRate) => {
  const frameCount = samples.length;
  const releaseFrames = Math.floor(PIANO_RELEASE_SECONDS * sampleRate);

  for (const [startsAt, frequency, velocity] of PIANO_NOTES) {
    const startFrame = Math.floor(startsAt * sampleRate);
    for (let offset = 0; offset < releaseFrames; offset += 1) {
      const age = offset / sampleRate;
      const attack = smoothstep(age / 0.012);
      const envelope = attack * (
        0.94 * Math.exp(-1.55 * age)
        + 0.06 * Math.exp(-0.52 * age)
      );
      const body = (
        0.76 * Math.sin(2 * Math.PI * frequency * age)
        + 0.18 * Math.sin(2 * Math.PI * frequency * 2.01 * age + 0.18)
        + 0.06 * Math.sin(2 * Math.PI * frequency * 3.98 * age + 0.42)
      );
      const target = (startFrame + offset) % frameCount;
      samples[target] += 0.035 * velocity * envelope * body;
    }
  }
};

export const synthesizeTitleBgm = (sampleRate) => {
  const frameCount = Math.floor(sampleRate * LOOP_SECONDS);
  const samples = new Float32Array(frameCount);

  for (let index = 0; index < frameCount; index += 1) {
    const time = index / sampleRate;
    const chordIndex = Math.floor(time / CHORD_SECONDS) % CHORDS.length;
    const nextChordIndex = (chordIndex + 1) % CHORDS.length;
    const chordTime = time % CHORD_SECONDS;
    const crossfade = smoothstep(
      (chordTime - (CHORD_SECONDS - CROSSFADE_SECONDS)) / CROSSFADE_SECONDS,
    );
    const currentWeight = Math.cos(crossfade * Math.PI * 0.5);
    const nextWeight = Math.sin(crossfade * Math.PI * 0.5);
    const pad = (
      chordTone(CHORDS[chordIndex], time) * currentWeight
      + chordTone(CHORDS[nextChordIndex], time) * nextWeight
    );
    const drone = (
      Math.sin(2 * Math.PI * loopSafeFrequency(73.42) * time)
      + 0.45 * Math.sin(2 * Math.PI * loopSafeFrequency(110) * time)
    );
    const breathing = 0.88 + 0.12 * Math.sin(2 * Math.PI * 0.125 * time - Math.PI / 2);

    samples[index] = (
      0.092 * pad * breathing
      + 0.015 * drone
    );
  }

  addPiano(samples, sampleRate);
  return samples;
};

const stopEngine = (engine, fadeSeconds = 0.45) => {
  if (!engine || engine.stopped) return;
  engine.stopped = true;
  const { context, gain, sources } = engine;
  const now = context.currentTime;
  if (typeof gain.gain.cancelAndHoldAtTime === "function") {
    gain.gain.cancelAndHoldAtTime(now);
  } else {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
  }
  gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
  sources.forEach((source) => {
    try {
      source.stop(now + fadeSeconds + 0.05);
    } catch {
      // 既に停止済みなら何もしない。
    }
  });
  window.setTimeout(() => context.close().catch(() => {}), (fadeSeconds + 0.15) * 1000);
};

export function useTitleBgm() {
  const engineRef = useRef(null);
  const startingRef = useRef(false);
  const requestRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = useCallback(async () => {
    if (engineRef.current) {
      requestRef.current += 1;
      stopEngine(engineRef.current);
      engineRef.current = null;
      setPlaying(false);
      return;
    }
    if (startingRef.current) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setError("このブラウザではBGMを再生できません。");
      return;
    }

    startingRef.current = true;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    let context = null;
    try {
      context = new AudioContextClass();
      await context.resume();

      const samples = synthesizeTitleBgm(context.sampleRate);
      const buffer = context.createBuffer(1, samples.length, context.sampleRate);
      buffer.copyToChannel(samples, 0);

      const monitorResponse = await fetch(
        `${import.meta.env.BASE_URL}audio/ecg-monitor.mp3`,
      );
      if (!monitorResponse.ok) throw new Error("monitor-audio");
      const monitorBuffer = await context.decodeAudioData(
        await monitorResponse.arrayBuffer(),
      );

      if (requestRef.current !== requestId) {
        context.close().catch(() => {});
        return;
      }

      const musicSource = context.createBufferSource();
      const monitorSource = context.createBufferSource();
      const musicFilter = context.createBiquadFilter();
      const monitorFilter = context.createBiquadFilter();
      const monitorGain = context.createGain();
      const compressor = context.createDynamicsCompressor();
      const gain = context.createGain();

      musicSource.buffer = buffer;
      musicSource.loop = true;
      monitorSource.buffer = monitorBuffer;
      monitorSource.loop = true;
      musicFilter.type = "lowpass";
      musicFilter.frequency.value = 2600;
      musicFilter.Q.value = 0.4;
      monitorFilter.type = "highpass";
      monitorFilter.frequency.value = 360;
      monitorFilter.Q.value = 0.45;
      monitorGain.gain.value = MONITOR_GAIN;
      compressor.threshold.value = -22;
      compressor.knee.value = 10;
      compressor.ratio.value = 2.5;
      compressor.attack.value = 0.012;
      compressor.release.value = 0.22;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.7, context.currentTime + 1.4);

      musicSource.connect(musicFilter);
      musicFilter.connect(compressor);
      monitorSource.connect(monitorFilter);
      monitorFilter.connect(monitorGain);
      monitorGain.connect(compressor);
      compressor.connect(gain);
      gain.connect(context.destination);

      const startsAt = context.currentTime + 0.05;
      musicSource.start(startsAt);
      monitorSource.start(startsAt);
      engineRef.current = {
        context,
        gain,
        sources: [musicSource, monitorSource],
        stopped: false,
      };
      setError("");
      setPlaying(true);
    } catch {
      if (context && context.state !== "closed") context.close().catch(() => {});
      setError("BGMを開始できませんでした。もう一度お試しください。");
    } finally {
      startingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => () => {
    requestRef.current += 1;
    stopEngine(engineRef.current, 0.3);
    engineRef.current = null;
  }, []);

  return { playing, loading, error, toggle };
}
