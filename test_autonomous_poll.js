/**
 * Test Autonomous Poll Generation
 * 
 * This script tests the AI Governance Control System by creating a low-severity
 * game balance decision that should be processed as fully autonomous.
 */

async function testAutonomousPoll() {
  try {
    console.log('🧪 Testing autonomous poll generation...');

    // Set hardcoded values for testing if environment variables are not set
    const supabaseUrl = process.env.SUPABASE_URL || "https://errgidlsmozmfnsoyxvw.supabase.co";
    // Use anonymous key for edge functions (service role key was outdated)
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmdpZGxzbW96bWZuc295eHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzQ3NTUsImV4cCI6MjA2MzgxMDc1NX0.LiY5hRqmswfyWPa0_m03FjnfVXWPvyD-2PCQlR97sLE";
    const appUrl = process.env.APP_URL || "https://chode-net-oracle.vercel.app";

    console.log(`Using Supabase URL: ${supabaseUrl}`);
    
    // Call the test-ai-governance function with low_severity_game_balance scenario
    console.log('Calling test-ai-governance edge function...');
    const response = await fetch(`${supabaseUrl}/functions/v1/test-ai-governance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario: 'low_severity_game_balance',
        count: 1
      })
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Test completed successfully!');
    console.log(JSON.stringify(result, null, 2));

    // Check if the poll was created successfully
    if (result.success && result.test_results[0]?.prophet_result?.status?.includes('created_full_autonomous')) {
      console.log('🎉 Autonomous poll created successfully!');
      
      // Get the poll ID if available
      const pollId = result.test_results[0]?.prophet_result?.pollId;
      if (pollId) {
        console.log(`📊 Poll ID: ${pollId}`);
        console.log(`🔗 View poll at: ${appUrl}/oracle/polls/${pollId}`);
      }
    } else {
      console.log('⚠️ Poll creation may have failed or required admin approval.');
      console.log('Check the test results for more details.');
    }

  } catch (error) {
    console.error('❌ Error testing autonomous poll generation:', error);
  }
}

// Run the test
testAutonomousPoll();

/**
 * How to use this script:
 * 
 * 1. Set the following environment variables:
 *    - SUPABASE_URL: Your Supabase project URL
 *    - SUPABASE_SERVICE_KEY: Your Supabase service role key (for admin access)
 *    - APP_URL: Your application URL (optional, for poll link)
 * 
 * 2. Run the script with Node.js:
 *    node test_autonomous_poll.js
 * 
 * This script will:
 * - Call the test-ai-governance function with a low-severity game balance scenario
 * - The function will create a test AI decision with severity level 3
 * - The AI Prophet Agent will process this decision
 * - Since it's low severity, it should create a poll autonomously
 * - The script will output the test results and poll ID if successful
 */ 