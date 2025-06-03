import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { STABILITY_STATES, type StabilityStatus } from '../../lib/types';
import './SystemStability.css';

interface SystemStabilityProps {
  status: StabilityStatus;
}

export const SystemStability: React.FC<SystemStabilityProps> = ({ status }) => {
  const currentState = STABILITY_STATES[status];
  const stateClass = `stability-${status.toLowerCase()}`;

  return (
    <div className="stability-container">
      <div className={`stability-indicator ${stateClass}`}>
        <div 
          className="stability-bar"
          style={{ backgroundColor: currentState.color }}
        />
        <div className="stability-status">
          {(status === 'CRITICAL_CORRUPTION' || status === 'DATA_DAEMON_POSSESSION') && (
            <AlertTriangle className="warning-icon" size={24} />
          )}
          <span style={{ color: currentState.color }}>{currentState.label}</span>
        </div>
        <div className="stability-description" style={{ color: currentState.color }}>
          {currentState.description}
        </div>
      </div>
    </div>
  );
};