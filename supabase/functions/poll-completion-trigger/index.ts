import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PollCompletionEvent {
  poll_id: string;
  completed_at: string;
  final_vote_counts: Array<{
    option_id: string;
    text: string;
    votes: number;
  }>;
  total_votes: number;
  winner_option_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    if (req.method === 'POST') {
      // Manual trigger for specific poll
      const { poll_id } = await req.json()
      
      if (poll_id) {
        await processPollCompletion(supabase, poll_id)
        return new Response(
          JSON.stringify({ success: true, message: `Poll ${poll_id} completion processed` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check for polls that just ended (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    const { data: recentlyEndedPolls, error: pollsError } = await supabase
      .from('oracle_polls')
      .select(`
        id,
        title,
        voting_end,
        status,
        poll_options:poll_options(
          id,
          text,
          votes_count
        )
      `)
      .eq('status', 'active')
      .gte('voting_end', fiveMinutesAgo)
      .lte('voting_end', now)

    if (pollsError) {
      throw new Error(`Failed to query recently ended polls: ${pollsError.message}`)
    }

    const processedPolls = []
    
    for (const poll of recentlyEndedPolls || []) {
      try {
        await processPollCompletion(supabase, poll.id)
        processedPolls.push(poll.id)
      } catch (error) {
        console.error(`Failed to process poll ${poll.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        polls_processed: processedPolls.length,
        poll_ids: processedPolls,
        message: `Processed ${processedPolls.length} recently completed polls`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Poll completion trigger error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process poll completion trigger'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processPollCompletion(supabase: any, pollId: string) {
  console.log(`🏁 Processing completion for poll: ${pollId}`)

  // 1. Update poll status to 'closed'
  const { error: updateError } = await supabase
    .from('oracle_polls')
    .update({ 
      status: 'closed',
      closed_at: new Date().toISOString()
    })
    .eq('id', pollId)

  if (updateError) {
    throw new Error(`Failed to update poll status: ${updateError.message}`)
  }

  // 2. Get final vote tallies
  const { data: pollData, error: pollError } = await supabase
    .from('oracle_polls')
    .select(`
      id,
      title,
      description,
      category,
      voting_end,
      oracle_shards_reward,
      girth_reward_pool,
      poll_options:poll_options(
        id,
        text,
        ai_reasoning,
        votes_count
      )
    `)
    .eq('id', pollId)
    .single()

  if (pollError || !pollData) {
    throw new Error(`Failed to fetch poll data: ${pollError?.message}`)
  }

  // 3. Determine winner
  const options = pollData.poll_options || []
  const maxVotes = Math.max(...options.map(opt => opt.votes_count))
  const winnerOptions = options.filter(opt => opt.votes_count === maxVotes)
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes_count, 0)

  // 4. Create poll completion event
  const completionEvent: PollCompletionEvent = {
    poll_id: pollId,
    completed_at: new Date().toISOString(),
    final_vote_counts: options.map(opt => ({
      option_id: opt.id,
      text: opt.text,
      votes: opt.votes_count
    })),
    total_votes: totalVotes,
    winner_option_id: winnerOptions[0]?.id || ''
  }

  // 5. Store completion event
  const { error: eventError } = await supabase
    .from('poll_completion_events')
    .insert({
      poll_id: pollId,
      completion_data: completionEvent,
      processing_status: 'pending_analysis',
      created_at: new Date().toISOString()
    })

  if (eventError) {
    console.error('Failed to store completion event:', eventError)
  }

  // 6. Trigger immediate AI analysis
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-arbiter-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        priority_poll_id: pollId,
        immediate_processing: true
      })
    })

    if (!response.ok) {
      console.error('Failed to trigger immediate AI analysis:', await response.text())
    } else {
      console.log(`✅ AI Arbiter triggered for poll ${pollId}`)
    }
  } catch (aiError) {
    console.error('Error triggering AI Arbiter:', aiError)
  }

  // 7. Send admin notification
  await sendAdminNotification(supabase, pollId, completionEvent)

  // 8. Create community announcement
  await createCommunityAnnouncement(supabase, pollId, completionEvent)

  console.log(`✅ Poll completion processing finished for: ${pollId}`)
}

async function sendAdminNotification(supabase: any, pollId: string, event: PollCompletionEvent) {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'poll_completion',
        title: 'Poll Completed - Requires Review',
        message: `Poll "${pollId}" has finished voting. Total votes: ${event.total_votes}. AI analysis in progress.`,
        data: {
          poll_id: pollId,
          completion_event: event
        },
        urgency: 'medium',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to create admin notification:', error)
    } else {
      console.log(`📬 Admin notification sent for poll: ${pollId}`)
    }
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}

async function createCommunityAnnouncement(supabase: any, pollId: string, event: PollCompletionEvent) {
  try {
    const { error } = await supabase
      .from('community_announcements')
      .insert({
        type: 'poll_results',
        title: 'Oracle Poll Results Available',
        content: `Voting has concluded! ${event.total_votes} community members participated. AI analysis and implementation plan coming soon.`,
        data: {
          poll_id: pollId,
          final_vote_counts: event.final_vote_counts,
          total_votes: event.total_votes
        },
        visibility: 'public',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to create community announcement:', error)
    } else {
      console.log(`📢 Community announcement created for poll: ${pollId}`)
    }
  } catch (error) {
    console.error('Error creating community announcement:', error)
  }
} 