import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const GIRTH_EXCHANGE_RATE = 0.000075;
// Inline CORS headers to avoid cross-folder import issues in deployment bundle
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const { anonymous_session_id, wallet_address } = await req.json();
    if (!anonymous_session_id || !wallet_address) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: anonymous_session_id and wallet_address'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`🔄 [MIGRATE] Received state migration request for session: ${anonymous_session_id} to wallet: ${wallet_address}`);
    // Step 1: Get the authenticated user's profile
    const { data: userProfile, error: profileError } = await supabaseAdmin.from('user_profiles').select('id').eq('wallet_address', wallet_address).single();
    if (profileError || !userProfile) {
      console.error(`❌ [MIGRATE] Could not find user profile for wallet: ${wallet_address}`, profileError);
      return new Response(JSON.stringify({
        error: 'Authenticated user profile not found.'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`✅ [MIGRATE] Found user profile ID: ${userProfile.id}`);
    // Step 2: Find the anonymous player state
    const { data: anonymousState, error: stateError } = await supabaseAdmin.from('player_states').select('*').eq('session_id', anonymous_session_id).eq('is_anonymous', true).single();
    if (stateError) {
      // It's possible the state was already claimed or never existed.
      if (stateError.code === 'PGRST116') {
        console.warn(`⚠️ [MIGRATE] No unclaimed anonymous state found for session: ${anonymous_session_id}`);
        return new Response(JSON.stringify({
          success: true,
          migrated: false,
          message: 'No unclaimed anonymous state found for the given session.'
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.error(`❌ [MIGRATE] Error fetching anonymous state:`, stateError);
      throw new Error('Failed to fetch anonymous player state.');
    }
    if (!anonymousState) {
      console.warn(`⚠️ [MIGRATE] No anonymous state record found for session: ${anonymous_session_id}`);
      return new Response(JSON.stringify({
        success: true,
        migrated: false,
        message: 'No anonymous state record found for the given session.'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`Found anonymous state to migrate with girth: ${anonymousState.current_girth}`);
    // Step 3: Update the player_states record to link it to the authenticated user
    const { error: migrationError } = await supabaseAdmin.from('player_states').update({
      user_profile_id: userProfile.id,
      player_address: wallet_address,
      is_anonymous: false,
      migration_status: 'claimed',
      claimed_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString()
    }).eq('id', anonymousState.id);
    if (migrationError) {
      console.error(`❌ [MIGRATE] Failed to update player_states record:`, migrationError);
      throw new Error('Failed to link anonymous state to user profile.');
    }
    // Step 4: Add the migrated girth to the user's girth_balances
    if (anonymousState.current_girth > 0) {
      const girthToAdd = anonymousState.current_girth * GIRTH_EXCHANGE_RATE;
      console.log(`💰 [MIGRATE] Adding ${girthToAdd.toFixed(6)} soft girth to balance for user ${userProfile.id}`);
      // Fetch the current balance to ensure safe, atomic update
      const { data: balanceRow, error: fetchBalanceError } = await supabaseAdmin.from("girth_balances").select("soft_balance, lifetime_earned").eq("user_profile_id", userProfile.id).single();
      if (fetchBalanceError && fetchBalanceError.code !== 'PGRST116') {
        // Log the error but don't fail the entire migration, as state is already linked
        console.error(`⚠️ [MIGRATE] Could not fetch existing balance for user ${userProfile.id}:`, fetchBalanceError);
      } else {
        const currentSoftBalance = balanceRow?.soft_balance ? parseFloat(balanceRow.soft_balance) : 0;
        const currentLifetimeEarned = balanceRow?.lifetime_earned ? parseFloat(balanceRow.lifetime_earned) : 0;
        const newSoftBalance = currentSoftBalance + girthToAdd;
        const newLifetimeEarned = currentLifetimeEarned + girthToAdd;
        const { error: balanceError } = await supabaseAdmin.from("girth_balances").upsert({
          user_profile_id: userProfile.id,
          soft_balance: newSoftBalance,
          lifetime_earned: newLifetimeEarned,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_profile_id"
        });
        if (balanceError) {
          // This is non-fatal; the state is linked, but balance needs a retry or manual fix.
          console.error(`⚠️ [MIGRATE] Failed to upsert girth balance for user ${userProfile.id}:`, balanceError);
        }
      }
    }
    console.log(`✅ [MIGRATE] Successfully migrated state for wallet ${wallet_address}`);
    const responsePayload = {
      success: true,
      migrated: true,
      message: 'Anonymous state successfully migrated.',
      claimed_girth: anonymousState.current_girth || 0,
      claimed_taps: anonymousState.session_total_taps || 0,
      claimed_mega_slaps: anonymousState.total_mega_slaps || 0,
      claimed_giga_slaps: anonymousState.total_giga_slaps || 0
    };
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ [MIGRATE] Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error during state migration',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
