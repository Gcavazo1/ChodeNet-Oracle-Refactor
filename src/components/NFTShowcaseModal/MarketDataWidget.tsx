import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Clock, Zap, AlertTriangle, Shield, BarChart3, Users, Target, Wifi, WifiOff, RefreshCw, TrendingUp as TrendingFlat } from 'lucide-react';
import { MarketData, MarketAlert } from '../../services/switchboardService';

interface MarketDataWidgetProps {
  marketData: MarketData | null;
  loading: boolean;
  error: string | null;
  theme: 'dark' | 'light' | 'synthwave';
  isLive?: boolean;
  performance?: any;
}

const themes = {
  dark: {
    colors: {
      primary: 'rgb(251, 191, 36)',
      secondary: 'rgb(249, 115, 22)',
      accent: 'rgb(168, 85, 247)',
      background: 'rgb(0, 0, 0)',
      surface: 'rgb(17, 24, 39)',
      text: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(156, 163, 175)',
      border: 'rgb(251, 191, 36, 0.3)',
      glow: 'rgb(251, 191, 36, 0.2)',
      success: 'rgb(34, 197, 94)',
      danger: 'rgb(239, 68, 68)',
      warning: 'rgb(245, 158, 11)'
    }
  },
  light: {
    colors: {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(147, 51, 234)',
      accent: 'rgb(236, 72, 153)',
      background: 'rgb(249, 250, 251)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(17, 24, 39)',
      textSecondary: 'rgb(75, 85, 99)',
      border: 'rgb(59, 130, 246, 0.3)',
      glow: 'rgb(59, 130, 246, 0.1)',
      success: 'rgb(34, 197, 94)',
      danger: 'rgb(239, 68, 68)',
      warning: 'rgb(245, 158, 11)'
    }
  },
  synthwave: {
    colors: {
      primary: 'rgb(236, 72, 153)',
      secondary: 'rgb(168, 85, 247)',
      accent: 'rgb(6, 182, 212)',
      background: 'rgb(15, 23, 42)',
      surface: 'rgb(30, 41, 59)',
      text: 'rgb(248, 113, 113)',
      textSecondary: 'rgb(196, 181, 253)',
      border: 'rgb(236, 72, 153, 0.4)',
      glow: 'rgb(236, 72, 153, 0.2)',
      success: 'rgb(34, 197, 94)',
      danger: 'rgb(239, 68, 68)',
      warning: 'rgb(245, 158, 11)'
    }
  }
};

export const MarketDataWidget: React.FC<MarketDataWidgetProps> = ({ 
  marketData, 
  loading, 
  error, 
  theme: currentTheme,
  isLive = false,
  performance
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [animateValues, setAnimateValues] = useState(false);
  const theme = themes[currentTheme];

  useEffect(() => {
    if (marketData) {
      setAnimateValues(true);
      const timer = setTimeout(() => setAnimateValues(false), 600);
      return () => clearTimeout(timer);
    }
  }, [marketData]);

  const formatPrice = (price: number) => `${price.toFixed(4)} SOL`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M SOL`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K SOL`;
    return `${volume} SOL`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return theme.colors.success;
    if (change < 0) return theme.colors.danger;
    return theme.colors.textSecondary;
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4" />;
    if (change < -5) return <TrendingDown className="w-4 h-4" />;
    return <TrendingFlat className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div 
        className="p-6 rounded-2xl border"
        style={{ 
          background: `linear-gradient(135deg, ${theme.colors.surface}80, ${theme.colors.background}80)`,
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg animate-pulse" style={{ backgroundColor: `${theme.colors.primary}20` }}>
            <Zap className="w-5 h-5" style={{ color: theme.colors.primary }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
              Oracle Market Data
            </h3>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              Fetching demo data...
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div 
                className="h-4 rounded" 
                style={{ 
                  backgroundColor: theme.colors.border,
                  width: `${100 - i * 15}%`
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-6 rounded-2xl border"
        style={{ 
          background: `linear-gradient(135deg, ${theme.colors.surface}80, ${theme.colors.background}80)`,
          borderColor: `${theme.colors.danger}30`
        }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.colors.danger}20` }}>
            <WifiOff className="w-5 h-5" style={{ color: theme.colors.danger }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
              Oracle Connection Failed
            </h3>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!marketData) return null;

  return (
    <div 
      className="p-6 rounded-2xl border transition-all duration-500"
      style={{ 
        background: `linear-gradient(135deg, ${theme.colors.surface}80, ${theme.colors.background}80)`,
        borderColor: theme.colors.border,
        boxShadow: animateValues ? `0 0 20px ${theme.colors.glow}` : 'none'
      }}
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative p-2 rounded-lg" style={{ backgroundColor: `${theme.colors.primary}20` }}>
            <Zap className="w-5 h-5" style={{ color: theme.colors.primary }} />
            <div className="absolute -top-1 -right-1 px-1 py-0.5 text-xs font-bold rounded bg-orange-500 text-white">
              DEMO
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
                Oracle Market Data
              </h3>
              <div className="px-2 py-1 text-xs font-medium rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Coming Soon
              </div>
            </div>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              {marketData.source}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-200"
            style={{ 
              backgroundColor: showAdvanced ? `${theme.colors.primary}20` : 'transparent',
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary
            }}
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
          
          <div className="flex items-center space-x-2 text-xs" style={{ color: theme.colors.textSecondary }}>
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(marketData.lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Floor Price */}
        <div className="text-center p-4 rounded-xl border" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4 mr-1" style={{ color: theme.colors.primary }} />
            <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
              Floor Price
            </span>
          </div>
          <div 
            className={`text-xl font-bold transition-all duration-300 ${animateValues ? 'scale-110' : ''}`}
            style={{ color: theme.colors.text }}
          >
            {formatPrice(marketData.floorPrice)}
          </div>
          <div className="flex items-center justify-center mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
            <Shield className="w-3 h-3 mr-1" />
            <span>{Math.round(marketData.confidence * 100)}% confidence</span>
          </div>
        </div>

        {/* 24h Change */}
        <div className="text-center p-4 rounded-xl border" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center justify-center mb-2">
            {getPriceChangeIcon(marketData.priceChange24h)}
            <span className="text-xs font-medium ml-1" style={{ color: theme.colors.textSecondary }}>
              24h Change
            </span>
          </div>
          <div 
            className={`text-xl font-bold flex items-center justify-center transition-all duration-300 ${animateValues ? 'scale-110' : ''}`}
            style={{ color: getPriceChangeColor(marketData.priceChange24h) }}
          >
            {marketData.priceChange24h > 0 ? '+' : ''}
            {marketData.priceChange24h.toFixed(2)}%
          </div>
          {marketData.trendDirection && (
            <div className="flex items-center justify-center mt-1">
              <span className="text-xs ml-1" style={{ color: theme.colors.textSecondary }}>
                {marketData.trendDirection} trend
              </span>
            </div>
          )}
        </div>

        {/* 24h Volume */}
        <div className="text-center p-4 rounded-xl border" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="w-4 h-4 mr-1" style={{ color: theme.colors.accent }} />
            <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
              24h Volume
            </span>
          </div>
          <div 
            className={`text-xl font-bold transition-all duration-300 ${animateValues ? 'scale-110' : ''}`}
            style={{ color: theme.colors.text }}
          >
            {formatVolume(marketData.volume24h)}
          </div>
          {marketData.volatility && (
            <div className="flex items-center justify-center mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
              <Activity className="w-3 h-3 mr-1" />
              <span>{(marketData.volatility * 100).toFixed(1)}% volatility</span>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Metrics */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: theme.colors.border }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketData.marketCap && (
              <div className="text-center">
                <div className="text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                  Market Cap
                </div>
                <div className="text-sm font-bold" style={{ color: theme.colors.text }}>
                  {formatVolume(marketData.marketCap)}
                </div>
              </div>
            )}

            {marketData.holders && (
              <div className="text-center">
                <div className="flex items-center justify-center text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                  <Users className="w-3 h-3 mr-1" />
                  Holders
                </div>
                <div className="text-sm font-bold" style={{ color: theme.colors.text }}>
                  {marketData.holders.toLocaleString()}
                </div>
              </div>
            )}

            {marketData.avgSalePrice && (
              <div className="text-center">
                <div className="flex items-center justify-center text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                  <Target className="w-3 h-3 mr-1" />
                  Avg Sale
                </div>
                <div className="text-sm font-bold" style={{ color: theme.colors.text }}>
                  {formatPrice(marketData.avgSalePrice)}
                </div>
              </div>
            )}

            {marketData.liquidityScore && (
              <div className="text-center">
                <div className="text-xs font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                  Liquidity
                </div>
                <div className="text-sm font-bold" style={{ color: theme.colors.text }}>
                  {(marketData.liquidityScore * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Oracle Status Footer */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: theme.colors.warning }} 
            />
            <span className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>
              Oracle Status: Demo Mode
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs" style={{ color: theme.colors.textSecondary }}>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Switchboard Ready</span>
            </div>
            <div className="flex items-center space-x-1">
              <RefreshCw className="w-3 h-3" />
              <span>Auto-refresh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 