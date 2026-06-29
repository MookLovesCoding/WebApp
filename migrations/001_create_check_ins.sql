CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  created_at timestamptz NOT NULL,
  focus_level smallint NOT NULL CHECK (focus_level BETWEEN 1 AND 5),
  energy_level smallint NOT NULL CHECK (energy_level BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS check_ins_user_created_at_idx
  ON check_ins (user_id, created_at DESC);
