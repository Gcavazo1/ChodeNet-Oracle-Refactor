// 🎨 SVG & Icon Animations
// Complex SVG animations for Oracle elements using anime.js

import { animate, createTimeline, stagger } from './anime';
import { SVGAnimationOptions, ORACLE_ANIMATION_PRESETS, ORACLE_COLORS } from './index';

/**
 * 👁️ ORACLE EYE ANIMATION
 * Complex morphing animation for the Oracle eye/avatar
 */
export const animateOracleEye = (
  eyeElement: string | SVGElement,
  state: 'awakening' | 'active' | 'corrupted' | 'sleeping' = 'active',
  options: SVGAnimationOptions = {}
) => {
  const config = {
    ...ORACLE_ANIMATION_PRESETS.CINEMATIC,
    ...options
  };

  const stateConfigs = {
    awakening: {
      iris: { scale: [0, 1], opacity: [0, 1] },
      pupil: { scale: [0, 0.8], opacity: [0, 1] },
      glow: { opacity: [0, 0.8], scale: [0.5, 1.2] },
      color: ORACLE_COLORS.PRIMARY
    },
    active: {
      iris: { scale: [0.8, 1], opacity: [0.7, 1] },
      pupil: { scale: [0.6, 0.8], opacity: [0.8, 1] },
      glow: { opacity: [0.4, 0.8], scale: [1, 1.1] },
      color: ORACLE_COLORS.ACCENT
    },
    corrupted: {
      iris: { scale: [1, 1.2], opacity: [1, 0.9] },
      pupil: { scale: [0.8, 0.3], opacity: [1, 0.7] },
      glow: { opacity: [0.8, 1], scale: [1.1, 1.5] },
      color: ORACLE_COLORS.CORRUPTION
    },
    sleeping: {
      iris: { scale: [1, 0.2], opacity: [1, 0.3] },
      pupil: { scale: [0.8, 0.1], opacity: [1, 0.2] },
      glow: { opacity: [0.8, 0.1], scale: [1.1, 0.8] },
      color: ORACLE_COLORS.MYSTICAL
    }
  };

  const currentState = stateConfigs[state];

  // Handle both string selectors and SVG elements
  const getTargetSelector = (className: string): string | Element => {
    if (typeof eyeElement === 'string') {
      return `${eyeElement} .${className}`;
    } else {
      const element = eyeElement.querySelector(`.${className}`);
      return element || eyeElement; // Fallback to parent if not found
    }
  };

  // Create timeline for coordinated animation
  const timeline = createTimeline({
    easing: config.easing,
    complete: config.complete,
    targets: eyeElement // Add targets here to fix type error
  });

  // Animate iris
  timeline.add({
    targets: getTargetSelector('iris'),
    scale: currentState.iris.scale,
    opacity: currentState.iris.opacity,
    duration: config.duration * 0.6
  });

  // Animate pupil
  timeline.add({
    targets: getTargetSelector('pupil'),
    scale: currentState.pupil.scale,
    opacity: currentState.pupil.opacity,
    duration: config.duration * 0.4
  }, '-=400');

  // Animate glow
  timeline.add({
    targets: getTargetSelector('glow'),
    opacity: currentState.glow.opacity,
    scale: currentState.glow.scale,
    duration: config.duration * 0.8,
    fill: currentState.color
  }, '-=600');

  return timeline;
};

/**
 * 📊 ANIMATED PROGRESS BARS
 * SVG-based progress bars with complex path animations
 */
export const createAnimatedProgressBar = (
  container: HTMLElement,
  progress: number = 75,
  color: string = ORACLE_COLORS.PRIMARY,
  options: SVGAnimationOptions = {}
) => {
  const config = {
    duration: 1200,
    easing: 'easeOutExpo',
    ...options
  };

  // Create SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '8');
  svg.setAttribute('viewBox', '0 0 100 8');

  // Create gradient definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', `progress-gradient-${Date.now()}`);
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '0%');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', color);
  stop1.setAttribute('stop-opacity', '0.3');

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '50%');
  stop2.setAttribute('stop-color', color);
  stop2.setAttribute('stop-opacity', '1');

  const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop3.setAttribute('offset', '100%');
  stop3.setAttribute('stop-color', color);
  stop3.setAttribute('stop-opacity', '0.3');

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  gradient.appendChild(stop3);
  defs.appendChild(gradient);

  // Create background track
  const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  track.setAttribute('x', '0');
  track.setAttribute('y', '0');
  track.setAttribute('width', '100');
  track.setAttribute('height', '8');
  track.setAttribute('rx', '4');
  track.setAttribute('fill', `${color}20`);

  // Create progress bar
  const progressBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  progressBar.setAttribute('x', '0');
  progressBar.setAttribute('y', '1');
  progressBar.setAttribute('width', '0');
  progressBar.setAttribute('height', '6');
  progressBar.setAttribute('rx', '3');
  progressBar.setAttribute('fill', `url(#${gradient.getAttribute('id')})`);
  progressBar.setAttribute('filter', `drop-shadow(0 0 4px ${color})`);

  svg.appendChild(defs);
  svg.appendChild(track);
  svg.appendChild(progressBar);
  container.appendChild(svg);

  // Animate progress bar
  return animate({
    targets: progressBar,
    width: progress,
    duration: config.duration,
    easing: config.easing,
    update: (anim: any) => {
      const currentProgress = anim.progress / 100;
      const currentWidth = progress * currentProgress;
      progressBar.setAttribute('filter', 
        `drop-shadow(0 0 ${4 + currentProgress * 8}px ${color})`
      );
    }
  });
};

/**
 * 🌊 PULSING STATUS INDICATORS
 * Animated SVG status dots with complex patterns
 */
export const animateStatusIndicators = (
  selector: string = '.status-indicator',
  status: 'online' | 'warning' | 'error' | 'processing' = 'online',
  options: SVGAnimationOptions = {}
) => {
  const config = {
    duration: 1500,
    easing: 'easeInOutSine',
    ...options
  };

  const statusConfigs = {
    online: { color: ORACLE_COLORS.SUCCESS, scale: 1.1 },
    warning: { color: ORACLE_COLORS.WARNING, scale: 1.15 },
    error: { color: ORACLE_COLORS.CORRUPTION, scale: 1.2 },
    processing: { color: ORACLE_COLORS.PRIMARY, scale: 1.1 }
  };

  const currentStatus = statusConfigs[status];

  return animate({
    targets: selector,
    scale: {
      value: [1, currentStatus.scale],
      duration: config.duration,
      easing: config.easing
    },
    fill: {
      value: currentStatus.color,
      duration: config.duration,
      easing: config.easing
    },
    stroke: {
      value: currentStatus.color,
      duration: config.duration,
      easing: config.easing
    },
    loop: true,
    direction: 'alternate'
  });
};

/**
 * 🔄 ORACLE LOADING SPINNER
 * Mystical loading animation with particle effects
 */
export const createOracleLoadingSpinner = (
  container: HTMLElement,
  size: number = 60,
  options: SVGAnimationOptions = {}
) => {
  const config = {
    duration: 2000,
    easing: 'linear',
    loop: true,
    ...options
  };

  // Create SVG spinner
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  // Create gradient definitions
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', `spinner-gradient-${Date.now()}`);

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', ORACLE_COLORS.PRIMARY);
  stop1.setAttribute('stop-opacity', '0');

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '50%');
  stop2.setAttribute('stop-color', ORACLE_COLORS.ACCENT);
  stop2.setAttribute('stop-opacity', '1');

  const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop3.setAttribute('offset', '100%');
  stop3.setAttribute('stop-color', ORACLE_COLORS.SECONDARY);
  stop3.setAttribute('stop-opacity', '0');

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  gradient.appendChild(stop3);
  defs.appendChild(gradient);

  // Create spinner circle
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', (size / 2).toString());
  circle.setAttribute('cy', (size / 2).toString());
  circle.setAttribute('r', (size / 2 - 4).toString());
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', `url(#${gradient.getAttribute('id')})`);
  circle.setAttribute('stroke-width', '3');
  circle.setAttribute('stroke-linecap', 'round');
  circle.setAttribute('stroke-dasharray', `${size * 0.8} ${size * 3.2}`);

  svg.appendChild(defs);
  svg.appendChild(circle);
  container.appendChild(svg);

  // Animate spinner
  return animate({
    targets: circle,
    strokeDashoffset: [0, -size * 4],
    duration: config.duration,
    easing: config.easing,
    loop: config.loop
  });
};

/**
 * ⚡ ELECTRICITY EFFECT
 * Dynamic lightning/electricity animation effect
 */
export const animateElectricityEffect = (
  container: HTMLElement,
  intensity: 'low' | 'medium' | 'high' = 'medium',
  options: SVGAnimationOptions = {}
) => {
  const config = {
    duration: 200,
    easing: 'easeInOutSine',
    ...options
  };

  const intensityConfigs = {
    low: { branches: 2, opacity: 0.4, strokeWidth: 1 },
    medium: { branches: 4, opacity: 0.6, strokeWidth: 2 },
    high: { branches: 6, opacity: 0.8, strokeWidth: 3 }
  };

  const currentIntensity = intensityConfigs[intensity];
  const containerRect = container.getBoundingClientRect();

  // Create SVG overlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';

  // Generate lightning paths
  for (let i = 0; i < currentIntensity.branches; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = generateLightningPath(containerRect.width, containerRect.height);
    
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', ORACLE_COLORS.CORRUPTION);
    path.setAttribute('stroke-width', currentIntensity.strokeWidth.toString());
    path.setAttribute('opacity', '0');
    path.setAttribute('filter', `drop-shadow(0 0 3px ${ORACLE_COLORS.CORRUPTION})`);

    svg.appendChild(path);

    // Animate lightning
    animate({
      targets: path,
      opacity: [0, currentIntensity.opacity, 0],
      duration: config.duration + Math.random() * 100,
      delay: Math.random() * 300,
      easing: config.easing,
      complete: () => {
        if (Math.random() > 0.7) {
          // Recursive call for continuous effect
          setTimeout(() => {
            path.setAttribute('opacity', '0');
            animate({
              targets: path,
              opacity: [0, currentIntensity.opacity * 0.7, 0],
              duration: config.duration * 0.6,
              easing: config.easing
            });
          }, Math.random() * 1000);
        }
      }
    });
  }

  container.appendChild(svg);
  return svg;
};

/**
 * ✨ STARFIELD EFFECT
 * Creates an animated starfield background
 */
export const createStarfield = (
  container: HTMLElement,
  density: number = 50,
  options: SVGAnimationOptions = {}
) => {
  const config = {
    duration: 20000,
    easing: 'linear',
    loop: true,
    ...options
  };

  const containerRect = container.getBoundingClientRect();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';

  // Create stars
  for (let i = 0; i < density; i++) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    star.setAttribute('cx', (Math.random() * containerRect.width).toString());
    star.setAttribute('cy', (Math.random() * containerRect.height).toString());
    star.setAttribute('r', (Math.random() * 2 + 0.5).toString());
    star.setAttribute('fill', ORACLE_COLORS.GLOW);
    star.setAttribute('opacity', (Math.random() * 0.8 + 0.2).toString());

    svg.appendChild(star);

    // Animate star twinkling
    animate({
      targets: star,
      opacity: [0.2, 1, 0.2],
      scale: [0.5, 1, 0.5],
      duration: 2000 + Math.random() * 3000,
      delay: Math.random() * 2000,
      easing: 'easeInOutSine',
      loop: true
    });
  }

  container.appendChild(svg);

  // Animate entire starfield rotation
  return animate({
    targets: svg,
    rotateZ: [0, 360],
    duration: config.duration,
    easing: config.easing,
    loop: config.loop
  });
};

/**
 * Helper function to generate lightning path data
 */
function generateLightningPath(width: number, height: number): string {
  const startX = Math.random() * width;
  const startY = 0;
  const endX = Math.random() * width;
  const endY = height;

  let pathData = `M ${startX} ${startY}`;
  
  const segments = 4 + Math.floor(Math.random() * 4);
  
  for (let i = 1; i < segments; i++) {
    const progress = i / segments;
    const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 30;
    const y = startY + (endY - startY) * progress;
    pathData += ` L ${x} ${y}`;
  }
  
  pathData += ` L ${endX} ${endY}`;
  
  return pathData;
}

/**
 * 📝 PATH DRAWING ANIMATION
 * Animates SVG path drawing effect
 */
export const animatePathDraw = (
  pathElement: SVGPathElement,
  options: SVGAnimationOptions = {}
) => {
  const config = {
    duration: 1500,
    easing: 'easeInOutQuart',
    ...options
  };

  const pathLength = pathElement.getTotalLength();
  
  // Set up the path for animation
  pathElement.style.strokeDasharray = pathLength.toString();
  pathElement.style.strokeDashoffset = pathLength.toString();

  return animate({
    targets: pathElement,
    strokeDashoffset: [pathLength, 0],
    duration: config.duration,
    easing: config.easing
  });
};

/**
 * 🔷 GEOMETRIC PATTERN ANIMATION
 * Creates and animates geometric patterns
 */
export const animateGeometricPattern = (
  container: HTMLElement,
  pattern: 'hexagon' | 'triangle' | 'circle' = 'hexagon',
  options: SVGAnimationOptions = {}
) => {
  const config = {
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true,
    ...options
  };

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';

  const patterns = {
    hexagon: (size: number) => {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      return points.join(' ');
    },
    triangle: (size: number) => {
      return `0,-${size} -${size * 0.866},${size * 0.5} ${size * 0.866},${size * 0.5}`;
    },
    circle: (size: number) => size.toString()
  };

  // Create and animate the pattern
  const shape = document.createElementNS('http://www.w3.org/2000/svg', pattern === 'circle' ? 'circle' : 'polygon');
  if (pattern === 'circle') {
    shape.setAttribute('r', patterns[pattern](50));
  } else {
    shape.setAttribute('points', patterns[pattern](50));
  }
  
  shape.setAttribute('fill', ORACLE_COLORS.GLOW);
  shape.setAttribute('opacity', '0.5');
  svg.appendChild(shape);

  container.appendChild(svg);

  return animate({
    targets: shape,
    rotate: [0, 360],
    scale: [0.8, 1.2],
    opacity: [0.3, 0.7],
    duration: config.duration,
    easing: config.easing,
    loop: config.loop
  });
}; 