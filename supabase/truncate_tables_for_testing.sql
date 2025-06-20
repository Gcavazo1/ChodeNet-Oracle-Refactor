-- TRUNCATE TABLES FOR LIVE DATA TRACKING TESTS
-- This script clears all tables except the preserved ones for testing
-- 
-- PRESERVED TABLES (NOT TRUNCATED):
-- ✅ waitlist_entries
-- ✅ user_profiles  
-- ✅ user_votes
-- ✅ ritual_ingredients
-- ✅ ritual_bases
-- ✅ oracle_polls
-- ✅ early_adopters

-- Disable foreign key checks temporarily for clean truncation
SET session_replication_role = replica;

-- TRUNCATE ACTIVE DATA TABLES
TRUNCATE TABLE public.player_states CASCADE;
TRUNCATE TABLE public.live_game_events CASCADE;
TRUNCATE TABLE public.girth_balances CASCADE;
TRUNCATE TABLE public.wallet_sessions CASCADE;
TRUNCATE TABLE public.leaderboard_entries CASCADE;
TRUNCATE TABLE public.oracle_shards CASCADE;
TRUNCATE TABLE public.player_rituals CASCADE;
TRUNCATE TABLE public.mint_events CASCADE;

-- TRUNCATE ORACLE SYSTEM TABLES
TRUNCATE TABLE public.oracle_responses CASCADE;
TRUNCATE TABLE public.oracle_personalities CASCADE;
TRUNCATE TABLE public.special_reports CASCADE;
TRUNCATE TABLE public.oracle_metrics CASCADE;
TRUNCATE TABLE public.automation_log CASCADE;
TRUNCATE TABLE public.oracle_influence_details CASCADE;

-- TRUNCATE LORE SYSTEM TABLES
TRUNCATE TABLE public.community_story_inputs CASCADE;
TRUNCATE TABLE public.comic_generation_queue CASCADE;
TRUNCATE TABLE public.chode_lore_entries CASCADE;
TRUNCATE TABLE public.lore_cycles CASCADE;

-- TRUNCATE PROPHECY SYSTEM TABLES
TRUNCATE TABLE public.apocryphal_scrolls CASCADE;
TRUNCATE TABLE public.ritual_requests_log CASCADE;

-- TRUNCATE ORACLE REFERENDUM TABLES
TRUNCATE TABLE public.oracle_commentary CASCADE;
TRUNCATE TABLE public.poll_options CASCADE;
-- NOTE: oracle_polls is PRESERVED as requested
-- NOTE: user_votes is PRESERVED as requested

-- Reset singleton table to default values (but don't truncate)
UPDATE public.girth_index_current_values SET 
    divine_girth_resonance = 50.0,
    tap_surge_index = 'Steady Pounding',
    legion_morale = 'Cautiously Optimistic',
    oracle_stability_status = 'Pristine',
    last_updated = NOW(),
    calculation_source = 'manual',
    previous_tap_surge_index = NULL,
    previous_legion_morale = NULL,
    previous_oracle_stability_status = NULL
WHERE id = 1;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Display confirmation of preserved tables
SELECT 
    'PRESERVED TABLES - Data intact:' as status,
    table_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name) as exists
FROM (VALUES 
    ('waitlist_entries'),
    ('user_profiles'),
    ('user_votes'),
    ('ritual_ingredients'),
    ('ritual_bases'),
    ('oracle_polls'),
    ('early_adopters')
) AS t(table_name);

-- Display confirmation of truncated tables
SELECT 
    'TRUNCATED TABLES - Ready for testing:' as status,
    table_name
FROM (VALUES 
    ('player_states'),
    ('live_game_events'),
    ('girth_balances'),
    ('wallet_sessions'),
    ('leaderboard_entries'),
    ('oracle_shards'),
    ('player_rituals'),
    ('mint_events'),
    ('oracle_responses'),
    ('oracle_personalities'),
    ('special_reports'),
    ('oracle_metrics'),
    ('automation_log'),
    ('oracle_influence_details'),
    ('community_story_inputs'),
    ('comic_generation_queue'),
    ('chode_lore_entries'),
    ('lore_cycles'),
    ('apocryphal_scrolls'),
    ('ritual_requests_log'),
    ('oracle_commentary'),
    ('poll_options')
) AS t(table_name);

-- Final status message
SELECT 'Database successfully prepared for live data tracking tests!' as message; 