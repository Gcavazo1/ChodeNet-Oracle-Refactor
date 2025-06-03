import React from 'react';
import { LEGION_MORALE_STATES, type LegionMoraleState } from '../../lib/types';
import './LegionMoraleBar.css';

interface LegionMoraleBarProps {
  value: LegionMoraleState;
}

export const LegionMoraleBar: React.FC<LegionMoraleBarProps> = ({ value }) => {
  // Default to 'CAUTIOUS' if value is invalid
  const safeValue: LegionMoraleState = LEGION_MORALE_STATES[value] 
    ? value 
    : 'CAUTIOUS';
  
  const currentState = LEGION_MORALE_STATES[safeValue];
  const states = Object.entries(LEGION_MORALE_STATES);
  const currentIndex = states.findIndex(([key]) => key === safeValue);
  const progressPercentage = ((currentIndex + 1) / states.length) * 100;

  return (
    <div className="legion-morale-container">
      <div className="morale-bar-wrapper">
        <div 
          className="morale-bar-fill"
          style={{ 
            width: `${progressPercentage}%`,
            background: `linear-gradient(90deg, ${currentState.color} 0%, ${currentState.color}aa 100%)`
          }}
        />
        <div className="morale-progress">{progressPercentage.toFixed(0)}%</div>
      </div>

      <div 
        className={`morale-state ${currentState.animation}`}
        style={{ 
          color: currentState.color,
          textShadow: `0 0 10px ${currentState.color}`
        }}
      >
        {currentState.label}
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
  );
};