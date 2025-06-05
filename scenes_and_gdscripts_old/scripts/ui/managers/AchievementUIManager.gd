extends Node

# Manages achievement UI, pop-ups, and the achievements panel.

# Scene reference for individual achievement items
var achievement_item_scene = preload("res://scenes/ui/components/AchievementItem.tscn")

# UI Node References (assuming AchievementUIManager is a child of MainLayout)
@onready var achievement_panel = get_owner().get_node_or_null("Margin/MainHBox/CenterArea/HUDMessagesPanel/HUDSectionPanel/NotificationsContainer/AchievementPanel")
@onready var achievements_content_vbox = get_owner().get_node_or_null("Margin/MainHBox/LeftPanel/BottomLeftContainer/BottomStylePanel/BottomContent/BottomContentPanel/BottomScrollContainer/AchievementsContentVBox")

# Oracle prophecy styling
var oracle_name_color = Color(1.0, 0.5, 0.0, 1.0)  # Orange/gold
var oracle_desc_color = Color(0.0, 0.9, 1.0, 1.0)  # Cyan
var oracle_shadow_color = Color(0.8, 0.0, 0.8, 1.0)  # Purple

# Reference to TapperArea for connecting its achievement signal
var tapper_area_node: Node # Will be injected by MainLayout

func _ready():
	# _ready() is now simpler, initialization logic moved to initialize_achievements
	pass

# Call this from MainLayout after it has its nodes ready
func initialize_achievements(p_tapper_area_node: Node):
	print("AchievementUIManager: Initializing...")
	
	tapper_area_node = p_tapper_area_node
	if not is_instance_valid(tapper_area_node):
		push_warning("AchievementUIManager: Injected TapperArea node is invalid!")
	else:
		print("AchievementUIManager: TapperArea node injected successfully.")

	# Connect to AchievementManager signals
	await get_owner().get_tree().process_frame # Wait for AchievementManager to be ready (owner = MainLayout)
	if AchievementManager.get_instance():
		AchievementManager.get_instance().achievement_unlocked.connect(_on_achievement_manager_achievement_unlocked)
		_update_achievements_panel()
		print("AchievementUIManager: Connected to AchievementManager.")
	else:
		print("AchievementUIManager: ERROR - AchievementManager instance not found!")

	# Connect to TapperArea's achievement signal for pop-up notifications
	if is_instance_valid(tapper_area_node) and tapper_area_node.has_signal("achievement_unlocked"):
		# Ensure not already connected if this method could be called multiple times (though unlikely for init)
		if tapper_area_node.is_connected("achievement_unlocked", _on_tapper_area_achievement_unlocked):
			tapper_area_node.disconnect("achievement_unlocked", _on_tapper_area_achievement_unlocked)
		tapper_area_node.connect("achievement_unlocked", _on_tapper_area_achievement_unlocked)
		print("AchievementUIManager: Connected to injected TapperArea.achievement_unlocked for pop-ups.")
	elif is_instance_valid(tapper_area_node):
		print("AchievementUIManager: WARNING - Injected TapperArea node does not have achievement_unlocked signal.")
	
	# Connect to Global's achievement signal as a fallback or for general pop-ups
	if Global and Global.has_signal("achievement_unlocked"):
		if Global.is_connected("achievement_unlocked", _on_global_achievement_unlocked):
			Global.disconnect("achievement_unlocked", _on_global_achievement_unlocked)
		Global.connect("achievement_unlocked", _on_global_achievement_unlocked)
		print("AchievementUIManager: Connected to Global.achievement_unlocked for pop-ups.")

# --- Core Functions --- 

# Show an achievement notification pop-up
func show_achievement_popup(title: String, description: String, duration: float = 3.0) -> void:
	if achievement_panel:
		achievement_panel.show_achievement(title, description, duration)
	else:
		print("AchievementUIManager: ERROR - achievement_panel node not found, cannot show pop-up.")

# Show an achievement notification with special styling for Oracle prophecies
func show_achievement_notification(title: String, description: String, is_oracle_prophecy: bool = false, duration: float = 5.0) -> void:
	if achievement_panel:
		# Save the original styling
		var panel = achievement_panel.get_node("PanelContainer")
		var name_label = achievement_panel.get_node("PanelContainer/VBoxContainer/AchievementNameLabel")
		var desc_label = achievement_panel.get_node("PanelContainer/VBoxContainer/AchievementDescLabel")
		
		var original_panel_style = panel.get_theme_stylebox("panel").duplicate()
		var original_name_color = name_label.get("theme_override_colors/font_color")
		var original_name_shadow = name_label.get("theme_override_colors/font_shadow_color")
		var original_desc_color = desc_label.get("theme_override_colors/font_color")
		var original_desc_shadow = desc_label.get("theme_override_colors/font_shadow_color")
		
		# Apply Oracle styling if needed
		if is_oracle_prophecy:
			# Create a more dramatic, mystical styling for Oracle prophecies
			var panel_style = panel.get_theme_stylebox("panel").duplicate()
			panel_style.border_color = Color(0.8, 0.4, 0.0, 0.8)  # Golden/orange border
			panel_style.shadow_color = Color(0.5, 0.0, 0.8, 0.6)  # Purple shadow
			panel_style.shadow_size = 15  # Larger shadow
			panel.add_theme_stylebox_override("panel", panel_style)
			
			# Mystical title styling
			name_label.add_theme_color_override("font_color", oracle_name_color)
			name_label.add_theme_color_override("font_shadow_color", oracle_shadow_color)
			name_label.add_theme_constant_override("shadow_offset_x", 4)
			name_label.add_theme_constant_override("shadow_offset_y", 4)
			
			# Mystical description styling
			desc_label.add_theme_color_override("font_color", oracle_desc_color)
			desc_label.add_theme_color_override("font_shadow_color", oracle_shadow_color)
			desc_label.add_theme_constant_override("shadow_offset_x", 3)
			desc_label.add_theme_constant_override("shadow_offset_y", 3)
			
			# Add the prophecy to the achievements panel for historical record
			_add_prophecy_to_achievements_panel(title, description)
		
		# Show the notification
		achievement_panel.show_achievement(title, description, duration)
		
		# Reset to original styling after the notification disappears
		await achievement_panel.achievement_hidden
		if is_oracle_prophecy:
			panel.add_theme_stylebox_override("panel", original_panel_style)
			name_label.add_theme_color_override("font_color", original_name_color)
			name_label.add_theme_color_override("font_shadow_color", original_name_shadow)
			desc_label.add_theme_color_override("font_color", original_desc_color)
			desc_label.add_theme_color_override("font_shadow_color", original_desc_shadow)
	else:
		print("AchievementUIManager: ERROR - achievement_panel node not found, cannot show notification.")

# Update achievements panel/tab with current achievements
func _update_achievements_panel():
	if not achievements_content_vbox: 
		print("AchievementUIManager: ERROR - achievements_content_vbox not found.")
		return

	# Clear existing content
	for child in achievements_content_vbox.get_children():
		child.queue_free()
	
	var header = Label.new()
	header.text = "YOUR ACHIEVEMENTS"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	# Consider setting font and color via a theme or stylebox for consistency
	# header.add_theme_font_override("font", load("res://assets/fonts/BrokenConsoleBold.ttf"))
	# header.add_theme_color_override("font_color", Color(1, 0.8, 0.2))
	achievements_content_vbox.add_child(header)
	
	var unlocked_achievements = []
	if AchievementManager.get_instance():
		unlocked_achievements = AchievementManager.get_unlocked_achievements()
	else:
		print("AchievementUIManager: WARNING - AchievementManager not available for _update_achievements_panel.")

	if unlocked_achievements.is_empty():
		var no_achievements_label = Label.new()
		no_achievements_label.text = "No achievements unlocked yet.\nKeep tapping that $CHODE!"
		no_achievements_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		no_achievements_label.autowrap_mode = TextServer.AUTOWRAP_WORD # Corrected for Godot 4
		achievements_content_vbox.add_child(no_achievements_label)
		return
	
	for achievement_data in unlocked_achievements:
		var achievement_item = achievement_item_scene.instantiate()
		achievements_content_vbox.add_child(achievement_item)
		achievement_item.setup(achievement_data) # Assuming setup method exists on AchievementItem
		# Connect to the item's own signal if it emits one when clicked
		if achievement_item.has_signal("achievement_selected"):
			achievement_item.achievement_selected.connect(_on_achievement_item_selected_in_list)
	
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 20)
	achievements_content_vbox.add_child(spacer)

# Add a prophecy to the achievements panel for historical record
func _add_prophecy_to_achievements_panel(title: String, description: String) -> void:
	if not achievements_content_vbox: 
		print("AchievementUIManager: ERROR - achievements_content_vbox not found.")
		return
		
	# Create a label for the prophecy
	var prophecy_label = Label.new()
	prophecy_label.text = "📜 " + title + ": " + description
	prophecy_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	prophecy_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	prophecy_label.add_theme_color_override("font_color", oracle_desc_color)
	prophecy_label.add_theme_color_override("font_shadow_color", oracle_shadow_color)
	
	# Add the prophecy to the beginning of the achievements panel
	if achievements_content_vbox.get_child_count() > 0:
		achievements_content_vbox.add_child(prophecy_label)
		achievements_content_vbox.move_child(prophecy_label, 1) # Move after the header
	else:
		achievements_content_vbox.add_child(prophecy_label)

# --- Signal Handlers ---

# Called when an achievement item is clicked in the list (from AchievementItem.tscn)
func _on_achievement_item_selected_in_list(achievement_id: String):
	if AchievementManager.get_instance():
		var achievement = AchievementManager.get_achievement(achievement_id)
		if achievement and achievement.is_unlocked:
			# Show pop-up again if an already unlocked achievement is clicked in the list
			show_achievement_popup(achievement.title, achievement.description, 3.0)
	else:
		print("AchievementUIManager: WARNING - AchievementManager not available for _on_achievement_item_selected_in_list.")

# Called when AchievementManager unlocks a new achievement (updates the list)
func _on_achievement_manager_achievement_unlocked(achievement_data): # achievement_data is the Achievement object
	_update_achievements_panel()
	# The pop-up is usually handled by TapperArea or Global emitting achievement_unlocked.
	# If AchievementManager is the sole source of truth for unlocking, 
	# then this handler could also call show_achievement_popup.
	# show_achievement_popup(achievement_data.title, achievement_data.description, 5.0) 

# Called when TapperArea emits achievement_unlocked (for pop-up)
func _on_tapper_area_achievement_unlocked(title: String, description: String, duration: float = 3.0):
	print("AchievementUIManager: Received achievement from TapperArea - ", title)
	show_achievement_popup(title, description, duration)

# Called when Global emits achievement_unlocked (for pop-up, fallback)
func _on_global_achievement_unlocked(title: String, description: String, duration: float = 3.0):
	print("AchievementUIManager: Received achievement from Global - ", title)
	show_achievement_popup(title, description, duration) 
