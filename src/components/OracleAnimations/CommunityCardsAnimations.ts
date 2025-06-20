// 🏛️ Community Cards Grid Animations
// Staggered animations for the Community Nexus cards using anime.js

import { animate, createTimeline, stagger } from './anime';
import { GridAnimationOptions, ORACLE_ANIMATION_PRESETS, ORACLE_COLORS } from './index';

export interface CommunityCardsAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  from?: 'first' | 'last' | 'center' | number;
}

// ==== COMMUNITY CARDS ANIMATIONS ====
// Staggered animations for the community cards grid (2x2 layout)

interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  stagger?: number;
}

/**
 * Animates the entrance of Community Nexus cards (4-card grid)
 * Features: Staggered entrance from center, 3D rotation, scale effects
 */
export const animateCommunityCardsEntrance = (
  selector: string = '.community-nexus .community-card',
  options: GridAnimationOptions = {}
) => {
  const config = {
    ...ORACLE_ANIMATION_PRESETS.CINEMATIC,
    ...options
  };

  return createTimeline({
    easing: config.easing,
    complete: options.complete
  })
  .add({
    targets: selector,
    scale: [0.6, 1],
    opacity: [0, 1],
    translateY: [80, 0],
    rotateX: [45, 0],
    duration: config.duration,
    delay: stagger(config.stagger, {
      from: 'center',
      grid: [2, 2]
    }),
    begin: () => {
      // Add initial glow effect
      const cards = document.querySelectorAll(selector);
      cards.forEach((card, index) => {
        const colors = [ORACLE_COLORS.PRIMARY, ORACLE_COLORS.SECONDARY, ORACLE_COLORS.ACCENT, ORACLE_COLORS.MYSTICAL];
        (card as HTMLElement).style.boxShadow = `0 0 20px ${colors[index % colors.length]}30`;
      });
    }
  })
  .add({
    targets: `${selector} .card-icon`,
    rotateY: [180, 0],
    scale: [0, 1],
    duration: 600,
    delay: stagger(100),
    easing: 'easeOutElastic(1, .8)'
  }, '-=400')
  .add({
    targets: `${selector} .card-title`,
    translateX: [-50, 0],
    opacity: [0, 1],
    duration: 400,
    delay: stagger(80),
    easing: 'easeOutExpo'
  }, '-=300');
};

/**
 * Enhanced hover animation for community cards
 */
export const animateCardHover = (
  cardElement: HTMLElement,
  cardType: 'showcase' | 'referendum' | 'leaderboards' | 'feed' = 'showcase',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 400,
    easing: 'easeOutQuart',
    ...options
  };

  const cardColors = {
    showcase: ORACLE_COLORS.PRIMARY,
    referendum: ORACLE_COLORS.SECONDARY,
    leaderboards: ORACLE_COLORS.ACCENT,
    feed: ORACLE_COLORS.MYSTICAL
  };

  return createTimeline()
    .add({
      targets: cardElement,
      scale: [1, 1.08],
      translateY: [0, -12],
      rotateY: [0, 3],
      duration: config.duration,
      easing: config.easing,
      begin: () => {
        cardElement.style.boxShadow = `
          0 25px 50px ${cardColors[cardType]}40,
          0 0 30px ${cardColors[cardType]}20,
          inset 0 1px 0 ${cardColors[cardType]}30
        `;
        cardElement.style.zIndex = '20';
      }
    })
    .add({
      targets: cardElement.querySelector('.card-icon'),
      rotateZ: [0, 15],
      scale: [1, 1.2],
      duration: 300,
      easing: 'easeOutBack'
    }, '-=200')
    .add({
      targets: cardElement.querySelector('.card-gradient'),
      opacity: [0.7, 1],
      duration: 200
    }, '-=300');
};

/**
 * Return animation for community cards
 */
export const animateCardLeave = (
  cardElement: HTMLElement,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 300,
    easing: 'easeOutCubic',
    ...options
  };

  return animate({
    targets: cardElement,
    scale: [1.08, 1],
    translateY: [-12, 0],
    rotateY: [3, 0],
    duration: config.duration,
    easing: config.easing,
    complete: () => {
      cardElement.style.boxShadow = '';
      cardElement.style.zIndex = '';
    }
  });
};

/**
 * Click animation with ripple effect for community cards
 */
export const animateCardClick = (
  cardElement: HTMLElement,
  clickEvent: MouseEvent,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 500,
    easing: 'easeOutCirc',
    ...options
  };

  const rect = cardElement.getBoundingClientRect();
  const x = clickEvent.clientX - rect.left;
  const y = clickEvent.clientY - rect.top;

  // Create ripple element
  const ripple = document.createElement('div');
  ripple.className = 'card-click-ripple';
  ripple.style.position = 'absolute';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '0';
  ripple.style.height = '0';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = `${ORACLE_COLORS.GLOW}60`;
  ripple.style.transform = 'translate(-50%, -50%)';
  ripple.style.pointerEvents = 'none';
  
  cardElement.appendChild(ripple);

  return createTimeline()
    .add({
      targets: cardElement,
      scale: [1.08, 0.95, 1],
      duration: config.duration,
      easing: 'easeOutElastic(1, .6)'
    })
    .add({
      targets: ripple,
      width: '300px',
      height: '300px',
      opacity: [0.6, 0],
      duration: config.duration,
      easing: config.easing,
      complete: () => {
        ripple.remove();
      }
    }, '-=400');
};

/**
 * Animates card icons with rotation and scale
 */
export const animateCardIcons = (
  selector: string = '.community-card .card-icon',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 800,
    easing: 'easeInOutSine',
    ...options
  };

  return animate({
    targets: selector,
    rotateY: [0, 360],
    scale: [1, 1.1, 1],
    duration: config.duration,
    delay: stagger(200),
    easing: config.easing,
    loop: config.loop || false
  });
};

/**
 * Creates a wave effect across community cards
 */
export const animateCommunityWave = (
  selector: string = '.community-nexus .community-card',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 700,
    easing: 'easeInOutSine',
    ...options
  };

  return animate({
    targets: selector,
    translateY: [0, -25, 0],
    rotateZ: [0, 2, -2, 0],
    scale: [1, 1.03, 1],
    duration: config.duration,
    delay: stagger(150, {
      from: 'first',
      grid: [2, 2]
    }),
    easing: config.easing
  });
};

/**
 * Special pulsing animation for Oracle's Referendum card
 */
export const animateReferendumCardPulse = (
  cardElement: HTMLElement,
  intensity: 'low' | 'medium' | 'high' = 'medium',
  options: GridAnimationOptions = {}
) => {
  const intensityConfig = {
    low: { scale: 1.01, glow: 10 },
    medium: { scale: 1.03, glow: 20 },
    high: { scale: 1.05, glow: 30 }
  };

  const config = {
    ...ORACLE_ANIMATION_PRESETS.PULSE,
    ...options
  };

  return animate({
    targets: cardElement,
    scale: [1, intensityConfig[intensity].scale],
    duration: config.duration,
    easing: config.easing,
    direction: 'alternate',
    loop: true,
    update: (anim) => {
      const progress = anim.progress / 100;
      const glowIntensity = intensityConfig[intensity].glow * Math.sin(progress * Math.PI);
      cardElement.style.boxShadow = `
        0 0 ${glowIntensity}px ${ORACLE_COLORS.SECONDARY}60,
        0 0 ${glowIntensity * 2}px ${ORACLE_COLORS.SECONDARY}30
      `;
    }
  });
};

/**
 * Animates gradient buttons with shimmer effect
 */
export const animateGradientButtons = (
  selector: string = '.community-card .gradient-button',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 1500,
    easing: 'linear',
    loop: true,
    ...options
  };

  return animate({
    targets: selector,
    backgroundPosition: ['0% 50%', '100% 50%'],
    duration: config.duration,
    easing: config.easing,
    loop: config.loop,
    delay: stagger(300)
  });
};

/**
 * Exit animation for modal transitions
 */
export const animateCardModalExit = (
  cardElement: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 400,
    easing: 'easeInBack',
    ...options
  };

  const directions = {
    up: { translateY: -100, rotateX: -45 },
    down: { translateY: 100, rotateX: 45 },
    left: { translateX: -100, rotateY: -45 },
    right: { translateX: 100, rotateY: 45 }
  };

  return animate({
    targets: cardElement,
    ...directions[direction],
    scale: [1, 0.8],
    opacity: [1, 0],
    duration: config.duration,
    easing: config.easing
  });
};

/**
 * Return animation for modal close
 */
export const animateCardModalReturn = (
  cardElement: HTMLElement,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 600,
    easing: 'easeOutElastic(1, .8)',
    ...options
  };

  const directions = {
    up: { translateY: [-100, 0], rotateX: [-45, 0] },
    down: { translateY: [100, 0], rotateX: [45, 0] },
    left: { translateX: [-100, 0], rotateY: [-45, 0] },
    right: { translateX: [100, 0], rotateY: [45, 0] }
  };

  return animate({
    targets: cardElement,
    ...directions[direction],
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: config.duration,
    easing: config.easing
  });
};

/**
 * Floating animation for community cards
 */
export const startCommunityCardsFloat = (
  selector: string = '.community-card',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 3000,
    easing: 'easeInOutSine',
    ...options
  };

  return animate({
    targets: selector,
    translateY: [0, -8, 0],
    rotateZ: [0, 1, -1, 0],
    duration: config.duration,
    delay: stagger(500),
    easing: config.easing,
    loop: true
  });
};

/**
 * Magnetic attraction effect between cards
 */
export const animateCardsAttraction = (
  cardElements: HTMLElement[],
  centerPoint: { x: number, y: number },
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 800,
    easing: 'easeOutElastic(1, .6)',
    ...options
  };

  return animate({
    targets: cardElements,
    translateX: (el, i) => {
      const rect = el.getBoundingClientRect();
      const cardCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const dx = centerPoint.x - cardCenter.x;
      return dx * 0.1; // Subtle attraction
    },
    translateY: (el, i) => {
      const rect = el.getBoundingClientRect();
      const cardCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const dy = centerPoint.y - cardCenter.y;
      return dy * 0.1; // Subtle attraction
    },
    scale: [1, 1.02, 1],
    duration: config.duration,
    easing: config.easing,
    delay: stagger(100)
  });
}; 