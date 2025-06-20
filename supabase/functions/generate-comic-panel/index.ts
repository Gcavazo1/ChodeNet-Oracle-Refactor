// CHODE-NET Generate Comic Panel – Queue Job Edge Function (production snapshot)
// -----------------------------------------------------------------------------
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { lore_entry_id, story_text, visual_prompt, corruption_level, style_override } =
      (await req.json()) as Record<string, any>;

    if (!lore_entry_id || !story_text || !visual_prompt) {
      throw new Error("Missing required fields: lore_entry_id, story_text, visual_prompt");
    }

    const normalizedLevel = normalizeCorruptionLevel(corruption_level);
    const payload = {
      lore_entry_id,
      story_text,
      visual_prompt,
      corruption_level: normalizedLevel,
      style_override,
    };

    const { data: queueData, error: queueError } = await supabaseAdmin
      .from("comic_generation_queue")
      .insert({
        lore_entry_id,
        status: "pending",
        payload,
        attempts: 0,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (queueError) throw queueError;

    const { error: updateError } = await supabaseAdmin
      .from("chode_lore_entries")
      .update({ image_generation_status: "queued", updated_at: new Date().toISOString() })
      .eq("id", lore_entry_id);

    if (updateError) console.warn(`⚠️ Failed to update lore entry ${lore_entry_id}:`, updateError.message);

    return json(
      {
        success: true,
        message: "Comic panel generation queued successfully.",
        job_id: queueData?.id,
        lore_entry_id,
        status: "queued",
        estimated_completion: "1-5 minutes",
      },
      202,
    );
  } catch (err) {
    console.error("🚨 Comic panel queue error:", err);
    return json({ success: false, error: "Failed to queue comic panel generation.", details: err.message }, 500);
  }
});

function normalizeCorruptionLevel(level: string | null | undefined):
  | "pristine"
  | "cryptic"
  | "flickering"
  | "glitched_ominous"
  | "forbidden_fragment" {
  if (!level) return "pristine";
  const n = level.toLowerCase().replace(/\s+/g, "_");
  switch (n) {
    case "pristine":
    case "cryptic":
    case "flickering":
    case "glitched_ominous":
    case "forbidden_fragment":
      return n as any;
    case "radiant_clarity":
      return "pristine";
    case "unstable":
      return "flickering";
    case "critical_corruption":
      return "glitched_ominous";
    case "data_daemon_possession":
      return "forbidden_fragment";
    case "glitchedominous":
    case "glitched-ominous":
      return "glitched_ominous";
    case "forbiddenfragment":
    case "forbidden-fragment":
      return "forbidden_fragment";
    default:
      console.warn(`Unknown corruption level '${level}', defaulting to 'pristine'`);
      return "pristine";
  }
}
