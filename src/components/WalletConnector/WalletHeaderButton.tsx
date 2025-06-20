import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, Shield } from 'lucide-react';
import { useSIWS } from '../../lib/useSIWS';
import { createPortal } from 'react-dom';

/**
 * Minimal wallet button for the Oracle header
 * Opens a modal with the full SIWS connector when clicked
 */
export const WalletHeaderButton: React.FC = () => {
  const { connected } = useWallet();
  const { 
    isAuthenticated, 
    userProfile,
    authenticateWithSIWS,
    isLoading
  } = useSIWS();
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleQuickAuth = async () => {
    if (!connected) {
      // If wallet not connected, open modal for connection
      handleOpenModal();
      return;
    }

    if (!isAuthenticated) {
      // If connected but not authenticated, do quick SIWS auth
      const result = await authenticateWithSIWS();
      if (result.success) {
        console.log('🎉 Quick SIWS authentication successful!');
      } else {
        console.error('❌ Quick SIWS authentication failed:', result.error);
        // Open modal for troubleshooting
        handleOpenModal();
      }
    }
  };

  // If already authenticated, don't show the button (header will show user profile)
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Sleek Header Button */}
      <button
        onClick={connected ? handleQuickAuth : handleOpenModal}
        disabled={isLoading}
        className={`wallet-header-btn group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-purple-200">Signing...</span>
            </>
          ) : connected ? (
            <>
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-purple-200">Sign In</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Connect</span>
            </>
          )}
        </div>
        
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>

      {/* Modal Overlay */}
      {showModal && createPortal(
        (<div className="fixed inset-0 z-50 flex items-start justify-center pt-28 md:pt-32 px-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 max-w-md w-full mx-4">
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-purple-200">Oracle Access</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-purple-300 hover:text-purple-100 transition-colors p-1 rounded-lg hover:bg-purple-500/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-purple-300 text-sm text-center">
                    Connect your Solana wallet and sign in to access the Oracle's full power
                  </p>
                  
                  {/* Wallet connection flow */}
                  <div className="w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 space-y-4">
                    <WalletConnectionFlow onSuccess={handleCloseModal} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>),
        document.body
      )}
    </>
  );
};

// Inline wallet connection flow component
const WalletConnectionFlow: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { connected } = useWallet();
  const { 
    isAuthenticated, 
    authenticateWithSIWS, 
    isLoading,
    userProfile,
    girthBalance
  } = useSIWS();

  const handleAuth = async () => {
    if (!connected) return;
    
    const result = await authenticateWithSIWS();
    if (result.success) {
      setTimeout(onSuccess, 1000); // Close modal after success
    }
  };

  // If authenticated, show success state
  if (isAuthenticated && userProfile) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-400 text-lg">✅ Successfully Connected!</div>
        <div className="text-purple-200">
          Welcome, <span className="text-purple-100 font-medium">{userProfile.display_name || 'Oracle Initiate'}</span>
        </div>
        <button
          onClick={onSuccess}
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Continue to Oracle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!connected ? (
        <div className="text-center">
          <p className="text-purple-300 mb-4">First, connect your Solana wallet:</p>
          {/* Use the actual wallet adapter components */}
          <div className="wallet-adapter-modal-wrapper">
            <style>{`
              .wallet-adapter-button {
                width: 100% !important;
                background: rgb(147 51 234) !important;
                border-radius: 0.5rem !important;
                padding: 0.75rem 1rem !important;
                font-weight: 500 !important;
                transition: background-color 0.2s !important;
              }
              .wallet-adapter-button:hover {
                background: rgb(126 34 206) !important;
              }
              .wallet-adapter-button:not([disabled]):hover {
                background: rgb(126 34 206) !important;
              }
            `}</style>
            <WalletMultiButton />
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-green-400">✅ Wallet Connected</div>
          <p className="text-purple-300 text-sm">Now sign the message to authenticate:</p>
          <button
            onClick={handleAuth}
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
        </div>
      )}
    </div>
  );
}; 