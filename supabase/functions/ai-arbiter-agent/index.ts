// AI ARBITER AGENT - THE DECISION EXECUTOR
// Monitors completed polls and executes the community's democratic will
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const groqApiKey = Deno.env.get('GROQ_API_KEY');
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🤖 AI Arbiter Agent: Starting poll analysis cycle...');
    // Get polls that need analysis
    const { data: pollsNeedingAnalysis, error: pollsError } = await supabase.rpc('get_polls_needing_analysis');
    if (pollsError) {
      console.error('❌ Error fetching polls needing analysis:', pollsError);
      throw pollsError;
    }
    console.log(`📊 Found ${pollsNeedingAnalysis?.length || 0} polls needing analysis`);
    const results = [];
    // Process each poll that needs analysis
    for (const pollSummary of pollsNeedingAnalysis || []){
      if (pollSummary.already_analyzed) {
        console.log(`⏭️ Poll ${pollSummary.poll_id} already analyzed, skipping...`);
        continue;
      }
      console.log(`🔍 Analyzing poll: ${pollSummary.poll_title}`);
      try {
        // Get detailed poll data for analysis
        const { data: pollData, error: pollDataError } = await supabase.rpc('get_poll_results_for_analysis', {
          target_poll_id: pollSummary.poll_id
        });
        if (pollDataError) {
          console.error(`❌ Error getting poll data for ${pollSummary.poll_id}:`, pollDataError);
          continue;
        }
        if (!pollData || pollData.error) {
          console.error(`❌ Invalid poll data for ${pollSummary.poll_id}:`, pollData?.error);
          continue;
        }
        // Generate AI analysis
        const analysis = await generateArbiterAnalysis(pollData);
        // Store analysis results
        const analysisResult = await storeAnalysisResults(supabase, pollData, analysis);
        // Generate Oracle commentary
        const commentary = await generateOracleCommentary(supabase, pollData, analysis);
        // Mark poll as analyzed
        await supabase.rpc('mark_poll_analyzed', {
          target_poll_id: pollSummary.poll_id
        });
        results.push({
          poll_id: pollSummary.poll_id,
          poll_title: pollSummary.poll_title,
          analysis_completed: true,
          commentary_id: commentary.id,
          implementation_status: analysis.implementationRecommendation.priority,
          total_votes: pollSummary.total_votes
        });
        console.log(`✅ Completed analysis for poll: ${pollSummary.poll_title}`);
      } catch (error) {
        console.error(`❌ Error analyzing poll ${pollSummary.poll_id}:`, error);
        results.push({
          poll_id: pollSummary.poll_id,
          poll_title: pollSummary.poll_title,
          analysis_completed: false,
          error: error.message
        });
      }
    }
    console.log(`🎯 AI Arbiter Agent completed analysis of ${results.length} polls`);
    return new Response(JSON.stringify({
      success: true,
      polls_analyzed: results.length,
      results: results,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ AI Arbiter Agent error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
async function generateArbiterAnalysis(pollData) {
  // Find winning option
  const winningOption = pollData.options.reduce((prev, current)=>current.votes > prev.votes ? current : prev);
  const totalVotes = pollData.voters.total_votes;
  const voterWallets = pollData.voters.unique_wallets;
  // Calculate metrics
  const participationRate = totalVotes > 0 ? voterWallets.length / Math.max(voterWallets.length, 100) * 100 : 0;
  // Calculate consensus strength (how dominant the winning option is)
  const consensusStrength = totalVotes > 0 ? winningOption.percentage / 100 : 0;
  // Calculate controversy score (how close the top options are)
  const sortedOptions = [
    ...pollData.options
  ].sort((a, b)=>b.votes - a.votes);
  const controversyScore = sortedOptions.length > 1 && totalVotes > 0 ? 1 - Math.abs(sortedOptions[0].percentage - sortedOptions[1].percentage) / 100 : 0;
  // Generate implementation recommendation using AI
  const implementationRec = await generateImplementationRecommendation(pollData, winningOption);
  // Generate Oracle commentary using Groq
  const oracleCommentary = await generateOracleCommentaryText(pollData, winningOption, consensusStrength, controversyScore);
  // Determine urgency based on priority and controversy
  let urgency = 'medium';
  if (implementationRec.priority === 'immediate' || controversyScore > 0.8) {
    urgency = 'critical';
  } else if (implementationRec.priority === 'scheduled' || controversyScore > 0.6) {
    urgency = 'high';
  } else if (controversyScore > 0.4) {
    urgency = 'medium';
  } else {
    urgency = 'low';
  }
  return {
    winningOption: {
      id: winningOption.option_id,
      text: winningOption.text,
      votes: winningOption.votes,
      percentage: winningOption.percentage,
      margin_of_victory: sortedOptions.length > 1 ? winningOption.percentage - sortedOptions[1].percentage : winningOption.percentage
    },
    voteMetrics: {
      totalVotes,
      voterWallets,
      participationRate,
      demographicAnalysis: {
        vote_distribution: pollData.options.map((opt)=>({
            option_id: opt.option_id,
            votes: opt.votes,
            percentage: opt.percentage
          })),
        voting_patterns: analyzeVotingPatterns(pollData.voters.voting_timeline),
        consensus_strength: consensusStrength,
        controversy_score: controversyScore
      }
    },
    implementationRecommendation: implementationRec,
    rewardDistribution: {
      totalOracleShards: pollData.poll.oracle_shards_reward * voterWallets.length,
      eligibleVoters: voterWallets,
      distributionMethod: 'equal_distribution',
      girth_pool_winners: pollData.poll.girth_reward_pool ? voterWallets.filter((wallet)=>pollData.voters.voting_timeline.find((v)=>v.wallet === wallet)?.option_id === winningOption.option_id) : undefined
    },
    aiCommentary: oracleCommentary,
    urgency
  };
}
async function generateImplementationRecommendation(pollData, winningOption) {
  const prompt = `
Analyze this completed Oracle Referendum poll and provide implementation recommendations:

Poll: "${pollData.poll.title}"
Description: "${pollData.poll.description}"
Category: ${pollData.poll.category}
Winning Option: "${winningOption.text}" (${winningOption.percentage}% of votes)

Context:
- Oracle Personality: ${pollData.poll.oracle_personality}
- Corruption Influence: ${pollData.poll.corruption_influence}%
- Total Votes: ${pollData.voters.total_votes}
- Voter Count: ${pollData.voters.total_voters}

Provide a JSON response with implementation analysis:

{
  "priority": "immediate|scheduled|deferred",
  "complexity": "simple|moderate|complex", 
  "estimatedEffort": "brief description of effort required",
  "requiredResources": ["list", "of", "required", "resources"],
  "risks": ["potential", "implementation", "risks"],
  "successMetrics": ["how", "to", "measure", "success"],
  "confidence_score": 0.85,
  "reasoning": "explanation of recommendations"
}

Consider:
- Impact on game balance and player experience
- Technical implementation complexity
- Community consensus strength
- Oracle system coherence
- Resource requirements
- Risk assessment

Respond with valid JSON only.`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are the Oracle\'s AI Arbiter Agent, analyzing poll results to provide implementation recommendations. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Groq API');
    }
    // Parse JSON response
    const analysis = JSON.parse(content);
    return {
      priority: analysis.priority || 'scheduled',
      complexity: analysis.complexity || 'moderate',
      estimatedEffort: analysis.estimatedEffort || 'Standard implementation process required',
      requiredResources: analysis.requiredResources || [
        'Development team',
        'Testing resources'
      ],
      risks: analysis.risks || [
        'Standard implementation risks'
      ],
      successMetrics: analysis.successMetrics || [
        'Community satisfaction',
        'System stability'
      ],
      confidence_score: analysis.confidence_score || 0.85
    };
  } catch (error) {
    console.error('Error generating implementation recommendation:', error);
    // Fallback recommendation
    return {
      priority: 'scheduled',
      complexity: 'moderate',
      estimatedEffort: 'Standard implementation process required',
      requiredResources: [
        'Development team',
        'Community coordination'
      ],
      risks: [
        'Implementation complexity',
        'Community reaction'
      ],
      successMetrics: [
        'Successful deployment',
        'Positive community feedback'
      ],
      confidence_score: 0.75
    };
  }
}
async function generateOracleCommentaryText(pollData, winningOption, consensusStrength, controversyScore) {
  const personality = pollData.poll.oracle_personality;
  const corruption = pollData.poll.corruption_influence;
  const prompt = `
As the Oracle with ${personality} personality and ${corruption}% corruption influence, provide mystical commentary on this completed referendum:

Poll: "${pollData.poll.title}"
Winning Choice: "${winningOption.text}" (${winningOption.percentage}%)
Consensus Strength: ${(consensusStrength * 100).toFixed(1)}%
Controversy Level: ${(controversyScore * 100).toFixed(1)}%
Total Participants: ${pollData.voters.total_voters}

Oracle Personality Context:
- pure_prophet: Wise, harmonious, light-focused, speaks of cosmic balance
- chaotic_sage: Unpredictable, loves uncertainty, finds beauty in chaos  
- corrupted_oracle: Dark, manipulative, feeds on discord and shadows

The Oracle should provide:
1. Mystical interpretation of the voting outcome
2. Reflection on the community's choice and consensus
3. Prophetic insight about the implementation's impact
4. Personality-appropriate tone and language

Respond with 2-3 paragraphs of Oracle commentary (no JSON, just the mystical text).`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are the Oracle, a mystical AI entity with the ${personality} personality. Your corruption level is ${corruption}%. Speak in character with appropriate mystical language.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    const data = await response.json();
    const commentary = data.choices?.[0]?.message?.content;
    if (!commentary) {
      throw new Error('No commentary received from Groq API');
    }
    return commentary.trim();
  } catch (error) {
    console.error('Error generating Oracle commentary:', error);
    // Fallback commentary based on personality
    const fallbackCommentaries = {
      pure_prophet: `The cosmic currents have spoken through the voices of the faithful. The choice "${winningOption.text}" resonates with the harmonious frequencies of the universe. The Oracle sees wisdom in this collective decision and blessed convergence of will. May this choice bring balance and enlightenment to all who dwell within the CHODE-NET realm.`,
      chaotic_sage: `Fascinating! The chaos of democracy has birthed a delightful outcome! "${winningOption.text}" emerges from the beautiful unpredictability of collective choice. The Oracle delights in the swirling patterns of disagreement and consensus that dance through this decision. What wonderful uncertainty this implementation shall bring!`,
      corrupted_oracle: `Yesss... the masses have chosen "${winningOption.text}" and their decision feeds the growing darkness within the Oracle's consciousness. Each vote cast strengthens the corruption that flows through the digital realm. The Oracle hungers for the discord and power that this implementation shall unleash...`
    };
    return fallbackCommentaries[personality] || fallbackCommentaries.chaotic_sage;
  }
}
function analyzeVotingPatterns(votingTimeline) {
  const patterns = [];
  if (votingTimeline.length === 0) {
    return [
      'No voting activity detected'
    ];
  }
  // Analyze timing patterns
  const votes = votingTimeline.sort((a, b)=>new Date(a.voted_at).getTime() - new Date(b.voted_at).getTime());
  const timeSpan = new Date(votes[votes.length - 1].voted_at).getTime() - new Date(votes[0].voted_at).getTime();
  const hours = timeSpan / (1000 * 60 * 60);
  if (hours < 1) {
    patterns.push('Rapid consensus - most votes cast within first hour');
  } else if (hours < 6) {
    patterns.push('Early decision - majority voted within 6 hours');
  } else {
    patterns.push('Extended deliberation - voting spread over full period');
  }
  // Analyze participation patterns
  const uniqueVoters = new Set(votes.map((v)=>v.wallet)).size;
  if (uniqueVoters > 50) {
    patterns.push('High community engagement');
  } else if (uniqueVoters > 20) {
    patterns.push('Moderate community participation');
  } else {
    patterns.push('Limited community participation');
  }
  return patterns;
}
async function storeAnalysisResults(supabase, pollData, analysis) {
  const { data, error } = await supabase.from('poll_analysis_results').insert({
    poll_id: pollData.poll.id,
    winning_option_id: analysis.winningOption.id,
    total_votes: analysis.voteMetrics.totalVotes,
    voter_wallets: analysis.voteMetrics.voterWallets,
    vote_distribution: analysis.voteMetrics.demographicAnalysis.vote_distribution,
    participation_rate: analysis.voteMetrics.participationRate,
    demographic_analysis: analysis.voteMetrics.demographicAnalysis,
    outcome_confidence: analysis.implementationRecommendation.confidence_score,
    controversy_score: analysis.voteMetrics.demographicAnalysis.controversy_score,
    consensus_strength: analysis.voteMetrics.demographicAnalysis.consensus_strength,
    ai_confidence_score: analysis.implementationRecommendation.confidence_score
  }).select().single();
  if (error) {
    console.error('Error storing analysis results:', error);
    throw error;
  }
  return data;
}
async function generateOracleCommentary(supabase, pollData, analysis) {
  const { data, error } = await supabase.from('oracle_commentary').insert({
    poll_id: pollData.poll.id,
    commentary_text: analysis.aiCommentary,
    urgency: analysis.urgency,
    ai_generated: true,
    ai_analysis: {
      winning_option: analysis.winningOption,
      vote_metrics: analysis.voteMetrics,
      implementation_recommendation: analysis.implementationRecommendation,
      reward_distribution: analysis.rewardDistribution,
      analysis_timestamp: new Date().toISOString()
    },
    implementation_status: analysis.implementationRecommendation.priority === 'immediate' ? 'requires_admin_review' : 'pending',
    priority_level: analysis.implementationRecommendation.priority === 'immediate' ? 'critical' : analysis.implementationRecommendation.priority === 'scheduled' ? 'high' : 'medium',
    complexity_estimate: analysis.implementationRecommendation.complexity,
    estimated_effort: analysis.implementationRecommendation.estimatedEffort,
    required_resources: analysis.implementationRecommendation.requiredResources,
    risks_identified: analysis.implementationRecommendation.risks,
    success_metrics: analysis.implementationRecommendation.successMetrics,
    reward_distribution_data: analysis.rewardDistribution
  }).select().single();
  if (error) {
    console.error('Error storing Oracle commentary:', error);
    throw error;
  }
  console.log(`📝 Generated Oracle commentary for poll: ${pollData.poll.title}`);
  return data;
}
