/**
 * Test RPC Function Call
 * 
 * This script tests the RPC function call directly using fetch
 * to understand why the edge function is not getting the correct result.
 */

async function testRPCCall() {
  try {
    console.log('🔍 Testing RPC function call...');

    const supabaseUrl = "https://errgidlsmozmfnsoyxvw.supabase.co";
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmdpZGxzbW96bWZuc295eHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzQ3NTUsImV4cCI6MjA2MzgxMDc1NX0.LiY5hRqmswfyWPa0_m03FjnfVXWPvyD-2PCQlR97sLE";

    console.log('📋 Testing RPC call via REST API...');
    
    // Test the RPC function via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_autonomy_level_for_decision`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'apikey': anonKey
      },
      body: JSON.stringify({
        p_decision_category: 'game_balance',
        p_severity_level: 3
      })
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ RPC Success:', result);
    } else {
      const error = await response.text();
      console.error('❌ RPC Error:', error);
    }

    // Test with different parameters
    console.log('\n📋 Testing different parameters...');
    
    const testCases = [
      { category: 'game_balance', severity: 1 },
      { category: 'game_balance', severity: 3 },
      { category: 'game_balance', severity: 5 },
      { category: 'economic_policy', severity: 9 },
      { category: 'technical_upgrades', severity: 10 }
    ];

    for (const testCase of testCases) {
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_autonomy_level_for_decision`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'apikey': anonKey
        },
        body: JSON.stringify({
          p_decision_category: testCase.category,
          p_severity_level: testCase.severity
        })
      });

      if (testResponse.ok) {
        const result = await testResponse.text();
        console.log(`${testCase.category} (${testCase.severity}): ${result}`);
      } else {
        const error = await testResponse.text();
        console.log(`${testCase.category} (${testCase.severity}): ERROR - ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error testing RPC call:', error);
  }
}

// Run the test
testRPCCall(); 