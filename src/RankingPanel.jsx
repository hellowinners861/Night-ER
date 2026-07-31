import { useEffect, useMemo, useState } from "react";
import {
  createSubmissionId,
  fetchRankings,
  isValidRankingName,
  loadRankingName,
  normalizeRankingName,
  saveRankingName,
  submitRanking,
} from "./ranking";

const formatScore = (score) => score > 0 ? `+${score}` : score === 0 ? "±0" : `${score}`;

export default function RankingPanel({ result }) {
  const [playerName, setPlayerName] = useState(
    () => result.playerName || loadRankingName(),
  );
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submittedId, setSubmittedId] = useState(null);
  const [submissionId] = useState(createSubmissionId);
  const category = useMemo(() => ({
    levelId: result.levelId,
    hospitalId: result.hospitalId,
    modeId: result.modeId,
  }), [result.levelId, result.hospitalId, result.modeId]);
  const normalizedName = normalizeRankingName(playerName);
  const validName = isValidRankingName(playerName);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchRankings(category, controller.signal)
      .then((data) => setEntries(data.entries ?? []))
      .catch((loadError) => {
        if (loadError.name !== "AbortError") {
          setError(loadError.message ?? "ランキングを読み込めませんでした。");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [category]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validName || result.fired || submitting || submittedId !== null) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const data = await submitRanking({
        submissionId,
        playerName: normalizedName,
        levelId: result.levelId,
        hospitalId: result.hospitalId,
        modeId: result.modeId,
        praise: result.praise,
        bad: result.bad,
        treated: result.treated,
        refused: result.refused,
        crashed: result.crashed,
        wrongs: result.wrongs,
        picks: result.picks,
        fired: result.fired,
      });
      saveRankingName(normalizedName);
      setPlayerName(normalizedName);
      setEntries(data.entries ?? []);
      setSubmittedId(data.entryId);
      setNotice(
        (data.entries ?? []).some((entry) => entry.id === data.entryId)
          ? "ランキングへ登録しました。"
          : "ランキングへ登録しました。現在はTOP10圏外です。",
      );
    } catch (submitError) {
      setError(submitError.message ?? "ランキングへ登録できませんでした。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-6 w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-800/70 bg-slate-900/85 shadow-2xl shadow-cyan-950/20">
      <div className="border-b border-slate-800 bg-gradient-to-r from-cyan-950/60 to-slate-900 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-black tracking-[0.22em] text-cyan-400">CLOUDFLARE RANKING</div>
            <h2 className="mt-1 text-base font-black text-slate-100">当直ランキング TOP 10</h2>
          </div>
          <div className="rounded-full border border-cyan-800 bg-cyan-950/50 px-2.5 py-1 text-[9px] font-bold text-cyan-300">
            同一条件
          </div>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{result.categoryLabel}</p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">ランキングを読み込み中…</div>
        ) : entries.length > 0 ? (
          <div className="space-y-1.5">
            {entries.map((entry) => {
              const highlighted = entry.id === submittedId;
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 rounded-xl border px-2.5 py-2 ${
                    highlighted
                      ? "border-emerald-500/70 bg-emerald-950/35"
                      : "border-slate-800 bg-slate-950/55"
                  }`}
                >
                  <div className={`font-mono text-sm font-black ${
                    entry.rank === 1
                      ? "text-amber-300"
                      : entry.rank <= 3
                        ? "text-sky-300"
                        : "text-slate-500"
                  }`}>
                    #{entry.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-black text-slate-200">{entry.playerName}</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">
                      正答率 {entry.accuracy}%・完遂 {entry.treated}件
                    </div>
                  </div>
                  <div className={`font-mono text-lg font-black ${entry.score < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {formatScore(entry.score)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : !error ? (
          <div className="rounded-xl border border-dashed border-slate-700 py-7 text-center">
            <div className="text-sm font-bold text-slate-400">まだ登録がありません</div>
            <div className="mt-1 text-[10px] text-slate-600">最初の当直記録を残しましょう。</div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-800 pt-4">
          <label htmlFor="ranking-player-name" className="text-[10px] font-black text-slate-400">
            ランキング名（12文字まで）
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="ranking-player-name"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              maxLength={24}
              autoComplete="nickname"
              placeholder="例：夜勤ドクター"
              disabled={result.fired || submitting || submittedId !== null}
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-700 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!validName || result.fired || submitting || submittedId !== null}
              className="shrink-0 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-cyan-500 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {submitting ? "送信中…" : submittedId !== null ? "登録済み" : "記録する"}
            </button>
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
            入力した名前とプレイ成績が公開されます。IPアドレスそのものは保存せず、送信制限用のハッシュだけを保持します。
          </p>
          {result.fired && (
            <p className="mt-2 text-[10px] font-bold text-amber-500">途中交代となった当直はランキング登録できません。</p>
          )}
          {error && <p role="alert" className="mt-2 text-[10px] font-bold text-rose-400">{error}</p>}
          {notice && <p role="status" className="mt-2 text-[10px] font-bold text-emerald-400">{notice}</p>}
        </form>
      </div>
    </section>
  );
}
