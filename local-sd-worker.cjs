// ===============================================
// 🎨 LOCAL STABLE DIFFUSION WORKER
// ===============================================
// CommonJS version to work with "type": "module" projects
// ENHANCED WITH CHODE PROMPT GENERATOR
//
// 📁 FILE ORGANIZATION:
// 1. 🎛️ GENERATION CONFIGURATION - All tunable parameters
// 2. 🖼️ CHODE Reference Library utilities  
// 3. 🧠 CHODE Prompt Generator class
// 4. 🎛️ Denoising calculation functions
// 5. 🔌 Connection & job processing logic
// 6. 🚀 Worker startup and polling
//
// 🔧 TO TUNE GENERATION: Modify values in GENERATION CONFIGURATION section

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs').promises; // Added for file system access
const path = require('path'); // Added for path manipulation
require('dotenv').config();

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LOCAL_SD_URL = process.env.LOCAL_SD_URL || 'http://127.0.0.1:7860';

// ===============================================
// 🎛️ GENERATION CONFIGURATION - TUNE HERE
// ===============================================

// --- GENERATION MODE CONTROLS ---
const ENABLE_REFERENCE_IMAGES = true; // Enable img2img mode with reference library images
const ENABLE_LORAS = true; // Enable LoRA models for CHODE universe aesthetic
const ENABLE_DYNAMIC_IMG2IMG_DENOISE = true; // Dynamic denoising based on story content

// --- TEXT-TO-IMAGE CONFIGURATION ---
// NOTE: Not actually used in txt2img API, but kept for reference/logging
const TEXT_TO_IMAGE_DENOISE = 0.45; // Reference value for txt2img mode

// --- IMAGE-TO-IMAGE DENOISING CONFIGURATION ---
// Base denoising levels per corruption type for img2img mode
const IMG2IMG_BASE_DENOISING = {
  'pristine': 0.9,           // High denoising for clean corruptions
  'cryptic': 0.9,            // High denoising for subtle corruptions  
  'flickering': 0.9,         // Medium denoising for unstable corruptions
  'glitched_ominous': 0.9,   // Medium denoising for chaotic corruptions
  'forbidden_fragment': 0.9  // Highest denoising for extreme corruptions
};

// Static img2img denoising (used when ENABLE_DYNAMIC_IMG2IMG_DENOISE = false)
const STATIC_IMG2IMG_DENOISE = 0.80;

// Dynamic denoising adjustments based on story content richness
const DYNAMIC_DENOISE_ADJUSTMENTS = {
  HIGH_STORY_WEIGHT: -0.20,    // Rich story content: Lower denoising for stronger story influence
  MEDIUM_STORY_WEIGHT: -0.10,  // Medium story content: Slight denoising reduction
  LOW_STORY_WEIGHT: 0.00       // Minimal story content: Use base denoising
};

// Story weight thresholds for dynamic denoising
const STORY_WEIGHT_THRESHOLDS = {
  HIGH: 0.8,     // 4+ entities detected
  MEDIUM: 0.65   // 2-3 entities detected  
};

// --- GENERATION PARAMETERS ---
const GENERATION_PARAMS = {
  width: 896,
  height: 896,
  steps: 28,                    // TUNE: Increase for quality, decrease for speed
  cfg_scale: 8.0,             // TUNE: Higher = stricter prompt adherence (1-20)
  sampler_name: "DPM++ 2M Karras", // TUNE: Different samplers affect style
  seed: -1,                     // -1 = random, set number for reproducible results
  restore_faces: false,
  tiling: false,
  enable_hr: false
};

// --- TIMEOUT CONFIGURATION ---
const GENERATION_TIMEOUT_MS = 600000; // TUNE: 10 minutes (600,000ms) - increase for complex generations

// ===============================================
// 🎯 QUICK TUNING REFERENCE:
// ===============================================
// 📈 For Higher Quality: Increase steps (50-80), increase cfg_scale (12-15)
// ⚡ For Faster Generation: Decrease steps (20-30), decrease cfg_scale (7-10)  
// ⏱️ For Timeout Issues: Increase GENERATION_TIMEOUT_MS (default: 10min, try 15-20min for complex gens)
// 🎨 For Story Influence: Enable ENABLE_DYNAMIC_IMG2IMG_DENOISE, adjust IMG2IMG_BASE_DENOISING
// 🖼️ For Reference Images: Set ENABLE_REFERENCE_IMAGES = true, populate folders:
//     📁 chode_reference_library/characters/ - Character references
//     📁 chode_reference_library/environments/ - Location/scene references  
//     📁 chode_reference_library/memes/ - Meme/tech aesthetic references
//     📁 chode_reference_library/cosmic/ - Abstract/cosmic references
// 🎭 For LoRA Effects: Modify weights in getModelConfigForCorruption()
// 🧠 Smart Selection: Automatically chooses category based on story content analysis
// ===============================================

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

// ===============================================
// 🖼️ CHODE REFERENCE LIBRARY UTILITIES
// ===============================================

/**
 * Smart category selection based on story content analysis
 * @param {Object} content - Extracted story content with entities
 * @returns {string} Selected category name
 */
function selectSmartReferenceCategory(content) {
  const { characters, locations, items, concepts } = content.entities;
  
  // Count entity types for decision making
  const characterCount = characters.length;
  const locationCount = locations.length;
  const conceptCount = concepts.length;
  const itemCount = items.length;
  
  console.log(`🧠 Smart Selection Analysis: ${characterCount} characters, ${locationCount} locations, ${conceptCount} concepts, ${itemCount} items`);
  
  // Priority-based selection logic with better balance
  
  // 1. COSMIC: High cosmic content only (much more selective)
  if (conceptCount >= 2 && 
      concepts.some(concept => concept.includes("cosmic")) && 
      concepts.some(concept => concept.includes("raw power")) &&
      Math.random() < 0.6) { // 60% chance even when conditions met
    console.log(`🌌 Selected COSMIC: High cosmic+power content with random factor`);
    return "cosmic";
  }
  
  // 2. MEMES: Meme energy or tech-heavy content (easier trigger)
  if (concepts.some(concept => 
    concept.includes("meme energy") || concept.includes("advanced technology"))) {
    console.log(`🐸 Selected MEMES: Meme/tech energy detected`);
    return "memes";
  }
  
  // 3. ENVIRONMENTS: Give environments better priority
  if (locationCount > 0 && Math.random() < 0.5) { // 50% chance for environments if any locations
    console.log(`🏛️ Selected ENVIRONMENTS: Random environment selection (${locationCount} locations available)`);
    return "environments";
  }
  
  // 4. CHARACTERS: Give characters better chance (less strict)
  if (characterCount > 0 && Math.random() < 0.4) { // 40% chance if any characters
    console.log(`👥 Selected CHARACTERS: Random character selection (${characterCount} characters available)`);
    return "characters";
  }
  
  // 5. ENHANCED FALLBACK: Weighted random distribution (reduced cosmic weight)
  const categories = ['characters', 'environments', 'memes', 'cosmic'];
  const weights = [0.35, 0.35, 0.2, 0.1]; // Reduced cosmic to 10%, boosted chars/envs to 35% each
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < categories.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      console.log(`🎲 Selected ${categories[i].toUpperCase()}: Weighted random fallback (${(weights[i] * 100).toFixed(0)}% chance)`);
      return categories[i];
    }
  }
  
  // Final safety fallback
  console.log(`🎲 Selected CHARACTERS: Safety fallback`);
  return "characters";
}

async function getRandomReferenceImageAsBase64(category = 'characters') {
  const categoryPath = path.join(CHODE_REFERENCE_LIBRARY_PATH, category);
  console.log(`🔍 Searching for reference images in: ${categoryPath}`);

  try {
    const files = await fs.readdir(categoryPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
    });

    if (imageFiles.length === 0) {
      console.warn(`⚠️ No images found for category '${category}'.`);
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

// ===============================================
// 🧠 CHODE PROMPT GENERATOR CLASS
// ===============================================

class CHODEPromptGenerator {
  constructor() {
    this.CHODE_VISUAL_DNA = {
      base_style: "grimecore cyberpunk, pixel-infested filth, cursed comic energy, hyper-saturated neon, cosmic sludge palette, slap-core digital surrealism, high-res art, idle clicker mythos, radiant grime textures, pixel-perfect, cosmic degeneration, legendary filthscape, NSFW dystopian fantasy, dark-web iconography, Girthpunk mythic energy, degenerate data temples, glitch-laced backdrops, narrator pov",
      
      mandatory_tags: ["CHODE Tapper universe","slap-core mythology","$GIRTH particle physics","Primordial Monolith","cyberpunk dumpster fire aesthetic","blockchain worship temples","tap-based devotion","NSFW", "idle obsession","degen pixel cults","post-ironic prophecy","dystopian solana net","token-fueled ascension","hyper-neon alleyway","tap cult ritual","comic book","grimey", "tap button", "futuristic"],

      quality_tags: ["masterpiece","best quality","highly detailed","crisp pixel art", "hyper-realistic", "vibrant lighting"],

      exclusion_tags: ["blurry","deformed","bad anatomy","disfigured","watermark","text","signature"]
    };

    this.ENTITY_KEYWORDS = {
      // ENHANCED: Much more comprehensive entity detection
      oracle: ["oracle", "mystic", "seer", "prophet", "divine", "cosmic", "sentient AI", "girth-seer", "sage", "visionary", "shaman", "priestess", "deity", "god", "gods", "goddess", "wizard", "mage", "soothsayer"],
      legion: ["legion", "army", "warriors", "followers", "devotees", "girth-worshippers", "tapping zealots", "diamond-handed cultists", "cultists", "disciples", "believers", "faithful", "congregation", "brotherhood", "sisterhood", "clan", "tribe", "collective"],
      chode: ["chode", "monolith", "veinous", "bulbous", "expansion", "girth", "evolution", "throbbing", "pulsating", "engorged", "phallus", "pillar", "tower", "obelisk", "totem", "idol", "statue", "monument"],
      // ENHANCED: More "dumpster fire" grit + mystical locations
      temple: ["temple", "dumpster shrine", "altar", "sacred", "grimey", "filthy", "alley", "gutter", "discarded electronics", "overgrown data-vines", "cathedral", "church", "mosque", "synagogue", "sanctuary", "shrine", "basilica", "chapel"],
      void: ["void", "darkness", "abyss", "space", "cosmos", "the great nothingness","neon-drenched", "emptiness", "vacuum", "limbo", "netherworld", "underworld", "shadowlands", "beyond", "infinity"],
      data: ["data", "code", "matrix", "digital", "cyber", "network", "glitch", "static", "algorithm", "binary", "bytes", "database", "server", "mainframe", "terminal", "interface", "protocol"],
      // EXPANDED: More meme and crypto entities
      meme_entities: ["pepe", "wojak", "dogwifhat", "energy drink", "dorito", "bags", "chad", "gigachad", "virgin", "coomer", "doomer", "boomer", "zoomer", "simp", "cope", "seethe", "diamond hands", "paper hands", "ape", "moon", "rocket", "pump", "dump"],
      // NEW: Power and energy entities
      power: ["power", "energy", "force", "tap", "slap", "iron grip", "girthquake", "oozedrip", "slap bot", "strength", "might", "dominance", "supremacy", "authority", "control", "influence", "surge", "wave", "pulse", "flow", "current"],
      // NEW: Cosmic and eldritch entities
      cosmic: ["cosmic", "eldritch", "ancient", "primordial", "eternal", "infinite", "omnipotent", "omniscient", "transcendent", "ascended", "enlightened", "awakened"],
      // NEW: Technology entities
      tech: ["AI", "artificial intelligence", "robot", "android", "cyborg", "machine", "computer", "software", "hardware", "neural network", "blockchain", "cryptocurrency"]
    };

    this.CORRUPTION_VISUAL_DNA = {
      // ✨ 0 - Pristine Girth: The untouched promise
      pristine: {
        palette: ["pure white", "iridescent cyan", "glistening opal", "holographic shimmer"],
        atmosphere: "sterile neon cathedral, divine data purity",
        effects: ["unblemished monolith", "$GIRTH embryo"],
        style_tags: ["holy cyberpunk", "sacred neon", "128-bit mythic clarity"],
        mood_modifier: "suspiciously clean, untouched potential"
      },
    
      // 🧩 1 - Cryptic Girth: The whisper before the slap
      cryptic: {
        palette: ["glowing violet", "shadow blue", "toxic green", "void black"],
        atmosphere: "neon back-alley temple, glitching devotion chamber",
        effects: ["incipient phallus", "mystic glyphs", "low hum"],
        style_tags: ["cyberpunk mysticism", "neon grime", "pre-slap tension"],
        mood_modifier: "mysterious, lurking filth, encoded lust"
      },
    
      // ⚡ 2 - Flickering Girth: The unstable slap cult begins
      flickering: {
        palette: ["electric blue", "copper rust", "burnt orange", "flesh static"],
        atmosphere: "unstable devotion alley, pixel rot temples",
        effects: ["growing phallus", "neon fever bloom", "slap shockwaves"],
        style_tags: ["tap cult rituals", "slap-core neon", "filth-charged mythos"],
        mood_modifier: "unstable, sweaty, degenerate zeal"
      },
    
      // 🧠 3 - Glitched Ominous Girth: The collapse into obsession
      glitched_ominous: {
        palette: ["crimson heat", "deep glitch purple", "decay red", "glitch static"],
        atmosphere: "sacred data failure zone, broken NSFW temple",
        effects: ["bulbous phallus distortion", "corrupted glyphs", "slap overload fractures"],
        style_tags: ["degenerate pixel cults", "NSFW cyberpunk", "tap-loop meltdown"],
        mood_modifier: "corrupted, overstimulated, glitch-throbbing madness"
      },
    
      // 🕳️ 4 - Forbidden Fragment: The heretical girth singularity
      forbidden_fragment: {
        palette: ["void black", "sacrificial red", "eldritch purple", "veinous chrome"],
        atmosphere: "data hellscape, forbidden slap vault, corrupted chode realm",
        effects: ["anomalous girth relic", "monolith bleeding data", "veinous prophecy fracture"],
        style_tags: ["eldritch cyberpunk", "NSFW horror surrealism", "slapcore apotheosis"],
        mood_modifier: "unholy, incomprehensible, sacred filth ascension"
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
      generation_params: GENERATION_PARAMS
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
    // This function returns a complete style package, now with a minimal, targeted LoRA stack for each mood.
    const configs = {
      pristine: {
        modelName: 'RealitiesEdgeXLLIGHTNING_TURBOV7.safetensors',
        loras: [
          { name: 'cyberpunk_neon', weight: 0.75 },
          { name: 'comic-strip', weight: 0.8 },
          { name: 'Lucasarts-Artstyle', weight: 0.55 } // swapped in for CleanAnomalySciFi
        ],
        stylePrefix: 'hyper-detailed, comic strip style,divine chrome tapper temples, corporate utopia, eerie serenity, suspicious perfection, unsettling symmetry, anime hero, chode',
        styleSuffix: ', lcas artstyle, sacred neon glyphs, algorithmic halos, holographic cleanliness, Solana worship shrine',
        negativePrompt: 'glitch, horror, grime, filth, deformed, messy, chaos, blurry, text, watermark'
      },
    
      cryptic: {
        modelName: 'dreamshaperXL_v21TurboDPMSDE.safetensors',
        loras: [
          { name: 'cyberpunk_neon', weight: 0.4 },
          { name: 'sdxl_cyberpunk', weight: 0.9 },
          { name: 'EldritchComicsXL1.2', weight: 0.8 }, // swapped in for CultShrineArchitecture
        ],
        stylePrefix: 'graffiti-tagged shrine to girth, cyberpunk noir alleys, sacred circuit boards, secret slap cult, cyberpunk cryptid, chode',
        styleSuffix: ', dripping neon tags, forgotten Solana backstreets, urban relics, ghosted chat logs',
        negativePrompt: 'modern, sterile, bright, bland, generic, blurry, watermark'
      },
    
      flickering: {
        modelName: 'RealitiesEdgeXLLIGHTNING_TURBOV7.safetensors',
        loras: [
          { name: 'cyberpunk_neon', weight: 0.65 },
          { name: 'aidmaGlitchStyle-v0.1', weight: 0.35 },
          { name: 'sdxl_cyberpunk', weight: 0.9 },
          { name: 'EldritchComicsXL1.2', weight: 0.5 }, // swapped in for LowResWojakZine
        ],
        stylePrefix: 'CRT artifact temple, flickering, exposed crypto guts, low-res wojak tech chaos, flickering god rays, anime, chode',
        styleSuffix: ', degen firmware loops, cyberjunk everywhere, Girth Machine hums in Morse',
        negativePrompt: 'smooth, clean, sterile, soft, blurry, watermark'
      },
    
      glitched_ominous: {
        modelName: 'juggernautXL_ragnarokBy.safetensors',
        loras: [
          { name: 'cyberpunk_neon', weight: 0.5 },
          { name: 'aidmaGlitchStyle-v0.1', weight: 0.75 },
          { name: 'sdxl_cyberpunk', weight: 0.75 },
          { name: 'Lucasarts-Artstyle', weight: 0.45 }, // swapped in for WojakCathedralChaos
        ],
        stylePrefix: 'apocalyptic meme cult ruins, glitch, corrupted ledger temples, data bleed from the void, screaming wojaks with holy glow, cyberpunk prophet, chode',
        styleSuffix: ', lcas artstyle, broken wallet UI as stained glass, red chart candles drip like blood, Solana ticker embedded in stone',
        negativePrompt: 'hopeful, happy, structured, wholesome, blurry, watermark'
      },
    
      forbidden_fragment: {
        modelName: 'oracle-forbidden.safetensors',
        loras: [
          { name: 'cyberpunk_neon', weight: 0.7 },
          { name: 'aidmaGlitchStyle-v0.1', weight: 0.45 },
          { name: 'sdxl_cyberpunk', weight: 0.8 },
          { name: 'Lucasarts-Artstyle', weight: 0.85 }, // swapped in for ForbiddenLoreCodex
        ],
        stylePrefix: 'Girth dimension collapsed, glitch, bugged slab of reality, time-loop shrine to taps, cursed dev log, anime babes, anime villain, chode',
        styleSuffix: ', lcas artstyle, forbidden command line prophecy, corrupted UI elements as sigils, NSFW lore panels from unknown artists, phallus shaped, backrooms',
        negativePrompt: 'normal, pleasant, structured, peaceful, digestible, watermark'
      }
    };


    return configs[corruptionLevel] || configs.pristine;
  }
}

// Initialize the prompt generator
const promptGenerator = new CHODEPromptGenerator();

// ===============================================
// END CHODE PROMPT GENERATOR CLASS
// ===============================================

// ===============================================
// 🎛️ DENOISING CALCULATION FUNCTIONS
// ===============================================

/**
 * Calculate optimal denoising strength for img2img based on corruption level and story content
 * @param {string} corruptionLevel - The corruption level (pristine, cryptic, etc.)
 * @param {number} storyWeight - Story content richness (0.5-0.8)
 * @returns {number} Denoising strength (0.0-1.0)
 */
function calculateImg2ImgDenoising(corruptionLevel, storyWeight = 0.5) {
  if (!ENABLE_DYNAMIC_IMG2IMG_DENOISE) {
    console.log(`🎛️ IMG2IMG Static Denoising: ${STATIC_IMG2IMG_DENOISE}`);
    return STATIC_IMG2IMG_DENOISE;
  }

  // Get base denoising for this corruption level
  const baseDenoise = IMG2IMG_BASE_DENOISING[corruptionLevel] || 0.65;
  
  // Calculate adjustment based on story weight
  let adjustment = DYNAMIC_DENOISE_ADJUSTMENTS.LOW_STORY_WEIGHT;
  let influenceLevel = 'STANDARD';
  
  if (storyWeight >= STORY_WEIGHT_THRESHOLDS.HIGH) {
    adjustment = DYNAMIC_DENOISE_ADJUSTMENTS.HIGH_STORY_WEIGHT;
    influenceLevel = 'MAXIMUM';
  } else if (storyWeight >= STORY_WEIGHT_THRESHOLDS.MEDIUM) {
    adjustment = DYNAMIC_DENOISE_ADJUSTMENTS.MEDIUM_STORY_WEIGHT; 
    influenceLevel = 'HIGH';
  }
  
  // Apply adjustment with minimum threshold
  const finalDenoising = Math.max(0.45, baseDenoise + adjustment);
  
  console.log(`🎛️ IMG2IMG Dynamic Denoising: ${finalDenoising} (story weight: ${storyWeight}, base: ${baseDenoise})`);
  console.log(`📈 Story influence optimization: ${influenceLevel}`);
  
  return finalDenoising;
}

// ===============================================
// 🔌 CONNECTION TESTING AND JOB PROCESSING
// ===============================================

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
      timeout: 7500
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
    let { lore_entry_id, story_text, visual_prompt, corruption_level } = job.payload;
    
    // 🔒 Safety mapping: ensure corruption level uses underscores
    corruption_level = normalizeCorruptionLevel(corruption_level);
    
    console.log(`🎯 Generating for corruption level: ${corruption_level}`);
    console.log(`📝 Visual prompt: ${visual_prompt}`);
    console.log(`📚 Story text length: ${story_text?.length || 0} characters`);
    console.log(`🆔 Lore entry ID: ${lore_entry_id}`);
    
    // Generate enhanced CHODE prompt
    const unifiedPrompt = generateCHODEPrompt(visual_prompt, story_text || visual_prompt, corruption_level);
    
    // ===============================================
    // 🖼️ GENERATION MODE DETERMINATION
    // ===============================================
    
    let base64ReferenceImage = null;
    let sdApiEndpoint = '/sdapi/v1/txt2img'; // Default to text-to-image
    let denoisingStrength = null; // Will be calculated based on mode

    // Check if reference images are enabled
    if (!ENABLE_REFERENCE_IMAGES) {
      console.log('🚫 Reference images disabled - using pure txt2img mode');
    }

    try {
      // Only attempt reference images if enabled
      if (ENABLE_REFERENCE_IMAGES) {
        // Smart category selection based on story content
        const primaryCategory = selectSmartReferenceCategory(unifiedPrompt.content);
        
        // Fallback categories in case primary fails
        const allCategories = ['characters', 'environments', 'memes', 'cosmic'];
        const fallbackCategories = allCategories.filter(cat => cat !== primaryCategory);
        const categoriesToTry = [primaryCategory, ...fallbackCategories];
        
        console.log(`🖼️ Smart selection: Primary '${primaryCategory}', fallbacks: [${fallbackCategories.join(', ')}]`);

        for (const category of categoriesToTry) {
          base64ReferenceImage = await getRandomReferenceImageAsBase64(category);
          if (base64ReferenceImage) {
            console.log(`✅ Found reference image in '${category}' category.`);
            break; // Found an image, stop searching
          }
        }
      } else {
        console.log('⚡ Skipping reference image loading - ENABLE_REFERENCE_IMAGES is false');
      }

      // Set generation mode and calculate denoising
      if (base64ReferenceImage) {
        // IMG2IMG MODE: Calculate denoising based on story content and corruption
        sdApiEndpoint = '/sdapi/v1/img2img';
        const storyWeight = unifiedPrompt.content?.emotional_cues?.story_weight || 0.5;
        denoisingStrength = calculateImg2ImgDenoising(corruption_level, storyWeight);
        console.log(`🖼️ Using Image-to-Image mode with denoising: ${denoisingStrength}`);
      } else {
        // TXT2IMG MODE: No denoising parameter needed
        sdApiEndpoint = '/sdapi/v1/txt2img';
        console.log(`📝 Using Text-to-Image mode (denoising not applicable)`);
        console.warn('⚠️ No suitable reference image found. Using pure text-to-image generation.');
      }
    } catch (imgError) {
      console.error('❌ Error preparing reference image for img2img:', imgError.message);
      console.warn('⚠️ Falling back to text-to-image due to reference image error.');
      base64ReferenceImage = null; // Ensure it's null to trigger txt2img fallback
      sdApiEndpoint = '/sdapi/v1/txt2img';
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

    // ===============================================
    // 🚀 STABLE DIFFUSION PAYLOAD PREPARATION  
    // ===============================================
    
    // Build base payload from centralized config
    const sdPayload = {
      prompt: unifiedPrompt.positive + loraPromptAdditions,
      negative_prompt: unifiedPrompt.negative,
      ...unifiedPrompt.generation_params,
      override_settings: {
        sd_model_checkpoint: modelConfig.modelName
      }
    };

    // Add img2img specific parameters if using reference image
    if (base64ReferenceImage) {
      sdPayload.init_images = [base64ReferenceImage];
      sdPayload.denoising_strength = denoisingStrength;
      // Future: ControlNet integration can be added here
      // sdPayload.controlnet_units = [...];
    }
    
    console.log('🚀 Sending ENHANCED CHODE request to Stable Diffusion...');
    console.log(`🎭 Model: ${modelConfig.modelName}`);
    console.log(`🔮 LoRAs: ${modelConfig.loras?.length || 0} active`);
    console.log(`⚙️ Settings: ${sdPayload.steps} steps, ${sdPayload.sampler_name} sampler, CFG ${sdPayload.cfg_scale}, Denoising: ${sdPayload.denoising_strength || 'N/A'}`);
    console.log(`📐 Resolution: ${sdPayload.width}x${sdPayload.height}`);
    console.log(`🖼️ Mode: ${base64ReferenceImage ? 'img2img' : 'txt2img'}`);
    
    // Call local Stable Diffusion with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
    
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

// ===============================================
// 🚀 WORKER STARTUP AND MAIN LOOP
// ===============================================

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
  }, 20000); // Poll every 20 seconds
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

// =====================================================
// Utility – normalize corruption name variants
function normalizeCorruptionLevel(level) {
  if (!level) return 'pristine';
  
  const l = level.toLowerCase();
  
  // Standard mapping for non-standard corruption levels
  if (l === 'unstable') return 'flickering';
  if (l === 'radiant_clarity' || l === 'radiantclarity' || l === 'radiant-clarity') return 'pristine';
  if (l === 'critical_corruption' || l === 'criticalcorruption' || l === 'critical-corruption') return 'glitched_ominous';
  if (l === 'data_daemon_possession' || l === 'datadaemonpossession' || l === 'data-daemon-possession') return 'forbidden_fragment';
  
  // Handle camelCase and other formats
  if (l === 'glitchedominous' || l === 'glitched-ominous') return 'glitched_ominous';
  if (l === 'forbiddenfragment' || l === 'forbidden-fragment') return 'forbidden_fragment';
  
  // If it's already a standard value, return it
  if (['pristine', 'cryptic', 'flickering', 'glitched_ominous', 'forbidden_fragment'].includes(l)) {
    return l;
  }
  
  // Default to pristine for unknown values
  return 'pristine';
} 