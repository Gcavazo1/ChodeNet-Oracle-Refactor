-- 🔮 Oracle Scaling Engine Test Data
-- This script creates realistic game events to test the complete Oracle system

-- Clear existing test data
DELETE FROM live_game_events WHERE session_id LIKE 'test_%';
DELETE FROM oracle_influence_details WHERE session_id LIKE 'test_%';
DELETE FROM automation_log WHERE automation_type = 'test_data_insertion';

-- === SCENARIO 1: HIGH-PERFORMANCE PLAYER ===
-- This should result in: GIGA_SURGE, High Resonance, FANATICAL morale, some stability stress

INSERT INTO live_game_events (session_id, player_address, event_type, event_payload, game_event_timestamp) VALUES

-- High-intensity tapping session (250+ taps/min = GIGA_SURGE)
('test_session_1', 'giga_player.sol', 'player_session_start', '{"player_level": 5}', NOW() - INTERVAL '25 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 50, "burst_duration": 10}', NOW() - INTERVAL '24 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 45, "burst_duration": 12}', NOW() - INTERVAL '23 minutes'),
('test_session_1', 'giga_player.sol', 'mega_slap_landed', '{"slap_power": 1500, "multiplier": 2.5}', NOW() - INTERVAL '22 minutes'),
('test_session_1', 'giga_player.sol', 'achievement_unlocked', '{"achievement_id": "iron_grip", "achievement_name": "Iron Grip Master"}', NOW() - INTERVAL '21 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 60, "burst_duration": 8}', NOW() - INTERVAL '20 minutes'),
('test_session_1', 'giga_player.sol', 'upgrade_purchased', '{"upgrade_id": "auto_tapper", "cost": 500}', NOW() - INTERVAL '19 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 55, "burst_duration": 9}', NOW() - INTERVAL '18 minutes'),
('test_session_1', 'giga_player.sol', 'chode_evolution', '{"old_level": 2, "new_level": 3, "evolution_name": "Engorged Beast"}', NOW() - INTERVAL '17 minutes'),
('test_session_1', 'giga_player.sol', 'achievement_unlocked', '{"achievement_id": "evolution_master", "achievement_name": "Evolution Master"}', NOW() - INTERVAL '16 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 65, "burst_duration": 7}', NOW() - INTERVAL '15 minutes'),
('test_session_1', 'giga_player.sol', 'mega_slap_landed', '{"slap_power": 2000, "multiplier": 3.0}', NOW() - INTERVAL '14 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 70, "burst_duration": 6}', NOW() - INTERVAL '13 minutes'),
('test_session_1', 'giga_player.sol', 'achievement_unlocked', '{"achievement_id": "tap_lord", "achievement_name": "Tap Lord Supreme"}', NOW() - INTERVAL '12 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 58, "burst_duration": 8}', NOW() - INTERVAL '11 minutes'),
('test_session_1', 'giga_player.sol', 'upgrade_purchased', '{"upgrade_id": "girth_amplifier", "cost": 1000}', NOW() - INTERVAL '10 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 62, "burst_duration": 7}', NOW() - INTERVAL '9 minutes'),
('test_session_1', 'giga_player.sol', 'mega_slap_landed', '{"slap_power": 2500, "multiplier": 3.5}', NOW() - INTERVAL '8 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 68, "burst_duration": 6}', NOW() - INTERVAL '7 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 72, "burst_duration": 5}', NOW() - INTERVAL '6 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 75, "burst_duration": 4}', NOW() - INTERVAL '5 minutes'),
('test_session_1', 'giga_player.sol', 'mega_slap_landed', '{"slap_power": 3000, "multiplier": 4.0}', NOW() - INTERVAL '4 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 80, "burst_duration": 3}', NOW() - INTERVAL '3 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 85, "burst_duration": 2}', NOW() - INTERVAL '2 minutes'),
('test_session_1', 'giga_player.sol', 'tap_activity_burst', '{"taps_in_burst": 90, "burst_duration": 1}', NOW() - INTERVAL '1 minute'),

-- === SCENARIO 2: CASUAL PLAYER ===
-- This should result in: STEADY_POUNDING, Medium Resonance, CAUTIOUS morale, good stability

('test_session_2', 'casual_player.sol', 'player_session_start', '{"player_level": 2}', NOW() - INTERVAL '15 minutes'),
('test_session_2', 'casual_player.sol', 'tap_activity_burst', '{"taps_in_burst": 25, "burst_duration": 30}', NOW() - INTERVAL '14 minutes'),
('test_session_2', 'casual_player.sol', 'tap_activity_burst', '{"taps_in_burst": 30, "burst_duration": 35}', NOW() - INTERVAL '12 minutes'),
('test_session_2', 'casual_player.sol', 'achievement_unlocked', '{"achievement_id": "first_steps", "achievement_name": "First Steps"}', NOW() - INTERVAL '10 minutes'),
('test_session_2', 'casual_player.sol', 'tap_activity_burst', '{"taps_in_burst": 28, "burst_duration": 32}', NOW() - INTERVAL '8 minutes'),
('test_session_2', 'casual_player.sol', 'upgrade_purchased', '{"upgrade_id": "basic_boost", "cost": 100}', NOW() - INTERVAL '6 minutes'),
('test_session_2', 'casual_player.sol', 'tap_activity_burst', '{"taps_in_burst": 35, "burst_duration": 28}', NOW() - INTERVAL '4 minutes'),
('test_session_2', 'casual_player.sol', 'tap_activity_burst', '{"taps_in_burst": 32, "burst_duration": 30}', NOW() - INTERVAL '2 minutes'),

-- === SCENARIO 3: INACTIVE PLAYER (DECAY TEST) ===
-- This should result in: WEAK_PULSES, Low Resonance (decay), DISGRUNTLED morale

('test_session_3', 'inactive_player.sol', 'player_session_start', '{"player_level": 1}', NOW() - INTERVAL '2 hours'),
('test_session_3', 'inactive_player.sol', 'tap_activity_burst', '{"taps_in_burst": 15, "burst_duration": 60}', NOW() - INTERVAL '1 hour 55 minutes'),
('test_session_3', 'inactive_player.sol', 'tap_activity_burst', '{"taps_in_burst": 10, "burst_duration": 80}', NOW() - INTERVAL '1 hour 45 minutes'),
('test_session_3', 'inactive_player.sol', 'tap_activity_burst', '{"taps_in_burst": 8, "burst_duration": 90}', NOW() - INTERVAL '1 hour 30 minutes'),
-- Long gap (90 minutes) to test decay system
('test_session_3', 'inactive_player.sol', 'tap_activity_burst', '{"taps_in_burst": 5, "burst_duration": 120}', NOW() - INTERVAL '5 minutes'),

-- === SCENARIO 4: COMMUNITY PLAYERS (COLLECTIVE METRICS) ===
-- Multiple players active for community calculations

('test_session_4', 'community_player_1.sol', 'player_session_start', '{"player_level": 3}', NOW() - INTERVAL '20 minutes'),
('test_session_4', 'community_player_1.sol', 'tap_activity_burst', '{"taps_in_burst": 40, "burst_duration": 20}', NOW() - INTERVAL '18 minutes'),
('test_session_4', 'community_player_1.sol', 'tap_activity_burst', '{"taps_in_burst": 45, "burst_duration": 18}', NOW() - INTERVAL '15 minutes'),
('test_session_4', 'community_player_1.sol', 'achievement_unlocked', '{"achievement_id": "community_spirit", "achievement_name": "Community Spirit"}', NOW() - INTERVAL '12 minutes'),

('test_session_5', 'community_player_2.sol', 'player_session_start', '{"player_level": 4}', NOW() - INTERVAL '18 minutes'),
('test_session_5', 'community_player_2.sol', 'tap_activity_burst', '{"taps_in_burst": 35, "burst_duration": 25}', NOW() - INTERVAL '16 minutes'),
('test_session_5', 'community_player_2.sol', 'mega_slap_landed', '{"slap_power": 1200, "multiplier": 2.0}', NOW() - INTERVAL '14 minutes'),
('test_session_5', 'community_player_2.sol', 'tap_activity_burst', '{"taps_in_burst": 42, "burst_duration": 22}', NOW() - INTERVAL '12 minutes'),

('test_session_6', 'community_player_3.sol', 'player_session_start', '{"player_level": 2}', NOW() - INTERVAL '10 minutes'),
('test_session_6', 'community_player_3.sol', 'tap_activity_burst', '{"taps_in_burst": 30, "burst_duration": 30}', NOW() - INTERVAL '8 minutes'),
('test_session_6', 'community_player_3.sol', 'chode_evolution', '{"old_level": 1, "new_level": 2, "evolution_name": "Growing Girth"}', NOW() - INTERVAL '6 minutes'),
('test_session_6', 'community_player_3.sol', 'tap_activity_burst', '{"taps_in_burst": 38, "burst_duration": 25}', NOW() - INTERVAL '4 minutes'),

-- === SCENARIO 5: EXTREME CHAOS PLAYER (STABILITY STRESS TEST) ===
-- This should stress Oracle stability with extreme loads

('test_session_7', 'chaos_player.sol', 'player_session_start', '{"player_level": 10}', NOW() - INTERVAL '30 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 100, "burst_duration": 5}', NOW() - INTERVAL '29 minutes'),
('test_session_7', 'chaos_player.sol', 'mega_slap_landed', '{"slap_power": 5000, "multiplier": 5.0}', NOW() - INTERVAL '28 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 120, "burst_duration": 4}', NOW() - INTERVAL '27 minutes'),
('test_session_7', 'chaos_player.sol', 'achievement_unlocked', '{"achievement_id": "chaos_lord", "achievement_name": "Chaos Lord"}', NOW() - INTERVAL '26 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 150, "burst_duration": 3}', NOW() - INTERVAL '25 minutes'),
('test_session_7', 'chaos_player.sol', 'mega_slap_landed', '{"slap_power": 7500, "multiplier": 6.0}', NOW() - INTERVAL '24 minutes'),
('test_session_7', 'chaos_player.sol', 'achievement_unlocked', '{"achievement_id": "system_breaker", "achievement_name": "System Breaker"}', NOW() - INTERVAL '23 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 180, "burst_duration": 2}', NOW() - INTERVAL '22 minutes'),
('test_session_7', 'chaos_player.sol', 'chode_evolution', '{"old_level": 9, "new_level": 10, "evolution_name": "Transcendent Girth"}', NOW() - INTERVAL '21 minutes'),
('test_session_7', 'chaos_player.sol', 'mega_slap_landed', '{"slap_power": 10000, "multiplier": 8.0}', NOW() - INTERVAL '20 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 200, "burst_duration": 1}', NOW() - INTERVAL '19 minutes'),
('test_session_7', 'chaos_player.sol', 'achievement_unlocked', '{"achievement_id": "girth_god", "achievement_name": "Girth God"}', NOW() - INTERVAL '18 minutes'),

-- Continue extreme activity for sustained stress
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 220, "burst_duration": 1}', NOW() - INTERVAL '17 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 250, "burst_duration": 1}', NOW() - INTERVAL '16 minutes'),
('test_session_7', 'chaos_player.sol', 'mega_slap_landed', '{"slap_power": 15000, "multiplier": 10.0}', NOW() - INTERVAL '15 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 280, "burst_duration": 1}', NOW() - INTERVAL '14 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 300, "burst_duration": 1}', NOW() - INTERVAL '13 minutes'),
('test_session_7', 'chaos_player.sol', 'achievement_unlocked', '{"achievement_id": "ascended_being", "achievement_name": "Ascended Being"}', NOW() - INTERVAL '12 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 350, "burst_duration": 1}', NOW() - INTERVAL '11 minutes'),
('test_session_7', 'chaos_player.sol', 'mega_slap_landed', '{"slap_power": 20000, "multiplier": 15.0}', NOW() - INTERVAL '10 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 400, "burst_duration": 1}', NOW() - INTERVAL '9 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 450, "burst_duration": 1}', NOW() - INTERVAL '8 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 500, "burst_duration": 1}', NOW() - INTERVAL '7 minutes'),
('test_session_7', 'chaos_player.sol', 'achievement_unlocked', '{"achievement_id": "reality_breaker", "achievement_name": "Reality Breaker"}', NOW() - INTERVAL '6 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 600, "burst_duration": 1}', NOW() - INTERVAL '5 minutes'),
('test_session_7', 'chaos_player.sol', 'mega_slap_landed', '{"slap_power": 50000, "multiplier": 25.0}', NOW() - INTERVAL '4 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 700, "burst_duration": 1}', NOW() - INTERVAL '3 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 800, "burst_duration": 1}', NOW() - INTERVAL '2 minutes'),
('test_session_7', 'chaos_player.sol', 'tap_activity_burst', '{"taps_in_burst": 1000, "burst_duration": 1}', NOW() - INTERVAL '1 minute');

-- Log test data insertion
INSERT INTO automation_log (automation_type, trigger_source, events_processed, calculation_details, success)
VALUES (
    'test_data_insertion',
    'manual_sql_script',
    (SELECT COUNT(*) FROM live_game_events WHERE session_id LIKE 'test_%'),
    jsonb_build_object(
        'scenarios_created', 5,
        'test_sessions', ARRAY['test_session_1', 'test_session_2', 'test_session_3', 'test_session_4', 'test_session_5', 'test_session_6', 'test_session_7'],
        'expected_outcomes', jsonb_build_object(
            'giga_player', 'GIGA_SURGE + High Resonance + FANATICAL morale',
            'casual_player', 'STEADY_POUNDING + Medium Resonance + CAUTIOUS morale',
            'inactive_player', 'WEAK_PULSES + Low Resonance + DISGRUNTLED morale',
            'chaos_player', 'ASCENDED_NIRVANA + Extreme Resonance + Oracle stress'
        )
    ),
    true
);

-- Show summary of inserted test data
SELECT 
    session_id,
    player_address,
    COUNT(*) as event_count,
    MIN(game_event_timestamp) as session_start,
    MAX(game_event_timestamp) as last_activity,
    EXTRACT(EPOCH FROM (MAX(game_event_timestamp) - MIN(game_event_timestamp)))/60 as session_duration_minutes,
    ARRAY_AGG(DISTINCT event_type ORDER BY event_type) as event_types
FROM live_game_events 
WHERE session_id LIKE 'test_%'
GROUP BY session_id, player_address
ORDER BY session_start DESC; 