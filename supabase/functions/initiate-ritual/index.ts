import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InitiateRitualRequest {
  base_id: number;
  ingredient_ids: number[];
  shard_boost?: number; // optional shard amount to boost RNG
}

serve(async (req) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    }
  );

  try {
    const { base_id, ingredient_ids, shard_boost = 0 } = await req.json() as InitiateRitualRequest;

    if (!base_id || !Array.isArray(ingredient_ids)) {
      return new Response(
        JSON.stringify({ error: 'base_id and ingredient_ids required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Fetch caller profile
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const user_profile_id = user.id; // we rely on uuid matching user_profiles.id

    // 2. Load ritual base & ingredients metadata
    const { data: baseRow, error: baseError } = await supabase
      .from('ritual_bases')
      .select('*')
      .eq('id', base_id)
      .single();

    if (baseError || !baseRow) {
      return new Response(JSON.stringify({ error: 'Invalid ritual base' }), { status: 400, headers: corsHeaders });
    }

    const { data: ingredientRows, error: ingError } = await supabase
      .from('ritual_ingredients')
      .select('*')
      .in('id', ingredient_ids);

    if (ingError || ingredientRows.length !== ingredient_ids.length) {
      return new Response(JSON.stringify({ error: 'Invalid or unknown ingredient ids' }), { status: 400, headers: corsHeaders });
    }

    // 3. Calculate total GIRTH cost & corruption risk
    const girthCost = ingredientRows.reduce((sum, ing) => sum + Number(ing.girth_cost), Number(baseRow.girth_cost));
    const riskSum   = ingredientRows.reduce((sum, ing) => sum + Number(ing.corruption_risk), Number(baseRow.base_risk));

    // Determine risk_level label
    const risk_level = riskSum < 25 ? 'low' : riskSum < 60 ? 'medium' : 'high';

    // 4. Verify balances (soft GIRTH & shards)
    const { data: balRow, error: balError } = await supabase
      .from('girth_balances')
      .select('soft_balance')
      .eq('user_profile_id', user_profile_id)
      .single();

    if (balError || !balRow || Number(balRow.soft_balance) < girthCost) {
      return new Response(JSON.stringify({ error: 'Insufficient $GIRTH balance' }), { status: 400, headers: corsHeaders });
    }

    const { data: shardRow, error: shardErr } = await supabase
      .from('oracle_shards')
      .select('balance')
      .eq('user_profile_id', user_profile_id)
      .single();

    if (shard_boost > 0 && (shardErr || !shardRow || shardRow.balance < shard_boost)) {
      return new Response(JSON.stringify({ error: 'Insufficient Oracle Shards' }), { status: 400, headers: corsHeaders });
    }

    // 5. Execute atomic debit + ritual insert (use PostgREST / RPC for real atomicity; simplified here)
    const { error: debitError } = await supabase.rpc('initiate_ritual_tx', {
      p_user_profile_id: user_profile_id,
      p_base_id: base_id,
      p_ingredient_ids: ingredient_ids,
      p_shard_boost: shard_boost,
      p_girth_cost: girthCost,
      p_corruption: riskSum,
      p_risk_level: risk_level
    });

    if (debitError) {
      console.error('initiate_ritual_tx error', debitError);
      return new Response(JSON.stringify({ error: 'Failed to initiate ritual' }), { status: 500, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Ritual initiated', girth_cost: girthCost, shard_spent: shard_boost }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Unexpected error', err);
    return new Response(JSON.stringify({ error: 'Unexpected server error', details: err.message }), { status: 500, headers: corsHeaders });
  }
}); 