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

type ImageProvider = 'kie_ai' | 'local_sd';

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
  
  constructor(generateImageMethod: (prompt: string, style: string) => Promise<string>) {
    this.generateImageMethod = generateImageMethod;
  }
  
  // === THEME EXTRACTION MAPPINGS ===
  
  private themeKeywords: Record<string, string[]> = {
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

  private corruptionVisualMods: Record<string, {colors: string[], effects: string[], atmosphere: string}> = {
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
    const promptComponents = this.buildPromptComponents(styledElements);
    
    console.log('🎨 Generated visual components:', promptComponents);
    return promptComponents;
  }

  private analyzeTextContent(text: string, corruptionLevel: string): ProphecyAnalysis {
    const lowerText = text.toLowerCase();
    
    // Extract themes based on keyword matching
    const themes: string[] = [];
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
    const baseCorruption: Record<string, number> = {
      pristine: 0,
      cryptic: 25,
      flickering: 50,
      glitched_ominous: 75,
      forbidden_fragment: 100
    };
    
    // Adjust based on themes
    let adjustment = 0;
    if (themes.includes('corruption')) adjustment += 10;
    if (themes.includes('forbidden')) adjustment += 15;
    if (themes.includes('power')) adjustment += 5;
    
    return Math.min(100, (baseCorruption[level] || 0) + adjustment);
  }

  private extractVisualElements(analysis: ProphecyAnalysis): string[] {
    const elements: string[] = [];
    
    // Map themes to visual elements
    const themeVisuals: Record<string, string[]> = {
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
      const visualsForTheme = themeVisuals[theme];
      if (visualsForTheme) {
        elements.push(...visualsForTheme);
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
    const baseScenes: Record<string, string> = {
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
    const environments: Record<string, string[]> = {
      pristine: ['floating data cubes', 'clean geometric patterns', 'pristine pixel art'],
      cryptic: ['ancient digital runes', 'mystical code fragments', 'ethereal data streams'],
      flickering: ['unstable pixel formations', 'glitching scan lines', 'fluctuating data'],
      glitched_ominous: ['corrupted data clusters', 'error cascades', 'broken pixel arrays'],
      forbidden_fragment: ['impossible geometries', 'reality tears', 'classified visual static']
    };
    
    return environments[corruptionLevel] || environments.pristine;
  }

  private buildPromptComponents(styled: VisualPromptComponents): VisualPromptComponents {
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
            image_provider: 'kie_ai',
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
  private elevenlabsApiKey: string;
  private imageProvider: ImageProvider;
  private visualProcessor: ProphecyVisualProcessor;
  
  // NEW: Local Stable Diffusion settings
  private localSDUrl: string;
  private useLocalSD: boolean;

  constructor() {
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.kieAiApiKey = import.meta.env.VITE_KIE_AI_API_KEY || '';
    this.elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    
    // Use the proxy path for local SD
    this.localSDUrl = '/sdapi'; 
    this.useLocalSD = import.meta.env.VITE_USE_LOCAL_SD === 'true';
    
    this.imageProvider = this.determineImageProvider();
    this.visualProcessor = new ProphecyVisualProcessor(this.generateImage.bind(this));
  }

  // === GROQ AI TEXT GENERATION ===
  
  async generateWithGroq(messages: {role: string, content: string}[], maxTokens: number = 200): Promise<string> {
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
  
  async generateImageWithKieAI(prompt: string, _style: string): Promise<string> {
    // Style parameter is unused but kept for API consistency
    if (!this.kieAiApiKey) {
      console.error('🎨 Kie AI API key is missing.');
      throw new Error('Kie AI API key is not configured.');
    }

    const generateUrl = 'https://kieai.erweima.ai/api/v1/gpt4o-image/generate';
    const recordInfoUrl = 'https://kieai.erweima.ai/api/v1/gpt4o-image/record-info';

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.kieAiApiKey}`
    };

    const generateBody = {
      prompt: prompt,
      size: "1:1"
    };

    try {
      // Step 1: Start generation and get taskId
      console.log(`🎨 Sending generation request to Kie AI:`, { url: generateUrl, prompt });
      const generateResponse = await fetch(generateUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(generateBody)
      });

      if (!generateResponse.ok) {
        throw new Error(`Kie AI generation request failed: ${generateResponse.status}`);
      }
      const generateData = await generateResponse.json();
      const taskId = generateData.data?.taskId;
      if (!taskId) {
        throw new Error('Kie AI did not return a taskId.');
      }
      console.log(`🎨 Kie AI task started with taskId: ${taskId}`);

      // Step 2: Poll for the result
      const maxRetries = 20; // Poll for up to 20 * 3s = 60 seconds
      const retryDelay = 3000; // 3 seconds

      for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));

        console.log(`🎨 Polling Kie AI for task ${taskId}, attempt ${i + 1}/${maxRetries}`);
        const recordInfoResponse = await fetch(`${recordInfoUrl}?taskId=${taskId}`, {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.kieAiApiKey}`
          }
        });
        
        if (!recordInfoResponse.ok) {
            console.warn(`🎨 Polling failed with status ${recordInfoResponse.status}`);
            continue; // Maybe a transient error, continue polling
        }

        const recordInfoData = await recordInfoResponse.json();
        const status = recordInfoData.data?.status;

        if (status === 'SUCCESS') {
          const imageUrl = recordInfoData.data?.response?.resultUrls?.[0];
          if (imageUrl) {
            console.log('🎨 Image generated with Kie AI:', imageUrl);
            return imageUrl;
          } else {
            throw new Error('Kie AI task succeeded but no image URL was found.');
          }
        } else if (status === 'GENERATE_FAILED' || status === 'CREATE_TASK_FAILED') {
          throw new Error(`Kie AI task failed with status: ${status}. Error: ${recordInfoData.data?.errorMessage}`);
        }
        // If status is 'GENERATING', the loop will continue
      }

      throw new Error('Kie AI task timed out after 60 seconds.');

    } catch (error) {
      console.error('🎨 Kie AI API error:', error);
      throw error;
    }
  }

  // === IMAGE GENERATION NOTE ===
  // DALL-E removed - using Kie AI and Local Stable Diffusion instead
  // All image generation now goes through Kie AI or Local SD based on configuration

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
    console.log('🎨 Generating image with provider:', this.imageProvider);
    
    if (this.useLocalSD) {
      return await this.generateImageWithLocalSD(prompt, style);
    }
    
    switch (this.imageProvider) {
      case 'kie_ai':
        return await this.generateImageWithKieAI(prompt, style);
      // DALL-E support removed - using Kie AI and Local SD only
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
      } catch (_e) {
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
      if (this.useLocalSD) {
        // Test local Stable Diffusion
        results.imageProvider = await this.testLocalSDConnection();
        if (results.imageProvider) {
          console.log('✅ Local Stable Diffusion connected');
        } else {
          results.errors.push('Local Stable Diffusion not accessible at ' + this.localSDUrl);
        }
      } else if (this.imageProvider === 'kie_ai' && this.kieAiApiKey) {
        // We'll skip actual image generation for connection test
        results.imageProvider = true;
        console.log('✅ Kie AI configured');
      // DALL-E support removed
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
      kie_ai: !!this.kieAiApiKey,
      elevenlabs: !!this.elevenlabsApiKey,
      local_sd: this.useLocalSD
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

  /**
   * NEW: Generate image using local AUTOMATIC1111 WebUI
   */
  async generateImageWithLocalSD(prompt: string, corruptionLevel: string = 'pristine'): Promise<string> {
    const startTime = performance.now();
    console.log(`🔮🎨 Generating image with Local SD for corruption: ${corruptionLevel}`);
    
    // Use a relative path so the Vite proxy catches it
    const url = `/sdapi/v1/txt2img`;

    const modelConfig = this.getModelConfigForCorruption(corruptionLevel);
    const payload = {
      prompt: `${modelConfig.stylePrefix} ${prompt} ${modelConfig.styleSuffix}`,
      negative_prompt: modelConfig.negativePrompt,
      steps: 25,
      cfg_scale: 7.5,
      width: 512,
      height: 512,
      sampler_name: "DPM++ 2M Karras",
      seed: -1,
      override_settings: {
        sd_model_checkpoint: modelConfig.modelName
      }
    };

    console.log('🔮🚀 Sending request to Local SD WebUI...');
    console.log(`🔮📦 Full Payload:`, JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
  
      console.log(`🔮📨 SD WebUI Response Status: ${response.status} ${response.statusText}`);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔮❌ SD WebUI API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          responseBody: errorText
        });
        throw new Error(`Local SD API error: ${response.status} ${response.statusText}`);
      }
  
      console.log('🔮📦 Parsing response JSON...');
      const result = await response.json();
      
      if (!result.images || result.images.length === 0) {
        console.error('🔮❌ No images in response:', result);
        throw new Error('No images generated by local Stable Diffusion');
      }
  
      console.log(`🔮🎉 Generated ${result.images.length} image(s) successfully!`);
      
      // Convert base64 to blob URL for display
      console.log('🔮🔄 Converting base64 to blob URL...');
      const base64Image = result.images[0];
      console.log(`🔮📏 Base64 length: ${base64Image.length} characters`);
      
      const imageBlob = this.base64ToBlob(base64Image, 'image/png');
      console.log(`🔮💾 Blob size: ${(imageBlob.size / 1024).toFixed(1)} KB`);
      
      const imageUrl = URL.createObjectURL(imageBlob);
  
      const endTime = performance.now();
      const generationTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`🔮⏱️ Total Generation Time: ${generationTime}s`);
      console.log(`🔮🖼️ Image URL Created: ${imageUrl.substring(0, 50)}...`);
      console.log('🔮🎨 === ORACLE LOCAL SD GENERATION COMPLETE ===');
  
      return imageUrl;
    } catch(err) {
      const endTime = performance.now();
      const generationTime = ((endTime - startTime) / 1000).toFixed(2);
      console.error('🔮💥 === LOCAL SD GENERATION FAILED ===');
      console.error(`🔮⏱️ Failed after: ${generationTime}s`);
      console.error('🔮❌ Error Details:', err);
      console.error('🔮🔧 Troubleshooting Checklist:');
      console.error('  1. ✅ Check if SD WebUI is running: http://127.0.0.1:7860');
      console.error('  2. ✅ Verify --api flag in webui-user.bat: --api --listen --port 7860');
      console.error('  3. ✅ Check Windows Firewall isn\'t blocking port 7860');
      console.error('  4. ✅ Ensure model files exist in G:\\stable-diffusion-webui-directml\\models\\Stable-diffusion\\');
      console.error('  5. ✅ Verify Oracle models are properly named and accessible');
      console.error('🔮💥 === END ERROR REPORT ===');
      throw err;
    }
  }

  /**
   * Get model configuration based on corruption level
   */
  private getModelConfigForCorruption(corruptionLevel: string) {
    const configs = {
      pristine: {
        modelName: 'oracle-pristine.safetensors',
        stylePrefix: 'mystical oracle vision, divine light, ethereal glow, sacred geometry,',
        styleSuffix: ', masterpiece, best quality, highly detailed, magical realism',
        negativePrompt: 'dark, evil, corrupted, glitch, horror, nsfw, low quality, blurry'
      },
      cryptic: {
        modelName: 'oracle-cryptic.safetensors', 
        stylePrefix: 'dark mystical vision, ancient symbols, mysterious shadows, occult imagery,',
        styleSuffix: ', dark fantasy, detailed, atmospheric, moody lighting',
        negativePrompt: 'bright, cheerful, modern, nsfw, low quality, blurry'
      },
      flickering: {
        modelName: 'oracle-glitched.safetensors',
        stylePrefix: 'unstable digital vision, flickering reality, data corruption, glitch art,',
        styleSuffix: ', cyberpunk, digital art, neon, technological, detailed',
        negativePrompt: 'stable, clean, perfect, nsfw, low quality, blurry'
      },
      glitched_ominous: {
        modelName: 'oracle-glitched.safetensors',
        stylePrefix: 'corrupted digital nightmare, glitch horror, data decay, system failure,',
        styleSuffix: ', dark cyberpunk, horror, detailed, ominous atmosphere',
        negativePrompt: 'clean, bright, happy, nsfw, low quality, blurry'
      },
      forbidden_fragment: {
        modelName: 'oracle-forbidden.safetensors',
        stylePrefix: 'eldritch horror vision, cosmic terror, forbidden knowledge, reality breakdown,',
        styleSuffix: ', lovecraftian, horror art, detailed, nightmarish, dark atmosphere',
        negativePrompt: 'safe, normal, mundane, nsfw, low quality, blurry'
      }
    };

    return configs[corruptionLevel as keyof typeof configs] || configs.pristine;
  }

  /**
   * Convert base64 to blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Test local Stable Diffusion connection
   */
  async testLocalSDConnection(): Promise<boolean> {
    console.log('🔮🧪 === [PROXY] TESTING LOCAL SD CONNECTION ===');
    // Use a relative path so the Vite proxy catches it
    const url = `/sdapi/v1/options`;
    console.log(`🔮📡 [PROXY ACTIVE] Testing relative URL for Vite proxy: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`🔮📨 Connection test response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const options = await response.json();
        console.log('🔮✅ Local SD is ONLINE and responding!');
        console.log('🔮⚙️ Available samplers:', options.samplers?.length || 'unknown');
        
        // Test model availability
        try {
          const modelsResponse = await fetch(`/sdapi/v1/sd-models`);
          if (modelsResponse.ok) {
            const models = await modelsResponse.json();
            console.log(`🔮🎭 Available models: ${models.length}`);
            
            // Check for Oracle models
            const oracleModels = models.filter((m: {model_name?: string, title?: string}) => 
              (m.model_name && m.model_name.includes('oracle-')) || 
              (m.title && m.title.includes('oracle-'))
            );
            console.log(`🔮🎯 Oracle models found: ${oracleModels.length}`);
            oracleModels.forEach((m: {model_name?: string, title?: string}) => 
              console.log(`  - ${m.title || m.model_name}`)
            );
          }
        } catch (modelError) {
          console.warn('🔮⚠️ Could not check models:', modelError);
        }
        
        return true;
      } else {
        console.error('🔮❌ [PROXY] Local SD responded with error:', response.status);
        return false;
      }
    } catch (error) {
      console.error('🔮💥 [PROXY] Local SD connection test failed:', error);
      console.error('🔮🔧 Check:');
      console.error('  1. SD WebUI is running with --cors-allow-origins flag OR Vite proxy is configured.');
      console.error('  2. Vite dev server was restarted after config changes.');
      console.error('  3. URL is correct: http://127.0.0.1:7860');
      console.error('  4. Windows Firewall allows port 7860');
      return false;
    }
  }

  private determineImageProvider(): ImageProvider {
    if (this.useLocalSD) {
      return 'local_sd';
    }
    if (this.kieAiApiKey) return 'kie_ai';
    return 'kie_ai'; // fallback
  }
}

// Export singleton instance
export const directAPI = new DirectAPIIntegration(); 