// 🔮 Oracle Metrics Grid Animations
// Staggered animations for the 4-card metrics grid using anime.js

import { animate, createTimeline, stagger } from './anime';
import { GridAnimationOptions, ORACLE_ANIMATION_PRESETS, ORACLE_COLORS } from './index';
import { AnimationInstance } from './types';

interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  stagger?: number;
}

/**
 * 🌟 STAGGERED GRID ENTRANCE
 * Animates the 4 metric cards with beautiful staggered entrance
 */
export const animateMetricsGridEntrance = (
  selector: string = '.oracle-metrics-grid .metric-card',
  options: GridAnimationOptions = {}
) => {
  const config = {
    ...ORACLE_ANIMATION_PRESETS.ENTRANCE,
    ...options
  };

  return createTimeline({
    easing: config.easing,
    complete: options.complete
  })
  .add({
    targets: selector,
    keyframes: [
      {
        scale: 0.8,
        opacity: 0,
        translateY: 60,
        rotateY: -15
      },
      {
        scale: 1,
        opacity: 1,
        translateY: 0,
        rotateY: 0
      }
    ],
    duration: config.duration,
    delay: stagger(config.stagger, {
      grid: [2, 2], // 2x2 grid
      from: 'center'
    }),
    begin: () => {
      // Add glow effect during animation
      const cards = document.querySelectorAll(selector);
      cards.forEach(card => {
        (card as HTMLElement).style.boxShadow = `0 0 30px ${ORACLE_COLORS.PRIMARY}40`;
      });
    }
  })
  .add({
    targets: `${selector} .metric-value`,
    keyframes: [
      {
        opacity: 0,
        scale: 0.5
      },
      {
        opacity: 1,
        scale: 1
      }
    ],
    duration: 400,
    delay: stagger(50),
    easing: 'easeOutBack'
  }, '-=200');
};

/**
 * ⚡ METRIC CARD FOCUS ANIMATION
 * When a metric card is clicked/expanded
 */
export const animateMetricCardFocus = (
  cardElement: HTMLElement,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 500,
    easing: 'easeOutElastic(1, .6)',
    ...options
  };

  return createTimeline()
    .add({
      targets: cardElement,
      keyframes: [
        {
          scale: 1,
          rotateY: 0,
          translateZ: 0
        },
        {
          scale: 1.05,
          rotateY: 5,
          translateZ: 50
        }
      ],
      duration: config.duration,
      easing: config.easing,
      begin: () => {
        cardElement.style.boxShadow = `0 20px 60px ${ORACLE_COLORS.PRIMARY}60, 0 0 40px ${ORACLE_COLORS.ACCENT}30`;
        cardElement.style.zIndex = '10';
      }
    })
    .add({
      targets: cardElement.querySelector('.metric-icon'),
      keyframes: [
        {
          rotateZ: 0,
          scale: 1
        },
        {
          rotateZ: 360,
          scale: 1.2
        }
      ],
      duration: 400,
      easing: 'easeOutBack'
    }, '-=300')
    .add({
      targets: cardElement.querySelector('.metric-value'),
      keyframes: [
        {
          color: ORACLE_COLORS.PRIMARY,
          textShadow: 'none'
        },
        {
          color: ORACLE_COLORS.ACCENT,
          textShadow: `0 0 20px ${ORACLE_COLORS.ACCENT}`
        }
      ],
      duration: 300
    }, '-=200');
};

/**
 * Animates metric card return to normal state
 */
export const animateMetricCardBlur = (
  cardElement: HTMLElement,
  options: GridAnimationOptions = {}
): AnimationInstance => {
  const config = {
    duration: 300,
    easing: 'easeOutCubic',
    ...options
  };

  return animate({
    targets: cardElement,
    scale: [
      { value: 1.05 },
      { 
        value: 1,
        duration: config.duration,
        easing: config.easing
      }
    ]
  }) as AnimationInstance;
};

/**
 * 📊 METRIC BAR FILL ANIMATION
 * Animates the progress bars with staggered timing
 */
export const animateMetricBars = (
  selector: string | Element | Element[],
  options: GridAnimationOptions = {}
): AnimationInstance => {
  const config = {
    duration: 1000,
    easing: 'easeOutExpo',
    ...options
  };

  return animate({
    targets: selector,
    width: [
      { value: '0%' },
      { 
        value: (el: Element) => {
          const target = el.getAttribute('data-target') || '100';
          return `${target}%`;
        },
        duration: config.duration,
        easing: config.easing
      }
    ],
    opacity: [
      { value: 0 },
      { 
        value: 1,
        duration: config.duration / 2
      }
    ],
    delay: stagger(config.stagger || 100)
  }) as AnimationInstance;
};

/**
 * 🎯 EXPANSION PANEL ANIMATION
 * Smooth expansion of metric details
 */
export const animateExpansionPanel = (
  panelElement: HTMLElement,
  expand: boolean = true,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 500,
    easing: 'easeOutExpo',
    ...options
  };

  if (expand) {
    return createTimeline()
      .add({
        targets: panelElement,
        height: [0, 'auto'],
        opacity: [0, 1],
        duration: config.duration,
        easing: config.easing,
        begin: () => {
          panelElement.style.display = 'block';
        }
      })
      .add({
        targets: panelElement.querySelectorAll('.expansion-content > *'),
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 300,
        delay: stagger(50),
        easing: 'easeOutBack'
      }, '-=200');
  } else {
    return animate({
      targets: panelElement,
      height: [panelElement.scrollHeight, 0],
      opacity: [1, 0],
      duration: config.duration,
      easing: config.easing,
      complete: () => {
        panelElement.style.display = 'none';
      }
    });
  }
};

/**
 * 💫 METRIC CARDS PULSE EFFECT
 * Continuous subtle pulse for live data indicators
 */
export const startMetricCardsPulse = (
  selector: string | Element | Element[],
  options: GridAnimationOptions = {}
): AnimationInstance => {
  const config = {
    duration: 2000,
    easing: 'easeInOutSine',
    ...options
  };

  return animate({
    targets: selector,
    scale: [
      { value: 1 },
      { 
        value: 1.02,
        duration: config.duration,
        easing: config.easing
      }
    ],
    opacity: [
      { value: 0.95 },
      { 
        value: 1,
        duration: config.duration,
        easing: config.easing
      }
    ],
    delay: stagger(config.stagger || 200),
    loop: true,
    direction: 'alternate'
  }) as AnimationInstance;
};

/**
 * 🌊 METRICS WAVE ANIMATION
 * Creates a wave effect across all metric cards
 */
export const animateMetricsWave = (
  selector: string = '.oracle-metrics-grid .metric-card',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 600,
    easing: 'easeInOutSine',
    ...options
  };

  return animate({
    targets: selector,
    translateY: [0, -20, 0],
    scale: [1, 1.02, 1],
    duration: config.duration,
    easing: config.easing,
    delay: stagger(100, {
      grid: [2, 2],
      from: 'first'
    })
  });
};

/**
 * 🎯 STATUS BADGE MORPHING
 * Smooth transitions between different status states
 */
export const animateStatusBadgeChange = (
  badgeElement: HTMLElement,
  newStatus: 'active' | 'warning' | 'error' | 'success',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 400,
    easing: 'easeOutBack',
    ...options
  };

  const statusColors = {
    active: ORACLE_COLORS.PRIMARY,
    warning: ORACLE_COLORS.WARNING,
    error: ORACLE_COLORS.CORRUPTION,
    success: ORACLE_COLORS.SUCCESS
  };

  return createTimeline()
    .add({
      targets: badgeElement,
      scale: [1, 0.8],
      rotateZ: [0, 180],
      duration: config.duration / 2,
      easing: config.easing
    })
    .add({
      targets: badgeElement,
      scale: [0.8, 1],
      rotateZ: [180, 360],
      backgroundColor: statusColors[newStatus],
      duration: config.duration / 2,
      easing: config.easing,
      begin: () => {
        badgeElement.style.boxShadow = `0 0 20px ${statusColors[newStatus]}60`;
      }
    });
};

/**
 * Creates a ripple effect on metric card click
 */
export const createMetricCardRipple = (
  cardElement: HTMLElement,
  clickX: number,
  clickY: number,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 600,
    easing: 'easeOutCirc',
    ...options
  };

  const ripple = document.createElement('div');
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = `${ORACLE_COLORS.ACCENT}40`;
  ripple.style.left = `${clickX}px`;
  ripple.style.top = `${clickY}px`;
  ripple.style.width = '0px';
  ripple.style.height = '0px';
  ripple.style.transform = 'translate(-50%, -50%)';
  ripple.style.pointerEvents = 'none';

  cardElement.appendChild(ripple);

  return animate({
    targets: ripple,
    width: '200px',
    height: '200px',
    opacity: [0.6, 0],
    duration: config.duration,
    easing: config.easing,
    complete: () => {
      ripple.remove();
    }
  });
}; 