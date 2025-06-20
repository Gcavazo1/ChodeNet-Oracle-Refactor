import React, { useState, useCallback, useContext, createContext, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  wallet_address: string;
  username?: string;
  display_name?: string;
  oracle_relationship: string;
  created_at: string;
}

export interface GirthBalance {
  soft_balance: number;
  hard_balance: number;
  lifetime_earned: number;
  lifetime_minted: number;
  last_mint_at?: string;
}

export interface OracleShards {
  balance: number;
  lifetime_earned: number;
  last_earn_at?: string;
  last_spend_at?: string;
}

export interface AuthSession {
  session_token: string;
  expires_at: string;
}

export interface SIWSResponse {
  success: boolean;
  message?: string;
  user_profile?: any;
  session?: any;
  girth_balance?: GirthBalance;
  oracle_shards?: OracleShards;
}

export interface SIWSContextType {
  user: any;
  userProfile: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  girthBalance: GirthBalance | null;
  oracleShards: OracleShards | null;
  signInWithSolana: (walletAddress: string, signedMessage: string, originalMessage: string) => Promise<SIWSResponse>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

interface SIWSContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  girthBalance: GirthBalance | null;
  oracleShards: OracleShards | null;
  session: AuthSession | null;
  walletConnected: boolean;
  walletAddress?: string;
  signMessage?: (message: string) => Promise<string>;
  authenticateWithSIWS: () => Promise<SIWSResponse>;
  signOut: () => void;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>;
}

const SIWSContext = createContext<SIWSContextValue | undefined>(undefined);

const createSIWSMessage = (walletAddress: string, nonce: string): string => {
  return `${window.location.host} wants you to sign in with your Solana account:\n${walletAddress}\n\nWelcome to the CHODE-NET Oracle! By signing, you agree to our terms and gain access to the $GIRTH economy.\n\nURI: ${window.location.origin}\nVersion: 1\nChain ID: 101\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
};

export const SIWSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, signMessage, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [girthBalance, setGirthBalance] = useState<GirthBalance | null>(null);
  const [oracleShards, setOracleShards] = useState<OracleShards | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  const authenticateWithSIWS = useCallback(async (): Promise<SIWSResponse> => {
    if (!publicKey || !signMessage || !connected) {
      return { success: false, message: 'Wallet not connected' };
    }

    setIsLoading(true);

    try {
      const nonce = crypto.randomUUID();
      const walletAddress = publicKey.toString();
      const message = createSIWSMessage(walletAddress, nonce);

      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      const anonymousSessionId = localStorage.getItem('session_id');
      const sessionMetadata = anonymousSessionId ? { anonymous_session_id: anonymousSessionId } : undefined;

      const { data, error } = await supabase.functions.invoke('siws-verify', {
        body: {
          message,
          signature: Array.from(signature),
          wallet_address: walletAddress,
          user_agent: navigator.userAgent,
          session_metadata: sessionMetadata
        }
      });

      if (error || !data?.success) {
        const errMsg = error?.message || data?.error || 'Authentication failed';
        return { success: false, message: errMsg };
      }

      setUserProfile(data.user_profile);
      setGirthBalance(data.girth_balance);
      setOracleShards(data.oracle_shards || { balance: 0, lifetime_earned: 0 });
      setSession(data.session);
      localStorage.setItem('siws_session_token', data.session.session_token);

      if (data.migration_status?.success) {
        localStorage.removeItem('session_id');
        localStorage.removeItem('unminted_girth');
      }

      return { success: true, user_profile: data.user_profile, session: data.session, girth_balance: data.girth_balance, oracle_shards: data.oracle_shards };
    } catch (err: any) {
      const msg = err?.message?.includes('User rejected') ? 'User cancelled the signature request' : 'Authentication failed';
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, connected]);

  const updateProfile = useCallback(async (updates: any): Promise<{ success: boolean; error?: string }> => {
    if (!userProfile?.wallet_address) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('update-user-profile', {
        body: {
          wallet_address: userProfile.wallet_address,
          updates
        }
      });

      if (error || !data?.success) {
        const errMsg = error?.message || data?.error || 'Profile update failed';
        return { success: false, error: errMsg };
      }

      // Update local state with the updated profile
      setUserProfile(data.profile);
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Profile update failed' };
    }
  }, [userProfile]);

  const signOut = useCallback(() => {
    setUserProfile(null);
    setGirthBalance(null);
    setOracleShards(null);
    setSession(null);
    localStorage.removeItem('siws_session_token');
  }, []);

  // Listen for balance updates from game sync operations
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      const updatedBalance = event.detail as GirthBalance;
      console.log('💰 [SIWS] Balance updated from game sync:', updatedBalance);
      setGirthBalance(updatedBalance);
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, []);

  // Create a wrapper for signMessage that returns a string
  const signMessageWrapper = useCallback(async (message: string): Promise<string> => {
    if (!signMessage || !connected) {
      throw new Error('Wallet not connected');
    }
    
    const messageBytes = new TextEncoder().encode(message);
    const signature = await signMessage(messageBytes);
    return btoa(String.fromCharCode(...signature));
  }, [signMessage, connected]);

  const value: SIWSContextValue = {
    isLoading,
    isAuthenticated: Boolean(userProfile && session),
    userProfile,
    girthBalance,
    oracleShards,
    session,
    walletConnected: connected,
    walletAddress: publicKey?.toString(),
    signMessage: connected ? signMessageWrapper : undefined,
    authenticateWithSIWS,
    signOut,
    updateProfile
  };

  return <SIWSContext.Provider value={value}>{children}</SIWSContext.Provider>;
};

export const useSIWS = (): SIWSContextValue => {
  const context = useContext(SIWSContext);
  if (!context) {
    throw new Error('useSIWS must be used within a SIWSProvider');
  }
  return context;
}; 