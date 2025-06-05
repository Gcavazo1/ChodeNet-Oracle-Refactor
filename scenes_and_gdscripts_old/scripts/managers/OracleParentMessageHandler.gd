extends Node
class_name OracleParentMessageHandler

# Handles incoming messages from Oracle parent page
signal prophecy_received(data: Dictionary)
signal oracle_unread_count_updated(count: int)
signal parent_message_received(message: Dictionary)

var oracle_interface_manager: OracleInterfaceManager = null
var is_listening: bool = false

func _ready():
	print("OracleParentMessageHandler: Initializing parent communication...")
	call_deferred("_setup_javascript_listener")

func set_oracle_interface_manager(p_oracle_manager: OracleInterfaceManager):
	"""Set reference to Oracle Interface Manager"""
	oracle_interface_manager = p_oracle_manager
	print("OracleParentMessageHandler: Oracle Interface Manager connected")

func _setup_javascript_listener():
	"""Setup JavaScript listener for parent page messages"""
	if not OS.has_feature("JavaScript"):
		print("OracleParentMessageHandler: Not in HTML5 environment, parent message listening disabled")
		return
	
	# Create a global JavaScript function that Godot can call
	var js_setup = """
	window.chodeNetOracleMessageHandler = {
		sendToGodot: function(messageData) {
			console.log('Oracle Parent Message Handler: Received message for Godot:', messageData);
			if (typeof JavaScriptBridge !== 'undefined' && JavaScriptBridge.eval) {
				var messageJson = JSON.stringify(messageData);
				var gdscriptCall = "get_node('/root/MainLayout/OracleParentMessageHandler')._on_parent_message_received('" + 
					messageJson.replace(/'/g, "\\\\'") + "')";
				JavaScriptBridge.eval(gdscriptCall);
			}
		}
	};
	
	// Listen for messages from parent
	window.addEventListener('message', function(event) {
		console.log('Oracle Parent Message Handler: Raw message received:', event.data);
		
		// Check if this is an Oracle message for the game
		if (event.data && typeof event.data === 'object') {
			if (event.data.event === 'oracle_update_unread_count') {
				console.log('Oracle Parent Message Handler: Unread count update:', event.data.count);
				window.chodeNetOracleMessageHandler.sendToGodot({
					type: 'unread_count_update',
					count: event.data.count
				});
			} else if (event.data.event === 'new_prophecy_notification') {
				console.log('Oracle Parent Message Handler: New prophecy notification:', event.data);
				window.chodeNetOracleMessageHandler.sendToGodot({
					type: 'prophecy_notification',
					data: event.data
				});
			} else if (event.data.type === 'oracle_viewed') {
				console.log('Oracle Parent Message Handler: Oracle viewed by parent');
				window.chodeNetOracleMessageHandler.sendToGodot({
					type: 'oracle_viewed'
				});
			}
		}
	});
	
	console.log('Oracle Parent Message Handler: JavaScript listener setup complete');
	"""
	
	JavaScriptBridge.eval(js_setup)
	is_listening = true
	print("OracleParentMessageHandler: JavaScript listener setup complete")

func _on_parent_message_received(message_json: String):
	"""Called by JavaScript when a message is received from parent"""
	print("OracleParentMessageHandler: Processing parent message: ", message_json)
	
	var parsed_message = JSON.parse_string(message_json)
	if parsed_message == null:
		push_error("OracleParentMessageHandler: Failed to parse message JSON: " + message_json)
		return
	
	if not parsed_message is Dictionary:
		push_error("OracleParentMessageHandler: Message is not a dictionary: " + str(parsed_message))
		return
	
	var message_data = parsed_message as Dictionary
	emit_signal("parent_message_received", message_data)
	
	# Handle specific message types
	match message_data.get("type", ""):
		"unread_count_update":
			var count = message_data.get("count", 0)
			print("OracleParentMessageHandler: Updating unread count to: ", count)
			if oracle_interface_manager:
				oracle_interface_manager.handle_prophecy_notification({"unread_count": count})
			emit_signal("oracle_unread_count_updated", count)
		
		"prophecy_notification":
			var prophecy_data = message_data.get("data", {})
			print("OracleParentMessageHandler: New prophecy notification: ", prophecy_data)
			if oracle_interface_manager:
				oracle_interface_manager.handle_prophecy_notification(prophecy_data)
			emit_signal("prophecy_received", prophecy_data)
		
		"oracle_viewed":
			print("OracleParentMessageHandler: Oracle was viewed by parent, marking messages as read")
			if oracle_interface_manager:
				oracle_interface_manager.mark_prophecies_as_read()
		
		_:
			print("OracleParentMessageHandler: Unknown message type: ", message_data.get("type", "undefined"))

func send_test_message_to_parent():
	"""Send a test message to parent (for debugging)"""
	var oracle_event_emitter = get_node_or_null("/root/Main/OracleEventEmitter")
	if oracle_event_emitter and oracle_event_emitter.has_method("_send_event_to_parent"):
		var test_message = {
			"session_id": "test_session",
			"event_type": "oracle_interface_action",
			"timestamp_utc": Time.get_datetime_string_from_system(true, false) + "Z",
			"player_address": "",
			"event_payload": {
				"action": "test_connection",
				"message": "Testing parent-game communication"
			}
		}
		oracle_event_emitter._send_event_to_parent(test_message)
		print("OracleParentMessageHandler: Sent test message to parent")
	else:
		print("OracleParentMessageHandler: Could not find OracleEventEmitter for test message")

func get_listening_status() -> bool:
	return is_listening 

func handle_parent_message(message: Dictionary):
	"""Handle messages received from parent page"""
	print("OracleParentMessageHandler: Received message from parent: ", message)
	
	if not message.has("type"):
		print("OracleParentMessageHandler: Invalid message - missing type")
		return
	
	match message.get("type"):
		"prophecy_notification":
			_handle_prophecy_notification(message.get("data", {}))
		"oracle_viewed":
			_handle_oracle_viewed(message.get("data", {}))
		"unread_count_update":
			_handle_unread_count_update(message.get("data", {}))
		"oracle_connection_status":
			_handle_connection_status(message.get("data", {}))
		_:
			print("OracleParentMessageHandler: Unknown message type: ", message.get("type"))
	
	emit_signal("parent_message_received", message)

func _handle_prophecy_notification(data: Dictionary):
	"""Handle prophecy notification from parent"""
	print("OracleParentMessageHandler: Processing prophecy notification")
	
	if oracle_interface_manager:
		oracle_interface_manager.handle_prophecy_notification(data)
	else:
		print("OracleParentMessageHandler: No Oracle Interface Manager available")

func _handle_oracle_viewed(data: Dictionary):
	"""Handle notification that Oracle was viewed in parent page"""
	print("OracleParentMessageHandler: Oracle viewed in parent page")
	
	if oracle_interface_manager:
		oracle_interface_manager.mark_prophecies_as_read()

func _handle_unread_count_update(data: Dictionary):
	"""Handle unread count update from parent"""
	if data.has("count") and oracle_interface_manager:
		var count = data.get("count", 0)
		print("OracleParentMessageHandler: Updating unread count to: ", count)
		oracle_interface_manager.handle_prophecy_notification({"unread_count": count})

func _handle_connection_status(data: Dictionary):
	"""Handle Oracle connection status updates"""
	print("OracleParentMessageHandler: Oracle connection status: ", data)
	# This could be used to update UI connection indicators

# Public API for sending messages to parent
func send_message_to_parent(message: Dictionary):
	"""Send a message to the parent page"""
	# This would typically use JavaScript bridge or similar
	print("OracleParentMessageHandler: Sending message to parent: ", message)
	
	# For now, just log the message (actual implementation would depend on embedding method)
	# In a real implementation, this might call:
	# - JavaScript.eval() for web builds
	# - Native bridge for mobile
	# - IPC for desktop embedding 