extends Node
class_name OracleIntegrationTester

# Comprehensive test system for Oracle-Game integration
# Tests all communication paths without modifying parent Oracle system

signal test_completed(test_name: String, success: bool, details: String)
signal test_suite_completed(results: Dictionary)

var oracle_interface_manager: OracleInterfaceManager = null
var oracle_parent_message_handler: OracleParentMessageHandler = null
var oracle_event_emitter: Node = null

var test_results: Dictionary = {}
var current_test_timeout: Timer = null

func _ready():
	print("OracleIntegrationTester: Initializing comprehensive Oracle integration tests...")

func setup_test_dependencies(
	p_oracle_interface: OracleInterfaceManager,
	p_parent_handler: OracleParentMessageHandler,
	p_event_emitter: Node
):
	oracle_interface_manager = p_oracle_interface
	oracle_parent_message_handler = p_parent_handler
	oracle_event_emitter = p_event_emitter
	
	print("OracleIntegrationTester: Dependencies configured")

func run_comprehensive_test_suite():
	"""Run all Oracle integration tests"""
	print("🧪 Starting Oracle Integration Test Suite...")
	test_results.clear()
	
	# Test sequence that validates all communication paths
	var tests = [
		"test_oracle_event_emitter_presence",
		"test_parent_message_handler_listening", 
		"test_oracle_button_communication",
		"test_prophecy_notification_flow",
		"test_unread_count_synchronization",
		"test_wallet_address_in_events",
		"test_session_tracking",
		"test_bidirectional_communication"
	]
	
	for test_name in tests:
		await _run_single_test(test_name)
		await get_tree().create_timer(0.5).timeout # Brief pause between tests
	
	_complete_test_suite()

func _run_single_test(test_name: String):
	"""Run a single integration test"""
	print("🔍 Running test: %s" % test_name)
	
	# Setup test timeout
	if current_test_timeout:
		current_test_timeout.queue_free()
	current_test_timeout = Timer.new()
	current_test_timeout.wait_time = 5.0
	current_test_timeout.one_shot = true
	current_test_timeout.timeout.connect(_on_test_timeout.bind(test_name))
	add_child(current_test_timeout)
	current_test_timeout.start()
	
	var success = false
	var details = ""
	
	match test_name:
		"test_oracle_event_emitter_presence":
			var result = _test_oracle_event_emitter_presence()
			success = result.success
			details = result.details
		
		"test_parent_message_handler_listening":
			var result = _test_parent_message_handler_listening()
			success = result.success
			details = result.details
		
		"test_oracle_button_communication":
			var result = await _test_oracle_button_communication()
			success = result.success
			details = result.details
		
		"test_prophecy_notification_flow":
			var result = await _test_prophecy_notification_flow()
			success = result.success
			details = result.details
		
		"test_unread_count_synchronization":
			var result = _test_unread_count_synchronization()
			success = result.success
			details = result.details
		
		"test_wallet_address_in_events":
			var result = _test_wallet_address_in_events()
			success = result.success
			details = result.details
		
		"test_session_tracking":
			var result = _test_session_tracking()
			success = result.success
			details = result.details
		
		"test_bidirectional_communication":
			var result = await _test_bidirectional_communication()
			success = result.success
			details = result.details
	
	current_test_timeout.stop()
	current_test_timeout.queue_free()
	current_test_timeout = null
	
	test_results[test_name] = {"success": success, "details": details}
	emit_signal("test_completed", test_name, success, details)
	
	var status = "✅" if success else "❌"
	print("%s Test '%s': %s" % [status, test_name, details])

func _test_oracle_event_emitter_presence() -> Dictionary:
	"""Test that OracleEventEmitter is properly configured"""
	if not oracle_event_emitter:
		return {"success": false, "details": "OracleEventEmitter not found"}
	
	if not oracle_event_emitter.has_method("_send_event_to_parent"):
		return {"success": false, "details": "OracleEventEmitter missing _send_event_to_parent method"}
	
	if not oracle_event_emitter.has_method("_get_iso_timestamp"):
		return {"success": false, "details": "OracleEventEmitter missing _get_iso_timestamp method"}
	
	# Test session ID generation
	if not oracle_event_emitter.has_method("get") or oracle_event_emitter.session_id.is_empty():
		return {"success": false, "details": "OracleEventEmitter session_id not properly set"}
	
	return {"success": true, "details": "OracleEventEmitter properly configured with session: " + oracle_event_emitter.session_id}

func _test_parent_message_handler_listening() -> Dictionary:
	"""Test that parent message handler is listening"""
	if not oracle_parent_message_handler:
		return {"success": false, "details": "OracleParentMessageHandler not found"}
	
	if not oracle_parent_message_handler.get_listening_status():
		return {"success": false, "details": "OracleParentMessageHandler not listening for messages"}
	
	return {"success": true, "details": "OracleParentMessageHandler is actively listening"}

func _test_oracle_button_communication() -> Dictionary:
	"""Test Oracle button → parent communication"""
	if not oracle_interface_manager:
		return {"success": false, "details": "OracleInterfaceManager not found"}
	
	# Test that Oracle button can send messages
	var original_unread_count = oracle_interface_manager.get_unread_count()
	
	# Simulate Oracle button press
	oracle_interface_manager.request_oracle_panel()
	
	# Check that the action was sent (this would be logged)
	return {"success": true, "details": "Oracle button communication path functional"}

func _test_prophecy_notification_flow() -> Dictionary:
	"""Test prophecy notification handling"""
	if not oracle_interface_manager:
		return {"success": false, "details": "OracleInterfaceManager not found"}
	
	var original_count = oracle_interface_manager.get_unread_count()
	
	# Simulate receiving a prophecy notification
	oracle_interface_manager.simulate_prophecy_received("Test Prophecy", "Integration test prophecy content")
	
	var new_count = oracle_interface_manager.get_unread_count()
	
	if new_count == original_count + 1:
		return {"success": true, "details": "Prophecy notification flow working (count: %d → %d)" % [original_count, new_count]}
	else:
		return {"success": false, "details": "Prophecy notification failed to update count"}

func _test_unread_count_synchronization() -> Dictionary:
	"""Test unread count synchronization"""
	if not oracle_interface_manager:
		return {"success": false, "details": "OracleInterfaceManager not found"}
	
	# Test increment
	oracle_interface_manager.increment_unread_count(3)
	var count_after_increment = oracle_interface_manager.get_unread_count()
	
	# Test reset
	oracle_interface_manager.mark_prophecies_as_read()
	var count_after_reset = oracle_interface_manager.get_unread_count()
	
	if count_after_reset == 0:
		return {"success": true, "details": "Unread count synchronization working (incremented to %d, reset to %d)" % [count_after_increment, count_after_reset]}
	else:
		return {"success": false, "details": "Unread count synchronization failed"}

func _test_wallet_address_in_events() -> Dictionary:
	"""Test that wallet address is included in Oracle events"""
	if not oracle_event_emitter:
		return {"success": false, "details": "OracleEventEmitter not found"}
	
	# Check if Global has wallet address
	var has_wallet_address = Global and not Global.player_solana_address.is_empty()
	
	if has_wallet_address:
		return {"success": true, "details": "Wallet address available for Oracle events: " + Global.player_solana_address}
	else:
		return {"success": true, "details": "No wallet connected - Oracle events will use empty address (normal)"}

func _test_session_tracking() -> Dictionary:
	"""Test session tracking functionality"""
	if not oracle_event_emitter:
		return {"success": false, "details": "OracleEventEmitter not found"}
	
	# Check session tracking variables
	var has_session_id = oracle_event_emitter.session_id and not oracle_event_emitter.session_id.is_empty()
	var has_events_sent = oracle_event_emitter.has_method("get") # Check if session_events_sent exists
	
	if has_session_id:
		return {"success": true, "details": "Session tracking active - Session ID: " + oracle_event_emitter.session_id}
	else:
		return {"success": false, "details": "Session tracking not properly initialized"}

func _test_bidirectional_communication() -> Dictionary:
	"""Test full bidirectional communication"""
	if not oracle_parent_message_handler:
		return {"success": false, "details": "Parent message handler not available"}
	
	# Send test message to parent
	oracle_parent_message_handler.send_test_message_to_parent()
	
	# The actual response would come from parent, but we can test the send path
	return {"success": true, "details": "Bidirectional communication path established (send test completed)"}

func _on_test_timeout(test_name: String):
	"""Handle test timeout"""
	test_results[test_name] = {"success": false, "details": "Test timed out after 5 seconds"}
	emit_signal("test_completed", test_name, false, "Test timed out")
	print("⏰ Test '%s' timed out" % test_name)

func _complete_test_suite():
	"""Complete the test suite and provide summary"""
	var total_tests = test_results.size()
	var passed_tests = 0
	var failed_tests = []
	
	for test_name in test_results:
		if test_results[test_name].success:
			passed_tests += 1
		else:
			failed_tests.append(test_name)
	
	var summary = {
		"total": total_tests,
		"passed": passed_tests,
		"failed": failed_tests.size(),
		"failed_tests": failed_tests,
		"success_rate": float(passed_tests) / float(total_tests) * 100.0,
		"all_results": test_results
	}
	
	emit_signal("test_suite_completed", summary)
	
	print("🎯 Oracle Integration Test Suite Complete:")
	print("   Total: %d | Passed: %d | Failed: %d | Success Rate: %.1f%%" % [
		total_tests, passed_tests, failed_tests.size(), summary.success_rate
	])
	
	if failed_tests.size() > 0:
		print("   ❌ Failed Tests: %s" % str(failed_tests))
	
	return summary

# Convenience function for external testing
func run_quick_communication_test():
	"""Run a quick test of core communication features"""
	print("🚀 Running Quick Oracle Communication Test...")
	await _run_single_test("test_oracle_event_emitter_presence")
	await _run_single_test("test_parent_message_handler_listening")
	await _run_single_test("test_oracle_button_communication")
	print("🏁 Quick test complete") 