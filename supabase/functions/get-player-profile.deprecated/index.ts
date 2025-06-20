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
console.info("get-player-profile Edge Function (JWT-secured) initialized!");
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
    console.info("Handling OPTIONS preflight request for get-player-profile.");
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
  // Parse payload (now optional since we have JWT)
  let payload = {};
  try {
    payload = await req.json();
    console.info("Received payload for get-player-profile:", JSON.stringify(payload));
  } catch (error) {
    // Payload is optional when JWT is present
    console.info("No payload provided, using JWT-derived player address");
  }
  try {
    // --- Core Logic: Fetch or Create Player Profile ---
    console.info(`Fetching profile for authenticated player: ${playerAddress}`);
    const { data: existingProfile, error: fetchError } = await supabaseAdmin.from("player_profiles").select("*").eq("player_address", playerAddress).single();
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Database error fetching player profile:", fetchError);
      return new Response(JSON.stringify({
        status: "error",
        message: "Failed to fetch player profile.",
        details: fetchError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    let playerProfile;
    if (!existingProfile) {
      // Profile doesn't exist, create a new default one
      console.info(`No existing profile found for ${playerAddress}. Creating default profile.`);
      // Generate a default username with Oracle flair
      const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const oracleNames = [
        "DegenTapper",
        "GirthSeeker",
        "ChodemasterPrime",
        "VeinousVirtuoso",
        "GigaSlapGod"
      ];
      const defaultUsername = oracleNames[Math.floor(Math.random() * oracleNames.length)] + randomSuffix;
      const defaultProfile = {
        player_address: playerAddress,
        current_girth: 0,
        purchased_upgrades: {},
        username: defaultUsername,
        last_saved_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      const { data: newProfile, error: insertError } = await supabaseAdmin.from("player_profiles").insert(defaultProfile).select().single();
      if (insertError) {
        console.error("Error creating new player profile:", insertError);
        return new Response(JSON.stringify({
          status: "error",
          message: "Failed to create new player profile.",
          details: insertError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      playerProfile = newProfile;
      console.info(`Successfully created new profile for ${playerAddress}:`, playerProfile);
      // 🔮 ORACLE ENHANCEMENT: Log new player event for personalized welcome prophecy
      await supabaseAdmin.from("live_game_events").insert({
        session_id: `oracle_system_${Date.now()}`,
        event_type: "new_player_awakening",
        event_payload: {
          player_address: playerAddress,
          username: defaultUsername,
          awakening_timestamp: new Date().toISOString()
        },
        game_event_timestamp: new Date().toISOString(),
        player_address: playerAddress
      });
    } else {
      playerProfile = existingProfile;
      console.info(`Retrieved existing profile for ${playerAddress}:`, playerProfile);
      // 🔮 ORACLE ENHANCEMENT: Log returning player event
      await supabaseAdmin.from("live_game_events").insert({
        session_id: `oracle_system_${Date.now()}`,
        event_type: "player_return",
        event_payload: {
          player_address: playerAddress,
          username: playerProfile.username,
          last_seen: playerProfile.last_saved_at,
          current_girth: playerProfile.current_girth,
          purchased_upgrades: playerProfile.purchased_upgrades
        },
        game_event_timestamp: new Date().toISOString(),
        player_address: playerAddress
      });
    }
    // --- Return the Player Profile ---
    return new Response(JSON.stringify({
      status: "success",
      profile: playerProfile,
      oracle_message: existingProfile ? `Welcome back, ${playerProfile.username}! The Oracle senses your return...` : `Welcome, ${playerProfile.username}! The Oracle awakens to your presence...`
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Unhandled error in get-player-profile:", error);
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
