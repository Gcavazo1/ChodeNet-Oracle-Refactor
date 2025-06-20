import React, { useState, useEffect } from 'react';
import { VoteIcon, Loader2, Clock, AlertCircle } from 'lucide-react';
import { VotingInterfaceProps } from './types';

/**
 * VotingInterface Component
 * 
 * Displays voting options for a poll and handles vote submission
 */
export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  poll,
  walletConnected,
  onVote,
  oraclePersonality = 'chaotic_sage',
  isVoting = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hoverOption, setHoverOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownInfo, setCooldownInfo] = useState<{
    hoursRemaining: number;
    cooldownExpiresAt: Date;
  } | null>(null);
  
  // Real-time countdown state
  const [realTimeCountdown, setRealTimeCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } | null>(null);

  // Check for cooldown info from poll data
  useEffect(() => {
    if (poll.cooldown_info && !poll.cooldown_info.can_vote) {
      console.log('🕐 Poll has cooldown info, user cannot vote:', poll.cooldown_info);
      setCooldownInfo({
        hoursRemaining: poll.cooldown_info.hours_remaining,
        cooldownExpiresAt: poll.cooldown_info.cooldown_expires_at || new Date()
      });
      setError(null); // Clear any previous errors
    } else {
      setCooldownInfo(null); // User can vote
      setRealTimeCountdown(null); // Clear countdown
    }
  }, [poll.cooldown_info]);

  // Real-time countdown timer
  useEffect(() => {
    if (!cooldownInfo) {
      setRealTimeCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const cooldownEnd = cooldownInfo.cooldownExpiresAt.getTime();
      const timeRemaining = cooldownEnd - now;

      if (timeRemaining <= 0) {
        // Cooldown has expired! Clear the cooldown info
        setCooldownInfo(null);
        setRealTimeCountdown(null);
        console.log('🎉 Cooldown expired! User can now vote again.');
        return;
      }

      const totalSeconds = Math.floor(timeRemaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setRealTimeCountdown({
        hours,
        minutes,
        seconds,
        totalSeconds
      });
    };

    // Update immediately
    updateCountdown();
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownInfo]);

  const handleVote = async () => {
    // Don't allow voting if cooldown is active
    if (cooldownInfo) {
      console.log('🕐 Vote blocked - user is in cooldown period');
      return;
    }

    if (!selectedOption) {
      setError('Please select an option before voting');
      return;
    }
    
    setError(null);
    setCooldownInfo(null);
    
    try {
      await onVote(poll.id, selectedOption);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        
        // Check if this error has cooldown data attached
        const cooldownData = (err as any).cooldown;
        if (cooldownData && cooldownData.hours_remaining > 0) {
          console.log('🕐 Processing cooldown error with structured data:', cooldownData);
          setCooldownInfo({
            hoursRemaining: cooldownData.hours_remaining,
            cooldownExpiresAt: new Date(cooldownData.cooldown_expires_at)
          });
          setError(null); // Don't show generic error when we have cooldown info
        }
        // Fallback: Check if this is a cooldown error by parsing the message
        else if (errorMessage.includes('must wait') && errorMessage.includes('hours before voting')) {
          // Extract hours from error message like "You must wait 12.5 more hours"
          const hoursMatch = errorMessage.match(/wait\s+([\d.]+)\s+more\s+hours/);
          if (hoursMatch) {
            const hoursRemaining = parseFloat(hoursMatch[1]);
            const cooldownExpiresAt = new Date();
            cooldownExpiresAt.setHours(cooldownExpiresAt.getHours() + hoursRemaining);
            
            setCooldownInfo({
              hoursRemaining,
              cooldownExpiresAt
            });
            setError(null); // Don't show generic error when we have cooldown info
          } else {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Failed to submit vote');
      }
    }
  };

  const formatCooldownTime = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.ceil(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      const roundedHours = Math.ceil(hours);
      return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.ceil(hours % 24);
      return `${days} day${days !== 1 ? 's' : ''} ${remainingHours > 0 ? `${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''}`.trim();
    }
  };

  const getPersonalityClass = () => {
    switch (oraclePersonality) {
      case 'pure_prophet':
        return 'pure-prophet';
      case 'corrupted_oracle':
        return 'corrupted-oracle';
      default:
        return 'chaotic-sage';
    }
  };

  return (
    <div className={`oracle-voting-interface ${getPersonalityClass()}`}>
      <h3 className="oracle-voting-title">Cast Your Vote</h3>
      
      {/* Enhanced Error Display */}
      {error && (
        <div className="oracle-voting-error">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Live Cooldown Timer Display */}
      {cooldownInfo && realTimeCountdown && (
        <div className="oracle-voting-cooldown">
          <div className="cooldown-header">
            <Clock className="w-5 h-5 cooldown-clock-icon" />
            <h4>24-Hour Voting Cooldown Active</h4>
          </div>
          <div className="cooldown-content">
            <p className="cooldown-message">
              You've already voted on this poll. You can change your vote when the timer reaches zero.
            </p>
            
            {/* Real-time countdown timer */}
            <div className="cooldown-timer-display">
              <div className={`timer-segment ${realTimeCountdown.totalSeconds <= 3600 ? 'urgent' : ''}`}>
                <span className={`timer-number ${realTimeCountdown.totalSeconds <= 3600 ? 'urgent' : ''}`}>
                  {realTimeCountdown.hours.toString().padStart(2, '0')}
                </span>
                <span className="timer-label">Hours</span>
              </div>
              <div className="timer-separator">:</div>
              <div className={`timer-segment ${realTimeCountdown.totalSeconds <= 3600 ? 'urgent' : ''}`}>
                <span className={`timer-number ${realTimeCountdown.totalSeconds <= 3600 ? 'urgent' : ''}`}>
                  {realTimeCountdown.minutes.toString().padStart(2, '0')}
                </span>
                <span className="timer-label">Minutes</span>
              </div>
              <div className="timer-separator">:</div>
              <div className={`timer-segment ${realTimeCountdown.totalSeconds <= 300 ? 'urgent' : ''}`}>
                <span className={`timer-number ${realTimeCountdown.totalSeconds <= 300 ? 'urgent' : ''}`}>
                  {realTimeCountdown.seconds.toString().padStart(2, '0')}
                </span>
                <span className="timer-label">Seconds</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="cooldown-progress-container">
              <div 
                className="cooldown-progress-bar"
                style={{
                  width: `${Math.max(0, Math.min(100, ((24 * 3600 - realTimeCountdown.totalSeconds) / (24 * 3600)) * 100))}%`
                }}
              />
            </div>
            
            <div className="cooldown-expires">
              <span className="cooldown-label">Vote available at:</span>
              <span className="cooldown-timestamp">
                {cooldownInfo.cooldownExpiresAt.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="oracle-voting-options">
        {poll.options.map((option) => (
          <div
            key={option.id}
            className={`oracle-voting-option ${selectedOption === option.id ? 'selected' : ''} ${hoverOption === option.id ? 'hover' : ''} ${cooldownInfo ? 'disabled' : ''}`}
            onClick={() => !cooldownInfo && setSelectedOption(option.id)}
            onMouseEnter={() => !cooldownInfo && setHoverOption(option.id)}
            onMouseLeave={() => setHoverOption(null)}
          >
            <div className="oracle-option-radio">
              <div className="oracle-option-radio-inner"></div>
            </div>
            
            <div className="oracle-option-content">
              <h4 className="oracle-option-text">{option.text}</h4>
              
              {(selectedOption === option.id || hoverOption === option.id) && option.ai_reasoning && (
                <div className="oracle-option-reasoning">
                  <p>{option.ai_reasoning}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="oracle-voting-actions">
        {!walletConnected ? (
          <div className="oracle-wallet-warning">
            <p>Connect your wallet to participate in the referendum</p>
          </div>
        ) : cooldownInfo && realTimeCountdown ? (
          <div className="oracle-cooldown-notice">
            <Clock className="w-5 h-5" />
            <span>
              Vote again in {realTimeCountdown.hours}h {realTimeCountdown.minutes}m {realTimeCountdown.seconds}s
            </span>
          </div>
        ) : (
          <button
            className={`oracle-vote-button ${!selectedOption ? 'disabled' : ''}`}
            onClick={handleVote}
            disabled={!selectedOption || isVoting}
          >
            {isVoting ? (
              <>
                <Loader2 className="oracle-vote-loader" />
                <span>Recording Vote...</span>
              </>
            ) : (
              <>
                <VoteIcon size={16} />
                <span>Submit Vote</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}; 