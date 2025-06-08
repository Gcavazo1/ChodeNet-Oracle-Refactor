import React, { useEffect } from 'react';
import { LEGION_MORALE_STATES, type LegionMoraleState } from '../../lib/types';
import './LegionMoraleBar.css';

interface LegionMoraleBarProps {
  value: LegionMoraleState;
}

export const LegionMoraleBar: React.FC<LegionMoraleBarProps> = ({ value }) => {
  useEffect(() => {
    console.log('[LegionMoraleBar] Received legionMorale:', value);
  }, [value]);
  
  // Default to 'CAUTIOUS' if value is invalid
  const safeValue: LegionMoraleState = LEGION_MORALE_STATES[value] 
    ? value 
    : 'CAUTIOUS';
  
  const currentState = LEGION_MORALE_STATES[safeValue];
  console.log('[LegionMoraleBar] Resolved style:', currentState);
  
  const states = Object.entries(LEGION_MORALE_STATES);
  const currentIndex = states.findIndex(([key]) => key === safeValue);
  const progressPercentage = ((currentIndex + 1) / states.length) * 100;

  return (
    <div className="legion-morale-container">
      <div className={`stability-indicator ${safeValue.toLowerCase()}`}>
        <div 
          className="morale-bar-fill"
          style={{ 
            width: `${progressPercentage}%`,
            background: `linear-gradient(90deg, ${currentState.color} 0%, ${currentState.color}aa 100%)`
          }}
        />
        <div className="morale-state">
          <span style={{ color: currentState.color }}>{currentState.label}</span>
        </div>
        <div className="morale-markers">
          {states.map(([key, state], index) => (
            <div
              key={key}
              className={`morale-marker ${index <= currentIndex ? 'active' : ''}`}
              style={{ 
                color: state.color,
                backgroundColor: index <= currentIndex ? state.color : undefined
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};