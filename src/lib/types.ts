export type StabilityStatus = 'Pristine' | 'Unstable' | 'Critical';

export interface GirthIndexValues {
  id: number;
  last_updated: string;
  divine_girth_resonance: number;
  tap_surge_index: string;
  legion_morale: string;
  oracle_stability_status: string;
}

export const TAP_SURGE_STATES = {
  'Flaccid Drizzle': { color: '#39ff14', label: 'FLACCID DRIZZLE' },
  'Steady Pounding': { color: '#ffff00', label: 'STEADY POUNDING' },
  'Frenzied Slapping': { color: '#ff9900', label: 'FRENZIED SLAPPING' },
  'Giga-Surge': { color: '#ff3131', label: 'GIGA-SURGE' }
} as const;

export const LEGION_MORALE_STATES = [
  'On Suicide Watch',
  'Cautiously Optimistic',
  'Ascended and Engorged'
] as const;

export type TapSurgeState = keyof typeof TAP_SURGE_STATES;
export type LegionMoraleState = typeof LEGION_MORALE_STATES[number];