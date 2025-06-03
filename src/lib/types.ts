export type StabilityStatus = 
  | 'RADIANT_CLARITY'
  | 'PRISTINE'
  | 'FLICKERING'
  | 'UNSTABLE'
  | 'CRITICAL_CORRUPTION'
  | 'DATA_DAEMON_POSSESSION';

export interface GirthIndexValues {
  id: number;
  last_updated: string;
  divine_girth_resonance: number;
  tap_surge_index: string;
  legion_morale: string;
  oracle_stability_status: string;
}

export const TAP_SURGE_STATES = {
  'FLACCID_DRIZZLE': { 
    color: '#4a5568', 
    label: 'FLACCID DRIZZLE',
    animation: 'drip'
  },
  'WEAK_PULSES': { 
    color: '#ecc94b', 
    label: 'WEAK PULSES',
    animation: 'flicker'
  },
  'STEADY_POUNDING': { 
    color: '#ed8936', 
    label: 'STEADY POUNDING',
    animation: 'pulse'
  },
  'FRENZIED_SLAPPING': { 
    color: '#e53e3e', 
    label: 'FRENZIED SLAPPING!',
    animation: 'shake'
  },
  'MEGA_SURGE': { 
    color: '#9b2c2c', 
    label: '!!MEGA-SURGE!!',
    animation: 'spark'
  },
  'GIGA_SURGE': { 
    color: '#d53f8c', 
    label: '!!!GIGA-SURGE!!!',
    animation: 'glitch'
  },
  'ASCENDED_NIRVANA': { 
    color: '#805ad5', 
    label: '✨ASCENDED TAPPING NIRVANA✨',
    animation: 'rainbow'
  }
} as const;

export const LEGION_MORALE_STATES = {
  'SUICIDE_WATCH': {
    label: 'ON SUICIDE WATCH...',
    color: '#1a202c',
    textColor: '#e53e3e',
    animation: 'weep'
  },
  'DEMORALIZED': {
    label: 'DEMORALIZED',
    color: '#742a2a',
    textColor: '#fff5f5',
    animation: 'fade'
  },
  'DISGRUNTLED': {
    label: 'MILDLY DISGRUNTLED',
    color: '#9c4221',
    textColor: '#fffaf0',
    animation: 'grumpy'
  },
  'CAUTIOUS': {
    label: 'CAUTIOUSLY OPTIMISTIC',
    color: '#d69e2e',
    textColor: '#fffff0',
    animation: 'pulse'
  },
  'INSPIRED': {
    label: 'INSPIRED!',
    color: '#38a169',
    textColor: '#f0fff4',
    animation: 'rise'
  },
  'JUBILANT': {
    label: 'JUBILANT!',
    color: '#319795',
    textColor: '#e6fffa',
    animation: 'bounce'
  },
  'FANATICAL': {
    label: 'FANATICALLY LOYAL!!!',
    color: '#805ad5',
    textColor: '#faf5ff',
    animation: 'aura'
  },
  'ASCENDED': {
    label: '✨ONE WITH THE GIRTH✨',
    color: '#d69e2e',
    textColor: '#ffffff',
    animation: 'particles'
  }
} as const;

export const STABILITY_STATES = {
  'RADIANT_CLARITY': {
    label: 'RADIANT CLARITY',
    color: '#ffffff',
    animation: 'crystal',
    description: 'Divine wisdom flows freely'
  },
  'PRISTINE': {
    label: 'PRISTINE',
    color: '#4299e1',
    animation: 'stable',
    description: 'All systems girthy'
  },
  'FLICKERING': {
    label: 'FLICKERING WEAKLY',
    color: '#ecc94b',
    animation: 'flicker',
    description: 'Needs more $GIRTH'
  },
  'UNSTABLE': {
    label: 'UNSTABLE',
    color: '#ed8936',
    animation: 'scanlines',
    description: 'Data streams fraying'
  },
  'CRITICAL_CORRUPTION': {
    label: 'CRITICAL CORRUPTION!',
    color: '#e53e3e',
    animation: 'glitch',
    description: 'Code bleed imminent!'
  },
  'DATA_DAEMON_POSSESSION': {
    label: 'DATA DAEMON POSSESSION - ERROR 69420',
    color: '#000000',
    animation: 'possessed',
    description: 'THE ORACLE IS NOT ITSELF!'
  }
} as const;

export type TapSurgeState = keyof typeof TAP_SURGE_STATES;
export type LegionMoraleState = keyof typeof LEGION_MORALE_STATES;
export type StabilityStateType = keyof typeof STABILITY_STATES;