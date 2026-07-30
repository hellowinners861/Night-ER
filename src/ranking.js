const RANKING_NAME_KEY = "night-er-ranking-name-v1";
const RANKING_API_URL = `${import.meta.env.BASE_URL}api/rankings`;

class RankingApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "RankingApiError";
    this.status = status;
  }
}

const readResponse = async (response) => {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new RankingApiError(
      "ランキングAPIに接続できません。Cloudflare Pages版でご利用ください。",
      response.status,
    );
  }
  const body = await response.json();
  if (!response.ok) {
    throw new RankingApiError(body.error ?? "ランキング通信に失敗しました。", response.status);
  }
  return body;
};

export const loadRankingName = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(RANKING_NAME_KEY) ?? "";
  } catch {
    return "";
  }
};

export const saveRankingName = (name) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RANKING_NAME_KEY, name);
  } catch {
    // Ranking still works when storage is unavailable.
  }
};

export const createSubmissionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
};

export const fetchRankings = async ({ levelId, hospitalId, modeId }, signal) => {
  const params = new URLSearchParams({
    levelId,
    hospitalId,
    modeId,
    limit: "10",
  });
  const response = await fetch(`${RANKING_API_URL}?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  return readResponse(response);
};

export const submitRanking = async (payload) => {
  const response = await fetch(RANKING_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return readResponse(response);
};

export { RankingApiError };
