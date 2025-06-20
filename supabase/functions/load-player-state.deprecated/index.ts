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

    const { session_id, player_address } = await req.json()

    if (!session_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'session_id is required' 
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

    console.log(`Loading player state for ${is_anonymous ? 'anonymous session' : 'wallet'}: ${player_identifier}`)

    // Try to load existing player state
    const { data, error } = await supabaseClient
      .from('player_states')
      .select('*')
      .eq('player_identifier', player_identifier)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error loading player state:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to load player state',
          details: error.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If no existing state found, return default state
    if (!data) {
      console.log('No existing player state found, returning default state')
      const defaultState = {
        current_girth: 0,
        total_mega_slaps: 0,
        total_giga_slaps: 0,
        current_giga_slap_streak: 0,
        iron_grip_lvl1_purchased: false,
        session_start_time: Date.now(),
        session_total_taps: 0
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No existing state found, returning default state',
          player_state: defaultState,
          is_new_player: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return existing player state
    console.log('Player state loaded successfully:', data)

    const playerState = {
      current_girth: data.current_girth,
      total_mega_slaps: data.total_mega_slaps,
      total_giga_slaps: data.total_giga_slaps,
      current_giga_slap_streak: data.current_giga_slap_streak,
      iron_grip_lvl1_purchased: data.iron_grip_lvl1_purchased,
      session_start_time: data.session_start_time,
      session_total_taps: data.session_total_taps
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Player state loaded successfully',
        player_state: playerState,
        is_new_player: false,
        last_updated: data.last_updated
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in load-player-state function:', error)
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