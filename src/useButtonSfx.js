import { useCallback } from "react";

const MENU_DECISION_URL = `${import.meta.env.BASE_URL}audio/decision-51.mp3`;
const GAME_CHOICE_URL = `${import.meta.env.BASE_URL}audio/decision-53.mp3`;
const PATIENT_WARNING_URL = `${import.meta.env.BASE_URL}audio/warning-red.mp3`;
const ICU_WARNING_URL = `${import.meta.env.BASE_URL}audio/warning-icu.mp3`;
const GOOD_DOCTOR_URL = `${import.meta.env.BASE_URL}audio/success-good-doctor.mp3`;

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

  const playPatientWarning = useCallback(() => {
    playOneShot(PATIENT_WARNING_URL, 1);
  }, []);

  const playIcuWarning = useCallback(() => {
    playOneShot(ICU_WARNING_URL, 1);
  }, []);

  const playGoodDoctor = useCallback(() => {
    playOneShot(GOOD_DOCTOR_URL, 1);
  }, []);

  return {
    playMenuDecision,
    playGameChoice,
    playPatientWarning,
    playIcuWarning,
    playGoodDoctor,
  };
}
