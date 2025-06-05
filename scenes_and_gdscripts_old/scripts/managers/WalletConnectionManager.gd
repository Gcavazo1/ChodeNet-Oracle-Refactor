extends Node
class_name WalletConnectionManager

# Handles all wallet connection logic
signal wallet_connected(address: String)
signal wallet_disconnected()
signal wallet_error(message: String)
signal connection_status_changed(status: WalletStatus)

enum WalletStatus { DISCONNECTED, CONNECTING, CONNECTED, ERROR }

var current_status: WalletStatus = WalletStatus.DISCONNECTED
var connected_address: String = ""
var wallet_provider: String = ""
var wallet_service: Node = null

# UI Components (will be set by MainLayout)
var connect_wallet_button: Button = null
var wallet_address_label: Label = null

func _ready():
	print("WalletConnectionManager: Initializing...")
	# Connect to Global wallet signals
	if Global:
		if not Global.is_connected("wallet_connected", Callable(self, "_on_global_wallet_connected")):
			Global.connect("wallet_connected", Callable(self, "_on_global_wallet_connected"))
		if not Global.is_connected("player_authentication_changed", Callable(self, "_on_global_player_authentication_changed")):
			Global.connect("player_authentication_changed", Callable(self, "_on_global_player_authentication_changed"))
	
	# Try to find WalletService
	call_deferred("_find_wallet_service")

func _find_wallet_service():
	wallet_service = Global.find_wallet_service() if Global else null
	if wallet_service:
		print("WalletConnectionManager: Found WalletService")
		_check_initial_connection_state()
	else:
		print("WalletConnectionManager: WalletService not found")

func _check_initial_connection_state():
	if wallet_service and wallet_service.has_method("is_logged_in"):
		if wallet_service.is_logged_in():
			var pubkey = wallet_service.get_pubkey()
			if pubkey:
				connected_address = pubkey.to_string()
				current_status = WalletStatus.CONNECTED
				emit_signal("connection_status_changed", current_status)
				_update_wallet_ui()

func connect_wallet():
	"""Initiate wallet connection process"""
	print("WalletConnectionManager: Attempting wallet connection...")
	current_status = WalletStatus.CONNECTING
	emit_signal("connection_status_changed", current_status)
	_update_wallet_ui()
	
	# TODO: Implement actual wallet connection logic
	# For now, simulate a future connection
	await get_tree().create_timer(2.0).timeout
	
	# Simulate successful connection
	connected_address = "Coming Soon..."
	current_status = WalletStatus.CONNECTED
	emit_signal("wallet_connected", connected_address)
	emit_signal("connection_status_changed", current_status)
	_update_wallet_ui()

func disconnect_wallet():
	"""Disconnect the current wallet"""
	print("WalletConnectionManager: Disconnecting wallet...")
	connected_address = ""
	current_status = WalletStatus.DISCONNECTED
	emit_signal("wallet_disconnected")
	emit_signal("connection_status_changed", current_status)
	_update_wallet_ui()

func get_wallet_balance() -> float:
	"""Get current wallet balance (placeholder)"""
	# TODO: Implement actual balance fetching
	return 0.0

func get_connection_status() -> WalletStatus:
	"""Get current connection status"""
	return current_status

func get_connected_address() -> String:
	return connected_address

func get_truncated_address() -> String:
	if connected_address.is_empty():
		return ""
	if connected_address.length() <= 8:
		return connected_address
	return connected_address.substr(0, 4) + "..." + connected_address.substr(-4)

# Set UI components from MainLayout
func set_ui_components(p_connect_button: Button, p_address_label: Label):
	"""Set UI component references and connect signals"""
	connect_wallet_button = p_connect_button
	wallet_address_label = p_address_label
	
	if connect_wallet_button and not connect_wallet_button.is_connected("pressed", Callable(self, "_on_connect_wallet_button_pressed")):
		connect_wallet_button.connect("pressed", Callable(self, "_on_connect_wallet_button_pressed"))
	
	# Update UI immediately
	_update_wallet_ui()

func _on_connect_wallet_button_pressed():
	"""Handle connect wallet button press"""
	match current_status:
		WalletStatus.DISCONNECTED:
			connect_wallet()
		WalletStatus.CONNECTED:
			disconnect_wallet()
		WalletStatus.CONNECTING:
			print("WalletConnectionManager: Connection already in progress...")
		WalletStatus.ERROR:
			connect_wallet()  # Retry connection

func _update_wallet_ui():
	"""Update wallet UI components based on current status"""
	if not connect_wallet_button or not wallet_address_label:
		return
	
	match current_status:
		WalletStatus.DISCONNECTED:
			connect_wallet_button.text = "Connect Wallet (Future Feature)"
			connect_wallet_button.disabled = false
			wallet_address_label.text = "Wallet Info: Coming Soon"
		WalletStatus.CONNECTING:
			connect_wallet_button.text = "Connecting..."
			connect_wallet_button.disabled = true
			wallet_address_label.text = "Connecting to wallet..."
		WalletStatus.CONNECTED:
			connect_wallet_button.text = "Disconnect Wallet"
			connect_wallet_button.disabled = false
			wallet_address_label.text = "Connected: " + connected_address
		WalletStatus.ERROR:
			connect_wallet_button.text = "Retry Connection"
			connect_wallet_button.disabled = false
			wallet_address_label.text = "Connection Error - Click to retry"

# Global signal handlers
func _on_global_wallet_connected(address: String):
	print("WalletConnectionManager: Global wallet_connected signal received: ", address)
	if not address.is_empty():
		connected_address = address
		current_status = WalletStatus.CONNECTED
		emit_signal("wallet_connected", address)
	else:
		connected_address = ""
		current_status = WalletStatus.DISCONNECTED
		emit_signal("wallet_disconnected")
	
	emit_signal("connection_status_changed", current_status)
	_update_wallet_ui()

func _on_global_player_authentication_changed(is_authenticated: bool, address: String):
	print("WalletConnectionManager: Global player_authentication_changed: ", is_authenticated, " - ", address)
	# Update our state based on authentication changes
	if is_authenticated and not address.is_empty():
		connected_address = address
		current_status = WalletStatus.CONNECTED
	else:
		connected_address = ""
		current_status = WalletStatus.DISCONNECTED
	
	emit_signal("connection_status_changed", current_status)
	_update_wallet_ui() 