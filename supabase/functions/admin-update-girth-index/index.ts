import "jsr:@supabase/functions-js/edge-runtime.d.ts"; // Provides Deno types for Supabase Edge Functions
import { createClient } from "npm:@supabase/supabase-js@2";
// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// --- Supabase Client Initialization ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in environment.");
// This would typically prevent the function from running correctly.
}
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.info("Handling OPTIONS preflight request for admin-update-girth-index.");
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  // --- Authentication/Authorization (Basic Example - Enhance as needed) ---
  // For a production admin function, you'd want robust auth.
  // This example assumes the function is protected by network rules or a secret header
  // passed by Bolt.new if not relying solely on service_role key for all calls.
  // Or, it could verify a user's JWT and check if they have an 'admin' role.
  // For now, we proceed if the request reaches here.
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
  let payload;
  try {
    payload = await req.json();
    console.info("Received payload for Girth Index update:", JSON.stringify(payload));
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
  // --- Core Logic ---
  try {
    const updateObject = {};
    let hasUpdates = false;
    // Build the update object only with provided fields
    if (payload.divine_girth_resonance !== undefined) {
      updateObject.divine_girth_resonance = payload.divine_girth_resonance;
      hasUpdates = true;
    }
    if (payload.tap_surge_index !== undefined) {
      updateObject.tap_surge_index = payload.tap_surge_index;
      hasUpdates = true;
    }
    if (payload.legion_morale !== undefined) {
      updateObject.legion_morale = payload.legion_morale;
      hasUpdates = true;
    }
    if (payload.oracle_stability_status !== undefined) {
      const canonicalLevels = [
        'pristine',
        'cryptic',
        'flickering',
        'glitched_ominous',
        'forbidden_fragment'
      ];
      const level = payload.oracle_stability_status.toString().toLowerCase();
      if (!canonicalLevels.includes(level)) {
        return new Response(JSON.stringify({
          status: 'error',
          message: `Invalid oracle_stability_status. Must be one of ${canonicalLevels.join(', ')}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      updateObject.oracle_stability_status = level;
      hasUpdates = true;
    }
    if (!hasUpdates) {
      console.info("No metrics provided in payload to update.");
      return new Response(JSON.stringify({
        status: "info",
        message: "No metrics provided to update."
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Always update the last_updated timestamp
    updateObject.last_updated = new Date().toISOString();
    console.info("Attempting to update girth_index_current_values with:", JSON.stringify(updateObject));
    const { data, error: dbError } = await supabaseAdmin.from("girth_index_current_values").update(updateObject).eq("id", 1) // Target the single row
    .select() // Optionally select the updated row to return it
    .single(); // Expect a single row to be updated
    if (dbError) {
      console.error("Database error updating Girth Index:", dbError);
      // Check for specific errors, e.g., if the row id=1 doesn't exist (though it should)
      if (dbError.code === 'PGRST116') {
        console.error("Girth Index row with id=1 not found. It may need to be initialized.");
        return new Response(JSON.stringify({
          status: "error",
          message: "Girth Index primary row not found.",
          details: dbError.message
        }), {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      return new Response(JSON.stringify({
        status: "error",
        message: "Failed to update Girth Index.",
        details: dbError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.info("Girth Index updated successfully. Updated row:", data);
    return new Response(JSON.stringify({
      status: "success",
      message: "Girth Index updated successfully.",
      updated_metrics_payload: payload
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Unhandled error in admin-update-girth-index:", error);
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
