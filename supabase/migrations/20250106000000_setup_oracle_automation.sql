-- Setup Oracle Automation System
-- This migration creates the necessary infrastructure for automated Oracle processing

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Set base configuration (these will need to be set properly in production)
-- For now, using placeholder values that work with local development
DO $$
BEGIN
    -- Set app settings for local development
    PERFORM set_config('app.base_url', 'http://127.0.0.1:54321', false);
    PERFORM set_config('app.service_role_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU', false);
END $$;

-- Create a cron job to run aggregate-game-events every 30 seconds
-- This will process live events and update the girth index automatically
SELECT cron.schedule(
    'aggregate-game-events-automation',
    '*/30 * * * * *', -- Every 30 seconds
    $$SELECT net.http_post(
        url := current_setting('app.base_url') || '/functions/v1/aggregate-game-events',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
        ),
        body := jsonb_build_object(
            'trigger_type', 'cron_job',
            'timestamp', now()
        )
    )$$
);

-- Create a function to trigger prophecies based on girth index changes
CREATE OR REPLACE FUNCTION trigger_automated_prophecy()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for significant state changes that warrant automated prophecies
    IF (
        -- Oracle stability degraded to critical
        (NEW.oracle_stability_status = 'CRITICAL_CORRUPTION' AND OLD.oracle_stability_status != 'CRITICAL_CORRUPTION')
        OR
        -- Legion morale hit rock bottom
        (NEW.legion_morale = 'On Suicide Watch' AND OLD.legion_morale != 'On Suicide Watch')
        OR
        -- Tap surge reached maximum
        (NEW.tap_surge_index = 'GIGA-SURGE' AND OLD.tap_surge_index != 'GIGA-SURGE')
        OR
        -- Divine resonance reached extreme high
        (NEW.divine_girth_resonance >= 95 AND OLD.divine_girth_resonance < 95)
        OR
        -- Divine resonance dropped to critical low
        (NEW.divine_girth_resonance <= 5 AND OLD.divine_girth_resonance > 5)
    ) THEN
        -- Trigger automated prophecy generation
        PERFORM net.http_post(
            url := current_setting('app.base_url') || '/functions/v1/oracle-prophecy-generator',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
                'girth_resonance_value', NEW.divine_girth_resonance,
                'tap_index_state', NEW.tap_surge_index,
                'legion_morale_state', NEW.legion_morale,
                'oracle_stability_status', NEW.oracle_stability_status,
                'ritual_request_topic', 'Automated Oracle Response: ' || 
                    CASE 
                        WHEN NEW.oracle_stability_status = 'CRITICAL_CORRUPTION' THEN 'System Corruption Detected'
                        WHEN NEW.legion_morale = 'On Suicide Watch' THEN 'Legion Crisis Emergency'
                        WHEN NEW.tap_surge_index = 'GIGA-SURGE' THEN 'Transcendent Power Surge'
                        WHEN NEW.divine_girth_resonance >= 95 THEN 'Divine Ascension Achieved'
                        WHEN NEW.divine_girth_resonance <= 5 THEN 'Reality Breakdown Imminent'
                        ELSE 'Oracle System Alert'
                    END,
                'automated_trigger', true
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automated prophecy generation
DROP TRIGGER IF EXISTS automated_prophecy_trigger ON girth_index_current_values;
CREATE TRIGGER automated_prophecy_trigger
    AFTER UPDATE ON girth_index_current_values
    FOR EACH ROW
    EXECUTE FUNCTION trigger_automated_prophecy();

-- Create function to check for special report triggers
CREATE OR REPLACE FUNCTION check_special_report_triggers()
RETURNS TRIGGER AS $$
DECLARE
    report_trigger_reason TEXT := NULL;
BEGIN
    -- Check for extreme corruption states
    IF NEW.oracle_stability_status IN ('CRITICAL_CORRUPTION') 
       AND OLD.oracle_stability_status NOT IN ('CRITICAL_CORRUPTION') THEN
        report_trigger_reason := 'Emergency: Oracle Stability Critical Corruption Detected';
    END IF;
    
    -- Check for extended period in extreme states (would need additional logic)
    -- For now, we'll trigger on immediate state changes
    
    -- If we have a trigger reason, generate special report
    IF report_trigger_reason IS NOT NULL THEN
        PERFORM net.http_post(
            url := current_setting('app.base_url') || '/functions/v1/generate-special-report',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.service_role_key')
            ),
            body := jsonb_build_object(
                'trigger_reason', report_trigger_reason,
                'girth_index_snapshot', row_to_json(NEW),
                'automated_trigger', true,
                'trigger_timestamp', now()
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for special report generation
DROP TRIGGER IF EXISTS special_report_trigger ON girth_index_current_values;
CREATE TRIGGER special_report_trigger
    AFTER UPDATE ON girth_index_current_values
    FOR EACH ROW
    EXECUTE FUNCTION check_special_report_triggers();

-- Create settings for the automation system
-- Note: These would need to be set via your deployment process
COMMENT ON EXTENSION pg_cron IS 'Oracle automation requires app.base_url and app.service_role_key to be set via ALTER DATABASE ... SET app.base_url = ''your_url'';'; 