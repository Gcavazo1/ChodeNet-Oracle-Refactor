-- AI GOVERNANCE CONTROL SYSTEM - PHASE 1
-- Database schema extensions for AI Poll Autonomy Classification

-- AI Governance Configuration
CREATE TABLE IF NOT EXISTS ai_governance_config (
    id BIGSERIAL PRIMARY KEY,
    config_category TEXT NOT NULL, -- 'autonomy_levels', 'emergency_controls', 'admin_oversight'
    config_key TEXT NOT NULL,
    config_value TEXT NOT NULL,
    severity_threshold INTEGER DEFAULT 5,
    autonomy_level TEXT DEFAULT 'admin_notified' CHECK (autonomy_level IN ('full_autonomous', 'admin_notified', 'admin_delayed', 'admin_approval')),
    requires_admin_approval BOOLEAN DEFAULT FALSE,
    admin_override_window_hours INTEGER DEFAULT 24,
    emergency_bypass_allowed BOOLEAN DEFAULT TRUE,
    config_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(config_category, config_key)
);

COMMENT ON TABLE ai_governance_config IS 'Configuration rules for AI autonomy levels and governance controls';

-- Insert default governance configuration
INSERT INTO ai_governance_config (config_category, config_key, config_value, severity_threshold, autonomy_level, requires_admin_approval, admin_override_window_hours) VALUES
-- Economic decisions
('economic_policy', 'base_autonomy_level', 'admin_notified', 6, 'admin_notified', false, 0),
('economic_policy', 'high_severity_threshold', '7', 7, 'admin_notified', false, 0),

-- Game balance decisions  
('game_balance', 'base_autonomy_level', 'full_autonomous', 8, 'full_autonomous', false, 0),
('game_balance', 'high_severity_threshold', '9', 9, 'admin_notified', false, 0),

-- Community policy decisions
('community_policy', 'base_autonomy_level', 'admin_notified', 5, 'admin_notified', false, 0),
('community_policy', 'high_severity_threshold', '8', 8, 'admin_notified', false, 0),

-- Technical decisions
('technical_upgrades', 'base_autonomy_level', 'full_autonomous', 7, 'full_autonomous', false, 0),
('technical_upgrades', 'high_severity_threshold', '9', 9, 'admin_notified', false, 0),

-- Default fallback
('default', 'base_autonomy_level', 'admin_notified', 5, 'admin_notified', false, 0)

ON CONFLICT (config_category, config_key) DO NOTHING;

-- AI Poll Drafts System (for approval workflow)
CREATE TABLE IF NOT EXISTS ai_poll_drafts (
    id BIGSERIAL PRIMARY KEY,
    source_decision_id BIGINT, -- References ai_decisions(id) but no FK constraint yet
    poll_data JSONB NOT NULL, -- Generated poll content
    draft_status TEXT DEFAULT 'pending_approval' CHECK (draft_status IN ('pending_approval', 'approved', 'rejected', 'auto_approved')),
    admin_action_required BOOLEAN DEFAULT FALSE,
    admin_override_deadline TIMESTAMPTZ,
    approval_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    rejection_reason TEXT
);

COMMENT ON TABLE ai_poll_drafts IS 'Draft polls awaiting admin approval in non-autonomous modes';

-- Admin Governance Actions Log
CREATE TABLE IF NOT EXISTS admin_governance_log (
    id BIGSERIAL PRIMARY KEY,
    action_type TEXT NOT NULL, -- 'poll_approved', 'poll_rejected', 'emergency_brake', 'override_used'
    poll_draft_id BIGINT REFERENCES ai_poll_drafts(id) ON DELETE SET NULL,
    poll_id TEXT, -- UUID string reference to oracle_polls
    decision_id BIGINT, -- References ai_decisions(id) but no FK constraint yet
    admin_user TEXT NOT NULL,
    admin_wallet TEXT,
    action_details JSONB DEFAULT '{}',
    reasoning TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_governance_log IS 'Complete log of all admin governance actions for audit trail';

-- Admin Override Windows (for delayed autonomous polls)
CREATE TABLE IF NOT EXISTS admin_override_windows (
    id BIGSERIAL PRIMARY KEY,
    poll_id TEXT NOT NULL, -- UUID string reference to oracle_polls
    decision_id BIGINT, -- References ai_decisions(id) but no FK constraint yet  
    override_deadline TIMESTAMPTZ NOT NULL,
    window_status TEXT DEFAULT 'active' CHECK (window_status IN ('active', 'expired', 'exercised', 'cancelled')),
    admin_action TEXT, -- What admin did if they used the override
    admin_user TEXT, -- Who used the override
    admin_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_override_windows IS 'Time windows for admin oversight of autonomous polls';

-- Emergency Governance Controls
CREATE TABLE IF NOT EXISTS emergency_governance_controls (
    id BIGSERIAL PRIMARY KEY,
    control_type TEXT NOT NULL CHECK (control_type IN ('emergency_brake', 'agent_pause', 'system_override')),
    is_active BOOLEAN DEFAULT FALSE,
    activated_by TEXT,
    activated_at TIMESTAMPTZ,
    reason TEXT NOT NULL,
    duration_hours INTEGER DEFAULT 24,
    deactivated_by TEXT,
    deactivated_at TIMESTAMPTZ,
    affected_agents TEXT[] DEFAULT '{}',
    emergency_metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE emergency_governance_controls IS 'Emergency controls for AI system governance';

-- Create required functions for AI governance
CREATE OR REPLACE FUNCTION get_autonomy_level_for_decision(
    p_decision_category TEXT,
    p_severity_level INTEGER DEFAULT 5
) RETURNS TEXT AS $$
DECLARE
    autonomy_result TEXT;
BEGIN
    -- Get autonomy level based on category and severity
    SELECT 
        CASE 
            WHEN p_severity_level <= agc.severity_threshold THEN agc.autonomy_level
            ELSE 'admin_notified' -- Higher severity gets more oversight
        END
    INTO autonomy_result
    FROM ai_governance_config agc
    WHERE agc.config_category = p_decision_category
    AND agc.config_key = 'base_autonomy_level'
    LIMIT 1;
    
    -- Fallback to default if no specific rule found
    IF autonomy_result IS NULL THEN
        SELECT autonomy_level INTO autonomy_result
        FROM ai_governance_config 
        WHERE config_category = 'default' 
        AND config_key = 'base_autonomy_level'
        LIMIT 1;
    END IF;
    
    -- Final fallback
    RETURN COALESCE(autonomy_result, 'admin_notified');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_emergency_brake_active() RETURNS BOOLEAN AS $$
DECLARE
    brake_active BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM emergency_governance_controls 
        WHERE control_type = 'emergency_brake' 
        AND is_active = TRUE
        AND (
            deactivated_at IS NULL OR 
            deactivated_at > NOW()
        )
    ) INTO brake_active;
    
    RETURN brake_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for AI agents to use these functions
GRANT EXECUTE ON FUNCTION get_autonomy_level_for_decision(TEXT, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_emergency_brake_active() TO anon, authenticated, service_role;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_governance_config_category ON ai_governance_config(config_category);
CREATE INDEX IF NOT EXISTS idx_ai_governance_config_autonomy ON ai_governance_config(autonomy_level);
CREATE INDEX IF NOT EXISTS idx_ai_poll_drafts_status ON ai_poll_drafts(draft_status);
CREATE INDEX IF NOT EXISTS idx_ai_poll_drafts_deadline ON ai_poll_drafts(admin_override_deadline) WHERE admin_override_deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_governance_actions_admin ON admin_governance_log(admin_wallet);
CREATE INDEX IF NOT EXISTS idx_emergency_controls_type ON emergency_governance_controls(control_type);

-- Add autonomy_level and governance_data to existing ai_decisions table
ALTER TABLE ai_decisions 
ADD COLUMN IF NOT EXISTS autonomy_level TEXT,
ADD COLUMN IF NOT EXISTS governance_classification JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS admin_notification_sent BOOLEAN DEFAULT FALSE;

-- RLS Policies (if RLS is enabled)
ALTER TABLE ai_governance_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_poll_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_governance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_governance_controls ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users, write access to service role
CREATE POLICY "Allow read access to ai_governance_config" ON ai_governance_config FOR SELECT USING (true);
CREATE POLICY "Allow read access to ai_poll_drafts" ON ai_poll_drafts FOR SELECT USING (true);
CREATE POLICY "Allow read access to admin_governance_log" ON admin_governance_log FOR SELECT USING (true);
CREATE POLICY "Allow read access to emergency_governance_controls" ON emergency_governance_controls FOR SELECT USING (true);

COMMENT ON TABLE ai_governance_config IS 'Configuration rules for AI autonomy levels and governance controls';
COMMENT ON TABLE ai_poll_drafts IS 'Draft polls awaiting admin approval in non-autonomous modes';
COMMENT ON TABLE admin_governance_log IS 'Complete log of all admin governance actions for audit trail';
COMMENT ON TABLE emergency_governance_controls IS 'Emergency controls for AI system governance';

-- =============================================
-- AI GOVERNANCE CONTROL SYSTEM
-- =============================================

-- Add missing columns and fix type mismatches in existing AI tables
DO $$ 
BEGIN
    -- Add missing columns to ai_decisions if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_decisions' AND column_name = 'decision_title') THEN
        ALTER TABLE ai_decisions ADD COLUMN decision_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_decisions' AND column_name = 'decision_description') THEN
        ALTER TABLE ai_decisions ADD COLUMN decision_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_decisions' AND column_name = 'severity_level') THEN
        ALTER TABLE ai_decisions ADD COLUMN severity_level INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_decisions' AND column_name = 'autonomy_level') THEN
        ALTER TABLE ai_decisions ADD COLUMN autonomy_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_decisions' AND column_name = 'governance_classification') THEN
        ALTER TABLE ai_decisions ADD COLUMN governance_classification JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_decisions' AND column_name = 'processed_at') THEN
        ALTER TABLE ai_decisions ADD COLUMN processed_at TIMESTAMPTZ;
    END IF;
    
    -- Fix the poll_id type mismatch: BIGINT to TEXT to store UUID strings
    -- First drop the foreign key constraint
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ai_decisions_poll_id_fkey') THEN
        ALTER TABLE ai_decisions DROP CONSTRAINT ai_decisions_poll_id_fkey;
    END IF;
    
    -- Change poll_id to TEXT to store UUID strings  
    ALTER TABLE ai_decisions ALTER COLUMN poll_id TYPE TEXT;
    
    -- Update existing NULL values to NULL (they should already be null)
    UPDATE ai_decisions SET poll_id = NULL WHERE poll_id IS NULL;
    
    -- Add a new constraint to validate UUID format (optional)
    ALTER TABLE ai_decisions ADD CONSTRAINT poll_id_uuid_format CHECK (
        poll_id IS NULL OR 
        poll_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    );
END $$; 