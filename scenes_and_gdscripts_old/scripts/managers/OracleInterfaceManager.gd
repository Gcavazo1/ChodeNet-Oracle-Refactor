extends Node
class_name OracleInterfaceManager

# Handles Oracle communication with parent page
signal oracle_panel_requested(panel_type: String)
signal unread_count_changed(count: int)
signal oracle_action_sent(action: Dictionary)

var unread_prophecies: int = 0
var oracle_event_emitter: Node = null

# UI Components (will be set by MainLayout)
var oracle_button: Button = null
var oracle_counter_label: Label = null

func _ready():
	print("OracleInterfaceManager: Initializing...")
	# Find OracleEventEmitter for parent communication
	call_deferred("_find_oracle_event_emitter")

func _find_oracle_event_emitter():
	# Try to find OracleEventEmitter in the scene tree
	oracle_event_emitter = get_node_or_null("/root/Main/OracleEventEmitter")
	if not oracle_event_emitter:
		oracle_event_emitter = get_node_or_null("/root/OracleEventEmitter")
	if not oracle_event_emitter:
		# Search the tree for it
		oracle_event_emitter = _find_node_by_name(get_tree().root, "OracleEventEmitter")
	
	if oracle_event_emitter:
		print("OracleInterfaceManager: Found OracleEventEmitter")
	else:
		print("OracleInterfaceManager: OracleEventEmitter not found")

func _find_node_by_name(node: Node, node_name: String) -> Node:
	if node.name == node_name:
		return node
	for child in node.get_children():
		var found = _find_node_by_name(child, node_name)
		if found:
			return found
	return null

func set_ui_components(p_oracle_button: Button, p_counter_label: Label):
	oracle_button = p_oracle_button
	oracle_counter_label = p_counter_label
	
	if oracle_button and not oracle_button.is_connected("pressed", Callable(self, "_on_oracle_button_pressed")):
		oracle_button.connect("pressed", Callable(self, "_on_oracle_button_pressed"))
	
	# Update UI immediately
	_update_oracle_ui()

func request_oracle_panel():
	print("OracleInterfaceManager: Oracle panel requested")
	var message = {
		"action": "show_oracle_interface",
		"unread_count": unread_prophecies,
		"timestamp": Time.get_unix_time_from_system()
	}
	send_oracle_action_to_parent(message)
	
	# Mark prophecies as read when accessing Oracle
	mark_prophecies_as_read()
	
	emit_signal("oracle_panel_requested", "main")

func handle_prophecy_notification(data: Dictionary):
	print("OracleInterfaceManager: Received prophecy notification: ", data)
	if data.has("unread_count"):
		var old_count = unread_prophecies
		unread_prophecies = data.get("unread_count", 0)
		if old_count != unread_prophecies:
			emit_signal("unread_count_changed", unread_prophecies)
			_update_oracle_ui()
	
	# If we have specific prophecy data, we could process it here
	if data.has("title") and data.has("content"):
		print("OracleInterfaceManager: New prophecy - ", data.get("title", "Unknown"))

func mark_prophecies_as_read():
	if unread_prophecies > 0:
		var old_count = unread_prophecies
		unread_prophecies = 0
		emit_signal("unread_count_changed", unread_prophecies)
		_update_oracle_ui()
		
		# Send notification to parent that prophecies were viewed
		var message = {
			"action": "oracle_messages_viewed",
			"previously_unread": old_count,
			"timestamp": Time.get_unix_time_from_system()
		}
		send_oracle_action_to_parent(message)

func send_oracle_action_to_parent(action: Dictionary):
	if oracle_event_emitter and oracle_event_emitter.has_method("_send_event_to_parent"):
		# Create a standardized Oracle event for the parent page
		var oracle_event = {
			"session_id": oracle_event_emitter.session_id if oracle_event_emitter.has_method("get") else "unknown",
			"event_type": "oracle_interface_action",
			"timestamp_utc": oracle_event_emitter._get_iso_timestamp() if oracle_event_emitter.has_method("_get_iso_timestamp") else Time.get_datetime_string_from_system(true, false) + "Z",
			"player_address": Global.player_solana_address if Global else "",
			"event_payload": action
		}
		oracle_event_emitter._send_event_to_parent(oracle_event)
		emit_signal("oracle_action_sent", action)
		print("OracleInterfaceManager: Sent Oracle action to parent: ", action)
	else:
		print("OracleInterfaceManager: Cannot send to parent - OracleEventEmitter not available")

func increment_unread_count(increment: int = 1):
	unread_prophecies += increment
	emit_signal("unread_count_changed", unread_prophecies)
	_update_oracle_ui()

func get_unread_count() -> int:
	return unread_prophecies

func _on_oracle_button_pressed():
	print("OracleInterfaceManager: Oracle button pressed")
	request_oracle_panel()

func _update_oracle_ui():
	if not oracle_button or not oracle_counter_label:
		return
	
	# Update the Oracle button text and counter
	if unread_prophecies > 0:
		oracle_button.text = "Oracle"
		oracle_counter_label.text = str(unread_prophecies)
		oracle_counter_label.visible = true
		# Add some visual emphasis for unread prophecies
		oracle_counter_label.modulate = Color(1.0, 0.8, 0.2, 1.0) # Gold color
	else:
		oracle_button.text = "Oracle"
		oracle_counter_label.text = ""
		oracle_counter_label.visible = false

# Simulate receiving a prophecy (for testing)
func simulate_prophecy_received(title: String = "Test Prophecy", content: String = "The Oracle speaks..."):
	var prophecy_data = {
		"title": title,
		"content": content,
		"unread_count": unread_prophecies + 1
	}
	handle_prophecy_notification(prophecy_data)

# Handle messages from parent page (if needed in the future)
func handle_parent_message(message: Dictionary):
	print("OracleInterfaceManager: Received message from parent: ", message)
	if message.has("type"):
		match message.get("type"):
			"prophecy_notification":
				handle_prophecy_notification(message.get("data", {}))
			"oracle_viewed":
				mark_prophecies_as_read()
			"unread_count_update":
				if message.has("count"):
					unread_prophecies = message.get("count", 0)
					emit_signal("unread_count_changed", unread_prophecies)
					_update_oracle_ui() 