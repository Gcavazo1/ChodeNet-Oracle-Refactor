// NOTE: Using generic 'any' types for Anime.js instances to maintain compatibility
// with both v3 and v4 without adding complex type mappings.
type AnimeParams = any;
type AnimeInstance = any;
type AnimeTimelineInstance = any;

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number | ((el: Element, i: number, t: number) => number);
  endDelay?: number;
  round?: number;
  loop?: boolean | number;
  direction?: 'normal' | 'reverse' | 'alternate';
  autoplay?: boolean;
  onComplete?: (anim: AnimeInstance) => void;
  onUpdate?: (anim: AnimeInstance) => void;
  onBegin?: (anim: AnimeInstance) => void;
  complete?: (anim: AnimeInstance) => void;
}

export interface GridAnimationOptions extends AnimationConfig {
  stagger?: number | {
    value?: number;
    from?: number | string | Element | Element[];
    axis?: 'x' | 'y';
    grid?: [number, number];
    direction?: 'normal' | 'reverse';
  };
}

export interface SVGAnimationOptions extends AnimationConfig {
  intensity?: number;
}

export interface TimelineAnimation extends AnimeParams {
  offset?: number | string;
}

export interface AnimationInstance extends AnimeTimelineInstance {
  [key: string]: any;
}

export type AnimationStatus = 'playing' | 'paused' | 'completed'; 