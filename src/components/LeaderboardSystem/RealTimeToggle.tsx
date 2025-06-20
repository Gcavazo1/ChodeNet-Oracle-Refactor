import React from 'react';
import { Radio, Radio as RadioOff, Zap, Sparkles } from 'lucide-react';
import { useLeaderboardStore } from '../../store/leaderboardStore';

const RealTimeToggle: React.FC = () => {
  const { realTimeEnabled, toggleRealTime } = useLeaderboardStore();

  return (
    <button
      onClick={toggleRealTime}
      className={`group relative overflow-hidden backdrop-blur-sm border text-white px-4 py-3 rounded-2xl transition-all duration-300 shadow-lg ${
        realTimeEnabled
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-green-400/30 hover:shadow-green-400/25'
          : 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 hover:from-slate-500/30 hover:to-gray-500/30 border-slate-400/30 hover:shadow-slate-400/25'
      }`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        realTimeEnabled
          ? 'bg-gradient-to-r from-green-400/10 to-emerald-400/10'
          : 'bg-gradient-to-r from-slate-400/10 to-gray-400/10'
      }`}></div>
      
      <div className="relative flex items-center space-x-3">
        {realTimeEnabled ? (
          <>
            <div className="relative">
              <Radio className="h-5 w-5 text-green-400" />
              <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-60 animate-pulse"></div>
            </div>
            <span className="font-medium text-green-400">Live Oracle</span>
            <Sparkles className="h-4 w-4 text-gold-400 animate-pulse" style={{ color: '#ffd700' }} />
          </>
        ) : (
          <>
            <RadioOff className="h-5 w-5 text-slate-400" />
            <span className="font-medium text-slate-400">Static View</span>
            <Zap className="h-4 w-4 text-slate-400" />
          </>
        )}
      </div>
    </button>
  );
};

export default RealTimeToggle;