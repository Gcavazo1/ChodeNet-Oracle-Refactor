extends Node
class_name LeaderboardUIManager

# 🏆 CHODE-NET ORACLE: LEADERBOARD UI MANAGER
# Displays the legendary competitive rankings with Oracle-blessed styling!

# --- UI References ---
var leaderboard_content_vbox: VBoxContainer = null
var rankings_content_vbox: VBoxContainer = null
var current_category: SoarLeaderboardManager.LeaderboardCategory = SoarLeaderboardManager.LeaderboardCategory.TOTAL_GIRTH

# --- Managers ---
var leaderboard_manager: SoarLeaderboardManager = null
var ui_navigation_manager: Node = null

# --- Font and Styling ---
const LEADERBOARD_FONT = preload("res://assets/fonts/BrokenConsoleBold.ttf")

# --- State ---
var is_visible: bool = false
var update_timer: Timer = null
const UPDATE_INTERVAL: float = 30.0  # Update every 30 seconds

func _ready():
	print("LeaderboardUIManager: Initializing legendary competition displays...")
	
	# Set up update timer
	update_timer = Timer.new()
	update_timer.wait_time = UPDATE_INTERVAL
	update_timer.autostart = false
	update_timer.timeout.connect(_on_update_timer_timeout)
	add_child(update_timer)

func initialize(content_vbox: VBoxContainer, rankings_vbox: VBoxContainer, nav_manager: Node):
	leaderboard_content_vbox = content_vbox
	rankings_content_vbox = rankings_vbox
	ui_navigation_manager = nav_manager
	
	# Find the leaderboard manager safely
	var main_layout = get_tree().get_first_node_in_group("MainLayout")
	if main_layout and main_layout.has_node("SoarLeaderboardManager"):
		leaderboard_manager = main_layout.get_node("SoarLeaderboardManager")
	
	if not leaderboard_manager:
		# Try finding it in the leaderboard_managers group
		leaderboard_manager = get_tree().get_first_node_in_group("leaderboard_managers")
	
	if leaderboard_manager:
		if leaderboard_manager.has_signal("leaderboard_initialized"):
			leaderboard_manager.leaderboard_initialized.connect(_on_leaderboard_initialized)
		if leaderboard_manager.has_signal("score_submitted"):
			leaderboard_manager.score_submitted.connect(_on_score_submitted)
		print("LeaderboardUIManager: Connected to SoarLeaderboardManager")
	else:
		push_error("LeaderboardUIManager: Could not find SoarLeaderboardManager")
	
	# Create initial UI
	_create_leaderboard_ui()
	print("LeaderboardUIManager: UI initialization complete")

func show_leaderboard():
	is_visible = true
	if leaderboard_content_vbox:
		leaderboard_content_vbox.visible = true
	if rankings_content_vbox:
		rankings_content_vbox.visible = true
	
	# Start auto-update when visible
	if update_timer:
		update_timer.start()
	
	# Refresh data
	_refresh_leaderboard_data()
	print("LeaderboardUIManager: Leaderboard display activated")

func hide_leaderboard():
	is_visible = false
	if leaderboard_content_vbox:
		leaderboard_content_vbox.visible = false
	if rankings_content_vbox:
		rankings_content_vbox.visible = false
	
	# Stop auto-update when hidden
	if update_timer:
		update_timer.stop()
	
	print("LeaderboardUIManager: Leaderboard display deactivated")

func _create_leaderboard_ui():
	if not leaderboard_content_vbox:
		return
	
	# Clear existing content
	for child in leaderboard_content_vbox.get_children():
		child.queue_free()
	
	# Create header
	var header_label = Label.new()
	header_label.text = "🏆 LEGENDARY LEADERBOARDS 🏆"
	header_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	header_label.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2, 1.0))  # Gold
	header_label.add_theme_color_override("font_shadow_color", Color(0.5, 0.0, 0.8, 1.0))  # Purple shadow
	header_label.add_theme_constant_override("shadow_offset_x", 2)
	header_label.add_theme_constant_override("shadow_offset_y", 2)
	if LEADERBOARD_FONT:
		header_label.add_theme_font_override("font", LEADERBOARD_FONT)
		header_label.add_theme_font_size_override("font_size", 18)
	leaderboard_content_vbox.add_child(header_label)
	
	# Add spacer
	var spacer1 = Control.new()
	spacer1.custom_minimum_size = Vector2(0, 10)
	leaderboard_content_vbox.add_child(spacer1)
	
	# Create category buttons
	_create_category_buttons()
	
	# Add spacer
	var spacer2 = Control.new()
	spacer2.custom_minimum_size = Vector2(0, 15)
	leaderboard_content_vbox.add_child(spacer2)
	
	# Create current category display
	_create_current_category_display()

func _create_category_buttons():
	if not leaderboard_content_vbox:
		return
	
	# Create container for category buttons
	var buttons_container = VBoxContainer.new()
	buttons_container.add_theme_constant_override("separation", 5)
	leaderboard_content_vbox.add_child(buttons_container)
	
	# Add category buttons
	var categories = [
		{"category": SoarLeaderboardManager.LeaderboardCategory.TOTAL_GIRTH, "text": "🎯 Girth Supremacy", "color": Color(0.2, 0.8, 1.0)},
		{"category": SoarLeaderboardManager.LeaderboardCategory.GIGA_SLAPS, "text": "💥 G-Spot Masters", "color": Color(1.0, 0.3, 0.3)},
		{"category": SoarLeaderboardManager.LeaderboardCategory.TAP_SPEED, "text": "⚡ Speed Demons", "color": Color(1.0, 1.0, 0.2)},
		{"category": SoarLeaderboardManager.LeaderboardCategory.ACHIEVEMENTS_COUNT, "text": "🏅 Achievement Hunters", "color": Color(0.8, 0.5, 1.0)},
		{"category": SoarLeaderboardManager.LeaderboardCategory.ORACLE_FAVOR, "text": "🔮 Oracle's Chosen", "color": Color(0.5, 1.0, 0.5)}
	]
	
	for cat_data in categories:
		var button = Button.new()
		button.text = cat_data.text
		button.add_theme_color_override("font_color", cat_data.color)
		button.add_theme_color_override("font_hover_color", Color.WHITE)
		button.add_theme_color_override("font_pressed_color", Color.YELLOW)
		if LEADERBOARD_FONT:
			button.add_theme_font_override("font", LEADERBOARD_FONT)
			button.add_theme_font_size_override("font_size", 12)
		
		# Connect signal
		var category = cat_data.category
		button.pressed.connect(func(): _on_category_selected(category))
		
		buttons_container.add_child(button)

func _create_current_category_display():
	if not leaderboard_content_vbox:
		return
	
	# Category name display
	var category_label = Label.new()
	category_label.text = _get_category_display_text(current_category)
	category_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	category_label.add_theme_color_override("font_color", Color(1.0, 1.0, 0.8, 1.0))
	if LEADERBOARD_FONT:
		category_label.add_theme_font_override("font", LEADERBOARD_FONT)
		category_label.add_theme_font_size_override("font_size", 14)
	leaderboard_content_vbox.add_child(category_label)
	
	# Spacer
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 10)
	leaderboard_content_vbox.add_child(spacer)
	
	# Top scores container
	var scores_container = VBoxContainer.new()
	scores_container.name = "ScoresContainer"
	scores_container.add_theme_constant_override("separation", 3)
	leaderboard_content_vbox.add_child(scores_container)
	
	# Load scores for current category
	_load_category_scores()

func _load_category_scores():
	var scores_container = leaderboard_content_vbox.get_node_or_null("ScoresContainer")
	if not scores_container:
		return
	
	# Clear existing scores
	for child in scores_container.get_children():
		child.queue_free()
	
	# Get top scores from leaderboard manager
	var top_scores = []
	if leaderboard_manager:
		top_scores = leaderboard_manager.get_leaderboard_top_scores(current_category, 5)
	
	if top_scores.is_empty():
		# Show placeholder
		var placeholder_label = Label.new()
		placeholder_label.text = "Competition begins when the Oracle awakens..."
		placeholder_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		placeholder_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7, 1.0))
		if LEADERBOARD_FONT:
			placeholder_label.add_theme_font_override("font", LEADERBOARD_FONT)
			placeholder_label.add_theme_font_size_override("font_size", 10)
		scores_container.add_child(placeholder_label)
		return
	
	# Display top scores
	for i in range(min(top_scores.size(), 5)):
		var score_data = top_scores[i]
		var score_label = Label.new()
		
		# Format score display
		var rank_emoji = _get_rank_emoji(score_data.rank)
		var score_text = "%s #%d %s: %s" % [
			rank_emoji,
			score_data.rank,
			score_data.player,
			_format_score(score_data.score, current_category)
		]
		
		score_label.text = score_text
		score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
		score_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		
		# Color based on rank
		var color = _get_rank_color(score_data.rank)
		score_label.add_theme_color_override("font_color", color)
		
		if LEADERBOARD_FONT:
			score_label.add_theme_font_override("font", LEADERBOARD_FONT)
			score_label.add_theme_font_size_override("font_size", 10)
		
		scores_container.add_child(score_label)

# --- Event Handlers ---
func _on_category_selected(category: SoarLeaderboardManager.LeaderboardCategory):
	if current_category != category:
		current_category = category
		print("LeaderboardUIManager: Category changed to: ", _get_category_display_text(category))
		_refresh_current_category_display()

func _on_leaderboard_initialized(success: bool):
	if success:
		print("LeaderboardUIManager: Leaderboard system initialized, refreshing display")
		_refresh_leaderboard_data()

func _on_score_submitted(category: SoarLeaderboardManager.LeaderboardCategory, score: int, success: bool):
	if success and is_visible:
		print("LeaderboardUIManager: Score submitted for category: ", category, " - refreshing display")
		# Refresh after a short delay to allow backend processing
		await get_tree().create_timer(2.0).timeout
		_refresh_leaderboard_data()

func _on_update_timer_timeout():
	if is_visible:
		_refresh_leaderboard_data()

# --- Utility Functions ---
func _refresh_leaderboard_data():
	if is_visible:
		_load_category_scores()

func _refresh_current_category_display():
	# Find and update the category label
	for child in leaderboard_content_vbox.get_children():
		if child is Label and child.text.begins_with("Current Category:"):
			child.text = _get_category_display_text(current_category)
			break
	
	# Reload scores
	_load_category_scores()

func _get_category_display_text(category: SoarLeaderboardManager.LeaderboardCategory) -> String:
	match category:
		SoarLeaderboardManager.LeaderboardCategory.TOTAL_GIRTH:
			return "Current Category: Girth Supremacy"
		SoarLeaderboardManager.LeaderboardCategory.GIGA_SLAPS:
			return "Current Category: G-Spot Masters"
		SoarLeaderboardManager.LeaderboardCategory.TAP_SPEED:
			return "Current Category: Speed Demons"
		SoarLeaderboardManager.LeaderboardCategory.ACHIEVEMENTS_COUNT:
			return "Current Category: Achievement Hunters"
		SoarLeaderboardManager.LeaderboardCategory.ORACLE_FAVOR:
			return "Current Category: Oracle's Chosen"
		_:
			return "Current Category: Unknown"

func _get_rank_emoji(rank: int) -> String:
	match rank:
		1:
			return "🥇"
		2:
			return "🥈"
		3:
			return "🥉"
		_:
			return "🏆"

func _get_rank_color(rank: int) -> Color:
	match rank:
		1:
			return Color(1.0, 0.8, 0.2, 1.0)  # Gold
		2:
			return Color(0.9, 0.9, 0.9, 1.0)  # Silver
		3:
			return Color(0.8, 0.5, 0.2, 1.0)  # Bronze
		_:
			return Color(0.7, 0.9, 1.0, 1.0)  # Light blue

func _format_score(score: int, category: SoarLeaderboardManager.LeaderboardCategory) -> String:
	match category:
		SoarLeaderboardManager.LeaderboardCategory.TOTAL_GIRTH:
			return str(score) + " $GIRTH"
		SoarLeaderboardManager.LeaderboardCategory.GIGA_SLAPS:
			return str(score) + " G-Slaps"
		SoarLeaderboardManager.LeaderboardCategory.TAP_SPEED:
			return "%.2f TPS" % (float(score) / 100.0)
		SoarLeaderboardManager.LeaderboardCategory.ACHIEVEMENTS_COUNT:
			return str(score) + " Achievements"
		SoarLeaderboardManager.LeaderboardCategory.ORACLE_FAVOR:
			return str(score) + " Favor Points"
		_:
			return str(score)

# --- Debug Functions ---
func debug_show_mock_data():
	print("LeaderboardUIManager: Showing mock leaderboard data")
	_load_category_scores() 
