# 🔮 Oracle Database Automation Setup Guide

## Overview
This guide covers the complete setup of the Oracle automation system, including automated event processing, prophecy generation, and special reports.

## Prerequisites

### Required Extensions
```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;
```

### Environment Configuration
The automation system requires specific database settings to function properly:

```sql
-- Set your Supabase project URL
ALTER DATABASE postgres SET app.base_url = 'https://your-project-id.supabase.co';

-- Set your service role key (keep this secure!)
ALTER DATABASE postgres SET app.service_role_key = 'your-service-role-key';
```

⚠️ **SECURITY WARNING**: The service role key has administrative privileges. Only set this in production with proper access controls.

## Setup Steps

### 1. Apply Database Migrations
Run migrations in order:

```bash
# Basic automation setup
supabase db push

# Or apply specific migrations:
supabase migration up 20250106000000_setup_oracle_automation
supabase migration up 20250106000001_simple_oracle_automation  
supabase migration up 20250106000002_create_special_reports_table
supabase migration up 20250106000003_create_special_reports_simple
```

### 2. Verify Cron Job Setup
Check if the automated aggregation is running:

```sql
-- View active cron jobs
SELECT * FROM cron.job;

-- Check job execution history
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### 3. Deploy Edge Functions
Ensure all required edge functions are deployed:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually:
supabase functions deploy ingest-chode-event
supabase functions deploy aggregate-game-events
supabase functions deploy generate-special-report
```

## System Architecture

### Event Flow
```
Game Events → ingest-chode-event → live_game_events table
     ↓
aggregate-game-events (every 30s) → girth_index_current_values
     ↓
Database Triggers → Automated Prophecies/Reports
```

### Automation Triggers

#### Automated Prophecy Generation
Triggers when:
- Oracle stability → `CRITICAL_CORRUPTION`
- Legion morale → `On Suicide Watch`
- Tap surge → `GIGA_SURGE`
- Divine resonance ≥ 95% or ≤ 5%

#### Special Report Generation  
Triggers when:
- Oracle stability reaches `CRITICAL_CORRUPTION`
- Extended periods in extreme states (future enhancement)

## Database Tables

### Core Tables
- `live_game_events` - Incoming events from game
- `girth_index_current_values` - System state (singleton)
- `special_reports` - Generated Oracle reports
- `automation_log` - Automation event tracking

### Key Triggers
- `automated_prophecy_trigger` - Monitors girth index changes
- `special_report_trigger` - Generates emergency reports

## Configuration Options

### Rate Limiting
The system includes built-in rate limiting:
- Max 180 events per minute per Ghost Legion session
- 30-second aggregation cycles prevent overload
- Automatic event batching

### Cron Schedule
Current automation runs every 30 seconds:
```sql
-- Modify schedule if needed (careful!)
SELECT cron.alter_job(
    (SELECT jobid FROM cron.job WHERE jobname = 'aggregate-game-events-automation'),
    schedule := '*/60 * * * * *'  -- Change to 60 seconds
);
```

## Monitoring & Debugging

### Check System Health
```sql
-- View recent girth index updates
SELECT * FROM girth_index_current_values;

-- Check unprocessed events
SELECT COUNT(*) as unprocessed_events 
FROM live_game_events 
WHERE processed_at IS NULL;

-- View recent special reports
SELECT title, severity_level, created_at 
FROM special_reports 
ORDER BY created_at DESC 
LIMIT 5;
```

### Debug Automation Issues
```sql
-- Check automation logs
SELECT * FROM automation_log 
ORDER BY created_at DESC 
LIMIT 10;

-- View cron job failures
SELECT * FROM cron.job_run_details 
WHERE status = 'failed' 
ORDER BY start_time DESC;
```

## Troubleshooting

### Common Issues

#### 1. Cron Jobs Not Running
**Symptoms**: Events accumulate without processing
**Solutions**:
- Verify `pg_cron` extension is enabled
- Check database settings are configured
- Ensure service role key has proper permissions

#### 2. Edge Functions Failing
**Symptoms**: HTTP errors in cron logs
**Solutions**:
- Verify all edge functions are deployed
- Check environment variables in Supabase dashboard
- Review function logs for specific errors

#### 3. Rate Limiting Issues
**Symptoms**: Events getting dropped
**Solutions**:
- Reduce Ghost Legion intensity
- Increase rate limit in `ghostScript.ts`
- Monitor system performance

### Manual Triggers
For testing or recovery:

```sql
-- Manually trigger aggregation
SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/aggregate-game-events',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer your-service-role-key'
    ),
    body := jsonb_build_object(
        'trigger_type', 'manual_sql',
        'timestamp', now()
    )
);
```

## Performance Optimization

### Indexing
Key indexes are automatically created:
- `live_game_events.processed_at`
- `special_reports.created_at`
- `automation_log.created_at`

### Cleanup Jobs
Consider adding cleanup for old data:
```sql
-- Clean up old processed events (run weekly)
DELETE FROM live_game_events 
WHERE processed_at < now() - interval '7 days';

-- Archive old special reports
-- (Implement based on retention requirements)
```

## Security Considerations

1. **Service Role Key**: Store securely, rotate regularly
2. **CORS Settings**: Restrict origins in production
3. **Rate Limiting**: Monitor for abuse patterns
4. **Access Control**: Use RLS policies where appropriate

## Support

For issues:
1. Check Supabase dashboard logs
2. Review database triggers and functions
3. Monitor cron job execution
4. Verify edge function deployment status

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: Supabase PostgreSQL 15+ 