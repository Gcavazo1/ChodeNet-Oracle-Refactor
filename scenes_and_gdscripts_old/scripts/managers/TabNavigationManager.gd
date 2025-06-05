extends Node
class_name TabNavigationManager

# Handles tab switching by delegating to the original UINavigationManager
# This class acts as a bridge between the new modular architecture and the existing functionality

# Reference to the original UINavigationManager with all the real functionality
var ui_navigation_manager: UINavigationManager = null

signal tab_selected(panel: String, tab: String)

var active_tabs: Dictionary = {}
var button_groups: Dictionary = {}

func _ready():
	print("TabNavigationManager: Initializing as bridge to UINavigationManager...")

func set_ui_navigation_manager(nav_manager: UINavigationManager):
	"""Set reference to the original UINavigationManager"""
	ui_navigation_manager = nav_manager
	print("TabNavigationManager: Connected to UINavigationManager")

func set_button_groups(p_button_groups: Dictionary):
	"""Set button group references - UINavigationManager will handle the actual connections"""
	button_groups = p_button_groups
	
	# Don't connect signals here since UINavigationManager already handles them
	# Just store the references for potential future use
	print("TabNavigationManager: Button groups set - UINavigationManager handles the connections")

func set_default_tabs():
	"""Set default tab selections - delegate to UINavigationManager"""
	if ui_navigation_manager:
		# UINavigationManager has its own default states
		print("TabNavigationManager: Default tabs handled by UINavigationManager")
	else:
		print("TabNavigationManager: Warning - UINavigationManager not available for default tabs")

func get_active_tab(panel: String) -> String:
	"""Get the currently active tab for a panel"""
	if ui_navigation_manager:
		# Get current tab from UINavigationManager
		match panel:
			"top_left":
				return ui_navigation_manager.current_top_left_tab
			"bottom_left":
				return ui_navigation_manager.current_bottom_left_tab
			"top_right":
				return ui_navigation_manager.current_top_right_tab
			"bottom_right":
				return ui_navigation_manager.current_bottom_right_tab
	
	# Fallback if UINavigationManager not available
	return active_tabs.get(panel, "")

func update_button_styling(panel: String):
	"""Update button styling - delegate to UINavigationManager"""
	if ui_navigation_manager:
		ui_navigation_manager._apply_button_styling()
	else:
		print("TabNavigationManager: Warning - UINavigationManager not available for button styling")

# These functions are placeholders since UINavigationManager handles the actual tab selection
func _on_tab_button_pressed(panel: String, tab: String):
	"""Handle tab button press by delegating to UINavigationManager"""
	print("TabNavigationManager: Tab button pressed - %s:%s (delegating to UINavigationManager)" % [panel, tab])
	
	if ui_navigation_manager:
		# Delegate to UINavigationManager's actual handlers
		match panel:
			"top_left":
				ui_navigation_manager._on_top_left_tab_selected(tab)
			"bottom_left":
				ui_navigation_manager._on_bottom_left_tab_selected(tab)
			"top_right":
				ui_navigation_manager._on_top_right_tab_selected(tab)
			"bottom_right":
				ui_navigation_manager._on_bottom_right_tab_selected(tab)
		
		# Emit signal for any other systems that might be listening
		emit_signal("tab_selected", panel, tab)
	else:
		print("TabNavigationManager: Warning - UINavigationManager not available")

# Public API for external systems (kept for compatibility)
func select_tab(panel: String, tab: String):
	"""Programmatically select a tab"""
	_on_tab_button_pressed(panel, tab)

# Utility methods for specific panels
func get_all_active_tabs() -> Dictionary:
	"""Get all currently active tabs"""
	return active_tabs.duplicate()

func reset_panel_selection(panel: String):
	"""Reset panel to no active selection"""
	if active_tabs.has(panel):
		active_tabs.erase(panel)
		update_button_styling(panel) 