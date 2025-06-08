// Oracle Flow Store

import { create } from 'zustand';
import { supabase } from './supabase';
import { directAPI } from './directAPIIntegration';
import { sanitizeTopic } from './textUtils';

export interface RitualTopic {
  id: string;
  text: string;
  description?: string;
}

export interface ProphecyGenerationState {
  isGenerating: boolean;
  currentStep: 'idle' | 'channeling' | 'manifesting_visuals' | 'storing' | 'complete';
  progress: string;
  error?: string;
}

export interface GeneratedProphecy {
  id: string;
  content: string;
  topic: string;
  corruption_level: string;
  timestamp: Date;
  visual_generated?: boolean;
  image_url?: string;
  visual_themes?: string[];
  source_metrics?: any;
}

export interface ScrollEntry {
  id: string;
  created_at: string;
  prophecy_text: string;
  corruption_level: string;
  source_metrics_snapshot?: any;
}

interface OracleFlowStore {
  // Ritual Requests State
  currentTopic: string | null;
  availableTopics: RitualTopic[];
  
  // Prophecy Generation State
  generationState: ProphecyGenerationState;
  latestProphecy: GeneratedProphecy | null;
  
  // Scrolls State
  scrolls: ScrollEntry[];
  isLoadingScrolls: boolean;
  generatingImages: Set<string>;
  
  // Flow Control
  activeTab: 'ritual' | 'chamber' | 'scrolls' | 'lore' | 'archive';
  highlightedLoreId: string | null;
  isSubscribed: boolean;
  
  // Actions
  selectTopic: (topicId: string | null) => void;
  generateProphecy: (girthMetrics: any) => Promise<void>;
  switchToTab: (tab: 'ritual' | 'chamber' | 'scrolls' | 'lore' | 'archive') => void;
  highlightLoreEntry: (loreId: string) => void;
  clearHighlightedLoreEntry: () => void;
  generateScrollImage: (scrollId: string) => Promise<void>;
  setupRealtimeSubscription: () => (() => void);
  refreshScrolls: () => Promise<void>;
}

const RITUAL_TOPICS: RitualTopic[] = [
  {
    id: 'FUTURE_OF_GIRTH',
    text: 'Oracle, reveal the secrets of the Future of $GIRTH!',
    description: 'Seek wisdom about the destiny of the sacred token'
  },
  {
    id: 'ANCIENT_TECHNIQUES',
    text: 'Oracle, speak of the Ancient Chodes and their Lost Slapping Techniques!',
    description: 'Uncover the forgotten arts of the masters'
  },
  {
    id: 'MEME_COINS',
    text: 'Oracle, what omens do the Next Meme Coins carry?',
    description: 'Divine the future of the meme coin realm'
  },
  {
    id: 'FUD_STORMS',
    text: 'Oracle, warn us of the Coming FUD Storms!',
    description: 'Prepare for the trials ahead'
  },
  {
    id: 'COMMUNITY_ASCENSION',
    text: 'Oracle, guide us toward Community Ascension!',
    description: 'Unite the legion in cosmic purpose'
  }
];

// Global variable to track subscription to prevent duplicates
let globalOracleFlowSubscription: any = null;

export const useOracleFlowStore = create<OracleFlowStore>((set, get) => ({
  // Initial State
  currentTopic: null,
  availableTopics: RITUAL_TOPICS,
  generationState: {
    isGenerating: false,
    currentStep: 'idle',
    progress: ''
  },
  latestProphecy: null,
  scrolls: [],
  isLoadingScrolls: true,
  generatingImages: new Set(),
  activeTab: 'ritual',
  highlightedLoreId: null,
  isSubscribed: false,

  // Actions
  selectTopic: (topicId: string | null) => {
    console.log('🎯 Oracle Flow: Topic selected:', topicId);
    set({ 
      currentTopic: topicId,
      activeTab: topicId ? 'chamber' : 'ritual',
      // Clear previous prophecy when selecting a new topic
      latestProphecy: null,
      // Reset generation state
      generationState: {
        isGenerating: false,
        currentStep: 'idle',
        progress: ''
      },
      highlightedLoreId: null
    });
  },

  generateProphecy: async (girthMetrics: any) => {
    const { currentTopic } = get();
    if (!currentTopic) {
      console.error('🔮 No topic selected for prophecy generation');
      return;
    }

    // Sanitize topic input to prevent SQL injection
    const sanitizedTopic = sanitizeTopic(currentTopic);

    console.log('🔮 Oracle Flow: Starting prophecy generation for topic:', sanitizedTopic);
    
    set({
      generationState: {
        isGenerating: true,
        currentStep: 'channeling',
        progress: 'The Oracle stirs... channeling cosmic wisdom...'
      }
    });

    try {
      // Step 1: Generate prophecy text via Supabase function
      set({
        generationState: {
          isGenerating: true,
          currentStep: 'channeling',
          progress: 'Invoking the Oracle\'s divine wisdom...'
        }
      });

      const payload = {
        girth_resonance_value: girthMetrics.girthResonance || 50,
        tap_index_state: girthMetrics.tapSurgeIndex || 'Steady Pounding',
        legion_morale_state: girthMetrics.legionMorale || 'Cautiously Optimistic',
        oracle_stability_status: girthMetrics.stabilityStatus || 'Pristine',
        ritual_request_topic: sanitizedTopic
      };

      console.log('🔮 Calling oracle-prophecy-generator with payload:', payload);

      const { data: prophecyResult, error: prophecyError } = await supabase.functions.invoke(
        'oracle-prophecy-generator',
        { body: payload }
      );

      if (prophecyError) {
        throw new Error(`Prophecy generation failed: ${prophecyError.message}`);
      }

      console.log('🔮 Prophecy generated:', prophecyResult);

      const newProphecy: GeneratedProphecy = {
        id: `prophecy_${Date.now()}`,
        content: prophecyResult.prophecy,
        topic: sanitizedTopic,
        corruption_level: prophecyResult.corruption_level_applied || 'pristine',
        timestamp: new Date(),
        source_metrics: payload,
        visual_generated: false
      };

      set({ latestProphecy: newProphecy });

      // Step 2: Generate visuals if enabled
      const imageGenEnabled = import.meta.env.VITE_ENABLE_IMAGE_GENERATION === 'true';
      if (imageGenEnabled) {
        console.log('🎨 Image generation is enabled but not supported for apocryphal_scrolls table');
        // Skip visual generation since the table doesn't support images
      }

      // Step 3: Complete and switch to scrolls
      set({
        generationState: {
          isGenerating: false,
          currentStep: 'complete',
          progress: 'Prophecy manifested! The Oracle has spoken...'
        },
        activeTab: 'scrolls'
      });

      // Refresh scrolls to show the new prophecy
      setTimeout(() => {
        get().refreshScrolls();
      }, 1000);

    } catch (error) {
      console.error('🔮 Prophecy generation error:', error);
      set({
        generationState: {
          isGenerating: false,
          currentStep: 'idle',
          progress: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  },

  switchToTab: (tab: 'ritual' | 'chamber' | 'scrolls' | 'lore' | 'archive') => {
    console.log('🔮 Oracle Flow: Switching to tab:', tab);
    set({ activeTab: tab, highlightedLoreId: null });
  },

  highlightLoreEntry: (loreId: string) => {
    console.log('✨ Oracle Flow: Highlighting lore entry:', loreId);
    set({ activeTab: 'archive', highlightedLoreId: loreId });
  },

  clearHighlightedLoreEntry: () => {
    console.log('✨ Oracle Flow: Clearing highlight.');
    set({ highlightedLoreId: null });
  },

  generateScrollImage: async (scrollId: string) => {
    console.log('🎨 generateScrollImage called but images are not supported for apocryphal_scrolls table');
    console.log('🎨 ScrollId:', scrollId);
    // This function is kept for interface compatibility but does nothing
    // since the apocryphal_scrolls table doesn't have image columns
  },

  setupRealtimeSubscription: () => {
    // Check if already subscribed
    if (get().isSubscribed || globalOracleFlowSubscription) {
      console.log('🔮 Oracle Flow: Subscription already exists, returning existing cleanup function');
      return () => {
        if (globalOracleFlowSubscription) {
          console.log('🔮 Oracle Flow: Cleaning up existing subscription');
          globalOracleFlowSubscription.unsubscribe();
          globalOracleFlowSubscription = null;
          set({ isSubscribed: false });
        }
      };
    }

    console.log('🔮 Oracle Flow: Setting up NEW realtime subscription...');
    
    // Initial load
    get().refreshScrolls();

    // Subscribe to new scrolls with unique channel name
    const channelName = `oracle-flow-scrolls-${Date.now()}`;
    globalOracleFlowSubscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'apocryphal_scrolls'
        },
        (payload) => {
          console.log('🔮 Oracle Flow: New scroll received:', payload.new);
          const newScroll = payload.new as ScrollEntry;
          
          set((state) => ({
            scrolls: [newScroll, ...state.scrolls]
          }));
        }
      )
      .subscribe((status) => {
        console.log('🔮 Oracle Flow: Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          set({ isSubscribed: true });
        } else if (status === 'CLOSED') {
          set({ isSubscribed: false });
          globalOracleFlowSubscription = null;
        }
      });

    return () => {
      console.log('🔮 Oracle Flow: Cleaning up subscription');
      if (globalOracleFlowSubscription) {
        globalOracleFlowSubscription.unsubscribe();
        globalOracleFlowSubscription = null;
      }
      set({ isSubscribed: false });
    };
  },

  refreshScrolls: async () => {
    console.log('🔮 Oracle Flow: Refreshing scrolls...');
    console.log('🔮 Oracle Flow: Current store state before refresh:', {
      currentScrollsLength: get().scrolls.length,
      isCurrentlyLoading: get().isLoadingScrolls
    });
    
    set({ isLoadingScrolls: true });

    try {
      console.log('🔮 Oracle Flow: Making Supabase query...');
      const { data: scrollsData, error } = await supabase
        .from('apocryphal_scrolls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('🔮 Oracle Flow: Supabase query completed:', {
        hasError: !!error,
        dataLength: scrollsData?.length || 0,
        errorDetails: error
      });

      if (error) {
        throw error;
      }

      console.log('🔮 Oracle Flow: Setting scrolls data in store:', {
        scrollsLength: scrollsData?.length || 0,
        firstScrollId: scrollsData?.[0]?.id,
        firstScrollText: scrollsData?.[0]?.prophecy_text?.substring(0, 50)
      });
      
      set({ 
        scrolls: scrollsData || [],
        isLoadingScrolls: false 
      });
      
      console.log('🔮 Oracle Flow: Store updated successfully!');
    } catch (error) {
      console.error('🔮 Oracle Flow: Error loading scrolls:', error);
      set({ isLoadingScrolls: false });
    }
  }
}));
