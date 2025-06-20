-- Migration: create initiate_ritual_tx() helper for atomic ritual debit + insert
-- Generated 2025-02-01

CREATE OR REPLACE FUNCTION initiate_ritual_tx(
  p_user_profile_id uuid,
  p_base_id         smallint,
  p_ingredient_ids  int[],
  p_shard_boost     int,
  p_girth_cost      numeric,
  p_corruption      smallint,
  p_risk_level      text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_ritual_id uuid;
BEGIN
  -- 1. Verify GIRTH balance ------------------------------------------------
  UPDATE girth_balances
     SET soft_balance = soft_balance - p_girth_cost,
         updated_at   = now()
   WHERE user_profile_id = p_user_profile_id
     AND soft_balance >= p_girth_cost;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient $GIRTH balance';
  END IF;

  -- 2. Verify / debit Shards (optional) ------------------------------------
  IF p_shard_boost > 0 THEN
    UPDATE oracle_shards
       SET balance      = balance - p_shard_boost,
           last_spend_at = now(),
           updated_at    = now()
     WHERE user_profile_id = p_user_profile_id
       AND balance >= p_shard_boost;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient Oracle Shards';
    END IF;
  END IF;

  -- 3. Insert player_ritual -------------------------------------------------
  INSERT INTO player_rituals (
    user_profile_id,
    base_id,
    ingredients,
    shard_spent,
    corruption_lvl,
    risk_level
  ) VALUES (
    p_user_profile_id,
    p_base_id,
    (SELECT jsonb_agg(id) FROM unnest(p_ingredient_ids) id),
    p_shard_boost,
    p_corruption,
    p_risk_level
  ) RETURNING id INTO v_ritual_id;

  RETURN v_ritual_id;
END;
$$;

COMMENT ON FUNCTION initiate_ritual_tx IS 'Atomically debits GIRTH & Shards, then inserts pending ritual row and returns ritual ID'; 