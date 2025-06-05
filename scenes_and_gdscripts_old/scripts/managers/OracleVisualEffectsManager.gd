extends Node
class_name OracleVisualEffectsManager

# Oracle Visual Effects Manager
# Handles all Oracle-related visual states, animations, and effects
# 🔮 Phase A: Game-side enhancements that feel integrated with parent Oracle

# --- Node References ---
var oracle_button: Button = null
var oracle_counter: Label = null
var notification_system: Control = null

# --- Visual State Management ---
var current_button_state: OracleButtonState = OracleButtonState.IDLE
var current_unread_count: int = 0
var is_oracle_connected: bool = false

# --- Animation Properties ---
var button_tween: Tween = null
var counter_tween: Tween = null
var notification_tween: Tween = null

# --- Oracle Button States ---
enum OracleButtonState {
	IDLE,
	NEW_PROPHECY,
	ACTIVE,
	ERROR
}

# --- Visual Properties ---
const BUTTON_STATE_COLORS = {
	OracleButtonState.IDLE: Color(0.6, 0.6, 0.8, 1.0),  # Subtle blue-gray
	OracleButtonState.NEW_PROPHECY: Color(1.0, 0.8, 0.2, 1.0),  # Golden aura
	OracleButtonState.ACTIVE: Color(0.4, 0.9, 1.0, 1.0),  # Bright blue highlight
	OracleButtonState.ERROR: Color(1.0, 0.3, 0.3, 1.0)   # Red tint
}

const BUTTON_STATE_MODULATES = {
	OracleButtonState.IDLE: Color(1.0, 1.0, 1.0, 1.0),
	OracleButtonState.NEW_PROPHECY: Color(1.2, 1.1, 0.8, 1.0),
	OracleButtonState.ACTIVE: Color(1.1, 1.3, 1.4, 1.0),
	OracleButtonState.ERROR: Color(1.3, 0.7, 0.7, 1.0)
}

const COUNTER_COLORS = {
	"default": Color(1.0, 1.0, 1.0, 1.0),
	"new": Color(1.0, 0.8, 0.2, 1.0),
	"highlight": Color(0.4, 0.9, 1.0, 1.0)
}

# --- Signals ---
signal oracle_visual_state_changed(new_state: OracleButtonState)
signal prophecy_notification_shown(title: String, message: String)
signal oracle_connection_status_changed(is_connected: bool, health: String)

func _ready():
	print("OracleVisualEffectsManager: Initializing Oracle visual effects system...")

func initialize(button: Button, counter: Label, notification_panel: Control):
	"""Initialize the visual effects manager with UI components"""
	oracle_button = button
	oracle_counter = counter
	notification_system = notification_panel
	
	# Set initial state
	set_oracle_button_state(OracleButtonState.IDLE)
	update_unread_count(0, false)
	
	print("OracleVisualEffectsManager: ✅ Initialized with UI components")

# --- Oracle Button Visual States ---
func set_oracle_button_state(new_state: OracleButtonState):
	"""Set the Oracle button visual state with appropriate animations"""
	if current_button_state == new_state:
		return
	
	var old_state = current_button_state
	current_button_state = new_state
	
	print("OracleVisualEffectsManager: Button state changed from %s to %s" % [
		OracleButtonState.keys()[old_state],
		OracleButtonState.keys()[new_state]
	])
	
	_apply_button_visual_state(new_state)
	emit_signal("oracle_visual_state_changed", new_state)

func _apply_button_visual_state(state: OracleButtonState):
	"""Apply visual styling for the given Oracle button state"""
	if not oracle_button:
		return
	
	_stop_button_animations()
	
	match state:
		OracleButtonState.IDLE:
			_start_idle_pulse()
		OracleButtonState.NEW_PROPHECY:
			_start_prophecy_aura()
		OracleButtonState.ACTIVE:
			_start_active_highlight()
		OracleButtonState.ERROR:
			_start_error_flash()

func _start_idle_pulse():
	"""Subtle pulsing glow for idle state"""
	if not oracle_button:
		return
	
	oracle_button.modulate = BUTTON_STATE_MODULATES[OracleButtonState.IDLE]
	
	button_tween = create_tween()
	button_tween.set_loops()
	button_tween.tween_property(oracle_button, "modulate", Color(0.9, 0.9, 1.1, 1.0), 3.0)
	button_tween.tween_property(oracle_button, "modulate", BUTTON_STATE_MODULATES[OracleButtonState.IDLE], 3.0)

func _start_prophecy_aura():
	"""Golden aura animation for new prophecy"""
	if not oracle_button:
		return
	
	oracle_button.modulate = BUTTON_STATE_MODULATES[OracleButtonState.NEW_PROPHECY]
	
	button_tween = create_tween()
	button_tween.set_loops()
	button_tween.tween_property(oracle_button, "modulate", Color(1.4, 1.3, 0.6, 1.0), 1.5)
	button_tween.tween_property(oracle_button, "modulate", BUTTON_STATE_MODULATES[OracleButtonState.NEW_PROPHECY], 1.5)

func _start_active_highlight():
	"""Bright highlight for active state"""
	if not oracle_button:
		return
	
	oracle_button.modulate = BUTTON_STATE_MODULATES[OracleButtonState.ACTIVE]
	
	button_tween = create_tween()
	button_tween.set_loops()
	button_tween.tween_property(oracle_button, "modulate", Color(1.3, 1.5, 1.6, 1.0), 0.5)
	button_tween.tween_property(oracle_button, "modulate", BUTTON_STATE_MODULATES[OracleButtonState.ACTIVE], 0.5)

func _start_error_flash():
	"""Red tint flash for error state"""
	if not oracle_button:
		return
	
	oracle_button.modulate = BUTTON_STATE_MODULATES[OracleButtonState.ERROR]
	
	button_tween = create_tween()
	button_tween.set_loops(3)  # Flash 3 times then stop
	button_tween.tween_property(oracle_button, "modulate", Color(1.6, 0.5, 0.5, 1.0), 0.3)
	button_tween.tween_property(oracle_button, "modulate", BUTTON_STATE_MODULATES[OracleButtonState.ERROR], 0.3)

func _stop_button_animations():
	"""Stop any current button animations"""
	if button_tween and button_tween.is_running():
		button_tween.kill()

# --- Counter Visual Effects ---
func update_unread_count(count: int, animate: bool = true):
	"""Update the unread count with optional animation"""
	if not oracle_counter:
		return
	
	var was_zero = current_unread_count == 0
	var is_zero = count == 0
	current_unread_count = count
	
	# Update counter text
	if count > 0:
		oracle_counter.text = str(count)
		oracle_counter.visible = true
	else:
		oracle_counter.text = ""
		oracle_counter.visible = false
	
	# Animate if requested and count changed
	if animate and (was_zero != is_zero or count > current_unread_count):
		if count > 0:
			_animate_counter_appearance()
		else:
			_animate_counter_disappearance()
	
	print("OracleVisualEffectsManager: Counter updated to %d" % count)

func _animate_counter_appearance():
	"""Animate counter appearing with bounce effect"""
	if not oracle_counter:
		return
	
	_stop_counter_animations()
	
	oracle_counter.modulate = COUNTER_COLORS["new"]
	oracle_counter.scale = Vector2(0.3, 0.3)
	
	counter_tween = create_tween()
	counter_tween.set_parallel(true)
	
	# Scale bounce animation
	counter_tween.tween_property(oracle_counter, "scale", Vector2(1.3, 1.3), 0.3).set_ease(Tween.EASE_OUT)
	counter_tween.tween_property(oracle_counter, "scale", Vector2(1.0, 1.0), 0.2).set_delay(0.3).set_ease(Tween.EASE_IN)
	
	# Color flash
	counter_tween.tween_property(oracle_counter, "modulate", COUNTER_COLORS["highlight"], 0.4)
	counter_tween.tween_property(oracle_counter, "modulate", COUNTER_COLORS["default"], 0.3).set_delay(0.4)

func _animate_counter_disappearance():
	"""Animate counter disappearing with fade effect"""
	if not oracle_counter:
		return
	
	_stop_counter_animations()
	
	counter_tween = create_tween()
	counter_tween.set_parallel(true)
	
	counter_tween.tween_property(oracle_counter, "scale", Vector2(0.0, 0.0), 0.3).set_ease(Tween.EASE_IN)
	counter_tween.tween_property(oracle_counter, "modulate:a", 0.0, 0.3)
	counter_tween.tween_callback(func(): oracle_counter.visible = false).set_delay(0.3)

func _stop_counter_animations():
	"""Stop any current counter animations"""
	if counter_tween and counter_tween.is_running():
		counter_tween.kill()

# --- Prophecy Notification System ---
func show_prophecy_notification(title: String, message: String, duration: float = 4.0):
	"""Show a prophecy notification with Oracle-specific styling"""
	if not notification_system:
		print("OracleVisualEffectsManager: Warning - No notification system available")
		return
	
	print("OracleVisualEffectsManager: Showing prophecy notification: %s" % title)
	
	# Use the enhanced AchievementPanel for Oracle notifications
	if notification_system.has_method("show_oracle_notification"):
		notification_system.show_oracle_notification(title, message, duration)
	else:
		# Fallback to regular achievement display
		if notification_system.has_method("show_achievement"):
			notification_system.show_achievement("🔮 " + title, message, duration)
	
	emit_signal("prophecy_notification_shown", title, message)

# --- Connection Status Management ---
func update_oracle_connection_status(connected: bool, health: String = "good"):
	"""Update Oracle connection status"""
	is_oracle_connected = connected
	
	# Update button state based on connection
	if not connected:
		set_oracle_button_state(OracleButtonState.ERROR)
	elif current_unread_count > 0:
		set_oracle_button_state(OracleButtonState.NEW_PROPHECY)
	else:
		set_oracle_button_state(OracleButtonState.IDLE)
	
	emit_signal("oracle_connection_status_changed", connected, health)

# --- Debug and Testing Functions ---
func debug_cycle_states():
	"""Cycle through all Oracle button states for testing"""
	print("OracleVisualEffectsManager: Cycling through button states...")
	
	var states = [
		OracleButtonState.IDLE,
		OracleButtonState.NEW_PROPHECY,
		OracleButtonState.ACTIVE,
		OracleButtonState.ERROR
	]
	
	var state_index = 0
	var debug_timer = Timer.new()
	debug_timer.wait_time = 2.0
	debug_timer.timeout.connect(func():
		if state_index < states.size():
			set_oracle_button_state(states[state_index])
			state_index += 1
		else:
			debug_timer.queue_free()
			set_oracle_button_state(OracleButtonState.IDLE)
	)
	add_child(debug_timer)
	debug_timer.start()

func debug_test_counter_animation():
	"""Test counter animation with incremental values"""
	print("OracleVisualEffectsManager: Testing counter animations...")
	
	var counter_values = [0, 1, 3, 7, 0]
	var value_index = 0
	
	var debug_timer = Timer.new()
	debug_timer.wait_time = 1.5
	debug_timer.timeout.connect(func():
		if value_index < counter_values.size():
			update_unread_count(counter_values[value_index], true)
			value_index += 1
		else:
			debug_timer.queue_free()
	)
	add_child(debug_timer)
	debug_timer.start()

func debug_test_prophecy_notification():
	"""Test prophecy notification system"""
	print("OracleVisualEffectsManager: Testing prophecy notifications...")
	
	var test_prophecies = [
		{
			"title": "Vision of Power",
			"message": "Your tapping prowess shall multiply threefold under the crimson moon.",
			"duration": 3.0
		},
		{
			"title": "Ancient Wisdom",
			"message": "The path to ultimate girth lies through persistent dedication and mystical upgrades.",
			"duration": 4.0
		},
		{
			"title": "Ethereal Guidance",
			"message": "Beware the rats that skitter in shadows - they herald great fortune for the prepared.",
			"duration": 5.0
		}
	]
	
	var prophecy_index = 0
	var debug_timer = Timer.new()
	debug_timer.wait_time = 6.0
	debug_timer.timeout.connect(func():
		if prophecy_index < test_prophecies.size():
			var prophecy = test_prophecies[prophecy_index]
			show_prophecy_notification(prophecy["title"], prophecy["message"], prophecy["duration"])
			prophecy_index += 1
		else:
			debug_timer.queue_free()
	)
	add_child(debug_timer)
	debug_timer.start()

# --- Public Interface ---
func get_current_button_state() -> OracleButtonState:
	return current_button_state

func get_current_unread_count() -> int:
	return current_unread_count

func get_oracle_connection_state() -> bool:
	return is_oracle_connected

# --- Cleanup ---
func cleanup():
	"""Clean up animations and references"""
	print("OracleVisualEffectsManager: Cleaning up visual effects...")
	
	_stop_button_animations()
	_stop_counter_animations()
	
	if notification_tween and notification_tween.is_running():
		notification_tween.kill()
	
	oracle_button = null
	oracle_counter = null
	notification_system = null

func _exit_tree():
	cleanup() 
