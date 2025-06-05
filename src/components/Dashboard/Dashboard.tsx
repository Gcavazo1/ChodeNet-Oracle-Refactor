import React, { useState, useEffect } from 'react';
import { GirthResonanceGauge } from '../GirthResonanceGauge/GirthResonanceGauge';
import { TapSurgeDisplay } from '../TapSurgeDisplay/TapSurgeDisplay';
import { LegionMoraleBar } from '../LegionMoraleBar/LegionMoraleBar';
import { SystemStability } from '../SystemStability/SystemStability';
import { GlitchyTitle } from '../GlitchyTitle/GlitchyTitle';
import { type StabilityStateType, type TapSurgeState, type LegionMoraleState } from '../../lib/types';
import { ProphecyChamber } from '../ProphecyChamber/ProphecyChamber';
import { RitualRequests } from '../RitualRequests/RitualRequests';
import { SpecialReport } from '../SpecialReport/SpecialReport';
import { DeveloperPanel } from '../DeveloperPanel/DeveloperPanel';
import { TokenInfoPanel } from '../TokenInfoPanel/TokenInfoPanel';
import { Toast } from '../Toast/Toast';
import { CommunityGirthTracker } from '../CommunityMetrics/CommunityGirthTracker';
import { CommunityPollingSystem } from '../CommunityPolling/CommunityPollingSystem';
import './Dashboard.css';

interface DashboardProps {
  girthResonance: number;
  tapSurgeIndex: TapSurgeState;
  legionMorale: LegionMoraleState;
  stabilityStatus: StabilityStateType;
}

export const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isOracleAwake, setIsOracleAwake] = useState(true);
  const [toastMessage, setToastMessage] = useState<string>('');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="overview-grid">
            {/* Core Oracle Metrics */}
            <div className="metrics-row">
              <SystemStability />
              <GirthResonanceGauge />
              <LegionMoraleBar />
            </div>

            {/* Community Power Section */}
            <div className="community-section">
              <CommunityGirthTracker />
            </div>

            {/* Oracle Prophecy & Community Voice */}
            <div className="oracle-interaction-row">
              <div className="prophecy-section">
                <ProphecyChamber />
                <TapSurgeDisplay />
              </div>
              <div className="community-voice-section">
                <CommunityPollingSystem />
              </div>
            </div>

            {/* Ritual Requests */}
            <div className="ritual-section">
              <RitualRequests />
            </div>
          </div>
        );

      case 'community':
        return (
          <div className="community-dashboard">
            <div className="community-header">
              <h2>🌐 COMMUNITY NEXUS</h2>
              <p>Where individual tappers unite as the eternal collective</p>
            </div>
            
            <div className="community-grid">
              <CommunityGirthTracker />
              <CommunityPollingSystem />
            </div>
          </div>
        );

      case 'prophecies':
        return (
          <div className="prophecy-dashboard">
            <ProphecyChamber />
            <SpecialReport />
          </div>
        );

      case 'developer':
        return <DeveloperPanel />;

      case 'tokens':
        return <TokenInfoPanel />;

      default:
        return renderMainContent();
    }
  };

  return (
    <div className="dashboard">
      {/* Oracle Header */}
      <div className="oracle-header">
        <div className="oracle-status">
          <span className={`oracle-eye ${isOracleAwake ? 'awake' : 'dormant'}`}>
            👁️‍🗨️
          </span>
          <div className="oracle-info">
            <h1 className="oracle-title">CHODE-NET ORACLE</h1>
            <p className="oracle-subtitle">
              {isOracleAwake 
                ? "The eternal guardian watches over the community..." 
                : "The Oracle slumbers, but the collective energy grows..."
              }
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="oracle-navigation">
          <button 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <span className="nav-icon">🏠</span>
            Oracle Sanctum
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'community' ? 'active' : ''}`}
            onClick={() => setActiveSection('community')}
          >
            <span className="nav-icon">🌐</span>
            Community Nexus
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'prophecies' ? 'active' : ''}`}
            onClick={() => setActiveSection('prophecies')}
          >
            <span className="nav-icon">🔮</span>
            Prophecy Chamber
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'developer' ? 'active' : ''}`}
            onClick={() => setActiveSection('developer')}
          >
            <span className="nav-icon">⚡</span>
            Developer Portal
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveSection('tokens')}
          >
            <span className="nav-icon">💰</span>
            Token Nexus
          </button>
        </nav>
      </div>

      {/* Main Oracle Content */}
      <main className="oracle-content">
        {renderMainContent()}
      </main>

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage('')} 
        />
      )}
    </div>
  );
};