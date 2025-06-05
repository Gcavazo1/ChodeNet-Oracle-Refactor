extends Node
class_name UIContentManager

# Manages UI content display by delegating to the original UINavigationManager
# This class acts as a bridge between the new modular architecture and the existing functionality

# Reference to the original UINavigationManager with all the real functionality
var ui_navigation_manager: UINavigationManager = null

# Manages UI content display without business logic
const UPGRADE_FONT = preload("res://assets/fonts/BrokenConsoleBold.ttf")
const UPGRADE_OFFERING_CARD_SCENE = preload("res://scenes/ui/components/UpgradeOfferingCard.tscn")

# Upgrade data and paths
const IRON_GRIP_ICON_PATH = "res://assets/art/upgrades/iron_grip.svg"
const CHODEBOT_ICON_PATH = "res://assets/art/upgrades/chodebot_efficiency_matrix.svg"
const GIRTHQUAKE_ICON_PATH = "res://assets/art/upgrades/girthquake_magnitude.svg"
const OOZEDRIP_ICON_PATH = "res://assets/art/upgrades/oozedrip_concentration.svg"

# Available upgrades for the bazaar
const AVAILABLE_UPGRADES = [
	{
		"id": "iron_grip_rank_1",
		"name": "The Iron Grip of CHODEMASTERY",
		"description": "Forge your slaps in the crucible of ancient power! Each caress becomes a testament to your burgeoning GIRTH.",
		"effect_text": "Grants a +25% GIRTH bonus to all Mega & Giga Slaps. Feel the power course through you!",
		"cost": 500,
		"icon_path": "res://assets/art/upgrades/iron_grip.svg",
		"category": "slap_empowerment",
		"level": 1
	}
]

signal upgrade_purchase_completed(upgrade_id: String)

func _ready():
	print("UIContentManager: Initializing as bridge to UINavigationManager...")

func set_ui_navigation_manager(nav_manager: UINavigationManager):
	"""Set reference to the original UINavigationManager"""
	ui_navigation_manager = nav_manager
	if ui_navigation_manager and not ui_navigation_manager.is_connected("purchase_completed", Callable(self, "_on_upgrade_purchase_completed")):
		# Connect to UINavigationManager signals if they exist
		print("UIContentManager: Connected to UINavigationManager")

func populate_achievements_content(container: VBoxContainer):
	"""Populate achievements content by showing the actual achievements system"""
	if not ui_navigation_manager:
		_show_placeholder_achievements(container)
		return
	
	# The achievements are already handled by UINavigationManager in the bottom-left panel
	# When achievements tab is selected, UINavigationManager shows the real achievement content
	# This function might not be needed since UINavigationManager handles it
	print("UIContentManager: Achievements content managed by UINavigationManager")

func populate_trophies_content(container: VBoxContainer):
	"""Populate trophies content"""
	if not ui_navigation_manager:
		_show_placeholder_trophies(container)
		return
	
	# Trophies are handled by UINavigationManager
	print("UIContentManager: Trophies content managed by UINavigationManager")

func populate_blockchain_content(container: VBoxContainer):
	"""Populate blockchain content"""
	# Note: Don't clear content here as wallet UI components are added by WalletConnectionManager
	# and Oracle content is managed by UINavigationManager
	print("UIContentManager: Blockchain content managed by WalletConnectionManager and UINavigationManager")

func populate_store_content(container: VBoxContainer, tab: String):
	"""Populate store content by delegating to UINavigationManager"""
	if not ui_navigation_manager:
		_show_placeholder_store(container, tab)
		return
	
	# The store content (especially Girth Bazaar) is handled by UINavigationManager
	# which has the real AVAILABLE_UPGRADES data and UpgradeOfferingCard logic
	print("UIContentManager: Store content managed by UINavigationManager")

func populate_upgrade_content(container: VBoxContainer, upgrade_type: String):
	"""Populate upgrade content by delegating to UINavigationManager"""
	if not ui_navigation_manager:
		_show_placeholder_upgrade(container, upgrade_type)
		return
	
	# The upgrade content (like Iron Grip details) is handled by UINavigationManager
	# which has the real _display_iron_grip_details logic
	print("UIContentManager: Upgrade content managed by UINavigationManager")

func clear_content(container: Container):
	"""Clear all children from a container"""
	if not container:
		return
	
	for child in container.get_children():
		child.queue_free()

# === Placeholder functions for when UINavigationManager is not available ===

func _show_placeholder_achievements(container: VBoxContainer):
	clear_content(container)
	var header = Label.new()
	header.text = "🏆 ACHIEVEMENTS 🏆"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	container.add_child(header)
	
	var content = Label.new()
	content.text = "Achievement system loading... Please ensure UINavigationManager is properly initialized."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	container.add_child(content)

func _show_placeholder_trophies(container: VBoxContainer):
	clear_content(container)
	var header = Label.new()
	header.text = "🏆 TROPHIES 🏆"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	container.add_child(header)
	
	var content = Label.new()
	content.text = "Trophy system loading... Please ensure UINavigationManager is properly initialized."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	container.add_child(content)

func _show_placeholder_store(container: VBoxContainer, tab: String):
	clear_content(container)
	var header = Label.new()
	header.text = "🛒 STORE 🛒"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	container.add_child(header)
	
	var content = Label.new()
	content.text = "Store system loading... Please ensure UINavigationManager is properly initialized."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	container.add_child(content)

func _show_placeholder_upgrade(container: VBoxContainer, upgrade_type: String):
	clear_content(container)
	var header = Label.new()
	header.text = "⚡ UPGRADES ⚡"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	container.add_child(header)
	
	var content = Label.new()
	content.text = "Upgrade system loading... Please ensure UINavigationManager is properly initialized."
	content.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.autowrap_mode = TextServer.AUTOWRAP_WORD
	container.add_child(content)

func _on_upgrade_purchase_completed(upgrade_id: String):
	"""Handle upgrade purchase completion from UINavigationManager"""
	print("UIContentManager: Received purchase_completed for: ", upgrade_id)
	emit_signal("upgrade_purchase_completed", upgrade_id)

# Private helper methods
func _populate_girth_bazaar(container: VBoxContainer):
	# Title for the Bazaar
	var bazaar_title = Label.new()
	bazaar_title.text = "GIRTH BAZAAR"
	bazaar_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	bazaar_title.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2, 1.0))
	if UPGRADE_FONT:
		bazaar_title.add_theme_font_override("font", UPGRADE_FONT)
		bazaar_title.add_theme_font_size_override("font_size", 22)
	container.add_child(bazaar_title)
	
	_add_spacer(container, 15)
	
	var has_upgrades_to_show = false
	for upgrade_data_item in AVAILABLE_UPGRADES:
		if UPGRADE_OFFERING_CARD_SCENE:
			var card_instance = UPGRADE_OFFERING_CARD_SCENE.instantiate()
			if card_instance:
				if not card_instance.is_connected("purchase_completed", Callable(self, "_on_upgrade_purchase_completed")):
					card_instance.purchase_completed.connect(Callable(self, "_on_upgrade_purchase_completed"))

				card_instance.configure(upgrade_data_item)
				container.add_child(card_instance)
				
				_add_spacer(container, 10)
				has_upgrades_to_show = true
		else:
			push_error("UIContentManager: UPGRADE_OFFERING_CARD_SCENE not loaded!")
			break

	if not has_upgrades_to_show:
		var no_upgrades_label = Label.new()
		no_upgrades_label.text = "The Girth Bazaar is currently empty.\nMore potent artifacts will arrive soon!"
		no_upgrades_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		no_upgrades_label.autowrap_mode = TextServer.AUTOWRAP_WORD
		if UPGRADE_FONT:
			no_upgrades_label.add_theme_font_override("font", UPGRADE_FONT)
		container.add_child(no_upgrades_label)

func _populate_coming_soon_content(container: VBoxContainer, display_name: String):
	var content_label = Label.new()
	content_label.text = "Selected: %s\n(Coming Soon!)" % display_name
	content_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	if UPGRADE_FONT:
		content_label.add_theme_font_override("font", UPGRADE_FONT)
	container.add_child(content_label)

func _populate_default_store_content(container: VBoxContainer, tab: String):
	var default_label = Label.new()
	default_label.text = "Content for %s" % tab.capitalize()
	default_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	if UPGRADE_FONT:
		default_label.add_theme_font_override("font", UPGRADE_FONT)
	container.add_child(default_label)

func _display_iron_grip_details(container: VBoxContainer):
	if not Global:
		_add_error_label("Error: Game data unavailable.", container)
		return

	if Global.iron_grip_lvl1_purchased:
		_add_upgrade_icon(IRON_GRIP_ICON_PATH, container)
		_add_upgrade_label("THE IRON GRIP - RANK 1", container, true, 18)
		_add_upgrade_label("Rank: 1", container)
		var bonus_percent = Global.iron_grip_mega_slap_bonus_multiplier * 100
		_add_upgrade_label("Ancient forearm techniques. Empowers your Mega & Giga Slaps with +%s%% Girth!" % bonus_percent, container)
	else:
		_add_upgrade_icon(IRON_GRIP_ICON_PATH, container, Color(0.5, 0.5, 0.5, 0.7))
		_add_upgrade_label("THE IRON GRIP", container, true, 18)
		_add_upgrade_label("(Not Acquired)", container)
		_add_upgrade_label("Mysterious ancient techniques that promise to enhance your slapping power. Seek this artifact in the Girth Bazaar to unlock its potential!", container)

func _display_coming_soon_upgrade(container: VBoxContainer, title: String, icon_path: String, description: String):
	_add_upgrade_icon(icon_path, container, Color(0.5, 0.5, 0.5, 0.7))
	_add_upgrade_label(title, container, true, 18)
	_add_upgrade_label("(Coming Soon!)", container, false, 12)
	_add_upgrade_label(description, container, false, 10)

func _display_default_upgrade_content(container: VBoxContainer):
	var content_label = Label.new()
	content_label.text = "Your acquired upgrades are displayed here.\nVisit the Girth Bazaar to obtain new powers!"
	content_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	if UPGRADE_FONT:
		content_label.add_theme_font_override("font", UPGRADE_FONT)
		content_label.add_theme_font_size_override("font_size", 14)
	container.add_child(content_label)

func _add_upgrade_label(text: String, parent_node: Node, is_title: bool = false, font_size_override: int = 0) -> Label:
	var label = Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.autowrap_mode = TextServer.AUTOWRAP_WORD
	if UPGRADE_FONT:
		label.add_theme_font_override("font", UPGRADE_FONT)
	if is_title:
		label.add_theme_color_override("font_color", Color(1, 0.8, 0.2, 1))
		label.add_theme_font_size_override("font_size", font_size_override if font_size_override > 0 else 16)
	else:
		label.add_theme_color_override("font_color", Color(0.9, 0.9, 0.9, 1))
		label.add_theme_font_size_override("font_size", font_size_override if font_size_override > 0 else 12)
	parent_node.add_child(label)
	_add_spacer(parent_node, 5 if is_title else 2)
	return label

func _add_upgrade_icon(icon_path: String, parent_node: Node, modulate_color: Color = Color.WHITE):
	var texture_rect = TextureRect.new()
	var icon_texture = load(icon_path)
	if icon_texture:
		texture_rect.texture = icon_texture
		texture_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		texture_rect.custom_minimum_size = Vector2(64, 64)
		texture_rect.modulate = modulate_color
		texture_rect.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		parent_node.add_child(texture_rect)
		_add_spacer(parent_node, 10)
	else:
		push_warning("UIContentManager: Failed to load upgrade icon at path: " + icon_path)

func _add_error_label(text: String, parent_node: Node):
	var error_label = _add_upgrade_label(text, parent_node)
	error_label.modulate = Color.RED

func _add_spacer(parent_node: Node, height: int):
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, height)
	parent_node.add_child(spacer) 
