import React, { useState, useEffect } from 'react';
import { type StabilityStatus } from '../../lib/types';
import { GhostScript } from '../../lib/ghostScript';
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
  const [ghostScript] = useState(() => new GhostScript());
  const [simulationStatus, setSimulationStatus] = useState<string>('');
  
  useEffect(() => {
    let statusInterval: number;
    
    if (ghostScript.isSimulationRunning()) {
      statusInterval = window.setInterval(() => {
        const remaining = ghostScript.getRemainingTime();
        if (remaining > 0) {
          setSimulationStatus(`Ghost Legion Tapping Furiously... (Remaining: ${remaining}s)`);
        } else {
          setSimulationStatus('Simulation Complete. Oracle is now Pondering a Special Report...');
          clearInterval(statusInterval);
        }
      }, 1000);
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [ghostScript]);

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

  const handleGhostLegionClick = () => {
    if (!ghostScript.isSimulationRunning()) {
      ghostScript.startSimulation(30);
    }
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
        
        <div className="simulation-controls">
          <button 
            className={`ghost-legion-button ${ghostScript.isSimulationRunning() ? 'running' : ''}`}
            onClick={handleGhostLegionClick}
            disabled={ghostScript.isSimulationRunning()}
          >
            UNLEASH GHOST LEGION!
          </button>
          {simulationStatus && (
            <div className="simulation-status">
              {simulationStatus}
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