extends Control

signal achievement_displayed
signal achievement_hidden
signal oracle_notification_displayed
signal oracle_notification_hidden

@onready var panel = $PanelContainer
@onready var name_label = $PanelContainer/VBoxContainer/AchievementNameLabel
@onready var desc_label = $PanelContainer/VBoxContainer/AchievementDescLabel
@onready var display_timer = $DisplayTimer

var tween: Tween
var glitch_timer: Timer
var is_glitching = false
var is_oracle_mode = false  # NEW: Track if we're showing Oracle content

# Oracle-specific colors and effects
const ORACLE_GOLDEN = Color(1.0, 0.8, 0.2, 1.0)
const ORACLE_MYSTICAL = Color(0.6, 0.4, 1.0, 1.0)
const ORACLE_ETHEREAL = Color(0.4, 0.9, 1.0, 1.0)

func _ready():
	panel.visible = false
	
	# Create glitch timer for random glitch effects
	glitch_timer = Timer.new()
	glitch_timer.wait_time = randf_range(0.5, 1.5)
	glitch_timer.autostart = false
	glitch_timer.one_shot = true
	glitch_timer.timeout.connect(_on_glitch_timer_timeout)
	add_child(glitch_timer)

func show_achievement(title: String, description: String, duration: float = 3.0):
	is_oracle_mode = false
	_show_notification(title, description, duration, false)
	emit_signal("achievement_displayed")

# NEW: Oracle notification method
func show_oracle_notification(title: String, description: String, duration: float = 4.0):
	is_oracle_mode = true
	_show_notification("🔮 " + title, description, duration, true)
	emit_signal("oracle_notification_displayed")

func _show_notification(title: String, description: String, duration: float, oracle_style: bool):
	# Update the text content
	name_label.text = title.to_upper()
	desc_label.text = description
	
	# Make sure any previous tween is stopped and reset
	if tween and tween.is_running():
		tween.kill()
	
	# Reset panel state
	panel.modulate = Color(1, 1, 1, 0)
	panel.scale = Vector2(0.8, 0.8)
	panel.visible = true
	
	# Apply Oracle-specific styling
	if oracle_style:
		_apply_oracle_styling()
	else:
		_apply_achievement_styling()
	
	# Create animation tween
	tween = create_tween()
	tween.set_parallel(true)
	
	if oracle_style:
		# Oracle-specific entrance animation
		tween.tween_property(panel, "modulate", Color(1, 1, 1, 1), 0.7).set_ease(Tween.EASE_OUT)
		tween.tween_property(panel, "scale", Vector2(1, 1), 0.7).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_ELASTIC)
		
		# Add mystical glow effect
		_add_oracle_glow_effect()
	else:
		# Standard achievement animation
		tween.tween_property(panel, "modulate", Color(1, 1, 1, 1), 0.5).set_ease(Tween.EASE_OUT)
		tween.tween_property(panel, "scale", Vector2(1, 1), 0.5).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)
	
	# Update timer duration
	display_timer.wait_time = duration
	display_timer.start()
	
	# Start the glitch effects (different patterns for Oracle vs Achievement)
	is_glitching = true
	_schedule_next_glitch()

func _apply_oracle_styling():
	# Oracle-specific visual styling
	if panel.has_theme_stylebox_override("panel"):
		var oracle_style = panel.get_theme_stylebox("panel").duplicate()
		if oracle_style is StyleBoxFlat:
			oracle_style.border_color = ORACLE_GOLDEN
			oracle_style.shadow_color = ORACLE_MYSTICAL
			oracle_style.shadow_size = 12
			panel.add_theme_stylebox_override("panel", oracle_style)
	
	# Update text colors for Oracle theme
	name_label.add_theme_color_override("font_color", ORACLE_GOLDEN)
	desc_label.add_theme_color_override("font_color", ORACLE_ETHEREAL)

func _apply_achievement_styling():
	# Reset to default achievement styling
	if panel.has_theme_stylebox_override("panel"):
		panel.remove_theme_stylebox_override("panel")
	
	# Reset text colors
	name_label.remove_theme_color_override("font_color")
	desc_label.remove_theme_color_override("font_color")

func _add_oracle_glow_effect():
	# Create a subtle pulsing glow for Oracle notifications
	var glow_tween = create_tween()
	glow_tween.set_loops()
	glow_tween.set_parallel(true)
	
	# Gentle golden pulse
	glow_tween.tween_property(name_label, "modulate", ORACLE_GOLDEN * 1.2, 1.5)
	glow_tween.tween_property(name_label, "modulate", ORACLE_GOLDEN, 1.5)
	
	# Ethereal desc pulse with offset timing
	glow_tween.tween_property(desc_label, "modulate", ORACLE_ETHEREAL * 1.1, 2.0).set_delay(0.5)
	glow_tween.tween_property(desc_label, "modulate", ORACLE_ETHEREAL, 2.0).set_delay(2.5)

func hide_achievement():
	if panel.visible:
		# Stop glitching
		is_glitching = false
		glitch_timer.stop()
		
		# Create hide animation
		tween = create_tween()
		tween.set_parallel(true)
		
		if is_oracle_mode:
			# Oracle-specific exit animation
			tween.tween_property(panel, "modulate", Color(1, 1, 1, 0), 0.7).set_ease(Tween.EASE_IN)
			tween.tween_property(panel, "scale", Vector2(1.2, 1.2), 0.7).set_ease(Tween.EASE_IN)
			tween.tween_callback(func(): 
				panel.visible = false
				_reset_oracle_styling()
			).set_delay(0.7)
			
			emit_signal("oracle_notification_hidden")
		else:
			# Standard achievement exit
			tween.tween_property(panel, "modulate", Color(1, 1, 1, 0), 0.5).set_ease(Tween.EASE_IN)
			tween.tween_property(panel, "scale", Vector2(1.1, 1.1), 0.5).set_ease(Tween.EASE_IN)
			tween.tween_callback(func(): panel.visible = false).set_delay(0.5)
			
			emit_signal("achievement_hidden")

func _reset_oracle_styling():
	# Clean up Oracle-specific styling
	name_label.modulate = Color.WHITE
	desc_label.modulate = Color.WHITE
	_apply_achievement_styling()

func _schedule_next_glitch():
	if is_glitching:
		if is_oracle_mode:
			# Oracle notifications have more mystical, less chaotic glitches
			glitch_timer.wait_time = randf_range(1.0, 3.0)
		else:
			# Achievement glitches are more frequent and chaotic
			glitch_timer.wait_time = randf_range(0.5, 2.0)
		glitch_timer.start()

func _on_glitch_timer_timeout():
	if is_glitching and panel.visible:
		# Apply a random glitch effect
		if is_oracle_mode:
			_apply_oracle_glitch_effect()
		else:
			_apply_glitch_effect()
		_schedule_next_glitch()

func _apply_oracle_glitch_effect():
	# Oracle-specific glitch effects (more mystical, less harsh)
	var glitch_type = randi() % 5
	var glitch_tween = create_tween()
	glitch_tween.set_parallel(true)
	
	match glitch_type:
		0: # Mystical color shift
			var mystical_color = Color(
				randf_range(0.6, 1.0), 
				randf_range(0.4, 0.9), 
				randf_range(0.8, 1.0),
				1.0
			)
			glitch_tween.tween_property(panel, "modulate", mystical_color, 0.2)
			glitch_tween.tween_property(panel, "modulate", Color(1, 1, 1, 1), 0.3).set_delay(0.25)
		
		1: # Gentle ethereal flutter
			var original_pos = panel.position
			var flutter = Vector2(randf_range(-3, 3), randf_range(-2, 2))
			glitch_tween.tween_property(panel, "position", original_pos + flutter, 0.15)
			glitch_tween.tween_property(panel, "position", original_pos, 0.15).set_delay(0.2)
		
		2: # Oracle aura pulse
			var original_scale = panel.scale
			var scale_pulse = Vector2(randf_range(1.02, 1.08), randf_range(1.02, 1.08))
			glitch_tween.tween_property(panel, "scale", original_scale * scale_pulse, 0.3)
			glitch_tween.tween_property(panel, "scale", original_scale, 0.3).set_delay(0.35)
			
		3: # Golden text shimmer
			var original_name_color = name_label.modulate
			var shimmer_color = ORACLE_GOLDEN * randf_range(1.3, 1.8)
			
			glitch_tween.tween_property(name_label, "modulate", shimmer_color, 0.2)
			glitch_tween.tween_property(name_label, "modulate", original_name_color, 0.4).set_delay(0.25)
		
		4: # Mystical opacity wave
			var original_alpha = panel.modulate.a
			glitch_tween.tween_property(panel, "modulate:a", original_alpha * 0.7, 0.2)
			glitch_tween.tween_property(panel, "modulate:a", original_alpha, 0.3).set_delay(0.25)

func _apply_glitch_effect():
	var glitch_type = randi() % 4
	var glitch_tween = create_tween()
	glitch_tween.set_parallel(true)
	
	match glitch_type:
		0: # Color shift
			var random_color = Color(
				randf_range(0.8, 1.0), 
				randf_range(0.0, 0.8), 
				randf_range(0.8, 1.0),
				1.0
			)
			glitch_tween.tween_property(panel, "modulate", random_color, 0.1)
			glitch_tween.tween_property(panel, "modulate", Color(1, 1, 1, 1), 0.1).set_delay(0.15)
		
		1: # Position jitter
			var original_pos = panel.position
			var jitter = Vector2(randf_range(-5, 5), randf_range(-5, 5))
			glitch_tween.tween_property(panel, "position", original_pos + jitter, 0.05)
			glitch_tween.tween_property(panel, "position", original_pos, 0.05).set_delay(0.1)
		
		2: # Scale glitch
			var original_scale = panel.scale
			var scale_mod = Vector2(randf_range(0.95, 1.05), randf_range(0.95, 1.05))
			glitch_tween.tween_property(panel, "scale", original_scale * scale_mod, 0.1)
			glitch_tween.tween_property(panel, "scale", original_scale, 0.1).set_delay(0.15)
			
		3: # Text color glitch
			var original_name_color = name_label.get("theme_override_colors/font_color")
			var original_desc_color = desc_label.get("theme_override_colors/font_color")
			
			var glitch_name_color = Color(
				randf_range(0.8, 1.0),
				randf_range(0.8, 1.0),
				randf_range(0.0, 0.2),
				1.0
			)
			var glitch_desc_color = Color(
				randf_range(0.0, 0.2),
				randf_range(0.8, 1.0), 
				randf_range(0.8, 1.0),
				1.0
			)
			
			glitch_tween.tween_property(name_label, "theme_override_colors/font_color", glitch_name_color, 0.1)
			glitch_tween.tween_property(desc_label, "theme_override_colors/font_color", glitch_desc_color, 0.1)
			glitch_tween.tween_property(name_label, "theme_override_colors/font_color", original_name_color, 0.1).set_delay(0.15)
			glitch_tween.tween_property(desc_label, "theme_override_colors/font_color", original_desc_color, 0.1).set_delay(0.15)

func _on_display_timer_timeout():
	hide_achievement() 
