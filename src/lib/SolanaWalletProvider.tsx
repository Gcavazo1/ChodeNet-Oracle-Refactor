import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import individual wallet adapters from their specific packages
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet';
import { Coin98WalletAdapter } from '@solana/wallet-adapter-coin98';
import { CloverWalletAdapter } from '@solana/wallet-adapter-clover';
import { SafePalWalletAdapter } from '@solana/wallet-adapter-safepal';
import { BitKeepWalletAdapter } from '@solana/wallet-adapter-bitkeep';
import { NightlyWalletAdapter } from '@solana/wallet-adapter-nightly';
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus';
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust';
import { BraveWalletAdapter } from '@solana/wallet-adapter-brave';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';

import { clusterApiUrl } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Ensure Buffer polyfill for wallet adapters in browser
if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

interface WalletProviderProps {
  children: React.ReactNode;
}

/**
 * Enhanced SolanaWalletProvider with comprehensive wallet support and SIWS integration
 * 
 * Features:
 * - Support for 18+ popular Solana wallets
 * - Automatic network detection from environment
 * - Custom RPC endpoint support
 * - Professional wallet modal UI
 * - Error handling and logging
 * - SIWS (Sign-In With Solana) ready
 */
export const SolanaWalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // Determine network based on environment
  const network = useMemo(() => {
    const env = import.meta.env.VITE_SOLANA_NETWORK;
    switch (env) {
      case 'mainnet-beta':
        return WalletAdapterNetwork.Mainnet;
      case 'testnet':
        return WalletAdapterNetwork.Testnet;
      case 'devnet':
      default:
        return WalletAdapterNetwork.Devnet;
    }
  }, []);

  // RPC endpoint configuration with fallback
  const endpoint = useMemo(() => {
    // Priority: Custom RPC > Legacy env var > Default cluster API
    const customRpc = import.meta.env.VITE_SOLANA_RPC_URL;
    const legacyRpc = import.meta.env.VITE_SOLANA_RPC_ENDPOINT;
    
    if (customRpc) {
      console.log('🔗 Using custom RPC endpoint:', customRpc);
      return customRpc;
    }
    
    if (legacyRpc) {
      console.log('🔗 Using legacy RPC endpoint:', legacyRpc);
      return legacyRpc;
    }
    
    const defaultEndpoint = clusterApiUrl(network);
    console.log(`🔗 Using default ${network} endpoint:`, defaultEndpoint);
    return defaultEndpoint;
  }, [network]);

  // Configure comprehensive wallet support
  const wallets = useMemo(() => {
    console.log('🔧 Initializing wallet adapters for network:', network);
    
    return [
      // Most popular wallets (prioritized)
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
      // Phantom & Solflare are provided automatically via Wallet Standard
      
      // Additional popular wallets
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
      new Coin98WalletAdapter(),
      new CloverWalletAdapter(),
      new SafePalWalletAdapter(),
      new BitKeepWalletAdapter(),
      new NightlyWalletAdapter(),
      new ExodusWalletAdapter(),
      new TrustWalletAdapter(),
      new BraveWalletAdapter(),
      new CoinbaseWalletAdapter(),
      
      // Hardware wallets
      new LedgerWalletAdapter(),
      
      // Legacy wallets
      new SolletWalletAdapter({ network })
    ];
  }, [network]);

  // Wallet connection configuration
  const walletConfig = useMemo(() => ({
    autoConnect: false, // Manual connection for better UX and SIWS flow
    onError: (error: Error) => {
      console.error('💥 Wallet connection error:', error);
      
      // Enhanced error logging for debugging
      if (error.message.includes('User rejected')) {
        console.log('ℹ️ User cancelled wallet connection');
      } else if (error.message.includes('Wallet not found')) {
        console.log('ℹ️ Wallet extension not installed');
      } else {
        console.error('🚨 Unexpected wallet error:', error.stack);
      }
    }
  }), []);

  // Connection provider configuration
  const connectionConfig = useMemo(() => ({
    commitment: 'confirmed' as const,
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    wsEndpoint: endpoint.replace('https://', 'wss://').replace('http://', 'ws://')
  }), [endpoint]);

  console.log('🚀 SolanaWalletProvider initialized:', {
    network,
    endpoint,
    walletsCount: wallets.length,
    autoConnect: walletConfig.autoConnect
  });

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={connectionConfig}
    >
      <WalletProvider 
        wallets={wallets} 
        {...walletConfig}
      >
        <WalletModalProvider
          featuredWallets={5} // Show top 5 wallets prominently
          includeGetWallet={true} // Show "Get Wallet" links for uninstalled wallets
        >
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 