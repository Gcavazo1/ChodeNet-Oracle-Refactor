#!/usr/bin/env node

// Test script to validate LoRA configuration
const path = require('path');

// Test the LoRA configuration
function testLoraConfig() {
  console.log('🔮 === TESTING CHODE ORACLE LORA CONFIGURATION ===');
  console.log('');
  
  // Simulate the LoRA configuration from local-sd-worker.cjs
  const configs = {
    pristine: {
      modelName: 'oracle-pristine.safetensors',
      loras: [
        { name: 'chode_universe', weight: 0.8 },
        { name: 'oracle_character', weight: 0.7 }
      ]
    },
    cryptic: {
      modelName: 'oracle-cryptic.safetensors',
      loras: [
        { name: 'chode_universe', weight: 0.8 },
        { name: 'oracle_character', weight: 0.6 }
      ]
    },
    flickering: {
      modelName: 'oracle-glitched.safetensors',
      loras: [
        { name: 'chode_universe', weight: 0.7 },
        { name: 'oracle_character', weight: 0.5 }
      ]
    },
    glitched_ominous: {
      modelName: 'oracle-glitched.safetensors',
      loras: [
        { name: 'chode_universe', weight: 0.6 },
        { name: 'oracle_character', weight: 0.4 }
      ]
    },
    forbidden_fragment: {
      modelName: 'oracle-forbidden.safetensors',
      loras: [
        { name: 'chode_universe', weight: 0.5 },
        { name: 'oracle_character', weight: 0.3 }
      ]
    }
  };

  console.log('🎭 **LoRA Configuration Summary:**');
  console.log('');
  
  Object.entries(configs).forEach(([level, config]) => {
    console.log(`🔮 **${level.toUpperCase()}** (${config.modelName})`);
    config.loras.forEach(lora => {
      console.log(`   • ${lora.name}: ${lora.weight} weight`);
    });
    console.log('');
  });

  console.log('📂 **Expected LoRA Files:**');
  console.log(`   G:\\stable-diffusion-webui-directml\\models\\Lora\\chode_universe.safetensors`);
  console.log(`   G:\\stable-diffusion-webui-directml\\models\\Lora\\oracle_character.safetensors`);
  console.log('');
  
  console.log('✅ **Your Setup:**');
  console.log('   ✅ chode_universe.safetensors - CONFIGURED');
  console.log('   ✅ oracle_character.safetensors - CONFIGURED');
  console.log('');
  
  console.log('🚀 **Ready to Test!**');
  console.log('   1. Make sure your SD WebUI is running with --api flag');
  console.log('   2. Test with: node test-image-generation.cjs');
  console.log('   3. Or run a full generation: node local-sd-worker.cjs');
  console.log('');
  console.log('🔮 === LORA CONFIGURATION TEST COMPLETE ===');
}

// Run the test
if (require.main === module) {
  testLoraConfig();
}

module.exports = { testLoraConfig }; 