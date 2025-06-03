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
          <div className="button-group">
            <button 
              className={tapSurgeIndex === 'Flaccid Drizzle' ? 'active' : ''} 
              onClick={() => onTapSurgeChange('Flaccid Drizzle')}
              style={{ backgroundColor: tapSurgeIndex === 'Flaccid Drizzle' ? '#39ff14' : undefined }}
            >
              FLACCID DRIZZLE
            </button>
            <button 
              className={tapSurgeIndex === 'Steady Pounding' ? 'active' : ''} 
              onClick={() => onTapSurgeChange('Steady Pounding')}
              style={{ backgroundColor: tapSurgeIndex === 'Steady Pounding' ? '#ffff00' : undefined }}
            >
              STEADY POUNDING
            </button>
            <button 
              className={tapSurgeIndex === 'Frenzied Slapping' ? 'active' : ''} 
              onClick={() => onTapSurgeChange('Frenzied Slapping')}
              style={{ backgroundColor: tapSurgeIndex === 'Frenzied Slapping' ? '#ff9900' : undefined }}
            >
              FRENZIED SLAPPING
            </button>
            <button 
              className={tapSurgeIndex === 'Giga-Surge' ? 'active' : ''} 
              onClick={() => onTapSurgeChange('Giga-Surge')}
              style={{ backgroundColor: tapSurgeIndex === 'Giga-Surge' ? '#ff3131' : undefined }}
            >
              GIGA-SURGE
            </button>
          </div>
        </div>
        
        <div className="control-group">
          <label>Legion Morale:</label>
          <div className="button-group">
            <button 
              className={legionMorale === 'On Suicide Watch' ? 'active' : ''} 
              onClick={() => onMoraleChange('On Suicide Watch')}
              style={{ backgroundColor: legionMorale === 'On Suicide Watch' ? '#ff3131' : undefined }}
            >
              ON SUICIDE WATCH
            </button>
            <button 
              className={legionMorale === 'Cautiously Optimistic' ? 'active' : ''} 
              onClick={() => onMoraleChange('Cautiously Optimistic')}
              style={{ backgroundColor: legionMorale === 'Cautiously Optimistic' ? '#ffff00' : undefined }}
            >
              CAUTIOUSLY OPTIMISTIC
            </button>
            <button 
              className={legionMorale === 'Ascended and Engorged' ? 'active' : ''} 
              onClick={() => onMoraleChange('Ascended and Engorged')}
              style={{ backgroundColor: legionMorale === 'Ascended and Engorged' ? '#39ff14' : undefined }}
            >
              ASCENDED AND ENGORGED
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Oracle System Stability:</label>
          <div className="button-group stability-buttons">
            <button 
              className={`stability-button ${stabilityStatus === 'Pristine' ? 'active' : ''}`}
              onClick={() => onStabilityChange('Pristine')}
              style={{ backgroundColor: stabilityStatus === 'Pristine' ? '#39ff14' : undefined }}
            >
              PRISTINE
            </button>
            <button 
              className={`stability-button ${stabilityStatus === 'Unstable' ? 'active' : ''}`}
              onClick={() => onStabilityChange('Unstable')}
              style={{ backgroundColor: stabilityStatus === 'Unstable' ? '#ffff00' : undefined }}
            >
              UNSTABLE
            </button>
            <button 
              className={`stability-button ${stabilityStatus === 'Critical' ? 'active' : ''}`}
              onClick={() => onStabilityChange('Critical')}
              style={{ backgroundColor: stabilityStatus === 'Critical' ? '#ff3131' : undefined }}
            >
              CRITICAL
            </button>
          </div>
        </div>
        
        <div className="preset-buttons">
          <button onClick={() => {
            onGirthChange(10);
            onTapSurgeChange('Flaccid Drizzle');
            onMoraleChange('On Suicide Watch');
            onStabilityChange('Critical');
          }}>
            BEAR MARKET PANIC
          </button>
          <button onClick={() => {
            onGirthChange(50);
            onTapSurgeChange('Steady Pounding');
            onMoraleChange('Cautiously Optimistic');
            onStabilityChange('Unstable');
          }}>
            STABLE ACCUMULATION
          </button>
          <button onClick={() => {
            onGirthChange(90);
            onTapSurgeChange('Giga-Surge');
            onMoraleChange('Ascended and Engorged');
            onStabilityChange('Pristine');
          }}>
            MAXIMUM ENGORGEMENT
          </button>
        </div>
      </div>
    </div>
  );
};