import assert from "node:assert/strict";
import { onRequest } from "../functions/api/rankings.js";

const category = {
  levelId: "student",
  hospitalId: "secondary",
  modeId: "short",
};

const rankedEntry = {
  rank: 1,
  id: 42,
  playerName: "夜勤ドクター",
  score: 17,
  praise: 20,
  bad: 3,
  treated: 10,
  accuracy: 80,
  createdAt: 1_800_000_000,
};

const makeDb = ({ recentCount = 0 } = {}) => ({
  prepare(sql) {
    return {
      bind() {
        return {
          async all() {
            assert.match(sql, /FROM leaderboard_entries/);
            return { results: [rankedEntry] };
          },
          async first() {
            if (sql.includes("COUNT(*)")) return { count: recentCount };
            throw new Error(`Unexpected first() query: ${sql}`);
          },
          async run() {
            assert.match(sql, /INSERT INTO leaderboard_entries/);
            return { meta: { last_row_id: 42 } };
          },
        };
      },
    };
  },
});

const callApi = async ({ method = "GET", body, db = makeDb(), url }) => {
  const requestUrl = url ?? `http://localhost/api/rankings?${new URLSearchParams(category)}`;
  const request = new Request(requestUrl, {
    method,
    headers: method === "POST"
      ? {
        "Content-Type": "application/json",
        Origin: "http://localhost",
        "CF-Connecting-IP": "203.0.113.10",
      }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return onRequest({
    request,
    env: {
      DB: db,
      RANKING_SALT: "ranking-smoke-test-secret",
    },
  });
};

const listResponse = await callApi({});
assert.equal(listResponse.status, 200);
assert.deepEqual((await listResponse.json()).entries, [rankedEntry]);

const invalidCategoryResponse = await callApi({
  url: "http://localhost/api/rankings?levelId=unknown&hospitalId=secondary&modeId=short",
});
assert.equal(invalidCategoryResponse.status, 400);

const validResult = {
  submissionId: "smoke_test_1234",
  playerName: " 夜勤ドクター ",
  ...category,
  praise: 20,
  bad: 3,
  treated: 10,
  refused: 1,
  crashed: 1,
  wrongs: 2,
  picks: 10,
  fired: false,
};

const submitResponse = await callApi({ method: "POST", body: validResult });
assert.equal(submitResponse.status, 201);
const submitBody = await submitResponse.json();
assert.equal(submitBody.entryId, 42);
assert.equal(submitBody.score, 17);

const inconsistentResponse = await callApi({
  method: "POST",
  body: { ...validResult, bad: 4 },
});
assert.equal(inconsistentResponse.status, 422);

const firedResponse = await callApi({
  method: "POST",
  body: { ...validResult, fired: true },
});
assert.equal(firedResponse.status, 422);

const limitedResponse = await callApi({
  method: "POST",
  body: validResult,
  db: makeDb({ recentCount: 5 }),
});
assert.equal(limitedResponse.status, 429);

console.log("ranking API smoke test passed");
