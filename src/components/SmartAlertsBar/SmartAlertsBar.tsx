import React, { useState, useEffect, useRef } from 'react';
import './SmartAlertsBar.css';

export interface Alert {
  id: string;
  type: 'prophecy' | 'poll' | 'milestone' | 'glitch' | 'community' | 'system';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  dismissible?: boolean;
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
}

interface SmartAlertsBarProps {
  alerts?: Alert[];
  autoScroll?: boolean;
  scrollInterval?: number;
  maxVisibleAlerts?: number;
  onAlertDismiss?: (alertId: string) => void;
  onAlertClick?: (alert: Alert) => void;
}

export const SmartAlertsBar: React.FC<SmartAlertsBarProps> = ({
  alerts: externalAlerts = [],
  autoScroll = true,
  scrollInterval = 5000,
  maxVisibleAlerts = 3,
  onAlertDismiss,
  onAlertClick
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Demo alerts for testing
  const demoAlerts: Alert[] = [
    {
      id: '1',
      type: 'prophecy',
      title: 'Prophecy Born',
      message: 'The Oracle whispers of ascending girth...',
      icon: '🔮',
      priority: 'high',
      timestamp: new Date(),
      dismissible: true,
      autoHide: false
    },
    {
      id: '2',
      type: 'poll',
      title: 'Poll Ending Soon',
      message: 'Community vote closes in 2 hours - "Choose the Next Ritual"',
      icon: '📊',
      priority: 'medium',
      timestamp: new Date(Date.now() - 300000),
      dismissible: true,
      autoHide: false
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Milestone Reached',
      message: 'Community achieved 500K total taps! $GIRTH flows eternal!',
      icon: '💰',
      priority: 'high',
      timestamp: new Date(Date.now() - 600000),
      dismissible: true,
      autoHide: false
    },
    {
      id: '4',
      type: 'glitch',
      title: 'Glitch Event',
      message: 'Reality fractures... forbidden fragments detected in data stream',
      icon: '⚡',
      priority: 'critical',
      timestamp: new Date(Date.now() - 900000),
      dismissible: false,
      autoHide: true,
      hideAfter: 8000
    },
    {
      id: '5',
      type: 'community',
      title: 'New Player Evolved',
      message: 'Player 0xG1RTH...420 ascended to Chode Master tier!',
      icon: '🌟',
      priority: 'low',
      timestamp: new Date(Date.now() - 1200000),
      dismissible: true,
      autoHide: false
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

  // Initialize alerts (use demo alerts if no external alerts provided)
  useEffect(() => {
    const initialAlerts = externalAlerts.length > 0 ? externalAlerts : demoAlerts;
    // Sort by priority and timestamp
    const sortedAlerts = [...initialAlerts].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    setAlerts(sortedAlerts);
  }, [externalAlerts]);

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
    onAlertDismiss?.(alertId);
  };

  const handleAlertClick = (alert: Alert) => {
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
            className={`alert-card ${getAlertTypeClass(alert.type)} ${getPriorityClass(alert.priority)}`}
            onClick={() => handleAlertClick(alert)}
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