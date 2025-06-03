import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { STABILITY_STATES, type StabilityStateType } from '../../lib/types';
import './SystemStability.css';

const DEFAULT_STABILITY_STYLE = {
  label: 'STATUS UNKNOWN',
  color: '#888888',
  animation: 'unknown',
  description: 'The Oracle is momentarily indecipherable...'
};

interface SystemStabilityProps {
  status: StabilityStateType;
}

export const SystemStability: React.FC<SystemStabilityProps> = ({ status }) => {
  useEffect(() => {
    console.log('[SystemStability] Received status prop:', status);
  }, [status]);

  const currentState = STABILITY_STATES[status] || DEFAULT_STABILITY_STYLE;
  const stateClass = `stability-${status?.toLowerCase() || 'unknown'}`;

  useEffect(() => {
    console.log('[SystemStability] Resolved currentState:', currentState);
  }, [currentState]);

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