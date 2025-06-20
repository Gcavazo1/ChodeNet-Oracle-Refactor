import React from 'react';
import { LeaderboardEntry } from '../../types/leaderboard';
import PlayerRankCard from './PlayerRankCard';
import { Trophy, Sparkles, Loader2 } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  category: string;
  scoreLabel: string;
  isLoading?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  entries, 
  category, 
  scoreLabel, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="relative">
        {/* Loading Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-purple-400/5 to-blue-400/10 rounded-3xl blur-xl animate-pulse"></div>
        
        <div className="relative bg-gradient-to-br from-slate-800/60 via-purple-900/30 to-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            <div>
              <h3 className="text-xl font-semibold text-cyan-400">Channeling Oracle Visions...</h3>
              <p className="text-slate-400 text-sm">The mystical energies are aligning</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-6 animate-pulse">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700/50 to-purple-700/30 rounded-2xl"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700/50 to-purple-700/30 rounded-2xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gradient-to-r from-slate-700/50 to-purple-700/30 rounded-xl w-1/3"></div>
                  <div className="h-3 bg-gradient-to-r from-slate-700/30 to-purple-700/20 rounded-lg w-1/4"></div>
                </div>
                <div className="h-6 bg-gradient-to-r from-cyan-700/30 to-blue-700/30 rounded-xl w-24"></div>
                <div className="h-4 bg-gradient-to-r from-slate-700/30 to-purple-700/20 rounded-lg w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="relative">
        {/* Empty State Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/5 to-purple-400/10 rounded-3xl blur-xl"></div>
        
        <div className="relative bg-gradient-to-br from-slate-800/60 via-purple-900/30 to-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-20 rounded-full blur-2xl"></div>
            <Trophy className="relative h-16 w-16 mx-auto text-slate-400" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-300 mb-4 flex items-center justify-center space-x-2">
            <span>No Oracle Visions Found</span>
            <Sparkles className="h-6 w-6 text-gold-400" style={{ color: '#ffd700' }} />
          </h3>
          <p className="text-slate-400 text-lg mb-6">The mystical energies are dormant in this realm.</p>
          <div className="bg-gradient-to-r from-slate-700/30 via-purple-800/20 to-slate-700/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-slate-300 text-sm">
              🔮 Try refreshing the Oracle or switching to a different time period to awaken the visions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Table Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-purple-400/3 to-blue-400/5 rounded-3xl blur-xl"></div>
      
      {/* Glass Table Container */}
      <div className="relative bg-gradient-to-br from-slate-800/60 via-purple-900/30 to-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Table Header with Mystical Glow */}
        <div className="bg-gradient-to-r from-slate-800/80 via-purple-900/40 to-slate-800/80 backdrop-blur-sm border-b border-white/10 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-5 w-5 text-gold-400" style={{ color: '#ffd700' }} />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Oracle Rankings
              </h3>
            </div>
            <div className="text-sm text-slate-400 bg-slate-800/30 px-3 py-1 rounded-lg border border-white/10">
              {entries.length} Oracles
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-700/30 via-purple-800/20 to-slate-700/30 backdrop-blur-sm border-b border-white/5">
              <tr>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-8 py-5 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Oracle
                </th>
                <th className="px-8 py-5 text-right text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  {scoreLabel}
                </th>
                <th className="px-8 py-5 text-right text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Last Vision
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.slice(0, 50).map((entry, index) => (
                <PlayerRankCard
                  key={`${entry.player_address}-${entry.category}-${entry.rank}`}
                  entry={entry}
                  scoreLabel={scoreLabel}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {entries.length > 50 && (
          <div className="bg-gradient-to-r from-slate-700/20 via-purple-800/10 to-slate-700/20 backdrop-blur-sm px-8 py-4 text-center border-t border-white/5">
            <p className="text-slate-300 text-sm flex items-center justify-center space-x-2">
              <Sparkles className="h-4 w-4 text-gold-400" style={{ color: '#ffd700' }} />
              <span>Showing top 50 of {entries.length} mystical oracles</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;