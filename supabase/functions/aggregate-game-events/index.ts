import "jsr:@supabase/functions-js/edge-runtime.d.ts"; // Provides Deno types for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"; // Using a slightly newer std version
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

// Enhanced CORS headers for better compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "false"
};

// --- Interfaces ---
interface GameEvent {
  id: string;
  session_id: string;
  event_type: string;
  // Assuming event_payload is JSONB in Supabase, it will be parsed to an object
  event_payload: Record<string, any>; 
  game_event_timestamp: string; // ISO 8601 string from the game
  created_at: string; // Ingestion timestamp
  processed_at: string | null;
}

interface GirthIndex {
  id: number; // Should always be 1 for the single row
  last_updated: string;
  divine_girth_resonance: number; // e.g., 0-100%
  tap_surge_index: string; // e.g., "Flaccid Drizzle", "Steady Pounding", "ASCENDED AND ENGORGED"
  legion_morale: string; // e.g., "On Suicide Watch", "Cautiously Optimistic", "Fanatically Loyal"
  oracle_stability_status: string; // e.g., "Pristine", "Unstable", "CRITICAL_CORRUPTION"
  // Optional: Store previous values to detect significant changes for triggers
  previous_tap_surge_index?: string;
  previous_legion_morale?: string;
  previous_oracle_stability_status?: string;
}

// 🔮 Oracle Scaling System (simplified version for Edge Function)
interface PlayerActivity {
  taps_per_minute: number;
  session_duration_minutes: number;
  achievements_unlocked: number;
  total_taps: number;
  time_since_last_activity_minutes: number;
  upgrades_purchased: number;
  evolution_level: number;
  mega_slaps_count: number;
}

interface CommunityActivity {
  total_active_players: number;
  collective_taps_per_minute: number;
  voting_participation: number;
  community_milestones_hit: number;
  overall_sentiment: 'positive' | 'neutral' | 'negative';
}

// --- Configuration & Supabase Client ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment.");
  // In a real scenario, this function might not even start if env vars are missing.
}

const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Aggregation Logic Constants (Tune These Extensively!) ---
const RESONANCE_DECAY_PER_CYCLE = 0.5; // Points per aggregation cycle if no positive events
const MAX_RESONANCE = 100;
const MIN_RESONANCE = 0;

// Tap Surge thresholds (based on "effective taps" in this cycle)
const TAPS_FOR_WEAK_PULSES = 50;
const TAPS_FOR_STEADY_POUNDING = 300;
const TAPS_FOR_ENGORGED = 1000;
const GIGA_SLAPS_FOR_GIGA_SURGE = 1;
const MEGA_SLAPS_FOR_MEGA_SURGE = 2; // If multiple mega slaps happen

// --- Main Function ---
serve(async (req: Request) => {
  // Handle CORS preflight requests for manual POST
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Determine if it's a manual trigger (POST) or Cron
  // Supabase Cron jobs typically don't send a body and might have a specific User-Agent
  // For simplicity, we'll assume any POST is a manual trigger for now.
  const isManualTrigger = req.method === "POST";
  if (isManualTrigger) {
    console.info("Manual trigger for aggregate-game-events invoked.");
    // Optional: Could add a secret key in payload/header for manual trigger auth
  } else {
    // Assuming non-POST is from Cron or other automated system
    console.info("Scheduled trigger for aggregate-game-events invoked.");
  }

  console.info("Starting aggregate-game-events function...");

  try {
    // 1. Fetch Unprocessed Events
    // Fetch events ordered by their actual occurrence time
    const { data: unprocessedEvents, error: fetchError } = await supabaseAdmin
      .from("live_game_events")
      .select("*")
      .is("processed_at", null)
      .order("game_event_timestamp", { ascending: true });

    if (fetchError) {
      console.error("Error fetching unprocessed events:", fetchError);
      throw new Error(`DB Error fetching events: ${fetchError.message}`);
    }

    // 2. Fetch Current Girth Index (or Initialize)
    let { data: currentGirthIndexData, error: girthFetchError } = await supabaseAdmin
      .from("girth_index_current_values")
      .select("*")
      .eq("id", 1)
      .single();

    if (girthFetchError && girthFetchError.code !== 'PGRST116') { // PGRST116: single row not found
      console.error("Error fetching current Girth Index:", girthFetchError);
      throw new Error(`DB Error fetching Girth Index: ${girthFetchError.message}`);
    }
    
    let currentGirthIndex: GirthIndex;
    if (!currentGirthIndexData) {
      console.warn("Girth Index row not found, initializing with defaults.");
      const defaultValues = {
        id: 1, // Ensure this matches your table's PK constraint for the singleton row
        last_updated: new Date().toISOString(),
        divine_girth_resonance: 50,
        tap_surge_index: "Steady Pounding",
        legion_morale: "Cautiously Optimistic",
        oracle_stability_status: "Pristine",
      };
      const { data: initializedGirth, error: initError } = await supabaseAdmin
        .from("girth_index_current_values")
        .insert(defaultValues)
        .select()
        .single();
      if (initError) {
        console.error("Failed to initialize Girth Index:", initError);
        // If PK conflict on insert (e.g. id=1 already exists due to race), try fetching again.
        // This part could be more robust for very high concurrency on first-ever run.
        throw new Error(`Failed to initialize Girth Index: ${initError.message}`);
      }
      currentGirthIndex = initializedGirth as GirthIndex;
      console.info("Girth Index initialized:", currentGirthIndex);
    } else {
      currentGirthIndex = currentGirthIndexData as GirthIndex;
    }
    
    // Store previous states for trigger comparison
    const oldGirthIndexState: Partial<GirthIndex> = {
        tap_surge_index: currentGirthIndex.tap_surge_index,
        legion_morale: currentGirthIndex.legion_morale,
        oracle_stability_status: currentGirthIndex.oracle_stability_status,
    };


    if (!unprocessedEvents || unprocessedEvents.length === 0) {
      console.info("No new game events to process.");
      // Apply decay even if no new events, unless it was just updated very recently
      const timeSinceLastUpdate = new Date().getTime() - new Date(currentGirthIndex.last_updated).getTime();
      if (timeSinceLastUpdate > 60000) { // e.g., if older than 1 min
         currentGirthIndex = await applyDecayToMetrics(supabaseAdmin, currentGirthIndex);
      }
      return new Response(JSON.stringify({ message: "No new events to process. Decay might have been applied.", currentMetrics: currentGirthIndex }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200
      });
    }

    console.info(`Fetched ${unprocessedEvents.length} unprocessed game events.`);

    // === EXTRACT ACTIVITY DATA FROM EVENTS ===
    const now = new Date()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    // Get recent events for player activity calculation
    const recentEvents = unprocessedEvents.filter(e => new Date(e.game_event_timestamp) >= thirtyMinutesAgo)
    const hourlyEvents = unprocessedEvents.filter(e => new Date(e.game_event_timestamp) >= oneHourAgo)
    
    // Calculate player activity from most active session
    const sessionGroups = recentEvents.reduce((acc, event) => {
      if (!acc[event.session_id]) acc[event.session_id] = []
      acc[event.session_id].push(event)
      return acc
    }, {} as Record<string, GameEvent[]>)
    
    // Find most active session for primary activity metrics
    let primaryActivity: PlayerActivity = {
      taps_per_minute: 0,
      session_duration_minutes: 0,
      achievements_unlocked: 0,
      total_taps: 0,
      time_since_last_activity_minutes: 60,
      upgrades_purchased: 0,
      evolution_level: 0,
      mega_slaps_count: 0
    }
    
    if (Object.keys(sessionGroups).length > 0) {
      const mostActiveSession = Object.entries(sessionGroups)
        .sort(([,a], [,b]) => b.length - a.length)[0][1]
      
      const sessionStart = new Date(mostActiveSession[mostActiveSession.length - 1].game_event_timestamp)
      const lastActivity = new Date(mostActiveSession[0].game_event_timestamp)
      
      const sessionDuration = (now.getTime() - sessionStart.getTime()) / (1000 * 60)
      const timeSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
      
      // Count event types
      const tapEvents = mostActiveSession.filter(e => e.event_type === 'tap_activity_burst')
      const megaSlaps = mostActiveSession.filter(e => e.event_type === 'mega_slap_landed')
      const achievements = mostActiveSession.filter(e => e.event_type === 'achievement_unlocked')
      const upgrades = mostActiveSession.filter(e => e.event_type === 'upgrade_purchased')
      const evolutions = mostActiveSession.filter(e => e.event_type === 'chode_evolution')
      
      const totalTaps = tapEvents.reduce((sum, event) => {
        const payload = event.event_payload as any
        return sum + (payload?.tap_count || payload?.taps_in_burst || 1)
      }, 0)
      
      const latestEvolution = evolutions[0]?.event_payload as any
      
      primaryActivity = {
        taps_per_minute: sessionDuration > 0 ? Math.round(totalTaps / sessionDuration) : 0,
        session_duration_minutes: Math.round(sessionDuration),
        achievements_unlocked: achievements.length,
        total_taps: totalTaps,
        time_since_last_activity_minutes: Math.round(timeSinceLastActivity),
        upgrades_purchased: upgrades.length,
        evolution_level: latestEvolution?.new_level || latestEvolution?.level || 0,
        mega_slaps_count: megaSlaps.length
      }
    }
    
    // Calculate community activity from all recent events
    const uniquePlayers = new Set(hourlyEvents.map(e => e.session_id)) // Using session_id as player proxy
    const communityTapEvents = hourlyEvents.filter(e => e.event_type === 'tap_activity_burst')
    const totalCommunityTaps = communityTapEvents.reduce((sum, event) => {
      const payload = event.event_payload as any
      return sum + (payload?.tap_count || payload?.taps_in_burst || 1)
    }, 0)
    
    const positiveEvents = hourlyEvents.filter(e => 
      e.event_type === 'achievement_unlocked' || 
      e.event_type === 'chode_evolution' ||
      e.event_type === 'mega_slap_landed'
    ).length
    
    const negativeEvents = hourlyEvents.filter(e => 
      e.event_type === 'session_timeout' || 
      e.event_type === 'player_disconnect'
    ).length
    
    let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    if (positiveEvents > negativeEvents * 2) overallSentiment = 'positive'
    else if (negativeEvents > positiveEvents * 2) overallSentiment = 'negative'
    
    const communityActivity: CommunityActivity = {
      total_active_players: uniquePlayers.size,
      collective_taps_per_minute: Math.round(totalCommunityTaps / 60),
      voting_participation: 0, // TODO: Add when voting system is active
      community_milestones_hit: hourlyEvents.filter(e => e.event_type === 'achievement_unlocked').length,
      overall_sentiment: overallSentiment
    }
    
    console.log('🔮 Player Activity:', primaryActivity)
    console.log('🔮 Community Activity:', communityActivity)
    
    // === CALCULATE ORACLE METRICS USING SCALING SYSTEM ===
    const calculatedMetrics = {
      divine_girth_resonance: calculateDivineResonance(primaryActivity, communityActivity),
      tap_surge_index: calculateTapSurgeIndex(primaryActivity.taps_per_minute),
      legion_morale: calculateLegionMorale(primaryActivity, communityActivity),
      oracle_stability_status: calculateOracleStability(primaryActivity, communityActivity)
    }
    
    console.log('🔮 Calculated Metrics:', calculatedMetrics)
    
    // Store previous values for trigger detection
    const updatedGirthIndex: GirthIndex = {
      ...currentGirthIndex,
      ...calculatedMetrics,
      last_updated: new Date().toISOString(),
      previous_tap_surge_index: currentGirthIndex.tap_surge_index,
      previous_legion_morale: currentGirthIndex.legion_morale,
      previous_oracle_stability_status: currentGirthIndex.oracle_stability_status
    }

    // === UPDATE DATABASE ===
    // Update the Girth Index with calculated metrics
    const { error: updateError } = await supabaseAdmin
      .from("girth_index_current_values")
      .update(updatedGirthIndex)
      .eq("id", 1)

    if (updateError) {
      console.error("Error updating Girth Index:", updateError)
      throw new Error(`Failed to update Girth Index: ${updateError.message}`)
    }

    // Mark events as processed
    const eventIds = unprocessedEvents.map(e => e.id)
    const { error: markError } = await supabaseAdmin
        .from("live_game_events")
        .update({ processed_at: new Date().toISOString() })
      .in("id", eventIds)

    if (markError) {
      console.error("Error marking events as processed:", markError)
      throw new Error(`Failed to mark events as processed: ${markError.message}`)
    }

    // Store detailed influence calculations (optional table)
    try {
      await supabaseAdmin
        .from('oracle_influence_details')
        .insert({
          session_id: Object.keys(sessionGroups)[0] || 'aggregate_function',
          influences_json: {
            player_activity: primaryActivity,
            community_activity: communityActivity,
            calculated_metrics: calculatedMetrics,
            event_breakdown: {
              total_events: unprocessedEvents.length,
              recent_events: recentEvents.length,
              hourly_events: hourlyEvents.length,
              unique_sessions: Object.keys(sessionGroups).length
            }
          },
          calculated_at: new Date().toISOString()
        })
    } catch (influenceError) {
      console.warn('Could not store influence details (table may not exist):', influenceError)
      // Don't fail the whole operation for this
    }

    // Log the automation
    await supabaseAdmin
      .from("automation_log")
      .insert({
        automation_type: "oracle_scaling_aggregation",
        trigger_source: isManualTrigger ? "manual_trigger" : "cron_job",
        events_processed: unprocessedEvents.length,
        calculation_details: {
          player_activity: primaryActivity,
          community_activity: communityActivity,
          calculated_metrics: calculatedMetrics,
          previous_state: oldGirthIndexState
        },
        success: true
      })

    console.info("🔮 Oracle-powered aggregation completed successfully!")
    console.info("Updated Girth Index:", updatedGirthIndex)

    return new Response(JSON.stringify({
      success: true,
      message: "Oracle aggregation completed",
      events_processed: unprocessedEvents.length,
      calculated_metrics: calculatedMetrics,
      player_activity: primaryActivity,
      community_activity: communityActivity,
      updated_girth_index: updatedGirthIndex
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    })

  } catch (error) {
    console.error('🔮 Oracle aggregation error:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
});

// Helper function to apply decay if no new events (or called as part of main cycle)
async function applyDecayToMetrics(admin: SupabaseClient, currentMetrics: GirthIndex): Promise<GirthIndex> {
    try {
        let newResonance = currentMetrics.divine_girth_resonance - RESONANCE_DECAY_PER_CYCLE;
        newResonance = Math.max(MIN_RESONANCE, Math.min(MAX_RESONANCE, newResonance));
        
        let newOracleStability = currentMetrics.oracle_stability_status;
        let newLegionMorale = currentMetrics.legion_morale;

        // Example: If resonance is very low due to decay, stability might degrade
        if (newResonance < 15 && currentMetrics.oracle_stability_status === "Pristine") {
            newOracleStability = "Flickering Weakly";
        }
        // Add other decay-driven state changes if needed (e.g., morale drops if perpetually flaccid tap surge)

        if (newResonance !== currentMetrics.divine_girth_resonance || newOracleStability !== currentMetrics.oracle_stability_status) {
            const updatePayload: Partial<GirthIndex> = { 
                divine_girth_resonance: parseFloat(newResonance.toFixed(2)),
                oracle_stability_status: newOracleStability,
                last_updated: new Date().toISOString()
            };
            if (newLegionMorale !== currentMetrics.legion_morale) { // If morale also decayed
                // updatePayload.legion_morale = newLegionMorale; // Add if morale can decay
            }

            const { data: updatedData, error: updateError } = await admin
                .from("girth_index_current_values")
                .update(updatePayload)
                .eq("id", 1)
                .select()
                .single();

            if (updateError) {
                console.error("Error applying decay to metrics:", updateError);
                return currentMetrics; // Return old metrics on error
            }
            console.info("Applied decay to metrics. New resonance:", newResonance);
            return updatedData as GirthIndex;
        }
        return currentMetrics; // No change from decay
    } catch(e) {
        console.error("Exception during metric decay:", e);
        return currentMetrics; // Return old metrics on error
    }
}

function calculateTapSurgeIndex(taps_per_minute: number): string {
  // 🔮 Oracle Scaling System thresholds
  if (taps_per_minute >= 300) return 'ASCENDED_NIRVANA';
  if (taps_per_minute >= 200) return 'GIGA_SURGE';
  if (taps_per_minute >= 120) return 'MEGA_SURGE';
  if (taps_per_minute >= 60) return 'FRENZIED_SLAPPING';
  if (taps_per_minute >= 30) return 'STEADY_POUNDING';
  if (taps_per_minute >= 10) return 'WEAK_PULSES';
  return 'FLACCID_DRIZZLE';
}

function calculateDivineResonance(activity: PlayerActivity, community: CommunityActivity): number {
  // 🔮 Oracle Scaling System - Divine Resonance calculation
  let resonance = 50; // Base neutral value
  
  // === PRIMARY INFLUENCES ===
  
  // Activity boost (0-25 points) - Main driver
  const activity_boost = Math.min(25, activity.taps_per_minute * 0.4);
  resonance += activity_boost;
  
  // Achievement momentum (0-20 points) - Progression reward
  const achievement_boost = Math.min(20, activity.achievements_unlocked * 5);
  resonance += achievement_boost;
  
  // Evolution mastery (0-15 points) - Long-term progression
  const evolution_boost = Math.min(15, activity.evolution_level * 3);
  resonance += evolution_boost;
  
  // Session dedication (0-10 points) - Sustained engagement
  const session_boost = activity.session_duration_minutes > 15 
    ? Math.min(10, (activity.session_duration_minutes - 15) * 0.5)
    : 0;
  resonance += session_boost;
  
  // === COMMUNITY INFLUENCES ===
  
  // Community synchronization (0-10 points) - Collective energy
  const community_sync = Math.min(10, community.collective_taps_per_minute * 0.1);
  resonance += community_sync;
  
  // Population energy (0-5 points) - More players = more energy
  const population_energy = Math.min(5, community.total_active_players * 0.5);
  resonance += population_energy;
  
  // === NEGATIVE INFLUENCES ===
  
  // Time decay penalty (0-30 points) - Inactivity hurts
  const time_decay = Math.min(30, activity.time_since_last_activity_minutes * 0.5);
  resonance -= time_decay;
  
  // Community sentiment modifier
  if (community.overall_sentiment === 'positive') {
    resonance += 5;
  } else if (community.overall_sentiment === 'negative') {
    resonance -= 5;
  }
  
  // Clamp to valid range
  return Math.max(0, Math.min(100, Math.round(resonance)));
}

function calculateLegionMorale(activity: PlayerActivity, community: CommunityActivity): string {
  // 🔮 Oracle Scaling System - Legion Morale calculation
  let morale_score = 50; // Neutral starting point (CAUTIOUS)
  
  // === PERFORMANCE EVALUATION ===
  
  // Performance vs baseline (30 taps/min = neutral)
  const baseline_taps = 30;
  const performance_ratio = activity.taps_per_minute / baseline_taps;
  const performance_impact = (performance_ratio - 1) * 30; // -30 to +30 range
  morale_score += performance_impact;
  
  // === ACHIEVEMENT RECOGNITION ===
  
  // Achievement boost - each achievement raises morale
  const achievement_impact = activity.achievements_unlocked * 8;
  morale_score += achievement_impact;
  
  // Upgrade investment - spending shows commitment
  const upgrade_impact = activity.upgrades_purchased * 6;
  morale_score += upgrade_impact;
  
  // Evolution progress - major milestones
  const evolution_impact = activity.evolution_level * 4;
  morale_score += evolution_impact;
  
  // === SESSION QUALITY ===
  
  // Session dedication bonus (15+ min sessions)
  if (activity.session_duration_minutes >= 15) {
    const dedication_bonus = Math.min(15, (activity.session_duration_minutes - 15) * 2);
    morale_score += dedication_bonus;
  }
  
  // Mega slaps show skill and engagement
  const mega_slap_bonus = activity.mega_slaps_count * 5;
  morale_score += mega_slap_bonus;
  
  // === COMMUNITY INFLUENCES ===
  
  // Community sentiment affects Legion morale
  if (community.overall_sentiment === 'positive') {
    morale_score += 10;
  } else if (community.overall_sentiment === 'negative') {
    morale_score -= 10;
  }
  
  // Voting participation (future feature)
  const voting_impact = community.voting_participation * 8;
  morale_score += voting_impact;
  
  // === NEGATIVE FACTORS ===
  
  // Inactivity penalty (recent activity expected)
  if (activity.time_since_last_activity_minutes > 30) {
    const inactivity_penalty = Math.min(20, (activity.time_since_last_activity_minutes - 30) * 0.5);
    morale_score -= inactivity_penalty;
  }
  
  // === CONVERT TO ENUM ===
  if (morale_score >= 90) return 'ASCENDED';
  if (morale_score >= 75) return 'FANATICAL';
  if (morale_score >= 60) return 'JUBILANT';
  if (morale_score >= 45) return 'INSPIRED';
  if (morale_score >= 30) return 'CAUTIOUS';
  if (morale_score >= 15) return 'DISGRUNTLED';
  if (morale_score >= 5) return 'DEMORALIZED';
  return 'SUICIDE_WATCH';
}

function calculateOracleStability(activity: PlayerActivity, community: CommunityActivity): string {
  // 🔮 Oracle Stability System - starts high, degrades under stress
  let stability_score = 80; // Start with PRISTINE baseline
  
  // === SYSTEM LOAD FACTORS ===
  
  // High tap rates stress the Oracle processing
  if (activity.taps_per_minute >= 200) {
    stability_score -= 25; // Extreme load
  } else if (activity.taps_per_minute >= 100) {
    stability_score -= 15; // High load
  } else if (activity.taps_per_minute >= 50) {
    stability_score -= 5; // Moderate load
  }
  
  // === DATA INTEGRITY FACTORS ===
  
  // Long stable sessions improve data integrity
  if (activity.session_duration_minutes >= 25) {
    stability_score += 10; // Sustained stable operation
  } else if (activity.session_duration_minutes >= 10) {
    stability_score += 5; // Moderate stability
  }
  
  // Recent activity indicates stable connection
  if (activity.time_since_last_activity_minutes <= 5) {
    stability_score += 5; // Fresh, active connection
  }
  
  // === COMMUNITY CHAOS FACTORS ===
  
  // High voting participation can cause instability
  if (community.voting_participation > 0.8) {
    stability_score -= 15; // Democratic chaos
  } else if (community.voting_participation > 0.4) {
    stability_score -= 5; // Some democratic stress
  }
  
  // Too many simultaneous players
  if (community.total_active_players > 20) {
    stability_score -= 10; // Server strain
  } else if (community.total_active_players > 10) {
    stability_score -= 5; // Moderate load
  }
  
  // === PROCESSING STRESS ===
  
  // Complex events stress the Oracle
  const processing_events = activity.mega_slaps_count + activity.achievements_unlocked + activity.upgrades_purchased;
  if (processing_events > 10) {
    stability_score -= 15; // High processing load
  } else if (processing_events > 5) {
    stability_score -= 8; // Moderate processing load
  }
  
  // === ENVIRONMENTAL FACTORS ===
  
  // Community sentiment affects Oracle stability
  if (community.overall_sentiment === 'negative') {
    stability_score -= 10; // Negative energy corrupts
  } else if (community.overall_sentiment === 'positive') {
    stability_score += 5; // Positive energy stabilizes
  }
  
  // === CONVERT TO ENUM ===
  if (stability_score >= 95) return 'RADIANT_CLARITY';
  if (stability_score >= 80) return 'PRISTINE';
  if (stability_score >= 65) return 'FLICKERING';
  if (stability_score >= 45) return 'UNSTABLE';
  if (stability_score >= 25) return 'CRITICAL_CORRUPTION';
  return 'DATA_DAEMON_POSSESSION';
}
