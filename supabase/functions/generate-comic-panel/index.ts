import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComicPanelRequest {
  lore_entry_id: string;
  story_text: string;
  visual_prompt: string;
  corruption_level: 'pristine' | 'cryptic' | 'flickering' | 'glitched_ominous' | 'forbidden_fragment';
  style_override?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const requestData: ComicPanelRequest = await req.json();
    let { lore_entry_id, story_text, visual_prompt, corruption_level, style_override } = requestData;

    // 🔒 Safety – normalize corruption level to underscore naming
    corruption_level = normalizeCorruptionLevel(corruption_level);

    console.log(`🎨 Queuing comic panel generation for lore entry: ${lore_entry_id}`);

    // Verify the request body
    if (!lore_entry_id || !story_text || !visual_prompt) {
      throw new Error("Missing required fields: lore_entry_id, story_text, and visual_prompt are required.");
    }

    // Create the payload to be stored in the queue
    const queuePayload = {
      story_text,
      visual_prompt,
      corruption_level,
      style_override,
    };

    // Insert a new job into the comic_generation_queue
    const { data: queueData, error: queueError } = await supabaseAdmin
      .from('comic_generation_queue')
      .insert({
        lore_entry_id: lore_entry_id,
        status: 'pending',
        payload: queuePayload,
        attempts: 0,
      })
      .select()
      .single();

    if (queueError) {
      console.error('Error queuing comic generation job:', queueError);
      throw new Error(`Failed to queue job: ${queueError.message}`);
    }

    // Update the lore entry to show that generation is in progress
    const { error: updateError } = await supabaseAdmin
      .from("chode_lore_entries")
      .update({
        image_generation_status: "queued"
      })
      .eq("id", lore_entry_id);

    if (updateError) {
      // Don't fail the whole request, but log the error
      console.warn(`Failed to update lore entry status for ${lore_entry_id}:`, updateError.message);
    }
    
    console.log(`✅ Job ${queueData.id} queued successfully for lore entry ${lore_entry_id}`);

    // Return a 202 Accepted response immediately
    return new Response(JSON.stringify({
      success: true,
      message: "Comic panel generation has been queued.",
      job_id: queueData.id,
      lore_entry_id,
    }), {
      status: 202, // Accepted
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("🚨 Comic panel queuing error:", error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to queue comic panel generation.",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Enhanced CHODE Prompt Generator for Edge Functions
function generateEnhancedCHODEPrompt(visualPrompt: string, corruptionLevel: string, styleOverride?: string) {
  const CHODE_VISUAL_DNA = {
    base_style: "64-bit pixel art comic panel",
    mandatory_tags: ["CHODE Tapper universe", "retro cyberpunk aesthetic", "comic panel frame"],
    quality_tags: ["pixel perfect", "sharp edges", "limited color palette", "clean pixel boundaries"],
    exclusion_tags: ["photorealistic", "3D render", "modern graphics", "unlimited colors", "anti-aliasing", "gradient shading"]
  };

  const CORRUPTION_VISUAL_DNA = {
    pristine: {
      palette: ["#FFFFFF", "#06D6A0", "#8B5CF6", "#E5E7EB"],
      effects: ["divine glow", "ethereal light", "sacred geometry", "pure energy"],
      atmosphere: "mystical serenity",
      style_tags: ["divine light rays", "holy aura", "crystalline clarity", "angelic presence"]
    },
    cryptic: {
      palette: ["#8B5CF6", "#9D4EDD", "#6366F1", "#4C1D95"],
      effects: ["mysterious shadows", "ancient symbols", "occult imagery", "arcane energy"],
      atmosphere: "dark mysticism",
      style_tags: ["shadowy depths", "mysterious runes", "occult symbols", "enigmatic aura"]
    },
    flickering: {
      palette: ["#F59E0B", "#FBBF24", "#92400E", "#451A03"],
      effects: ["data corruption", "digital glitches", "unstable energy", "system errors"],
      atmosphere: "technological instability",
      style_tags: ["digital artifacts", "screen glitches", "data corruption", "unstable pixels"]
    },
    glitched_ominous: {
      palette: ["#EF4444", "#DC2626", "#991B1B", "#7F1D1D"],
      effects: ["system failure", "corrupted data", "ominous warnings", "critical errors"],
      atmosphere: "digital nightmare",
      style_tags: ["error messages", "corrupted visuals", "system warnings", "digital decay"]
    },
    forbidden_fragment: {
      palette: ["#000000", "#DC2626", "#7F1D1D", "#450A0A"],
      effects: ["reality breakdown", "cosmic horror", "forbidden knowledge", "dimensional tears"],
      atmosphere: "eldritch terror",
      style_tags: ["reality distortion", "cosmic void", "forbidden geometry", "dimensional rifts"]
    }
  };

  // Extract scene elements from visual prompt
  function extractSceneElements(text: string): string {
    const lowerText = text.toLowerCase();
    const elements = [];
    
    // Detect key entities
    if (lowerText.includes("oracle") || lowerText.includes("prophet") || lowerText.includes("seer")) {
      elements.push("featuring mystical oracle figure");
    }
    if (lowerText.includes("legion") || lowerText.includes("warrior") || lowerText.includes("member")) {
      elements.push("CHODE Legion presence");
    }
    if (lowerText.includes("temple") || lowerText.includes("chamber") || lowerText.includes("sanctuary")) {
      elements.push("in sacred temple setting");
    }
    if (lowerText.includes("forest") || lowerText.includes("swamp") || lowerText.includes("mushroom")) {
      elements.push("in mystical forest environment");
    }
    if (lowerText.includes("digital") || lowerText.includes("cyber") || lowerText.includes("data")) {
      elements.push("cybernetic digital realm");
    }
    
    // Detect mood and atmosphere
    if (lowerText.includes("dark") || lowerText.includes("shadow") || lowerText.includes("ominous")) {
      elements.push("ominous dark atmosphere");
    }
    if (lowerText.includes("glow") || lowerText.includes("light") || lowerText.includes("radiant")) {
      elements.push("ethereal glowing elements");
    }
    if (lowerText.includes("ancient") || lowerText.includes("mystical") || lowerText.includes("sacred")) {
      elements.push("ancient mystical energy");
    }
    
    return elements.join(", ") || "mystical CHODE universe scene";
  }

  const corruption = corruptionLevel as keyof typeof CORRUPTION_VISUAL_DNA;
  const corruptionDNA = CORRUPTION_VISUAL_DNA[corruption] || CORRUPTION_VISUAL_DNA.pristine;
  
  // Extract scene elements from story
  const sceneElements = extractSceneElements(visualPrompt);
  
  // Build enhanced positive prompt with visual consistency
  const baseContent = styleOverride || visualPrompt;
  const positivePrompt = [
    CHODE_VISUAL_DNA.base_style,
    CHODE_VISUAL_DNA.mandatory_tags.join(", "),
    baseContent,
    sceneElements,
    corruptionDNA.atmosphere,
    corruptionDNA.effects.slice(0, 2).join(", "),
    corruptionDNA.style_tags.slice(0, 2).join(", "),
    "single comic panel with 8-pixel border frame, centered composition, clear foreground and background separation",
    `limited 16-color palette, ${corruptionDNA.palette.slice(0, 2).join(" and ")} dominant colors`,
    CHODE_VISUAL_DNA.quality_tags.join(", "),
    "masterpiece quality, detailed pixel art"
  ].filter(Boolean).join(", ");

  // Build comprehensive negative prompt
  const negativePrompt = [
    ...CHODE_VISUAL_DNA.exclusion_tags,
    "multiple panels", "text bubbles", "speech", "words", "letters", "text overlay",
    "blurry", "low quality", "poor composition", "modern UI", "watermark",
    "realistic", "photography", "film", "CGI", "3D rendering"
  ].join(", ");

  // Get model configuration
  const modelConfig = getModelConfigForCorruption(corruptionLevel);

  return {
    positive: positivePrompt,
    negative: negativePrompt,
    model_config: modelConfig,
    generation_params: {
      width: 768,
      height: 768, // Square format for better comic panel consistency
      steps: 30,
      cfg_scale: 8.0,
      sampler_name: "DPM++ 2M Karras"
    }
  };
}

async function generateComicPanel(
  visualPrompt: string,
  corruptionLevel: string,
  styleOverride?: string,
  localSDUrl: string = "http://127.0.0.1:7860"
): Promise<Blob> {
  console.log(`🎨 Generating comic panel with ENHANCED prompting for corruption level: ${corruptionLevel}`);

  // Use enhanced prompt generation for visual consistency
  const enhancedPrompt = generateEnhancedCHODEPrompt(visualPrompt, corruptionLevel, styleOverride);
  
  console.log(`🎨 Enhanced Prompt Length: ${enhancedPrompt.positive.length} chars`);
  console.log(`🎨 Using Model: ${enhancedPrompt.model_config.modelName}`);

  const payload = {
    prompt: enhancedPrompt.positive,
    negative_prompt: enhancedPrompt.negative,
    steps: enhancedPrompt.generation_params.steps,
    cfg_scale: enhancedPrompt.generation_params.cfg_scale,
    width: enhancedPrompt.generation_params.width,
    height: enhancedPrompt.generation_params.height,
    sampler_name: enhancedPrompt.generation_params.sampler_name,
    seed: -1,
    override_settings: {
      sd_model_checkpoint: enhancedPrompt.model_config.modelName
    }
  };

  console.log(`🎨 Sending request to Local SD: ${localSDUrl}/sdapi/v1/txt2img`);
  
  const response = await fetch(`${localSDUrl}/sdapi/v1/txt2img`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("SD API Error:", response.status, errorText);
    throw new Error(`Stable Diffusion API error: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.images || result.images.length === 0) {
    throw new Error("No images generated by Stable Diffusion");
  }

  // Convert base64 to blob URL
  const base64Image = result.images[0];
  const imageBlob = base64ToBlob(base64Image, "image/png");

  console.log(`✅ Comic panel generated successfully: ${imageBlob.size} bytes`);
  return imageBlob;
}

function getModelConfigForCorruption(corruptionLevel: string) {
  const configs = {
    pristine: {
      modelName: 'oracle-pristine.safetensors',
      stylePrefix: 'mystical oracle vision, divine light, ethereal glow, sacred geometry, magical atmosphere,',
      styleSuffix: ', masterpiece, best quality, highly detailed, magical realism, divine comics',
      negativePrompt: 'dark, evil, corrupted, glitch, horror, nsfw, low quality, blurry'
    },
    cryptic: {
      modelName: 'oracle-cryptic.safetensors', 
      stylePrefix: 'dark mystical vision, ancient symbols, mysterious shadows, occult imagery, cryptic atmosphere,',
      styleSuffix: ', dark fantasy, detailed, atmospheric, moody lighting, mysterious comics',
      negativePrompt: 'bright, cheerful, modern, nsfw, low quality, blurry'
    },
    flickering: {
      modelName: 'oracle-glitched.safetensors',
      stylePrefix: 'unstable digital vision, flickering reality, data corruption, glitch art, unstable energy,',
      styleSuffix: ', cyberpunk, digital art, neon, technological, detailed, glitch comics',
      negativePrompt: 'stable, clean, perfect, nsfw, low quality, blurry'
    },
    glitched_ominous: {
      modelName: 'oracle-glitched.safetensors',
      stylePrefix: 'corrupted digital nightmare, glitch horror, data decay, system failure, ominous atmosphere,',
      styleSuffix: ', dark cyberpunk, horror, detailed, ominous atmosphere, corrupted comics',
      negativePrompt: 'clean, bright, happy, nsfw, low quality, blurry'
    },
    forbidden_fragment: {
      modelName: 'oracle-forbidden.safetensors',
      stylePrefix: 'eldritch horror vision, cosmic terror, forbidden knowledge, reality breakdown, forbidden comics,',
      styleSuffix: ', lovecraftian, horror art, detailed, nightmarish, dark atmosphere, cosmic horror comics',
      negativePrompt: 'safe, normal, mundane, nsfw, low quality, blurry'
    }
  };

  return configs[corruptionLevel as keyof typeof configs] || configs.pristine;
}

function getStyleForCorruption(corruptionLevel: string): string {
  const styles = {
    pristine: "Divine Oracle Comics",
    cryptic: "Dark Mystical Comics", 
    flickering: "Glitched Reality Comics",
    glitched_ominous: "Corrupted Nightmare Comics",
    forbidden_fragment: "Cosmic Horror Comics"
  };
  
  return styles[corruptionLevel as keyof typeof styles] || "Oracle Comics";
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Helper to normalize corruption names to underscore style used in DB & SD
function normalizeCorruptionLevel(level: string): 'pristine' | 'cryptic' | 'flickering' | 'glitched_ominous' | 'forbidden_fragment' {
  if (!level) return 'pristine';
  
  const l = level.toLowerCase();
  
  // Standard mapping for non-standard corruption levels
  if (l === 'unstable') return 'flickering';
  if (l === 'radiant_clarity' || l === 'radiantclarity' || l === 'radiant-clarity') return 'pristine';
  if (l === 'critical_corruption' || l === 'criticalcorruption' || l === 'critical-corruption') return 'glitched_ominous';
  if (l === 'data_daemon_possession' || l === 'datadaemonpossession' || l === 'data-daemon-possession') return 'forbidden_fragment';
  
  // Handle camelCase and other formats
  if (l === 'glitchedominous' || l === 'glitched-ominous') return 'glitched_ominous';
  if (l === 'forbiddenfragment' || l === 'forbidden-fragment') return 'forbidden_fragment';
  
  // If it's already a standard value, return it
  if (['pristine', 'cryptic', 'flickering', 'glitched_ominous', 'forbidden_fragment'].includes(l)) {
    return l as any;
  }
  
  // Default to pristine for unknown values
  return 'pristine';
}
