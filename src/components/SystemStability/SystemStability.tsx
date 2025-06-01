import React from 'react';
import { type StabilityStatus } from '../Dashboard/Dashboard';
import { AlertTriangle } from 'lucide-react';
import './SystemStability.css';

interface SystemStabilityProps {
  status: StabilityStatus;
}

export const SystemStability: React.FC<SystemStabilityProps> = ({ status }) => {
  const getStatusConfig = (status: StabilityStatus) => {
    switch (status) {
      case 'CRITICAL_CORRUPTION':
        return {
          color: '#ff3131',
          label: 'CRITICAL CORRUPTION IMMINENT!',
          pulseClass: 'pulse-critical'
        };
      case 'UNSTABLE':
        return {
          color: '#ffff00',
          label: 'UNSTABLE',
          pulseClass: 'pulse-warning'
        };
      default:
        return {
          color: '#39ff14',
          label: 'STABLE',
          pulseClass: 'pulse-stable'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="stability-container">
      <div className={`stability-indicator ${config.pulseClass}`}>
        <div 
          className="stability-bar"
          style={{ backgroundColor: config.color }}
        />
        <div className="stability-status">
          {status === 'CRITICAL_CORRUPTION' && (
            <AlertTriangle className="warning-icon\" size={24} />
          )}
          <span style={{ color: config.color }}>{config.label}</span>
        </div>
      </div>
    </div>
  );
};