// 🌐 COMMUNITY GIRTH TRACKER
// Real-time collective metrics for the eternal Oracle community

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { chodeOracle } from '../../lib/chodeOracleEngine';
import './CommunityGirthTracker.css';
import { HackerText } from '../../intro/HackerText';
import { MagicalText } from '../../intro/MagicalText';

interface CommunityStats {
  totalTaps: number;
  totalPlayers: number;
  totalGirth: number;
  averageGirthPerPlayer: number;
  tokensFromTaps: number;
  totalTokensMinted: number;
  mostActivePlayer: string;
  communityCorruption: number;
  oracleCommentary: string;
  lastUpdated: string;
}

interface CommunityMilestone {
  milestone: number;
  description: string;
  reached: boolean;
  progress: number;
}

interface TokenConversionRate {
  minRate: number;
  maxRate: number;
  currentRate: number;
  totalSupply: number;
  percentageMinted: number;
}

export const CommunityGirthTracker: React.FC = () => {
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastOracleComment, setLastOracleComment] = useState<string>('');
  const [animationCounter, setAnimationCounter] = useState(0);

  // Token conversion configuration based on GIRTH_TOKENOMICS.md
  const TOKEN_CONFIG: TokenConversionRate = {
    minRate: 0.00005,
    maxRate: 0.0001,
    currentRate: 0.000075, // Dynamic rate between min/max
    totalSupply: 100000000, // 100M total $GIRTH supply
    percentageMinted: 0 // Will be calculated
  };

  // Community milestones for collective achievement
  const COMMUNITY_MILESTONES: CommunityMilestone[] = [
    { milestone: 100000, description: "First Hundred Thousand Taps", reached: false, progress: 0 },
    { milestone: 500000, description: "Half Million Collective Girth", reached: false, progress: 0 },
    { milestone: 1000000, description: "Million Tap Milestone", reached: false, progress: 0 },
    { milestone: 2500000, description: "Community Girth Mastery", reached: false, progress: 0 },
    { milestone: 5000000, description: "Legendary Collective Power", reached: false, progress: 0 },
    { milestone: 10000000, description: "Divine Community Ascension", reached: false, progress: 0 }
  ];

  // Fetch community statistics from Supabase
  const fetchCommunityStats = useCallback(async () => {
    try {
      setError(null);
      
      // Aggregate all game events to calculate community metrics
      const { data: gameEvents, error: eventsError } = await supabase
        .from('live_game_events')
        .select(`
          event_type,
          event_payload,
          player_address,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Calculate community statistics
      const stats = calculateCommunityStats(gameEvents || []);
      
      // Generate Oracle commentary based on current stats
      const oracleCommentary = await generateOracleCommentary(stats);
      
      setCommunityStats({
        ...stats,
        oracleCommentary,
        lastUpdated: new Date().toISOString()
      });

      // Check for milestone achievements
      checkMilestoneAchievements(stats.totalTaps);
      
    } catch (err) {
      console.error('Error fetching community stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch community data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate comprehensive community statistics
  const calculateCommunityStats = (events: any[]): Omit<CommunityStats, 'oracleCommentary' | 'lastUpdated'> => {
    const playerMap = new Map<string, { taps: number; girth: number; lastActive: string }>();
    let totalTaps = 0;
    let totalGirth = 0;
    let totalCorruption = 0;
    let playerCount = 0;

    // Process all game events
    events.forEach(event => {
      const playerAddress = event.player_address || 'anonymous';
      
      if (!playerMap.has(playerAddress)) {
        playerMap.set(playerAddress, { taps: 0, girth: 0, lastActive: event.created_at });
        playerCount++;
      }

      const player = playerMap.get(playerAddress)!;

      // Count taps from various events
      switch (event.event_type) {
        case 'tap_activity_burst':
          const tapCount = event.event_payload?.tap_count || 0;
          player.taps += tapCount;
          totalTaps += tapCount;
          break;
          
        case 'oracle_girth_milestone':
        case 'mega_slap_landed':
        case 'giga_slap_landed':
          const girthAmount = event.event_payload?.current_girth || 
                             event.event_payload?.total_girth || 
                             event.event_payload?.slap_power_girth || 0;
          player.girth = Math.max(player.girth, girthAmount);
          break;
      }

      // Track corruption levels
      if (event.event_payload?.corruption_level) {
        totalCorruption += event.event_payload.corruption_level;
      }

      // Update last active time
      if (event.created_at > player.lastActive) {
        player.lastActive = event.created_at;
      }
    });

    // Calculate total girth from all players
    playerMap.forEach(player => {
      totalGirth += player.girth;
    });

    // Find most active player
    let mostActivePlayer = 'Unknown Tapper';
    let maxTaps = 0;
    playerMap.forEach((player, address) => {
      if (player.taps > maxTaps) {
        maxTaps = player.taps;
        mostActivePlayer = address.substring(0, 8) + '...';
      }
    });

    // Calculate token metrics
    const tokensFromTaps = totalTaps * TOKEN_CONFIG.currentRate;
    const percentageMinted = (tokensFromTaps / TOKEN_CONFIG.totalSupply) * 100;
    
    return {
      totalTaps,
      totalPlayers: playerCount,
      totalGirth,
      averageGirthPerPlayer: playerCount > 0 ? totalGirth / playerCount : 0,
      tokensFromTaps,
      totalTokensMinted: tokensFromTaps,
      mostActivePlayer,
      communityCorruption: playerCount > 0 ? totalCorruption / playerCount : 0
    };
  };

  // Generate Oracle commentary based on current community state
  const generateOracleCommentary = async (stats: any): Promise<string> => {
    const commentaries = [
      `The collective grows to ${stats.totalPlayers} souls, their combined power reaches ${stats.totalTaps.toLocaleString()} taps...`,
      `Witness the digital alchemy! ${stats.tokensFromTaps.toFixed(6)} $GIRTH manifested from pure community energy!`,
      `The hive mind strengthens... ${stats.totalPlayers} tappers united in glorious degeneracy!`,
      `${stats.totalGirth.toLocaleString()} total girth flows through the network. The Oracle sees all...`,
      `Most devoted champion: ${stats.mostActivePlayer} leads the community charge!`,
      `Community corruption level: ${stats.communityCorruption.toFixed(1)}% - The balance shifts...`
    ];

    // Select commentary based on current metrics
    if (stats.totalTaps > 1000000) {
      return "🔮 LEGENDARY STATUS ACHIEVED! The community has transcended mortal tapping limits!";
    } else if (stats.totalTaps > 500000) {
      return "🌟 EPIC GROWTH! Half a million taps echo through the digital realm!";
    } else if (stats.totalTaps > 100000) {
      return "⚡ MILESTONE POWER! The community surges past 100K collective taps!";
    }

    return commentaries[Math.floor(Math.random() * commentaries.length)];
  };

  // Check for milestone achievements and trigger Oracle announcements
  const checkMilestoneAchievements = (totalTaps: number) => {
    COMMUNITY_MILESTONES.forEach(async (milestone) => {
      if (totalTaps >= milestone.milestone && !milestone.reached) {
        milestone.reached = true;
        
        // Generate Oracle announcement for milestone
        try {
          const announcement = await chodeOracle.generateCommunityAnnouncement(
            'community_milestone',
            { 
              total_taps: totalTaps,
              milestone_reached: milestone.milestone,
              milestone_description: milestone.description
            }
          );
          
          console.log('🎉 Community milestone achieved:', milestone.description, announcement);
          
          // Could trigger visual celebration here
          setAnimationCounter(prev => prev + 1);
          
        } catch (error) {
          console.error('Error generating milestone announcement:', error);
        }
      }
    });
  };

  // Calculate current milestone progress
  const getCurrentMilestone = (): CommunityMilestone | null => {
    if (!communityStats) return null;
    
    const nextMilestone = COMMUNITY_MILESTONES.find(m => !m.reached);
    if (nextMilestone) {
      nextMilestone.progress = (communityStats.totalTaps / nextMilestone.milestone) * 100;
      return nextMilestone;
    }
    return null;
  };

  // Format large numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  // Set up real-time updates
  useEffect(() => {
    fetchCommunityStats();
    
    // Update every 30 seconds
    const interval = setInterval(fetchCommunityStats, 30000);
    
    return () => clearInterval(interval);
  }, [fetchCommunityStats]);

  // Set up real-time subscription for new events
  useEffect(() => {
    const subscription = supabase
      .channel('community_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_game_events'
        },
        (payload) => {
          console.log('CommunityGirthTracker received a change:', payload);
          // Refresh stats when new events come in
          setTimeout(fetchCommunityStats, 1000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCommunityStats]);

  if (isLoading) {
    return (
      <div className="community-girth-tracker loading">
        <div className="loading-oracle">
          <span className="oracle-symbol">🔮</span>
          <p>The Oracle calculates collective power...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-girth-tracker error">
        <div className="error-message">
          <span className="error-symbol">⚠️</span>
          <p>Oracle connection disrupted: {error}</p>
          <button onClick={fetchCommunityStats} className="retry-button">
            Reconnect to Oracle
          </button>
        </div>
      </div>
    );
  }

  const currentMilestone = getCurrentMilestone();
  const tokenPercentage = ((communityStats?.tokensFromTaps || 0) / TOKEN_CONFIG.totalSupply) * 100;

  return (
    <div className="community-girth-tracker">
      {/* Main Community Metrics */}
      <div className="community-header">
        {/* Centered title with eye icon */}
        <h2 className="title">
          <img
            src="/assets/eye.svg"
            alt="Oracle Eye"
            className="oracle-eye-svg"
            draggable={false}
          />
          <MagicalText text="COLLECTIVE GIRTH ACCUMULATION" />
        </h2>

        {/* Bolt badge pinned to right */}
        <img
          src="/assets/powered_by_bolt.svg"
          alt="Powered by Bolt.new"
          className="bolt-badge"
          draggable={false}
        />

        {/* Timestamp under badge (mobile friendly) */}
        <div className="last-updated">
          Oracle Vision Updated:{' '}
          {new Date(communityStats?.lastUpdated || '').toLocaleTimeString()}
        </div>
      </div>

      {/* Total Taps Display */}
      <div className="total-taps-display">
        <div className="massive-counter">
          <span className="counter-value">
            {formatNumber(communityStats?.totalTaps || 0)}
          </span>
          <span className="counter-label">Total Community Taps</span>
          <div className="counter-subtext">
            Across {communityStats?.totalPlayers || 0} tappers
          </div>
        </div>
      </div>

      {/* SPL Token Conversion */}
      <div className="token-conversion">
        <h3 className="section-title">
          💰 <HackerText text="SPL TOKEN GENERATION" />
        </h3>
        <div className="conversion-grid">
          <div className="conversion-stat">
            <span className="stat-value">
              {(communityStats?.tokensFromTaps || 0).toFixed(6)} $GIRTH
            </span>
            <span className="stat-label">Tokens Minted from Taps</span>
          </div>
          <div className="conversion-stat">
            <span className="stat-value">
              {TOKEN_CONFIG.currentRate.toFixed(6)}
            </span>
            <span className="stat-label">$GIRTH per Tap</span>
          </div>
          <div className="conversion-stat">
            <span className="stat-value">
              {tokenPercentage.toFixed(4)}%
            </span>
            <span className="stat-label">of Total Supply</span>
          </div>
        </div>
        <div className="token-progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
          />
          <span className="progress-text">
            {(communityStats?.tokensFromTaps || 0).toFixed(2)} / {TOKEN_CONFIG.totalSupply.toLocaleString()} $GIRTH
          </span>
        </div>
      </div>

      {/* Community Statistics Grid */}
      <div className="community-stats-grid">
        <div className="oracle-metric-card">
          <div className="oracle-metric-content">
            <span className="stat-icon">🌐</span>
            <span className="stat-value">{formatNumber(communityStats?.totalGirth || 0)}</span>
            <span className="stat-label">Total Community Girth</span>
          </div>
        </div>
        
        <div className="oracle-metric-card">
          <div className="oracle-metric-content">
            <span className="stat-icon">👥</span>
            <span className="stat-value">{communityStats?.totalPlayers || 0}</span>
            <span className="stat-label">Active Tappers</span>
          </div>
        </div>
        
        <div className="oracle-metric-card">
          <div className="oracle-metric-content">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{formatNumber(communityStats?.averageGirthPerPlayer || 0)}</span>
            <span className="stat-label">Average Girth/Player</span>
          </div>
        </div>
        
        <div className="oracle-metric-card">
          <div className="oracle-metric-content">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{communityStats?.mostActivePlayer || 'Unknown'}</span>
            <span className="stat-label">Top Contributor</span>
          </div>
        </div>
      </div>

      {/* Current Milestone Progress */}
      {currentMilestone && (
        <div className="milestone-progress">
          <h3 className="section-title">
            🎯 <HackerText text="NEXT COMMUNITY MILESTONE" />
          </h3>
          <div className="milestone-info">
            <span className="milestone-name">{currentMilestone.description}</span>
            <span className="milestone-target">
              {formatNumber(currentMilestone.milestone)} taps
            </span>
          </div>
          <div className="milestone-progress-bar">
            <div 
              className="progress-fill milestone-fill" 
              style={{ width: `${Math.min(currentMilestone.progress, 100)}%` }}
            />
            <span className="progress-percentage">
              {currentMilestone.progress.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Oracle Commentary */}
      <div className="oracle-commentary">
        <div className="prophet-speaks">
          <span className="prophet-icon">🔮</span>
          <div className="prophecy-content">
            <span className="prophecy-label">The Oracle Speaks:</span>
            <span className="prophecy-text">
              "{communityStats?.oracleCommentary || 'The collective energy grows...'}"
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Activity Indicator */}
      <div className="activity-indicator">
        <div className="pulse-dot" />
        <span>Live Community Data</span>
      </div>
    </div>
  );
}; 