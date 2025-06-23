import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Use service role key to bypass RLS for system operations
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { session_id, player_address, action, player_state } = await req.json();
    console.log(`🔧 [STATE-MANAGER] ${action.toUpperCase()} request for session: ${session_id}, player: ${player_address || 'anonymous'}`);
    // Create player identifier (prioritize wallet address, fallback to session)
    const player_identifier = player_address || session_id;
    const is_anonymous = !player_address;
    if (action === 'save') {
      if (!player_state) {
        return new Response(JSON.stringify({
          error: 'Player state required for save operation'
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.log(`💾 [STATE-MANAGER] Saving state for ${is_anonymous ? 'anonymous' : 'wallet'} player: ${player_identifier}`);
      console.log(`💾 [STATE-MANAGER] State data: Girth=${player_state.current_girth}, MegaSlaps=${player_state.total_mega_slaps}, GigaSlaps=${player_state.total_giga_slaps}`);
      // Upsert player state
      const { error: saveError } = await supabase.from('player_states').upsert({
        player_identifier,
        session_id,
        player_address: player_address || null,
        is_anonymous,
        current_girth: player_state.current_girth,
        total_mega_slaps: player_state.total_mega_slaps,
        total_giga_slaps: player_state.total_giga_slaps,
        current_giga_slap_streak: player_state.current_giga_slap_streak,
        iron_grip_lvl1_purchased: player_state.iron_grip_lvl1_purchased,
        session_start_time: player_state.session_start_time,
        session_total_taps: player_state.session_total_taps,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'player_identifier'
      });
      if (saveError) {
        console.error(`❌ [STATE-MANAGER] Save error:`, saveError);
        return new Response(JSON.stringify({
          error: 'Failed to save player state',
          details: saveError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.log(`✅ [STATE-MANAGER] State saved successfully for ${player_identifier}`);
      // 💰 SOFT BALANCE UPDATE: For authenticated users, update girth_balances table
      let soft_balance_updated = false;
      if (!is_anonymous && player_state.soft_girth_balance !== undefined) {
        try {
          console.log(`🔍 [STATE-MANAGER] Looking up user profile for wallet: ${player_address}`);
          // Get user profile ID
          const { data: profile, error: profileError } = await supabase.from('user_profiles').select('id').eq('wallet_address', player_address).single();
          if (profile && !profileError) {
            console.log(`✅ [STATE-MANAGER] Found user profile: ${profile.id}`);
            // Update girth_balances table
            const { error: balanceError } = await supabase.from('girth_balances').upsert({
              user_profile_id: profile.id,
              soft_balance: player_state.soft_girth_balance,
              lifetime_earned: player_state.lifetime_girth_earned || player_state.soft_girth_balance,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_profile_id'
            });
            if (!balanceError) {
              soft_balance_updated = true;
              console.log(`💰 [STATE-MANAGER] Soft balance updated: ${player_state.soft_girth_balance} $GIRTH for ${player_address}`);
            } else {
              console.error(`❌ [STATE-MANAGER] Soft balance update failed:`, balanceError);
            }
          } else {
            console.warn(`⚠️ [STATE-MANAGER] No user profile found for ${player_address} - creating one now`);
            // Create user profile if it doesn't exist
            const { data: newProfile, error: createProfileError } = await supabase.from('user_profiles').insert({
              wallet_address: player_address,
              last_login_at: new Date().toISOString(),
              total_sessions: 1,
              oracle_relationship: 'novice',
              profile_completion: 20 // Base completion for wallet connection
            }).select().single();
            if (createProfileError) {
              console.error(`❌ [STATE-MANAGER] Failed to create user profile:`, createProfileError);
            } else if (newProfile) {
              console.log(`✅ [STATE-MANAGER] Created new user profile: ${newProfile.id}`);
              // Initialize girth balance for new user
              const { error: balanceError } = await supabase.from('girth_balances').insert({
                user_profile_id: newProfile.id,
                soft_balance: player_state.soft_girth_balance,
                hard_balance: 0.0,
                lifetime_earned: player_state.lifetime_girth_earned || player_state.soft_girth_balance,
                lifetime_minted: 0.0,
                updated_at: new Date().toISOString()
              });
              if (!balanceError) {
                soft_balance_updated = true;
                console.log(`💰 [STATE-MANAGER] Initialized girth balance: ${player_state.soft_girth_balance} $GIRTH for ${player_address}`);
              } else {
                console.error(`❌ [STATE-MANAGER] Failed to initialize girth balance:`, balanceError);
              }
              // Initialize oracle shards for new user
              const { error: shardsError } = await supabase.from('oracle_shards').insert({
                user_profile_id: newProfile.id,
                balance: 0,
                lifetime_earned: 0
              });
              if (shardsError) {
                console.error(`❌ [STATE-MANAGER] Failed to initialize oracle shards:`, shardsError);
              } else {
                console.log(`🔷 [STATE-MANAGER] Initialized oracle shards for user: ${newProfile.id}`);
              }
            }
          }
        } catch (balanceErr) {
          console.error(`❌ [STATE-MANAGER] Soft balance update error:`, balanceErr);
        }
      }
      return new Response(JSON.stringify({
        success: true,
        message: 'Player state saved successfully',
        player_identifier,
        is_anonymous,
        saved_at: new Date().toISOString(),
        soft_balance_updated
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else if (action === 'load') {
      console.log(`📖 [STATE-MANAGER] Loading state for ${is_anonymous ? 'anonymous' : 'wallet'} player: ${player_identifier}`);
      // Try to load existing state
      const { data: loadResult, error: loadError } = await supabase.from('player_states').select('*').eq('player_identifier', player_identifier).single();
      if (loadError && loadError.code !== 'PGRST116') {
        console.error(`❌ [STATE-MANAGER] Load error:`, loadError);
        return new Response(JSON.stringify({
          error: 'Failed to load player state',
          details: loadError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      if (!loadResult) {
        console.log(`ℹ️ [STATE-MANAGER] No saved state found for ${player_identifier} - will start fresh`);
        return new Response(JSON.stringify({
          state_found: false,
          message: 'No saved state found - starting fresh session',
          player_identifier,
          is_anonymous
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      console.log(`✅ [STATE-MANAGER] State loaded for ${player_identifier}: Girth=${loadResult.current_girth}, MegaSlaps=${loadResult.total_mega_slaps}`);
      return new Response(JSON.stringify({
        state_found: true,
        player_state: {
          current_girth: loadResult.current_girth || 0,
          total_mega_slaps: loadResult.total_mega_slaps || 0,
          total_giga_slaps: loadResult.total_giga_slaps || 0,
          current_giga_slap_streak: loadResult.current_giga_slap_streak || 0,
          iron_grip_lvl1_purchased: loadResult.iron_grip_lvl1_purchased || false,
          session_start_time: loadResult.session_start_time,
          session_total_taps: loadResult.session_total_taps
        },
        player_identifier,
        is_anonymous,
        last_updated: loadResult.last_updated
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({
        error: 'Invalid action. Must be "load" or "save"'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('❌ [STATE-MANAGER] Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
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
