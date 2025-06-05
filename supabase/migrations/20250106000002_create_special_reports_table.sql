-- Create special_reports table
CREATE TABLE IF NOT EXISTS public.special_reports (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    trigger_reason TEXT,
    severity_level TEXT DEFAULT 'MEDIUM',
    report_type TEXT DEFAULT 'STATUS_UPDATE',
    girth_index_snapshot JSONB,
    activity_summary JSONB,
    automated_trigger BOOLEAN DEFAULT false,
    audio_url TEXT,
    audio_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.special_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for special_reports
CREATE POLICY "special_reports_read_policy" ON public.special_reports
    FOR SELECT USING (true);

CREATE POLICY "special_reports_insert_policy" ON public.special_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "special_reports_update_policy" ON public.special_reports
    FOR UPDATE USING (true);

-- Create index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_special_reports_created_at ON public.special_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_special_reports_severity ON public.special_reports(severity_level);
CREATE INDEX IF NOT EXISTS idx_special_reports_type ON public.special_reports(report_type); 