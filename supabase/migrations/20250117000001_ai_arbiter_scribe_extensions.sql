-- AI ARBITER & SCRIBE AGENT EXTENSIONS
-- Support for decision execution and learning systems

-- =============================================
-- POLL EXECUTION TRACKING
-- =============================================

-- Add execution tracking columns to oracle_polls (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'oracle_polls') THEN
        -- Add execution tracking columns
        ALTER TABLE oracle_polls
        ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS source_decision_id TEXT, -- Store decision ID as text
        ADD COLUMN IF NOT EXISTS execution_status TEXT CHECK (execution_status IN ('executed', 'failed', 'pending', 'cancelled')),
        ADD COLUMN IF NOT EXISTS execution_timestamp TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS execution_details JSONB DEFAULT '{}';
        
        -- Add indexes for AI-generated polls
        CREATE INDEX IF NOT EXISTS idx_oracle_polls_ai_generated ON oracle_polls(ai_generated, execution_status);
        CREATE INDEX IF NOT EXISTS idx_oracle_polls_execution ON oracle_polls(execution_timestamp DESC) WHERE execution_timestamp IS NOT NULL;
    ELSE
        -- Log that oracle_polls table doesn't exist yet
        RAISE NOTICE 'oracle_polls table does not exist yet, skipping AI extension columns';
    END IF;
END $$;

-- =============================================
-- AI LEARNING PATTERNS STORAGE
-- =============================================

-- Store patterns learned by the Scribe Agent
CREATE TABLE IF NOT EXISTS ai_learning_patterns (
    id BIGSERIAL PRIMARY KEY,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'success_pattern',
        'failure_pattern', 
        'confidence_calibration',
        'community_response',
        'execution_quality',
        'voting_behavior',
        'stakeholder_preferences'
    )),
    description TEXT NOT NULL,
    confidence NUMERIC CHECK (confidence BETWEEN 0 AND 1),
    supporting_evidence JSONB DEFAULT '[]',
    recommended_improvements JSONB DEFAULT '[]',
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    agent_source TEXT DEFAULT 'scribe',
    applied BOOLEAN DEFAULT FALSE,
    application_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_learning_patterns_type_confidence ON ai_learning_patterns(pattern_type, confidence DESC);
CREATE INDEX idx_ai_learning_patterns_applied ON ai_learning_patterns(applied, identified_at DESC);

-- =============================================
-- AI SYSTEM CONFIGURATION
-- =============================================

-- Dynamic configuration for AI agents based on learning
CREATE TABLE IF NOT EXISTS ai_system_config (
    id BIGSERIAL PRIMARY KEY,
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'scribe_agent',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default configurations
INSERT INTO ai_system_config (config_key, config_value, description) VALUES
('sentinel_monitoring_intervals', 
 '{"real_time": 300000, "trend_analysis": 300, "deep_scan": 60}',
 'Sentinel Agent monitoring intervals in seconds/milliseconds'),
('analyst_confidence_thresholds', 
 '{"minimum_for_voting": 0.6, "high_confidence": 0.8, "critical_threshold": 0.9}',
 'Analyst Agent confidence level thresholds'),
('prophet_poll_settings',
 '{"min_voting_duration": 24, "max_voting_duration": 168, "default_cooldown": 24}',
 'Prophet Agent poll generation settings'),
('arbiter_execution_safety',
 '{"require_consensus_min": 0.6, "rollback_threshold": 0.3, "monitoring_duration": 72}',
 'Arbiter Agent execution safety parameters')
ON CONFLICT (config_key) DO NOTHING;

CREATE INDEX idx_ai_system_config_active ON ai_system_config(is_active, config_key);

-- =============================================
-- EXECUTION STEP TRACKING
-- =============================================

-- Track individual implementation steps for rollback and monitoring
CREATE TABLE IF NOT EXISTS execution_steps (
    id BIGSERIAL PRIMARY KEY,
    poll_id TEXT, -- UUID string reference to oracle_polls (no FK constraint yet)
    step_id INTEGER NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN (
        'database_update',
        'function_call',
        'parameter_change',
        'notification',
        'monitoring_setup'
    )),
    description TEXT NOT NULL,
    target_resource TEXT,
    action_payload JSONB,
    execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executing', 'completed', 'failed', 'rolled_back')),
    executed_at TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    error_details JSONB,
    rollback_data JSONB, -- Data needed for rollback
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_execution_steps_poll_status ON execution_steps(poll_id, execution_status);
CREATE INDEX idx_execution_steps_verification ON execution_steps(verification_status, executed_at);

-- =============================================
-- SYSTEM HEALTH MONITORING
-- =============================================

-- Aggregate system health metrics
CREATE TABLE IF NOT EXISTS system_health_snapshots (
    id BIGSERIAL PRIMARY KEY,
    overall_health_score NUMERIC CHECK (overall_health_score BETWEEN 0 AND 1),
    agent_health_scores JSONB DEFAULT '{}', -- Individual agent scores
    recent_decision_count INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    community_satisfaction NUMERIC CHECK (community_satisfaction BETWEEN 0 AND 1),
    system_uptime_hours NUMERIC,
    performance_metrics JSONB DEFAULT '{}',
    identified_issues JSONB DEFAULT '[]',
    recommended_actions JSONB DEFAULT '[]',
    snapshot_timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_health_snapshots_timestamp ON system_health_snapshots(snapshot_timestamp DESC);

-- =============================================
-- AUTOMATED FUNCTIONS FOR ARBITER & SCRIBE
-- =============================================

-- Function to check if a poll is ready for execution (only create if oracle_polls exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'oracle_polls') THEN
        -- Create the function with UUID parameter
        CREATE OR REPLACE FUNCTION is_poll_ready_for_execution(poll_id UUID)
        RETURNS BOOLEAN AS $func$
        DECLARE
            poll_record RECORD;
            vote_count INTEGER;
        BEGIN
            SELECT * INTO poll_record 
            FROM oracle_polls 
            WHERE id = poll_id;
            
            -- Check if poll exists and voting has ended
            IF poll_record IS NULL OR poll_record.voting_end > NOW() THEN
                RETURN FALSE;
            END IF;
            
            -- Check if already executed
            IF poll_record.execution_status IS NOT NULL THEN
                RETURN FALSE;
            END IF;
            
            -- Check if there are votes
            SELECT COUNT(*) INTO vote_count 
            FROM user_votes 
            WHERE poll_id = poll_record.id;
            
            -- Require at least one vote
            RETURN vote_count > 0;
        END;
        $func$ LANGUAGE plpgsql;

        -- Function to calculate poll consensus strength with UUID parameter
        CREATE OR REPLACE FUNCTION calculate_poll_consensus(poll_id UUID)
        RETURNS JSONB AS $func$
        DECLARE
            vote_results JSONB;
            total_weight NUMERIC := 0;
            max_weight NUMERIC := 0;
            second_max_weight NUMERIC := 0;
            winning_option_id UUID;
            consensus_strength NUMERIC;
        BEGIN
            -- Get vote totals by option
            SELECT jsonb_object_agg(
                option_id::text, 
                jsonb_build_object('count', vote_count, 'weight', vote_weight)
            ) INTO vote_results
            FROM (
                SELECT 
                    uv.option_id,
                    COUNT(*) as vote_count,
                    COUNT(*) as vote_weight  -- All votes have equal weight for now
                FROM user_votes uv
                WHERE uv.poll_id = calculate_poll_consensus.poll_id
                GROUP BY uv.option_id
            ) vote_summary;
            
            -- Calculate consensus strength
            SELECT 
                SUM(COALESCE((value->>'weight')::numeric, 0)),
                MAX(COALESCE((value->>'weight')::numeric, 0))
            INTO total_weight, max_weight
            FROM jsonb_each(COALESCE(vote_results, '{}'::jsonb));
            
            -- Find second highest weight for margin calculation
            SELECT COALESCE(MAX((value->>'weight')::numeric), 0) INTO second_max_weight
            FROM jsonb_each(COALESCE(vote_results, '{}'::jsonb))
            WHERE (value->>'weight')::numeric < max_weight;
            
            -- Calculate consensus strength (0-1 scale)
            IF total_weight > 0 THEN
                consensus_strength := (max_weight - second_max_weight) / total_weight;
            ELSE
                consensus_strength := 0;
            END IF;
            
            RETURN jsonb_build_object(
                'vote_results', COALESCE(vote_results, '{}'::jsonb),
                'total_weight', total_weight,
                'max_weight', max_weight,
                'consensus_strength', consensus_strength,
                'calculated_at', NOW()
            );
        END;
        $func$ LANGUAGE plpgsql;
    ELSE
        RAISE NOTICE 'oracle_polls table does not exist yet, skipping poll analysis functions';
    END IF;
END $$;

-- Function to record system health snapshot
CREATE OR REPLACE FUNCTION record_system_health_snapshot()
RETURNS void AS $$
DECLARE
    health_score NUMERIC;
    agent_scores JSONB := '{}';
    recent_decisions INTEGER;
    successful_exec INTEGER;
    failed_exec INTEGER;
BEGIN
    -- Calculate recent decision statistics
    SELECT COUNT(*) INTO recent_decisions
    FROM ai_decisions 
    WHERE created_at > NOW() - INTERVAL '24 hours';
    
    SELECT 
        COUNT(*) FILTER (WHERE success_score > 0.7),
        COUNT(*) FILTER (WHERE success_score <= 0.3)
    INTO successful_exec, failed_exec
    FROM ai_decisions 
    WHERE executed = true 
    AND execution_timestamp > NOW() - INTERVAL '7 days';
    
    -- Calculate overall health score
    health_score := CASE 
        WHEN recent_decisions = 0 THEN 0.5
        ELSE LEAST(1.0, (successful_exec::numeric / GREATEST(1, successful_exec + failed_exec)) * 0.8 + 0.2)
    END;
    
    -- Get agent health scores
    SELECT jsonb_object_agg(
        agent_type,
        CASE 
            WHEN last_activity > NOW() - INTERVAL '1 hour' THEN 1.0
            WHEN last_activity > NOW() - INTERVAL '6 hours' THEN 0.7
            WHEN last_activity > NOW() - INTERVAL '24 hours' THEN 0.4
            ELSE 0.1
        END
    ) INTO agent_scores
    FROM ai_agents;
    
    -- Insert health snapshot
    INSERT INTO system_health_snapshots (
        overall_health_score,
        agent_health_scores,
        recent_decision_count,
        successful_executions,
        failed_executions,
        system_uptime_hours,
        performance_metrics
    ) VALUES (
        health_score,
        agent_scores,
        recent_decisions,
        successful_exec,
        failed_exec,
        EXTRACT(EPOCH FROM (NOW() - (SELECT MIN(created_at) FROM ai_agents))) / 3600,
        jsonb_build_object(
            'avg_processing_time', (
                SELECT AVG(CAST(performance_metrics->>'processing_time_ms' AS numeric))
                FROM ai_agents 
                WHERE performance_metrics IS NOT NULL
            ),
            'total_agents', (SELECT COUNT(*) FROM ai_agents),
            'active_agents', (SELECT COUNT(*) FROM ai_agents WHERE status = 'active')
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE ai_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_snapshots ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "AI system full access" ON ai_learning_patterns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON ai_system_config FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON execution_steps FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "AI system full access" ON system_health_snapshots FOR ALL USING (auth.role() = 'service_role');

-- Read access for authenticated users
CREATE POLICY "Users can read learning patterns" ON ai_learning_patterns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can read system config" ON ai_system_config FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
CREATE POLICY "Users can read execution steps" ON execution_steps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can read system health" ON system_health_snapshots FOR SELECT USING (auth.role() = 'authenticated'); 