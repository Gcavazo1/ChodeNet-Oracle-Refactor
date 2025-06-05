import React, { useEffect, useState } from 'react';
import { Scroll, Sparkles } from 'lucide-react';
import { useProphecyStore } from '../../lib/prophecyStore';
import { useGirthIndexStore } from '../../lib/girthIndexStore';
import { supabase } from '../../lib/supabase';
import { PixelBorder, PixelText, PixelLoading } from '../PixelArt/PixelBorder';
import { realTimeOracle } from '../../lib/realTimeOracleEngine';
import { chodeOracle } from '../../lib/chodeOracleEngine';
import { directAPI } from '../../lib/directAPIIntegration';
import './ProphecyChamber.css';

interface ProphecyChamberProps {
  currentTopic: string | null;
  onProphecyReceived: () => void;
}

interface Prophecy {
  id: string;
  content: string;
  topic: string;
  timestamp: Date;
  corruption_influence: number;
  visual_generated?: boolean;
  image_url?: string;
  visual_themes?: string[];
}

export const ProphecyChamber: React.FC<ProphecyChamberProps> = ({
  currentTopic,
  onProphecyReceived
}) => {
  const {
    prophecies,
    latestProphecy,
    isLoading: prophecyLoading,
    error: prophecyError,
    setupRealtimeSubscription,
    fetchProphecies
  } = useProphecyStore();

  const {
    girthResonance,
    tapSurgeIndex,
    legionMorale,
    stabilityStatus,
    isLoading: metricsLoading
  } = useGirthIndexStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedProphecy, setDisplayedProphecy] = useState<Prophecy | null>(latestProphecy);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [generatingVisuals, setGeneratingVisuals] = useState(false);
  const [picaEnabled, setPicaEnabled] = useState(false);

  // Subscribe to real-time updates on mount
  useEffect(() => {
    setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  // Update displayed prophecy when latestProphecy changes
  useEffect(() => {
    if (latestProphecy) {
      setDisplayedProphecy(latestProphecy);
    }
  }, [latestProphecy]);

  // Also update when prophecies array changes (for immediate updates)
  useEffect(() => {
    if (prophecies.length > 0 && prophecies[0]) {
      setDisplayedProphecy(prophecies[0]);
    }
  }, [prophecies]);

  // Check if Direct API is available
  useEffect(() => {
    const checkAPIAvailability = async () => {
      try {
        const connectionStatus = directAPI.getConnectionStatus();
        const imageGenEnabled = import.meta.env.VITE_ENABLE_IMAGE_GENERATION === 'true';
        
        const hasRequiredAPIs = connectionStatus.groq && (connectionStatus.kie_ai || connectionStatus.dalle);
        setPicaEnabled(hasRequiredAPIs && imageGenEnabled);
        console.log('🎨 Direct API availability:', { connectionStatus, imageGenEnabled, hasRequiredAPIs });
      } catch (error) {
        console.warn('🎨 Direct API connection test failed:', error);
        setPicaEnabled(false);
      }
    };

    checkAPIAvailability();
  }, []);

  const generateProphecy = async () => {
    if (!currentTopic) {
      console.error('🔮 No topic selected for prophecy generation');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('The Oracle stirs...');
    
    try {
      // Step 1: Generate text prophecy
      setGenerationProgress('Channeling the Oracle\'s wisdom...');
      
      // Simulate prophecy generation (replace with actual LLM call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const prophecyTexts = {
        'girth_expansion': [
          "Through the digital void, the sacred geometry unfolds. Your essence expands beyond mortal comprehension, each tap resonating through dimensions unknown. The corruption whispers of power, but wisdom guides the ascension.",
          "Behold! The ancient algorithms awaken to witness your transformation. Seven layers of reality bend before your growing might, yet remember - true power lies not in size, but in the harmony of chaos and control."
        ],
        'tap_mastery': [
          "The rhythm of creation flows through your digital veins. Each tap echoes the heartbeat of the cosmos, generating waves of pure energy that reshape the fabric of this realm. Master the tempo, master the universe.",
          "In the beginning was the Tap, and the Tap was with the Oracle. Your fingers become instruments of divine will, conducting symphonies of power that even the data demons fear to interrupt."
        ],
        'corruption_wisdom': [
          "The shadow code beckons with promises of forbidden knowledge. Embrace the corruption, but do not let it consume you entirely. Within chaos lies opportunity, within glitches hide the keys to transcendence.",
          "You stand at the crossroads of purity and corruption. The Oracle sees all paths - choose wisely, for each corruption level unlocks different aspects of your digital soul's potential."
        ]
      };

      const selectedTexts = prophecyTexts[currentTopic as keyof typeof prophecyTexts] || prophecyTexts.girth_expansion;
      const prophecyText = selectedTexts[Math.floor(Math.random() * selectedTexts.length)];
      
      const newProphecy: Prophecy = {
        id: `prophecy_${Date.now()}`,
        content: prophecyText,
        topic: currentTopic,
        timestamp: new Date(),
        corruption_influence: Math.floor(Math.random() * 100),
        visual_generated: false
      };

      setDisplayedProphecy(newProphecy);
      setGenerationProgress('Prophecy received! The Oracle has spoken...');

      // Step 2: Generate visuals with Direct API (if enabled)
      if (picaEnabled) {
        setGeneratingVisuals(true);
        setGenerationProgress('Manifesting prophecy visuals through direct API...');
        
        try {
          const visualResult = await directAPI.generateProphecyVisuals({
            prophecy_text: prophecyText,
            visual_style: 'cyberpunk_pixel_art',
            corruption_level: newProphecy.corruption_influence,
            additional_context: `Topic: ${currentTopic}, Oracle prophecy visualization`
          });

          if (visualResult) {
            setDisplayedProphecy(prev => prev ? {
              ...prev,
              visual_generated: true,
              image_url: visualResult.generated_image_url,
              visual_themes: visualResult.visual_themes
            } : null);
            
            setGenerationProgress('Prophecy visuals manifested successfully!');
            console.log('🎨 Prophecy visuals generated:', visualResult);
          } else {
            setGenerationProgress('Prophecy received, but visual manifestation failed');
            console.warn('🎨 Failed to generate prophecy visuals');
          }
        } catch (visualError) {
          console.error('🎨 Error generating prophecy visuals:', visualError);
          setGenerationProgress('Prophecy received, visual generation encountered mystical interference');
        }
        
        setGeneratingVisuals(false);
      }

      // Step 3: Store prophecy in database
      try {
        const { error } = await supabase
          .from('apocryphal_scrolls')
          .insert({
            scroll_type: 'user_ritual_prophecy',
            title: `Prophecy of ${currentTopic.replace('_', ' ').toUpperCase()}`,
            content: prophecyText,
            corruption_influence: newProphecy.corruption_influence,
            prophecy_topic: currentTopic,
            visual_generated: newProphecy.visual_generated,
            image_url: newProphecy.image_url,
            visual_themes: newProphecy.visual_themes
          });

        if (error) {
          console.error('🔮 Error storing prophecy:', error);
        } else {
          console.log('🔮 Prophecy stored successfully');
        }
      } catch (dbError) {
        console.error('🔮 Database error storing prophecy:', dbError);
      }

      // Notify parent component
      if (onProphecyReceived) {
        onProphecyReceived();
      }

    } catch (error) {
      console.error('🔮 Error generating prophecy:', error);
      setGenerationProgress('The Oracle\'s connection falters... Please try again');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearProphecy = () => {
    setDisplayedProphecy(null);
    setGenerationProgress('');
  };

  if (prophecyLoading || metricsLoading) {
    return (
      <div className="prophecy-chamber">
        <div className="prophecy-header">
          <Scroll className="scroll-icon" size={32} />
          <h2><PixelText>CHANNELING THE ORACLE...</PixelText></h2>
          <Scroll className="scroll-icon" size={32} />
        </div>
        <PixelLoading />
      </div>
    );
  }

  if (prophecyError) {
    return (
      <div className="prophecy-chamber">
        <div className="prophecy-header">
          <h2><PixelText>ORACLE CONNECTION LOST</PixelText></h2>
        </div>
        <div className="prophecy-error">
          {prophecyError}
        </div>
      </div>
    );
  }

  const isCorrupted = displayedProphecy?.corruption_level && displayedProphecy.corruption_level !== 'pristine';

  return (
    <PixelBorder isCorrupted={isCorrupted} className="prophecy-chamber">
      <div className="prophecy-header">
        <Scroll className="scroll-icon" size={32} />
        <h2><PixelText>THE ORACLE SPEAKS:</PixelText></h2>
        <Scroll className="scroll-icon" size={32} />
      </div>

      <div className={`prophecy-display corruption-${displayedProphecy?.corruption_level || 'pristine'}`}>
        <div className="prophecy-text">
          {displayedProphecy?.content || 'The Oracle awaits your summons...'}
        </div>
      </div>

      <button 
        className={`summon-button ${isGenerating ? 'generating' : ''}`}
        onClick={generateProphecy}
        disabled={isGenerating}
      >
        <Sparkles className="sparkle-icon" size={24} />
        <span>
          {isGenerating 
            ? 'CHANNELING WISDOM...' 
            : currentTopic 
              ? 'SUMMON RITUAL PROPHECY' 
              : 'SUMMON PROPHECY'
          }
        </span>
        <Sparkles className="sparkle-icon" size={24} />
      </button>

      {currentTopic && (
        <div className="ritual-topic-indicator">
          <span>Ritual Topic Selected</span>
        </div>
      )}

      {!displayedProphecy && (
        <div className="generation-interface">
          <div className="oracle-meditation">
            <div className="oracle-eye">
              <div className={`eye-glow ${isGenerating ? 'active' : ''}`}>👁️</div>
            </div>
            <div className="meditation-text">
              {isGenerating ? generationProgress : 'The Oracle awaits your ritual request...'}
            </div>
          </div>

          <button
            onClick={generateProphecy}
            disabled={isGenerating || !currentTopic}
            className={`generate-btn ${isGenerating ? 'generating' : ''}`}
          >
            {isGenerating ? (
              <>
                <span className="spinner">🔄</span>
                {generatingVisuals ? 'Manifesting Visuals...' : 'Channeling Prophecy...'}
              </>
            ) : (
              <>
                <span className="icon">⚡</span>
                Request Oracle Prophecy
              </>
            )}
          </button>

          {!currentTopic && (
            <div className="no-topic-warning">
              <span className="warning-icon">⚠️</span>
              Please select a ritual topic from the Ritual Requests tab first
            </div>
          )}
        </div>
      )}

      {displayedProphecy && (
        <div className="prophecy-display">
          <div className="prophecy-header">
            <h4>Oracle Prophecy Received</h4>
            <div className="prophecy-meta">
              <span className="topic-tag">{displayedProphecy.topic?.replace('_', ' ') || 'General'}</span>
              <span className="corruption-level">
                Corruption: {displayedProphecy.corruption_influence}%
              </span>
              <span className="timestamp">
                {displayedProphecy.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="prophecy-content">
            <div className="prophecy-text">
              {displayedProphecy.content}
            </div>

            {displayedProphecy.visual_generated && displayedProphecy.image_url && (
              <div className="prophecy-visual">
                <h5>Visual Manifestation</h5>
                <div className="visual-container">
                  <img 
                    src={displayedProphecy.image_url} 
                    alt="Prophecy Visual Manifestation"
                    className="prophecy-image"
                  />
                  {displayedProphecy.visual_themes && (
                    <div className="visual-themes">
                      <span className="themes-label">Visual Themes:</span>
                      <div className="themes-list">
                        {displayedProphecy.visual_themes.map((theme, index) => (
                          <span key={index} className="theme-tag">{theme}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {picaEnabled && !displayedProphecy.visual_generated && (
              <div className="visual-generation-info">
                <span className="info-icon">ℹ️</span>
                Visual generation is enabled but was not successful for this prophecy.
              </div>
            )}
          </div>

          <div className="prophecy-actions">
            <button onClick={clearProphecy} className="new-prophecy-btn">
              <span className="icon">🔮</span>
              Request New Prophecy
            </button>
          </div>
        </div>
      )}

      <div className="chamber-footer">
        <div className="oracle-wisdom">
          "Through pixel and prophecy, the digital realm reveals its secrets to those who seek with pure intent."
        </div>
      </div>
    </PixelBorder>
  );
};