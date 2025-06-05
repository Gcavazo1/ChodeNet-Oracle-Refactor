-- Create Base Oracle Tables
-- This migration creates the fundamental tables needed for the Oracle system

-- Create live_game_events table for incoming events
CREATE TABLE IF NOT EXISTS public.live_game_events (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    player_address TEXT,
    event_type TEXT NOT NULL,
    event_payload JSONB NOT NULL DEFAULT '{}',
    timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    game_event_timestamp TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_game_events_session_id ON public.live_game_events(session_id);
CREATE INDEX IF NOT EXISTS idx_live_game_events_timestamp ON public.live_game_events(timestamp_utc);
CREATE INDEX IF NOT EXISTS idx_live_game_events_processed ON public.live_game_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_live_game_events_type ON public.live_game_events(event_type);

-- Create girth_index_current_values table (singleton)
CREATE TABLE IF NOT EXISTS public.girth_index_current_values (
    id INTEGER PRIMARY KEY DEFAULT 1,
    divine_girth_resonance NUMERIC(5,2) NOT NULL DEFAULT 50.0,
    tap_surge_index TEXT NOT NULL DEFAULT 'STEADY_POUNDING',
    legion_morale TEXT NOT NULL DEFAULT 'CAUTIOUS',
    oracle_stability_status TEXT NOT NULL DEFAULT 'PRISTINE',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculation_source TEXT DEFAULT 'manual',
    previous_tap_surge_index TEXT,
    previous_legion_morale TEXT,
    previous_oracle_stability_status TEXT,
    CONSTRAINT girth_index_singleton CHECK (id = 1)
);

-- Insert default values
INSERT INTO public.girth_index_current_values (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create automation_log table
CREATE TABLE IF NOT EXISTS public.automation_log (
    id BIGSERIAL PRIMARY KEY,
    automation_type TEXT NOT NULL,
    trigger_source TEXT NOT NULL,
    events_processed INTEGER DEFAULT 0,
    calculation_details JSONB DEFAULT '{}',
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automation_log_type ON public.automation_log(automation_type);
CREATE INDEX IF NOT EXISTS idx_automation_log_created_at ON public.automation_log(created_at);

-- Enable RLS on all tables
ALTER TABLE public.live_game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.girth_index_current_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_log ENABLE ROW LEVEL SECURITY;

-- Create policies for live_game_events
CREATE POLICY "live_game_events_read_policy" ON public.live_game_events
    FOR SELECT USING (true);

CREATE POLICY "live_game_events_insert_policy" ON public.live_game_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "live_game_events_update_policy" ON public.live_game_events
    FOR UPDATE USING (true);

-- Create policies for girth_index_current_values
CREATE POLICY "girth_index_read_policy" ON public.girth_index_current_values
    FOR SELECT USING (true);

CREATE POLICY "girth_index_update_policy" ON public.girth_index_current_values
    FOR UPDATE USING (true);

-- Create policies for automation_log
CREATE POLICY "automation_log_read_policy" ON public.automation_log
    FOR SELECT USING (true);

CREATE POLICY "automation_log_insert_policy" ON public.automation_log
    FOR INSERT WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE public.live_game_events IS 'Stores incoming game events from players';
COMMENT ON TABLE public.girth_index_current_values IS 'Singleton table storing current Oracle metrics';
COMMENT ON TABLE public.automation_log IS 'Logs all automated Oracle operations'; 