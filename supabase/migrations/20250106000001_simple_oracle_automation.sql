-- Oracle Automation Setup Migration (Simplified)
-- Sets up automated triggers for prophecy generation

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
        (NEW.legion_morale = 'SUICIDE_WATCH' AND OLD.legion_morale != 'SUICIDE_WATCH')
        OR
        -- Tap surge reached maximum
        (NEW.tap_surge_index = 'GIGA_SURGE' AND OLD.tap_surge_index != 'GIGA_SURGE')
        OR
        -- Divine resonance reached extreme high
        (NEW.divine_girth_resonance >= 95 AND OLD.divine_girth_resonance < 95)
        OR
        -- Divine resonance dropped to critical low
        (NEW.divine_girth_resonance <= 5 AND OLD.divine_girth_resonance > 5)
    ) THEN
        -- Log the trigger event for debugging
        INSERT INTO public.automation_log (automation_type, trigger_source, calculation_details)
        VALUES (
            'automated_prophecy_trigger',
            CASE 
                WHEN NEW.oracle_stability_status = 'CRITICAL_CORRUPTION' THEN 'System Corruption Detected'
                WHEN NEW.legion_morale = 'SUICIDE_WATCH' THEN 'Legion Crisis Emergency'
                WHEN NEW.tap_surge_index = 'GIGA_SURGE' THEN 'Transcendent Power Surge'
                WHEN NEW.divine_girth_resonance >= 95 THEN 'Divine Ascension Achieved'
                WHEN NEW.divine_girth_resonance <= 5 THEN 'Reality Breakdown Imminent'
                ELSE 'Oracle System Alert'
            END,
            jsonb_build_object(
                'girth_index_snapshot', row_to_json(NEW),
                'trigger_timestamp', now()
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
    
    -- If we have a trigger reason, log it
    IF report_trigger_reason IS NOT NULL THEN
        INSERT INTO public.automation_log (automation_type, trigger_source, calculation_details)
        VALUES (
            'special_report_trigger',
            report_trigger_reason,
            jsonb_build_object(
                'girth_index_snapshot', row_to_json(NEW),
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