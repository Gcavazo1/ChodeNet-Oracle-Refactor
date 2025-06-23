/**
 * Test Edge Function Authentication
 * 
 * This script tests different authentication methods with our edge functions
 * to identify and fix the JWT validation issues.
 */

async function testEdgeFunctionAuth() {
  try {
    console.log('🔐 Testing edge function authentication...');

    const supabaseUrl = "https://errgidlsmozmfnsoyxvw.supabase.co";
    const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmdpZGxzbW96bWZuc295eHZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNzUzNjE1NiwiZXhwIjoyMDIzMTEyMTU2fQ.wCzBpOiQAKU0jXJRbZKjK0TJYxnrlwgmm_bqKgQVPrE";
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmdpZGxzbW96bWZuc295eHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzQ3NTUsImV4cCI6MjA2MzgxMDc1NX0.LiY5hRqmswfyWPa0_m03FjnfVXWPvyD-2PCQlR97sLE";

    // Test 1: Service role key
    console.log('\n📋 Test 1: Using service role key...');
    try {
      const response1 = await fetch(`${supabaseUrl}/functions/v1/test-ai-governance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceKey
        },
        body: JSON.stringify({
          scenario: 'low_severity_game_balance',
          count: 1
        })
      });
      
      console.log(`Status: ${response1.status}`);
      if (response1.ok) {
        const result1 = await response1.json();
        console.log('✅ Service role key works!');
        console.log(JSON.stringify(result1, null, 2));
      } else {
        const error1 = await response1.text();
        console.log(`❌ Service role key failed: ${error1}`);
      }
    } catch (error) {
      console.log(`❌ Service role key error: ${error.message}`);
    }

    // Test 2: Anonymous key
    console.log('\n📋 Test 2: Using anonymous key...');
    try {
      const response2 = await fetch(`${supabaseUrl}/functions/v1/test-ai-governance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'apikey': anonKey
        },
        body: JSON.stringify({
          scenario: 'low_severity_game_balance',
          count: 1
        })
      });
      
      console.log(`Status: ${response2.status}`);
      if (response2.ok) {
        const result2 = await response2.json();
        console.log('✅ Anonymous key works!');
        console.log(JSON.stringify(result2, null, 2));
      } else {
        const error2 = await response2.text();
        console.log(`❌ Anonymous key failed: ${error2}`);
      }
    } catch (error) {
      console.log(`❌ Anonymous key error: ${error.message}`);
    }

    // Test 3: No auth header (should fail)
    console.log('\n📋 Test 3: No authentication...');
    try {
      const response3 = await fetch(`${supabaseUrl}/functions/v1/test-ai-governance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario: 'low_severity_game_balance',
          count: 1
        })
      });
      
      console.log(`Status: ${response3.status}`);
      if (response3.ok) {
        const result3 = await response3.json();
        console.log('✅ No auth works (unexpected)!');
        console.log(JSON.stringify(result3, null, 2));
      } else {
        const error3 = await response3.text();
        console.log(`❌ No auth failed (expected): ${error3}`);
      }
    } catch (error) {
      console.log(`❌ No auth error: ${error.message}`);
    }

    // Test 4: Test a simple GET request to see if the function is accessible
    console.log('\n📋 Test 4: Simple GET request...');
    try {
      const response4 = await fetch(`${supabaseUrl}/functions/v1/test-ai-governance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        }
      });
      
      console.log(`Status: ${response4.status}`);
      const result4 = await response4.text();
      console.log(`Response: ${result4}`);
    } catch (error) {
      console.log(`❌ GET request error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error testing edge function authentication:', error);
  }
}

// Run the test
testEdgeFunctionAuth(); 