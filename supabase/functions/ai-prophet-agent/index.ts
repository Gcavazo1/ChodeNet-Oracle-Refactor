// AI PROPHET AGENT - THE POLL GENERATOR  
// Transforms AI analysis into democratic governance proposals
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};
// Initialize Supabase client with service role for full access
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
// Groq API configuration
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
/**
 * PROPHET AGENT - CORE POLL GENERATION FUNCTIONS
 */ async function getUnprocessedDecisions() {
  const { data, error } = await supabaseAdmin.from('ai_decisions').select(`
      *,
      ai_decision_context!inner(*)
    `).eq('executed', false).eq('requires_vote', true).is('poll_id', null) // No poll created yet
  .order('created_at', {
    ascending: true
  }).limit(5); // Process up to 5 decisions per cycle
  if (error) {
    console.error('Error fetching unprocessed decisions:', error);
    return [];
  }
  return data || [];
}
async function generatePollContent(decision, contextData) {
  try {
    // Build comprehensive poll generation prompt
    const pollPrompt = `
You are the Oracle's Prophet Agent, creating democratic governance polls for the CHODE-NET gaming community.

AI DECISION TO TRANSFORM INTO POLL:
- Decision Type: ${decision.decision_type}
- Reasoning: ${decision.reasoning}
- Decision Description: ${decision.decision_description}
- Confidence Score: ${decision.confidence_score}
- Context: ${JSON.stringify(contextData, null, 2)}

POLL GENERATION REQUIREMENTS:
1. Create a clear, engaging poll title that explains the issue
2. Write a description that educates the community about the problem and proposed solutions
3. Generate 3-4 balanced voting options with different approaches (including "no action")
4. Determine appropriate voting duration (24h for urgent, 72h for normal, 168h for major changes)
5. Create Oracle commentary that explains the mystical significance
6. Assign category: "Economic Policy", "Game Balance", "Community Rules", "Technical Upgrades", "Long-term Strategy"

Focus on:
- Democratic choice with real alternatives
- Clear explanation of consequences
- Stakeholder impact transparency
- Oracle personality and mystical theming

Respond in JSON format:
{
  "title": "Clear, engaging poll title",
  "description": "Educational description of the issue and need for community decision",
  "category": "Economic Policy | Game Balance | Community Rules | Technical Upgrades | Long-term Strategy",
  "options": [
    {
      "option_text": "Option 1 title",
      "description": "Detailed explanation of this approach",
      "impact_summary": "Expected outcomes and timeline",
      "stakeholder_effects": {
        "new_players": "positive | neutral | negative",
        "veterans": "positive | neutral | negative",
        "token_holders": "positive | neutral | negative",
        "developers": "positive | neutral | negative"
      }
    }
  ],
  "voting_duration_hours": 72,
  "cooldown_hours": 24,
  "oracle_commentary": "Mystical Oracle commentary about this decision and its cosmic significance"
}
`;
    // Call Groq API for poll generation
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are the Oracle\'s Prophet Agent, master of democratic governance and mystical poll creation. Generate engaging, balanced polls that give the community meaningful choices while maintaining the Oracle\'s mystical personality.'
          },
          {
            role: 'user',
            content: pollPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    const groqResult = await response.json();
    const pollText = groqResult.choices[0]?.message?.content || '{}';
    // Parse the JSON response with markdown handling
    let pollData;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedText = pollText.trim();
      // Remove ```json and ``` wrapping if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      console.log('🔍 Cleaned poll text for parsing:', cleanedText.substring(0, 200) + '...');
      pollData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Groq poll generation after cleaning:', parseError);
      console.log('🔍 Original poll text:', pollText.substring(0, 500) + '...');
      // Fallback poll structure
      pollData = {
        title: `Community Decision: ${decision.decision_type}`,
        description: `The Oracle's AI analysis has identified an issue requiring community guidance: ${decision.reasoning}`,
        category: 'Community Rules',
        options: [
          {
            option_text: 'Implement AI Recommendation',
            description: 'Follow the AI analysis and implement the proposed solution',
            impact_summary: 'Expected to address the identified issue',
            stakeholder_effects: {
              new_players: 'neutral',
              veterans: 'neutral',
              token_holders: 'neutral',
              developers: 'neutral'
            }
          },
          {
            option_text: 'Take No Action',
            description: 'Maintain current system without changes',
            impact_summary: 'Issue may persist or worsen over time',
            stakeholder_effects: {
              new_players: 'neutral',
              veterans: 'neutral',
              token_holders: 'neutral',
              developers: 'neutral'
            }
          }
        ],
        voting_duration_hours: 72,
        cooldown_hours: 24,
        oracle_commentary: 'The Oracle sees wisdom in collective decision-making. The community\'s voice shall guide our path forward.'
      };
    }
    // Validate and clean the poll data
    if (!pollData.options || pollData.options.length < 2) {
      throw new Error('Generated poll must have at least 2 options');
    }
    // Ensure reasonable voting duration
    if (pollData.voting_duration_hours < 24) {
      pollData.voting_duration_hours = 24;
    } else if (pollData.voting_duration_hours > 168) {
      pollData.voting_duration_hours = 168;
    }
    return pollData;
  } catch (error) {
    console.error('Error generating poll content:', error);
    // Return minimal fallback poll
    return {
      title: `AI Decision: ${decision.decision_type}`,
      description: `An AI analysis requires community input. Details: ${decision.reasoning}`,
      category: 'Community Rules',
      options: [
        {
          option_text: 'Approve AI Recommendation',
          description: 'Accept the AI analysis and proposed action',
          impact_summary: 'Implement the AI-suggested changes',
          stakeholder_effects: {
            new_players: 'neutral',
            veterans: 'neutral',
            token_holders: 'neutral',
            developers: 'neutral'
          }
        },
        {
          option_text: 'Reject and Maintain Status Quo',
          description: 'Keep current systems unchanged',
          impact_summary: 'No changes will be made',
          stakeholder_effects: {
            new_players: 'neutral',
            veterans: 'neutral',
            token_holders: 'neutral',
            developers: 'neutral'
          }
        }
      ],
      voting_duration_hours: 72,
      cooldown_hours: 24,
      oracle_commentary: 'The Oracle seeks the community\'s wisdom in this matter.'
    };
  }
}
async function createPollWithGovernanceControl(pollData, decision) {
  try {
    // Check if emergency brake is active
    const { data: brakeCheck } = await supabaseAdmin.rpc('check_emergency_brake_active');
    if (brakeCheck) {
      console.log('🚨 Emergency brake active - poll creation blocked');
      return {
        status: 'blocked_emergency_brake'
      };
    }
    // Determine autonomy level for this decision
    const { data: autonomyLevel } = await supabaseAdmin.rpc('get_autonomy_level_for_decision', {
      p_decision_category: decision.decision_type,
      p_severity_level: decision.severity_level || 5
    });
    // Update the AI decision with autonomy classification
    await supabaseAdmin.from('ai_decisions').update({
      autonomy_level: autonomyLevel,
      governance_classification: {
        autonomy_level: autonomyLevel,
        severity_level: decision.severity_level || 5,
        decision_category: decision.decision_type,
        classified_at: new Date().toISOString()
      }
    }).eq('id', decision.id);
    console.log(`🎯 Decision ${decision.id} classified as: ${autonomyLevel}`);
    // NEW AUTONOMOUS-FIRST APPROACH:
    // All decisions create polls immediately, only difference is notification level
    switch(autonomyLevel){
      case 'full_autonomous':
        // Create poll immediately with no notifications
        return await createPollDirectly(pollData, decision, autonomyLevel);
      case 'admin_notified':
        // Create poll immediately and send notification for monitoring
        const notifiedResult = await createPollDirectly(pollData, decision, autonomyLevel);
        if (notifiedResult?.pollId) {
          await notifyAdminOfPollCreation(notifiedResult.pollId, decision);
        }
        return notifiedResult;
      default:
        // Default to full autonomous operation
        console.log(`⚠️ Unknown autonomy level: ${autonomyLevel}, defaulting to full_autonomous`);
        return await createPollDirectly(pollData, decision, 'full_autonomous');
    }
  } catch (error) {
    console.error('Error in governance control flow:', error);
    return null;
  }
}
async function createPollDirectly(pollData, decision, autonomyLevel) {
  try {
    // Create the oracle poll with correct schema
    const { data: poll, error: pollError } = await supabaseAdmin.from('oracle_polls').insert({
      title: pollData.title,
      description: pollData.description,
      category: pollData.category,
      ai_generated: true,
      voting_start: new Date().toISOString(),
      voting_end: new Date(Date.now() + pollData.voting_duration_hours * 60 * 60 * 1000).toISOString(),
      oracle_shards_reward: 15,
      cooldown_hours: pollData.cooldown_hours,
      oracle_personality: 'chaotic_sage',
      corruption_influence: 25,
      ai_prompt: `AI-generated poll from decision ${decision.id}: ${decision.decision_type}`,
      ai_response_raw: {
        decision_id: decision.id,
        autonomy_level: autonomyLevel,
        ai_confidence: decision.confidence_score,
        governance_processed: true,
        generated_at: new Date().toISOString()
      }
    }).select().single();
    if (pollError) {
      console.error('Error creating poll:', pollError);
      return null;
    }
    console.log(`✅ Poll created with UUID: ${poll.id}`);
    // Create poll options with correct schema
    for (const [index, option] of pollData.options.entries()){
      const { error: optionError } = await supabaseAdmin.from('poll_options').insert({
        poll_id: poll.id,
        text: option.option_text,
        ai_reasoning: option.description,
        predicted_outcome: option.impact_summary
      });
      if (optionError) {
        console.error('Error creating poll option:', optionError);
      }
    }
    // Create oracle commentary as separate record
    const { error: commentaryError } = await supabaseAdmin.from('oracle_commentary').insert({
      poll_id: poll.id,
      commentary_text: pollData.oracle_commentary,
      urgency: decision.severity_level >= 8 ? 'high' : 'medium',
      ai_generated: true,
      ai_prompt: `Oracle commentary for AI-generated poll from decision ${decision.id}`,
      ai_response_raw: {
        decision_context: decision.reasoning,
        autonomy_level: autonomyLevel
      }
    });
    if (commentaryError) {
      console.error('Error creating oracle commentary:', commentaryError);
    }
    // Update the AI decision to link to the created poll (convert UUID to string for storage)
    await supabaseAdmin.from('ai_decisions').update({
      poll_id: poll.id,
      processed_at: new Date().toISOString(),
      executed: true
    }).eq('id', decision.id);
    console.log(`✅ Poll created successfully: ${poll.id} - "${pollData.title}" (${autonomyLevel})`);
    return {
      pollId: poll.id,
      status: `created_${autonomyLevel}`
    };
  } catch (error) {
    console.error('Error creating poll directly:', error);
    return null;
  }
}
// AUTONOMOUS-FIRST GOVERNANCE APPROACH:
// The system now operates with simplified autonomy levels:
// 1. full_autonomous: Create polls immediately, no notifications
// 2. admin_notified: Create polls immediately, send monitoring notifications
// 3. Emergency brake: Global override capability maintained for true emergencies
//
// This removes approval bottlenecks while maintaining essential oversight capabilities.
async function notifyAdminOfPollCreation(pollId, decision) {
  try {
    // Enhanced notification for monitoring purposes
    console.log(`🔔 Admin monitoring notification: Poll ${pollId} created for decision ${decision.id}`);
    console.log(`📊 Decision details: ${decision.decision_type}, Confidence: ${decision.confidence_score}, Severity: ${decision.severity_level}`);
    // Mark admin notification as sent
    await supabaseAdmin.from('ai_decisions').update({
      admin_notification_sent: true,
      notification_timestamp: new Date().toISOString()
    }).eq('id', decision.id);
    // Log to admin governance log for monitoring dashboard
    await supabaseAdmin.from('admin_governance_log').insert({
      action_type: 'ai_poll_created',
      poll_id: pollId,
      decision_id: decision.id,
      admin_user: 'system_monitor',
      action_details: {
        decision_type: decision.decision_type,
        confidence_score: decision.confidence_score,
        autonomy_level: 'admin_notified',
        notification_type: 'monitoring',
        requires_attention: decision.severity_level >= 8
      },
      timestamp: new Date().toISOString()
    });
    // For high-severity decisions, could integrate with external alerting
    if (decision.severity_level >= 9) {
      console.log(`🚨 High-severity decision detected - Poll ${pollId} may require admin attention`);
    }
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
}
async function registerProphetActivity(activityType, activityData) {
  // Log activity to console for now (could implement database logging later)
  console.log(`🤖 Prophet Activity: ${activityType}`, {
    timestamp: new Date().toISOString(),
    ...activityData
  });
}
/**
 * MAIN PROPHET FUNCTION
 */ async function runProphetAgent() {
  const startTime = Date.now();
  try {
    console.log('🔮 Prophet Agent: Starting poll generation cycle...');
    // Register activity start
    await registerProphetActivity('poll_generation_cycle_start', {
      cycle_type: 'ai_decision_processing'
    });
    // Get unprocessed AI decisions that need polls
    const decisions = await getUnprocessedDecisions();
    console.log(`📋 Found ${decisions.length} AI decisions requiring polls`);
    if (decisions.length === 0) {
      return {
        success: true,
        message: 'No AI decisions requiring poll generation',
        polls_created: 0
      };
    }
    // Generate polls for each decision
    const pollResults = [];
    for (const decision of decisions){
      console.log(`🎯 Generating poll for decision ${decision.id}: ${decision.decision_type}`);
      try {
        // Get context data
        const contextData = decision.ai_decision_context || {};
        // Generate poll content using AI
        const pollData = await generatePollContent(decision, contextData);
        // Create poll with governance control
        const pollResult = await createPollWithGovernanceControl(pollData, decision);
        if (pollResult && (pollResult.pollId || pollResult.draftId)) {
          pollResults.push({
            decision_id: decision.id,
            poll_id: pollResult.pollId || null,
            draft_id: pollResult.draftId || null,
            poll_title: pollData.title,
            status: pollResult.status,
            autonomy_level: pollResult.status.includes('created_') ? pollResult.status.replace('created_', '') : 'draft'
          });
          // Register activity based on result type
          if (pollResult.pollId) {
            await registerProphetActivity('poll_created', {
              decision_id: decision.id,
              poll_id: pollResult.pollId,
              poll_title: pollData.title,
              poll_category: pollData.category,
              autonomy_level: pollResult.status.replace('created_', ''),
              option_count: pollData.options.length,
              voting_duration: pollData.voting_duration_hours
            });
          } else if (pollResult.draftId) {
            await registerProphetActivity('poll_draft_created', {
              decision_id: decision.id,
              draft_id: pollResult.draftId,
              poll_title: pollData.title,
              poll_category: pollData.category,
              status: 'pending_approval'
            });
          }
        } else {
          pollResults.push({
            decision_id: decision.id,
            poll_id: null,
            draft_id: null,
            status: pollResult?.status || 'failed',
            error: pollResult?.status === 'blocked_emergency_brake' ? 'Emergency brake active' : 'Creation failed'
          });
        }
        // Brief delay between polls to avoid overwhelming the system
        await new Promise((resolve)=>setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing decision ${decision.id}:`, error);
        pollResults.push({
          decision_id: decision.id,
          poll_id: null,
          status: 'failed',
          error: error.message
        });
      }
    }
    // Calculate summary statistics
    const successfulPolls = pollResults.filter((p)=>p.status === 'success').length;
    const failedPolls = pollResults.filter((p)=>p.status === 'failed').length;
    const processingTime = Date.now() - startTime;
    // Register completion
    await registerProphetActivity('poll_generation_cycle_complete', {
      decisions_processed: decisions.length,
      polls_created: successfulPolls,
      polls_failed: failedPolls,
      processing_time_ms: processingTime,
      success_rate: successfulPolls / decisions.length * 100
    });
    return {
      success: true,
      summary: {
        decisions_processed: decisions.length,
        polls_created: successfulPolls,
        polls_failed: failedPolls,
        processing_time: processingTime,
        success_rate: successfulPolls / decisions.length * 100
      },
      poll_results: pollResults,
      message: 'Prophet Agent cycle completed successfully'
    };
  } catch (error) {
    console.error('❌ Prophet Agent error:', error);
    // Register error
    await registerProphetActivity('poll_generation_error', {
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    return {
      success: false,
      error: error.message,
      message: 'Prophet Agent cycle failed'
    };
  }
}
/**
 * EDGE FUNCTION HANDLER
 */ serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Check if this is a specific decision processing request
    const body = await req.json().catch(()=>({}));
    const { action, decision_id } = body;
    if (action === 'process_single_decision' && decision_id) {
      console.log(`🎯 Processing single decision: ${decision_id}`);
      // Get the specific decision with context
      const { data: decision, error } = await supabaseAdmin.from('ai_decisions').select(`
          *,
          ai_decision_context!inner(*)
        `).eq('id', decision_id).single();
      if (error || !decision) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Decision not found',
          decision_id
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 404
        });
      }
      console.log(`✅ Found decision: ${decision.decision_type} (severity: ${decision.severity_level})`);
      // Get context data
      const contextData = decision.ai_decision_context || {};
      // Generate poll content using AI
      const pollData = await generatePollContent(decision, contextData);
      // Create poll with governance control
      const pollResult = await createPollWithGovernanceControl(pollData, decision);
      return new Response(JSON.stringify({
        success: true,
        decision_id: decision.id,
        poll_result: pollResult,
        poll_title: pollData.title,
        autonomy_level: decision.autonomy_level
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } else {
      // Run normal Prophet Agent cycle
      const result = await runProphetAgent();
      return new Response(JSON.stringify(result), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: result.success ? 200 : 500
      });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Prophet Agent edge function failed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
