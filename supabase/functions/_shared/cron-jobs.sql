-- AI DEMOCRATIC GOVERNOR CRON JOBS
-- Automated scheduling for AI agent monitoring and decision-making

-- =============================================
-- SENTINEL AGENT - ECOSYSTEM MONITORING
-- =============================================

-- Function to call the Sentinel Agent edge function
CREATE OR REPLACE FUNCTION trigger_sentinel_monitoring()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    response_body text;
    response_status int;
BEGIN
    -- Call the ai-ecosystem-monitor edge function
    SELECT
        content::text,
        status_code
    INTO
        response_body,
        response_status
    FROM
        net.http_post(
            url := 'https://' || current_setting('app.settings.project_ref') || '.supabase.co/functions/v1/ai-ecosystem-monitor',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
            body := '{}'::jsonb
        );

    -- Log the result
    INSERT INTO automation_log (
        function_name, 
        execution_status, 
        result_summary, 
        details
    ) VALUES (
        'trigger_sentinel_monitoring',
        CASE 
            WHEN response_status = 200 THEN 'success'
            ELSE 'error'
        END,
        'Sentinel Agent monitoring cycle',
        jsonb_build_object(
            'response_status', response_status,
            'response_body', response_body,
            'execution_time', NOW()
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log any errors
        INSERT INTO automation_log (
            function_name, 
            execution_status, 
            result_summary, 
            details
        ) VALUES (
            'trigger_sentinel_monitoring',
            'error',
            'Failed to trigger Sentinel Agent',
            jsonb_build_object(
                'error_message', SQLERRM,
                'error_detail', SQLSTATE,
                'execution_time', NOW()
            )
        );
END;
$$;

-- =============================================
-- ECOSYSTEM HEALTH AGGREGATION
-- =============================================

-- Function to calculate and store aggregated ecosystem health metrics
CREATE OR REPLACE FUNCTION aggregate_ecosystem_health()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    health_summary jsonb;
    trend_analysis jsonb;
BEGIN
    -- Get current ecosystem health summary
    SELECT get_ecosystem_health_summary() INTO health_summary;
    
    -- Calculate 24-hour trends
    SELECT jsonb_build_object(
        'player_retention_trend', (
            SELECT AVG(metric_value) - LAG(AVG(metric_value)) OVER (ORDER BY date_trunc('hour', timestamp))
            FROM ecosystem_metrics 
            WHERE metric_type = 'player_retention_rate' 
            AND timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY date_trunc('hour', timestamp)
            ORDER BY date_trunc('hour', timestamp) DESC
            LIMIT 2
        ),
        'economic_health_trend', (
            SELECT AVG(metric_value) - LAG(AVG(metric_value)) OVER (ORDER BY date_trunc('hour', timestamp))
            FROM ecosystem_metrics 
            WHERE metric_type = 'economic_health_score'
            AND timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY date_trunc('hour', timestamp)
            ORDER BY date_trunc('hour', timestamp) DESC
            LIMIT 2
        ),
        'sentiment_trend', (
            SELECT AVG(metric_value) - LAG(AVG(metric_value)) OVER (ORDER BY date_trunc('hour', timestamp))
            FROM ecosystem_metrics 
            WHERE metric_type = 'community_sentiment'
            AND timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY date_trunc('hour', timestamp)
            ORDER BY date_trunc('hour', timestamp) DESC
            LIMIT 2
        )
    ) INTO trend_analysis;
    
    -- Store aggregated health summary
    INSERT INTO ecosystem_metrics (
        metric_type,
        metric_value,
        metadata,
        data_source
    ) VALUES (
        'ecosystem_health_aggregate',
        COALESCE((health_summary->>'overall_health_score')::numeric, 0),
        jsonb_build_object(
            'health_summary', health_summary,
            'trend_analysis', trend_analysis,
            'aggregation_timestamp', NOW()
        ),
        'ai_aggregation'
    );

    -- Log successful aggregation
    INSERT INTO automation_log (
        function_name, 
        execution_status, 
        result_summary, 
        details
    ) VALUES (
        'aggregate_ecosystem_health',
        'success',
        'Ecosystem health aggregation completed',
        jsonb_build_object(
            'health_score', COALESCE((health_summary->>'overall_health_score')::numeric, 0),
            'critical_issues', COALESCE((health_summary->>'critical_issues_count')::int, 0),
            'execution_time', NOW()
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO automation_log (
            function_name, 
            execution_status, 
            result_summary, 
            details
        ) VALUES (
            'aggregate_ecosystem_health',
            'error',
            'Failed to aggregate ecosystem health',
            jsonb_build_object(
                'error_message', SQLERRM,
                'error_detail', SQLSTATE,
                'execution_time', NOW()
            )
        );
END;
$$;

-- =============================================
-- AI AGENT HEALTH CHECK
-- =============================================

-- Function to monitor AI agent performance and detect issues
CREATE OR REPLACE FUNCTION check_ai_agent_health()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    inactive_agents int;
    error_agents int;
    total_agents int;
BEGIN
    -- Count agent statuses
    SELECT 
        COUNT(*) FILTER (WHERE status = 'inactive'),
        COUNT(*) FILTER (WHERE status = 'error'),
        COUNT(*)
    INTO inactive_agents, error_agents, total_agents
    FROM ai_agents;
    
    -- Check for agents that haven't been active recently
    UPDATE ai_agents 
    SET status = 'inactive'
    WHERE last_activity < NOW() - INTERVAL '1 hour'
    AND status = 'active';

-- =============================================
-- AI ARBITER AGENT - POLL COMPLETION PROCESSING
-- =============================================

-- Function to call the AI Arbiter Agent edge function
CREATE OR REPLACE FUNCTION trigger_ai_arbiter_agent()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    response_body text;
    response_status int;
    polls_processed int;
BEGIN
    -- Call the ai-arbiter-agent edge function
    SELECT
        content::text,
        status_code
    INTO
        response_body,
        response_status
    FROM
        net.http_post(
            url := 'https://' || current_setting('app.settings.project_ref') || '.supabase.co/functions/v1/ai-arbiter-agent',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
            body := '{}'::jsonb
        );

    -- Extract polls processed count from response
    BEGIN
        polls_processed := COALESCE((response_body::jsonb->>'polls_analyzed')::int, 0);
    EXCEPTION
        WHEN OTHERS THEN
            polls_processed := 0;
    END;

    -- Log the result
    INSERT INTO automation_log (
        function_name, 
        execution_status, 
        result_summary, 
        details
    ) VALUES (
        'trigger_ai_arbiter_agent',
        CASE 
            WHEN response_status = 200 THEN 'success'
            ELSE 'error'
        END,
        'AI Arbiter Agent poll processing cycle',
        jsonb_build_object(
            'response_status', response_status,
            'response_body', response_body,
            'polls_processed', polls_processed,
            'execution_time', NOW()
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log any errors
        INSERT INTO automation_log (
            function_name, 
            execution_status, 
            result_summary, 
            details
        ) VALUES (
            'trigger_ai_arbiter_agent',
            'error',
            'Failed to trigger AI Arbiter Agent',
            jsonb_build_object(
                'error_message', SQLERRM,
                'error_detail', SQLSTATE,
                'execution_time', NOW()
            )
        );
END;
$$;
    
    -- Create alert context if too many agents are down
    IF (inactive_agents + error_agents) > (total_agents * 0.3) THEN
        INSERT INTO ai_decision_context (
            context_type,
            severity_level,
            confidence_score,
            data_snapshot,
            urgency_timeline,
            estimated_impact
        ) VALUES (
            'performance_degradation',
            8, -- Critical
            0.9,
            jsonb_build_object(
                'inactive_agents', inactive_agents,
                'error_agents', error_agents,
                'total_agents', total_agents,
                'health_percentage', ((total_agents - inactive_agents - error_agents)::numeric / total_agents) * 100
            ),
            'immediate',
            jsonb_build_object(
                'impact_type', 'ai_system_degradation',
                'affected_capabilities', ARRAY['monitoring', 'decision_making', 'anomaly_detection']
            )
        );
    END IF;
    
    -- Log health check
    INSERT INTO automation_log (
        function_name, 
        execution_status, 
        result_summary, 
        details
    ) VALUES (
        'check_ai_agent_health',
        'success',
        'AI agent health check completed',
        jsonb_build_object(
            'total_agents', total_agents,
            'active_agents', total_agents - inactive_agents - error_agents,
            'inactive_agents', inactive_agents,
            'error_agents', error_agents,
            'health_percentage', ((total_agents - inactive_agents - error_agents)::numeric / total_agents) * 100,
            'execution_time', NOW()
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO automation_log (
            function_name, 
            execution_status, 
            result_summary, 
            details
        ) VALUES (
            'check_ai_agent_health',
            'error',
            'Failed to check AI agent health',
            jsonb_build_object(
                'error_message', SQLERRM,
                'error_detail', SQLSTATE,
                'execution_time', NOW()
            )
        );
END;
$$;

-- =============================================
-- CRON JOB SCHEDULES
-- =============================================

-- Every 5 minutes: Sentinel Agent ecosystem monitoring
SELECT cron.schedule(
    'ai-sentinel-monitoring',
    '*/5 * * * *', -- Every 5 minutes
    'SELECT trigger_sentinel_monitoring();'
);

-- Every 15 minutes: Ecosystem health aggregation
SELECT cron.schedule(
    'ai-ecosystem-aggregation',
    '*/15 * * * *', -- Every 15 minutes
    'SELECT aggregate_ecosystem_health();'
);

-- Every 30 minutes: AI agent health check
SELECT cron.schedule(
    'ai-agent-health-check',
    '*/30 * * * *', -- Every 30 minutes
    'SELECT check_ai_agent_health();'
);

-- Every 10 minutes: Analyst Agent deep analysis
SELECT cron.schedule(
    'ai-analyst-agent',
    '*/10 * * * *', -- Every 10 minutes
    $$
    SELECT
        content::text
    FROM
        net.http_post(
            url := 'https://' || current_setting('app.settings.project_ref') || '.supabase.co/functions/v1/ai-analyst-agent',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
            body := '{}'::jsonb
        );
    $$
);

-- Every 20 minutes: Prophet Agent poll generation
SELECT cron.schedule(
    'ai-prophet-agent',
    '*/20 * * * *', -- Every 20 minutes
    $$
    SELECT
        content::text
    FROM
        net.http_post(
            url := 'https://' || current_setting('app.settings.project_ref') || '.supabase.co/functions/v1/ai-prophet-agent',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
            body := '{}'::jsonb
        );
    $$
);

-- =============================================
-- PHASE 2: ARBITER & SCRIBE AGENTS
-- =============================================

-- Every 15 minutes: Arbiter Agent decision execution
SELECT cron.schedule(
    'ai-arbiter-agent',
    '*/15 * * * *', -- Every 15 minutes
    $$
    SELECT
        content::text
    FROM
        net.http_post(
            url := 'https://' || current_setting('app.settings.project_ref') || '.supabase.co/functions/v1/ai-arbiter-agent',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
            body := '{}'::jsonb
        );
    $$
);

-- Every 2 hours: Scribe Agent learning cycle
SELECT cron.schedule(
    'ai-scribe-agent',
    '0 */2 * * *', -- Every 2 hours
    $$
    SELECT
        content::text
    FROM
        net.http_post(
            url := 'https://' || current_setting('app.settings.project_ref') || '.supabase.co/functions/v1/ai-scribe-agent',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
            body := '{}'::jsonb
        );
    $$
);

-- Every hour: System health snapshot
SELECT cron.schedule(
    'ai-system-health-snapshot',
    '0 * * * *', -- Every hour
    'SELECT record_system_health_snapshot();'
);

-- Every hour: Clean up old metrics (keep last 7 days)
SELECT cron.schedule(
    'ai-metrics-cleanup',
    '0 * * * *', -- Every hour
    $$
    DELETE FROM ecosystem_metrics 
    WHERE timestamp < NOW() - INTERVAL '7 days'
    AND metric_type != 'ecosystem_health_aggregate';
    
    DELETE FROM ai_decision_context 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND processed = true;
    
    DELETE FROM ai_learning_patterns 
    WHERE created_at < NOW() - INTERVAL '60 days' 
    AND applied = true;
    
    DELETE FROM execution_steps 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND execution_status IN ('completed', 'failed');
    
    DELETE FROM system_health_snapshots 
    WHERE snapshot_timestamp < NOW() - INTERVAL '30 days';
    $$
); 