extends Node

# Adjust this path to your actual tap sound effect
const TAP_SOUND_EFFECT = preload("res://assets/audio/sfx/synth_bloop_01.ogg")

# How many simultaneous tap sounds you want to allow.
# Adjust this based on how fast taps can occur. 5-10 is usually a good starting point.
const TAP_PLAYER_POOL_SIZE = 8 

var _tap_players = []
var _current_tap_player_index = 0

func _ready():
	# Initialize the pool of AudioStreamPlayer nodes
	for i in range(TAP_PLAYER_POOL_SIZE):
		var player = AudioStreamPlayer.new()
		player.stream = TAP_SOUND_EFFECT
		# Optional: Assign to a specific audio bus if you have one for SFX.
		# If not, sounds will play on the "Master" bus by default.
		# Ensure "SFX" bus exists in Project > Project Settings > Audio
		# player.bus = "SFX" 
		add_child(player) # Add the player to the AudioManager node itself
		_tap_players.append(player)

func play_tap_sound():
	if _tap_players.is_empty():
		printerr("AudioMananger: Tap player pool is not initialized or empty!")
		return

	# Get the next player in the pool
	var player = _tap_players[_current_tap_player_index]
	
	# Play the sound
	player.play()
	
	# Move to the next player in the pool, looping back to the start if necessary
	_current_tap_player_index = (_current_tap_player_index + 1) % TAP_PLAYER_POOL_SIZE

# Optional: You can add a similar function for other pooled sound effects
# func play_another_sound():
#     # ... implementation for another sound pool ... 
