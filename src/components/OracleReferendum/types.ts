/**
 * Oracle's Referendum System Types
 * 
 * Core type definitions for the Oracle's AI-powered polling system.
 */

export type PollCategory = 'prophecy' | 'lore' | 'game_evolution' | 'oracle_personality';

export interface PollOption {
  id: string;
  text: string;
  ai_reasoning?: string; // Why the Oracle suggested this option
  predicted_outcome?: string; // What the Oracle foresees if this wins
  votes: number;
  voters: string[]; // Wallet addresses of voters
  image_url?: string; // Optional visual representation
}

export interface CooldownInfo {
  can_vote: boolean;
  last_vote_at: Date | null;
  cooldown_expires_at: Date | null;
  hours_remaining: number;
}

export interface OraclePoll {
  id: string;
  title: string;
  description: string;
  category: PollCategory;
  ai_generated: boolean;
  voting_start: Date;
  voting_end: Date;
  options: PollOption[];
  oracle_shards_reward: number;
  girth_reward_pool?: number;
  required_authentication: 'siws';
  cooldown_hours: 24;
  oracle_personality: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  corruption_influence: number;
  status: 'active' | 'closed' | 'archived';
  created_at: Date;
  cooldown_info?: CooldownInfo | null;
  user_vote?: {
    option_id: string;
    voted_at: Date;
    oracle_shards_earned: number;
    voting_streak: number;
  } | null;
}

export interface OracleReferendumModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  
  /** Callback when modal should close */
  onClose: () => void;
  
  /** User's wallet connection status for participation */
  walletConnected?: boolean;
  
  /** User's wallet address for tracking votes */
  walletAddress?: string;
  
  /** Custom branding or title override */
  branding?: {
    title?: string;
    subtitle?: string;
  };
  
  /** Optional active poll ID to show initially */
  activePollId?: string;
  
  /** Current corruption level of the Oracle system */
  oracleCorruption?: number;
  
  /** Oracle personality currently active */
  oraclePersonality?: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
}

export interface VotingInterfaceProps {
  poll: OraclePoll;
  walletConnected: boolean;
  onVote: (pollId: string, optionId: string) => Promise<void>;
  oraclePersonality?: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  isVoting?: boolean;
}

export interface PollResultsProps {
  poll: OraclePoll;
  walletAddress?: string;
  oraclePersonality?: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  showDetails?: boolean;
  isCompact?: boolean;
}

export interface OracleCommentaryProps {
  commentaryText: string;
  oraclePersonality: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export interface OracleShardCounterProps {
  balance: number;
  totalEarned?: number;
  votingStreak?: number;
  animateIncrement?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface PollCardProps {
  poll: OraclePoll;
  onClick?: () => void;
  isActive?: boolean;
  oraclePersonality?: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  isCompact?: boolean;
}

export interface PollCategorySelectorProps {
  categories: PollCategory[];
  selectedCategory: PollCategory | 'all';
  onCategoryChange: (category: PollCategory | 'all') => void;
  oraclePersonality?: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
} 