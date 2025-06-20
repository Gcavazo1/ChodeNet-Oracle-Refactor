// AI ANALYST AGENT - THE DEEP THINKER
// Performs complex analysis and reasoning to understand ecosystem patterns

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

// Groq API configuration
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface AnalysisContext {
  id: number;
  context_type: string;
  severity_level: number;
  data_snapshot: any;
  created_at: string;
}

interface EcosystemMetric {
  metric_type: string;
  metric_value: number;
  severity_level: number;
  metadata: any;
  timestamp: string;
}

interface AnalysisResult {
  context_id: number;
  analysis_type: string;
  insights: string[];
  root_causes: string[];
  predicted_outcomes: any;
  recommended_actions: any;
  confidence_score: number;
  requires_governance: boolean;
}

/**
 * ANALYST AGENT - CORE ANALYSIS FUNCTIONS
 */

async function getUnprocessedContexts(): Promise<AnalysisContext[]> {
  const { data, error } = await supabaseAdmin
    .from('ai_decision_context')
    .select('*')
    .eq('processed', false)
    .gte('severity_level', 5) // Focus on medium to critical issues
    .order('severity_level', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching unprocessed contexts:', error);
    return [];
  }

  return data || [];
}

async function getRecentEcosystemMetrics(hours: number = 24): Promise<EcosystemMetric[]> {
  const { data, error } = await supabaseAdmin
    .from('ecosystem_metrics')
    .select('metric_type, metric_value, severity_level, metadata, timestamp')
    .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching ecosystem metrics:', error);
    return [];
  }

  return data || [];
}

async function performDeepAnalysis(context: AnalysisContext, metrics: EcosystemMetric[]): Promise<AnalysisResult> {
  try {
    // Prepare analysis data
    const contextData = context.data_snapshot;
    const relevantMetrics = metrics.filter(m => 
      m.metric_type === contextData.metric_type || 
      m.severity_level >= 6
    );

    // Build comprehensive analysis prompt for Groq
    const analysisPrompt = `
You are the Oracle's Analyst Agent, performing deep ecosystem analysis for the CHODE-NET gaming community.

CONTEXT TO ANALYZE:
- Type: ${context.context_type}
- Severity: ${context.severity_level}/10
- Data: ${JSON.stringify(contextData, null, 2)}

RECENT ECOSYSTEM METRICS:
${relevantMetrics.map(m => `- ${m.metric_type}: ${m.metric_value} (severity: ${m.severity_level})`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Identify the root causes of this issue
2. Predict likely outcomes if unaddressed
3. Determine impact on different stakeholder groups (new players, veterans, token holders)
4. Assess whether this requires community governance decision
5. Recommend specific actions with expected impact

Respond in JSON format:
{
  "insights": ["key insight 1", "key insight 2", "key insight 3"],
  "root_causes": ["root cause 1", "root cause 2"],
  "predicted_outcomes": {
    "if_no_action": ["outcome 1", "outcome 2"],
    "timeline": "short_term | medium_term | long_term",
    "impact_severity": "low | medium | high | critical"
  },
  "stakeholder_impact": {
    "new_players": "positive | neutral | negative",
    "veterans": "positive | neutral | negative", 
    "token_holders": "positive | neutral | negative",
    "overall_community": "positive | neutral | negative"
  },
  "recommended_actions": [
    {
      "action": "specific action description",
      "type": "immediate | short_term | long_term",
      "expected_impact": "description of expected result",
      "requires_vote": true/false
    }
  ],
  "confidence_score": 0.85,
  "requires_governance": true/false,
  "urgency_level": 1-10
}
`;

    // Call Groq API for analysis
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
            content: 'You are an expert AI analyst for a blockchain gaming ecosystem. Provide detailed, actionable analysis in the requested JSON format.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more analytical responses
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const groqResult = await response.json();
    const analysisText = groqResult.choices[0]?.message?.content || '{}';
    
    // Parse the JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse Groq analysis:', parseError);
      
      // Fallback analysis if JSON parsing fails
      analysisData = {
        insights: ['AI analysis parsing failed - manual review required'],
        root_causes: ['Unknown - analysis error'],
        predicted_outcomes: {
          if_no_action: ['Potential negative impact'],
          timeline: 'medium_term',
          impact_severity: 'medium'
        },
        stakeholder_impact: {
          new_players: 'neutral',
          veterans: 'neutral',
          token_holders: 'neutral',
          overall_community: 'neutral'
        },
        recommended_actions: [{
          action: 'Manual review required',
          type: 'immediate',
          expected_impact: 'Proper analysis needed',
          requires_vote: false
        }],
        confidence_score: 0.1,
        requires_governance: false,
        urgency_level: context.severity_level
      };
    }

    return {
      context_id: context.id,
      analysis_type: 'deep_ecosystem_analysis',
      insights: analysisData.insights || [],
      root_causes: analysisData.root_causes || [],
      predicted_outcomes: analysisData.predicted_outcomes || {},
      recommended_actions: analysisData.recommended_actions || [],
      confidence_score: analysisData.confidence_score || 0.5,
      requires_governance: analysisData.requires_governance || false
    };

  } catch (error) {
    console.error('Error in deep analysis:', error);
    
    // Return error analysis
    return {
      context_id: context.id,
      analysis_type: 'analysis_error',
      insights: ['Analysis failed due to technical error'],
      root_causes: ['AI analysis system error'],
      predicted_outcomes: {
        error: error.message
      },
      recommended_actions: [{
        action: 'Fix analysis system',
        type: 'immediate',
        expected_impact: 'Restore AI analysis capability',
        requires_vote: false
      }],
      confidence_score: 0,
      requires_governance: false
    };
  }
}

async function storeAnalysisResult(analysis: AnalysisResult): Promise<void> {
  try {
    // Create an AI decision record
    const { data: decision, error: decisionError } = await supabaseAdmin
      .from('ai_decisions')
      .insert({
        decision_type: analysis.requires_governance ? 'policy_proposal' : 'system_optimization',
        context_id: analysis.context_id,
        reasoning: `Analyst Agent Analysis: ${analysis.insights.join('; ')}`,
        proposed_action: {
          analysis_type: analysis.analysis_type,
          recommended_actions: analysis.recommended_actions,
          predicted_outcomes: analysis.predicted_outcomes
        },
        estimated_impact: {
          root_causes: analysis.root_causes,
          stakeholder_impact: analysis.predicted_outcomes
        },
        confidence_score: analysis.confidence_score,
        requires_vote: analysis.requires_governance,
        executed: false
      })
      .select()
      .single();

    if (decisionError) {
      console.error('Error storing AI decision:', decisionError);
      return;
    }

    // Mark the original context as processed
    await supabaseAdmin
      .from('ai_decision_context')
      .update({ processed: true })
      .eq('id', analysis.context_id);

    // Register agent activity
    await supabaseAdmin.rpc('log_agent_activity', {
      p_agent_type: 'analyst',
      p_agent_name: 'analyst_deep_thinker',
      p_activity_data: {
        activity_type: 'analysis_completed',
        context_id: analysis.context_id,
        analysis_type: analysis.analysis_type,
        confidence_score: analysis.confidence_score,
        requires_governance: analysis.requires_governance,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ Analysis stored for context ${analysis.context_id}, decision ID: ${decision.id}`);

  } catch (error) {
    console.error('Error storing analysis result:', error);
  }
}

async function identifyTrendsAndPatterns(metrics: EcosystemMetric[]): Promise<any> {
  // Group metrics by type for trend analysis
  const metricGroups = metrics.reduce((groups, metric) => {
    if (!groups[metric.metric_type]) {
      groups[metric.metric_type] = [];
    }
    groups[metric.metric_type].push(metric);
    return groups;
  }, {} as Record<string, EcosystemMetric[]>);

  const trends = {};

  for (const [metricType, metricList] of Object.entries(metricGroups)) {
    if (metricList.length < 3) continue; // Need at least 3 data points for trend
    
    // Sort by timestamp
    const sortedMetrics = metricList.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Calculate trend direction
    const values = sortedMetrics.map(m => m.metric_value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const trendDirection = lastValue > firstValue ? 'increasing' : 
                          lastValue < firstValue ? 'decreasing' : 'stable';
    
    // Calculate volatility
    const volatility = values.reduce((sum, val, idx, arr) => {
      if (idx === 0) return 0;
      return sum + Math.abs(val - arr[idx - 1]);
    }, 0) / (values.length - 1);
    
    trends[metricType] = {
      direction: trendDirection,
      change_magnitude: Math.abs((lastValue - firstValue) / firstValue) * 100,
      volatility: volatility,
      data_points: values.length,
      current_severity: sortedMetrics[sortedMetrics.length - 1].severity_level
    };
  }

  return trends;
}

/**
 * MAIN ANALYST FUNCTION
 */
async function runAnalystAgent(): Promise<any> {
  const startTime = Date.now();
  
  try {
    console.log('🧠 Analyst Agent: Starting deep ecosystem analysis...');
    
    // Register activity start
    await supabaseAdmin.rpc('log_agent_activity', {
      p_agent_type: 'analyst',
      p_agent_name: 'analyst_deep_thinker',
      p_activity_data: {
        activity_type: 'analysis_cycle_start',
        timestamp: new Date().toISOString()
      }
    });

    // Get unprocessed contexts that need analysis
    const contexts = await getUnprocessedContexts();
    console.log(`📋 Found ${contexts.length} contexts requiring analysis`);
    
    if (contexts.length === 0) {
      return {
        success: true,
        message: 'No contexts requiring analysis',
        processed_contexts: 0
      };
    }

    // Get recent ecosystem metrics for context
    const metrics = await getRecentEcosystemMetrics(24);
    console.log(`📊 Retrieved ${metrics.length} recent ecosystem metrics`);

    // Identify overall trends and patterns
    const trends = await identifyTrendsAndPatterns(metrics);
    console.log('📈 Trend analysis completed');

    // Process each context
    const analysisResults = [];
    for (const context of contexts) {
      console.log(`🔍 Analyzing context ${context.id}: ${context.context_type}`);
      
      const analysis = await performDeepAnalysis(context, metrics);
      await storeAnalysisResult(analysis);
      analysisResults.push(analysis);
      
      // Brief delay between analyses to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate summary statistics
    const governanceRequiredCount = analysisResults.filter(a => a.requires_governance).length;
    const avgConfidence = analysisResults.reduce((sum, a) => sum + a.confidence_score, 0) / analysisResults.length;
    const processingTime = Date.now() - startTime;

    // Register completion
    await supabaseAdmin.rpc('log_agent_activity', {
      p_agent_type: 'analyst',
      p_agent_name: 'analyst_deep_thinker',
      p_activity_data: {
        activity_type: 'analysis_cycle_complete',
        processed_contexts: contexts.length,
        governance_required: governanceRequiredCount,
        average_confidence: avgConfidence,
        processing_time_ms: processingTime,
        trends_identified: Object.keys(trends).length,
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: true,
      summary: {
        processed_contexts: contexts.length,
        governance_decisions_required: governanceRequiredCount,
        average_confidence_score: avgConfidence,
        processing_time: processingTime,
        trends_identified: trends
      },
      analysis_results: analysisResults,
      message: 'Analyst Agent cycle completed successfully'
    };

  } catch (error) {
    console.error('❌ Analyst Agent error:', error);
    
    // Register error
    await supabaseAdmin.rpc('log_agent_activity', {
      p_agent_type: 'analyst',
      p_agent_name: 'analyst_deep_thinker',
      p_activity_data: {
        activity_type: 'analysis_error',
        error_message: error.message,
        processing_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: false,
      error: error.message,
      message: 'Analyst Agent cycle failed'
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
    const result = await runAnalystAgent();
    
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
        message: 'Analyst Agent edge function failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 