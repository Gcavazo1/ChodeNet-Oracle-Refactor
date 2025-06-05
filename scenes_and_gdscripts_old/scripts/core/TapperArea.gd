extends Node2D

# This script will be attached to the TapperArea scene (now a Node2D).
# The tappable interaction has been decoupled to a child TextureButton.

# References to child nodes
@onready var click_button: TextureButton = $ChodeClickZone
@onready var animated_sprite: AnimatedSprite2D = $AnimatedChode
@onready var tap_particles: GPUParticles2D = $TapParticles
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var tap_sfx_player: AudioStreamPlayer2D = $TapSFXPlayer
@onready var mega_slap_sfx_player: AudioStreamPlayer2D = $MegaSlapSFXPlayer

# New celebration particles - will be created at runtime
var celebration_particles: GPUParticles2D = null

# New dedicated audio player for milestone sounds
var milestone_sfx_player: AudioStreamPlayer2D = null

# New dedicated audio player for evolution sounds
var evolution_sfx_player: AudioStreamPlayer2D = null

# Signals for UI interactions
signal floating_number_requested(value, position)
signal achievement_unlocked(title, description, duration)
# Signal for roach interactions - emits when player taps
signal tapped(tap_position)

# Preload sound effects
const MEGA_SLAP_SFX = preload("res://assets/audio/sfx/megaSlap.ogg")
const NORMAL_TAP_SFX = preload("res://assets/audio/sfx/synth_bloop_01.ogg")
const MILESTONE_SFX = preload("res://assets/audio/sfx/milestone.ogg")
const EVOLUTION_SFX = preload("res://assets/audio/sfx/evolution.ogg")

# Evolution thresholds
const VEINOUS_VERIDIAN_THRESHOLD: int = 300 # Girth needed for first evolution (was 100)
const CRACKED_CORE_THRESHOLD: int = 1500 # Girth needed for the ultimate evolution (was 300)

# Evolution tracking
var _tier1_unlocked: bool = false
var _tier2_unlocked: bool = false

# Constants for celebration effects
const EVOLUTION_PARTICLE_COUNT: int = 20  # Base particle count for evolutions
const EVOLUTION_SCALE_FACTOR: float = 2.0  # For scaling animation during evolution
const EVOLUTION_CELEBRATORY_GIRTH_BONUS: int = 20 # Base bonus girth for evolving
const ULTIMATE_EVOLUTION_MULTIPLIER: float = 1.5 # For more epic final evolution

# Milestone feedback thresholds (to keep players engaged on the path to evolution)
const MILESTONE_THRESHOLDS = [50, 100, 150, 200, 250, 500, 750, 1000, 1250]
var _reached_milestones = []

func _ready():
	# Add TapperArea to group so roaches can find it
	add_to_group("tapper_areas")
	
	# Connect the button's pressed signal
	# Removed the redundant connection:
	# if click_button:
	# 	click_button.pressed.connect(_on_pressed) 
	# else:
	# 	push_error("ChodeClickZone button not found in TapperArea")
	# Ensure the button is actually found, the error push is still useful
	if not click_button:
		push_error("ChodeClickZone button not found in TapperArea. Check scene setup.")
	
	# Set pivot offset to the center of the button for correct scaling animation
	await get_tree().process_frame # Wait a frame to ensure size is calculated
	
	if click_button:
		# For button scaling animations
		click_button.pivot_offset = click_button.size / 2.0
	
	print("TapperArea ready.")

	# Connect to Global signals for Girth updates
	if Global:
		Global.girth_updated.connect(_on_girth_updated)
		# Check initial state in case game loads with enough girth (not relevant for demo start)
		_on_girth_updated(Global.current_girth) 
	else:
		print("ERROR: Global singleton not found in TapperArea. Cannot connect girth_updated.")
		
	# Make sure we have a default sound assigned to the tap sound player
	if tap_sfx_player and tap_sfx_player.stream == null:
		tap_sfx_player.stream = NORMAL_TAP_SFX
	
	# Make sure we have the mega slap sound assigned
	if mega_slap_sfx_player and mega_slap_sfx_player.stream == null:
		mega_slap_sfx_player.stream = MEGA_SLAP_SFX

	# The self_modulate code for simulated light has been removed, 
	# as this will now be handled by the custom shader on AnimatedChode.

	# Create the milestone sound player
	milestone_sfx_player = AudioStreamPlayer2D.new()
	milestone_sfx_player.stream = MILESTONE_SFX
	milestone_sfx_player.volume_db = 1.0 # Slightly louder than normal taps
	milestone_sfx_player.max_polyphony = 1 # Only one instance plays at a time
	add_child(milestone_sfx_player)
	print("TapperArea: Milestone sound player created")

	# Create the evolution sound player
	evolution_sfx_player = AudioStreamPlayer2D.new()
	evolution_sfx_player.stream = EVOLUTION_SFX
	evolution_sfx_player.volume_db = 2.0 # Even louder for evolution
	evolution_sfx_player.max_polyphony = 1 # Only one instance plays at a time
	add_child(evolution_sfx_player)
	print("TapperArea: Evolution sound player created")

	# Create the celebration particles at runtime to avoid scene changes
	celebration_particles = GPUParticles2D.new()
	
	# Copy initial properties from tap_particles
	if tap_particles:
		# Copy visual properties from the base particles
		celebration_particles.process_material = tap_particles.process_material.duplicate()
		celebration_particles.texture = tap_particles.texture
		
		# Copy any shader material that might be applied
		if tap_particles.material:
			celebration_particles.material = tap_particles.material.duplicate()
			
		celebration_particles.amount = 20
		celebration_particles.lifetime = 2.0
		celebration_particles.explosiveness = 0.7
		celebration_particles.one_shot = true
		celebration_particles.emitting = false
		
		# Make sure it's at the same position as tap_particles
		celebration_particles.position = tap_particles.position
		celebration_particles.z_index = tap_particles.z_index + 1 # Put it on top of regular particles
		
		add_child(celebration_particles)
		print("TapperArea: Celebration particle system created")
	else:
		push_error("TapperArea: Couldn't find tap_particles, celebration particles not created")

# Called when the ChodeClickZone button is pressed
func _on_pressed():
	# Emit the tapped signal with the global tap position for roaches
	emit_signal("tapped", get_global_mouse_position())
	
	# If Giga Slap minigame is active, notify SkillTapUIManager to evaluate the tap.
	if Global.is_giga_slap_minigame_active:
		print("TapperArea: Giga Slap minigame active, evaluating tap via SkillTapUIManager.")
		var skill_tap_managers = get_tree().get_nodes_in_group("SkillTapUIManagerGroup")
		if not skill_tap_managers.is_empty():
			var skill_tap_manager = skill_tap_managers[0] # Get the first one
			if is_instance_valid(skill_tap_manager) and skill_tap_manager.has_method("evaluate_player_tap"):
				skill_tap_manager.evaluate_player_tap()
			else:
				push_error("TapperArea: SkillTapUIManager found but is invalid or missing evaluate_player_tap() method.")
		else:
			push_error("TapperArea: Could not find SkillTapUIManager node in group 'SkillTapUIManagerGroup'.")
		return # IMPORTANT: If minigame is active, this tap is for the minigame. Do not proceed to normal tap logic.

	print("TapperArea pressed! Let the Girth flow!")
	
	var perform_giga_slap_minigame = false
	var girth_multiplier = 1 # Default to normal tap
	var _is_actual_giga_slap = false

	# Check if Mega Slap is primed (charge meter full)
	if Global.is_mega_slap_primed:
		# Check if we can attempt the Giga Slap minigame
		if Global.can_attempt_giga_slap: # This flag is set true by Global when charge meter fills
			if Global.attempt_giga_slap_minigame():
				perform_giga_slap_minigame = true
				print("TapperArea: Giga Slap Minigame initiated.")
			else: 
				girth_multiplier = Global.MEGA_SLAP_MULTIPLIER
				Global.increment_girth(girth_multiplier)
				Global.update_charge() 
		else: 
			girth_multiplier = Global.MEGA_SLAP_MULTIPLIER
			Global.increment_girth(girth_multiplier)
			Global.update_charge() 
	else:
		Global.increment_girth(girth_multiplier) 
		Global.update_charge() 

	if not perform_giga_slap_minigame:
		if tap_particles: 
			# We can now always restart tap particles since celebrations use a separate system
			tap_particles.restart()

		if animation_player:
			if girth_multiplier > 1: 
				if animation_player.has_animation("mega_slap"):
					animation_player.play("mega_slap")
				else:
					animated_sprite.scale = Vector2(0.7, 0.3)
					var tween = create_tween()
					tween.tween_property(animated_sprite, "scale", Vector2(0.4, 0.8), 0.2)
					tween.tween_property(animated_sprite, "scale", Vector2(0.55, 0.5), 0.2)
			else:
				animation_player.play("squash_stretch")

		if girth_multiplier > 1 and mega_slap_sfx_player: 
			mega_slap_sfx_player.play()
		elif girth_multiplier == 1: # Ensure this condition specifically means a normal tap
			if AudioManager:
				AudioManager.play_tap_sound() # New call to the AudioManager singleton
			else:
				printerr("TapperArea: AudioManager not found. Cannot play tap sound.")
			
		if girth_multiplier == Global.MEGA_SLAP_MULTIPLIER: 
			emit_signal("floating_number_requested", "+" + str(Global.GIRTH_PER_TAP * Global.MEGA_SLAP_MULTIPLIER), global_position)
			await get_tree().create_timer(0.1).timeout
			emit_signal("floating_number_requested", "MEGA SLAP!", global_position - Vector2(0, 30))
			await get_tree().create_timer(0.1).timeout
			emit_signal("floating_number_requested", "THUNDEROUS!", global_position - Vector2(0, 60))
		elif girth_multiplier == 1: 
			emit_signal("floating_number_requested", "+1", global_position)


func _on_girth_updated(new_girth: int):
	# Check for evolution thresholds in order
	if not _tier1_unlocked and new_girth >= VEINOUS_VERIDIAN_THRESHOLD:
		_celebrate_evolution(1) # Evolve to Tier 1 - Veinous Veridian
	elif _tier1_unlocked and not _tier2_unlocked and new_girth >= CRACKED_CORE_THRESHOLD:
		_celebrate_evolution(2) # Evolve to Tier 2 - Cracked Core Chode
	
	# Check for intermediate milestones to keep player engaged
	for milestone in MILESTONE_THRESHOLDS:
		if new_girth >= milestone and milestone not in _reached_milestones:
			_reached_milestones.append(milestone)
			_celebrate_milestone(milestone, new_girth)


# Celebrate reaching a milestone on the path to evolution
func _celebrate_milestone(milestone: int, _current_girth: int):
	# Calculate progress percentage towards next evolution
	var target_threshold = VEINOUS_VERIDIAN_THRESHOLD
	var current_tier = 0
	
	# Determine which tier we're progressing towards
	if _tier1_unlocked and !_tier2_unlocked:
		target_threshold = CRACKED_CORE_THRESHOLD
		current_tier = 1
	elif _tier1_unlocked and _tier2_unlocked:
		# Already at max tier, just celebrate the milestone
		target_threshold = CRACKED_CORE_THRESHOLD  # Use this as reference point even if we're past it
		current_tier = 2
	
	# Calculate percentage progress (cap at 99% if we're at the cusp of evolution)
	var progress_to_next_tier = int(min(float(milestone) / float(target_threshold) * 100, 99))
	
	# Show appropriate message based on tier progression
	var milestone_message = ""
	
	# Tier 0 to Tier 1 messages
	if current_tier == 0:
		if milestone == 50:
			milestone_message = "Keep tapping! Your $CHODE is showing promise!"
		elif milestone == 100:
			milestone_message = "One-third to evolution! Feeling the growth!"
		elif milestone == 150:
			milestone_message = "Halfway there! $CHODE power rising!"
		elif milestone == 200:
			milestone_message = "Getting closer! Your $CHODE is swelling with energy!"
		elif milestone == 250:
			milestone_message = "Almost there! Your $CHODE is pulsating with potential!"

	# Tier 1 to Tier 2 messages
	elif current_tier == 1:
		if milestone == 500:
			milestone_message = "One-third to ultimate form! Your veins are bulging!"
		elif milestone == 750:
			milestone_message = "Halfway to the final evolution! The pressure builds..."
		elif milestone == 1000:
			milestone_message = "Your core is straining! Almost there!"
		elif milestone == 1250:
			milestone_message = "The cracks are forming! Your core is about to split open!"

	# Already at max tier
	elif current_tier == 2:
		milestone_message = "You continue to master the power of the Cracked Core!"
	
	# Emit achievement signal if we have a message
	if milestone_message != "":
		emit_signal("achievement_unlocked", "Milestone: " + str(milestone) + " $GIRTH!", milestone_message, 3.0)
	
	# Display percentage if we're not at max tier
	var display_text = str(progress_to_next_tier) + "%!"
	if current_tier == 2:
		display_text = "EPIC!"
		
	# Emit signal for floating number
	emit_signal("floating_number_requested", display_text, global_position - Vector2(0, 30))
	
	# Small celebration animation
	var tween = create_tween()
	tween.tween_property(animated_sprite, "scale", animated_sprite.scale * 1.2, 0.2)
	tween.tween_property(animated_sprite, "scale", animated_sprite.scale, 0.2)
	
	# Play milestone celebration sound with the dedicated player
	if milestone_sfx_player:
		milestone_sfx_player.play()
	
	# Use dedicated celebration particles instead of modifying tap particles
	if celebration_particles:
		# Configure the celebration particles for milestone
		celebration_particles.amount = 10
		celebration_particles.lifetime = 1.5
		
		var celebration_material = celebration_particles.process_material.duplicate()
		celebration_material.initial_velocity_min = 150.0
		celebration_material.initial_velocity_max = 200.0
		celebration_particles.process_material = celebration_material
		
		# Emit them in one shot
		celebration_particles.restart()


# Celebrate the evolution with visual flourish
func _celebrate_evolution(tier: int):
	if animated_sprite:
		# Play the evolution sound with the dedicated player at the start
		if evolution_sfx_player:
			evolution_sfx_player.play()
			
		# First, play a celebratory animation if you have one
		if animation_player and animation_player.has_animation("evolution_celebration"):
			animation_player.play("evolution_celebration")
		else:
			# If no specific animation, create a simple scale effect
			var tween = create_tween()
			tween.tween_property(self, "scale", Vector2(EVOLUTION_SCALE_FACTOR, EVOLUTION_SCALE_FACTOR), 0.3)
			tween.tween_property(self, "scale", Vector2(1.0, 1.0), 0.3)
		
		# Change to the evolved sprite
		animated_sprite.animation = "tier_" + str(tier) + "_idle"
		
		# Set the appropriate tier flag
		if tier == 1:
			_tier1_unlocked = true
		elif tier == 2:
			_tier2_unlocked = true
		
		# Determine celebration intensity based on tier
		var particles_amount = EVOLUTION_PARTICLE_COUNT
		var particle_lifetime = 5.0
		var velocity_min = 150.0
		var velocity_max = 300.0
		var bonus_girth = EVOLUTION_CELEBRATORY_GIRTH_BONUS
		var pitch_scale = 0.3
		
		# For Cracked Core evolution, make everything more intense
		if tier == 2:
			particles_amount = int(EVOLUTION_PARTICLE_COUNT * ULTIMATE_EVOLUTION_MULTIPLIER)
			particle_lifetime = 5.0
			velocity_min = 200.0
			velocity_max = 400.0
			bonus_girth = int(EVOLUTION_CELEBRATORY_GIRTH_BONUS * ULTIMATE_EVOLUTION_MULTIPLIER)
			pitch_scale = 0.3
		
		# Use dedicated celebration particles for evolutions
		if celebration_particles:
			# Configure the celebration particles for evolution
			celebration_particles.amount = particles_amount
			celebration_particles.lifetime = particle_lifetime
			
			# Update particle process material properties
			var celebration_material = celebration_particles.process_material.duplicate()
			celebration_material.initial_velocity_min = velocity_min
			celebration_material.initial_velocity_max = velocity_max
			celebration_particles.process_material = celebration_material
			
			# Make it emit multiple times for a more dramatic effect
			celebration_particles.one_shot = false
			celebration_particles.emitting = true
			
			# Create a timer to stop emitting after a while
			var stop_timer = get_tree().create_timer(particle_lifetime * 0.8)
			await stop_timer.timeout
			celebration_particles.emitting = false
			celebration_particles.one_shot = true  # Reset to one shot for other celebrations
		
		# Award bonus girth for reaching this tier
		if Global:
			# Dramatic pause before bonus girth starts flowing
			await get_tree().create_timer(0.8).timeout
			
			for i in range(bonus_girth):
				Global.increment_girth()
				await get_tree().create_timer(0.05).timeout  # Faster increment for more excitement
		
		# Set appropriate evolution messages based on tier
		var title = ""
		var description = ""
		var tier_name = ""
		
		if tier == 1:
			tier_name = "Veinous Veridian"
			title = "CHODE EVOLVED!"
			description = "Your humble sprout has finally matured into the glorious Veinous Veridian form!"
			print("CHODE EVOLVED! Now Veinous Veridian!")
		elif tier == 2:
			tier_name = "Cracked Core"
			title = "ULTIMATE EVOLUTION!"
			description = "Your $CHODE has reached the legendary Cracked Core state! Throbbing with unfathomable girth energy!"
			print("ULTIMATE EVOLUTION! Now CRACKED CORE CHODE!")
		
		# Emit achievement signal
		emit_signal("achievement_unlocked", title, description, 5.0)
		
		# Emit signals for multiple special evolution floating texts in sequence
		emit_signal("floating_number_requested", "EVOLVED!", global_position - Vector2(0, 50))
		await get_tree().create_timer(0.2).timeout
		
		if tier == 1:
			emit_signal("floating_number_requested", "GIRTH+", global_position - Vector2(-50, 70))
		else:
			emit_signal("floating_number_requested", "MEGA GIRTH+", global_position - Vector2(-50, 70))
		
		await get_tree().create_timer(0.2).timeout
		
		if tier == 1:
			emit_signal("floating_number_requested", "LEGENDARY!", global_position - Vector2(50, 90))
		else:
			emit_signal("floating_number_requested", "GODLIKE!", global_position - Vector2(50, 90))
			
			# For tier 2, add extra floating text celebration
			await get_tree().create_timer(0.3).timeout
			emit_signal("floating_number_requested", "CORE CRACKED!", global_position - Vector2(0, 110))
			
		# Notify OracleEventEmitter about the evolution
		if get_node_or_null("/root/OracleEventEmitter"):
			var current_girth = Global.current_girth if Global else 0
			get_node("/root/OracleEventEmitter").notify_evolution(tier, tier_name, current_girth)


# Placeholder for functions to update Chode visuals for more tiers later
# func update_chode_visual(girth_tier_index: int):
# 	 match girth_tier_index:
# 		 0:
# 			 # animated_sprite.animation = "humble_sprout"
# 			 # animated_sprite.visible = true # Or manage visibility based on tier logic
# 			 print("Chode visual: Humble Sprout")
# 		 1:
# 			 # animated_sprite.animation = "veinous_veridian"
# 			 # animated_sprite.visible = true
# 			 print("Chode visual: Veinous Veridian")
# 		 _: # Default or error case
# 			 # animated_sprite.visible = false
# 			 print("Unknown Girth tier for visual update: ", girth_tier_index) 
