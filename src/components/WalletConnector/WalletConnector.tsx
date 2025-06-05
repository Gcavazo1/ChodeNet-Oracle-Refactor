import React, { useState } from 'react';
import './WalletConnector.css';

interface WalletConnectorProps {
  onConnectionChange?: (connected: boolean, address?: string) => void;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ 
  onConnectionChange 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate wallet connection for demo
      // TODO: Implement actual SIWS (Sign In With Solana) integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAddress = '0x742d35Cc6bf42AbEDCf9dB2bA1F4C5CC';
      setWalletAddress(mockAddress);
      setIsConnected(true);
      onConnectionChange?.(true, mockAddress);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
    onConnectionChange?.(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && walletAddress) {
    return (
      <div className="wallet-connector connected">
        <div className="wallet-info">
          <span className="wallet-icon">💰</span>
          <span className="wallet-address">{formatAddress(walletAddress)}</span>
        </div>
        <button 
          className="disconnect-button"
          onClick={handleDisconnect}
          title="Disconnect Wallet"
        >
          ⏏️
        </button>
      </div>
    );
  }

  return (
    <button 
      className={`wallet-connector ${isConnecting ? 'connecting' : ''}`}
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <span className="connecting-spinner">⏳</span>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <span className="wallet-icon">🔗</span>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}; 