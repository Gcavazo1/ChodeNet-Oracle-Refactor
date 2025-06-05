/**
 * 🚀 Direct API Integration Service
 * Simple, reliable API calls without third-party orchestration
 */

interface ProphecyImageRequest {
  prophecy_text: string;
  visual_style: 'cyberpunk_pixel_art' | 'mystical_oracle' | 'corrupted_realm';
  corruption_level: number;
  additional_context?: string;
}

interface GeneratedProphecyAsset {
  prophecy_id: string;
  prophecy_text: string;
  visual_themes: string[];
  generated_image_url: string;
  metadata: {
    style: string;
    corruption_level: number;
    generation_timestamp: string;
    generation_time: number;
    image_provider: string;
  };
}

type ImageProvider = 'kie_ai' | 'dalle' | 'midjourney';

/**
 * 🎨 PROPHECY VISUAL POST-PROCESSING PIPELINE
 * Converts abstract Oracle prophecies into consistent pixel art prompts
 */

interface ProphecyAnalysis {
  primary_themes: string[];
  emotional_tone: 'mystical' | 'corrupted' | 'ominous' | 'transcendent' | 'chaotic';
  corruption_influence: number;
  visual_elements: string[];
  color_palette: string[];
  style_modifiers: string[];
}

interface VisualPromptComponents {
  base_scene: string;
  character_elements: string[];
  environmental_details: string[];
  effects_and_atmosphere: string[];
  color_scheme: string;
  corruption_overlay?: string;
}

export class ProphecyVisualProcessor {
  private generateImageMethod: (prompt: string, style: string) => Promise<string>;
  private imageProvider: string;
  
  constructor(generateImageMethod: (prompt: string, style: string) => Promise<string>, imageProvider: string) {
    this.generateImageMethod = generateImageMethod;
    this.imageProvider = imageProvider;
  }
  
  // === THEME EXTRACTION MAPPINGS ===
  
  private themeKeywords = {
    // Power & Ascension
    power: ['power', 'ascend', 'transcend', 'evolve', 'grow', 'expand', 'mighty', 'strength'],
    girth: ['girth', 'size', 'expansion', 'swelling', 'enlargement', 'magnitude'],
    tapping: ['tap', 'click', 'strike', 'rhythm', 'pulse', 'beat', 'tempo'],
    
    // Mystical & Oracle
    mystical: ['oracle', 'divine', 'cosmic', 'ethereal', 'sacred', 'ancient', 'wisdom'],
    prophecy: ['prophecy', 'vision', 'foresee', 'foretell', 'reveal', 'manifest'],
    digital: ['digital', 'data', 'code', 'matrix', 'cyber', 'virtual', 'algorithm'],
    
    // Corruption & Chaos
    corruption: ['corruption', 'glitch', 'error', 'chaos', 'disorder', 'taint'],
    forbidden: ['forbidden', 'classified', 'hidden', 'secret', 'restricted'],
    darkness: ['shadow', 'darkness', 'void', 'abyss', 'deep', 'black'],
    
    // Elements & Environment
    light: ['light', 'glow', 'shine', 'radiant', 'bright', 'illumination'],
    energy: ['energy', 'surge', 'wave', 'flow', 'current', 'force'],
    realm: ['realm', 'dimension', 'world', 'universe', 'plane', 'domain']
  };

  private corruptionVisualMods = {
    pristine: {
      colors: ['cyan', 'blue', 'white', 'silver'],
      effects: ['clean lines', 'smooth gradients', 'pristine pixels'],
      atmosphere: 'serene digital clarity'
    },
    cryptic: {
      colors: ['purple', 'violet', 'deep blue', 'gold'],
      effects: ['ancient runes', 'mystical symbols', 'ethereal glow'],
      atmosphere: 'ancient mystical wisdom'
    },
    flickering: {
      colors: ['orange', 'yellow', 'amber', 'red'],
      effects: ['scan lines', 'digital noise', 'unstable pixels'],
      atmosphere: 'unstable connection'
    },
    glitched_ominous: {
      colors: ['red', 'magenta', 'dark purple', 'black'],
      effects: ['pixel corruption', 'data tears', 'chromatic aberration'],
      atmosphere: 'ominous digital decay'
    },
    forbidden_fragment: {
      colors: ['rainbow static', 'impossible colors', 'shifting hues'],
      effects: ['reality breaks', 'forbidden geometry', 'impossible pixels'],
      atmosphere: 'classified reality breach'
    }
  };

  // === MAIN PROCESSING PIPELINE ===
  
  async processScrollForVisuals(
    prophecyText: string, 
    corruptionLevel: string = 'pristine',
    additionalContext?: string
  ): Promise<VisualPromptComponents> {
    
    console.log('🎨 Processing scroll for visuals:', { prophecyText, corruptionLevel });
    
    // Step 1: Analyze the prophecy content
    const analysis = this.analyzeTextContent(prophecyText, corruptionLevel);
    
    // Step 2: Extract visual themes
    const visualElements = this.extractVisualElements(analysis);
    
    // Step 3: Apply corruption-specific styling
    const styledElements = this.applyCorruptionStyling(visualElements, corruptionLevel);
    
    // Step 4: Construct final prompt components
    const promptComponents = this.buildPromptComponents(styledElements, analysis);
    
    console.log('🎨 Generated visual components:', promptComponents);
    return promptComponents;
  }

  private analyzeTextContent(text: string, corruptionLevel: string): ProphecyAnalysis {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    // Extract themes based on keyword matching
    const themes = [];
    for (const [theme, keywords] of Object.entries(this.themeKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        themes.push(theme);
      }
    }
    
    // Determine emotional tone
    let tone: ProphecyAnalysis['emotional_tone'] = 'mystical';
    if (corruptionLevel === 'forbidden_fragment') tone = 'chaotic';
    else if (corruptionLevel === 'glitched_ominous') tone = 'ominous';
    else if (corruptionLevel === 'flickering') tone = 'corrupted';
    else if (themes.includes('power') || themes.includes('mystical')) tone = 'transcendent';
    
    // Extract corruption influence
    const corruptionInfluence = this.calculateCorruptionInfluence(corruptionLevel, themes);
    
    return {
      primary_themes: themes.slice(0, 4), // Top 4 themes
      emotional_tone: tone,
      corruption_influence: corruptionInfluence,
      visual_elements: [],
      color_palette: [],
      style_modifiers: []
    };
  }

  private calculateCorruptionInfluence(level: string, themes: string[]): number {
    const baseCorruption = {
      pristine: 0,
      cryptic: 25,
      flickering: 50,
      glitched_ominous: 75,
      forbidden_fragment: 100
    }[level] || 0;
    
    // Adjust based on themes
    let adjustment = 0;
    if (themes.includes('corruption')) adjustment += 10;
    if (themes.includes('forbidden')) adjustment += 15;
    if (themes.includes('power')) adjustment += 5;
    
    return Math.min(100, baseCorruption + adjustment);
  }

  private extractVisualElements(analysis: ProphecyAnalysis): string[] {
    const elements = [];
    
    // Map themes to visual elements
    const themeVisuals = {
      power: ['energy aura', 'glowing core', 'power emanation'],
      girth: ['expanding form', 'growing essence', 'size manifestation'],
      tapping: ['rhythmic patterns', 'pulse waves', 'beat visualization'],
      mystical: ['floating crystals', 'mystical orbs', 'ethereal energy'],
      prophecy: ['vision swirls', 'future fragments', 'time streams'],
      digital: ['code matrices', 'data streams', 'pixel formations'],
      corruption: ['glitch artifacts', 'error patterns', 'data corruption'],
      forbidden: ['classified symbols', 'redacted zones', 'hidden truth'],
      darkness: ['shadow tendrils', 'void portals', 'dark energy'],
      light: ['radiant beams', 'illumination', 'light particles'],
      energy: ['power flows', 'energy cascades', 'force fields'],
      realm: ['dimensional rifts', 'reality layers', 'plane boundaries']
    };
    
    analysis.primary_themes.forEach(theme => {
      if (themeVisuals[theme]) {
        elements.push(...themeVisuals[theme]);
      }
    });
    
    return elements;
  }

  private applyCorruptionStyling(elements: string[], corruptionLevel: string): VisualPromptComponents {
    const corruptionMods = this.corruptionVisualMods[corruptionLevel] || this.corruptionVisualMods.pristine;
    
    return {
      base_scene: this.generateBaseScene(corruptionLevel),
      character_elements: this.selectCharacterElements(elements, corruptionLevel),
      environmental_details: this.generateEnvironmentalDetails(corruptionLevel),
      effects_and_atmosphere: corruptionMods.effects,
      color_scheme: corruptionMods.colors.join(', '),
      corruption_overlay: corruptionLevel !== 'pristine' ? corruptionMods.atmosphere : undefined
    };
  }

  private generateBaseScene(corruptionLevel: string): string {
    const baseScenes = {
      pristine: 'serene digital sanctuary with crystalline structures',
      cryptic: 'ancient digital temple with mystical hieroglyphs',
      flickering: 'unstable cyber realm with fluctuating reality',
      glitched_ominous: 'corrupted digital wasteland with data decay',
      forbidden_fragment: 'impossible geometric space beyond reality'
    };
    
    return baseScenes[corruptionLevel] || baseScenes.pristine;
  }

  private selectCharacterElements(elements: string[], corruptionLevel: string): string[] {
    // Select most relevant elements based on corruption
    const maxElements = corruptionLevel === 'forbidden_fragment' ? 5 : 3;
    return elements.slice(0, maxElements);
  }

  private generateEnvironmentalDetails(corruptionLevel: string): string[] {
    const environments = {
      pristine: ['floating data cubes', 'clean geometric patterns', 'pristine pixel art'],
      cryptic: ['ancient digital runes', 'mystical code fragments', 'ethereal data streams'],
      flickering: ['unstable pixel formations', 'glitching scan lines', 'fluctuating data'],
      glitched_ominous: ['corrupted data clusters', 'error cascades', 'broken pixel arrays'],
      forbidden_fragment: ['impossible geometries', 'reality tears', 'classified visual static']
    };
    
    return environments[corruptionLevel] || environments.pristine;
  }

  private buildPromptComponents(styled: VisualPromptComponents, analysis: ProphecyAnalysis): VisualPromptComponents {
    // Final assembly with consistent pixel art styling
    const pixelArtBase = 'detailed pixel art, 16-bit style, sharp pixels, retro game aesthetic';
    const cyberpunkCore = 'cyberpunk oracle, futuristic mystical';
    
    return {
      ...styled,
      base_scene: `${pixelArtBase}, ${cyberpunkCore}, ${styled.base_scene}`,
      effects_and_atmosphere: [
        ...styled.effects_and_atmosphere,
        'pixel perfect',
        'retro gaming style',
        'cyberpunk aesthetics'
      ]
    };
  }

  // === PUBLIC INTERFACE METHODS ===
  
  generateOptimalPrompt(components: VisualPromptComponents): string {
    const parts = [
      components.base_scene,
      ...components.character_elements,
      ...components.environmental_details.slice(0, 2), // Limit environmental details
      `color palette: ${components.color_scheme}`,
      ...components.effects_and_atmosphere.slice(0, 3), // Limit effects
    ];
    
    if (components.corruption_overlay) {
      parts.push(`atmosphere: ${components.corruption_overlay}`);
    }
    
    const prompt = parts.join(', ');
    console.log('🎨 Generated optimal prompt:', prompt);
    return prompt;
  }

  // Enhanced version of the existing generateProphecyVisuals method
  async generateScrollVisuals(
    prophecyText: string,
    corruptionLevel: string = 'pristine',
    additionalContext?: string
  ): Promise<GeneratedProphecyAsset | null> {
    console.log('🎨 Generating scroll visuals with post-processing:', { prophecyText, corruptionLevel });
    const startTime = Date.now();

    try {
      // Step 1: Process scroll content through visual pipeline
      const visualComponents = await this.processScrollForVisuals(
        prophecyText, 
        corruptionLevel, 
        additionalContext
      );
      
      // Step 2: Generate optimal prompt
      const optimizedPrompt = this.generateOptimalPrompt(visualComponents);
      
      // Step 3: Generate image with optimized prompt
      const imageUrl = await this.generateImageMethod(optimizedPrompt, 'cyberpunk_pixel_art');

      if (imageUrl) {
        const endTime = Date.now();
        
        return {
          prophecy_id: `scroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          prophecy_text: prophecyText,
          visual_themes: visualComponents.character_elements,
          generated_image_url: imageUrl,
          metadata: {
            style: 'cyberpunk_pixel_art',
            corruption_level: this.calculateCorruptionInfluence(corruptionLevel, []),
            generation_timestamp: new Date().toISOString(),
            generation_time: endTime - startTime,
            image_provider: this.imageProvider,
            processing_pipeline: 'scroll_visual_processor_v1',
            visual_components: visualComponents
          }
        };
      }

      return null;
    } catch (error) {
      console.error('🔮 Error in generateScrollVisuals:', error);
      return null;
    }
  }
}

export class DirectAPIIntegration {
  private groqApiKey: string;
  private kieAiApiKey: string;
  private dalleApiKey: string;
  private elevenlabsApiKey: string;
  private imageProvider: ImageProvider;
  private visualProcessor: ProphecyVisualProcessor; // New processor

  constructor() {
    // Direct API keys (much simpler!)
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.kieAiApiKey = import.meta.env.VITE_KIE_AI_API_KEY || '';
    this.dalleApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.imageProvider = (import.meta.env.VITE_IMAGE_GENERATION_PROVIDER as ImageProvider) || 'kie_ai';
    
    // Initialize the visual processor
    this.visualProcessor = new ProphecyVisualProcessor(this.generateImage.bind(this), this.imageProvider);
  }

  // === GROQ AI TEXT GENERATION ===
  
  async generateWithGroq(messages: any[], maxTokens: number = 200): Promise<string> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('🤖 Groq API error:', error);
      throw error;
    }
  }

  // === KIE AI IMAGE GENERATION ===
  
  async generateImageWithKieAI(prompt: string, style: string): Promise<string> {
    if (!this.kieAiApiKey) {
      throw new Error('Kie AI API key not configured');
    }

    try {
      const response = await fetch('https://api.kieai.com/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.kieAiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          width: 512,
          height: 512,
          num_images: 1,
          guidance_scale: 7.5,
          num_inference_steps: 20
        })
      });

      if (!response.ok) {
        throw new Error(`Kie AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.images?.[0]?.url || data.image_url || '';
    } catch (error) {
      console.error('🎨 Kie AI API error:', error);
      throw error;
    }
  }

  // === DALL-E IMAGE GENERATION ===
  
  async generateImageWithDALLE(prompt: string): Promise<string> {
    if (!this.dalleApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dalleApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '512x512',
          quality: 'standard'
        })
      });

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.[0]?.url || '';
    } catch (error) {
      console.error('🎨 DALL-E API error:', error);
      throw error;
    }
  }

  // === ELEVENLABS TEXT-TO-SPEECH ===
  
  async generateSpeechWithElevenLabs(text: string, voiceId: string = 'ErXwobaYiN019PkySvjV'): Promise<string> {
    if (!this.elevenlabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenlabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Convert response to blob URL for audio playback
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('🔊 ElevenLabs API error:', error);
      throw error;
    }
  }

  // === UNIFIED IMAGE GENERATION ===
  
  async generateImage(prompt: string, style: string): Promise<string> {
    switch (this.imageProvider) {
      case 'kie_ai':
        return await this.generateImageWithKieAI(prompt, style);
      case 'dalle':
        return await this.generateImageWithDALLE(prompt);
      default:
        throw new Error(`Unsupported image provider: ${this.imageProvider}`);
    }
  }

  // === PROPHECY GENERATION PIPELINE ===
  
  async generateProphecyVisuals(request: ProphecyImageRequest): Promise<GeneratedProphecyAsset | null> {
    console.log('🎨 Generating prophecy visuals with direct APIs:', request);
    const startTime = Date.now();

    try {
      // Step 1: Extract visual themes with Groq
      console.log('🤖 Step 1: Extracting visual themes with Groq...');
      const themesPrompt = [
        {
          role: 'system',
          content: `You are a visual theme extractor for cyberpunk Oracle prophecies. 
                   Extract 3-5 key visual elements that would make compelling pixel art.
                   Focus on: cyberpunk aesthetics, mystical elements, corruption level: ${request.corruption_level}%
                   Return ONLY a JSON array of theme strings, no other text.`
        },
        {
          role: 'user',
          content: request.prophecy_text
        }
      ];

      const themesResponse = await this.generateWithGroq(themesPrompt, 200);
      
      let visualThemes: string[] = [];
      try {
        visualThemes = JSON.parse(themesResponse);
      } catch (e) {
        console.warn('🔮 Failed to parse visual themes, using fallback');
        visualThemes = ['cyberpunk', 'mystical', 'oracle', 'corruption'];
      }

      // Step 2: Generate image
      console.log(`🎨 Step 2: Generating image with ${this.imageProvider}...`);
      const imagePrompt = `Cyberpunk Oracle prophecy pixel art: ${request.prophecy_text}. Style: ${request.visual_style}, corruption level: ${request.corruption_level}%, mystical cyberpunk aesthetic, 512x512`;
      
      const imageUrl = await this.generateImage(imagePrompt, request.visual_style);

      if (imageUrl) {
        const endTime = Date.now();
        
        return {
          prophecy_id: `prophecy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          prophecy_text: request.prophecy_text,
          visual_themes: visualThemes,
          generated_image_url: imageUrl,
          metadata: {
            style: request.visual_style,
            corruption_level: request.corruption_level,
            generation_timestamp: new Date().toISOString(),
            generation_time: endTime - startTime,
            image_provider: this.imageProvider
          }
        };
      }

      return null;
    } catch (error) {
      console.error('🔮 Error in generateProphecyVisuals:', error);
      return null;
    }
  }

  // === CONNECTION TESTING ===
  
  async testConnections(): Promise<{
    groq: boolean;
    imageProvider: boolean;
    elevenlabs: boolean;
    errors: string[];
  }> {
    const results = {
      groq: false,
      imageProvider: false,
      elevenlabs: false,
      errors: [] as string[]
    };

    // Test Groq
    try {
      if (this.groqApiKey) {
        await this.generateWithGroq([
          { role: 'user', content: 'Hello' }
        ], 10);
        results.groq = true;
        console.log('✅ Groq connection successful');
      } else {
        results.errors.push('Groq API key not configured');
      }
    } catch (error) {
      results.errors.push(`Groq error: ${error}`);
      console.error('❌ Groq connection failed:', error);
    }

    // Test Image Provider
    try {
      if (this.imageProvider === 'kie_ai' && this.kieAiApiKey) {
        // We'll skip actual image generation for connection test
        results.imageProvider = true;
        console.log('✅ Kie AI configured');
      } else if (this.imageProvider === 'dalle' && this.dalleApiKey) {
        results.imageProvider = true;
        console.log('✅ DALL-E configured');
      } else {
        results.errors.push(`${this.imageProvider} API key not configured`);
      }
    } catch (error) {
      results.errors.push(`${this.imageProvider} error: ${error}`);
    }

    // Test ElevenLabs
    try {
      if (this.elevenlabsApiKey) {
        results.elevenlabs = true;
        console.log('✅ ElevenLabs configured');
      } else {
        results.errors.push('ElevenLabs API key not configured');
      }
    } catch (error) {
      results.errors.push(`ElevenLabs error: ${error}`);
    }

    return results;
  }

  // === UTILITY METHODS ===
  
  getConnectionStatus(): Record<string, boolean> {
    return {
      groq: !!this.groqApiKey,
      kie_ai: !!this.kieAiApiKey && this.imageProvider === 'kie_ai',
      dalle: !!this.dalleApiKey && this.imageProvider === 'dalle',
      elevenlabs: !!this.elevenlabsApiKey
    };
  }

  getImageProvider(): ImageProvider {
    return this.imageProvider;
  }

  setImageProvider(provider: ImageProvider): void {
    this.imageProvider = provider;
    console.log(`🔮 Image provider changed to: ${provider}`);
  }

  // New method for processing scrolls specifically
  async generateScrollVisualsWithProcessing(
    prophecyText: string,
    corruptionLevel: string = 'pristine',
    additionalContext?: string
  ): Promise<GeneratedProphecyAsset | null> {
    return await this.visualProcessor.generateScrollVisuals(
      prophecyText, 
      corruptionLevel, 
      additionalContext
    );
  }
}

// Export singleton instance
export const directAPI = new DirectAPIIntegration(); 