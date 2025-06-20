import * as anime from 'animejs';

// Custom type definitions to match anime.js API
interface AnimeParams {
  targets: string | Element | Element[] | NodeList;
  duration?: number;
  delay?: number;
  endDelay?: number;
  easing?: string;
  direction?: 'normal' | 'reverse' | 'alternate';
  loop?: boolean | number;
  autoplay?: boolean;
  [key: string]: any;
}

// Using a simpler type definition to avoid type conflicts
interface AnimeInstance {
  play: () => void;
  pause: () => void;
  restart: () => void;
  seek: (time: number) => void;
  reverse: () => void;
  [key: string]: any;
}

interface AnimeTimelineInstance extends AnimeInstance {
  add: (params: AnimeParams, timeOffset?: string | number) => AnimeTimelineInstance;
}

// Get the default export from anime
const animeDefault: any = (anime as any).default || (anime as any);

// Legacy-compatible animate(): accepts either (config) or (targets, parameters)
export const animate = (targetsOrConfig: AnimeParams): AnimeInstance => {
  return animeDefault(targetsOrConfig) as unknown as AnimeInstance;
};

// createTimeline wrapper
export const createTimeline = (params?: AnimeParams): AnimeTimelineInstance => {
  return animeDefault.timeline(params) as unknown as AnimeTimelineInstance;
};

// stagger helper passthrough
export const stagger = animeDefault.stagger; 