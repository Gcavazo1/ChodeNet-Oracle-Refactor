// AI SCRIBE AGENT - THE MEMORY KEEPER
// Tracks decision outcomes, learns from results, and optimizes AI performance

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Initialize Supabase client with service role for full access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Groq API configuration for learning analysis
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ExecutedDecision {
  id: number;
  decision_type: string;
  reasoning: string;
  proposed_action: any;
  confidence_score: number;
  poll_id: number;
  executed: boolean;
  execution_timestamp: string;
  outcome_metrics: any;
  success_score: number;
  poll_details: any;
}

interface LearningPattern {
  pattern_type: string;
  description: string;
  confidence: number;
  supporting_evidence: any[];
  recommended_improvements: string[];
}

interface AgentPerformance {
  agent_type: string;
  success_rate: number;
  average_confidence: number;
  decision_accuracy: number;
  response_time: number;
  common_failures: string[];
  improvement_suggestions: string[];
}

/**
 * SCRIBE AGENT - CORE LEARNING FUNCTIONS
 */

async function getExecutedDecisionsForAnalysis(): Promise<ExecutedDecision[]> {
  const { data, error } = await supabaseAdmin
    .from('ai_decisions')
    .select(`
      *,
      oracle_polls(
        id,
        title,
        category,
        voting_end,
        execution_status,
        execution_details,
        poll_votes(count)
      )
    `)
    .eq('executed', true)
    .gte('execution_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
    .order('execution_timestamp', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching executed decisions:', error);
    return [];
  }

  return data || [];
}

async function analyzeDecisionPatterns(decisions: ExecutedDecision[]): Promise<LearningPattern[]> {
  if (decisions.length === 0) {
    return [];
  }

  try {
    // Prepare pattern analysis data
    const analysisData = decisions.map(d => ({
      decision_type: d.decision_type,
      confidence_score: d.confidence_score,
      success_score: d.success_score,
      execution_success: d.outcome_metrics?.execution_success,
      vote_margin: d.outcome_metrics?.vote_outcome?.vote_margin,
      consensus_strength: d.outcome_metrics?.vote_outcome?.consensus_strength,
      category: d.poll_details?.category
    }));

    // Build pattern analysis prompt
    const patternPrompt = `
You are the Oracle's Scribe Agent, analyzing AI decision patterns to improve future performance.

EXECUTED DECISIONS DATA (last 7 days):
${JSON.stringify(analysisData, null, 2)}

PATTERN ANALYSIS REQUIREMENTS:
1. Identify successful decision patterns (high success_score + execution_success)
2. Identify failure patterns (low success_score or execution_success = false)
3. Analyze confidence vs actual success correlation
4. Look for category-specific patterns
5. Identify voting patterns (high/low consensus_strength)
6. Generate specific improvement recommendations

Focus on:
- Which decision types work best
- Confidence score calibration accuracy
- Community response patterns
- Execution success factors
- Optimal voting thresholds

Respond in JSON format:
{
  "patterns": [
    {
      "pattern_type": "success_pattern | failure_pattern | confidence_calibration | community_response | execution_quality",
      "description": "Clear description of the identified pattern",
      "confidence": 0.85,
      "supporting_evidence": [
        "evidence 1",
        "evidence 2"
      ],
      "recommended_improvements": [
        "specific improvement 1",
        "specific improvement 2"
      ]
    }
  ]
}
`;

    // Call Groq API for pattern analysis
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are the Oracle\'s Scribe Agent, expert in pattern analysis and AI system optimization. Identify actionable patterns for improving the AI democratic governance system.'
          },
          {
            role: 'user',
            content: patternPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for analytical precision
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const groqResult = await response.json();
    const patternsText = groqResult.choices[0]?.message?.content || '{"patterns": []}';
    
    // Parse the JSON response
    let patternsData;
    try {
      patternsData = JSON.parse(patternsText);
    } catch (parseError) {
      console.error('Failed to parse Groq pattern analysis:', parseError);
      
      // Fallback pattern analysis
      const successfulDecisions = decisions.filter(d => d.success_score > 0.7);
      const failedDecisions = decisions.filter(d => d.success_score < 0.4);
      
      patternsData = {
        patterns: [
          {
            pattern_type: 'success_pattern',
            description: `${successfulDecisions.length} of ${decisions.length} decisions were successful`,
            confidence: 0.8,
            supporting_evidence: [`Success rate: ${(successfulDecisions.length / decisions.length * 100).toFixed(1)}%`],
            recommended_improvements: ['Continue monitoring decision outcomes']
          },
          {
            pattern_type: 'failure_pattern', 
            description: `${failedDecisions.length} decisions had low success scores`,
            confidence: 0.7,
            supporting_evidence: [`Failure count: ${failedDecisions.length}`],
            recommended_improvements: ['Review failed decision characteristics']
          }
        ]
      };
    }

    return patternsData.patterns || [];

  } catch (error) {
    console.error('Error analyzing decision patterns:', error);
    return [{
      pattern_type: 'analysis_error',
      description: 'Failed to analyze decision patterns due to technical error',
      confidence: 0.1,
      supporting_evidence: [error.message],
      recommended_improvements: ['Fix pattern analysis system']
    }];
  }
}

async function calculateAgentPerformance(): Promise<AgentPerformance[]> {
  const performances: AgentPerformance[] = [];
  
  const agentTypes = ['sentinel', 'analyst', 'prophet', 'arbiter'];
  
  for (const agentType of agentTypes) {
    try {
      // Get recent agent activities
      const { data: activities } = await supabaseAdmin
        .from('ai_agents')
        .select('performance_metrics, last_activity')
        .eq('agent_type', agentType)
        .gte('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!activities || activities.length === 0) {
        performances.push({
          agent_type: agentType,
          success_rate: 0,
          average_confidence: 0,
          decision_accuracy: 0,
          response_time: 0,
          common_failures: ['No recent activity'],
          improvement_suggestions: ['Check agent scheduling and health']
        });
        continue;
      }

      // Calculate performance metrics
      const metrics = activities.map(a => a.performance_metrics || {});
      const successRate = metrics.length > 0 ? 
        metrics.reduce((sum, m) => sum + (m.success_rate || 0), 0) / metrics.length : 0;
      const avgConfidence = metrics.length > 0 ?
        metrics.reduce((sum, m) => sum + (m.average_confidence || 0), 0) / metrics.length : 0;
      const avgResponseTime = metrics.length > 0 ?
        metrics.reduce((sum, m) => sum + (m.processing_time_ms || 0), 0) / metrics.length : 0;

      performances.push({
        agent_type: agentType,
        success_rate: successRate,
        average_confidence: avgConfidence,
        decision_accuracy: successRate, // Simplified - would need more complex calculation
        response_time: avgResponseTime,
        common_failures: [], // Would analyze error logs
        improvement_suggestions: successRate < 0.8 ? 
          [`Improve ${agentType} success rate`, 'Review decision logic'] : 
          [`Maintain ${agentType} performance`]
      });

    } catch (error) {
      console.error(`Error calculating performance for ${agentType}:`, error);
      performances.push({
        agent_type: agentType,
        success_rate: 0,
        average_confidence: 0,
        decision_accuracy: 0,
        response_time: 0,
        common_failures: ['Performance calculation failed'],
        improvement_suggestions: ['Fix performance monitoring']
      });
    }
  }

  return performances;
}

async function storeLearnedPatterns(patterns: LearningPattern[]): Promise<void> {
  try {
    for (const pattern of patterns) {
      const { error } = await supabaseAdmin
        .from('ai_learning_patterns')
        .insert({
          pattern_type: pattern.pattern_type,
          description: pattern.description,
          confidence: pattern.confidence,
          supporting_evidence: pattern.supporting_evidence,
          recommended_improvements: pattern.recommended_improvements,
          identified_at: new Date().toISOString(),
          agent_source: 'scribe'
        });

      if (error) {
        console.error('Error storing learning pattern:', error);
      }
    }
  } catch (error) {
    console.error('Error storing learned patterns:', error);
  }
}

async function updateSystemConfiguration(patterns: LearningPattern[]): Promise<void> {
  try {
    // Extract actionable improvements from patterns
    const improvements = patterns.flatMap(p => p.recommended_improvements);
    
    // Update AI agent configurations based on learned patterns
    for (const improvement of improvements) {
      if (improvement.includes('confidence')) {
        // Adjust confidence thresholds
        await supabaseAdmin
          .from('ai_system_config')
          .upsert({
            config_key: 'confidence_threshold_adjustment',
            config_value: {
              improvement: improvement,
              adjusted_at: new Date().toISOString(),
              reason: 'scribe_learning'
            }
          });
      }
      
      if (improvement.includes('voting')) {
        // Adjust voting criteria
        await supabaseAdmin
          .from('ai_system_config')
          .upsert({
            config_key: 'voting_criteria_adjustment',
            config_value: {
              improvement: improvement,
              adjusted_at: new Date().toISOString(),
              reason: 'scribe_learning'
            }
          });
      }
    }
  } catch (error) {
    console.error('Error updating system configuration:', error);
  }
}

async function generateSystemReport(patterns: LearningPattern[], performances: AgentPerformance[]): Promise<any> {
  const totalDecisions = await supabaseAdmin
    .from('ai_decisions')
    .select('id', { count: 'exact' })
    .eq('executed', true);

  const recentDecisions = await supabaseAdmin
    .from('ai_decisions')
    .select('id', { count: 'exact' })
    .eq('executed', true)
    .gte('execution_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const systemHealth = performances.reduce((avg, p) => avg + p.success_rate, 0) / performances.length;

  return {
    timestamp: new Date().toISOString(),
    system_health: {
      overall_score: systemHealth,
      total_decisions_executed: totalDecisions.count || 0,
      recent_decisions_7d: recentDecisions.count || 0,
      agent_count: performances.length
    },
    agent_performances: performances,
    learned_patterns: patterns,
    key_insights: patterns
      .filter(p => p.confidence > 0.7)
      .map(p => p.description),
    recommended_actions: patterns
      .flatMap(p => p.recommended_improvements)
      .slice(0, 5) // Top 5 recommendations
  };
}

async function registerScribeActivity(activityType: string, activityData: any): Promise<void> {
  await supabaseAdmin.rpc('log_agent_activity', {
    p_agent_type: 'scribe',
    p_agent_name: 'scribe_memory_keeper',
    p_activity_data: {
      activity_type: activityType,
      timestamp: new Date().toISOString(),
      ...activityData
    }
  });
}

/**
 * MAIN SCRIBE FUNCTION
 */
async function runScribeAgent(): Promise<any> {
  const startTime = Date.now();
  
  try {
    console.log('📚 Scribe Agent: Starting learning and optimization cycle...');
    
    // Register activity start
    await registerScribeActivity('learning_cycle_start', {
      analysis_type: 'decision_pattern_analysis'
    });

    // Get executed decisions for analysis
    const decisions = await getExecutedDecisionsForAnalysis();
    console.log(`📊 Analyzing ${decisions.length} executed decisions from the last 7 days`);
    
    if (decisions.length === 0) {
      return {
        success: true,
        message: 'No executed decisions to analyze',
        patterns_learned: 0
      };
    }

    // Analyze decision patterns
    const patterns = await analyzeDecisionPatterns(decisions);
    console.log(`🔍 Identified ${patterns.length} decision patterns`);

    // Calculate agent performance metrics
    const performances = await calculateAgentPerformance();
    console.log(`📈 Calculated performance for ${performances.length} AI agents`);

    // Store learned patterns for future reference
    await storeLearnedPatterns(patterns);

    // Update system configuration based on learning
    await updateSystemConfiguration(patterns);

    // Generate comprehensive system report
    const systemReport = await generateSystemReport(patterns, performances);

    // Calculate processing statistics
    const processingTime = Date.now() - startTime;
    const highConfidencePatterns = patterns.filter(p => p.confidence > 0.8).length;
    const improvementActions = patterns.flatMap(p => p.recommended_improvements).length;

    // Register completion
    await registerScribeActivity('learning_cycle_complete', {
      decisions_analyzed: decisions.length,
      patterns_identified: patterns.length,
      high_confidence_patterns: highConfidencePatterns,
      improvement_actions: improvementActions,
      processing_time_ms: processingTime,
      system_health_score: systemReport.system_health.overall_score
    });

    return {
      success: true,
      summary: {
        decisions_analyzed: decisions.length,
        patterns_learned: patterns.length,
        high_confidence_patterns: highConfidencePatterns,
        system_health_score: systemReport.system_health.overall_score,
        processing_time: processingTime
      },
      system_report: systemReport,
      learned_patterns: patterns,
      agent_performances: performances,
      message: 'Scribe Agent learning cycle completed successfully'
    };

  } catch (error) {
    console.error('❌ Scribe Agent error:', error);
    
    // Register error
    await registerScribeActivity('learning_error', {
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });

    return {
      success: false,
      error: error.message,
      message: 'Scribe Agent learning cycle failed'
    };
  }
}

/**
 * EDGE FUNCTION HANDLER
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const result = await runScribeAgent();
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500,
      }
    );
    
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        message: 'Scribe Agent edge function failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 