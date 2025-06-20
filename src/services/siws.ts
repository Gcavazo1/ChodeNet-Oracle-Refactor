import { WalletAdapter } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SIWSMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

export interface UserProfile {
  id: string;
  wallet_address: string;
  username?: string;
  display_name?: string;
  oracle_relationship: string;
  profile_completion: number;
  total_sessions: number;
  created_at: string;
  last_login_at?: string;
}

export interface GirthBalance {
  soft_balance: number;
  hard_balance: number;
  lifetime_earned: number;
  lifetime_minted: number;
  last_mint_at?: string;
}

export interface WalletSession {
  session_token: string;
  expires_at: string;
  created_at: string;
}

export interface MigrationStatus {
  migrated: boolean;
  claimed_girth: number;
  claimed_taps: number;
  claimed_mega_slaps: number;
  claimed_giga_slaps: number;
}

export interface SIWSAuthResult {
  success: boolean;
  user_profile: UserProfile;
  session: WalletSession;
  girth_balance: GirthBalance | null;
  migration_status: MigrationStatus | null;
  error?: string;
}

export class SIWSManager {
  private static instance: SIWSManager;
  private currentSession: WalletSession | null = null;
  private currentProfile: UserProfile | null = null;
  private currentBalance: GirthBalance | null = null;

  static getInstance(): SIWSManager {
    if (!SIWSManager.instance) {
      SIWSManager.instance = new SIWSManager();
    }
    return SIWSManager.instance;
  }

  /**
   * Generate a SIWS message for wallet signing
   */
  private createSIWSMessage(publicKey: PublicKey, nonce: string): SIWSMessage {
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    return {
      domain: window.location.host,
      address: publicKey.toString(),
      statement: "Welcome to the CHODE-NET Oracle! By signing, you agree to our terms and gain access to the $GIRTH economy.",
      uri: window.location.origin,
      version: "1",
      chainId: 101, // Solana mainnet
      nonce,
      issuedAt: now.toISOString(),
      expirationTime: expirationTime.toISOString(),
      resources: [
        `${window.location.origin}/terms`,
        `${window.location.origin}/privacy`
      ]
    };
  }

  /**
   * Format SIWS message for signing
   */
  private formatSIWSMessage(message: SIWSMessage): string {
    const header = `${message.domain} wants you to sign in with your Solana account:`;
    const address = message.address;
    
    let body = `\n${message.statement}\n`;
    
    if (message.uri) body += `\nURI: ${message.uri}`;
    if (message.version) body += `\nVersion: ${message.version}`;
    if (message.chainId) body += `\nChain ID: ${message.chainId}`;
    if (message.nonce) body += `\nNonce: ${message.nonce}`;
    if (message.issuedAt) body += `\nIssued At: ${message.issuedAt}`;
    if (message.expirationTime) body += `\nExpiration Time: ${message.expirationTime}`;
    if (message.notBefore) body += `\nNot Before: ${message.notBefore}`;
    if (message.requestId) body += `\nRequest ID: ${message.requestId}`;
    if (message.resources && message.resources.length > 0) {
      body += `\nResources:`;
      message.resources.forEach(resource => {
        body += `\n- ${resource}`;
      });
    }

    return `${header}\n${address}${body}`;
  }

  /**
   * Connect wallet and perform SIWS authentication
   */
  async connectWallet(
    walletAdapter: WalletAdapter,
    options: {
      anonymousSessionId?: string;
      onProgress?: (step: string) => void;
    } = {}
  ): Promise<SIWSAuthResult> {
    const { anonymousSessionId, onProgress } = options;

    try {
      onProgress?.('Connecting to wallet...');

      // Ensure wallet is connected
      if (!walletAdapter.connected || !walletAdapter.publicKey) {
        await walletAdapter.connect();
      }

      if (!walletAdapter.publicKey) {
        throw new Error('Wallet connection failed - no public key available');
      }

      onProgress?.('Generating authentication message...');

      // Generate nonce and SIWS message
      const nonce = crypto.randomUUID();
      const siws = this.createSIWSMessage(walletAdapter.publicKey, nonce);
      const messageString = this.formatSIWSMessage(siws);

      onProgress?.('Requesting signature from wallet...');

      // Request signature from wallet
      const messageBytes = new TextEncoder().encode(messageString);
      const signature = await walletAdapter.signMessage!(messageBytes);

      onProgress?.('Verifying signature...');

      // Send to backend for verification
      const { data, error } = await supabase.functions.invoke('siws-verify', {
        body: {
          message: messageString,
          signature: Array.from(signature),
          wallet_address: walletAdapter.publicKey.toString(),
          user_agent: navigator.userAgent,
          session_metadata: anonymousSessionId ? {
            anonymous_session_id: anonymousSessionId
          } : undefined
        }
      });

      if (error) {
        console.error('SIWS verification error:', error);
        throw new Error(`Authentication failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      onProgress?.('Authentication successful!');

      // Store session data
      this.currentSession = data.session;
      this.currentProfile = data.user_profile;
      this.currentBalance = data.girth_balance;

      // Store session token in localStorage
      localStorage.setItem('siws_session_token', data.session.session_token);
      localStorage.setItem('siws_wallet_address', data.user_profile.wallet_address);

      // Clear anonymous session if migrated
      if (data.migration_status?.migrated && anonymousSessionId) {
        localStorage.removeItem('anonymous_session_id');
        localStorage.removeItem('unminted_girth');
      }

      return data as SIWSAuthResult;

    } catch (error) {
      console.error('SIWS connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown authentication error',
        user_profile: null as any,
        session: null as any,
        girth_balance: null,
        migration_status: null
      };
    }
  }

  /**
   * Disconnect wallet and clear session
   */
  async disconnectWallet(): Promise<void> {
    // Clear stored session data
    localStorage.removeItem('siws_session_token');
    localStorage.removeItem('siws_wallet_address');
    
    // Clear instance data
    this.currentSession = null;
    this.currentProfile = null;
    this.currentBalance = null;
  }

  /**
   * Check if user has valid session
   */
  async validateSession(): Promise<boolean> {
    const sessionToken = localStorage.getItem('siws_session_token');
    const walletAddress = localStorage.getItem('siws_wallet_address');

    if (!sessionToken || !walletAddress) {
      return false;
    }

    try {
      // Check if session is still valid (simplified - could call backend)
      if (this.currentSession) {
        const expiresAt = new Date(this.currentSession.expires_at);
        return expiresAt > new Date();
      }

      return false;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Get current user profile
   */
  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  /**
   * Get current girth balance
   */
  getCurrentBalance(): GirthBalance | null {
    return this.currentBalance;
  }

  /**
   * Get current session
   */
  getCurrentSession(): WalletSession | null {
    return this.currentSession;
  }

  /**
   * Refresh balance from backend
   */
  async refreshBalance(): Promise<GirthBalance | null> {
    if (!this.currentProfile) return null;

    try {
      const { data, error } = await supabase
        .from('girth_balances')
        .select('*')
        .eq('user_profile_id', this.currentProfile.id)
        .single();

      if (error) throw error;

      this.currentBalance = {
        soft_balance: parseFloat(data.soft_balance || '0'),
        hard_balance: parseFloat(data.hard_balance || '0'),
        lifetime_earned: parseFloat(data.lifetime_earned || '0'),
        lifetime_minted: parseFloat(data.lifetime_minted || '0'),
        last_mint_at: data.last_mint_at
      };

      return this.currentBalance;
    } catch (error) {
      console.error('Error refreshing balance:', error);
      return null;
    }
  }
} 