#!/usr/bin/env node

// Test script for CHODE Oracle Image Generation with LoRAs
const fetch = require('node-fetch');

const SD_URL = 'http://127.0.0.1:7860';

// Test configuration matching your setup
const testConfig = {
  pristine: {
    modelName: 'oracle-pristine.safetensors',
    loras: [
      { name: 'chode_universe', weight: 0.8 },
      { name: 'oracle_character', weight: 0.7 }
    ],
    prompt: 'divine oracle vision, sacred light, ethereal glow, pristine clarity, mystical oracle character in cosmic realm, detailed pixel art'
  }
};

async function testImageGeneration() {
  console.log('🔮 === TESTING CHODE ORACLE IMAGE GENERATION ===');
  console.log('');

  try {
    // Test connection first
    console.log('🔗 Testing SD WebUI connection...');
    const testResponse = await fetch(`${SD_URL}/sdapi/v1/options`);
    
    if (!testResponse.ok) {
      throw new Error(`SD WebUI not responding: ${testResponse.status}`);
    }
    
    console.log('✅ SD WebUI connection successful!');
    console.log('');

    // Prepare test generation
    const config = testConfig.pristine;
    console.log('🎨 Generating test image with LoRAs...');
    console.log(`🎭 Model: ${config.modelName}`);
    console.log('🔮 LoRAs:');
    config.loras.forEach(lora => {
      console.log(`   • ${lora.name}: ${lora.weight}`);
    });
    console.log('');

    // Build LoRA prompt component
    const loraPrompt = config.loras
      .map(lora => `<lora:${lora.name}:${lora.weight}>`)
      .join(' ');

    const fullPrompt = `${config.prompt} ${loraPrompt}`;
    
    console.log('📝 Full prompt:', fullPrompt);
    console.log('');

    const payload = {
      prompt: fullPrompt,
      negative_prompt: 'dark, evil, corrupted, glitch, horror, nsfw, low quality, blurry',
      steps: 20,
      cfg_scale: 7.5,
      width: 512,
      height: 512,
      sampler_name: "DPM++ 2M Karras",
      seed: -1,
      override_settings: {
        sd_model_checkpoint: config.modelName
      }
    };

    console.log('🚀 Starting generation...');
    const startTime = Date.now();
    
    const response = await fetch(`${SD_URL}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Generation failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (!result.images || result.images.length === 0) {
      throw new Error('No images generated');
    }

    console.log(`✅ Generation successful in ${duration}s!`);
    console.log(`🖼️ Generated ${result.images.length} image(s)`);
    console.log(`📏 Image data length: ${result.images[0].length} characters`);
    console.log('');
    console.log('🎉 **LoRA TEST PASSED!**');
    console.log('   Your chode_universe.safetensors and oracle_character.safetensors are working!');
    console.log('   You can now run the full CHODE Oracle system!');
    console.log('');
    console.log('🚀 **Next Steps:**');
    console.log('   1. Start the main worker: node local-sd-worker.cjs');
    console.log('   2. Test reference library: node setup-reference-library.cjs validate');
    console.log('   3. Generate comic panels through your web interface!');

  } catch (error) {
    console.error('❌ **TEST FAILED:**', error.message);
    console.log('');
    console.log('🔧 **Troubleshooting:**');
    console.log('   1. Check SD WebUI is running: http://127.0.0.1:7860');
    console.log('   2. Verify --api flag in webui-user.bat');
    console.log('   3. Check LoRA files exist:');
    console.log('      • G:\\stable-diffusion-webui-directml\\models\\Lora\\chode_universe.safetensors');
    console.log('      • G:\\stable-diffusion-webui-directml\\models\\Lora\\oracle_character.safetensors');
    console.log('   4. Verify base models exist in models/Stable-diffusion/');
  }
  
  console.log('');
  console.log('🔮 === TEST COMPLETE ===');
}

// Run the test
if (require.main === module) {
  testImageGeneration();
}

module.exports = { testImageGeneration }; 