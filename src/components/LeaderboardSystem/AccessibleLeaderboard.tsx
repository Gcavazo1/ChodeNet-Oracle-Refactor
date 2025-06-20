import React, { useRef, useEffect } from 'react';
import { LeaderboardEntry } from '../../types/leaderboard';
import { useLeaderboardStore } from '../../store/leaderboardStore';

interface AccessibleLeaderboardProps {
  entries: LeaderboardEntry[];
  category: string;
  scoreLabel: string;
  children: React.ReactNode;
}

const AccessibleLeaderboard: React.FC<AccessibleLeaderboardProps> = ({
  entries,
  category,
  scoreLabel,
  children
}) => {
  const { isLoading, realTimeEnabled } = useLeaderboardStore();
  const announcementRef = useRef<HTMLDivElement>(null);
  const previousEntriesLength = useRef(entries.length);

  // Announce changes for screen readers
  useEffect(() => {
    if (announcementRef.current) {
      const currentLength = entries.length;
      const previousLength = previousEntriesLength.current;
      
      if (currentLength !== previousLength && !isLoading) {
        const message = currentLength > previousLength 
          ? `${currentLength - previousLength} new Oracle entries added`
          : `Oracle leaderboard updated with ${currentLength} entries`;
        
        announcementRef.current.textContent = message;
      }
      
      previousEntriesLength.current = currentLength;
    }
  }, [entries.length, isLoading]);

  return (
    <div
      role="region"
      aria-label={`Oracle Leaderboard for ${category}`}
      aria-live={realTimeEnabled ? "polite" : "off"}
      aria-busy={isLoading}
    >
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Loading announcement */}
      {isLoading && (
        <div className="sr-only" aria-live="polite">
          Loading Oracle leaderboard data
        </div>
      )}
      
      {/* Main content */}
      <div
        role="table"
        aria-label={`${scoreLabel} leaderboard rankings`}
        aria-rowcount={entries.length}
        aria-colcount={4}
      >
        {children}
      </div>
      
      {/* Summary for screen readers */}
      <div className="sr-only">
        Leaderboard summary: {entries.length} Oracle entries displayed, 
        sorted by {scoreLabel} in descending order. 
        {realTimeEnabled && "Live updates enabled."}
      </div>
    </div>
  );
};

export default AccessibleLeaderboard;