import { useCallback } from "react";

const MENU_DECISION_URL = `${import.meta.env.BASE_URL}audio/decision-51.mp3`;
const GAME_CHOICE_URL = `${import.meta.env.BASE_URL}audio/decision-53.mp3`;

const playOneShot = (source, volume) => {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play().catch(() => {
    // ブラウザ側で再生が拒否された場合も、ボタン操作自体は妨げない。
  });
};

export function useButtonSfx() {
  const playMenuDecision = useCallback(() => {
    playOneShot(MENU_DECISION_URL, 0.9);
  }, []);

  const playGameChoice = useCallback(() => {
    playOneShot(GAME_CHOICE_URL, 0.95);
  }, []);

  return { playMenuDecision, playGameChoice };
}
