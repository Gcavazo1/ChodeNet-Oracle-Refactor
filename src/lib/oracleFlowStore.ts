// Oracle Flow Store

import { create } from 'zustand';
import { supabase } from './supabase';
import { directAPI } from './directAPIIntegration';
import { sanitizeTopic } from './textUtils';

// Utility function to sanitize topic input
const sanitizeTopic = (topic: string): string => {
  return topic.replace(/[^\w\s_-]/g, '').trim();
};

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
  created_at?: string;
  prophecy_text?: string;
}

export interface ScrollEntry {
  id: string;
  created_at: string;
  prophecy_text: string;
  corruption_level: string;
  source_metrics_snapshot?: any;
}

// SEPARATED: Oracle Prophecy System State
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
  
  // PROPHECY SYSTEM ONLY: Flow Control
  prophecyActiveTab: 'ritual' | 'chamber' | 'scrolls';
  isSubscribed: boolean;
  
  // Actions
  selectTopic: (topicId: string | null) => void;
  generateProphecy: (girthMetrics: any) => Promise<void>;
  switchToProphecyTab: (tab: 'ritual' | 'chamber' | 'scrolls') => void;
  generateScrollImage: (scrollId: string) => Promise<void>;
  setupRealtimeSubscription: () => (() => void);
  refreshScrolls: () => Promise<void>;
}

// NEW: Oracle Lore System State (Separate)
interface OracleLoreStore {
  // LORE SYSTEM ONLY: Flow Control
  loreActiveTab: 'lore' | 'archive';
  highlightedLoreId: string | null;
  
  // Actions
  switchToLoreTab: (tab: 'lore' | 'archive') => void;
  highlightLoreEntry: (loreId: string) => void;
  clearHighlightedLoreEntry: () => void;
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

// ORACLE PROPHECY SYSTEM STORE (Separated)
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
  prophecyActiveTab: 'ritual', // RENAMED: Only for prophecy system
  isSubscribed: false,

  // Actions
  selectTopic: (topicId: string | null) => {
    console.log('🎯 Oracle Flow: Topic selected:', topicId);
    set({ 
      currentTopic: topicId,
      prophecyActiveTab: topicId ? 'chamber' : 'ritual', // UPDATED: Use prophecy-specific tab
      // Clear previous prophecy when selecting a new topic
      latestProphecy: null,
      // Reset generation state
      generationState: {
        isGenerating: false,
        currentStep: 'idle',
        progress: ''
      }
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
        prophecyActiveTab: 'scrolls' // UPDATED: Use prophecy-specific tab
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

  switchToProphecyTab: (tab: 'ritual' | 'chamber' | 'scrolls') => {
    console.log('🔮 Oracle Prophecy: Switching to tab:', tab);
    set({ prophecyActiveTab: tab }); // UPDATED: Use prophecy-specific tab
  },

  generateScrollImage: async (scrollId: string) => {
    const { generatingImages } = get();
    if (generatingImages.has(scrollId)) {
      console.log('🎨 Image already generating for scroll:', scrollId);
      return;
    }

    console.log('🎨 Starting image generation for scroll:', scrollId);
    
    set({
      generatingImages: new Set([...generatingImages, scrollId])
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-scroll-image', {
        body: { scroll_id: scrollId }
      });

      if (error) {
        throw error;
      }

      console.log('🎨 Image generation completed for scroll:', scrollId);
      
      // Refresh scrolls to show the new image
      get().refreshScrolls();
      
    } catch (error) {
      console.error('🎨 Image generation failed for scroll:', scrollId, error);
    } finally {
      const { generatingImages: currentGenerating } = get();
      const newGenerating = new Set(currentGenerating);
      newGenerating.delete(scrollId);
      set({ generatingImages: newGenerating });
    }
  },

  setupRealtimeSubscription: () => {
    if (globalOracleFlowSubscription) {
      console.log('🔮 Oracle Flow: Subscription already exists, skipping setup');
      return () => {};
    }

    console.log('🔮 Oracle Flow: Setting up realtime subscription for apocryphal_scrolls');
    
    const subscription = supabase
      .channel('apocryphal_scrolls_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apocryphal_scrolls'
        },
        (payload) => {
          console.log('🔮 Oracle Flow: Received realtime update:', payload);
          // Refresh scrolls when changes occur
          get().refreshScrolls();
        }
      )
      .subscribe((status) => {
        console.log('🔮 Oracle Flow: Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          set({ isSubscribed: true });
        }
      });

    globalOracleFlowSubscription = subscription;

    return () => {
      console.log('🔮 Oracle Flow: Cleaning up subscription');
      if (globalOracleFlowSubscription) {
        supabase.removeChannel(globalOracleFlowSubscription);
        globalOracleFlowSubscription = null;
      }
      set({ isSubscribed: false });
    };
  },

  refreshScrolls: async () => {
    console.log('🔮 Oracle Flow: Refreshing scrolls...');
    set({ isLoadingScrolls: true });

    try {
      const { data, error } = await supabase
        .from('apocryphal_scrolls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      console.log('🔮 Oracle Flow: Loaded scrolls:', data?.length || 0);
      set({ 
        scrolls: data || [],
        isLoadingScrolls: false 
      });

    } catch (error) {
      console.error('🔮 Oracle Flow: Error refreshing scrolls:', error);
      set({ isLoadingScrolls: false });
    }
  }
}));

// NEW: ORACLE LORE SYSTEM STORE (Separate)
export const useOracleLoreStore = create<OracleLoreStore>((set, get) => ({
  // Initial State
  loreActiveTab: 'lore', // Default to lore input
  highlightedLoreId: null,

  // Actions
  switchToLoreTab: (tab: 'lore' | 'archive') => {
    console.log('📖 Oracle Lore: Switching to tab:', tab);
    set({ loreActiveTab: tab, highlightedLoreId: null });
  },

  highlightLoreEntry: (loreId: string) => {
    console.log('✨ Oracle Lore: Highlighting lore entry:', loreId);
    set({ loreActiveTab: 'archive', highlightedLoreId: loreId });
  },

  clearHighlightedLoreEntry: () => {
    console.log('✨ Oracle Lore: Clearing highlight.');
    set({ highlightedLoreId: null });
  }
}));

// LEGACY COMPATIBILITY: Export old function names that redirect to new stores
export const switchToTab = (tab: 'ritual' | 'chamber' | 'scrolls' | 'lore' | 'archive') => {
  if (tab === 'lore' || tab === 'archive') {
    useOracleLoreStore.getState().switchToLoreTab(tab);
  } else {
    useOracleFlowStore.getState().switchToProphecyTab(tab);
  }
};

export const highlightLoreEntry = (loreId: string) => {
  useOracleLoreStore.getState().highlightLoreEntry(loreId);
};
