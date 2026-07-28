// A small, self-contained controller for the occasional "panic rush" shift event.

const rush = (title, icon, warning, start, roster, styles) => ({
  title,
  icon,
  warning,
  start,
  audio: { warning: null, start: null },
  styles,
  roster,
  // Kept as an easy-to-consume alias for callers that only need diagnosis weights.
  dxWeights: roster,
});

export const PANIC_RUSH_CONFIGS = {
  drunk: rush("酔っ払いラッシュ", "🍶", "今日は金曜じゃなぁ", "酔っ払いラッシュじゃ！ 意識障害・嘔吐・転倒外傷が続くぞい！", [
    { dx: "振戦せん妄", weight: 6 }, { dx: "急性アルコール中毒", weight: 6 },
    { dx: "急性膵炎", weight: 4 }, { dx: "急性痛風発作", weight: 2 },
    { dx: "誤嚥性肺炎", weight: 3 }, { dx: "ベンゾジアゼピン中毒", weight: 2 },
    { dx: "マロリーワイス症候群", weight: 4 }, { dx: "特発性食道破裂", weight: 2 },
    { dx: "急性硬膜下血腫", weight: 3 }, { dx: "大腿骨近位部骨折", weight: 2 },
    { dx: "単純皮膚裂創", weight: 4 }, { dx: "足関節捻挫", weight: 3 },
    { dx: "爪下血腫", weight: 2 }, { dx: "足趾末節骨折", weight: 2 },
    { dx: "自然整復後膝蓋骨脱臼", weight: 2 }, { dx: "外傷性爪甲剥離", weight: 2 },
  ], { accent: "amber", className: "border-amber-500 bg-amber-950" }),
  traffic: rush("交通事故ラッシュ", "🚑", "近くで大きな衝突音がしたのぉ", "交通事故ラッシュじゃ！ 高エネルギー外傷を受け入れるぞい！", [
    { dx: "高エネルギー多発外傷", weight: 6 }, { dx: "不安定型骨盤輪骨折", weight: 4 },
    { dx: "鈍的胸部大動脈損傷", weight: 3 }, { dx: "大量血胸", weight: 3 },
    { dx: "開放性気胸", weight: 3 }, { dx: "重症肺挫傷", weight: 3 },
    { dx: "外傷性心停止", weight: 2 }, { dx: "重症肝損傷", weight: 3 },
    { dx: "脾破裂", weight: 3 }, { dx: "クラッシュ症候群", weight: 3 },
    { dx: "Gustilo III開放骨折", weight: 3 }, { dx: "びまん性軸索損傷", weight: 3 },
    { dx: "緊張性気胸", weight: 4 }, { dx: "心タンポナーデ", weight: 3 },
    { dx: "急性硬膜外血腫", weight: 3 }, { dx: "大腿骨近位部骨折", weight: 3 },
    { dx: "単純皮膚裂創", weight: 3 }, { dx: "足関節捻挫", weight: 3 },
    { dx: "爪下血腫", weight: 2 }, { dx: "足趾末節骨折", weight: 2 },
    { dx: "自然整復後膝蓋骨脱臼", weight: 2 }, { dx: "外傷性爪甲剥離", weight: 2 },
    { dx: "皮下異物", weight: 2 },
  ], { accent: "rose", className: "border-rose-500 bg-rose-950" }),
  festival: rush("お祭りラッシュ", "🏮", "今日はお祭りじゃったな", "お祭りラッシュじゃ！ 熱中症・脱水・転倒が続くぞい！", [
    { dx: "重症熱中症", weight: 6 }, { dx: "乳幼児急性胃腸炎による脱水", weight: 4 },
    { dx: "感染性腸炎", weight: 3 }, { dx: "アナフィラキシーショック", weight: 2 },
    { dx: "急性蕁麻疹", weight: 2 }, { dx: "急性アルコール中毒", weight: 5 },
    { dx: "大腿骨近位部骨折", weight: 2 }, { dx: "過換気症候群", weight: 2 },
    { dx: "アニサキス症", weight: 2 }, { dx: "急性硬膜下血腫", weight: 2 },
    { dx: "急性コンパートメント症候群", weight: 2 }, { dx: "軽症日焼け", weight: 4 },
    { dx: "虫刺症局所反応", weight: 2 }, { dx: "単純皮膚裂創", weight: 3 },
    { dx: "足関節捻挫", weight: 3 }, { dx: "足趾末節骨折", weight: 2 },
    { dx: "自然整復後膝蓋骨脱臼", weight: 2 }, { dx: "外傷性爪甲剥離", weight: 2 },
    { dx: "皮下異物", weight: 2 },
  ], { accent: "fuchsia", className: "border-fuchsia-500 bg-fuchsia-950" }),
  stadium: rush("スタジアムラッシュ", "🏟️", "今日の試合、観たかったのぉ", "スタジアムラッシュじゃ！ 酔客・熱中症・転倒が一気に来るぞい！", [
    { dx: "重症熱中症", weight: 5 }, { dx: "急性心筋梗塞", weight: 2 },
    { dx: "気管支喘息発作", weight: 2 }, { dx: "急性硬膜外血腫", weight: 2 },
    { dx: "血管迷走神経反射", weight: 3 }, { dx: "起立性低血圧", weight: 2 },
    { dx: "非ST上昇型急性冠症候群", weight: 2 }, { dx: "急性硬膜下血腫", weight: 2 },
    { dx: "急性コンパートメント症候群", weight: 2 }, { dx: "高エネルギー多発外傷", weight: 2 },
    { dx: "急性アルコール中毒", weight: 5 }, { dx: "発作性上室頻拍", weight: 2 },
    { dx: "過換気症候群", weight: 3 }, { dx: "大腿骨近位部骨折", weight: 2 },
    { dx: "足関節捻挫", weight: 4 }, { dx: "単純皮膚裂創", weight: 3 },
    { dx: "軽症日焼け", weight: 3 }, { dx: "足趾末節骨折", weight: 2 },
    { dx: "自然整復後膝蓋骨脱臼", weight: 2 }, { dx: "急性非特異的腰痛", weight: 2 },
  ], { accent: "sky", className: "border-sky-500 bg-sky-950" }),
  fire: rush("火災ラッシュ", "🔥", "近くで煙が上がっとるのぉ", "火災ラッシュじゃ！ 熱傷と煙吸入の患者さんが次々に来るぞい！", [
    { dx: "重症気道熱傷", weight: 6 }, { dx: "シアン化物中毒", weight: 5 },
    { dx: "高電圧電撃傷", weight: 3 }, { dx: "一酸化炭素中毒", weight: 6 },
    { dx: "気管支喘息発作", weight: 2 }, { dx: "急性気管支炎", weight: 2 },
    { dx: "表在性熱傷", weight: 4 }, { dx: "角膜擦過傷", weight: 2 },
  ], { accent: "orange", className: "border-orange-500 bg-orange-950" }),
  food: rush("集団食中毒ラッシュ", "🍽️", "近くで大きな宴会があったのぉ", "集団食中毒ラッシュじゃ！ 嘔吐・下痢・脱水の患者さんが続くぞい！", [
    { dx: "感染性腸炎", weight: 6 }, { dx: "乳幼児急性胃腸炎による脱水", weight: 5 },
    { dx: "急性A型肝炎", weight: 3 }, { dx: "アナフィラキシーショック", weight: 2 },
    { dx: "急性蕁麻疹", weight: 2 }, { dx: "急性肝不全", weight: 2 },
    { dx: "敗血症性ショック", weight: 2 }, { dx: "アニサキス症", weight: 5 },
    { dx: "マロリーワイス症候群", weight: 3 }, { dx: "特発性食道破裂", weight: 2 },
    { dx: "中毒性巨大結腸症", weight: 2 },
  ], { accent: "lime", className: "border-lime-500 bg-lime-950" }),
};

const RUSH_TYPES = Object.keys(PANIC_RUSH_CONFIGS);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function createPanicRush(shiftSec, rng = Math.random) {
  const roll = rng();
  const typeIndex = Math.floor(roll * 10);
  if (typeIndex < 0 || typeIndex >= RUSH_TYPES.length) return null;

  const rawStart = shiftSec * (0.3 + rng() * 0.4);
  const minStart = Math.ceil((shiftSec * 0.3) / 3) * 3;
  const maxStart = Math.floor((shiftSec * 0.7) / 3) * 3;
  const startsAt = clamp(Math.round(rawStart / 3) * 3, minStart, maxStart);
  return {
    type: RUSH_TYPES[typeIndex],
    startsAt,
    warningAt: startsAt - 3600,
    endsAt: startsAt + 3600,
    status: "scheduled",
    warningFired: false,
    startFired: false,
    activated: false,
    completed: false,
    recentCaseIdxs: [],
    themedDraws: 0,
    totalDraws: 0,
  };
}

export function advancePanicRush(rushState, t) {
  if (!rushState) return { rush: rushState, cutin: null, logMessage: null };
  const config = PANIC_RUSH_CONFIGS[rushState.type];
  if (!config) return { rush: rushState, cutin: null, logMessage: null };
  const next = { ...rushState };

  if (!next.warningFired && t >= next.warningAt) {
    next.warningFired = true;
    return {
      rush: next,
      cutin: { kind: "warning", text: config.warning, until: t + 90, key: `${next.type}-warning` },
      logMessage: `⚠️ ${config.warning}`,
    };
  }
  if (!next.startFired && t >= next.startsAt) {
    next.startFired = true;
    next.activated = true;
    next.status = "active";
    return {
      rush: next,
      cutin: { kind: "start", text: config.start, until: t + 90, key: `${next.type}-start` },
      logMessage: `🚨 ${config.start}`,
    };
  }
  if (!next.completed && t >= next.endsAt) {
    next.completed = true;
    next.activated = false;
    next.status = "completed";
    return { rush: next, cutin: null, logMessage: `${config.title}が落ち着いた。` };
  }
  return { rush: next, cutin: null, logMessage: null };
}

const caseBucket = (caseData) => (caseData?.minor ? "minor" : caseData?.careLevel);

const matchesHospitalMix = (caseData, normalCase, hospitalId) => (
  hospitalId === "secret"
  || !normalCase
  || caseBucket(caseData) === caseBucket(normalCase)
);

export function drawPanicCase({ rush: rushState, cases, hospitalId, normalCaseIdx, excludedCaseIdxs = [], rng = Math.random }) {
  if (!rushState?.activated || rushState.completed || rng() >= 0.8) {
    const updatedRush = rushState?.activated && !rushState.completed
      ? { ...rushState, totalDraws: (rushState.totalDraws || 0) + 1 }
      : rushState;
    return { idx: normalCaseIdx, updatedRush, themed: false };
  }
  const config = PANIC_RUSH_CONFIGS[rushState.type];
  if (!config || !Array.isArray(cases)) return { idx: normalCaseIdx, updatedRush: rushState, themed: false };
  const excluded = new Set(excludedCaseIdxs);
  const recent = new Set(rushState.recentCaseIdxs || []);
  const roster = new Map(config.roster.map(({ dx, weight }) => [dx, weight]));
  const normalCase = cases[normalCaseIdx];
  let candidates = cases.map((caseData, idx) => ({ idx, caseData, base: roster.get(caseData?.dx) || 0 }))
    .filter((item) => (
      item.base > 0
      && matchesHospitalMix(item.caseData, normalCase, hospitalId)
      && !excluded.has(item.idx)
      && !recent.has(item.idx)
    ));
  if (!candidates.length) candidates = cases.map((caseData, idx) => ({ idx, caseData, base: roster.get(caseData?.dx) || 0 }))
    .filter((item) => (
      item.base > 0
      && matchesHospitalMix(item.caseData, normalCase, hospitalId)
      && !excluded.has(item.idx)
    ));
  if (!candidates.length) {
    return {
      idx: normalCaseIdx,
      updatedRush: { ...rushState, totalDraws: (rushState.totalDraws || 0) + 1 },
      themed: false,
    };
  }

  const total = candidates.reduce((sum, item) => sum + item.base, 0);
  let cursor = rng() * total;
  let chosen = candidates[candidates.length - 1];
  for (const item of candidates) {
    cursor -= item.base;
    if (cursor < 0) { chosen = item; break; }
  }
  const recentCaseIdxs = [...(rushState.recentCaseIdxs || []), chosen.idx].slice(-6);
  return {
    idx: chosen.idx,
    updatedRush: { ...rushState, recentCaseIdxs, themedDraws: (rushState.themedDraws || 0) + 1, totalDraws: (rushState.totalDraws || 0) + 1 },
    themed: true,
  };
}

export function getRushSpawnDelay(hospitalId, rng = Math.random) {
  return hospitalId === "secret" ? 45 + Math.floor(rng() * 45) : 240 + Math.floor(rng() * 180);
}

export function getRushRemainingRealSeconds(rushState, t) {
  if (!rushState) return 0;
  return Math.max(0, Math.ceil((rushState.endsAt - t) / 30));
}
