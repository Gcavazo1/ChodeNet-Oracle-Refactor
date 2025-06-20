import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { sanitizeCommunityInput, validateCommunityInput } from '../../lib/textUtils';
import { useOracleLoreStore } from '../../lib/oracleFlowStore';
import { useSIWS } from '../../lib/useSIWS';
import './CommunityLoreInput.css';

interface LoreCycle {
  id: string;
  cycle_end_time: string;
  total_inputs: number;
  status: string;
}

interface UserInput {
  id: string;
  input_text: string;
  oracle_significance: string;
  created_at: string;
}

interface ToastNotification {
  type: 'success' | 'error' | 'warning';
  message: string;
  visible: boolean;
}

export const CommunityLoreInput: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCycle, setCurrentCycle] = useState<LoreCycle | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [recentInputs, setRecentInputs] = useState<UserInput[]>([]);
  const [characterCount, setCharacterCount] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState<ToastNotification>({ type: 'error', message: '', visible: false });
  
  const highlightLoreEntry = useOracleLoreStore((state) => state.highlightLoreEntry);
  const { isAuthenticated, walletAddress, username } = useSIWS();

  // Reward earned per contribution (kept in sync with edge function constant)
  const SOFT_GIRTH_REWARD = 1;

  useEffect(() => {
    loadCurrentCycle();
    loadRecentInputs();
  }, []);

  // Set up countdown timer when currentCycle is available
  useEffect(() => {
    if (!currentCycle) return;
    
    // Initial countdown calculation
    updateCountdown();
    
    // Update countdown every second
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentCycle]);

  useEffect(() => {
    setCharacterCount(inputText.length);
  }, [inputText]);

  // When the countdown reaches zero, refresh the cycle & clear last submission
  useEffect(() => {
    if (timeRemaining === 0 && currentCycle) {
      // Brief debounce to ensure DB has the new cycle row
      const timeout = setTimeout(async () => {
        await loadCurrentCycle();
        setUserInput(null);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message, visible: true });
  };

  const loadCurrentCycle = async () => {
    try {
      // Calculate current 4-hour cycle
      const now = new Date();
      const cycleStartTime = new Date(now);
      cycleStartTime.setHours(Math.floor(now.getHours() / 4) * 4, 0, 0, 0);

      // Find the current active cycle by checking if now is between start and end time
      const { data: cycles, error } = await supabase
        .from('lore_cycles')
        .select('*')
        .lte('cycle_start_time', now.toISOString())
        .gte('cycle_end_time', now.toISOString())
        .order('cycle_start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading cycle:', error);
        return;
      }

      if (cycles) {
        setCurrentCycle(cycles);
        console.log('Loaded cycle:', cycles);
        // Only check user submission if wallet is connected
        if (isAuthenticated && walletAddress) {
          checkUserSubmission(cycles.id);
        }
      } else {
        // Create cycle info for display even if not in DB yet
        const cycleEndTime = new Date(cycleStartTime.getTime() + 4 * 60 * 60 * 1000);
        console.log('Creating pending cycle:', {
          cycleStartTime: cycleStartTime.toISOString(),
          cycleEndTime: cycleEndTime.toISOString()
        });
        setCurrentCycle({
          id: 'pending',
          cycle_end_time: cycleEndTime.toISOString(),
          total_inputs: 0,
          status: 'collecting'
        });
        // New cycle – clear previous submission so user can contribute again
        setUserInput(null);
      }
    } catch (error) {
      console.error('Error in loadCurrentCycle:', error);
    }
  };

  const checkUserSubmission = async (cycleId: string) => {
    if (!isAuthenticated || !walletAddress) return;

    try {
      const { data: input, error } = await supabase
        .from('community_story_inputs')
        .select('*')
        .eq('player_address', walletAddress)
        .eq('lore_cycle_id', cycleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user submission:', error);
        return;
      }

      setUserInput(input);
    } catch (error) {
      console.error('Error in checkUserSubmission:', error);
    }
  };

  const loadRecentInputs = async () => {
    try {
      const { data: inputs, error } = await supabase
        .from('community_story_inputs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading recent inputs:', error);
        return;
      }

      setRecentInputs(inputs || []);
    } catch (error) {
      console.error('Error in loadRecentInputs:', error);
    }
  };

  const updateCountdown = () => {
    if (!currentCycle) return;

    const now = new Date().getTime();
    const endTime = new Date(currentCycle.cycle_end_time).getTime();
    const remaining = Math.max(0, endTime - now);
    
    // Debug logging
    console.log('Countdown Debug:', {
      now: new Date(now).toISOString(),
      endTime: new Date(endTime).toISOString(),
      cycle_end_time: currentCycle.cycle_end_time,
      remaining: remaining,
      formatted: formatTimeRemaining(remaining)
    });
    
    setTimeRemaining(remaining);
  };

  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔒 WALLET AUTHENTICATION CHECK
    if (!isAuthenticated || !walletAddress) {
      showToast('warning', '🔐 Connect your wallet to contribute to the lore and earn $GIRTH rewards!');
      setError('Wallet connection required to contribute and earn rewards.');
      return;
    }
    
    if (!inputText.trim() || inputText.length > 200) {
      setError('Input must be between 1 and 200 characters.');
      showToast('error', 'Input must be between 1 and 200 characters.');
      return;
    }

    if (userInput) {
      showToast('warning', 'You have already submitted input for this cycle!');
      return;
    }

    // Validate and sanitize the complete input
    const validatedInput = validateCommunityInput({
      input_text: inputText,
      player_address: walletAddress,
      username: username || `Seeker${walletAddress.substring(0, 6)}`
    });

    if (!validatedInput) {
      setError('Invalid input. Please check your text and try again.');
      showToast('error', 'Invalid input. Please check your text and try again.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('collect-community-input', {
        body: validatedInput
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        const successMsg = `${data.message} Oracle Significance: ${data.oracle_significance.toUpperCase()}`;
        setSuccessMessage(successMsg);
        showToast('success', `🎉 Contribution accepted! +${SOFT_GIRTH_REWARD} $GIRTH earned!`);
        
        setTimeout(() => {
          highlightLoreEntry(data.input.id);
        }, 1500);

        setUserInput(data.input);
        setInputText('');
        setCurrentCycle(prev => prev ? {
          ...prev,
          total_inputs: data.cycle_info.total_inputs
        } : null);
        loadRecentInputs(); // Refresh recent inputs
      } else {
        setError(data.error || 'Unknown error occurred');
        showToast('error', data.error || 'Failed to submit contribution');
      }
    } catch (error) {
      console.error('Error submitting community input:', error);
      const errorMsg = 'Failed to submit input. Please try again.';
      setError(errorMsg);
      showToast('error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSignificanceColor = (significance: string): string => {
    switch (significance) {
      case 'legendary': return '#FFD700';
      case 'notable': return '#9D4EDD';
      case 'standard': return '#06D6A0';
      default: return '#FFFFFF';
    }
  };

  const getSignificanceIcon = (significance: string): string => {
    switch (significance) {
      case 'legendary': return '👑';
      case 'notable': return '⭐';
      case 'standard': return '✨';
      default: return '💭';
    }
  };

  if (!currentCycle) {
    return (
      <div className="community-lore-input loading">
        <div className="oracle-loading">🔮 Oracle initializing...</div>
      </div>
    );
  }

  return (
    <div className="community-lore-input">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close" 
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="lore-input-header">
        <h3>🔮 Contribute to the Chode Lore</h3>
        <p className="lore-description">
          Share your vision and help shape the next chapter of our cosmic saga.
          Every 4 hours, the Oracle weaves all contributions into an epic tale.
        </p>
        
        {/* Wallet Authentication Status */}
        {!isAuthenticated ? (
          <div className="auth-warning">
            <div className="warning-icon">🔐</div>
            <div className="warning-content">
              <strong>Wallet Required</strong>
              <p>Connect your wallet to contribute to the lore and earn $GIRTH rewards!</p>
            </div>
          </div>
        ) : (
          <div className="auth-success">
            <div className="success-icon">✅</div>
            <div className="success-content">
              <strong>Wallet Connected</strong>
              <p>Ready to contribute and earn +{SOFT_GIRTH_REWARD} $GIRTH per submission!</p>
            </div>
          </div>
        )}
      </div>

      <div className="cycle-info">
        <div className="cycle-stats">
          <div className="stat">
            <span className="label">Current Cycle</span>
            <span className="value">{currentCycle.total_inputs} voices heard</span>
          </div>
          <div className="stat">
            <span className="label">Time Remaining</span>
            <span className="value countdown">{formatTimeRemaining(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {userInput ? (
        <div className="user-submission-status">
          <div className="submission-complete">
            <div className="status-icon">✅</div>
            <div className="status-content">
              <h4>Your Voice Has Been Heard!</h4>
              <div className="submitted-input">
                <span 
                  className="significance-badge"
                  style={{ color: getSignificanceColor(userInput.oracle_significance) }}
                >
                  {getSignificanceIcon(userInput.oracle_significance)} {userInput.oracle_significance.toUpperCase()}
                </span>
                <p>"{userInput.input_text}"</p>
              </div>
              <div className="reward-badge">
                <span className="reward-icon">💎</span>
                <span className="reward-text">+{SOFT_GIRTH_REWARD} $GIRTH earned</span>
              </div>
              <p className="next-cycle-info">
                You can contribute again in {formatTimeRemaining(timeRemaining)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="lore-input-form">
          <div className="input-field">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isAuthenticated ? 
                "Share your mystical vision... What do you see in the cosmic data streams?" :
                "🔐 Connect your wallet to contribute and earn $GIRTH rewards..."
              }
              maxLength={200}
              className="story-input"
              disabled={isSubmitting || !isAuthenticated}
            />
            <div className="input-footer">
              <span className={`character-count ${characterCount > 180 ? 'warning' : ''}`}>
                {characterCount}/200
              </span>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-contribution" 
            disabled={isSubmitting || !inputText.trim() || characterCount > 200 || !isAuthenticated}
            title={!isAuthenticated ? "Connect your wallet to contribute" : "Submit your contribution"}
          >
            {!isAuthenticated ? (
              <>🔐 Connect Wallet to Contribute</>
            ) : isSubmitting ? (
              <>🔮 Channeling to Oracle...</>
            ) : (
              <>✨ Submit Contribution (+{SOFT_GIRTH_REWARD} $GIRTH)</>
            )}
          </button>
        </form>
      )}

      <div className="recent-contributions">
        <h4>Recent Community Visions</h4>
        <div className="contributions-list">
          {recentInputs.map((input) => (
            <div key={input.id} className="contribution-item">
              <span 
                className="significance-badge small"
                style={{ color: getSignificanceColor(input.oracle_significance) }}
              >
                {getSignificanceIcon(input.oracle_significance)}
              </span>
              <span className="contribution-text">"{input.input_text}"</span>
              <span className="contribution-time">
                {new Date(input.created_at).toLocaleTimeString()}
              </span>
              <span className="reward-inline">💎 +{SOFT_GIRTH_REWARD}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="error-message" style={{ 
          color: '#ef4444', 
          fontSize: '14px', 
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message" style={{ 
          color: '#10b981', 
          fontSize: '14px', 
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          {successMessage}
        </div>
      )}
    </div>
  );
}; 