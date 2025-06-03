import React, { useState } from 'react';
import { type StabilityStatus } from '../../lib/types';
import { runGhostLegionSimulation } from '../../lib/ghostScriptSimulator';
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
  'FLACCID_DRIZZLE',
  'WEAK_PULSES',
  'STEADY_POUNDING',
  'FRENZIED_SLAPPING',
  'MEGA_SURGE',
  'GIGA_SURGE',
  'ASCENDED_NIRVANA'
];

const LEGION_MORALE_OPTIONS = [
  'SUICIDE_WATCH',
  'DEMORALIZED',
  'DISGRUNTLED',
  'CAUTIOUS',
  'INSPIRED',
  'JUBILANT',
  'FANATICAL',
  'ASCENDED'
];

const STABILITY_OPTIONS = [
  'RADIANT_CLARITY',
  'PRISTINE',
  'FLICKERING',
  'UNSTABLE',
  'CRITICAL_CORRUPTION',
  'DATA_DAEMON_POSSESSION'
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
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTime, setSimulationTime] = useState<number | null>(null);

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

  const startGhostLegionSimulation = async () => {
    setIsSimulating(true);
    
    await runGhostLegionSimulation(
      30, // 30 seconds simulation
      (remaining) => setSimulationTime(remaining),
      () => {
        setIsSimulating(false);
        setSimulationTime(null);
      }
    );
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
                {option.replace(/_/g, ' ')}
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
                {option.replace(/_/g, ' ')}
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
                {option.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="ghost-legion-controls">
          <button
            className={`ghost-legion-button ${isSimulating ? 'simulating' : ''}`}
            onClick={startGhostLegionSimulation}
            disabled={isSimulating}
          >
            {isSimulating 
              ? `Ghost Legion Tapping Furiously... (${simulationTime}s)`
              : 'UNLEASH GHOST LEGION!'}
          </button>
          {isSimulating && (
            <div className="simulation-status">
              Simulating intense player activity...
            </div>
          )}
        </div>

        <div className="preset-buttons">
          <button onClick={() => {
            onGirthChange(10);
            handleTapSurgeChange('FLACCID_DRIZZLE');
            handleMoraleChange('SUICIDE_WATCH');
            handleStabilityChange('CRITICAL_CORRUPTION');
          }}>
            BEAR MARKET PANIC
          </button>
          <button onClick={() => {
            onGirthChange(50);
            handleTapSurgeChange('STEADY_POUNDING');
            handleMoraleChange('CAUTIOUS');
            handleStabilityChange('PRISTINE');
          }}>
            STABLE ACCUMULATION
          </button>
          <button onClick={() => {
            onGirthChange(90);
            handleTapSurgeChange('ASCENDED_NIRVANA');
            handleMoraleChange('ASCENDED');
            handleStabilityChange('RADIANT_CLARITY');
          }}>
            MAXIMUM ENGORGEMENT
          </button>
        </div>
      </div>
    </div>
  );
};