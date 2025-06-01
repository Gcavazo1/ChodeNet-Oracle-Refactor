import { create } from 'zustand';
import { supabase } from './supabase';
import { GirthIndexValues, StabilityStatus, TAP_SURGE_STATES, LEGION_MORALE_STATES } from './types';

interface GirthIndexStore {
  girthResonance: number;
  tapSurgeIndex: string;
  legionMorale: string;
  stabilityStatus: StabilityStatus;
  isLoading: boolean;
  error: string | null;
  setupRealtimeSubscription: () => Promise<void>;
  updateMetrics: (metrics: Partial<{
    girthResonance: number;
    tapSurgeIndex: string;
    legionMorale: string;
    stabilityStatus: StabilityStatus;
  }>) => Promise<void>;
}

export const useGirthIndexStore = create<GirthIndexStore>((set, get) => ({
  girthResonance: 50,
  tapSurgeIndex: 'Steady Pounding',
  legionMorale: 'Cautiously Optimistic',
  stabilityStatus: 'Pristine',
  isLoading: true,
  error: null,

  setupRealtimeSubscription: async () => {
    try {
      console.log('GirthIndexStore: Setting up realtime subscription...');
      
      // Initial fetch
      const { data, error } = await supabase
        .from('girth_index_current_values')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      console.log('GirthIndexStore: Initial Girth Index fetched:', data);

      if (data) {
        const oldState = get();
        console.log('GirthIndexStore: Updating store with initial data. Old state:', oldState);
        
        set({
          girthResonance: data.divine_girth_resonance,
          tapSurgeIndex: data.tap_surge_index,
          legionMorale: data.legion_morale,
          stabilityStatus: data.oracle_stability_status as StabilityStatus,
          isLoading: false
        });

        console.log('GirthIndexStore: Store updated with initial data:', get());
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
            console.log('GirthIndexStore: Realtime UPDATE for Girth Index received:', payload.new);
            
            const newData = payload.new as GirthIndexValues;
            const oldState = get();
            
            console.log('GirthIndexStore: Updating store with new Girth Index.', {
              oldState,
              newValues: {
                girthResonance: newData.divine_girth_resonance,
                tapSurgeIndex: newData.tap_surge_index,
                legionMorale: newData.legion_morale,
                stabilityStatus: newData.oracle_stability_status
              }
            });

            set({
              girthResonance: newData.divine_girth_resonance,
              tapSurgeIndex: newData.tap_surge_index,
              legionMorale: newData.legion_morale,
              stabilityStatus: newData.oracle_stability_status as StabilityStatus
            });

            console.log('GirthIndexStore: Store updated with new data:', get());
          }
        )
        .subscribe((status) => {
          console.log('GirthIndexStore: Subscription status:', status);
        });

      return () => {
        console.log('GirthIndexStore: Cleaning up subscription');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('GirthIndexStore: Error in subscription setup:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },

  updateMetrics: async (metrics) => {
    try {
      console.log('DevPanel: Calling admin-update-girth-index with metrics:', metrics);
      
      const currentState = get();
      const updates = {
        divine_girth_resonance: metrics.girthResonance ?? currentState.girthResonance,
        tap_surge_index: metrics.tapSurgeIndex ?? currentState.tapSurgeIndex,
        legion_morale: metrics.legionMorale ?? currentState.legionMorale,
        oracle_stability_status: metrics.stabilityStatus ?? currentState.stabilityStatus
      };

      // Update local state immediately for responsiveness
      set({ ...metrics });

      // Update via Edge Function
      const { data, error } = await supabase.functions.invoke('admin-update-girth-index', {
        body: updates
      });

      if (error) throw error;

      console.info('DevPanel: Girth Index successfully updated via admin panel:', data);
    } catch (error) {
      console.error('DevPanel: Error updating Girth Index via admin panel:', error);
      
      // Revert to previous state on error
      const { data } = await supabase
        .from('girth_index_current_values')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        console.log('DevPanel: Reverting to previous state after error:', data);
        set({
          girthResonance: data.divine_girth_resonance,
          tapSurgeIndex: data.tap_surge_index,
          legionMorale: data.legion_morale,
          stabilityStatus: data.oracle_stability_status as StabilityStatus
        });
      }
    }
  }
}));