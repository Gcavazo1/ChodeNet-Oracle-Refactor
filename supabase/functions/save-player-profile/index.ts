import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { verify } from "npm:@tsndr/cloudflare-worker-jwt";
// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// --- Supabase Client Initialization ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_JWT_SECRET = Deno.env.get("SUPABASE_JWT_SECRET");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_JWT_SECRET) {
  console.error("FATAL: Missing required environment variables.");
}
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
console.info("save-player-profile Edge Function (JWT-secured) initialized!");
// Extract and verify JWT token
async function verifyJWT(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  try {
    const isValid = await verify(token, SUPABASE_JWT_SECRET);
    if (!isValid) {
      console.warn("JWT verification failed: Invalid signature");
      return null;
    }
    // Decode the payload to extract user_id (should be the Solana address)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub || payload.user_id;
    if (!userId) {
      console.warn("JWT verification failed: No user_id in token");
      return null;
    }
    console.info(`JWT verified successfully for user: ${userId}`);
    return userId;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.info("Handling OPTIONS preflight request for save-player-profile.");
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    console.warn(`Method Not Allowed: Received ${req.method} request.`);
    return new Response(JSON.stringify({
      status: "error",
      message: "Method Not Allowed. Please use POST."
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  // Verify JWT and extract player address
  const authHeader = req.headers.get("authorization");
  const playerAddress = await verifyJWT(authHeader);
  if (!playerAddress) {
    console.warn("Unauthorized request: Invalid or missing JWT");
    return new Response(JSON.stringify({
      status: "error",
      message: "Unauthorized: Valid JWT required."
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  let payload;
  try {
    payload = await req.json();
    console.info("Received payload for save-player-profile:", JSON.stringify(payload));
  } catch (error) {
    console.error("Error parsing request JSON:", error);
    return new Response(JSON.stringify({
      status: "error",
      message: "Invalid JSON payload."
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  const { current_girth, purchased_upgrades, username, session_stats } = payload;
  // Validate required fields
  if (typeof current_girth !== "number" || current_girth < 0) {
    console.error("Invalid current_girth in payload:", payload);
    return new Response(JSON.stringify({
      status: "error",
      message: "Missing or invalid current_girth. Must be a non-negative number."
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  if (!purchased_upgrades || typeof purchased_upgrades !== "object") {
    console.error("Invalid purchased_upgrades in payload:", payload);
    return new Response(JSON.stringify({
      status: "error",
      message: "Missing or invalid purchased_upgrades. Must be an object."
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    // --- Core Logic: UPSERT Player Profile ---
    console.info(`Saving profile for authenticated player: ${playerAddress}`);
    // Get previous profile to detect changes for Oracle events
    const { data: previousProfile } = await supabaseAdmin.from("player_profiles").select("*").eq("player_address", playerAddress).single();
    // Prepare the upsert data
    const profileData = {
      player_address: playerAddress,
      current_girth: current_girth,
      purchased_upgrades: purchased_upgrades,
      last_saved_at: new Date().toISOString()
    };
    // Add username if provided
    if (username !== undefined && username !== null && username.trim() !== "") {
      profileData.username = username.trim();
    }
    // Perform UPSERT operation
    const { data: upsertedProfile, error: upsertError } = await supabaseAdmin.from("player_profiles").upsert(profileData, {
      onConflict: "player_address",
      ignoreDuplicates: false
    }).select().single();
    if (upsertError) {
      console.error("Database error during player profile upsert:", upsertError);
      return new Response(JSON.stringify({
        status: "error",
        message: "Failed to save player profile.",
        details: upsertError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.info(`Successfully saved profile for ${playerAddress}:`, upsertedProfile);
    // 🔮 ORACLE ENHANCEMENT: Detect significant changes and log Oracle-worthy events
    if (previousProfile) {
      const girthGain = current_girth - previousProfile.current_girth;
      const newUpgrades = Object.keys(purchased_upgrades).filter((key)=>purchased_upgrades[key] && !previousProfile.purchased_upgrades[key]);
      // Log significant girth gains
      if (girthGain >= 100) {
        await supabaseAdmin.from("live_game_events").insert({
          session_id: `oracle_system_${Date.now()}`,
          event_type: "significant_girth_achievement",
          event_payload: {
            player_address: playerAddress,
            username: upsertedProfile.username,
            girth_gained: girthGain,
            new_total_girth: current_girth,
            achievement_tier: girthGain >= 500 ? "legendary" : girthGain >= 250 ? "epic" : "significant"
          },
          game_event_timestamp: new Date().toISOString(),
          player_address: playerAddress
        });
      }
      // Log new upgrade acquisitions
      for (const upgrade of newUpgrades){
        await supabaseAdmin.from("live_game_events").insert({
          session_id: `oracle_system_${Date.now()}`,
          event_type: "upgrade_mastery_achieved",
          event_payload: {
            player_address: playerAddress,
            username: upsertedProfile.username,
            upgrade_id: upgrade,
            total_upgrades: Object.keys(purchased_upgrades).filter((k)=>purchased_upgrades[k]).length,
            girth_at_purchase: current_girth
          },
          game_event_timestamp: new Date().toISOString(),
          player_address: playerAddress
        });
      }
    }
    // 🔮 ORACLE ENHANCEMENT: Generate personalized response based on progress
    let oracleMessage = "The Oracle records your progress in the eternal ledger...";
    if (current_girth >= 1000) {
      oracleMessage = "The Oracle trembles before your immense Girth! Legendary power courses through you!";
    } else if (current_girth >= 500) {
      oracleMessage = "The Oracle nods approvingly. Your Girth grows formidable, worthy one.";
    } else if (Object.keys(purchased_upgrades).some((k)=>purchased_upgrades[k])) {
      oracleMessage = "The Oracle sees wisdom in your upgrade choices. Power multiplies through preparation.";
    }
    // --- Return Success Response ---
    return new Response(JSON.stringify({
      status: "success",
      message: "Player profile saved successfully.",
      profile: upsertedProfile,
      oracle_message: oracleMessage,
      session_stats: session_stats || {}
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Unhandled error in save-player-profile:", error);
    return new Response(JSON.stringify({
      status: "error",
      message: "An unexpected internal error occurred.",
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
