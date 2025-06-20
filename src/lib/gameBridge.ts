/**
 * GameBridge - Oracle Page ↔ Godot Game Communication Layer
 * 
 * This module handles all blockchain operations on behalf of the Godot game,
 * removing the need for complex SDK integration within the game engine.
 * 
 * Architecture:
 * - Game sends requests via postMessage
 * - Oracle page handles wallet/blockchain operations
 * - Results are sent back to game via iframe communication
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface GameBridgeRequest {
  type: string;
  requestId: string;
  payload: any;
  timestamp: number;
}

export interface GameBridgeResponse {
  type: string;
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface WalletStatus {
  connected: boolean;
  address?: string;
  balance?: number;
  network: 'mainnet' | 'devnet' | 'testnet';
}

export interface SaveData {
  current_girth: number;
  total_mega_slaps: number;
  total_giga_slaps: number;
  current_giga_slap_streak: number;
  iron_grip_lvl1_purchased: boolean;
  timestamp: number;
  session_id: string;
}

export interface ChainTxResult {
  success: boolean;
  signature?: string;
  error?: string;
  timestamp: number;
}

export class GameBridge {
  private gameIframe: HTMLIFrameElement | null = null;
  private wallet: any = null;
  private connection: Connection;
  private isInitialized = false;
  private pendingRequests = new Map<string, (response: GameBridgeResponse) => void>();

  constructor() {
    // Initialize Solana connection (devnet for demo)
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.setupMessageListener();
  }

  /**
   * Initialize the bridge with wallet and iframe references
   */
  initialize(gameIframe: HTMLIFrameElement, wallet: any) {
    console.log('🌉 [BRIDGE] Initializing GameBridge...', {
      iframe: !!gameIframe,
      wallet: !!wallet,
      walletConnected: wallet?.connected
    });

    this.gameIframe = gameIframe;
    this.wallet = wallet;
    this.isInitialized = true;

    // Send initial wallet status to game
    this.sendWalletStatusToGame();

    console.log('✅ [BRIDGE] GameBridge initialized successfully');
  }

  /**
   * Listen for messages from the Godot game
   */
  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Only handle messages from our game iframe
      if (event.source !== this.gameIframe?.contentWindow) {
        return;
      }

      try {
        const request: GameBridgeRequest = JSON.parse(event.data);
        console.log('📥 [BRIDGE] Received request from game:', {
          type: request.type,
          requestId: request.requestId,
          payloadKeys: request.payload ? Object.keys(request.payload) : []
        });

        this.handleGameRequest(request);
      } catch (error) {
        console.error('❌ [BRIDGE] Error parsing game request:', error);
      }
    });
  }

  /**
   * Handle different types of requests from the game
   */
  private async handleGameRequest(request: GameBridgeRequest) {
    const { type, requestId, payload } = request;

    try {
      let response: GameBridgeResponse;

      switch (type) {
        case 'GET_WALLET_STATUS':
          response = await this.handleGetWalletStatus(requestId);
          break;

        case 'CONNECT_WALLET':
          response = await this.handleConnectWallet(requestId);
          break;

        case 'DISCONNECT_WALLET':
          response = await this.handleDisconnectWallet(requestId);
          break;

        case 'PUSH_SAVE_TO_CHAIN':
          response = await this.handlePushSaveToChain(requestId, payload);
          break;

        case 'LOAD_SAVE_FROM_CHAIN':
          response = await this.handleLoadSaveFromChain(requestId, payload);
          break;

        case 'MINT_ACHIEVEMENT_NFT':
          response = await this.handleMintAchievementNFT(requestId, payload);
          break;

        case 'TRANSFER_GIRTH_TOKEN':
          response = await this.handleTransferGirthToken(requestId, payload);
          break;

        case 'GET_LEADERBOARD_POSITION':
          response = await this.handleGetLeaderboardPosition(requestId, payload);
          break;

        case 'SUBMIT_SCORE':
          response = await this.handleSubmitScore(requestId, payload);
          break;

        default:
          response = {
            type: request.type + '_RESPONSE',
            requestId,
            success: false,
            error: `Unknown request type: ${type}`,
            timestamp: Date.now()
          };
      }

      this.sendResponseToGame(response);

    } catch (error) {
      console.error(`❌ [BRIDGE] Error handling ${type}:`, error);
      
      const errorResponse: GameBridgeResponse = {
        type: request.type + '_RESPONSE',
        requestId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };

      this.sendResponseToGame(errorResponse);
    }
  }

  /**
   * Send response back to the Godot game
   */
  private sendResponseToGame(response: GameBridgeResponse) {
    if (!this.gameIframe?.contentWindow) {
      console.error('❌ [BRIDGE] Cannot send response - iframe not available');
      return;
    }

    console.log('📤 [BRIDGE] Sending response to game:', {
      type: response.type,
      requestId: response.requestId,
      success: response.success
    });

    this.gameIframe.contentWindow.postMessage(JSON.stringify(response), '*');
  }

  /**
   * WALLET OPERATIONS
   */
  
  private async handleGetWalletStatus(requestId: string): Promise<GameBridgeResponse> {
    const status: WalletStatus = {
      connected: this.wallet?.connected || false,
      address: this.wallet?.publicKey?.toString(),
      network: 'devnet', // Could be configurable
    };

    if (status.connected && this.wallet?.publicKey) {
      try {
        const balance = await this.connection.getBalance(this.wallet.publicKey);
        status.balance = balance / LAMPORTS_PER_SOL;
      } catch (error) {
        console.warn('⚠️ [BRIDGE] Could not fetch wallet balance:', error);
      }
    }

    return {
      type: 'GET_WALLET_STATUS_RESPONSE',
      requestId,
      success: true,
      data: status,
      timestamp: Date.now()
    };
  }

  private async handleConnectWallet(requestId: string): Promise<GameBridgeResponse> {
    if (!this.wallet) {
      throw new Error('Wallet adapter not available');
    }

    try {
      await this.wallet.connect();
      
      // Send updated status after connection
      setTimeout(() => this.sendWalletStatusToGame(), 100);

      return {
        type: 'CONNECT_WALLET_RESPONSE',
        requestId,
        success: true,
        data: {
          address: this.wallet.publicKey?.toString(),
          connected: true
        },
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error}`);
    }
  }

  private async handleDisconnectWallet(requestId: string): Promise<GameBridgeResponse> {
    if (!this.wallet) {
      throw new Error('Wallet adapter not available');
    }

    try {
      await this.wallet.disconnect();
      
      // Send updated status after disconnection
      setTimeout(() => this.sendWalletStatusToGame(), 100);

      return {
        type: 'DISCONNECT_WALLET_RESPONSE',
        requestId,
        success: true,
        data: { connected: false },
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to disconnect wallet: ${error}`);
    }
  }

  /**
   * BLOCKCHAIN STATE OPERATIONS
   */

  private async handlePushSaveToChain(requestId: string, saveData: SaveData): Promise<GameBridgeResponse> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    console.log('💾 [BRIDGE] Pushing save data to chain:', {
      girth: saveData.current_girth,
      mega_slaps: saveData.total_mega_slaps,
      player: this.wallet.publicKey?.toString()
    });

    try {
      // TODO: Implement actual blockchain save transaction
      // For now, simulate the operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would:
      // 1. Create a transaction to save data to a program-derived address
      // 2. Sign and send the transaction
      // 3. Confirm the transaction
      
      const mockTxResult: ChainTxResult = {
        success: true,
        signature: '5K2r3X8mZ9...' + Date.now(), // Mock signature
        timestamp: Date.now()
      };

      return {
        type: 'PUSH_SAVE_TO_CHAIN_RESPONSE',
        requestId,
        success: true,
        data: mockTxResult,
        timestamp: Date.now()
      };

    } catch (error) {
      throw new Error(`Failed to push save to chain: ${error}`);
    }
  }

  private async handleLoadSaveFromChain(requestId: string, payload: any): Promise<GameBridgeResponse> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    console.log('📥 [BRIDGE] Loading save data from chain for:', this.wallet.publicKey?.toString());

    try {
      // TODO: Implement actual blockchain load operation
      // For now, simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));

      // In a real implementation, you would:
      // 1. Fetch account data from the blockchain
      // 2. Deserialize the saved game state
      // 3. Return the data to the game

      const mockSaveData: SaveData = {
        current_girth: 150,
        total_mega_slaps: 10,
        total_giga_slaps: 3,
        current_giga_slap_streak: 2,
        iron_grip_lvl1_purchased: true,
        timestamp: Date.now() - 3600000, // 1 hour ago
        session_id: 'chain_load_' + Date.now()
      };

      return {
        type: 'LOAD_SAVE_FROM_CHAIN_RESPONSE',
        requestId,
        success: true,
        data: mockSaveData,
        timestamp: Date.now()
      };

    } catch (error) {
      throw new Error(`Failed to load save from chain: ${error}`);
    }
  }

  /**
   * TOKEN & NFT OPERATIONS
   */

  private async handleMintAchievementNFT(requestId: string, payload: any): Promise<GameBridgeResponse> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    const { achievementId, achievementName, metadata } = payload;

    console.log('🏆 [BRIDGE] Minting achievement NFT:', {
      achievementId,
      achievementName,
      player: this.wallet.publicKey?.toString()
    });

    try {
      // TODO: Implement actual NFT minting
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockMintResult = {
        success: true,
        mintAddress: 'NFT' + Date.now() + 'mint',
        signature: '3M8k9L4...' + Date.now(),
        achievementId,
        timestamp: Date.now()
      };

      return {
        type: 'MINT_ACHIEVEMENT_NFT_RESPONSE',
        requestId,
        success: true,
        data: mockMintResult,
        timestamp: Date.now()
      };

    } catch (error) {
      throw new Error(`Failed to mint achievement NFT: ${error}`);
    }
  }

  private async handleTransferGirthToken(requestId: string, payload: any): Promise<GameBridgeResponse> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    const { amount, recipient, reason } = payload;

    console.log('🪙 [BRIDGE] Transferring GIRTH tokens:', {
      amount,
      recipient,
      reason,
      from: this.wallet.publicKey?.toString()
    });

    try {
      // TODO: Implement actual token transfer
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockTransferResult = {
        success: true,
        signature: '4H9x2K7...' + Date.now(),
        amount,
        recipient,
        timestamp: Date.now()
      };

      return {
        type: 'TRANSFER_GIRTH_TOKEN_RESPONSE',
        requestId,
        success: true,
        data: mockTransferResult,
        timestamp: Date.now()
      };

    } catch (error) {
      throw new Error(`Failed to transfer GIRTH tokens: ${error}`);
    }
  }

  /**
   * LEADERBOARD OPERATIONS
   */

  private async handleGetLeaderboardPosition(requestId: string, payload: any): Promise<GameBridgeResponse> {
    const { category, playerAddress } = payload;

    console.log('🏆 [BRIDGE] Getting leaderboard position:', {
      category,
      playerAddress: playerAddress || this.wallet?.publicKey?.toString()
    });

    try {
      // TODO: Implement actual leaderboard query
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockLeaderboardData = {
        position: Math.floor(Math.random() * 100) + 1,
        score: Math.floor(Math.random() * 10000),
        category,
        totalPlayers: 1000,
        timestamp: Date.now()
      };

      return {
        type: 'GET_LEADERBOARD_POSITION_RESPONSE',
        requestId,
        success: true,
        data: mockLeaderboardData,
        timestamp: Date.now()
      };

    } catch (error) {
      throw new Error(`Failed to get leaderboard position: ${error}`);
    }
  }

  private async handleSubmitScore(requestId: string, payload: any): Promise<GameBridgeResponse> {
    if (!this.wallet?.connected) {
      throw new Error('Wallet not connected');
    }

    const { category, score, metadata } = payload;

    console.log('🎯 [BRIDGE] Submitting score to leaderboard:', {
      category,
      score,
      player: this.wallet.publicKey?.toString(),
      metadata
    });

    try {
      // TODO: Implement actual score submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSubmissionResult = {
        success: true,
        newPosition: Math.floor(Math.random() * 50) + 1,
        previousPosition: Math.floor(Math.random() * 100) + 50,
        signature: '6N3l8P5...' + Date.now(),
        timestamp: Date.now()
      };

      return {
        type: 'SUBMIT_SCORE_RESPONSE',
        requestId,
        success: true,
        data: mockSubmissionResult,
        timestamp: Date.now()
      };

    } catch (error) {
      throw new Error(`Failed to submit score: ${error}`);
    }
  }

  /**
   * UTILITY METHODS
   */

  private sendWalletStatusToGame() {
    if (!this.isInitialized || !this.gameIframe?.contentWindow) {
      return;
    }

    const status: WalletStatus = {
      connected: this.wallet?.connected || false,
      address: this.wallet?.publicKey?.toString(),
      network: 'devnet',
    };

    const message = {
      type: 'WALLET_STATUS_UPDATE',
      requestId: 'auto_' + Date.now(),
      success: true,
      data: status,
      timestamp: Date.now()
    };

    console.log('📢 [BRIDGE] Broadcasting wallet status to game:', status);
    this.gameIframe.contentWindow.postMessage(JSON.stringify(message), '*');
  }

  /**
   * PUBLIC API for Oracle page components
   */

  public async requestFromGame(type: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.gameIframe?.contentWindow) {
        reject(new Error('Game iframe not available'));
        return;
      }

      const requestId = 'oracle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Store the promise resolver
      this.pendingRequests.set(requestId, resolve);

      const request: GameBridgeRequest = {
        type,
        requestId,
        payload: payload || {},
        timestamp: Date.now()
      };

      console.log('📤 [BRIDGE] Sending request to game:', { type, requestId });
      this.gameIframe.contentWindow.postMessage(JSON.stringify(request), '*');

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request ${type} timed out`));
        }
      }, 10000);
    });
  }

  public onWalletChange(wallet: any) {
    this.wallet = wallet;
    if (this.isInitialized) {
      this.sendWalletStatusToGame();
    }
  }
}

// Global bridge instance
export const gameBridge = new GameBridge();

// Export utility functions for React components
export const useGameBridge = () => {
  return {
    initialize: (iframe: HTMLIFrameElement, wallet: any) => gameBridge.initialize(iframe, wallet),
    onWalletChange: (wallet: any) => gameBridge.onWalletChange(wallet),
    requestFromGame: (type: string, payload?: any) => gameBridge.requestFromGame(type, payload)
  };
}; 