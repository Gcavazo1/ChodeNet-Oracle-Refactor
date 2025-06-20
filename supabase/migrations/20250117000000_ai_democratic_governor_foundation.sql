-- AI DEMOCRATIC GOVERNOR FOUNDATION
-- Phase 1: Data Infrastructure & Agent Coordination

-- =============================================
-- ECOSYSTEM METRICS COLLECTION
-- =============================================

-- Real-time ecosystem health monitoring
CREATE TABLE ecosystem_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'player_retention_rate',
        'economic_health_score', 
        'community_sentiment',
        'game_balance_indicator',
        'token_velocity',
        'user_engagement_rate',
        'revenue_efficiency',
        'technical_performance'
    )),
    metric_value NUMERIC NOT NULL,
    previous_value NUMERIC, -- For trend analysis
    change_percentage NUMERIC, -- Calculated change
    severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 10), -- 1=normal, 10=critical
    metadata JSONB DEFAULT '{}', -- Additional context data
    data_source TEXT DEFAULT 'automated', -- 'automated', 'manual', 'external_api'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast queries
CREATE INDEX idx_ecosystem_metrics_type_time ON ecosystem_metrics(metric_type, timestamp DESC);
CREATE INDEX idx_ecosystem_metrics_severity ON ecosystem_metrics(severity_level DESC, timestamp DESC);

-- =============================================
-- AI DECISION CONTEXT & ANALYSIS
-- =============================================

-- Context data for AI decision making
CREATE TABLE ai_decision_context (
    id BIGSERIAL PRIMARY KEY,
    context_type TEXT NOT NULL CHECK (context_type IN (
        'anomaly_detected',
        'trend_identified', 
        'opportunity_spotted',
        'threat_assessed',
        'community_feedback',
        'economic_imbalance',
        'performance_degradation'
    )),
    severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 10),
    confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1), -- AI confidence in assessment
    data_snapshot JSONB NOT NULL, -- Raw data that triggered this context
    affected_stakeholders TEXT[], -- Who is impacted
    estimated_impact JSONB, -- Predicted consequences
    urgency_timeline TEXT CHECK (urgency_timeline IN ('immediate', 'short_term', 'medium_term', 'long_term')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- When this context becomes stale
    processed BOOLEAN DEFAULT FALSE -- Has an AI agent acted on this?
);

CREATE INDEX idx_ai_context_severity_urgency ON ai_decision_context(severity_level DESC, urgency_timeline, processed);
CREATE INDEX idx_ai_context_type_time ON ai_decision_context(context_type, created_at DESC);

-- =============================================
-- AI AGENT COORDINATION SYSTEM  
-- =============================================

-- AI Agent registry and status tracking
CREATE TABLE ai_agents (
    id BIGSERIAL PRIMARY KEY,
    agent_type TEXT NOT NULL CHECK (agent_type IN (
        'sentinel',    -- Monitoring & detection
        'analyst',     -- Deep analysis & reasoning  
        'prophet',     -- Poll generation & proposals
        'arbiter',     -- Decision making & execution
        'scribe'       -- Learning & documentation
    )),
    agent_name TEXT NOT NULL UNIQUE, -- e.g., 'sentinel_001', 'analyst_economics'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'error')),
    specialization TEXT, -- What this agent focuses on (economics, community, technical, etc.)
    config JSONB DEFAULT '{}', -- Agent-specific configuration
    performance_metrics JSONB DEFAULT '{}', -- Success rates, response times, etc.
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_agents_type_status ON ai_agents(agent_type, status);
CREATE INDEX idx_ai_agents_last_activity ON ai_agents(last_activity DESC);

-- =============================================
-- AI DECISION TRACKING & LEARNING
-- =============================================

-- Track all AI-generated decisions and their outcomes
CREATE TABLE ai_decisions (
    id BIGSERIAL PRIMARY KEY,
    decision_type TEXT NOT NULL CHECK (decision_type IN (
        'emergency_intervention',
        'economic_adjustment',
        'poll_generation',
        'policy_proposal', 
        'system_optimization',
        'community_engagement',
        'predictive_action',
        'economic_policy',
        'game_balance'
    )),
    decision_title TEXT,
    decision_description TEXT,
    initiating_agent_id BIGINT REFERENCES ai_agents(id),
    context_id BIGINT REFERENCES ai_decision_context(id),
    reasoning TEXT NOT NULL, -- AI's explanation for the decision
    proposed_action JSONB NOT NULL, -- What the AI wants to do
    estimated_impact JSONB, -- Predicted outcomes
    confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
    severity_level INTEGER DEFAULT 5,
    autonomy_level TEXT,
    governance_classification JSONB,
    requires_vote BOOLEAN DEFAULT TRUE, -- Does this need community approval?
    poll_id TEXT, -- UUID string reference to oracle_polls (no FK constraint yet)
    executed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    execution_timestamp TIMESTAMPTZ,
    outcome_metrics JSONB, -- Actual results after execution
    success_score NUMERIC CHECK (success_score BETWEEN 0 AND 1), -- How well did it work?
    community_feedback_score NUMERIC, -- Community satisfaction with decision
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_decisions_type_agent ON ai_decisions(decision_type, initiating_agent_id);
CREATE INDEX idx_ai_decisions_success ON ai_decisions(success_score DESC, created_at DESC);
CREATE INDEX idx_ai_decisions_pending ON ai_decisions(executed, requires_vote, created_at);

-- =============================================
-- MULTI-AGENT CONSENSUS SYSTEM
-- =============================================

-- Track consensus between AI agents on decisions
CREATE TABLE agent_consensus (
    id BIGSERIAL PRIMARY KEY,
    decision_id BIGINT REFERENCES ai_decisions(id),
    agent_id BIGINT REFERENCES ai_agents(id),
    recommendation TEXT CHECK (recommendation IN ('approve', 'reject', 'modify', 'escalate')),
    confidence_score NUMERIC CHECK (confidence_score BETWEEN 0 AND 1),
    supporting_evidence JSONB DEFAULT '{}',
    concerns JSONB DEFAULT '{}', -- What the agent is worried about
    alternative_proposals JSONB DEFAULT '{}', -- Agent's counter-suggestions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(decision_id, agent_id) -- Each agent can only vote once per decision
);

CREATE INDEX idx_agent_consensus_decision ON agent_consensus(decision_id, recommendation);

-- =============================================
-- COMMUNITY SENTIMENT & PULSE TRACKING
-- =============================================

-- Enhanced community sentiment analysis
CREATE TABLE community_pulse (
    id BIGSERIAL PRIMARY KEY,
    sentiment_score NUMERIC CHECK (sentiment_score BETWEEN -1 AND 1), -- -1=very negative, 1=very positive
    emotional_tone TEXT CHECK (emotional_tone IN ('frustrated', 'excited', 'concerned', 'neutral', 'optimistic', 'angry')),
    urgency_level INTEGER CHECK (urgency_level BETWEEN 1 AND 10),
    topic_clusters TEXT[], -- What people are talking about
    demographic_breakdown JSONB DEFAULT '{}', -- Breakdown by user types
    data_sources TEXT[] DEFAULT '{}', -- Where sentiment was gathered from
    sample_size INTEGER, -- How many data points this represents
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_pulse_sentiment_time ON community_pulse(sentiment_score, created_at DESC);
CREATE INDEX idx_community_pulse_urgency ON community_pulse(urgency_level DESC, created_at DESC);

-- =============================================
-- REAL-TIME MONITORING TRIGGERS
-- =============================================

-- Function to detect anomalies in ecosystem metrics
CREATE OR REPLACE FUNCTION detect_ecosystem_anomalies()
RETURNS TRIGGER AS $$
DECLARE
    avg_value NUMERIC;
    std_dev NUMERIC;
    threshold_multiplier NUMERIC := 2.5; -- How many standard deviations = anomaly
    is_anomaly BOOLEAN := FALSE;
BEGIN
    -- Calculate rolling average and standard deviation for this metric type
    SELECT 
        AVG(metric_value),
        STDDEV(metric_value)
    INTO avg_value, std_dev
    FROM ecosystem_metrics 
    WHERE metric_type = NEW.metric_type 
    AND timestamp > NOW() - INTERVAL '24 hours';
    
    -- Check if new value is anomalous
    IF std_dev > 0 AND ABS(NEW.metric_value - avg_value) > (threshold_multiplier * std_dev) THEN
        is_anomaly := TRUE;
        
        -- Create AI decision context for the anomaly
        INSERT INTO ai_decision_context (
            context_type,
            severity_level,
            confidence_score,
            data_snapshot,
            urgency_timeline,
            estimated_impact
        ) VALUES (
            'anomaly_detected',
            CASE 
                WHEN ABS(NEW.metric_value - avg_value) > (4 * std_dev) THEN 9
                WHEN ABS(NEW.metric_value - avg_value) > (3 * std_dev) THEN 7
                ELSE 5
            END,
            0.8,
            jsonb_build_object(
                'metric_type', NEW.metric_type,
                'current_value', NEW.metric_value,
                'average_value', avg_value,
                'deviation_factor', ABS(NEW.metric_value - avg_value) / std_dev,
                'is_increase', NEW.metric_value > avg_value
            ),
            CASE 
                WHEN ABS(NEW.metric_value - avg_value) > (4 * std_dev) THEN 'immediate'
                WHEN ABS(NEW.metric_value - avg_value) > (3 * std_dev) THEN 'short_term'
                ELSE 'medium_term'
            END,
            jsonb_build_object(
                'potential_impact', 'ecosystem_stability',
                'affected_metrics', ARRAY[NEW.metric_type]
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply anomaly detection trigger
CREATE TRIGGER ecosystem_anomaly_detection
    AFTER INSERT ON ecosystem_metrics
    FOR EACH ROW
    EXECUTE FUNCTION detect_ecosystem_anomalies();

-- =============================================
-- HELPER FUNCTIONS FOR AI AGENTS
-- =============================================

-- Function to get current ecosystem health summary
CREATE OR REPLACE FUNCTION get_ecosystem_health_summary()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'overall_health_score', AVG(
            CASE 
                WHEN metric_type = 'player_retention_rate' THEN metric_value * 0.3
                WHEN metric_type = 'economic_health_score' THEN metric_value * 0.25  
                WHEN metric_type = 'community_sentiment' THEN metric_value * 0.2
                WHEN metric_type = 'game_balance_indicator' THEN metric_value * 0.15
                WHEN metric_type = 'technical_performance' THEN metric_value * 0.1
                ELSE 0
            END
        ),
        'critical_issues_count', COUNT(*) FILTER (WHERE severity_level >= 8),
        'trending_metrics', jsonb_agg(
            jsonb_build_object(
                'metric_type', metric_type,
                'current_value', metric_value,
                'trend', change_percentage
            )
        ) FILTER (WHERE ABS(change_percentage) > 5), -- Only significant changes
        'last_updated', MAX(timestamp)
    ) INTO result
    FROM ecosystem_metrics 
    WHERE timestamp > NOW() - INTERVAL '1 hour';
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to register AI agent activity
CREATE OR REPLACE FUNCTION log_agent_activity(
    p_agent_type TEXT,
    p_agent_name TEXT,
    p_activity_data JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO ai_agents (agent_type, agent_name, last_activity, performance_metrics)
    VALUES (p_agent_type, p_agent_name, NOW(), p_activity_data)
    ON CONFLICT (agent_name) 
    DO UPDATE SET 
        last_activity = NOW(),
        performance_metrics = ai_agents.performance_metrics || p_activity_data;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE ecosystem_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decision_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_consensus ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_pulse ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all AI data
CREATE POLICY "AI system full access" ON ecosystem_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON ai_decision_context FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON ai_agents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON ai_decisions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON agent_consensus FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON community_pulse FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read ecosystem metrics and community pulse
CREATE POLICY "Users can read ecosystem metrics" ON ecosystem_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can read community pulse" ON community_pulse FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to read AI decisions (transparency)
CREATE POLICY "Users can read AI decisions" ON ai_decisions FOR SELECT USING (auth.role() = 'authenticated'); 