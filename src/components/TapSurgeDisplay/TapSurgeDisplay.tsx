import React from 'react';
import { TAP_SURGE_STATES, type TapSurgeState } from '../../lib/types';
import './TapSurgeDisplay.css';

interface TapSurgeDisplayProps {
  value: TapSurgeState;
}

export const TapSurgeDisplay: React.FC<TapSurgeDisplayProps> = ({ value }) => {
  // Default to 'Steady Pounding' if value is invalid
  const safeValue: TapSurgeState = TAP_SURGE_STATES[value] 
    ? value 
    : 'Steady Pounding';
  
  const currentState = TAP_SURGE_STATES[safeValue];
  const allStates = Object.entries(TAP_SURGE_STATES);
  
  return (
    <div className="tap-surge-container">
      <div className="tap-surge-label">STATUS:</div>
      <div 
        className="tap-surge-value" 
        style={{ 
          color: currentState.color,
          textShadow: `0 0 10px ${currentState.color}, 0 0 20px ${currentState.color}`
        }}
      >
        <span className="glitch-text" data-text={currentState.label}>
          {currentState.label}
        </span>
      </div>
      
      <div className="tap-surge-meter">
        {allStates.map(([stateKey, stateData], index) => (
          <div 
            key={stateKey}
            className={`tap-meter-segment ${stateKey === safeValue ? 'active' : ''}`}
            style={{ 
              backgroundColor: index <= allStates.findIndex(([key]) => key === safeValue) 
                ? stateData.color 
                : 'rgba(255, 255, 255, 0.1)',
              boxShadow: index <= allStates.findIndex(([key]) => key === safeValue)
                ? `0 0 10px ${stateData.color}` 
                : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};