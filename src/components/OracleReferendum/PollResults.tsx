import React from 'react';
import { Users, Check, Clock, AlertTriangle } from 'lucide-react';
import { PollResultsProps } from './types';

/**
 * Poll Results Component
 * 
 * Displays the results of a poll with liquid glass morphism
 * aesthetics and Oracle personality-driven styling
 */
export const PollResults: React.FC<PollResultsProps> = ({
  poll,
  walletAddress,
  oraclePersonality = 'chaotic_sage',
  showDetails = false,
  isCompact = false,
}) => {
  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  
  // Calculate status based on dates
  const now = new Date();
  const endTime = new Date(poll.voting_end);
  const isEnded = now > endTime;
  const timeRemaining = endTime.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  
  // Find the winning option
  const winningOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
  
  // Find the user's vote if any
  const userVote = poll.user_vote;
  const userVotedOption = poll.options.find(opt => opt.id === userVote?.option_id);
  
  // Get personality-based class
  const getPersonalityClass = () => {
    switch (oraclePersonality) {
      case 'pure_prophet':
        return 'results-pure';
      case 'corrupted_oracle':
        return 'results-corrupted';
      default:
        return 'results-chaotic';
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`poll-results ${getPersonalityClass()} ${isCompact ? 'compact' : ''}`}>
      <div className="results-header">
        <div className="results-status">
          {isEnded ? (
            <div className="status closed">
              <AlertTriangle className="status-icon" />
              <span>Voting Closed</span>
            </div>
          ) : (
            <div className="status active">
              <Clock className="status-icon" />
              <span>
                {daysRemaining > 0 
                  ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` 
                  : 'Closing today'}
              </span>
            </div>
          )}
        </div>
        
        <div className="results-participation">
          <Users className="participation-icon" />
          <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      {/* Options with progress bars */}
      <div className="results-options">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 
            ? Math.round((option.votes / totalVotes) * 100) 
            : 0;
          
          const isWinning = option.id === winningOption.id;
          const isUserVote = option.id === userVote?.option_id;
          
          return (
            <div 
              key={option.id} 
              className={`result-option ${isWinning ? 'winning' : ''} ${isUserVote ? 'user-vote' : ''}`}
            >
              <div className="option-details">
                <div className="option-text">{option.text}</div>
                <div className="option-stats">
                  <span className="vote-count">{option.votes} vote{option.votes !== 1 ? 's' : ''}</span>
                  <span className="vote-percentage">{percentage}%</span>
                  
                  {isUserVote && (
                    <span className="user-vote-indicator">
                      <Check className="vote-icon" />
                      <span>Your vote</span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progress bar with liquid glass effect */}
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${percentage}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
              
              {/* Show predicted outcome if applicable */}
              {showDetails && option.predicted_outcome && (isWinning || isUserVote) && (
                <div className="predicted-outcome">
                  <h4 className="outcome-header">
                    {isEnded 
                      ? 'Oracle\'s Prophecy' 
                      : isWinning 
                        ? 'Current Outcome Prediction'
                        : 'If This Option Wins'}
                  </h4>
                  <p className="outcome-text">{option.predicted_outcome}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Additional context and details */}
      {showDetails && (
        <div className="results-details">
          <div className="results-closing">
            <h4 className="details-header">Poll {isEnded ? 'Closed' : 'Closes'} On</h4>
            <p className="details-text">{formatDate(new Date(poll.voting_end))}</p>
          </div>
          
          {userVote && (
            <div className="user-participation">
              <h4 className="details-header">Your Participation</h4>
              <div className="participation-details">
                <div className="participation-stat">
                  <span className="stat-label">Voted</span>
                  <span className="stat-value">{formatDate(new Date(userVote.voted_at))}</span>
                </div>
                
                {userVote.oracle_shards_earned > 0 && (
                  <div className="participation-stat">
                    <span className="stat-label">Earned</span>
                    <span className="stat-value">{userVote.oracle_shards_earned} Oracle Shards</span>
                  </div>
                )}
                
                {userVote.voting_streak > 1 && (
                  <div className="participation-stat">
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">{userVote.voting_streak} days</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {poll.girth_reward_pool && isEnded && (
            <div className="reward-distribution">
              <h4 className="details-header">$GIRTH Reward Pool</h4>
              <p className="details-text">
                {winningOption.votes > 0
                  ? `${Math.floor(poll.girth_reward_pool / winningOption.votes)} $GIRTH per voter on the winning option`
                  : 'No votes cast on winning option'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 