import { onRequest as handleRankings } from "../functions/api/rankings.js";

const notFound = () => new Response(
  JSON.stringify({ error: "APIが見つかりません。" }),
  {
    status: 404,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  },
);

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/rankings" || pathname === "/api/rankings/") {
      return handleRankings({ request, env });
    }

    if (pathname.startsWith("/api/")) {
      return notFound();
    }

    return env.ASSETS.fetch(request);
  },
};
