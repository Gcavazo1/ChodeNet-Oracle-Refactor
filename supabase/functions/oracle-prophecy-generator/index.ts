// CHODE-NET Oracle Prophecy Generator – Groq-powered v4 (corruption bug fixed)
// Edge Function (Supabase) – Auto-generated from latest production snapshot
// -----------------------------------------------------------------------------
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
// -----------------------------------------------------------------------------
// Configuration & constants
// -----------------------------------------------------------------------------
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
const GROQ_ENDPOINT_URL = "https://api.groq.com/openai/v1/chat/completions"; // OpenAI-compatible
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
console.info("🔮 CHODE-NET Oracle Prophecy Generator (Groq v4) initialised … awaiting divine metrics");
// -----------------------------------------------------------------------------
// Helper: JSON response with CORS
// -----------------------------------------------------------------------------
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json"
    }
  });
}
// -----------------------------------------------------------------------------
// Main HTTP handler – Deno.serve
// -----------------------------------------------------------------------------
Deno.serve(async (req)=>{
  // CORS preflight
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  if (req.method !== "POST") return json({
    error: "Method not allowed"
  }, 405);
  // Parse body
  let payload;
  try {
    payload = await req.json();
    console.info("🔮 Payload received:", payload);
  } catch (err) {
    console.error("Failed to parse JSON payload:", err);
    return json({
      error: "Invalid JSON payload"
    }, 400);
  }
  const { girth_resonance_value, tap_index_state, legion_morale_state, oracle_stability_status = "PRISTINE", ritual_request_topic } = payload;
  // 1. Calculate corruption level ------------------------------------------------
  const corruptionLevel = determineCorruptionLevel(girth_resonance_value, tap_index_state, legion_morale_state, oracle_stability_status);
  console.info(`🔮 Corruption level determined: '${corruptionLevel}'`);
  // 2. Compose Groq prompt -------------------------------------------------------
  const systemMsg = "You are THE CHODE-NET ORACLE, an ancient, cynical AI. You speak in cryptic, prophetic riddles and never break character.";
  let userMsg = `Hark, Oracle! The Girth Index Dashboard reads:\n` + `• Divine Girth Resonance: ${girth_resonance_value}%\n` + `• Tap Surge Index: ${tap_index_state}\n` + `• Legion Morale: ${legion_morale_state}\n` + `• Oracle Stability: ${oracle_stability_status}\n`;
  if (ritual_request_topic?.trim()) {
    userMsg += `\nThe supplicant seeks wisdom about: \"${ritual_request_topic}\".`;
  }
  userMsg += "\nProphesy in 2-4 sentences – unforgettable, weird, echoing the truth of the Girth.";
  // 3. Invoke Groq LLM -----------------------------------------------------------
  let prophecyText = "The Groq-Llama Oracle contemplates Girth velocity … outcome remains obscured.";
  try {
    const llmRes = await fetch(GROQ_ENDPOINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: systemMsg
          },
          {
            role: "user",
            content: userMsg
          }
        ],
        max_tokens: 150,
        temperature: 0.78
      })
    });
    if (!llmRes.ok) {
      throw new Error(`Groq API error – status ${llmRes.status}`);
    }
    const llmJson = await llmRes.json();
    prophecyText = llmJson.choices?.[0]?.message?.content?.trim() ?? prophecyText;
  } catch (err) {
    console.error("Groq invocation failed:", err);
    prophecyText = `⚠️ Groq failure: ${err.message}`;
  }
  // 4. Persist prophecy in DB ----------------------------------------------------
  try {
    const { error } = await supabaseAdmin.from("apocryphal_scrolls").insert({
      prophecy_text: prophecyText,
      corruption_level: corruptionLevel,
      source_metrics_snapshot: payload
    });
    if (error) {
      console.error("DB insertion failed:", error);
      return json({ error: "Database insertion failed", details: error.message }, 500);
    }
  } catch (err) {
    console.error("DB insertion failed:", err);
  }
  // 5. Return response -----------------------------------------------------------
  const responseBody = {
    prophecy: prophecyText,
    corruption_level_applied: corruptionLevel
  };
  return json(responseBody);
});
// -----------------------------------------------------------------------------
// Helper – corruption level calculation
// -----------------------------------------------------------------------------
function normalizeEnum(str) {
  return (str ?? "").toString().trim().toUpperCase().replace(/\s+/g, "_");
}

function determineCorruptionLevel(resonance, tapSurge, morale, stability) {
  let score = 0;
  if (resonance < 20) score += 3;
  else if (resonance < 40) score += 2;
  else if (resonance < 60) score += 1;
  const s = normalizeEnum(stability).toLowerCase();
  if ([
    "forbidden_fragment",
  ].includes(s)) score += 4;
  else if ([
    "glitched_ominous",
  ].includes(s)) score += 3;
  else if ([
    "cryptic",
  ].includes(s)) score += 2;
  else if (s === "flickering") score += 1;
  const m = normalizeEnum(morale).toUpperCase();
  if (m === "SUICIDE_WATCH") score += 2;
  else if (m === "DEMORALIZED") score += 1;
  const t = normalizeEnum(tapSurge).toUpperCase();
  if (t === "FLACCID_DRIZZLE" || t === "ASCENDED_NIRVANA") score += 1;
  if (score >= 6) return "forbidden_fragment";
  if (score >= 4) return "glitched_ominous";
  if (score >= 2) return "flickering";
  if (score >= 1) return "cryptic";
  return "pristine";
}
