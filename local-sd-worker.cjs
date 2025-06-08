// local-sd-worker.cjs
// CommonJS version to work with "type": "module" projects
// ENHANCED WITH CHODE PROMPT GENERATOR

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs').promises; // Added for file system access
const path = require('path'); // Added for path manipulation
require('dotenv').config();

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LOCAL_SD_URL = process.env.LOCAL_SD_URL || 'http://127.0.0.1:7860';

// === TESTING CONFIGURATION ===
const ENABLE_REFERENCE_IMAGES = true; // Re-enable img2img with HIGH denoising for story-first generation with style influence
const ENABLE_LORAS = true; // Keep LoRAs enabled for CHODE universe aesthetic

// =========================
// 🎛️ DENOISING CONFIGURATION
// =========================
// IMPORTANT: Text2Image denoise should be >0.7 to avoid copying reference library images
const TEXT_TO_IMAGE_DENOISE = 0.55; // Fixed denoise for txt2img (ADJUST THIS VALUE)
const ENABLE_DYNAMIC_IMG2IMG_DENOISE = true; // Enable dynamic denoising for img2img based on story content

// Define the path to the CHODE reference image library
const CHODE_REFERENCE_LIBRARY_PATH = path.join(__dirname, 'chode_reference_library');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('🚨 Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('✅ ENHANCED Worker started with CHODE Prompt Generator. Connecting to Supabase...');
console.log('🎯 Stable Diffusion URL:', LOCAL_SD_URL);
console.log('📡 Supabase URL:', SUPABASE_URL);
console.log('⚡ Enhancement Mode: ADVANCED CHODE UNIVERSE PROMPTS');
console.log('🖼️ CHODE Reference Library Path:', CHODE_REFERENCE_LIBRARY_PATH);

// ===================================
// Utility to load and encode reference images
// ===================================

async function getRandomReferenceImageAsBase64(corruptionLevel, category = 'characters') {
  const categoryPath = path.join(CHODE_REFERENCE_LIBRARY_PATH, category, corruptionLevel);
  console.log(`🔍 Searching for reference images in: ${categoryPath}`);

  try {
    const files = await fs.readdir(categoryPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
    });

    if (imageFiles.length === 0) {
      console.warn(`⚠️ No images found for category '${category}' and corruption level '${corruptionLevel}'.`);
      return null;
    }

    const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(categoryPath, randomFile);
    console.log(`✅ Selected reference image: ${imagePath}`);

    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`❌ Error reading reference images from ${categoryPath}:`, error.message);
    return null;
  }
}

// ===================================
// CHODE PROMPT GENERATOR (CommonJS Version)
// ===================================

class CHODEPromptGenerator {
  constructor() {
    this.CHODE_VISUAL_DNA = {
      // MODIFIED: Injected more grime and specific aesthetic keywords
      base_style: "grimey pixel art, detailed dithering, 16-bit retro game graphics, pixel perfect, sharp pixels, vibrant neon on dark background, nsfw, cyberpunkai, neon",
      // MODIFIED: More specific and degen tags
      mandatory_tags: ["chode tapper universe", "cyberpunk dumpster fire aesthetic", "girth-powered", "digital mysticism", "meme-fueled", "post-ironic"],
      quality_tags: ["masterpiece", "best quality", "highly detailed", "crisp pixels"],
      // MODIFIED: Added common AI art artifacts to exclude
      exclusion_tags: ["blurry", "photorealistic", "3d render", "smooth", "antialiased", "deformed", "bad anatomy", "disfigured", "watermark", "text", "signature"]
    };

    this.ENTITY_KEYWORDS = {
      // ENHANCED: Much more comprehensive entity detection
      oracle: ["oracle", "mystic", "seer", "prophet", "divine", "cosmic", "sentient AI", "girth-seer", "sage", "visionary", "shaman", "priestess", "deity", "god", "gods", "goddess", "wizard", "mage", "soothsayer"],
      legion: ["legion", "army", "warriors", "followers", "devotees", "girth-worshippers", "tapping zealots", "diamond-handed cultists", "cultists", "disciples", "believers", "faithful", "congregation", "brotherhood", "sisterhood", "clan", "tribe", "collective"],
      chode: ["chode", "monolith", "veinous", "bulbous", "expansion", "girth", "evolution", "throbbing", "pulsating", "engorged", "phallus", "pillar", "tower", "obelisk", "totem", "idol", "statue", "monument"],
      // ENHANCED: More "dumpster fire" grit + mystical locations
      temple: ["temple", "cyberpunk shrine", "altar", "sacred", "grimey", "filthy", "rain-slicked alley", "neon-drenched gutter", "discarded electronics", "overgrown data-vines", "cathedral", "church", "mosque", "synagogue", "sanctuary", "shrine", "basilica", "chapel"],
      void: ["void", "darkness", "abyss", "space", "cosmos", "the great nothingness", "emptiness", "vacuum", "limbo", "netherworld", "underworld", "shadowlands", "beyond", "infinity"],
      data: ["data", "code", "matrix", "digital", "cyber", "network", "glitch", "static", "algorithm", "binary", "bytes", "database", "server", "mainframe", "terminal", "interface", "protocol"],
      // EXPANDED: More meme and crypto entities
      meme_entities: ["pepe", "wojak", "dogwifhat", "chad", "gigachad", "virgin", "coomer", "doomer", "boomer", "zoomer", "simp", "cope", "seethe", "diamond hands", "paper hands", "ape", "moon", "rocket", "pump", "dump"],
      // NEW: Power and energy entities
      power: ["power", "energy", "force", "strength", "might", "dominance", "supremacy", "authority", "control", "influence", "surge", "wave", "pulse", "flow", "current"],
      // NEW: Cosmic and eldritch entities
      cosmic: ["cosmic", "eldritch", "ancient", "primordial", "eternal", "infinite", "omnipotent", "omniscient", "transcendent", "ascended", "enlightened", "awakened"],
      // NEW: Technology entities
      tech: ["AI", "artificial intelligence", "robot", "android", "cyborg", "machine", "computer", "software", "hardware", "neural network", "blockchain", "cryptocurrency"]
    };

    this.CORRUPTION_VISUAL_DNA = {
      // MODIFIED: Each corruption level is now more distinct and filthier
      pristine: {
        palette: ["gaudy gold trim", "pure white", "blinding cyan", "holographic"],
        atmosphere: "divine clarity, sacred light, pristine energy, clean lines, lens flare",
        effects: ["holy glow",  "divine aura", "sacred geometry", "shimmering particles"],
        style_tags: ["divine oracle", "sacred temple", "neon", "holy light", "pristine energy", "ironic perfection"],
        mood_modifier: "blessed and pure, almost suspiciously so"
      },
      cryptic: {
        palette: ["deep purple", "shadow blue", "ancient gold", "faded neon green"],
        atmosphere: "mysterious shadows, ancient wisdom, occult energy, grimey back alley",
        effects: ["mystic graffiti tags","phallus", "arcane energy", "shadowy figures in hoodies", "data ghosts"],
        style_tags: ["ancient mysteries", "occult symbols", "neon", "shadow realm", "cyberpunk noir"],
        mood_modifier: "mysterious and ancient, smells like ozone and old pizza"
      },
      flickering: {
        palette: ["electric blue", "CRT green", "warning orange", "corroded copper"],
        atmosphere: "unstable digital realm, flickering data streams, tech malfunction, vhs static",
        effects: ["exposed wiring", "digital glitches","phallus", "heavy scan lines", "electric sparks"],
        style_tags: ["cyberpunk clutter", "tech malfunction", "data flicker", "neon", "grimy electronics"],
        mood_modifier: "unstable and glitching, feels like a brownout"
      },
      glitched_ominous: {
        palette: ["warning red", "error crimson", "dark magenta", "bruised purple"],
        atmosphere: "ominous system failure, corrupted data, digital nightmare, the glow of a red candle chart",
        effects: ["error cascades", "corrupted pepe meme","phallus", "screaming wojak", "data corruption"],
        style_tags: ["system failure", "digital corruption", "cyber horror", "neon", "degen despair"],
        mood_modifier: "ominous and corrupted, NGMI"
      },
      forbidden_fragment: {
        palette: ["void black", "cosmic purple", "eldritch green", "reality-tear red"],
        atmosphere: "forbidden knowledge, reality breakdown, cosmic horror, 4th wall break",
        effects: ["reality tears", "non-euclidean geometry","phallus", "sentient bug", "biblically accurate chode"],
        style_tags: ["cosmic horror", "eldritch truth", "forbidden knowledge", "neon", "meta-narrative glitch"],
        mood_modifier: "forbidden, eldritch, and worryingly self-aware"
      }
    };
  }

  // Main prompt generation method
  generateUnifiedPrompt(storyText, corruptionLevel, visualPrompt) {
    console.log('🎨 CHODE Prompt Generator: Processing story for corruption level:', corruptionLevel);
    
    // Extract content from story
    const content = this.extractContent(storyText);
    console.log('📝 Content extracted:', JSON.stringify(content, null, 2));
    
    // Get corruption-specific DNA
    const corruptionDNA = this.CORRUPTION_VISUAL_DNA[corruptionLevel] || this.CORRUPTION_VISUAL_DNA.pristine;
    
    // Build enhanced prompt
    const enhancedPrompt = this.buildEnhancedPrompt(content, corruptionDNA, visualPrompt, corruptionLevel);
    console.log('🚀 Enhanced prompt generated:', enhancedPrompt.positive);
    
    return enhancedPrompt;
  }

  extractContent(storyText) {
    const lowerText = storyText.toLowerCase();
    
    // Extract entities using enhanced keyword matching
    const characters = [];
    const locations = [];
    const items = [];
    const concepts = []; // NEW: Abstract concepts for better story influence
    
    // Check for Oracle entities
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.oracle)) {
      characters.push("mystical oracle");
    }
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.legion)) {
      characters.push("legion members");
    }
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.chode)) {
      items.push("sacred chode");
    }
    
    // Check for locations
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.temple)) {
      locations.push("sacred temple");
    }
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.void)) {
      locations.push("cosmic void");
    }
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.data)) {
      locations.push("digital realm");
    }
    
    // NEW: Check for abstract concepts that enhance story influence
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.power)) {
      concepts.push("raw power");
    }
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.cosmic)) {
      concepts.push("cosmic forces");
    }
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.tech)) {
      concepts.push("advanced technology");
    }
    if (this.containsKeywords(lowerText, this.ENTITY_KEYWORDS.meme_entities)) {
      concepts.push("meme energy");
    }

    // Enhanced mood detection with more keywords
    let mood = "mystical";
    if (lowerText.includes("dark") || lowerText.includes("shadow") || lowerText.includes("evil") || lowerText.includes("sinister")) mood = "dark";
    if (lowerText.includes("bright") || lowerText.includes("divine") || lowerText.includes("holy") || lowerText.includes("radiant")) mood = "luminous";
    if (lowerText.includes("chaos") || lowerText.includes("corrupt") || lowerText.includes("destruction") || lowerText.includes("mayhem")) mood = "chaotic";
    if (lowerText.includes("power") || lowerText.includes("strength") || lowerText.includes("dominance") || lowerText.includes("supreme")) mood = "powerful";
    if (lowerText.includes("ancient") || lowerText.includes("primordial") || lowerText.includes("eternal") || lowerText.includes("cosmic")) mood = "ancient";

    return {
      entities: { characters, locations, items, concepts }, // NEW: Added concepts
      scene_descriptors: {
        mood,
        setting: locations[0] || "oracle realm",
        time_of_day: "eternal twilight",
        atmosphere: concepts.length > 0 ? concepts.join(", ") : "mystical energy" // NEW: Atmosphere from concepts
      },
      emotional_cues: {
        tension: this.assessTension(lowerText),
        corruption_level: this.assessCorruption(lowerText),
        story_weight: this.calculateStoryWeight(characters, locations, items, concepts) // NEW: Story weight calculation
      }
    };
  }

  containsKeywords(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  assessTension(text) {
    if (text.includes("battle") || text.includes("war") || text.includes("danger")) return "high";
    if (text.includes("uncertain") || text.includes("worry") || text.includes("concern")) return "medium";
    return "low";
  }

  assessCorruption(text) {
    if (text.includes("forbidden") || text.includes("eldritch")) return "forbidden";
    if (text.includes("corrupt") || text.includes("glitch")) return "severe";
    if (text.includes("unstable") || text.includes("flicker")) return "mild";
    return "pristine";
  }

  // NEW: Calculate story weight for denoising adjustment
  calculateStoryWeight(characters, locations, items, concepts) {
    let weight = 0.5; // Base story weight
    
    // More entities = higher story weight = lower denoising needed
    const totalEntities = characters.length + locations.length + items.length + concepts.length;
    
    if (totalEntities >= 4) weight = 0.8; // High story content
    else if (totalEntities >= 2) weight = 0.65; // Medium story content
    else weight = 0.5; // Low story content
    
    console.log(`📊 Story weight calculated: ${weight} (${totalEntities} entities detected)`);
    return weight;
  }

  buildEnhancedPrompt(content, corruptionDNA, visualPrompt, corruptionLevel) {
    // STORY-FIRST APPROACH: Start with the story and visual content
    const storyElements = [];
    
    // 1. PRIORITIZE VISUAL PROMPT (main story scene)
    if (visualPrompt && visualPrompt.trim()) {
      storyElements.push(`MAIN SCENE: ${visualPrompt}`);
    }
    
    // 2. ADD STORY-DRIVEN SCENE DESCRIPTION
    const sceneDescription = this.buildSceneDescription(content);
    if (sceneDescription !== "mystical oracle scene") {
      storyElements.push(`STORY CONTEXT: ${sceneDescription}`);
    }
    
    // 3. Core CHODE universe style (reduced influence)
    const baseStyle = this.CHODE_VISUAL_DNA.base_style;
    
    // 4. Light corruption influence (reduced from original)
    const atmosphere = `style inspiration: ${corruptionDNA.atmosphere}`;
    const effects = corruptionDNA.effects.slice(0, 1).join(", "); // Only 1 effect
    const colorPalette = `color theme: ${corruptionDNA.palette.slice(0, 2).join(" and ")}`;
    
    // 5. Quality tags
    const qualityTags = this.CHODE_VISUAL_DNA.quality_tags.join(", ");
    
    // Build final positive prompt - STORY FIRST!
    const positivePrompt = [
      ...storyElements, // Story elements first
      baseStyle,
      atmosphere,
      effects,
      colorPalette,
      qualityTags
    ].filter(Boolean).join(", ");

    // Enhanced negative prompt to prevent copying
    const negativePrompt = [
      ...this.CHODE_VISUAL_DNA.exclusion_tags,
      "duplicate", "copy", "identical", "repetitive", "replication",
      "multiple panels", "text bubbles", "speech", "words", "letters", "text", "writing", "alphabet", "readable text", "typography", "font", "caption", "subtitle",
      "modern UI", "realistic", "photography", "film", "CGI",
      "low quality", "poor composition", "blurry", "artifact"
    ].join(", ");

    // Get model configuration
    const modelConfig = this.getModelConfigForCorruption(corruptionLevel);

    return {
      positive: positivePrompt,
      negative: negativePrompt,
      model_config: modelConfig,
      content: content, // NEW: Include content for denoising optimization
      generation_params: {
        width: 768,
        height: 768,
        steps: 30, // Reduced steps for faster generation
        cfg_scale: 7.0, // Reduced CFG for less strict adherence to prompt
        sampler_name: "DPM++ 2M Karras"
      }
    };
  }

  buildSceneDescription(content) {
    const elements = [];
    
    // Add characters
    if (content.entities.characters.length > 0) {
      elements.push(`featuring ${content.entities.characters.slice(0, 2).join(" and ")}`);
    }
    
    // Add location
    if (content.entities.locations.length > 0) {
      elements.push(`in a ${content.entities.locations[0]} setting`);
    }
    
    // NEW: Add concepts for stronger story influence
    if (content.entities.concepts && content.entities.concepts.length > 0) {
      elements.push(`surrounded by ${content.entities.concepts.slice(0, 2).join(" and ")}`);
    }
    
    // Add mood
    if (content.scene_descriptors.mood !== "mystical") {
      elements.push(`${content.scene_descriptors.mood} atmosphere`);
    }
    
    // NEW: Add atmosphere if available
    if (content.scene_descriptors.atmosphere && content.scene_descriptors.atmosphere !== "mystical energy") {
      elements.push(`infused with ${content.scene_descriptors.atmosphere}`);
    }
    
    return elements.join(", ") || "mystical oracle scene";
  }

  getModelConfigForCorruption(corruptionLevel) {
    // This function returns a complete style package based on the Oracle's mood.
    // NOTE: LoRAs are suggested but commented out. To use them, add the LoRA call
    // to the positive prompt and ensure the file is in your models/Lora folder.
    const configs = {
      pristine: {
        modelName: 'oracle-forbidden.safetensors', // Or a high-quality generalist model like JuggernautXL
        loras: [
          { name: 'chode_universe', weight: 0.5 },
          { name: 'cyberpunk_neon', weight: 0.7 },
          { name: 'nsfw_meme', weight: 0.7 },
          { name: 'oracle_character', weight: 0.3 }
        ],
        stylePrefix: 'hyper-detailed, cinematic lighting, divine shitposting, unsettlingly clean, corporate art installation,',
        styleSuffix: ', gleaming chrome, holographic perfection, blessed by the algorithm',
        negativePrompt: 'dark, evil, corrupted, glitch, horror, grime, filth, dirt, messy, blurry, text, watermark'
      },
      cryptic: {
        modelName: 'oracle-forbidden.safetensors', // A model fine-tuned on noir and dark themes
        loras: [
          { name: 'chode_universe', weight: 0.5 },
          { name: 'oracle_character', weight: 0.25 },
          { name: 'nsfw_meme', weight: 0.8 },
          { name: 'cyberpunk_neon', weight: 0.4 }
        ],
        stylePrefix: 'cyberpunk noir, mysterious graffiti tags, hard shadows, rain-slicked alleyways,',
        styleSuffix: ', data-ghosts whispering in the static, a single flickering neon sign reflected in a puddle',
        negativePrompt: 'bright, cheerful, clean, modern, mundane, blurry, text, watermark'
      },
      flickering: {
        modelName: 'oracle-forbidden.safetensors',
        loras: [
          { name: 'chode_universe', weight: 0.5 },
          { name: 'cyberpunk_neon', weight: 0.7 },
          { name: 'nsfw_meme', weight: 0.85 },
          { name: 'oracle_character', weight: 0.2 }
        ],
        stylePrefix: 'unstable digital broadcast, makeshift technology, exposed wiring, sparking circuits, CRT monitor glow,',
        styleSuffix: ', cyberpunk clutter, VHS static, feels like a brownout, raw degen engineering',
        negativePrompt: 'stable, clean, perfect, pristine, smooth, blurry, text, watermark'
      },
      glitched_ominous: {
        modelName: 'oracle-forbidden.safetensors', // Same model as flickering, but with a more menacing prompt
        loras: [
          { name: 'chode_universe', weight: 0.5 },
          { name: 'cyberpunk_neon', weight: 0.8 },
          { name: 'nsfw_meme', weight: 0.9 },
          { name: 'oracle_character', weight: 0.15 }
        ],
        stylePrefix: 'ominous system failure, digital decay, data rot, corrupted pepe meme, screaming wojak in the background,',
        styleSuffix: ', cyber-horror, the glow of a million red candles on a dead shitcoin chart',
        negativePrompt: 'clean, bright, happy, safe, hopeful, blessed, text, watermark'
      },
      forbidden_fragment: {
        modelName: 'oracle-forbidden.safetensors', // A model fine-tuned on cosmic horror and abstract concepts
        loras: [
          { name: 'chode_universe', weight: 0.4 },
          { name: 'cyberpunk_neon', weight: 0.9 },
          { name: 'nsfw_meme', weight: 0.95 },
          { name: 'oracle_character', weight: 0.15 }
        ],
        stylePrefix: 'forbidden oracle knowledge, 4th wall break, meta-narrative glitch, the dev\'s forgotten nightmares, sentient bug,',
        styleSuffix: ', cosmic horror comics, reality distortion, biblically accurate chode',
        negativePrompt: 'safe, normal, mundane, understandable, comforting, cute, text, watermark'
      }
    };

    // This part of the logic remains perfect.
    return configs[corruptionLevel] || configs.pristine;
  }
}

// Initialize the prompt generator
const promptGenerator = new CHODEPromptGenerator();

// ===================================
// END CHODE PROMPT GENERATOR
// ===================================

// Test connections
async function testConnections() {
  try {
    // Test Supabase connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('comic_generation_queue')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message);
      return false;
    }
    
    console.log('✅ Supabase connection verified');
    
    // Test SD connection
    const sdTest = await fetch(`${LOCAL_SD_URL}/sdapi/v1/options`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (sdTest.ok) {
      console.log('✅ Stable Diffusion connection verified');
      return true;
    } else {
      console.error('❌ Stable Diffusion connection failed:', sdTest.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Enhanced prompt generation using CHODE system
function generateCHODEPrompt(visualPrompt, storyText, corruptionLevel) {
  console.log('🎨 === CHODE PROMPT GENERATION START ===');
  console.log(`📖 Story Text: ${storyText.substring(0, 200)}...`);
  console.log(`🎯 Visual Prompt: ${visualPrompt}`);
  console.log(`🔮 Corruption Level: ${corruptionLevel}`);
  
  // Generate enhanced prompt using the CHODE system
  const unifiedPrompt = promptGenerator.generateUnifiedPrompt(storyText, corruptionLevel, visualPrompt);
  
  console.log('🚀 === ENHANCED PROMPT GENERATED ===');
  console.log(`✨ Positive: ${unifiedPrompt.positive}`);
  console.log(`❌ Negative: ${unifiedPrompt.negative}`);
  console.log(`🎭 Model: ${unifiedPrompt.model_config.modelName}`);
  console.log('🎨 === CHODE PROMPT GENERATION END ===');
  
  return unifiedPrompt;
}

// Core job processing function with enhanced CHODE prompts
async function processJob(job) {
  console.log('🎨 Processing job:', job.id);
  console.log('📋 Job payload:', JSON.stringify(job.payload, null, 2));
  console.log('🔄 Attempt:', job.attempts + 1);
  const startTime = Date.now();
  
  try {
    // Update job status to processing
    console.log('📝 Updating job status to processing...');
    const { error: updateError } = await supabaseAdmin
      .from('comic_generation_queue')
      .update({ 
        status: 'processing', 
        attempts: job.attempts + 1,
        started_at: new Date().toISOString()
      })
      .eq('id', job.id);

    if (updateError) {
      throw new Error(`Failed to update job status: ${updateError.message}`);
    }

    // Extract job data
    const { lore_entry_id, story_text, visual_prompt, corruption_level } = job.payload;
    
    console.log(`🎯 Generating for corruption level: ${corruption_level}`);
    console.log(`📝 Visual prompt: ${visual_prompt}`);
    console.log(`📚 Story text length: ${story_text?.length || 0} characters`);
    console.log(`🆔 Lore entry ID: ${lore_entry_id}`);
    
    // Generate enhanced CHODE prompt
    const unifiedPrompt = generateCHODEPrompt(visual_prompt, story_text || visual_prompt, corruption_level);
    
    // === NEW: Image-to-Image Integration ===
    let base64ReferenceImage = null;
    let sdApiEndpoint = '/sdapi/v1/txt2img'; // Default to text-to-image
    let denoisingStrength = 0.65; // Default denoising strength

    // Check if reference images are enabled
    if (!ENABLE_REFERENCE_IMAGES) {
      console.log('🚫 Reference images disabled for testing - using pure txt2img mode');
    }

    try {
      // Only attempt reference images if enabled
      if (ENABLE_REFERENCE_IMAGES) {
        // Attempt to load a random character reference image
        base64ReferenceImage = await getRandomReferenceImageAsBase64(corruption_level, 'characters');

        if (!base64ReferenceImage) {
          // If no character image, try an environment image
          console.log('Trying environment reference image...');
          base64ReferenceImage = await getRandomReferenceImageAsBase64(corruption_level, 'environments');
        }
      } else {
        console.log('⚡ Skipping reference image loading - ENABLE_REFERENCE_IMAGES is false');
      }

      // Set denoising based on generation mode
      if (base64ReferenceImage) {
        // IMG2IMG MODE: Use dynamic denoising based on story content (if enabled)
        sdApiEndpoint = '/sdapi/v1/img2img';
        
        if (ENABLE_DYNAMIC_IMG2IMG_DENOISE) {
          const storyWeight = unifiedPrompt.content?.emotional_cues?.story_weight || 0.45;
          
          // Base denoising levels per corruption for img2img
          const baseDenoising = {
            'pristine': 0.85,
            'cryptic': 0.85, 
            'flickering': 0.78,
            'glitched_ominous': 0.78,
            'forbidden_fragment': 0.90
          };
          
          const baseDenoise = baseDenoising[corruption_level] || 0.65;
          
          // Adjust based on story weight - MORE entities = LOWER denoising = STRONGER story influence
          if (storyWeight >= 0.8) {
            denoisingStrength = Math.max(0.45, baseDenoise - 0.20); // Rich story content - lowest denoising
          } else if (storyWeight >= 0.65) {
            denoisingStrength = Math.max(0.55, baseDenoise - 0.10); // Medium story content - medium denoising
          } else {
            denoisingStrength = baseDenoise; // Minimal story content - higher denoising
          }
          
          console.log(`🎛️ IMG2IMG Dynamic Denoising: ${denoisingStrength} (story weight: ${storyWeight}, base: ${baseDenoise})`);
          console.log(`📈 Story influence optimization: ${storyWeight >= 0.8 ? 'MAXIMUM' : storyWeight >= 0.65 ? 'HIGH' : 'STANDARD'}`);
        } else {
          // Static img2img denoising
          denoisingStrength = 0.80;
          console.log(`🎛️ IMG2IMG Static Denoising: ${denoisingStrength}`);
        }
        
        console.log(`🖼️ Using Image-to-Image with denoising strength: ${denoisingStrength}`);
      } else {
        // TXT2IMG MODE: Use fixed denoising to avoid reference library copies
        sdApiEndpoint = '/sdapi/v1/txt2img';
        denoisingStrength = TEXT_TO_IMAGE_DENOISE; // This is NOT actually used in txt2img, but set for logging
        console.log(`📝 Using Text-to-Image mode (no denoising applied, fixed at: ${TEXT_TO_IMAGE_DENOISE} for reference)`);
        console.warn('⚠️ No suitable reference image found. Using pure text-to-image generation.');
      }
    } catch (imgError) {
      console.error('❌ Error preparing reference image for img2img:', imgError.message);
      console.warn('⚠️ Falling back to text-to-image due to reference image error.');
      base64ReferenceImage = null; // Ensure it's null to trigger txt2img fallback
    }
    
    // Build LoRA prompt additions
    const modelConfig = unifiedPrompt.model_config;
    let loraPromptAdditions = '';
    if (modelConfig.loras && modelConfig.loras.length > 0) {
      const loraTokens = modelConfig.loras.map(lora => 
        `<lora:${lora.name}:${lora.weight}>`
      ).join(' ');
      loraPromptAdditions = ` ${loraTokens}`;
      console.log(`🎭 LoRA additions: ${loraTokens}`);
    }

    // Prepare enhanced SD payload using CHODE system
    const sdPayload = {
      prompt: unifiedPrompt.positive + loraPromptAdditions,
      negative_prompt: unifiedPrompt.negative,
      width: unifiedPrompt.generation_params.width,
      height: unifiedPrompt.generation_params.height,
      steps: unifiedPrompt.generation_params.steps,
      cfg_scale: unifiedPrompt.generation_params.cfg_scale,
      sampler_name: unifiedPrompt.generation_params.sampler_name,
      seed: -1,
      restore_faces: false,
      tiling: false,
      enable_hr: false,
      override_settings: {
        sd_model_checkpoint: modelConfig.modelName
      },
      // Add img2img specific parameters if a reference image is available
      ...(base64ReferenceImage && { 
        init_images: [base64ReferenceImage],
        denoising_strength: denoisingStrength,
        // ControlNet is highly recommended for img2img for better control,
        // but we'll add it later if needed to keep initial changes focused.
        // controlnet_units: [
        //   {
        //     input_image: base64ReferenceImage,
        //     model: "control_v11p_sd15_canny [d77e0b57]", // Example Canny model
        //     module: "canny",
        //     weight: 1.0
        //   }
        // ]
      })
    };
    
    console.log('🚀 Sending ENHANCED CHODE request to Stable Diffusion...');
    console.log(`🎭 Model: ${modelConfig.modelName}`);
    console.log(`🔮 LoRAs: ${modelConfig.loras?.length || 0} active`);
    console.log(`⚙️ Settings: ${sdPayload.steps} steps, ${sdPayload.sampler_name} sampler, CFG ${sdPayload.cfg_scale}, Denoising: ${sdPayload.denoising_strength || 'N/A'}`);
    console.log(`📐 Resolution: ${sdPayload.width}x${sdPayload.height}`);
    console.log(`🖼️ Mode: ${base64ReferenceImage ? 'img2img' : 'txt2img'}`);
    
    // Call local Stable Diffusion with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    const imageResponse = await fetch(`${LOCAL_SD_URL}${sdApiEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sdPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      throw new Error(`SD API error: ${imageResponse.status} - ${errorText}`);
    }

    const result = await imageResponse.json();
    
    if (!result.images || result.images.length === 0) {
      throw new Error('No images generated by Stable Diffusion');
    }

    console.log(`⚡ CHODE Generation completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log('✅ Received base64 image data, preparing for upload...');

    // Convert base64 to blob and upload to Supabase storage
    const base64Image = result.images[0];
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    const fileName = `comic-panel-${lore_entry_id}-${Date.now()}.png`;
    
    console.log('📤 Uploading CHODE-generated image to Supabase storage...');
    console.log('📁 File name:', fileName);
    console.log('📏 File size:', imageBuffer.length, 'bytes');
    
    // Check if comic-panels bucket exists, create if not
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'comic-panels');
    
    if (!bucketExists) {
      console.log('🗂️ Creating comic-panels storage bucket...');
      const { error: bucketError } = await supabaseAdmin.storage.createBucket('comic-panels', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (bucketError) {
        console.warn('⚠️ Bucket creation failed (may already exist):', bucketError.message);
      }
    }
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('comic-panels')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    console.log('✅ Upload successful:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('comic-panels')
      .getPublicUrl(fileName);

    console.log('🔗 Generated public URL:', publicUrl);

    console.log('💾 Updating lore entry with CHODE-generated image URL...');

    // Update lore entry with image URL
    const { error: loreUpdateError } = await supabaseAdmin
      .from('chode_lore_entries')
      .update({ 
        comic_panel_url: publicUrl,
        image_generation_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', lore_entry_id);

    if (loreUpdateError) {
      throw new Error(`Failed to update lore entry: ${loreUpdateError.message}`);
    }

    console.log('✅ Lore entry updated successfully');

    // Mark job as completed
    console.log('🏁 Marking job as completed...');
    const { error: jobCompleteError } = await supabaseAdmin
      .from('comic_generation_queue')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        result_url: publicUrl
      })
      .eq('id', job.id);

    if (jobCompleteError) {
      throw new Error(`Failed to mark job as completed: ${jobCompleteError.message}`);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`🎉 CHODE Job completed successfully in ${totalTime}s:`, job.id);
    console.log('🖼️ Final CHODE image URL:', publicUrl);
    console.log('🔄 Job will no longer be processed');

  } catch (error) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ CHODE Job failed after ${totalTime}s:`, job.id, error.message);
    console.error('📜 Full error:', error);
    
    // Update lore entry to show failure
    try {
      console.log('📝 Updating lore entry to show failure...');
      await supabaseAdmin
        .from('chode_lore_entries')
        .update({ 
          image_generation_status: 'failed'
        })
        .eq('id', job.payload.lore_entry_id);
    } catch (updateError) {
      console.error('❌ Failed to update lore entry status:', updateError);
    }
    
    // Update job with error
    try {
      console.log('📝 Marking job as failed...');
      await supabaseAdmin
        .from('comic_generation_queue')
        .update({ 
          status: 'failed',
          error_message: error.message,
          attempts: job.attempts + 1,
          failed_at: new Date().toISOString()
        })
        .eq('id', job.id);
    } catch (updateError) {
      console.error('❌ Failed to update job status:', updateError);
    }
  }
}

// Enhanced polling with better error handling
async function pollForJobs() {
  try {
    console.log('🔍 Checking for pending CHODE jobs...');
    
    // Get pending jobs
    const { data: jobs, error } = await supabaseAdmin
      .from('comic_generation_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3) // Max 3 attempts
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching jobs:', error);
      return;
    }

    if (jobs && jobs.length > 0) {
      console.log(`📥 Found ${jobs.length} CHODE job(s) to process`);
      
      for (const job of jobs) {
        await processJob(job);
      }
    } else {
      console.log('💤 No pending CHODE jobs found');
    }

    // Clean up old completed/failed jobs (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from('comic_generation_queue')
      .delete()
      .in('status', ['completed', 'failed'])
      .lt('created_at', oneDayAgo);

  } catch (error) {
    console.error('❌ Error in CHODE polling loop:', error);
  }
}

// Start the worker
async function startWorker() {
  console.log('🚀 Starting Enhanced Oracle Image Generation Worker with CHODE Prompt System...');
  
  // Test connections first
  const connectionsOk = await testConnections();
  if (!connectionsOk) {
    console.error('🚨 Connection tests failed. Exiting...');
    process.exit(1);
  }
  
  console.log('🔄 Starting CHODE polling loop (every 10 seconds)...');
  
  // Initial poll
  await pollForJobs();
  
  // Set up polling interval
  setInterval(async () => {
    await pollForJobs();
  }, 10000); // Poll every 10 seconds
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 CHODE Worker shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 CHODE Worker terminated gracefully...');
  process.exit(0);
});

// Start the worker
startWorker().catch((error) => {
  console.error('🚨 CHODE Worker startup failed:', error);
  process.exit(1);
}); 