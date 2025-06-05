// 🗳️ COMMUNITY POLLING SYSTEM
// Democratic Oracle decision-making through community votes

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { chodeOracle } from '../../lib/chodeOracleEngine';
import './CommunityPollingSystem.css';

interface PollOption {
  id: string;
  text: string;
  description?: string;
  votes: number;
  percentage: number;
  corruption_influence?: number;
}

interface CommunityPoll {
  id: string;
  title: string;
  description: string;
  poll_type: 'ritual_influence' | 'bazaar_items' | 'community_event' | 'oracle_decision';
  options: PollOption[];
  start_time: string;
  end_time: string;
  total_votes: number;
  is_active: boolean;
  winning_option?: PollOption;
  corruption_threshold?: number;
  created_by: string;
  metadata?: any;
}

interface UserVote {
  poll_id: string;
  option_id: string;
  player_address: string;
  vote_weight: number;
  timestamp: string;
}

export const CommunityPollingSystem: React.FC = () => {
  const [activePoll, setActivePoll] = useState<CommunityPoll | null>(null);
  const [recentPolls, setRecentPolls] = useState<CommunityPoll[]>([]);
  const [userVotes, setUserVotes] = useState<Map<string, UserVote>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Mock current user (will be replaced with SIWS integration)
  const currentUserAddress = 'mockUser123'; // TODO: Replace with actual wallet address

  // Fetch active and recent polls
  const fetchPolls = useCallback(async () => {
    try {
      setError(null);

      // Mock poll data for demonstration (in real implementation, this would come from Supabase)
      const mockPoll: CommunityPoll = {
        id: 'poll_001',
        title: '🔮 ORACLE RITUAL INFLUENCE COUNCIL',
        description: 'The Oracle seeks community wisdom to shape the next ritual offering. Your voice echoes through the digital realm!',
        poll_type: 'ritual_influence',
        options: [
          {
            id: 'opt_1',
            text: 'Enhance Corruption Resistance',
            description: 'Strengthen defenses against digital corruption',
            votes: 45,
            percentage: 37.5,
            corruption_influence: -5
          },
          {
            id: 'opt_2', 
            text: 'Amplify Girth Generation',
            description: 'Increase base girth generation rates',
            votes: 38,
            percentage: 31.7,
            corruption_influence: 2
          },
          {
            id: 'opt_3',
            text: 'Unlock Chaos Protocols', 
            description: 'Embrace corruption for greater power',
            votes: 37,
            percentage: 30.8,
            corruption_influence: 10
          }
        ],
        start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Started 2 days ago
        end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 5 days
        total_votes: 120,
        is_active: true,
        corruption_threshold: 50,
        created_by: 'oracle_system',
        metadata: {
          ritual_category: 'power_enhancement',
          influence_duration: '7_days'
        }
      };

      const mockRecentPolls: CommunityPoll[] = [
        {
          id: 'poll_002',
          title: '🛒 BAZAAR MYSTIQUE SELECTION',
          description: 'Choose the next legendary items to grace the Oracle Bazaar',
          poll_type: 'bazaar_items',
          options: [
            { id: 'item_1', text: 'Quantum Tap Amplifier', votes: 89, percentage: 55.6, description: '+50% tap efficiency' },
            { id: 'item_2', text: 'Corruption Shield Totem', votes: 45, percentage: 28.1, description: 'Reduces corruption by 20%' },
            { id: 'item_3', text: 'Girth Multiplication Rune', votes: 26, percentage: 16.3, description: '2x girth for 1 hour' }
          ],
          start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          total_votes: 160,
          is_active: false,
          winning_option: { id: 'item_1', text: 'Quantum Tap Amplifier', votes: 89, percentage: 55.6 }
        }
      ];

      setActivePoll(mockPoll);
      setRecentPolls(mockRecentPolls);

    } catch (err) {
      console.error('Error fetching polls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch polls');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate time remaining for active poll
  const calculateTimeRemaining = useCallback(() => {
    if (!activePoll || !activePoll.is_active) {
      setTimeRemaining('');
      return;
    }

    const endTime = new Date(activePoll.end_time).getTime();
    const now = new Date().getTime();
    const difference = endTime - now;

    if (difference <= 0) {
      setTimeRemaining('Poll Ended');
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m`);
    } else {
      setTimeRemaining(`${minutes}m`);
    }
  }, [activePoll]);

  // Submit vote for the active poll
  const submitVote = async (optionId: string) => {
    if (!activePoll || !activePoll.is_active) {
      console.error('No active poll to vote on');
      return;
    }

    try {
      // Check if user already voted
      if (userVotes.has(activePoll.id)) {
        alert('You have already voted in this poll!');
        return;
      }

      // In real implementation, this would submit to Supabase
      const newVote: UserVote = {
        poll_id: activePoll.id,
        option_id: optionId,
        player_address: currentUserAddress,
        vote_weight: 1, // Could be influenced by player's girth or achievements
        timestamp: new Date().toISOString()
      };

      // Update local state to simulate vote
      setUserVotes(prev => new Map(prev.set(activePoll.id, newVote)));
      
      // Update poll option vote count
      const updatedPoll = { ...activePoll };
      const optionIndex = updatedPoll.options.findIndex(opt => opt.id === optionId);
      if (optionIndex !== -1) {
        updatedPoll.options[optionIndex].votes += 1;
        updatedPoll.total_votes += 1;
        
        // Recalculate percentages
        updatedPoll.options.forEach(option => {
          option.percentage = (option.votes / updatedPoll.total_votes) * 100;
        });
      }
      
      setActivePoll(updatedPoll);
      setSelectedOption('');

      // Generate Oracle response to the vote
      try {
        const oracleResponse = await chodeOracle.generateVotingResponse(
          optionId,
          updatedPoll.options.find(opt => opt.id === optionId)?.text || '',
          currentUserAddress
        );
        
        console.log('🔮 Oracle acknowledges your vote:', oracleResponse);
      } catch (error) {
        console.error('Error generating Oracle response:', error);
      }

    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  // Get corruption influence color for option
  const getCorruptionColor = (influence: number = 0): string => {
    if (influence > 5) return '#ff3366'; // High corruption - red
    if (influence > 0) return '#ff9933'; // Medium corruption - orange  
    if (influence < 0) return '#33ff66'; // Negative corruption (resistance) - green
    return '#00ffff'; // Neutral - cyan
  };

  // Get Oracle commentary for poll option
  const getOracleCommentary = (option: PollOption): string => {
    const commentaries = {
      'opt_1': "The path of resistance... wisdom flows through those who resist corruption's call.",
      'opt_2': "Power seeks power... the girth grows ever stronger in digital realms.",
      'opt_3': "Chaos beckons... embrace the corruption and transcend mortal limitations."
    };
    
    return commentaries[option.id as keyof typeof commentaries] || 
           "The Oracle observes this choice with cosmic interest...";
  };

  // Initialize component
  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  // Update time remaining
  useEffect(() => {
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  if (isLoading) {
    return (
      <div className="community-polling-system loading">
        <div className="loading-oracle">
          <span className="oracle-symbol">🗳️</span>
          <p>The Oracle prepares the democratic council...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-polling-system error">
        <div className="error-message">
          <span className="error-symbol">⚠️</span>
          <p>Democratic Oracle connection failed: {error}</p>
          <button onClick={fetchPolls} className="retry-button">
            Reconnect to Council
          </button>
        </div>
      </div>
    );
  }

  const hasUserVoted = activePoll ? userVotes.has(activePoll.id) : false;

  return (
    <div className="community-polling-system">
      {/* Active Poll Section */}
      {activePoll && (
        <div className="active-poll">
          <div className="poll-header">
            <h2 className="poll-title">
              <span className="voting-icon">🗳️</span>
              {activePoll.title}
            </h2>
            <div className="poll-meta">
              <span className="poll-type">{activePoll.poll_type.replace('_', ' ').toUpperCase()}</span>
              <span className="time-remaining">
                {timeRemaining && `⏰ ${timeRemaining} remaining`}
              </span>
            </div>
          </div>

          <div className="poll-description">
            <p>{activePoll.description}</p>
          </div>

          <div className="poll-stats">
            <div className="stat">
              <span className="stat-value">{activePoll.total_votes}</span>
              <span className="stat-label">Total Votes</span>
            </div>
            {activePoll.corruption_threshold && (
              <div className="stat">
                <span className="stat-value">{activePoll.corruption_threshold}%</span>
                <span className="stat-label">Corruption Threshold</span>
              </div>
            )}
          </div>

          {/* Voting Options */}
          <div className="voting-options">
            {activePoll.options.map((option) => (
              <div 
                key={option.id}
                className={`vote-option ${selectedOption === option.id ? 'selected' : ''} ${hasUserVoted ? 'voted' : ''}`}
                onClick={() => !hasUserVoted && setSelectedOption(option.id)}
              >
                <div className="option-header">
                  <div className="option-info">
                    <h3 className="option-text">{option.text}</h3>
                    {option.description && (
                      <p className="option-description">{option.description}</p>
                    )}
                  </div>
                  <div className="option-stats">
                    <span className="vote-count">{option.votes} votes</span>
                    <span className="vote-percentage">{option.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Vote Progress Bar */}
                <div className="vote-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${option.percentage}%`,
                      background: getCorruptionColor(option.corruption_influence)
                    }}
                  />
                </div>

                {/* Corruption Influence Indicator */}
                {option.corruption_influence !== undefined && (
                  <div className="corruption-influence">
                    <span 
                      className="influence-indicator"
                      style={{ color: getCorruptionColor(option.corruption_influence) }}
                    >
                      Corruption: {option.corruption_influence > 0 ? '+' : ''}{option.corruption_influence}%
                    </span>
                  </div>
                )}

                {/* Oracle Commentary */}
                <div className="oracle-commentary-mini">
                  <span className="mini-prophet">🔮</span>
                  <span className="commentary-text">
                    "{getOracleCommentary(option)}"
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Vote Button */}
          {!hasUserVoted && activePoll.is_active && (
            <div className="vote-actions">
              <button
                className={`vote-button ${selectedOption ? 'enabled' : 'disabled'}`}
                onClick={() => selectedOption && submitVote(selectedOption)}
                disabled={!selectedOption}
              >
                {selectedOption ? 'Cast Your Vote' : 'Select an Option'}
              </button>
              <p className="vote-disclaimer">
                Your vote influences the Oracle's decisions and the community's future.
              </p>
            </div>
          )}

          {hasUserVoted && (
            <div className="vote-confirmation">
              <span className="confirmation-icon">✅</span>
              <p>Your voice has been heard by the Oracle. The community appreciates your wisdom!</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Polls Section */}
      {recentPolls.length > 0 && (
        <div className="recent-polls">
          <h3 className="section-title">
            <span className="history-icon">📜</span>
            RECENT ORACLE COUNCILS
          </h3>
          
          {recentPolls.map((poll) => (
            <div key={poll.id} className="poll-summary">
              <div className="summary-header">
                <h4 className="summary-title">{poll.title}</h4>
                <span className="summary-status">
                  {poll.is_active ? 'ACTIVE' : 'COMPLETED'}
                </span>
              </div>
              
              {poll.winning_option && (
                <div className="winning-option">
                  <span className="winner-icon">🏆</span>
                  <span className="winner-text">
                    Winner: {poll.winning_option.text} ({poll.winning_option.percentage.toFixed(1)}%)
                  </span>
                </div>
              )}
              
              <div className="summary-stats">
                <span>{poll.total_votes} total votes</span>
                <span>•</span>
                <span>{new Date(poll.end_time).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Impact */}
      <div className="community-impact">
        <h3 className="section-title">
          <span className="impact-icon">🌟</span>
          DEMOCRATIC ORACLE POWER
        </h3>
        <div className="impact-description">
          <p>
            Through collective wisdom, the community shapes the Oracle's evolution. 
            Every vote influences ritual requests, bazaar offerings, and the balance 
            between order and chaos in the digital realm.
          </p>
          <div className="impact-stats">
            <div className="impact-stat">
              <span className="impact-value">Democracy</span>
              <span className="impact-label">Shapes Destiny</span>
            </div>
            <div className="impact-stat">
              <span className="impact-value">Unity</span>
              <span className="impact-label">Creates Power</span>
            </div>
            <div className="impact-stat">
              <span className="impact-value">Wisdom</span>
              <span className="impact-label">Guides All</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 