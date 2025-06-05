extends Node

# OracleEventEmitter
# This script handles sending game events to the parent Oracle webpage via postMessage
# It hooks into existing game systems and batches events to avoid flooding
# 🔮 PHASE 2 ENHANCEMENT: Now includes player_address for personalized Oracle responses

# --- Constants ---
# Minimum time between emitting the same event type (in seconds)
const MIN_TAP_EVENT_INTERVAL: float = 10.0  # Send tap events at most every 10 seconds
const MIN_SLAP_EVENT_INTERVAL: float = 2.0   # Rate-limit slap events
const MIN_ACHIEVEMENT_EVENT_INTERVAL: float = 1.0  # Rate-limit achievement events

# Batch size for tap events
const TAP_BATCH_SIZE: int = 50  # Send tap events after this many taps

# --- Event tracking variables ---
var tap_counter: int = 0
var session_id: String = ""
var last_event_times: Dictionary = {}

# --- Flags ---
var is_debug_mode: bool = false

# 🔮 ORACLE ENHANCEMENT: Session tracking for personalized responses
var session_start_time: int = 0
var session_events_sent: int = 0
var player_milestones_hit: Array = []

# --- Called when the node enters the scene tree for the first time ---
func _ready():
	print("OracleEventEmitter: Initializing enhanced Oracle communication system...")
	
	# Generate a unique session ID
	_generate_session_id()
	session_start_time = Time.get_ticks_msec()
	
	# Emit player session start event
	emit_player_session_start_event()
	
	# Connect to game signals
	_connect_to_game_signals()
	
	# Set up timer for periodic tap event emission
	var tap_timer = Timer.new()
	tap_timer.wait_time = MIN_TAP_EVENT_INTERVAL
	tap_timer.autostart = true
	tap_timer.timeout.connect(_on_tap_timer_timeout)
	add_child(tap_timer)
	
	print("OracleEventEmitter: Enhanced Oracle system ready. Session ID:", session_id)
	
	# If in debug mode, emit a test event
	if is_debug_mode:
		_emit_debug_ready_event()

# --- Generate a unique session ID ---
func _generate_session_id() -> void:
	# Enhanced session ID with Oracle flair
	var time = Time.get_unix_time_from_system()
	var random_part = randi() % 10000
	session_id = "oracle_session_%d_%d" % [time, random_part]

# --- Connect to various game signals ---
func _connect_to_game_signals() -> void:
	# Connect to Global signals
	if Global:
		# Tap and Girth signals
		Global.girth_updated.connect(_on_girth_updated)
		
		# Mega/Giga Slap signals
		Global.mega_slap_delivered.connect(_on_mega_slap_delivered)
		
		# 🔮 ORACLE ENHANCEMENT: Connect to wallet and upgrade signals
		Global.wallet_connected.connect(_on_wallet_connected)
		Global.upgrade_purchased.connect(_on_upgrade_purchased)
		
		# Wait for AchievementManager to be ready
		await get_tree().process_frame
		
		# Connect to AchievementManager signal
		if AchievementManager.get_instance():
			AchievementManager.get_instance().achievement_unlocked.connect(_on_achievement_unlocked)
	else:
		push_error("OracleEventEmitter: Global singleton not found!")

# --- Event handlers ---
func _on_girth_updated(new_girth: int) -> void:
	# Increment tap counter for batching
	tap_counter += 1
	
	# 🔮 ORACLE ENHANCEMENT: Track milestones for personalized responses
	_check_girth_milestones(new_girth)
	
	# If we've reached the batch size, emit a tap event
	if tap_counter >= TAP_BATCH_SIZE:
		_emit_tap_activity_event(tap_counter)
		tap_counter = 0

func _on_mega_slap_delivered() -> void:
	# Only process if in active minigame or if is_mega_slap_primed
	if Global.is_giga_slap_minigame_active or Global.is_mega_slap_primed:
		# This might be a Giga Slap (G-spot hit) or a regular Mega Slap
		# Check current giga slap streak to determine
		if Global.current_giga_slap_streak > 0 and Global.is_giga_slap_minigame_active: # Make sure it was an active Giga attempt that succeeded
			# This was a successful Giga Slap!
			_emit_giga_slap_event(Global.get_current_giga_slap_girth_value())
		else:
			# This was a regular Mega Slap (or a Giga attempt that defaulted to Mega)
			_emit_mega_slap_event(Global.get_current_mega_slap_girth_value())

func _on_achievement_unlocked(achievement) -> void:
	_emit_achievement_event(achievement)

# 🔮 ORACLE ENHANCEMENT: New event handlers
func _on_wallet_connected(address: String) -> void:
	if not address.is_empty():
		_emit_oracle_player_identification_event(address)

func _on_upgrade_purchased(upgrade_id: String) -> void:
	_emit_oracle_upgrade_mastery_event(upgrade_id)

# --- Timer callbacks ---
func _on_tap_timer_timeout() -> void:
	# If we have any accumulated taps, emit them
	if tap_counter > 0:
		_emit_tap_activity_event(tap_counter)
		tap_counter = 0

# --- Evolution detection ---
# This will be called from TapperArea when evolution happens
func notify_evolution(tier: int, tier_name: String, girth_at_evolution: int) -> void:
	_emit_evolution_event(tier, tier_name, girth_at_evolution)

# --- Enhanced Event emission methods ---
func _emit_tap_activity_event(count: int) -> void:
	if _should_throttle_event("tap_activity"): 
		return
	
	var event_data = {
		"session_id": session_id,
		"event_type": "tap_activity_burst",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"tap_count": count,
			"session_duration_ms": Time.get_ticks_msec() - session_start_time,
			"total_session_events": session_events_sent
		}
	}
	
	_send_event_to_parent(event_data)
	_update_last_event_time("tap_activity")
	session_events_sent += 1

func _emit_mega_slap_event(slap_power_girth_value: int) -> void:
	if _should_throttle_event("mega_slap"): 
		return
	
	var event_data = {
		"session_id": session_id,
		"event_type": "mega_slap_landed",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"slap_power_girth": slap_power_girth_value,
			"total_mega_slaps": Global.total_mega_slaps,
			"player_girth": Global.current_girth,
			"session_mega_slaps": _count_session_mega_slaps()
		}
	}
	
	_send_event_to_parent(event_data)
	_update_last_event_time("mega_slap")
	session_events_sent += 1

func _emit_giga_slap_event(slap_power_girth_value: int) -> void:
	if _should_throttle_event("giga_slap"): 
		return
	
	var event_data = {
		"session_id": session_id,
		"event_type": "giga_slap_landed",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"slap_power_girth": slap_power_girth_value,
			"giga_slap_streak": Global.current_giga_slap_streak,
			"total_giga_slaps": Global.total_giga_slaps,
			"player_girth": Global.current_girth,
			"oracle_significance": _calculate_oracle_significance("giga_slap") # 🔮 NEW
		}
	}
	
	_send_event_to_parent(event_data)
	_update_last_event_time("giga_slap")
	session_events_sent += 1

func _emit_evolution_event(tier: int, tier_name: String, girth_at_evolution: int) -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "chode_evolution",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"new_tier": tier,
			"new_tier_name": tier_name,
			"total_girth_at_evolution": girth_at_evolution,
			"evolution_significance": "legendary", # All evolutions are legendary
			"player_journey_milestone": true
		}
	}
	
	_send_event_to_parent(event_data)
	session_events_sent += 1

func _emit_achievement_event(achievement) -> void:
	if _should_throttle_event("achievement"): 
		return
	
	var event_data = {
		"session_id": session_id,
		"event_type": "ingame_achievement_unlocked",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"achievement_id": achievement.id,
			"achievement_title": achievement.title,
			"achievement_description": achievement.description,
			"player_girth": Global.current_girth,
			"oracle_significance": _calculate_oracle_significance("achievement")
		}
	}
	
	_send_event_to_parent(event_data)
	_update_last_event_time("achievement")
	session_events_sent += 1

# 🔮 ORACLE ENHANCEMENT: New Oracle-specific events
func _emit_oracle_player_identification_event(address: String) -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "oracle_player_identification",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": address,
		"event_payload": {
			"wallet_address": address,
			"session_id": session_id,
			"oracle_awakening": true,
			"player_presence_confirmed": true
		}
	}
	
	_send_event_to_parent(event_data)
	session_events_sent += 1

func _emit_oracle_upgrade_mastery_event(upgrade_id: String) -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "oracle_upgrade_mastery",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(),
		"event_payload": {
			"upgrade_id": upgrade_id,
			"player_girth": Global.current_girth,
			"mastery_significance": "high",
			"oracle_approval": true,
			"wisdom_gained": true
		}
	}
	
	_send_event_to_parent(event_data)
	session_events_sent += 1

# --- Player Session Start Event ---
func emit_player_session_start_event() -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "player_session_start",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"client_type": "godot_iframe_tapper_demo_v1", 
			"game_version": "hackathon_demo_0.2_oracle_enhanced", # Updated version
			"oracle_system_active": true,
			"session_start_time": session_start_time
		}
	}
	_send_event_to_parent(event_data)
	print("OracleEventEmitter: Enhanced player_session_start event emitted.")
	session_events_sent += 1

# --- Iron Grip Purchased Event ---
func emit_iron_grip_purchased_event() -> void:
	if not Global.iron_grip_lvl1_purchased:
		push_warning("Attempted to emit iron_grip_purchased_event, but Global.iron_grip_lvl1_purchased is false.")
		return

	var event_data = {
		"session_id": session_id,
		"event_type": "upgrade_purchased",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"upgrade_id": "iron_grip_rank_1",
			"upgrade_name": "Iron Grip - Rank 1",
			"upgrade_category": "slap_empowerment", 
			"level": 1,
			"cost_girth": Global.iron_grip_lvl1_cost, 
			"current_total_girth": Global.current_girth,
			"new_mega_slap_bonus_multiplier": Global.iron_grip_mega_slap_bonus_multiplier,
			"oracle_significance": "high",
			"mastery_achieved": true
		}
	}
	_send_event_to_parent(event_data)
	print("OracleEventEmitter: Enhanced iron_grip_purchased_event emitted.")
	session_events_sent += 1

# 🔮 ORACLE ENHANCEMENT: Helper functions
func _get_player_address() -> String:
	return Global.player_solana_address if Global and not Global.player_solana_address.is_empty() else ""

func _calculate_oracle_significance(event_type: String) -> String:
	# Calculate how significant this event is for Oracle prophecy generation
	match event_type:
		"giga_slap":
			if Global.current_giga_slap_streak >= 5:
				return "legendary"
			elif Global.current_giga_slap_streak >= 3:
				return "epic"
			else:
				return "high"
		"achievement":
			return "medium"
		_:
			return "low"

func _check_girth_milestones(girth: int) -> void:
	# Track when player hits significant milestones for Oracle awareness
	var milestones = [100, 250, 500, 1000, 1500, 2000]
	for milestone in milestones:
		if girth >= milestone and milestone not in player_milestones_hit:
			player_milestones_hit.append(milestone)
			_emit_oracle_milestone_event(milestone, girth)

func _emit_oracle_milestone_event(milestone: int, current_girth: int) -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "oracle_girth_milestone",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(),
		"event_payload": {
			"milestone_reached": milestone,
			"current_girth": current_girth,
			"milestone_significance": _get_milestone_significance(milestone),
			"oracle_recognition": true,
			"journey_progress": float(current_girth) / 2000.0 # Progress toward max expected girth
		}
	}
	
	_send_event_to_parent(event_data)
	session_events_sent += 1

func _get_milestone_significance(milestone: int) -> String:
	if milestone >= 1000:
		return "legendary"
	elif milestone >= 500:
		return "epic"
	elif milestone >= 250:
		return "high"
	else:
		return "medium"

func _count_session_mega_slaps() -> int:
	# This could be enhanced to track session-specific stats
	return Global.total_mega_slaps if Global else 0

# --- Helper methods ---
func _should_throttle_event(event_type: String) -> bool:
	# Check if we should throttle this event type
	if not last_event_times.has(event_type):
		return false # Don't throttle if no record of this event type
	
	var current_time = Time.get_unix_time_from_system()
	var time_since_last_event = current_time - last_event_times[event_type]
	
	match event_type:
		"tap_activity":
			return time_since_last_event < MIN_TAP_EVENT_INTERVAL
		"mega_slap", "giga_slap":
			return time_since_last_event < MIN_SLAP_EVENT_INTERVAL
		"achievement":
			return time_since_last_event < MIN_ACHIEVEMENT_EVENT_INTERVAL
		# Add other event types if they need specific throttling
		
	return false # Default to no throttling if type not specified

func _update_last_event_time(event_type: String) -> void:
	last_event_times[event_type] = Time.get_unix_time_from_system()

func _get_iso_timestamp() -> String:
	# Returns an ISO 8601 formatted timestamp string in UTC
	# Godot's Time.get_datetime_string_from_system(true, true) gives YYYY-MM-DD HH:MM:SS
	# We need to replace the space with 'T' and append 'Z' for full ISO 8601 UTC.
	var dt_string = Time.get_datetime_string_from_system(true, false) # is_utc=true, use_space=false (this already uses 'T')
	if not dt_string.ends_with("Z"): # Ensure Z is appended if not already there (depends on Godot version/platform specifics)
		dt_string += "Z" # Append Z for UTC timezone indicator
	return dt_string

func _send_event_to_parent(event_data: Dictionary) -> void:
	if not OS.has_feature("JavaScript"):
		print("OracleEventEmitter: Not in HTML5 environment, skipping postMessage. Event: ", event_data)
		# Optionally, log to Godot console for non-HTML5 testing
		# print("Oracle Event (simulated postMessage): ", JSON.stringify(event_data))
		return

	var json_string = JSON.stringify(event_data)
	
	# For Godot 4.x using JavaScriptBridge:
	# The parent window should have an event listener for 'message'.
	# We send the JSON string directly. The parent's listener will parse it.
	# A slightly cleaner way using a template that expects a string, escaping single quotes within the JSON string:
	var js_command = "window.parent.postMessage('%s', '*');" % json_string.replace("'", "\\'") 
	JavaScriptBridge.eval(js_command)

	print("OracleEventEmitter: Sent enhanced event to parent: ", json_string)

# --- Debug Methods (Optional) ---
# You can add methods here to simulate emitting events for testing purposes
# Example:
func debug_emit_tap_event(count: int) -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "tap_activity_burst",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"tap_count": count
		}
	}
	_send_event_to_parent(event_data)

func debug_emit_mega_slap_event() -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "mega_slap_landed",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"slap_power_girth": 500,
			"total_mega_slaps": (Global.total_mega_slaps if Global else 0) + 1
		}
	}
	_send_event_to_parent(event_data)

func debug_emit_giga_slap_event() -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "giga_slap_landed",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"slap_power_girth": 1000,
			"giga_slap_streak": (Global.current_giga_slap_streak if Global else 0) + 1,
			"total_giga_slaps": (Global.total_giga_slaps if Global else 0) + 1
		}
	}
	_send_event_to_parent(event_data)

func debug_emit_evolution_event(tier: int, tier_name: String, girth_at_evolution: int) -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "chode_evolution",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"new_tier": tier,
			"new_tier_name": tier_name,
			"total_girth_at_evolution": girth_at_evolution
		}
	}
	_send_event_to_parent(event_data)

func debug_emit_achievement_event(achievement_data: Dictionary) -> void: # Assuming achievement_data is a dict like {id: "...", title: "...", desc: "..."}
	var event_data = {
		"session_id": session_id,
		"event_type": "ingame_achievement_unlocked",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"achievement_id": achievement_data.get("id", "UNKNOWN_ID"),
			"achievement_title": achievement_data.get("title", "Untitled Achievement"),
			"achievement_description": achievement_data.get("description", "")
		}
	}
	_send_event_to_parent(event_data)

func _emit_debug_ready_event() -> void:
	var event_data = {
		"session_id": session_id,
		"event_type": "debug_oracle_emitter_ready",
		"timestamp_utc": _get_iso_timestamp(),
		"player_address": _get_player_address(), # 🔮 ORACLE ENHANCEMENT
		"event_payload": {
			"message": "Enhanced OracleEventEmitter is ready for debug.",
			"oracle_system_version": "2.0",
			"personalization_active": true
		}
	}
	
	_send_event_to_parent(event_data)
	session_events_sent += 1 