-- 🔮 Oracle Scaling Engine Test Data (Corrected for Live Project)
-- This SQL populates your live project with realistic data to test the Oracle system

-- Clear existing test data
DELETE FROM live_game_events WHERE session_id LIKE 'test_%';

-- === SCENARIO 1: HIGH-PERFORMANCE PLAYER ===
-- This should result in: GIGA_SURGE, High Resonance, FANATICAL morale, some stability stress

INSERT INTO live_game_events (session_id, player_address, event_type, event_payload, game_event_timestamp) VALUES

-- High-intensity tapping session (250+ taps/min = GIGA_SURGE)
('test_session_1', 'giga_player.sol', 'player_session_start', '{"player_level": 5}', NOW() - INTERVAL '25 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"tap_count": 50, "taps_per_minute": 300}', NOW() - INTERVAL '24 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"tap_count": 45, "taps_per_minute": 270}', NOW() - INTERVAL '23 minutes'),
('test_session_1', 'giga_player.sol', 'mega_slap_landed', '{"slap_power_girth": 150, "total_mega_slaps": 5}', NOW() - INTERVAL '22 minutes'),
('test_session_1', 'giga_player.sol', 'giga_slap_landed', '{"slap_power_girth": 500, "total_giga_slaps": 3}', NOW() - INTERVAL '21 minutes'),
('test_session_1', 'giga_player.sol', 'chode_evolution', '{"new_tier_name": "Girth Master", "evolution_level": 3}', NOW() - INTERVAL '20 minutes'),
('test_session_1', 'giga_player.sol', 'upgrade_purchased', '{"upgrade_id": "iron_grip_rank_1", "cost": 500}', NOW() - INTERVAL '19 minutes'),
('test_session_1', 'giga_player.sol', 'ingame_achievement_unlocked', '{"achievement_title": "G-Spot Legend", "achievement_id": "giga_master"}', NOW() - INTERVAL '18 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"tap_count": 55, "taps_per_minute": 330}', NOW() - INTERVAL '17 minutes'),

-- === SCENARIO 2: STEADY STRATEGIC PLAYER ===
-- This should result in: STEADY_POUNDING, Medium Resonance, CAUTIOUSLY_OPTIMISTIC morale

('test_session_2', 'strategic_player.sol', 'player_session_start', '{"player_level": 2}', NOW() - INTERVAL '30 minutes'),
('test_session_2', 'strategic_player.sol', 'tap_activity_burst', '{"tap_count": 25, "taps_per_minute": 50}', NOW() - INTERVAL '28 minutes'),
('test_session_2', 'strategic_player.sol', 'upgrade_purchased', '{"upgrade_id": "iron_grip_rank_1", "cost": 200}', NOW() - INTERVAL '26 minutes'),
('test_session_2', 'strategic_player.sol', 'tap_activity_burst', '{"tap_count": 30, "taps_per_minute": 60}', NOW() - INTERVAL '24 minutes'),
('test_session_2', 'strategic_player.sol', 'mega_slap_landed', '{"slap_power_girth": 75, "total_mega_slaps": 2}', NOW() - INTERVAL '22 minutes'),
('test_session_2', 'strategic_player.sol', 'ingame_achievement_unlocked', '{"achievement_title": "Strategic Mind", "achievement_id": "wise_upgrader"}', NOW() - INTERVAL '20 minutes'),
('test_session_2', 'strategic_player.sol', 'tap_activity_burst', '{"tap_count": 20, "taps_per_minute": 40}', NOW() - INTERVAL '18 minutes'),

-- === SCENARIO 3: CASUAL PLAYER ===
-- This should result in: WEAK_PULSES, Low-Medium Resonance, MILDLY_CONCERNED morale

('test_session_3', 'casual_player.sol', 'player_session_start', '{"player_level": 1}', NOW() - INTERVAL '15 minutes'),
('test_session_3', 'casual_player.sol', 'tap_activity_burst', '{"tap_count": 8, "taps_per_minute": 16}', NOW() - INTERVAL '12 minutes'),
('test_session_3', 'casual_player.sol', 'tap_activity_burst', '{"tap_count": 12, "taps_per_minute": 24}', NOW() - INTERVAL '10 minutes'),
('test_session_3', 'casual_player.sol', 'tap_activity_burst', '{"tap_count": 5, "taps_per_minute": 10}', NOW() - INTERVAL '8 minutes'),

-- === SCENARIO 4: ORACLE STRESS TEST ===
-- This should result in: CRITICAL_CORRUPTION (high event volume)

('test_session_4', 'stress_player.sol', 'player_session_start', '{"player_level": 4}', NOW() - INTERVAL '10 minutes'),
('test_session_4', 'stress_player.sol', 'tap_activity_burst', '{"tap_count": 100, "taps_per_minute": 600}', NOW() - INTERVAL '9 minutes'),
('test_session_4', 'stress_player.sol', 'tap_activity_burst', '{"tap_count": 80, "taps_per_minute": 480}', NOW() - INTERVAL '8 minutes'),
('test_session_4', 'stress_player.sol', 'giga_slap_landed', '{"slap_power_girth": 800, "total_giga_slaps": 10}', NOW() - INTERVAL '7 minutes'),
('test_session_4', 'stress_player.sol', 'giga_slap_landed', '{"slap_power_girth": 900, "total_giga_slaps": 15}', NOW() - INTERVAL '6 minutes'),
('test_session_4', 'stress_player.sol', 'chode_evolution', '{"new_tier_name": "Cosmic Entity", "evolution_level": 5}', NOW() - INTERVAL '5 minutes'),
('test_session_4', 'stress_player.sol', 'tap_activity_burst', '{"tap_count": 120, "taps_per_minute": 720}', NOW() - INTERVAL '4 minutes'),
('test_session_4', 'stress_player.sol', 'giga_slap_landed', '{"slap_power_girth": 1000, "total_giga_slaps": 20}', NOW() - INTERVAL '3 minutes'),

-- === SCENARIO 5: MILESTONE ACHIEVEMENTS ===
-- This should trigger milestone-related Oracle responses

('test_session_5', 'milestone_player.sol', 'player_session_start', '{"player_level": 3}', NOW() - INTERVAL '12 minutes'),
('test_session_5', 'milestone_player.sol', 'oracle_girth_milestone', '{"current_girth": 500, "milestone_reached": 500}', NOW() - INTERVAL '10 minutes'),
('test_session_5', 'milestone_player.sol', 'oracle_girth_milestone', '{"current_girth": 1000, "milestone_reached": 1000}', NOW() - INTERVAL '8 minutes'),
('test_session_5', 'milestone_player.sol', 'ingame_achievement_unlocked', '{"achievement_title": "Girth Lord", "achievement_id": "girth_1000"}', NOW() - INTERVAL '6 minutes'),
('test_session_5', 'milestone_player.sol', 'oracle_upgrade_mastery', '{"upgrade_id": "iron_grip_rank_2", "mastery_level": 2}', NOW() - INTERVAL '4 minutes');

-- Display inserted data for verification
SELECT 
    session_id,
    event_type,
    COUNT(*) as event_count,
    MIN(game_event_timestamp) as first_event,
    MAX(game_event_timestamp) as last_event
FROM live_game_events 
WHERE session_id LIKE 'test_%'
GROUP BY session_id, event_type
ORDER BY session_id, event_type;

-- Show summary of test data
SELECT 
    'TOTAL TEST EVENTS' as metric,
    COUNT(*) as value
FROM live_game_events 
WHERE session_id LIKE 'test_%'

UNION ALL

SELECT 
    'UNIQUE TEST SESSIONS' as metric,
    COUNT(DISTINCT session_id) as value
FROM live_game_events 
WHERE session_id LIKE 'test_%'

UNION ALL

SELECT 
    'EVENT TYPES' as metric,
    COUNT(DISTINCT event_type) as value
FROM live_game_events 
WHERE session_id LIKE 'test_%';

-- Show what this data should produce when processed by the Oracle Scaling Engine:
SELECT 
    '=== EXPECTED ORACLE SCALING RESULTS ===' as info,
    'test_session_1: GIGA_SURGE (300+ taps/min), High Resonance (80%+), FANATICAL morale' as session_1,
    'test_session_2: STEADY_POUNDING (50-60 taps/min), Medium Resonance (60%), CAUTIOUSLY_OPTIMISTIC' as session_2,
    'test_session_3: WEAK_PULSES (10-24 taps/min), Low Resonance (40%), MILDLY_CONCERNED' as session_3,
    'test_session_4: CRITICAL_CORRUPTION (600+ taps/min overload), Very High Resonance, UNSTABLE' as session_4,
    'test_session_5: STEADY_POUNDING + milestone bonuses, High Resonance (70%+), ENTHUSIASTIC' as session_5; 