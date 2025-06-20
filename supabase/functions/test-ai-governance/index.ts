// TEST AI GOVERNANCE SYSTEM - Trigger autonomous poll generation
// This function simulates various scenarios to test the AI governance control system

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Initialize Supabase client with service role for full access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Also create a client with anon key for RPC calls that might have permission issues
const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface TestScenario {
  scenario: 'low_severity_game_balance' | 'high_severity_economic' | 'critical_technical' | 'mixed_scenarios' | 'emergency_test';
  count?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { scenario, count = 1 }: TestScenario = await req.json();

    console.log(`🧪 Testing AI Governance System - Scenario: ${scenario}`);

    const testResults = [];

    for (let i = 0; i < count; i++) {
      let testDecision;

      switch (scenario) {
        case 'low_severity_game_balance':
          testDecision = await createTestDecision({
            decision_type: 'game_balance',
            decision_title: `Balance Adjustment Test ${i + 1}`,
            decision_description: 'Testing low-severity game balance decision that should be fully autonomous',
            reasoning: 'Minor tap reward optimization based on player feedback patterns',
            confidence_score: 8,
            severity_level: 3, // Low severity - should be full_autonomous
            data_sources: {
              player_feedback: 'positive_trend',
              tap_metrics: 'within_normal_range',
              community_sentiment: 'stable'
            }
          });
          break;

        case 'high_severity_economic':
          testDecision = await createTestDecision({
            decision_type: 'economic_policy',
            decision_title: `Economic Policy Test ${i + 1}`,
            decision_description: 'Testing high-severity economic decision that should get admin notification but still create polls immediately',
            reasoning: 'Major GIRTH token distribution change affecting all players',
            confidence_score: 7,
            severity_level: 9, // High severity - should be admin_notified (autonomous with monitoring)
            data_sources: {
              economic_impact: 'high',
              player_base_effect: 'significant',
              token_distribution: 'major_change'
            }
          });
          break;

        case 'critical_technical':
          testDecision = await createTestDecision({
            decision_type: 'technical_upgrades',
            decision_title: `Critical Technical Update Test ${i + 1}`,
            decision_description: 'Testing critical technical decision that should get admin notification but remain autonomous',
            reasoning: 'Critical security update required for smart contract vulnerability',
            confidence_score: 9,
            severity_level: 10, // Critical - should be admin_notified (autonomous with high-priority monitoring)
            data_sources: {
              security_threat: 'critical',
              smart_contract_risk: 'high',
              immediate_action_required: true
            }
          });
          break;

        case 'mixed_scenarios':
          // Create a mix of different severity levels
          const scenarios = [
            { type: 'game_balance', severity: 2 },
            { type: 'community_rules', severity: 5 },
            { type: 'economic_policy', severity: 8 },
            { type: 'technical_upgrades', severity: 6 },
            { type: 'long_term_strategy', severity: 4 }
          ];
          const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
          
          testDecision = await createTestDecision({
            decision_type: randomScenario.type,
            decision_title: `Mixed Scenario Test ${i + 1} - ${randomScenario.type}`,
            decision_description: `Testing ${randomScenario.type} decision with severity ${randomScenario.severity}`,
            reasoning: `Automated test for ${randomScenario.type} governance classification`,
            confidence_score: Math.floor(Math.random() * 4) + 6, // 6-9
            severity_level: randomScenario.severity,
            data_sources: {
              test_scenario: randomScenario.type,
              automated_test: true
            }
          });
          break;

        case 'emergency_test':
          // Test emergency brake functionality
          await testEmergencyBrake();
          testResults.push({
            type: 'emergency_brake_test',
            status: 'completed',
            message: 'Emergency brake test executed'
          });
          continue;

        default:
          throw new Error(`Unknown test scenario: ${scenario}`);
      }

      if (testDecision) {
        // Now trigger the Prophet Agent to process this decision
        const prophetResult = await triggerProphetAgent(testDecision.id);
        
        testResults.push({
          decision_id: testDecision.id,
          decision_type: testDecision.decision_type,
          severity_level: testDecision.severity_level,
          autonomy_level: testDecision.autonomy_level,
          prophet_result: prophetResult,
          status: 'completed'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scenario,
        test_results: testResults,
        message: `AI Governance test completed for scenario: ${scenario}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Test AI Governance error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function createTestDecision(decisionData: any) {
  console.log(`📝 Creating test AI decision:`, decisionData);

  // First create the decision context that Prophet Agent expects
  const { data: contextData, error: contextError } = await supabaseAdmin
    .from('ai_decision_context')
    .insert({
      context_type: 'test_scenario',
      severity_level: decisionData.severity_level,
      data_snapshot: {
        test_generated: true,
        decision_type: decisionData.decision_type,
        severity_level: decisionData.severity_level,
        data_sources: decisionData.data_sources,
        timestamp: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (contextError) {
    console.error('Error creating decision context:', contextError);
    throw contextError;
  }

  console.log(`✅ Decision context created: ${contextData.id}`);

  // Get autonomy level based on category and severity
  console.log(`🔍 Getting autonomy level for category: ${decisionData.decision_type}, severity: ${decisionData.severity_level}`);
  
  const { data: autonomyResult, error: rpcError } = await supabaseAnon
    .rpc('get_autonomy_level_for_decision', {
      p_decision_category: decisionData.decision_type,
      p_severity_level: decisionData.severity_level
    });

  console.log(`🔍 RPC result:`, { autonomyResult, rpcError });

  const autonomy_level = autonomyResult || 'admin_notified';
  console.log(`🔍 Using autonomy level: ${autonomy_level}`);

  // Create the AI decision with context_id
  const { data: decision, error } = await supabaseAdmin
    .from('ai_decisions')
    .insert({
      ...decisionData,
      context_id: contextData.id, // Link to the context
      autonomy_level,
      admin_action_required: autonomy_level === 'admin_approval',
      governance_classification: {
        test_generated: true,
        autonomy_level,
        timestamp: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating test decision:', error);
    throw error;
  }

  console.log(`✅ Test decision created with autonomy level: ${autonomy_level} and context_id: ${contextData.id}`);
  return decision;
}

async function triggerProphetAgent(decisionId: number) {
  console.log(`🔮 Triggering Prophet Agent for decision ${decisionId}`);

  // Debug environment variables
  console.log(`🔍 Environment check:`, {
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
    url: Deno.env.get('SUPABASE_URL')
  });

  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-prophet-agent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'process_single_decision',
        decision_id: decisionId
      })
    });

    console.log(`🔮 Prophet Agent response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔮 Prophet Agent error: ${errorText}`);
      return { error: `HTTP ${response.status}: ${errorText}` };
    }

    const result = await response.json();
    console.log(`🔮 Prophet Agent result:`, result);
    return result;

  } catch (error) {
    console.error('Error triggering Prophet Agent:', error);
    return { error: error.message };
  }
}

async function testEmergencyBrake() {
  console.log(`🚨 Testing Emergency Brake functionality`);

  // Activate emergency brake
  const { error: activateError } = await supabaseAdmin
    .from('emergency_brake_status')
    .update({
      active: true,
      reason: 'Automated test of emergency brake system',
      duration_hours: 1, // Short duration for testing
      activated_at: new Date().toISOString(),
      activated_by: 'test_system',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    })
    .eq('id', 1);

  if (activateError) {
    console.error('Error activating emergency brake:', activateError);
    throw activateError;
  }

  console.log('✅ Emergency brake activated for testing');

  // Wait a moment, then deactivate
  setTimeout(async () => {
    const { error: deactivateError } = await supabaseAdmin
      .from('emergency_brake_status')
      .update({
        active: false,
        deactivated_at: new Date().toISOString(),
        deactivated_by: 'test_system'
      })
      .eq('id', 1);

    if (!deactivateError) {
      console.log('✅ Emergency brake deactivated after test');
    }
  }, 5000); // 5 seconds
} 