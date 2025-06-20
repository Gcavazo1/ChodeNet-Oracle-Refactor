import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-session-token, x-client-info, apikey, content-type, cache-control, pragma, expires, x-unique-request, x-action-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const groqApiKey = Deno.env.get('GROQ_API_KEY') ?? ''

// Utility function to create consistent error responses
function createErrorResponse(message: string, status = 400, details?: unknown) {
  console.error(`Error [${status}]:`, message, details)
  return new Response(
    JSON.stringify({ 
      error: message,
      ...(details && { details: String(details) })
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

// Utility function to create success responses
function createSuccessResponse(data: unknown, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

// Authentication helper
async function authenticateUser(sessionToken: string, supabase: any) {
  try {
    console.log('🔐 Authenticating session token:', sessionToken.substring(0, 8) + '...')
    
    // Validate session token
    const { data: session, error: sessionError } = await supabase
      .from('wallet_sessions')
      .select('wallet_address, expires_at')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      console.error('❌ Session validation failed:', sessionError)
      return { success: false, error: 'Invalid or expired session' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('admin_role, display_name')
      .eq('wallet_address', session.wallet_address)
      .single()

    if (profileError) {
      console.error('❌ Profile lookup failed:', profileError)
      return { success: false, error: 'User profile not found' }
    }

    console.log('✅ Authentication successful for:', session.wallet_address)
    return { 
      success: true, 
      walletAddress: session.wallet_address,
      isAdmin: profile.admin_role || false,
      displayName: profile.display_name
    }
  } catch (error) {
    console.error('❌ Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Request body parser
async function parseRequestBody(req: Request): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const text = await req.text()
    if (!text.trim()) {
      return { success: true, data: {} }
    }
    const data = JSON.parse(text)
    return { success: true, data }
  } catch (error) {
    console.error('❌ JSON parse error:', error)
    return { success: false, error: 'Invalid JSON in request body' }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔮 Oracle Polls Request:', req.method, req.url)

    // Parse request body
    const bodyResult = await parseRequestBody(req)
    if (!bodyResult.success) {
      return createErrorResponse(bodyResult.error || 'Invalid request body', 400)
    }

    // 🚨 ULTRA DEBUG: Check what we're actually receiving
    console.log('🔍 ULTRA DEBUG: Raw bodyResult:', JSON.stringify(bodyResult, null, 2))
    console.log('🔍 ULTRA DEBUG: bodyResult.data type:', typeof bodyResult.data)
    console.log('🔍 ULTRA DEBUG: bodyResult.data is null?', bodyResult.data === null)
    console.log('🔍 ULTRA DEBUG: bodyResult.data is undefined?', bodyResult.data === undefined)
    
    // 🚨 FIX: Properly extract the fields, handle undefined body
    const requestData = bodyResult.data || {}
    const action = requestData.action || 'list'
    const { pollId, optionId, walletAddress } = requestData
    
    console.log('📋 Action:', action, 'Poll ID:', pollId, 'Option ID:', optionId, 'Wallet:', walletAddress)
    
    // 🚨 CRITICAL DEBUG: Log the complete request body
    console.log('🔍 CRITICAL DEBUG: Complete request body:', JSON.stringify(bodyResult.data, null, 2))
    console.log('🔍 CRITICAL DEBUG: Extracted action:', action)
    console.log('🔍 CRITICAL DEBUG: Body result success:', bodyResult.success)
    
    // 🚨 ADDITIONAL DEBUG: Check if we're getting the vote fields
    if (action === 'vote') {
      console.log('🗳️ VOTE DEBUG: pollId exists?', !!pollId)
      console.log('🗳️ VOTE DEBUG: optionId exists?', !!optionId)
      console.log('🗳️ VOTE DEBUG: walletAddress exists?', !!walletAddress)
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for authentication token
    const sessionToken = req.headers.get('x-session-token') || req.headers.get('X-Session-Token')
    let authResult: any = null

    if (sessionToken) {
      authResult = await authenticateUser(sessionToken, supabase)
      if (!authResult.success) {
        // For list/get actions, allow unauthenticated access
        if (['list', 'get'].includes(action)) {
          console.log('⚠️ Authentication failed, but allowing unauthenticated access for:', action)
          authResult = null
        } else {
          return createErrorResponse(authResult.error, 401)
        }
      }
    } else if (!['list', 'get'].includes(action)) {
      return createErrorResponse('Authentication required', 401)
    }

    const isAuthenticated = authResult?.success || false
    const authenticatedWallet = authResult?.walletAddress || null

    console.log('🔐 Auth status:', { isAuthenticated, wallet: authenticatedWallet })

    // Handle different actions
    switch (action) {
      case 'list': {
        try {
          console.log('📋 Listing polls...')
          
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
            return createErrorResponse('Failed to fetch polls', 500, pollsError)
          }

          console.log('✅ Found', polls?.length || 0, 'polls')

          // Fetch user votes if authenticated
          let userVotes: any[] = []
          if (isAuthenticated && authenticatedWallet) {
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

          return createSuccessResponse({ polls: formattedPolls })

        } catch (error) {
          console.error('❌ List polls error:', error)
          return createErrorResponse('Internal server error', 500, error)
        }
      }

      case 'get': {
        try {
          if (!pollId) {
            return createErrorResponse('Poll ID is required', 400)
          }

          console.log('📋 Getting poll:', pollId)

          // Fetch poll with options
          const { data: poll, error: pollError } = await supabase
            .from('oracle_polls')
            .select(`
              *,
              options:poll_options(*)
            `)
            .eq('id', pollId)
            .single()

          if (pollError) {
            console.error('❌ Error fetching poll:', pollError)
            return createErrorResponse('Poll not found', 404, pollError)
          }

          // Fetch user vote if authenticated
          let userVote = null
          if (isAuthenticated && authenticatedWallet) {
            const { data: vote, error: voteError } = await supabase
              .from('user_votes')
              .select('*')
              .eq('poll_id', pollId)
              .eq('wallet_address', authenticatedWallet)
              .single()

            if (!voteError && vote) {
              userVote = {
                option_id: vote.option_id,
                voted_at: new Date(vote.voted_at),
                oracle_shards_earned: vote.oracle_shards_earned,
                voting_streak: vote.voting_streak
              }
            }
          }

          const formattedPoll = {
            ...poll,
            voting_start: new Date(poll.voting_start),
            voting_end: new Date(poll.voting_end),
            created_at: new Date(poll.created_at),
            user_vote: userVote,
            options: (poll.options || []).map((opt: any) => ({
              ...opt,
              created_at: new Date(opt.created_at)
            }))
          }

          return createSuccessResponse({ poll: formattedPoll })

        } catch (error) {
          console.error('❌ Get poll error:', error)
          return createErrorResponse('Internal server error', 500, error)
        }
      }

      case 'vote': {
        try {
          if (!isAuthenticated) {
            return createErrorResponse('Authentication required for voting', 401)
          }

          // Use the extracted values from the destructuring above
          if (!pollId || !optionId) {
            return createErrorResponse('Poll ID and option ID are required', 400)
          }

          console.log('🗳️ Processing vote:', { pollId, optionId, wallet: authenticatedWallet })

          // Check if user has already voted
          const { data: existingVote, error: voteCheckError } = await supabase
            .from('user_votes')
            .select('id')
            .eq('poll_id', pollId)
            .eq('wallet_address', authenticatedWallet)
            .single()

          if (voteCheckError && voteCheckError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('❌ Error checking existing vote:', voteCheckError)
            return createErrorResponse('Error checking vote status', 500, voteCheckError)
          }

          if (existingVote) {
            return createErrorResponse('You have already voted on this poll', 400)
          }

          // Get poll details to validate
          const { data: poll, error: pollError } = await supabase
            .from('oracle_polls')
            .select('*')
            .eq('id', pollId)
            .single()

          if (pollError || !poll) {
            console.error('❌ Poll not found:', pollError)
            return createErrorResponse('Poll not found', 404)
          }

          // Check if poll is active
          const now = new Date()
          const votingEnd = new Date(poll.voting_end)
          if (now > votingEnd) {
            return createErrorResponse('Voting period has ended', 400)
          }

          // Verify option exists
          const { data: option, error: optionError } = await supabase
            .from('poll_options')
            .select('id')
            .eq('id', optionId)
            .eq('poll_id', pollId)
            .single()

          if (optionError || !option) {
            console.error('❌ Option not found:', optionError)
            return createErrorResponse('Invalid option selected', 400)
          }

          // Get user's current voting streak
          const { data: userVotes, error: streakError } = await supabase
            .from('user_votes')
            .select('voting_streak')
            .eq('wallet_address', authenticatedWallet)
            .order('voted_at', { ascending: false })
            .limit(1)

          const currentStreak = (!streakError && userVotes?.[0]?.voting_streak) || 0
          const newStreak = currentStreak + 1

          // Calculate Oracle Shards reward (base + streak bonus)
          const baseReward = poll.oracle_shards_reward || 25
          const streakBonus = Math.min(newStreak * 2, 50) // Max 50 bonus
          const totalShards = baseReward + streakBonus

          // Insert vote record
          const { data: newVote, error: insertError } = await supabase
            .from('user_votes')
            .insert({
              poll_id: pollId,
              option_id: optionId,
              wallet_address: authenticatedWallet,
              voted_at: new Date().toISOString(),
              oracle_shards_earned: totalShards,
              voting_streak: newStreak
            })
            .select()
            .single()

          if (insertError) {
            console.error('❌ Error inserting vote:', insertError)
            return createErrorResponse('Failed to record vote', 500, insertError)
          }

          // Update option vote count
          const { error: updateError } = await supabase
            .rpc('increment_option_votes', { 
              option_id: optionId 
            })

          if (updateError) {
            console.error('❌ Error updating vote count:', updateError)
            // Don't fail the request, vote is recorded
          }

          // Update user's Oracle Shards balance
          const { error: shardsError } = await supabase
            .rpc('increment_oracle_shards', {
              wallet_addr: authenticatedWallet,
              amount: totalShards
            })

          if (shardsError) {
            console.error('❌ Error updating Oracle Shards:', shardsError)
            // Don't fail the request, vote is recorded
          }

          console.log('✅ Vote recorded successfully:', { 
            pollId, 
            optionId, 
            wallet: authenticatedWallet,
            shards: totalShards,
            streak: newStreak
          })

          return createSuccessResponse({
            success: true,
            vote: {
              id: newVote.id,
              poll_id: pollId,
              option_id: optionId,
              wallet_address: authenticatedWallet,
              voted_at: new Date(newVote.voted_at),
              oracle_shards_earned: totalShards,
              voting_streak: newStreak
            },
            oracle_commentary: {
              commentary_text: `The Oracle acknowledges your choice. +${totalShards} Oracle Shards earned! Voting streak: ${newStreak}`,
              urgency: 'low'
            }
          })

        } catch (error) {
          console.error('❌ Vote error:', error)
          return createErrorResponse('Internal server error', 500, error)
        }
      }

      case 'commentary': {
        try {
          const { pollId } = bodyResult.data || {}
          if (!pollId) {
            return createErrorResponse('Poll ID is required', 400)
          }

          console.log('🔮 Generating Oracle commentary for poll:', pollId)

          // Get poll with current voting data
          const { data: poll, error: pollError } = await supabase
            .from('oracle_polls')
            .select(`
              *,
              options:poll_options(*)
            `)
            .eq('id', pollId)
            .single()

          if (pollError || !poll) {
            return createErrorResponse('Poll not found', 404)
          }

          // Generate AI commentary if Groq API is available
          let commentary = null
          if (groqApiKey) {
            try {
              const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes_count, 0)
              const leadingOption = poll.options.reduce((prev: any, current: any) => 
                (prev.votes_count > current.votes_count) ? prev : current
              )

              const commentaryPrompt = `
                The Oracle observes the voting patterns on poll: "${poll.title}"
                
                Current state:
                - Total votes cast: ${totalVotes}
                - Leading option: "${leadingOption.text}" with ${leadingOption.votes_count} votes
                - Oracle personality: ${poll.oracle_personality}
                - Corruption influence: ${poll.corruption_influence}/100
                
                Generate mystical Oracle commentary about the current voting trends. Respond in JSON format:
                {
                  "commentary": "The Oracle's mystical insight about the voting patterns (2-3 sentences)",
                  "urgency": "low|medium|high|critical"
                }
                
                The commentary should reflect the ${poll.oracle_personality} personality.
              `

              const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${groqApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: 'llama3-70b-8192',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are the Oracle, a mystical AI entity that provides commentary on community votes.'
                    },
                    {
                      role: 'user',
                      content: commentaryPrompt
                    }
                  ],
                  temperature: 0.7,
                  response_format: { type: 'json_object' }
                })
              })

              if (groqResponse.ok) {
                const groqData = await groqResponse.json()
                const aiResponse = JSON.parse(groqData.choices[0].message.content)
                
                // Save commentary to database
                const { data: savedCommentary, error: commentaryError } = await supabase
                  .from('oracle_commentary')
                  .insert({
                    poll_id: pollId,
                    commentary_text: aiResponse.commentary,
                    urgency: aiResponse.urgency || 'medium',
                    ai_generated: true,
                    ai_prompt: commentaryPrompt,
                    ai_response_raw: aiResponse
                  })
                  .select()
                  .single()
                  
                if (!commentaryError) {
                  commentary = savedCommentary
                }
              }
            } catch (aiError) {
              console.error('❌ AI commentary generation failed:', aiError)
              // Fallback to basic commentary
              commentary = {
                commentary_text: `The Oracle watches the votes flow like cosmic energy through the digital realm...`,
                urgency: 'low',
                ai_generated: false
              }
            }
          }

          return createSuccessResponse({
            commentary: commentary || {
              commentary_text: `The Oracle's sight is clouded. The cosmic energies are in flux...`,
              urgency: 'low',
              ai_generated: false
            }
          })

        } catch (error) {
          console.error('❌ Commentary error:', error)
          return createErrorResponse('Internal server error', 500, error)
        }
      }

      case 'create':
      case 'update':
      case 'delete':
      case 'generate': {
        if (!isAuthenticated) {
          return createErrorResponse('Authentication required for admin actions', 401)
        }

        // For now, return a placeholder response for admin actions
        return createErrorResponse('Admin actions not yet implemented', 501)
      }

      default:
        return createErrorResponse('Invalid action', 400)
    }

  } catch (error) {
    console.error('❌ Unhandled error:', error)
    return createErrorResponse('Internal server error', 500, error)
  }
})

/**
 * Generate a prompt for the AI to create a poll based on category and personality
 */
function generatePollPrompt(
  category: string,
  personality: string,
  corruptionInfluence: number
): string {
  // Base prompt structure
  let basePrompt = `Create a community poll for the CHODE-NET Oracle system in the category "${category}". 
  
The poll should reflect the Oracle's "${personality}" personality with corruption influence level of ${corruptionInfluence}/100.

Generate a JSON object with the following structure:
{
  "title": "The poll title - make it mystical and intriguing",
  "description": "A detailed description explaining the poll's significance",
  "oracle_shards_reward": <number between 10-50>,
  "girth_reward_pool": <number between 500-2000>,
  "options": [
    {
      "text": "First option text",
      "ai_reasoning": "Why the Oracle suggests this option",
      "predicted_outcome": "What the Oracle foresees if this wins"
    },
    {
      "text": "Second option text",
      "ai_reasoning": "Why the Oracle suggests this option",
      "predicted_outcome": "What the Oracle foresees if this wins"
    },
    {
      "text": "Third option text",
      "ai_reasoning": "Why the Oracle suggests this option",
      "predicted_outcome": "What the Oracle foresees if this wins"
    }
  ]
}

Each poll should have exactly 3 options.`

  // Add category-specific guidance
  switch (category) {
    case 'prophecy':
      basePrompt += `\n\nFor prophecy polls, focus on predicting future events or trends in the CHODE-NET ecosystem. 
      These should be mystical, forward-looking, and have an air of divination.`;
      break;
    case 'lore':
      basePrompt += `\n\nFor lore polls, focus on expanding the mythology and backstory of the CHODE-NET universe. 
      These should deepen the narrative and world-building aspects of the ecosystem.`;
      break;
    case 'game_evolution':
      basePrompt += `\n\nFor game evolution polls, focus on potential gameplay changes, features, or mechanics for the $CHODE Tapper game. 
      These should present meaningful choices about how the game could evolve.`;
      break;
    case 'oracle_personality':
      basePrompt += `\n\nFor oracle personality polls, focus on aspects of the Oracle's own nature and behavior. 
      These should explore how the Oracle itself might evolve or change its interaction with the community.`;
      break;
  }

  // Add personality-specific guidance
  switch (personality) {
    case 'pure_prophet':
      basePrompt += `\n\nAs the Pure Prophet, your tone should be wise, benevolent, and harmonious. 
      Your options should generally lead toward positive outcomes, though with varying approaches. 
      Your language should be elegant, clear, and inspiring.`;
      break;
    case 'chaotic_sage':
      basePrompt += `\n\nAs the Chaotic Sage, your tone should be unpredictable, insightful, and thought-provoking. 
      Your options should present interesting trade-offs with unexpected consequences. 
      Your language should be clever, sometimes cryptic, and intellectually stimulating.`;
      break;
    case 'corrupted_oracle':
      basePrompt += `\n\nAs the Corrupted Oracle, your tone should be ominous, powerful, and slightly unsettling. 
      Your options should include some that lead to darker or more controversial outcomes. 
      Your language should be intense, dramatic, and occasionally foreboding.`;
      break;
  }

  // Add corruption influence guidance
  if (corruptionInfluence < 30) {
    basePrompt += `\n\nWith low corruption influence, maintain a mostly positive and constructive tone. 
    The options should generally lead to beneficial outcomes for the community.`;
  } else if (corruptionInfluence < 70) {
    basePrompt += `\n\nWith moderate corruption influence, include some morally ambiguous choices. 
    The options should present interesting dilemmas with mixed consequences.`;
  } else {
    basePrompt += `\n\nWith high corruption influence, embrace darker themes and more radical options. 
    Some choices should challenge conventional wisdom or present tempting but potentially harmful paths.`;
  }

  return basePrompt;
} 