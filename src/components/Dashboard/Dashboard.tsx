import React from 'react';
import { GirthResonanceGauge } from '../GirthResonanceGauge/GirthResonanceGauge';
import { TapSurgeDisplay } from '../TapSurgeDisplay/TapSurgeDisplay';
import { LegionMoraleBar } from '../LegionMoraleBar/LegionMoraleBar';
import { SystemStability } from '../SystemStability/SystemStability';
import { GlitchyTitle } from '../GlitchyTitle/GlitchyTitle';
import './Dashboard.css';

export type StabilityStatus = 'STABLE' | 'UNSTABLE' | 'CRITICAL_CORRUPTION';

interface DashboardProps {
  girthResonance: number;
  tapSurgeIndex: number;
  legionMorale: number;
  stabilityStatus: StabilityStatus;
}

export const Dashboard: React.FC<DashboardProps> = ({
  girthResonance,
  tapSurgeIndex,
  legionMorale,
  stabilityStatus,
}) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <GlitchyTitle />
        
        <div className="metrics-container">
          <div className="metric-box">
            <h3 className="metric-title">Divine Girth Resonance (%)</h3>
            <GirthResonanceGauge value={girthResonance} />
          </div>
          
          <div className="metric-box">
            <h3 className="metric-title">Tap Surge Index</h3>
            <TapSurgeDisplay value={tapSurgeIndex} />
          </div>
          
          <div className="metric-box">
            <h3 className="metric-title">Legion Morale</h3>
            <LegionMoraleBar value={legionMorale} />
          </div>

          <div className="metric-box">
            <h3 className="metric-title">Oracle System Stability</h3>
            <SystemStability status={stabilityStatus} />
          </div>
        </div>
      </div>
    </div>
  );
};