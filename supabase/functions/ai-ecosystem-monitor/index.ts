// AI ECOSYSTEM MONITOR - SENTINEL AGENT
// The watchful eye that never sleeps, monitoring ecosystem health 24/7

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

interface EcosystemMetric {
  metric_type: string;
  metric_value: number;
  previous_value?: number;
  severity_level: number;
  metadata?: any;
  data_source: string;
}

interface SentinelConfig {
  monitoring_intervals: {
    real_time: number;      // milliseconds
    trend_analysis: number; // minutes  
    deep_scan: number;      // hours
  };
  alert_thresholds: {
    critical: number;    // severity level 8+
    warning: number;     // severity level 5+
    info: number;        // severity level 3+
  };
  data_sources: string[];
}

// Default Sentinel configuration
const DEFAULT_CONFIG: SentinelConfig = {
  monitoring_intervals: {
    real_time: 30000,      // 30 seconds
    trend_analysis: 5,     // 5 minutes
    deep_scan: 1          // 1 hour
  },
  alert_thresholds: {
    critical: 8,
    warning: 5, 
    info: 3
  },
  data_sources: ['game_events', 'user_profiles', 'girth_balances', 'community_inputs', 'oracle_metrics']
};

/**
 * SENTINEL AGENT - CORE MONITORING FUNCTIONS
 */

async function collectGameMetrics(): Promise<EcosystemMetric[]> {
  const metrics: EcosystemMetric[] = [];
  
  try {
    // 1. PLAYER RETENTION RATE (last 24h vs previous 24h)
    const { data: recentUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('id, last_sign_in_at')
      .gte('last_sign_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    const { data: previousUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('id, last_sign_in_at')
      .gte('last_sign_in_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .lt('last_sign_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const currentRetention = recentUsers?.length || 0;
    const previousRetention = previousUsers?.length || 0;
    const retentionChange = previousRetention > 0 ? ((currentRetention - previousRetention) / previousRetention) * 100 : 0;
    
    metrics.push({
      metric_type: 'player_retention_rate',
      metric_value: currentRetention,
      previous_value: previousRetention,
      severity_level: retentionChange < -20 ? 9 : (retentionChange < -10 ? 6 : 3),
      metadata: {
        change_percentage: retentionChange,
        time_period: '24h',
        measurement_type: 'active_users'
      },
      data_source: 'user_profiles'
    });

    // 2. ECONOMIC HEALTH SCORE (based on GIRTH balance distribution)
    const { data: balances } = await supabaseAdmin
      .from('girth_balances')
      .select('soft_balance, hard_balance, wallet_address');

    if (balances && balances.length > 0) {
      const totalSoft = balances.reduce((sum, b) => sum + (parseFloat(b.soft_balance) || 0), 0);
      const totalHard = balances.reduce((sum, b) => sum + (parseFloat(b.hard_balance) || 0), 0);
      const avgBalance = totalSoft / balances.length;
      const balanceRatio = totalHard > 0 ? totalSoft / totalHard : totalSoft;
      
      // Healthy economy: balanced distribution, active circulation
      const economicHealth = Math.min(100, (avgBalance * 0.3) + (balanceRatio * 0.7));
      
      metrics.push({
        metric_type: 'economic_health_score',
        metric_value: economicHealth,
        severity_level: economicHealth < 30 ? 8 : (economicHealth < 60 ? 5 : 2),
        metadata: {
          total_soft_girth: totalSoft,
          total_hard_girth: totalHard,
          average_balance: avgBalance,
          active_wallets: balances.length,
          circulation_ratio: balanceRatio
        },
        data_source: 'girth_balances'
      });
    }

    // 3. COMMUNITY SENTIMENT (based on recent inputs and oracle responses)
    const { data: recentInputs } = await supabaseAdmin
      .from('community_story_inputs')
      .select('submission_text, submission_metadata')
      .gte('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()); // Last 4 hours

    if (recentInputs && recentInputs.length > 0) {
      // Simple sentiment analysis based on text length, keywords, metadata
      let positiveSignals = 0;
      let negativeSignals = 0;
      
      for (const input of recentInputs) {
        const text = input.submission_text?.toLowerCase() || '';
        const textLength = text.length;
        
        // Positive indicators
        if (text.includes('love') || text.includes('amazing') || text.includes('great') || textLength > 100) {
          positiveSignals++;
        }
        
        // Negative indicators  
        if (text.includes('hate') || text.includes('boring') || text.includes('broken') || textLength < 20) {
          negativeSignals++;
        }
      }
      
      const sentimentScore = recentInputs.length > 0 ? 
        (positiveSignals - negativeSignals) / recentInputs.length : 0;
      
      // Normalize to -1 to 1 range
      const normalizedSentiment = Math.max(-1, Math.min(1, sentimentScore));
      
      metrics.push({
        metric_type: 'community_sentiment',
        metric_value: normalizedSentiment,
        severity_level: normalizedSentiment < -0.5 ? 7 : (normalizedSentiment < 0 ? 4 : 2),
        metadata: {
          recent_inputs_count: recentInputs.length,
          positive_signals: positiveSignals,
          negative_signals: negativeSignals,
          raw_sentiment_score: sentimentScore
        },
        data_source: 'community_inputs'
      });
    }

    // 4. TECHNICAL PERFORMANCE (based on live events and oracle metrics)
    const { data: recentEvents } = await supabaseAdmin
      .from('live_game_events')
      .select('event_type, event_data, created_at')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

    if (recentEvents && recentEvents.length > 0) {
      const eventRate = recentEvents.length; // Events per hour
      const errorEvents = recentEvents.filter(e => e.event_type?.includes('error')).length;
      const errorRate = recentEvents.length > 0 ? errorEvents / recentEvents.length : 0;
      
      // Performance score: high event rate = good, low error rate = good
      const performanceScore = Math.min(100, (eventRate * 2) - (errorRate * 50));
      
      metrics.push({
        metric_type: 'technical_performance',
        metric_value: performanceScore,
        severity_level: performanceScore < 30 ? 8 : (performanceScore < 60 ? 5 : 2),
        metadata: {
          events_per_hour: eventRate,
          error_rate: errorRate,
          total_events: recentEvents.length,
          error_events: errorEvents
        },
        data_source: 'live_events'
      });
    }

    return metrics;
    
  } catch (error) {
    console.error('Error collecting game metrics:', error);
    
    // Return a critical metric indicating monitoring failure
    return [{
      metric_type: 'technical_performance',
      metric_value: 0,
      severity_level: 10,
      metadata: {
        error: 'monitoring_system_failure',
        error_message: error.message
      },
      data_source: 'sentinel_agent'
    }];
  }
}

async function storeMetrics(metrics: EcosystemMetric[]): Promise<void> {
  for (const metric of metrics) {
    const { error } = await supabaseAdmin
      .from('ecosystem_metrics')
      .insert({
        metric_type: metric.metric_type,
        metric_value: metric.metric_value,
        previous_value: metric.previous_value,
        change_percentage: metric.previous_value ? 
          ((metric.metric_value - metric.previous_value) / metric.previous_value) * 100 : null,
        severity_level: metric.severity_level,
        metadata: metric.metadata,
        data_source: metric.data_source,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error(`Error storing metric ${metric.metric_type}:`, error);
    }
  }
}

async function registerSentinelActivity(activityType: string, activityData: any): Promise<void> {
  await supabaseAdmin.rpc('log_agent_activity', {
    p_agent_type: 'sentinel',
    p_agent_name: 'sentinel_ecosystem_monitor',
    p_activity_data: {
      activity_type: activityType,
      timestamp: new Date().toISOString(),
      ...activityData
    }
  });
}

async function checkForCriticalIssues(): Promise<void> {
  // Check for unprocessed critical contexts
  const { data: criticalContexts } = await supabaseAdmin
    .from('ai_decision_context')
    .select('*')
    .eq('processed', false)
    .gte('severity_level', 8)
    .order('created_at', { ascending: true });

  if (criticalContexts && criticalContexts.length > 0) {
    console.log(`🚨 CRITICAL: ${criticalContexts.length} unprocessed high-severity issues detected`);
    
    // Trigger analyst agent for each critical issue
    for (const context of criticalContexts) {
      // This would trigger the Analyst Agent in a real implementation
      console.log(`Escalating context ${context.id} to Analyst Agent`);
    }
  }
}

/**
 * MAIN SENTINEL MONITORING FUNCTION
 */
async function runSentinelMonitoring(): Promise<any> {
  const startTime = Date.now();
  
  try {
    console.log('🤖 Sentinel Agent: Starting ecosystem monitoring...');
    
    // Register activity start
    await registerSentinelActivity('monitoring_cycle_start', {
      monitoring_mode: 'comprehensive_scan'
    });

    // Collect all ecosystem metrics
    const metrics = await collectGameMetrics();
    
    console.log(`📊 Collected ${metrics.length} ecosystem metrics`);
    
    // Store metrics in database (this will trigger anomaly detection)
    await storeMetrics(metrics);
    
    // Check for critical issues requiring immediate attention
    await checkForCriticalIssues();
    
    // Calculate monitoring performance
    const processingTime = Date.now() - startTime;
    const criticalMetrics = metrics.filter(m => m.severity_level >= 8);
    const warningMetrics = metrics.filter(m => m.severity_level >= 5 && m.severity_level < 8);
    
    // Register activity completion
    await registerSentinelActivity('monitoring_cycle_complete', {
      processing_time_ms: processingTime,
      metrics_collected: metrics.length,
      critical_issues: criticalMetrics.length,
      warning_issues: warningMetrics.length,
      overall_status: criticalMetrics.length > 0 ? 'critical_detected' : 
                     warningMetrics.length > 0 ? 'warnings_detected' : 'healthy'
    });
    
    return {
      success: true,
      summary: {
        monitoring_time: processingTime,
        metrics_collected: metrics.length,
        critical_issues: criticalMetrics.length,
        warning_issues: warningMetrics.length,
        ecosystem_status: criticalMetrics.length > 0 ? 'CRITICAL' : 
                         warningMetrics.length > 0 ? 'WARNING' : 'HEALTHY'
      },
      metrics: metrics,
      message: 'Sentinel monitoring cycle completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Sentinel Agent error:', error);
    
    // Register error activity
    await registerSentinelActivity('monitoring_error', {
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    
    return {
      success: false,
      error: error.message,
      message: 'Sentinel monitoring cycle failed'
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
    // Run the Sentinel monitoring
    const result = await runSentinelMonitoring();
    
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
        message: 'Sentinel Agent edge function failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 