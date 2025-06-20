import React, { useState, useEffect, useCallback } from 'react';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import LeaderboardTabs from './LeaderboardTabs';
import LeaderboardTable from './LeaderboardTable';
import LeaderboardStats from './LeaderboardStats';
import TimePeriodFilter from './TimePeriodFilter';
import RealTimeToggle from './RealTimeToggle';
import WalletConnection from './WalletConnection';
import ExportFunctionality from './ExportFunctionality';
import ErrorBoundary from './ErrorBoundary';
import AccessibleLeaderboard from './AccessibleLeaderboard';
import Tooltip from './Tooltip';
import { RefreshCw, Sparkles, Zap, Keyboard, Eye } from 'lucide-react';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useHighContrast } from '../../hooks/useHighContrast';

const LeaderboardContainer: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('total_girth');
  
  const {
    entries,
    categories,
    isLoading,
    lastUpdated,
    loadMockData,
    getEntriesByCategory,
    getCurrentPlayerRank,
    realTimeEnabled,
    simulateRealTimeUpdate,
    timePeriod,
    toggleRealTime
  } = useLeaderboardStore();

  const { isHighContrast, toggleHighContrast } = useHighContrast();

  const currentCategoryEntries = getEntriesByCategory(activeCategory);
  const currentCategory = categories.find(cat => cat.id === activeCategory);
  const currentPlayerRank = getCurrentPlayerRank(activeCategory);

  // Keyboard navigation
  const { shortcuts } = useKeyboardNavigation({
    onRefresh: loadMockData,
    onToggleRealTime: toggleRealTime,
    isEnabled: true
  });

  // Real-time simulation effect
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      simulateRealTimeUpdate();
    }, Math.random() * 20000 + 10000); // Random interval between 10-30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, simulateRealTimeUpdate]);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      loadMockData();
    }
  }, [isLoading, loadMockData]);

  return (
    <ErrorBoundary>
      <div className={`relative ${isHighContrast ? 'high-contrast' : ''}`}>
        {/* Mystical Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-purple-900/20 rounded-3xl blur-xl"></div>
        
        {/* Main Container with Liquid Glass Effect */}
        <div className="relative bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-slate-800/90 to-purple-900/90 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-gold-400" style={{ color: '#ffd700' }} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                  Oracle Leaderboard
                </h2>
                <p className="text-slate-300/80 text-sm flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${realTimeEnabled ? 'bg-green-400' : 'bg-cyan-400'}`}></span>
                  <span>
                    {realTimeEnabled ? 'Live Oracle Feed' : `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}`}
                  </span>
                  {realTimeEnabled && <Zap className="h-3 w-3 text-gold-400" style={{ color: '#ffd700' }} />}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Accessibility Controls */}
              <div className="flex items-center space-x-2">
                <Tooltip content="Toggle high contrast mode for better visibility">
                  <button
                    onClick={toggleHighContrast}
                    className={`p-2 rounded-xl border transition-all duration-300 ${
                      isHighContrast 
                        ? 'bg-yellow-500/20 border-yellow-400/40 text-yellow-400' 
                        : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'
                    }`}
                    aria-label="Toggle high contrast mode"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </Tooltip>
                
                <Tooltip 
                  content={
                    <div className="space-y-1">
                      <div className="font-semibold">Keyboard Shortcuts:</div>
                      {Object.entries(shortcuts).map(([key, desc]) => (
                        <div key={key} className="text-xs">
                          <span className="font-mono bg-slate-700 px-1 rounded">{key}</span>: {desc}
                        </div>
                      ))}
                    </div>
                  }
                >
                  <button
                    className="p-2 rounded-xl border border-white/10 bg-slate-800/40 text-slate-400 hover:text-white transition-all duration-300"
                    aria-label="View keyboard shortcuts"
                  >
                    <Keyboard className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>

              <WalletConnection />
              <RealTimeToggle />
              <ExportFunctionality entries={currentCategoryEntries} category={activeCategory} />
              
              <Tooltip content="Refresh Oracle data (Ctrl+R or F5)">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="group relative overflow-hidden bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 disabled:from-slate-600/20 disabled:to-slate-600/20 backdrop-blur-sm border border-cyan-400/30 text-white px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-cyan-400/25"
                  aria-label="Refresh Oracle leaderboard data"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''} text-cyan-400`} />
                    <span className="font-medium">Refresh Oracle</span>
                  </div>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Time Period Filter */}
          <div className="mb-8">
            <TimePeriodFilter />
          </div>

          {/* Current Player Highlight */}
          {currentPlayerRank && (
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/5 to-cyan-400/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-cyan-900/30 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-sm opacity-60"></div>
                      <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl border border-cyan-400/40 flex items-center justify-center">
                        <span className="text-lg font-bold text-cyan-400">#{currentPlayerRank.rank}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-400 flex items-center space-x-2">
                        <span>Your Oracle Rank</span>
                        <Sparkles className="h-4 w-4 text-gold-400" style={{ color: '#ffd700' }} />
                      </h3>
                      <p className="text-slate-300 text-sm">
                        {currentCategory?.name} • {timePeriod.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {currentPlayerRank.score.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-400">{currentCategory?.scoreLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <LeaderboardTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Stats */}
          <LeaderboardStats
            entries={entries}
            category={activeCategory}
          />

          {/* Accessible Leaderboard Table */}
          <AccessibleLeaderboard
            entries={currentCategoryEntries}
            category={activeCategory}
            scoreLabel={currentCategory?.scoreLabel || 'Score'}
          >
            <LeaderboardTable
              entries={currentCategoryEntries}
              category={activeCategory}
              scoreLabel={currentCategory?.scoreLabel || 'Score'}
              isLoading={isLoading}
            />
          </AccessibleLeaderboard>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(LeaderboardContainer);