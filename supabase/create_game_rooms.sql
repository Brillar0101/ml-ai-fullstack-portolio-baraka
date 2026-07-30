-- Rooms for the Emoji Riddles game at /gemoji.
--
-- One row is one room. The host opens it, everyone else joins with the PIN and
-- gathers in a lobby, and the host chooses when to begin. Play then rotates
-- through the player list, one card each.
--
-- The deck order is NOT stored. Every client rebuilds the identical queue from
-- (deck, difficulty, seed) with the same seeded shuffle, so the row stays small
-- and no two clients can disagree about which card is which.
--
-- Turn order and scoring are settled by the functions at the bottom rather than
-- by the clients. With more than two players, letting each browser work out
-- "whose turn is next" and write it back would drop moves whenever two people
-- acted in the same instant.

DROP TABLE IF EXISTS game_rooms CASCADE;

CREATE TABLE game_rooms (
  code          TEXT PRIMARY KEY,
  deck          TEXT NOT NULL,
  difficulty    SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
  seed          TEXT NOT NULL,

  -- Everyone in the room, in join order: [{ id, name, score }]
  -- players[0] is the host. Scores are Jeopardy-style point totals, so a
  -- correct answer is worth more at a harder level.
  players       JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- index into players of whoever is up next
  turn          SMALLINT NOT NULL DEFAULT 0 CHECK (turn >= 0),
  -- pointer into the rebuilt card queue
  card_index    INTEGER NOT NULL DEFAULT 0 CHECK (card_index >= 0),

  -- players gather first; the host flips this once everyone has arrived
  started       BOOLEAN NOT NULL DEFAULT FALSE,
  finished      BOOLEAN NOT NULL DEFAULT FALSE,

  -- what happened on each card, for the results screen
  history       JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- in-room chat: [{ n: name, m: message, at: epoch_ms }]
  chat          JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX game_rooms_created_at_idx ON game_rooms (created_at);

CREATE OR REPLACE FUNCTION game_rooms_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER game_rooms_touch
  BEFORE UPDATE ON game_rooms
  FOR EACH ROW EXECUTE FUNCTION game_rooms_touch_updated_at();

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- These rooms are deliberately open. There are no accounts in this game and
-- knowing the six-character PIN is the only thing that grants access. Nothing
-- personal is stored beyond a display name players type themselves, so the
-- worst case for a guessed PIN is a stranger joining a round of emoji puzzles.
-- Do NOT copy these policies onto a table holding anything sensitive.
CREATE POLICY "Anyone can read a room" ON game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create a room" ON game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update a room" ON game_rooms FOR UPDATE USING (true) WITH CHECK (true);
-- No DELETE policy: clients cannot remove rooms. Cleanup is the job below.

-- Harmless if realtime is not used; leaves the door open for it later.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
EXCEPTION WHEN duplicate_object OR undefined_object THEN
  NULL;
END;
$$;


-- ---------------------------------------------------------------------------
-- Joining. Appends the player unless they are already in, the game has begun,
-- or the room is full. The row comes back either way, so the client can tell
-- "you are in" from "no such PIN" by whether it got a row at all.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION join_game_room(room_code TEXT, player_id TEXT, player_name TEXT)
RETURNS SETOF game_rooms
LANGUAGE plpgsql
AS $$
BEGIN
  -- already a member: hand back the room unchanged
  IF EXISTS (
    SELECT 1 FROM game_rooms r
     WHERE r.code = room_code
       AND r.players @> jsonb_build_array(jsonb_build_object('id', player_id))
  ) THEN
    RETURN QUERY SELECT * FROM game_rooms WHERE code = room_code;
    RETURN;
  END IF;

  RETURN QUERY
  UPDATE game_rooms
     SET players = players || jsonb_build_object(
           'id', player_id,
           'name', left(coalesce(nullif(btrim(player_name), ''), 'Player'), 12),
           'score', 0
         )
   WHERE code = room_code
     AND started = FALSE
     AND jsonb_array_length(players) < 10
  RETURNING *;

  -- Room exists but is closed to newcomers: still return it so the client can
  -- say which case it was rather than reporting a bare failure.
  IF NOT FOUND THEN
    RETURN QUERY SELECT * FROM game_rooms WHERE code = room_code;
  END IF;
END;
$$;


-- ---------------------------------------------------------------------------
-- Playing a card. Scores the current player, appends to the history, advances
-- the pointer and rotates the turn in a single statement. A move from anyone
-- other than the player currently up changes nothing, which makes turn order
-- the database's business instead of a race between browsers.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION take_turn(
  room_code   TEXT,
  player_id   TEXT,
  points      INTEGER,
  card        JSONB,
  total_cards INTEGER
)
RETURNS SETOF game_rooms
LANGUAGE plpgsql
AS $$
DECLARE
  r   game_rooms;
  n   INT;
  idx INT;
BEGIN
  SELECT * INTO r FROM game_rooms WHERE code = room_code FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  n   := jsonb_array_length(r.players);
  idx := r.turn;

  -- not your turn, or nobody in the room: change nothing, report the truth
  IF n = 0 OR (r.players -> idx ->> 'id') IS DISTINCT FROM player_id THEN
    RETURN QUERY SELECT * FROM game_rooms WHERE code = room_code;
    RETURN;
  END IF;

  RETURN QUERY
  UPDATE game_rooms
     SET players = jsonb_set(
           players,
           ARRAY[idx::text, 'score'],
           to_jsonb(COALESCE((players -> idx ->> 'score')::int, 0) + GREATEST(COALESCE(points, 0), 0))
         ),
         history    = history || card,
         card_index = card_index + 1,
         turn       = (idx + 1) % n,
         finished   = (card_index + 1) >= GREATEST(total_cards, 1)
   WHERE code = room_code
  RETURNING *;
END;
$$;


-- ---------------------------------------------------------------------------
-- Chat. Appending from the client would be a read-modify-write, so two people
-- typing at the same moment could lose a message. This appends in one step.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION append_game_chat(room_code TEXT, sender TEXT, body TEXT)
RETURNS SETOF game_rooms
LANGUAGE sql
AS $$
  UPDATE game_rooms
     SET chat = chat || jsonb_build_object(
           'n', left(sender, 12),
           'm', left(body, 240),
           'at', (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint
         )
   WHERE code = room_code
     AND length(btrim(body)) > 0
  RETURNING *;
$$;


-- Abandoned rooms are pure litter. Run this on a schedule
-- (Dashboard -> Integrations -> Cron) or by hand now and then.
CREATE OR REPLACE FUNCTION prune_old_game_rooms()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM game_rooms WHERE created_at < NOW() - INTERVAL '7 days';
$$;
