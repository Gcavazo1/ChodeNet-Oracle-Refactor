import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: {
      headers: {
        Authorization: req.headers.get('Authorization')
      }
    }
  });
  try {
    const { base_id, ingredient_ids = [], shard_boost = 0 } = await req.json();
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Authentication required'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }
    // Get user profile
    const { data: profile } = await supabase.from('user_profiles').select('id').eq('wallet_address', user.id).single();
    if (!profile) {
      return new Response(JSON.stringify({
        error: 'User profile not found'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    // Get ritual base
    const { data: ritualBase } = await supabase.from('ritual_bases').select('*').eq('id', base_id).single();
    if (!ritualBase) {
      return new Response(JSON.stringify({
        error: 'Ritual base not found'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    // Get ingredients
    const { data: ingredients } = await supabase.from('ritual_ingredients').select('*').in('id', ingredient_ids);
    // Calculate costs and modifiers
    let totalCost = ritualBase.base_girth_cost;
    let corruption = ritualBase.base_corruption;
    let successRate = ritualBase.base_success_rate;
    (ingredients || []).forEach((ingredient)=>{
      totalCost *= ingredient.cost_modifier;
      corruption += ingredient.corruption_modifier;
      successRate += ingredient.success_modifier;
    });
    // Shard boost increases success rate
    successRate += shard_boost * 2;
    successRate = Math.min(95, Math.max(5, successRate));
    // Determine risk level
    let riskLevel = 'low';
    if (corruption >= 50) riskLevel = 'extreme';
    else if (corruption >= 30) riskLevel = 'high';
    else if (corruption >= 15) riskLevel = 'moderate';
    // Check balances and initiate ritual
    const { data: girthBalance } = await supabase.from('girth_balances').select('soft_balance').eq('user_profile_id', profile.id).single();
    if (!girthBalance || girthBalance.soft_balance < totalCost) {
      return new Response(JSON.stringify({
        error: 'Insufficient $GIRTH balance'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    if (shard_boost > 0) {
      const { data: shardBalance } = await supabase.from('oracle_shards').select('balance').eq('user_profile_id', profile.id).single();
      if (!shardBalance || shardBalance.balance < shard_boost) {
        return new Response(JSON.stringify({
          error: 'Insufficient Oracle Shards'
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
    }
    // Call atomic transaction function
    const { data: ritualId, error: txError } = await supabase.rpc('initiate_ritual_tx', {
      p_user_profile_id: profile.id,
      p_base_id: base_id,
      p_ingredient_ids: ingredient_ids,
      p_shard_boost: shard_boost,
      p_girth_cost: totalCost,
      p_corruption: corruption,
      p_risk_level: riskLevel
    });
    if (txError) {
      return new Response(JSON.stringify({
        error: txError.message
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    return new Response(JSON.stringify({
      success: true,
      ritual_id: ritualId,
      total_cost: totalCost,
      success_rate: successRate,
      corruption_level: corruption,
      risk_level: riskLevel,
      shard_cost: shard_boost
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Ritual initiation error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
