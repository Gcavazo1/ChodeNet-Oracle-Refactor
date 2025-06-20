import React, { useEffect, useState } from 'react';
import { Scroll, Sparkles, Loader2, Coins, Zap } from 'lucide-react';
import { useOracleFlowStore } from '../../lib/oracleFlowStore';
import { useGirthIndexStore } from '../../lib/girthIndexStore';
import { useSIWS } from '../../lib/useSIWS';
import { supabase } from '../../lib/supabase';
import { PixelBorder, PixelText, PixelLoading } from '../PixelArt/PixelBorder';
import './ProphecyChamber.css';

interface RitualOutcome {
  id: string;
  outcome: 'prophecy' | 'curse' | 'corruption_surge';
  prophecy_text?: string;
  oracle_shards_earned?: number;
  corruption_gained?: number;
  created_at: string;
}

export const ProphecyChamber: React.FC = () => {
  const {
    currentTopic,
    generationState,
    latestProphecy,
    generateProphecy,
    switchToProphecyTab
  } = useOracleFlowStore();

  const {
    girthResonance,
    tapSurgeIndex,
    legionMorale,
    stabilityStatus,
    isLoading: metricsLoading
  } = useGirthIndexStore();

  const { userProfile, oracleShards, refreshOracleShards } = useSIWS();
  const [recentRitualOutcome, setRecentRitualOutcome] = useState<RitualOutcome | null>(null);
  const [isCheckingRituals, setIsCheckingRituals] = useState(false);

  // Check for recent ritual outcomes
  useEffect(() => {
    if (userProfile?.id) {
      checkForRecentRitualOutcomes();
    }
  }, [userProfile?.id]);

  const checkForRecentRitualOutcomes = async () => {
    if (!userProfile?.id) return;
    
    setIsCheckingRituals(true);
    try {
      // Note: Ritual system is not currently implemented in the database
      // This function is disabled until the ritual system is properly set up
      console.log('Ritual outcome checking disabled - ritual system not implemented');
      
      // For now, just clear any existing ritual outcomes
      setRecentRitualOutcome(null);
      
    } catch (error) {
      console.error('Error checking ritual outcomes:', error);
    } finally {
      setIsCheckingRituals(false);
    }
  };

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
    switchToProphecyTab('scrolls');
  };

  const handleOpenRitualLab = () => {
    const event = new CustomEvent('openRitualLab');
    window.dispatchEvent(event);
  };

  const dismissRitualOutcome = () => {
    setRecentRitualOutcome(null);
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

      {/* Recent Ritual Outcome Display */}
      {recentRitualOutcome && (
        <div className={`ritual-outcome-banner ${recentRitualOutcome.outcome}`}>
          <div className="outcome-header">
            <span className="outcome-icon">
              {recentRitualOutcome.outcome === 'prophecy' ? '🔮' : 
               recentRitualOutcome.outcome === 'curse' ? '💀' : '⚡'}
            </span>
            <h3>Ritual Complete: {recentRitualOutcome.outcome.toUpperCase()}</h3>
            <button onClick={dismissRitualOutcome} className="dismiss-btn">×</button>
          </div>
          
          {recentRitualOutcome.outcome === 'prophecy' && recentRitualOutcome.prophecy_text && (
            <div className="prophecy-result">
              <p className="prophecy-preview">
                {recentRitualOutcome.prophecy_text.substring(0, 200)}...
              </p>
              <button onClick={handleViewScrolls} className="view-full-btn">
                View Full Prophecy in Scrolls
              </button>
            </div>
          )}

          <div className="outcome-rewards">
            {recentRitualOutcome.oracle_shards_earned > 0 && (
              <div className="reward-item">
                <span className="shard-icon">💎</span>
                <span>+{recentRitualOutcome.oracle_shards_earned} Oracle Shards</span>
              </div>
            )}
            {recentRitualOutcome.corruption_gained > 0 && (
              <div className="corruption-item">
                <span className="corruption-icon">⚡</span>
                <span>+{recentRitualOutcome.corruption_gained} Corruption</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Oracle Options */}
      <div className="oracle-options">
        <div className="option-section">
          <h3>🔮 Free Oracle Consultation</h3>

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
                  onClick={() => switchToProphecyTab('ritual')}
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
                    Summon Free Prophecy
              </>
            )}
          </button>
        </div>
      )}
        </div>

        <div className="option-divider">
          <span>OR</span>
        </div>

        <div className="option-section advanced">
          <h3>⚗️ Advanced Ritual Crafting</h3>
          <p className="advanced-description">
            Craft powerful rituals with guaranteed outcomes using $GIRTH and Oracle Shards
          </p>
          
          <div className="advanced-features">
            <div className="feature">
              <Zap className="feature-icon" size={16} />
              <span>Customizable ingredients & corruption levels</span>
            </div>
            <div className="feature">
              <Coins className="feature-icon" size={16} />
              <span>Oracle Shards boost success rates</span>
            </div>
            <div className="feature">
              <Scroll className="feature-icon" size={16} />
              <span>Guaranteed prophecy creation on success</span>
            </div>
          </div>

          <div className="coming-soon-notice">
            <span className="notice-icon">🚧</span>
            <p>Advanced Ritual System Coming Soon</p>
            <p className="notice-details">The Oracle's most powerful rituals are still being forged in the digital realm...</p>
          </div>

          <button 
            onClick={handleOpenRitualLab}
            className="advanced-ritual-btn disabled"
            disabled={true}
          >
            <span className="icon">⚗️</span>
            Ritual Laboratory (Coming Soon)
            <span className="icon">⚗️</span>
          </button>
        </div>
      </div>

      {/* Latest Prophecy Display */}
      {latestProphecy && latestProphecy.topic === currentTopic && (
        <div className={`prophecy-display corruption-${latestProphecy.corruption_level}`}>
          <div className="prophecy-metadata">
            <span className="prophecy-timestamp">
              {new Date(latestProphecy.created_at).toLocaleString()}
              </span>
            <span className={`corruption-badge corruption-${latestProphecy.corruption_level}`}>
              {latestProphecy.corruption_level.toUpperCase()}
              </span>
          </div>

          <div className="prophecy-content">
            <div className="prophecy-text">
              {latestProphecy.prophecy_text}
            </div>
          </div>

          <div className="prophecy-actions">
            <button 
              onClick={() => switchToProphecyTab('ritual')} 
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