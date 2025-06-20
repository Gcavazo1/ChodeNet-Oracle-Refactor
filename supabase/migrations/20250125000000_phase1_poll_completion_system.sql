-- Phase 1: Poll Completion System Database Schema Extensions
-- Migration to extend oracle_commentary table and add supporting infrastructure for AI Arbiter Agent

-- Add additional columns to oracle_commentary table for AI analysis
DO $$
BEGIN
    -- Add AI analysis columns to oracle_commentary if they don't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'oracle_commentary' 
        AND column_name = 'ai_analysis'
    ) THEN
        ALTER TABLE public.oracle_commentary 
        ADD COLUMN ai_analysis JSONB,
        ADD COLUMN implementation_status TEXT DEFAULT 'pending' CHECK (
            implementation_status IN ('pending', 'in_progress', 'completed', 'cancelled', 'requires_admin_review')
        ),
        ADD COLUMN admin_notes TEXT,
        ADD COLUMN completion_confirmed_at TIMESTAMPTZ,
        ADD COLUMN completion_confirmed_by TEXT,
        ADD COLUMN priority_level TEXT DEFAULT 'medium' CHECK (
            priority_level IN ('low', 'medium', 'high', 'critical')
        ),
        ADD COLUMN complexity_estimate TEXT DEFAULT 'moderate' CHECK (
            complexity_estimate IN ('simple', 'moderate', 'complex')
        ),
        ADD COLUMN estimated_effort TEXT,
        ADD COLUMN required_resources TEXT[],
        ADD COLUMN risks_identified TEXT[],
        ADD COLUMN success_metrics TEXT[],
        ADD COLUMN reward_distribution_data JSONB;
    END IF;

    -- Create poll_analysis_results table for detailed AI analysis
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'poll_analysis_results') THEN
        CREATE TABLE public.poll_analysis_results (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            poll_id UUID NOT NULL REFERENCES public.oracle_polls(id) ON DELETE CASCADE,
            commentary_id UUID REFERENCES public.oracle_commentary(id) ON DELETE SET NULL,
            winning_option_id UUID REFERENCES public.poll_options(id),
            total_votes INTEGER NOT NULL,
            voter_wallets TEXT[] NOT NULL,
            vote_distribution JSONB NOT NULL, -- Detailed breakdown by option
            participation_rate NUMERIC(5,2), -- Percentage of eligible voters who participated
            demographic_analysis JSONB, -- Analysis of voter patterns
            outcome_confidence NUMERIC(3,2), -- 0.00 to 1.00 confidence in outcome
            controversy_score NUMERIC(3,2), -- 0.00 to 1.00 how controversial the result
            consensus_strength NUMERIC(3,2), -- 0.00 to 1.00 how strong the consensus
            analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
            ai_confidence_score NUMERIC(3,2) DEFAULT 0.85,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.poll_analysis_results ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can read analysis results
        CREATE POLICY "Anyone can read analysis results" ON public.poll_analysis_results
            FOR SELECT USING (true);
            
        -- Only AI systems and admins can create/update analysis results
        CREATE POLICY "Admins can manage analysis results" ON public.poll_analysis_results
            FOR ALL USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
    END IF;

    -- Create admin_actions table for tracking admin interventions
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_actions') THEN
        CREATE TABLE public.admin_actions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            admin_wallet TEXT NOT NULL,
            action_type TEXT NOT NULL CHECK (
                action_type IN (
                    'poll_implementation_approved',
                    'poll_implementation_rejected', 
                    'poll_implementation_modified',
                    'commentary_updated',
                    'priority_changed',
                    'status_updated',
                    'emergency_intervention'
                )
            ),
            poll_id UUID REFERENCES public.oracle_polls(id),
            commentary_id UUID REFERENCES public.oracle_commentary(id),
            analysis_id UUID REFERENCES public.poll_analysis_results(id),
            reasoning TEXT NOT NULL,
            action_data JSONB,
            previous_values JSONB, -- Store old values for audit trail
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
        
        -- Admins can read all actions
        CREATE POLICY "Admins can read admin actions" ON public.admin_actions
            FOR SELECT USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
            
        -- Admins can insert their own actions
        CREATE POLICY "Admins can insert admin actions" ON public.admin_actions
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                ) AND
                admin_wallet = auth.jwt() ->> 'sub'
            );
    END IF;

    -- Create implementation_tasks table for tracking actual implementation steps
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'implementation_tasks') THEN
        CREATE TABLE public.implementation_tasks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            commentary_id UUID NOT NULL REFERENCES public.oracle_commentary(id) ON DELETE CASCADE,
            poll_id UUID NOT NULL REFERENCES public.oracle_polls(id) ON DELETE CASCADE,
            task_title TEXT NOT NULL,
            task_description TEXT NOT NULL,
            task_type TEXT NOT NULL CHECK (
                task_type IN ('code_change', 'config_update', 'content_update', 'system_change', 'community_notification')
            ),
            assigned_to TEXT, -- Admin wallet or system identifier
            status TEXT DEFAULT 'pending' CHECK (
                status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')
            ),
            priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1 = lowest, 10 = highest
            estimated_hours NUMERIC(5,2),
            actual_hours NUMERIC(5,2),
            dependencies TEXT[], -- Other task IDs this depends on
            resources_needed TEXT[],
            success_criteria TEXT[],
            failure_reason TEXT,
            rollback_plan TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            due_date TIMESTAMPTZ
        );

        -- Add RLS policies
        ALTER TABLE public.implementation_tasks ENABLE ROW LEVEL SECURITY;
        
        -- Admins can read all tasks
        CREATE POLICY "Admins can read implementation tasks" ON public.implementation_tasks
            FOR SELECT USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
            
        -- Admins can manage tasks
        CREATE POLICY "Admins can manage implementation tasks" ON public.implementation_tasks
            FOR ALL USING (
                auth.role() = 'authenticated' AND 
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE wallet_address = auth.jwt() ->> 'sub'
                    AND admin_role = true
                )
            );
    END IF;
END$$;

-- Create helper functions for AI Arbiter Agent

-- Function to check for completed polls that need analysis
CREATE OR REPLACE FUNCTION get_polls_needing_analysis()
RETURNS TABLE (
    poll_id UUID,
    poll_title TEXT,
    poll_description TEXT,
    voting_end TIMESTAMPTZ,
    total_votes BIGINT,
    already_analyzed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.voting_end,
        COALESCE(COUNT(v.id), 0) as total_votes,
        EXISTS(SELECT 1 FROM public.oracle_commentary oc WHERE oc.poll_id = p.id) as already_analyzed
    FROM public.oracle_polls p
    LEFT JOIN public.user_votes v ON v.poll_id = p.id
    WHERE p.voting_end < NOW() 
    AND p.status = 'active'
    GROUP BY p.id, p.title, p.description, p.voting_end
    ORDER BY p.voting_end DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get poll results for AI analysis
CREATE OR REPLACE FUNCTION get_poll_results_for_analysis(target_poll_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    poll_info RECORD;
    option_results JSONB;
    voter_stats JSONB;
    vote_timeline JSONB;
BEGIN
    -- Get poll basic info
    SELECT * INTO poll_info FROM public.oracle_polls WHERE id = target_poll_id;
    
    IF NOT FOUND THEN
        RETURN '{"error": "Poll not found"}'::JSONB;
    END IF;
    
    -- Get option results with vote counts
    SELECT jsonb_agg(
        jsonb_build_object(
            'option_id', o.id,
            'text', o.text,
            'votes', o.votes_count,
            'ai_reasoning', o.ai_reasoning,
            'predicted_outcome', o.predicted_outcome,
            'percentage', CASE 
                WHEN total_votes.count > 0 THEN ROUND((o.votes_count::NUMERIC / total_votes.count) * 100, 2)
                ELSE 0
            END
        )
    ) INTO option_results
    FROM public.poll_options o
    CROSS JOIN (
        SELECT COALESCE(SUM(votes_count), 0) as count 
        FROM public.poll_options 
        WHERE poll_id = target_poll_id
    ) total_votes
    WHERE o.poll_id = target_poll_id;
    
    -- Get voter statistics
    SELECT jsonb_build_object(
        'total_voters', COUNT(DISTINCT v.wallet_address),
        'total_votes', COUNT(v.id),
        'unique_wallets', array_agg(DISTINCT v.wallet_address),
        'voting_timeline', jsonb_agg(
            jsonb_build_object(
                'wallet', v.wallet_address,
                'voted_at', v.voted_at,
                'option_id', v.option_id,
                'shards_earned', v.oracle_shards_earned
            ) ORDER BY v.voted_at
        )
    ) INTO voter_stats
    FROM public.user_votes v
    WHERE v.poll_id = target_poll_id;
    
    -- Build final result
    result := jsonb_build_object(
        'poll', jsonb_build_object(
            'id', poll_info.id,
            'title', poll_info.title,
            'description', poll_info.description,
            'category', poll_info.category,
            'oracle_personality', poll_info.oracle_personality,
            'corruption_influence', poll_info.corruption_influence,
            'voting_start', poll_info.voting_start,
            'voting_end', poll_info.voting_end,
            'oracle_shards_reward', poll_info.oracle_shards_reward,
            'girth_reward_pool', poll_info.girth_reward_pool
        ),
        'options', option_results,
        'voters', voter_stats,
        'analysis_metadata', jsonb_build_object(
            'analyzed_at', NOW(),
            'poll_completed', poll_info.voting_end < NOW(),
            'is_active', poll_info.status = 'active'
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark poll as closed and analyzed
CREATE OR REPLACE FUNCTION mark_poll_analyzed(target_poll_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.oracle_polls 
    SET status = 'closed'
    WHERE id = target_poll_id 
    AND voting_end < NOW() 
    AND status = 'active';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending implementation items for admin dashboard
CREATE OR REPLACE FUNCTION get_pending_implementations()
RETURNS TABLE (
    commentary_id UUID,
    poll_id UUID,
    poll_title TEXT,
    implementation_status TEXT,
    priority_level TEXT,
    complexity_estimate TEXT,
    created_at TIMESTAMPTZ,
    days_pending INTEGER,
    total_tasks INTEGER,
    completed_tasks INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oc.id,
        oc.poll_id,
        op.title,
        oc.implementation_status,
        oc.priority_level,
        oc.complexity_estimate,
        oc.created_at,
        EXTRACT(days FROM NOW() - oc.created_at)::INTEGER,
        COALESCE(task_stats.total, 0),
        COALESCE(task_stats.completed, 0)
    FROM public.oracle_commentary oc
    JOIN public.oracle_polls op ON op.id = oc.poll_id
    LEFT JOIN (
        SELECT 
            commentary_id,
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM public.implementation_tasks
        GROUP BY commentary_id
    ) task_stats ON task_stats.commentary_id = oc.id
    WHERE oc.implementation_status IN ('pending', 'in_progress', 'requires_admin_review')
    ORDER BY 
        CASE oc.priority_level 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        oc.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oracle_commentary_poll_id ON public.oracle_commentary(poll_id);
CREATE INDEX IF NOT EXISTS idx_oracle_commentary_status ON public.oracle_commentary(implementation_status);
CREATE INDEX IF NOT EXISTS idx_oracle_commentary_priority ON public.oracle_commentary(priority_level);
CREATE INDEX IF NOT EXISTS idx_poll_analysis_results_poll_id ON public.poll_analysis_results(poll_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_poll_id ON public.admin_actions(poll_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_timestamp ON public.admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_implementation_tasks_commentary_id ON public.implementation_tasks(commentary_id);
CREATE INDEX IF NOT EXISTS idx_implementation_tasks_status ON public.implementation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_oracle_polls_status_voting_end ON public.oracle_polls(status, voting_end);

-- =============================================
-- AI GOVERNANCE SCHEMA FIXES (CORRECTED)
-- Fix specific mismatches between Prophet Agent and actual database
-- =============================================

-- 1. CREATE MISSING DATABASE FUNCTIONS THAT PROPHET AGENT CALLS

-- Function: check_emergency_brake_active (MISSING - Prophet Agent calls this)
CREATE OR REPLACE FUNCTION check_emergency_brake_active()
RETURNS BOOLEAN AS $$
DECLARE
    brake_active BOOLEAN := FALSE;
BEGIN
    -- Check if emergency brake is currently active
    SELECT active INTO brake_active 
    FROM emergency_brake_status 
    WHERE active = TRUE
    ORDER BY id DESC 
    LIMIT 1;
    
    RETURN COALESCE(brake_active, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_autonomy_level_for_decision (MISSING - Prophet Agent calls this)
CREATE OR REPLACE FUNCTION get_autonomy_level_for_decision(
    p_decision_category TEXT,
    p_severity_level INTEGER
)
RETURNS TEXT AS $$
DECLARE
    autonomy_level TEXT;
BEGIN
    -- Get the autonomy level based on category and severity
    SELECT config.autonomy_level INTO autonomy_level
    FROM ai_governance_config config
    WHERE config.decision_category = p_decision_category
    AND config.severity_threshold <= p_severity_level
    AND config.active = TRUE
    ORDER BY config.severity_threshold DESC
    LIMIT 1;
    
    -- Fallback to default if no specific rule found
    IF autonomy_level IS NULL THEN
        SELECT config.autonomy_level INTO autonomy_level
        FROM ai_governance_config config
        WHERE config.decision_category = 'default'
        AND config.active = TRUE
        LIMIT 1;
    END IF;
    
    -- Final fallback
    RETURN COALESCE(autonomy_level, 'admin_notified');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ADD MISSING COLUMNS THAT PROPHET AGENT EXPECTS

-- Add columns to ai_decisions that Prophet Agent tries to update
ALTER TABLE ai_decisions 
ADD COLUMN IF NOT EXISTS admin_notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_timestamp TIMESTAMPTZ;

-- 3. ENSURE AI_GOVERNANCE_CONFIG HAS DEFAULT DATA (FIXED - using WHERE NOT EXISTS)

-- Insert default governance configuration if none exists
INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'game_balance', 'full_autonomous', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'game_balance' AND severity_threshold = 1);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'game_balance', 'admin_notified', 7, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'game_balance' AND severity_threshold = 7);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'economic_policy', 'admin_notified', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'economic_policy' AND severity_threshold = 1);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'economic_policy', 'admin_notified', 8, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'economic_policy' AND severity_threshold = 8);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'technical_upgrades', 'admin_notified', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'technical_upgrades' AND severity_threshold = 1);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'technical_upgrades', 'admin_notified', 9, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'technical_upgrades' AND severity_threshold = 9);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'community_rules', 'admin_notified', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'community_rules' AND severity_threshold = 1);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'long_term_strategy', 'admin_notified', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'long_term_strategy' AND severity_threshold = 1);

INSERT INTO ai_governance_config (decision_category, autonomy_level, severity_threshold, active) 
SELECT 'default', 'admin_notified', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE decision_category = 'default' AND severity_threshold = 1);

-- 4. ENSURE EMERGENCY_BRAKE_STATUS HAS DEFAULT RECORD

-- Insert default emergency brake status if none exists
INSERT INTO emergency_brake_status (active, reason) 
SELECT FALSE, 'System operational - no emergency brake active'
WHERE NOT EXISTS (SELECT 1 FROM emergency_brake_status);

-- 5. ADD PERFORMANCE INDEXES FOR PROPHET AGENT QUERIES

-- Index for unprocessed decisions query
CREATE INDEX IF NOT EXISTS idx_ai_decisions_unprocessed 
ON ai_decisions(executed, requires_vote, poll_id, created_at) 
WHERE executed = FALSE AND requires_vote = TRUE AND poll_id IS NULL;

-- Index for governance config lookups
CREATE INDEX IF NOT EXISTS idx_ai_governance_config_lookup 
ON ai_governance_config(decision_category, severity_threshold, active) 
WHERE active = TRUE;

-- Index for emergency brake checks
CREATE INDEX IF NOT EXISTS idx_emergency_brake_active_check 
ON emergency_brake_status(active, id) 
WHERE active = TRUE;

-- 6. GRANT NECESSARY PERMISSIONS TO SERVICE ROLE

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION check_emergency_brake_active() TO service_role;
GRANT EXECUTE ON FUNCTION get_autonomy_level_for_decision(TEXT, INTEGER) TO service_role;

-- Grant access to tables for Prophet Agent
GRANT ALL ON ai_decisions TO service_role;
GRANT ALL ON ai_decision_context TO service_role;
GRANT ALL ON ai_governance_config TO service_role;
GRANT ALL ON emergency_brake_status TO service_role;
GRANT ALL ON oracle_polls TO service_role;
GRANT ALL ON poll_options TO service_role;
GRANT ALL ON oracle_commentary TO service_role;
GRANT ALL ON admin_governance_log TO service_role;

-- 7. FIX ANY INCONSISTENCIES IN EXISTING DATA

-- Ensure all ai_decisions have valid autonomy levels
UPDATE ai_decisions 
SET autonomy_level = 'admin_notified'
WHERE autonomy_level IS NULL OR autonomy_level = '';

-- 8. VERIFICATION CHECKS

-- Verify the required functions exist
DO $$
BEGIN
    -- Check check_emergency_brake_active function
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'check_emergency_brake_active'
    ) THEN
        RAISE EXCEPTION 'check_emergency_brake_active function missing';
    END IF;
    
    -- Check get_autonomy_level_for_decision function  
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_autonomy_level_for_decision'
    ) THEN
        RAISE EXCEPTION 'get_autonomy_level_for_decision function missing';
    END IF;
    
    -- Check that emergency brake table has data
    IF NOT EXISTS (SELECT 1 FROM emergency_brake_status) THEN
        RAISE EXCEPTION 'emergency_brake_status table is empty';
    END IF;
    
    -- Check that governance config has data
    IF NOT EXISTS (SELECT 1 FROM ai_governance_config WHERE active = TRUE) THEN
        RAISE EXCEPTION 'ai_governance_config has no active configurations';
    END IF;
    
    RAISE NOTICE '✅ All AI Governance schema fixes completed successfully!';
END $$;

-- =============================================
-- FIX POLL CATEGORY CONSTRAINT MISMATCH
-- The Prophet Agent generates categories that don't match oracle_polls constraints
-- =============================================

-- 1. UPDATE ORACLE_POLLS CATEGORY CONSTRAINT TO ALLOW AI-GENERATED CATEGORIES

-- Drop the existing constraint
ALTER TABLE oracle_polls DROP CONSTRAINT IF EXISTS oracle_polls_category_check;

-- Add new constraint that includes AI-generated categories
ALTER TABLE oracle_polls ADD CONSTRAINT oracle_polls_category_check 
CHECK (
    category = ANY (
        ARRAY[
            'prophecy'::text,
            'lore'::text, 
            'game_evolution'::text,
            'oracle_personality'::text,
            -- AI-generated categories from Prophet Agent
            'Economic Policy'::text,
            'Game Balance'::text,
            'Community Rules'::text,
            'Technical Upgrades'::text,
            'Long-term Strategy'::text
        ]
    )
);

-- 2. VERIFY THE CONSTRAINT UPDATE WORKED
DO $$
BEGIN
    -- Test that the new categories are accepted
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'oracle_polls_category_check'
        AND check_clause LIKE '%Economic Policy%'
    ) THEN
        RAISE EXCEPTION 'oracle_polls category constraint not updated properly';
    END IF;
    
    RAISE NOTICE '✅ Poll category constraint updated to allow AI-generated categories!';
END $$; 