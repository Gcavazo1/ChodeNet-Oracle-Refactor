// test-queue-system.cjs
// Comprehensive test script for the Oracle image generation queue system

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('🚨 Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runDiagnostics() {
  console.log('🔍 Oracle Queue System Diagnostics');
  console.log('=======================================');
  
  try {
    // 1. Check if queue table exists and get schema
    console.log('\n📋 1. Checking queue table...');
    const { data: queueData, error: queueError } = await supabase
      .from('comic_generation_queue')
      .select('*')
      .limit(5);
    
    if (queueError) {
      console.error('❌ Queue table error:', queueError.message);
      return;
    }
    
    console.log(`✅ Queue table accessible. Found ${queueData.length} jobs.`);
    
    if (queueData.length > 0) {
      console.log('📄 Recent jobs:');
      queueData.forEach((job, i) => {
        console.log(`  ${i + 1}. ID: ${job.id}`);
        console.log(`     Status: ${job.status}`);
        console.log(`     Created: ${job.created_at}`);
        console.log(`     Attempts: ${job.attempts}`);
        if (job.error_message) {
          console.log(`     Error: ${job.error_message}`);
        }
      });
    }
    
    // 2. Check lore entries table
    console.log('\n📚 2. Checking lore entries table...');
    const { data: loreData, error: loreError } = await supabase
      .from('chode_lore_entries')
      .select('id, story_title, comic_panel_url, image_generation_status')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (loreError) {
      console.error('❌ Lore entries error:', loreError.message);
      return;
    }
    
    console.log(`✅ Lore entries accessible. Found ${loreData.length} entries.`);
    
    if (loreData.length > 0) {
      console.log('📄 Recent lore entries:');
      loreData.forEach((entry, i) => {
        console.log(`  ${i + 1}. ${entry.story_title}`);
        console.log(`     Status: ${entry.image_generation_status || 'none'}`);
        console.log(`     Has Image: ${entry.comic_panel_url ? '✅' : '❌'}`);
      });
    }
    
    // 3. Check storage bucket
    console.log('\n🗂️ 3. Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Storage error:', bucketError.message);
    } else {
      const comicBucket = buckets.find(b => b.name === 'comic-panels');
      if (comicBucket) {
        console.log('✅ comic-panels bucket exists');
        console.log(`   Public: ${comicBucket.public}`);
        console.log(`   Created: ${comicBucket.created_at}`);
        
        // List files in bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('comic-panels')
          .list('', { limit: 5 });
        
        if (filesError) {
          console.log('⚠️ Could not list files:', filesError.message);
        } else {
          console.log(`📁 Files in bucket: ${files.length}`);
          files.forEach((file, i) => {
            console.log(`  ${i + 1}. ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
          });
        }
      } else {
        console.log('❌ comic-panels bucket does not exist');
        
        // Try to create it
        console.log('🔧 Attempting to create bucket...');
        const { error: createError } = await supabase.storage.createBucket('comic-panels', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (createError) {
          console.error('❌ Failed to create bucket:', createError.message);
        } else {
          console.log('✅ Bucket created successfully');
        }
      }
    }
    
    // 4. Test edge function
    console.log('\n⚡ 4. Testing edge function...');
    try {
      const testPayload = {
        lore_entry_id: 'test-' + Date.now(),
        story_text: 'Test story for diagnostic purposes.',
        visual_prompt: 'A simple test scene with an oracle and cosmic energy',
        corruption_level: 'pristine'
      };
      
      console.log('📤 Calling generate-comic-panel edge function...');
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('generate-comic-panel', {
        body: testPayload
      });
      
      if (edgeError) {
        console.error('❌ Edge function error:', edgeError.message);
      } else {
        console.log('✅ Edge function responded:', edgeData);
      }
    } catch (error) {
      console.error('❌ Edge function test failed:', error.message);
    }
    
    // 5. Summary and recommendations
    console.log('\n📊 5. System Status Summary');
    console.log('================================');
    
    const pendingJobs = queueData.filter(job => job.status === 'pending').length;
    const processingJobs = queueData.filter(job => job.status === 'processing').length;
    const failedJobs = queueData.filter(job => job.status === 'failed').length;
    const completedJobs = queueData.filter(job => job.status === 'completed').length;
    
    console.log(`📋 Queue Status:`);
    console.log(`   Pending: ${pendingJobs}`);
    console.log(`   Processing: ${processingJobs}`);
    console.log(`   Failed: ${failedJobs}`);
    console.log(`   Completed: ${completedJobs}`);
    
    if (pendingJobs > 0) {
      console.log('\n🔄 Next Steps:');
      console.log('1. Make sure the worker script is running');
      console.log('2. Check Stable Diffusion is running on port 7860');
      console.log('3. Verify the worker script has proper permissions');
    }
    
    if (processingJobs > 0) {
      console.log('\n⚠️ Warning: Jobs stuck in processing state');
      console.log('Consider resetting stuck jobs:');
      console.log('   - Check if worker crashed during processing');
      console.log('   - Reset processing jobs to pending if needed');
    }
    
    console.log('\n✅ Diagnostics complete!');
    
  } catch (error) {
    console.error('🚨 Diagnostic failed:', error);
  }
}

// Reset stuck jobs function
async function resetStuckJobs() {
  console.log('\n🔧 Resetting stuck jobs...');
  
  try {
    // Reset jobs that have been processing for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: updatedJobs, error } = await supabase
      .from('comic_generation_queue')
      .update({ 
        status: 'pending',
        started_at: null
      })
      .eq('status', 'processing')
      .lt('started_at', tenMinutesAgo)
      .select();
    
    if (error) {
      console.error('❌ Failed to reset jobs:', error.message);
    } else {
      console.log(`✅ Reset ${updatedJobs.length} stuck jobs to pending`);
    }
  } catch (error) {
    console.error('❌ Reset operation failed:', error);
  }
}

// Manual job creation for testing
async function createTestJob() {
  console.log('\n🧪 Creating test job...');
  
  try {
    const testJob = {
      lore_entry_id: 'test-manual-' + Date.now(),
      payload: {
        lore_entry_id: 'test-manual-' + Date.now(),
        story_text: 'Manual test story to verify the queue system is working properly.',
        visual_prompt: 'A cosmic oracle surrounded by swirling digital energy and mystical symbols',
        corruption_level: 'cryptic'
      },
      status: 'pending',
      attempts: 0,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('comic_generation_queue')
      .insert(testJob)
      .select();
    
    if (error) {
      console.error('❌ Failed to create test job:', error.message);
    } else {
      console.log('✅ Test job created:', data[0].id);
      console.log('   Watch the worker logs to see if it processes this job');
    }
  } catch (error) {
    console.error('❌ Test job creation failed:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--reset')) {
    await resetStuckJobs();
  } else if (args.includes('--test-job')) {
    await createTestJob();
  } else {
    await runDiagnostics();
  }
  
  if (args.includes('--help')) {
    console.log('\nUsage:');
    console.log('  node test-queue-system.cjs            - Run diagnostics');
    console.log('  node test-queue-system.cjs --reset    - Reset stuck jobs');
    console.log('  node test-queue-system.cjs --test-job - Create a test job');
  }
}

main().catch(console.error); 