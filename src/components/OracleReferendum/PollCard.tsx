import React from 'react';
import { CalendarClock, Users, Sparkles } from 'lucide-react';
import { PollCardProps } from './types';

/**
 * PollCard Component
 * 
 * Displays an individual poll in the navigation list with
 * visual styling based on category and Oracle personality
 */
export const PollCard: React.FC<PollCardProps> = ({
  poll,
  onClick,
  isActive = false,
  oraclePersonality = 'chaotic_sage',
  isCompact = false,
}) => {
  // Calculate time remaining
  const now = new Date();
  const endTime = new Date(poll.voting_end);
  const timeRemaining = endTime.getTime() - now.getTime();
  const daysRemaining = isNaN(timeRemaining) ? 0 : Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  
  // Calculate participation rate as percentage - use correct property name and add safety checks
  const totalVotes = poll.options?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0;
  
  // Select category icon
  const getCategoryIcon = () => {
    switch (poll.category) {
      case 'prophecy':
        return <Sparkles className="w-4 h-4" />;
      case 'lore':
        return <CalendarClock className="w-4 h-4" />;
      case 'game_evolution':
        return <Sparkles className="w-4 h-4" />;
      case 'oracle_personality':
        return <Users className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  // Get category display name
  const getCategoryName = () => {
    switch (poll.category) {
      case 'prophecy':
        return 'Prophecy';
      case 'lore':
        return 'Lore Direction';
      case 'game_evolution':
        return 'Game Evolution';
      case 'oracle_personality':
        return 'Oracle Personality';
      default:
        return poll.category;
    }
  };
  
  // Get personality-based styling classes
  const getPersonalityClass = () => {
    switch (poll.oracle_personality) {
      case 'pure_prophet':
        return 'poll-card-pure';
      case 'corrupted_oracle':
        return 'poll-card-corrupted';
      default:
        return 'poll-card-chaotic';
    }
  };

  return (
    <div 
      className={`poll-card ${getPersonalityClass()} ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="poll-card-category">
        <span className="category-icon">{getCategoryIcon()}</span>
        <span className="category-name">{getCategoryName()}</span>
      </div>
      
      <h4 className="poll-card-title">
        {isCompact && poll.title.length > 60 
          ? `${poll.title.substring(0, 60)}...` 
          : poll.title}
      </h4>
      
      <div className="poll-card-footer">
        <div className="poll-card-stats">
          <div className="stat-item">
            <Users className="stat-icon" />
            <span className="stat-value">{String(totalVotes)}</span>
          </div>
          
          <div className="stat-item">
            <CalendarClock className="stat-icon" />
            <span className="stat-value">
              {daysRemaining > 0 ? `${daysRemaining}d` : 'Ending today'}
            </span>
          </div>
        </div>
        
        {poll.user_vote && (
          <div className="voted-indicator">
            <span className="voted-icon">✓</span>
            <span className="voted-text">Voted</span>
          </div>
        )}
      </div>
      
      {/* Dynamic glow effect based on personality */}
      <div className="poll-card-glow"></div>
    </div>
  );
}; 