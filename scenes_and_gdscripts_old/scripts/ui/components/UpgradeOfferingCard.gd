extends PanelContainer

# Emitted when a purchase is attempted (can be success or failure)
signal purchase_attempted(upgrade_id, success)
# Emitted ONLY when a purchase is successfully completed
signal purchase_completed(upgrade_id)

# --- Node References ---
@onready var icon_texture_rect: TextureRect = $MarginContainer/HBoxContainer/IconTextureRect
@onready var title_label: Label = $MarginContainer/HBoxContainer/DetailsVBox/TitleLabel
@onready var description_label: Label = $MarginContainer/HBoxContainer/DetailsVBox/DescriptionLabel
@onready var effect_label: Label = $MarginContainer/HBoxContainer/DetailsVBox/EffectLabel
@onready var cost_label: Label = $MarginContainer/HBoxContainer/DetailsVBox/PurchaseHBox/CostLabel
@onready var purchase_button: Button = $MarginContainer/HBoxContainer/DetailsVBox/PurchaseHBox/PurchaseButton

# --- Upgrade Data (populated by configure method) ---
var upgrade_id: String = ""
var upgrade_data: Dictionary = {}
var is_purchased: bool = false

# --- Styling Constants (can be adjusted) ---
const UPGRADE_FONT = preload("res://assets/fonts/BrokenConsoleBold.ttf")
const TITLE_FONT_SIZE = 10
const DESC_FONT_SIZE = 10
const EFFECT_FONT_SIZE = 10
const COST_FONT_SIZE = 10
const BUTTON_FONT_SIZE = 11 # For PurchaseButton

const COLOR_TITLE = Color("ffffff") # White, to match .tscn
const COLOR_DESCRIPTION = Color("ffffff") # White, to match .tscn
const COLOR_EFFECT = Color("ffffff") # White, to match .tscn
const COLOR_COST_AVAILABLE = Color("4CAF50") # Green
const COLOR_COST_UNAVAILABLE = Color("FF6347") # Tomato Red
const COLOR_BUTTON_TEXT = Color("ffffff")
const COLOR_ACQUIRED_TEXT = Color("90ee90") # Light Green

const STYLEBOX_HIGHLIGHT_COLOR = Color(0.3, 0.3, 0.45, 0.9)
var base_stylebox_color: Color

func _ready():
	if not purchase_button.is_connected("pressed", Callable(self, "_on_purchase_button_pressed")):
		purchase_button.pressed.connect(_on_purchase_button_pressed)

	self.mouse_entered.connect(_on_mouse_entered)
	self.mouse_exited.connect(_on_mouse_exited)
	
	var current_stylebox = get_theme_stylebox("panel", "PanelContainer")
	if current_stylebox is StyleBoxFlat:
		base_stylebox_color = current_stylebox.bg_color
	else:
		# Fallback if the theme stylebox isn't a StyleBoxFlat or not set as expected from .tscn
		push_warning("UpgradeOfferingCard: Could not get base StyleBoxFlat color. Hover effect might be off.")
		base_stylebox_color = Color(0.2, 0.2, 0.3, 0.9) # Default from .tscn example

	# If configure() was called before _ready(), upgrade_data might already be populated.
	# Call _update_display() and _update_button_state() to ensure UI reflects this initial data.
	if not upgrade_data.is_empty():
		_update_display()
		_update_button_state()
	else:
		# If upgrade_data is empty, it means configure() hasn't run or ran with empty data.
		# We might want to display a "loading" or "error" state here, or rely on configure() to be called soon.
		# For now, _update_display() handles empty data by showing "N/A".
		_update_display() # Show N/A if data truly missing
		_update_button_state() # Disable button if no data / Global missing


func configure(data: Dictionary):
	upgrade_data = data
	upgrade_id = data.get("id", "unknown_id")
	
	# Check purchase status from Global for specific known upgrades
	if upgrade_id == "iron_grip_rank_1" and Global:
		is_purchased = Global.iron_grip_lvl1_purchased
	else:
		# Fallback for future upgrades (can be managed via a global dict or save system)
		is_purchased = data.get("is_purchased_override", false) 

	_update_display()
	_update_button_state()


func _update_display():
	if not is_instance_valid(title_label):
		push_error("UpgradeOfferingCard: TitleLabel node not found or invalid! Check path: MarginContainer/HBoxContainer/DetailsVBox/TitleLabel")
		return # or handle error appropriately
	if not is_instance_valid(description_label):
		push_error("UpgradeOfferingCard: DescriptionLabel node not found or invalid! Check path: MarginContainer/HBoxContainer/DetailsVBox/DescriptionLabel")
		# Continue if possible, or return
	if not is_instance_valid(effect_label):
		push_error("UpgradeOfferingCard: EffectLabel node not found or invalid! Check path: MarginContainer/HBoxContainer/DetailsVBox/EffectLabel")
		# Continue if possible, or return
	if not is_instance_valid(cost_label):
		push_error("UpgradeOfferingCard: CostLabel node not found or invalid! Check path: MarginContainer/HBoxContainer/DetailsVBox/PurchaseHBox/CostLabel")
		# Continue if possible, or return

	title_label.text = upgrade_data.get("name", "N/A")
	description_label.text = upgrade_data.get("description", "N/A")
	effect_label.text = upgrade_data.get("effect_text", "N/A")
	cost_label.text = "Cost: " + str(upgrade_data.get("cost", 0)) + " $GIRTH"

	# Apply font and colors
	_apply_font_and_color(title_label, UPGRADE_FONT, TITLE_FONT_SIZE, COLOR_TITLE)
	_apply_font_and_color(description_label, UPGRADE_FONT, DESC_FONT_SIZE, COLOR_DESCRIPTION)
	_apply_font_and_color(effect_label, UPGRADE_FONT, EFFECT_FONT_SIZE, COLOR_EFFECT)
	_apply_font_and_color(cost_label, UPGRADE_FONT, COST_FONT_SIZE, COLOR_COST_AVAILABLE) # Initial color
	_apply_font_and_color(purchase_button, UPGRADE_FONT, BUTTON_FONT_SIZE, COLOR_BUTTON_TEXT)

	var icon_path = upgrade_data.get("icon_path", "")
	if icon_texture_rect and not icon_path.is_empty():
		var texture = load(icon_path)
		if texture:
			icon_texture_rect.texture = texture
			icon_texture_rect.modulate = Color.WHITE if is_purchased else Color(0.8, 0.8, 0.8, 0.9)
		else:
			push_warning("Could not load icon: " + icon_path)
			icon_texture_rect.texture = null # Clear if not loadable

func _apply_font_and_color(control_node, font_resource, font_size, text_color):
	if control_node:
		# For Buttons, respect the font set in the .tscn file (e.g., GlitchGoblin for PurchaseButton)
		# Only override font family for Labels or other controls if UPGRADE_FONT is intended.
		if not control_node is Button:
			if font_resource:
				control_node.add_theme_font_override("font", font_resource)
		
		# Always apply font size override based on constants
		control_node.add_theme_font_size_override("font_size", font_size)
		
		control_node.add_theme_color_override("font_color", text_color)
		
		if control_node is Button:
			control_node.add_theme_color_override("font_hover_color", text_color.lightened(0.2))
			control_node.add_theme_color_override("font_pressed_color", text_color.darkened(0.2))

func _update_button_state():
	if not is_instance_valid(purchase_button):
		push_error("UpgradeOfferingCard: PurchaseButton node not found or invalid! Check path: MarginContainer/HBoxContainer/DetailsVBox/PurchaseHBox/PurchaseButton")
		return

	if not Global:
		purchase_button.disabled = true
		purchase_button.text = "Error (No Global)" # Line 117 (approx)
		return

	if is_purchased:
		purchase_button.text = "Acquired"
		purchase_button.disabled = true
		_apply_font_and_color(cost_label, UPGRADE_FONT, COST_FONT_SIZE, COLOR_ACQUIRED_TEXT)
		cost_label.text = "ACQUIRED"
		# Change purchase button style for acquired state
		purchase_button.add_theme_color_override("font_disabled_color", COLOR_ACQUIRED_TEXT)
	else:
		purchase_button.text = "Acquire"
		var can_afford = Global.current_girth >= upgrade_data.get("cost", 0)
		purchase_button.disabled = not can_afford
		
		cost_label.text = "Cost: " + str(upgrade_data.get("cost", 0)) + " $GIRTH"
		if can_afford:
			_apply_font_and_color(cost_label, UPGRADE_FONT, COST_FONT_SIZE, COLOR_COST_AVAILABLE)
			purchase_button.remove_theme_color_override("font_disabled_color") # Use default enabled colors
		else:
			_apply_font_and_color(cost_label, UPGRADE_FONT, COST_FONT_SIZE, COLOR_COST_UNAVAILABLE)
			# Change purchase button style for disabled state (cannot afford)
			purchase_button.add_theme_color_override("font_disabled_color", COLOR_COST_UNAVAILABLE.darkened(0.3))

func _on_purchase_button_pressed():
	if is_purchased or not Global or Global.current_girth < upgrade_data.get("cost", 0):
		emit_signal("purchase_attempted", upgrade_id, false)
		return

	var cost = upgrade_data.get("cost", 0)
	
	# Specific purchase logic for Iron Grip
	if upgrade_id == "iron_grip_rank_1":
		Global.current_girth -= cost
		Global.iron_grip_lvl1_purchased = true
		Global.emit_signal("girth_updated", Global.current_girth)
		
		# Trigger the new auto-save system
		Global.on_upgrade_purchased("iron_grip_rank_1")

		var oracle_emitter = get_node_or_null("/root/OracleEventEmitter")
		if oracle_emitter:
			oracle_emitter.emit_iron_grip_purchased_event()
		else:
			push_error("UpgradeOfferingCard: OracleEventEmitter not found!")
		
		is_purchased = true
		_update_display() # Refresh icon modulation
		_update_button_state()
		emit_signal("purchase_attempted", upgrade_id, true)
		emit_signal("purchase_completed", upgrade_id)
		
		print("UpgradeOfferingCard: Iron Grip purchased! Auto-save triggered.")
	else:
		print("Purchase logic for '" + upgrade_id + "' not implemented yet.")
		emit_signal("purchase_attempted", upgrade_id, false)


func _on_mouse_entered():
	var current_stylebox = get_theme_stylebox("panel", "PanelContainer")
	if current_stylebox is StyleBoxFlat:
		var hover_stylebox = current_stylebox.duplicate() as StyleBoxFlat
		hover_stylebox.bg_color = STYLEBOX_HIGHLIGHT_COLOR
		add_theme_stylebox_override("panel", hover_stylebox)

func _on_mouse_exited():
	var original_stylebox = StyleBoxFlat.new() # Recreate the base style or fetch if stored differently
	original_stylebox.bg_color = base_stylebox_color 
	original_stylebox.border_width_bottom = 2
	original_stylebox.border_width_top = 2 
	original_stylebox.border_width_left = 2
	original_stylebox.border_width_right = 2
	original_stylebox.border_color = Color(0.4, 0.4, 0.5, 1)
	original_stylebox.corner_radius_top_left = 8
	original_stylebox.corner_radius_top_right = 8
	original_stylebox.corner_radius_bottom_left = 8
	original_stylebox.corner_radius_bottom_right = 8
	add_theme_stylebox_override("panel", original_stylebox)

# Public method to allow UINavigationManager to refresh cards if Global.girth_updated occurs
func refresh_state():
	_update_button_state()

# Connect to Global signals when the node enters the tree to react to girth changes
func _enter_tree():
	if Global and Global.has_signal("girth_updated"):
		if not Global.is_connected("girth_updated", Callable(self, "_on_external_girth_update")):
			Global.connect("girth_updated", Callable(self, "_on_external_girth_update"))

# Disconnect from Global signals when the node exits the tree
func _exit_tree():
	if Global and Global.has_signal("girth_updated"):
		if Global.is_connected("girth_updated", Callable(self, "_on_external_girth_update")):
			Global.disconnect("girth_updated", Callable(self, "_on_external_girth_update"))

func _on_external_girth_update(_new_girth_value: int):
	refresh_state() 
