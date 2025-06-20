import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-session-token, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📋 Oracle Polls List Request received')

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for authentication token (optional for listing)
    const sessionToken = req.headers.get('x-session-token')
    let authenticatedWallet: string | null = null

    if (sessionToken) {
      try {
        const { data: session, error: sessionError } = await supabase
          .from('wallet_sessions')
          .select('wallet_address, expires_at')
          .eq('session_token', sessionToken)
          .gt('expires_at', new Date().toISOString())
          .single()

        if (!sessionError && session) {
          authenticatedWallet = session.wallet_address
          console.log('✅ Authenticated user:', authenticatedWallet)
        }
      } catch (error) {
        console.log('⚠️ Session validation failed, proceeding as anonymous')
      }
    }

    // Fetch polls with options
    const { data: polls, error: pollsError } = await supabase
      .from('oracle_polls')
      .select(`
        id,
        title,
        description,
        category,
        ai_generated,
        voting_start,
        voting_end,
        oracle_shards_reward,
        girth_reward_pool,
        required_authentication,
        cooldown_hours,
        oracle_personality,
        corruption_influence,
        status,
        created_at,
        created_by,
        ai_prompt,
        ai_response_raw,
        options:poll_options(
          id,
          poll_id,
          text,
          ai_reasoning,
          predicted_outcome,
          image_url,
          votes_count,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (pollsError) {
      console.error('❌ Error fetching polls:', pollsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch polls' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Found', polls?.length || 0, 'polls')

    // Fetch user votes if authenticated
    let userVotes: any[] = []
    if (authenticatedWallet) {
      const { data: votes, error: votesError } = await supabase
        .from('user_votes')
        .select('poll_id, option_id, voted_at, oracle_shards_earned, voting_streak')
        .eq('wallet_address', authenticatedWallet)

      if (!votesError && votes) {
        userVotes = votes
        console.log('✅ Found', userVotes.length, 'user votes')
      }
    }

    // Format polls with user vote data
    const formattedPolls = (polls || []).map((poll: any) => {
      const userVote = userVotes.find((vote: any) => vote.poll_id === poll.id)
      
      return {
        ...poll,
        voting_start: new Date(poll.voting_start),
        voting_end: new Date(poll.voting_end),
        created_at: new Date(poll.created_at),
        user_vote: userVote ? {
          option_id: userVote.option_id,
          voted_at: new Date(userVote.voted_at),
          oracle_shards_earned: userVote.oracle_shards_earned,
          voting_streak: userVote.voting_streak
        } : null,
        options: (poll.options || []).map((opt: any) => ({
          ...opt,
          created_at: new Date(opt.created_at)
        }))
      }
    })

    return new Response(
      JSON.stringify({ polls: formattedPolls }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ List polls error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 