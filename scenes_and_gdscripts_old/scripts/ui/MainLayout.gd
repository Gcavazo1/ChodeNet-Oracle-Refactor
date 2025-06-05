extends Control

# 🎮 CHODE-NET ORACLE: MainLayout v2.0 - Modular Architecture
# Enhanced with Phase A Oracle Visual Effects
# Manages UI layout, navigation, and Oracle integration

# === Core Manager References ===
var wallet_manager: WalletConnectionManager
var oracle_manager: OracleInterfaceManager
var content_manager: UIContentManager
var tab_manager: TabNavigationManager

# === Oracle Communication ===
var oracle_parent_message_handler: OracleParentMessageHandler

# === Legacy Managers (temporary during transition) ===
var ui_navigation_manager: UINavigationManager
var leaderboard_ui_manager: LeaderboardUIManager

# === Phase A: Oracle Visual Effects ===
var oracle_visual_effects_manager: OracleVisualEffectsManager
var oracle_connection_status: OracleConnectionStatus

# === UI Node References ===
# Top-Left Panel (Upgrades)
@onready var upgrade_buttons = {
	"the_iron_grip_button": $Margin/MainHBox/LeftPanel/TopLeftContainer/TopStylePanel/TopContent/TabsHBox/LeftColumn/TheIronGripButton,
	"chode_bots_button": $Margin/MainHBox/LeftPanel/TopLeftContainer/TopStylePanel/TopContent/TabsHBox/LeftColumn/ChodeBotsButton,
	"girthquake_button": $Margin/MainHBox/LeftPanel/TopLeftContainer/TopStylePanel/TopContent/TabsHBox/LeftColumn/GirthquakeButton,
	"oozedrip_button": $Margin/MainHBox/LeftPanel/TopLeftContainer/TopStylePanel/TopContent/TabsHBox/RightColumn/OozedripButton
}
@onready var top_left_content_vbox = $Margin/MainHBox/LeftPanel/TopLeftContainer/TopStylePanel/TopContent/TopContentPanel/TopScrollContainer/TopContentVBox

# Bottom-Left Panel (Achievements, Trophies, Blockchain, Oracle)
@onready var bottom_left_buttons = {
	"achievements": $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/TabsHBox/LeftColumn/AchievementsButton,
	"trophies": $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/TabsHBox/LeftColumn/TrophiesButton,
	"blockchain": $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/TabsHBox/RightColumn/BlockchainButton
}

# Oracle Button (unified)
@onready var oracle_button = $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/TabsHBox/LeftColumn/OracleButton
@onready var oracle_counter_label = $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/TabsHBox/LeftColumn/OracleButton/OracleUnreadCounter

# Content Containers
@onready var achievements_content_vbox = $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/AchievementsContentVBox
@onready var trophies_content_vbox = $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/TrophiesContentVBox
@onready var blockchain_content_vbox = $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/BlockchainContentVBox

# Wallet UI Components (in blockchain content)
@onready var wallet_address_label = $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/BlockchainContentVBox/WalletAddressLabel
@onready var connect_wallet_button = $Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/BlockchainContentVBox/ConnectWalletButton

# Top-Right Panel (Store)
@onready var top_right_buttons = {
	"store": $Margin/MainHBox/RightPanel/TopRightContainer/TopStylePanel/TopContent/TabsHBox/LeftColumn/ShopTab1Button
}
@onready var store_content_vbox = $Margin/MainHBox/RightPanel/TopRightContainer/TopStylePanel/TopContent/TopContentPanel/TopScrollContainer/StoreContentVBox

# Bottom-Right Panel (Settings, Stats, Info, Leaderboard, Rankings)
@onready var bottom_right_buttons = {
	"settings": $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/TabsHBox/LeftColumn/SettingsButton,
	"stats": $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/TabsHBox/LeftColumn/StatsButton,
	"info": $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/TabsHBox/RightColumn/InfoButton
}

@onready var leaderboard_button = $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/TabsHBox/RightColumn/Leaderboard
@onready var rankings_button = $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/TabsHBox/RightColumn/Rankings

@onready var settings_content_vbox = $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/SettingsContentVBox
@onready var stats_content_vbox = $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/StatsContentVBox
@onready var info_content_vbox = $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/InfoContentVBox
@onready var leaderboard_content_vbox = $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/LeaderboardContentVBox
@onready var rankings_content_vbox = $Margin/MainHBox/RightPanel/BottomRightContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/RankingsContentVBox

# Center area and notification system
@onready var notification_panel = $Margin/MainHBox/CenterArea/HUDMessagesPanel/HUDSectionPanel/NotificationsContainer/AchievementPanel

# Current unread prophecy count for Oracle
var current_unread_count: int = 0

func _ready():
	print("MainLayout: Initializing modular Oracle-enhanced architecture...")
	
	# Initialize managers
	_initialize_managers()
	
	# Setup Oracle visual effects and connection status
	_setup_oracle_visual_effects()
	_setup_oracle_connection_status()
	
	# Connect manager signals
	_connect_manager_signals()
	
	# Setup UI components with managers
	_setup_manager_ui_components()
	
	# Initialize legacy systems (temporary)
	_initialize_legacy_systems()
	
	# Set default tab selections
	if tab_manager:
		tab_manager.set_default_tabs()
	
	print("MainLayout: ✅ Modular Oracle integration complete!")

func _initialize_managers():
	"""Initialize the four core managers"""
	wallet_manager = WalletConnectionManager.new()
	oracle_manager = OracleInterfaceManager.new()
	content_manager = UIContentManager.new()
	tab_manager = TabNavigationManager.new()
	
	# Initialize Oracle communication
	oracle_parent_message_handler = OracleParentMessageHandler.new()
	
	# Add managers to the scene tree
	add_child(wallet_manager)
	add_child(oracle_manager)
	add_child(content_manager)
	add_child(tab_manager)
	add_child(oracle_parent_message_handler)
	
	# Connect Oracle communication
	oracle_parent_message_handler.set_oracle_interface_manager(oracle_manager)
	
	print("MainLayout: Core managers initialized")

func _setup_oracle_visual_effects():
	"""Setup Oracle Visual Effects Manager for Phase A enhancements"""
	print("MainLayout: Setting up Oracle visual effects...")
	
	# Create Oracle Visual Effects Manager
	oracle_visual_effects_manager = OracleVisualEffectsManager.new()
	add_child(oracle_visual_effects_manager)
	
	# Initialize with Oracle button, counter, and notification system
	if is_instance_valid(oracle_button) and is_instance_valid(oracle_counter_label) and is_instance_valid(notification_panel):
		oracle_visual_effects_manager.initialize(oracle_button, oracle_counter_label, notification_panel)
		print("MainLayout: ✅ Oracle visual effects initialized successfully")
	else:
		print("MainLayout: ⚠️ Some Oracle UI components not found, visual effects partially initialized")

func _setup_oracle_connection_status():
	"""Setup Oracle Connection Status widget for presence indication"""
	print("MainLayout: Setting up Oracle connection status...")
	
	# Create Oracle Connection Status widget
	oracle_connection_status = OracleConnectionStatus.new()
	
	# Add to blockchain content area
	if is_instance_valid(blockchain_content_vbox):
		blockchain_content_vbox.add_child(oracle_connection_status)
		# Position it at the top of blockchain content
		blockchain_content_vbox.move_child(oracle_connection_status, 0)
		print("MainLayout: ✅ Oracle connection status added to blockchain content")
	else:
		print("MainLayout: ⚠️ blockchain_content_vbox not found, Oracle connection status not added")

func _connect_manager_signals():
	"""Connect signals between managers"""
	if tab_manager and not tab_manager.is_connected("tab_selected", Callable(self, "_on_tab_selected")):
		tab_manager.connect("tab_selected", Callable(self, "_on_tab_selected"))
	
	if wallet_manager and not wallet_manager.is_connected("connection_status_changed", Callable(self, "_on_wallet_status_changed")):
		wallet_manager.connect("connection_status_changed", Callable(self, "_on_wallet_status_changed"))
	
	if oracle_manager and not oracle_manager.is_connected("unread_count_changed", Callable(self, "_on_oracle_unread_count_changed")):
		oracle_manager.connect("unread_count_changed", Callable(self, "_on_oracle_unread_count_changed"))
	
	if content_manager and not content_manager.is_connected("upgrade_purchase_completed", Callable(self, "_on_upgrade_purchase_completed")):
		content_manager.connect("upgrade_purchase_completed", Callable(self, "_on_upgrade_purchase_completed"))
	
	print("MainLayout: Manager signals connected")

func _setup_manager_ui_components():
	"""Setup UI component references for managers"""
	# Setup wallet manager with UI components
	if wallet_manager:
		wallet_manager.set_ui_components(connect_wallet_button, wallet_address_label)
	
	# Setup oracle manager with UI components
	if oracle_manager:
		oracle_manager.set_ui_components(oracle_button, oracle_counter_label)
	
	# Setup tab manager with button groups
	if tab_manager:
		var button_groups = {
			"top_left": upgrade_buttons,
			"bottom_left": bottom_left_buttons,
			"top_right": top_right_buttons,
			"bottom_right": bottom_right_buttons
		}
		tab_manager.set_button_groups(button_groups)
	
	print("MainLayout: Manager UI components configured")

func _initialize_legacy_systems():
	"""Initialize legacy systems during transition period"""
	# Keep existing UINavigationManager for complex content that hasn't been migrated yet
	ui_navigation_manager = $UINavigationManager
	if ui_navigation_manager:
		print("MainLayout: Legacy UINavigationManager found, initializing with full functionality")
		
		# Initialize UINavigationManager with ALL the UI components it needs
		ui_navigation_manager.initialize_navigation(
			upgrade_buttons, top_left_content_vbox,
			bottom_left_buttons, achievements_content_vbox, trophies_content_vbox, blockchain_content_vbox,
			top_right_buttons, store_content_vbox,
			bottom_right_buttons, settings_content_vbox, stats_content_vbox, info_content_vbox
		)
		
		# Connect the UIContentManager to the UINavigationManager
		content_manager.set_ui_navigation_manager(ui_navigation_manager)
		
		# Connect the TabNavigationManager to the UINavigationManager
		tab_manager.set_ui_navigation_manager(ui_navigation_manager)
		
		print("MainLayout: UINavigationManager fully initialized with real functionality")
	
	# Initialize SkillTapUIManager with required dependencies
	var skill_tap_ui_manager = $SkillTapUIManager
	if skill_tap_ui_manager:
		var skill_tap_meter = $Margin/MainHBox/CenterArea/HUDMessagesPanel/HUDSectionPanel/ChargeAndSkillMeterContainer/SkillTapMeter
		var effects_manager = $EffectsManager
		var tapper_area = null
		
		# Try to find TapperArea in various possible locations
		var possible_tapper_paths = [
			"Margin/MainHBox/CenterArea/TapperAreaPanel/TapperCenter/TapperPanelContainer/TapperCenterNode2D/TapperArea",
			"Margin/MainHBox/CenterArea/TapperAreaPanel/TapperArea",
			"TapperCenter/TapperPanelContainer/TapperCenterNode2D/TapperArea"
		]
		
		for path in possible_tapper_paths:
			tapper_area = get_node_or_null(path)
			if tapper_area:
				print("MainLayout: Found TapperArea at: %s" % path)
				break
		
		if not tapper_area:
			# Try to find TapperArea by searching the tree
			tapper_area = _find_node_by_name(get_tree().root, "TapperArea")
			if tapper_area:
				print("MainLayout: Found TapperArea via tree search")
		
		if skill_tap_meter and effects_manager:
			skill_tap_ui_manager.initialize_manager(skill_tap_meter, effects_manager, tapper_area)
			if tapper_area:
				print("MainLayout: SkillTapUIManager initialized with all dependencies")
			else:
				print("MainLayout: SkillTapUIManager initialized without TapperArea (will have limited functionality)")
		else:
			print("MainLayout: Warning - Could not find all dependencies for SkillTapUIManager")
			print("  - SkillTapMeter found: %s" % bool(skill_tap_meter))
			print("  - EffectsManager found: %s" % bool(effects_manager))
			print("  - TapperArea found: %s" % bool(tapper_area))
	
	# Keep LeaderboardUIManager for leaderboard functionality
	leaderboard_ui_manager = LeaderboardUIManager.new()
	add_child(leaderboard_ui_manager)
	
	# Initialize AchievementUIManager for the achievement system
	var achievement_ui_manager = $AchievementUIManager
	if achievement_ui_manager:
		# Try to find TapperArea for achievement notifications
		var tapper_area = null
		var possible_tapper_paths = [
			"Margin/MainHBox/CenterArea/TapperAreaPanel/TapperCenter/TapperPanelContainer/TapperCenterNode2D/TapperArea",
			"Margin/MainHBox/CenterArea/TapperAreaPanel/TapperArea",
			"TapperCenter/TapperPanelContainer/TapperCenterNode2D/TapperArea"
		]
		
		for path in possible_tapper_paths:
			tapper_area = get_node_or_null(path)
			if tapper_area:
				break
		
		if not tapper_area:
			tapper_area = _find_node_by_name(get_tree().root, "TapperArea")
		
		achievement_ui_manager.initialize_achievements(tapper_area)
		print("MainLayout: AchievementUIManager initialized")
	else:
		print("MainLayout: Warning - AchievementUIManager not found")
	
	# Setup legacy leaderboard button connections
	if leaderboard_button and not leaderboard_button.is_connected("pressed", Callable(self, "_on_leaderboard_button_pressed")):
		leaderboard_button.connect("pressed", Callable(self, "_on_leaderboard_button_pressed"))
	
	if rankings_button and not rankings_button.is_connected("pressed", Callable(self, "_on_rankings_button_pressed")):
		rankings_button.connect("pressed", Callable(self, "_on_rankings_button_pressed"))
	
	print("MainLayout: Legacy systems initialized")

# === Manager Signal Handlers ===

func _on_tab_selected(panel: String, tab: String):
	"""Handle tab selection and update content accordingly"""
	print("MainLayout: Tab selected - Panel: %s, Tab: %s" % [panel, tab])
	
	# Let UINavigationManager handle the actual tab selection since it has all the real functionality
	if ui_navigation_manager:
		match panel:
			"top_left":
				ui_navigation_manager._on_top_left_tab_selected(tab)
			"bottom_left":
				ui_navigation_manager._on_bottom_left_tab_selected(tab)
			"top_right":
				ui_navigation_manager._on_top_right_tab_selected(tab)
			"bottom_right":
				ui_navigation_manager._on_bottom_right_tab_selected(tab)
		return
	
	# Fallback to content_manager if UINavigationManager not available
	if not content_manager:
		return
	
	match panel:
		"top_left":
			content_manager.populate_upgrade_content(top_left_content_vbox, tab)
		"bottom_left":
			_handle_bottom_left_tab_selection(tab)
		"top_right":
			content_manager.populate_store_content(store_content_vbox, tab)
		"bottom_right":
			_handle_bottom_right_tab_selection(tab)

func _handle_bottom_left_tab_selection(tab: String):
	"""Handle bottom-left panel tab selection"""
	# Hide all content containers first
	if achievements_content_vbox: achievements_content_vbox.visible = false
	if trophies_content_vbox: trophies_content_vbox.visible = false
	if blockchain_content_vbox: blockchain_content_vbox.visible = false
	
	# Show and populate the selected content
	match tab:
		"achievements":
			if achievements_content_vbox:
				achievements_content_vbox.visible = true
				content_manager.populate_achievements_content(achievements_content_vbox)
		"trophies":
			if trophies_content_vbox:
				trophies_content_vbox.visible = true
				content_manager.populate_trophies_content(trophies_content_vbox)
		"blockchain":
			if blockchain_content_vbox:
				blockchain_content_vbox.visible = true
				content_manager.populate_blockchain_content(blockchain_content_vbox)

func _handle_bottom_right_tab_selection(tab: String):
	"""Handle bottom-right panel tab selection"""
	# Hide all content containers first
	if settings_content_vbox: settings_content_vbox.visible = false
	if stats_content_vbox: stats_content_vbox.visible = false
	if info_content_vbox: info_content_vbox.visible = false
	if leaderboard_content_vbox: leaderboard_content_vbox.visible = false
	if rankings_content_vbox: rankings_content_vbox.visible = false
	
	# Hide leaderboard manager if it was previously shown
	if leaderboard_ui_manager:
		leaderboard_ui_manager.hide_leaderboard()
	
	# Show the selected content
	match tab:
		"settings":
			if settings_content_vbox:
				settings_content_vbox.visible = true
				_populate_settings_content()
		"stats":
			if stats_content_vbox:
				stats_content_vbox.visible = true
				_populate_stats_content()
		"info":
			if info_content_vbox:
				info_content_vbox.visible = true
				_populate_info_content()

func _on_wallet_status_changed(status):
	"""Handle wallet connection status changes"""
	print("MainLayout: Wallet status changed to: %s" % status)
	# The WalletConnectionManager handles its own UI updates
	# We can add additional logic here if needed

func _on_upgrade_purchase_completed(upgrade_id: String):
	"""Handle upgrade purchase completion"""
	print("MainLayout: Upgrade purchase completed: %s" % upgrade_id)
	
	# Refresh upgrade content if it's currently active
	if tab_manager:
		var current_tab = tab_manager.get_active_tab("top_left")
		if current_tab and content_manager:
			content_manager.populate_upgrade_content(top_left_content_vbox, current_tab)
		
		# Update button styling
		tab_manager.update_button_styling("top_left")

# === Legacy Button Handlers (temporary during transition) ===

func _on_leaderboard_button_pressed():
	print("MainLayout: 🏆 LEADERBOARD button pressed - Showing legendary competition!")
	
	# Hide other content
	_handle_bottom_right_tab_selection("")  # Hide all regular content
	
	# Show leaderboard content
	if leaderboard_ui_manager:
		leaderboard_ui_manager.show_leaderboard()
	
	# Send Oracle event for leaderboard viewing
	_send_oracle_leaderboard_view_event("global_leaderboard")

func _on_rankings_button_pressed():
	print("MainLayout: 📊 RANKINGS button pressed - Displaying player standings!")
	
	# Hide other content
	_handle_bottom_right_tab_selection("")  # Hide all regular content
	
	# Hide leaderboard manager
	if leaderboard_ui_manager:
		leaderboard_ui_manager.hide_leaderboard()
	
	# Show rankings content
	if rankings_content_vbox:
		rankings_content_vbox.visible = true
		_populate_rankings_content()
	
	# Send Oracle event for rankings viewing
	_send_oracle_leaderboard_view_event("rankings")

# === Content Population Functions ===

func _populate_settings_content():
	"""Populate settings content"""
	if not content_manager or not settings_content_vbox:
		return
	
	content_manager.clear_content(settings_content_vbox)
	
	var header = Label.new()
	header.text = "⚙️ SETTINGS ⚙️"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	settings_content_vbox.add_child(header)
	
	var content = Label.new()
	content.text = "Game settings and configuration options will be available here in future updates."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	settings_content_vbox.add_child(content)

func _populate_stats_content():
	"""Populate stats content"""
	if not content_manager or not stats_content_vbox:
		return
	
	content_manager.clear_content(stats_content_vbox)
	
	var header = Label.new()
	header.text = "📊 PLAYER STATISTICS 📊"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stats_content_vbox.add_child(header)
	
	var content = Label.new()
	content.text = "Your detailed gameplay statistics and performance metrics will be displayed here."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	stats_content_vbox.add_child(content)

func _populate_info_content():
	"""Populate info content"""
	if not content_manager or not info_content_vbox:
		return
	
	content_manager.clear_content(info_content_vbox)
	
	var header = Label.new()
	header.text = "ℹ️ GAME INFORMATION ℹ️"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info_content_vbox.add_child(header)
	
	var content = Label.new()
	content.text = "Game instructions, tips, and additional information about CHODE-NET ORACLE will be available here."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	info_content_vbox.add_child(content)

func _populate_rankings_content():
	"""Populate rankings content"""
	if not content_manager or not rankings_content_vbox:
		return
	
	content_manager.clear_content(rankings_content_vbox)
	
	var header = Label.new()
	header.text = "📊 PLAYER RANKINGS 📊"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	rankings_content_vbox.add_child(header)
	
	var content = Label.new()
	content.text = "Player rankings and competitive standings will be displayed here."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	rankings_content_vbox.add_child(content)

# === Oracle Event Helpers ===

func _send_oracle_leaderboard_view_event(leaderboard_type: String):
	"""Send Oracle event for leaderboard viewing"""
	if oracle_manager:
		var action = {
			"action": "leaderboard_viewed",
			"leaderboard_type": leaderboard_type,
			"timestamp": Time.get_unix_time_from_system()
		}
		oracle_manager.send_oracle_action_to_parent(action)

# === Public API for external systems ===

func simulate_oracle_prophecy(title: String = "Test Oracle Message", content: String = "The Oracle speaks of great deeds..."):
	"""Public method to simulate receiving an Oracle prophecy (for testing)"""
	if oracle_manager:
		oracle_manager.simulate_prophecy_received(title, content)

func get_wallet_connection_status():
	"""Get current wallet connection status"""
	if wallet_manager:
		return wallet_manager.get_connection_status()
	return null

func get_oracle_unread_count() -> int:
	"""Get current Oracle unread count"""
	if oracle_manager:
		return oracle_manager.get_unread_count()
	return 0

# === Enhanced Oracle Event Handlers ===

func _on_oracle_unread_count_changed(new_count: int):
	"""Handle Oracle unread count updates with visual effects"""
	print("MainLayout: Oracle unread count updated to: %d" % new_count)
	current_unread_count = new_count
	
	# Update visual effects
	if oracle_visual_effects_manager:
		oracle_visual_effects_manager.update_unread_count(new_count, true)

func _on_prophecy_notification_received(prophecy_data: Dictionary):
	"""Handle incoming prophecy notifications from parent"""
	print("MainLayout: Prophecy notification received: %s" % prophecy_data.get("title", "Unknown"))
	
	# Show prophecy notification with visual effects
	if oracle_visual_effects_manager:
		oracle_visual_effects_manager.show_prophecy_notification(
			prophecy_data.get("title", "Oracle Vision"),
			prophecy_data.get("message", "The Oracle speaks..."),
			prophecy_data.get("duration", 4.0)
		)
	
	# Update connection status to show Oracle activity
	if oracle_connection_status:
		oracle_connection_status.set_oracle_responding(true)
		# Reset responding state after a brief moment
		await get_tree().create_timer(2.0).timeout
		oracle_connection_status.set_oracle_responding(false)

func _on_oracle_viewed():
	"""Handle when Oracle content is viewed in parent page"""
	print("MainLayout: Oracle viewed signal received")
	
	# Reset unread count
	current_unread_count = 0
	if oracle_visual_effects_manager:
		oracle_visual_effects_manager.update_unread_count(0, false)

# === Phase A: Debug and Testing Functions ===

func debug_test_oracle_effects():
	"""Test Oracle visual effects system"""
	print("MainLayout: Testing Oracle visual effects...")
	
	if oracle_visual_effects_manager:
		# Test visual states
		oracle_visual_effects_manager.debug_cycle_states()
		
		await get_tree().create_timer(3.0).timeout
		
		# Test counter animation
		oracle_visual_effects_manager.debug_test_counter_animation()
		
		await get_tree().create_timer(6.0).timeout
		
		# Test prophecy notification
		oracle_visual_effects_manager.debug_test_prophecy_notification()

func debug_test_connection_status():
	"""Test Oracle connection status widget"""
	print("MainLayout: Testing Oracle connection status...")
	
	if oracle_connection_status:
		oracle_connection_status.debug_simulate_oracle_activity()

func debug_simulate_prophecy_arrival():
	"""Simulate a prophecy arriving from the parent Oracle system"""
	print("MainLayout: Simulating prophecy arrival...")
	
	var test_prophecy = {
		"title": "Test Vision",
		"message": "The stars align for great tapping power! Your girth shall grow exponentially through dedicated practice.",
		"duration": 5.0
	}
	
	_on_prophecy_notification_received(test_prophecy)
	_on_oracle_unread_count_changed(current_unread_count + 1)

# === Cleanup and Exit ===

func _exit_tree():
	"""Clean up Oracle visual effects on exit"""
	print("MainLayout: Cleaning up Oracle visual effects...")
	
	if oracle_visual_effects_manager:
		oracle_visual_effects_manager.cleanup()
	
	if oracle_connection_status:
		oracle_connection_status.cleanup()

func _find_node_by_name(node: Node, node_name: String) -> Node:
	"""Recursively search for a node by name"""
	if node.name == node_name:
		return node
	for child in node.get_children():
		var found = _find_node_by_name(child, node_name)
		if found:
			return found
	return null
