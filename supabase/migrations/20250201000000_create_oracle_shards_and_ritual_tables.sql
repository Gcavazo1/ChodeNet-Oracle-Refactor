-- Migration: Oracle Shards currency + Ritual core tables
-- Generated 2025-02-01

-- 1. Oracle Shards soft-balance table ---------------------------------------------------
CREATE TABLE IF NOT EXISTS oracle_shards (
  user_profile_id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance         bigint        NOT NULL DEFAULT 0,   -- whole-number shards
  lifetime_earned bigint        NOT NULL DEFAULT 0,
  last_earn_at    timestamptz,
  last_spend_at   timestamptz,
  updated_at      timestamptz   DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_timestamp_oracle_shards()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS t_oracle_shards_updated ON oracle_shards;
CREATE TRIGGER t_oracle_shards_updated
  BEFORE UPDATE ON oracle_shards
  FOR EACH ROW EXECUTE FUNCTION update_timestamp_oracle_shards();

-- RLS: owner can read/update their own row ------------------------------------------------
ALTER TABLE oracle_shards ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_select_own_shards ON oracle_shards
  FOR SELECT USING (user_profile_id = auth.uid());
CREATE POLICY p_update_own_shards ON oracle_shards
  FOR UPDATE USING (user_profile_id = auth.uid());

-- 2. Ritual seed tables -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ritual_bases (
  id          smallserial PRIMARY KEY,
  name        text UNIQUE NOT NULL,
  girth_cost  numeric(20,6) NOT NULL CHECK (girth_cost >= 0),
  base_risk   smallint NOT NULL CHECK (base_risk BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS ritual_ingredients (
  id               smallserial PRIMARY KEY,
  name             text NOT NULL,
  rarity           text NOT NULL CHECK (rarity IN ('common','rare','legendary')),
  girth_cost       numeric(20,6) NOT NULL CHECK (girth_cost >= 0),
  corruption_risk  smallint NOT NULL CHECK (corruption_risk BETWEEN 0 AND 100)
);

-- 3. Player Rituals -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS player_rituals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  base_id         smallint NOT NULL REFERENCES ritual_bases(id),
  ingredients     jsonb   NOT NULL, -- e.g. [{"id":2,"qty":3}]
  shard_spent     int     NOT NULL DEFAULT 0,
  corruption_lvl  smallint NOT NULL DEFAULT 0 CHECK (corruption_lvl BETWEEN 0 AND 100),
  risk_level      text    NOT NULL CHECK (risk_level IN ('low','medium','high')),
  outcome         text    DEFAULT 'pending' CHECK (outcome IN ('pending','prophecy','curse','corruption_surge')),
  created_at      timestamptz DEFAULT now(),
  completed_at    timestamptz
);

-- Basic RLS: owner can read their rituals --------------------------------------------------
ALTER TABLE player_rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_select_own_rituals ON player_rituals
  FOR SELECT USING (user_profile_id = auth.uid());

-- Indexes ---------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_player_rituals_user_profile ON player_rituals(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_player_rituals_outcome        ON player_rituals(outcome);

-- Seed data example (will be extended via admin panel) ------------------------------------
INSERT INTO ritual_bases (name, girth_cost, base_risk)
VALUES ('Whisper of Embers', 10.0, 5)
ON CONFLICT DO NOTHING;

INSERT INTO ritual_ingredients (name, rarity, girth_cost, corruption_risk)
VALUES ('Ash Petal', 'common', 1.0, 2),
       ('Glimmer Shard', 'rare', 3.0, 10),
       ('Heart of the Void', 'legendary', 5.0, 20)
ON CONFLICT DO NOTHING;

-- END -------------------------------------------------- 