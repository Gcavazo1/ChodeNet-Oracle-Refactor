import React, { useState } from 'react';
import { User, Star, Award, Shield, Edit3, Save, X, RefreshCw, Coins } from 'lucide-react';
import { UserProfile, GirthBalance, useSIWS } from '../../lib/useSIWS';

interface ProfileManagerProps {
  profile: UserProfile;
  balance: GirthBalance;
  onProfileUpdate?: (profile: UserProfile) => void;
  onClose: () => void;
}

interface ProfileEditState {
  isEditing: boolean;
  displayName: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

interface MintingState {
  isMinting: boolean;
  mintProgress: string;
  mintError: string | null;
  mintSuccess: boolean;
  cooldownRemaining: number;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  profile,
  balance,
  onProfileUpdate,
  onClose
}) => {
  const { updateProfile } = useSIWS();
  const [editState, setEditState] = useState<ProfileEditState>({
    isEditing: false,
    displayName: profile.display_name || '',
    bio: '',
    socialLinks: {}
  });

  const [mintState, setMintState] = useState<MintingState>({
    isMinting: false,
    mintProgress: '',
    mintError: null,
    mintSuccess: false,
    cooldownRemaining: 0
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate Oracle relationship progress
  const getRelationshipProgress = (relationship: string) => {
    const levels = ['novice', 'adept', 'master', 'legendary'];
    const currentIndex = levels.indexOf(relationship);
    return ((currentIndex + 1) / levels.length) * 100;
  };

  // Get relationship color and icon
  const getRelationshipDisplay = (relationship: string) => {
    switch (relationship) {
      case 'legendary':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', icon: Star };
      case 'master':
        return { color: 'text-purple-400', bgColor: 'bg-purple-400/20', icon: Award };
      case 'adept':
        return { color: 'text-blue-400', bgColor: 'bg-blue-400/20', icon: Shield };
      default:
        return { color: 'text-gray-400', bgColor: 'bg-gray-400/20', icon: User };
    }
  };

  // Format numbers for display
  const formatNumber = (num: number, decimals = 6) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };



  // Handle profile editing
  const handleEditToggle = () => {
    if (editState.isEditing) {
      // Cancel editing
      setEditState(prev => ({
        ...prev,
        isEditing: false,
        displayName: profile.display_name || '',
        bio: '',
        socialLinks: {}
      }));
    } else {
      // Start editing
      setEditState(prev => ({
        ...prev,
        isEditing: true
      }));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      console.log('Saving profile with updates:', { displayName: editState.displayName });
      
      const result = await updateProfile({
        displayName: editState.displayName.trim()
      });

      if (result.success) {
        console.log('Profile updated successfully');
        setEditState(prev => ({ ...prev, isEditing: false }));
        
        // Call onProfileUpdate if provided to update parent component
        if (onProfileUpdate) {
          onProfileUpdate({
            ...profile,
            display_name: editState.displayName.trim()
          });
        }
      } else {
        console.error('Profile update failed:', result.error);
        alert(`Failed to update profile: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle balance refresh
  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Implement balance refresh via SIWS context
      console.log('Balance refresh not yet implemented');
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle $GIRTH minting
  const handleMintGirth = async () => {
    if (balance.soft_balance <= 0) return;

    setMintState(prev => ({
      ...prev,
      isMinting: true,
      mintError: null,
      mintSuccess: false,
      mintProgress: 'Preparing mint transaction...'
    }));

    try {
      // TODO: Implement CAPTCHA verification
      setMintState(prev => ({ ...prev, mintProgress: 'Verifying CAPTCHA...' }));
      
      // TODO: Call mint API
      setMintState(prev => ({ ...prev, mintProgress: 'Processing mint...' }));
      
      // TODO: Wait for transaction confirmation
      setMintState(prev => ({ ...prev, mintProgress: 'Confirming transaction...' }));
      
      // Simulate success for now
      setTimeout(() => {
        setMintState(prev => ({
          ...prev,
          isMinting: false,
          mintSuccess: true,
          mintProgress: 'Mint successful!'
        }));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMintState(prev => ({ ...prev, mintSuccess: false }));
        }, 3000);
      }, 2000);
      
    } catch (error) {
      setMintState(prev => ({
        ...prev,
        isMinting: false,
        mintError: error instanceof Error ? error.message : 'Minting failed',
        mintProgress: ''
      }));
    }
  };

  const relationshipDisplay = getRelationshipDisplay(profile.oracle_relationship);
  const RelationshipIcon = relationshipDisplay.icon;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ paddingTop: '100px' }}
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
        
        {/* Modal Container */}
        <div 
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Liquid Glass Modal */}
          <div className="liquid-glass-modal">
            {/* Header */}
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${relationshipDisplay.bgColor} backdrop-blur-sm`}>
                  <RelationshipIcon className={`w-6 h-6 ${relationshipDisplay.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Oracle Profile</h2>
                  <p className="text-sm text-white/70">Manage your cosmic identity</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="modal-content">
              {/* Profile Section */}
              <div className="glass-section">
                <div className="section-header">
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                  <button
                    onClick={handleEditToggle}
                    className="glass-button"
                  >
                    {editState.isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </>
                    )}
                  </button>
                </div>

                <div className="profile-fields">
                  {/* Display Name */}
                  <div className="field-group">
                    <label className="field-label">Display Name</label>
                    {editState.isEditing ? (
                      <input
                        type="text"
                        value={editState.displayName}
                        onChange={(e) => setEditState(prev => ({ ...prev, displayName: e.target.value }))}
                        className="glass-input"
                        placeholder="Enter display name"
                      />
                    ) : (
                      <div className="field-value">
                        {profile.display_name || profile.username || 'Oracle Initiate'}
                      </div>
                    )}
                  </div>

                  {/* Wallet Address */}
                  <div className="field-group">
                    <label className="field-label">Wallet Address</label>
                    <div className="field-value font-mono text-sm">
                      {profile.wallet_address.slice(0, 8)}...{profile.wallet_address.slice(-8)}
                    </div>
                  </div>

                  {/* Oracle Relationship */}
                  <div className="field-group">
                    <label className="field-label">Oracle Relationship</label>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold capitalize ${relationshipDisplay.color}`}>
                        {profile.oracle_relationship}
                      </span>
                      <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                          style={{ width: `${getRelationshipProgress(profile.oracle_relationship)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {editState.isEditing && (
                  <div className="edit-actions">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="glass-button-primary"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Balance Section */}
              <div className="glass-section">
                <div className="section-header">
                  <h3 className="text-lg font-semibold text-white">$GIRTH Balance</h3>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="glass-button"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="balance-grid">
                  <div className="balance-card soft">
                    <div className="balance-header">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="balance-label">Soft Balance</span>
                    </div>
                    <div className="balance-amount text-yellow-400">
                      {formatNumber(balance.soft_balance, 3)}
                    </div>
                    <div className="balance-description">Unminted $GIRTH</div>
                  </div>

                  <div className="balance-card hard">
                    <div className="balance-header">
                      <Coins className="w-5 h-5 text-green-400" />
                      <span className="balance-label">Hard Balance</span>
                    </div>
                    <div className="balance-amount text-green-400">
                      {formatNumber(balance.hard_balance, 3)}
                    </div>
                    <div className="balance-description">Minted SPL Tokens</div>
                  </div>
                </div>

                {balance.soft_balance > 0 && (
                  <button
                    onClick={handleMintGirth}
                    disabled={mintState.isMinting}
                    className="mint-button"
                  >
                    {mintState.isMinting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        {mintState.mintProgress}
                      </>
                    ) : (
                      <>
                        <Coins className="w-5 h-5" />
                        Mint {formatNumber(balance.soft_balance, 3)} $GIRTH
                      </>
                    )}
                  </button>
                )}

                {mintState.mintError && (
                  <div className="error-message">
                    {mintState.mintError}
                  </div>
                )}

                {mintState.mintSuccess && (
                  <div className="success-message">
                    {mintState.mintProgress}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .liquid-glass-modal {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        }

        .modal-content {
          padding: 24px;
          max-height: 60vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .modal-content::-webkit-scrollbar {
          width: 6px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .glass-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .glass-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .glass-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .glass-button-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.6) 0%, rgba(147, 51, 234, 0.6) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .glass-button-primary:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%);
          transform: translateY(-1px);
        }

        .glass-button-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .profile-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .field-value {
          color: white;
          font-weight: 500;
          padding: 8px 0;
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          color: white;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .glass-input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .edit-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }

        .balance-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .balance-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .balance-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .balance-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .balance-label {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .balance-amount {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .balance-description {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .mint-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.6) 0%, rgba(59, 130, 246, 0.6) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .mint-button:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%);
          transform: translateY(-1px);
        }

        .mint-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          margin-top: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 14px;
        }

        .success-message {
          margin-top: 12px;
          padding: 12px;
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          color: #86efac;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .balance-grid {
            grid-template-columns: 1fr;
          }
          
          .modal-header {
            padding: 16px;
          }
          
          .modal-content {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}; 