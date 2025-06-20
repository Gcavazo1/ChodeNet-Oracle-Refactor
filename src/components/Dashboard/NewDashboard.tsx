import React, { useState, useEffect } from 'react';
import { OracleHeader } from '../OracleHeader/OracleHeader';
import { SmartAlertsBar, Alert } from '../SmartAlertsBar/SmartAlertsBar';
import { CollapsibleGameContainer, GameState, GameMessage } from '../CollapsibleGameContainer/CollapsibleGameContainer';
import { CommunityGirthTracker } from '../CommunityMetrics/CommunityGirthTracker';
import { ProphecyChamber } from '../ProphecyChamber/ProphecyChamber';
import { RitualRequests } from '../RitualRequests/RitualRequests';
import { ApocryphalScrolls } from '../ApocryphalScrolls/ApocryphalScrolls';
import { CommunityLoreInput } from '../CommunityLoreInput/CommunityLoreInput';
import { LoreArchive } from '../LoreArchive/LoreArchive';
import { RitualLab } from '../RitualLab/RitualLab';
import { realTimeOracle, OracleResponse, RealTimeGameEvent } from '../../lib/realTimeOracleEngine';
import { useGirthIndexStore } from '../../lib/girthIndexStore';
import { useOracleFlowStore, useOracleLoreStore } from '../../lib/oracleFlowStore';
import { CommunityShowcaseModal } from '../CommunityFeatures/CommunityShowcaseModal';
import { CommunityLeaderboardModal } from '../LeaderboardSystem/CommunityLeaderboardModal';
import { OracleReferendumModal, ReferendumCard } from '../OracleReferendum/index';

import { Users, Trophy } from 'lucide-react';
import { LiveFeedCard } from '../CommunityFeatures/LiveFeedCard';
import { PlayerProfilePanel } from '../PlayerProfilePanel/PlayerProfilePanel';
import { useSIWS } from '../../lib/useSIWS';
import { oracleMetricsService } from '../../lib/oracleMetricsService';
import './NewDashboard.css';

// 🎭 IMPORT ORACLE ANIMATIONS
import { useOracleAnimations } from '../OracleAnimations';
import { oracleAnimations } from '../OracleAnimations/OracleAnimationController';

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

  // 🎭 Use the Oracle Animations hook
  const animations = useOracleAnimations();

  // === CORE GIRTH INDEX METRICS ===
  const {
    girthResonance = 50,
    tapSurgeIndex = 'STEADY_POUNDING',
    legionMorale = 'CAUTIOUS', 
    stabilityStatus = 'PRISTINE',
    setupRealtimeSubscription: setupGirthSubscription,
    updateMetrics
  } = useGirthIndexStore();

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
    prophecyActiveTab,
    switchToProphecyTab,
    setupRealtimeSubscription: setupOracleFlowSubscription
  } = useOracleFlowStore();

  const {
    loreActiveTab,
    switchToLoreTab  } = useOracleLoreStore();

  // 🎭 ORACLE ANIMATIONS INTEGRATION
  useEffect(() => {
    // Initialize animations when section changes
    const initializeAnimations = () => {
      console.log('🎭 Initializing Oracle animations for section:', currentSection);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        oracleAnimations.initializeDashboard(currentSection as 'oracle' | 'game' | 'community');
        
        // Special Oracle eye animation based on stability status
        if (currentSection === 'oracle') {
          const eyeState = stabilityStatus === 'FORBIDDEN_FRAGMENT' ? 'corrupted' :
                          stabilityStatus === 'GLITCHED_OMINOUS' ? 'corrupted' :
                          stabilityStatus === 'FLICKERING' ? 'sleeping' :
                          'active';
          
          oracleAnimations.animateOracleEyeState(eyeState);
        }
      }, 100);
    };

    initializeAnimations();

    // Cleanup on section change
    return () => {
      oracleAnimations.cleanup();
    };
  }, [currentSection, stabilityStatus]);

  // 🎭 Trigger wave effect on girth updates
  useEffect(() => {
    if (girthResonance > 80) {
      oracleAnimations.triggerDashboardWave();
    }
  }, [girthResonance]);

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
      case 'CRYPTIC': return '🔮';
      case 'FLICKERING': return '⚡';
      case 'GLITCHED_OMINOUS': return '🔥';
      case 'FORBIDDEN_FRAGMENT': return '👹';
      default: return '🌟';
    }
  };

  // === METRIC INFLUENCE SYSTEM ===
  
  const getMetricInfluences = async (metricType: string) => {
    setLoadingInfluences(true);
    setMetricInfluences(null);
    
    try {
      if (enhancedMetrics.categories.length > 0) {
        // Use enhanced service data
        const category = enhancedMetrics.categories.find(cat => 
          cat.id === metricType || 
          cat.name.toLowerCase().includes(metricType.toLowerCase())
        );
        
        if (category && category.metrics.length > 0) {
          const primaryMetric = category.metrics[0];
          const influences = {
            calculated_value: primaryMetric.value + (primaryMetric.unit || ''),
            primary_influences: primaryMetric.details?.breakdown?.map((item: any) => ({
              factor: item.label,
              value: `${item.value}${primaryMetric.unit || ''}`,
              description: `Contributing ${item.percentage}% to overall ${category.name.toLowerCase()}`
            })) || [],
            next_threshold: `Next milestone at ${Math.ceil((primaryMetric.value + 10) / 10) * 10}${primaryMetric.unit || ''}`,
            data_source: enhancedMetrics.isLiveMode ? 'Real-time Oracle data' : 'Demo data',
            last_updated: enhancedMetrics.lastUpdate.toLocaleTimeString()
          };
          
          setMetricInfluences(influences);
          return;
        }
      }
      
      // Fallback to original calculation logic (existing code)
      // ... existing getMetricInfluences implementation ...
      
    } catch (error) {
      console.error('🔮 Failed to get metric influences:', error);
      setMetricInfluences({
        error: 'Failed to load influence data',
        calculated_value: getMetricValue(metricType).value,
        primary_influences: [],
        next_threshold: 'Unknown'
      });
    } finally {
      setLoadingInfluences(false);
    }
  };

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
      event_payload: message.payload
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
      console.error('❌ [DASHBOARD] Error processing game event through Oracle:', {
        error: error.message,
        event_type: message.type,
        session_id: gameEvent.session_id,
        stack: error.stack
      });
    }
    
    // === LEGACY ALERT SYSTEM (for non-Oracle events) ===
    // Keep the existing alert system for immediate feedback
    
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

  const handleAlertClick = (alert: Alert, event: React.MouseEvent<HTMLDivElement>) => {
    console.log('🔮 Alert Clicked:', alert);
    animations.animateAlertClick(event.currentTarget, event);
  };

  const handleGameDockToggle = (docked: boolean) => {
    setGameDocked(docked);
    console.log('🎮 Game Docked:', docked);
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'oracle':
        return (
          <div className="section-content oracle-sanctum">
            {/* ROW 1: Oracle Metrics (Real Data) */}
            <div className="oracle-modal-row">
              <div className="oracle-modal metrics-modal">
                <div className="modal-header">
                  <h3>🔮 Oracle Metrics (ENHANCED)</h3>
                  <div className="metrics-status-bar">
                    <div className={`live-indicator ${enhancedMetrics.isLiveMode ? 'live' : 'demo'}`}>
                      <span className="pulse-dot"></span>
                      {enhancedMetrics.isLiveMode ? 'LIVE DATA' : 'DEMO MODE'}
                    </div>
                    <div className="status-details">
                      <span className="last-update">
                        Updated: {enhancedMetrics.lastUpdate.toLocaleTimeString()}
                      </span>
                      {enhancedMetrics.isLoading && <span className="loading-indicator">⟳ Loading...</span>}
                      {enhancedMetrics.error && <span className="error-indicator">⚠ {enhancedMetrics.error}</span>}
                    </div>
                  </div>
                </div>
                <div className="metrics-grid">
                  <div 
                    className={`metric-card ${expandedMetric === 'resonance' ? 'expanded' : ''}`}
                    onClick={(e) => {
                      handleMetricClick('resonance');
                      animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
                    }}
                    onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
                    onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
                  >
                    <div className="metric-label">
                      Divine Resonance
                      <span className={`metric-status-badge ${getMetricValue('resonance').status.toLowerCase()}`}>
                        {getMetricValue('resonance').status}
                      </span>
                    </div>
                    <div className="metric-value primary">{getMetricValue('resonance').value}</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill resonance" 
                        style={{ width: `${girthResonance}%` }}
                      />
                    </div>
                    <div className="metric-expand-hint">Click for enhanced details</div>
                  </div>
                  
                  <div 
                    className={`metric-card ${expandedMetric === 'surge' ? 'expanded' : ''}`}
                    onClick={(e) => {
                      handleMetricClick('surge');
                      animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
                    }}
                    onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
                    onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
                  >
                    <div className="metric-label">
                      Tap Surge
                      <span className={`metric-status-badge ${getMetricValue('surge').status.toLowerCase()}`}>
                        {getMetricValue('surge').status}
                      </span>
                    </div>
                    <div className="metric-value surge">{getMetricValue('surge').value}</div>
                    <div className="metric-status">{getSurgeIcon(tapSurgeIndex)}</div>
                    <div className="metric-expand-hint">Click for enhanced details</div>
                  </div>
                  
                  <div 
                    className={`metric-card ${expandedMetric === 'morale' ? 'expanded' : ''}`}
                    onClick={(e) => {
                      handleMetricClick('morale');
                      animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
                    }}
                    onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
                    onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
                  >
                    <div className="metric-label">
                      Legion Morale
                      <span className={`metric-status-badge ${getMetricValue('morale').status.toLowerCase()}`}>
                        {getMetricValue('morale').status}
                      </span>
                    </div>
                    <div className="metric-value morale">{getMetricValue('morale').value}</div>
                    <div className="metric-status">{getMoraleIcon(legionMorale)}</div>
                    <div className="metric-expand-hint">Click for enhanced details</div>
                  </div>
                  
                  <div 
                    className={`metric-card ${expandedMetric === 'stability' ? 'expanded' : ''}`}
                    onClick={(e) => {
                      handleMetricClick('stability');
                      animations.createMetricCardRipple(e.currentTarget, e.clientX, e.clientY);
                    }}
                    onMouseEnter={(e) => animations.animateMetricCardFocus(e.currentTarget)}
                    onMouseLeave={(e) => animations.animateMetricCardBlur(e.currentTarget)}
                  >
                    <div className="metric-label">
                      Oracle Stability
                      <span className={`metric-status-badge ${getMetricValue('stability').status.toLowerCase()}`}>
                        {getMetricValue('stability').status}
                      </span>
                    </div>
                    <div className="metric-value stability">{getMetricValue('stability').value}</div>
                    <div className="metric-status">{getStabilityIcon(stabilityStatus)}</div>
                    <div className="metric-expand-hint">Click for enhanced details</div>
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
                            <div className="state-value">
                              {expandedMetric === 'resonance' && typeof metricInfluences.calculated_value === 'string' && metricInfluences.calculated_value.includes('%')
                                ? parseFloat(metricInfluences.calculated_value).toFixed(2) + '%'
                                : metricInfluences.calculated_value}
                            </div>
                          </div>
                          
                          <div className="influences-section">
                            <h5>Active Influences</h5>
                            <div className="influences-list">
                              {metricInfluences.primary_influences && metricInfluences.primary_influences.length > 0 ? (
                                metricInfluences.primary_influences.map((influence: { factor: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; value: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
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

            {/* ROW 2: Prophecy & Lore Systems (side-by-side) */}
            <div className="oracle-modal-row">
              {/* === PROPHECY MODAL === */}
              <div className="oracle-modal prophecy-modal">
                <div className="modal-header">
                  <h3>⚡ Oracle Prophecy System</h3>
                  <div className="prophecy-tabs">
                    <button 
                      className={`tab ${prophecyActiveTab === 'ritual' ? 'active' : ''}`}
                      onClick={() => switchToProphecyTab('ritual')}
                    >
                      🎯 Ritual Requests
                    </button>
                    <button 
                      className={`tab ${prophecyActiveTab === 'chamber' ? 'active' : ''}`}
                      onClick={() => switchToProphecyTab('chamber')}
                    >
                      🔮 Prophecy Chamber
                    </button>
                    <button 
                      className={`tab ${prophecyActiveTab === 'scrolls' ? 'active' : ''}`}
                      onClick={() => switchToProphecyTab('scrolls')}
                    >
                      📜 Scrolls Feed
                    </button>
                    <button 
                      className="tab"
                      onClick={() => {
                        const event = new CustomEvent('openRitualLab');
                        window.dispatchEvent(event);
                      }}
                    >
                      ⚗️ Ritual Lab
                    </button>
                  </div>
                </div>
                
                <div className="prophecy-content">
                  {prophecyActiveTab === 'ritual' && (
                    <RitualRequests />
                  )}
                  
                  {prophecyActiveTab === 'chamber' && (
                    <ProphecyChamber />
                  )}
                  
                  {prophecyActiveTab === 'scrolls' && (
                    <ApocryphalScrolls />
                  )}
                </div>
              </div>

              {/* === LORE MODAL === */}
              <div className="oracle-modal lore-modal">
                <div className="modal-header">
                  <h3>📖 Oracle Lore System</h3>
                  <div className="prophecy-tabs">
                    <button
                      className={`tab ${loreActiveTab === 'lore' ? 'active' : ''}`}
                      onClick={() => switchToLoreTab('lore')}
                    >
                      📝 Lore Input
                    </button>
                    <button
                      className={`tab ${loreActiveTab === 'archive' ? 'active' : ''}`}
                      onClick={() => switchToLoreTab('archive')}
                    >
                      📚 Lore Archive
                    </button>
                  </div>
                </div>

                <div className="prophecy-content">
                  {loreActiveTab === 'lore' && (
                    <CommunityLoreInput />
                  )}
                  {loreActiveTab === 'archive' && (
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
                            <option value="CRYPTIC">CRYPTIC</option>
                            <option value="FLICKERING">FLICKERING</option>
                            <option value="GLITCHED_OMINOUS">GLITCHED_OMINOUS</option>
                            <option value="FORBIDDEN_FRAGMENT">FORBIDDEN_FRAGMENT</option>
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
          <div className="section-content game-feed flex gap-6">
            <CollapsibleGameContainer
              className="flex-1"
              gameUrl="/chode_tapper_game/game_demo/index.html"
              isDocked={gameDocked}
              onGameStateChange={handleGameStateChange}
              onGameMessage={handleGameMessage}
              onDockToggle={handleGameDockToggle}
            />
            {/* Player Panel */}
            <div className="w-80">
              <PlayerProfilePanel className="h-full" />
            </div>
          </div>
        );
      
      case 'community':
        return (
          <div className="section-content community-nexus flex items-center justify-center">
            {/* Cards container */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {/* Showcase Card */}
              <div className="max-w-md w-full p-8 rounded-2xl border shadow-lg text-center bg-slate-900/70 backdrop-blur-lg"
                   style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                   onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'showcase')}
                   onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
                   onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-black shadow-lg card-icon">
                    <Users className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Community NFT Showcase</h3>
                <p className="text-sm text-gray-300 mb-6">Dive into legendary collections curated by our players.</p>
                <button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg w-full"
                  onClick={() => setShowCommunityShowcase(true)}
                >
                  Enter Showcase →
                </button>
              </div>

              {/* Oracle's Referendum Card */}
              <div 
                onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'referendum')}
                onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
                onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
              >
                <ReferendumCard onClick={() => setShowReferendumModal(true)} />
              </div>

              {/* Leaderboard Card */}
              <div className="max-w-md w-full p-8 rounded-2xl border shadow-lg text-center bg-slate-900/70 backdrop-blur-lg"
                   style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                   onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'leaderboards')}
                   onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
                   onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-lg card-icon">
                    <Trophy className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Oracle Leaderboards</h3>
                <p className="text-sm text-gray-300 mb-6">Explore the elite rankings of our mystical oracles.</p>
                <button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg w-full"
                  onClick={() => setShowLeaderboardModal(true)}
                >
                  View Leaderboards →
                </button>
              </div>

              {/* Live Feed Card */}
              <div 
                onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'feed')}
                onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
                onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
              >
                <LiveFeedCard />
              </div>
            </div>

            {/* Modals */}
            <CommunityShowcaseModal
               isOpen={showCommunityShowcase}
               onClose={() => setShowCommunityShowcase(false)}
               walletConnected={walletConnected}
               walletAddress={walletAddress}
             />

             <CommunityLeaderboardModal
                isOpen={showLeaderboardModal}
                onClose={() => setShowLeaderboardModal(false)}
             />

             <OracleReferendumModal
                isOpen={showReferendumModal}
                onClose={() => setShowReferendumModal(false)}
                oracleCorruption={45} // You can derive this from your existing Oracle state
                oraclePersonality="chaotic_sage" // You can derive this from your existing Oracle state
             />
          </div>
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

  const handleMetricClick = async (metricType: string) => {
    console.log('📊 Enhanced Metric Clicked:', metricType);
    setExpandedMetric(expandedMetric === metricType ? null : metricType);
    
    if (expandedMetric === metricType) {
      // If clicking on already expanded metric, collapse it
      return;
    }
    
    // Load metric influences using the enhanced system
    await getMetricInfluences(metricType);
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
          onAlertClick={(alert, e) => handleAlertClick(alert, e as React.MouseEvent<HTMLDivElement>)}
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