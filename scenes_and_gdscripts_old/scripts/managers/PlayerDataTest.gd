extends Node

# Simple test script to verify PlayerDataManager functionality
# Attach this to a scene temporarily for testing

@onready var player_data_manager: PlayerDataManager = null

func _ready():
	print("PlayerDataTest: Starting test...")
	
	# Create a PlayerDataManager instance for testing
	player_data_manager = PlayerDataManager.new()
	add_child(player_data_manager)
	
	# Connect signals for testing
	player_data_manager.player_data_loaded.connect(_on_test_data_loaded)
	player_data_manager.player_data_saved.connect(_on_test_data_saved)
	player_data_manager.player_data_load_failed.connect(_on_test_data_load_failed)
	player_data_manager.player_data_save_failed.connect(_on_test_data_save_failed)
	
	# Wait a moment then start test
	await get_tree().create_timer(1.0).timeout
	start_test()

func start_test():
	print("PlayerDataTest: Testing with a dummy address...")
	
	# Test with a dummy Solana address
	var test_address = "5r1gbzBzWnaUuGhemJApg4xCNebvpUQaJWdNqB7ZQDmA"
	
	# First, try to load (should create default profile if doesn't exist)
	print("PlayerDataTest: Loading player data...")
	player_data_manager.load_player_data_from_backend(test_address)

func _on_test_data_loaded(profile_data: Dictionary):
	print("PlayerDataTest: Data loaded successfully!")
	print("PlayerDataTest: Profile data: ", profile_data)
	
	# Now test saving some data
	var test_address = "5r1gbzBzWnaUuGhemJApg4xCNebvpUQaJWdNqB7ZQDmA"
	var test_girth = 123
	var test_upgrades = {"iron_grip_rank_1": true, "test_upgrade": false}
	var test_username = "TestTapper2024"
	
	print("PlayerDataTest: Now testing save with test data...")
	player_data_manager.save_player_data_to_backend(test_address, test_girth, test_upgrades, test_username)

func _on_test_data_saved(success: bool, message: String):
	print("PlayerDataTest: Save completed - Success: ", success, ", Message: ", message)
	
	if success:
		print("PlayerDataTest: ✅ Save/Load test completed successfully!")
	else:
		print("PlayerDataTest: ❌ Save test failed!")

func _on_test_data_load_failed(error_message: String):
	print("PlayerDataTest: ❌ Load test failed: ", error_message)

func _on_test_data_save_failed(error_message: String):
	print("PlayerDataTest: ❌ Save test failed: ", error_message) 