extends Node
class_name SoarLeaderboardManager

# 🎮 CHODE-NET ORACLE: SOAR LEADERBOARD INTEGRATION
# The ultimate competitive $CHODE experience with on-chain leaderboards!

# --- SOAR Program Integration ---
@onready var soar_program: SoarProgram = null
var game_account_address: String = ""
var leaderboards: Dictionary = {} # category -> leaderboard_address

# --- Leaderboard Categories ---
enum LeaderboardCategory {
	TOTAL_GIRTH,
	GIGA_SLAPS,
	TAP_SPEED,
	ACHIEVEMENTS_COUNT,
	ORACLE_FAVOR  # Special Oracle blessing metric
}

# Leaderboard configuration
const LEADERBOARD_CONFIGS = {
	LeaderboardCategory.TOTAL_GIRTH: {
		"name": "Girth Supremacy",
		"description": "The ultimate measure of $CHODE mastery - total accumulated girth!",
		"decimals": 0,
		"max_scores": 100,
		"is_ascending": false  # Higher scores are better
	},
	LeaderboardCategory.GIGA_SLAPS: {
		"name": "G-Spot Masters",
		"description": "Champions of the legendary Giga Slap technique!",
		"decimals": 0,
		"max_scores": 50,
		"is_ascending": false
	},
	LeaderboardCategory.TAP_SPEED: {
		"name": "Speed Demons",
		"description": "Fastest tappers in the $CHODE realm!",
		"decimals": 2,
		"max_scores": 25,
		"is_ascending": false
	},
	LeaderboardCategory.ACHIEVEMENTS_COUNT: {
		"name": "Achievement Hunters",
		"description": "Collectors of sacred $CHODE accomplishments!",
		"decimals": 0,
		"max_scores": 75,
		"is_ascending": false
	},
	LeaderboardCategory.ORACLE_FAVOR: {
		"name": "Oracle's Chosen",
		"description": "Those blessed by the mystical Oracle's wisdom!",
		"decimals": 0,
		"max_scores": 30,
		"is_ascending": false
	}
}

# --- State Management ---
var is_initialized: bool = false
var player_username: String = ""
var leaderboard_data_cache: Dictionary = {}
var last_score_submission: Dictionary = {}

# --- Signals ---
signal leaderboard_initialized(success: bool)
signal score_submitted(category: LeaderboardCategory, score: int, success: bool)
signal leaderboard_data_updated(category: LeaderboardCategory, data: Dictionary)
signal player_registered(success: bool)

# --- Oracle Integration ---
var oracle_event_emitter: Node = null

func _ready():
	print("SoarLeaderboardManager: Initializing legendary competition system...")
	
	# Find Oracle event emitter for integration
	oracle_event_emitter = get_node_or_null("/root/OracleEventEmitter")
	
	# Connect to Global signals for automatic score tracking
	if Global:
		Global.girth_updated.connect(_on_girth_updated)
		Global.mega_slap_delivered.connect(_on_mega_slap_delivered)
		Global.achievement_unlocked.connect(_on_achievement_unlocked)
		print("SoarLeaderboardManager: Connected to Global game events")
	
	# Connect to SolanaService for wallet events
	call_deferred("_connect_wallet_signals")

func _connect_wallet_signals():
	# Wait for SolanaService to be ready, then connect
	if Global and Global.is_player_authenticated:
		_on_wallet_connected()

func _on_wallet_connected():
	print("SoarLeaderboardManager: Wallet connected, initializing SOAR integration...")
	
	# Initialize SOAR program
	await get_tree().process_frame
	_initialize_soar_program()

func _initialize_soar_program():
	# Find the SOAR program scene and instantiate it
	var soar_program_scene = load("res://addons/SolanaSDK/Scripts/ThirdPartyTools/SOAR/SoarProgram.tscn")
	if soar_program_scene:
		soar_program = soar_program_scene.instantiate()
		add_child(soar_program)
		print("SoarLeaderboardManager: SOAR program initialized")
		
		# Set up the game and leaderboards
		await _setup_game_and_leaderboards()
	else:
		push_error("SoarLeaderboardManager: Could not load SOAR program scene")

func _setup_game_and_leaderboards():
	print("SoarLeaderboardManager: Setting up $CHODE competition infrastructure...")
	
	# For now, use a placeholder game account
	# In production, this would be created once and stored
	game_account_address = "PLACEHOLDER_GAME_ACCOUNT_ADDRESS"
	
	# Initialize player if needed
	await _ensure_player_initialized()
	
	# Mark as initialized
	is_initialized = true
	emit_signal("leaderboard_initialized", true)
	print("SoarLeaderboardManager: 🎮 Competition system ONLINE! Ready for legendary battles!")

func _ensure_player_initialized():
	if not soar_program:
		return
		
	# Use player's wallet address as the basis for username if not set
	if player_username.is_empty():
		var wallet_addr = Global.player_solana_address
		if wallet_addr.length() >= 8:
			player_username = "Chode" + wallet_addr.substr(0, 4) + wallet_addr.substr(-4, 4)
	
	print("SoarLeaderboardManager: Ensuring player initialized with username: ", player_username)

# --- Score Submission Functions ---
func submit_girth_score(girth_amount: int):
	if not is_initialized:
		return
		
	print("SoarLeaderboardManager: 🏆 Submitting Girth Supremacy score: ", girth_amount)
	_submit_score_to_category(LeaderboardCategory.TOTAL_GIRTH, girth_amount)

func submit_giga_slap_score(giga_slap_count: int):
	if not is_initialized:
		return
		
	print("SoarLeaderboardManager: 💥 Submitting G-Spot Master score: ", giga_slap_count)
	_submit_score_to_category(LeaderboardCategory.GIGA_SLAPS, giga_slap_count)

func submit_tap_speed_score(taps_per_second: float):
	if not is_initialized:
		return
		
	var scaled_speed = int(taps_per_second * 100)  # Convert to integer with 2 decimal precision
	print("SoarLeaderboardManager: ⚡ Submitting Speed Demon score: ", taps_per_second, " tps")
	_submit_score_to_category(LeaderboardCategory.TAP_SPEED, scaled_speed)

func submit_achievement_score(achievement_count: int):
	if not is_initialized:
		return
		
	print("SoarLeaderboardManager: 🏅 Submitting Achievement Hunter score: ", achievement_count)
	_submit_score_to_category(LeaderboardCategory.ACHIEVEMENTS_COUNT, achievement_count)

func submit_oracle_favor_score(favor_level: int):
	if not is_initialized:
		return
		
	print("SoarLeaderboardManager: 🔮 Submitting Oracle's Chosen score: ", favor_level)
	_submit_score_to_category(LeaderboardCategory.ORACLE_FAVOR, favor_level)

func _submit_score_to_category(category: LeaderboardCategory, score: int):
	if not soar_program:
		print("SoarLeaderboardManager: Cannot submit score - SOAR program not initialized")
		return
	
	# For MVP, we'll simulate score submission and emit success
	# In production, this would call soar_program.submit_score_to_leaderboard()
	print("SoarLeaderboardManager: 🎯 Score submission simulated for category: ", category, " score: ", score)
	
	# Cache the score locally
	last_score_submission[category] = {
		"score": score,
		"timestamp": Time.get_unix_time_from_system(),
		"player": player_username
	}
	
	# Emit success signal
	emit_signal("score_submitted", category, score, true)
	
	# Send Oracle event for epic moments
	_send_oracle_leaderboard_event(category, score)

func _send_oracle_leaderboard_event(category: LeaderboardCategory, score: int):
	if not oracle_event_emitter:
		return
		
	# Create epic Oracle event for leaderboard activity
	var category_name = _get_category_display_name(category)
	var event_data = {
		"session_id": "oracle_session_" + str(Time.get_unix_time_from_system()),
		"event_type": "oracle_leaderboard_ascension",
		"timestamp_utc": Time.get_datetime_string_from_system(true, false) + "Z",
		"player_address": Global.player_solana_address,
		"event_payload": {
			"leaderboard_category": category_name,
			"score_achieved": score,
			"player_username": player_username,
			"competitive_significance": "legendary",
			"oracle_blessing": true,
			"eternal_glory": true
		}
	}
	
	# Send to Oracle for eternal recording
	if oracle_event_emitter.has_method("_send_event_to_parent"):
		oracle_event_emitter._send_event_to_parent(event_data)

# --- Event Handlers for Automatic Score Tracking ---
func _on_girth_updated(new_girth: int):
	# Auto-submit girth scores for major milestones
	if new_girth > 0 and (new_girth % 100 == 0 or new_girth >= 1000):
		submit_girth_score(new_girth)

func _on_mega_slap_delivered():
	# Track Giga Slaps for leaderboard
	if Global and Global.total_giga_slaps > 0:
		submit_giga_slap_score(Global.total_giga_slaps)

func _on_achievement_unlocked(title: String, description: String, duration: float):
	# Track achievement count
	var achievement_count = _calculate_total_achievements()
	if achievement_count > 0:
		submit_achievement_score(achievement_count)

func _calculate_total_achievements() -> int:
	# Calculate based on various Global metrics
	var count = 0
	
	# Girth milestones
	if Global.current_girth >= 50: count += 1
	if Global.current_girth >= 100: count += 1
	if Global.current_girth >= 500: count += 1
	if Global.current_girth >= 1000: count += 1
	
	# Slap achievements
	if Global.total_mega_slaps >= 1: count += 1
	if Global.total_mega_slaps >= 10: count += 1
	if Global.total_giga_slaps >= 1: count += 1
	if Global.total_giga_slaps >= 10: count += 1
	
	# Special achievements
	if Global.current_giga_slap_streak >= 3: count += 1
	if Global.refactory_periods_overcome >= 1: count += 1
	
	return count

# --- Leaderboard Data Retrieval ---
func get_leaderboard_top_scores(category: LeaderboardCategory, limit: int = 10) -> Array:
	# For MVP, return mock data
	# In production, this would call soar_program.fetch_leaderboard_scores()
	
	var mock_data = []
	var config = LEADERBOARD_CONFIGS[category]
	
	for i in range(min(limit, 10)):
		var score = 1000 - (i * 100) + randi() % 50  # Decreasing scores with some randomness
		mock_data.append({
			"rank": i + 1,
			"player": "ChodeWarrior" + str(i + 1),
			"score": score,
			"address": "MOCK_ADDRESS_" + str(i)
		})
	
	return mock_data

func get_player_rank(category: LeaderboardCategory) -> int:
	# For MVP, return a mock rank
	return randi() % 50 + 1

# --- Utility Functions ---
func _get_category_display_name(category: LeaderboardCategory) -> String:
	match category:
		LeaderboardCategory.TOTAL_GIRTH:
			return "Girth Supremacy"
		LeaderboardCategory.GIGA_SLAPS:
			return "G-Spot Masters"
		LeaderboardCategory.TAP_SPEED:
			return "Speed Demons"
		LeaderboardCategory.ACHIEVEMENTS_COUNT:
			return "Achievement Hunters"
		LeaderboardCategory.ORACLE_FAVOR:
			return "Oracle's Chosen"
		_:
			return "Unknown Category"

func set_player_username(username: String):
	player_username = username
	print("SoarLeaderboardManager: Player username set to: ", username)

func is_system_ready() -> bool:
	return is_initialized and soar_program != null

# --- Debug Functions ---
func debug_submit_random_scores():
	if not is_initialized:
		print("SoarLeaderboardManager: System not ready for debug scores")
		return
		
	print("SoarLeaderboardManager: 🎯 Submitting debug scores for testing...")
	submit_girth_score(randi() % 2000 + 500)
	submit_giga_slap_score(randi() % 50 + 5)
	submit_tap_speed_score(randf() * 10.0 + 1.0)
	submit_achievement_score(randi() % 20 + 3)
	submit_oracle_favor_score(randi() % 100 + 50) 