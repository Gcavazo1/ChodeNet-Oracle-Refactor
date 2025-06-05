extends Node

# Manages the SkillTapMeter UI and Giga Slap related UI feedback.

# --- Dependencies (injected by MainLayout) ---
var skill_tap_meter_node # The SkillTapMeter scene instance
var effects_manager # Instance of EffectsManager
var tapper_area_node # Instance of TapperArea for positioning

# Sound effects
# var sfx_player: AudioStreamPlayer # Old single player
const MEGA_SLAP_SFX = preload("res://assets/audio/sfx/megaSlap.ogg")
const MEGA_SLAP_PLAYER_POOL_SIZE = 3 # Pool size for mega slap sounds
var _mega_slap_players = []
var _current_mega_slap_player_index = 0

# Dedicated particle system for skill-related effects
var skill_particles: GPUParticles2D = null

# --- Initialization ---
func initialize_manager(meter_node, fx_manager, tap_area):
	skill_tap_meter_node = meter_node
	effects_manager = fx_manager
	tapper_area_node = tap_area

	if not is_instance_valid(skill_tap_meter_node):
		push_error("SkillTapUIManager: SkillTapMeter node is invalid!")
	if not is_instance_valid(effects_manager):
		push_error("SkillTapUIManager: EffectsManager is invalid!")
	if not is_instance_valid(tapper_area_node):
		print("SkillTapUIManager: TapperArea node not available - visual effects will be limited")
	
	# Setup sound player pool
	for i in range(MEGA_SLAP_PLAYER_POOL_SIZE):
		var player = AudioStreamPlayer.new()
		player.stream = MEGA_SLAP_SFX
		player.volume_db = 0.0 
		add_child(player)
		_mega_slap_players.append(player)
	
	# Create dedicated particle system for skill effects (only if TapperArea is available)
	if is_instance_valid(tapper_area_node) and tapper_area_node.has_node("TapParticles"):
		var base_particles = tapper_area_node.get_node("TapParticles")
		if base_particles:
			skill_particles = GPUParticles2D.new()
			
			# Copy visual properties from the base particles
			skill_particles.process_material = base_particles.process_material.duplicate()
			skill_particles.texture = base_particles.texture
			
			# Copy any shader material that might be applied
			if base_particles.material:
				skill_particles.material = base_particles.material.duplicate()
			
			skill_particles.amount = 30
			skill_particles.lifetime = 2.0
			skill_particles.explosiveness = 1.0
			skill_particles.one_shot = true
			skill_particles.emitting = false
			
			# Important: Position it at exactly the same place as the base particles
			# Add it to the same parent as the base particles to maintain relative positioning
			base_particles.get_parent().add_child(skill_particles)
			skill_particles.position = base_particles.position
			skill_particles.z_index = base_particles.z_index + 1 # Put it on top
			
			print("SkillTapUIManager: Skill particle system created")
		else:
			print("SkillTapUIManager: Base particles not found - particle effects disabled")
	else:
		print("SkillTapUIManager: TapperArea or its particles not found - particle effects disabled")
	
	print("SkillTapUIManager: Initialized.")

# --- Core UI Logic ---

# Shows the SkillTapMeter and starts its minigame.
func _on_giga_slap_attempt_ready():
	if is_instance_valid(skill_tap_meter_node) and skill_tap_meter_node.has_method("show_and_start"):
		print("SkillTapUIManager: Giga Slap attempt ready, showing SkillTapMeter.")
		skill_tap_meter_node.show_and_start()
	else:
		push_error("SkillTapUIManager: SkillTapMeter node not set or lacks show_and_start method.")

# Called by TapperArea when the player taps during an active Giga Slap minigame.
func evaluate_player_tap():
	if not is_instance_valid(skill_tap_meter_node):
		push_error("SkillTapUIManager: evaluate_player_tap called but skill_tap_meter_node is invalid!")
		_on_giga_slap_failure(false) # Treat as failure if meter isn't there
		return

	# Assuming SkillTapMeter.gd has is_active property and check_current_tap_success method
	if not skill_tap_meter_node.get("is_active"): # Check if the meter considers itself active for evaluation
		print("SkillTapUIManager: evaluate_player_tap called but SkillTapMeter is not active. Tap ignored or minigame already concluded.")
		return

	if skill_tap_meter_node.has_method("check_current_tap_success"):
		var success = skill_tap_meter_node.check_current_tap_success() # This method should exist on SkillTapMeter.gd
		print("SkillTapUIManager: Tap evaluated by SkillTapMeter. Success: %s" % success)
		if success:
			_on_giga_slap_success()
		else:
			_on_giga_slap_failure(false) # false because it wasn't a timeout, it was a missed tap
	else:
		push_error("SkillTapUIManager: SkillTapMeter node is missing the check_current_tap_success() method.")
		_on_giga_slap_failure(false) # Treat as failure if method is missing

func _play_mega_slap_sound():
	if _mega_slap_players.is_empty():
		printerr("SkillTapUIManager: Mega Slap player pool is not initialized or empty!")
		return
	var player = _mega_slap_players[_current_mega_slap_player_index]
	player.play()
	_current_mega_slap_player_index = (_current_mega_slap_player_index + 1) % MEGA_SLAP_PLAYER_POOL_SIZE

# Handles UI and game logic for a successful Giga Slap.
func _on_giga_slap_success():
	print("SkillTapUIManager: Giga Slap success! Processing...")
	
	_play_mega_slap_sound() # Play the mega slap sound using the pool
	
	Global.increment_girth(Global.GIGA_SLAP_MULTIPLIER, true)
	Global.update_charge() # Reset charge or apply giga-specific charge logic

	if is_instance_valid(effects_manager):
		var base_pos = Vector2.ZERO
		if is_instance_valid(tapper_area_node):
			base_pos = tapper_area_node.global_position
		else:
			# Fallback position if TapperArea not available
			base_pos = Vector2(get_viewport().size.x / 2, get_viewport().size.y / 2)
		
		effects_manager._on_floating_number_requested("GIGA SLAP!", base_pos - Vector2(0,60), 2.0, Color.GOLD, 1.5)
		effects_manager._on_floating_number_requested("+" + str(Global.GIRTH_PER_TAP * Global.GIGA_SLAP_MULTIPLIER), base_pos - Vector2(0,20), 2.0, Color.GREEN, 1.2)
		
		# Use the dedicated skill particles for Giga Slap success (only if available)
		if is_instance_valid(skill_particles):
			# Set special Giga Slap particle properties
			skill_particles.amount = 20 # More particles than normal
			skill_particles.lifetime = 5.0 # Longer lifetime
			
			# Modify particle material for Giga effect
			var giga_material = skill_particles.process_material.duplicate()
			giga_material.initial_velocity_min = 180.0
			giga_material.initial_velocity_max = 350.0
			skill_particles.process_material = giga_material
			
			# Make it more dramatic with continuous emission
			skill_particles.one_shot = false
			skill_particles.emitting = true
			
			# Stop after a while
			await get_tree().create_timer(4.0).timeout
			skill_particles.emitting = false
			skill_particles.one_shot = true
	else:
		print("SkillTapUIManager: EffectsManager not available for Giga Slap success feedback.")

# Handles UI and game logic for a failed Giga Slap.
func _on_giga_slap_failure(timed_out: bool):
	print("SkillTapUIManager: Giga Slap failed. Timed out: %s" % timed_out)
	
	_play_mega_slap_sound() # Play the mega slap sound using the pool
	
	var msg = ""
	var detail_msg = ""

	if timed_out:
		Global.giga_slap_timed_out() # Penalize for timeout
		msg = "TOO SLOW!"
		detail_msg = "CHARGE LOST!"
	else: 
		# Failed the minigame but didn't time out (e.g., missed the target)
		print("SkillTapUIManager: Giga Slap missed. Performing normal Mega Slap.")
		Global.increment_girth(Global.MEGA_SLAP_MULTIPLIER, false) # 'false' for not a giga slap
		Global.update_charge() # Update charge as if it was a mega slap
		msg = "MISS! (Mega Slap)"
		detail_msg = "+" + str(Global.GIRTH_PER_TAP * Global.MEGA_SLAP_MULTIPLIER)
		
		# Use the dedicated skill particles for missed Giga Slap (only if available)
		if is_instance_valid(skill_particles):
			# Set special missed Giga Slap particle properties
			skill_particles.amount = 15 # Fewer particles
			skill_particles.lifetime = 3.0 # Shorter lifetime
			
			# Create a modified material for missed Giga Slaps
			var miss_material = skill_particles.process_material.duplicate()
			miss_material.initial_velocity_min = 150.0
			miss_material.initial_velocity_max = 250.0
			skill_particles.process_material = miss_material
			
			# Emit in one shot for missed slaps
			skill_particles.one_shot = true
			skill_particles.restart()
	
	if is_instance_valid(effects_manager):
		var base_pos = Vector2.ZERO
		if is_instance_valid(tapper_area_node):
			base_pos = tapper_area_node.global_position
		else:
			# Fallback position if TapperArea not available
			base_pos = Vector2(get_viewport().size.x / 2, get_viewport().size.y / 2)
		
		effects_manager._on_floating_number_requested(msg, base_pos - Vector2(0,60), 2.0, Color.RED, 1.3)
		if not detail_msg.is_empty():
			effects_manager._on_floating_number_requested(detail_msg, base_pos- Vector2(0,20), 2.0, Color.ORANGE, 1.1)
	else:
		print("SkillTapUIManager: EffectsManager not available for Giga Slap failure feedback.")

# Called when the SkillTapMeter times out (wrapper for timeout events)
func _on_giga_slap_timeout():
	print("SkillTapUIManager: Giga Slap timed out!")
	_on_giga_slap_failure(true)  # true indicates it was a timeout

# --- Getter (If needed by other systems, though direct calls are discouraged) ---
func get_skill_tap_meter_node():
	return skill_tap_meter_node 
