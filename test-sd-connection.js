// Test script for Stable Diffusion API connection
const fetch = require('node-fetch');

// Configuration
const SD_API_URL = 'http://127.0.0.1:7860';
const ENDPOINTS = [
  '/sdapi/v1/options',
  '/sdapi/v1/sd-models',
  '/sdapi/v1/samplers',
];

async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing endpoint: ${endpoint}`);
  try {
    const response = await fetch(`${SD_API_URL}${endpoint}`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!');
      if (endpoint === '/sdapi/v1/sd-models') {
        console.log(`🎭 Found ${data.length} models:`);
        data.forEach(model => {
          console.log(`  - ${model.model_name || model.title}`);
        });
      } else if (endpoint === '/sdapi/v1/samplers') {
        console.log(`🧪 Found ${data.length} samplers:`);
        data.slice(0, 5).forEach(sampler => {
          console.log(`  - ${sampler.name}`);
        });
        if (data.length > 5) {
          console.log(`  ... and ${data.length - 5} more`);
        }
      } else {
        console.log('📋 Sample data:', 
          JSON.stringify(
            Object.fromEntries(
              Object.entries(data).slice(0, 3)
            ), null, 2)
        );
      }
    } else {
      console.log('❌ Connection failed');
      try {
        const errorText = await response.text();
        console.log('❌ Error details:', errorText.substring(0, 500));
      } catch (e) {
        console.log('❌ Could not parse error response');
      }
    }
  } catch (error) {
    console.log('💥 Error connecting to endpoint:', error.message);
  }
}

async function testSimpleGeneration() {
  console.log('\n🎨 Testing simple image generation');
  const payload = {
    prompt: 'mystical oracle crystal, divine light, ethereal atmosphere, best quality',
    negative_prompt: 'ugly, deformed, low quality, blurry',
    steps: 20,
    width: 512,
    height: 512,
    sampler_name: 'DPM++ 2M Karras',
    cfg_scale: 7.0,
    seed: -1,
  };
  
  try {
    console.log('📤 Sending request...');
    const startTime = Date.now();
    
    const response = await fetch(`${SD_API_URL}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      const endTime = Date.now();
      const generationTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`✅ Generation successful in ${generationTime}s!`);
      console.log(`🖼️ Generated ${result.images?.length || 0} images`);
      
      if (result.images && result.images.length > 0) {
        console.log(`📏 First image size: ${Math.floor(result.images[0].length / 1024)} KB`);
      }
    } else {
      console.log('❌ Generation failed');
      try {
        const errorText = await response.text();
        console.log('❌ Error details:', errorText.substring(0, 500));
      } catch (e) {
        console.log('❌ Could not parse error response');
      }
    }
  } catch (error) {
    console.log('💥 Error during generation:', error.message);
  }
}

async function main() {
  console.log('🔮 === STABLE DIFFUSION API CONNECTION TEST ===');
  console.log(`🌐 Testing connection to: ${SD_API_URL}`);
  
  // Test each endpoint
  for (const endpoint of ENDPOINTS) {
    await testEndpoint(endpoint);
  }
  
  // Test simple generation
  await testSimpleGeneration();
  
  console.log('\n🔮 === TEST COMPLETE ===');
}

main().catch(error => {
  console.error('🔥 Fatal error:', error);
}); 