CREATE OR REPLACE FUNCTION public.execute_lore_generation_cron()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    _base_url TEXT;
    _service_role_key TEXT;
    _http_status INTEGER;
    _response_body TEXT;
    _error_message TEXT;
    _sql_state TEXT;
BEGIN
    -- Fetch config values once
    SELECT base_url, service_role_key INTO _base_url, _service_role_key
    FROM get_oracle_config() LIMIT 1;

    -- Execute the HTTP POST call and collect the response
    SELECT (resp).status_code, (resp).body::text INTO _http_status, _response_body
    FROM net.http_post_collect(
        url      := _base_url || '/functions/v1/generate-lore-cycle',
        headers  := jsonb_build_object(
                        'Content-Type','application/json',
                        'Authorization','Bearer ' || _service_role_key,
                        'apikey', _service_role_key
                    ),
        body     := jsonb_build_object(
                        'trigger_type','cron_job',
                        'timestamp',   now()
                    ),
        timeout_milliseconds := 30000
    ) AS resp;

    -- Insert into automation_log
    INSERT INTO public.automation_log
        (event_type, trigger_reason, calculation_details, created_at, success)
    VALUES
        ('lore_generation',
         'cron_job_execution',
         jsonb_build_object(
           'http_status', _http_status,
           'http_response_body', _response_body,
           'timestamp', now()
         ),
         now(),
         TRUE
        );

EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS _error_message = MESSAGE_TEXT, _sql_state = RETURNED_SQLSTATE;
        -- Log any errors that occur during function execution
        INSERT INTO public.automation_log
            (event_type, trigger_reason, calculation_details, created_at, success)
        VALUES
            ('lore_generation',
             'cron_job_execution_error',
             jsonb_build_object(
               'error_message', _error_message,
               'sql_state', _sql_state,
               'timestamp', now()
             ),
             now(),
             FALSE
            );
        -- Optionally, re-raise the exception if you want cron job to show as failed
        -- RAISE;
END;
$$; 