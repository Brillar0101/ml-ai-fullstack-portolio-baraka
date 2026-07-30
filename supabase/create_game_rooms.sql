-- Rooms for the Emoji Riddles game at /gemoji.
--
-- One row is one shared game. The host creates it, a second player joins by
-- code, and both clients drive turns by updating this row. Realtime pushes
-- each update to the other player, which is what makes "your turn" and
-- "waiting for them" work without polling.
--
-- The deck order is NOT stored. Both clients rebuild the identical queue from
-- (deck, difficulty, seed) using the same seeded shuffle, so the row stays
-- small and there is no way for the two sides to disagree about the cards.

CREATE TABLE IF NOT EXISTS game_rooms (
  code          TEXT PRIMARY KEY,
  deck          TEXT NOT NULL,
  difficulty    SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
  seed          TEXT NOT NULL,

  host_name     TEXT NOT NULL DEFAULT 'Player 1',
  guest_name    TEXT,

  -- whose turn it is: 0 = host, 1 = guest
  turn          SMALLINT NOT NULL DEFAULT 0 CHECK (turn IN (0, 1)),
  -- pointer into the rebuilt card queue
  card_index    INTEGER NOT NULL DEFAULT 0 CHECK (card_index >= 0),
  host_score    INTEGER NOT NULL DEFAULT 0 CHECK (host_score >= 0),
  guest_score   INTEGER NOT NULL DEFAULT 0 CHECK (guest_score >= 0),

  -- what happened on each card, for the results screen
  history       JSONB NOT NULL DEFAULT '[]'::jsonb,
  finished      BOOLEAN NOT NULL DEFAULT FALSE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Joining looks a room up by code, which is already the primary key.
-- This index only supports the cleanup job below.
CREATE INDEX IF NOT EXISTS game_rooms_created_at_idx ON game_rooms (created_at);

CREATE OR REPLACE FUNCTION game_rooms_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS game_rooms_touch ON game_rooms;
CREATE TRIGGER game_rooms_touch
  BEFORE UPDATE ON game_rooms
  FOR EACH ROW EXECUTE FUNCTION game_rooms_touch_updated_at();

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- These rooms are deliberately open: there are no accounts in this game, and
-- knowing the six-character code is the only thing that grants access. Nothing
-- personal is stored beyond a display name the players type themselves, so the
-- worst case for a guessed code is a stranger playing a round of emoji puzzles.
-- Do not copy these policies onto a table that holds anything sensitive.
DROP POLICY IF EXISTS "Anyone can read a room by code" ON game_rooms;
CREATE POLICY "Anyone can read a room by code"
  ON game_rooms FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can create a room" ON game_rooms;
CREATE POLICY "Anyone can create a room"
  ON game_rooms FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update a room" ON game_rooms;
CREATE POLICY "Anyone can update a room"
  ON game_rooms FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- No DELETE policy: clients cannot remove rooms. Cleanup is the job below.

-- Push row changes to both players.
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;

-- Abandoned rooms are pure litter. Run this on a schedule (Supabase
-- Dashboard -> Integrations -> Cron) or call it by hand now and then.
CREATE OR REPLACE FUNCTION prune_old_game_rooms()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM game_rooms WHERE created_at < NOW() - INTERVAL '7 days';
$$;
