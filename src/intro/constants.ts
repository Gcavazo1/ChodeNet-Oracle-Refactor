// Constants shared across the cinematic intro modules

export const INTRO_SECTION_COUNT = 6;

// Easing curves reused for Framer-Motion variants
export const EASE_EXP_OUT: [number, number, number, number] = [0.19, 1, 0.22, 1];
export const EASE_IN_OUT_EXPO: [number, number, number, number] = [0.87, 0, 0.13, 1];

// Colours (Oracle brand)
export const BRAND_GRADIENT = 'linear-gradient(135deg, #00e8ff 0%, #7d00ff 100%)';

// Asset paths used throughout the intro experience. Anything heavy should be
// preloaded so there is no white flash before animations begin.
export const INTRO_ASSETS: Array<{ href: string; as: 'image' | 'fetch'; type?: string }> = [
  { href: '/intro/nebula.png', as: 'image', type: 'image/png' },
  { href: '/intro/audio/ambient.mp3', as: 'fetch', type: 'audio/mpeg' },
];

// Additional Oracle brand colours
export const COLOR_CYAN = '#00e8ff';
export const COLOR_PURPLE = '#7d00ff';
export const COLOR_BG_DARK = '#00010a';

// Popular easing curves (cubic-bezier arrays)
export const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT_EXP: [number, number, number, number] = [0.87, 0, 0.13, 1]; 