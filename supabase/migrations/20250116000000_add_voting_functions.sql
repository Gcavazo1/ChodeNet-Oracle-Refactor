-- Migration: Add voting support functions
-- Created: 2025-01-16

-- Function to increment option vote counts
CREATE OR REPLACE FUNCTION increment_option_votes(option_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE poll_options 
  SET votes_count = votes_count + 1 
  WHERE id = option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment Oracle Shards balance (FIXED for correct schema)
CREATE OR REPLACE FUNCTION increment_oracle_shards(wallet_addr TEXT, amount INTEGER)
RETURNS void AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- First, get the user_profile_id for this wallet address
  SELECT id INTO profile_id 
  FROM user_profiles 
  WHERE wallet_address = wallet_addr;
  
  IF profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found for wallet address: %', wallet_addr;
  END IF;
  
  -- Update oracle_shards table using correct column names
  INSERT INTO oracle_shards (user_profile_id, balance, lifetime_earned, last_earn_at, updated_at)
  VALUES (profile_id, amount, amount, NOW(), NOW())
  ON CONFLICT (user_profile_id) 
  DO UPDATE SET 
    balance = oracle_shards.balance + amount,
    lifetime_earned = oracle_shards.lifetime_earned + amount,
    last_earn_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_option_votes TO service_role;
GRANT EXECUTE ON FUNCTION increment_oracle_shards TO service_role; 