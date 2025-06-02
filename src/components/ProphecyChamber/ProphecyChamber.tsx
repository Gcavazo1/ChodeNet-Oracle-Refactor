import React, { useEffect, useState } from 'react';
import { Scroll, Sparkles } from 'lucide-react';
import { useProphecyStore } from '../../lib/prophecyStore';
import { useGirthIndexStore } from '../../lib/girthIndexStore';
import { supabase } from '../../lib/supabase';
import { PixelBorder, PixelText, PixelLoading } from '../PixelArt/PixelBorder';
import './ProphecyChamber.css';

interface ProphecyChamberProps {
  currentTopic: string | null;
  onProphecyReceived: () => void;
}

export const ProphecyChamber: React.FC<ProphecyChamberProps> = ({
  currentTopic,
  onProphecyReceived
}) => {
  const {
    latestProphecy,
    isLoading: prophecyLoading,
    error: prophecyError,
    setupRealtimeSubscription
  } = useProphecyStore();

  const {
    girthResonance,
    tapSurgeIndex,
    legionMorale,
    stabilityStatus,
    isLoading: metricsLoading
  } = useGirthIndexStore();

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  const generateProphecy = async () => {
    try {
      setIsGenerating(true);
      console.log('ProphecyChamber: Starting prophecy generation...');

      const payload = {
        metrics: {
          girth_resonance: girthResonance,
          tap_surge_index: tapSurgeIndex,
          legion_morale: legionMorale,
          oracle_stability_status: stabilityStatus
        },
        ritual_request_topic: currentTopic
      };

      console.log('ProphecyChamber: Sending prophecy request with payload:', payload);

      const { error } = await supabase.functions.invoke('oracle-prophecy-generator', {
        body: payload
      });

      if (error) throw error;

      console.log('ProphecyChamber: Prophecy generation successful');
      onProphecyReceived();
    } catch (error) {
      console.error('ProphecyChamber: Failed to generate prophecy:', error);
    } finally {
      console.log('ProphecyChamber: Resetting generation state');
      setIsGenerating(false);
    }
  };

  if (prophecyLoading || metricsLoading) {
    return (
      <div className="prophecy-chamber">
        <div className="prophecy-header">
          <Scroll className="scroll-icon\" size={32} />
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

  const isCorrupted = latestProphecy?.corruption_level !== 'none';

  return (
    <PixelBorder isCorrupted={isCorrupted} className="prophecy-chamber">
      <div className="prophecy-header">
        <Scroll className="scroll-icon" size={32} />
        <h2><PixelText>THE ORACLE SPEAKS:</PixelText></h2>
        <Scroll className="scroll-icon" size={32} />
      </div>

      <div className={`prophecy-display corruption-${latestProphecy?.corruption_level || 'none'}`}>
        <div className="prophecy-text">
          {latestProphecy?.prophecy_text || 'The Oracle awaits your summons...'}
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
    </PixelBorder>
  );
};