CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL UNIQUE,
  player_name TEXT NOT NULL,
  level_id TEXT NOT NULL CHECK (level_id IN ('student', 'doctor')),
  hospital_id TEXT NOT NULL CHECK (hospital_id IN ('secondary', 'tertiary', 'secret')),
  mode_id TEXT NOT NULL CHECK (mode_id IN ('short', 'full')),
  score INTEGER NOT NULL,
  praise INTEGER NOT NULL,
  bad INTEGER NOT NULL,
  treated INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  refused INTEGER NOT NULL,
  crashed INTEGER NOT NULL,
  wrongs INTEGER NOT NULL,
  picks INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS leaderboard_category_rank_idx
  ON leaderboard_entries (
    level_id,
    hospital_id,
    mode_id,
    score DESC,
    praise DESC,
    bad ASC,
    accuracy DESC,
    treated DESC,
    created_at ASC
  );

CREATE INDEX IF NOT EXISTS leaderboard_rate_limit_idx
  ON leaderboard_entries (ip_hash, created_at DESC);
