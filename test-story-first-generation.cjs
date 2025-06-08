#!/usr/bin/env node

// Test script for CHODE Oracle Story-First Generation

console.log('🔮 === STORY-FIRST GENERATION TEST ===');
console.log('');

console.log('✅ CHANGES IMPLEMENTED:');
console.log('');

console.log('🔧 **LoRAs Disabled:**');
console.log('   - All LoRA weights set to empty arrays []');
console.log('   - ENABLE_LORAS = false flag added');
console.log('   - Should fix GPU memory issues');
console.log('');

console.log('🖼️ **Reference Images Reduced:**');
console.log('   - ENABLE_REFERENCE_IMAGES = false (for testing)');
console.log('   - Denoising strength reduced: 0.3-0.5 (was 0.4-0.8)');
console.log('   - Reference images now provide light hints, not dominance');
console.log('');

console.log('📖 **Story-First Prompts:**');
console.log('   - MAIN SCENE: [visual_prompt] comes first');
console.log('   - STORY CONTEXT: [extracted_content] comes second');  
console.log('   - Style elements come after story content');
console.log('   - CFG Scale reduced to 7.0 (less strict prompt adherence)');
console.log('');

console.log('🚫 **Anti-Copying Measures:**');
console.log('   - Added negative prompts: duplicate, copy, identical, repetitive');
console.log('   - Reduced corruption style influence');
console.log('   - Only 1 effect per corruption level (was 2)');
console.log('');

console.log('🎯 **Expected Results:**');
console.log('   ✨ More diverse images based on story content');
console.log('   ✨ Less similarity to reference library images');  
console.log('   ✨ Better interpretation of lore/story themes');
console.log('   ✨ Reduced GPU memory usage');
console.log('   ✨ No more "near-identical" generations');
console.log('');

console.log('🧪 **TEST WORKFLOW:**');
console.log('   1. Restart local-sd-worker.cjs');
console.log('   2. Generate 4+ images with same corruption level');
console.log('   3. Check for story diversity vs visual similarity');
console.log('   4. Monitor SD terminal for memory usage');
console.log('   5. If satisfied, test other corruption levels');
console.log('');

console.log('⚙️ **TO RE-ENABLE FEATURES LATER:**');
console.log('   - Set ENABLE_REFERENCE_IMAGES = true');
console.log('   - Uncomment loras arrays in getModelConfigForCorruption()');
console.log('   - Adjust denoising strength if needed');
console.log('');

console.log('🔮 === READY FOR TESTING ==='); 