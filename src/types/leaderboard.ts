export interface LeaderboardEntry {
  rank: number;
  player_address: string;
  display_name?: string;
  avatar_url?: string;
  score: number;
  category: 'total_girth' | 'mega_slaps' | 'giga_slaps' | 'tapping_speed' | 'achievements' | 'milestones';
  last_updated: string;
  rank_change?: number; // Positive for up, negative for down, 0 for no change
  is_new?: boolean; // True if this is a new entry
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  scoreLabel: string;
}

export interface PlayerProfile {
  address: string;
  display_name?: string;
  avatar_url?: string;
  total_score: number;
  join_date: string;
  last_active: string;
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

export interface WalletState {
  address?: string;
  isConnected: boolean;
  displayName?: string;
  avatarUrl?: string;
} 