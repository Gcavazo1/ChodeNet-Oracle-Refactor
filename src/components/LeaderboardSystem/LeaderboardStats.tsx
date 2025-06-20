import React from 'react';
import { Users, Trophy, Target, Clock } from 'lucide-react';
import { LeaderboardEntry } from '../../types/leaderboard';

interface LeaderboardStatsProps {
  entries: LeaderboardEntry[];
  category: string;
}

const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({ entries, category }) => {
  const categoryEntries = entries.filter(entry => entry.category === category);
  const totalPlayers = categoryEntries.length;
  const topScore = categoryEntries.length > 0 ? Math.max(...categoryEntries.map(e => e.score)) : 0;
  const avgScore = categoryEntries.length > 0 
    ? Math.round(categoryEntries.reduce((sum, entry) => sum + entry.score, 0) / categoryEntries.length)
    : 0;
  
  // Calculate hours since last update
  const lastUpdate = categoryEntries.length > 0 
    ? Math.max(...categoryEntries.map(e => new Date(e.last_updated).getTime()))
    : Date.now();
  const hoursAgo = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60));

  const stats = [
    {
      icon: Users,
      label: 'Active Oracles',
      value: totalPlayers.toLocaleString(),
      gradient: 'from-cyan-400 to-blue-500',
      glow: 'shadow-cyan-400/20'
    },
    {
      icon: Trophy,
      label: 'Peak Power',
      value: topScore.toLocaleString(),
      gradient: 'from-yellow-400 to-orange-500',
      glow: 'shadow-yellow-400/20'
    },
    {
      icon: Target,
      label: 'Mystic Average',
      value: avgScore.toLocaleString(),
      gradient: 'from-green-400 to-emerald-500',
      glow: 'shadow-green-400/20'
    },
    {
      icon: Clock,
      label: 'Last Vision',
      value: hoursAgo < 1 ? 'Just now' : `${hoursAgo}h ago`,
      gradient: 'from-purple-400 to-pink-500',
      glow: 'shadow-purple-400/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="group relative">
          {/* Mystical Glow Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-opacity duration-300`}></div>
          
          {/* Glass Card */}
          <div className={`relative bg-gradient-to-br from-slate-800/60 via-purple-900/30 to-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 ${stat.glow} hover:shadow-lg`}>
            {/* Inner Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-2xl`}></div>
            
            <div className="relative flex items-center space-x-4">
              {/* Icon with Mystical Glow */}
              <div className={`relative p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-20 border border-white/20`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20 rounded-xl blur-sm`}></div>
                <stat.icon className={`relative h-6 w-6 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} style={{
                  filter: 'drop-shadow(0 0 8px currentColor)'
                }} />
              </div>
              
              <div>
                <p className="text-sm text-slate-300/80 font-medium">{stat.label}</p>
                <p className={`text-xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardStats;