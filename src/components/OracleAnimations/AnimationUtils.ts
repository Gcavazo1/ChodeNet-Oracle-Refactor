// AnimationUtils.ts - Utility functions and helpers for Oracle animations
import { animate, createTimeline, stagger } from './anime';
import { GridAnimationOptions, ORACLE_ANIMATION_PRESETS, ORACLE_COLORS } from './index';

/**
 * Creates a staggered animation timeline
 */
export const createStaggeredTimeline = (
  targets: string | Element | Element[],
  animations: any[],
  staggerDelay: number = 100,
  options: GridAnimationOptions = {}
) => {
  const config = {
    ...ORACLE_ANIMATION_PRESETS.ENTRANCE,
    ...options
  };

  const timeline = createTimeline({
    easing: config.easing,
    onComplete: options.complete
  });

  animations.forEach((animation, index) => {
    const delay = typeof staggerDelay === 'number' ? stagger(staggerDelay) : staggerDelay;
    
    timeline.add({
      targets,
      ...animation,
      delay,
      duration: animation.duration || config.duration
    }, index === 0 ? 0 : `-=${animation.offset || 200}`);
  });

  return timeline;
};

/**
 * Creates a magnetic hover effect for elements
 */
export const createMagneticEffect = (
  element: HTMLElement,
  intensity: number = 0.3,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 400,
    easing: 'easeOutQuart',
    ...options
  };

  let isHovering = false;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isHovering) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * intensity;
    const deltaY = (e.clientY - centerY) * intensity;

    animate({
      targets: element,
      translateX: { value: deltaX },
      translateY: { value: deltaY },
      duration: config.duration,
      easing: config.easing
    });
  };

  const handleMouseEnter = () => {
    isHovering = true;
    animate({
      targets: element,
      scale: { value: 1.02 },
      duration: config.duration,
      easing: config.easing
    });
  };

  const handleMouseLeave = () => {
    isHovering = false;
    animate({
      targets: element,
      translateX: { value: 0 },
      translateY: { value: 0 },
      scale: { value: 1 },
      duration: config.duration,
      easing: config.easing
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Creates a parallax scrolling effect
 */
export const createParallaxEffect = (
  elements: { element: HTMLElement; speed: number }[],
  options: GridAnimationOptions = {}
) => {
  let ticking = false;

  const updateParallax = () => {
    const scrollTop = window.pageYOffset;

    elements.forEach(({ element, speed }) => {
      const yPos = -(scrollTop * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });

    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll);

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Creates a breathing/pulse animation
 */
export const createBreathingEffect = (
  element: HTMLElement,
  intensity: number = 0.05,
  speed: number = 2000,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: speed,
    easing: 'easeInOutSine',
    loop: true,
    direction: 'alternate',
    ...options
  };

  return animate({
    targets: element,
    scale: { 
      value: [1, 1 + intensity],
      duration: config.duration,
      easing: config.easing
    },
    opacity: { 
      value: [0.8, 1],
      duration: config.duration,
      easing: config.easing
    },
    loop: config.loop,
    direction: config.direction
  });
};

/**
 * Creates a typewriter text animation
 */
export const createTypewriterEffect = (
  element: HTMLElement,
  text: string,
  speed: number = 50,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: speed,
    ...options
  };

  element.textContent = '';
  
  return new Promise<void>((resolve) => {
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
        if (options.complete) options.complete();
        resolve();
      }
    }, config.duration);
  });
};

/**
 * Creates a glitch effect animation
 */
export const createGlitchEffect = (
  element: HTMLElement,
  intensity: 'low' | 'medium' | 'high' = 'medium',
  options: GridAnimationOptions = {}
) => {
  const intensityConfigs = {
    low: { offset: 2, duration: 100, frequency: 2000 },
    medium: { offset: 5, duration: 150, frequency: 1500 },
    high: { offset: 10, duration: 200, frequency: 1000 }
  };

  const config = {
    ...intensityConfigs[intensity],
    ...options
  };

  const glitchInterval = setInterval(() => {
    if (Math.random() > 0.7) {
      animate({
        targets: element,
        translateX: [0, config.offset, -config.offset, 0],
        filter: [
          'hue-rotate(0deg)',
          'hue-rotate(90deg)',
          'hue-rotate(180deg)',
          'hue-rotate(0deg)'
        ],
        duration: config.duration,
        easing: 'steps(3)'
      });
    }
  }, config.frequency);

  // Return cleanup function
  return () => {
    clearInterval(glitchInterval);
  };
};

/**
 * Creates a loading dots animation
 */
export const createLoadingDots = (
  container: HTMLElement,
  dotCount: number = 3,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: 600,
    easing: 'easeInOutSine',
    loop: true,
    ...options
  };

  // Clear container
  container.innerHTML = '';

  // Create dots
  const dots = [];
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'loading-dot';
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = ORACLE_COLORS.PRIMARY;
    dot.style.margin = '0 2px';
    dot.style.display = 'inline-block';
    
    container.appendChild(dot);
    dots.push(dot);
  }

  return animate({
    targets: dots,
    translateY: [0, -20, 0],
    opacity: [0.3, 1, 0.3],
    duration: config.duration,
    delay: stagger(config.duration / dotCount),
    easing: config.easing,
    loop: config.loop
  });
};

/**
 * Creates a morphing shape animation
 */
export const createMorphingShape = (
  svgElement: SVGElement,
  shapes: string[],
  morphSpeed: number = 2000,
  options: GridAnimationOptions = {}
) => {
  const config = {
    duration: morphSpeed,
    easing: 'easeInOutQuart',
    loop: true,
    ...options
  };

  const pathElement = svgElement.querySelector('path');
  if (!pathElement) return;

  let currentShapeIndex = 0;

  const morphToNextShape = () => {
    const nextIndex = (currentShapeIndex + 1) % shapes.length;
    
    animate({
      targets: pathElement,
      d: shapes[nextIndex],
      duration: config.duration,
      easing: config.easing,
      complete: () => {
        currentShapeIndex = nextIndex;
        if (config.loop) {
          setTimeout(morphToNextShape, 100);
        }
      }
    });
  };

  morphToNextShape();
};

/**
 * Creates a custom easing function
 */
export const createCustomEasing = (
  type: 'bounce' | 'elastic' | 'overshoot' | 'anticipate' = 'bounce'
) => {
  const easings = {
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    overshoot: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    anticipate: 'cubic-bezier(0.42, 0, 0.58, 1)'
  };

  return easings[type];
};

/**
 * Sequences multiple animations with delays
 */
export const sequenceAnimations = (
  animationConfigs: Array<{
    targets: string | Element | Element[];
    animation: any;
    delay?: number;
  }>,
  options: GridAnimationOptions = {}
) => {
  const timeline = createTimeline({
    complete: options.complete
  });

  animationConfigs.forEach((config, index) => {
    timeline.add({
      targets: config.targets,
      ...config.animation
    }, config.delay || 0);
  });

  return timeline;
};

/**
 * Creates a follow-cursor effect
 */
export const createFollowCursor = (
  element: HTMLElement,
  followSpeed: number = 0.1,
  options: GridAnimationOptions = {}
) => {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const updatePosition = () => {
    currentX += (targetX - currentX) * followSpeed;
    currentY += (targetY - currentY) * followSpeed;

    element.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    requestAnimationFrame(updatePosition);
  };

  const handleMouseMove = (e: MouseEvent) => {
    targetX = e.clientX - element.offsetWidth / 2;
    targetY = e.clientY - element.offsetHeight / 2;
  };

  document.addEventListener('mousemove', handleMouseMove);
  updatePosition();

  // Return cleanup function
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
  };
};

/**
 * Creates intersection observer animations
 */
export const createScrollTrigger = (
  elements: HTMLElement[],
  animationConfig: any,
  options: GridAnimationOptions & { threshold?: number; rootMargin?: string } = {}
) => {
  const config = {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px',
    ...options
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate({
            targets: entry.target,
            ...animationConfig,
            complete: () => {
              if (options.complete) options.complete();
              observer.unobserve(entry.target);
            }
          });
        }
      });
    },
    {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};

/**
 * Performance monitoring for animations
 */
export const monitorAnimationPerformance = (
  animationName: string,
  animationFunction: () => ReturnType<typeof animate> | ReturnType<typeof createTimeline>
) => {
  const startTime = performance.now();
  
  const animation = animationFunction();
  
  animation.complete = () => {
    const endTime = performance.now();
    console.log(`Animation "${animationName}" took ${endTime - startTime} milliseconds.`);
  };

  return animation;
};

/**
 * Creates responsive animation based on screen size
 */
export const createResponsiveAnimation = (
  element: HTMLElement,
  animations: {
    mobile: any;
    tablet: any;
    desktop: any;
  },
  options: GridAnimationOptions = {}
) => {
  const getScreenSize = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const currentAnimation = animations[getScreenSize()];
  
  return animate({
    targets: element,
    ...currentAnimation,
    ...options
  });
};

/**
 * Utility to chain multiple animations
 */
export const chainAnimations = (
  animationChain: Array<() => ReturnType<typeof animate> | ReturnType<typeof createTimeline>>,
  options: GridAnimationOptions = {}
) => {
  let currentIndex = 0;
  
  const runNext = () => {
    if (currentIndex < animationChain.length) {
      const animation = animationChain[currentIndex];
      const animeInstance = animation();
      
      animeInstance.complete = () => {
        currentIndex++;
        runNext();
      };
    } else if (options.complete) {
      options.complete();
    }
  };

  runNext();
}; 