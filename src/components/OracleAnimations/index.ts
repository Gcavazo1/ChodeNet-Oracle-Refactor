// Oracle Animation System - Main Export File
// Modular anime.js animations for the Oracle Dashboard

// Core Animation Modules
export * from './MetricsGridAnimations';
export * from './CommunityCardsAnimations';
export * from './SVGAnimations';
export * from './AlertSystemAnimations';

// Animation Utilities
export * from './AnimationUtils';

// Type definitions
export interface OracleAnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  stagger?: number;
  loop?: boolean | number;
  complete?: (anim?: any) => void;
}

export interface GridAnimationOptions extends OracleAnimationConfig {
  gridColumns?: number;
  gridRows?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  staggerDirection?: 'row' | 'column' | 'center';
}

export interface SVGAnimationOptions extends OracleAnimationConfig {
  strokeWidth?: number;
  fillOpacity?: number;
  filters?: string[];
  morphSteps?: number;
}

// Default animation configurations
export const ORACLE_ANIMATION_PRESETS = {
  // Fast, snappy animations for interactions
  FAST: {
    duration: 300,
    easing: 'easeOutCubic'
  },
  
  // Standard entrance animations
  ENTRANCE: {
    duration: 800,
    easing: 'easeOutExpo',
    stagger: 100
  },
  
  // Dramatic, cinematic animations
  CINEMATIC: {
    duration: 1200,
    easing: 'easeOutElastic(1, .6)',
    stagger: 150
  },
  
  // Subtle, continuous animations
  AMBIENT: {
    duration: 2000,
    easing: 'linear',
    loop: true
  },
  
  // High-energy, attention-grabbing
  PULSE: {
    duration: 600,
    easing: 'easeInOutSine',
    loop: true,
    direction: 'alternate'
  }
} as const;

// Color palettes for animations
export const ORACLE_COLORS = {
  PRIMARY: '#00d2ff',
  SECONDARY: '#ff0080',
  ACCENT: '#00ff88',
  CORRUPTION: '#ff3366',
  WARNING: '#ffaa00',
  SUCCESS: '#00ff44',
  MYSTICAL: '#bb88ff',
  GLOW: '#ffffff'
} as const;

// Convenience re-exports for most commonly used animations
export { 
  animateMetricsGridEntrance,
  animateMetricCardFocus,
  startMetricCardsPulse
} from './MetricsGridAnimations';

export {
  animateCommunityCardsEntrance,
  animateCardHover,
  animateCommunityWave
} from './CommunityCardsAnimations';

export {
  animateOracleEye,
  createAnimatedProgressBar,
  animateStatusIndicators
} from './SVGAnimations';

export {
  animateAlertEntrance,
  animateHighPriorityPulse,
  animateAlertShimmer
} from './AlertSystemAnimations';

// Main animation controller
export { OracleAnimationController } from './OracleAnimationController';

// Animation utilities
export { useOracleAnimations } from './useOracleAnimations'; 