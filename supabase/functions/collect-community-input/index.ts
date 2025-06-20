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
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    const { input_text, player_address, username } = await req.json();
    // Validate input
    if (!input_text || input_text.length > 200) {
      return new Response(JSON.stringify({
        error: "Input text required and must be 200 characters or less"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    if (!player_address) {
      return new Response(JSON.stringify({
        error: "Player address required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Get or create current lore cycle
    const currentTime = new Date();
    const cycleStartTime = new Date(currentTime);
    cycleStartTime.setHours(Math.floor(currentTime.getHours() / 4) * 4, 0, 0, 0);
    const cycleEndTime = new Date(cycleStartTime.getTime() + 4 * 60 * 60 * 1000);
    let { data: currentCycle, error: cycleError } = await supabaseAdmin.from("lore_cycles").select("*").eq("cycle_start_time", cycleStartTime.toISOString()).single();
    if (cycleError && cycleError.code === 'PGRST116') {
      // Create new cycle
      const cycleNumber = Math.floor(Date.now() / (4 * 60 * 60 * 1000));
      const { data: newCycle, error: createError } = await supabaseAdmin.from("lore_cycles").insert({
        cycle_number: cycleNumber,
        cycle_start_time: cycleStartTime.toISOString(),
        cycle_end_time: cycleEndTime.toISOString(),
        status: 'collecting'
      }).select().single();
      if (createError) {
        throw createError;
      }
      currentCycle = newCycle;
    } else if (cycleError) {
      throw cycleError;
    }
    // Check if user already submitted for this cycle
    const { data: existingInput } = await supabaseAdmin.from("community_story_inputs").select("id").eq("player_address", player_address).eq("lore_cycle_id", currentCycle.id).single();
    if (existingInput) {
      return new Response(JSON.stringify({
        error: "You have already submitted input for this lore cycle",
        next_cycle_starts: cycleEndTime.toISOString()
      }), {
        status: 409,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Calculate oracle significance
    const oracleSignificance = calculateOracleSignificance(input_text);
    // Insert the community input
    const { data: newInput, error: insertError } = await supabaseAdmin.from("community_story_inputs").insert({
      input_text,
      player_address,
      username: username || `Seeker${player_address.substring(0, 6)}`,
      lore_cycle_id: currentCycle.id,
      oracle_significance: oracleSignificance,
      input_metadata: {
        submission_hour: currentTime.getHours(),
        character_count: input_text.length,
        contains_mystical_terms: containsMysticalTerms(input_text)
      }
    }).select().single();
    if (insertError) {
      throw insertError;
    }
    // Update cycle input count
    await supabaseAdmin.from("lore_cycles").update({
      total_inputs: currentCycle.total_inputs + 1
    }).eq("id", currentCycle.id);
    // Log Oracle event
    await supabaseAdmin.from("live_game_events").insert({
      session_id: `lore_system_${Date.now()}`,
      event_type: "community_lore_input_submitted",
      event_payload: {
        lore_cycle_id: currentCycle.id,
        input_significance: oracleSignificance,
        character_count: input_text.length,
        cycle_end_time: cycleEndTime.toISOString()
      },
      player_address,
      game_event_timestamp: new Date().toISOString()
    });
    // 🚀 Reward player with soft $GIRTH for contributing
    const SOFT_GIRTH_REWARD = 1; // 1 GIRTH per entry
    let newSoftBalance = 0;

    // Determine if the player is authenticated (has a user_profile)
    const { data: profileRow } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('wallet_address', player_address)
      .single();

    if (profileRow) {
      // Authenticated user – increment girth_balances.soft_balance
      const { data: balanceRow } = await supabaseAdmin
        .from('girth_balances')
        .select('soft_balance')
        .eq('user_profile_id', profileRow.id)
        .single();

      if (balanceRow) {
        newSoftBalance = parseFloat(balanceRow.soft_balance) + SOFT_GIRTH_REWARD;
        await supabaseAdmin
          .from('girth_balances')
          .update({ soft_balance: newSoftBalance })
          .eq('user_profile_id', profileRow.id);
      } else {
        newSoftBalance = SOFT_GIRTH_REWARD;
        await supabaseAdmin
          .from('girth_balances')
          .insert({ user_profile_id: profileRow.id, soft_balance: newSoftBalance });
      }
    } else {
      // Anonymous – store pending reward in player_states
      await supabaseAdmin.rpc('increment_pending_soft_reward', {
        p_player_address: player_address,
        p_delta: SOFT_GIRTH_REWARD
      });
    }

    // Broadcast balance update (if authenticated)
    if (profileRow) {
      await supabaseAdmin.from('live_game_events').insert({
        session_id: `lore_reward_${Date.now()}`,
        event_type: 'soft_balance_update',
        event_payload: { soft_balance: newSoftBalance, delta: SOFT_GIRTH_REWARD },
        player_address,
        game_event_timestamp: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Your voice has been heard by the Oracle!",
      input: newInput,
      cycle_info: {
        id: currentCycle.id,
        ends_at: cycleEndTime.toISOString(),
        total_inputs: currentCycle.total_inputs + 1,
        time_remaining_ms: cycleEndTime.getTime() - currentTime.getTime()
      },
      oracle_significance: oracleSignificance
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Community input collection error:", error);
    return new Response(JSON.stringify({
      error: "Failed to collect community input",
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
function calculateOracleSignificance(inputText) {
  const text = inputText.toLowerCase();
  let score = 0;
  // Check for mystical/oracle terms
  const mysticalTerms = [
    'oracle',
    'prophecy',
    'cosmic',
    'divine',
    'girth',
    'ascend',
    'transcend',
    'mystical',
    'ancient',
    'sacred'
  ];
  mysticalTerms.forEach((term)=>{
    if (text.includes(term)) score += 2;
  });
  // Check for creativity indicators
  const creativeTerms = [
    'legend',
    'epic',
    'mighty',
    'powerful',
    'eternal',
    'infinite',
    'realm',
    'dimension'
  ];
  creativeTerms.forEach((term)=>{
    if (text.includes(term)) score += 1;
  });
  // Length bonus for detailed inputs
  if (inputText.length > 150) score += 2;
  if (inputText.length > 100) score += 1;
  if (score >= 6) return 'legendary';
  if (score >= 3) return 'notable';
  return 'standard';
}
function containsMysticalTerms(inputText) {
  const mysticalTerms = [
    'oracle',
    'prophecy',
    'cosmic',
    'divine',
    'girth',
    'mystical',
    'ancient',
    'sacred',
    'transcend',
    'ascend'
  ];
  const text = inputText.toLowerCase();
  return mysticalTerms.some((term)=>text.includes(term));
}
