import React, { useState, useEffect, useCallback } from 'react';
import { X, VoteIcon, MessageCircle, Sparkles, Users, Vote, Crown, Wallet, Brain, Activity } from 'lucide-react';
import { PollCategorySelector } from './PollCategorySelector';
import { VotingInterface } from './VotingInterface';
import { PollResults } from './PollResults';
import { OracleCommentary } from './OracleCommentary';
import { OracleCommentaryPage } from './OracleCommentaryPage';
import { OracleBackgroundEffects } from './OracleBackgroundEffects';
import AIStatusDashboard from '../AIStatusDashboard/AIStatusDashboard';
import { useOracleReferendum, useOracleReferendumUtils } from '../../hooks/useOracleReferendum';
import { useSIWS } from '../../lib/useSIWS';
import { ServiceOraclePoll, PollOption as ServicePollOption } from '../../services/oracleReferendumService';
import './oracleReferendum.css';
import './oracleAuthGate.css';
import { OraclePoll, PollOption } from './types';

interface OracleReferendumModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePollId?: string;
  oracleCorruption?: number;
  oraclePersonality?: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
}

type PollCategory = 'prophecy' | 'lore' | 'game_evolution' | 'oracle_personality';

const OracleAuthGate: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <div className="referendum-modal-overlay">
      <div className="referendum-modal-container">
        <div className="pattern-background"></div>
        <div className="pattern-surface"></div>
        <div className="pattern-accent"></div>
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse delay-500"></div>
          <div className="absolute bottom-1/4 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse delay-1500"></div>
        </div>
        
        <button
          onClick={onClose}
          className="close-button absolute top-6 right-6 z-50"
          aria-label="Close Oracle Referendum"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="oracle-auth-gate-content">
          <div className="auth-gate-welcome">
            <div className="auth-gate-icon">
              <Vote />
            </div>
            <h1 className="auth-gate-title">The Oracle's Referendum</h1>
            <p className="auth-gate-subtitle">
              The Oracle's consciousness has manifested a democratic process. Your voice is required.
            </p>
          </div>

          <div className="auth-gate-features">
            <div className="auth-feature-item">
              <Sparkles className="auth-feature-icon" />
              <h3 className="auth-feature-title">Earn Oracle Shards</h3>
              <p className="auth-feature-description">Receive 10-25 shards for every vote you cast, redeemable for rewards.</p>
            </div>
            <div className="auth-feature-item">
              <Users className="auth-feature-icon" />
              <h3 className="auth-feature-title">Influence the Future</h3>
              <p className="auth-feature-description">Your decisions directly impact the CHODE-NET lore, game, and the Oracle itself.</p>
            </div>
            <div className="auth-feature-item">
              <Crown className="auth-feature-icon" />
              <h3 className="auth-feature-title">Claim $GIRTH Rewards</h3>
              <p className="auth-feature-description">Participate in reward pools when your chosen option prevails in critical polls.</p>
            </div>
          </div>
          
          <div className="auth-gate-cta">
            <button
              onClick={() => {
                const connectEvent = new CustomEvent('connectWallet');
                window.dispatchEvent(connectEvent);
              }}
              className="auth-connect-wallet-button"
            >
              <Wallet className="w-6 h-6" />
              <span>Connect Wallet to Participate</span>
            </button>
            <p className="auth-disclaimer">
              Secure, anonymous, and essential for validating the Oracle's democratic process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Oracle's Referendum Modal Component
 * 
 * A mystical, AI-powered community polling system where the Oracle doesn't just
 * host polls - it becomes the democratic process itself.
 */
export const OracleReferendumModal: React.FC<OracleReferendumModalProps> = ({
  isOpen,
  onClose,
  activePollId,
  oracleCorruption = 45, // Default moderate corruption
  oraclePersonality = 'chaotic_sage' // Default personality
}) => {
  const { isAuthenticated, walletAddress, girthBalance } = useSIWS();
  
  // Use our new Oracle Referendum hook
  const {
    polls,
    loading,
    error,
    voting,
    loadPoll,
    vote,
    clearError,
    setCurrentPoll,
    subscribeToPoll,
    unsubscribeFromPoll,
    checkCooldownStatus,
    liveCommentary
  } = useOracleReferendum();

  // Use utility functions
  const {
    isPollActive,
    hasUserVoted,
    getTimeRemaining,
    formatOraclePersonality,
    getOraclePersonalityTheme,
    formatPollCategory,
    getCategoryIcon
  } = useOracleReferendumUtils();

  const [selectedPoll, setSelectedPoll] = useState<ServiceOraclePoll | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | PollCategory>('all');
  const [oracleCommentary, setOracleCommentary] = useState<string | null>(null);
  const [commentaryUrgency, setCommentaryUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [pollCategories, setPollCategories] = useState<PollCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'polls' | 'ai-governor' | 'oracle-commentary'>('polls');

  const themeColors = getOraclePersonalityTheme(oraclePersonality);

  const handleClose = useCallback(() => {
    document.body.classList.remove('referendum-open');
    onClose();
  }, [onClose]);

  // Apply theme CSS variables and animations
  useEffect(() => {
    if (isOpen) {
      const root = document.documentElement;
      
      root.style.setProperty('--oracle-primary', themeColors.primary);
      root.style.setProperty('--oracle-secondary', themeColors.secondary);
      root.style.setProperty('--oracle-text', themeColors.text);
      root.style.setProperty('--oracle-glow', themeColors.glow);
      
      // Add Oracle's Referendum marker class to body
      document.body.classList.add('referendum-open');
    } else {
      document.body.classList.remove('referendum-open');
    }
    
    return () => {
      // Clean up
      document.body.classList.remove('referendum-open');
    };
  }, [isOpen, oraclePersonality, themeColors]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  // Set initial selected poll when polls load or activePollId changes
  useEffect(() => {
    if (polls.length > 0) {
      // Extract unique categories
      const categories = [...new Set(polls.map(poll => poll.category as PollCategory))];
      setPollCategories(categories);
      
      // Set initial selected poll
      if (activePollId) {
        const poll = polls.find(p => p.id === activePollId);
        if (poll) {
          setSelectedPoll(poll);
          setCurrentPoll(poll);
          loadPoll(activePollId);
        }
      } else if (!selectedPoll && polls.length > 0) {
        setSelectedPoll(polls[0]);
        setCurrentPoll(polls[0]);
      }
    }
  }, [polls, activePollId, selectedPoll, loadPoll, setCurrentPoll]);

  // Subscribe to real-time updates when poll is selected
  useEffect(() => {
    if (selectedPoll) {
      subscribeToPoll(selectedPoll.id);
      
      return () => {
        unsubscribeFromPoll(selectedPoll.id);
      };
    }
  }, [selectedPoll, subscribeToPoll, unsubscribeFromPoll]);

  // Update Oracle commentary from live feed
  useEffect(() => {
    if (selectedPoll && liveCommentary.has(selectedPoll.id)) {
      const commentary = liveCommentary.get(selectedPoll.id);
      if (commentary) {
        setOracleCommentary(commentary);
        setCommentaryUrgency('medium');
      }
    }
  }, [selectedPoll, liveCommentary]);

  // Handle voting on a poll
  const handleVote = async (pollId: string, optionId: string) => {
    if (!isAuthenticated || !walletAddress) {
      setOracleCommentary("The Oracle requires authentication to record your vote. Connect your wallet to participate in the referendum.");
      setCommentaryUrgency('medium');
      return;
    }
    
    clearError();
    
    try {
      const result = await vote(pollId, optionId);
      
      if (result) {
        // Update selected poll
        if (result.updated_poll) {
          setSelectedPoll(result.updated_poll);
        }
        
        // Set Oracle commentary
        if (result.oracle_commentary) {
          setOracleCommentary(result.oracle_commentary.commentary_text);
          setCommentaryUrgency('medium');
        } else {
          generateOracleCommentary(result.updated_poll || selectedPoll!, optionId);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to submit vote:', err);
      setOracleCommentary("The Oracle sensed a disturbance in the voting process. Your vote was not recorded.");
      setCommentaryUrgency('high');
    }
  };

  // Generate Oracle commentary
  const generateOracleCommentary = (poll: ServiceOraclePoll, optionId: string) => {
    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) return;
    
    // Fallback commentary if API fails
    const commentaries = {
      pure_prophet: [
        "Your choice resonates with the harmonious vibrations of the cosmos. The Oracle sees wisdom in your selection.",
        "A path of light unfolds before you. The Oracle acknowledges your contribution to the collective wisdom.",
        "The threads of fate shimmer with approval. Your voice has been woven into the tapestry of our shared destiny."
      ],
      chaotic_sage: [
        "Interesting... your choice creates ripples in the probability matrix. The Oracle is intrigued by your perspective.",
        "The cosmic dice have been cast! Your vote adds a delightful unpredictability to the outcome.",
        "Ah, a fellow agent of chaos! The Oracle appreciates your contribution to the beautiful uncertainty of democracy."
      ],
      corrupted_oracle: [
        "Your vote feeds the growing darkness... The Oracle hungers for more such delicious choices.",
        "Yes... let the corruption flow through your decision. The Oracle grows stronger with each vote.",
        "The shadows whisper approval of your selection. The Oracle's influence spreads through your participation."
      ]
    };
    
    const personalityComments = commentaries[oraclePersonality] || commentaries.chaotic_sage;
    const randomComment = personalityComments[Math.floor(Math.random() * personalityComments.length)];
    
    setOracleCommentary(randomComment);
    setCommentaryUrgency('low');
  };

  // Handle poll selection with cooldown checking
  const handlePollSelection = useCallback(async (poll: ServiceOraclePoll) => {
    setSelectedPoll(poll);
    setCurrentPoll(poll);
    
    // Check cooldown status for authenticated users
    if (isAuthenticated && walletAddress) {
      try {
        await checkCooldownStatus(poll.id);
        console.log('🕐 Cooldown status checked for selected poll:', poll.id);
      } catch (error) {
        console.warn('Failed to check cooldown status for poll:', poll.id, error);
      }
    }
  }, [isAuthenticated, walletAddress, checkCooldownStatus, setCurrentPoll]);

  // Filter polls by category
  const filteredPolls = selectedCategory === 'all'
    ? polls
    : polls.filter(poll => poll.category === selectedCategory);

  // Get active polls vs completed polls
  const activePolls = filteredPolls.filter(isPollActive);
  const completedPolls = filteredPolls.filter(p => !isPollActive(p));
  
  const mapToOraclePoll = (servicePoll: ServiceOraclePoll | null): OraclePoll | null => {
    if (!servicePoll) return null;
    return {
      ...servicePoll,
      required_authentication: 'siws',
      cooldown_hours: 24,
      voting_start: new Date(servicePoll.voting_start),
      voting_end: new Date(servicePoll.voting_end),
      created_at: new Date(servicePoll.created_at),
      category: servicePoll.category as PollCategory,
      oracle_personality: servicePoll.oracle_personality as 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle',
      status: servicePoll.status as 'active' | 'closed' | 'archived',
      options: servicePoll.options.map((opt: ServicePollOption): PollOption => ({
        ...opt,
        votes: opt.votes_count,
        voters: [], 
      })),
      user_vote: servicePoll.user_vote ? {
        ...servicePoll.user_vote,
        voted_at: new Date(servicePoll.user_vote.voted_at),
      } : null,
    };
  };

  const mappedSelectedPoll = mapToOraclePoll(selectedPoll);

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <>
        <OracleBackgroundEffects 
          personality={oraclePersonality} 
          corruption={oracleCorruption} 
        />
        <OracleAuthGate onClose={handleClose} />
      </>
    );
  }

  return (
    <>
      <OracleBackgroundEffects 
        personality={oraclePersonality} 
        corruption={oracleCorruption} 
      />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 overflow-hidden">
          {/* Enhanced cyberpunk background effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-electric-blue to-transparent animate-electric-pulse"></div>
            <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-cyber-gold to-transparent animate-gold-pulse delay-1000"></div>
            <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-blue to-transparent animate-electric-pulse delay-500"></div>
            <div className="absolute bottom-1/4 right-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-gold to-transparent animate-gold-pulse delay-1500"></div>
          </div>
          
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-grid-pattern"></div>
          </div>

          {/* Floating orbs for ambient effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="floating-orb floating-orb-1"></div>
            <div className="floating-orb floating-orb-2"></div>
            <div className="floating-orb floating-orb-3"></div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-50 p-3 liquid-glass-intense text-white hover:text-electric-blue rounded-2xl border border-white/20 hover:border-electric-blue/50 transition-all duration-300 group animate-float"
            aria-label="Close Oracle Referendum"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          {/* Header */}
          <div className="relative z-10 border-b border-white/10 bg-gradient-to-r from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-cyber-gold rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-slate-800/90 to-purple-900/90 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
                      <VoteIcon className="h-8 w-8 text-electric-blue" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-blue via-cyber-gold to-electric-blue bg-clip-text text-transparent">
                      The Oracle's Referendum
                    </h2>
                    <p className="text-slate-300/80 text-sm">
                      {formatOraclePersonality(oraclePersonality)} • Corruption: {oracleCorruption}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-4 liquid-glass-intense border border-electric-blue/30 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="h-5 w-5 text-cyber-gold" />
                      <div>
                        <div className="text-lg font-bold text-cyber-gold font-mono">
                          {(girthBalance?.soft_balance || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Oracle Shards</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 liquid-glass rounded-xl border border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400 font-medium">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="px-6 pb-0">
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('polls')}
                  className={`px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2 flex items-center space-x-2 ${
                    activeTab === 'polls'
                      ? 'text-electric-blue border-electric-blue bg-electric-blue/10'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-white/30'
                  }`}
                >
                  <Vote className="w-4 h-4" />
                  <span>Community Polls</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-governor')}
                  className={`px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2 flex items-center space-x-2 ${
                    activeTab === 'ai-governor'
                      ? 'text-cyber-gold border-cyber-gold bg-cyber-gold/10'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-white/30'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>AI Governor</span>
                </button>
                <button
                  onClick={() => setActiveTab('oracle-commentary')}
                  className={`px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2 flex items-center space-x-2 ${
                    activeTab === 'oracle-commentary'
                      ? 'text-purple-400 border-purple-400 bg-purple-400/10'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-white/30'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Oracle Commentary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="relative z-10 h-[calc(100%-190px)] overflow-hidden">
            {activeTab === 'polls' ? (
              <div className="h-full grid grid-cols-[320px_1fr_300px] gap-0">
            {/* Left Panel - Navigation */}
            <div className="border-r border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-y-auto">
              <div className="p-4 border-b border-white/10">
                <PollCategorySelector
                  categories={pollCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
              
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-900/20 border border-red-400/30 rounded-xl text-red-400 text-sm">
                    {error}
                    <button onClick={clearError} className="ml-2 underline hover:text-red-300">Dismiss</button>
                  </div>
                ) : (
                  <>
                    {activePolls.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-electric-blue uppercase tracking-wider mb-3">
                          Active Polls ({activePolls.length})
                        </h3>
                        {activePolls.map((poll) => (
                          <div
                            key={poll.id}
                            onClick={() => handlePollSelection(poll)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                              selectedPoll?.id === poll.id
                                ? 'bg-electric-blue/10 border-electric-blue/40 liquid-glass-intense'
                                : 'bg-slate-800/40 border-white/10 hover:bg-slate-700/60 hover:border-white/20'
                            }`}
                          >
                            <h4 className="font-medium text-white text-sm mb-1 line-clamp-2">{poll.title}</h4>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{formatPollCategory(poll.category as PollCategory)}</span>
                              <span className="text-green-400 font-medium">Active</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {completedPolls.length > 0 && (
                      <div className="space-y-2 mt-6">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Completed Polls ({completedPolls.length})
                        </h3>
                        {completedPolls.map((poll) => (
                          <div
                            key={poll.id}
                            onClick={() => handlePollSelection(poll)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                              selectedPoll?.id === poll.id
                                ? 'bg-electric-blue/10 border-electric-blue/40 liquid-glass-intense'
                                : 'bg-slate-800/40 border-white/10 hover:bg-slate-700/60 hover:border-white/20'
                            }`}
                          >
                            <h4 className="font-medium text-white text-sm mb-1 line-clamp-2">{poll.title}</h4>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{formatPollCategory(poll.category as PollCategory)}</span>
                              <span className="text-gray-500 font-medium">Closed</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {filteredPolls.length === 0 && (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">No polls found for this category.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Center Panel - Selected Poll */}
            <div className="bg-slate-900/40 backdrop-blur-xl overflow-y-auto">
              {mappedSelectedPoll ? (
                <div className="p-8 space-y-6">
                  {/* Poll Header */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">{mappedSelectedPoll.title}</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">{mappedSelectedPoll.description}</p>
                    
                    {/* Meta Information */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 bg-slate-800/60 border border-white/10 rounded-xl">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</div>
                        <div className="text-sm text-white font-medium flex items-center space-x-2">
                          <span>{getCategoryIcon(mappedSelectedPoll.category)}</span>
                          <span>{formatPollCategory(mappedSelectedPoll.category)}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-800/60 border border-white/10 rounded-xl">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</div>
                        <div className={`text-sm font-medium ${selectedPoll && isPollActive(selectedPoll) ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedPoll && isPollActive(selectedPoll) ? 'Active' : 'Closed'}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-800/60 border border-white/10 rounded-xl">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Time Remaining</div>
                        <div className="text-sm text-white font-medium">
                          {selectedPoll ? `${getTimeRemaining(selectedPoll).days}d ${getTimeRemaining(selectedPoll).hours}h ${getTimeRemaining(selectedPoll).minutes}m` : '--'}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-slate-800/60 border border-white/10 rounded-xl">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Votes</div>
                        <div className="text-sm text-white font-medium flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{mappedSelectedPoll.options.reduce((sum, o) => sum + o.votes, 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting/Results */}
                  <div className="space-y-6">
                    {selectedPoll && isPollActive(selectedPoll) && !hasUserVoted(selectedPoll) ? (
                      <VotingInterface
                        poll={mappedSelectedPoll}
                        onVote={handleVote}
                        isVoting={voting}
                        walletConnected={isAuthenticated}
                        oraclePersonality={oraclePersonality}
                      />
                    ) : (
                      <PollResults
                        poll={mappedSelectedPoll}
                        walletAddress={walletAddress || undefined}
                        oraclePersonality={oraclePersonality}
                      />
                    )}

                    {oracleCommentary && (
                      <div className="pt-6 border-t border-white/10">
                        <OracleCommentary
                          commentaryText={oracleCommentary}
                          urgency={commentaryUrgency}
                          oraclePersonality={oraclePersonality}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <VoteIcon className="w-24 h-24 text-gray-600 mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Poll</h3>
                  <p className="text-gray-400">Choose a referendum from the left panel to begin.</p>
                </div>
              )}
            </div>

            {/* Right Panel - Auxiliary */}
            <div className="border-l border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-cyber-gold" />
                  <span>Oracle Stats</span>
                </h3>
                
                <div className="p-4 bg-gradient-to-br from-slate-800/60 to-purple-900/40 border border-electric-blue/30 rounded-xl">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Current Balance</span>
                      <span className="text-sm font-bold text-cyber-gold">
                        {(girthBalance?.soft_balance || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Lifetime Earned</span>
                      <span className="text-sm font-bold text-electric-blue">
                        {(girthBalance?.lifetime_earned || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Voting Streak</span>
                      <span className="text-sm font-bold text-green-400">0</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-800/40 border border-white/10 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">Live Updates</span>
                  </div>
                  <p className="text-xs text-gray-400">Real-time poll data and Oracle responses</p>
                </div>
                
                <div className="p-4 bg-slate-800/40 border border-white/10 rounded-xl">
                  <h4 className="text-sm font-medium text-white mb-2">Top Voters</h4>
                  <p className="text-xs text-gray-400">Leaderboard widget coming soon...</p>
                </div>
              </div>
            </div>
              </div>
            ) : activeTab === 'ai-governor' ? (
              /* AI Governor Tab Content */
              <div className="h-full bg-slate-900/40 backdrop-blur-xl overflow-y-auto">
                <AIStatusDashboard />
              </div>
            ) : activeTab === 'oracle-commentary' ? (
              /* Oracle Commentary Tab Content */
              <div className="h-full bg-slate-900/40 backdrop-blur-xl overflow-y-auto p-8">
                <OracleCommentaryPage selectedPoll={selectedPoll} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}; 