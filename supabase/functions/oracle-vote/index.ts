import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-session-token, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    console.log('🗳️ Oracle Vote Request received')

    // Parse request body as JSON
    let requestBody: Record<string, unknown> | null = null
    try {
      requestBody = await req.json()
    } catch (err) {
      console.error('❌ Error parsing request JSON via req.json():', err)
      // Fallback: attempt to read as text then parse
      const raw = await req.text()
      console.log('📋 Raw request body (text fallback):', raw)
      if (raw && raw.trim()) {
        try {
          requestBody = JSON.parse(raw)
        } catch (parseErr) {
          console.error('❌ Failed to parse request body JSON:', parseErr)
        }
      }
    }

    if (!requestBody) {
      return new Response(
        JSON.stringify({ error: 'Request body is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, pollId, optionId, walletAddress } = requestBody as {
      action?: string;
      pollId?: string;
      optionId?: string;
      walletAddress?: string;
    }
    
    console.log('🗳️ Request data:', { action, pollId, optionId, walletAddress })

    if (!pollId || !walletAddress) {
      return new Response(
        JSON.stringify({ error: 'pollId and walletAddress are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For voting, optionId is also required
    if (action !== 'check_cooldown' && !optionId) {
      return new Response(
        JSON.stringify({ error: 'optionId is required for voting' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get session token
    const sessionToken = req.headers.get('x-session-token')
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Session token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('wallet_sessions')
      .select('wallet_address, expires_at')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Session validated for wallet:', session.wallet_address)

    // Check if user can vote on this poll (24h cooldown per poll)
    const { data: cooldownCheck, error: cooldownError } = await supabase
      .rpc('can_user_vote_on_poll', {
        p_wallet_address: session.wallet_address,
        p_poll_id: pollId
      })
      .single()

    if (cooldownError) {
      console.error('❌ Error checking vote cooldown:', cooldownError)
      return new Response(
        JSON.stringify({ error: 'Error checking vote eligibility' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If this is just a cooldown check, return the status
    if (action === 'check_cooldown') {
      console.log('🕐 Cooldown check requested for:', { pollId, wallet: session.wallet_address })
      return new Response(
        JSON.stringify({
          success: true,
          cooldown: {
            can_vote: cooldownCheck.can_vote,
            last_vote_at: cooldownCheck.last_vote_at,
            cooldown_expires_at: cooldownCheck.cooldown_expires_at,
            hours_remaining: cooldownCheck.hours_remaining
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For actual voting, check cooldown and proceed if allowed
    if (!cooldownCheck.can_vote) {
      console.log('🕐 User in cooldown period:', {
        wallet: session.wallet_address,
        pollId,
        hoursRemaining: cooldownCheck.hours_remaining,
        lastVoteAt: cooldownCheck.last_vote_at,
        cooldownExpiresAt: cooldownCheck.cooldown_expires_at
      })

      return new Response(
        JSON.stringify({ 
          error: `You must wait ${Math.ceil(cooldownCheck.hours_remaining)} more hours before voting on this poll again`,
          cooldown: {
            can_vote: false,
            last_vote_at: cooldownCheck.last_vote_at,
            cooldown_expires_at: cooldownCheck.cooldown_expires_at,
            hours_remaining: cooldownCheck.hours_remaining
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Vote eligibility confirmed for poll:', pollId)

    // Get poll details
    const { data: poll, error: pollError } = await supabase
      .from('oracle_polls')
      .select('*')
      .eq('id', pollId)
      .single()

    if (pollError || !poll) {
      return new Response(
        JSON.stringify({ error: 'Poll not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if poll is still active
    const now = new Date()
    const votingEnd = new Date(poll.voting_end)
    if (now > votingEnd) {
      return new Response(
        JSON.stringify({ error: 'Voting period has ended' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify option exists
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single()

    if (optionError || !option) {
      return new Response(
        JSON.stringify({ error: 'Invalid option selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current voting streak
    const { data: userVotes, error: streakError } = await supabase
      .from('user_votes')
      .select('voting_streak')
      .eq('wallet_address', session.wallet_address)
      .order('voted_at', { ascending: false })
      .limit(1)

    const currentStreak = (!streakError && userVotes?.[0]?.voting_streak) || 0
    const newStreak = currentStreak + 1

    // Calculate rewards
    const baseReward = poll.oracle_shards_reward || 25
    const streakBonus = Math.min(newStreak * 2, 50)
    const totalShards = baseReward + streakBonus

    // Record vote using the new cooldown-aware function
    const { data: voteResult, error: voteError } = await supabase
      .rpc('record_poll_vote', {
        p_wallet_address: session.wallet_address,
        p_poll_id: pollId,
        p_option_id: optionId,
        p_oracle_shards_earned: totalShards,
        p_voting_streak: newStreak
      })
      .single()

    if (voteError || !voteResult.success) {
      console.error('❌ Error recording vote:', voteError || voteResult.error_message)
      return new Response(
        JSON.stringify({ error: voteResult?.error_message || 'Failed to record vote' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Vote recorded:', {
      voteId: voteResult.vote_id,
      previousVoteId: voteResult.previous_vote_id,
      isVoteChange: !!voteResult.previous_vote_id
    })

    // Update option vote count
    const { error: updateError } = await supabase
      .rpc('increment_option_votes', { option_id: optionId })

    if (updateError) {
      console.error('❌ Error updating vote count:', updateError)
    }

    // Update Oracle Shards balance
    const { error: shardsError } = await supabase
      .rpc('increment_oracle_shards', {
        wallet_addr: session.wallet_address,
        amount: totalShards
      })

    if (shardsError) {
      console.error('❌ Error updating Oracle Shards:', shardsError)
    }

    console.log('✅ Vote recorded successfully:', {
      pollId,
      optionId,
      wallet: session.wallet_address,
      shards: totalShards,
      streak: newStreak,
      isVoteChange: !!voteResult.previous_vote_id
    })

    const commentaryText = voteResult.previous_vote_id 
      ? `The Oracle notes your change of heart. +${totalShards} Oracle Shards earned! Voting streak: ${newStreak}`
      : `The Oracle acknowledges your choice. +${totalShards} Oracle Shards earned! Voting streak: ${newStreak}`

    return new Response(
      JSON.stringify({
        success: true,
        vote: {
          id: voteResult.vote_id,
          poll_id: pollId,
          option_id: optionId,
          wallet_address: session.wallet_address,
          voted_at: new Date(),
          oracle_shards_earned: totalShards,
          voting_streak: newStreak,
          is_vote_change: !!voteResult.previous_vote_id,
          previous_vote_id: voteResult.previous_vote_id
        },
        oracle_commentary: {
          commentary_text: commentaryText,
          urgency: 'low'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Vote error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 