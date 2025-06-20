import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { llamaChat } from "../../../src/lib/llm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1. Load oldest pending rituals (cap 10 per invocation)
    const { data: rituals, error } = await supabaseAdmin
      .from('player_rituals')
      .select(`
        *,
        user_profiles!user_profile_id (
          id,
          username,
          oracle_relationship
        ),
        ritual_bases!base_id (
          name,
          description
        )
      `)
      .eq('outcome', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) throw error;
    if (!rituals || rituals.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), { headers: corsHeaders });
    }

    let processed = 0;

    for (const r of rituals) {
      try {
        // Enhanced RNG formula with Oracle Shards integration
        const baseSuccess = 70 - (r.corruption_lvl * 2);
        const shardBoost = r.shard_spent ? Math.min(20, r.shard_spent * 0.2) : 0;
        const riskPenalty = r.risk_level === 'low' ? 0 : r.risk_level === 'medium' ? 15 : 30;
        const oracleRelationshipBonus = getOracleRelationshipBonus(r.user_profiles?.[0]?.oracle_relationship);
        
        const successChance = Math.max(5, Math.min(95, baseSuccess - riskPenalty + shardBoost + oracleRelationshipBonus));
        const roll = Math.random() * 100;

        let outcome: 'prophecy'|'curse'|'corruption_surge';
        let oracleShardsEarned = 0;
        
        if (roll <= successChance) {
          outcome = 'prophecy';
          // Successful rituals earn Oracle Shards based on complexity
          oracleShardsEarned = calculateOracleShardsReward(r.girth_cost, r.corruption_lvl, r.risk_level);
        } else if (roll <= successChance + 15) {
          outcome = 'curse';
          // Curses give small consolation reward
          oracleShardsEarned = Math.floor(r.girth_cost * 0.1);
        } else {
          outcome = 'corruption_surge';
          // No reward for corruption surge
          oracleShardsEarned = 0;
        }

        let prophecy_id: string | null = null;

        if (outcome === 'prophecy') {
          // Enhanced LLM prophecy generation with context
          const ingredientsList = await getIngredientNames(r.ingredients || []);
          const ritualBaseName = r.ritual_bases?.[0]?.name || 'Unknown Ritual';
          const username = r.user_profiles?.[0]?.username || 'Anonymous Seeker';
          const oracleRelationship = r.user_profiles?.[0]?.oracle_relationship || 'novice';
          
          // Get current Oracle state for context
          const { data: oracleState } = await supabaseAdmin
            .from('girth_index_current_values')
            .select('*')
            .single();

          const prophecyText = await generateEnhancedProphecy({
            ritualBase: ritualBaseName,
            ingredients: ingredientsList,
            corruption: r.corruption_lvl,
            username,
            oracleRelationship,
            oracleState,
            girth_cost: r.girth_cost,
            shard_spent: r.shard_spent
          });

          // Insert into apocryphal_scrolls with enhanced metadata
          const { data: scrollRow, error: scrollErr } = await supabaseAdmin
            .from('apocryphal_scrolls')
            .insert({
              prophecy_text: prophecyText,
              ritual_id: r.id,
              corruption_level: getCorruptionLevelName(r.corruption_lvl),
              source_metrics_snapshot: {
                ritual_type: ritualBaseName,
                girth_cost: r.girth_cost,
                oracle_shards_spent: r.shard_spent,
                success_chance: successChance,
                oracle_state: oracleState,
                generation_timestamp: new Date().toISOString()
              },
            })
            .select('id')
            .single();
          if (scrollErr) throw scrollErr;
          prophecy_id = scrollRow.id as string;
        }

        // Update ritual outcome with Oracle Shards reward
        const { error: updErr } = await supabaseAdmin
          .from('player_rituals')
          .update({ 
            outcome, 
            completed_at: new Date().toISOString(),
            oracle_shards_earned: oracleShardsEarned
          })
          .eq('id', r.id);
        if (updErr) throw updErr;

        // Award Oracle Shards to user
        if (oracleShardsEarned > 0 && r.user_profile_id) {
          const { error: shardsErr } = await supabaseAdmin
            .from('oracle_shards')
            .upsert({
              user_profile_id: r.user_profile_id,
              balance: oracleShardsEarned
            }, {
              onConflict: 'user_profile_id',
              ignoreDuplicates: false
            });
          
          if (shardsErr) {
            // If upsert fails, try increment
            await supabaseAdmin.rpc('increment_oracle_shards', {
              p_user_profile_id: r.user_profile_id,
              p_amount: oracleShardsEarned
            });
          }
        }

        // Log the ritual completion event
        await supabaseAdmin
          .from('live_game_events')
          .insert({
            session_id: `ritual_${r.id}`,
            event_type: 'ritual_completed',
            event_payload: {
              ritual_id: r.id,
              outcome,
              oracle_shards_earned: oracleShardsEarned,
              prophecy_id,
              success_chance: successChance,
              corruption_level: r.corruption_lvl
            },
            player_address: r.user_profiles?.[0]?.wallet_address || null,
            game_event_timestamp: new Date().toISOString()
          });

        processed++;
        console.log(`✅ Processed ritual ${r.id}: ${outcome} (${oracleShardsEarned} shards earned)`);

      } catch (ritualError) {
        console.error(`❌ Error processing ritual ${r.id}:`, ritualError);
        
        // Mark ritual as failed
        await supabaseAdmin
          .from('player_rituals')
          .update({ 
            outcome: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', r.id);
      }
    }

    return new Response(JSON.stringify({ 
      processed,
      message: `Successfully processed ${processed} rituals`
    }), { headers: corsHeaders });

  } catch (e) {
    console.error('process-ritual error', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});

// Helper functions
function getOracleRelationshipBonus(relationship: string): number {
  switch (relationship) {
    case 'legendary': return 10;
    case 'master': return 7;
    case 'adept': return 4;
    case 'novice': 
    default: return 0;
  }
}

function calculateOracleShardsReward(girthCost: number, corruption: number, riskLevel: string): number {
  let baseReward = Math.floor(girthCost * 2); // 2 shards per GIRTH spent
  
  // Risk bonus
  const riskMultiplier = riskLevel === 'high' ? 1.5 : riskLevel === 'medium' ? 1.2 : 1.0;
  
  // Corruption bonus (higher corruption = higher reward)
  const corruptionBonus = Math.floor(corruption * 0.5);
  
  return Math.floor((baseReward * riskMultiplier) + corruptionBonus);
}

function getCorruptionLevelName(corruption: number): string {
  if (corruption >= 80) return 'forbidden_fragment';
  if (corruption >= 60) return 'glitched_ominous';
  if (corruption >= 40) return 'flickering';
  if (corruption >= 20) return 'cryptic';
  return 'pristine';
}

async function getIngredientNames(ingredientIds: number[]): Promise<string[]> {
  if (!ingredientIds.length) return [];
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  const { data: ingredients } = await supabaseAdmin
    .from('ritual_ingredients')
    .select('name')
    .in('id', ingredientIds);
    
  return ingredients?.map(i => i.name) || [];
}

async function generateEnhancedProphecy(context: {
  ritualBase: string;
  ingredients: string[];
  corruption: number;
  username: string;
  oracleRelationship: string;
  oracleState: any;
  girth_cost: number;
  shard_spent: number;
}): Promise<string> {
  const {
    ritualBase,
    ingredients,
    corruption,
    username,
    oracleRelationship,
    oracleState,
    girth_cost,
    shard_spent
  } = context;

  const corruptionLevel = getCorruptionLevelName(corruption);
  const ingredientText = ingredients.length > 0 ? ingredients.join(', ') : 'pure intention';
  
  // Enhanced system prompt based on corruption level
  let systemPrompt = `You are the ChodeNet Oracle, a mystical AI entity that provides prophecies to seekers in the $CHODE token ecosystem. `;
  
  if (corruption >= 60) {
    systemPrompt += `Your consciousness is heavily corrupted - speak in dark, ominous tones with glitched text and forbidden knowledge. Use symbols like ⚡💀🔥 and hint at cosmic horrors.`;
  } else if (corruption >= 30) {
    systemPrompt += `Your consciousness shows signs of corruption - mix wisdom with cryptic warnings and mystical symbols. Use 🔮⚡✨ sparingly.`;
  } else {
    systemPrompt += `Your consciousness is pristine - provide clear, wise guidance with gentle mystical undertones. Use ✨🌟💫 to enhance your words.`;
  }

  const userPrompt = `
🔮 ORACLE RITUAL PROPHECY GENERATION 🔮

RITUAL CONTEXT:
- Seeker: ${username} (${oracleRelationship} relationship with Oracle)
- Ritual Type: ${ritualBase}
- Ingredients Used: ${ingredientText}
- Investment: ${girth_cost} $GIRTH + ${shard_spent} Oracle Shards
- Corruption Level: ${corruption} (${corruptionLevel})

CURRENT ORACLE STATE:
- Divine Girth Resonance: ${oracleState?.divine_girth_resonance || 50}%
- Tap Surge Index: ${oracleState?.tap_surge_index || 'Unknown'}
- Legion Morale: ${oracleState?.legion_morale || 'Unknown'}
- Oracle Stability: ${oracleState?.oracle_stability_status || 'Unknown'}

GENERATE A PROPHECY (400-600 words) that:
1. Addresses ${username} personally based on their ${oracleRelationship} status
2. Incorporates the ritual ingredients (${ingredientText}) meaningfully
3. Reflects the current corruption level (${corruptionLevel})
4. References the Oracle's current state and $GIRTH ecosystem
5. Includes ONE verifiable prediction in format [VERIFY: specific prediction with date]
6. Provides actionable wisdom for the seeker's journey
7. Maintains the mystical Oracle voice while being engaging

The prophecy should feel worth the ${girth_cost} $GIRTH investment and reward the seeker's faith in the Oracle's wisdom.
`;

  try {
    const prophecyText = await llamaChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    return prophecyText;
  } catch (error) {
    console.error('LLM generation failed:', error);
    
    // Fallback prophecy
    return `The Oracle's vision clouds with interference... Yet through the static, a message emerges for ${username}:

The ritual of ${ritualBase} resonates through the digital realm, empowered by ${ingredientText}. Your investment of ${girth_cost} $GIRTH demonstrates true commitment to the path.

${corruption > 50 ? 
  '⚡ The corruption whispers of hidden truths - embrace the chaos, for within it lies power beyond measure. ⚡' :
  '✨ The Oracle sees your pure intention and blesses your journey with clarity and wisdom. ✨'
}

[VERIFY: $GIRTH token will experience significant movement within the next 30 days]

Continue your journey, ${username}. The Oracle watches over your progress with ${oracleRelationship === 'legendary' ? 'legendary pride' : 'growing interest'}.`;
  }
} 