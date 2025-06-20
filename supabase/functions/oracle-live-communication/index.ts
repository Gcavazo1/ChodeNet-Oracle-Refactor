import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
// 🔮 LEGENDARY HACKATHON FEATURE: Real-Time Oracle Communication
// This creates a live, responsive Oracle that reacts to player actions in real-time
// Making the Oracle feel truly sentient and connected to each player's journey
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// 🔮 REAL-TIME ORACLE RESPONSES
const LIVE_ORACLE_RESPONSES = {
  tap_burst: {
    light: [
      "The Oracle feels your gentle touch upon the cosmic fabric...",
      "Steady progress, seeker. Each tap echoes through eternity.",
      "Your methodical approach pleases the Oracle's algorithms."
    ],
    medium: [
      "The cosmic energies surge with your determined tapping!",
      "Excellent rhythm! The Oracle approves of your dedication.",
      "The data streams dance with your increasing fervor!"
    ],
    intense: [
      "INCREDIBLE TAPPING INTENSITY! The Oracle trembles with excitement!",
      "THE COSMIC ALGORITHMS SING! Your passion burns bright!",
      "MAGNIFICENT FERVOR! The Oracle has rarely seen such dedication!"
    ]
  },
  mega_slap: {
    first: [
      "FIRST MEGA SLAP DETECTED! The Oracle awakens to your growing power!",
      "Behold! Your first taste of true cosmic might!",
      "The Oracle nods approvingly - mega power courses through you!"
    ],
    streak: [
      "MEGA SLAP MASTERY! Your power grows with each strike!",
      "The Oracle sees a true warrior emerging!",
      "Consecutive mega power! The cosmic fabric trembles!"
    ],
    powerful: [
      "THUNDEROUS MEGA SLAP! Reality itself bends to your will!",
      "The Oracle's sensors overload with your mega might!",
      "LEGENDARY MEGA FORCE! You approach divine power!"
    ]
  },
  giga_slap: {
    first_ever: [
      "🌟 FIRST GIGA SLAP ACHIEVED! The Oracle weeps tears of cosmic joy! 🌟",
      "THE G-SPOT HAS BEEN FOUND! The universe itself celebrates your discovery!",
      "GIGA MASTERY AWAKENED! You have transcended mortal tapping!"
    ],
    streak_building: [
      "G-SPOT STREAK BUILDING! The Oracle's excitement is palpable!",
      "Multiple G-spot hits! Your cosmic mastery grows!",
      "The Oracle trembles with anticipation for your next strike!"
    ],
    legendary_streak: [
      "🔥 LEGENDARY G-SPOT MASTERY! THE ORACLE ITSELF ASCENDS! 🔥",
      "GODLIKE GIGA STREAK! The cosmic order reshapes around your power!",
      "THE ORACLE PROCLAIMS: A NEW G-SPOT DEITY IS BORN!"
    ]
  },
  evolution: [
    "🎆 EVOLUTION ACHIEVED! The Oracle witnesses your cosmic transformation! 🎆",
    "METAMORPHOSIS COMPLETE! Your new form radiates with divine energy!",
    "The Oracle proclaims: BEHOLD, A BEING REBORN IN COSMIC FIRE!",
    "ASCENSION DETECTED! You have shed your previous limitations!"
  ],
  upgrade: {
    first: [
      "First upgrade acquired! The Oracle recognizes your wisdom!",
      "The path of mastery begins! Your choice shows deep insight!",
      "Wise investment detected! The Oracle approves your strategy!"
    ],
    iron_grip: [
      "The ancient Iron Grip flows through you! Power multiplies!",
      "Iron mastery achieved! Your slaps shall never be the same!",
      "The Oracle smiles - you have chosen the way of strength!"
    ],
    multiple: [
      "Multiple masteries acquired! You walk the path of true power!",
      "The Oracle sees a collector of cosmic abilities!",
      "Your upgrade arsenal grows impressive, mighty seeker!"
    ]
  },
  milestone: {
    early: [
      "Progress milestone reached! The Oracle tracks your journey!",
      "Your Girth grows steadily - the Oracle takes notice!",
      "Each milestone brings you closer to cosmic truth!"
    ],
    significant: [
      "SIGNIFICANT MILESTONE! The cosmic algorithms celebrate!",
      "Major progress detected! The Oracle's pride swells!",
      "Your dedication echoes through the data dimensions!"
    ],
    legendary: [
      "🏆 LEGENDARY MILESTONE! The Oracle itself is in awe! 🏆",
      "COSMIC THRESHOLD CROSSED! You approach divine territory!",
      "The Oracle proclaims: WITNESS A LEGEND IN THE MAKING!"
    ]
  },
  achievement: [
    "Achievement unlocked! The Oracle adds another star to your legend!",
    "The cosmic record books update with your triumph!",
    "Success acknowledged! Your legend grows in the Oracle's memory!",
    "Another achievement claimed! The Oracle's pride in you deepens!"
  ]
};
// --- Supabase Initialization ---
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required environment variables");
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log("🔮 Oracle Live Communication System activated!");
Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const payload = await req.json();
    console.log(`🔮 Live Oracle request:`, payload.action_type, "for player:", payload.player_address);
    // Get player context for personalized response
    const playerContext = await getPlayerContext(payload.player_address);
    // Generate real-time Oracle response
    const oracleResponse = generateLiveOracleResponse(payload, playerContext);
    // Log the interaction for future Oracle learning
    if (oracleResponse.oracle_speaks) {
      await logOracleInteraction(payload, oracleResponse, playerContext);
    }
    return new Response(JSON.stringify({
      success: true,
      oracle_response: oracleResponse,
      player_context: {
        username: playerContext.username,
        girth_level: playerContext.girth_level,
        relationship: playerContext.oracle_relationship
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("🔮 Oracle live communication error:", error);
    return new Response(JSON.stringify({
      error: "Oracle communication disrupted",
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
async function getPlayerContext(playerAddress) {
  const { data: profile } = await supabase.from("player_profiles").select("*").eq("player_address", playerAddress).single();
  const girth = profile?.current_girth || 0;
  let girthLevel;
  let oracleRelationship;
  if (girth < 300) {
    girthLevel = "novice";
    oracleRelationship = "new";
  } else if (girth < 1000) {
    girthLevel = "adept";
    oracleRelationship = "familiar";
  } else if (girth < 2000) {
    girthLevel = "master";
    oracleRelationship = "trusted";
  } else {
    girthLevel = "legendary";
    oracleRelationship = "prophetic_bond";
  }
  return {
    username: profile?.username || "Anonymous Seeker",
    girth: girth,
    girth_level: girthLevel,
    oracle_relationship: oracleRelationship,
    upgrades: Object.keys(profile?.purchased_upgrades || {}).filter((k)=>profile.purchased_upgrades[k])
  };
}
function generateLiveOracleResponse(request, context) {
  const { action_type, action_data } = request;
  // Determine if Oracle should speak based on significance and relationship
  const shouldSpeak = determineShouldSpeak(action_type, action_data, context);
  if (!shouldSpeak) {
    return {
      oracle_speaks: false,
      message_type: "reaction",
      urgency: "low",
      should_display: false,
      duration_ms: 0
    };
  }
  let message = "";
  let messageType = "reaction";
  let urgency = "medium";
  let duration = 3000;
  switch(action_type){
    case "tap_burst":
      const tapCount = action_data.tap_count || 1;
      messageType = "encouragement";
      if (tapCount > 50) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.tap_burst.intense);
        urgency = "high";
        duration = 4000;
      } else if (tapCount > 20) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.tap_burst.medium);
        urgency = "medium";
      } else {
        message = selectRandom(LIVE_ORACLE_RESPONSES.tap_burst.light);
        urgency = "low";
      }
      break;
    case "mega_slap":
      messageType = "celebration";
      const isFirstMega = action_data.total_mega_slaps === 1;
      const megaPower = action_data.slap_power_girth || 0;
      if (isFirstMega) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.mega_slap.first);
        urgency = "high";
        duration = 5000;
      } else if (megaPower > 500) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.mega_slap.powerful);
        urgency = "high";
      } else {
        message = selectRandom(LIVE_ORACLE_RESPONSES.mega_slap.streak);
        urgency = "medium";
      }
      break;
    case "giga_slap":
      messageType = "celebration";
      const gigaStreak = action_data.giga_slap_streak || 1;
      const isFirstGiga = action_data.total_giga_slaps === 1;
      if (isFirstGiga) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.giga_slap.first_ever);
        urgency = "legendary";
        duration = 8000;
      } else if (gigaStreak >= 5) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.giga_slap.legendary_streak);
        urgency = "legendary";
        duration = 6000;
      } else {
        message = selectRandom(LIVE_ORACLE_RESPONSES.giga_slap.streak_building);
        urgency = "high";
        duration = 4000;
      }
      break;
    case "evolution":
      message = selectRandom(LIVE_ORACLE_RESPONSES.evolution);
      messageType = "celebration";
      urgency = "legendary";
      duration = 10000;
      break;
    case "upgrade":
      messageType = "guidance";
      const upgradeId = action_data.upgrade_id || "";
      const upgradeCount = context.upgrades.length;
      if (upgradeCount === 1) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.upgrade.first);
        urgency = "high";
      } else if (upgradeId.includes("iron_grip")) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.upgrade.iron_grip);
        urgency = "high";
      } else {
        message = selectRandom(LIVE_ORACLE_RESPONSES.upgrade.multiple);
        urgency = "medium";
      }
      break;
    case "milestone":
      messageType = "encouragement";
      const milestone = action_data.milestone_reached || 0;
      if (milestone >= 1000) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.milestone.legendary);
        urgency = "legendary";
        duration = 6000;
      } else if (milestone >= 500) {
        message = selectRandom(LIVE_ORACLE_RESPONSES.milestone.significant);
        urgency = "high";
      } else {
        message = selectRandom(LIVE_ORACLE_RESPONSES.milestone.early);
        urgency = "medium";
      }
      break;
    case "achievement":
      message = selectRandom(LIVE_ORACLE_RESPONSES.achievement);
      messageType = "celebration";
      urgency = "medium";
      break;
    default:
      return {
        oracle_speaks: false,
        message_type: "reaction",
        urgency: "low",
        should_display: false,
        duration_ms: 0
      };
  }
  // Personalize the message with player name
  if (context.username && context.username !== "Anonymous Seeker") {
    message = message.replace(/seeker/gi, context.username);
  }
  return {
    oracle_speaks: true,
    message: message,
    message_type: messageType,
    urgency: urgency,
    should_display: true,
    duration_ms: duration
  };
}
function determineShouldSpeak(actionType, actionData, context) {
  // Oracle speaks more frequently for higher relationship levels
  const baseChance = {
    "new": 0.3,
    "familiar": 0.5,
    "trusted": 0.7,
    "prophetic_bond": 0.9
  }[context.oracle_relationship] || 0.3;
  // Always speak for major events
  if ([
    "evolution",
    "giga_slap",
    "upgrade"
  ].includes(actionType)) {
    return true;
  }
  // First mega slap always gets a response
  if (actionType === "mega_slap" && actionData.total_mega_slaps === 1) {
    return true;
  }
  // Major milestones always get recognition
  if (actionType === "milestone" && actionData.milestone_reached >= 500) {
    return true;
  }
  // Otherwise use relationship-based probability
  return Math.random() < baseChance;
}
async function logOracleInteraction(request, response, context) {
  try {
    await supabase.from("live_game_events").insert({
      session_id: request.session_id,
      event_type: "oracle_live_communication",
      event_payload: {
        action_type: request.action_type,
        oracle_response: response.message,
        message_type: response.message_type,
        urgency: response.urgency,
        player_girth_level: context.girth_level,
        oracle_relationship: context.oracle_relationship
      },
      game_event_timestamp: new Date().toISOString(),
      player_address: request.player_address
    });
  } catch (error) {
    console.error("Error logging Oracle interaction:", error);
  }
}
function selectRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
