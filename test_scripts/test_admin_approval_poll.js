/**
 * Test Admin Approval Poll Generation
 * 
 * This script tests the AI Governance Control System by creating a high-severity
 * economic policy decision that should require admin approval.
 */

async function testAdminApprovalPoll() {
  try {
    console.log('🧪 Testing admin approval poll generation...');

    // Set hardcoded values for testing if environment variables are not set
    const supabaseUrl = process.env.SUPABASE_URL || "https://errgidlsmozmfnsoyxvw.supabase.co";
    // Use anonymous key for edge functions (service role key was outdated)
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmdpZGxzbW96bWZuc295eHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzQ3NTUsImV4cCI6MjA2MzgxMDc1NX0.LiY5hRqmswfyWPa0_m03FjnfVXWPvyD-2PCQlR97sLE";
    const appUrl = process.env.APP_URL || "https://chode-net-oracle.vercel.app";

    console.log(`Using Supabase URL: ${supabaseUrl}`);
    
    // Call the test-ai-governance function with high_severity_economic scenario
    console.log('Calling test-ai-governance edge function...');
    const response = await fetch(`${supabaseUrl}/functions/v1/test-ai-governance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario: 'high_severity_economic',
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

    // Check if the poll draft was created successfully
    if (result.success && result.test_results[0]?.prophet_result?.status?.includes('draft_pending_approval')) {
      console.log('🎉 Admin approval poll draft created successfully!');
      
      // Get the draft ID if available
      const draftId = result.test_results[0]?.prophet_result?.draftId;
      if (draftId) {
        console.log(`📝 Draft ID: ${draftId}`);
        console.log(`🔗 View in admin dashboard at: ${appUrl}/admin`);
      }
    } else {
      console.log('⚠️ Poll draft creation may have failed or had unexpected autonomy level.');
      console.log('Check the test results for more details.');
    }

  } catch (error) {
    console.error('❌ Error testing admin approval poll generation:', error);
  }
}

// Run the test
testAdminApprovalPoll();

/**
 * How to use this script:
 * 
 * 1. Set the following environment variables:
 *    - SUPABASE_URL: Your Supabase project URL
 *    - SUPABASE_SERVICE_KEY: Your Supabase service role key (for admin access)
 *    - APP_URL: Your application URL (optional, for admin dashboard link)
 * 
 * 2. Run the script with Node.js:
 *    node test_admin_approval_poll.js
 * 
 * This script will:
 * - Call the test-ai-governance function with a high-severity economic policy scenario
 * - The function will create a test AI decision with severity level 9
 * - The AI Prophet Agent will process this decision
 * - Since it's high severity, it should create a poll draft requiring admin approval
 * - The script will output the test results and draft ID if successful
 */ 