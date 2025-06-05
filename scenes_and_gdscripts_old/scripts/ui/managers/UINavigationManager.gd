class_name UINavigationManager
extends Node

# Manages all UI tab navigation and content panel visibility.

# --- Dependencies (Injected by MainLayout.gd via initialize_navigation) ---

# Top-Left Panel (Upgrades)
var upgrade_buttons = {} # Dict: {"upgrade1": ButtonNode, ...}
var top_left_content_vbox # The VBoxContainer holding the UpgradeContent Label

# Bottom-Left Panel (Achievements, Trophies, Blockchain)
var bottom_left_buttons = {} # Dict: {"achievements": ButtonNode, ...}
var achievements_content_vbox # AchievementsContentVBox
var trophies_content_grid # TrophiesContentVBox (GridContainer)
var blockchain_content_vbox # BlockchainContentVBox
var prophecies_content # New prophecy history content

# Top-Right Panel (Store Tabs)
var top_right_buttons = {} # Dict: {"store": ButtonNode, ...} -> maps to ShopTab1Button etc.
var store_content_vbox # StoreContentVBox holding the StoreContentLabel

# Bottom-Right Panel (Settings, Stats, Info)
var bottom_right_buttons = {} # Dict: {"settings": ButtonNode, ...}
var settings_content_vbox # SettingsContentVBox
var stats_content_vbox # StatsContentVBox
var info_content_vbox # InfoContentVBox

# --- State Variables ---
var current_top_left_tab: String = "upgrade1" # Default active tab (corresponds to Upgrade1Button)
var current_bottom_left_tab: String = "achievements"
var current_top_right_tab: String = "store" # Default for ShopTab1Button
var current_bottom_right_tab: String = "settings"

# --- Oracle content ---
var prophecy_history = [] # Each item: {"title": String, "text": String, "timestamp": String, "is_new_local": bool}
var max_prophecies_history = 5 # New limit for concise in-game view

# 🔮 NEW: Oracle-specific content containers
var oracle_decree_content: VBoxContainer = null
var oracle_scrolls_content: VBoxContainer = null
var oracle_petition_content: VBoxContainer = null

# --- Font Resource ---
const UPGRADE_FONT = preload("res://assets/fonts/BrokenConsoleBold.ttf") # Preload the font

# --- Upgrade Inventory Constants ---
# Key should match the key used in MainLayout.gd when passing the button dictionary
const IRON_GRIP_BUTTON_KEY = "the_iron_grip_button"
const IRON_GRIP_ICON_PATH = "res://assets/art/upgrades/iron_grip.svg"

const CHODEBOTS_BUTTON_KEY = "chode_bots_button"
const CHODEBOT_ICON_PATH = "res://assets/art/upgrades/chodebot_efficiency_matrix.svg"
const GIRTHQUAKE_BUTTON_KEY = "girthquake_button"
const GIRTHQUAKE_ICON_PATH = "res://assets/art/upgrades/girthquake_magnitude.svg"
const OOZEDRIP_BUTTON_KEY = "oozedrip_button"
const OOZEDRIP_ICON_PATH = "res://assets/art/upgrades/oozedrip_concentration.svg"

# --- Girth Bazaar Constants ---
const UPGRADE_OFFERING_CARD_SCENE = preload("res://scenes/ui/components/UpgradeOfferingCard.tscn")

# --- Upgrades Data for Bazaar ---
const AVAILABLE_UPGRADES = [
	{
		"id": "iron_grip_rank_1",
		"name": "The Iron Grip of CHODEMASTERY",
		"description": "Forge your slaps in the crucible of ancient power! Each caress becomes a testament to your burgeoning GIRTH.",
		"effect_text": "Grants a +25% GIRTH bonus to all Mega & Giga Slaps. Feel the power course through you!",
		"cost": 500, # Temporarily 500 for testing, was 10000
		"icon_path": "res://assets/art/upgrades/iron_grip.svg", # Same as IRON_GRIP_ICON_PATH
		"category": "slap_empowerment",
		"level": 1
		# is_purchased will be determined by the card script using Global
	}
	# More upgrades can be added here in the future
]

# --- Initialization ---
func initialize_navigation(
		p_upgrade_buttons: Dictionary, p_top_left_vbox: Node,
		p_bottom_left_buttons: Dictionary, p_ach_vbox: Node, p_tro_grid: Node, p_bc_vbox: Node,
		p_top_right_buttons: Dictionary, p_store_vbox: Node,
		p_bottom_right_buttons: Dictionary, p_set_vbox: Node, p_stat_vbox: Node, p_inf_vbox: Node
	):
	print("UINavigationManager: Initializing...")

	# Assign dependencies
	upgrade_buttons = p_upgrade_buttons
	top_left_content_vbox = p_top_left_vbox
	
	bottom_left_buttons = p_bottom_left_buttons
	achievements_content_vbox = p_ach_vbox
	trophies_content_grid = p_tro_grid
	blockchain_content_vbox = p_bc_vbox
	
	top_right_buttons = p_top_right_buttons
	store_content_vbox = p_store_vbox
	
	bottom_right_buttons = p_bottom_right_buttons
	settings_content_vbox = p_set_vbox
	stats_content_vbox = p_stat_vbox
	info_content_vbox = p_inf_vbox

	# Connect signals for Top-Left buttons
	for button_keyName in upgrade_buttons: # e.g. "upgrade1", "upgrade2"
		var button_node = upgrade_buttons[button_keyName]
		if is_instance_valid(button_node) and button_node.has_signal("pressed"):
			if not button_node.is_connected("pressed", Callable(self, "_on_top_left_tab_selected").bind(button_keyName)):
				button_node.pressed.connect(Callable(self, "_on_top_left_tab_selected").bind(button_keyName))
		else:
			push_error("UINavigationManager: Invalid button or no 'pressed' signal for top-left button: " + button_keyName)

	# Connect signals for Bottom-Left buttons
	for button_keyName in bottom_left_buttons: # "achievements", "trophies", "blockchain"
		var button_node = bottom_left_buttons[button_keyName]
		if is_instance_valid(button_node) and button_node.has_signal("pressed"):
			if not button_node.is_connected("pressed", Callable(self, "_on_bottom_left_tab_selected").bind(button_keyName)):
				button_node.pressed.connect(Callable(self, "_on_bottom_left_tab_selected").bind(button_keyName))
		else:
			push_error("UINavigationManager: Invalid button or no 'pressed' signal for bottom-left button: " + button_keyName)

	# Connect signals for Top-Right buttons
	for button_keyName in top_right_buttons: # "store", "premium", etc.
		var button_node = top_right_buttons[button_keyName]
		if is_instance_valid(button_node) and button_node.has_signal("pressed"):
			if not button_node.is_connected("pressed", Callable(self, "_on_top_right_tab_selected").bind(button_keyName)):
				button_node.pressed.connect(Callable(self, "_on_top_right_tab_selected").bind(button_keyName))
		else:
			push_error("UINavigationManager: Invalid button or no 'pressed' signal for top-right button: " + button_keyName)
			
	# Connect signals for Bottom-Right buttons
	for button_keyName in bottom_right_buttons: # "settings", "stats", "info"
		var button_node = bottom_right_buttons[button_keyName]
		if is_instance_valid(button_node) and button_node.has_signal("pressed"):
			if not button_node.is_connected("pressed", Callable(self, "_on_bottom_right_tab_selected").bind(button_keyName)):
				button_node.pressed.connect(Callable(self, "_on_bottom_right_tab_selected").bind(button_keyName))
		else:
			push_error("UINavigationManager: Invalid button or no 'pressed' signal for bottom-right button: " + button_keyName)
			
	# Set initial visibility based on default states
	_update_top_left_content_visibility()
	_update_bottom_left_content_visibility()
	_update_top_right_content_visibility()
	_update_bottom_right_content_visibility()
	
	_apply_button_styling()
	
	# Create Oracle content sections
	_create_oracle_content_sections()
	
	print("UINavigationManager: Initialization complete. Buttons connected, initial content set.")

# --- Tab Selection Handlers ---
func _on_top_left_tab_selected(tab_key_name: String):
	if not upgrade_buttons.has(tab_key_name):
		push_error("UINavigationManager: Unknown top-left tab selected: " + tab_key_name)
		return
	current_top_left_tab = tab_key_name
	print("UINavigationManager: Top-left tab selected: %s" % tab_key_name)
	_update_top_left_content_visibility()
	_apply_button_styling()

func _on_bottom_left_tab_selected(tab_key_name: String):
	if not bottom_left_buttons.has(tab_key_name):
		push_error("UINavigationManager: Unknown bottom-left tab selected: " + tab_key_name)
		return
	current_bottom_left_tab = tab_key_name
	print("UINavigationManager: Bottom-left tab selected: %s" % tab_key_name)
	
	# Hide Oracle content when regular bottom-left tabs are selected
	if oracle_decree_content: oracle_decree_content.visible = false
	if oracle_scrolls_content: oracle_scrolls_content.visible = false
	if oracle_petition_content: oracle_petition_content.visible = false
	
	_update_bottom_left_content_visibility()
	_apply_button_styling()

	if tab_key_name == "blockchain":
		# Mark all currently visible prophecies in this local list as no longer "new"
		var prophecies_updated_locally = false
		for prophecy_data in prophecy_history:
			if prophecy_data.get("is_new_local", false):
				prophecy_data["is_new_local"] = false
				prophecies_updated_locally = true
		
		if prophecies_updated_locally:
			_update_prophecies_display() # Refresh display to remove "new" indicators

		# IMPORTANT: This does NOT reset the main unread counter in MainLayout.gd.
		# That is handled by parent page message 'oracle_messages_viewed'.
		print("UINavigationManager: Blockchain tab viewed. Local 'new' flags cleared for displayed prophecies.")

func _on_top_right_tab_selected(tab_key_name: String):
	if not top_right_buttons.has(tab_key_name):
		push_error("UINavigationManager: Unknown top-right tab selected: " + tab_key_name)
		return
	
	# Track shop icon taps for achievement
	if tab_key_name == "store" and Global:
		Global.shop_icon_taps += 1
		
		# Unlock achievement when tapped enough times
		if Global.shop_icon_taps >= 25:
			AchievementManager.unlock_achievement("let_me_in")
		
		# First time viewing bazaar achievement
		if not Global.has_viewed_bazaar:
			Global.has_viewed_bazaar = true
			AchievementManager.unlock_achievement("window_shopper")
	
	current_top_right_tab = tab_key_name
	print("UINavigationManager: Top-right tab selected: %s" % tab_key_name)
	_update_top_right_content_visibility()
	_apply_button_styling()

func _on_bottom_right_tab_selected(tab_key_name: String):
	if not bottom_right_buttons.has(tab_key_name):
		push_error("UINavigationManager: Unknown bottom-right tab selected: " + tab_key_name)
		return
	current_bottom_right_tab = tab_key_name
	print("UINavigationManager: Bottom-right tab selected: %s" % tab_key_name)
	_update_bottom_right_content_visibility()
	_apply_button_styling()

# --- Content Update & Visibility Functions ---

func _update_top_left_content_visibility():
	# This panel currently has one shared content label based on MainLayout.tscn
	if is_instance_valid(top_left_content_vbox):
		# Clear previous content before adding new stuff
		for child in top_left_content_vbox.get_children():
			child.queue_free()

		if current_top_left_tab == IRON_GRIP_BUTTON_KEY:
			_display_iron_grip_details(top_left_content_vbox)
		elif current_top_left_tab == CHODEBOTS_BUTTON_KEY:
			_add_upgrade_icon(CHODEBOT_ICON_PATH, top_left_content_vbox, Color(0.5, 0.5, 0.5, 0.7))
			_add_upgrade_label("CHODEBOT EFFICIENCY", top_left_content_vbox, true, 18)
			_add_upgrade_label("(Coming Soon!)", top_left_content_vbox, false, 12)
			_add_upgrade_label("The schematics for these automatons are not yet deciphered.", top_left_content_vbox, false, 10)
		elif current_top_left_tab == GIRTHQUAKE_BUTTON_KEY:
			_add_upgrade_icon(GIRTHQUAKE_ICON_PATH, top_left_content_vbox, Color(0.5, 0.5, 0.5, 0.7))
			_add_upgrade_label("GIRTHQUAKE MAGNITUDE", top_left_content_vbox, true, 18)
			_add_upgrade_label("(Coming Soon!)", top_left_content_vbox, false, 12)
			_add_upgrade_label("The earth trembles, but its deepest secrets remain sealed.", top_left_content_vbox, false, 10)
		elif current_top_left_tab == OOZEDRIP_BUTTON_KEY:
			_add_upgrade_icon(OOZEDRIP_ICON_PATH, top_left_content_vbox, Color(0.5, 0.5, 0.5, 0.7))
			_add_upgrade_label("OOZEDRIP CONCENTRATION", top_left_content_vbox, true, 18)
			_add_upgrade_label("(Coming Soon!)", top_left_content_vbox, false, 12)
			_add_upgrade_label("The ancient ooze is yet too diluted for true power.", top_left_content_vbox, false, 10)
		else:
			# Default placeholder for other upgrade tabs or initial view
			var content_label = Label.new()
			# More generic message for the panel itself if no specific upgrade is shown
			content_label.text = "Your acquired upgrades are displayed here.\nVisit the Girth Bazaar to obtain new powers!"
			content_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			content_label.autowrap_mode = TextServer.AUTOWRAP_WORD
			if UPGRADE_FONT:
				content_label.add_theme_font_override("font", UPGRADE_FONT)
				content_label.add_theme_font_size_override("font_size", 14) # Adjusted size for general message
			top_left_content_vbox.add_child(content_label)
	else:
		push_error("UINavigationManager: top_left_content_vbox is not valid.")

func _update_bottom_left_content_visibility():
	# Show regular bottom-left content based on current tab
	if is_instance_valid(achievements_content_vbox): achievements_content_vbox.visible = (current_bottom_left_tab == "achievements")
	if is_instance_valid(trophies_content_grid): trophies_content_grid.visible = (current_bottom_left_tab == "trophies")
	if is_instance_valid(blockchain_content_vbox): 
		blockchain_content_vbox.visible = (current_bottom_left_tab == "blockchain")
		# When blockchain tab is selected, show basic blockchain info (not Oracle content)
		if current_bottom_left_tab == "blockchain":
			_show_blockchain_content()

# Show basic blockchain content (separate from Oracle content)
func _show_blockchain_content():
	if not blockchain_content_vbox:
		return
	
	# Clear any Oracle content children first
	for child in blockchain_content_vbox.get_children():
		if child.name in ["OracleDecreeContent", "OracleScrollsContent", "OraclePetitionContent"]:
			child.visible = false
	
	# Check if we need to add basic blockchain content
	var has_basic_content = false
	for child in blockchain_content_vbox.get_children():
		if child.name not in ["OracleDecreeContent", "OracleScrollsContent", "OraclePetitionContent"]:
			has_basic_content = true
			break
	
	if not has_basic_content:
		# Create basic blockchain content
		var header = Label.new()
		header.text = "🔗 BLOCKCHAIN CONNECTION 🔗"
		header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		header.add_theme_color_override("font_color", Color(0.2, 0.8, 1.0, 1.0))
		header.add_theme_color_override("font_shadow_color", Color(0.0, 0.2, 0.5, 1.0))
		blockchain_content_vbox.add_child(header)
		
		var spacer = Control.new()
		spacer.custom_minimum_size = Vector2(0, 15)
		blockchain_content_vbox.add_child(spacer)
		
		var content_label = Label.new()
		content_label.text = "Your connection to the Solana blockchain will be displayed here. Connect your wallet to unlock the full power of decentralized GIRTH!"
		content_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		content_label.autowrap_mode = TextServer.AUTOWRAP_WORD
		content_label.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0, 1.0))
		blockchain_content_vbox.add_child(content_label)

# Oracle content visibility functions (called by MainLayout)
func show_oracle_decree_content():
	print("UINavigationManager: Showing Oracle Decree content")
	_hide_all_bottom_left_content()
	if oracle_decree_content: oracle_decree_content.visible = true
	# Update styling to show no regular bottom-left tab is active
	current_bottom_left_tab = ""
	_apply_button_styling()

func show_oracle_scrolls_content():
	print("UINavigationManager: Showing Oracle Scrolls content")
	_hide_all_bottom_left_content()
	if oracle_scrolls_content: oracle_scrolls_content.visible = true
	# Update styling to show no regular bottom-left tab is active
	current_bottom_left_tab = ""
	_apply_button_styling()

func show_oracle_petition_content():
	print("UINavigationManager: Showing Oracle Petition content")
	_hide_all_bottom_left_content()
	if oracle_petition_content: oracle_petition_content.visible = true
	# Update styling to show no regular bottom-left tab is active
	current_bottom_left_tab = ""
	_apply_button_styling()

func _hide_all_bottom_left_content():
	# Hide regular bottom-left content
	if achievements_content_vbox: achievements_content_vbox.visible = false
	if trophies_content_grid: trophies_content_grid.visible = false
	
	# Hide Oracle content
	if oracle_decree_content: oracle_decree_content.visible = false
	if oracle_scrolls_content: oracle_scrolls_content.visible = false
	if oracle_petition_content: oracle_petition_content.visible = false
	
	# Keep blockchain_content_vbox visible but manage its children

func _update_top_right_content_visibility():
	if is_instance_valid(store_content_vbox):
		# Clear all existing children
		for child in store_content_vbox.get_children():
			child.queue_free()
		
		# Populate based on the selected tab
		match current_top_right_tab:
			"store": # This key should match what's used in MainLayout.gd for ShopTab1Button
				_populate_girth_bazaar()
			"premium", "boosts", "nft", "skins", "special":
				# For other tabs, show a placeholder message
				var content_label = Label.new()
				var display_name = current_top_right_tab.capitalize()
				if top_right_buttons.has(current_top_right_tab) and is_instance_valid(top_right_buttons[current_top_right_tab]):
					display_name = top_right_buttons[current_top_right_tab].text
				content_label.text = "Selected: %s\n(Coming Soon!)" % display_name
				content_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
				content_label.autowrap_mode = TextServer.AUTOWRAP_WORD
				if UPGRADE_FONT: # Assuming UPGRADE_FONT is defined in UINavigationManager
					content_label.add_theme_font_override("font", UPGRADE_FONT)
				store_content_vbox.add_child(content_label)
			_:
				var default_label = Label.new()
				default_label.text = "Content for %s" % current_top_right_tab.capitalize()
				default_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
				store_content_vbox.add_child(default_label)
	else:
		push_error("UINavigationManager: store_content_vbox is not valid.")

func _update_bottom_right_content_visibility():
	if is_instance_valid(settings_content_vbox): settings_content_vbox.visible = (current_bottom_right_tab == "settings")
	if is_instance_valid(stats_content_vbox): stats_content_vbox.visible = (current_bottom_right_tab == "stats")
	if is_instance_valid(info_content_vbox): info_content_vbox.visible = (current_bottom_right_tab == "info")

# --- Button Styling --- 
func _apply_button_styling():
	_style_button_group(upgrade_buttons, current_top_left_tab)
	_style_button_group(bottom_left_buttons, current_bottom_left_tab)
	_style_button_group(top_right_buttons, current_top_right_tab)
	_style_button_group(bottom_right_buttons, current_bottom_right_tab)

func _style_button_group(buttons: Dictionary, active_tab_key: String):
	for btn_key_name in buttons:
		var btn_node = buttons[btn_key_name]
		if is_instance_valid(btn_node):
			# Default styling for active/inactive
			if btn_key_name == active_tab_key:
				btn_node.modulate = Color.WHITE # Active tab
			else:
				btn_node.modulate = Color(0.7, 0.7, 0.7, 0.8) # Inactive tab

			# Special styling for Iron Grip button based on purchase status
			if btn_key_name == IRON_GRIP_BUTTON_KEY and Global:
				if not Global.iron_grip_lvl1_purchased:
					# Not purchased: make it look "locked" or less prominent if not active
					if btn_key_name != active_tab_key:
						btn_node.modulate = Color(0.5, 0.5, 0.5, 0.6) # Dimmer if not active and not purchased
					else:
						btn_node.modulate = Color(0.8, 0.7, 0.5, 0.9) # Slightly different if active but not purchased
					# You could also change text, add an icon, or change stylebox here
					# Example: btn_node.text = "THE IRON GRIP (Locked)"
				else:
					# Purchased: make it look prominent
					if btn_key_name == active_tab_key:
						btn_node.modulate = Color(1, 0.9, 0.7, 1) # Gold-ish when active & purchased
					else:
						btn_node.modulate = Color(0.8, 0.7, 0.5, 1) # Slightly less gold if not active but purchased

# Helper to print if nodes are valid for debugging
func _check_node_validity():
	print("--- UINavigationManager Node Validity Check ---")
	print("Upgrade Buttons:")
	for btn_name in upgrade_buttons: print("  %s: %s" % [btn_name, is_instance_valid(upgrade_buttons[btn_name])])
	print("Top-Left Content Container: %s" % is_instance_valid(top_left_content_vbox))
	
	print("Bottom-Left Buttons:")
	for btn_name in bottom_left_buttons: print("  %s: %s" % [btn_name, is_instance_valid(bottom_left_buttons[btn_name])])
	print("Achievements Panel: %s" % is_instance_valid(achievements_content_vbox))
	print("Trophies Panel: %s" % is_instance_valid(trophies_content_grid))
	print("Blockchain Panel: %s" % is_instance_valid(blockchain_content_vbox))

	print("Top-Right Buttons:")
	for btn_name in top_right_buttons: print("  %s: %s" % [btn_name, is_instance_valid(top_right_buttons[btn_name])])
	print("Top-Right Content Container: %s" % is_instance_valid(store_content_vbox))

	print("Bottom-Right Buttons:")
	for btn_name in bottom_right_buttons: print("  %s: %s" % [btn_name, is_instance_valid(bottom_right_buttons[btn_name])])
	print("Settings Panel: %s" % is_instance_valid(settings_content_vbox))
	print("Stats Panel: %s" % is_instance_valid(stats_content_vbox))
	print("Info Panel: %s" % is_instance_valid(info_content_vbox))
	print("--------------------------------------------")

# --- Button Click Handlers ---
func _on_button_click(button_key: String, button_group: Dictionary, button_group_name: String):
	var old_tab = ""
	
	# Update the active tab based on the button group
	if button_group_name == "top_left":
		old_tab = current_top_left_tab
		current_top_left_tab = button_key
		_update_top_left_content_visibility()
	elif button_group_name == "bottom_left":
		old_tab = current_bottom_left_tab
		current_bottom_left_tab = button_key
		_update_bottom_left_content_visibility()
	elif button_group_name == "top_right":
		old_tab = current_top_right_tab
		current_top_right_tab = button_key
		_update_top_right_content_visibility()
		
		# Track shop button clicks for achievements
		if button_key == "store" and Global and not Global.has_viewed_bazaar:
			# First time viewing the Girth Bazaar achievement
			Global.has_viewed_bazaar = true
			AchievementManager.unlock_achievement("window_shopper")
	elif button_group_name == "bottom_right":
		old_tab = current_bottom_right_tab
		current_bottom_right_tab = button_key
		_update_bottom_right_content_visibility()
	
	# Update button styling
	_apply_button_styling()
	
	print("UINavigationManager: Tab switched from '%s' to '%s' in %s panel" % [old_tab, button_key, button_group_name]) 

func _create_prophecies_section():
	# Create a section for prophecy history in the blockchain tab
	if blockchain_content_vbox:
		# Create a label for the prophecies section
		var prophecy_header = Label.new()
		prophecy_header.text = "🔮 ORACLE PROPHECIES 🔮"
		prophecy_header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		prophecy_header.add_theme_color_override("font_color", Color(1.0, 0.5, 0.0, 1.0))
		prophecy_header.add_theme_color_override("font_shadow_color", Color(0.5, 0.0, 0.8, 1.0))
		
		# Create a container for prophecies
		prophecies_content = VBoxContainer.new()
		prophecies_content.name = "PropheciesContent"
		
		# Add an initial label
		var initial_label = Label.new()
		initial_label.text = "Prophecies from the Oracle will be recorded here..."
		initial_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		initial_label.add_theme_color_override("font_color", Color(0.0, 0.9, 1.0, 1.0))
		
		# Add to the blockchain content
		prophecies_content.add_child(initial_label)
		
		# Add a spacer above the prophecies section
		var spacer = Control.new()
		spacer.custom_minimum_size = Vector2(0, 20)
		
		blockchain_content_vbox.add_child(spacer)
		blockchain_content_vbox.add_child(prophecy_header)
		blockchain_content_vbox.add_child(prophecies_content)

# Add a new prophecy to the history
func add_prophecy_to_history(title: String, text: String):
	if prophecy_history.size() >= max_prophecies_history:
		prophecy_history.pop_back() # Remove oldest prophecy
	
	# Add new prophecy to the beginning of the array
	prophecy_history.push_front({
		"title": title,
		"text": text,
		"timestamp": Time.get_datetime_string_from_system(),
		"is_new_local": true # Mark as new for local display
	})
	
	# Update the UI
	_update_prophecies_display()

func _update_prophecies_display():
	# Find the prophecies content in Oracle Decree
	var prophecies_content_node = null
	if oracle_decree_content:
		prophecies_content_node = oracle_decree_content.get_node_or_null("PropheciesContent")
	
	if prophecies_content_node:
		# Clear existing prophecies
		for child in prophecies_content_node.get_children():
			child.queue_free()
		
		if prophecy_history.is_empty():
			# Add an initial label if no prophecies
			var initial_label = Label.new()
			initial_label.text = "Prophecies from the Oracle will be recorded here..."
			initial_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			initial_label.add_theme_color_override("font_color", Color(0.0, 0.9, 1.0, 1.0))
			prophecies_content_node.add_child(initial_label)
		else:
			# Add each prophecy to the display
			for prophecy_data in prophecy_history:
				var prophecy_label = Label.new() # Consider RichTextLabel for more styling options
				var prefix = ""
				var text_color = Color(0.0, 0.9, 1.0, 1.0) # Default color

				if prophecy_data.get("is_new_local", false):
					prefix = "* " # Simple new indicator
					text_color = Color(1.0, 1.0, 0.8, 1.0) # Slightly different color for new

				var excerpt = prophecy_data.text
				if excerpt.length() > 50:
					excerpt = excerpt.substr(0, 50) + "..."
				
				prophecy_label.text = prefix + "[" + _format_timestamp_for_display(prophecy_data.timestamp) + "] " + prophecy_data.title + ": " + excerpt
				prophecy_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
				prophecy_label.autowrap_mode = TextServer.AUTOWRAP_WORD
				prophecy_label.add_theme_color_override("font_color", text_color)
				prophecy_label.add_theme_color_override("font_shadow_color", Color(0.5, 0.0, 0.8, 1.0))
				
				prophecies_content_node.add_child(prophecy_label)
				
				# Add a small spacer between prophecies
				var spacer = Control.new()
				spacer.custom_minimum_size = Vector2(0, 10)
				prophecies_content_node.add_child(spacer)

# Helper to format timestamp for display
func _format_timestamp_for_display(full_timestamp: String) -> String:
	# Full_timestamp is like "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DDTHH:MM:SSZ"
	# We want something shorter, e.g., "HH:MM"
	var parts_space = full_timestamp.split(" ")
	var parts_t = full_timestamp.split("T")
	var time_part = ""

	if parts_space.size() == 2:
		time_part = parts_space[1] # "HH:MM:SS"
	elif parts_t.size() >= 2: # Could be YYYY-MM-DDTHH:MM:SSZ or just HH:MM:SSZ if date not present
		time_part = parts_t[1]
		# If it was YYYY-MM-DDTHH:MM:SSZ, time_part is HH:MM:SSZ
		# If it was just T HH:MM:SS (unlikely from Time.get_datetime_string_from_system)
		# then parts_t[0] would be empty, parts_t[1] is HH:MM:SS
	else: # If no clear date/time separator, try to find colon
		if ":" in full_timestamp:
			# Simplistic fallback, might not be robust
			var time_parts_direct = full_timestamp.split(":")
			if time_parts_direct.size() >= 2:
				return "%s:%s" % [time_parts_direct[0].right(2) if time_parts_direct[0].length() > 2 else time_parts_direct[0] , time_parts_direct[1]]
		return full_timestamp # Fallback if no T or space, and no colon in a way we expect

	if not time_part.is_empty():
		var time_components = time_part.split(":")
		if time_components.size() >= 2:
			return "%s:%s" % [time_components[0], time_components[1]] # "HH:MM"
	
	return full_timestamp # Fallback

func _display_iron_grip_details(container: VBoxContainer):
	if not Global: # Ensure Global is accessible
		push_error("UINavigationManager: Global singleton not found. Cannot display Iron Grip details.")
		var error_label = _add_upgrade_label("Error: Game data unavailable.", container)
		error_label.modulate = Color.RED
		return

	if Global.iron_grip_lvl1_purchased:
		_add_upgrade_icon(IRON_GRIP_ICON_PATH, container)
		_add_upgrade_label("THE IRON GRIP - RANK 1", container, true, 18) # Larger title
		_add_upgrade_label("Rank: 1", container)
		var bonus_percent = Global.iron_grip_mega_slap_bonus_multiplier * 100
		_add_upgrade_label("Ancient forearm techniques. Empowers your Mega & Giga Slaps with +%s%% Girth!" % bonus_percent, container)
	else:
		# Not purchased state
		_add_upgrade_icon(IRON_GRIP_ICON_PATH, container, Color(0.5, 0.5, 0.5, 0.7)) # Dimmed icon
		_add_upgrade_label("THE IRON GRIP", container, true, 18)
		_add_upgrade_label("(Not Acquired)", container)
		_add_upgrade_label("Mysterious ancient techniques that promise to enhance your slapping power. Seek this artifact in the Girth Bazaar to unlock its potential!", container)

func _add_upgrade_label(text: String, parent_node: Node, is_title: bool = false, font_size_override: int = 0) -> Label:
	var label = Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.autowrap_mode = TextServer.AUTOWRAP_WORD
	if UPGRADE_FONT:
		label.add_theme_font_override("font", UPGRADE_FONT)
	else:
		push_warning("UINavigationManager: UPGRADE_FONT not loaded.")
	if is_title:
		label.add_theme_color_override("font_color", Color(1, 0.8, 0.2, 1)) # Gold-ish for title
		label.add_theme_font_size_override("font_size", font_size_override if font_size_override > 0 else 16)
	else:
		label.add_theme_color_override("font_color", Color(0.9, 0.9, 0.9, 1))
		label.add_theme_font_size_override("font_size", font_size_override if font_size_override > 0 else 12)
	parent_node.add_child(label)
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 5 if is_title else 2)
	parent_node.add_child(spacer)
	return label

func _add_upgrade_icon(icon_path: String, parent_node: Node, modulate_color: Color = Color.WHITE):
	var texture_rect = TextureRect.new()
	var icon_texture = load(icon_path)
	if icon_texture:
		texture_rect.texture = icon_texture
		texture_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		texture_rect.custom_minimum_size = Vector2(64, 64) # Adjust size as needed
		texture_rect.modulate = modulate_color
		texture_rect.size_flags_horizontal = Control.SIZE_SHRINK_CENTER # Allow parent to center
		parent_node.add_child(texture_rect)
		var spacer = Control.new()
		spacer.custom_minimum_size = Vector2(0, 10)
		parent_node.add_child(spacer)
	else:
		push_warning("UINavigationManager: Failed to load upgrade icon at path: " + icon_path)

# Populates the Girth Bazaar with upgrade offering cards
func _populate_girth_bazaar():
	if not is_instance_valid(store_content_vbox):
		push_error("UINavigationManager: Cannot populate Girth Bazaar, store_content_vbox is not valid")
		return
	
	# Title for the Bazaar
	var bazaar_title = Label.new()
	bazaar_title.text = "GIRTH BAZAAR"
	bazaar_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	bazaar_title.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2, 1.0)) # Gold
	if UPGRADE_FONT:
		bazaar_title.add_theme_font_override("font", UPGRADE_FONT)
		bazaar_title.add_theme_font_size_override("font_size", 22)
	store_content_vbox.add_child(bazaar_title)
	
	var title_spacer = Control.new()
	title_spacer.custom_minimum_size = Vector2(0, 15)
	store_content_vbox.add_child(title_spacer)
	
	var has_upgrades_to_show = false
	for upgrade_data_item in AVAILABLE_UPGRADES:
		if UPGRADE_OFFERING_CARD_SCENE:
			var card_instance = UPGRADE_OFFERING_CARD_SCENE.instantiate()
			if card_instance:
				if not card_instance.is_connected("purchase_completed", Callable(self, "_on_upgrade_purchase_completed")):
					card_instance.purchase_completed.connect(Callable(self, "_on_upgrade_purchase_completed"))

				card_instance.configure(upgrade_data_item)
				store_content_vbox.add_child(card_instance)
				
				var card_spacer = Control.new()
				card_spacer.custom_minimum_size = Vector2(0, 10)
				store_content_vbox.add_child(card_spacer)
				has_upgrades_to_show = true
		else:
			push_error("UINavigationManager: UPGRADE_OFFERING_CARD_SCENE not loaded!")
			break # Stop trying if scene is missing

	if not has_upgrades_to_show:
		var no_upgrades_label = Label.new()
		no_upgrades_label.text = "The Girth Bazaar is currently empty.\nMore potent artifacts will arrive soon!"
		no_upgrades_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		no_upgrades_label.autowrap_mode = TextServer.AUTOWRAP_WORD
		if UPGRADE_FONT:
			no_upgrades_label.add_theme_font_override("font", UPGRADE_FONT)
		store_content_vbox.add_child(no_upgrades_label)

# Handle upgrade purchase completion
func _on_upgrade_purchase_completed(upgrade_id: String):
	print("UINavigationManager: Received purchase_completed for: ", upgrade_id)
	# Refresh cards in the bazaar (their internal state might change, e.g. "Acquired")
	# The card itself handles its visual update upon purchase.
	# However, if Girth changed, other cards might become purchasable/unpurchasable.
	for child in store_content_vbox.get_children():
		if child is PanelContainer and child.has_method("refresh_state"): # Check if it's one of our cards
			child.refresh_state()

	# If the purchased upgrade was Iron Grip, refresh the top-left display if it's active
	if upgrade_id == "iron_grip_rank_1" and current_top_left_tab == IRON_GRIP_BUTTON_KEY:
		_update_top_left_content_visibility() 
	
	_apply_button_styling() # Refresh styling of top-left buttons if one was purchased

func _create_oracle_content_sections():
	print("UINavigationManager: Creating Oracle content sections...")
	
	# Find the blockchain content container to use as parent for Oracle sections
	if blockchain_content_vbox:
		# Create Oracle Decree content (this will contain the prophecies)
		oracle_decree_content = VBoxContainer.new()
		oracle_decree_content.name = "OracleDecreeContent"
		oracle_decree_content.visible = false
		oracle_decree_content.add_theme_constant_override("separation", 8)
		blockchain_content_vbox.add_child(oracle_decree_content)
		
		# Create Oracle Scrolls content
		oracle_scrolls_content = VBoxContainer.new()
		oracle_scrolls_content.name = "OracleScrollsContent"
		oracle_scrolls_content.visible = false
		oracle_scrolls_content.add_theme_constant_override("separation", 8)
		blockchain_content_vbox.add_child(oracle_scrolls_content)
		
		# Create Oracle Petition content
		oracle_petition_content = VBoxContainer.new()
		oracle_petition_content.name = "OraclePetitionContent"
		oracle_petition_content.visible = false
		oracle_petition_content.add_theme_constant_override("separation", 8)
		blockchain_content_vbox.add_child(oracle_petition_content)
		
		# Populate Oracle Decree with prophecies content
		_create_prophecies_section_in_decree()
		
		# Populate other Oracle sections
		_populate_oracle_scrolls_content()
		_populate_oracle_petition_content()
		
		print("UINavigationManager: ✅ Oracle content sections created")

func _create_prophecies_section_in_decree():
	# Create prophecies section specifically for Oracle's Decree content
	if oracle_decree_content:
		# Create a label for the prophecies section
		var prophecy_header = Label.new()
		prophecy_header.text = "🔮 ORACLE PROPHECIES 🔮"
		prophecy_header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		prophecy_header.add_theme_color_override("font_color", Color(1.0, 0.5, 0.0, 1.0))
		prophecy_header.add_theme_color_override("font_shadow_color", Color(0.5, 0.0, 0.8, 1.0))
		
		# Create a container for prophecies
		prophecies_content = VBoxContainer.new()
		prophecies_content.name = "PropheciesContent"
		
		# Add an initial label
		var initial_label = Label.new()
		initial_label.text = "Prophecies from the Oracle will be recorded here..."
		initial_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		initial_label.add_theme_color_override("font_color", Color(0.0, 0.9, 1.0, 1.0))
		
		# Add to the Oracle Decree content
		prophecies_content.add_child(initial_label)
		
		# Add a spacer above the prophecies section
		var spacer = Control.new()
		spacer.custom_minimum_size = Vector2(0, 20)
		
		oracle_decree_content.add_child(spacer)
		oracle_decree_content.add_child(prophecy_header)
		oracle_decree_content.add_child(prophecies_content)

func _populate_oracle_scrolls_content():
	if oracle_scrolls_content:
		var header = Label.new()
		header.text = "📜 SACRED SCROLLS 📜"
		header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		header.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2, 1.0))
		oracle_scrolls_content.add_child(header)
		
		var spacer = Control.new()
		spacer.custom_minimum_size = Vector2(0, 15)
		oracle_scrolls_content.add_child(spacer)
		
		var content_label = Label.new()
		content_label.text = "Ancient wisdom and sacred texts will be revealed here when the Oracle deems you worthy..."
		content_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		content_label.autowrap_mode = TextServer.AUTOWRAP_WORD
		content_label.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0, 1.0))
		oracle_scrolls_content.add_child(content_label)

func _populate_oracle_petition_content():
	if oracle_petition_content:
		var header = Label.new()
		header.text = "🙏 PETITION THE ORACLE 🙏"
		header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		header.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2, 1.0))
		oracle_petition_content.add_child(header)
		
		var spacer = Control.new()
		spacer.custom_minimum_size = Vector2(0, 15)
		oracle_petition_content.add_child(spacer)
		
		var content_label = Label.new()
		content_label.text = "Submit your humble requests to the Oracle. Craft your words carefully, for the Oracle sees all..."
		content_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		content_label.autowrap_mode = TextServer.AUTOWRAP_WORD
		content_label.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0, 1.0))
		oracle_petition_content.add_child(content_label)
