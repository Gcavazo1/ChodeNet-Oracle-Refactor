import { create } from 'zustand';
import { LeaderboardEntry, LeaderboardState, WalletState } from '../types/leaderboard';
import { LEADERBOARD_CATEGORIES } from '../data/categories';
import { generateAllMockData, generateMockEntries } from '../data/mockGenerator';
import { sanitizeLeaderboardData, validateApiResponse } from '../utils/dataValidation';

// Types for the leaderboard system
export interface LeaderboardEntry {
  rank: number;
  player_address: string;
  display_name?: string;
  avatar_url?: string;
  score: number;
  category: 'total_girth' | 'mega_slaps' | 'giga_slaps' | 'tapping_speed' | 'achievements' | 'milestones';
  last_updated: string;
  rank_change?: number;
  is_new?: boolean;
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  scoreLabel: string;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  categories: LeaderboardCategory[];
  isLoading: boolean;
  lastUpdated: string;
  timePeriod: 'daily' | 'weekly' | 'all-time';
  connectedWallet?: string;
  isWalletConnected: boolean;
  realTimeEnabled: boolean;
}

interface LeaderboardStore extends LeaderboardState {
  // Actions
  loadMockData: () => void;
  generateCategoryData: (category: string, count?: number) => void;
  clearData: () => void;
  updateEntry: (entry: LeaderboardEntry) => void;
  getEntriesByCategory: (category: string) => LeaderboardEntry[];
  getTopPlayers: (limit?: number) => LeaderboardEntry[];
  setTimePeriod: (period: 'daily' | 'weekly' | 'all-time') => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  toggleRealTime: () => void;
  simulateRealTimeUpdate: () => void;
  getCurrentPlayerRank: (category: string) => LeaderboardEntry | null;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // Performance tracking
  lastUpdateDuration: number;
}

// Mock wallet addresses for simulation
const MOCK_WALLETS = [
  { address: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4', displayName: 'OracleSeeker', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oracle1' },
  { address: '0x8ba1f109551bD432803012645Hac189451c9b8D4', displayName: 'MysticGamer', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oracle2' },
  { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', displayName: 'DivineTapper', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oracle3' }
];

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  // Initial state
  entries: [],
  categories: LEADERBOARD_CATEGORIES,
  isLoading: false,
  lastUpdated: new Date().toISOString(),
  timePeriod: 'all-time',
  connectedWallet: undefined,
  isWalletConnected: false,
  realTimeEnabled: false,
  error: null,
  lastUpdateDuration: 0,

  // Error handling
  setError: (error: string | null) => {
    set({ error });
  },

  // Actions
  loadMockData: () => {
    const startTime = performance.now();
    set({ isLoading: true, error: null });
    
    // Simulate API delay with error handling
    setTimeout(() => {
      try {
        const mockEntries = generateAllMockData();
        const sanitizedEntries = sanitizeLeaderboardData(mockEntries);
        const endTime = performance.now();
        
        set({
          entries: sanitizedEntries,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
          lastUpdateDuration: endTime - startTime,
          error: null
        });
      } catch (error) {
        console.error('Failed to load mock data:', error);
        set({
          isLoading: false,
          error: 'Failed to load Oracle data. The mystical connection was disrupted.'
        });
      }
    }, 800);
  },

  generateCategoryData: (category: string, count = 25) => {
    const startTime = performance.now();
    set({ isLoading: true, error: null });
    
    setTimeout(() => {
      try {
        const state = get();
        const newEntries = generateMockEntries(category, count);
        const sanitizedNewEntries = sanitizeLeaderboardData(newEntries);
        
        // Remove existing entries for this category
        const filteredEntries = state.entries.filter(entry => entry.category !== category);
        const endTime = performance.now();
        
        set({
          entries: [...filteredEntries, ...sanitizedNewEntries],
          isLoading: false,
          lastUpdated: new Date().toISOString(),
          lastUpdateDuration: endTime - startTime,
          error: null
        });
      } catch (error) {
        console.error('Failed to generate category data:', error);
        set({
          isLoading: false,
          error: `Failed to generate data for ${category}. The Oracle visions are unclear.`
        });
      }
    }, 500);
  },

  clearData: () => {
    set({
      entries: [],
      lastUpdated: new Date().toISOString(),
      error: null
    });
  },

  updateEntry: (updatedEntry: LeaderboardEntry) => {
    try {
      const state = get();
      const updatedEntries = state.entries.map(entry =>
        entry.player_address === updatedEntry.player_address && entry.category === updatedEntry.category
          ? updatedEntry
          : entry
      );
      
      set({
        entries: updatedEntries,
        lastUpdated: new Date().toISOString(),
        error: null
      });
    } catch (error) {
      console.error('Failed to update entry:', error);
      get().setError('Failed to update Oracle entry.');
    }
  },

  getEntriesByCategory: (category: string) => {
    try {
      const state = get();
      return state.entries
        .filter(entry => entry.category === category)
        .sort((a, b) => a.rank - b.rank);
    } catch (error) {
      console.error('Failed to get entries by category:', error);
      return [];
    }
  },

  getTopPlayers: (limit = 10) => {
    try {
      const state = get();
      return state.entries
        .filter(entry => entry.category === 'total_girth')
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get top players:', error);
      return [];
    }
  },

  setTimePeriod: (period: 'daily' | 'weekly' | 'all-time') => {
    set({ timePeriod: period, isLoading: true, error: null });
    
    // Simulate data refresh for different time periods
    setTimeout(() => {
      try {
        const state = get();
        let multiplier = 1;
        
        // Adjust scores based on time period
        if (period === 'daily') multiplier = 0.1;
        else if (period === 'weekly') multiplier = 0.4;
        
        const adjustedEntries = state.entries.map(entry => ({
          ...entry,
          score: Math.floor(entry.score * multiplier) || 1
        }));
        
        // Re-rank entries
        const categorizedEntries = LEADERBOARD_CATEGORIES.map(cat => {
          const categoryEntries = adjustedEntries
            .filter(entry => entry.category === cat.id)
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));
          return categoryEntries;
        }).flat();
        
        set({
          entries: categorizedEntries,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
          error: null
        });
      } catch (error) {
        console.error('Failed to set time period:', error);
        set({
          isLoading: false,
          error: 'Failed to update time period. The Oracle timeline is unstable.'
        });
      }
    }, 600);
  },

  connectWallet: () => {
    try {
      const mockWallet = MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)];
      set({
        connectedWallet: mockWallet.address,
        isWalletConnected: true,
        error: null
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      get().setError('Failed to connect Oracle wallet. The mystical link is broken.');
    }
  },

  disconnectWallet: () => {
    set({
      connectedWallet: undefined,
      isWalletConnected: false,
      error: null
    });
  },

  toggleRealTime: () => {
    const state = get();
    set({ realTimeEnabled: !state.realTimeEnabled, error: null });
  },

  simulateRealTimeUpdate: () => {
    try {
      const state = get();
      if (!state.realTimeEnabled || state.entries.length === 0) return;

      // Randomly update 1-3 entries
      const entriesToUpdate = Math.floor(Math.random() * 3) + 1;
      const updatedEntries = [...state.entries];
      
      for (let i = 0; i < entriesToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * updatedEntries.length);
        const entry = updatedEntries[randomIndex];
        
        // Small score increase (1-10% of current score)
        const scoreIncrease = Math.floor(entry.score * (Math.random() * 0.1 + 0.01));
        updatedEntries[randomIndex] = {
          ...entry,
          score: entry.score + scoreIncrease,
          last_updated: new Date().toISOString()
        };
      }

      // Re-rank entries by category
      const categorizedEntries = LEADERBOARD_CATEGORIES.map(cat => {
        const categoryEntries = updatedEntries
          .filter(entry => entry.category === cat.id)
          .sort((a, b) => b.score - a.score)
          .map((entry, index) => {
            const oldRank = entry.rank;
            const newRank = index + 1;
            return {
              ...entry,
              rank: newRank,
              rank_change: oldRank - newRank // Positive means moved up
            };
          });
        return categoryEntries;
      }).flat();

      set({
        entries: categorizedEntries,
        lastUpdated: new Date().toISOString(),
        error: null
      });
    } catch (error) {
      console.error('Failed to simulate real-time update:', error);
      get().setError('Real-time update failed. The Oracle feed is unstable.');
    }
  },

  getCurrentPlayerRank: (category: string) => {
    try {
      const state = get();
      if (!state.connectedWallet) return null;
      
      return state.entries.find(
        entry => entry.player_address === state.connectedWallet && entry.category === category
      ) || null;
    } catch (error) {
      console.error('Failed to get current player rank:', error);
      return null;
    }
  }
})); 