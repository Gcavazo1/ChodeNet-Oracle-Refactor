import React, { useState, useEffect } from 'react';
import { WalletHeaderButton } from '../WalletConnector/WalletHeaderButton';
import { ProfileManager } from '../ProfileManager/ProfileManager';
import { UserProfile, GirthBalance, OracleShards } from '../../services/siws';
import { User, ChevronDown, Settings, LogOut, Wallet, Zap } from 'lucide-react';
import './OracleHeader.css';
import { useSIWS } from '../../lib/useSIWS';
import { useWallet } from '@solana/wallet-adapter-react';

interface OracleHeaderProps {
  onSectionChange?: (section: string) => void;
  currentSection?: string;
}

export const OracleHeader: React.FC<OracleHeaderProps> = ({ 
  onSectionChange, 
  currentSection = 'oracle' 
}) => {
  const [activeSection, setActiveSection] = useState(currentSection);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);

  // Access global SIWS & wallet adapter for disconnect/change-wallet actions
  const { signOut, oracleShards, isAuthenticated, userProfile, girthBalance } = useSIWS();
  const { disconnect: disconnectWallet } = useWallet();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-section')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    onSectionChange?.(section);
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    // Profile updates are now handled by useSIWS context
    // This is kept for the ProfileManager component
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'legendary': return 'text-yellow-400';
      case 'master': return 'text-purple-400';
      case 'adept': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(2)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(2)}K`;
    }
    return balance.toFixed(2);
  };

  const navigationSections = [
    { id: 'oracle', label: 'Oracle Sanctum', icon: '🔮' },
    { id: 'game', label: 'Game Feed', icon: '🎮' },
    { id: 'community', label: 'Community Nexus', icon: '🌐' }
  ];

  // Render authenticated user interface
  const renderAuthenticatedUser = () => {
    if (!userProfile) return null;

    return (
      <div className="authenticated-user">
        <div className="user-info" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
          <div className="user-avatar">
            <User className="w-5 h-5" />
          </div>
          
          <div className="user-details">
            <div className="user-name">
              {userProfile.display_name || userProfile.username || 'Oracle Initiate'}
            </div>
            <div className={`user-relationship ${getRelationshipColor(userProfile.oracle_relationship)}`}>
              {userProfile.oracle_relationship}
            </div>
          </div>

          {girthBalance && (
            <div className="user-balance">
              <div className="balance-item">
                <span className="balance-label">Soft:</span>
                <span className="balance-value text-yellow-400">
                  {formatBalance(girthBalance.soft_balance)}
                </span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Hard:</span>
                <span className="balance-value text-green-400">
                  {formatBalance(girthBalance.hard_balance)}
                </span>
              </div>
            </div>
          )}

          {oracleShards && (
            <div className="user-shards">
              <div className="balance-item">
                <span className="balance-label">Shards:</span>
                <span className="balance-value text-blue-400">
                  {formatBalance(oracleShards.balance)}
                </span>
              </div>
            </div>
          )}

          <ChevronDown className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
        </div>

        {/* Profile Dropdown */}
        {showProfileDropdown && (
          <div className="profile-dropdown">
            <div className="dropdown-header">
              <div className="dropdown-user-info">
                <div className="dropdown-avatar">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="dropdown-name">
                    {userProfile.display_name || userProfile.username || 'Oracle Initiate'}
                  </div>
                  <div className="dropdown-address">
                    {userProfile.wallet_address.slice(0, 4)}...{userProfile.wallet_address.slice(-4)}
                  </div>
                </div>
              </div>
            </div>

            <div className="dropdown-divider" />

            <div className="dropdown-menu">
              <button 
                className="dropdown-item"
                onClick={() => {
                  setShowProfileManager(true);
                  setShowProfileDropdown(false);
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Manage Profile</span>
              </button>
              
              {/* Disconnect Wallet & Oracle Session */}
              <button 
                className="dropdown-item text-red-400 hover:text-red-300"
                onClick={() => {
                  signOut();
                  disconnectWallet();
                  setShowProfileDropdown(false);
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>

              {/* Change Wallet = disconnect then open wallet modal (WalletHeaderButton will appear) */}
              <button
                className="dropdown-item"
                onClick={() => {
                  disconnectWallet();
                  signOut();
                  setShowProfileDropdown(false);
                }}
              >
                <Wallet className="w-4 h-4" />
                <span>Change Wallet</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
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
        
        <div className="user-section">
          {isAuthenticated ? (
            renderAuthenticatedUser()
          ) : (
            <WalletHeaderButton />
          )}
        </div>
      </header>

      {/* Profile Manager Modal */}
      {showProfileManager && userProfile && girthBalance && (
        <ProfileManager 
          profile={userProfile}
          balance={girthBalance}
          onProfileUpdate={handleProfileUpdate}
          onClose={() => setShowProfileManager(false)}
        />
      )}
    </>
  );
}; 