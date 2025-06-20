// 🚨 SMART ALERTS NAVIGATION SERVICE
// Modular system for routing alerts to their corresponding sections

import type { Alert } from '../components/SmartAlertsBar/SmartAlertsBar';

export interface AlertNavigationAction {
  type: 'modal' | 'tab' | 'route' | 'scroll' | 'custom';
  target: string;
  payload?: Record<string, any>;
  description: string;
}

export interface AlertMetadata {
  prophecyId?: string;
  eventId?: string;
  pollId?: string;
  loreEntryId?: string;
  corruption?: string;
  eventType?: string;
  [key: string]: any;
}

/**
 * Smart Alerts Navigation Mapper
 * Maps alert types and sources to their corresponding navigation actions
 */
export class SmartAlertsNavigationService {
  
  // === NAVIGATION MAPPING ===
  
  private getNavigationAction(alert: Alert): AlertNavigationAction | null {
    const metadata = alert.metadata as AlertMetadata | undefined;
    
    // 🔮 PHASE 1: Oracle Communication Alerts
    if (alert.source === 'oracle') {
      switch (alert.type) {
        case 'prophecy':
          return {
            type: 'tab',
            target: 'oracle_prophecy_scrolls',
            payload: { 
              prophecyId: metadata?.prophecyId,
              corruption: metadata?.corruption 
            },
            description: 'Open Oracle Prophecy System → Apocryphal Scrolls'
          };
          
        case 'milestone': // Legendary game events
          if (metadata?.eventType?.includes('slap')) {
            return {
              type: 'modal',
              target: 'live_event_feed',
              payload: { 
                filterEventType: metadata.eventType,
                highlightEventId: metadata.eventId || alert.id.replace('legendary_', '')
              },
              description: 'Open Community Nexus → Live Event Feed'
            };
          }
          break;
          
        case 'glitch': // Corruption alerts
          return {
            type: 'tab',
            target: 'oracle_prophecy_scrolls',
            payload: { 
              filterCorruption: metadata?.corruption,
              prophecyId: metadata?.prophecyId 
            },
            description: 'Open Oracle Prophecy System → Corrupted Prophecies'
          };
        
        case 'system': // Oracle status alerts
          // Oracle status and metrics go to Oracle Metrics System
          if (metadata?.eventType?.includes('oracle_status') || 
              metadata?.eventType?.includes('oracle_') ||
              metadata?.eventType?.includes('girth_resonance') ||
              metadata?.eventType?.includes('tap_surge') ||
              metadata?.eventType?.includes('oracle_stability')) {
            return {
              type: 'custom',
              target: 'oracle_metrics_system',
              payload: { 
                highlightMetrics: true,
                focusArea: metadata?.eventType 
              },
              description: 'Open Oracle Sanctum → Oracle Metrics System'
            };
          }
          break;
      }
    }
    
    // 🚧 PHASE 2: Community Data Alerts (Future)
    if (alert.source === 'community') {
      switch (alert.type) {
        case 'poll':
          return {
            type: 'modal',
            target: 'oracle_referendum',
            payload: { 
              pollId: metadata?.pollId,
              autoVote: false
            },
            description: 'Open Oracle Referendum → Poll Details'
          };
          
        case 'community':
          return {
            type: 'tab',
            target: 'community_nexus',
            payload: { section: 'community' },
            description: 'Open Community Nexus → Community Features'
          };
      }
    }
    
    // 🎮 PHASE 3: Game Events & Community Milestones
    if (alert.source === 'game') {
      switch (alert.type) {
        case 'milestone':
          // Check if this is a community milestone vs individual achievement
          if (metadata?.eventType === 'community_milestone' || 
              metadata?.eventType === 'recent_community_milestone') {
            return {
              type: 'custom',
              target: 'community_girth_tracker',
              payload: { 
                highlightMilestones: true,
                scrollToStats: true
              },
              description: 'Open Oracle Sanctum → Community Girth Tracker'
            };
          }
          // Individual achievements go to Live Event Feed
          return {
            type: 'modal',
            target: 'live_event_feed',
            payload: { 
              filterType: 'milestones',
              highlightEvent: metadata?.eventId 
            },
            description: 'Open Live Event Feed → Filter Milestones'
          };
        
        case 'system':
          // Oracle index changes go to Oracle Metrics System
          if (metadata?.eventType?.includes('oracle_') || 
              metadata?.eventType?.includes('girth_resonance') ||
              metadata?.eventType?.includes('tap_surge') ||
              metadata?.eventType?.includes('oracle_stability')) {
            return {
              type: 'custom',
              target: 'oracle_metrics_system',
              payload: { 
                highlightMetrics: true,
                focusArea: metadata?.eventType 
              },
              description: 'Open Oracle Nexus → Oracle Metrics System'
            };
          }
          break;
        
        default:
          return {
            type: 'modal',
            target: 'live_event_feed',
            payload: { filterType: 'game_events' },
            description: 'Open Live Event Feed → Game Events'
          };
      }
    }
    
    // 📚 PHASE 4: Lore System Integration
    if (alert.source === 'lore') {
      switch (metadata?.eventType) {
        // Cycle-related alerts → Navigate to Lore Input
        case 'cycle_progress_counter':
        case 'legendary_submission':
        case 'community_participation':
          return {
            type: 'tab',
            target: 'oracle_lore_input',
            payload: { 
              scrollToInput: true,
              highlightCycle: metadata?.cycleId 
            },
            description: 'Open Oracle → Lore → Community Input'
          };
        
        // Content-related alerts → Navigate to Lore Slideshow
        case 'lore_cycle_complete':
        case 'new_lore_entry':
        case 'comic_panel_complete':
        case 'corrupted_lore_entry':
        case 'popular_lore_entry':
          return {
            type: 'custom',
            target: 'lore_slideshow',
            payload: { 
              highlightEntry: metadata?.entryId,
              showRecent: true,
              entryId: metadata?.entryId,
              title: metadata?.title
            },
            description: 'Open Lore Archive → Full Slideshow Viewer'
          };
        
        default:
          // Default lore navigation based on navigateTo field
          if (metadata?.navigateTo === 'lore_slideshow') {
            return {
              type: 'custom',
              target: 'lore_slideshow',
              payload: { 
                highlightEntry: metadata?.entryId,
                showRecent: true 
              },
              description: 'Open Lore Archive → Full Slideshow Viewer'
            };
          } else {
            return {
              type: 'tab',
              target: 'oracle_lore_input',
              payload: { scrollToInput: true },
              description: 'Open Oracle → Lore System'
            };
          }
      }
    }
    
    return null;
  }
  
  // === NAVIGATION EXECUTION ===
  
  public handleAlertClick(alert: Alert): void {
    const action = this.getNavigationAction(alert);
    
    if (!action) {
      console.log('🚨 No navigation action defined for alert:', alert.type, alert.source);
      return;
    }
    
    console.log('🚨 Navigating alert click:', action.description);
    console.log('🚨 Navigation payload:', action.payload);
    
    switch (action.type) {
      case 'modal':
        this.openModal(action.target, action.payload);
        break;
        
      case 'tab':
        this.switchTab(action.target, action.payload);
        break;
        
      case 'route':
        this.navigateRoute(action.target, action.payload);
        break;
        
      case 'scroll':
        this.scrollToSection(action.target, action.payload);
        break;
        
      case 'custom':
        this.executeCustomAction(action.target, action.payload);
        break;
        
      default:
        console.warn('🚨 Unknown navigation action type:', action.type);
    }
  }
  
  // === NAVIGATION IMPLEMENTATIONS ===
  
  private openModal(modalTarget: string, payload?: Record<string, any>): void {
    switch (modalTarget) {
      case 'live_event_feed':
        // Trigger Live Event Feed modal opening
        const event = new CustomEvent('openLiveEventFeedModal', { 
          detail: payload 
        });
        window.dispatchEvent(event);
        break;
        
      case 'oracle_referendum':
        // Trigger Oracle Referendum modal opening
        const referendumEvent = new CustomEvent('openOracleReferendumModal', { 
          detail: payload 
        });
        window.dispatchEvent(referendumEvent);
        break;
        
      default:
        console.warn('🚨 Unknown modal target:', modalTarget);
    }
  }
  
  private switchTab(tabTarget: string, payload?: Record<string, any>): void {
    switch (tabTarget) {
      case 'oracle_prophecy_scrolls':
        // Switch to Oracle Prophecy System → Apocryphal Scrolls tab
        const prophecyEvent = new CustomEvent('switchToOracleTab', { 
          detail: { 
            tab: 'scrolls',
            ...payload
          } 
        });
        window.dispatchEvent(prophecyEvent);
        break;
        
      case 'oracle_lore_input':
        // Switch to Oracle Sanctum → Lore Input tab
        const loreInputEvent = new CustomEvent('switchToOracleTab', { 
          detail: { 
            tab: 'lore',
            subtab: 'input',
            ...payload
          } 
        });
        window.dispatchEvent(loreInputEvent);
        break;
        
      case 'oracle_lore_archive':
        // Switch to Oracle Sanctum → Lore Archive tab
        const loreArchiveEvent = new CustomEvent('switchToOracleTab', { 
          detail: { 
            tab: 'lore',
            subtab: 'archive',
            ...payload
          } 
        });
        window.dispatchEvent(loreArchiveEvent);
        break;
        
      case 'community_nexus':
        // Switch to Community Nexus tab
        const communityEvent = new CustomEvent('switchToMainTab', { 
          detail: { 
            tab: 'community',
            ...payload
          } 
        });
        window.dispatchEvent(communityEvent);
        break;
        
      default:
        console.warn('🚨 Unknown tab target:', tabTarget);
    }
  }
  
  private navigateRoute(route: string, payload?: Record<string, any>): void {
    // For future use with React Router or similar
    console.log('🚨 Route navigation not implemented yet:', route, payload);
  }
  
  private scrollToSection(sectionId: string, payload?: Record<string, any>): void {
    // Smooth scroll to specific sections
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.warn('🚨 Section not found for scrolling:', sectionId);
    }
  }
  
  private executeCustomAction(actionName: string, payload?: Record<string, any>): void {
    // For complex custom actions
    const customEvent = new CustomEvent(`smartAlert_${actionName}`, { 
      detail: payload 
    });
    window.dispatchEvent(customEvent);
  }
  
  // === UTILITY METHODS ===
  
  /**
   * Get a human-readable description of where an alert will navigate
   */
  public getNavigationDescription(alert: Alert): string {
    const action = this.getNavigationAction(alert);
    return action?.description || 'Click for more details';
  }
  
  /**
   * Check if an alert is clickable (has navigation action)
   */
  public isAlertClickable(alert: Alert): boolean {
    return this.getNavigationAction(alert) !== null;
  }
  
  /**
   * Get all available navigation targets for debugging
   */
  public getAvailableTargets(): Record<string, string[]> {
    return {
      modals: ['live_event_feed', 'oracle_referendum'],
      tabs: ['oracle_prophecy_scrolls', 'oracle_lore_input', 'oracle_lore_archive', 'community_nexus'],
      routes: [], // Future implementation
      custom: [] // Future implementation
    };
  }
}

// Export singleton instance
export const smartAlertsNavigation = new SmartAlertsNavigationService();

// === PHASE 1 INTEGRATION EVENTS ===

/**
 * Custom events that need to be handled by the main dashboard components:
 * 
 * 📊 REQUIRED INTEGRATIONS:
 * 
 * 1. NewDashboard.tsx → Listen for 'switchToMainTab' and 'switchToOracleTab'
 * 2. Community components → Listen for 'openLiveEventFeedModal' 
 * 3. Oracle Prophecy System → Listen for 'switchToOracleTab' with tab: 'scrolls'
 * 4. Oracle Sanctum → Listen for 'switchToOracleTab' with tab: 'lore'
 * 
 * 🎯 IMPLEMENTATION PATTERN:
 * ```typescript
 * useEffect(() => {
 *   const handleSmartAlertNavigation = (event: CustomEvent) => {
 *     const { tab, subtab, ...payload } = event.detail;
 *     // Handle navigation logic
 *   };
 * 
 *   window.addEventListener('switchToOracleTab', handleSmartAlertNavigation);
 *   return () => window.removeEventListener('switchToOracleTab', handleSmartAlertNavigation);
 * }, []);
 * ```
 */ 