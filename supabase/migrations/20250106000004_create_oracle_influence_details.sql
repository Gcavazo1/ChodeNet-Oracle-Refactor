-- 🔮 Oracle Influence Details Table
-- Stores detailed breakdown of what influences each metric value

CREATE TABLE IF NOT EXISTS oracle_influence_details (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    influences_json JSONB NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_oracle_influence_session 
ON oracle_influence_details(session_id);

-- Index for fast time-based queries
CREATE INDEX IF NOT EXISTS idx_oracle_influence_calculated_at 
ON oracle_influence_details(calculated_at);

-- RLS policies (if needed)
ALTER TABLE oracle_influence_details ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on oracle_influence_details" 
ON oracle_influence_details FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE oracle_influence_details IS 'Stores detailed influence calculations for Oracle metrics';
COMMENT ON COLUMN oracle_influence_details.session_id IS 'Game session identifier';
COMMENT ON COLUMN oracle_influence_details.influences_json IS 'Detailed breakdown of metric influences';
COMMENT ON COLUMN oracle_influence_details.calculated_at IS 'When the influences were calculated'; 