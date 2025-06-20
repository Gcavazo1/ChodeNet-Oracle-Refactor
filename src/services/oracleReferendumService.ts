import { createClient } from '@supabase/supabase-js';
import { PollCategory } from '../components/OracleReferendum/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Extended types for service layer (with database fields)
export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  ai_reasoning?: string;
  predicted_outcome?: string;
  image_url?: string;
  votes_count: number;
  created_at: Date;
}

export interface UserVoteInfo {
  option_id: string;
  voted_at: Date;
  oracle_shards_earned: number;
  voting_streak: number;
}

export interface CooldownInfo {
  can_vote: boolean;
  last_vote_at: Date | null;
  cooldown_expires_at: Date | null;
  hours_remaining: number;
}

export interface VoteRequest {
  pollId: string;
  optionId: string;
  walletAddress: string;
}

export interface VoteResponse {
  success: boolean;
  vote?: {
    id: string;
    poll_id: string;
    option_id: string;
    wallet_address: string;
    voted_at: Date;
    oracle_shards_earned: number;
    voting_streak: number;
    is_vote_change?: boolean;
    previous_vote_id?: string;
  };
  oracle_commentary?: {
    commentary_text: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  cooldown?: {
    can_vote: boolean;
    last_vote_at: Date;
    cooldown_expires_at: Date;
    hours_remaining: number;
  };
  updated_poll?: ServiceOraclePoll;
  error?: string;
}

// Service layer poll type with database fields
export interface ServiceOraclePoll {
  id: string;
  title: string;
  description: string;
  category: PollCategory;
  ai_generated: boolean;
  voting_start: Date;
  voting_end: Date;
  oracle_shards_reward: number;
  girth_reward_pool?: number;
  required_authentication: string;
  cooldown_hours: number;
  oracle_personality: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  corruption_influence: number;
  status: 'active' | 'closed' | 'archived';
  created_at: Date;
  created_by?: string;
  ai_prompt?: string;
  ai_response_raw?: Record<string, unknown>;
  options: PollOption[];
  user_vote?: UserVoteInfo | null;
  cooldown_info?: CooldownInfo | null;
  total_votes?: number;
}

export interface CreatePollRequest {
  title: string;
  description: string;
  category: string;
  voting_start: string;
  voting_end: string;
  oracle_shards_reward: number;
  girth_reward_pool?: number;
  required_authentication: string;
  cooldown_hours: number;
  oracle_personality: string;
  corruption_influence: number;
  options: {
    text: string;
    ai_reasoning?: string;
    predicted_outcome?: string;
    image_url?: string;
  }[];
  ai_prompt?: string;
}

export interface GeneratePollRequest {
  category: string;
  oracle_personality: string;
  corruption_influence?: number;
  gameMetrics?: {
    corruption: number;
    girth: number;
    morale: string;
    stability: string;
  };
  customPrompt?: string;
}

// Real-time subscription types
export type PollUpdateCallback = (poll: ServiceOraclePoll) => void;
export type VoteUpdateCallback = (pollId: string, optionId: string, newCount: number) => void;
export type CommentaryUpdateCallback = (pollId: string, commentary: string, urgency: string) => void;

// Supabase client type
type SupabaseClient = ReturnType<typeof createClient>;

/**
 * Oracle Referendum Service
 * Handles all communication with the Oracle Referendum backend system
 */
export class OracleReferendumService {
  private static instance: OracleReferendumService;
  private authToken: string | null = null;
  private subscriptions: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): OracleReferendumService {
    if (!OracleReferendumService.instance) {
      OracleReferendumService.instance = new OracleReferendumService();
    }
    return OracleReferendumService.instance;
  }

  /**
   * Set authentication token for admin operations
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Get request headers with authentication if available
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['x-session-token'] = this.authToken;
    }

    return headers;
  }

  /**
   * Set authentication token for admin operations
   */
  async authenticateUser(sessionToken: string, supabase: SupabaseClient) {
    try {
      console.log('🔐 Authenticating session token:', sessionToken.substring(0, 8) + '...')
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('wallet_sessions')
        .select('wallet_address, expires_at, is_active')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single()

      if (sessionError || !sessionData) {
        console.log('❌ Session validation failed:', sessionError?.message)
        return { success: false, error: 'Invalid or expired session' }
      }

      // Check if session has expired
      const now = new Date()
      const expiresAt = new Date(sessionData.expires_at as string)
      if (now > expiresAt) {
        console.log('❌ Session has expired')
        return { success: false, error: 'Session has expired' }
      }

      console.log('✅ Authentication successful for:', sessionData.wallet_address)
      return { 
        success: true, 
        wallet: sessionData.wallet_address 
      }
    } catch (error) {
      console.error('🔥 Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  /**
   * List all polls with optional user vote data
   */
  async listPolls(walletAddress?: string): Promise<{ polls: ServiceOraclePoll[] }> {
    try {
      console.log('🔮 Oracle Referendum: Listing polls from dedicated function', { 
        walletAddress, 
        hasAuthToken: !!this.authToken,
        authTokenLength: this.authToken?.length || 0
      })
      
      const headers = this.getHeaders()
      console.log('🔮 Oracle Referendum: Request headers', headers)
      
      const response = await supabase.functions.invoke('oracle-polls-list', {
        headers
      })

      console.log('🔮 Oracle Referendum: Response from oracle-polls-list', { 
        error: response.error, 
        hasData: !!response.data 
      })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch polls');
      }

      return response.data;
    } catch (error) {
      console.error('Error listing polls:', error);
      throw error;
    }
  }

  /**
   * Get a specific poll by ID with user vote data
   */
  async getPoll(pollId: string, walletAddress?: string): Promise<{ poll: ServiceOraclePoll }> {
    try {
      const response = await supabase.functions.invoke('manage-oracle-polls', {
        body: {
          action: 'get',
          pollId,
          walletAddress
        },
        headers: this.getHeaders()
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch poll');
      }

      return response.data;
    } catch (error) {
      console.error('Error getting poll:', error);
      throw error;
    }
  }

  /**
   * Create a new poll (admin only)
   */
  async createPoll(pollData: CreatePollRequest, walletAddress: string): Promise<{ success: boolean; poll: ServiceOraclePoll }> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication required for poll creation');
      }

      const response = await supabase.functions.invoke('manage-oracle-polls', {
        body: {
          action: 'create',
          data: pollData,
          walletAddress
        },
        headers: this.getHeaders()
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create poll');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Update an existing poll (admin only)
   */
  async updatePoll(pollId: string, pollData: Partial<CreatePollRequest>, walletAddress: string): Promise<{ success: boolean; poll: ServiceOraclePoll }> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication required for poll updates');
      }

      const response = await supabase.functions.invoke('manage-oracle-polls', {
        body: {
          action: 'update',
          pollId,
          data: pollData,
          walletAddress
        },
        headers: this.getHeaders()
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update poll');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating poll:', error);
      throw error;
    }
  }

  /**
   * Delete a poll (admin only)
   */
  async deletePoll(pollId: string, walletAddress: string): Promise<{ success: boolean }> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication required for poll deletion');
      }

      const response = await supabase.functions.invoke('manage-oracle-polls', {
        body: {
          action: 'delete',
          pollId,
          walletAddress
        },
        headers: this.getHeaders()
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete poll');
      }

      return response.data;
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  }

  /**
   * Generate an AI-powered poll (admin only)
   */
  async generatePoll(request: GeneratePollRequest, walletAddress: string): Promise<{ success: boolean; poll: ServiceOraclePoll; ai_response: Record<string, unknown> }> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication required for poll generation');
      }

      const response = await supabase.functions.invoke('manage-oracle-polls', {
        body: {
          action: 'generate',
          data: request,
          walletAddress
        },
        headers: this.getHeaders()
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate poll');
      }

      return response.data;
    } catch (error) {
      console.error('Error generating poll:', error);
      throw error;
    }
  }

  /**
   * Check cooldown status for a specific poll and user
   */
  async checkCooldownStatus(pollId: string, walletAddress: string): Promise<CooldownInfo> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication required for cooldown checking');
      }

      console.log('🕐 Checking cooldown status for poll:', { pollId, walletAddress });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/oracle-vote`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'check_cooldown',
          pollId,
          walletAddress
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cooldown) {
          return {
            can_vote: data.cooldown.can_vote,
            last_vote_at: data.cooldown.last_vote_at ? new Date(data.cooldown.last_vote_at) : null,
            cooldown_expires_at: data.cooldown.cooldown_expires_at ? new Date(data.cooldown.cooldown_expires_at) : null,
            hours_remaining: data.cooldown.hours_remaining
          };
        }
      } else if (response.status === 400) {
        // Parse cooldown info from error response
        const errorData = await response.json();
        if (errorData.cooldown) {
          console.log('🕐 Cooldown active, parsed from error response:', errorData.cooldown);
          return {
            can_vote: false,
            last_vote_at: errorData.cooldown.last_vote_at ? new Date(errorData.cooldown.last_vote_at) : null,
            cooldown_expires_at: errorData.cooldown.cooldown_expires_at ? new Date(errorData.cooldown.cooldown_expires_at) : null,
            hours_remaining: errorData.cooldown.hours_remaining
          };
        }
      }

      // Default: assume user can vote (e.g., first time voting)
      return {
        can_vote: true,
        last_vote_at: null,
        cooldown_expires_at: null,
        hours_remaining: 0
      };
    } catch (error) {
      console.error('Error checking cooldown status:', error);
      // Default to allowing vote attempt (graceful degradation)
      return {
        can_vote: true,
        last_vote_at: null,
        cooldown_expires_at: null,
        hours_remaining: 0
      };
    }
  }

  /**
   * Cast a vote on a poll
   */
  async vote(voteRequest: VoteRequest): Promise<VoteResponse> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication required for voting');
      }

      console.log('🔮 Oracle Referendum: Submitting vote to dedicated voting function', {
        pollId: voteRequest.pollId,
        optionId: voteRequest.optionId,
        walletAddress: voteRequest.walletAddress,
        hasAuthToken: !!this.authToken
      });

      // 🚨 NEW APPROACH: Use dedicated oracle-vote function with clean request body
      const voteData = {
        pollId: voteRequest.pollId,
        optionId: voteRequest.optionId,
        walletAddress: voteRequest.walletAddress
      };
      
      console.log('🔮 Oracle Referendum: Vote data being sent to oracle-vote function', voteData);

      // 🚨 BYPASS SUPABASE CLIENT: Use raw fetch for complete header control
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/oracle-vote`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(voteData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // If parsing fails, treat as plain text error
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Check if this is a cooldown error with structured data
        if (errorData.cooldown && response.status === 400) {
          console.log('🕐 Cooldown error received:', errorData);
          // Create a special error that includes cooldown info
          const cooldownError = new Error(errorData.error || 'Cooldown active');
          (cooldownError as any).cooldown = errorData.cooldown;
          throw cooldownError;
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      console.log('🔮 Oracle Referendum: Raw response from oracle-vote', {
        hasError: false,
        hasData: !!responseData,
        status: response.status,
        data: responseData
      });

      if (!responseData?.success) {
        throw new Error(responseData?.error || 'Vote was not successful');
      }

      console.log('✅ Vote successful!', responseData);
      return responseData;
    } catch (error) {
      console.error('🔴 Oracle Referendum: Vote submission failed', error);
      throw error;
    }
  }

  /**
   * Get Oracle commentary for a poll
   */
  async getOracleCommentary(pollId: string): Promise<{ commentary: Record<string, unknown>[] }> {
    try {
      const response = await supabase.functions.invoke('manage-oracle-polls', {
        body: {
          action: 'commentary',
          pollId: pollId
        },
        headers: this.getHeaders()
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch Oracle commentary');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching Oracle commentary:', error);
      throw error;
    }
  }

  /**
   * Check if a poll is currently active for voting
   */
  isPollActive(poll: ServiceOraclePoll): boolean {
    const now = new Date();
    const endTime = poll.voting_end instanceof Date ? poll.voting_end : new Date(poll.voting_end);
    const startTime = poll.voting_start instanceof Date ? poll.voting_start : new Date(poll.voting_start);
    
    // Check if dates are valid
    if (isNaN(endTime.getTime()) || isNaN(startTime.getTime())) {
      console.warn('Invalid poll dates:', { start: poll.voting_start, end: poll.voting_end });
      return false;
    }
    
    // A poll is active if:
    // 1. It's within the voting window (start <= now <= end)
    // 2. AND either the status is 'active' OR the time hasn't expired yet (allowing for database lag)
    const withinTimeWindow = now >= startTime && now <= endTime;
    const statusAllowsVoting = poll.status === 'active' || withinTimeWindow;
    
    return withinTimeWindow && statusAllowsVoting;
  }

  /**
   * Check if user has already voted on a poll
   */
  hasUserVoted(poll: ServiceOraclePoll): boolean {
    return poll.user_vote !== null && poll.user_vote !== undefined;
  }

  /**
   * Get time remaining for a poll
   */
  getTimeRemaining(poll: ServiceOraclePoll): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } {
    const now = new Date();
    // Ensure endTime is a Date object, handle both Date objects and strings
    const endTime = poll.voting_end instanceof Date ? poll.voting_end : new Date(poll.voting_end);
    
    // Check if the date is valid
    if (isNaN(endTime.getTime())) {
      console.warn('Invalid voting_end date for poll:', poll.id, poll.voting_end);
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    
    const timeDiff = endTime.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  }

  /**
   * Format Oracle personality for display
   */
  formatOraclePersonality(personality: string): string {
    switch (personality) {
      case 'pure_prophet':
        return 'Pure Prophet';
      case 'chaotic_sage':
        return 'Chaotic Sage';
      case 'corrupted_oracle':
        return 'Corrupted Oracle';
      default:
        return personality;
    }
  }

  /**
   * Get Oracle personality color theme
   */
  getOraclePersonalityTheme(personality: string): {
    primary: string;
    secondary: string;
    glow: string;
    text: string;
  } {
    switch (personality) {
      case 'pure_prophet':
        return {
          primary: 'from-amber-400 to-yellow-500',
          secondary: 'bg-amber-500/20',
          glow: 'shadow-amber-500/30',
          text: 'text-amber-400'
        };
      case 'chaotic_sage':
        return {
          primary: 'from-purple-400 to-violet-500',
          secondary: 'bg-purple-500/20',
          glow: 'shadow-purple-500/30',
          text: 'text-purple-400'
        };
      case 'corrupted_oracle':
        return {
          primary: 'from-red-400 to-rose-500',
          secondary: 'bg-red-500/20',
          glow: 'shadow-red-500/30',
          text: 'text-red-400'
        };
      default:
        return {
          primary: 'from-blue-400 to-indigo-500',
          secondary: 'bg-blue-500/20',
          glow: 'shadow-blue-500/30',
          text: 'text-blue-400'
        };
    }
  }

  /**
   * Format poll category for display
   */
  formatPollCategory(category: string): string {
    switch (category) {
      case 'prophecy':
        return 'Oracle Prophecy';
      case 'lore':
        return 'Lore Direction';
      case 'game_evolution':
        return 'Game Evolution';
      case 'oracle_personality':
        return 'Oracle Personality';
      default:
        return category;
    }
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: string): string {
    switch (category) {
      case 'prophecy':
        return '🔮';
      case 'lore':
        return '📜';
      case 'game_evolution':
        return '🎮';
      case 'oracle_personality':
        return '🏛️';
      default:
        return '❓';
    }
  }

  /**
   * Calculate vote percentage for an option
   */
  calculateVotePercentage(option: PollOption, poll: ServiceOraclePoll): number {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes_count, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes_count / totalVotes) * 100);
  }

  /**
   * Get winning option(s) for a poll
   */
  getWinningOptions(poll: ServiceOraclePoll): PollOption[] {
    const maxVotes = Math.max(...poll.options.map(opt => opt.votes_count));
    return poll.options.filter(opt => opt.votes_count === maxVotes);
  }

  /**
   * Subscribe to real-time poll updates
   */
  subscribeToPollUpdates(callback: PollUpdateCallback): () => void {
    console.log('🔴 Setting up real-time poll updates subscription')
    
    const subscription = supabase
      .channel('oracle-polls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'oracle_polls'
        },
        (payload) => {
          console.log('📡 Poll update received:', payload)
          if (payload.new) {
            // Transform and notify
            const transformedPoll = this.transformPoll(payload.new)
            callback(transformedPoll)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_options'
        },
        (payload) => {
          console.log('📡 Poll option update received:', payload)
          // When options change, we need to refetch the full poll
          // This is a simplified approach - in production you might want to be more granular
        }
      )
      .subscribe((status) => {
        console.log('📡 Poll subscription status:', status)
      })

    return () => {
      console.log('🔴 Unsubscribing from poll updates')
      subscription.unsubscribe()
    }
  }

  /**
   * Subscribe to real-time vote updates for a specific poll
   */
  subscribeToVoteUpdates(pollId: string, callback: VoteUpdateCallback): () => void {
    console.log(`🔴 Setting up vote updates subscription for poll: ${pollId}`)
    
    const subscription = supabase
      .channel(`poll-votes-${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_votes',
          filter: `poll_id=eq.${pollId}`
        },
        async (payload) => {
          console.log('📡 New vote received:', payload)
          if (payload.new) {
            const vote = payload.new as any
            // Get updated vote count for the option
            const { data: option } = await supabase
              .from('poll_options')
              .select('votes_count')
              .eq('id', vote.option_id)
              .single()
            
            if (option) {
              callback(pollId, vote.option_id, option.votes_count)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Vote subscription status for ${pollId}:`, status)
      })

    return () => {
      console.log(`🔴 Unsubscribing from vote updates for poll: ${pollId}`)
      subscription.unsubscribe()
    }
  }

  /**
   * Subscribe to Oracle commentary updates
   */
  subscribeToCommentary(pollId: string, callback: CommentaryUpdateCallback): () => void {
    console.log(`🔴 Setting up commentary subscription for poll: ${pollId}`)
    
    // For now, this is a placeholder since we don't have a commentary table yet
    // In the future, this would subscribe to oracle_commentary table changes
    
    const subscription = supabase
      .channel(`poll-commentary-${pollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'oracle_responses', // Assuming this table exists for commentary
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          console.log('📡 Commentary update received:', payload)
          if (payload.new) {
            const commentary = payload.new as any
            callback(pollId, commentary.response_text, commentary.urgency || 'low')
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Commentary subscription status for ${pollId}:`, status)
      })

    return () => {
      console.log(`🔴 Unsubscribing from commentary for poll: ${pollId}`)
      subscription.unsubscribe()
    }
  }

  // Cleanup all subscriptions
  unsubscribeAll(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe())
    this.subscriptions.clear()
  }

  // Transform database poll to our interface
  private transformPoll(poll: any): ServiceOraclePoll {
    const votingStart = new Date(poll.voting_start);
    const votingEnd = new Date(poll.voting_end);
    const now = new Date();
    
    // Automatically determine the correct status based on time
    let status = poll.status;
    if (now < votingStart) {
      status = 'active'; // Upcoming poll
    } else if (now > votingEnd) {
      status = 'closed'; // Expired poll
    } else if (now >= votingStart && now <= votingEnd) {
      status = 'active'; // Currently active
    }
    
    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      category: poll.category,
      ai_generated: poll.ai_generated,
      voting_start: votingStart,
      voting_end: votingEnd,
      oracle_shards_reward: poll.oracle_shards_reward,
      girth_reward_pool: poll.girth_reward_pool,
      required_authentication: poll.required_authentication,
      cooldown_hours: poll.cooldown_hours,
      oracle_personality: poll.oracle_personality,
      corruption_influence: poll.corruption_influence,
      status: status, // Use the auto-calculated status
      created_at: new Date(poll.created_at),
      options: poll.options?.map((opt: any) => ({
        id: opt.id,
        poll_id: opt.poll_id,
        text: opt.text,
        ai_reasoning: opt.ai_reasoning,
        predicted_outcome: opt.predicted_outcome,
        image_url: opt.image_url,
        votes_count: opt.votes_count,
        created_at: new Date(opt.created_at)
      })) || [],
      total_votes: poll.total_votes?.[0]?.count || 0,
      user_vote: poll.user_vote?.[0] ? {
        option_id: poll.user_vote[0].option_id,
        voted_at: new Date(poll.user_vote[0].voted_at),
        oracle_shards_earned: poll.user_vote[0].oracle_shards_earned || 0,
        voting_streak: poll.user_vote[0].voting_streak || 0
      } : undefined,
      cooldown_info: poll.cooldown_info?.[0] ? {
        can_vote: poll.cooldown_info[0].can_vote,
        last_vote_at: poll.cooldown_info[0].last_vote_at ? new Date(poll.cooldown_info[0].last_vote_at) : null,
        cooldown_expires_at: poll.cooldown_info[0].cooldown_expires_at ? new Date(poll.cooldown_info[0].cooldown_expires_at) : null,
        hours_remaining: poll.cooldown_info[0].hours_remaining
      } : undefined
    }
  }
}

// Export singleton instance
export const oracleReferendumService = OracleReferendumService.getInstance(); 