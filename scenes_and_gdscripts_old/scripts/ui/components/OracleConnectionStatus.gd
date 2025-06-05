extends Control
class_name OracleConnectionStatus

# Oracle Connection Status Widget
# Shows real-time Oracle connection and activity status

signal connection_state_changed(state: ConnectionState, health: HealthStatus)

enum ConnectionState {
	DISCONNECTED,
	CONNECTED_IDLE,
	LISTENING,
	RESPONDING,
	ERROR
}

enum HealthStatus {
	UNKNOWN,
	EXCELLENT,
	GOOD,
	DEGRADED,
	POOR,
	ERROR
}

var current_state: ConnectionState = ConnectionState.DISCONNECTED
var current_health: HealthStatus = HealthStatus.UNKNOWN

# UI Components
var status_label: Label
var icon_label: Label
var health_indicator: Panel

# Animation
var pulse_tween: Tween

func _ready():
	print("OracleConnectionStatus: Initializing connection status widget...")
	_setup_ui()
	_set_initial_state()

func _setup_ui():
	"""Setup the UI components"""
	# Main container setup
	custom_minimum_size = Vector2(200, 60)
	
	# Create status container
	var container = HBoxContainer.new()
	container.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(container)
	
	# Icon label
	icon_label = Label.new()
	icon_label.text = "⚫"
	icon_label.custom_minimum_size = Vector2(24, 24)
	icon_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	icon_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	container.add_child(icon_label)
	
	# Status text
	status_label = Label.new()
	status_label.text = "Oracle Disconnected"
	status_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	status_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	container.add_child(status_label)
	
	# Health indicator
	health_indicator = Panel.new()
	health_indicator.custom_minimum_size = Vector2(12, 12)
	health_indicator.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var style_box = StyleBoxFlat.new()
	style_box.bg_color = Color.GRAY
	style_box.corner_radius_top_left = 6
	style_box.corner_radius_top_right = 6
	style_box.corner_radius_bottom_left = 6
	style_box.corner_radius_bottom_right = 6
	health_indicator.add_theme_stylebox_override("panel", style_box)
	container.add_child(health_indicator)

func _set_initial_state():
	"""Set initial connection state"""
	set_connection_state(ConnectionState.DISCONNECTED, HealthStatus.UNKNOWN)

func set_connection_state(state: ConnectionState, health: HealthStatus = HealthStatus.UNKNOWN):
	"""Set the Oracle connection state"""
	if current_state == state and current_health == health:
		return
	
	current_state = state
	if health != HealthStatus.UNKNOWN:
		current_health = health
	
	_update_visual_state()
	emit_signal("connection_state_changed", state, current_health)

func set_oracle_listening(listening: bool):
	"""Set Oracle listening state"""
	if listening:
		set_connection_state(ConnectionState.LISTENING)
	else:
		set_connection_state(ConnectionState.CONNECTED_IDLE)

func set_oracle_responding(responding: bool):
	"""Set Oracle responding state"""
	if responding:
		set_connection_state(ConnectionState.RESPONDING)
	else:
		set_connection_state(ConnectionState.CONNECTED_IDLE)

func set_connection_health(health: HealthStatus):
	"""Update connection health without changing state"""
	current_health = health
	_update_health_indicator()

func _update_visual_state():
	"""Update visual representation based on current state"""
	_stop_animations()
	
	match current_state:
		ConnectionState.DISCONNECTED:
			icon_label.text = "⚫"
			status_label.text = "Oracle Disconnected"
			icon_label.modulate = Color.GRAY
		ConnectionState.CONNECTED_IDLE:
			icon_label.text = "🔮"
			status_label.text = "Oracle Available"
			icon_label.modulate = Color.CYAN
			_start_idle_pulse()
		ConnectionState.LISTENING:
			icon_label.text = "👁️"
			status_label.text = "Oracle Listening..."
			icon_label.modulate = Color.BLUE
			_start_listening_pulse()
		ConnectionState.RESPONDING:
			icon_label.text = "✨"
			status_label.text = "Oracle Responding..."
			icon_label.modulate = Color.GOLD
			_start_responding_pulse()
		ConnectionState.ERROR:
			icon_label.text = "❌"
			status_label.text = "Oracle Connection Error"
			icon_label.modulate = Color.RED
			_start_error_flash()
	
	_update_health_indicator()

func _update_health_indicator():
	"""Update the health indicator color"""
	if not health_indicator:
		return
	
	var color = Color.GRAY
	match current_health:
		HealthStatus.EXCELLENT:
			color = Color.GREEN
		HealthStatus.GOOD:
			color = Color.LIME_GREEN
		HealthStatus.DEGRADED:
			color = Color.YELLOW
		HealthStatus.POOR:
			color = Color.ORANGE
		HealthStatus.ERROR:
			color = Color.RED
		HealthStatus.UNKNOWN:
			color = Color.GRAY
	
	var style_box = health_indicator.get_theme_stylebox("panel")
	if style_box is StyleBoxFlat:
		style_box.bg_color = color

func _start_idle_pulse():
	"""Gentle pulse for idle state"""
	pulse_tween = create_tween()
	pulse_tween.set_loops()
	pulse_tween.tween_property(icon_label, "modulate", Color(0.6, 1.2, 1.4, 1.0), 2.0)
	pulse_tween.tween_property(icon_label, "modulate", Color.CYAN, 2.0)

func _start_listening_pulse():
	"""Pulse animation for listening state"""
	pulse_tween = create_tween()
	pulse_tween.set_loops()
	pulse_tween.tween_property(icon_label, "modulate", Color(0.6, 0.6, 1.4, 1.0), 1.0)
	pulse_tween.tween_property(icon_label, "modulate", Color.BLUE, 1.0)

func _start_responding_pulse():
	"""Rapid pulse for responding state"""
	pulse_tween = create_tween()
	pulse_tween.set_loops()
	pulse_tween.tween_property(icon_label, "modulate", Color(1.4, 1.2, 0.4, 1.0), 0.5)
	pulse_tween.tween_property(icon_label, "modulate", Color.GOLD, 0.5)

func _start_error_flash():
	"""Flash animation for error state"""
	pulse_tween = create_tween()
	pulse_tween.set_loops(3)  # Flash 3 times then stop
	pulse_tween.tween_property(icon_label, "modulate", Color(1.5, 0.5, 0.5, 1.0), 0.3)
	pulse_tween.tween_property(icon_label, "modulate", Color.RED, 0.3)

func _stop_animations():
	"""Stop any running animations"""
	if pulse_tween and pulse_tween.is_running():
		pulse_tween.kill()

# Debug and testing functions
func debug_simulate_oracle_activity():
	"""Simulate Oracle activity for testing"""
	print("OracleConnectionStatus: Simulating Oracle activity...")
	
	# Cycle through states
	set_connection_state(ConnectionState.CONNECTED_IDLE, HealthStatus.GOOD)
	
	await get_tree().create_timer(2.0).timeout
	set_oracle_listening(true)
	
	await get_tree().create_timer(3.0).timeout
	set_oracle_responding(true)
	
	await get_tree().create_timer(2.0).timeout
	set_oracle_responding(false)
	
	await get_tree().create_timer(1.0).timeout
	set_connection_state(ConnectionState.CONNECTED_IDLE, HealthStatus.EXCELLENT)

func cleanup():
	"""Clean up animations and resources"""
	_stop_animations()
	print("OracleConnectionStatus: Cleaned up") 