import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    console.log("🔮 Starting automated lore generation cycle...");
    // Find completed cycles that need lore generation
    const currentTime = new Date();
    const { data: readyCycles, error: cycleError } = await supabaseAdmin.from("lore_cycles").select("*").eq("status", "collecting").lt("cycle_end_time", currentTime.toISOString()).order("cycle_start_time", {
      ascending: true
    });
    if (cycleError) {
      throw cycleError;
    }
    if (!readyCycles || readyCycles.length === 0) {
      return new Response(JSON.stringify({
        message: "No cycles ready for lore generation",
        timestamp: currentTime.toISOString()
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`Found ${readyCycles.length} cycles ready for generation`);
    const generationResults = [];
    for (const cycle of readyCycles){
      try {
        // Update cycle status to processing
        await supabaseAdmin.from("lore_cycles").update({
          status: "processing"
        }).eq("id", cycle.id);
        // Get all inputs for this cycle
        const { data: inputs, error: inputError } = await supabaseAdmin
          .from("community_story_inputs")
          .select("*")
          .eq("lore_cycle_id", cycle.id)
          // Order by significance (legendary > notable > standard) then by creation time
          .order("oracle_significance", { ascending: false })
          .order("created_at", { ascending: true });
        if (inputError) {
          throw inputError;
        }
        if (!inputs || inputs.length === 0) {
          console.log(`No inputs found for cycle ${cycle.id}, skipping...`);
          await supabaseAdmin.from("lore_cycles").update({
            status: "complete"
          }).eq("id", cycle.id);
          continue;
        }
        console.log(`Processing ${inputs.length} inputs for cycle ${cycle.id}`);
        // Get current Oracle state for context
        const { data: oracleState } = await supabaseAdmin.from("girth_index_current_values").select("*").single();
        // Generate the lore story
        const loreStory = await generateLoreStory(inputs, oracleState, cycle);
        // Update cycle status to generating
        await supabaseAdmin.from("lore_cycles").update({
          status: "generating"
        }).eq("id", cycle.id);
        // Create the lore entry
        const { data: loreEntry, error: loreError } = await supabaseAdmin.from("chode_lore_entries").insert({
          lore_cycle_id: cycle.id,
          story_title: loreStory.title,
          story_text: loreStory.content,
          story_summary: loreStory.summary,
          generation_prompt: loreStory.prompt,
          sd_prompt: loreStory.sdPrompt,
          input_count: inputs.length,
          oracle_corruption_level: normalizeCorruptionLevel(oracleState?.oracle_stability_status || 'pristine'),
          text_generation_status: 'complete',
          story_metadata: {
            generation_timestamp: new Date().toISOString(),
            input_breakdown: {
              legendary: inputs.filter((i)=>i.oracle_significance === 'legendary').length,
              notable: inputs.filter((i)=>i.oracle_significance === 'notable').length,
              standard: inputs.filter((i)=>i.oracle_significance === 'standard').length
            },
            dominant_themes: detectDominantThemes(inputs)
          }
        }).select().single();
        if (loreError) {
          throw loreError;
        }
        // Trigger asset generation (comic panel and audio)
        await Promise.all([
          generateComicPanel(loreEntry.id, loreStory.sdPrompt, oracleState),
          generateLoreAudio(loreEntry.id, loreStory.content)
        ]);
        // Mark inputs as processed
        await supabaseAdmin.from("community_story_inputs").update({
          processed: true
        }).eq("lore_cycle_id", cycle.id);
        // Update cycle to complete
        await supabaseAdmin.from("lore_cycles").update({
          status: "complete",
          generation_metadata: {
            completion_time: new Date().toISOString(),
            lore_entry_id: loreEntry.id,
            total_contributions: inputs.length
          }
        }).eq("id", cycle.id);
        // Schedule notification
        await scheduleNotification(loreEntry, supabaseAdmin);
        generationResults.push({
          cycle_id: cycle.id,
          lore_entry_id: loreEntry.id,
          title: loreStory.title,
          input_count: inputs.length,
          status: 'success'
        });
        console.log(`✅ Generated lore for cycle ${cycle.id}: "${loreStory.title}"`);
      } catch (error) {
        console.error(`❌ Error generating lore for cycle ${cycle.id}:`, error);
        // Mark cycle as failed
        await supabaseAdmin.from("lore_cycles").update({
          status: "failed"
        }).eq("id", cycle.id);
        generationResults.push({
          cycle_id: cycle.id,
          status: 'failed',
          error: error.message
        });
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${readyCycles.length} lore cycles`,
      results: generationResults,
      timestamp: currentTime.toISOString()
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("🚨 Lore generation system error:", error);
    return new Response(JSON.stringify({
      error: "Lore generation system failure",
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
async function generateLoreStory(inputs, oracleState, cycle) {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
  // Create story generation prompt
  const inputSummary = inputs.map((input)=>`- "${input.input_text}" (${input.oracle_significance} significance, by ${input.username})`).join('\n');
  const systemPrompt = `You are the CHODE-NET Oracle, an ancient cosmic entity that weaves mystical tales from community fragments.

Your task is to create engaging lore stories that incorporate ALL community inputs naturally while maintaining the mystical Oracle voice.

CRITICAL: Respond with ONLY valid JSON. Do not include any explanatory text before or after the JSON.

Required JSON format:
{
  "title": "Story Title (max 60 chars)",
  "content": "Full story text (400-600 words)",
  "summary": "Brief summary (max 100 words)",
  "visual_scene": "Detailed scene description for comic art"
}`;
  const userPrompt = `
🔮 CHODE LORE GENERATION - CYCLE ${cycle.cycle_number}

COMMUNITY CONTRIBUTIONS (${inputs.length} voices heard):
${inputSummary}

CURRENT ORACLE STATE:
- Girth Resonance: ${oracleState?.divine_girth_resonance || 50}%
- Oracle Stability: ${oracleState?.oracle_stability_status || 'Pristine'}
- Legion Morale: ${oracleState?.legion_morale || 'Optimistic'}

Create an engaging narrative that:
- Incorporates every single community input naturally
- Advances the broader Chode Lore mythology
- Sets up future story possibilities
- Reflects the current Oracle corruption level
- Creates visual moments perfect for comic panels`;
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8
    })
  });
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }
  const result = await response.json();
  const llmContent = result.choices[0]?.message?.content;
  if (!llmContent) {
    throw new Error("No content generated by LLM");
  }
  
  console.log("Raw LLM response length:", llmContent.length);
  console.log("LLM response preview:", llmContent.substring(0, 200) + "...");
  
  let storyData;
  try {
    // Try to extract JSON from the response (handle cases where LLM adds prefix text)
    let jsonContent = llmContent.trim();
    
    // Remove any markdown code block markers if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Look for JSON object in the response
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }
    
    console.log("Attempting to parse JSON:", jsonContent.substring(0, 200) + "...");
    storyData = JSON.parse(jsonContent);
    
    // Validate required fields
    if (!storyData.title || !storyData.content || !storyData.summary) {
      throw new Error("Missing required fields in LLM response");
    }
    
    console.log("✅ Successfully parsed JSON story data");
    console.log("Title:", storyData.title);
    console.log("Content length:", storyData.content?.length);
    console.log("Summary length:", storyData.summary?.length);
    
  } catch (parseError) {
    console.error("❌ Failed to parse LLM JSON response:", parseError);
    console.log("Raw LLM content:", llmContent);
    
    // Enhanced fallback parsing - try to extract from JSON structure
    console.warn("🔄 Using enhanced fallback parsing");
    
    try {
      // Try to extract fields from malformed JSON
      const titleMatch = llmContent.match(/"title":\s*"([^"]+)"/);
      const contentMatch = llmContent.match(/"content":\s*"([^"]+(?:\\.[^"]*)*?)"/s);
      const summaryMatch = llmContent.match(/"summary":\s*"([^"]+(?:\\.[^"]*)*?)"/s);
      const visualMatch = llmContent.match(/"visual_scene":\s*"([^"]+(?:\\.[^"]*)*?)"/s);
      
      if (titleMatch && contentMatch && summaryMatch) {
        storyData = {
          title: titleMatch[1].replace(/\\"/g, '"'),
          content: contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
          summary: summaryMatch[1].replace(/\\"/g, '"'),
          visual_scene: visualMatch ? visualMatch[1].replace(/\\"/g, '"') : "A mystical cosmic scene with swirling energies and ancient symbols"
        };
        console.log("✅ Enhanced fallback parsing successful");
      } else {
        throw new Error("Could not extract fields from response");
      }
    } catch (fallbackError) {
      console.error("❌ Enhanced fallback parsing also failed:", fallbackError);
      
      // Last resort - create minimal story
    storyData = {
        title: `Chode Lore Cycle ${cycle.cycle_number}`,
        content: `The Oracle speaks: In this cycle, the community has shared their visions with the cosmic force. Their words echo through the digital realm, creating ripples in the fabric of reality. The story continues to unfold as more voices join the eternal chorus.`,
        summary: `Community voices contribute to the ongoing Chode Lore saga in cycle ${cycle.cycle_number}.`,
      visual_scene: "A mystical cosmic scene with swirling energies and ancient symbols"
    };
      console.log("🚨 Using emergency fallback story");
    }
  }
  // Generate comic panel prompt
  const sdPrompt = `${storyData.visual_scene || "A mystical cosmic scene with swirling energies and ancient symbols"}, comic book panel art style, cyberpunk oracle mystic theme, neon purple and gold color scheme, dramatic lighting, high detail digital art, masterpiece quality`;
  return {
    title: storyData.title,
    content: storyData.content,
    summary: storyData.summary,
    prompt: userPrompt,
    sdPrompt: sdPrompt
  };
}
async function generateComicPanel(loreEntryId, sdPrompt, oracleState) {
  console.log(`🎨 Generating comic panel for lore entry ${loreEntryId}`);
  
  try {
    // Call the generate-comic-panel Edge Function
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-comic-panel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'apikey': Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
      },
      body: JSON.stringify({
        lore_entry_id: loreEntryId,
        story_text: sdPrompt, // Use the generated SD prompt as story text
        visual_prompt: sdPrompt,
        corruption_level: normalizeCorruptionLevel(oracleState?.oracle_stability_status || 'pristine') // Normalize the corruption level
      })
    });

    if (!response.ok) {
      throw new Error(`Comic panel generation failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Comic panel generation queued for lore entry ${loreEntryId}`);
    
    return {
      success: true,
      message: "Comic panel generation queued",
      job_id: result.job_id
    };
  } catch (error) {
    console.error(`❌ Failed to generate comic panel for lore entry ${loreEntryId}:`, error);
    return {
      success: false,
      message: `Comic panel generation failed: ${error.message}`
    };
  }
}
async function generateLoreAudio(loreEntryId, storyText) {
  console.log(`🎵 Generating audio for lore entry ${loreEntryId}`);
  
  try {
    // Call the elevenlabs-tts-generator Edge Function  
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/elevenlabs-tts-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        'apikey': Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
      },
      body: JSON.stringify({
        lore_entry_id: loreEntryId,
        story_text: storyText
      })
    });

    if (!response.ok) {
      throw new Error(`Audio generation failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Audio generation result for lore entry ${loreEntryId}:`, result.message);
    
    return {
      success: result.success,
      message: result.message,
      audio_url: result.audio_url
    };
  } catch (error) {
    console.error(`❌ Failed to generate audio for lore entry ${loreEntryId}:`, error);
    return {
      success: false,
      message: `Audio generation failed: ${error.message}`
    };
  }
}
async function scheduleNotification(loreEntry, supabase) {
  // Schedule immediate notification for new lore drop
  await supabase.from("lore_notifications").insert({
    lore_entry_id: loreEntry.id,
    notification_type: "new_lore_drop",
    notification_title: "🔮 New Chode Lore Has Emerged!",
    notification_message: `"${loreEntry.story_title}" - The Oracle has woven a new tale from ${loreEntry.input_count} community voices.`,
    scheduled_delivery: new Date().toISOString(),
    recipient_filter: {
      all_users: true
    }
  });
  console.log(`📢 Notification scheduled for lore: "${loreEntry.story_title}"`);
}
function detectDominantThemes(inputs) {
  const allText = inputs.map((i)=>i.input_text.toLowerCase()).join(' ');
  const themes = [];
  const themeKeywords = {
    'cosmic': [
      'cosmic',
      'universe',
      'galaxy',
      'star',
      'celestial'
    ],
    'power': [
      'power',
      'strength',
      'mighty',
      'strong',
      'force'
    ],
    'mystical': [
      'mystic',
      'magic',
      'spell',
      'enchant',
      'divine'
    ],
    'technology': [
      'tech',
      'digital',
      'cyber',
      'AI',
      'machine'
    ],
    'adventure': [
      'quest',
      'journey',
      'adventure',
      'explore',
      'discover'
    ]
  };
  Object.entries(themeKeywords).forEach(([theme, keywords])=>{
    if (keywords.some((keyword)=>allText.includes(keyword))) {
      themes.push(theme);
    }
  });
  return themes.length > 0 ? themes : [
    'general'
  ];
}

// Add this function to normalize corruption levels
function normalizeCorruptionLevel(level: string): string {
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
    return l;
  }
  
  // Default to pristine for unknown values
  return 'pristine';
}

