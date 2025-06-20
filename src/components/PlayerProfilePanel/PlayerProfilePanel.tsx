import React, { useState, useEffect } from 'react';
import { 
  User, 
  Wallet, 
  Crown, 
  Zap, 
  Target, 
  Trophy, 
  Coins,
  Shield,
  ExternalLink,
  Copy,
  ChevronRight,
  Star,
  Activity,
  Award,
  LogIn,
  Lock,
  Gauge,
  BarChart3,
  Calendar,
  Wifi
} from 'lucide-react';
import { useSIWS } from '../../lib/useSIWS';
import { supabase } from '../../lib/supabase';
import { WalletHeaderButton } from '../WalletConnector/WalletHeaderButton';

interface PlayerProfilePanelProps {
  className?: string;
}

interface GameMetrics {
  total_taps: number;
  taps_per_second: number;
  current_girth: number;
  session_duration_ms: number;
  peak_taps_per_second: number;
  avg_taps_per_second: number;
  session_total_taps: number;
  total_mega_slaps: number;
  total_giga_slaps: number;
  mega_slap_girth_earned: number;
  giga_slap_girth_earned: number;
  achievements_count: number;
  milestones_count: number;
  evolution_level: number;
  upgrades_purchased: number;
}

const PlayerProfilePanel: React.FC<PlayerProfilePanelProps> = ({
  className = '',
}) => {
  // REAL INTEGRATION - Use existing useSIWS hook
  const {
    isAuthenticated,
    isLoading,
    userProfile,
    girthBalance,
    oracleShards,
    walletConnected,
    signOut
  } = useSIWS();

  // Game metrics state (fetch from real live_game_events table)
  const [gameMetrics, setGameMetrics] = useState<GameMetrics>({
    total_taps: 0,
    taps_per_second: 0,
    current_girth: 0,
    session_duration_ms: 0,
    peak_taps_per_second: 0,
    avg_taps_per_second: 0,
    session_total_taps: 0,
    total_mega_slaps: 0,
    total_giga_slaps: 0,
    mega_slap_girth_earned: 0,
    giga_slap_girth_earned: 0,
    achievements_count: 0,
    milestones_count: 0,
    evolution_level: 1,
    upgrades_purchased: 0,
  });

  const [currentTps, setCurrentTps] = useState(0);

  // REAL BALANCE SUBSCRIPTION - Keep exact same pattern as existing
  useEffect(() => {
    if (!userProfile) return;
    
    const channel = supabase
      .channel('player_panel_balance')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'girth_balances',
        filter: `user_profile_id=eq.${userProfile.id}`
      }, (payload) => {
        console.log('Balance updated:', payload.new);
      })
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [userProfile]);

  // REAL Oracle Shards subscription
  useEffect(() => {
    if (!userProfile) return;
    
    const shardsChannel = supabase
      .channel('oracle_shards_updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'oracle_shards',
        filter: `user_profile_id=eq.${userProfile.id}`
      }, (payload) => {
        console.log('Oracle Shards updated:', payload.new);
      })
      .subscribe();
      
    return () => {
      shardsChannel.unsubscribe();
    };
  }, [userProfile]);

  // REAL game metrics from live_game_events table
  useEffect(() => {
    if (!userProfile?.wallet_address) return;
    
    const fetchGameMetrics = async () => {
      try {
        const { data: events, error } = await supabase
          .from('live_game_events')
          .select('*')
          .eq('player_address', userProfile.wallet_address)
          .gte('timestamp_utc', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp_utc', { ascending: false });
          
        if (error) throw error;
        
        // Process real events into metrics
        const tapEvents = events?.filter(e => e.event_type === 'tap_activity_burst') || [];
        const megaSlaps = events?.filter(e => e.event_type === 'mega_slap_burst') || [];
        const gigaSlaps = events?.filter(e => e.event_type === 'giga_slap_burst') || [];
        const achievements = events?.filter(e => e.event_type === 'ingame_achievement_unlocked') || [];
        const milestones = events?.filter(e => e.event_type === 'oracle_girth_milestone') || [];
        
        // Calculate metrics from real events
        const totalTaps = tapEvents.reduce((sum, e) => sum + (e.event_payload?.tap_count || 0), 0);
        const currentGirth = tapEvents.length > 0 ? tapEvents[0]?.event_payload?.current_girth || 0 : 0;
        const peakTps = Math.max(...tapEvents.map(e => e.event_payload?.peak_taps_per_second || 0));
        const avgTps = tapEvents.length > 0 ? tapEvents.reduce((sum, e) => sum + (e.event_payload?.avg_taps_per_second || 0), 0) / tapEvents.length : 0;
        const sessionTotalTaps = tapEvents.reduce((sum, e) => sum + (e.event_payload?.session_total_taps || 0), 0);
        const totalMegaSlaps = megaSlaps.reduce((sum, e) => sum + (e.event_payload?.total_mega_slaps || 0), 0);
        const totalGigaSlaps = gigaSlaps.reduce((sum, e) => sum + (e.event_payload?.total_giga_slaps || 0), 0);
        
        setGameMetrics({
          total_taps: totalTaps,
          taps_per_second: tapEvents.length > 0 ? tapEvents[0]?.event_payload?.current_tps || 0 : 0,
          current_girth: currentGirth,
          session_duration_ms: tapEvents.length > 0 ? tapEvents[0]?.event_payload?.session_duration_ms || 0 : 0,
          peak_taps_per_second: peakTps,
          avg_taps_per_second: avgTps,
          session_total_taps: sessionTotalTaps,
          total_mega_slaps: totalMegaSlaps,
          total_giga_slaps: totalGigaSlaps,
          mega_slap_girth_earned: megaSlaps.reduce((sum, e) => sum + (e.event_payload?.girth_earned || 0), 0),
          giga_slap_girth_earned: gigaSlaps.reduce((sum, e) => sum + (e.event_payload?.girth_earned || 0), 0),
          achievements_count: achievements.length,
          milestones_count: milestones.length,
          evolution_level: Math.floor(currentGirth / 1000) + 1,
          upgrades_purchased: events?.filter(e => e.event_type === 'upgrade_purchased')?.length || 0,
        });
        
        setCurrentTps(tapEvents.length > 0 ? tapEvents[0]?.event_payload?.current_tps || 0 : 0);
        
      } catch (error) {
        console.error('Failed to fetch game metrics:', error);
      }
    };
    
    fetchGameMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchGameMetrics, 30000);
    return () => clearInterval(interval);
  }, [userProfile]);

  // REAL BALANCE FORMATTING - Keep exact same pattern as existing
  const format = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const formatShards = (n: number) => n.toLocaleString();
  const soft = girthBalance?.soft_balance ?? 0;
  const hard = girthBalance?.hard_balance ?? 0;
  const shards = oracleShards?.balance ?? 0;

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatMemberSince = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getOracleIcon = (relationship: string) => {
    switch (relationship) {
      case 'legendary': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'master': return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'adept': return <Target className="w-5 h-5 text-cyan-400" />;
      case 'novice': return <User className="w-5 h-5 text-gray-400" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderAvatar = () => {
    // Default avatar with first letter
    const firstLetter = (userProfile?.display_name || userProfile?.username || 'O')[0].toUpperCase();
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white" style={{
        boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)',
        border: '3px solid rgba(147, 51, 234, 0.4)'
      }}>
        {firstLetter}
      </div>
    );
  };

  // Helper cast for extra profile fields that may not be in base type
  const extProfile = userProfile as typeof userProfile & {
    profile_completion?: number;
    total_sessions?: number;
    bio?: string;
  };

  const handleCopyWallet = () => {
    if (userProfile?.wallet_address) {
      navigator.clipboard.writeText(userProfile.wallet_address);
    }
  };

  const handleViewExplorer = () => {
    if (userProfile?.wallet_address) {
      window.open(`https://explorer.solana.com/address/${userProfile.wallet_address}`, '_blank');
    }
  };

  const handleDisconnect = () => {
    if (signOut) {
      signOut();
    }
  };

  const handleSecureBalance = async () => {
    // Implement real secure balance functionality
    console.log('Secure balance - implement real minting');
  };

  // Disconnected State
  if (!walletConnected) {
    return (
      <div className={`bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect to the Oracle</h2>
          <p className="text-purple-200 mb-8 leading-relaxed">
            Link your Solana wallet to access the mystical realm and unlock your divine profile
          </p>
          <div className="flex justify-center">
            <WalletHeaderButton />
          </div>
        </div>
      </div>
    );
  }

  // Connected but Not Authenticated State
  if (walletConnected && !isAuthenticated) {
    return (
      <div className={`bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 ${className}`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign In with Solana</h2>
          <p className="text-purple-200 mb-6 leading-relaxed">
            Authenticate your wallet to access your Oracle profile and balances
          </p>
          
          {/* Greyed out currency preview */}
          <div className="space-y-3 mb-8 opacity-50">
            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-600/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-300">Soft Balance</span>
                <Coins className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">•••.•••</div>
              <div className="text-xs text-purple-300/60">Unminted $GIRTH</div>
            </div>
            
            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-600/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-300">Hard Balance</span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">•••.•••</div>
              <div className="text-xs text-amber-300/60">Minted SPL Tokens</div>
            </div>
            
            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-600/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-300">Oracle Shards</span>
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">•••••</div>
              <div className="text-xs text-blue-300/60">Ritual Currency</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <WalletHeaderButton />
          </div>
        </div>
      </div>
    );
  }

  // Fully Authenticated State
  return (
    <div className={`bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl overflow-hidden ${className}`}>
      {/* Enhanced Oracle Header */}
      <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 p-6 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            {renderAvatar()}
            <div className="absolute -bottom-1 -right-1 bg-green-400 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              <Wifi className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">
              {userProfile?.display_name || userProfile?.username || 'Oracle Seeker'}
            </h2>
            {userProfile?.username && userProfile?.display_name && (
              <div className="text-sm text-white/80 mb-1">
                @{userProfile.username}
              </div>
            )}
            <button
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-mono"
              onClick={handleCopyWallet}
            >
              <span>{formatWalletAddress(userProfile?.wallet_address || '')}</span>
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-purple-500/20 border border-purple-500/40 px-3 py-1 rounded-full flex items-center space-x-2`}>
            {getOracleIcon(userProfile?.oracle_relationship || 'novice')}
            <span className="text-sm font-medium capitalize">{userProfile?.oracle_relationship}</span>
          </div>
        </div>

        {/* Profile Stats Strip */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white font-mono">
              {extProfile?.profile_completion}%
            </div>
            <div className="text-xs text-white/70">Complete</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">
              {extProfile?.total_sessions}
            </div>
            <div className="text-xs text-white/70">Sessions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono flex items-center justify-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatMemberSince(userProfile?.created_at || '')}
            </div>
            <div className="text-xs text-white/70">Member Since</div>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-purple-200">Oracle Attunement</span>
          <span className="text-sm font-bold text-purple-300 font-mono">{extProfile?.profile_completion}%</span>
        </div>
        <div className="bg-gray-700/50 rounded-lg h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
            style={{ width: `${extProfile?.profile_completion}%` }}
          ></div>
        </div>
        {(extProfile?.profile_completion || 0) < 100 && (
          <div className="text-xs text-purple-300/80 mt-2">
            Complete your profile to unlock Oracle bonuses
          </div>
        )}
      </div>

      {/* Bio Section */}
      {extProfile?.bio && (
        <div className="p-6 border-b border-purple-500/20">
          <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Oracle's Whisper
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "{extProfile?.bio}"
          </p>
        </div>
      )}

      {/* Triple Currency System - REAL BALANCE INTEGRATION */}
      <div className="p-6 border-b border-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-purple-400" />
          Divine Treasury
        </h3>
        <div className="space-y-3">
          {/* Soft $GIRTH */}
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-300">Soft Balance</span>
              <Coins className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-200 font-mono">
              {format(soft)}
            </div>
            <div className="text-xs text-purple-300/80 mt-1">
              Unminted $GIRTH
            </div>
            <div className="text-xs text-purple-300/60 mt-1 font-mono">
              Lifetime: {format(girthBalance?.lifetime_earned || 0)}
            </div>
          </div>

          {/* Hard $GIRTH */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-300">Hard Balance</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-200 font-mono">
              {format(hard)}
            </div>
            <div className="text-xs text-amber-300/80 mt-1">
              Minted SPL Tokens
            </div>
            <div className="text-xs text-amber-300/60 mt-1 font-mono">
              Minted: {format(girthBalance?.lifetime_minted || 0)}
            </div>
          </div>

          {/* Oracle Shards */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-300">Oracle Shards</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-200 font-mono">
              {formatShards(shards)}
            </div>
            <div className="text-xs text-blue-300/80 mt-1">
              Ritual Currency
            </div>
            <div className="text-xs text-blue-300/60 mt-1 font-mono">
              Lifetime: {formatShards(oracleShards?.lifetime_earned || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Game Metrics Dashboard - REAL METRICS */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
            Performance Metrics
          </h3>
          <div className="bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-lg">
            <div className="flex items-center space-x-1 text-xs text-amber-300">
              <Trophy className="w-3 h-3" />
              <span>Leaderboard Ready</span>
            </div>
          </div>
        </div>

        {/* Core Performance Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Total Taps</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">{formatLargeNumber(gameMetrics.total_taps)}</div>
            <div className="text-xs text-blue-300/80">Lifetime</div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Current TPS</span>
              <Gauge className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">{currentTps.toFixed(1)}</div>
            <div className="text-xs text-blue-300/80">Live Speed</div>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Mega Slaps</span>
              <Star className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">{formatLargeNumber(gameMetrics.total_mega_slaps)}</div>
            <div className="text-xs text-purple-300/80">Power Moves</div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">Achievements</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white">{gameMetrics.achievements_count}</div>
            <div className="text-xs text-amber-300/80">Unlocked</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className="space-y-3">
          <button 
            onClick={handleSecureBalance}
            disabled={isLoading || soft <= 0}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed p-3 text-white font-medium rounded-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5" />
                <span>{isLoading ? 'Securing...' : 'Secure Balance'}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
          
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 p-3 text-white font-medium rounded-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5" />
                <span>Cosmic Leaderboards</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
          
          <button 
            onClick={handleViewExplorer}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 p-3 text-white font-medium rounded-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5" />
                <span>View on Explorer</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
          
          <button
            onClick={handleDisconnect}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 p-3 text-white font-medium rounded-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Disconnect Oracle</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export { PlayerProfilePanel };
export default PlayerProfilePanel; 