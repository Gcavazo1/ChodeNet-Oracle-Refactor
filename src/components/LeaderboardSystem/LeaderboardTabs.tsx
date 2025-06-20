import React from 'react';
import { LeaderboardCategory } from '../../types/leaderboard';

interface LeaderboardTabsProps {
  categories: LeaderboardCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="mb-8">
      {/* Liquid Glass Tab Container */}
      <div className="relative bg-gradient-to-r from-slate-800/40 via-purple-900/20 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative flex items-center space-x-3 py-3 px-6 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white shadow-lg shadow-cyan-400/20 border border-cyan-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Active Tab Glow Effect */}
              {activeCategory === category.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl blur-sm"></div>
              )}
              
              {/* Tab Content */}
              <div className="relative flex items-center space-x-3">
                <span className="text-xl filter drop-shadow-sm">{category.icon}</span>
                <span className="font-semibold">{category.name}</span>
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

export default LeaderboardTabs;