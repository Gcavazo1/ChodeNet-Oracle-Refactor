// 🎨 CHODE Universe Prompt Generator
// Enhanced visual consistency system for comic panel generation

export type CorruptionLevel = 'pristine' | 'cryptic' | 'flickering' | 'glitched_ominous' | 'forbidden_fragment';

export interface ContentExtraction {
  entities: {
    characters: string[];
    locations: string[];
    items: string[];
    symbols: string[];
  };
  scene_descriptors: {
    mood: string;
    time_of_day: string;
    setting: string;
    weather_effects: string[];
  };
  emotional_cues: {
    tension: 'low' | 'medium' | 'high';
    mystery: 'none' | 'subtle' | 'intense';
    corruption_level: 'pristine' | 'mild' | 'severe' | 'forbidden';
  };
}

export interface ArtStyleConstraints {
  primary_style: '64-bit-pixel';
  composition_type: 'single-panel';
  aspect_ratio: '1:1' | '3:4';
  resolution: '768x768' | '512x512';
  
  color_palette: {
    type: 'retro-cyber' | 'mystic-void' | 'corruption-gradient';
    count: 16;
    dominant_colors: string[];
    accent_colors: string[];
  };
  
  visual_themes: {
    mandatory_tags: string[];
    theme_tags: string[];
    exclusion_tags: string[];
  };
}

export interface UnifiedPrompt {
  positive: string;
  negative: string;
  model_config: {
    modelName: string;
    stylePrefix: string;
    styleSuffix: string;
    negativePrompt: string;
  };
  generation_params: {
    width: number;
    height: number;
    steps: number;
    cfg_scale: number;
    sampler_name: string;
  };
}

export interface PromptOptions {
  visual_hint?: string;
  style_override?: string;
  emphasis_keywords?: string[];
  quality_boost?: boolean;
}

export class CHODEPromptGenerator {
  private readonly CHODE_VISUAL_DNA = {
    base_style: "64-bit pixel art comic panel",
    mandatory_tags: ["CHODE Tapper universe", "retro cyberpunk aesthetic", "comic panel frame"],
    quality_tags: ["pixel perfect", "sharp edges", "limited color palette", "clean pixel boundaries"],
    exclusion_tags: ["photorealistic", "3D render", "modern graphics", "unlimited colors", "anti-aliasing", "gradient shading"]
  };

  // Entity recognition keywords for content extraction
  private readonly ENTITY_KEYWORDS = {
    characters: [
      "oracle", "prophet", "seer", "vision", "mystic", "hooded figure",
      "chode", "legion", "warrior", "member", "tapper", "champion",
      "guardian", "sentinel", "seeker", "pilgrim", "devotee"
    ],
    locations: [
      "temple", "sanctuary", "chamber", "realm", "void", "abyss",
      "swamp", "forest", "mushroom", "cyber", "digital", "data stream",
      "mountain", "peak", "valley", "underground", "cavern", "portal"
    ],
    items: [
      "scroll", "tome", "orb", "crystal", "staff", "wand", "tapper", "gauntlet",
      "rune", "symbol", "sigil", "artifact", "relic", "weapon", "tool"
    ],
    symbols: [
      "eye", "third eye", "girth", "resonance", "energy", "aura", "glow",
      "pattern", "geometry", "mandala", "circuit", "code", "matrix", "grid"
    ]
  };

  // Mood detection keywords
  private readonly MOOD_KEYWORDS = {
    mystical: ["divine", "sacred", "holy", "blessed", "ethereal", "transcendent"],
    ominous: ["dark", "shadow", "threatening", "foreboding", "sinister", "menacing"],
    chaotic: ["wild", "frenzied", "unstable", "chaotic", "turbulent", "erratic"],
    peaceful: ["calm", "serene", "tranquil", "peaceful", "harmonious", "balanced"],
    corrupted: ["twisted", "corrupted", "tainted", "polluted", "infected", "poisoned"]
  };

  // Visual DNA for each corruption level
  private readonly CORRUPTION_VISUAL_DNA = {
    pristine: {
      palette: ["#FFFFFF", "#06D6A0", "#8B5CF6", "#E5E7EB"],
      effects: ["divine glow", "ethereal light", "sacred geometry", "pure energy"],
      atmosphere: "mystical serenity",
      style_tags: ["divine light rays", "holy aura", "crystalline clarity", "angelic presence"]
    },
    cryptic: {
      palette: ["#8B5CF6", "#9D4EDD", "#6366F1", "#4C1D95"],
      effects: ["mysterious shadows", "ancient symbols", "occult imagery", "arcane energy"],
      atmosphere: "dark mysticism",
      style_tags: ["shadowy depths", "mysterious runes", "occult symbols", "enigmatic aura"]
    },
    flickering: {
      palette: ["#F59E0B", "#FBBF24", "#92400E", "#451A03"],
      effects: ["data corruption", "digital glitches", "unstable energy", "system errors"],
      atmosphere: "technological instability",
      style_tags: ["digital artifacts", "screen glitches", "data corruption", "unstable pixels"]
    },
    glitched_ominous: {
      palette: ["#EF4444", "#DC2626", "#991B1B", "#7F1D1D"],
      effects: ["system failure", "corrupted data", "ominous warnings", "critical errors"],
      atmosphere: "digital nightmare",
      style_tags: ["error messages", "corrupted visuals", "system warnings", "digital decay"]
    },
    forbidden_fragment: {
      palette: ["#000000", "#DC2626", "#7F1D1D", "#450A0A"],
      effects: ["reality breakdown", "cosmic horror", "forbidden knowledge", "dimensional tears"],
      atmosphere: "eldritch terror",
      style_tags: ["reality distortion", "cosmic void", "forbidden geometry", "dimensional rifts"]
    }
  };

  async generateUnifiedPrompt(
    storyText: string,
    corruptionLevel: CorruptionLevel,
    options?: PromptOptions
  ): Promise<UnifiedPrompt> {
    console.log(`🎨 Generating unified prompt for corruption level: ${corruptionLevel}`);
    
    // 1. Extract content from story
    const contentExtraction = this.extractContent(storyText);
    
    // 2. Apply corruption-specific styling
    const styleConstraints = this.getStyleConstraints(corruptionLevel);
    
    // 3. Build unified prompt
    const unifiedPrompt = this.synthesizePrompt(
      contentExtraction,
      styleConstraints,
      options || {}
    );
    
    console.log(`🎨 Generated prompt length: ${unifiedPrompt.positive.length} chars`);
    return unifiedPrompt;
  }

  private extractContent(storyText: string): ContentExtraction {
    const text = storyText.toLowerCase();
    
    // Extract entities based on keyword matching
    const characters = this.ENTITY_KEYWORDS.characters.filter(keyword => 
      text.includes(keyword)
    );
    
    const locations = this.ENTITY_KEYWORDS.locations.filter(keyword => 
      text.includes(keyword)
    );
    
    const items = this.ENTITY_KEYWORDS.items.filter(keyword => 
      text.includes(keyword)
    );
    
    const symbols = this.ENTITY_KEYWORDS.symbols.filter(keyword => 
      text.includes(keyword)
    );

    // Detect mood
    let mood = "neutral";
    let maxMatches = 0;
    
    for (const [moodName, keywords] of Object.entries(this.MOOD_KEYWORDS)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        mood = moodName;
      }
    }

    // Determine time of day and setting from context
    const timeOfDay = this.detectTimeOfDay(text);
    const setting = this.detectSetting(text);
    const weatherEffects = this.detectWeatherEffects(text);

    // Assess emotional cues
    const tension = this.assessTension(text);
    const mystery = this.assessMystery(text);
    const corruption = this.assessCorruption(text);

    return {
      entities: { characters, locations, items, symbols },
      scene_descriptors: { mood, time_of_day: timeOfDay, setting, weather_effects: weatherEffects },
      emotional_cues: { tension, mystery, corruption_level: corruption }
    };
  }

  private detectTimeOfDay(text: string): string {
    if (text.includes("dawn") || text.includes("sunrise")) return "dawn";
    if (text.includes("morning") || text.includes("early")) return "morning";
    if (text.includes("noon") || text.includes("midday")) return "noon";
    if (text.includes("dusk") || text.includes("sunset")) return "dusk";
    if (text.includes("night") || text.includes("midnight") || text.includes("darkness")) return "night";
    return "eternal twilight"; // Default for mystical settings
  }

  private detectSetting(text: string): string {
    if (text.includes("indoor") || text.includes("chamber") || text.includes("temple")) return "indoor";
    if (text.includes("outdoor") || text.includes("forest") || text.includes("mountain")) return "outdoor";
    return "mystical realm"; // Default for CHODE universe
  }

  private detectWeatherEffects(text: string): string[] {
    const effects = [];
    if (text.includes("mist") || text.includes("fog")) effects.push("mystical mist");
    if (text.includes("rain") || text.includes("storm")) effects.push("digital rain");
    if (text.includes("wind") || text.includes("breeze")) effects.push("cosmic wind");
    if (text.includes("glow") || text.includes("light")) effects.push("ethereal glow");
    return effects;
  }

  private assessTension(text: string): 'low' | 'medium' | 'high' {
    const highTension = ["danger", "threat", "urgent", "crisis", "critical", "alarm"];
    const mediumTension = ["concern", "worry", "caution", "warning", "alert"];
    
    if (highTension.some(word => text.includes(word))) return "high";
    if (mediumTension.some(word => text.includes(word))) return "medium";
    return "low";
  }

  private assessMystery(text: string): 'none' | 'subtle' | 'intense' {
    const intenseMystery = ["secret", "hidden", "forbidden", "mystery", "unknown", "enigma"];
    const subtleMystery = ["curious", "strange", "unusual", "odd", "peculiar"];
    
    if (intenseMystery.some(word => text.includes(word))) return "intense";
    if (subtleMystery.some(word => text.includes(word))) return "subtle";
    return "none";
  }

  private assessCorruption(text: string): 'pristine' | 'mild' | 'severe' | 'forbidden' {
    if (text.includes("forbidden") || text.includes("eldritch") || text.includes("cosmic horror")) return "forbidden";
    if (text.includes("corrupted") || text.includes("tainted") || text.includes("twisted")) return "severe";
    if (text.includes("unstable") || text.includes("glitch") || text.includes("error")) return "mild";
    return "pristine";
  }

  private getStyleConstraints(corruptionLevel: CorruptionLevel): ArtStyleConstraints {
    const corruptionDNA = this.CORRUPTION_VISUAL_DNA[corruptionLevel];
    
    return {
      primary_style: '64-bit-pixel',
      composition_type: 'single-panel',
      aspect_ratio: '1:1',
      resolution: '768x768',
      color_palette: {
        type: this.getColorPaletteType(corruptionLevel),
        count: 16,
        dominant_colors: corruptionDNA.palette.slice(0, 2),
        accent_colors: corruptionDNA.palette.slice(2)
      },
      visual_themes: {
        mandatory_tags: this.CHODE_VISUAL_DNA.mandatory_tags,
        theme_tags: corruptionDNA.style_tags,
        exclusion_tags: this.CHODE_VISUAL_DNA.exclusion_tags
      }
    };
  }

  private getColorPaletteType(corruptionLevel: CorruptionLevel): 'retro-cyber' | 'mystic-void' | 'corruption-gradient' {
    switch (corruptionLevel) {
      case 'pristine': return 'mystic-void';
      case 'cryptic': return 'mystic-void';
      case 'flickering': return 'retro-cyber';
      case 'glitched_ominous': return 'corruption-gradient';
      case 'forbidden_fragment': return 'corruption-gradient';
      default: return 'retro-cyber';
    }
  }

  private synthesizePrompt(
    content: ContentExtraction,
    style: ArtStyleConstraints,
    options: PromptOptions
  ): UnifiedPrompt {
    const corruptionLevel = this.inferCorruptionLevel(content);
    // corruptionDNA extracted for future enhancement
    
    // Build positive prompt components
    const baseStyle = this.CHODE_VISUAL_DNA.base_style;
    const mandatoryTags = style.visual_themes.mandatory_tags.join(", ");
    const themeTags = style.visual_themes.theme_tags.join(", ");
    const qualityTags = this.CHODE_VISUAL_DNA.quality_tags.join(", ");
    
    // Content-specific elements
    const sceneElements = this.buildSceneDescription(content);
    const atmosphereElements = this.buildAtmosphereDescription(corruptionLevel, content);
    
    // Color palette enforcement
    const colorPalette = `limited ${style.color_palette.count}-color palette, ${style.color_palette.dominant_colors.join(" and ")} dominant colors`;
    
    // Composition enforcement
    const composition = "single comic panel with 8-pixel border frame, centered composition, clear foreground and background separation";
    
    // Build unified positive prompt
    const positivePrompt = [
      baseStyle,
      mandatoryTags,
      sceneElements,
      atmosphereElements,
      themeTags,
      composition,
      colorPalette,
      qualityTags,
      options.visual_hint || "",
      options.style_override || ""
    ].filter(Boolean).join(", ");

    // Build comprehensive negative prompt
    const negativePrompt = [
      ...style.visual_themes.exclusion_tags,
      "multiple panels", "text bubbles", "speech", "words", "letters",
      "blurry", "low quality", "poor composition", "modern UI",
      "realistic", "photography", "film", "CGI"
    ].join(", ");

    // Get model configuration
    const modelConfig = this.getModelConfigForCorruption(corruptionLevel);

    return {
      positive: positivePrompt,
      negative: negativePrompt,
      model_config: modelConfig,
      generation_params: {
        width: style.resolution === '768x768' ? 768 : 512,
        height: style.resolution === '768x768' ? 768 : 512,
        steps: options.quality_boost ? 35 : 30,
        cfg_scale: 8.0,
        sampler_name: "DPM++ 2M Karras"
      }
    };
  }

  private inferCorruptionLevel(content: ContentExtraction): CorruptionLevel {
    // Use the assessed corruption level from content extraction
    switch (content.emotional_cues.corruption_level) {
      case 'forbidden': return 'forbidden_fragment';
      case 'severe': return 'glitched_ominous';
      case 'mild': return 'flickering';
      default: return 'pristine';
    }
  }

  private buildSceneDescription(content: ContentExtraction): string {
    const elements = [];
    
    // Add character elements
    if (content.entities.characters.length > 0) {
      elements.push(`featuring ${content.entities.characters.slice(0, 2).join(" and ")}`);
    }
    
    // Add location elements
    if (content.entities.locations.length > 0) {
      elements.push(`in a ${content.entities.locations[0]} setting`);
    }
    
    // Add mood and atmosphere
    if (content.scene_descriptors.mood !== "neutral") {
      elements.push(`${content.scene_descriptors.mood} atmosphere`);
    }
    
    // Add time of day
    if (content.scene_descriptors.time_of_day !== "eternal twilight") {
      elements.push(`during ${content.scene_descriptors.time_of_day}`);
    }
    
    return elements.join(", ");
  }

  private buildAtmosphereDescription(corruptionLevel: CorruptionLevel, content: ContentExtraction): string {
    const corruptionDNA = this.CORRUPTION_VISUAL_DNA[corruptionLevel];
    const elements = [corruptionDNA.atmosphere];
    
    // Add effects
    elements.push(...corruptionDNA.effects.slice(0, 2));
    
    // Add weather effects if present
    if (content.scene_descriptors.weather_effects.length > 0) {
      elements.push(...content.scene_descriptors.weather_effects.slice(0, 1));
    }
    
    return elements.join(", ");
  }

  private getModelConfigForCorruption(corruptionLevel: CorruptionLevel) {
    const configs = {
      pristine: {
        modelName: 'oracle-pristine.safetensors',
        stylePrefix: 'divine oracle vision, sacred light, ethereal glow, pristine clarity,',
        styleSuffix: ', divine comics art, sacred geometry, heavenly light',
        negativePrompt: 'dark, evil, corrupted, glitch, horror, nsfw, low quality, blurry'
      },
      cryptic: {
        modelName: 'oracle-cryptic.safetensors', 
        stylePrefix: 'mystical oracle vision, arcane symbols, mysterious energy, occult imagery,',
        styleSuffix: ', dark mystical comics, ancient wisdom, shadowy depths',
        negativePrompt: 'bright, cheerful, modern, nsfw, low quality, blurry'
      },
      flickering: {
        modelName: 'oracle-glitched.safetensors',
        stylePrefix: 'unstable digital oracle, flickering data streams, technological mysticism, cyber-spiritual,',
        styleSuffix: ', cyberpunk comics, digital mysticism, tech-spiritual fusion',
        negativePrompt: 'stable, clean, perfect, nsfw, low quality, blurry'
      },
      glitched_ominous: {
        modelName: 'oracle-glitched.safetensors',
        stylePrefix: 'corrupted digital oracle, system failure warnings, ominous data corruption, cyber-horror,',
        styleSuffix: ', dark cyberpunk comics, digital horror, technological nightmare',
        negativePrompt: 'clean, bright, happy, nsfw, low quality, blurry'
      },
      forbidden_fragment: {
        modelName: 'oracle-forbidden.safetensors',
        stylePrefix: 'forbidden oracle knowledge, reality-breaking visions, cosmic horror truth, eldritch revelation,',
        styleSuffix: ', cosmic horror comics, forbidden knowledge, reality distortion',
        negativePrompt: 'safe, normal, mundane, nsfw, low quality, blurry'
      }
    };

    return configs[corruptionLevel] || configs.pristine;
  }

  // Utility method for external validation
  validatePrompt(prompt: UnifiedPrompt): boolean {
    const hasBaseStyle = prompt.positive.includes("64-bit pixel art");
    const hasComicFrame = prompt.positive.includes("comic panel");
    const hasColorConstraints = prompt.positive.includes("limited") && prompt.positive.includes("color");
    const hasNegatives = prompt.negative.includes("photorealistic");
    
    return hasBaseStyle && hasComicFrame && hasColorConstraints && hasNegatives;
  }
}

// Export singleton instance
export const chodePromptGenerator = new CHODEPromptGenerator(); 