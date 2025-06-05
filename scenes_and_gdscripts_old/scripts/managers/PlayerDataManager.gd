extends Node
class_name PlayerDataManager

# --- Supabase Configuration ---
const SUPABASE_URL = "https://errgidlsmozmfnsoyxvw.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmdpZGxzbW96bWZuc295eHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzQ3NTUsImV4cCI6MjA2MzgxMDc1NX0.LiY5hRqmswfyWPa0_m03FjnfVXWPvyD-2PCQlR97sLE"

# Edge Function URLs
const GET_PLAYER_PROFILE_URL = SUPABASE_URL + "/functions/v1/get-player-profile"
const SAVE_PLAYER_PROFILE_URL = SUPABASE_URL + "/functions/v1/save-player-profile"
const MANAGE_LEADERBOARD_URL = SUPABASE_URL + "/functions/v1/manage-leaderboard-scores"

# --- Signals ---
signal player_data_loaded(profile_data: Dictionary)
signal player_data_saved(success: bool, message: String)
signal player_data_load_failed(error_message: String)
signal player_data_save_failed(error_message: String)

# 🏆 LEGENDARY LEADERBOARD INTEGRATION
signal leaderboard_score_submitted(category: String, score: int, success: bool)
signal leaderboard_data_received(data: Dictionary)

# --- Internal State ---
var is_loading: bool = false
var is_saving: bool = false
var current_request: HTTPRequest = null

var is_submitting_leaderboard: bool = false
var leaderboard_request: HTTPRequest = null

func _ready():
	print("PlayerDataManager: Ready and initialized.")

# --- Load Player Data from Backend ---
func load_player_data_from_backend(solana_address: String) -> void:
	if is_loading:
		print("PlayerDataManager: Load already in progress, ignoring duplicate request.")
		return
		
	if solana_address.is_empty():
		print("PlayerDataManager: Cannot load data - no Solana address provided.")
		emit_signal("player_data_load_failed", "No Solana address provided")
		return
	
	print("PlayerDataManager: Loading player data for address: ", solana_address)
	is_loading = true
	
	# Create HTTP request node
	current_request = HTTPRequest.new()
	add_child(current_request)
	current_request.request_completed.connect(_on_load_request_completed)
	
	# Prepare request data
	var request_data = {
		"player_address": solana_address
	}
	
	var json_body = JSON.stringify(request_data)
	var headers = [
		"Content-Type: application/json",
		"apikey: " + SUPABASE_ANON_KEY,
		"Authorization: Bearer " + SUPABASE_ANON_KEY
	]
	
	print("PlayerDataManager: Sending GET request to: ", GET_PLAYER_PROFILE_URL)
	var error = current_request.request(GET_PLAYER_PROFILE_URL, headers, HTTPClient.METHOD_POST, json_body)
	
	if error != OK:
		print("PlayerDataManager: Failed to initiate HTTP request. Error: ", error)
		_cleanup_request()
		is_loading = false
		emit_signal("player_data_load_failed", "Failed to initiate HTTP request")

func _on_load_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	print("PlayerDataManager: Load request completed. Response code: ", response_code)
	
	_cleanup_request()
	is_loading = false
	
	# Check for network errors
	if result != HTTPRequest.RESULT_SUCCESS:
		var error_msg = "Network error during load request. Result: " + str(result)
		print("PlayerDataManager: ", error_msg)
		emit_signal("player_data_load_failed", error_msg)
		return
	
	# Check HTTP response code
	if response_code != 200:
		var error_msg = "HTTP error during load request. Response code: " + str(response_code)
		print("PlayerDataManager: ", error_msg)
		emit_signal("player_data_load_failed", error_msg)
		return
	
	# Parse response body
	var response_text = body.get_string_from_utf8()
	print("PlayerDataManager: Received response: ", response_text)
	
	var json = JSON.new()
	var parse_result = json.parse(response_text)
	
	if parse_result != OK:
		var error_msg = "Failed to parse JSON response"
		print("PlayerDataManager: ", error_msg)
		emit_signal("player_data_load_failed", error_msg)
		return
	
	var response_data = json.data
	
	if response_data.has("status") and response_data["status"] == "success":
		if response_data.has("profile"):
			var profile_data = response_data["profile"]
			print("PlayerDataManager: Successfully loaded player profile: ", profile_data)
			emit_signal("player_data_loaded", profile_data)
		else:
			print("PlayerDataManager: Success response but missing profile data")
			emit_signal("player_data_load_failed", "Missing profile data in response")
	else:
		var error_msg = response_data.get("message", "Unknown error occurred")
		print("PlayerDataManager: Server returned error: ", error_msg)
		emit_signal("player_data_load_failed", error_msg)

# --- Save Player Data to Backend ---
func save_player_data_to_backend(solana_address: String, current_girth_value: int, upgrades_dict: Dictionary, optional_username: String = "") -> void:
	if is_saving:
		print("PlayerDataManager: Save already in progress, ignoring duplicate request.")
		return
		
	if solana_address.is_empty():
		print("PlayerDataManager: Cannot save data - no Solana address provided.")
		emit_signal("player_data_save_failed", "No Solana address provided")
		return
	
	print("PlayerDataManager: Saving player data for address: ", solana_address)
	print("PlayerDataManager: Girth: ", current_girth_value, ", Upgrades: ", upgrades_dict)
	is_saving = true
	
	# Create HTTP request node
	current_request = HTTPRequest.new()
	add_child(current_request)
	current_request.request_completed.connect(_on_save_request_completed)
	
	# Prepare request data
	var request_data = {
		"player_address": solana_address,
		"current_girth": current_girth_value,
		"purchased_upgrades": upgrades_dict
	}
	
	# Add username if provided
	if not optional_username.is_empty():
		request_data["username"] = optional_username
	
	var json_body = JSON.stringify(request_data)
	var headers = [
		"Content-Type: application/json",
		"apikey: " + SUPABASE_ANON_KEY,
		"Authorization: Bearer " + SUPABASE_ANON_KEY
	]
	
	print("PlayerDataManager: Sending SAVE request to: ", SAVE_PLAYER_PROFILE_URL)
	var error = current_request.request(SAVE_PLAYER_PROFILE_URL, headers, HTTPClient.METHOD_POST, json_body)
	
	if error != OK:
		print("PlayerDataManager: Failed to initiate save HTTP request. Error: ", error)
		_cleanup_request()
		is_saving = false
		emit_signal("player_data_save_failed", "Failed to initiate HTTP request")

func _on_save_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	print("PlayerDataManager: Save request completed. Response code: ", response_code)
	
	_cleanup_request()
	is_saving = false
	
	# Check for network errors
	if result != HTTPRequest.RESULT_SUCCESS:
		var error_msg = "Network error during save request. Result: " + str(result)
		print("PlayerDataManager: ", error_msg)
		emit_signal("player_data_save_failed", error_msg)
		return
	
	# Check HTTP response code
	if response_code != 200:
		var error_msg = "HTTP error during save request. Response code: " + str(response_code)
		print("PlayerDataManager: ", error_msg)
		emit_signal("player_data_save_failed", error_msg)
		return
	
	# Parse response body
	var response_text = body.get_string_from_utf8()
	print("PlayerDataManager: Received save response: ", response_text)
	
	var json = JSON.new()
	var parse_result = json.parse(response_text)
	
	if parse_result != OK:
		var error_msg = "Failed to parse JSON response"
		print("PlayerDataManager: ", error_msg)
		emit_signal("player_data_save_failed", error_msg)
		return
	
	var response_data = json.data
	
	if response_data.has("status") and response_data["status"] == "success":
		var success_msg = response_data.get("message", "Player data saved successfully")
		print("PlayerDataManager: ", success_msg)
		emit_signal("player_data_saved", true, success_msg)
	else:
		var error_msg = response_data.get("message", "Unknown error occurred")
		print("PlayerDataManager: Server returned error: ", error_msg)
		emit_signal("player_data_save_failed", error_msg)

# --- Utility Functions ---
func _cleanup_request() -> void:
	if current_request and is_instance_valid(current_request):
		current_request.queue_free()
		current_request = null

# --- Convenience Functions ---
func save_current_global_state() -> void:
	if not Global.player_solana_address.is_empty():
		# Convert Global's upgrade booleans to a dictionary format
		var upgrades_dict = {}
		if Global.iron_grip_lvl1_purchased:
			upgrades_dict["iron_grip_rank_1"] = true
		
		save_player_data_to_backend(
			Global.player_solana_address,
			Global.current_girth,
			upgrades_dict,
			"" # No username for now
		)
	else:
		print("PlayerDataManager: Cannot save - no authenticated wallet address")

func load_and_apply_to_global() -> void:
	if not Global.player_solana_address.is_empty():
		load_player_data_from_backend(Global.player_solana_address)
	else:
		print("PlayerDataManager: Cannot load - no authenticated wallet address")

# Connect this to the player_data_loaded signal to automatically apply loaded data to Global
func apply_loaded_data_to_global(profile_data: Dictionary) -> void:
	print("PlayerDataManager: Applying loaded data to Global: ", profile_data)
	
	# Update Global state with loaded data
	if profile_data.has("current_girth"):
		Global.current_girth = profile_data["current_girth"]
		Global.emit_signal("girth_updated", Global.current_girth)
	
	if profile_data.has("purchased_upgrades"):
		var upgrades = profile_data["purchased_upgrades"]
		
		# Apply loaded upgrade states
		if upgrades.has("iron_grip_rank_1") and upgrades["iron_grip_rank_1"]:
			Global.iron_grip_lvl1_purchased = true
			print("PlayerDataManager: Applied Iron Grip purchase state from saved data")
	
	print("PlayerDataManager: Successfully applied loaded data to Global state")

# 🎯 LEGENDARY LEADERBOARD SCORE SUBMISSION
func submit_leaderboard_score(category: String, score: int, metadata: Dictionary = {}) -> void:
	if is_submitting_leaderboard:
		print("PlayerDataManager: Leaderboard submission already in progress, ignoring duplicate request.")
		return
		
	if Global.player_solana_address.is_empty():
		print("PlayerDataManager: Cannot submit leaderboard score - no authenticated wallet address.")
		emit_signal("leaderboard_score_submitted", category, score, false)
		return
	
	print("PlayerDataManager: 🏆 Submitting leaderboard score - Category: ", category, ", Score: ", score)
	is_submitting_leaderboard = true
	
	# Create HTTP request node
	leaderboard_request = HTTPRequest.new()
	add_child(leaderboard_request)
	leaderboard_request.request_completed.connect(_on_leaderboard_submission_completed)
	
	# Prepare player context
	var player_context = {
		"player_address": Global.player_solana_address,
		"username": "",  # Will be auto-generated if empty
		"current_girth": Global.current_girth,
		"total_giga_slaps": Global.total_giga_slaps,
		"achievements_count": _calculate_achievements_count(),
		"oracle_relationship": _determine_oracle_relationship()
	}
	
	# Prepare request data
	var request_data = {
		"category": category,
		"score": score,
		"metadata": metadata,
		"player_context": player_context
	}
	
	var json_body = JSON.stringify(request_data)
	var headers = [
		"Content-Type: application/json",
		"apikey: " + SUPABASE_ANON_KEY,
		"Authorization: Bearer " + SUPABASE_ANON_KEY
	]
	
	print("PlayerDataManager: Sending leaderboard submission to: ", MANAGE_LEADERBOARD_URL)
	var error = leaderboard_request.request(MANAGE_LEADERBOARD_URL, headers, HTTPClient.METHOD_POST, json_body)
	
	if error != OK:
		print("PlayerDataManager: Failed to initiate leaderboard HTTP request. Error: ", error)
		_cleanup_leaderboard_request()
		is_submitting_leaderboard = false
		emit_signal("leaderboard_score_submitted", category, score, false)

func _on_leaderboard_submission_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	print("PlayerDataManager: Leaderboard submission completed. Response code: ", response_code)
	
	_cleanup_leaderboard_request()
	is_submitting_leaderboard = false
	
	# Check for network errors
	if result != HTTPRequest.RESULT_SUCCESS:
		var error_msg = "Network error during leaderboard submission. Result: " + str(result)
		print("PlayerDataManager: ", error_msg)
		emit_signal("leaderboard_score_submitted", "", 0, false)
		return
	
	# Check HTTP response code
	if response_code != 200:
		var error_msg = "HTTP error during leaderboard submission. Response code: " + str(response_code)
		print("PlayerDataManager: ", error_msg)
		emit_signal("leaderboard_score_submitted", "", 0, false)
		return
	
	# Parse response body
	var response_text = body.get_string_from_utf8()
	print("PlayerDataManager: Received leaderboard response: ", response_text)
	
	var json = JSON.new()
	var parse_result = json.parse(response_text)
	
	if parse_result != OK:
		var error_msg = "Failed to parse leaderboard JSON response"
		print("PlayerDataManager: ", error_msg)
		emit_signal("leaderboard_score_submitted", "", 0, false)
		return
	
	var response_data = json.data
	
	if response_data.has("status") and (response_data["status"] == "success" or response_data["status"] == "info"):
		var category = ""
		var score = 0
		
		# Extract category and score from request context if available
		if response_data.has("data"):
			var data = response_data["data"]
			if data.has("personal_best"):
				print("PlayerDataManager: ✅ Leaderboard submission processed - Personal best: ", data["personal_best"])
				if data.has("oracle_prophecy"):
					print("Oracle Prophecy: ", data["oracle_prophecy"])
		
		emit_signal("leaderboard_score_submitted", category, score, true)
	else:
		var error_msg = response_data.get("message", "Unknown error occurred")
		print("PlayerDataManager: Server returned leaderboard error: ", error_msg)
		emit_signal("leaderboard_score_submitted", "", 0, false)

# 📊 LEADERBOARD DATA RETRIEVAL
func get_leaderboard_data(category: String = "", limit: int = 10) -> void:
	print("PlayerDataManager: 📊 Fetching leaderboard data - Category: ", category, ", Limit: ", limit)
	
	# Create HTTP request node
	var request = HTTPRequest.new()
	add_child(request)
	request.request_completed.connect(_on_leaderboard_data_received)
	
	# Build URL with query parameters
	var url = MANAGE_LEADERBOARD_URL + "?"
	if not category.is_empty():
		url += "category=" + category + "&"
	url += "limit=" + str(limit)
	
	var headers = [
		"apikey: " + SUPABASE_ANON_KEY,
		"Authorization: Bearer " + SUPABASE_ANON_KEY
	]
	
	print("PlayerDataManager: Fetching leaderboard from: ", url)
	var error = request.request(url, headers, HTTPClient.METHOD_GET)
	
	if error != OK:
		print("PlayerDataManager: Failed to initiate leaderboard data request. Error: ", error)
		request.queue_free()
		emit_signal("leaderboard_data_received", {"status": "error", "message": "Failed to fetch data"})

func get_player_rankings(player_address: String = "") -> void:
	var address = player_address if not player_address.is_empty() else Global.player_solana_address
	
	if address.is_empty():
		print("PlayerDataManager: Cannot get player rankings - no player address")
		emit_signal("leaderboard_data_received", {"status": "error", "message": "No player address"})
		return
	
	print("PlayerDataManager: 📊 Fetching player rankings for: ", address)
	
	# Create HTTP request node
	var request = HTTPRequest.new()
	add_child(request)
	request.request_completed.connect(_on_leaderboard_data_received)
	
	# Build URL with player address query
	var url = MANAGE_LEADERBOARD_URL + "?player_address=" + address
	
	var headers = [
		"apikey: " + SUPABASE_ANON_KEY,
		"Authorization: Bearer " + SUPABASE_ANON_KEY
	]
	
	print("PlayerDataManager: Fetching player rankings from: ", url)
	var error = request.request(url, headers, HTTPClient.METHOD_GET)
	
	if error != OK:
		print("PlayerDataManager: Failed to initiate player rankings request. Error: ", error)
		request.queue_free()
		emit_signal("leaderboard_data_received", {"status": "error", "message": "Failed to fetch rankings"})

func _on_leaderboard_data_received(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	print("PlayerDataManager: Leaderboard data request completed. Response code: ", response_code)
	
	# Clean up the request node
	var request_node = get_children().filter(func(child): return child is HTTPRequest).back()
	if request_node:
		request_node.queue_free()
	
	# Check for network errors
	if result != HTTPRequest.RESULT_SUCCESS:
		var error_msg = "Network error during leaderboard data fetch. Result: " + str(result)
		print("PlayerDataManager: ", error_msg)
		emit_signal("leaderboard_data_received", {"status": "error", "message": error_msg})
		return
	
	# Check HTTP response code
	if response_code != 200:
		var error_msg = "HTTP error during leaderboard data fetch. Response code: " + str(response_code)
		print("PlayerDataManager: ", error_msg)
		emit_signal("leaderboard_data_received", {"status": "error", "message": error_msg})
		return
	
	# Parse response body
	var response_text = body.get_string_from_utf8()
	print("PlayerDataManager: Received leaderboard data: ", response_text)
	
	var json = JSON.new()
	var parse_result = json.parse(response_text)
	
	if parse_result != OK:
		var error_msg = "Failed to parse leaderboard data JSON response"
		print("PlayerDataManager: ", error_msg)
		emit_signal("leaderboard_data_received", {"status": "error", "message": error_msg})
		return
	
	var response_data = json.data
	emit_signal("leaderboard_data_received", response_data)

# --- Utility Functions for Leaderboard Integration ---
func _cleanup_leaderboard_request() -> void:
	if leaderboard_request and is_instance_valid(leaderboard_request):
		leaderboard_request.queue_free()
		leaderboard_request = null

func _calculate_achievements_count() -> int:
	var count = 0
	
	# Girth milestones
	if Global.current_girth >= 50: count += 1
	if Global.current_girth >= 100: count += 1
	if Global.current_girth >= 500: count += 1
	if Global.current_girth >= 1000: count += 1
	if Global.current_girth >= 2000: count += 1
	
	# Slap achievements
	if Global.total_mega_slaps >= 1: count += 1
	if Global.total_mega_slaps >= 10: count += 1
	if Global.total_mega_slaps >= 100: count += 1
	if Global.total_giga_slaps >= 1: count += 1
	if Global.total_giga_slaps >= 10: count += 1
	
	# Special achievements
	if Global.current_giga_slap_streak >= 3: count += 1
	if Global.refactory_periods_overcome >= 1: count += 1
	
	return count

func _determine_oracle_relationship() -> String:
	var girth = Global.current_girth
	var achievements = _calculate_achievements_count()
	
	if girth >= 2000 and achievements >= 10:
		return "prophetic_bond"
	elif girth >= 1000 and achievements >= 7:
		return "trusted"
	elif girth >= 500 and achievements >= 4:
		return "familiar"
	else:
		return "new"

# 🎯 CONVENIENCE FUNCTIONS FOR LEADERBOARD SUBMISSIONS
func submit_current_girth_score():
	if Global.current_girth > 0:
		submit_leaderboard_score("total_girth", Global.current_girth, {
			"submission_source": "auto_girth_update",
			"session_duration": Time.get_unix_time_from_system()
		})

func submit_giga_slaps_score():
	if Global.total_giga_slaps > 0:
		submit_leaderboard_score("giga_slaps", Global.total_giga_slaps, {
			"submission_source": "giga_slap_achievement",
			"current_streak": Global.current_giga_slap_streak
		})

func submit_achievements_score():
	var achievement_count = _calculate_achievements_count()
	if achievement_count > 0:
		submit_leaderboard_score("achievements_count", achievement_count, {
			"submission_source": "achievement_unlock",
			"girth_level": Global.current_girth
		})

func submit_oracle_favor_score():
	var favor_score = min(Global.current_girth / 10 + _calculate_achievements_count() * 5, 999)
	submit_leaderboard_score("oracle_favor", favor_score, {
		"submission_source": "oracle_calculation",
		"girth_contribution": Global.current_girth / 10,
		"achievement_contribution": _calculate_achievements_count() * 5
	}) 