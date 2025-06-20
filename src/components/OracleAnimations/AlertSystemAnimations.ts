// 🚨 Alert System Animations
// Staggered animations for SmartAlertsBar using anime.js

import { animate, createTimeline, stagger } from './anime';
import { GridAnimationOptions, ORACLE_ANIMATION_PRESETS, ORACLE_COLORS } from './index';

export interface AlertAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  staggerDelay?: number;
  loop?: boolean | number;
}

/**
 * 🌟 ALERT ENTRANCE ANIMATION
 * Staggered entrance for new alerts sliding in from the right
 */
export const animateAlertEntrance = (
  selector: string = '.smart-alert',
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
        translateX: 300,
        opacity: 0,
        scale: 0.8,
        rotateY: 45
      },
      {
        translateX: 0,
        opacity: 1,
        scale: 1,
        rotateY: 0
      }
    ],
    duration: config.duration,
    delay: stagger(config.stagger, {
      from: 'last'
    }),
    begin: () => {
      // Add glow effect during entrance
      const alerts = document.querySelectorAll(selector);
      alerts.forEach((alert, index) => {
        const alertType = alert.getAttribute('data-alert-type') || 'info';
        const color = getAlertColor(alertType);
        (alert as HTMLElement).style.boxShadow = `0 0 15px ${color}30`;
      });
    }
  })
  .add({
    targets: `${selector} .alert-icon`,
    keyframes: [
      {
        rotateZ: 180,
        scale: 0
      },
      {
        rotateZ: 0,
        scale: 1
      }
    ],
    duration: 400,
    delay: stagger(50),
    easing: 'easeOutBack'
  }, '-=300')
  .add({
    targets: `${selector} .alert-text`,
    keyframes: [
      {
        translateX: -20,
        opacity: 0
      },
      {
        translateX: 0,
        opacity: 1
      }
    ],
    duration: 300,
    delay: stagger(40),
    easing: 'easeOutExpo'
  }, '-=200');
};

/**
 * 🌊 ALERT EXIT ANIMATION
 * Smooth exit animation when alerts are dismissed
 */
export const animateAlertExit = (
  alertElement: HTMLElement,
  direction: 'right' | 'left' | 'up' | 'fade' = 'right',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 400,
    easing: 'easeInBack',
    ...options
  };

  const directions = {
    right: { translateX: 300, rotateY: -45 },
    left: { translateX: -300, rotateY: 45 },
    up: { translateY: -100, rotateX: -45 },
    fade: { scale: 0.8 }
  };

  const directionValues = directions[direction];

  return animate({
    targets: alertElement,
    keyframes: [
      {
        opacity: 1,
        scale: 1,
        ...directionValues
      },
      {
        opacity: 0,
        scale: 0.9,
        ...directionValues
      }
    ],
    duration: config.duration,
    easing: config.easing,
    complete: () => {
      alertElement.remove();
    }
  });
};

/**
 * ✨ ALERT SHIMMER EFFECT
 * Subtle shimmer animation for alert cards
 */
export const animateAlertShimmer = (
  selector: string | Element | Element[],
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 2000,
    easing: 'easeInOutSine',
    ...options
  };

  return animate({
    targets: selector,
    background: {
      value: [
        'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
        'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)'
      ],
      duration: config.duration,
      easing: config.easing
    },
    backgroundPosition: {
      value: ['200% 0', '-200% 0'],
      duration: config.duration,
      easing: config.easing
    },
    loop: true
  });
};

/**
 * 🎯 ALERT CLICK ANIMATION
 * When an alert is clicked/activated
 */
export const animateAlertClick = (
  alertElement: HTMLElement,
  clickEvent: MouseEvent,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 300,
    easing: 'easeOutBack',
    ...options
  };

  const rect = alertElement.getBoundingClientRect();
  const x = clickEvent.clientX - rect.left;
  const y = clickEvent.clientY - rect.top;

  // Create ripple effect
  const ripple = document.createElement('div');
  ripple.className = 'alert-click-ripple';
  ripple.style.position = 'absolute';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '0';
  ripple.style.height = '0';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = `${ORACLE_COLORS.GLOW}40`;
  ripple.style.transform = 'translate(-50%, -50%)';
  ripple.style.pointerEvents = 'none';
  ripple.style.zIndex = '10';
  
  alertElement.appendChild(ripple);

  return createTimeline()
    .add({
      targets: alertElement,
      keyframes: [
        { scale: 1 },
        { scale: 0.98 },
        { scale: 1.02 },
        { scale: 1 }
      ],
      duration: config.duration,
      easing: config.easing
    })
    .add({
      targets: ripple,
      keyframes: [
        {
          width: '0px',
          height: '0px',
          opacity: 0.6
        },
        {
          width: '100px',
          height: '100px',
          opacity: 0
        }
      ],
      duration: config.duration,
      easing: 'easeOutCirc',
      complete: () => {
        ripple.remove();
      }
    }, '-=200');
};

/**
 * 🔄 ALERT QUEUE REORDER ANIMATION
 * When alerts shift positions in the queue
 */
export const animateAlertReorder = (
  alertElements: HTMLElement[],
  newOrder: number[],
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 500,
    easing: 'easeInOutQuart',
    ...options
  };

  const animations = alertElements.map((element, index) => {
    const newIndex = newOrder[index];
    const currentTop = element.offsetTop;
    const newTop = newIndex * element.offsetHeight;
    const deltaY = newTop - currentTop;

    return animate({
      targets: element,
      translateY: [0, deltaY, 0],
      duration: config.duration,
      easing: config.easing,
      delay: Math.abs(newIndex - index) * 50
    });
  });

  return Promise.all(animations);
};

/**
 * 🎨 ALERT TYPE TRANSITIONS
 * Smooth color transitions when alert types change
 */
export const animateAlertTypeChange = (
  alertElement: HTMLElement,
  newType: 'info' | 'warning' | 'error' | 'success' | 'prophecy',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 400,
    easing: 'easeOutQuart',
    ...options
  };

  const typeColors = {
    info: ORACLE_COLORS.PRIMARY,
    warning: ORACLE_COLORS.WARNING,
    error: ORACLE_COLORS.CORRUPTION,
    success: ORACLE_COLORS.SUCCESS,
    prophecy: ORACLE_COLORS.MYSTICAL
  };

  return createTimeline()
    .add({
      targets: alertElement,
      scale: [1, 0.95],
      rotateZ: [0, -2],
      duration: config.duration / 2,
      easing: config.easing
    })
    .add({
      targets: alertElement,
      scale: [0.95, 1],
      rotateZ: [-2, 0],
      backgroundColor: typeColors[newType],
      borderColor: typeColors[newType],
      duration: config.duration / 2,
      easing: config.easing,
      begin: () => {
        alertElement.setAttribute('data-alert-type', newType);
        alertElement.style.boxShadow = `0 0 15px ${typeColors[newType]}40`;
      }
    });
};

/**
 * ⚡ HIGH PRIORITY PULSE ANIMATION
 * Pulsing effect for high priority alerts
 */
export const animateHighPriorityPulse = (
  alertElement: HTMLElement | string,
  intensity: 'medium' | 'high' | 'critical' = 'high',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 1000,
    easing: 'easeInOutSine',
    ...options
  };

  const intensityConfigs = {
    medium: { scale: 1.02, glow: 15 },
    high: { scale: 1.05, glow: 25 },
    critical: { scale: 1.08, glow: 35 }
  };

  const currentIntensity = intensityConfigs[intensity];

  return animate({
    targets: alertElement,
    scale: {
      value: [1, currentIntensity.scale],
      duration: config.duration,
      easing: config.easing
    },
    boxShadow: {
      value: [
        '0 0 0px rgba(255, 0, 0, 0)',
        `0 0 ${currentIntensity.glow}px rgba(255, 0, 0, 0.6)`
      ],
      duration: config.duration,
      easing: config.easing
    },
    loop: true,
    direction: 'alternate'
  });
};

/**
 * 🔢 COUNTER UPDATE ANIMATION
 * Animates the remaining alerts counter
 */
export const animateCounterUpdate = (counterElement: HTMLElement, newCount: number) => {
  return createTimeline()
    .add({
      targets: counterElement,
      scale: [1, 1.3],
      rotateY: [0, 180],
      duration: 200,
      easing: 'easeOutQuad'
    })
    .add({
      targets: counterElement,
      scale: [1.3, 1],
      rotateY: [180, 360],
      duration: 200,
      easing: 'easeOutQuad',
      begin: () => {
        counterElement.textContent = `+${newCount}`;
      }
    });
};

/**
 * 🌈 ALERT ICON ANIMATIONS
 * Animate the icons within alerts
 */
export const animateAlertIcon = (
  iconSelector: string,
  type: 'spin' | 'bounce' | 'pulse' | 'glow' = 'pulse',
  config: AlertAnimationOptions = {}
) => {
  const {
    duration = 1000,
    loop = true
  } = config;

  const icons = document.querySelectorAll(iconSelector);
  
  if (!icons.length) return;

  const animations = {
    spin: {
      rotate: '360deg',
      duration,
      easing: 'linear',
      loop
    },
    bounce: {
      translateY: [0, -5, 0],
      scale: [1, 1.1, 1],
      duration,
      easing: 'easeInOutSine',
      loop
    },
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      duration,
      easing: 'easeInOutSine',
      loop
    },
    glow: {
      textShadow: [
        '0 0 5px currentColor',
        '0 0 15px currentColor',
        '0 0 5px currentColor'
      ],
      duration,
      easing: 'easeInOutSine',
      loop
    }
  };

  return animate({
    targets: icons,
    ...animations[type]
  });
};

/**
 * 🎭 ALERT AUTO-SCROLL ENHANCEMENT
 * Enhanced scroll animation for the alerts bar
 */
export const animateAlertScroll = (
  containerElement: HTMLElement,
  direction: 'up' | 'down' = 'up',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 500,
    easing: 'easeOutQuart',
    ...options
  };

  const scrollAmount = direction === 'up' ? -100 : 100;

  return animate({
    targets: containerElement,
    scrollTop: `+=${scrollAmount}`,
    duration: config.duration,
    easing: config.easing
  });
};

/**
 * 🌟 ALERT BATCH OPERATIONS
 * Animate multiple alerts at once
 */
export const animateAlertBatch = {
  /**
   * Clear all alerts with staggered exit
   */
  clearAll: (alerts: NodeListOf<Element> | Element[]) => {
    return animate({
      targets: alerts,
      opacity: [1, 0],
      translateY: [0, -50],
      scale: [1, 0.8],
      duration: 300,
      delay: stagger(50, {from: 'last'}),
      easing: 'easeInCubic'
    });
  },

  /**
   * Refresh all alerts with wave effect
   */
  refresh: (alerts: NodeListOf<Element> | Element[]) => {
    return animate({
      targets: alerts,
      scale: [1, 1.05, 1],
      rotateY: [0, 10, 0],
      duration: 400,
      delay: stagger(100),
      easing: 'easeOutBack'
    });
  },

  /**
   * Highlight all alerts of a specific type
   */
  highlightType: (alerts: NodeListOf<Element> | Element[], alertType: string) => {
    const matchingAlerts = Array.from(alerts).filter(alert => 
      alert.classList.contains(`alert-${alertType}`)
    );
    
    return animate({
      targets: matchingAlerts,
      boxShadow: [
        '0 0 0 rgba(107, 70, 193, 0)',
        '0 0 20px rgba(107, 70, 193, 0.5)',
        '0 0 0 rgba(107, 70, 193, 0)'
      ],
      scale: [1, 1.02, 1],
      duration: 1000,
      easing: 'easeInOutSine'
    });
  }
};

/**
 * Alert container breathing animation when active
 */
export const animateAlertContainerBreathing = (
  containerSelector: string = '.smart-alerts-bar',
  config: AlertAnimationOptions = {}
) => {
  const {
    duration = 3000
  } = config;

  const container = document.querySelector(containerSelector);
  if (!container) return;

  return animate({
    targets: container,
    scale: [1, 1.01, 1],
    boxShadow: [
      '0 4px 20px rgba(0,0,0,0.1)',
      '0 8px 30px rgba(59, 130, 246, 0.2)',
      '0 4px 20px rgba(0,0,0,0.1)'
    ],
    duration,
    easing: 'easeInOutSine',
    loop: true
  });
};

/**
 * Alert highlight animation when navigated to
 */
export const animateAlertHighlight = (
  alertElements: HTMLElement[],
  highlightColor: string = ORACLE_COLORS.ACCENT,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 800,
    easing: 'easeInOutSine',
    ...options
  };

  return animate({
    targets: alertElements,
    backgroundColor: [null, `${highlightColor}20`, null],
    borderColor: [null, highlightColor, null],
    scale: [1, 1.02, 1],
    duration: config.duration,
    easing: config.easing,
    delay: stagger(100)
  });
};

/**
 * Alert refresh/reload animation
 */
export const animateAlertsRefresh = (
  containerSelector: string = '.smart-alerts-container',
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 600,
    easing: 'easeOutElastic(1, .8)',
    ...options
  };

  const container = document.querySelector(containerSelector);
  if (!container) return;

  return createTimeline()
    .add({
      targets: container,
      rotateY: [0, 180],
      scale: [1, 0.8],
      duration: config.duration / 2,
      easing: 'easeInQuart'
    })
    .add({
      targets: container,
      rotateY: [180, 360],
      scale: [0.8, 1],
      duration: config.duration / 2,
      easing: config.easing,
      complete: () => {
        // Trigger refresh logic here
        if (options.complete) {
          options.complete();
        }
      }
    });
};

/**
 * Alert expansion animation for detailed view
 */
export const animateAlertExpansion = (
  alertElement: HTMLElement,
  expand: boolean = true,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 400,
    easing: 'easeOutQuart',
    ...options
  };

  if (expand) {
    const detailsElement = alertElement.querySelector('.alert-details');
    if (!detailsElement) return;

    return createTimeline()
      .add({
        targets: alertElement,
        height: [alertElement.offsetHeight, 'auto'],
        duration: config.duration,
        easing: config.easing
      })
      .add({
        targets: detailsElement,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: config.duration * 0.7,
        easing: 'easeOutBack'
      }, '-=200');
  } else {
    return animate({
      targets: alertElement,
      height: [alertElement.offsetHeight, alertElement.querySelector('.alert-header')?.offsetHeight || 60],
      duration: config.duration,
      easing: config.easing,
      complete: () => {
        const detailsElement = alertElement.querySelector('.alert-details');
        if (detailsElement) {
          (detailsElement as HTMLElement).style.opacity = '0';
        }
      }
    });
  }
};

/**
 * Helper function to get alert color by type
 */
function getAlertColor(alertType: string): string {
  const colorMap: { [key: string]: string } = {
    info: ORACLE_COLORS.PRIMARY,
    warning: ORACLE_COLORS.WARNING,
    error: ORACLE_COLORS.CORRUPTION,
    success: ORACLE_COLORS.SUCCESS,
    prophecy: ORACLE_COLORS.MYSTICAL
  };
  
  return colorMap[alertType] || ORACLE_COLORS.PRIMARY;
}

/**
 * Alert notification badge animation
 */
export const animateNotificationBadge = (
  badgeElement: HTMLElement,
  count: number,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 500,
    easing: 'easeOutElastic(1, .6)',
    ...options
  };

  return createTimeline()
    .add({
      targets: badgeElement,
      scale: [0, 1.2, 1],
      opacity: [0, 1],
      duration: config.duration,
      easing: config.easing,
      begin: () => {
        badgeElement.textContent = count.toString();
        badgeElement.style.display = count > 0 ? 'flex' : 'none';
      }
    })
    .add({
      targets: badgeElement,
      rotateZ: [0, 10, -10, 0],
      duration: 200,
      easing: 'easeOutBack'
    }, '-=100');
};

/**
 * Creates a floating alert animation
 */
export const createFloatingAlert = (
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info',
  container: HTMLElement,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 3000,
    easing: 'easeOutQuart',
    ...options
  };

  // Create floating alert element
  const floatingAlert = document.createElement('div');
  floatingAlert.className = 'floating-alert';
  floatingAlert.style.position = 'fixed';
  floatingAlert.style.top = '20px';
  floatingAlert.style.right = '20px';
  floatingAlert.style.padding = '12px 20px';
  floatingAlert.style.borderRadius = '8px';
  floatingAlert.style.color = 'white';
  floatingAlert.style.fontSize = '14px';
  floatingAlert.style.fontWeight = 'bold';
  floatingAlert.style.zIndex = '9999';
  floatingAlert.style.pointerEvents = 'none';
  floatingAlert.textContent = message;

  const alertColor = getAlertColor(type);
  floatingAlert.style.backgroundColor = alertColor;
  floatingAlert.style.boxShadow = `0 4px 20px ${alertColor}40`;

  container.appendChild(floatingAlert);

  return createTimeline()
    .add({
      targets: floatingAlert,
      translateX: [300, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 400,
      easing: 'easeOutBack'
    })
    .add({
      targets: floatingAlert,
      translateY: [0, -10, 0],
      duration: 2000,
      easing: 'easeInOutSine'
    }, '-=200')
    .add({
      targets: floatingAlert,
      translateX: [0, 300],
      opacity: [1, 0],
      scale: [1, 0.8],
      duration: 400,
      easing: 'easeInBack',
      complete: () => {
        floatingAlert.remove();
      }
    });
}; 