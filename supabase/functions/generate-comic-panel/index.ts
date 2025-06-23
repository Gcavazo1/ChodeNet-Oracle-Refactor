// CHODE-NET Generate Comic Panel – Queue Job Edge Function (production snapshot)
// -----------------------------------------------------------------------------
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json"
    }
  });
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  if (req.method !== "POST") return json({
    error: "Method not allowed"
  }, 405);
  try {
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const { lore_entry_id, story_text, visual_prompt, corruption_level, style_override } = await req.json();
    if (!lore_entry_id || !story_text || !visual_prompt) {
      throw new Error("Missing required fields: lore_entry_id, story_text, visual_prompt");
    }
    const allowedLevels = [
      "pristine",
      "cryptic",
      "flickering",
      "glitched_ominous",
      "forbidden_fragment"
    ];
    const level = (corruption_level || "pristine").toLowerCase();
    if (!allowedLevels.includes(level)) {
      throw new Error(`Invalid corruption_level '${corruption_level}'. Expected one of ${allowedLevels.join(", ")}`);
    }
    const payload = {
      lore_entry_id,
      story_text,
      visual_prompt,
      corruption_level: level,
      style_override
    };
    const { data: queueData, error: queueError } = await supabaseAdmin.from("comic_generation_queue").insert({
      lore_entry_id,
      status: "pending",
      payload,
      attempts: 0,
      created_at: new Date().toISOString()
    }).select("id").single();
    if (queueError) throw queueError;
    const { error: updateError } = await supabaseAdmin.from("chode_lore_entries").update({
      image_generation_status: "queued",
      updated_at: new Date().toISOString()
    }).eq("id", lore_entry_id);
    if (updateError) console.warn(`⚠️ Failed to update lore entry ${lore_entry_id}:`, updateError.message);
    return json({
      success: true,
      message: "Comic panel generation queued successfully.",
      job_id: queueData?.id,
      lore_entry_id,
      status: "queued",
      estimated_completion: "1-5 minutes"
    }, 202);
  } catch (err) {
    console.error("🚨 Comic panel queue error:", err);
    return json({
      success: false,
      error: "Failed to queue comic panel generation.",
      details: err.message
    }, 500);
  }
});
