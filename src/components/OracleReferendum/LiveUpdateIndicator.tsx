import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface LiveUpdateIndicatorProps {
  isConnected: boolean;
  recentActivity?: boolean;
  className?: string;
}

/**
 * Live Update Indicator Component
 * 
 * Shows real-time connection status and recent voting activity
 */
export const LiveUpdateIndicator: React.FC<LiveUpdateIndicatorProps> = ({
  isConnected,
  recentActivity = false,
  className = ''
}) => {
  const [pulseActivity, setPulseActivity] = useState(false);

  // Pulse animation when there's recent activity
  useEffect(() => {
    if (recentActivity) {
      setPulseActivity(true);
      const timer = setTimeout(() => setPulseActivity(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentActivity]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Offline</span>
          </>
        )}
      </div>

      {/* Activity Indicator */}
      {isConnected && (
        <div className="flex items-center space-x-1">
          <Activity 
            className={`w-4 h-4 transition-all duration-300 ${
              pulseActivity 
                ? 'text-indigo-400 animate-pulse scale-110' 
                : recentActivity
                  ? 'text-indigo-400'
                  : 'text-gray-500'
            }`} 
          />
          {pulseActivity && (
            <span className="text-xs text-indigo-400 font-medium animate-pulse">
              New Vote!
            </span>
          )}
        </div>
      )}

      {/* Connection Dot */}
      <div 
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          isConnected 
            ? 'bg-green-400 animate-pulse' 
            : 'bg-gray-400'
        }`}
      />
    </div>
  );
}; 