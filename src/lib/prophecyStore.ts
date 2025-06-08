import { create } from 'zustand';
import { supabase } from './supabase';
import { ProphecyCorruptionLevel } from './types';

export interface Prophecy {
  id: string;
  created_at: string;
  prophecy_text: string;
  corruption_level: ProphecyCorruptionLevel;
  source_metrics_snapshot?: Record<string, any>;
}

interface ProphecyStore {
  prophecies: Prophecy[];
  latestProphecy: Prophecy | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  isSubscribed: boolean;
  setupRealtimeSubscription: () => Promise<(() => void) | void>;
  resetUnreadCount: () => void;
  incrementUnreadCount: () => void;
  generateProphecy: (metrics: any, topic: string | null) => Promise<void>;
}

let globalProphecySubscription: any = null;

export const useProphecyStore = create<ProphecyStore>((set, get) => ({
  prophecies: [],
  latestProphecy: null,
  isLoading: true,
  error: null,
  unreadCount: 0,
  isSubscribed: false,

  setupRealtimeSubscription: async () => {
    if (get().isSubscribed || globalProphecySubscription) {
      console.log('ProphecyStore: Subscription already exists, returning existing cleanup function');
      return () => {
        if (globalProphecySubscription) {
          console.log('ProphecyStore: Cleaning up existing subscription');
          globalProphecySubscription.unsubscribe();
          globalProphecySubscription = null;
          set({ isSubscribed: false });
        }
      };
    }

    console.log('ProphecyStore: Setting up NEW realtime subscription...');
    try {
      console.log('ProphecyStore: Fetching initial prophecies...');
      const { data: initialProphecies, error: fetchError } = await supabase
        .from('apocryphal_scrolls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('ProphecyStore: Raw Supabase response:', { data: initialProphecies, error: fetchError });

      if (fetchError) {
        console.error('ProphecyStore: Error fetching prophecies:', fetchError);
        throw fetchError;
      }

      if (!initialProphecies) {
        console.warn('ProphecyStore: No prophecies returned from Supabase');
      } else {
        console.log('ProphecyStore: Successfully fetched prophecies:', initialProphecies.length);
      }

      set((state) => {
        console.log('ProphecyStore: Updating store with initial prophecies:', {
          currentCount: state.prophecies.length,
          newCount: initialProphecies?.length || 0
        });
        return {
          prophecies: initialProphecies || [],
          latestProphecy: initialProphecies?.[0] || null,
          isLoading: false
        };
      });

      console.log('ProphecyStore: Setting up Supabase channel subscription...');
      const channelName = `prophecy-feed-${Date.now()}`;
      globalProphecySubscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'apocryphal_scrolls'
          },
          (payload) => {
            console.log('ProphecyStore: Received new prophecy via realtime:', payload.new);
            const newProphecy = payload.new as Prophecy;
            
            set((state) => {
              console.log('ProphecyStore: Updating state with new prophecy:', {
                currentCount: state.prophecies.length,
                newProphecyId: newProphecy.id
              });
              return {
                prophecies: [newProphecy, ...state.prophecies],
                latestProphecy: newProphecy
              };
            });

            get().incrementUnreadCount();

            const gameFrame = document.querySelector<HTMLIFrameElement>('.game-frame');
            if (gameFrame?.contentWindow) {
              gameFrame.contentWindow.postMessage({
                event: 'oracle_update_unread_count',
                count: get().unreadCount
              }, '*');
            }
          }
        )
        .subscribe((status) => {
          console.log('ProphecyStore: Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            set({ isSubscribed: true });
          } else if (status === 'CLOSED') {
            set({ isSubscribed: false });
            globalProphecySubscription = null;
          }
        });

      return () => {
        console.log('ProphecyStore: Cleaning up subscription');
        if (globalProphecySubscription) {
          globalProphecySubscription.unsubscribe();
          globalProphecySubscription = null;
        }
        set({ isSubscribed: false });
      };
    } catch (error) {
      console.error('ProphecyStore: Error in subscription setup:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
        isSubscribed: false
      });
      
      return () => {};
    }
  },

  generateProphecy: async (metrics, topic) => {
    try {
      console.log('ProphecyStore: Generating new prophecy:', { metrics, topic });

      const payload = {
        girth_resonance_value: metrics.girthResonance,
        tap_index_state: metrics.tapSurgeIndex,
        legion_morale_state: metrics.legionMorale,
        oracle_stability_status: metrics.stabilityStatus,
        ritual_request_topic: topic
      };

      console.log('ProphecyStore: Formatted payload:', payload);

      const { error } = await supabase.functions.invoke('oracle-prophecy-generator', {
        body: payload
      });

      if (error) throw error;
    } catch (error) {
      console.error('ProphecyStore: Failed to generate prophecy:', error);
      throw error;
    }
  },

  resetUnreadCount: () => set({ unreadCount: 0 }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 }))
}));