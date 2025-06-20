import React from 'react';
import { Calendar, Clock, Infinity, Sparkles } from 'lucide-react';
import { useLeaderboardStore } from '../../store/leaderboardStore';

const TimePeriodFilter: React.FC = () => {
  const { timePeriod, setTimePeriod, isLoading } = useLeaderboardStore();

  const periods = [
    {
      id: 'daily' as const,
      label: 'Daily Visions',
      icon: Clock,
      description: 'Last 24 hours',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      id: 'weekly' as const,
      label: 'Weekly Prophecies',
      icon: Calendar,
      description: 'Last 7 days',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      id: 'all-time' as const,
      label: 'Eternal Records',
      icon: Infinity,
      description: 'All time',
      gradient: 'from-cyan-400 to-blue-500'
    }
  ];

  return (
    <div className="relative">
      {/* Filter Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-cyan-400/5 to-blue-400/10 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-gradient-to-br from-slate-800/60 via-purple-900/30 to-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
        <div className="flex space-x-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => !isLoading && setTimePeriod(period.id)}
              disabled={isLoading}
              className={`group relative flex items-center space-x-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                timePeriod === period.id
                  ? `bg-gradient-to-r ${period.gradient.replace('from-', 'from-').replace('to-', 'to-')}/30 text-white shadow-lg border border-white/20`
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Active Period Glow */}
              {timePeriod === period.id && (
                <div className={`absolute inset-0 bg-gradient-to-r ${period.gradient} opacity-20 rounded-xl blur-sm`}></div>
              )}
              
              <div className="relative flex items-center space-x-3">
                <period.icon className={`h-4 w-4 ${timePeriod === period.id ? `bg-gradient-to-r ${period.gradient} bg-clip-text text-transparent` : ''}`} />
                <div className="text-left">
                  <div className="font-semibold">{period.label}</div>
                  <div className="text-xs opacity-80">{period.description}</div>
                </div>
                {timePeriod === period.id && (
                  <Sparkles className="h-3 w-3 text-gold-400" style={{ color: '#ffd700' }} />
                )}
              </div>
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimePeriodFilter;