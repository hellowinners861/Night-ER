const LEVEL_IDS = new Set(["student", "doctor"]);
const HOSPITAL_IDS = new Set(["secondary", "tertiary", "secret"]);
const MODE_IDS = new Set(["short", "full"]);
const MAX_NAME_LENGTH = 12;
const MAX_SUBMISSIONS_PER_HOUR = 5;

const json = (body, status = 200, cacheControl = "no-store") => new Response(
  JSON.stringify(body),
  {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  },
);

const getCategory = (source) => {
  const levelId = String(source.get?.("levelId") ?? source.levelId ?? "");
  const hospitalId = String(source.get?.("hospitalId") ?? source.hospitalId ?? "");
  const modeId = String(source.get?.("modeId") ?? source.modeId ?? "");
  if (!LEVEL_IDS.has(levelId) || !HOSPITAL_IDS.has(hospitalId) || !MODE_IDS.has(modeId)) {
    return null;
  }
  return { levelId, hospitalId, modeId };
};

const cleanPlayerName = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFKC").replace(/\s+/gu, " ").trim();
  const length = Array.from(normalized).length;
  if (length < 1 || length > MAX_NAME_LENGTH || /[\p{Cc}\p{Cf}]/u.test(normalized)) {
    return null;
  }
  return normalized;
};

const integerInRange = (value, min, max) => (
  Number.isInteger(value) && value >= min && value <= max
);

const hashIp = async (ip, salt) => {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const readMetrics = (body) => {
  const fields = ["praise", "bad", "treated", "refused", "crashed", "wrongs", "picks"];
  const metrics = Object.fromEntries(fields.map((field) => [field, body[field]]));
  if (
    !integerInRange(metrics.praise, 0, 5000)
    || !integerInRange(metrics.bad, 0, 5000)
    || !integerInRange(metrics.treated, 0, 1000)
    || !integerInRange(metrics.refused, 0, 1000)
    || !integerInRange(metrics.crashed, 0, 1000)
    || !integerInRange(metrics.wrongs, 0, 5000)
    || !integerInRange(metrics.picks, 0, 5000)
    || metrics.wrongs > metrics.picks
    || metrics.bad !== metrics.refused + metrics.crashed * 2
    || (metrics.treated === 0 && metrics.praise !== 0)
    || metrics.praise > metrics.treated * 5
  ) {
    return null;
  }
  const score = metrics.praise - metrics.bad;
  const accuracy = metrics.picks > 0
    ? Math.round(((metrics.picks - metrics.wrongs) / metrics.picks) * 100)
    : 0;
  return { ...metrics, score, accuracy };
};

const listRankings = async (db, category, limit = 10) => {
  const query = `
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY score DESC, praise DESC, bad ASC, accuracy DESC, treated DESC, created_at ASC
      ) AS rank,
      id,
      player_name AS playerName,
      score,
      praise,
      bad,
      treated,
      accuracy,
      created_at AS createdAt
    FROM leaderboard_entries
    WHERE level_id = ? AND hospital_id = ? AND mode_id = ?
    ORDER BY score DESC, praise DESC, bad ASC, accuracy DESC, treated DESC, created_at ASC
    LIMIT ?
  `;
  const result = await db.prepare(query)
    .bind(category.levelId, category.hospitalId, category.modeId, limit)
    .all();
  return result.results ?? [];
};

const handleGet = async (context) => {
  if (!context.env.DB) {
    return json({ error: "ランキングDBが設定されていません。" }, 503);
  }
  const url = new URL(context.request.url);
  const category = getCategory(url.searchParams);
  if (!category) {
    return json({ error: "ランキング区分が正しくありません。" }, 400);
  }
  const requestedLimit = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(50, Math.max(1, requestedLimit))
    : 10;
  const entries = await listRankings(context.env.DB, category, limit);
  return json({ category, entries }, 200, "public, max-age=30");
};

const handlePost = async (context) => {
  const { request, env } = context;
  if (!env.DB || !env.RANKING_SALT) {
    return json({ error: "ランキングのサーバー設定が完了していません。" }, 503);
  }
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return json({ error: "この送信元からは登録できません。" }, 403);
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "JSON形式で送信してください。" }, 415);
  }
  const contentLength = Number.parseInt(request.headers.get("Content-Length") ?? "0", 10);
  if (contentLength > 8192) {
    return json({ error: "送信データが大きすぎます。" }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "送信データを読み取れませんでした。" }, 400);
  }

  const category = getCategory(body);
  const playerName = cleanPlayerName(body.playerName);
  const metrics = readMetrics(body);
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";
  if (
    !category
    || !playerName
    || !metrics
    || !/^[A-Za-z0-9_-]{12,64}$/.test(submissionId)
    || body.fired === true
  ) {
    return json({ error: "ランキングへ登録できない成績です。" }, 422);
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const ipHash = await hashIp(ip, env.RANKING_SALT);
  const recent = await env.DB.prepare(`
    SELECT COUNT(*) AS count
    FROM leaderboard_entries
    WHERE ip_hash = ? AND created_at >= unixepoch() - 3600
  `).bind(ipHash).first();
  if ((recent?.count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) {
    return json({ error: "送信回数が多すぎます。時間をおいてお試しください。" }, 429);
  }

  try {
    const inserted = await env.DB.prepare(`
      INSERT INTO leaderboard_entries (
        submission_id,
        player_name,
        level_id,
        hospital_id,
        mode_id,
        score,
        praise,
        bad,
        treated,
        accuracy,
        refused,
        crashed,
        wrongs,
        picks,
        ip_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      submissionId,
      playerName,
      category.levelId,
      category.hospitalId,
      category.modeId,
      metrics.score,
      metrics.praise,
      metrics.bad,
      metrics.treated,
      metrics.accuracy,
      metrics.refused,
      metrics.crashed,
      metrics.wrongs,
      metrics.picks,
      ipHash,
    ).run();

    return json({
      ok: true,
      entryId: inserted?.meta?.last_row_id ?? null,
      score: metrics.score,
      entries: await listRankings(env.DB, category, 10),
    }, 201);
  } catch (error) {
    if (String(error?.message ?? error).includes("UNIQUE constraint failed")) {
      return json({ error: "この成績はすでに登録されています。" }, 409);
    }
    console.error("ranking insert failed", error);
    return json({ error: "ランキング登録に失敗しました。" }, 500);
  }
};

export async function onRequest(context) {
  try {
    if (context.request.method === "GET") return await handleGet(context);
    if (context.request.method === "POST") return await handlePost(context);
    return json({ error: "許可されていない操作です。" }, 405);
  } catch (error) {
    console.error("ranking request failed", error);
    return json({ error: "ランキングを読み込めませんでした。" }, 500);
  }
}
