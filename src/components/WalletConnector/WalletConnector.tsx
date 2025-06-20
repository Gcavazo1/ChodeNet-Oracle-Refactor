import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Wallet, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  LogOut,
  User,
  Coins,
  Trophy,
  Clock,
  ExternalLink
} from 'lucide-react';
import { SIWSManager, UserProfile, GirthBalance, MigrationStatus } from '../../services/siws';
import './WalletConnector.css';

interface WalletConnectorProps {
  onAuthenticationChange?: (isAuthenticated: boolean, profile?: UserProfile) => void;
  onBalanceUpdate?: (balance: GirthBalance) => void;
  className?: string;
}

interface AuthenticationState {
  isConnecting: boolean;
  isAuthenticated: boolean;
  currentStep: string;
  error: string | null;
  profile: UserProfile | null;
  balance: GirthBalance | null;
  migrationStatus: MigrationStatus | null;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  onAuthenticationChange,
  onBalanceUpdate,
  className = ''
}) => {
  const { wallet, connected, connecting, disconnect } = useWallet();
  const [authState, setAuthState] = useState<AuthenticationState>({
    isConnecting: false,
    isAuthenticated: false,
    currentStep: '',
    error: null,
    profile: null,
    balance: null,
    migrationStatus: null
  });

  const siws = SIWSManager.getInstance();

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const isValid = await siws.validateSession();
      if (isValid) {
        const profile = siws.getCurrentProfile();
        const balance = siws.getCurrentBalance();
        
        if (profile) {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            profile,
            balance
          }));
          onAuthenticationChange?.(true, profile);
          if (balance) onBalanceUpdate?.(balance);
        }
      }
    };

    checkExistingSession();
  }, []);

  // Handle wallet connection and SIWS authentication
  const handleConnect = useCallback(async () => {
    if (!wallet?.adapter) return;

    setAuthState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
      currentStep: 'Initializing...'
    }));

    try {
      // Get anonymous session ID for migration
      const anonymousSessionId = localStorage.getItem('anonymous_session_id');

      const result = await siws.connectWallet(wallet.adapter, {
        anonymousSessionId: anonymousSessionId || undefined,
        onProgress: (step) => {
          setAuthState(prev => ({ ...prev, currentStep: step }));
        }
      });

      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isConnecting: false,
          isAuthenticated: true,
          profile: result.user_profile,
          balance: result.girth_balance,
          migrationStatus: result.migration_status,
          currentStep: 'Complete!'
        }));

        onAuthenticationChange?.(true, result.user_profile);
        if (result.girth_balance) onBalanceUpdate?.(result.girth_balance);

        // Show migration success if applicable
        if (result.migration_status?.migrated) {
          setTimeout(() => {
            setAuthState(prev => ({ ...prev, migrationStatus: null }));
          }, 5000);
        }
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        currentStep: ''
      }));
    }
  }, [wallet, onAuthenticationChange, onBalanceUpdate]);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    try {
      await siws.disconnectWallet();
      await disconnect();
      
      setAuthState({
        isConnecting: false,
        isAuthenticated: false,
        currentStep: '',
        error: null,
        profile: null,
        balance: null,
        migrationStatus: null
      });

      onAuthenticationChange?.(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [disconnect, onAuthenticationChange]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (connected && !authState.isAuthenticated && !authState.isConnecting) {
      handleConnect();
    }
  }, [connected, authState.isAuthenticated, authState.isConnecting, handleConnect]);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Format balance for display
  const formatBalance = (balance: number) => {
    return balance.toLocaleString(undefined, { 
      minimumFractionDigits: 6, 
      maximumFractionDigits: 6 
    });
  };

  // Get Oracle relationship color
  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'legendary': return 'text-yellow-400';
      case 'master': return 'text-purple-400';
      case 'adept': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Render migration success notification
  const renderMigrationSuccess = () => {
    if (!authState.migrationStatus?.migrated) return null;

    const { claimed_girth, claimed_taps, claimed_mega_slaps, claimed_giga_slaps } = authState.migrationStatus;

    return (
      <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-semibold">Anonymous Progress Claimed!</span>
        </div>
        <div className="text-sm text-green-300 space-y-1">
          <div>• Girth: {claimed_girth.toLocaleString()}</div>
          <div>• Total Taps: {claimed_taps.toLocaleString()}</div>
          <div>• Mega Slaps: {claimed_mega_slaps.toLocaleString()}</div>
          <div>• Giga Slaps: {claimed_giga_slaps.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  // Render connection progress
  const renderConnectionProgress = () => {
    if (!authState.isConnecting) return null;

    return (
      <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <div>
            <div className="text-blue-400 font-semibold">Authenticating...</div>
            <div className="text-sm text-blue-300">{authState.currentStep}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    if (!authState.error) return null;

    return (
      <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-semibold">Authentication Failed</span>
        </div>
        <div className="text-sm text-red-300">{authState.error}</div>
        <button
          onClick={() => setAuthState(prev => ({ ...prev, error: null }))}
          className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
        >
          Dismiss
        </button>
      </div>
    );
  };

  // Render authenticated user profile
  const renderUserProfile = () => {
    if (!authState.isAuthenticated || !authState.profile) return null;

    const { profile, balance } = authState;

    return (
      <div className="space-y-4">
        {/* User Info Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">
                {profile.display_name || profile.username || 'Oracle Initiate'}
              </div>
              <div className="text-sm text-gray-400">
                {formatAddress(profile.wallet_address)}
              </div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Oracle Relationship & Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Oracle Status</span>
            </div>
            <div className={`font-semibold capitalize ${getRelationshipColor(profile.oracle_relationship)}`}>
              {profile.oracle_relationship}
            </div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Sessions</span>
            </div>
            <div className="font-semibold text-white">{profile.total_sessions}</div>
          </div>
        </div>

        {/* Girth Balance */}
        {balance && (
          <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-yellow-400">$GIRTH Balance</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Soft Balance</div>
                <div className="font-mono text-lg text-yellow-300">
                  {formatBalance(balance.soft_balance)}
                </div>
                <div className="text-xs text-gray-500">Unminted</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Hard Balance</div>
                <div className="font-mono text-lg text-green-300">
                  {formatBalance(balance.hard_balance)}
                </div>
                <div className="text-xs text-gray-500">Minted SPL</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-yellow-500/20">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Lifetime Earned: {formatBalance(balance.lifetime_earned)}</span>
                <span>Lifetime Minted: {formatBalance(balance.lifetime_minted)}</span>
              </div>
            </div>

            {balance.last_mint_at && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Last mint: {new Date(balance.last_mint_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Profile Completion */}
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Profile Completion</span>
            <span className="text-sm font-semibold text-white">{profile.profile_completion}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profile.profile_completion}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render connection interface
  const renderConnectionInterface = () => {
    return (
      <div className="space-y-4">
        <div className="text-center p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            Connect to the Oracle
          </h3>
          
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Sign in with your Solana wallet to access the $GIRTH economy, claim your progress, and unlock Oracle features.
          </p>

          <div className="space-y-3">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !border-0 !rounded-lg !font-semibold !px-6 !py-3 !text-white !transition-all !duration-200 !transform hover:!scale-105" />
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>Secured by SIWS (Sign-In With Solana)</span>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center">
            <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="font-semibold text-white">$GIRTH Economy</div>
            <div className="text-gray-400">Earn and mint tokens</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center">
            <User className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="font-semibold text-white">Oracle Profile</div>
            <div className="text-gray-400">Track your relationship</div>
          </div>
          
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 text-center">
            <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="font-semibold text-white">Achievements</div>
            <div className="text-gray-400">Unlock rewards</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`wallet-connector ${className}`}>
      {renderMigrationSuccess()}
      {renderConnectionProgress()}
      {renderError()}
      
      {authState.isAuthenticated ? renderUserProfile() : renderConnectionInterface()}
    </div>
  );
}; 