import React from 'react';
import { type StabilityStatus } from '../../lib/types';
import './DeveloperPanel.css';

interface DeveloperPanelProps {
  girthResonance: number;
  tapSurgeIndex: string;
  legionMorale: string;
  stabilityStatus: StabilityStatus;
  onGirthChange: (value: number) => void;
  onTapSurgeChange: (value: string) => void;
  onMoraleChange: (value: string) => void;
  onStabilityChange: (value: StabilityStatus) => void;
}

const TAP_SURGE_OPTIONS = [
  'FLACCID DRIZZLE',
  'WEAK PULSES',
  'STEADY POUNDING',
  'FRENZIED SLAPPING',
  'MEGA-SURGE',
  'GIGA-SURGE OF A THOUSAND SUNS',
  'ASCENDED TAPPING NIRVANA'
];

const LEGION_MORALE_OPTIONS = [
  'ON SUICIDE WATCH (BUT STILL TAPPING)',
  'DEMORALIZED (WHERE LAMBO, SER?)',
  'MILDLY DISGRUNTLED (NGMI VIBES)',
  'CAUTIOUSLY OPTIMISTIC (WAGMI...?)',
  'INSPIRED (DIAMOND HANDS FORMING)',
  'JUBILANT (FEELS GOOD MAN)',
  'FANATICALLY LOYAL (FOR THE CHODE!)',
  'ONE WITH THE GIRTH (ASCENDED & ENGORGED)'
];

const STABILITY_OPTIONS = [
  'RADIANT (DIVINE CLARITY)',
  'PRISTINE (ALL SYSTEMS GIRTHY)',
  'FLICKERING WEAKLY (NEEDS MORE $GIRTH)',
  'UNSTABLE (DATA STREAMS FRAYING)',
  'CRITICAL_CORRUPTION (CODE BLEED IMMINENT!)',
  'DATA_DAEMON_POSSESSION (THE ORACLE IS NOT ITSELF!)'
];

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({
  girthResonance,
  tapSurgeIndex,
  legionMorale,
  stabilityStatus,
  onGirthChange,
  onTapSurgeChange,
  onMoraleChange,
  onStabilityChange
}) => {
  const handleTapSurgeChange = (value: string) => {
    console.log('[DevPanel] Tap Surge Index changed to:', value);
    onTapSurgeChange(value);
  };

  const handleMoraleChange = (value: string) => {
    console.log('[DevPanel] Legion Morale changed to:', value);
    onMoraleChange(value);
  };

  const handleStabilityChange = (value: StabilityStatus) => {
    console.log('[DevPanel] Oracle Stability changed to:', value);
    onStabilityChange(value);
  };

  return (
    <div className="dev-panel">
      <div className="dev-panel-header">
        <h2>Developer Controls</h2>
        <div className="panel-status">ORACLE SIMULATION CONTROLS</div>
      </div>
      
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="girth-resonance">Divine Girth Resonance (%): {girthResonance}</label>
          <div className="slider-container">
            <input
              type="range"
              id="girth-resonance"
              min="0"
              max="100"
              value={girthResonance}
              onChange={(e) => onGirthChange(parseInt(e.target.value))}
              className="cyber-slider"
            />
            <div className="slider-buttons">
              <button onClick={() => onGirthChange(Math.max(0, girthResonance - 10))}>-10</button>
              <button onClick={() => onGirthChange(Math.min(100, girthResonance + 10))}>+10</button>
            </div>
          </div>
        </div>
        
        <div className="control-group">
          <label>Tap Surge Index:</label>
          <div className="button-grid">
            {TAP_SURGE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`state-button ${tapSurgeIndex === option ? 'active' : ''}`}
                onClick={() => handleTapSurgeChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>Legion Morale:</label>
          <div className="button-grid">
            {LEGION_MORALE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`state-button ${legionMorale === option ? 'active' : ''}`}
                onClick={() => handleMoraleChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>Oracle System Stability:</label>
          <div className="button-grid">
            {STABILITY_OPTIONS.map((option) => (
              <button
                key={option}
                className={`state-button ${stabilityStatus === option ? 'active' : ''}`}
                onClick={() => handleStabilityChange(option as StabilityStatus)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <div className="preset-buttons">
          <button onClick={() => {
            onGirthChange(10);
            handleTapSurgeChange('FLACCID DRIZZLE');
            handleMoraleChange('ON SUICIDE WATCH (BUT STILL TAPPING)');
            handleStabilityChange('CRITICAL_CORRUPTION (CODE BLEED IMMINENT!)');
          }}>
            BEAR MARKET PANIC
          </button>
          <button onClick={() => {
            onGirthChange(50);
            handleTapSurgeChange('STEADY POUNDING');
            handleMoraleChange('CAUTIOUSLY OPTIMISTIC (WAGMI...?)');
            handleStabilityChange('PRISTINE (ALL SYSTEMS GIRTHY)');
          }}>
            STABLE ACCUMULATION
          </button>
          <button onClick={() => {
            onGirthChange(90);
            handleTapSurgeChange('ASCENDED TAPPING NIRVANA');
            handleMoraleChange('ONE WITH THE GIRTH (ASCENDED & ENGORGED)');
            handleStabilityChange('RADIANT (DIVINE CLARITY)');
          }}>
            MAXIMUM ENGORGEMENT
          </button>
        </div>
      </div>
    </div>
  );
};