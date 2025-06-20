-- Enhanced Poll Completion System Database Schema
-- Migration to support immediate poll completion processing and tracking

-- =============================================
-- POLL COMPLETION EVENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS poll_completion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES oracle_polls(id) ON DELETE CASCADE,
    completion_data JSONB NOT NULL,
    processing_status TEXT DEFAULT 'pending_analysis' CHECK (
        processing_status IN (
            'pending_analysis', 
            'analysis_in_progress', 
            'analysis_complete', 
            'implementation_planning', 
            'awaiting_admin_review', 
            'implementation_approved', 
            'implementation_in_progress', 
            'implementation_complete',
            'implementation_failed',
            'cancelled'
        )
    ),
    ai_analysis_started_at TIMESTAMPTZ,
    ai_analysis_completed_at TIMESTAMPTZ,
    admin_review_required BOOLEAN DEFAULT FALSE,
    admin_reviewed_at TIMESTAMPTZ,
    admin_reviewed_by TEXT,
    implementation_started_at TIMESTAMPTZ,
    implementation_completed_at TIMESTAMPTZ,
    implementation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADMIN NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (
        type IN (
            'poll_completion',
            'ai_analysis_complete',
            'implementation_required',
            'system_alert',
            'emergency_brake',
            'governance_approval_needed',
            'execution_failure',
            'community_milestone'
        )
    ),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    read_status BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    read_by TEXT,
    action_required BOOLEAN DEFAULT FALSE,
    action_taken BOOLEAN DEFAULT FALSE,
    action_taken_at TIMESTAMPTZ,
    action_taken_by TEXT,
    action_notes TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMMUNITY ANNOUNCEMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS community_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (
        type IN (
            'poll_results',
            'implementation_update',
            'new_poll_available',
            'system_update',
            'oracle_response',
            'community_milestone',
            'governance_change'
        )
    ),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    data JSONB,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'authenticated', 'admin_only')),
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    display_until TIMESTAMPTZ,
    interaction_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- IMPLEMENTATION TASKS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS implementation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_completion_event_id UUID REFERENCES poll_completion_events(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    task_description TEXT,
    task_type TEXT CHECK (
        task_type IN (
            'database_change',
            'frontend_update',
            'backend_modification',
            'configuration_change',
            'content_update',
            'policy_change',
            'manual_action',
            'approval_process'
        )
    ),
    priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    complexity_estimate TEXT DEFAULT 'moderate' CHECK (complexity_estimate IN ('simple', 'moderate', 'complex')),
    estimated_hours INTEGER,
    assigned_to TEXT,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'in_progress',
            'blocked',
            'testing',
            'completed',
            'cancelled',
            'failed'
        )
    ),
    dependencies JSONB, -- Array of task IDs this task depends on
    completion_criteria TEXT,
    testing_notes TEXT,
    completion_verified_by TEXT,
    completion_verified_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- POLL OUTCOME TRACKING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS poll_outcome_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES oracle_polls(id) ON DELETE CASCADE,
    poll_completion_event_id UUID REFERENCES poll_completion_events(id) ON DELETE CASCADE,
    winning_option_id UUID REFERENCES poll_options(id),
    implementation_success BOOLEAN,
    community_satisfaction_score DECIMAL(3,2), -- 0.00 to 10.00
    actual_implementation_time_hours INTEGER,
    unexpected_consequences TEXT,
    lessons_learned TEXT,
    follow_up_actions_needed TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_poll_completion_events_poll_id ON poll_completion_events(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_completion_events_status ON poll_completion_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_poll_completion_events_created_at ON poll_completion_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_urgency ON admin_notifications(urgency);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read_status ON admin_notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_announcements_type ON community_announcements(type);
CREATE INDEX IF NOT EXISTS idx_community_announcements_visibility ON community_announcements(visibility);
CREATE INDEX IF NOT EXISTS idx_community_announcements_priority ON community_announcements(priority DESC);
CREATE INDEX IF NOT EXISTS idx_community_announcements_created_at ON community_announcements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_implementation_tasks_poll_completion_event_id ON implementation_tasks(poll_completion_event_id);
CREATE INDEX IF NOT EXISTS idx_implementation_tasks_status ON implementation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_implementation_tasks_priority ON implementation_tasks(priority_level);
CREATE INDEX IF NOT EXISTS idx_implementation_tasks_assigned_to ON implementation_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_poll_outcome_tracking_poll_id ON poll_outcome_tracking(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_outcome_tracking_success ON poll_outcome_tracking(implementation_success);

-- =============================================
-- DATABASE FUNCTIONS FOR POLL COMPLETION
-- =============================================

-- Function to get poll completion metrics
CREATE OR REPLACE FUNCTION get_poll_completion_metrics()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_completed_polls', (
            SELECT COUNT(*) 
            FROM poll_completion_events
        ),
        'pending_analysis', (
            SELECT COUNT(*) 
            FROM poll_completion_events 
            WHERE processing_status IN ('pending_analysis', 'analysis_in_progress')
        ),
        'awaiting_admin_review', (
            SELECT COUNT(*) 
            FROM poll_completion_events 
            WHERE processing_status = 'awaiting_admin_review'
        ),
        'implementation_in_progress', (
            SELECT COUNT(*) 
            FROM poll_completion_events 
            WHERE processing_status = 'implementation_in_progress'
        ),
        'completed_successfully', (
            SELECT COUNT(*) 
            FROM poll_completion_events 
            WHERE processing_status = 'implementation_complete'
        ),
        'average_completion_time_hours', (
            SELECT ROUND(AVG(EXTRACT(EPOCH FROM (implementation_completed_at - created_at)) / 3600), 2)
            FROM poll_completion_events 
            WHERE implementation_completed_at IS NOT NULL
        ),
        'unread_admin_notifications', (
            SELECT COUNT(*) 
            FROM admin_notifications 
            WHERE read_status = FALSE
        ),
        'critical_notifications', (
            SELECT COUNT(*) 
            FROM admin_notifications 
            WHERE urgency = 'critical' AND read_status = FALSE
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function to get pending implementation tasks
CREATE OR REPLACE FUNCTION get_pending_implementation_tasks()
RETURNS TABLE (
    task_id UUID,
    poll_title TEXT,
    task_title TEXT,
    priority_level TEXT,
    complexity_estimate TEXT,
    status TEXT,
    days_pending INTEGER,
    assigned_to TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        it.id,
        op.title,
        it.task_title,
        it.priority_level,
        it.complexity_estimate,
        it.status,
        EXTRACT(DAYS FROM (NOW() - it.created_at))::INTEGER,
        it.assigned_to
    FROM implementation_tasks it
    JOIN poll_completion_events pce ON it.poll_completion_event_id = pce.id
    JOIN oracle_polls op ON pce.poll_id = op.id
    WHERE it.status IN ('pending', 'in_progress', 'blocked')
    ORDER BY 
        CASE it.priority_level 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        it.created_at ASC;
END;
$$;

-- Function to update poll completion status
CREATE OR REPLACE FUNCTION update_poll_completion_status(
    completion_event_id UUID,
    new_status TEXT,
    admin_wallet TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE poll_completion_events 
    SET 
        processing_status = new_status,
        updated_at = NOW(),
        admin_reviewed_at = CASE 
            WHEN new_status IN ('awaiting_admin_review', 'implementation_approved') 
            THEN NOW() 
            ELSE admin_reviewed_at 
        END,
        admin_reviewed_by = CASE 
            WHEN new_status IN ('awaiting_admin_review', 'implementation_approved') 
            THEN COALESCE(admin_wallet, admin_reviewed_by)
            ELSE admin_reviewed_by 
        END,
        implementation_started_at = CASE 
            WHEN new_status = 'implementation_in_progress' 
            THEN NOW() 
            ELSE implementation_started_at 
        END,
        implementation_completed_at = CASE 
            WHEN new_status = 'implementation_complete' 
            THEN NOW() 
            ELSE implementation_completed_at 
        END,
        implementation_notes = COALESCE(notes, implementation_notes)
    WHERE id = completion_event_id;
    
    RETURN FOUND;
END;
$$;

-- Function to mark admin notification as read
CREATE OR REPLACE FUNCTION mark_admin_notification_read(
    notification_id UUID,
    admin_wallet TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE admin_notifications 
    SET 
        read_status = TRUE,
        read_at = NOW(),
        read_by = admin_wallet
    WHERE id = notification_id;
    
    RETURN FOUND;
END;
$$;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_poll_completion_events_updated_at
    BEFORE UPDATE ON poll_completion_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_implementation_tasks_updated_at
    BEFORE UPDATE ON implementation_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_announcements_updated_at
    BEFORE UPDATE ON community_announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_outcome_tracking_updated_at
    BEFORE UPDATE ON poll_outcome_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on new tables
ALTER TABLE poll_completion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_outcome_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for poll_completion_events (admin and service role access)
CREATE POLICY "Enable read access for authenticated users" ON poll_completion_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable full access for service role" ON poll_completion_events
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for admin_notifications (admin only)
CREATE POLICY "Enable read access for service role" ON admin_notifications
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Enable full access for service role" ON admin_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for community_announcements (public read, admin write)
CREATE POLICY "Enable read access for all users" ON community_announcements
    FOR SELECT USING (
        visibility = 'public' OR 
        (visibility = 'authenticated' AND auth.role() = 'authenticated') OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Enable full access for service role" ON community_announcements
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for implementation_tasks (admin access)
CREATE POLICY "Enable read access for authenticated users" ON implementation_tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable full access for service role" ON implementation_tasks
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for poll_outcome_tracking (read for authenticated, write for service)
CREATE POLICY "Enable read access for authenticated users" ON poll_outcome_tracking
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable full access for service role" ON poll_outcome_tracking
    FOR ALL USING (auth.role() = 'service_role'); 