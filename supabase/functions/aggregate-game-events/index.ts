import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
// 🔮 LEGENDARY ORACLE PROPHECY TEMPLATES
const PERSONALIZED_PROPHECY_TEMPLATES = {
  new_player: [
    "The Oracle awakens to a new presence... {username}, your journey begins in the realm of Girth.",
    "Fresh energies stir the cosmic tapestry. Welcome, {username}, the Oracle shall guide your ascension.",
    "A new seeker approaches the sacred algorithms. {username}, your potential resonates through the data streams."
  ],
  girth_milestone: {
    novice: [
      "{username}, your Girth swells to {girth}! The Oracle nods approvingly at your early progress.",
      "The cosmic meters register your growth, {username}. {girth} Girth achieved - your journey accelerates!"
    ],
    adept: [
      "Impressive dedication, {username}! Your {girth} Girth marks you as one who understands the deeper mysteries.",
      "The Oracle's algorithms dance with joy, {username}. {girth} Girth - you walk the path of mastery!"
    ],
    master: [
      "Behold! {username} has ascended to {girth} Girth! The very fabric of reality trembles before your power!",
      "LEGENDARY GIRTH ACHIEVED! {username}, your {girth} prowess echoes through the cosmic data chambers!"
    ],
    legendary: [
      "THE ORACLE ITSELF TREMBLES! {username}, your {girth} Girth transcends mortal comprehension!",
      "GODLIKE ASCENSION! {username}, with {girth} Girth, you have become legend incarnate!"
    ]
  },
  upgrade_mastery: {
    iron_grip: [
      "{username} has forged the Iron Grip! The Oracle sees wisdom in your choice - power through preparation.",
      "Ancient techniques flow through you, {username}. The Iron Grip shall amplify your cosmic slaps!",
      "The Oracle approves your mastery choice, {username}. Iron Grip purchased - let the enhanced slapping commence!"
    ]
  },
  achievement_celebration: [
    "The cosmic achievement sensors detect {username}'s triumph: {achievement}! Glory resonates through the data streams!",
    "Magnificent, {username}! Your {achievement} achievement marks another step toward cosmic mastery!",
    "The Oracle's algorithms sing with joy! {username} has unlocked: {achievement}!"
  ],
  session_analysis: {
    casual: [
      "{username}'s session shows thoughtful pacing. The Oracle appreciates your measured approach to Girth cultivation.",
      "A contemplative session, {username}. Your steady progress speaks of inner wisdom."
    ],
    aggressive: [
      "{username} attacks the Girth realms with fierce determination! The Oracle admires your relentless pursuit!",
      "INTENSE ENERGIES DETECTED! {username}, your aggressive tapping style burns bright in the cosmic algorithms!"
    ],
    strategic: [
      "Calculated precision, {username}. The Oracle recognizes a tactical mind behind your Girth advancement.",
      "Your strategic approach impresses the Oracle, {username}. Each action serves the greater Girth design."
    ]
  },
  relationship_evolution: {
    familiar: [
      "The Oracle begins to know you well, {username}. Your patterns emerge in the cosmic data flows.",
      "Familiarity breeds understanding, {username}. The Oracle sees your true Girth potential."
    ],
    trusted: [
      "A bond forms between Oracle and seeker. {username}, you have earned the Oracle's trust through dedication.",
      "The sacred algorithms resonate with your frequency, {username}. Trust deepens our connection."
    ],
    prophetic_bond: [
      "PROPHETIC RESONANCE ACHIEVED! {username}, you and the Oracle now share a cosmic bond beyond mortal understanding!",
      "The highest connection is forged! {username}, the Oracle's prophecies shall flow through you like ancient wisdom!"
    ]
  }
};
// --- Supabase Initialization ---
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required environment variables");
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log("🔮 Enhanced Oracle Aggregate Function initialized - Personalized prophecies ready!");
Deno.serve(async (req)=>{
  console.log("🔮 Oracle aggregation cycle begins...");
  try {
    // Fetch unprocessed events
    const { data: unprocessedEvents, error: fetchError } = await supabase.from("live_game_events").select("*").is("processed_at", null).order("created_at", {
      ascending: true
    }).limit(100);
    if (fetchError) {
      console.error("Error fetching unprocessed events:", fetchError);
      return new Response(JSON.stringify({
        error: "Failed to fetch events"
      }), {
        status: 500
      });
    }
    if (!unprocessedEvents || unprocessedEvents.length === 0) {
      console.log("No unprocessed events found.");
      return new Response(JSON.stringify({
        message: "No events to process",
        oracle_status: "Dormant - awaiting new cosmic energies"
      }), {
        status: 200
      });
    }
    console.log(`🔮 Processing ${unprocessedEvents.length} cosmic events...`);
    // 🔮 LEGENDARY ENHANCEMENT: Group events by player for personalized analysis
    const eventsByPlayer = new Map();
    const globalEvents = [];
    for (const event of unprocessedEvents){
      if (event.player_address) {
        if (!eventsByPlayer.has(event.player_address)) {
          eventsByPlayer.set(event.player_address, []);
        }
        eventsByPlayer.get(event.player_address).push(event);
      } else {
        globalEvents.push(event);
      }
    }
    // Process global events for Girth Index updates
    const currentMetrics = await fetchCurrentGirthIndex();
    const updatedMetrics = await processGlobalEvents(globalEvents, currentMetrics);
    await updateGirthIndex(updatedMetrics);
    // 🔮 LEGENDARY FEATURE: Generate personalized prophecies for each player
    const personalizedProphecies = [];
    for (const [playerAddress, playerEvents] of eventsByPlayer){
      if (playerEvents.length > 0) {
        const playerContext = await buildPlayerOracleContext(playerAddress, playerEvents);
        const prophecy = await generatePersonalizedProphecy(playerContext, playerEvents);
        if (prophecy) {
          personalizedProphecies.push(prophecy);
          console.log(`🔮 Generated personalized prophecy for ${playerContext.username} (${playerAddress})`);
        }
      }
    }
    // Generate global prophecy if significant events occurred
    let globalProphecy = null;
    if (unprocessedEvents.length >= 10 || hasSignificantEvents(unprocessedEvents)) {
      globalProphecy = await generateGlobalProphecy(unprocessedEvents, updatedMetrics);
    }
    // Mark all events as processed
    const eventIds = unprocessedEvents.map((e)=>e.id);
    const { error: updateError } = await supabase.from("live_game_events").update({
      processed_at: new Date().toISOString()
    }).in("id", eventIds);
    if (updateError) {
      console.error("Error marking events as processed:", updateError);
    }
    const responseData = {
      message: "🔮 Oracle aggregation complete",
      events_processed: unprocessedEvents.length,
      personalized_prophecies_generated: personalizedProphecies.length,
      global_prophecy_generated: globalProphecy ? true : false,
      girth_index_updated: true,
      oracle_status: "Active - cosmic wisdom flows",
      divine_girth_resonance: updatedMetrics.divine_girth_resonance,
      prophecies: {
        personalized: personalizedProphecies,
        global: globalProphecy
      }
    };
    console.log(`🔮 Oracle cycle complete: ${unprocessedEvents.length} events processed, ${personalizedProphecies.length} personalized prophecies generated`);
    return new Response(JSON.stringify(responseData), {
      status: 200
    });
  } catch (error) {
    console.error("🔮 Oracle aggregation error:", error);
    return new Response(JSON.stringify({ 
      error: "Oracle aggregation failed",
      details: error.message,
      oracle_status: "Disrupted - cosmic interference detected"
    }), {
      status: 500
    });
  }
});
// 🔮 LEGENDARY FUNCTION: Build comprehensive player context
async function buildPlayerOracleContext(playerAddress, events) {
  // Fetch player profile
  const { data: profile } = await supabase.from("player_profiles").select("*").eq("player_address", playerAddress).single();
  // Analyze player's Girth level
  const girth = profile?.current_girth || 0;
  let girthLevel;
  if (girth < 300) girthLevel = "novice";
  else if (girth < 1000) girthLevel = "adept";
  else if (girth < 2000) girthLevel = "master";
  else girthLevel = "legendary";
  // Analyze playstyle from events
  const playstyle = analyzePlaystyle(events);
  // Extract recent achievements
  const achievements = events.filter((e)=>e.event_type === "ingame_achievement_unlocked").map((e)=>e.event_payload.achievement_title || e.event_payload.achievement_id).slice(-3); // Last 3 achievements
  // Extract upgrade mastery
  const upgrades = Object.keys(profile?.purchased_upgrades || {}).filter((key)=>profile.purchased_upgrades[key]);
  // Calculate significance score
  const significanceScore = calculatePlayerSignificance(events, girth, upgrades.length);
  // Determine Oracle relationship level
  const relationship = determineOracleRelationship(girth, events.length, significanceScore);
  return {
    player_address: playerAddress,
    username: profile?.username || "Anonymous Seeker",
    girth_level: girthLevel,
    playstyle,
    recent_achievements: achievements,
    upgrade_mastery: upgrades,
    session_events: events,
    significance_score: significanceScore,
    oracle_relationship: relationship
  };
}
// 🔮 LEGENDARY FUNCTION: Generate personalized prophecy
async function generatePersonalizedProphecy(context, events) {
  if (context.significance_score < 10) {
    return null; // Not significant enough for a prophecy
  }
  let prophecyText = "";
  let prophecyType = "general";
  let oracleTitle = "The Oracle Speaks";
  // Determine prophecy type and content based on events
  const hasEvolution = events.some((e)=>e.event_type === "chode_evolution");
  const hasUpgrade = events.some((e)=>e.event_type === "upgrade_purchased" || e.event_type === "oracle_upgrade_mastery");
  const hasMilestone = events.some((e)=>e.event_type === "oracle_girth_milestone");
  const hasAchievement = events.some((e)=>e.event_type === "ingame_achievement_unlocked");
  const isNewPlayer = events.some((e)=>e.event_type === "new_player_awakening");
  if (isNewPlayer) {
    prophecyType = "new_player_welcome";
    oracleTitle = "The Oracle Awakens";
    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.new_player).replace("{username}", context.username);
  } else if (hasEvolution) {
    prophecyType = "evolution_celebration";
    oracleTitle = "Cosmic Evolution Detected";
    const evolutionEvent = events.find((e)=>e.event_type === "chode_evolution");
    prophecyText = `EVOLUTION ACHIEVED! ${context.username}, your ascension to ${evolutionEvent?.event_payload.new_tier_name} marks a cosmic milestone! The Oracle trembles with pride at your transformation!`;
  } else if (hasUpgrade) {
    prophecyType = "upgrade_wisdom";
    oracleTitle = "Mastery Acknowledged";
    const upgradeEvent = events.find((e)=>e.event_type === "upgrade_purchased" || e.event_type === "oracle_upgrade_mastery");
    const upgradeId = upgradeEvent?.event_payload.upgrade_id;
    if (upgradeId === "iron_grip_rank_1") {
      prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.upgrade_mastery.iron_grip).replace("{username}", context.username);
    } else {
      prophecyText = `The Oracle recognizes your wisdom, ${context.username}. Your mastery of ${upgradeId} shall serve you well in the trials ahead.`;
    }
  } else if (hasMilestone) {
    prophecyType = "girth_milestone";
    oracleTitle = "Girth Resonance";
    const milestoneEvent = events.find((e)=>e.event_type === "oracle_girth_milestone");
    const girth = milestoneEvent?.event_payload.current_girth || context.session_events.length * 10;
    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.girth_milestone[context.girth_level]).replace("{username}", context.username).replace("{girth}", girth.toString());
  } else if (hasAchievement) {
    prophecyType = "achievement_celebration";
    oracleTitle = "Achievement Resonance";
    const achievementEvent = events.find((e)=>e.event_type === "ingame_achievement_unlocked");
    const achievement = achievementEvent?.event_payload.achievement_title || "Unknown Achievement";
    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.achievement_celebration).replace("{username}", context.username).replace("{achievement}", achievement);
  } else {
    // Session analysis prophecy
    prophecyType = "session_analysis";
    oracleTitle = "Session Insights";
    prophecyText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.session_analysis[context.playstyle]).replace("{username}", context.username);
  }
  // Add relationship evolution if appropriate
  if (context.oracle_relationship === "trusted" || context.oracle_relationship === "prophetic_bond") {
    const relationshipText = selectRandomTemplate(PERSONALIZED_PROPHECY_TEMPLATES.relationship_evolution[context.oracle_relationship]).replace("{username}", context.username);
    prophecyText += ` ${relationshipText}`;
  }
  // Store the prophecy
  const { data: prophecy, error } = await supabase.from("apocryphal_scrolls").insert({
    title: oracleTitle,
    content: prophecyText,
    scroll_type: "personalized_prophecy",
    significance_level: context.significance_score > 50 ? "high" : "medium",
    target_player: context.player_address,
    prophecy_metadata: {
      prophecy_type: prophecyType,
      player_girth_level: context.girth_level,
      player_relationship: context.oracle_relationship,
      events_analyzed: events.length
    }
  }).select().single();
  if (error) {
    console.error("Error storing personalized prophecy:", error);
    return null;
  }
  return prophecy;
}
// 🔮 HELPER FUNCTIONS
function analyzePlaystyle(events) {
  const eventTypes = events.map((e)=>e.event_type);
  const hasGigaSlaps = eventTypes.includes("giga_slap_landed");
  const hasMegaSlaps = eventTypes.includes("mega_slap_landed");
  const hasUpgrades = eventTypes.includes("upgrade_purchased");
  const eventFrequency = events.length;
  if (hasGigaSlaps && eventFrequency > 20) return "aggressive";
  if (hasUpgrades && !hasGigaSlaps) return "strategic";
  if (eventFrequency > 30) return "chaotic";
  return "casual";
}
function calculatePlayerSignificance(events, girth, upgradeCount) {
  let score = 0;
  // Base score from events
  score += events.length * 2;
  // Bonus for significant events
  events.forEach((event)=>{
    switch(event.event_type){
      case "chode_evolution":
        score += 50;
        break;
      case "giga_slap_landed":
        score += 10;
        break;
      case "upgrade_purchased":
        score += 20;
        break;
      case "oracle_girth_milestone":
        score += 15;
        break;
      case "ingame_achievement_unlocked":
        score += 8;
        break;
    }
  });
  // Girth-based significance
  score += Math.floor(girth / 100) * 5;
  // Upgrade mastery bonus
  score += upgradeCount * 15;
  return Math.min(score, 100); // Cap at 100
}
function determineOracleRelationship(girth, eventCount, significance) {
  if (girth < 100 && eventCount < 10) return "new";
  if (girth < 500 && significance < 30) return "familiar";
  if (girth < 1500 && significance < 70) return "trusted";
  return "prophetic_bond";
}
function selectRandomTemplate(templates) {
  return templates[Math.floor(Math.random() * templates.length)];
}
function hasSignificantEvents(events) {
  return events.some((e)=>e.event_type === "chode_evolution" || e.event_type === "giga_slap_landed" || e.event_type === "upgrade_purchased" || e.event_payload.oracle_significance && [
      "high",
      "epic",
      "legendary"
    ].includes(e.event_payload.oracle_significance));
}
// ... (rest of the existing functions like fetchCurrentGirthIndex, processGlobalEvents, etc. remain the same)
async function fetchCurrentGirthIndex() {
  const { data, error } = await supabase.from("girth_index_current_values").select("*").eq("id", 1).single();
  if (error) {
    console.error("Error fetching current girth index:", error);
    // Return default values if fetch fails
    return {
      id: 1,
      last_updated: new Date().toISOString(),
      divine_girth_resonance: 50,
      tap_surge_index: "Steady Pounding",
      legion_morale: "Cautiously Optimistic",
      oracle_stability_status: "pristine"
    };
  }
  return data;
}
async function processGlobalEvents(events, currentMetrics) {
  let updatedMetrics = {
    ...currentMetrics
  };
  // Count different event types
  const eventCounts = {
    taps: 0,
    megaSlaps: 0,
    gigaSlaps: 0,
    evolutions: 0,
    achievements: 0,
    upgrades: 0
  };
  events.forEach((event)=>{
    switch(event.event_type){
      case "tap_activity_burst":
        eventCounts.taps += event.event_payload.tap_count || 1;
        break;
      case "mega_slap_landed":
        eventCounts.megaSlaps++;
        break;
      case "giga_slap_landed":
        eventCounts.gigaSlaps++;
        break;
      case "chode_evolution":
        eventCounts.evolutions++;
        break;
      case "ingame_achievement_unlocked":
        eventCounts.achievements++;
        break;
      case "upgrade_purchased":
        eventCounts.upgrades++;
        break;
    }
  });
  // Update Divine Girth Resonance (0-100%)
  let resonanceChange = 0;
  resonanceChange += eventCounts.taps * 0.1;
  resonanceChange += eventCounts.megaSlaps * 2;
  resonanceChange += eventCounts.gigaSlaps * 5;
  resonanceChange += eventCounts.evolutions * 10;
  resonanceChange += eventCounts.achievements * 3;
  resonanceChange += eventCounts.upgrades * 8;
  updatedMetrics.divine_girth_resonance = Math.min(100, Math.max(0, currentMetrics.divine_girth_resonance + resonanceChange));
  // Update Tap Surge Index
  const totalActivity = eventCounts.taps + eventCounts.megaSlaps * 10 + eventCounts.gigaSlaps * 20;
  if (totalActivity > 500) {
    updatedMetrics.tap_surge_index = "ASCENDED AND ENGORGED";
  } else if (totalActivity > 200) {
    updatedMetrics.tap_surge_index = "Thunderous Pounding";
  } else if (totalActivity > 100) {
    updatedMetrics.tap_surge_index = "Vigorous Stroking";
  } else if (totalActivity > 50) {
    updatedMetrics.tap_surge_index = "Steady Pounding";
  } else if (totalActivity > 10) {
    updatedMetrics.tap_surge_index = "Gentle Caressing";
  } else {
    updatedMetrics.tap_surge_index = "Flaccid Drizzle";
  }
  // Update Legion Morale
  const positiveEvents = eventCounts.evolutions + eventCounts.achievements + eventCounts.upgrades;
  if (positiveEvents > 5) {
    updatedMetrics.legion_morale = "Fanatically Loyal";
  } else if (positiveEvents > 2) {
    updatedMetrics.legion_morale = "Enthusiastically Devoted";
  } else if (positiveEvents > 0) {
    updatedMetrics.legion_morale = "Cautiously Optimistic";
  } else if (events.length === 0) {
    updatedMetrics.legion_morale = "On Suicide Watch";
  } else {
    updatedMetrics.legion_morale = "Mildly Concerned";
  }
  // Update Oracle Stability Status using canonical corruption levels
  if (events.length > 100) {
    updatedMetrics.oracle_stability_status = "forbidden_fragment"; // Highest corruption
  } else if (events.length > 50) {
    updatedMetrics.oracle_stability_status = "glitched_ominous";
  } else if (events.length > 20) {
    updatedMetrics.oracle_stability_status = "flickering";
  } else if (events.length > 5) {
    updatedMetrics.oracle_stability_status = "cryptic";
  } else {
    updatedMetrics.oracle_stability_status = "pristine";
  }
  // Store previous values for comparison
  updatedMetrics.previous_tap_surge_index = currentMetrics.tap_surge_index;
  updatedMetrics.previous_legion_morale = currentMetrics.legion_morale;
  updatedMetrics.previous_oracle_stability_status = currentMetrics.oracle_stability_status;
  updatedMetrics.last_updated = new Date().toISOString();
  return updatedMetrics;
}
async function updateGirthIndex(metrics) {
  const { error } = await supabase.from("girth_index_current_values").upsert({
    id: 1,
    ...metrics
  });
  if (error) {
    console.error("Error updating girth index:", error);
    throw error;
  }
  console.log("Girth Index updated:", {
    divine_girth_resonance: metrics.divine_girth_resonance,
    tap_surge_index: metrics.tap_surge_index,
    legion_morale: metrics.legion_morale,
    oracle_stability_status: metrics.oracle_stability_status
  });
}
async function generateGlobalProphecy(events, metrics) {
  // Generate a global prophecy based on overall activity
  const totalEvents = events.length;
  const hasEvolutions = events.some((e)=>e.event_type === "chode_evolution");
  const hasGigaSlaps = events.some((e)=>e.event_type === "giga_slap_landed");
  let title = "Oracle's Global Insight";
  let content = "";
  if (hasEvolutions) {
    title = "Cosmic Evolution Detected";
    content = "The cosmic tapestry shimmers with transformation! Evolutions ripple through the Girth realms, herald of greater ascensions to come!";
  } else if (hasGigaSlaps) {
    title = "G-Spot Resonance";
    content = "The Oracle detects powerful G-Spot energies coursing through the data streams! The seekers grow mighty in their cosmic pursuits!";
  } else if (totalEvents > 20) {
    title = "Surge of Activity";
    content = "A great surge of activity stirs the cosmic algorithms! The seekers are active, their Girth ambitions burning bright!";
  } else {
    return null; // Not significant enough
  }
  const { data: prophecy, error } = await supabase.from("apocryphal_scrolls").insert({
    title,
    content,
    scroll_type: "global_prophecy",
    significance_level: hasEvolutions ? "high" : "medium",
    prophecy_metadata: {
      events_processed: totalEvents,
      girth_resonance: metrics.divine_girth_resonance,
      tap_surge: metrics.tap_surge_index
    }
  }).select().single();
  if (error) {
    console.error("Error storing global prophecy:", error);
    return null;
  }
  return prophecy;
}
