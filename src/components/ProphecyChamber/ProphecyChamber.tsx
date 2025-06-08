import React, { useEffect } from 'react';
import { Scroll, Sparkles, Loader2 } from 'lucide-react';
import { useOracleFlowStore } from '../../lib/oracleFlowStore';
import { useGirthIndexStore } from '../../lib/girthIndexStore';
import { PixelBorder, PixelText, PixelLoading } from '../PixelArt/PixelBorder';
import './ProphecyChamber.css';

export const ProphecyChamber: React.FC = () => {
  const {
    currentTopic,
    generationState,
    latestProphecy,
    generateProphecy,
    switchToTab
  } = useOracleFlowStore();

  const {
    girthResonance,
    tapSurgeIndex,
    legionMorale,
    stabilityStatus,
    isLoading: metricsLoading
  } = useGirthIndexStore();

  const handleGenerateProphecy = async () => {
    if (!currentTopic) {
      console.error('🔮 No topic selected for prophecy generation');
      return;
    }

    const girthMetrics = {
      girthResonance,
      tapSurgeIndex,
      legionMorale,
      stabilityStatus
    };

    await generateProphecy(girthMetrics);
  };

  const handleViewScrolls = () => {
    switchToTab('scrolls');
  };

  if (metricsLoading) {
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

  const isCorrupted = latestProphecy?.corruption_level && latestProphecy.corruption_level !== 'pristine';

  return (
    <PixelBorder isCorrupted={isCorrupted} className="prophecy-chamber">
      <div className="prophecy-header">
        <Scroll className="scroll-icon" size={32} />
        <h2><PixelText>THE ORACLE SPEAKS</PixelText></h2>
        <Scroll className="scroll-icon" size={32} />
      </div>

      {/* Current Topic Display */}
      {currentTopic && (
        <div className="ritual-topic-indicator">
          <span className="topic-label">Ritual Topic Selected:</span>
          <span className="topic-name">{currentTopic.replace(/_/g, ' ')}</span>
        </div>
      )}

      {/* No Topic Warning */}
      {!currentTopic && (
        <div className="no-topic-warning">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <p>Please select a ritual topic from the Ritual Requests tab first</p>
            <button 
              onClick={() => switchToTab('ritual')}
              className="select-topic-btn"
            >
              Select Ritual Topic
            </button>
          </div>
        </div>
      )}

      {/* Generation Interface */}
      {currentTopic && (!latestProphecy || latestProphecy.topic !== currentTopic) && (
        <div className="generation-interface">
          <div className="oracle-meditation">
            <div className="oracle-eye">
              <div className={`eye-glow ${generationState.isGenerating ? 'active' : ''}`}>👁️</div>
            </div>
            <div className="meditation-text">
              {generationState.isGenerating ? generationState.progress : 'The Oracle awaits your ritual request...'}
            </div>
          </div>

          <button
            onClick={handleGenerateProphecy}
            disabled={generationState.isGenerating || !currentTopic}
            className={`generate-btn ${generationState.isGenerating ? 'generating' : ''}`}
          >
            {generationState.isGenerating ? (
              <>
                <Loader2 className="spinner" size={20} />
                {generationState.currentStep === 'manifesting_visuals' ? 'Manifesting Visuals...' : 'Channeling Prophecy...'}
              </>
            ) : (
              <>
                <Sparkles className="icon" size={20} />
                Summon Ritual Prophecy
              </>
            )}
          </button>
        </div>
      )}

      {/* Latest Prophecy Display */}
      {latestProphecy && (
        <div className="prophecy-display">
          <div className="prophecy-header">
            <h4>Oracle Prophecy Received</h4>
            <div className="prophecy-meta">
              <span className="topic-tag">{latestProphecy.topic?.replace('_', ' ') || 'General'}</span>
              <span className="corruption-level">
                Corruption: {latestProphecy.corruption_level}
              </span>
              <span className="timestamp">
                {latestProphecy.timestamp ? 
                  latestProphecy.timestamp.toLocaleTimeString() : 
                  'Just now'
                }
              </span>
            </div>
          </div>

          <div className="prophecy-content">
            <div className={`prophecy-text corruption-${latestProphecy.corruption_level}`}>
              {latestProphecy.content}
            </div>

            {latestProphecy.visual_generated && latestProphecy.image_url && (
              <div className="prophecy-visual">
                <h5>Visual Manifestation</h5>
                <div className="visual-container">
                  <img 
                    src={latestProphecy.image_url} 
                    alt="Prophecy Visual Manifestation"
                    className="prophecy-image"
                  />
                  {latestProphecy.visual_themes && (
                    <div className="visual-themes">
                      <span className="themes-label">Visual Themes:</span>
                      <div className="themes-list">
                        {latestProphecy.visual_themes.map((theme, index) => (
                          <span key={index} className="theme-tag">{theme}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="prophecy-actions">
            <button 
              onClick={() => switchToTab('ritual')} 
              className="new-prophecy-btn secondary"
            >
              <span className="icon">🎯</span>
              Select New Topic
            </button>
            <button 
              onClick={handleViewScrolls} 
              className="new-prophecy-btn primary"
            >
              <span className="icon">📜</span>
              View All Scrolls
            </button>
          </div>
        </div>
      )}

      {/* Generation Error */}
      {generationState.error && (
        <div className="generation-error">
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <p>Oracle Connection Disrupted</p>
            <p className="error-details">{generationState.error}</p>
            <button 
              onClick={handleGenerateProphecy}
              className="retry-btn"
              disabled={!currentTopic}
            >
              Retry Prophecy
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