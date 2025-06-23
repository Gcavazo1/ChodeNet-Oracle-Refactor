import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json().catch(()=>({}));
    console.log('🔍 Poll Completion Trigger: Starting scan for completed polls...');
    // Check for recently completed polls (within last 5 minutes)
    const { data: completedPolls, error: pollsError } = await supabase.from('oracle_polls').select(`
        id,
        title,
        description,
        category,
        voting_end,
        status,
        oracle_shards_reward,
        girth_reward_pool
      `).lte('voting_end', new Date().toISOString()).gte('voting_end', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
    .neq('status', 'closed');
    if (pollsError) {
      console.error('❌ Error fetching completed polls:', pollsError);
      throw pollsError;
    }
    if (!completedPolls || completedPolls.length === 0) {
      console.log('ℹ️ No recently completed polls found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No recently completed polls found',
        polls_processed: 0
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`📊 Found ${completedPolls.length} completed polls to process`);
    const results = [];
    // Process each completed poll
    for (const poll of completedPolls){
      console.log(`🔄 Processing poll: ${poll.title}`);
      try {
        const result = await processPollCompletion(supabase, poll.id);
        results.push(result);
        // Update poll status to closed
        await supabase.from('oracle_polls').update({
          status: 'closed'
        }).eq('id', poll.id);
        console.log(`✅ Completed processing poll: ${poll.title}`);
      } catch (error) {
        console.error(`❌ Error processing poll ${poll.id}:`, error);
        results.push({
          poll_id: poll.id,
          ai_analysis_triggered: false,
          admin_notification_sent: false,
          community_announcement_created: false,
          error: error.message
        });
      }
    }
    const successfullyProcessed = results.filter((r)=>!r.error).length;
    console.log(`🎯 Poll completion processing complete: ${successfullyProcessed}/${results.length} successful`);
    return new Response(JSON.stringify({
      success: true,
      polls_processed: results.length,
      successful_processes: successfullyProcessed,
      results: results
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ Poll completion trigger error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function processPollCompletion(supabase, pollId) {
  console.log(`📋 Processing completion for poll: ${pollId}`);
  // 1. Get final vote tallies
  const { data: voteResults, error: voteError } = await supabase.from('user_votes').select(`
      option_id,
      poll_options!inner(
        id,
        text,
        votes_count
      )
    `).eq('poll_id', pollId);
  if (voteError) {
    console.error('Error fetching vote results:', voteError);
    throw voteError;
  }
  // Calculate final results
  const optionVotes = new Map();
  const totalVotes = voteResults?.length || 0;
  voteResults?.forEach((vote)=>{
    const optionId = vote.option_id;
    const current = optionVotes.get(optionId) || 0;
    optionVotes.set(optionId, current + 1);
  });
  // Get poll options to build final vote counts
  const { data: pollOptions, error: optionsError } = await supabase.from('poll_options').select('id, text').eq('poll_id', pollId);
  if (optionsError) {
    console.error('Error fetching poll options:', optionsError);
    throw optionsError;
  }
  const finalVoteCounts = pollOptions?.map((option)=>({
      option_id: option.id,
      text: option.text,
      votes: optionVotes.get(option.id) || 0
    })) || [];
  // Find winner
  const winnerOption = finalVoteCounts.reduce((prev, current)=>current.votes > prev.votes ? current : prev);
  // 2. Create completion event
  const completionData = {
    poll_id: pollId,
    completed_at: new Date().toISOString(),
    total_votes: totalVotes,
    winner_option_id: winnerOption.option_id,
    final_vote_counts: finalVoteCounts
  };
  const { data: completionEvent, error: eventError } = await supabase.from('poll_completion_events').insert({
    poll_id: pollId,
    completion_data: completionData,
    processing_status: 'pending_analysis',
    admin_review_required: totalVotes > 50 || winnerOption.votes < totalVotes * 0.6 // Require review for high-stakes or close votes
  }).select().single();
  if (eventError) {
    console.error('Failed to store completion event:', eventError);
  }
  // 3. Trigger immediate AI analysis
  const aiAnalysisTriggered = await triggerAIAnalysis(pollId);
  // 4. Send admin notification
  const adminNotificationSent = await sendAdminNotification(supabase, pollId, completionEvent);
  // 5. Create community announcement
  const communityAnnouncementCreated = await createCommunityAnnouncement(supabase, pollId, completionEvent);
  console.log(`✅ Poll completion processing finished for: ${pollId}`);
  return {
    poll_id: pollId,
    completion_event_id: completionEvent?.id,
    ai_analysis_triggered: aiAnalysisTriggered,
    admin_notification_sent: adminNotificationSent,
    community_announcement_created: communityAnnouncementCreated
  };
}
async function triggerAIAnalysis(pollId) {
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
    });
    if (!response.ok) {
      console.error('Failed to trigger immediate AI analysis:', await response.text());
      return false;
    } else {
      console.log(`✅ AI Arbiter triggered for poll ${pollId}`);
      return true;
    }
  } catch (aiError) {
    console.error('Error triggering AI Arbiter:', aiError);
    return false;
  }
}
async function sendAdminNotification(supabase, pollId, completionEvent) {
  try {
    const { error } = await supabase.from('admin_notifications').insert({
      type: 'poll_completed',
      title: 'Poll Completion Requires Review',
      message: `Poll ${pollId} has completed voting and requires admin review for implementation.`,
      urgency: completionEvent?.admin_review_required ? 'high' : 'medium',
      action_required: true,
      poll_id: pollId,
      completion_event_id: completionEvent?.id,
      data: {
        poll_id: pollId,
        total_votes: completionEvent?.completion_data?.total_votes || 0,
        winner_option: completionEvent?.completion_data?.winner_option_id
      }
    });
    if (error) {
      console.error('Failed to send admin notification:', error);
      return false;
    }
    console.log(`📨 Admin notification sent for poll: ${pollId}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
}
async function createCommunityAnnouncement(supabase, pollId, completionEvent) {
  try {
    const { error } = await supabase.from('community_announcements').insert({
      type: 'poll_result_announced',
      title: 'Community Poll Results Available',
      content: `The Oracle has concluded a community referendum. Results and AI analysis are now available for review.`,
      poll_id: pollId,
      completion_event_id: completionEvent?.id,
      priority_level: 'normal',
      display_duration_hours: 24
    });
    if (error) {
      console.error('Failed to create community announcement:', error);
      return false;
    }
    console.log(`📢 Community announcement created for poll: ${pollId}`);
    return true;
  } catch (error) {
    console.error('Error creating community announcement:', error);
    return false;
  }
}
