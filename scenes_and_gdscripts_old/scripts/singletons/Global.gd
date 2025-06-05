extends Node

# Signal to notify other nodes (like the HUD) when the Girth count changes.
signal girth_updated(new_girth)

# Signal for when an achievement is unlocked (simulated for the demo).
signal achievement_unlocked(achievement_name, achievement_description, duration)

# Signals for the Mighty Mega Slap mechanic
signal charge_updated(current_charge, max_charge)
signal mega_slap_ready # Player has enough charge
signal mega_slap_delivered # A mega slap (normal or giga) was performed
signal giga_slap_attempt_ready # It's time to show the SkillTapMeter
signal giga_slap_charge_lost # Player failed SkillTapMeter by timeout, charge is lost

# New signals for refactory period
signal refactory_period_started
signal refactory_period_ended

# --- Iron Grip Upgrade ---
signal upgrade_purchased(upgrade_id) # Matched to emitted arguments

# --- Solana Sign-In (SIWS) ---
var player_solana_address: String = ""
var is_player_authenticated: bool = false
signal wallet_connected(solana_address) # Emitted when wallet connects or disconnects (empty address for disconnect)
signal player_authentication_changed(is_authenticated, address)

# The current amount of $GIRTH the player has accumulated.
var current_girth: int = 0

# This will be incremented with each tap in the demo.
const GIRTH_PER_TAP: int = 1

# Mighty Mega Slap variables
var current_charge: float = 0.0
var max_charge: float = 100.0
var charge_per_tap: float = 5.0  # Reduced from 10.0 to make it harder (20 taps to fill)
var is_mega_slap_primed: bool = false
const MEGA_SLAP_MULTIPLIER: int = 10  # What should this be? Currently 100
var can_attempt_giga_slap: bool = false # Flag to indicate SkillTapMeter should be shown
const GIGA_SLAP_MULTIPLIER: int = 20 # Corrected to 20, was 500

# Refactory period variables
var refactory_timer: Timer
var is_in_refactory_period: bool = false
var refactory_decay_rate: float = 15.0  # How much charge is lost per second during refactory
var constant_decay_rate: float = 2.5    # NEW: Constant decay rate always active
var refactory_delay: float = 2.0  # Seconds of inactivity before decay starts
var last_tap_time: int = 0
var refactory_periods_overcome: int = 0

# Achievement tracking for Mega Slaps
var total_mega_slaps: int = 0
var mega_slap_girth_earned: int = 0
var mega_slap_achievements_unlocked = []

# Achievement tracking for GigaSlaps and G-spot
var total_giga_slaps: int = 0
var giga_slap_girth_earned: int = 0
var current_giga_slap_streak: int = 0
var highest_giga_slap_streak: int = 0
var giga_slap_miss_count: int = 0
var last_giga_slap_time: int = 0
var giga_slaps_in_time_window: int = 0
var giga_slap_time_window: int = 30000 # 30 seconds in milliseconds

# Flag to indicate if the Giga Slap minigame is currently active
var is_giga_slap_minigame_active: bool = false

# Tap tracking for achievements
var total_taps: int = 0 # Track total taps for achievements
var taps_per_second: float = 0.0 # Current taps per second rate
var recent_taps: Array = [] # Array to track timestamps of recent taps
var taps_in_last_minute: int = 0 # Taps in the last 60 seconds
var minute_tap_timer: Timer # Timer to track minute-based tapping achievements
var no_tap_timer: Timer # Timer to track periods of no tapping
var blue_chode_time: float = 10.0 # Seconds to wait with full meter for Blue Chode achievement
var blue_chode_timer: Timer # Timer to track time with full meter without tapping
var consecutive_g_slap_misses: int = 0 # Track consecutive G-Slap misses
var shop_icon_taps: int = 0 # Track taps on the shop icon
var money_shot_candidate: bool = false # Track if the current G-slap attempt qualifies for the Money Shot achievement

# Flag to track if player has looked at the Girth Bazaar
var has_viewed_bazaar: bool = false

# --- Iron Grip Upgrade Variables ---
var iron_grip_lvl1_cost: int = 500 # Temporarily 500 for testing, was 10000
var iron_grip_lvl1_purchased: bool = false
var iron_grip_mega_slap_bonus_multiplier: float = 0.25 # 25% bonus Girth to Mega/Giga Slaps
var iron_grip_giga_slap_bonus_multiplier: float = 0.25 # +25%

# --- Game Settings/Tunables (Loaded from a config file or hardcoded for now) ---
# Girth generation
var base_girth_per_tap = 1
var mega_slap_multiplier = 100
var giga_slap_multiplier = 500

# Evolution thresholds & names
# ... (evolution data as before)

# --- Player Data Manager ---
var player_data_manager: PlayerDataManager = null

# --- Auto-save timer ---
var auto_save_timer: Timer = null
const AUTO_SAVE_INTERVAL: float = 180.0 # Save every 3 minutes

# Called when the node enters the scene tree for the first time.
func _ready():
	print("Global.gd is ready. Current Girth: ", current_girth)
	print("Mighty Mega Slap system initialized.")
	
	# Initialize PlayerDataManager
	player_data_manager = PlayerDataManager.new()
	add_child(player_data_manager)
	
	# Connect PlayerDataManager signals
	player_data_manager.player_data_loaded.connect(_on_player_data_loaded)
	player_data_manager.player_data_saved.connect(_on_player_data_saved)
	player_data_manager.player_data_load_failed.connect(_on_player_data_load_failed)
	player_data_manager.player_data_save_failed.connect(_on_player_data_save_failed)
	
	# Setup refactory timer
	refactory_timer = Timer.new()
	refactory_timer.wait_time = refactory_delay
	refactory_timer.one_shot = true
	refactory_timer.timeout.connect(_on_refactory_timer_timeout)
	add_child(refactory_timer)
	
	# Setup achievement tracking timers
	minute_tap_timer = Timer.new()
	minute_tap_timer.wait_time = 60.0
	minute_tap_timer.one_shot = true
	minute_tap_timer.timeout.connect(_on_minute_tap_timer_timeout)
	add_child(minute_tap_timer)
	
	no_tap_timer = Timer.new()
	no_tap_timer.wait_time = 30.0 # 30 seconds for the "Is This Thing On?" achievement
	no_tap_timer.one_shot = true
	no_tap_timer.timeout.connect(_on_no_tap_timer_timeout)
	add_child(no_tap_timer)
	no_tap_timer.start() # Start this timer immediately to track initial game state
	
	blue_chode_timer = Timer.new()
	blue_chode_timer.wait_time = blue_chode_time
	blue_chode_timer.one_shot = true
	blue_chode_timer.timeout.connect(_on_blue_chode_timer_timeout)
	add_child(blue_chode_timer)
	
	# Setup auto-save timer
	auto_save_timer = Timer.new()
	auto_save_timer.wait_time = AUTO_SAVE_INTERVAL
	auto_save_timer.autostart = false # Only start when player is authenticated
	auto_save_timer.timeout.connect(_on_auto_save_timer_timeout)
	add_child(auto_save_timer)
	
	# Create a startup timer to check wallet after a delay - try multiple times
	create_wallet_check_timers()
	
	# Track process for decay
	set_process(true)
	
	# Connect to AchievementManager if it's ready
	await get_tree().process_frame  # Wait for AchievementManager to be ready
	AchievementManager.achievement_unlocked.connect(_on_achievement_manager_achievement_unlocked)

	# Defer wallet signal connection to ensure WalletService is fully ready
	call_deferred("_connect_solana_wallet_signals")

# Create multiple timers to check for wallet at different intervals
func create_wallet_check_timers():
	var check_times = [0.5, 1.0, 2.0] # Try at 0.5, 1.0, and 2.0 seconds
	var timer_count = 0
	
	for wait_time in check_times:
		var startup_timer = Timer.new()
		startup_timer.wait_time = wait_time
		startup_timer.one_shot = true
		
		# Create a unique function for each timer using a lambda
		var timer_id = timer_count
		startup_timer.timeout.connect(func(): _on_startup_timer_timeout(timer_id))
		
		add_child(startup_timer)
		startup_timer.start()
		timer_count += 1
		
	print("Global: Created %d wallet check timers" % timer_count)
	
# Function to search the entire scene tree for SolanaService node
func find_solana_service_in_tree() -> Node:
	print("Global: Searching for SolanaService in scene tree...")
	
	# First check if it's directly available as a singleton/autoload
	var solana_service = Engine.get_singleton("SolanaService")
	if solana_service:
		print("Global: Found SolanaService as an Engine singleton!")
		return solana_service
	
	# Next try to get it as an autoload by name
	solana_service = get_node_or_null("/root/SolanaService")
	if solana_service:
		print("Global: Found SolanaService as an autoload at /root/SolanaService")
		return solana_service
		
	# Try specific paths where SolanaSDK might place it
	var possible_paths = [
		"/root/Game/SolanaService",
		"/root/Main/SolanaService",
		"/root/Addons/SolanaService",
		"/root/TapperScene/SolanaService"
	]
	
	for path in possible_paths:
		solana_service = get_node_or_null(path)
		if solana_service:
			print("Global: Found SolanaService at path: ", path)
			return solana_service
	
	# If all above fails, do a thorough recursive search
	var root = get_tree().get_root()
	for child in root.get_children():
		print("Checking root child: ", child.name)
		# Try direct children of root first
		if child.name == "SolanaService":
			print("Global: Found SolanaService as direct child of root")
			return child
			
		# Now check one level deeper
		for grandchild in child.get_children():
			if grandchild.name == "SolanaService":
				print("Global: Found SolanaService at path: ", child.name + "/SolanaService")
				return grandchild
	
	# Last resort - full recursive search but only to 3 levels deep to prevent performance issues
	return find_node_by_name_recursive(root, "SolanaService", 3)

# Recursive function to find node by name in the scene tree, with depth limit
func find_node_by_name_recursive(node: Node, node_name: String, max_depth: int = -1) -> Node:
	if max_depth == 0:
		return null
		
	if node.name == node_name:
		print("Global: Found SolanaService at path: ", node.get_path())
		return node
		
	for child in node.get_children():
		var found_node = find_node_by_name_recursive(child, node_name, max_depth - 1 if max_depth > 0 else -1)
		if found_node:
			return found_node
			
	return null

# Direct function to bypass scene tree searching and directly access nodes by type
func find_wallet_service() -> Node:
	print("Global: Attempting to directly find WalletService...")
	
	# Start by looking for SolanaService
	var solana_service = find_solana_service_in_tree()
	if solana_service and solana_service.has_node("WalletService"):
		var wallet_service = solana_service.get_node("WalletService")
		print("Global: Found WalletService as child of SolanaService")
		return wallet_service
	
	# If we can't find it as a child of SolanaService, search the entire tree
	var root = get_tree().get_root()
	for child in root.get_children():
		if child.get_class() == "WalletService" or child.name == "WalletService":
			print("Global: Found WalletService directly in the tree")
			return child
			
		# Check one level deeper
		for grandchild in child.get_children():
			if grandchild.get_class() == "WalletService" or grandchild.name == "WalletService":
				print("Global: Found WalletService as child of ", child.name)
				return grandchild
	
	print("Global: Could not find WalletService by direct searching")
	return null

# Startup timer callback to check wallet status after brief delay
func _on_startup_timer_timeout(timer_id: int = 0):
	print("Global: Startup timer %d fired, checking wallet status" % timer_id)
	
	# Try to find WalletService directly
	var wallet_service = find_wallet_service()
	
	if is_instance_valid(wallet_service):
		print("Global: Found WalletService, checking if wallet is logged in...")
		
		# Try calling is_logged_in first
		if wallet_service.has_method("is_logged_in") and wallet_service.is_logged_in():
			print("Global: Wallet is logged in according to is_logged_in()")
			# Now try to get the public key
			if wallet_service.has_method("get_pubkey"):
				var pubkey = wallet_service.get_pubkey()
				if pubkey != null:
					var address = pubkey.to_string()
					print("Global: Found logged in wallet with address: ", address)
					# Manually update our state and emit signals
					player_solana_address = address
					is_player_authenticated = true
					print("Global: Manually emitting wallet signals")
					emit_signal("wallet_connected", player_solana_address)
					emit_signal("player_authentication_changed", is_player_authenticated, player_solana_address)
				else:
					print("Global: Wallet is logged in but pubkey is null")
			else:
				print("Global: WalletService doesn't have get_pubkey method")
		else:
			print("Global: Wallet is not logged in or doesn't have is_logged_in method")
	else:
		print("Global: WalletService not found in scene tree during startup check")

func _connect_solana_wallet_signals():
	# Connect to WalletService signals - Find it directly now
	var wallet_service = find_wallet_service()
	
	if is_instance_valid(wallet_service):
		print("Global: Found WalletService, attempting to connect to its signals.")
		
		# We may not need to wait for it to be ready since we found it in the tree
		if not wallet_service.is_connected("on_login_success", Callable(self, "_on_solana_wallet_login_success")):
			wallet_service.connect("on_login_success", Callable(self, "_on_solana_wallet_login_success"))
			print("Global: Connected to WalletService.on_login_success")
		
		if not wallet_service.is_connected("on_login_fail", Callable(self, "_on_solana_wallet_login_fail")):
			wallet_service.connect("on_login_fail", Callable(self, "_on_solana_wallet_login_fail"))
			print("Global: Connected to WalletService.on_login_fail")
			
		# Check if wallet is already logged in
		if wallet_service.has_method("is_logged_in") and wallet_service.is_logged_in():
			print("Global: Wallet already logged in during signal connection, manually calling handler")
			_on_solana_wallet_login_success()
	else:
		push_error("Global: WalletService not found, cannot connect signals!")

func _process(delta):
	# Always apply a constant decay pressure to the charge
	if current_charge > 0 and !is_mega_slap_primed:
		# Apply constant decay regardless of refactory period
		var decay_amount = constant_decay_rate * delta
		
		# Apply additional decay during refactory period
		if is_in_refactory_period:
			decay_amount += refactory_decay_rate * delta
		
		# Apply the decay
		current_charge = max(0, current_charge - decay_amount)
		emit_signal("charge_updated", current_charge, max_charge)
		
		# Check if we've fully depleted
		if current_charge <= 0 and is_in_refactory_period:
			is_in_refactory_period = false
			emit_signal("refactory_period_ended")
	
	# Update giga slap time window tracking
	var current_time = Time.get_ticks_msec()
	if current_time - last_giga_slap_time > giga_slap_time_window:
		# Reset the count if the window has passed
		giga_slaps_in_time_window = 0


# Function to be called when the player taps the Chode.
func increment_girth(girth_multiplier: int = 1, is_giga_slap_attempt_success: bool = false):
	var girth_gain = 0

	if girth_multiplier == GIGA_SLAP_MULTIPLIER and is_giga_slap_attempt_success: # Successful Giga Slap
		girth_gain = get_current_giga_slap_girth_value()
	elif girth_multiplier == MEGA_SLAP_MULTIPLIER and not is_giga_slap_attempt_success: # Normal Mega Slap (or failed Giga)
		girth_gain = get_current_mega_slap_girth_value()
	else: # Normal Tap
		girth_gain = GIRTH_PER_TAP * girth_multiplier # Multiplier usually 1 for normal taps

	# Track total taps and tap rate
	total_taps += 1
	_update_tap_rate()
	_check_tap_count_achievements()
	
	# Reset no tap timer when player taps
	no_tap_timer.stop()
	no_tap_timer.start()
	
	# Reset refactory period on any tap - we're actively using it!
	# If we were in refactory period and ended it through tapping, track that achievement
	if is_in_refactory_period:
		refactory_periods_overcome += 1
		_check_refactory_achievements()
		
	_reset_refactory_period()
	
	# mega_slap signal is now generic for any charged slap
	emit_signal("mega_slap_delivered")
	
	if is_giga_slap_attempt_success: # Check the new parameter name
		print("💥💥💥 GIGA G-SPOT SLAP!!! 💥💥💥 Girth +" + str(girth_gain) + "!")
		# Track GigaSlap stats
		total_giga_slaps += 1
		giga_slap_girth_earned += girth_gain
		current_giga_slap_streak += 1
		highest_giga_slap_streak = max(highest_giga_slap_streak, current_giga_slap_streak)
		consecutive_g_slap_misses = 0 # Reset misses counter on success
		
		# Update time tracking for marathon achievement
		var current_time = Time.get_ticks_msec()
		if current_time - last_giga_slap_time <= giga_slap_time_window:
			giga_slaps_in_time_window += 1
		else:
			giga_slaps_in_time_window = 1
		last_giga_slap_time = current_time
		
		# Check GigaSlap achievements
		_check_giga_slap_achievements()
		
	elif girth_multiplier > 1: # It's a normal Mega Slap OR a failed Giga Slap attempt that still counts as Mega
		print("⚡⚡⚡ MIGHTY MEGA SLAP! ⚡⚡⚡ Girth +" + str(girth_gain) + "!")
		# Track Mega Slap stats
		total_mega_slaps += 1
		mega_slap_girth_earned += girth_gain
		
		# Reset GigaSlap streak if this was a missed G-spot attempt
		if is_giga_slap_minigame_active:
			current_giga_slap_streak = 0
			consecutive_g_slap_misses += 1
			_check_g_slap_miss_achievements()
			giga_slap_miss_count += 1
		
		_check_mega_slap_achievements()
	
	current_girth += girth_gain
	emit_signal("girth_updated", current_girth)
	
	if girth_multiplier == 1: # Normal tap
		print("Girth incremented! New Girth: ", current_girth)

	# Check milestone achievements based on girth
	_check_girth_achievements()
	
	# If blue_chode_timer was running, stop it since player tapped
	if blue_chode_timer.time_left > 0:
		blue_chode_timer.stop()


# Update the charge meter with each tap
func update_charge():
	# Reset refactory timer since there was activity
	_reset_refactory_period()
	
	if is_mega_slap_primed:
		# Reset after a Mega Slap
		current_charge = 0
		is_mega_slap_primed = false
		# Stop blue chode timer if it was running
		blue_chode_timer.stop()
	else:
		# Increment charge and check if fully charged
		# NOTE: We're still incrementing by charge_per_tap, but the constant decay
		# in _process will counteract this slightly, making it a battle to fill the meter
		current_charge = min(current_charge + charge_per_tap, max_charge)
		
		if current_charge >= max_charge and not is_mega_slap_primed:
			is_mega_slap_primed = true
			can_attempt_giga_slap = true # Player is now eligible for a Giga Slap attempt
			emit_signal("mega_slap_ready")
			# Start blue chode timer when meter is fully charged
			blue_chode_timer.start()
			# Don't immediately emit giga_slap_attempt_ready here.
			# Let the TapperArea decide when to trigger it (e.g., on the *next* tap after ready)
			print("⚡ MIGHTY MEGA SLAP READY! Potential Giga Slap... ⚡")
	
	emit_signal("charge_updated", current_charge, max_charge)


# Reset and restart the refactory timer
func _reset_refactory_period():
	# If we were in a refactory period, signal that it's ended
	if is_in_refactory_period:
		is_in_refactory_period = false
		emit_signal("refactory_period_ended")
	
	# Reset and start the timer
	last_tap_time = Time.get_ticks_msec()
	refactory_timer.stop()
	refactory_timer.start()


# Called when the refactory timer times out (no taps for a while)
func _on_refactory_timer_timeout():
	# Only enter refactory period if not already in one and there's charge to decay
	if !is_in_refactory_period and current_charge > 0 and !is_mega_slap_primed:
		is_in_refactory_period = true
		print("Entering refactory period - charge decaying!")
		emit_signal("refactory_period_started")


# Check for refactory period achievements
func _check_refactory_achievements():
	# First refactory period overcome
	if refactory_periods_overcome == 1:
		AchievementManager.unlock_achievement("first_refactory_overcome")
	
	# 5 refactory periods overcome
	if refactory_periods_overcome == 5:
		AchievementManager.unlock_achievement("refactory_master")
	
	# 10 refactory periods overcome
	if refactory_periods_overcome == 10:
		AchievementManager.unlock_achievement("refactory_legend")


# Check for Mega Slap achievements
func _check_mega_slap_achievements():
	# First Mega Slap
	if total_mega_slaps == 1:
		AchievementManager.unlock_achievement("first_mega_slap")
	
	# 5 Mega Slaps
	if total_mega_slaps == 5:
		AchievementManager.unlock_achievement("five_mega_slaps")
	
	# 10 Mega Slaps
	if total_mega_slaps == 10:
		AchievementManager.unlock_achievement("ten_mega_slaps")
	
	# 100 Girth from Mega Slaps
	if mega_slap_girth_earned >= 100:
		AchievementManager.unlock_achievement("mega_slap_girth_100")


# Check for GigaSlap and G-spot achievements
func _check_giga_slap_achievements():
	# First GigaSlap - using both the original and new achievement names
	if total_giga_slaps == 1:
		AchievementManager.unlock_achievement("first_giga_slap")
		AchievementManager.unlock_achievement("g_spotter")
	
	# G-Guzzler (10 G-slaps)
	if total_giga_slaps == 10:
		AchievementManager.unlock_achievement("giga_slap_10")
		AchievementManager.unlock_achievement("g_guzzler")
	
	# G-Spot Messiah (25 G-slaps)
	if total_giga_slaps == 25:
		AchievementManager.unlock_achievement("g_spot_messiah")
	
	if total_giga_slaps == 50:
		AchievementManager.unlock_achievement("giga_slap_50")
	
	# Streak achievements
	if current_giga_slap_streak == 3:
		AchievementManager.unlock_achievement("giga_slap_streak_3")
		AchievementManager.unlock_achievement("chain_reaction_climax")
	
	if current_giga_slap_streak == 5:
		AchievementManager.unlock_achievement("giga_slap_streak_5")
	
	if current_giga_slap_streak == 10:
		AchievementManager.unlock_achievement("giga_slap_streak_10")
	
	# Money Shot achievement - landing a G-slap as the very first tap after the meter fills
	if money_shot_candidate:
		AchievementManager.unlock_achievement("the_money_shot")
		money_shot_candidate = false # Reset the flag
	
	# Girth earned from GigaSlaps
	if giga_slap_girth_earned >= 500:
		AchievementManager.unlock_achievement("g_spot_girth_500")
	
	# Clutch achievement - hitting G-spot when charge is nearly gone
	if current_charge / max_charge <= 0.05 and not is_in_refactory_period:
		AchievementManager.unlock_achievement("giga_slap_clutch")
	
	# Marathon achievement - 5 GigaSlaps in 30 seconds
	if giga_slaps_in_time_window >= 5:
		AchievementManager.unlock_achievement("giga_slap_marathon")


# Check for milestone girth achievements
func _check_girth_achievements():
	# Genesis tap achievement
	if current_girth >= 10:
		AchievementManager.unlock_achievement("genesis_tap")
	
	# Milestone achievements
	if current_girth >= 50:
		AchievementManager.unlock_achievement("girth_50")
	
	if current_girth >= 100:
		AchievementManager.unlock_achievement("girth_100")
	
	if current_girth >= 150:
		AchievementManager.unlock_achievement("girth_150")
	
	if current_girth >= 250:
		AchievementManager.unlock_achievement("girth_250")
	
	if current_girth >= 500:
		AchievementManager.unlock_achievement("girth_500")
	
	if current_girth >= 1000:
		AchievementManager.unlock_achievement("girth_1000")
	
	# Evolution achievements
	if current_girth >= 300: # First evolution threshold
		AchievementManager.unlock_achievement("first_evolution")
		AchievementManager.unlock_achievement("veinous_curiosity")
	
	if current_girth >= 1500: # Ultimate evolution threshold
		AchievementManager.unlock_achievement("ultimate_evolution")
		AchievementManager.unlock_achievement("it_cracked")


# Called when AchievementManager unlocks an achievement, forward to legacy system
func _on_achievement_manager_achievement_unlocked(achievement):
	# Forward the achievement to legacy achievement_unlocked signal for HUD display
	emit_signal("achievement_unlocked", achievement.title, achievement.description, 3.0)


# Called by TapperArea when player taps and a Giga Slap can be attempted
func attempt_giga_slap_minigame():
	if is_mega_slap_primed and can_attempt_giga_slap:
		print("Global: Triggering Giga Slap minigame attempt.")
		can_attempt_giga_slap = false # Consume the immediate eligibility
		is_giga_slap_minigame_active = true # Minigame is now active
		
		# Check if this is the first tap after meter filled
		# For the Money Shot achievement
		if is_mega_slap_primed and blue_chode_timer.time_left > 0 and blue_chode_timer.time_left >= (blue_chode_time - 0.5):
			# This means they tapped within 0.5 seconds of the meter filling
			# Flag this for when the G-spot is hit successfully
			money_shot_candidate = true
		
		emit_signal("giga_slap_attempt_ready")
		return true
	return false

# Called when Giga Slap minigame is failed due to timeout
func giga_slap_timed_out():
	print("Global: Giga Slap timed out. Charge lost.")
	current_charge = 0
	is_mega_slap_primed = false
	can_attempt_giga_slap = false
	is_giga_slap_minigame_active = false
	current_giga_slap_streak = 0 # Reset streak on timeout
	money_shot_candidate = false # Reset money shot candidate flag on timeout
	emit_signal("charge_updated", current_charge, max_charge)
	emit_signal("giga_slap_charge_lost")


# Report precision of G-spot hit (0.0 to 1.0, with 1.0 being perfect center)
func report_g_spot_precision(precision: float):
	# Check for perfect hit achievement
	if precision >= 0.95:
		AchievementManager.unlock_achievement("perfect_g_spot")
	
	# Check for last-second hit achievement
	# This would need to be called from SkillTapMeter when close to timeout
	
	# Reset minigame active flag after reporting
	is_giga_slap_minigame_active = false


# Placeholder for future functions, like spending Girth or handling upgrades.
# func spend_girth(amount: int):
# if current_girth >= amount:
# current_girth -= amount
# emit_signal("girth_updated", current_girth)
# return true
# else:
# return false

# func get_girth() -> int:
# return current_girth 

# Timer callback functions for achievements
func _on_minute_tap_timer_timeout():
	# Check if player achieved 60 taps in 60 seconds
	if taps_in_last_minute >= 60:
		AchievementManager.unlock_achievement("minute_man")
	taps_in_last_minute = 0

func _on_no_tap_timer_timeout():
	# Player hasn't tapped for 30 seconds from game start
	if total_taps == 0:
		AchievementManager.unlock_achievement("is_this_thing_on")

func _on_blue_chode_timer_timeout():
	# Player let the G-Slap meter fill but didn't tap for 10 seconds
	AchievementManager.unlock_achievement("blue_choded")

# Track tap rate for achievements
func _update_tap_rate():
	var current_time = Time.get_ticks_msec()
	
	# Add current tap to recent taps
	recent_taps.append(current_time)
	
	# Remove taps older than 1 second
	while not recent_taps.is_empty() and current_time - recent_taps[0] > 1000:
		recent_taps.pop_front()
	
	# Update taps per second
	taps_per_second = recent_taps.size()
	
	# Check for Jackhammer achievement
	if taps_per_second >= 8:
		AchievementManager.unlock_achievement("the_jackhammer")
	
	# Update minute counter
	taps_in_last_minute += 1
	if not minute_tap_timer.is_stopped() and minute_tap_timer.time_left <= 0:
		minute_tap_timer.start()

# Check for achievements based on consecutive G-spot misses
func _check_g_slap_miss_achievements():
	if consecutive_g_slap_misses >= 5:
		AchievementManager.unlock_achievement("the_slap_heretic")

# Check for achievements based on total tap count
func _check_tap_count_achievements():
	if total_taps == 69:
		AchievementManager.unlock_achievement("nice")
	elif total_taps == 420:
		AchievementManager.unlock_achievement("blaze_it")
	elif total_taps == 1000:
		AchievementManager.unlock_achievement("repetitive_slap_injury")

# --- Girth Calculation for Slaps (with Iron Grip) ---
func get_current_mega_slap_girth_value() -> int:
	var base_girth = GIRTH_PER_TAP * MEGA_SLAP_MULTIPLIER
	if iron_grip_lvl1_purchased:
		base_girth += int(base_girth * iron_grip_mega_slap_bonus_multiplier)
	return base_girth

func get_current_giga_slap_girth_value() -> int:
	var base_girth = GIRTH_PER_TAP * GIGA_SLAP_MULTIPLIER
	if iron_grip_lvl1_purchased:
		base_girth += int(base_girth * iron_grip_giga_slap_bonus_multiplier)
	return base_girth

# --- Solana SDK Integration Callbacks ---
func _on_solana_wallet_login_success():
	print("Global: Received on_login_success from WalletService.") # Added print statement
	
	# Find WalletService directly
	var wallet_service = find_wallet_service()
	if not is_instance_valid(wallet_service):
		push_error("Global: Cannot find WalletService in _on_solana_wallet_login_success")
		return
		
	# Try to get the public key
	if wallet_service.has_method("get_pubkey"):
		var public_key = wallet_service.get_pubkey() # Assuming get_pubkey() is available and returns Pubkey object	
		if public_key:
			player_solana_address = public_key.to_string()
			is_player_authenticated = true # Assume authenticated on successful login for MVP
			print("Global: Wallet connected. Address: ", player_solana_address)
			emit_signal("wallet_connected", player_solana_address)
			emit_signal("player_authentication_changed", is_player_authenticated, player_solana_address)
			
			# Load player data after successful wallet connection
			if player_data_manager:
				print("Global: Loading player data after wallet connection...")
				player_data_manager.load_and_apply_to_global()
			
			# Start auto-save timer for authenticated user
			if auto_save_timer:
				print("Global: Starting auto-save timer")
				auto_save_timer.start()
			
		else:
			print("Global: Received on_login_success, but could not get public key.")
			# Handle error or unexpected state
	else:
		push_error("Global: WalletService doesn't have get_pubkey method")

func _on_solana_wallet_login_fail():
	print("Global: Received on_login_fail from WalletService.") # Added print statement
	player_solana_address = ""
	is_player_authenticated = false
	print("Global: Wallet connection failed.")
	emit_signal("wallet_connected", player_solana_address)
	emit_signal("player_authentication_changed", is_player_authenticated, player_solana_address)
	
	# Stop auto-save timer when not authenticated
	if auto_save_timer:
		print("Global: Stopping auto-save timer")
		auto_save_timer.stop()

# --- PlayerDataManager Callback Functions ---
func _on_player_data_loaded(profile_data: Dictionary) -> void:
	print("Global: Player data loaded successfully: ", profile_data)
	if player_data_manager:
		player_data_manager.apply_loaded_data_to_global(profile_data)

func _on_player_data_saved(success: bool, message: String) -> void:
	print("Global: Player data saved - Success: ", success, ", Message: ", message)

func _on_player_data_load_failed(error_message: String) -> void:
	print("Global: Player data load failed: ", error_message)
	# Could show a UI notification here in the future

func _on_player_data_save_failed(error_message: String) -> void:
	print("Global: Player data save failed: ", error_message)
	# Could show a UI notification here in the future

# --- Auto-Save Functions ---
func save_player_progress() -> void:
	if player_data_manager and not player_solana_address.is_empty():
		print("Global: Auto-saving player progress...")
		player_data_manager.save_current_global_state()

# Call this when an upgrade is purchased
func on_upgrade_purchased(upgrade_id: String) -> void:
	print("Global: Upgrade purchased: ", upgrade_id)
	emit_signal("upgrade_purchased", upgrade_id)
	
	# Auto-save after upgrade purchase
	call_deferred("save_player_progress")

# Auto-save timer callback
func _on_auto_save_timer_timeout():
	print("Global: Auto-save timer triggered")
	save_player_progress()
