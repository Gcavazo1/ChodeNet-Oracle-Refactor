import React, { useState, useRef, useEffect, useCallback } from 'react';
import { realTimeOracle, OracleResponse } from '../../lib/realTimeOracleEngine';
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

  // Use controlled or internal docked state
  const isDocked = controlledDocked !== undefined ? controlledDocked : internalDocked;

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
    // Validate that the message is from our iframe
    if (event.source !== gameIframeRef.current?.contentWindow) {
      return;
    }

    console.log('🎮 Game Message Received:', event.data);
    
    try {
      const gameEventData = JSON.parse(event.data);
      
      // === REAL-TIME ORACLE PROCESSING ===
      // Send to Real-Time Oracle Engine for processing
      realTimeOracle.processGameEvent(gameEventData)
        .then((oracleResponse) => {
          if (oracleResponse && oracleResponse.send_to_game) {
            // === SEND ORACLE RESPONSE BACK TO GAME ===
            sendOracleResponseToGame(oracleResponse);
          }
        })
        .catch((error) => {
          console.error('🔮 Oracle processing error:', error);
        });
      
      // Convert to our internal GameMessage format
      const message: GameMessage = {
        type: gameEventData.event_type || 'unknown',
        timestamp: new Date(gameEventData.timestamp_utc || Date.now()),
        data: gameEventData
      };
      
      // Send to parent component (Dashboard)
      onGameMessage?.(message);
      
      setLastMessage(message);
      
    } catch (error) {
      console.error('🔮 Error parsing game message:', error);
      console.log('Raw message data:', event.data);
    }
  }, [onGameMessage]);

  // === NEW: Message handling with useEffect ===
  useEffect(() => {
    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [handleGameMessage]);

  // === NEW: Send Oracle responses back to the game ===
  const sendOracleResponseToGame = useCallback((oracleResponse: OracleResponse) => {
    if (!gameIframeRef.current?.contentWindow) {
      console.warn('🔮 Cannot send Oracle response - game iframe not ready');
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
      gameIframeRef.current.contentWindow.postMessage(messageJson, '*');
      console.log('🔮 Oracle Response Sent to Game:', oracleMessage);
    } catch (error) {
      console.error('🔮 Error sending Oracle response to game:', error);
    }
  }, []);

  // === ENHANCED: Oracle Testing Functions ===
  const testOracleConnection = useCallback(() => {
    if (!gameIframeRef.current?.contentWindow) {
      console.warn('🔮 Cannot test Oracle - game iframe not ready');
      return;
    }

    const testResponse = {
      type: 'oracle_test',
      message: 'The Oracle awakens... Testing bi-directional communication.',
      timestamp: new Date().toISOString(),
      test_id: `test_${Date.now()}`
    };

    try {
      const messageJson = JSON.stringify(testResponse);
      gameIframeRef.current.contentWindow.postMessage(messageJson, '*');
      console.log('🔮 Oracle Test Message Sent:', testResponse);
    } catch (error) {
      console.error('🔮 Error sending Oracle test:', error);
    }
  }, []);

  const sendProphecyToGame = useCallback((prophecy: any) => {
    if (!gameIframeRef.current?.contentWindow) {
      console.warn('🔮 Cannot send prophecy - game iframe not ready');
      return;
    }

    const prophecyMessage = {
      type: 'oracle_prophecy',
      title: prophecy.title,
      message: prophecy.message,
      icon: prophecy.icon,
      priority: prophecy.priority,
      timestamp: new Date().toISOString()
    };

    try {
      const messageJson = JSON.stringify(prophecyMessage);
      gameIframeRef.current.contentWindow.postMessage(messageJson, '*');
      console.log('🔮 Prophecy Sent to Game:', prophecyMessage);
    } catch (error) {
      console.error('🔮 Error sending prophecy to game:', error);
    }
  }, []);

  // Notify parent of game state changes
  useEffect(() => {
    onGameStateChange?.(gameState);
  }, [gameState, onGameStateChange]);

  // Handle iframe load
  const handleIframeLoad = () => {
    console.log('🎮 Game iframe loaded');
    setGameState(prev => ({ ...prev, isLoaded: true }));
    
    // Send initial message to game to establish communication
    setTimeout(() => {
      sendMessageToGame({
        type: 'oracle_connection_test',
        payload: {
          message: 'Oracle frontend connected',
          timestamp: new Date().toISOString()
        }
      });
    }, 2000);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.error('🎮 Game iframe failed to load');
    setConnectionStatus('failed');
    setGameState(prev => ({ ...prev, isLoaded: false, isConnected: false }));
  };

  // Send message to game (both docked and undocked)
  const sendMessageToGame = (message: any) => {
    // Send to docked iframe
    if (isDocked && gameIframeRef.current?.contentWindow) {
      try {
        gameIframeRef.current.contentWindow.chodeNetGodotCallbacks?.godotReceiveMessageFromParent?.(
          JSON.stringify(message)
        );
      } catch (error) {
        console.error('Error sending message to docked game:', error);
      }
    }

    // Send to popout window
    if (!isDocked && popoutWindow && !popoutWindow.closed) {
      try {
        popoutWindow.chodeNetGodotCallbacks?.godotReceiveMessageFromParent?.(
          JSON.stringify(message)
        );
      } catch (error) {
        console.error('Error sending message to popout game:', error);
      }
    }

    console.log('📨 Message sent to game:', message);
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
          <iframe src="${gameUrl}" onload="parent.postMessage({type:'popout_loaded'}, '*')"></iframe>
        </body>
        </html>
      `);

      gameWindow.document.close();
      setPopoutWindow(gameWindow);

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

  // === EXPOSE Oracle testing functions via callback ===
  useEffect(() => {
    if (onOracleTest) {
      // Provide the testing function to parent component
      (window as any).testOracleConnection = testOracleConnection;
    }
  }, [onOracleTest, testOracleConnection]);

  // === ADD Oracle testing button to debug panel ===
  const renderDebugPanel = () => (
    <div className="debug-panel">
      <h4>🔧 Debug Panel</h4>
      <div className="debug-controls">
        <button 
          className="debug-button"
          onClick={testOracleConnection}
        >
          🔮 Test Oracle Communication
        </button>
        <button 
          className="debug-button"
          onClick={() => sendProphecyToGame({
            title: 'Test Prophecy',
            message: 'The Oracle speaks... This is a test prophecy message.',
            icon: '🔮',
            priority: 'medium'
          })}
        >
          📜 Send Test Prophecy
        </button>
      </div>
      <div className="debug-info">
        <div>Connection: <span className={`status ${connectionStatus}`}>{connectionStatus}</span></div>
        <div>Last Message: {lastMessage ? `${lastMessage.type} at ${lastMessage.timestamp.toLocaleTimeString()}` : 'None'}</div>
        <div>Game State: {gameState.isLoaded ? 'Loaded' : 'Loading'}</div>
      </div>
    </div>
  );

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
        <div className="game-content">
          <div className="game-iframe-container">
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

      {renderDebugPanel()}
    </div>
  );
}; 