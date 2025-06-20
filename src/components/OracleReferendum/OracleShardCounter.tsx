import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { OracleShardCounterProps } from './types';

/**
 * Oracle Shard Counter Component
 * 
 * Displays the user's Oracle Shards balance with cool animations
 * when new shards are earned through voting
 */
export const OracleShardCounter: React.FC<OracleShardCounterProps> = ({
  balance = 0,
  totalEarned,
  votingStreak,
  animateIncrement = false,
  size = 'medium',
}) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevBalanceRef = useRef(balance);
  
  // Animate the balance changes
  useEffect(() => {
    if (animateIncrement && balance > prevBalanceRef.current) {
      setIsAnimating(true);
      
      // Animate counting up
      const diff = balance - prevBalanceRef.current;
      const duration = Math.min(Math.max(diff * 50, 500), 2000); // between 0.5s and 2s
      const startTime = Date.now();
      const startBalance = prevBalanceRef.current;
      
      const updateCounter = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentBalance = Math.floor(startBalance + diff * easedProgress);
        
        setDisplayBalance(currentBalance);
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Animation complete
          setDisplayBalance(balance);
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(updateCounter);
    } else {
      setDisplayBalance(balance);
    }
    
    prevBalanceRef.current = balance;
  }, [balance, animateIncrement]);
  
  // Size class for styling
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'counter-small';
      case 'large':
        return 'counter-large';
      default:
        return 'counter-medium';
    }
  };
  
  return (
    <div className={`oracle-shard-counter ${getSizeClass()}`}>
      <div className="shard-icon-container">
        <div className="shard-icon">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={isAnimating ? 'pulse' : ''}
          >
            <path 
              d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="url(#shard-gradient)" 
            />
            <defs>
              <linearGradient id="shard-gradient" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Glow effect for animation */}
          {isAnimating && <div className="shard-glow"></div>}
        </div>
      </div>
      
      <div className="shard-info">
        <div className="shard-balance">
          <span className="shard-value">{displayBalance}</span>
          <span className="shard-label">Oracle Shards</span>
        </div>
        
        {(totalEarned !== undefined || votingStreak !== undefined) && (
          <div className="shard-stats">
            {totalEarned !== undefined && (
              <div className="stat-item">
                <TrendingUp className="stat-icon" />
                <span className="stat-value">{totalEarned} earned</span>
              </div>
            )}
            
            {votingStreak !== undefined && votingStreak > 1 && (
              <div className="stat-item">
                <Award className="stat-icon" />
                <span className="stat-value">{votingStreak} day streak</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Floating increment particles when earning shards */}
      {isAnimating && (
        <div className="shard-particles">
          <div className="particle p1">+{balance - prevBalanceRef.current}</div>
          <div className="particle p2">💎</div>
          <div className="particle p3">✨</div>
        </div>
      )}
    </div>
  );
}; 