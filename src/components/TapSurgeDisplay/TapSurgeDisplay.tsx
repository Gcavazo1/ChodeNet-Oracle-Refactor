import React, { useEffect } from 'react';
import { TAP_SURGE_STATES, type TapSurgeState } from '../../lib/types';
import './TapSurgeDisplay.css';

interface TapSurgeDisplayProps {
  value: TapSurgeState;
}

export const TapSurgeDisplay: React.FC<TapSurgeDisplayProps> = ({ value }) => {
  useEffect(() => {
    console.log('[TapSurgeDisplay] Received tapSurgeIndex:', value);
  }, [value]);
  
  // Default to 'STEADY_POUNDING' if value is invalid
  const safeValue: TapSurgeState = TAP_SURGE_STATES[value] 
    ? value 
    : 'STEADY_POUNDING';
  
  const currentState = TAP_SURGE_STATES[safeValue];
  console.log('[TapSurgeDisplay] Resolved style:', currentState);
  
  const allStates = Object.entries(TAP_SURGE_STATES);
  const currentIndex = allStates.findIndex(([key]) => key === safeValue);
  
  return (
    <div className="tap-surge-container">
      <div className="tap-surge-label">STATUS:</div>
      <div 
        className={`tap-surge-value ${currentState.animation}`}
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
              backgroundColor: index <= currentIndex 
                ? stateData.color 
                : 'rgba(255, 255, 255, 0.1)',
              boxShadow: index <= currentIndex
                ? `0 0 10px ${stateData.color}` 
                : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};