import React from 'react';
import { LeaderboardEntry } from '../../types/leaderboard';
import { Trophy, Medal, Award, Clock, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import Tooltip from './Tooltip';

interface PlayerRankCardProps {
  entry: LeaderboardEntry;
  scoreLabel: string;
  index: number;
}

const PlayerRankCard: React.FC<PlayerRankCardProps> = ({ entry, scoreLabel, index }) => {
  const { connectedWallet } = useLeaderboardStore();
  const isCurrentPlayer = connectedWallet === entry.player_address;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400 filter drop-shadow-sm" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-300 filter drop-shadow-sm" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-400 filter drop-shadow-sm" />;
      default:
        return null;
    }
  };

  const getRankChangeIcon = (change?: number) => {
    if (!change || change === 0) return <Minus className="h-4 w-4 text-slate-400" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  };

  const getRankChangeColor = (change?: number) => {
    if (!change || change === 0) return 'text-slate-400';
    if (change > 0) return 'text-green-400';
    return 'text-red-400';
  };

  const getRankChangeText = (change?: number) => {
    if (!change || change === 0) return 'No change';
    if (change > 0) return `Moved up ${change} position${change > 1 ? 's' : ''}`;
    return `Moved down ${Math.abs(change)} position${Math.abs(change) > 1 ? 's' : ''}`;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-500/30 to-orange-500/20',
          border: 'border-yellow-400/40',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-400/20'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-slate-400/30 to-slate-500/20',
          border: 'border-slate-400/40',
          text: 'text-slate-300',
          glow: 'shadow-slate-400/20'
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-orange-500/30 to-red-500/20',
          border: 'border-orange-400/40',
          text: 'text-orange-400',
          glow: 'shadow-orange-400/20'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-600/20 to-purple-600/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          glow: 'shadow-slate-400/10'
        };
    }
  };

  const formatScore = (score: number, category: string) => {
    if (category === 'tapping_speed') {
      return `${score.toFixed(1)} TPS`;
    }
    
    // Format large numbers
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toLocaleString();
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPlayerTooltipContent = () => (
    <div className="space-y-2">
      <div className="font-semibold">{entry.display_name || 'Anonymous Oracle'}</div>
      <div className="text-xs space-y-1">
        <div>Address: {entry.player_address}</div>
        <div>Score: {entry.score.toLocaleString()}</div>
        <div>Last Updated: {new Date(entry.last_updated).toLocaleString()}</div>
        {entry.rank_change !== undefined && (
          <div>Rank Change: {getRankChangeText(entry.rank_change)}</div>
        )}
      </div>
    </div>
  );

  const rankStyle = getRankStyle(entry.rank);

  return (
    <tr 
      className={`group transition-all duration-500 ${
        isCurrentPlayer 
          ? 'bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-cyan-500/10 border-l-4 border-cyan-400' 
          : 'hover:bg-gradient-to-r hover:from-white/5 hover:via-purple-500/5 hover:to-white/5'
      } ${entry.is_new ? 'animate-pulse' : ''}`}
      role="row"
      aria-rowindex={index + 2}
      aria-selected={isCurrentPlayer}
    >
      <td className="px-8 py-6" role="gridcell" aria-describedby={`rank-${entry.rank}`}>
        <div className="flex items-center space-x-3">
          <Tooltip content={`Rank ${entry.rank}${entry.rank <= 3 ? ' - Top 3!' : ''}`}>
            <div className={`relative w-12 h-12 rounded-2xl border ${rankStyle.border} ${rankStyle.bg} flex items-center justify-center font-bold text-sm ${rankStyle.glow} backdrop-blur-sm transition-all duration-300`}>
              {/* Rank Glow Effect */}
              <div className={`absolute inset-0 ${rankStyle.bg} rounded-2xl blur-sm opacity-50`}></div>
              
              <div className="relative">
                {entry.rank <= 3 ? getRankIcon(entry.rank) : (
                  <span className={`${rankStyle.text} font-bold`}>#{entry.rank}</span>
                )}
              </div>
              
              {/* Current Player Indicator */}
              {isCurrentPlayer && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse border-2 border-slate-900"></div>
              )}
            </div>
          </Tooltip>
          
          {/* Rank Change Indicator */}
          <Tooltip content={getRankChangeText(entry.rank_change)}>
            <div className={`flex items-center space-x-1 ${getRankChangeColor(entry.rank_change)}`}>
              {getRankChangeIcon(entry.rank_change)}
              {entry.rank_change && entry.rank_change !== 0 && (
                <span className="text-xs font-medium">
                  {Math.abs(entry.rank_change)}
                </span>
              )}
            </div>
          </Tooltip>
        </div>
      </td>
      
      <td className="px-8 py-6" role="gridcell">
        <div className="flex items-center space-x-4">
          {/* Avatar with Mystical Border */}
          <Tooltip content={getPlayerTooltipContent()}>
            <div className="relative">
              <div className={`absolute inset-0 rounded-2xl blur-sm ${
                isCurrentPlayer 
                  ? 'bg-gradient-to-r from-cyan-400/50 to-blue-400/50' 
                  : 'bg-gradient-to-r from-cyan-400/30 to-purple-400/30'
              }`}></div>
              <img 
                src={entry.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.player_address}`} 
                alt={`${entry.display_name || 'Anonymous Oracle'} avatar`} 
                className="relative w-12 h-12 rounded-2xl bg-slate-600 border border-white/20 backdrop-blur-sm"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.player_address}`;
                }}
                loading="lazy"
              />
              {entry.is_new && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-slate-900" title="New entry"></div>
              )}
            </div>
          </Tooltip>
          
          <div>
            <p className={`font-semibold text-base flex items-center space-x-2 ${
              isCurrentPlayer ? 'text-cyan-400' : 'text-white'
            }`}>
              <span>{entry.display_name || 'Anonymous Oracle'}</span>
              {entry.rank <= 3 && (
                <Sparkles className="h-4 w-4 text-gold-400" style={{ color: '#ffd700' }} />
              )}
              {isCurrentPlayer && (
                <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-400/30">
                  YOU
                </span>
              )}
            </p>
            <p className="text-sm text-slate-400 font-mono bg-slate-800/30 px-2 py-1 rounded-lg border border-white/10">
              {entry.player_address.slice(0, 6)}...{entry.player_address.slice(-4)}
            </p>
          </div>
        </div>
      </td>
      
      <td className="px-8 py-6 text-right" role="gridcell">
        <div className="relative">
          <span className={`text-2xl font-bold filter drop-shadow-sm transition-all duration-300 ${
            isCurrentPlayer 
              ? 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'
          }`}>
            {formatScore(entry.score, entry.category)}
          </span>
          {entry.rank <= 3 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gold-400 rounded-full animate-pulse" style={{ backgroundColor: '#ffd700' }}></div>
          )}
        </div>
      </td>
      
      <td className="px-8 py-6 text-right" role="gridcell">
        <div className="flex items-center justify-end space-x-2 text-sm text-slate-400">
          <Clock className="h-4 w-4" />
          <span className="bg-slate-800/30 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
            {formatLastUpdated(entry.last_updated)}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(PlayerRankCard);