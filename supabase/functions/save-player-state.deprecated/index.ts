import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { session_id, player_address, player_state, save_trigger } = await req.json()

    if (!session_id || !player_state) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'session_id and player_state are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Determine player identifier (wallet address or session ID for anonymous players)
    const player_identifier = player_address || session_id
    const is_anonymous = !player_address

    console.log(`Saving player state for ${is_anonymous ? 'anonymous session' : 'wallet'}: ${player_identifier}`)

    // Upsert player state
    const { data, error } = await supabaseClient
      .from('player_states')
      .upsert({
        player_identifier,
        session_id,
        player_address,
        is_anonymous,
        current_girth: player_state.current_girth || 0,
        total_mega_slaps: player_state.total_mega_slaps || 0,
        total_giga_slaps: player_state.total_giga_slaps || 0,
        current_giga_slap_streak: player_state.current_giga_slap_streak || 0,
        iron_grip_lvl1_purchased: player_state.iron_grip_lvl1_purchased || false,
        session_start_time: player_state.session_start_time,
        session_total_taps: player_state.session_total_taps || 0,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'player_identifier'
      })
      .select()

    if (error) {
      console.error('Error saving player state:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to save player state',
          details: error.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Player state saved successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Player state saved successfully',
        saved_state: data[0],
        save_trigger
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in save-player-state function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 