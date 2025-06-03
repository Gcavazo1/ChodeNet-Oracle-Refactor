import { create } from 'zustand';
import { supabase } from './supabase';
import { 
  GirthIndexValues, 
  StabilityStatus, 
  TAP_SURGE_STATES, 
  LEGION_MORALE_STATES,
  STABILITY_STATES,
  TapSurgeState,
  LegionMoraleState,
  StabilityStateType
} from './types';

interface GirthIndexStore {
  girthResonance: number;
  tapSurgeIndex: TapSurgeState;
  legionMorale: LegionMoraleState;
  stabilityStatus: StabilityStateType;
  isLoading: boolean;
  error: string | null;
  setupRealtimeSubscription: () => Promise<void>;
  updateMetrics: (metrics: Partial<{
    girthResonance: number;
    tapSurgeIndex: TapSurgeState;
    legionMorale: LegionMoraleState;
    stabilityStatus: StabilityStateType;
  }>) => Promise<void>;
}

export const useGirthIndexStore = create<GirthIndexStore>((set, get) => ({
  girthResonance: 50,
  tapSurgeIndex: 'STEADY_POUNDING',
  legionMorale: 'CAUTIOUS',
  stabilityStatus: 'PRISTINE',
  isLoading: true,
  error: null,

  setupRealtimeSubscription: async () => {
    try {
      console.log('[GirthIndexStore] Setting up realtime subscription...');
      
      // Initial fetch
      const { data, error } = await supabase
        .from('girth_index_current_values')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      console.log('[GirthIndexStore] Initial Girth Index fetched:', data);

      if (data) {
        console.log('[GirthIndexStore] Supabase payload.new:', data);
        console.log('[GirthIndexStore] Setting tapSurgeIndex:', data.tap_surge_index);
        console.log('[GirthIndexStore] Setting legionMorale:', data.legion_morale);
        console.log('[GirthIndexStore] Setting oracleStabilityStatus:', data.oracle_stability_status);
        
        set({
          girthResonance: data.divine_girth_resonance,
          tapSurgeIndex: data.tap_surge_index as TapSurgeState,
          legionMorale: data.legion_morale as LegionMoraleState,
          stabilityStatus: data.oracle_stability_status as StabilityStateType,
          isLoading: false
        });

        console.log('[GirthIndexStore] Store updated with initial data:', get());
      }

      // Setup realtime subscription
      const subscription = supabase
        .channel('girth-index-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'girth_index_current_values',
            filter: 'id=eq.1'
          },
          (payload) => {
            console.log('[GirthIndexStore] Realtime UPDATE received:', payload.new);
            console.log('[GirthIndexStore] Setting tapSurgeIndex:', payload.new.tap_surge_index);
            console.log('[GirthIndexStore] Setting legionMorale:', payload.new.legion_morale);
            console.log('[GirthIndexStore] Setting oracleStabilityStatus:', payload.new.oracle_stability_status);
            
            const newData = payload.new as GirthIndexValues;
            
            set({
              girthResonance: newData.divine_girth_resonance,
              tapSurgeIndex: newData.tap_surge_index as TapSurgeState,
              legionMorale: newData.legion_morale as LegionMoraleState,
              stabilityStatus: newData.oracle_stability_status as StabilityStateType
            });

            console.log('[GirthIndexStore] Store updated via Realtime. New state:', get());
          }
        )
        .subscribe((status) => {
          console.log('[GirthIndexStore] Subscription status:', status);
        });

      return () => {
        console.log('[GirthIndexStore] Cleaning up subscription');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('[GirthIndexStore] Error in subscription setup:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },

  updateMetrics: async (metrics) => {
    try {
      console.log('[GirthIndexStore] Updating metrics:', metrics);
      
      const currentState = get();
      const updates = {
        divine_girth_resonance: metrics.girthResonance ?? currentState.girthResonance,
        tap_surge_index: metrics.tapSurgeIndex ?? currentState.tapSurgeIndex,
        legion_morale: metrics.legionMorale ?? currentState.legionMorale,
        oracle_stability_status: metrics.stabilityStatus ?? currentState.stabilityStatus
      };

      // Update local state immediately for responsiveness
      set({ ...metrics });

      const response = await fetch('https://errgidlsmozmfnsoyxvw.supabase.co/functions/v1/admin-update-girth-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Edge Function error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('[GirthIndexStore] Metrics successfully updated:', data);
    } catch (error) {
      console.error('[GirthIndexStore] Error updating metrics:', error);
      
      // Revert to previous state on error
      const { data } = await supabase
        .from('girth_index_current_values')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        console.log('[GirthIndexStore] Reverting to previous state after error:', data);
        set({
          girthResonance: data.divine_girth_resonance,
          tapSurgeIndex: data.tap_surge_index as TapSurgeState,
          legionMorale: data.legion_morale as LegionMoraleState,
          stabilityStatus: data.oracle_stability_status as StabilityStateType
        });
      }
    }
  }
}));