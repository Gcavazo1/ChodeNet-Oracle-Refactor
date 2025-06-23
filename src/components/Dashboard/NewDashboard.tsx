import React, { useState, useEffect } from 'react';
import { OracleHeader } from '../OracleHeader/OracleHeader';
import { SmartAlertsBar, Alert } from '../SmartAlertsBar/SmartAlertsBar';
import { GameState, GameMessage } from '../CollapsibleGameContainer/CollapsibleGameContainer';
import { RitualLab } from '../RitualLab/RitualLab';
import { realTimeOracle, OracleResponse, RealTimeGameEvent } from '../../lib/realTimeOracleEngine';
import { useGirthIndexStore } from '../../lib/girthIndexStore';
import { useOracleFlowStore, useOracleLoreStore } from '../../lib/oracleFlowStore';
import { useSIWS } from '../../lib/useSIWS';
import { oracleMetricsService } from '../../lib/oracleMetricsService';
import './NewDashboard.css';
import { useOracleAnimations } from './dashboardAnimationsStub';
import { GameSection } from './sections/GameSection';
import { CommunitySection } from './sections/CommunitySection';
import { OracleSection } from './sections/OracleSection';


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NewDashboardProps {
  // Future props for game integration, wallet state, etc.
}

export const NewDashboard: React.FC<NewDashboardProps> = () => {
  const [currentSection, setCurrentSection] = useState('oracle');
  
  // Use SIWS context for wallet state
  const { isAuthenticated, userProfile } = useSIWS();
  const walletConnected = isAuthenticated;
  const walletAddress = userProfile?.wallet_address || null;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    isLoaded: false,
    isConnected: false
  });
  const [gameDocked, setGameDocked] = useState(true); // Game starts docked by default
  const [judgesPanelVisible, setJudgesPanelVisible] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [metricInfluences, setMetricInfluences] = useState<any>(null);
  const [loadingInfluences, setLoadingInfluences] = useState(false);
  const [showCommunityShowcase, setShowCommunityShowcase] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showReferendumModal, setShowReferendumModal] = useState(false);
  const [showRitualLab, setShowRitualLab] = useState(false);

  // No-op animations until framer-motion phase
  const animations = useOracleAnimations();

  // === CORE GIRTH INDEX METRICS ===
  const {
    girthResonance = 50,
    tapSurgeIndex = 'STEADY_POUNDING',
    legionMorale = 'CAUTIOUS', 
    stabilityStatus = 'PRISTINE',
    setupRealtimeSubscription: setupGirthSubscription  } = useGirthIndexStore();

  // Add new state for enhanced metrics
  const [enhancedMetrics, setEnhancedMetrics] = useState<{
    categories: any[];
    isLiveMode: boolean;
    lastUpdate: Date;
    isLoading: boolean;
    error: string | null;
  }>({
    categories: [],
    isLiveMode: false,
    lastUpdate: new Date(),
    isLoading: true,
    error: null
  });

  // === ORACLE FLOW STORES (SEPARATED) ===
  const {
    switchToProphecyTab,
    setupRealtimeSubscription: setupOracleFlowSubscription
  } = useOracleFlowStore();

  const {
    switchToLoreTab  } = useOracleLoreStore();

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
        priority: getOraclePriority(response.notification.type || 'system'),
        timestamp: response.timestamp,
        dismissible: true,
        autoHide: response.notification.duration ? response.notification.duration > 8000 : false
      };
      
      // Add to alerts with Oracle styling
      setAlerts(prev => [oracleAlert, ...prev.slice(0, 9)]); // Keep max 10 alerts
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
    // Cast because Oracle engine expects GameMessage but we are just proxying any object
    (realTimeOracle as any).setGameMessageCallback(sendMessageToGame);
    
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

  // === SMART ALERTS NAVIGATION ===
  
  useEffect(() => {
    const handleMainTabSwitch = (event: CustomEvent) => {
      const { tab, ...payload } = event.detail;
      console.log('🚨 Smart Alert navigation: switching to main tab:', tab, payload);
      
      if (tab === 'community') {
        setCurrentSection('community');
      } else if (tab === 'oracle') {
        setCurrentSection('oracle');
      } else if (tab === 'game') {
        setCurrentSection('game');
      }
    };

    const handleOracleTabSwitch = (event: CustomEvent) => {
      const { tab, subtab, ...payload } = event.detail;
      console.log('🚨 Smart Alert navigation: switching to Oracle tab:', tab, subtab, payload);
      
      // Switch to Oracle main section first
      setCurrentSection('oracle');
      
      // Auto-scroll to Oracle section to provide visual feedback
      setTimeout(() => {
        const oracleSection = document.querySelector('[data-section="oracle"]') || 
                            document.querySelector('.oracle-section') ||
                            document.querySelector('#oracle-section');
        if (oracleSection) {
          console.log('🚨 Smart Alert navigation: scrolling to Oracle section');
          oracleSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 50); // Quick scroll before sub-tab switch
      
      // Handle Oracle sub-tabs via stores with delay to ensure components are ready
      setTimeout(() => {
        if (tab === 'scrolls') {
          // Switch to prophecy system → apocryphal scrolls
          console.log('🚨 Smart Alert navigation: switching to Apocryphal Scrolls tab');
          console.log('🚨 Smart Alert navigation: switchToProphecyTab function available:', typeof switchToProphecyTab);
          try {
            switchToProphecyTab('scrolls');
            console.log('🚨 Smart Alert navigation: successfully called switchToProphecyTab("scrolls")');
            
            // Enhanced auto-scroll to the specific Apocryphal Scrolls component
            setTimeout(() => {
              const apocryphalScrollsElement = document.querySelector('.apocryphal-scrolls');
              if (apocryphalScrollsElement) {
                console.log('🚨 Smart Alert navigation: scrolling to Apocryphal Scrolls component');
                apocryphalScrollsElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start',
                  inline: 'nearest'
                });
                
                // Add highlight flash to draw attention
                apocryphalScrollsElement.classList.add('highlight-flash');
                setTimeout(() => {
                  apocryphalScrollsElement.classList.remove('highlight-flash');
                }, 3000);
              } else {
                console.warn('🚨 Smart Alert navigation: Apocryphal Scrolls component not found');
              }
            }, 250); // Allow time for tab switch to complete
            
          } catch (error) {
            console.error('🚨 Smart Alert navigation: error calling switchToProphecyTab:', error);
          }
        } else if (tab === 'lore') {
          // Switch to lore system
          if (subtab === 'input') {
            console.log('🚨 Smart Alert navigation: switching to Lore Input tab');
            switchToLoreTab('lore');
          } else if (subtab === 'archive') {
            console.log('🚨 Smart Alert navigation: switching to Lore Archive tab');
            switchToLoreTab('archive');
          }
        }
      }, 100); // Small delay to ensure Oracle components are rendered
    };

    const handleLiveEventFeedModal = (event: CustomEvent) => {
      const payload = event.detail;
      console.log('🚨 Smart Alert navigation: opening Live Event Feed modal:', payload);
      
      // Switch to community section and trigger live feed modal
      setCurrentSection('community');
      
      // Auto-scroll to Community section first
      setTimeout(() => {
        const communitySection = document.querySelector('[data-section="community"]') || 
                                document.querySelector('.community-section') ||
                                document.querySelector('#community-section');
        if (communitySection) {
          console.log('🚨 Smart Alert navigation: scrolling to Community section');
          communitySection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 50);
      
      // Trigger live feed FULL-SCREEN modal opening after component is rendered
      setTimeout(() => {
        // Strategy: First expand the live feed, then click the maximize button
        
        // Step 1: Find and click "Open Live Feed" to expand
        let liveFeedButton = null;
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent?.includes('Open Live Feed')) {
            liveFeedButton = button;
            break;
          }
        }
        
        if (liveFeedButton) {
          console.log('🚨 Smart Alert navigation: expanding Live Feed');
          (liveFeedButton as HTMLElement).click();
          
          // Step 2: After expansion, find and click the maximize button for full-screen
          setTimeout(() => {
            const maximizeSelectors = [
              'button[title*="Full Screen"]',
              'button[aria-label*="full screen"]',
              'button[title*="Open Full Screen Live Event Feed"]',
              '.from-emerald-400.to-cyan-500 svg', // Maximize icon in gradient button
              'button:has(svg)' // Any button with SVG (likely maximize)
            ];
            
            let maximizeButton = null;
            for (const selector of maximizeSelectors) {
              try {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                  // Check if it's a maximize button by looking for maximize icon or text
                  const isMaximize = element.innerHTML?.includes('Maximize') ||
                                   element.getAttribute('title')?.includes('Full Screen') ||
                                   element.getAttribute('aria-label')?.includes('full screen') ||
                                   element.closest('button')?.getAttribute('title')?.includes('Full Screen');
                  if (isMaximize) {
                    maximizeButton = element.tagName === 'BUTTON' ? element : element.closest('button');
                    break;
                  }
                }
                if (maximizeButton) break;
              } catch (e) {
                // Continue to next selector
              }
            }
            
            if (maximizeButton) {
              console.log('🚨 Smart Alert navigation: opening full-screen Live Event Feed modal');
              (maximizeButton as HTMLElement).click();
            } else {
              console.warn('🚨 Smart Alert navigation: maximize button not found, Live Feed expanded but not full-screen');
            }
          }, 100); // Give expansion time to render maximize button
          
        } else {
          console.warn('🚨 Smart Alert navigation: Live Feed button not found');
        }
      }, 250); // Longer delay for component rendering and scrolling
    };

    const handleOracleReferendumModal = (event: CustomEvent) => {
      const payload = event.detail;
      console.log('🚨 Smart Alert navigation: opening Oracle Referendum modal:', payload);
      
      // Open the referendum modal directly
      setShowReferendumModal(true);
    };

    const handleCommunityGirthTracker = (event: CustomEvent) => {
      const payload = event.detail;
      console.log('🚨 Smart Alert navigation: navigating to Community Girth Tracker:', payload);
      
      // Switch to Oracle Sanctum tab and scroll to Community Girth Tracker
      setCurrentSection('oracle');
      
      setTimeout(() => {
        setCurrentSection('oracle');
        
        // Look for the Community Girth Tracker component and scroll to it
        setTimeout(() => {
          const girthTrackerElement = document.querySelector('.community-girth-tracker');
          if (girthTrackerElement) {
            girthTrackerElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
            
            // Highlight milestones if requested
            if (payload?.highlightMilestones) {
              const milestonesSection = document.querySelector('.milestone-progress');
              if (milestonesSection) {
                milestonesSection.classList.add('highlight-flash');
                setTimeout(() => {
                  milestonesSection.classList.remove('highlight-flash');
                }, 3000);
              }
            }
          } else {
            console.warn('🚨 Community Girth Tracker component not found');
          }
        }, 250);
      }, 100);
    };

    const handleOracleMetricsSystem = (event: CustomEvent) => {
      const payload = event.detail;
      console.log('🚨 Smart Alert navigation: navigating to Oracle Metrics System:', payload);
      
      // Switch to Oracle tab and scroll to Oracle Metrics System
      setCurrentSection('oracle');
      
      setTimeout(() => {
        const metricsElement = document.querySelector('.oracle-metrics-system');
        if (metricsElement) {
          metricsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          metricsElement.classList.add('highlight-flash');
          setTimeout(() => metricsElement.classList.remove('highlight-flash'), 3000);
        }
      }, 100);
    };

    const handleLoreSlideshow = (event: CustomEvent) => {
      const payload = event.detail;
      console.log('🚨 Smart Alert navigation: opening Lore Slideshow:', payload);
      
      // Switch to Oracle tab first
      setCurrentSection('oracle');
      
      // Switch to Lore sub-tab
      setTimeout(() => {
        const switchToLoreEvent = new CustomEvent('switchToLoreTab', { 
          detail: { target: 'archive' } 
        });
        window.dispatchEvent(switchToLoreEvent);
        
        // Then open the slideshow modal
        setTimeout(() => {
          // Look for a lore entry to click or trigger slideshow
          const loreArchive = document.querySelector('.lore-archive');
          if (loreArchive) {
            loreArchive.scrollIntoView({ behavior: 'smooth', block: 'center' });
            loreArchive.classList.add('highlight-flash');
            setTimeout(() => loreArchive.classList.remove('highlight-flash'), 3000);
            
            // If we have a specific entry to highlight, try to find and click it
            if (payload?.highlightEntry) {
              const entryElement = document.querySelector(`[data-entry-id="${payload.highlightEntry}"]`);
              if (entryElement) {
                (entryElement as HTMLElement).click();
              }
            } else if (payload?.showRecent) {
              // Try to click the first/most recent entry to open slideshow
              const firstEntry = loreArchive.querySelector('.lore-entry, .clickable');
              if (firstEntry) {
                (firstEntry as HTMLElement).click();
              }
            }
          }
        }, 200);
      }, 100);
    };

    const handleRitualLab = (event: CustomEvent) => {
      console.log('🚨 Opening Ritual Lab modal:', event.detail);
      setShowRitualLab(true);
    };

    // Register event listeners
    window.addEventListener('switchToMainTab', handleMainTabSwitch as EventListener);
    window.addEventListener('switchToOracleTab', handleOracleTabSwitch as EventListener);
    window.addEventListener('openLiveEventFeedModal', handleLiveEventFeedModal as EventListener);
    window.addEventListener('openOracleReferendumModal', handleOracleReferendumModal as EventListener);
    window.addEventListener('openCommunityGirthTracker', handleCommunityGirthTracker as EventListener);
    window.addEventListener('openOracleMetricsSystem', handleOracleMetricsSystem as EventListener);
    window.addEventListener('openLoreSlideshow', handleLoreSlideshow as EventListener);
    window.addEventListener('openRitualLab', handleRitualLab as EventListener);
    
    // Smart Alerts custom action listeners
    window.addEventListener('smartAlert_community_girth_tracker', handleCommunityGirthTracker as EventListener);
    window.addEventListener('smartAlert_oracle_metrics_system', handleOracleMetricsSystem as EventListener);
    window.addEventListener('smartAlert_lore_slideshow', handleLoreSlideshow as EventListener);
    
    return () => {
      window.removeEventListener('switchToMainTab', handleMainTabSwitch as EventListener);
      window.removeEventListener('switchToOracleTab', handleOracleTabSwitch as EventListener);
      window.removeEventListener('openLiveEventFeedModal', handleLiveEventFeedModal as EventListener);
      window.removeEventListener('openOracleReferendumModal', handleOracleReferendumModal as EventListener);
      window.removeEventListener('openCommunityGirthTracker', handleCommunityGirthTracker as EventListener);
      window.removeEventListener('openOracleMetricsSystem', handleOracleMetricsSystem as EventListener);
      window.removeEventListener('openLoreSlideshow', handleLoreSlideshow as EventListener);
      window.removeEventListener('openRitualLab', handleRitualLab as EventListener);
      
      // Smart Alerts custom action cleanup
      window.removeEventListener('smartAlert_community_girth_tracker', handleCommunityGirthTracker as EventListener);
      window.removeEventListener('smartAlert_oracle_metrics_system', handleOracleMetricsSystem as EventListener);
      window.removeEventListener('smartAlert_lore_slideshow', handleLoreSlideshow as EventListener);
    };
  }, [switchToProphecyTab, switchToLoreTab]);

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



  // === METRIC INFLUENCE SYSTEM ===
  

  // === ENHANCED GAME MESSAGE HANDLING ===
  
  const handleGameMessage = async (message: GameMessage) => {
    console.log('📥 [DASHBOARD] Game message received from CollapsibleGameContainer:', {
      type: message.type,
      timestamp: message.timestamp,
      has_payload: !!message.payload,
      session_id: message.payload?.session_id,
      player_address: message.payload?.player_address || walletAddress,
      data_keys: message.data ? Object.keys(message.data) : []
    });
    
    // Convert game message to RealTimeGameEvent format
    const gameEvent: RealTimeGameEvent = {
      session_id: message.payload?.session_id || `session_${Date.now()}`,
      event_type: message.type,
      timestamp_utc: message.timestamp?.toISOString() || new Date().toISOString(),
      player_address: walletAddress || message.payload?.player_address || '',
      event_payload: message.payload || {}
    };
    
    console.log('🔄 [DASHBOARD] Converting to Oracle event format:', {
      original_type: message.type,
      oracle_event_type: gameEvent.event_type,
      session_id: gameEvent.session_id,
      player_address: gameEvent.player_address,
      has_payload: !!gameEvent.event_payload
    });
    
    // Process through Real-Time Oracle Engine
    try {
      console.log('🔮 [DASHBOARD] Sending to Oracle engine for processing...');
      const oracleResponse = await realTimeOracle.processGameEvent(gameEvent);
      
      if (oracleResponse) {
        console.log('🔮 [DASHBOARD] Oracle processed event and generated response:', {
          response_id: oracleResponse.response_id,
          event_id: oracleResponse.event_id,
          notification_type: oracleResponse.notification.type,
          send_to_game: oracleResponse.send_to_game
        });
        // Response is automatically handled by the Oracle response listener
      } else {
        console.log('🔮 [DASHBOARD] Oracle chose not to respond to this event:', {
          event_type: message.type,
          session_id: gameEvent.session_id
        });
      }
    } catch (error) {
      const err = error as any;
      console.error('❌ [DASHBOARD] Error processing game event through Oracle:', {
        error: err?.message,
        event_type: message.type,
        session_id: gameEvent.session_id,
        stack: err?.stack
      });
    }
    

    
    switch (message.type) {
      case 'player_session_start':
        { const greetingAlert: Alert = {
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
        break; }

      case 'oracle_player_identification':
        if (message.payload?.wallet_address) {
          // Wallet state is now managed by SIWS context
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
    console.log('🎮 [DASHBOARD] Game state change received:', {
      previous_state: {
        isLoaded: gameState.isLoaded,
        isConnected: gameState.isConnected,
        playerCount: gameState.playerCount,
        totalTaps: gameState.totalTaps,
        currentGirth: gameState.currentGirth
      },
      new_state: {
        isLoaded: state.isLoaded,
        isConnected: state.isConnected,
        playerCount: state.playerCount,
        totalTaps: state.totalTaps,
        currentGirth: state.currentGirth
      },
      changes: {
        loaded_changed: gameState.isLoaded !== state.isLoaded,
        connection_changed: gameState.isConnected !== state.isConnected,
        stats_changed: gameState.totalTaps !== state.totalTaps || gameState.currentGirth !== state.currentGirth
      }
    });
    
    setGameState(state);
    
    // Add game connection alert
    if (state.isConnected && !gameState.isConnected) {
      console.log('🎮 [DASHBOARD] Game connected - creating connection alert');
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
    
    // Log disconnection
    if (!state.isConnected && gameState.isConnected) {
      console.warn('⚠️ [DASHBOARD] Game disconnected - connection lost');
    }
  };

  const handleAlertDismiss = (alertId: string) => {
    console.log('🔮 Alert Dismissed:', alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleAlertClick = (alert: Alert) => {
    console.log('🔮 Alert Clicked:', alert);
    animations.animateAlertClick(null as any, null as any);
  };

  const handleGameDockToggle = (docked: boolean) => {
    setGameDocked(docked);
    console.log('🎮 Game Docked:', docked);
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'oracle':
        return <OracleSection />;
      
      case 'game':
        return (
          <GameSection
            gameDocked={gameDocked}
            onGameStateChange={handleGameStateChange}
            onGameMessage={handleGameMessage}
            onDockToggle={handleGameDockToggle}
          />
        );
      
      case 'community':
        return (
          <CommunitySection
            walletConnected={walletConnected}
            walletAddress={walletAddress}
          />
        );

      default:
        return null;
    }
  };

  // Add enhanced metrics subscription effect after the existing effects
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeEnhancedMetrics = async () => {
      try {
        setEnhancedMetrics(prev => ({ ...prev, isLoading: true, error: null }));

        // Subscribe to Oracle metrics service for enhanced data
        unsubscribe = oracleMetricsService.subscribe((newCategories) => {
          setEnhancedMetrics(prev => ({
            ...prev,
            categories: newCategories,
            isLoading: false,
            lastUpdate: new Date(),
            isLiveMode: !(oracleMetricsService as any).config?.demoMode
          }));
        });

      } catch (err) {
        console.error('[NewDashboard] Enhanced metrics initialization failed:', err);
        setEnhancedMetrics(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to connect to Oracle metrics service',
          isLoading: false
        }));
      }
    };

    initializeEnhancedMetrics();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Add admin config listening for demo mode updates
  useEffect(() => {
    const handleAdminConfigUpdate = (event: CustomEvent) => {
      const config = event.detail;
      if (config.componentDemoModes?.oracleMetrics !== undefined ||
          config.demoDataGlobal?.masterSwitch !== undefined) {
        // Update Oracle metrics service configuration
        oracleMetricsService.updateConfig({
          demoMode: config.componentDemoModes?.oracleMetrics && config.demoDataGlobal?.masterSwitch
        });
      }
    };

    window.addEventListener('adminConfigUpdated', handleAdminConfigUpdate as EventListener);
    return () => window.removeEventListener('adminConfigUpdated', handleAdminConfigUpdate as EventListener);
  }, []);

  // Enhanced metric value calculation with fallback to girth store
  const getMetricValue = (metricType: string): { value: any; influences?: any; status: string } => {
    if (enhancedMetrics.categories.length > 0) {
      // Use enhanced service data when available
      const category = enhancedMetrics.categories.find((cat: any) => 
        cat.id === metricType || 
        cat.name.toLowerCase().includes(metricType.toLowerCase())
      );
      
      if (category && category.metrics.length > 0) {
        const primaryMetric = category.metrics[0];
        let formattedValue = primaryMetric.value;
        
        // Format resonance value to be more readable
        if (metricType === 'resonance' && typeof primaryMetric.value === 'number') {
          formattedValue = primaryMetric.value.toFixed(2);
        } else if (metricType === 'resonance' && typeof primaryMetric.value === 'string' && primaryMetric.value.includes('.')) {
          formattedValue = parseFloat(primaryMetric.value).toFixed(2);
        }
        
        return {
          value: formattedValue + (primaryMetric.unit || ''),
          influences: primaryMetric.details?.breakdown,
          status: enhancedMetrics.isLiveMode ? 'LIVE' : 'ENHANCED'
        };
      }
    }
    
    // Fallback to original girth store values with better formatting
    const fallbackValues = {
      'resonance': { value: typeof girthResonance === 'number' ? girthResonance.toFixed(2) + '%' : girthResonance + '%', status: 'BASIC' },
      'surge': { value: tapSurgeIndex.replace(/_/g, ' '), status: 'BASIC' },
      'morale': { value: legionMorale.replace(/_/g, ' '), status: 'BASIC' },
      'stability': { value: stabilityStatus.replace(/_/g, ' '), status: 'BASIC' }
    };
    
    return fallbackValues[metricType as keyof typeof fallbackValues] || { value: 'Unknown', status: 'ERROR' };
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
        
        {/* Global Modals - accessible from any section */}
        <RitualLab
          isOpen={showRitualLab}
          onClose={() => setShowRitualLab(false)}
        />

      </main>

    </div>
  );
}; 