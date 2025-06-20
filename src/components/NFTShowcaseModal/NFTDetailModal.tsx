import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Star, 
  Award, 
  Zap,
  ExternalLink,
  Share2,
  Bookmark,
  TrendingUp,
  BarChart3,
  Activity,
  Shield
} from 'lucide-react';
import { MarketDataWidget } from './MarketDataWidget';
import { useCollectionMarketData } from '../../services/switchboardService';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  audioUrl?: string;
  videoUrl?: string;
  collection?: string;
  rarity?: string;
}

interface NFTDetailModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light' | 'synthwave';
}

const themes = {
  dark: {
    name: 'Dark Trophy',
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
      glass: 'rgba(17, 24, 39, 0.7)',
      glassBorder: 'rgba(251, 191, 36, 0.3)'
    },
    effects: {
      blur: 'backdrop-blur-xl',
      shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      glow: '0 0 40px rgba(251, 191, 36, 0.2)'
    }
  },
  light: {
    name: 'Royal Light',
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
      glass: 'rgba(255, 255, 255, 0.8)',
      glassBorder: 'rgba(59, 130, 246, 0.2)'
    },
    effects: {
      blur: 'backdrop-blur-2xl',
      shadow: '0 25px 50px -12px rgba(59, 130, 246, 0.3)',
      glow: '0 0 40px rgba(59, 130, 246, 0.15)'
    }
  },
  synthwave: {
    name: 'Synthwave',
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
      glass: 'rgba(30, 41, 59, 0.6)',
      glassBorder: 'rgba(236, 72, 153, 0.4)'
    },
    effects: {
      blur: 'backdrop-blur-lg',
      shadow: '0 25px 50px -12px rgba(236, 72, 153, 0.4)',
      glow: '0 0 60px rgba(236, 72, 153, 0.3)'
    }
  }
};

/**
 * Liquid Glass Component for Detail Modal
 */
const LiquidGlass: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  theme: any;
  intensity?: 'light' | 'medium' | 'strong';
}> = ({ children, className = '', theme, intensity = 'medium' }) => {
  const getGlassStyles = () => {
    const baseStyles = {
      background: theme.colors.glass,
      border: `1px solid ${theme.colors.glassBorder}`,
      boxShadow: theme.effects.shadow
    };

    const intensityStyles = {
      light: { backdropFilter: 'blur(8px) saturate(180%)', WebkitBackdropFilter: 'blur(8px) saturate(180%)' },
      medium: { backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)' },
      strong: { backdropFilter: 'blur(24px) saturate(200%)', WebkitBackdropFilter: 'blur(24px) saturate(200%)' }
    };

    return { ...baseStyles, ...intensityStyles[intensity] };
  };

  return (
    <div 
      className={`${className} transition-all duration-500`}
      style={getGlassStyles()}
    >
      {children}
    </div>
  );
};

const getRarityColor = (rarity: string, currentTheme: 'dark' | 'light' | 'synthwave') => {
  switch (rarity) {
    case 'Mythic': return currentTheme === 'synthwave' ? 'from-pink-500 to-purple-500' : 'from-purple-500 to-pink-500';
    case 'Legendary': return currentTheme === 'light' ? 'from-amber-500 to-orange-500' : 'from-yellow-500 to-orange-500';
    case 'Epic': return currentTheme === 'synthwave' ? 'from-cyan-500 to-blue-500' : 'from-blue-500 to-purple-500';
    case 'Rare': return 'from-green-500 to-blue-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'Mythic': return <Star className="w-5 h-5" />;
    case 'Legendary': return <Award className="w-5 h-5" />;
    case 'Epic': return <Star className="w-4 h-4" />;
    case 'Rare': return <Star className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

export const NFTDetailModal: React.FC<NFTDetailModalProps> = ({ nft, isOpen, onClose, theme: currentTheme }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const theme = themes[currentTheme];

  // Enhanced market data fetching with real-time capabilities
  const { 
    data: marketData, 
    loading: marketDataLoading, 
    error: marketDataError,
    isLive,
    performance,
    hasOracleFeed
  } = useCollectionMarketData(nft.collection || null, {
    refreshInterval: 15000,
    enableRealTime: true,
    retryOnError: true
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Enhanced Backdrop with Liquid Glass Blur */}
      <div 
        className={`fixed inset-0 transition-opacity duration-700 ${theme.effects.blur}`}
        style={{ 
          background: `linear-gradient(135deg, ${theme.colors.background}F0, ${theme.colors.surface}E6)`,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <LiquidGlass
          theme={theme}
          intensity="strong"
          className="relative w-full max-w-7xl transform overflow-hidden rounded-3xl transition-all duration-700 scale-100"
          style={{ 
            boxShadow: `${theme.effects.shadow}, ${theme.effects.glow}`
          }}
        >
          
          {/* Enhanced Header with Actions */}
          <div className="absolute top-6 right-6 z-10 flex items-center space-x-3">
            <LiquidGlass
              theme={theme}
              intensity="medium"
              className="p-3 rounded-full transition-all duration-300 group cursor-pointer"
              onClick={handleBookmark}
              style={{ 
                color: isBookmarked ? theme.colors.primary : theme.colors.textSecondary
              }}
            >
              <Bookmark className={`w-5 h-5 group-hover:scale-110 transition-transform duration-300 ${isBookmarked ? 'fill-current' : ''}`} />
            </LiquidGlass>
            
            <div className="relative">
              <LiquidGlass
                theme={theme}
                intensity="medium"
                className="p-3 rounded-full transition-all duration-300 group cursor-pointer"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.colors.textSecondary }} />
              </LiquidGlass>
              
              {showShareMenu && (
                <LiquidGlass
                  theme={theme}
                  intensity="strong"
                  className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden z-20"
                  style={{ boxShadow: `0 20px 40px ${theme.colors.glow}` }}
                >
                  <button className="w-full px-4 py-3 text-left hover:bg-opacity-80 transition-colors duration-200" style={{ color: theme.colors.text }}>
                    Copy Link
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-opacity-80 transition-colors duration-200" style={{ color: theme.colors.text }}>
                    Share on Twitter
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-opacity-80 transition-colors duration-200" style={{ color: theme.colors.text }}>
                    Share on Discord
                  </button>
                </LiquidGlass>
              )}
            </div>
            
            <LiquidGlass
              theme={theme}
              intensity="medium"
              className="p-3 rounded-full transition-all duration-300 group cursor-pointer"
              onClick={onClose}
            >
              <X className="w-6 h-6 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" style={{ color: theme.colors.primary }} />
            </LiquidGlass>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Enhanced Image Section */}
            <div className="relative aspect-square lg:aspect-auto">
              <div className="absolute inset-0">
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Enhanced Rarity Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(nft.rarity || 'Common', currentTheme)} opacity-20 mix-blend-overlay`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Rarity Badge */}
              <div className="absolute top-6 left-6">
                <LiquidGlass
                  theme={theme}
                  intensity="strong"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getRarityColor(nft.rarity || 'Common', currentTheme)}`}
                >
                  {getRarityIcon(nft.rarity || 'Common')}
                  <span className="text-white font-bold text-sm uppercase tracking-wider">
                    {nft.rarity}
                  </span>
                </LiquidGlass>
              </div>
              
              {/* Demo Badge */}
              <div className="absolute bottom-6 left-6">
                <LiquidGlass
                  theme={theme}
                  intensity="medium"
                  className="flex items-center space-x-2 px-3 py-2 rounded-full"
                >
                  <Zap className="w-4 h-4" style={{ color: theme.colors.primary }} />
                  <span className="text-xs font-medium" style={{ color: theme.colors.text }}>
                    Demo NFT Data
                  </span>
                  <div className="px-1 py-0.5 text-xs font-bold rounded bg-orange-500 text-white">
                    COMING SOON
                  </div>
                </LiquidGlass>
              </div>
            </div>

            {/* Enhanced Details Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              {/* Header with Collection Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <LiquidGlass
                      theme={theme}
                      intensity="medium"
                      className={`p-2 rounded-lg bg-gradient-to-r ${getRarityColor(nft.rarity || 'Common', currentTheme)}`}
                    >
                      {getRarityIcon(nft.rarity || 'Common')}
                    </LiquidGlass>
                    <div>
                      <span className={`text-sm font-bold bg-gradient-to-r ${getRarityColor(nft.rarity || 'Common', currentTheme)} bg-clip-text text-transparent uppercase tracking-wider`}>
                        {nft.rarity}
                      </span>
                      {nft.collection && (
                        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                          {nft.collection}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Demo Stats */}
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="text-center">
                      <div style={{ color: theme.colors.primary }}>
                        Demo Data
                      </div>
                      <div style={{ color: theme.colors.textSecondary }}>
                        Floor
                      </div>
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight" style={{ color: theme.colors.text }}>
                  {nft.name}
                </h1>

                <div className="prose prose-invert max-w-none">
                  <p className="leading-relaxed text-lg" style={{ color: theme.colors.textSecondary }}>
                    {nft.description}
                  </p>
                </div>
              </div>

              {/* Enhanced Market Data Widget */}
              <div className="mt-8">
                <MarketDataWidget 
                  marketData={marketData}
                  loading={marketDataLoading}
                  error={marketDataError}
                  theme={currentTheme}
                  isLive={isLive}
                  performance={performance}
                />
              </div>

              {/* Enhanced Action Buttons */}
              <div className="mt-8 flex space-x-4">
                <LiquidGlass
                  theme={theme}
                  intensity="strong"
                  className="flex-1 px-6 py-3 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  style={{ 
                    background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    color: currentTheme === 'light' ? 'white' : theme.colors.background,
                    boxShadow: `0 20px 40px ${theme.colors.glow}`
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Explorer</span>
                </LiquidGlass>
                
                <LiquidGlass
                  theme={theme}
                  intensity="medium"
                  className="px-6 py-3 font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 cursor-pointer"
                  style={{ color: theme.colors.text }}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Price History</span>
                </LiquidGlass>
              </div>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}; 