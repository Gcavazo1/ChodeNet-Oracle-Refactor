import React, { useState, useEffect } from 'react';
import { WalletConnector } from '../WalletConnector/WalletConnector';
import './OracleHeader.css';

interface OracleHeaderProps {
  onSectionChange?: (section: string) => void;
  currentSection?: string;
}

type OracleStatus = 'awakened' | 'dormant' | 'glitching';

export const OracleHeader: React.FC<OracleHeaderProps> = ({ 
  onSectionChange, 
  currentSection = 'oracle' 
}) => {
  const [oracleStatus, setOracleStatus] = useState<OracleStatus>('awakened');
  const [activeSection, setActiveSection] = useState(currentSection);

  // Simulate Oracle status changes for demo
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const statuses: OracleStatus[] = ['awakened', 'awakened', 'awakened', 'glitching'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setOracleStatus(randomStatus);
    }, 30000); // Change every 30 seconds

    return () => clearInterval(statusInterval);
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    onSectionChange?.(section);
  };

  const getStatusDisplay = () => {
    switch (oracleStatus) {
      case 'awakened':
        return { icon: '🟢', text: 'Live', class: 'status-live' };
      case 'glitching':
        return { icon: '⚡', text: 'Glitching', class: 'status-glitching' };
      case 'dormant':
        return { icon: '🔴', text: 'Dormant', class: 'status-dormant' };
      default:
        return { icon: '🟢', text: 'Live', class: 'status-live' };
    }
  };

  const navigationSections = [
    { id: 'oracle', label: 'Oracle Sanctum', icon: '🔮' },
    { id: 'game', label: 'Game Feed', icon: '🎮' },
    { id: 'community', label: 'Community Nexus', icon: '🌐' }
  ];

  const status = getStatusDisplay();

  return (
    <header className="oracle-header">
      <div className="brand-section">
        <div className="oracle-logo">
          <span className="cosmic-glyph">🔮</span>
          <div className="brand-text-container">
            <span className="brand-text">CHODE-NET</span>
            <span className="brand-subtitle">ORACLE</span>
          </div>
        </div>
      </div>
      
      <nav className="main-navigation">
        {navigationSections.map((section) => (
          <button 
            key={section.id}
            className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => handleSectionChange(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="oracle-status">
        <div className={`status-indicator ${status.class}`}>
          <span className="status-dot" />
          <span className="status-text">
            <span className="status-icon">{status.icon}</span>
            {status.text}
          </span>
        </div>
      </div>
      
      <div className="user-section">
        <WalletConnector />
      </div>
    </header>
  );
}; 