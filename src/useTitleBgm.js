import { useCallback, useEffect, useRef, useState } from "react";

const LOOP_SECONDS = 32;
const CHORD_SECONDS = 8;
const CROSSFADE_SECONDS = 2;

// D minorを中心に、夜の救急外来をイメージしたオリジナル進行。
const CHORDS = [
  [146.83, 174.61, 220.0, 329.63], // Dm(add9)
  [116.54, 146.83, 174.61, 220.0], // Bbmaj7
  [87.31, 110.0, 130.81, 164.81], // Fmaj7
  [130.81, 164.81, 196.0, 293.66], // C(add9)
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

const softPulse = (time) => {
  const beat = time % 2;
  const hit = (age, frequency, decay) => (
    age >= 0 && age < 0.32
      ? Math.sin(2 * Math.PI * loopSafeFrequency(frequency) * age) * Math.exp(-decay * age)
      : 0
  );
  return hit(beat, 92, 17) + 0.62 * hit(beat - 0.27, 118, 21);
};

const distantMonitor = (time) => {
  const position = (time + 4.5) % 8;
  if (position > 0.7) return 0;
  const envelope = Math.exp(-5.8 * position);
  return (
    Math.sin(2 * Math.PI * loopSafeFrequency(659.25) * position)
    + 0.28 * Math.sin(2 * Math.PI * loopSafeFrequency(988.88) * position)
  ) * envelope;
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
      0.105 * pad * breathing
      + 0.018 * drone
      + 0.032 * softPulse(time)
      + 0.018 * distantMonitor(time)
    );
  }

  return samples;
};

const stopEngine = (engine, fadeSeconds = 0.45) => {
  if (!engine || engine.stopped) return;
  engine.stopped = true;
  const { context, gain, source } = engine;
  const now = context.currentTime;
  if (typeof gain.gain.cancelAndHoldAtTime === "function") {
    gain.gain.cancelAndHoldAtTime(now);
  } else {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
  }
  gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
  source.stop(now + fadeSeconds + 0.05);
  window.setTimeout(() => context.close().catch(() => {}), (fadeSeconds + 0.15) * 1000);
};

export function useTitleBgm() {
  const engineRef = useRef(null);
  const startingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  const toggle = useCallback(async () => {
    if (engineRef.current) {
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
    let context = null;
    try {
      context = new AudioContextClass();
      const samples = synthesizeTitleBgm(context.sampleRate);
      const buffer = context.createBuffer(1, samples.length, context.sampleRate);
      buffer.copyToChannel(samples, 0);

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "lowpass";
      filter.frequency.value = 1900;
      filter.Q.value = 0.45;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.62, context.currentTime + 1.4);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      await context.resume();
      source.start();
      engineRef.current = { context, gain, source, stopped: false };
      setError("");
      setPlaying(true);
    } catch {
      if (context && context.state !== "closed") context.close().catch(() => {});
      setError("BGMを開始できませんでした。もう一度お試しください。");
    } finally {
      startingRef.current = false;
    }
  }, []);

  useEffect(() => () => {
    stopEngine(engineRef.current, 0.3);
    engineRef.current = null;
  }, []);

  return { playing, error, toggle };
}
