import React, { useState, useEffect } from 'react';
import { OracleHeader } from '../OracleHeader/OracleHeader';
import { SmartAlertsBar, Alert } from '../SmartAlertsBar/SmartAlertsBar';
import { CollapsibleGameContainer, GameState, GameMessage } from '../CollapsibleGameContainer/CollapsibleGameContainer';
import { CommunityGirthTracker } from '../CommunityMetrics/CommunityGirthTracker';
import { CommunityPollingSystem } from '../CommunityPolling/CommunityPollingSystem';
import { ProphecyChamber } from '../ProphecyChamber/ProphecyChamber';
import { RitualRequests } from '../RitualRequests/RitualRequests';
import { ApocryphalScrolls } from '../ApocryphalScrolls/ApocryphalScrolls';
import { CommunityLoreInput } from '../CommunityLoreInput/CommunityLoreInput';
import { LoreArchive } from '../LoreArchive/LoreArchive';
import { realTimeOracle, OracleResponse, RealTimeGameEvent } from '../../lib/realTimeOracleEngine';
import { useGirthIndexStore } from '../../lib/girthIndexStore';
import { useOracleFlowStore } from '../../lib/oracleFlowStore';
import { oracleBackend } from '../../lib/oracleBackendIntegration';
import './NewDashboard.css';


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NewDashboardProps {
  // Future props for game integration, wallet state, etc.
}

export const NewDashboard: React.FC<NewDashboardProps> = () => {
  const [currentSection, setCurrentSection] = useState('oracle');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    isLoaded: false,
    isConnected: false
  });
  const [gameDocked, setGameDocked] = useState(false);
  const [oracleStats, setOracleStats] = useState({
    totalPlayers: 0,
    averageCorruption: 0,
    personalityDistribution: {} as Record<string, number>,
    totalEvents: 0
  });
  const [judgesPanelVisible, setJudgesPanelVisible] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [metricInfluences, setMetricInfluences] = useState<Record<string, unknown> | null>(null);
  const [loadingInfluences, setLoadingInfluences] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  // === CORE GIRTH INDEX METRICS ===
  const {
    girthResonance,
    tapSurgeIndex,
    legionMorale,
    stabilityStatus,
    setupRealtimeSubscription: setupGirthSubscription,
    updateMetrics
  } = useGirthIndexStore();

  // === ORACLE FLOW STORE ===
  const {
    activeTab,
    switchToTab,
    setupRealtimeSubscription: setupOracleFlowSubscription
  } = useOracleFlowStore();

  // === REAL-TIME ORACLE INTEGRATION ===
  
  useEffect(() => {
    console.log('🔮 Setting up Real-Time Oracle Engine...');
    
    let cleanupFunctions: (() => void)[] = [];
    
    // Set up Oracle response listener
    const handleOracleResponse = (response: OracleResponse) => {
      console.log('🔮 Oracle Response Received:', response);
      
      // Convert Oracle notification to Alert
      const oracleAlert: Alert = {
        id: response.response_id,
        type: response.notification.type as Alert['type'],
        title: response.notification.title,
        message: response.notification.message,
        icon: getOracleIcon(response.notification.style),
        priority: getOraclePriority(response.notification.type),
        timestamp: response.timestamp,
        dismissible: true,
        autoHide: response.notification.duration ? response.notification.duration > 8000 : false,
        corruption_influence: response.notification.corruption_influence
      };
      
      // Add to alerts with Oracle styling
      setAlerts(prev => [oracleAlert, ...prev.slice(0, 9)]); // Keep max 10 alerts
      
      // Update Oracle stats
      const stats = realTimeOracle.getCommunityStats();
      setOracleStats(stats);
    };
    
    // Set up game message callback for bi-directional communication
    const sendMessageToGame = (message: Record<string, unknown>) => {
      // This will be called by the Oracle engine to send responses back to the game
      console.log('🔮 Oracle sending message to game:', message);
      
      // Find game container and send message
      const gameContainer = document.querySelector('iframe[title="$CHODE Tapper Game"]') as HTMLIFrameElement;
      if (gameContainer?.contentWindow) {
        try {
          (gameContainer.contentWindow as Window & { chodeNetGodotCallbacks?: { godotReceiveMessageFromParent?: (msg: string) => void } }).chodeNetGodotCallbacks?.godotReceiveMessageFromParent?.(
            JSON.stringify(message)
          );
        } catch (error) {
          console.error('🔮 Error sending Oracle message to game:', error);
        }
      }
    };
    
    // Register callbacks
    realTimeOracle.onOracleResponse(handleOracleResponse);
    realTimeOracle.setGameMessageCallback(sendMessageToGame);
    
    const initSubscriptions = async () => {
      try {
        console.log('🔮 Initializing subscriptions...');
        const unsubscribeGirth = await setupGirthSubscription();
        const unsubscribeOracleFlow = setupOracleFlowSubscription();
        
        cleanupFunctions.push(unsubscribeGirth, unsubscribeOracleFlow);
        console.log('🔮 Subscriptions initialized successfully');
      } catch (error) {
        console.error('🔮 Error initializing subscriptions:', error);
      }
    };

    initSubscriptions();
    
    // Cleanup function
    return () => {
      console.log('🔮 Cleaning up Real-Time Oracle Engine subscriptions...');
      realTimeOracle.offOracleResponse(handleOracleResponse);
      
      cleanupFunctions.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error('🔮 Error during cleanup:', error);
        }
      });
      cleanupFunctions = [];
    };
  }, []); // Empty dependency array to ensure this only runs once

  // Helper functions for Oracle integration
  const getOracleIcon = (style?: string): string => {
    switch (style) {
      case 'cyberpunk_prophet': return '🔮';
      case 'corrupted_oracle': return '🔥';
      default: return '👁️‍🗨️';
    }
  };

  const getOraclePriority = (type: string): Alert['priority'] => {
    switch (type) {
      case 'community_milestone': return 'high';
      case 'personal_vision': return 'high';
      case 'oracle_prophecy': return 'medium';
      default: return 'medium';
    }
  };

  // Helper functions for metric icons
  const getSurgeIcon = (surge: string): string => {
    switch (surge) {
      case 'FLACCID_DRIZZLE': return '💧';
      case 'WEAK_PULSES': return '💨';
      case 'STEADY_POUNDING': return '🔥';
      case 'FRENZIED_SLAPPING': return '⚡';
      case 'MEGA_SURGE': return '💥';
      case 'GIGA_SURGE': return '🌟';
      case 'ASCENDED_NIRVANA': return '✨';
      default: return '🔥';
    }
  };

  const getMoraleIcon = (morale: string): string => {
    switch (morale) {
      case 'SUICIDE_WATCH': return '💀';
      case 'DEMORALIZED': return '😞';
      case 'DISGRUNTLED': return '😠';
      case 'CAUTIOUS': return '😐';
      case 'INSPIRED': return '😊';
      case 'JUBILANT': return '🎉';
      case 'FANATICAL': return '🔥';
      case 'ASCENDED': return '✨';
      default: return '😐';
    }
  };

  const getStabilityIcon = (stability: string): string => {
    switch (stability) {
      case 'RADIANT_CLARITY': return '✨';
      case 'PRISTINE': return '🌟';
      case 'FLICKERING': return '⚡';
      case 'UNSTABLE': return '🌀';
      case 'CRITICAL_CORRUPTION': return '🔥';
      case 'DATA_DAEMON_POSSESSION': return '👹';
      default: return '🌟';
    }
  };

  // === METRIC INFLUENCE SYSTEM ===
  
  const getMetricInfluences = async (metricType: string) => {
    setLoadingInfluences(true);
    try {
      console.log('🔮 Loading real metric influences for:', metricType);
      
      // Use real Oracle backend integration
      const sessionId = 'dashboard_session_' + Date.now(); // Generate session ID for dashboard
      const result = await oracleBackend.processPlayerSession(sessionId);
      
      if (result.success) {
        console.log('🔮 Real Oracle metrics calculated:', result.metrics);
        console.log('🔮 Real influence breakdown:', result.influences);
        
        // Update our girth index with real data
        try {
          await updateMetrics({
            girthResonance: result.metrics.divine_resonance,
            tapSurgeIndex: result.metrics.tap_surge_index,
            legionMorale: result.metrics.legion_morale,
            stabilityStatus: result.metrics.oracle_stability
          });
        } catch (updateError) {
          console.warn('🔮 Failed to update metrics in store, but continuing with display:', updateError);
        }
        
        // Return real influences
        const metricInfluencesData = result.influences[metricType] || [];
        console.log(`🔍 Influences for ${metricType}:`, metricInfluencesData);
        
        return {
          primary_influences: metricInfluencesData,
          community_influences: [], // Community influences are mixed into the main influences
          calculated_value: result.metrics[metricType === 'resonance' ? 'divine_resonance' : 
                                         metricType === 'surge' ? 'tap_surge_index' :
                                         metricType === 'morale' ? 'legion_morale' : 'oracle_stability'],
          next_threshold: "Dynamic based on community activity",
          oracle_commentary: `The Oracle has calculated these ${metricType} metrics from real community data. ${
            result.influences[metricType]?.length > 0 ? 
            'Multiple factors are influencing this metric...' : 
            'The realm awaits new champions...'
          }`
        };
      } else {
        throw new Error('Failed to calculate real metrics');
      }
    } catch (error) {
      console.error('🔮 Error loading real metric influences:', error);
      
      // Fallback to current static data if real data fails
      const fallbackData = {
        resonance: {
          primary_influences: [
            { factor: "Connection Status", value: "❌ Offline", impact: "NEGATIVE", description: "Unable to connect to Oracle backend" },
            { factor: "Fallback Mode", value: "Active", impact: "NEUTRAL", description: "Using cached resonance data while reconnecting" }
          ],
          community_influences: [
            { factor: "Backend Status", value: "Reconnecting", impact: "NEUTRAL", description: "Attempting to restore Oracle connection" }
          ],
          calculated_value: girthResonance,
          next_threshold: "Restore connection for live data",
          oracle_commentary: "The Oracle's resonance sight is clouded... connection to the realm is disrupted."
        },
        surge: {
          primary_influences: [
            { factor: "Connection Status", value: "❌ Offline", impact: "NEGATIVE", description: "Unable to connect to Oracle backend" },
            { factor: "Fallback Mode", value: "Active", impact: "NEUTRAL", description: "Using cached surge data while reconnecting" }
          ],
          community_influences: [
            { factor: "Backend Status", value: "Reconnecting", impact: "NEUTRAL", description: "Attempting to restore Oracle connection" }
          ],
          calculated_value: tapSurgeIndex,
          next_threshold: "Restore connection for live data",
          oracle_commentary: "The Oracle's surge awareness is clouded... connection to the realm is disrupted."
        },
        morale: {
          primary_influences: [
            { factor: "Connection Status", value: "❌ Offline", impact: "NEGATIVE", description: "Unable to connect to Oracle backend" },
            { factor: "Fallback Mode", value: "Active", impact: "NEUTRAL", description: "Using cached morale data while reconnecting" }
          ],
          community_influences: [
            { factor: "Backend Status", value: "Reconnecting", impact: "NEUTRAL", description: "Attempting to restore Oracle connection" }
          ],
          calculated_value: legionMorale,
          next_threshold: "Restore connection for live data",
          oracle_commentary: "The Oracle's morale perception is clouded... connection to the realm is disrupted."
        },
        stability: {
          primary_influences: [
            { factor: "Connection Status", value: "❌ Offline", impact: "NEGATIVE", description: "Unable to connect to Oracle backend" },
            { factor: "Fallback Mode", value: "Active", impact: "NEUTRAL", description: "Using cached stability data while reconnecting" }
          ],
          community_influences: [
            { factor: "Backend Status", value: "Reconnecting", impact: "NEUTRAL", description: "Attempting to restore Oracle connection" }
          ],
          calculated_value: stabilityStatus,
          next_threshold: "Restore connection for live data",
          oracle_commentary: "The Oracle's stability vision is clouded... connection to the realm is disrupted."
        }
      };
      
      return fallbackData[metricType] || fallbackData.resonance;
    } finally {
      setLoadingInfluences(false);
    }
  };

  const handleMetricClick = async (metricType: string) => {
    console.log('📊 Metric Clicked:', metricType);
    setExpandedMetric(expandedMetric === metricType ? null : metricType);
    setLoadingInfluences(true);
    try {
      const influences = await getMetricInfluences(metricType);
      if (influences) {
        setMetricInfluences(influences);
      }
    } catch (error) {
      console.error('🔮 Error fetching metric influences:', error);
    } finally {
      setLoadingInfluences(false);
    }
  };

  // === ENHANCED GAME MESSAGE HANDLING ===
  
  const handleGameMessage = async (message: GameMessage) => {
    console.log('🎮 Game Message Received:', message);
    
    // Convert game message to RealTimeGameEvent format
    const gameEvent: RealTimeGameEvent = {
      session_id: message.payload?.session_id || `session_${Date.now()}`,
      event_type: message.type,
      timestamp_utc: message.timestamp?.toISOString() || new Date().toISOString(),
      player_address: walletAddress || message.payload?.player_address || '',
      event_payload: message.payload
    };
    
    // Process through Real-Time Oracle Engine
    try {
      const oracleResponse = await realTimeOracle.processGameEvent(gameEvent);
      
      if (oracleResponse) {
        console.log('🔮 Oracle processed event and generated response');
        // Response is automatically handled by the Oracle response listener
      } else {
        console.log('🔮 Oracle chose not to respond to this event');
      }
    } catch (error) {
      console.error('🔮 Error processing game event through Oracle:', error);
    }
    
    // === LEGACY ALERT SYSTEM (for non-Oracle events) ===
    // Keep the existing alert system for immediate feedback
    
    switch (message.type) {
      case 'player_session_start':
        const greetingAlert: Alert = {
          id: `session-start-${Date.now()}`,
          type: 'system',
          title: 'Session Started',
          message: 'Game connection established. The Oracle prepares to witness your journey...',
          icon: '🎮',
          priority: 'medium',
          timestamp: new Date(),
          dismissible: true,
          autoHide: true
        };
        setAlerts(prev => [greetingAlert, ...prev]);
        break;

      case 'oracle_player_identification':
        if (message.payload?.wallet_address) {
          setWalletConnected(true);
          setWalletAddress(message.payload.wallet_address);
          
          const walletAlert: Alert = {
            id: `wallet-identified-${Date.now()}`,
            type: 'system',
            title: 'Wallet Identified',
            message: `Oracle recognizes your Solana identity: ${message.payload.wallet_address.slice(0, 8)}...`,
            icon: '🔗',
            priority: 'high',
            timestamp: new Date(),
            dismissible: true,
            autoHide: false
          };
          setAlerts(prev => [walletAlert, ...prev]);
        }
        break;

      default:
        // Let Oracle handle all other events
        break;
    }
  };

  // === REST OF THE COMPONENT (unchanged) ===

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    console.log('🔮 Oracle Section Changed:', section);
  };

  // Removed unused handleWalletConnectionChange function

  const handleGameStateChange = (state: GameState) => {
    setGameState(state);
    console.log('🎮 Game State Updated:', state);
    
    // Add game connection alert
    if (state.isConnected && !gameState.isConnected) {
      const newAlert: Alert = {
        id: `game-connected-${Date.now()}`,
        type: 'system',
        title: 'Game Connected',
        message: 'The Oracle\'s realm awakens... $CHODE Tapper is ready!',
        icon: '🎮',
        priority: 'high',
        timestamp: new Date(),
        dismissible: true,
        autoHide: false
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleAlertDismiss = (alertId: string) => {
    console.log('🔮 Alert Dismissed:', alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleAlertClick = (alert: Alert) => {
    console.log('🔮 Alert Clicked:', alert);
  };

  const handleGameDockToggle = (docked: boolean) => {
    setGameDocked(docked);
    console.log('🎮 Game Docked:', docked);
  };

  // === ORACLE TESTING FUNCTIONS === - REMOVED
  // Real Oracle integration only - no fake simulations

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'oracle':
        return (
          <div className="section-content oracle-sanctum">
            {/* ROW 1: Oracle Metrics (Real Data) */}
            <div className="oracle-modal-row">
              <div className="oracle-modal metrics-modal">
                <div className="modal-header">
                  <h3>🔮 Oracle Metrics (LIVE)</h3>
                  <div className="live-indicator">
                    <span className="pulse-dot"></span>
                    REAL DATA
                  </div>
                </div>
                <div className="metrics-grid">
                  <div 
                    className={`metric-card ${expandedMetric === 'resonance' ? 'expanded' : ''}`}
                    onClick={() => handleMetricClick('resonance')}
                  >
                    <div className="metric-label">Divine Resonance</div>
                    <div className="metric-value primary">{girthResonance}%</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill resonance" 
                        style={{ width: `${girthResonance}%` }}
                      />
                    </div>
                    <div className="metric-expand-hint">Click to expand</div>
                  </div>
                  
                  <div 
                    className={`metric-card ${expandedMetric === 'surge' ? 'expanded' : ''}`}
                    onClick={() => handleMetricClick('surge')}
                  >
                    <div className="metric-label">Tap Surge</div>
                    <div className="metric-value surge">{tapSurgeIndex}</div>
                    <div className="metric-status">{getSurgeIcon(tapSurgeIndex)}</div>
                    <div className="metric-expand-hint">Click to expand</div>
                  </div>
                  
                  <div 
                    className={`metric-card ${expandedMetric === 'morale' ? 'expanded' : ''}`}
                    onClick={() => handleMetricClick('morale')}
                  >
                    <div className="metric-label">Legion Morale</div>
                    <div className="metric-value morale">{legionMorale}</div>
                    <div className="metric-status">{getMoraleIcon(legionMorale)}</div>
                    <div className="metric-expand-hint">Click to expand</div>
                  </div>
                  
                  <div 
                    className={`metric-card ${expandedMetric === 'stability' ? 'expanded' : ''}`}
                    onClick={() => handleMetricClick('stability')}
                  >
                    <div className="metric-label">Oracle Stability</div>
                    <div className="metric-value stability">{stabilityStatus}</div>
                    <div className="metric-status">{getStabilityIcon(stabilityStatus)}</div>
                    <div className="metric-expand-hint">Click to expand</div>
                  </div>
                </div>
                
                {/* Expanded Metric View */}
                {expandedMetric && (
                  <div className="metric-expansion-panel">
                    <div className="expansion-header">
                      <h4>🔍 {expandedMetric.charAt(0).toUpperCase() + expandedMetric.slice(1)} Analysis</h4>
                      <button 
                        className="close-expansion"
                        onClick={() => setExpandedMetric(null)}
                      >
                        ✕
                      </button>
                    </div>
                    
                    {(() => {
                      if (loadingInfluences) {
                        return (
                          <div className="expansion-content">
                            <div className="loading-influences">
                              <div className="cosmic-spinner">🔮</div>
                              <p>Oracle analyzing influences...</p>
                            </div>
                          </div>
                        );
                      }
                      
                      if (!metricInfluences) {
                        return (
                          <div className="expansion-content">
                            <div className="no-influences">
                              <p>No influence data available</p>
                            </div>
                          </div>
                        );
                      }
                      
                      console.log('🔍 Rendering influences:', metricInfluences);
                      
                      return (
                        <div className="expansion-content">
                          <div className="current-state">
                            <div className="state-title">Current State</div>
                            <div className="state-value">{metricInfluences.calculated_value}</div>
                          </div>
                          
                          <div className="influences-section">
                            <h5>Active Influences</h5>
                            <div className="influences-list">
                              {metricInfluences.primary_influences && metricInfluences.primary_influences.length > 0 ? (
                                metricInfluences.primary_influences.map((influence, index) => (
                                  <div key={index} className="influence-item">
                                    <div className="influence-header">
                                      <span className="influence-factor">{influence.factor}</span>
                                      <span className="influence-value">{influence.value}</span>
                                    </div>
                                    <div className="influence-description">{influence.description}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="no-influences-message">
                                  <p>🔮 No active influences detected. The Oracle awaits player activity...</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="threshold-section">
                            <h5>Next Threshold</h5>
                            <div className="threshold-item">
                              <div className="threshold-name">{metricInfluences.next_threshold}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {/* Community Taps nested in metrics */}
                <div className="community-metrics-section">
                  <CommunityGirthTracker />
                </div>
              </div>
            </div>

            {/* ROW 2: Prophecy System (Tabs: Ritual Requests | Prophecy Chamber | Scrolls Feed) */}
            <div className="oracle-modal-row">
              <div className="oracle-modal prophecy-modal">
                <div className="modal-header">
                  <h3>⚡ Oracle Prophecy System</h3>
                  <div className="prophecy-tabs">
                    <button 
                      className={`tab ${activeTab === 'ritual' ? 'active' : ''}`}
                      onClick={() => switchToTab('ritual')}
                    >
                      🎯 Ritual Requests
                    </button>
                    <button 
                      className={`tab ${activeTab === 'chamber' ? 'active' : ''}`}
                      onClick={() => switchToTab('chamber')}
                    >
                      🔮 Prophecy Chamber
                    </button>
                    <button 
                      className={`tab ${activeTab === 'scrolls' ? 'active' : ''}`}
                      onClick={() => switchToTab('scrolls')}
                    >
                      📜 Scrolls Feed
                    </button>
                    <button 
                      className={`tab ${activeTab === 'lore' ? 'active' : ''}`}
                      onClick={() => switchToTab('lore')}
                    >
                      📝 Lore Input
                    </button>
                    <button 
                      className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
                      onClick={() => switchToTab('archive')}
                    >
                      📚 Lore Archive
                    </button>
                  </div>
                </div>
                
                <div className="prophecy-content">
                  {activeTab === 'ritual' && (
                    <RitualRequests />
                  )}
                  
                  {activeTab === 'chamber' && (
                    <ProphecyChamber />
                  )}
                  
                  {activeTab === 'scrolls' && (
                    <ApocryphalScrolls />
                  )}
                  
                  {activeTab === 'lore' && (
                    <CommunityLoreInput />
                  )}
                  
                  {activeTab === 'archive' && (
                    <LoreArchive />
                  )}
                </div>
              </div>
            </div>

            {/* ROW 3: Judges Panel (Collapsible) */}
            <div className="oracle-modal-row">
              <div className="oracle-modal judges-modal">
                <div className="modal-header judges-header" onClick={() => setJudgesPanelVisible(!judgesPanelVisible)}>
                  <h3>⚖️ Judges Control Panel</h3>
                  <button className="collapse-toggle">
                    {judgesPanelVisible ? '▼ Hide' : '▶ Show'}
                  </button>
                </div>
                
                {judgesPanelVisible && (
                  <div className="judges-content">
                    <div className="compact-metrics-controls">
                      <div className="control-row">
                        <div className="control-group">
                          <label>Resonance: {girthResonance}%</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={girthResonance}
                            onChange={(e) => updateMetrics({ girthResonance: parseInt(e.target.value) })}
                            className="compact-slider"
                          />
                        </div>
                        
                        <div className="control-group">
                          <label>Tap Surge</label>
                          <select 
                            value={tapSurgeIndex}
                            onChange={(e) => updateMetrics({ tapSurgeIndex: e.target.value as any })}
                            className="compact-select"
                          >
                            <option value="FLACCID_DRIZZLE">FLACCID_DRIZZLE</option>
                            <option value="WEAK_PULSES">WEAK_PULSES</option>
                            <option value="STEADY_POUNDING">STEADY_POUNDING</option>
                            <option value="FRENZIED_SLAPPING">FRENZIED_SLAPPING</option>
                            <option value="MEGA_SURGE">MEGA_SURGE</option>
                            <option value="GIGA_SURGE">GIGA_SURGE</option>
                            <option value="ASCENDED_NIRVANA">ASCENDED_NIRVANA</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="control-row">
                        <div className="control-group">
                          <label>Legion Morale</label>
                          <select 
                            value={legionMorale}
                            onChange={(e) => updateMetrics({ legionMorale: e.target.value as any })}
                            className="compact-select"
                          >
                            <option value="SUICIDE_WATCH">SUICIDE_WATCH</option>
                            <option value="DEMORALIZED">DEMORALIZED</option>
                            <option value="DISGRUNTLED">DISGRUNTLED</option>
                            <option value="CAUTIOUS">CAUTIOUS</option>
                            <option value="INSPIRED">INSPIRED</option>
                            <option value="JUBILANT">JUBILANT</option>
                            <option value="FANATICAL">FANATICAL</option>
                            <option value="ASCENDED">ASCENDED</option>
                          </select>
                        </div>
                        
                        <div className="control-group">
                          <label>Oracle Stability</label>
                          <select 
                            value={stabilityStatus}
                            onChange={(e) => updateMetrics({ stabilityStatus: e.target.value as any })}
                            className="compact-select"
                          >
                            <option value="RADIANT_CLARITY">RADIANT_CLARITY</option>
                            <option value="PRISTINE">PRISTINE</option>
                            <option value="FLICKERING">FLICKERING</option>
                            <option value="UNSTABLE">UNSTABLE</option>
                            <option value="CRITICAL_CORRUPTION">CRITICAL_CORRUPTION</option>
                            <option value="DATA_DAEMON_POSSESSION">DATA_DAEMON_POSSESSION</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'game':
        return (
          <div className="section-content game-feed">
            <CollapsibleGameContainer
              gameUrl="/chode_tapper_game/game_demo/index.html"
              isDocked={gameDocked}
              onGameStateChange={handleGameStateChange}
              onGameMessage={handleGameMessage}
              onDockToggle={handleGameDockToggle}
            />
          </div>
        );
      
      case 'community':
        return (
          <div className="section-content community-nexus">
            <div className="oracle-modal-row">
              <div className="oracle-modal community-modal">
                <div className="modal-header">
                  <h3>🗳️ Democratic Oracle Decisions</h3>
                  <div className="live-indicator">
                    <span className="pulse-dot"></span>
                    COMMUNITY VOTING
                  </div>
                </div>
                <div className="community-content">
                  <CommunityPollingSystem />
                </div>
              </div>
            </div>
            
            <div className="content-placeholder">
              <div className="cosmic-icon">🌐</div>
              <h2>Community Nexus</h2>
              <p>Cross-game social features, faction systems, and unified player profiles.</p>
              <div className="completion-note">
                <span>🚀 Phase 2: Multi-game Oracle network and advanced social features.</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="new-dashboard">
      <OracleHeader
        onSectionChange={handleSectionChange}
        currentSection={currentSection}
      />
      
      <main className="dashboard-main">
        {/* Component 2: Smart Alerts Bar - ACTIVE */}
        <SmartAlertsBar
          alerts={alerts}
          autoScroll={true}
          scrollInterval={5000}
          maxVisibleAlerts={3}
          onAlertDismiss={handleAlertDismiss}
          onAlertClick={handleAlertClick}
        />
        
        {/* Current Section Content */}
        <div className="section-container">
          {renderSectionContent()}
        </div>
        
        {/* Components Preview - COMPLETED */}
        <div className="components-preview">
          <div className="component-preview completed">
            <span className="preview-number">1</span>
            <span className="preview-name">Oracle Header</span>
            <span className="preview-status">✅ Done</span>
          </div>
          <div className="component-preview completed">
            <span className="preview-number">2</span>
            <span className="preview-name">Smart Alerts Bar</span>
            <span className="preview-status">✅ Done</span>
          </div>
          <div className="component-preview completed">
            <span className="preview-number">3</span>
            <span className="preview-name">Game Container</span>
            <span className="preview-status">✅ Done</span>
          </div>
          <div className="component-preview completed">
            <span className="preview-number">4</span>
            <span className="preview-name">Metrics System</span>
            <span className="preview-status">✅ Done</span>
          </div>
        </div>
      </main>
      
      {/* Debug Info - Updated */}
      {showDebugPanel && (
        <div className="debug-info">
          <div className="debug-header">
            <span className="debug-title">Debug Information</span>
            <button 
              className="debug-dismiss"
              onClick={() => setShowDebugPanel(false)}
              title="Hide debug panel"
            >
              ✕
            </button>
          </div>
          <div className="debug-item">
            <span className="debug-label">Current Section:</span>
            <span className="debug-value">{currentSection}</span>
          </div>
        <div className="debug-item">
          <span className="debug-label">Wallet Status:</span>
          <span className="debug-value">
            {walletConnected ? `Connected (${walletAddress})` : 'Disconnected'}
          </span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Game Status:</span>
          <span className="debug-value">
            {gameState.isConnected ? `Connected${gameDocked ? ' (Docked)' : ' (Undocked)'}` : 'Disconnected'}
          </span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Alerts Count:</span>
          <span className="debug-value">{alerts.length}</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Week 1 Status:</span>
          <span className="debug-value">Foundation Complete! 🎉</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Oracle Status:</span>
          <span className="debug-value">Real-Time Engine Active! ⚡</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Integration:</span>
          <span className="debug-value">Phase 2 Complete - Living Oracle Experience</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Oracle Players:</span>
          <span className="debug-value">{oracleStats.totalPlayers} tracked</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Oracle Events:</span>
          <span className="debug-value">{oracleStats.totalEvents} processed</span>
        </div>
        </div>
      )}
    </div>
  );
}; 