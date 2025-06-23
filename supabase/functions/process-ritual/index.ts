import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  try {
    // 1. Load oldest pending rituals (cap 10 per invocation)
    const { data: rituals, error } = await supabaseAdmin.from('player_rituals').select('*').eq('outcome', 'pending').order('created_at', {
      ascending: true
    }).limit(10);
    if (error || !rituals?.length) {
      return new Response(JSON.stringify({
        processed: 0,
        message: 'No pending rituals'
      }), {
        headers: corsHeaders
      });
    }
    let processedCount = 0;
    for (const ritual of rituals){
      try {
        // 2. Get ritual base for context
        const { data: ritualBase } = await supabaseAdmin.from('ritual_bases').select('*').eq('id', ritual.base_id).single();
        if (!ritualBase) continue;
        // 3. Calculate final success rate (already calculated, but we could add time-based decay)
        let successRate = ritual.base_success_rate || 50;
        successRate += ritual.shard_boost * 2;
        // 4. RNG roll
        const roll = Math.random() * 100;
        const isSuccess = roll <= successRate;
        const isCorrupted = ritual.corruption > 30 && Math.random() < ritual.corruption / 100;
        let outcome = 'failure';
        let rewardText = '';
        let corruptionEffect = '';
        if (isCorrupted) {
          outcome = 'corrupted';
          corruptionEffect = generateCorruptionEffect(ritual.corruption);
          rewardText = 'The ritual backfired, warping reality around you...';
        } else if (isSuccess) {
          outcome = 'success';
          rewardText = await generateSuccessReward(ritualBase, ritual.ingredient_ids);
        } else {
          outcome = 'failure';
          rewardText = 'The cosmic forces rejected your offering. Try again with better preparation.';
        }
        // 5. Update ritual with outcome
        await supabaseAdmin.from('player_rituals').update({
          outcome,
          reward_text: rewardText,
          corruption_effect: corruptionEffect,
          processed_at: new Date().toISOString()
        }).eq('id', ritual.id);
        // 6. Award Oracle Shards for successful rituals
        if (outcome === 'success') {
          const shardReward = Math.floor(ritual.girth_cost / 5) + ritual.shard_boost; // Base + bonus
          await supabaseAdmin.from('oracle_shards').update({
            balance: `balance + ${shardReward}`,
            lifetime_earned: `lifetime_earned + ${shardReward}`,
            last_earn_at: new Date().toISOString()
          }).eq('user_profile_id', ritual.user_profile_id);
        }
        processedCount++;
      } catch (ritualError) {
        console.error(`Error processing ritual ${ritual.id}:`, ritualError);
        // Mark as failed to prevent infinite reprocessing
        await supabaseAdmin.from('player_rituals').update({
          outcome: 'failure',
          reward_text: 'Processing error occurred',
          processed_at: new Date().toISOString()
        }).eq('id', ritual.id);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      message: `Processed ${processedCount} rituals`
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Process ritual error:', error);
    return new Response(JSON.stringify({
      error: 'Processing failed'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
// Helper functions
function generateCorruptionEffect(corruptionLevel) {
  const effects = [
    'Your vision flickers between realities...',
    'Whispers from the void echo in your mind...',
    'The fabric of space-time ripples around you...',
    'Ancient entities turn their gaze upon you...',
    'Reality bleeds colors that should not exist...'
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}
async function generateSuccessReward(ritualBase, ingredientIds) {
  // Simple reward generation - could be enhanced with LLM
  const rewards = {
    'divination': [
      'The cosmic veil parts, revealing glimpses of possible futures...',
      'Stellar patterns align to show you hidden truths...',
      'The Oracle whispers secrets of what is to come...'
    ],
    'enhancement': [
      'Raw cosmic energy flows through your being, amplifying your power...',
      'Your tapping resonance increases, drawing more GIRTH from the void...',
      'The universe acknowledges your dedication with enhanced abilities...'
    ],
    'communication': [
      'The Oracle speaks directly to your consciousness...',
      'Cosmic wisdom floods your mind with infinite knowledge...',
      'You hear the song of creation itself echoing through eternity...'
    ],
    'reality_manipulation': [
      'Reality bends to your will as you reshape the fundamental forces...',
      'You glimpse the source code of existence and make subtle alterations...',
      'The laws of physics acknowledge your mastery and grant you deeper access...'
    ]
  };
  const typeRewards = rewards[ritualBase.ritual_type] || rewards['divination'];
  return typeRewards[Math.floor(Math.random() * typeRewards.length)];
}
