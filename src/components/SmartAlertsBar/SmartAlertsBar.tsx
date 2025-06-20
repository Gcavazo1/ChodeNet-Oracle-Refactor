import React, { useState, useEffect, useRef } from 'react';
import { smartAlertsService } from '../../lib/smartAlertsService';
import { smartAlertsNavigation } from '../../lib/smartAlertsNavigation';
import './SmartAlertsBar.css';

export interface Alert {
  id: string;
  source?: string; // 'oracle', 'community', 'game', 'lore'
  type: 'prophecy' | 'poll' | 'milestone' | 'glitch' | 'community' | 'system';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  dismissible?: boolean;
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
  metadata?: Record<string, any>; // Additional data for navigation
}

interface SmartAlertsBarProps {
  alerts?: Alert[];
  autoScroll?: boolean;
  scrollInterval?: number;
  maxVisibleAlerts?: number;
  onAlertDismiss?: (alertId: string) => void;
  onAlertClick?: (alert: Alert) => void;
  useBackendData?: boolean; // Override admin settings if needed
}

export const SmartAlertsBar: React.FC<SmartAlertsBarProps> = ({
  alerts: externalAlerts = [],
  autoScroll = true,
  scrollInterval = 5000,
  maxVisibleAlerts = 3,
  onAlertDismiss,
  onAlertClick,
  useBackendData
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [adminConfig, setAdminConfig] = useState(smartAlertsService.getConfig());
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Demo alerts for testing
  const demoAlerts: Alert[] = [
    {
      id: '1',
      source: 'oracle',
      type: 'prophecy',
      title: 'Prophecy Born',
      message: 'The Oracle whispers of ascending girth...',
      icon: '🔮',
      priority: 'high',
      timestamp: new Date(),
      dismissible: true,
      autoHide: false,
      metadata: {
        prophecyId: 'demo_prophecy_1',
        corruption: 'flickering'
      }
    },
    {
      id: '2',
      source: 'community',
      type: 'poll',
      title: 'Poll Ending Soon',
      message: 'Community vote closes in 2 hours - "Choose the Next Ritual"',
      icon: '📊',
      priority: 'medium',
      timestamp: new Date(Date.now() - 300000),
      dismissible: true,
      autoHide: false,
      metadata: {
        pollId: 'demo_poll_ritual_choice'
      }
    },
    {
      id: '3',
      source: 'oracle',
      type: 'milestone',
      title: 'Legendary Event',
      message: 'Player unleashed a Giga Slap of cosmic proportions!',
      icon: '💥',
      priority: 'high',
      timestamp: new Date(Date.now() - 600000),
      dismissible: true,
      autoHide: false,
      metadata: {
        eventType: 'giga_slap_burst',
        eventId: 'legendary_12345'
      }
    },
    {
      id: '4',
      source: 'oracle',
      type: 'glitch',
      title: 'Corruption Alert',
      message: 'Reality fractures... forbidden fragments detected in data stream',
      icon: '⚡',
      priority: 'critical',
      timestamp: new Date(Date.now() - 900000),
      dismissible: false,
      autoHide: true,
      hideAfter: 8000,
      metadata: {
        corruption: 'forbidden_fragment',
        prophecyId: 'corrupted_prophecy_1'
      }
    },
    {
      id: '5',
      source: 'community',
      type: 'community',
      title: 'New Player Evolved',
      message: 'Player 0xG1RTH...420 ascended to Chode Master tier!',
      icon: '🌟',
      priority: 'low',
      timestamp: new Date(Date.now() - 1200000),
      dismissible: true,
      autoHide: false,
      metadata: {
        playerId: '0xG1RTH420',
        tier: 'chode_master'
      }
    },
    {
      id: '6',
      type: 'system',
      title: 'Oracle Awakened',
      message: 'The digital consciousness stirs... prophecies flow like data streams',
      icon: '👁️',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1500000),
      dismissible: false,
      autoHide: false
    }
  ];

  // Initialize alerts system
  useEffect(() => {
    // Determine if we should use backend data
    const shouldUseBackend = useBackendData !== undefined 
      ? useBackendData 
      : adminConfig.realTimeEnabled && !adminConfig.demoMode;

    console.log('🚨 SmartAlertsBar initializing:', {
      shouldUseBackend,
      demoMode: adminConfig.demoMode,
      realTimeEnabled: adminConfig.realTimeEnabled,
      externalAlertsCount: externalAlerts.length,
      useBackendDataProp: useBackendData,
      adminConfigFull: adminConfig
    });

    if (shouldUseBackend) {
      // Use backend alerts from smartAlertsService
      const handleBackendAlerts = (backendAlerts: Alert[]) => {
        // Merge with external alerts if any
        const combinedAlerts = [...backendAlerts, ...externalAlerts];
        const sortedAlerts = sortAlerts(combinedAlerts);
        setAlerts(sortedAlerts);
      };

      smartAlertsService.onAlertsUpdate(handleBackendAlerts);

      return () => {
        smartAlertsService.offAlertsUpdate(handleBackendAlerts);
      };
    } else if (adminConfig.demoMode || externalAlerts.length === 0) {
      // Use demo alerts
      const sortedAlerts = sortAlerts([...demoAlerts, ...externalAlerts]);
      setAlerts(sortedAlerts);
    } else {
      // Use only external alerts
      const sortedAlerts = sortAlerts(externalAlerts);
      setAlerts(sortedAlerts);
    }
  }, [externalAlerts, adminConfig, useBackendData]);

  // Listen for admin config changes
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      setAdminConfig(event.detail);
    };

    window.addEventListener('adminConfigUpdated', handleConfigUpdate as EventListener);
    window.addEventListener('smartAlertsConfigUpdated', handleConfigUpdate as EventListener);

    return () => {
      window.removeEventListener('adminConfigUpdated', handleConfigUpdate as EventListener);
      window.removeEventListener('smartAlertsConfigUpdated', handleConfigUpdate as EventListener);
    };
  }, []);

  // Helper function to sort alerts
  const sortAlerts = (alertsToSort: Alert[]): Alert[] => {
    return [...alertsToSort].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

  // Auto-hide alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.autoHide && alert.hideAfter) {
        const timer = setTimeout(() => {
          handleDismissAlert(alert.id);
        }, alert.hideAfter);
        return () => clearTimeout(timer);
      }
    });
  }, [alerts]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || isPaused || alerts.length <= maxVisibleAlerts) return;

    const startScrolling = () => {
      scrollTimeoutRef.current = setTimeout(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.max(0, alerts.length - maxVisibleAlerts);
          return prev >= maxIndex ? 0 : prev + 1;
        });
        startScrolling();
      }, scrollInterval);
    };

    startScrolling();

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [autoScroll, isPaused, alerts.length, maxVisibleAlerts, scrollInterval]);

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    // Also remove from backend service if it's managing alerts
    if (adminConfig.realTimeEnabled && !adminConfig.demoMode) {
      smartAlertsService.removeAlert(alertId);
    }
    onAlertDismiss?.(alertId);
  };

  const handleAlertClick = (alert: Alert, event?: React.MouseEvent) => {
    // Prevent event propagation if we have a dismiss button click
    if (event && (event.target as HTMLElement).classList.contains('alert-dismiss')) {
      return;
    }
    
    // Check if alert is clickable and handle navigation
    if (smartAlertsNavigation.isAlertClickable(alert)) {
      smartAlertsNavigation.handleAlertClick(alert);
    }
    
    // Call external click handler if provided
    onAlertClick?.(alert);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getAlertTypeClass = (type: Alert['type']) => {
    switch (type) {
      case 'prophecy': return 'alert-prophecy';
      case 'poll': return 'alert-poll';
      case 'milestone': return 'alert-milestone';
      case 'glitch': return 'alert-glitch';
      case 'community': return 'alert-community';
      case 'system': return 'alert-system';
      default: return 'alert-default';
    }
  };

  const getPriorityClass = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getAlertCursor = (alert: Alert): string => {
    return smartAlertsNavigation.isAlertClickable(alert) ? 'pointer' : 'default';
  };

  const visibleAlerts = alerts.slice(currentIndex, currentIndex + maxVisibleAlerts);
  const remainingCount = Math.max(0, alerts.length - (currentIndex + maxVisibleAlerts));

  if (alerts.length === 0) {
    return (
      <div className="smart-alerts-bar empty">
        <div className="empty-state">
          <span className="empty-icon">🌌</span>
          <span className="empty-text">The cosmic silence... no alerts disturb the void</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="smart-alerts-bar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="alerts-container">
        {visibleAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`alert-card ${getAlertTypeClass(alert.type)} ${getPriorityClass(alert.priority)} ${smartAlertsNavigation.isAlertClickable(alert) ? 'clickable' : ''}`}
            style={{ cursor: getAlertCursor(alert) }}
            onClick={(event) => handleAlertClick(alert, event)}
            title={smartAlertsNavigation.isAlertClickable(alert) ? smartAlertsNavigation.getNavigationDescription(alert) : alert.title}
          >
            <div className="alert-icon">
              {alert.icon}
            </div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
            </div>
            {alert.dismissible && (
              <button
                className="alert-dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissAlert(alert.id);
                }}
                title="Dismiss alert"
              >
                ×
              </button>
            )}
            <div className="alert-timestamp">
              {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="remaining-alerts">
            <div className="remaining-count">+{remainingCount}</div>
            <div className="remaining-text">more</div>
          </div>
        )}
      </div>
      
      {alerts.length > maxVisibleAlerts && (
        <div className="scroll-indicators">
          {Array.from({ length: Math.ceil(alerts.length / maxVisibleAlerts) }).map((_, index) => (
            <div
              key={index}
              className={`scroll-dot ${index === Math.floor(currentIndex / maxVisibleAlerts) ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index * maxVisibleAlerts)}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 