import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GIRTH_EXCHANGE_RATE = 0.000075; // 💹 Girth earned per tap/slap unit for soft balance calculations

interface GameEventPayload {
  session_id: string;
  event_type: string;
  event_payload?: Record<string, any>;
  timestamp_utc?: string;
  game_event_timestamp?: string;
  player_address?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse request body
    let eventData: GameEventPayload;
    try {
      eventData = await req.json();
    } catch (error) {
      console.error("Ingest-chode-event: JSON parse error:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log("Ingest-chode-event: Received event:", eventData);

    // Validate required fields
    if (!eventData.session_id || !eventData.event_type) {
      console.error("Ingest-chode-event: Missing required fields:", { 
        session_id: eventData.session_id, 
        event_type: eventData.event_type 
      });
      return new Response(
        JSON.stringify({ error: "Missing required fields: session_id and event_type" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // 🚨 DEPRECATED STATE EVENTS 🚨
    // Beginning January 2025 we consolidated all load/save logic into the unified
    // `player-state-manager` function.  Any direct state events received here
    // should be rejected so the client can switch endpoints.
    if (["player_state_save", "player_state_load_request"].includes(eventData.event_type)) {
      console.warn("ingest-chode-event: Received deprecated state event – instructing client to use player-state-manager");
      return new Response(
        JSON.stringify({
          error: "Deprecated state event. Use /functions/v1/player-state-manager instead.",
          redirect: "/functions/v1/player-state-manager",
        }),
        {
          status: 410, // Gone
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Handle timestamp - prioritize game_event_timestamp, then timestamp_utc, then current time
    const gameTimestamp = eventData.game_event_timestamp || eventData.timestamp_utc || new Date().toISOString();
    const timestampUtc = eventData.timestamp_utc || new Date().toISOString();

    // Prepare the database record
    const gameEventRecord = {
      session_id: eventData.session_id,
      event_type: eventData.event_type,
      event_payload: eventData.event_payload || {},
      timestamp_utc: timestampUtc,
      game_event_timestamp: gameTimestamp,
      player_address: eventData.player_address || null
    };

    console.log("Ingest-chode-event: Inserting record:", gameEventRecord);

    // Insert into live_game_events table
    const { data, error } = await supabaseAdmin
      .from("live_game_events")
      .insert([gameEventRecord])
      .select()
      .single();

    if (error) {
      console.error("Ingest-chode-event: Database error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to insert game event", 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Ingest-chode-event: Successfully inserted event with ID:", data.id);

    // 💰 DUAL BALANCE UPDATE: Apply soft Girth earnings for eligible burst events
    if (eventData.player_address && ["tap_activity_burst", "mega_slap_burst", "giga_slap_burst"].includes(eventData.event_type)) {
      try {
        const earnedGirth = calculateGirthEarned(eventData);
        if (earnedGirth > 0) {
          await applyGirthEarning(supabaseAdmin, eventData.player_address, earnedGirth);
        }
      } catch (girthErr) {
        console.error("⚠️  Soft balance update failed for", eventData.player_address, girthErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_id: data.id,
        message: "Game event ingested successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Ingest-chode-event: Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// ========== 💰 DUAL BALANCE HELPER UTILITIES ==========

function calculateGirthEarned(eventData: GameEventPayload): number {
  const payload = eventData.event_payload || {};
  // Prefer explicit total_girth_gained if provided by game
  if (typeof payload.total_girth_gained === "number") {
    return payload.total_girth_gained;
  }
  // Fallback to tap/slap count * exchange rate
  const unitCount = typeof payload.tap_count === "number" ? payload.tap_count : (
    typeof payload.slap_count === "number" ? payload.slap_count : 0
  );
  return unitCount * GIRTH_EXCHANGE_RATE;
}

async function applyGirthEarning(supabaseAdmin: any, walletAddress: string, amount: number) {
  // Lookup user profile by wallet
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("wallet_address", walletAddress)
    .single();

  if (profileErr || !profile) {
    console.warn("No user_profiles entry for", walletAddress, "- skipping girth_balances update");
    return;
  }

  // Fetch current balances (may not exist yet)
  const { data: balanceRow } = await supabaseAdmin
    .from("girth_balances")
    .select("soft_balance, lifetime_earned")
    .eq("user_profile_id", profile.id)
    .single();

  const newSoft = (balanceRow?.soft_balance || 0) + amount;
  const newLifetime = (balanceRow?.lifetime_earned || 0) + amount;

  await supabaseAdmin
    .from("girth_balances")
    .upsert({
      user_profile_id: profile.id,
      soft_balance: newSoft,
      lifetime_earned: newLifetime,
      updated_at: new Date().toISOString()
    }, {
      onConflict: "user_profile_id",
      ignoreDuplicates: false
    });

  console.log(`💰 Soft balance updated for ${walletAddress}: +${amount.toFixed(6)} ($GIRTH)`);
} 