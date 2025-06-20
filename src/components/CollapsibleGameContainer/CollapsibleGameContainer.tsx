import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { realTimeOracle, OracleResponse } from '../../lib/realTimeOracleEngine';
import { setGameIframe, receiveGameEvent } from '../../lib/gameEventHandler';
import './CollapsibleGameContainer.css';

export interface GameState {
  isLoaded: boolean;
  isConnected: boolean;
  playerCount?: number;
  totalTaps?: number;
  currentGirth?: number;
  lastActivity?: Date;
}

export interface GameMessage {
  type: string;
  timestamp: Date;
  data: any; // Complete event data from the game
  payload?: {
    session_id?: string;
    player_address?: string;
    wallet_address?: string;
    [key: string]: any;
  };
}

interface CollapsibleGameContainerProps {
  gameUrl?: string;
  isDocked?: boolean;
  onGameStateChange?: (state: GameState) => void;
  onGameMessage?: (message: GameMessage) => void;
  onDockToggle?: (docked: boolean) => void;
  onOracleTest?: () => void; // NEW: Expose testing function
  className?: string;
}

export const CollapsibleGameContainer: React.FC<CollapsibleGameContainerProps> = ({
  gameUrl = '/chode_tapper_game/game_demo/index.html',
  isDocked: controlledDocked,
  onGameStateChange,
  onGameMessage,
  onDockToggle,
  onOracleTest,
  className = ''
}) => {
  const [internalDocked, setInternalDocked] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    isLoaded: false,
    isConnected: false
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null);

  
  const gameIframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🌉 NEW: Wallet integration for Phase 2.1
  const wallet = useWallet();

  // Use controlled or internal docked state
  const isDocked = controlledDocked !== undefined ? controlledDocked : internalDocked;
  
  // Debug logging for docked state
  useEffect(() => {
    console.log('🎮 Docked state update:', {
      controlledDocked,
      internalDocked,
      isDocked,
      timestamp: new Date().toISOString()
    });
  }, [controlledDocked, internalDocked, isDocked]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for messages from the game iframe
  const handleGameMessage = useCallback((event: MessageEvent) => {
    // === COMMUNICATION LOG: MESSAGE RECEIVED ===
    console.log('📥 [RECV] Raw message from iframe:', {
      data: event.data,
      origin: event.origin,
      source: event.source,
      timestamp: new Date().toISOString()
    });

    // Validate that the message is from our iframe
    if (event.source !== gameIframeRef.current?.contentWindow) {
      console.warn('⚠️ [RECV] Message rejected - not from our iframe:', {
        receivedSource: event.source,
        expectedSource: gameIframeRef.current?.contentWindow,
        data: event.data
      });
      return;
    }

    console.log('✅ [RECV] Message validated - processing:', event.data);
    
    try {
      const gameEventData = JSON.parse(event.data);
      
      console.log('🔄 [PARSE] Event data parsed successfully:', {
        event_type: gameEventData.event_type,
        session_id: gameEventData.session_id,
        player_address: gameEventData.player_address,
        payload_keys: gameEventData.event_payload ? Object.keys(gameEventData.event_payload) : [],
        timestamp: gameEventData.timestamp_utc
      });
      
      // === BACKEND FORWARDING FOR STATE PERSISTENCE ===
      console.log('💾 [BACKEND] Forwarding event to backend for processing:', gameEventData.event_type);
      
      // Forward to backend via gameEventHandler - this handles state persistence and logging
      const mockMessageEvent = {
        data: event.data,
        origin: 'http://localhost:5173', // Match the iframe origin
        source: gameIframeRef.current?.contentWindow
      } as MessageEvent;
      receiveGameEvent(mockMessageEvent);
      
      // === REAL-TIME ORACLE PROCESSING ===
      console.log('🔮 [ORACLE] Sending event to Oracle engine:', gameEventData.event_type);
      
      // Send to Real-Time Oracle Engine for processing
      realTimeOracle.processGameEvent(gameEventData)
        .then((oracleResponse) => {
          if (oracleResponse && oracleResponse.send_to_game) {
            console.log('🔮 [ORACLE] Oracle generated response - sending to game:', {
              response_id: oracleResponse.response_id,
              event_id: oracleResponse.event_id,
              notification_type: oracleResponse.notification.type,
              send_to_game: oracleResponse.send_to_game
            });
            // === SEND ORACLE RESPONSE BACK TO GAME ===
            sendOracleResponseToGame(oracleResponse);
          } else {
            console.log('🔮 [ORACLE] Oracle chose not to respond to this event:', gameEventData.event_type);
          }
        })
        .catch((error) => {
          console.error('❌ [ORACLE] Oracle processing error:', error);
        });
      
      // Convert to our internal GameMessage format
      const message: GameMessage = {
        type: gameEventData.event_type || 'unknown',
        timestamp: new Date(gameEventData.timestamp_utc || Date.now()),
        data: gameEventData,
        payload: gameEventData.event_payload
      };
      
      console.log('📤 [FORWARD] Forwarding to parent component (Dashboard):', {
        type: message.type,
        timestamp: message.timestamp,
        hasPayload: !!message.payload
      });
      
      // Send to parent component (Dashboard)
      onGameMessage?.(message);
      
    } catch (error) {
      console.error('❌ [PARSE] Error parsing game message:', error);
      console.log('📋 [DEBUG] Raw message data that failed to parse:', event.data);
    }
  }, [onGameMessage]);

  // === NEW: Message handling with useEffect ===
  useEffect(() => {
    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [handleGameMessage]);

  // 🌉 NEW: Monitor wallet changes for Phase 2.1
  useEffect(() => {
    console.log('🔄 [WALLET] Wallet state changed:', {
        connected: wallet.connected,
        address: wallet.publicKey?.toString()
      });
    
    // Send wallet status to docked game
    if (isDocked && gameIframeRef.current?.contentWindow) {
      const walletStatusMessage = {
        type: 'wallet_status_update',
        connected: wallet.connected,
        address: wallet.publicKey?.toString() || '',
        timestamp: new Date().toISOString()
      };
      
      try {
        const targetOrigin = getIframeOrigin();
        gameIframeRef.current.contentWindow.postMessage(JSON.stringify(walletStatusMessage), targetOrigin);
        console.log('📤 [WALLET] Sent wallet status to docked game:', walletStatusMessage);
      } catch (error) {
        console.error('❌ [WALLET] Failed to send wallet status to docked game:', error);
      }
    }

    // 🌉 NEW: Send wallet status to undocked game
    if (!isDocked && popoutWindow && !popoutWindow.closed) {
      console.log('🔄 [WALLET] Sending wallet update to undocked window...');
      sendWalletStatusToUndocked(popoutWindow);
    }
  }, [wallet.connected, wallet.publicKey, isDocked, popoutWindow]);

  // Helper function to get iframe origin
  const getIframeOrigin = () => {
    if (gameIframeRef.current?.src) {
      try {
        const url = new URL(gameIframeRef.current.src, window.location.origin);
        return url.origin;
      } catch {
        return window.location.origin;
      }
    }
    return window.location.origin;
  };

  // 🌉 NEW: Send wallet status to undocked window
  const sendWalletStatusToUndocked = (undockedWindow: Window) => {
    if (!undockedWindow || undockedWindow.closed) {
      console.warn('[Undocked] ⚠️ Cannot send wallet status - window not available');
      return;
    }

    const walletStatusMessage = {
      type: 'wallet_status_update',
      connected: wallet.connected,
      address: wallet.publicKey?.toString() || '',
      timestamp: new Date().toISOString()
    };

    try {
      console.log('[Undocked] 📤 Sending wallet status to undocked window:', walletStatusMessage);
      undockedWindow.postMessage(JSON.stringify(walletStatusMessage), '*');
      console.log('[Undocked] ✅ Wallet status sent to undocked window successfully');
    } catch (error) {
      console.error('[Undocked] ❌ Failed to send wallet status to undocked window:', error);
    }
  };

  // === NEW: Send Oracle responses back to the game ===
  const sendOracleResponseToGame = useCallback((oracleResponse: OracleResponse) => {
    console.log('📤 [SEND] Attempting to send Oracle response to game:', {
      response_id: oracleResponse.response_id,
      event_id: oracleResponse.event_id,
      notification_type: oracleResponse.notification.type,
      iframe_ready: !!gameIframeRef.current?.contentWindow
    });

    if (!gameIframeRef.current?.contentWindow) {
      console.error('❌ [SEND] Cannot send Oracle response - game iframe not ready:', {
        iframe_exists: !!gameIframeRef.current,
        content_window_exists: !!gameIframeRef.current?.contentWindow,
        response_id: oracleResponse.response_id
      });
      return;
    }

    const oracleMessage = {
      type: 'oracle_response',
      response_id: oracleResponse.response_id,
      event_id: oracleResponse.event_id,
      notification: oracleResponse.notification,
      corruption_shift: oracleResponse.corruption_shift || 0,
      timestamp: oracleResponse.timestamp.toISOString()
    };

    try {
      const messageJson = JSON.stringify(oracleMessage);
      console.log('📤 [SEND] Sending Oracle response via postMessage:', {
        message_size: messageJson.length,
        message_type: oracleMessage.type,
        notification_title: oracleMessage.notification.title,
        target_origin: '*'
      });
      
      const targetOrigin = getIframeOrigin();
      gameIframeRef.current.contentWindow.postMessage(messageJson, targetOrigin);
      
      console.log('✅ [SEND] Oracle response sent successfully:', {
        response_id: oracleMessage.response_id,
        timestamp: oracleMessage.timestamp
      });
    } catch (error) {
      console.error('❌ [SEND] Error sending Oracle response to game:', {
        error: error.message,
        response_id: oracleResponse.response_id,
        stack: error.stack
      });
    }
  }, []);





  // Notify parent of game state changes
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  // Handle iframe load
  const handleIframeLoad = () => {
    console.log('🎮 Game iframe loaded successfully');
    setGameState(prev => ({ ...prev, isLoaded: true, isConnected: true }));
    setConnectionStatus('connected'); // Set connected when iframe loads
    
    // 🔧 NEW: Set iframe reference for state persistence
    if (gameIframeRef.current) {
      setGameIframe(gameIframeRef.current);
      console.log('🔧 [STATE] Game iframe reference set for state persistence');
    }

    // 🌉 NEW: Send initial wallet status for Phase 2.1
    if (gameIframeRef.current) {
      console.log('🌉 [PHASE2.1] Sending initial wallet status to game...', {
        iframe: !!gameIframeRef.current,
        wallet: !!wallet,
        walletConnected: wallet.connected
      });
      
      // Send initial wallet status after iframe loads
      setTimeout(() => {
        const walletStatusMessage = {
          type: 'wallet_status_update',
          connected: wallet.connected,
          address: wallet.publicKey?.toString() || '',
          timestamp: new Date().toISOString()
        };
        
        try {
          const targetOrigin = getIframeOrigin();
          gameIframeRef.current?.contentWindow?.postMessage(JSON.stringify(walletStatusMessage), targetOrigin);
          console.log('✅ [PHASE2.1] Initial wallet status sent successfully');
        } catch (error) {
          console.error('❌ [PHASE2.1] Failed to send initial wallet status:', error);
        }
      }, 1000);
    }
    
    // Send initial message to game to establish communication
    setTimeout(() => {
      console.log('🎮 Sending initial connection test to game...');
      sendMessageToGame({
        type: 'oracle_connection_test',
        payload: {
          message: 'Oracle frontend connected - testing communication',
          timestamp: new Date().toISOString(),
          test_phase: 'initial_connection'
        }
      });
    }, 2000);
    
    // Additional verification check
    setTimeout(() => {
      if (gameIframeRef.current?.contentWindow) {
        console.log('🎮 Iframe verification - content window accessible:', !!gameIframeRef.current.contentWindow);
        console.log('🎮 Game callbacks available:', !!(gameIframeRef.current.contentWindow as any).chodeNetGodotCallbacks);
      }
    }, 3000);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.error('🎮 Game iframe failed to load');
    setConnectionStatus('failed');
    setGameState(prev => ({ ...prev, isLoaded: false, isConnected: false }));
  };

  // Send message to game (both docked and undocked)
  const sendMessageToGame = (message: any) => {
    console.log('📤 [SEND] Attempting to send message to game:', {
      message_type: message.type,
      is_docked: isDocked,
      iframe_ready: !!(isDocked && gameIframeRef.current?.contentWindow),
      popout_ready: !!(!isDocked && popoutWindow && !popoutWindow.closed),
      timestamp: new Date().toISOString()
    });

    // Send to docked iframe
    if (isDocked && gameIframeRef.current?.contentWindow) {
      try {
        const callbacks = gameIframeRef.current.contentWindow.chodeNetGodotCallbacks;
        console.log('📤 [SEND] Sending to docked iframe via callbacks:', {
          callbacks_exist: !!callbacks,
          godot_function_exists: !!callbacks?.godotReceiveMessageFromParent,
          message_type: message.type
        });
        
        callbacks?.godotReceiveMessageFromParent?.(JSON.stringify(message));
        
        console.log('✅ [SEND] Message sent to docked game successfully:', {
          message_type: message.type
        });
      } catch (error) {
        console.error('❌ [SEND] Error sending message to docked game:', {
          error: error.message,
          message_type: message.type,
          stack: error.stack
        });
      }
    }

    // Send to popout window
    if (!isDocked && popoutWindow && !popoutWindow.closed) {
      try {
        const callbacks = popoutWindow.chodeNetGodotCallbacks;
        console.log('📤 [SEND] Sending to popout window via callbacks:', {
          callbacks_exist: !!callbacks,
          godot_function_exists: !!callbacks?.godotReceiveMessageFromParent,
          message_type: message.type
        });
        
        callbacks?.godotReceiveMessageFromParent?.(JSON.stringify(message));
        
        console.log('✅ [SEND] Message sent to popout game successfully:', {
          message_type: message.type
        });
      } catch (error) {
        console.error('❌ [SEND] Error sending message to popout game:', {
          error: error.message,
          message_type: message.type,
          stack: error.stack
        });
      }
    }

    // Validation check
    if (isDocked && !gameIframeRef.current?.contentWindow) {
      console.warn('⚠️ [SEND] Message not sent - docked but iframe not ready:', {
        message_type: message.type,
        iframe_exists: !!gameIframeRef.current
      });
    }
    
    if (!isDocked && (!popoutWindow || popoutWindow.closed)) {
      console.warn('⚠️ [SEND] Message not sent - undocked but popout not ready:', {
        message_type: message.type,
        popout_exists: !!popoutWindow,
        popout_closed: popoutWindow?.closed
      });
    }
  };

  // Toggle docked state
  const handleDockToggle = () => {
    const newDocked = !isDocked;
    
    if (newDocked) {
      // Docking: Close popout window if open
      if (popoutWindow && !popoutWindow.closed) {
        popoutWindow.close();
        setPopoutWindow(null);
      }
    } else {
      // Undocking: Open popout window
      openPopoutWindow();
    }

    if (controlledDocked === undefined) {
      setInternalDocked(newDocked);
    }
    onDockToggle?.(newDocked);
  };

  // Open game in popout window
  const openPopoutWindow = () => {
    const gameWindow = window.open(
      '',
      'chode-tapper-game',
      `width=1280,height=800,left=${(screen.width - 1280) / 2},top=${(screen.height - 800) / 2},toolbar=no,menubar=no,scrollbars=no,resizable=yes,status=no`
    );

    if (gameWindow) {
      gameWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>$CHODE Tapper - Oracle Game</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #000;
              font-family: 'Inter', sans-serif;
              overflow: hidden;
            }
            .game-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: rgba(0, 0, 0, 0.9);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid rgba(107, 70, 193, 0.3);
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 1rem;
              z-index: 10;
            }
            .game-title {
              color: #F9FAFB;
              font-size: 1.125rem;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .game-icon {
              font-size: 1.5rem;
              animation: glow 2s ease-in-out infinite;
            }
            .dock-button {
              background: rgba(107, 70, 193, 0.2);
              border: 1px solid rgba(107, 70, 193, 0.4);
              border-radius: 0.5rem;
              color: #E5E7EB;
              padding: 0.5rem 1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 0.875rem;
            }
            .dock-button:hover {
              background: rgba(107, 70, 193, 0.3);
              border-color: #6B46C1;
            }
            iframe {
              position: absolute;
              top: 60px;
              left: 0;
              width: 100%;
              height: calc(100% - 60px);
              border: none;
              background: #000;
            }
            @keyframes glow {
              0%, 100% { filter: drop-shadow(0 0 6px #10B981); }
              50% { filter: drop-shadow(0 0 12px #10B981) drop-shadow(0 0 16px #6B46C1); }
            }
          </style>
        </head>
        <body>
          <div class="game-header">
            <div class="game-title">
              <span class="game-icon">🎮</span>
              $CHODE Tapper - Undocked
            </div>
            <button class="dock-button" onclick="window.close()">
              🔗 Dock to Oracle
            </button>
          </div>
          <iframe id="gameIframe" src="${gameUrl}" onload="handleGameLoad()"></iframe>
          
          <script>
            console.log('[Undocked] 🚀 Oracle communication bridge initializing...');
            
            let gameIframe = null;
            
            // Current wallet state (synced from parent)
            let currentWalletState = {
              connected: false,
              address: ''
            };
            
            function handleGameLoad() {
              gameIframe = document.getElementById('gameIframe');
              console.log('[Undocked] 🎮 Game iframe loaded in undocked window');
              
              // Send current wallet state to game
              sendWalletStatusToGame();
              
              // Test initial communication
              setTimeout(() => {
                sendMessageToGame({
                  type: 'oracle_connection_test',
                  payload: {
                    message: 'Undocked Oracle window connected',
                    timestamp: new Date().toISOString(),
                    test_phase: 'undocked_connection'
                  }
                });
              }, 1000);
            }
            
            // Listen for wallet status updates from parent Oracle window
            window.addEventListener('message', function(event) {
              // Only accept messages from parent Oracle window
              if (event.source !== window.opener) {
                return;
              }
              
              console.log('[Undocked] 📥 Received message from parent Oracle:', event.data);
              
              try {
                const messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                
                if (messageData.type === 'wallet_status_update') {
                  console.log('[Undocked] 💰 Wallet status update received:', messageData);
                  
                  // Update local wallet state
                  currentWalletState = {
                    connected: messageData.connected || false,
                    address: messageData.address || ''
                  };
                  
                  // Forward to game
                  sendWalletStatusToGame();
                }
                
                // Forward other Oracle messages to game
                else if (messageData.type && messageData.type.startsWith('oracle_')) {
                  console.log('[Undocked] 🔮 Forwarding Oracle message to game:', messageData.type);
                  sendMessageToGame(messageData);
                }
              } catch (error) {
                console.error('[Undocked] ❌ Error processing parent message:', error);
              }
            });
            
            function sendWalletStatusToGame() {
              if (!gameIframe || !gameIframe.contentWindow) {
                console.warn('[Undocked] ⚠️ Game iframe not ready for wallet status');
                return;
              }
              
              const walletMessage = {
                type: 'wallet_status_update',
                connected: currentWalletState.connected,
                address: currentWalletState.address,
                timestamp: new Date().toISOString()
              };
              
              console.log('[Undocked] 📤 Sending wallet status to game:', walletMessage);
              
              try {
                gameIframe.contentWindow.postMessage(JSON.stringify(walletMessage), '*');
                console.log('[Undocked] ✅ Wallet status sent to game successfully');
              } catch (error) {
                console.error('[Undocked] ❌ Failed to send wallet status to game:', error);
              }
            }
            
            function sendMessageToGame(message) {
              if (!gameIframe || !gameIframe.contentWindow) {
                console.warn('[Undocked] ⚠️ Game iframe not ready for message:', message.type);
                return;
              }
              
              try {
                const messageJson = JSON.stringify(message);
                gameIframe.contentWindow.postMessage(messageJson, '*');
                console.log('[Undocked] ✅ Message sent to game:', message.type);
              } catch (error) {
                console.error('[Undocked] ❌ Failed to send message to game:', error);
              }
            }
            
            // Listen for messages from game iframe
            window.addEventListener('message', function(event) {
              // Only process messages from our game iframe
              if (event.source !== gameIframe?.contentWindow) {
                return;
              }
              
              console.log('[Undocked] 📥 Received message from game:', event.data);
              
              // Forward game events to parent Oracle window
              if (window.opener && !window.opener.closed) {
                try {
                  window.opener.postMessage(event.data, '*');
                  console.log('[Undocked] 📤 Forwarded game message to parent Oracle');
                } catch (error) {
                  console.error('[Undocked] ❌ Failed to forward message to parent:', error);
                }
              }
            });
            
            console.log('[Undocked] ✅ Oracle communication bridge ready');
          </script>
        </body>
        </html>
      `);

      gameWindow.document.close();
      setPopoutWindow(gameWindow);

      // Send initial wallet status to undocked window
      setTimeout(() => {
        sendWalletStatusToUndocked(gameWindow);
      }, 2000);

      // Monitor window close
      const checkClosed = setInterval(() => {
        if (gameWindow.closed) {
          setPopoutWindow(null);
          // Auto-dock when window is closed
          if (controlledDocked === undefined) {
            setInternalDocked(true);
          }
          onDockToggle?.(true);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  };

  // Toggle fullscreen (mobile)
  const handleFullscreenToggle = () => {
    if (isMobile) {
      setIsFullscreen(!isFullscreen);
    }
  };

  // Get connection status display
  const getConnectionDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return { icon: '🔄', text: 'Connecting', class: 'status-connecting' };
      case 'connected':
        return { icon: '🟢', text: 'Live', class: 'status-connected' };
      case 'failed':
        return { icon: '🔴', text: 'Failed', class: 'status-failed' };
      default:
        return { icon: '⚪', text: 'Unknown', class: 'status-unknown' };
    }
  };

  const status = getConnectionDisplay();





  return (
    <div 
      ref={containerRef}
      className={`collapsible-game-container ${!isDocked ? 'undocked' : ''} ${isFullscreen ? 'fullscreen' : ''} ${className}`}
    >
      {/* Game Container Header */}
      <div className="game-header">
        <div className="game-title">
          <span className="game-icon">🎮</span>
          <span className="title-text">$CHODE Tapper - Genesis Demo</span>
        </div>
        
        <div className="game-stats">
          {gameState.totalTaps && (
            <div className="stat-item">
              <span className="stat-label">Taps:</span>
              <span className="stat-value">{gameState.totalTaps.toLocaleString()}</span>
            </div>
          )}
          {gameState.currentGirth && (
            <div className="stat-item">
              <span className="stat-label">GIRTH:</span>
              <span className="stat-value">{gameState.currentGirth.toFixed(2)}</span>
            </div>
          )}
          {gameState.playerCount && (
            <div className="stat-item">
              <span className="stat-label">Players:</span>
              <span className="stat-value">{gameState.playerCount}</span>
            </div>
          )}
        </div>
        
        <div className="game-controls">
          <div className={`connection-status ${status.class}`}>
            <span className="status-icon">{status.icon}</span>
            <span className="status-text">{status.text}</span>
          </div>
          
          {isMobile && (
            <button
              className="control-button fullscreen-button"
              onClick={handleFullscreenToggle}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? '📱' : '🖥️'}
            </button>
          )}
          
          <button
            className="control-button dock-button"
            onClick={handleDockToggle}
            title={isDocked ? 'Undock Game (Open in New Window)' : 'Dock Game (Return to Oracle)'}
          >
            {isDocked ? '🚀' : '🔗'}
          </button>
        </div>
      </div>

      {/* Docked Game Content */}
      {isDocked && (
        <div className="game-content flex">
          <div className="game-iframe-container flex-1">
            <iframe
              ref={gameIframeRef}
              src={gameUrl}
              title="$CHODE Tapper Game"
              className="game-iframe"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="gamepad; autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            
            {connectionStatus === 'connecting' && (
              <div className="loading-overlay">
                <div className="loading-spinner">
                  <span className="spinner-icon">🔄</span>
                  <span className="loading-text">Loading the Oracle's Game...</span>
                </div>
              </div>
            )}
            
            {connectionStatus === 'failed' && (
              <div className="error-overlay">
                <div className="error-content">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">Failed to load game</span>
                  <button 
                    className="retry-button"
                    onClick={() => {
                      setConnectionStatus('connecting');
                      if (gameIframeRef.current) {
                        gameIframeRef.current.src = gameIframeRef.current.src;
                      }
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Undocked Status */}
      {!isDocked && (
        <div className="undocked-status">
          <div className="undocked-content">
            <div className="undocked-icon">🚀</div>
            <h3 className="undocked-title">Game Undocked</h3>
            <p className="undocked-description">
              $CHODE Tapper is running in a separate window. Switch between the game and Oracle freely!
            </p>
            
            <div className="undocked-stats">
              <div className="undocked-stat">
                <span className="stat-label">Status:</span>
                <span className={`stat-value ${status.class}`}>{status.text}</span>
              </div>
              {gameState.lastActivity && (
                <div className="undocked-stat">
                  <span className="stat-label">Last Activity:</span>
                  <span className="stat-value">
                    {Math.floor((Date.now() - gameState.lastActivity.getTime()) / 1000)}s ago
                  </span>
                </div>
              )}
            </div>
            
            <div className="undocked-actions">
              <button className="action-button primary" onClick={handleDockToggle}>
                <span className="button-icon">🔗</span>
                Dock Game
              </button>
              {popoutWindow && !popoutWindow.closed && (
                <button 
                  className="action-button secondary" 
                  onClick={() => popoutWindow.focus()}
                >
                  <span className="button-icon">👁️</span>
                  Focus Game Window
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 