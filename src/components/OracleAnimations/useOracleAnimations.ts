import { useCallback, useEffect, useRef } from 'react';
import { OracleAnimationController } from './OracleAnimationController';
import type { OracleAnimationConfig, SVGAnimationOptions } from './index';
import { ORACLE_ANIMATION_PRESETS } from './index';
import {
  animateMetricsGridEntrance,
  animateMetricCardFocus,
  startMetricCardsPulse
} from './MetricsGridAnimations';
import {
  animateCommunityCardsEntrance,
  animateCardHover,
  animateCommunityWave
} from './CommunityCardsAnimations';
import {
  animateOracleEye,
  createAnimatedProgressBar,
  animateStatusIndicators
} from './SVGAnimations';
import {
  animateAlertEntrance,
  animateHighPriorityPulse,
  animateAlertShimmer
} from './AlertSystemAnimations';

type AnimationInstance = ReturnType<typeof animateMetricsGridEntrance> | ReturnType<typeof animateOracleEye>;

interface UseOracleAnimationsReturn {
  // Grid Animations
  animateMetricsGrid: (elements: HTMLElement[], options?: OracleAnimationConfig) => AnimationInstance;
  animateMetricCard: (element: HTMLElement, options?: OracleAnimationConfig) => AnimationInstance;
  startMetricsPulse: (elements: HTMLElement[], options?: OracleAnimationConfig) => AnimationInstance;
  
  // Community Card Animations
  animateCommunityCards: (elements: HTMLElement[], options?: OracleAnimationConfig) => AnimationInstance;
  animateCardInteraction: (element: HTMLElement, options?: OracleAnimationConfig) => AnimationInstance;
  startCommunityWave: (elements: HTMLElement[], options?: OracleAnimationConfig) => AnimationInstance;
  
  // SVG Animations
  animateOracleEye: (element: SVGElement | string, state: 'awakening' | 'active' | 'corrupted' | 'sleeping', options?: SVGAnimationOptions) => AnimationInstance;
  createProgressBar: (container: HTMLElement, progress: number, options?: SVGAnimationOptions) => AnimationInstance;
  animateStatus: (element: string | SVGElement, status: 'online' | 'warning' | 'error' | 'processing', options?: SVGAnimationOptions) => AnimationInstance;
  
  // Alert System Animations
  animateAlert: (elements: HTMLElement[], options?: OracleAnimationConfig) => AnimationInstance;
  startPriorityPulse: (elements: HTMLElement[], options?: OracleAnimationConfig) => AnimationInstance;
  animateShimmer: (elements: HTMLElement[], options?: OracleAnimationConfig) => AnimationInstance;
  
  // Animation Control
  pauseAll: () => void;
  resumeAll: () => void;
  stopAll: () => void;
}

export const useOracleAnimations = (): UseOracleAnimationsReturn => {
  const controllerRef = useRef<OracleAnimationController>();
  const activeAnimationsRef = useRef<Map<string, AnimationInstance>>(new Map());

  useEffect(() => {
    controllerRef.current = new OracleAnimationController();
    
    return () => {
      // Cleanup all animations on unmount
      activeAnimationsRef.current.forEach(animation => {
        if (animation && typeof animation.pause === 'function') {
          animation.pause();
        }
      });
      activeAnimationsRef.current.clear();
    };
  }, []);

  const trackAnimation = useCallback((key: string, instance: AnimationInstance) => {
    if (instance) {
      activeAnimationsRef.current.set(key, instance);
    }
    return instance;
  }, []);

  // Grid Animations
  const animateMetricsGrid = useCallback((elements: HTMLElement[], options?: OracleAnimationConfig) => {
    return trackAnimation('metricsGrid', animateMetricsGridEntrance(elements, options));
  }, [trackAnimation]);

  const animateMetricCard = useCallback((element: HTMLElement, options?: OracleAnimationConfig) => {
    return trackAnimation('metricCard', animateMetricCardFocus(element, options));
  }, [trackAnimation]);

  const startMetricsPulse = useCallback((elements: HTMLElement[], options?: OracleAnimationConfig) => {
    return trackAnimation('metricsPulse', startMetricCardsPulse(elements, options));
  }, [trackAnimation]);

  // Community Card Animations
  const animateCommunityCards = useCallback((elements: HTMLElement[], options?: OracleAnimationConfig) => {
    return trackAnimation('communityCards', animateCommunityCardsEntrance(elements, options));
  }, [trackAnimation]);

  const animateCardInteraction = useCallback((element: HTMLElement, options?: OracleAnimationConfig) => {
    return trackAnimation('cardInteraction', animateCardHover(element, options));
  }, [trackAnimation]);

  const startCommunityWave = useCallback((elements: HTMLElement[], options?: OracleAnimationConfig) => {
    return trackAnimation('communityWave', animateCommunityWave(elements, options));
  }, [trackAnimation]);

  // SVG Animations
  const animateOracleEyeState = useCallback((element: SVGElement | string, state: 'awakening' | 'active' | 'corrupted' | 'sleeping', options?: SVGAnimationOptions) => {
    return trackAnimation('oracleEye', animateOracleEye(element, state, options));
  }, [trackAnimation]);

  const createProgressBar = useCallback((container: HTMLElement, progress: number, options?: SVGAnimationOptions) => {
    return trackAnimation('progressBar', createAnimatedProgressBar(container, progress, options));
  }, [trackAnimation]);

  const animateStatus = useCallback((element: string | SVGElement, status: 'online' | 'warning' | 'error' | 'processing', options?: SVGAnimationOptions) => {
    return trackAnimation('statusIndicator', animateStatusIndicators(element, status, options));
  }, [trackAnimation]);

  // Alert System Animations
  const animateAlert = useCallback((elements: HTMLElement[], options?: OracleAnimationConfig) => {
    return trackAnimation('alertEntrance', animateAlertEntrance(elements, options));
  }, [trackAnimation]);

  const startPriorityPulse = useCallback((elements: HTMLElement[], options?: OracleAnimationConfig) => {
    return trackAnimation('priorityPulse', animateHighPriorityPulse(elements, options));
  }, [trackAnimation]);

  const animateShimmer = useCallback((elements: HTMLElement[], options?: OracleAnimationConfig) => {
    return trackAnimation('alertShimmer', animateAlertShimmer(elements, options));
  }, [trackAnimation]);

  // Animation Control
  const pauseAll = useCallback(() => {
    activeAnimationsRef.current.forEach(animation => {
      if (animation && typeof animation.pause === 'function') {
        animation.pause();
      }
    });
  }, []);

  const resumeAll = useCallback(() => {
    activeAnimationsRef.current.forEach(animation => {
      if (animation && typeof animation.play === 'function') {
        animation.play();
      }
    });
  }, []);

  const stopAll = useCallback(() => {
    activeAnimationsRef.current.forEach(animation => {
      if (animation) {
        if (typeof animation.pause === 'function') {
          animation.pause();
        }
        if (typeof animation.seek === 'function') {
          animation.seek(0);
        }
      }
    });
    activeAnimationsRef.current.clear();
  }, []);

  return {
    // Grid Animations
    animateMetricsGrid,
    animateMetricCard,
    startMetricsPulse,
    
    // Community Card Animations
    animateCommunityCards,
    animateCardInteraction,
    startCommunityWave,
    
    // SVG Animations
    animateOracleEye: animateOracleEyeState,
    createProgressBar,
    animateStatus,
    
    // Alert System Animations
    animateAlert,
    startPriorityPulse,
    animateShimmer,
    
    // Animation Control
    pauseAll,
    resumeAll,
    stopAll
  };
}; 