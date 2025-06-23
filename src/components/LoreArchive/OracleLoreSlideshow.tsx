import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Share, 
  Eye, 
  Sparkles, 
  Wand2,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SkipForward,
  SkipBack,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { LoreEntry, OracleLoreSlideshowProps } from '../../types/lore';
import { generateLoreComicPanel, generateLoreAudio, CorruptionLevel } from '../../lib/oracleBackendIntegration';
import './oracle-theme.css';

const OracleLoreSlideshow: React.FC<OracleLoreSlideshowProps> = ({
  isOpen,
  entries,
  initialEntryId,
  onClose,
  onGenerateComicPanel,
  onGenerateAudio,
  onLike,
  generatingPanels,
  generatingAudio
}) => {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // UI state
  const [showControls, setShowControls] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Image interaction state
  const [imageZoom, setImageZoom] = useState(1.00);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Animation state
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  
  // Touch/gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(0.70);
  
  // Accessibility state
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [announcements, setAnnouncements] = useState<string>('');
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout>();
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);
  const particleAnimationRef = useRef<number>();

  // Utility functions
  const getCorruptionColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'low':
      case 'pristine': return '#06D6A0';
      case 'medium':
      case 'cryptic': return '#9D4EDD';
      case 'high':
      case 'flickering': return '#F59E0B';
      case 'critical':
      case 'glitched_ominous': return '#EF4444';
      case 'forbidden':
      case 'forbidden_fragment': return '#DC2626';
      default: return '#FFFFFF';
    }
  };

  const getCorruptionIcon = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'low':
      case 'pristine': return '✨';
      case 'medium':
      case 'cryptic': return '🔮';
      case 'high':
      case 'flickering': return '⚡';
      case 'critical':
      case 'glitched_ominous': return '🔥';
      case 'forbidden':
      case 'forbidden_fragment': return '💀';
      default: return '📜';
    }
  };

  const getCorruptionClass = (level: string) => {
    const mapping: Record<string, string> = {
      'low': 'corruption-pristine',
      'medium': 'corruption-cryptic',
      'high': 'corruption-flickering',
      'critical': 'corruption-glitched-ominous',
      'forbidden': 'corruption-forbidden-fragment'
    };
    return mapping[level.toLowerCase()] || 'corruption-cryptic';
  };

  const mapCorruptionLevel = (level: string): CorruptionLevel => {
    const mapping: Record<string, CorruptionLevel> = {
      'low': 'pristine',
      'medium': 'cryptic',
      'high': 'flickering',
      'critical': 'glitched_ominous',
      'forbidden': 'forbidden_fragment'
    };
    return mapping[level.toLowerCase()] || 'cryptic';
  };

  // Accessibility functions
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncements(message);
    setTimeout(() => setAnnouncements(''), 1000);
  }, []);

  const checkAccessibilityPreferences = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);
  }, []);

  // Particle animation system
  const createParticles = useCallback(() => {
    if (reducedMotion) return;
    
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      opacity: Math.random() * 0.5 + 0.1
    }));
    setParticles(newParticles);
  }, [reducedMotion]);

  const animateParticles = useCallback(() => {
    if (reducedMotion) return;
    
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + (Math.random() - 0.5) * 2,
      y: particle.y + (Math.random() - 0.5) * 2,
      opacity: particle.opacity * 0.99
    })).filter(p => p.opacity > 0.01));

    particleAnimationRef.current = requestAnimationFrame(animateParticles);
  }, [reducedMotion]);

  // Touch gesture handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      setIsPinching(true);
      setInitialPinchDistance(getTouchDistance(e.touches));
      setInitialZoom(imageZoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinching && e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.max(0.5, Math.min(3, initialZoom * scale));
      setImageZoom(newZoom);
    } else if (touchStart && e.touches.length === 1) {
      setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    if (isPinching) {
      setIsPinching(false);
      return;
    }

    if (!touchStart || !touchEnd) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Navigation with animations
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    
    setSlideDirection('left');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
      setIsPlaying(false);
      setAudioProgress(0);
      announceToScreenReader(`Navigated to story ${currentIndex + 2} of ${entries.length}: ${entries[(currentIndex + 1) % entries.length]?.story_title}`);
      
      setTimeout(() => {
        setSlideDirection('none');
        setIsTransitioning(false);
      }, reducedMotion ? 0 : 300);
    }, reducedMotion ? 0 : 150);
  }, [currentIndex, entries.length, isTransitioning, announceToScreenReader, reducedMotion]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    
    setSlideDirection('right');
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + entries.length) % entries.length);
      setIsPlaying(false);
      setAudioProgress(0);
      announceToScreenReader(`Navigated to story ${currentIndex} of ${entries.length}: ${entries[(currentIndex - 1 + entries.length) % entries.length]?.story_title}`);
      
      setTimeout(() => {
        setSlideDirection('none');
        setIsTransitioning(false);
      }, reducedMotion ? 0 : 300);
    }, reducedMotion ? 0 : 150);
  }, [currentIndex, entries.length, isTransitioning, announceToScreenReader, reducedMotion]);

  // Initialize component
  useEffect(() => {
    checkAccessibilityPreferences();
    
    if (initialEntryId && entries.length > 0) {
      const index = entries.findIndex(entry => entry.id === initialEntryId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [initialEntryId, entries, checkAccessibilityPreferences]);

  // Reset image view when changing entries  
  useEffect(() => {
    setImageZoom(1.00);
    setImagePosition({ x: 0, y: 0 });
    createParticles();
  }, [currentIndex, createParticles]);

  // Hide header when slideshow is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('slideshow-open');
    } else {
      document.body.classList.remove('slideshow-open');
    }
    
    return () => {
      document.body.classList.remove('slideshow-open');
    };
  }, [isOpen]);

  // Particle animation
  useEffect(() => {
    if (isOpen && !reducedMotion) {
      createParticles();
      animateParticles();
    }
    
    return () => {
      if (particleAnimationRef.current) {
        cancelAnimationFrame(particleAnimationRef.current);
      }
    };
  }, [isOpen, createParticles, animateParticles, reducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Don't interfere with form inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          announceToScreenReader('Slideshow closed');
          break;
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'a':
        case 'A':
          setIsAutoPlay(prev => {
            const newValue = !prev;
            announceToScreenReader(`Auto-play ${newValue ? 'enabled' : 'disabled'}`);
            return newValue;
          });
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          resetImageView();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, goToNext, goToPrevious, announceToScreenReader]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && isOpen && !isTransitioning) {
      autoPlayTimeoutRef.current = setTimeout(() => {
        goToNext();
      }, 5000);
    }

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [isAutoPlay, currentIndex, isOpen, isTransitioning, goToNext]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setAudioProgress(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      announceToScreenReader('Audio playback ended');
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, announceToScreenReader]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => setShowControls(false), 4000);
    };

    if (isOpen) {
      resetTimeout();
      const handleMouseMove = () => resetTimeout();
      const handleTouchStart = () => resetTimeout();
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchstart', handleTouchStart);
      
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [isOpen]);

  const currentEntry = entries[currentIndex];

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentEntry.tts_audio_url) return;

    if (isPlaying) {
      audio.pause();
      announceToScreenReader('Audio paused');
    } else {
      audio.play();
      announceToScreenReader('Audio playing');
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setIsMuted(!isMuted);
    audio.muted = !isMuted;
    announceToScreenReader(`Audio ${!isMuted ? 'muted' : 'unmuted'}`);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    announceToScreenReader(`${!isFullscreen ? 'Entered' : 'Exited'} fullscreen mode`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * audioDuration;
    
    audio.currentTime = newTime;
    setAudioProgress(newTime);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(imageZoom * 1.2, 3);
    setImageZoom(newZoom);
    announceToScreenReader(`Zoomed to ${Math.round(newZoom * 100)}%`);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(imageZoom / 1.2, 0.5);
    setImageZoom(newZoom);
    announceToScreenReader(`Zoomed to ${Math.round(newZoom * 100)}%`);
  };

  const resetImageView = () => {
    setImageZoom(1.00);
    setImagePosition({ x: 0, y: 0 });
    announceToScreenReader('Image view reset');
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleImageMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGenerateComicPanel = async (entry: LoreEntry) => {
    try {
      announceToScreenReader('Generating visual manifestation');
      const corruptionLevel = mapCorruptionLevel(entry.oracle_corruption_level);
      const visualPrompt = `Cosmic scene depicting: ${entry.story_summary}`;
      
      const result = await generateLoreComicPanel(
        entry.id,
        entry.story_text,
        visualPrompt,
        corruptionLevel
      );

      if (result.success && result.comic_panel_url) {
        await onGenerateComicPanel(entry);
        announceToScreenReader('Visual manifestation generated successfully');
      } else {
        console.error('Failed to generate comic panel:', result.error);
        announceToScreenReader('Failed to generate visual manifestation');
      }
    } catch (error) {
      console.error('Error generating comic panel:', error);
      announceToScreenReader('Error generating visual manifestation');
    }
  };

  const handleGenerateAudio = async (entry: LoreEntry) => {
    try {
      announceToScreenReader('Generating audio narration');
      const result = await generateLoreAudio(entry.id, entry.story_text);

      if (result.success && result.audio_url) {
        await onGenerateAudio(entry);
        announceToScreenReader('Audio narration generated successfully');
      } else {
        console.error('Failed to generate audio:', result.error);
        announceToScreenReader('Failed to generate audio narration');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      announceToScreenReader('Error generating audio narration');
    }
  };

  if (!isOpen || entries.length === 0) return null;

  // Wrap overlay in a React portal to ensure it escapes any overflow/transform clipping
  const OverlayContent = (
    <div 
      className={`fixed inset-0 oracle-bg flex ${isFullscreen ? 'fullscreen-mode' : ''} ${highContrast ? 'high-contrast' : ''}`}
      style={{ zIndex: 10000 }}
      data-testid="oracle-slideshow"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-labelledby="slideshow-title"
      aria-describedby="slideshow-description"
    >
      {/* Screen reader announcements */}
      <div 
        ref={announcementRef}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcements}
      </div>

      {/* Cosmic particles */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full cosmic-particle"
              style={{
                left: particle.x,
                top: particle.y,
                opacity: particle.opacity,
                transform: `scale(${particle.opacity * 2})`
              }}
            />
          ))}
        </div>
      )}

      {/* Background with parallax effect */}
      {currentEntry.comic_panel_url && (
        <div 
          className={`absolute inset-0 bg-cover bg-center opacity-10 transition-all duration-1000 ${!reducedMotion ? 'parallax-bg' : ''}`}
          style={{ 
            backgroundImage: `url(${currentEntry.comic_panel_url})`,
            transform: !reducedMotion ? `scale(1.1) translateX(${imagePosition.x * 0.1}px)` : 'none'
          }}
        />
      )}
      
      {/* Left Sidebar - Story Navigation */}
      <div className={`w-80 liquid-glass-primary border-r border-white/10 flex flex-col transition-all duration-300 ${showControls ? 'translate-x-0' : '-translate-x-full'} ${isFullscreen ? 'hidden lg:flex' : ''}`}>
        <div className="p-6 border-b border-white/10">
          <h2 id="slideshow-title" className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Lore Collection
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                isAutoPlay ? 'liquid-glass-accent' : 'liquid-glass'
              }`}
              style={{ color: 'var(--text-primary)' }}
              aria-label={`Auto-play is ${isAutoPlay ? 'on' : 'off'}. Click to toggle.`}
            >
              {isAutoPlay ? 'Auto-play ON' : 'Auto-play OFF'}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="liquid-glass hover:liquid-glass-primary rounded-full p-2 transition-all duration-200"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 liquid-glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Reduced Motion
                </label>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                    reducedMotion ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  aria-label={`Reduced motion is ${reducedMotion ? 'on' : 'off'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    reducedMotion ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  High Contrast
                </label>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                    highContrast ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  aria-label={`High contrast is ${highContrast ? 'on' : 'off'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    highContrast ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              onClick={() => setCurrentIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentIndex(index);
                }
              }}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                index === currentIndex 
                  ? 'liquid-glass-accent border-2' 
                  : 'liquid-glass hover:liquid-glass-primary'
              }`}
              style={{ 
                borderColor: index === currentIndex ? getCorruptionColor(entry.oracle_corruption_level) : 'transparent'
              }}
              tabIndex={0}
              role="button"
              aria-label={`Story ${index + 1}: ${entry.story_title}. ${index === currentIndex ? 'Currently selected.' : ''}`}
            >
              <div className="flex items-start space-x-3">
                {entry.comic_panel_url ? (
                  <img
                    src={entry.comic_panel_url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg liquid-glass flex items-center justify-center">
                    <Sparkles className="w-6 h-6" style={{ color: 'var(--oracle-primary)' }} />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg" role="img" aria-label={`${entry.oracle_corruption_level} corruption level`}>
                      {getCorruptionIcon(entry.oracle_corruption_level)}
                    </span>
                    <span 
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: getCorruptionColor(entry.oracle_corruption_level) }}
                    >
                      {entry.oracle_corruption_level}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {entry.story_title}
                  </h3>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {entry.story_summary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Controls */}
        <div className={`p-6 bg-gradient-to-b from-black/50 to-transparent transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="liquid-glass px-4 py-2">
                <span className="text-white/90 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {currentIndex + 1} of {entries.length}
                </span>
              </div>
              <div 
                className={`liquid-glass px-3 py-1 ${getCorruptionClass(currentEntry.oracle_corruption_level)}`}
                style={{ borderColor: getCorruptionColor(currentEntry.oracle_corruption_level) }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm" role="img" aria-label={`${currentEntry.oracle_corruption_level} corruption level`}>
                    {getCorruptionIcon(currentEntry.oracle_corruption_level)}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {currentEntry.oracle_corruption_level} Corruption
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Image Controls */}
              {currentEntry.comic_panel_url && (
                <div className="flex items-center space-x-1 liquid-glass rounded-full px-3 py-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 hover:bg-white/10 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                  </button>
                  <span className="text-xs px-2" style={{ color: 'var(--text-primary)' }} aria-label={`Current zoom: ${Math.round(imageZoom * 100)}%`}>
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 hover:bg-white/10 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                  </button>
                  <button
                    onClick={resetImageView}
                    className="p-1 hover:bg-white/10 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Reset image view"
                  >
                    <RotateCcw className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                  </button>
                </div>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="liquid-glass hover:liquid-glass-primary rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label={`${isFullscreen ? 'Exit' : 'Enter'} fullscreen`}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                ) : (
                  <Maximize2 className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                )}
              </button>
              
              <button
                onClick={onClose}
                className="liquid-glass hover:liquid-glass-primary rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Close slideshow"
              >
                <X className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Center Stage - Image Display */}
        <div 
          ref={slideContainerRef}
          className={`flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center p-6 transition-all duration-300 ${
            !reducedMotion && slideDirection !== 'none' ? `slide-${slideDirection}` : ''
          }`}
        >
          {currentEntry.comic_panel_url ? (
            <div 
              ref={imageRef}
              className="relative max-w-none max-h-none overflow-visible rounded-2xl shadow-2xl border border-white/10 cursor-move focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{
                width: `${100 * imageZoom}%`,
                height: `${100 * imageZoom}%`,
                minWidth: '400px',
                minHeight: '300px'
              }}
              onMouseDown={handleImageMouseDown}
              onMouseMove={handleImageMouseMove}
              onMouseUp={handleImageMouseUp}
              onMouseLeave={handleImageMouseUp}
              tabIndex={0}
              role="img"
              aria-label={`Comic panel for ${currentEntry.story_title}. Use zoom controls or pinch to zoom.`}
            >
              <img
                src={currentEntry.comic_panel_url}
                alt={currentEntry.story_title}
                className={`w-full h-full object-contain transition-transform duration-200 ${
                  !reducedMotion ? 'smooth-transform' : ''
                }`}
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  cursor: imageZoom > 0.2 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="aspect-video w-full max-w-4xl liquid-glass rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4" role="img" aria-label={`${currentEntry.oracle_corruption_level} corruption level`}>
                  {getCorruptionIcon(currentEntry.oracle_corruption_level)}
                </div>
                <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--oracle-primary)' }} />
                <p className="mb-6 text-lg" style={{ color: 'var(--text-secondary)' }}>
                  No visual manifestation detected
                </p>
                <button
                  onClick={() => handleGenerateComicPanel(currentEntry)}
                  disabled={generatingPanels.has(currentEntry.id)}
                  className="liquid-glass-primary hover:liquid-glass-accent disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-full font-medium flex items-center space-x-3 mx-auto transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ color: 'var(--text-primary)' }}
                  aria-label={generatingPanels.has(currentEntry.id) ? 'Generating visual manifestation...' : 'Generate visual manifestation'}
                >
                  {generatingPanels.has(currentEntry.id) ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Wand2 className="w-6 h-6" />
                  )}
                  <span className="text-lg">Generate Visual Manifestation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className={`p-6 bg-gradient-to-t from-black/50 to-transparent transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={goToPrevious}
              disabled={entries.length <= 1}
              className="liquid-glass hover:liquid-glass-primary disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Previous story"
            >
              <SkipBack className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            </button>
            
            <div className="liquid-glass rounded-2xl px-8 py-4 max-w-md">
              <h3 id="slideshow-description" className="font-bold text-lg text-center" style={{ color: 'var(--text-primary)' }}>
                {currentEntry.story_title}
              </h3>
            </div>
            
            <button
              onClick={goToNext}
              disabled={entries.length <= 1}
              className="liquid-glass hover:liquid-glass-primary disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Next story"
            >
              <SkipForward className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Content & Controls */}
      <div className={`w-96 liquid-glass-primary border-l border-white/10 flex flex-col transition-all duration-300 ${showControls ? 'translate-x-0' : 'translate-x-full'} ${isFullscreen ? 'hidden lg:flex' : ''}`}>
        {/* Story Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl" role="img" aria-label={`${currentEntry.oracle_corruption_level} corruption level`}>
                {getCorruptionIcon(currentEntry.oracle_corruption_level)}
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {currentEntry.story_title}
                </h1>
                <div 
                  className="text-sm font-medium"
                  style={{ color: getCorruptionColor(currentEntry.oracle_corruption_level) }}
                >
                  {currentEntry.oracle_corruption_level.toUpperCase()} CORRUPTION
                </div>
              </div>
            </div>
            
            <div className="liquid-glass rounded-xl p-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {currentEntry.story_text}
              </p>
            </div>
          </div>

          {/* Audio Controls */}
          {currentEntry.tts_audio_url ? (
            <div className="liquid-glass-primary rounded-xl p-4" role="region" aria-label="Audio player">
              <div className="flex items-center space-x-3 mb-3">
                <button
                  onClick={togglePlayPause}
                  className="liquid-glass hover:liquid-glass-accent rounded-full p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" style={{ color: 'var(--text-primary)' }} />
                  )}
                </button>
                
                <div className="flex-1">
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="h-2 bg-white/10 rounded-full cursor-pointer mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    role="slider"
                    aria-label="Audio progress"
                    aria-valuemin={0}
                    aria-valuemax={audioDuration}
                    aria-valuenow={audioProgress}
                    tabIndex={0}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ 
                        width: `${(audioProgress / audioDuration) * 100 || 0}%`,
                        background: `linear-gradient(90deg, ${getCorruptionColor(currentEntry.oracle_corruption_level)}, var(--oracle-accent))`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span aria-label={`Current time: ${formatTime(audioProgress)}`}>{formatTime(audioProgress)}</span>
                    <span aria-label={`Total duration: ${formatTime(audioDuration)}`}>{formatTime(audioDuration)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-1 hover:bg-white/10 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <Volume2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Volume control"
                />
              </div>
              
              <audio
                ref={audioRef}
                src={currentEntry.tts_audio_url}
                muted={isMuted}
              />
            </div>
          ) : (
            <div className="liquid-glass-primary rounded-xl p-4 text-center">
              <div className="text-3xl mb-3" role="img" aria-label="Music note">🎵</div>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                No Oracle narration available
              </p>
              <button
                onClick={() => handleGenerateAudio(currentEntry)}
                disabled={generatingAudio.has(currentEntry.id)}
                className="liquid-glass-accent hover:liquid-glass-primary disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-full font-medium flex items-center space-x-2 mx-auto transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ color: 'var(--text-primary)' }}
                aria-label={generatingAudio.has(currentEntry.id) ? 'Generating narration...' : 'Generate narration'}
              >
                {generatingAudio.has(currentEntry.id) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
                <span>Generate Narration</span>
              </button>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="liquid-glass rounded-xl p-4" role="region" aria-label="Story statistics">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <button
                onClick={() => onLike(currentEntry.id)}
                className="flex flex-col items-center space-y-1 hover:text-red-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded p-2"
                style={{ color: 'var(--text-muted)' }}
                aria-label={`Like this story. Currently has ${currentEntry.like_count} likes.`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">{currentEntry.like_count}</span>
                <span className="text-xs">Likes</span>
              </button>
              
              <div className="flex flex-col items-center space-y-1" style={{ color: 'var(--text-muted)' }}>
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">{currentEntry.view_count}</span>
                <span className="text-xs">Views</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1" style={{ color: 'var(--text-muted)' }}>
                <Share className="w-5 h-5" />
                <span className="text-sm font-medium">{currentEntry.share_count}</span>
                <span className="text-xs">Shares</span>
              </div>
            </div>
            
            <div className="text-center text-xs pt-3 border-t border-white/10" style={{ color: 'var(--text-muted)' }}>
              Created {new Date(currentEntry.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(OverlayContent, document.body);
};

export default OracleLoreSlideshow;