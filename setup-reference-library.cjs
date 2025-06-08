// === CHODE REFERENCE LIBRARY SETUP UTILITY ===
// Helps organize and validate your reference image library
const fs = require('fs').promises;
const path = require('path');

const REFERENCE_LIBRARY_PATH = path.join(__dirname, 'chode_reference_library');

const REQUIRED_STRUCTURE = {
  characters: ['pristine', 'cryptic', 'flickering', 'glitched_ominous', 'forbidden_fragment'],
  environments: ['pristine', 'cryptic', 'flickering', 'glitched_ominous', 'forbidden_fragment']
};

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    console.log(`📁 Creating directory: ${dirPath}`);
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function scanExistingImages(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));
  } catch {
    return [];
  }
}

async function setupReferenceLibrary() {
  console.log('🏗️ Setting up CHODE Reference Library...');
  console.log(`📂 Base path: ${REFERENCE_LIBRARY_PATH}`);
  
  // Create base directory
  await ensureDirectoryExists(REFERENCE_LIBRARY_PATH);
  
  let totalImages = 0;
  
  for (const [category, corruptionLevels] of Object.entries(REQUIRED_STRUCTURE)) {
    console.log(`\n📁 Setting up ${category}/`);
    
    const categoryPath = path.join(REFERENCE_LIBRARY_PATH, category);
    await ensureDirectoryExists(categoryPath);
    
    for (const corruption of corruptionLevels) {
      const corruptionPath = path.join(categoryPath, corruption);
      await ensureDirectoryExists(corruptionPath);
      
      const existingImages = await scanExistingImages(corruptionPath);
      totalImages += existingImages.length;
      
      if (existingImages.length > 0) {
        console.log(`   🎨 ${corruption}: ${existingImages.length} images`);
        existingImages.slice(0, 3).forEach(img => {
          console.log(`      - ${img}`);
        });
        if (existingImages.length > 3) {
          console.log(`      ... and ${existingImages.length - 3} more`);
        }
      } else {
        console.log(`   📭 ${corruption}: empty (ready for your images)`);
      }
    }
  }
  
  console.log('\n📊 Library Summary:');
  console.log(`   📁 Total directories: ${Object.keys(REQUIRED_STRUCTURE).length * 5}`);
  console.log(`   🎨 Total images found: ${totalImages}`);
  
  if (totalImages === 0) {
    console.log('\n📝 Next Steps:');
    console.log('   1. Add your game art to the appropriate folders:');
    console.log('      - characters/pristine/ → Divine Oracle poses, holy characters');
    console.log('      - characters/cryptic/ → Mysterious figures, shadowy forms');
    console.log('      - environments/pristine/ → Sacred temples, divine realms');
    console.log('      - environments/cryptic/ → Dark temples, mysterious spaces');
    console.log('   2. Use PNG format for best quality');
    console.log('   3. Recommended size: 512x512 or larger');
    console.log('   4. Name files descriptively (e.g., "oracle_sitting_meditation.png")');
  } else {
    console.log('\n✅ Library ready for enhanced img2img generation!');
  }
  
  console.log('\n🚀 To use the enhanced worker:');
  console.log('   node local-sd-worker.cjs');
}

async function validateLibrary() {
  console.log('🔍 Validating CHODE Reference Library...');
  
  const issues = [];
  let totalValid = 0;
  
  for (const [category, corruptionLevels] of Object.entries(REQUIRED_STRUCTURE)) {
    for (const corruption of corruptionLevels) {
      const corruptionPath = path.join(REFERENCE_LIBRARY_PATH, category, corruption);
      
      try {
        await fs.access(corruptionPath);
        const images = await scanExistingImages(corruptionPath);
        
        if (images.length === 0) {
          issues.push(`📭 Empty: ${category}/${corruption}`);
        } else {
          totalValid += images.length;
          
          // Check for invalid file types
          const invalidFiles = [];
          for (const file of images) {
            const filePath = path.join(corruptionPath, file);
            try {
              const stats = await fs.stat(filePath);
              if (stats.size === 0) {
                invalidFiles.push(`${file} (0 bytes)`);
              }
            } catch (e) {
              invalidFiles.push(`${file} (unreadable)`);
            }
          }
          
          if (invalidFiles.length > 0) {
            issues.push(`❌ Invalid files in ${category}/${corruption}: ${invalidFiles.join(', ')}`);
          }
        }
        
      } catch {
        issues.push(`❌ Missing directory: ${category}/${corruption}`);
      }
    }
  }
  
  console.log(`\n📊 Validation Results:`);
  console.log(`   ✅ Valid images: ${totalValid}`);
  console.log(`   ⚠️ Issues found: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n🔧 Issues to fix:');
    issues.forEach(issue => console.log(`   ${issue}`));
  } else {
    console.log('\n✅ Library validation passed! Ready for img2img generation!');
  }
}

async function generateSampleStructure() {
  console.log('📋 Generating sample file structure...');
  
  const structure = [];
  
  for (const [category, corruptionLevels] of Object.entries(REQUIRED_STRUCTURE)) {
    structure.push(`📁 ${category}/`);
    
    for (const corruption of corruptionLevels) {
      structure.push(`   📁 ${corruption}/`);
      
      // Sample file suggestions
      if (category === 'characters') {
        structure.push(`      🎨 oracle_sitting_meditation.png`);
        structure.push(`      🎨 oracle_standing_power.png`);
        if (corruption === 'pristine') {
          structure.push(`      🎨 legion_member_inspired.png`);
        } else if (corruption === 'forbidden_fragment') {
          structure.push(`      🎨 oracle_corrupted_form.png`);
        }
      } else if (category === 'environments') {
        structure.push(`      🎨 temple_background.png`);
        structure.push(`      🎨 void_space_scene.png`);
        if (corruption === 'pristine') {
          structure.push(`      🎨 divine_sanctum.png`);
        } else if (corruption === 'cryptic') {
          structure.push(`      🎨 shadow_realm.png`);
        }
      }
    }
    structure.push('');
  }
  
  console.log('\n📁 Recommended Structure:');
  structure.forEach(line => console.log(line));
}

// === LoRA DETECTION UTILITY ===
const LORA_DIRECTORY = 'G:\\stable-diffusion-webui-directml\\models\\Lora';

async function scanLoraDirectory() {
  console.log('🎭 Scanning LoRA directory...');
  console.log(`📁 Looking in: ${LORA_DIRECTORY}`);
  
  try {
    const files = await fs.readdir(LORA_DIRECTORY);
    const loraFiles = files.filter(file => 
      file.endsWith('.safetensors') || file.endsWith('.ckpt') || file.endsWith('.pt')
    );
    
    if (loraFiles.length === 0) {
      console.log('📭 No LoRA files found in directory');
      return;
    }
    
    console.log(`\n🎯 Found ${loraFiles.length} LoRA files:`);
    loraFiles.forEach((file, index) => {
      const nameWithoutExt = file.replace(/\.(safetensors|ckpt|pt)$/, '');
      console.log(`   ${index + 1}. ${nameWithoutExt}`);
    });
    
    console.log('\n🔧 To use these LoRAs with the Oracle system:');
    console.log('   Option 1: Rename them to match Oracle conventions:');
    console.log('     - chode_universe (main style)');
    console.log('     - oracle_character (character features)');
    console.log('     - pristine_style, cryptic_style, etc. (corruption styles)');
    console.log('   Option 2: Tell the developer your current names for config update');
    
    return loraFiles;
  } catch (error) {
    console.error(`❌ Could not access LoRA directory: ${error.message}`);
    console.log('💡 This might be normal if:');
    console.log('   - Path is different on your system');
    console.log('   - You don\'t have LoRAs installed yet');
    console.log('   - Directory permissions are restricted');
  }
}

// === END LoRA DETECTION ===

// Command line interface
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'setup':
      await setupReferenceLibrary();
      break;
    case 'validate':
      await validateLibrary();
      break;
    case 'structure':
      await generateSampleStructure();
      break;
    case 'loras':
      await scanLoraDirectory();
      break;
    default:
      console.log('🔮 CHODE Reference Library Utility');
      console.log('');
      console.log('Commands:');
      console.log('  node setup-reference-library.cjs setup     - Create directory structure');
      console.log('  node setup-reference-library.cjs validate  - Check library integrity');
      console.log('  node setup-reference-library.cjs structure - Show recommended structure');
      console.log('  node setup-reference-library.cjs loras     - Scan for existing LoRA files');
      console.log('');
      console.log('📚 This utility helps organize your CHODE reference images for img2img generation.');
  }
}

main().catch(console.error); 