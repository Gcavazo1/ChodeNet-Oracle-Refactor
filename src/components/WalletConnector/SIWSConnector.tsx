import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { useSIWS } from '../../lib/useSIWS';
import { Wallet, Shield, Coins, User } from 'lucide-react';

/**
 * SIWS Wallet Connector Component
 * 
 * Provides comprehensive wallet connection and SIWS authentication
 * with Oracle profile integration and $GIRTH balance display
 */
export const SIWSConnector: React.FC = () => {
  const { connected } = useWallet();
  const {
    isLoading,
    isAuthenticated,
    userProfile,
    girthBalance,
    walletConnected,
    walletAddress,
    authenticateWithSIWS,
    signOut
  } = useSIWS();

  const handleSIWSAuth = async () => {
    if (!connected) {
      console.log('⚠️ Please connect wallet first');
      return;
    }

    const result = await authenticateWithSIWS();
    if (result.success) {
      console.log('🎉 SIWS Authentication successful!');
    } else {
      console.error('❌ SIWS Authentication failed:', result.error);
    }
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatGirth = (amount: number | undefined) => {
    if (!amount) return '0.000000';
    return amount.toFixed(6);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-purple-200 mb-2 flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" />
          CHODE-NET Oracle Access
        </h2>
        <p className="text-purple-300/70 text-sm">
          Sign-In With Solana (SIWS) Authentication
        </p>
      </div>

      {/* Wallet Connection Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-purple-300 text-sm font-medium">Wallet Status</span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            connected 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {!connected ? (
          <WalletMultiButton className="w-full !bg-purple-600 hover:!bg-purple-700 !text-white !font-medium !py-3 !px-4 !rounded-lg transition-colors" />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-200 text-sm">
              <Wallet className="w-4 h-4" />
              <span>{formatAddress(walletAddress)}</span>
            </div>
            <WalletDisconnectButton className="w-full !bg-red-600 hover:!bg-red-700 !text-white !font-medium !py-2 !px-4 !rounded-lg transition-colors" />
          </div>
        )}
      </div>

      {/* SIWS Authentication Section */}
      {connected && (
        <div className="border-t border-purple-500/30 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-sm font-medium">Oracle Access</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isAuthenticated 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }`}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </div>
          </div>

          {!isAuthenticated ? (
            <button
              onClick={handleSIWSAuth}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-purple-600/50 text-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              {isLoading ? 'Signing Message...' : 'Sign-In With Solana'}
            </button>
          ) : (
            <button
              onClick={signOut}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      )}

      {/* Profile Information */}
      {isAuthenticated && userProfile && (
        <div className="border-t border-purple-500/30 pt-4 space-y-3">
          <h3 className="text-purple-200 font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Oracle Profile
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Relationship:</span>
              <span className="text-purple-100 capitalize">{userProfile.oracle_relationship}</span>
            </div>
            
            {userProfile.username && (
              <div className="flex justify-between">
                <span className="text-purple-300">Username:</span>
                <span className="text-purple-100">{userProfile.username}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-purple-300">Joined:</span>
              <span className="text-purple-100">
                {new Date(userProfile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Girth Balance */}
      {isAuthenticated && girthBalance && (
        <div className="border-t border-purple-500/30 pt-4 space-y-3">
          <h3 className="text-purple-200 font-medium flex items-center gap-2">
            <Coins className="w-4 h-4" />
            $GIRTH Balance
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Soft Balance:</span>
              <span className="text-purple-100 font-mono">{formatGirth(girthBalance.soft_balance)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-purple-300">Hard Balance:</span>
              <span className="text-purple-100 font-mono">{formatGirth(girthBalance.hard_balance)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-purple-300">Lifetime Earned:</span>
              <span className="text-purple-100 font-mono">{formatGirth(girthBalance.lifetime_earned)}</span>
            </div>
          </div>

          {girthBalance.soft_balance > 0 && (
            <button className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gold-600 hover:bg-gold-700 text-white">
              Secure My Balance
            </button>
          )}
        </div>
      )}

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t border-purple-500/30 pt-4">
          <details className="text-xs">
            <summary className="text-purple-300 cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-purple-200 bg-black/20 p-2 rounded overflow-auto">
              {JSON.stringify({
                walletConnected,
                isAuthenticated,
                isLoading,
                userProfile: userProfile?.id,
                girthBalance: girthBalance && {
                  soft: girthBalance.soft_balance,
                  hard: girthBalance.hard_balance
                }
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}; 