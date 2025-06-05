#!/usr/bin/env node

/**
 * 🔮 CHODE-NET ORACLE Automation System Test Suite
 * Comprehensive testing for the Oracle automation pipeline
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Test event templates
const TEST_EVENTS = {
  tap_burst: {
    session_id: 'test_session_' + Date.now(),
    event_type: 'tap_activity_burst',
    event_payload: { tap_count: 50, intensity: 'high' },
    game_event_timestamp: new Date().toISOString()
  },
  mega_slap: {
    session_id: 'test_session_' + Date.now(),
    event_type: 'mega_slap_landed',
    event_payload: { slap_power_girth: 500, combo_multiplier: 3 },
    game_event_timestamp: new Date().toISOString()
  },
  evolution: {
    session_id: 'test_session_' + Date.now(),
    event_type: 'chode_evolution',
    event_payload: { new_tier: 3, new_tier_name: 'Giga Chode' },
    game_event_timestamp: new Date().toISOString()
  }
};

class AutomationTester {
  constructor() {
    this.testResults = [];
    this.testStartTime = Date.now();
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Running test: ${name}`);
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      this.testResults.push({ name, status: 'PASSED', duration });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${name} - FAILED (${duration}ms):`, error.message);
      this.testResults.push({ name, status: 'FAILED', duration, error: error.message });
    }
  }

  async testDatabaseConnection() {
    const { data, error } = await supabase
      .from('live_game_events')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw new Error(`Database connection failed: ${error.message}`);
    console.log('📊 Database connection established');
  }

  async testEventIngestion() {
    const testEvent = { ...TEST_EVENTS.tap_burst };
    
    const { data, error } = await supabase.functions.invoke('ingest-chode-event', {
      body: testEvent
    });

    if (error) throw new Error(`Event ingestion failed: ${error.message}`);
    console.log('📥 Event ingested successfully:', data);
    
    // Wait a moment and verify the event exists
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: events, error: fetchError } = await supabaseAdmin
      .from('live_game_events')
      .select('*')
      .eq('session_id', testEvent.session_id);
    
    if (fetchError) throw new Error(`Failed to verify event: ${fetchError.message}`);
    if (!events || events.length === 0) throw new Error('Event not found in database');
    
    console.log('✓ Event verified in database');
  }

  async testEventAggregation() {
    // First, inject multiple test events
    const events = Object.values(TEST_EVENTS);
    
    for (const event of events) {
      await supabase.functions.invoke('ingest-chode-event', { body: event });
    }
    
    console.log('📤 Injected test events, triggering aggregation...');
    
    // Trigger manual aggregation
    const { data, error } = await supabase.functions.invoke('aggregate-game-events', {
      body: { trigger_type: 'test_automation', timestamp: new Date().toISOString() }
    });

    if (error) throw new Error(`Aggregation failed: ${error.message}`);
    console.log('⚙️ Aggregation completed:', data);
    
    // Check girth index was updated
    const { data: girthIndex, error: girthError } = await supabaseAdmin
      .from('girth_index_current_values')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (girthError) throw new Error(`Failed to fetch girth index: ${girthError.message}`);
    console.log('📈 Girth index current state:', {
      resonance: girthIndex.divine_girth_resonance,
      tapSurge: girthIndex.tap_surge_index,
      morale: girthIndex.legion_morale,
      stability: girthIndex.oracle_stability_status
    });
  }

  async testRateLimiting() {
    console.log('🚦 Testing rate limiting...');
    
    // Generate events rapidly to test rate limiting
    const rapidEvents = [];
    for (let i = 0; i < 10; i++) {
      rapidEvents.push({
        ...TEST_EVENTS.tap_burst,
        session_id: `rate_test_${i}_${Date.now()}`
      });
    }

    const promises = rapidEvents.map(event => 
      supabase.functions.invoke('ingest-chode-event', { body: event })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`📊 Rate limiting test: ${successful} successful, ${failed} failed`);
    
    if (successful === 0) throw new Error('All requests failed - possible rate limiting issue');
  }

  async testSpecialReportGeneration() {
    console.log('📋 Testing special report generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-special-report', {
      body: {
        trigger_reason: 'Automation Test Suite Execution',
        automated_trigger: false,
        force_regenerate: true
      }
    });

    if (error) throw new Error(`Special report generation failed: ${error.message}`);
    console.log('📄 Special report generated:', data);
  }

  async testDatabaseTriggers() {
    console.log('⚡ Testing database triggers...');
    
    // Get current girth index
    const { data: currentState } = await supabaseAdmin
      .from('girth_index_current_values')
      .select('*')
      .eq('id', 1)
      .single();

    // Update to trigger automation
    const { error } = await supabaseAdmin
      .from('girth_index_current_values')
      .update({
        oracle_stability_status: 'CRITICAL_CORRUPTION',
        last_updated: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) throw new Error(`Failed to update girth index: ${error.message}`);
    
    // Wait for triggers to process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check automation logs
    const { data: logs } = await supabaseAdmin
      .from('automation_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📋 Recent automation logs:', logs?.length || 0);
    
    // Restore original state
    await supabaseAdmin
      .from('girth_index_current_values')
      .update({
        oracle_stability_status: currentState.oracle_stability_status,
        last_updated: new Date().toISOString()
      })
      .eq('id', 1);
  }

  async testSystemHealth() {
    console.log('🏥 Testing system health...');
    
    // Check for unprocessed events
    const { count: unprocessedCount } = await supabaseAdmin
      .from('live_game_events')
      .select('*', { count: 'exact', head: true })
      .is('processed_at', null);

    // Check recent special reports
    const { data: recentReports } = await supabaseAdmin
      .from('special_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📊 System Health Status:');
    console.log(`  - Unprocessed events: ${unprocessedCount || 0}`);
    console.log(`  - Recent reports: ${recentReports?.length || 0}`);
    
    if ((unprocessedCount || 0) > 100) {
      throw new Error('Too many unprocessed events - aggregation may be failing');
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔮 AUTOMATION SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const totalDuration = Date.now() - this.testStartTime;
    
    console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
    console.log(`⏱️  Total time: ${totalDuration}ms\n`);
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`   └─ ${result.error}`);
      }
    });
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! System is ready for hackathon judging.');
    } else {
      console.log('\n⚠️  Some tests failed. Check configuration and try again.');
    }
  }
}

// Main test runner
async function main() {
  console.log('🔮 CHODE-NET ORACLE Automation Test Suite');
  console.log('Testing the complete Oracle automation pipeline...\n');
  
  const tester = new AutomationTester();
  
  await tester.runTest('Database Connection', () => tester.testDatabaseConnection());
  await tester.runTest('Event Ingestion', () => tester.testEventIngestion());
  await tester.runTest('Event Aggregation', () => tester.testEventAggregation());
  await tester.runTest('Rate Limiting', () => tester.testRateLimiting());
  await tester.runTest('Special Report Generation', () => tester.testSpecialReportGeneration());
  await tester.runTest('Database Triggers', () => tester.testDatabaseTriggers());
  await tester.runTest('System Health', () => tester.testSystemHealth());
  
  tester.printResults();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AutomationTester }; 