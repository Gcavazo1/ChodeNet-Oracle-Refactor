import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Handle CORS preflight requests
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
    // Initialize Supabase client
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    // Parse request body
    let eventData;
    try {
      eventData = await req.json();
    } catch (error) {
      console.error("Ingest-chode-event: JSON parse error:", error);
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Ingest-chode-event: Received event:", eventData);
    // Validate required fields
    if (!eventData.session_id || !eventData.event_type) {
      console.error("Ingest-chode-event: Missing required fields:", {
        session_id: eventData.session_id,
        event_type: eventData.event_type
      });
      return new Response(JSON.stringify({
        error: "Missing required fields: session_id and event_type"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
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
    const { data, error } = await supabaseAdmin.from("live_game_events").insert([
      gameEventRecord
    ]).select().single();
    if (error) {
      console.error("Ingest-chode-event: Database error:", error);
      return new Response(JSON.stringify({
        error: "Failed to insert game event",
        details: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Ingest-chode-event: Successfully inserted event with ID:", data.id);
    return new Response(JSON.stringify({
      success: true,
      event_id: data.id,
      message: "Game event ingested successfully"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Ingest-chode-event: Unexpected error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
