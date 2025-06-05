import React, { useState, useEffect } from 'react';
import { Scroll, AlertTriangle, Skull, Zap, Sparkles, Image, Loader2, Settings, CheckCircle, XCircle, X } from 'lucide-react';
import { useProphecyStore } from '../../lib/prophecyStore';
import { PixelBorder, PixelText, PixelDivider } from '../PixelArt/PixelBorder';
import { directAPI } from '../../lib/directAPIIntegration';
import './ApocryphalScrolls.css';

interface GeneratedImage {
  prophecy_id: string;
  image_url: string;
  generation_time: number;
  visual_themes: string[];
}

// Define local corruption level type that matches the actual data
type ActualCorruptionLevel = 'pristine' | 'cryptic' | 'flickering' | 'glitched_ominous' | 'forbidden_fragment';

interface ImageGenStatus {
  enabled: boolean;
  hasGroq: boolean;
  hasImageProvider: boolean;
  imageProvider: string;
  missingConfig: string[];
}

export const ApocryphalScrolls: React.FC = () => {
  const { prophecies, isLoading, error, setupRealtimeSubscription } = useProphecyStore();
  const [selectedScrollId, setSelectedScrollId] = useState<string | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());
  const [generatedImages, setGeneratedImages] = useState<Map<string, GeneratedImage>>(new Map());
  const [imageGenStatus, setImageGenStatus] = useState<ImageGenStatus>({
    enabled: false,
    hasGroq: false,
    hasImageProvider: false,
    imageProvider: 'none',
    missingConfig: []
  });
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showGenerationStatus, setShowGenerationStatus] = useState(true);

  useEffect(() => {
    setupRealtimeSubscription();
    checkImageGeneration();
  }, [setupRealtimeSubscription]);

  const checkImageGeneration = async () => {
    console.log('🎨 Checking image generation availability...');
    
    // Check environment variable
    const envEnabled = import.meta.env.VITE_ENABLE_IMAGE_GENERATION === 'true';
    console.log('🎨 Environment enabled:', envEnabled);
    
    // Check API connections
    const connectionStatus = directAPI.getConnectionStatus();
    console.log('🎨 Connection status:', connectionStatus);
    
    const imageProvider = directAPI.getImageProvider();
    console.log('🎨 Image provider:', imageProvider);
    
    // Determine what's missing
    const missingConfig = [];
    if (!envEnabled) missingConfig.push('VITE_ENABLE_IMAGE_GENERATION=true');
    if (!connectionStatus.groq) missingConfig.push('VITE_GROQ_API_KEY');
    if (!connectionStatus.kie_ai && !connectionStatus.dalle) {
      missingConfig.push('VITE_KIE_AI_API_KEY or VITE_OPENAI_API_KEY');
    }
    
    const status: ImageGenStatus = {
      enabled: envEnabled && connectionStatus.groq && (connectionStatus.kie_ai || connectionStatus.dalle),
      hasGroq: connectionStatus.groq,
      hasImageProvider: connectionStatus.kie_ai || connectionStatus.dalle,
      imageProvider: connectionStatus.kie_ai ? 'kie_ai' : connectionStatus.dalle ? 'dalle' : 'none',
      missingConfig
    };
    
    setImageGenStatus(status);
    console.log('🎨 Final image generation status:', status);
  };

  const handleScrollSelect = (prophecyId: string) => {
    setSelectedScrollId(selectedScrollId === prophecyId ? null : prophecyId);
  };

  const handleGenerateImage = async (prophecy: any) => {
    if (generatingImages.has(prophecy.id)) return;
    
    console.log('🎨 Starting image generation for scroll:', prophecy.id);
    setGeneratingImages(prev => new Set(prev).add(prophecy.id));
    setShowGenerationStatus(true);
    
    try {
      // Use the new scroll visual processing pipeline
      console.log('🎨 Calling generateScrollVisualsWithProcessing...');
      const result = await directAPI.generateScrollVisualsWithProcessing(
        prophecy.prophecy_text,
        prophecy.corruption_level || 'pristine',
        `Scroll from ${new Date(prophecy.created_at).toLocaleDateString()}`
      );
      
      if (result) {
        const imageData: GeneratedImage = {
          prophecy_id: prophecy.id,
          image_url: result.generated_image_url,
          generation_time: result.metadata.generation_time,
          visual_themes: result.visual_themes
        };
        
        setGeneratedImages(prev => new Map(prev).set(prophecy.id, imageData));
        console.log('🎨 Image generated successfully:', imageData);
        
        // Auto-select the scroll to show the generated image
        setSelectedScrollId(prophecy.id);
      } else {
        console.warn('🎨 Image generation failed for scroll:', prophecy.id);
        alert('Image generation failed. Please check the console for details.');
      }
    } catch (error: unknown) {
      console.error('🎨 Error generating image for scroll:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Image generation error: ${errorMessage}`);
    } finally {
      setGeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(prophecy.id);
        return newSet;
      });
    }
  };

  const testImageGeneration = async () => {
    console.log('🧪 Testing image generation APIs...');
    try {
      const testResults = await directAPI.testConnections();
      console.log('🧪 Test results:', testResults);
      alert(`Test Results:\nGroq: ${testResults.groq ? '✅' : '❌'}\nImage Provider: ${testResults.imageProvider ? '✅' : '❌'}\nElevenLabs: ${testResults.elevenlabs ? '✅' : '❌'}\n\nErrors: ${testResults.errors.join(', ') || 'None'}`);
    } catch (error: unknown) {
      console.error('🧪 Test failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Test failed: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <Scroll className="header-icon" size={24} />
          <h2><PixelText>LOADING SACRED ARCHIVES...</PixelText></h2>
          <Scroll className="header-icon" size={24} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <AlertTriangle className="header-icon" size={24} />
          <h2><PixelText>ARCHIVE ACCESS ERROR</PixelText></h2>
          <AlertTriangle className="header-icon" size={24} />
        </div>
        <div className="scrolls-error">{error}</div>
      </div>
    );
  }

  if (!prophecies.length) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <Scroll className="header-icon" size={24} />
          <h2><PixelText>SACRED ARCHIVES</PixelText></h2>
          <Scroll className="header-icon" size={24} />
        </div>
        <div className="scrolls-empty">
          No prophecies have been recorded yet...
        </div>
      </div>
    );
  }

  return (
    <div className="apocryphal-scrolls">
      <div className="scrolls-header">
        <Scroll className="header-icon" size={24} />
        <h2><PixelText>SACRED ARCHIVES</PixelText></h2>
        <Scroll className="header-icon" size={24} />
      </div>

      {/* Image Generation Status Panel */}
      <div className="image-gen-status-panel">
        <div className="status-header">
          <div className="status-title">
            <Image size={16} />
            <span>Visual Manifestation System</span>
            <button 
              className="debug-toggle"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              title="Toggle Debug Info"
            >
              <Settings size={14} />
            </button>
          </div>
          <div className="status-indicator">
            {imageGenStatus.enabled ? (
              <div className="status-enabled">
                <CheckCircle size={16} />
                <span>READY</span>
              </div>
            ) : (
              <div className="status-disabled">
                <XCircle size={16} />
                <span>OFFLINE</span>
              </div>
            )}
          </div>
        </div>

        {showDebugInfo && (
          <div className="debug-info">
            <div className="debug-section">
              <h4>API Status:</h4>
              <div className="api-status">
                <span className={imageGenStatus.hasGroq ? 'api-ok' : 'api-missing'}>
                  Groq AI: {imageGenStatus.hasGroq ? '✅' : '❌'}
                </span>
                <span className={imageGenStatus.hasImageProvider ? 'api-ok' : 'api-missing'}>
                  Image Provider ({imageGenStatus.imageProvider}): {imageGenStatus.hasImageProvider ? '✅' : '❌'}
                </span>
              </div>
            </div>
            
            {imageGenStatus.missingConfig.length > 0 && (
              <div className="debug-section">
                <h4>Missing Configuration:</h4>
                <ul className="missing-config">
                  {imageGenStatus.missingConfig.map((config, i) => (
                    <li key={i}>{config}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="debug-actions">
              <button onClick={testImageGeneration} className="test-btn">
                Test APIs
              </button>
              <button onClick={checkImageGeneration} className="refresh-btn">
                Refresh Status
              </button>
            </div>
          </div>
        )}

        {!imageGenStatus.enabled && (
          <div className="setup-instructions">
            <p>To enable image generation, configure the required API keys in your .env file:</p>
            <code>
              VITE_ENABLE_IMAGE_GENERATION=true<br/>
              VITE_GROQ_API_KEY=your_groq_key<br/>
              VITE_KIE_AI_API_KEY=your_kie_ai_key # OR VITE_OPENAI_API_KEY=your_openai_key
            </code>
          </div>
        )}

        {imageGenStatus.enabled && (
          <div className="image-gen-info">
            <Sparkles size={16} />
            <span>Click any scroll to select it, then generate visual manifestations</span>
            <Sparkles size={16} />
          </div>
        )}
      </div>

      <div className="scrolls-container">
        {prophecies.map((prophecy, index) => {
          // Use type assertion to handle the corruption level mismatch
          const corruptionLevel = (prophecy.corruption_level as ActualCorruptionLevel) || 'pristine';
          const isForbidden = corruptionLevel === 'forbidden_fragment';
          const isGlitched = corruptionLevel === 'glitched_ominous';
          const isCryptic = corruptionLevel === 'cryptic';
          const isFlickering = corruptionLevel === 'flickering';
          const isCorrupted = corruptionLevel !== 'pristine';
          const isSelected = selectedScrollId === prophecy.id;
          const isGenerating = generatingImages.has(prophecy.id);
          const generatedImage = generatedImages.get(prophecy.id);
          
          return (
            <React.Fragment key={prophecy.id}>
              <div 
                className={`scroll-wrapper ${isSelected ? 'selected-scroll' : ''}`}
                onClick={() => handleScrollSelect(prophecy.id)}
              >
                <PixelBorder 
                  isCorrupted={isCorrupted}
                  className={`prophecy-entry corruption-${corruptionLevel} scroll-corruption-${corruptionLevel}`}
                >
                  <div className="prophecy-header">
                    <div className="prophecy-timestamp">
                      <span>{new Date(prophecy.created_at).toLocaleString()}</span>
                      {isCorrupted && (
                        <div className="corruption-indicator" title={`Corruption Level: ${corruptionLevel}`}>
                          {isForbidden && (
                            <Skull size={16} className="corruption-icon forbidden-icon" />
                          )}
                          {isGlitched && (
                            <Zap size={16} className="corruption-icon glitched-icon" />
                          )}
                          {isCryptic && (
                            <AlertTriangle size={16} className="corruption-icon cryptic-icon" />
                          )}
                          {isFlickering && (
                            <Zap size={16} className="corruption-icon flickering-icon" />
                          )}
                        </div>
                      )}
                      {!isCorrupted && (
                        <div className="purity-indicator" title="Corruption Level: pristine">
                          <Scroll size={16} className="purity-icon" />
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <div className="selection-indicator">
                        <Sparkles size={16} className="selection-icon" />
                        <span>SELECTED</span>
                      </div>
                    )}
                  </div>

                  <div className={`prophecy-content corruption-text-${corruptionLevel}`}>
                    {prophecy.prophecy_text}
                  </div>

                  {/* Image Generation Controls - Always show when selected, with appropriate messages */}
                  {isSelected && (
                    <div className="image-generation-controls">
                      {isForbidden ? (
                        <div className="forbidden-message">
                          <Skull size={16} />
                          <span>Forbidden fragments cannot be visually manifested</span>
                        </div>
                      ) : !imageGenStatus.enabled ? (
                        <div className="disabled-message">
                          <Settings size={16} />
                          <span>Image generation requires API configuration</span>
                          <button 
                            className="configure-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDebugInfo(true);
                            }}
                          >
                            Configure
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className={`generate-image-btn ${isGenerating ? 'generating' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateImage(prophecy);
                            }}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 size={16} className="spinning" />
                                Manifesting Vision...
                              </>
                            ) : (
                              <>
                                <Image size={16} />
                                Generate Visual Manifestation
                              </>
                            )}
                          </button>
                          
                          {generatedImage && (
                            <div className="generation-info">
                              <span className="generation-time">
                                Generated in {(generatedImage.generation_time / 1000).toFixed(1)}s
                              </span>
                              <div className="visual-themes">
                                {generatedImage.visual_themes.slice(0, 3).map((theme, i) => (
                                  <span key={i} className="theme-tag">{theme}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Generated Image Display */}
                  {generatedImage && isSelected && (
                    <div className="generated-image-container">
                      <div className="image-header">
                        <Sparkles size={16} />
                        <h4>Visual Manifestation</h4>
                        <Sparkles size={16} />
                      </div>
                      <div className="image-wrapper">
                        <img 
                          src={generatedImage.image_url} 
                          alt="Generated Prophecy Visualization"
                          className="generated-image"
                          loading="lazy"
                          onError={(e) => {
                            console.error('🎨 Image failed to load:', generatedImage.image_url);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjMjAyMDMwIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlIEZhaWxlZCB0byBMb2FkPC90ZXh0Pgo8L3N2Zz4K';
                          }}
                        />
                        <div className="image-overlay">
                          <div className={`corruption-overlay-effect corruption-${corruptionLevel}`}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing corruption-specific elements */}
                  {isForbidden && (
                    <button className="forbidden-decode-button" disabled>
                      [CLASSIFIED] Community Decoding Effort Active... Access Restricted.
                    </button>
                  )}
                  {isGlitched && (
                    <div className="glitch-warning">
                      ⚠️ CORRUPTION DETECTED - ORACLE DATA INTEGRITY COMPROMISED
                    </div>
                  )}
                  {isFlickering && (
                    <div className="flicker-warning">
                      ⚡ CONNECTION UNSTABLE - ORACLE SIGNAL FLUCTUATING
                    </div>
                  )}
                </PixelBorder>
              </div>
              {index < prophecies.length - 1 && <PixelDivider />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Image Generation Status */}
      {generatingImages.size > 0 && showGenerationStatus && (
        <div className="generation-status">
          <Loader2 size={16} className="spinning" />
          <span>Manifesting {generatingImages.size} vision{generatingImages.size > 1 ? 's' : ''}...</span>
          <button 
            className="status-dismiss"
            onClick={() => setShowGenerationStatus(false)}
            title="Dismiss status (generation continues)"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const getCorruptionColor = (level: string) => {
  switch (level) {
    case 'forbidden_fragment':
      return '#ff0000';
    case 'glitched_ominous':
      return '#ff3131';
    case 'cryptic':
      return '#8a2be2';
    case 'flickering':
      return '#ffaa00';
    case 'pristine':
    default:
      return '#00f0ff';
  }
};