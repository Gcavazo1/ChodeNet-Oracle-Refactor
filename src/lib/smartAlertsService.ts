// 🚨 SMART ALERTS SERVICE
// Manages SmartAlertsBar configuration and backend data integration
// Connects admin controls to real-time alert generation

import { Alert } from '../components/SmartAlertsBar/SmartAlertsBar';
import { supabase } from './supabase';

export interface SmartAlertsConfig {
  demoMode: boolean;
  realTimeEnabled: boolean;
  backendSources: {
    oracleCommunication: boolean;
    communityData: boolean;
    gameEvents: boolean;
    loreSystem: boolean;
  };
  oracleComms: {
    prophecyAlerts: boolean;
    legendaryEvents: boolean;
    corruptionAlerts: boolean;
    legendaryThreshold: number; // Minimum significance for legendary events
  };
  communityPolling: {
    newPollAlerts: boolean;
    endingSoonWarnings: boolean;
    highStakesPolls: boolean;
    votingMilestones: boolean;
    highStakesThreshold: number; // Minimum $GIRTH pool for high-stakes alerts
    endingSoonHours: number; // Hours before voting end to trigger warning
  };
  // Phase 3: Game Events & Community Milestones Controls
  gameEvents: {
    girthAchievements: boolean;
    communityMilestones: boolean;
    leaderboardEntries: boolean;
    recordBreaking: boolean;
    topTenChanges: boolean;
    oracleIndexChanges: boolean;
    girthThreshold: number; // Minimum girth for achievement alerts (100K, 1M, etc.)
    leaderboardTopCount: number; // Track top N positions (default 10)
  };
  // Phase 4: Lore System Integration Controls
  loreSystem: {
    loreCycleAlerts: boolean;          // New lore cycles starting/completing
    loreGenerationAlerts: boolean;     // New lore entries published
    comicPanelAlerts: boolean;         // Comic panel generation completed
    legendarySubmissions: boolean;     // High oracle_significance contributions
    corruptionInfluencedLore: boolean; // Corruption-influenced lore entries
    popularLoreAlerts: boolean;        // High view/like count lore entries
    communityParticipation: boolean;   // Community participation achievements
    entriesPerCycleCounter: boolean;   // Show entries count per cycle in alerts
    popularityThreshold: number;       // Minimum views/likes for popular alerts (default 50)
    participationThreshold: number;    // Minimum participants for participation alerts (default 5)
  };
}

export interface BackendAlert {
  id: string;
  source: 'oracle' | 'community' | 'game' | 'lore' | 'system';
  type: Alert['type'];
  title: string;
  message: string;
  icon: string;
  priority: Alert['priority'];
  timestamp: Date;
  dismissible?: boolean;
  autoHide?: boolean;
  hideAfter?: number;
  metadata?: Record<string, any>;
}

class SmartAlertsService {
  private config: SmartAlertsConfig = {
    demoMode: true,
    realTimeEnabled: true,
    backendSources: {
      oracleCommunication: true,
      communityData: true,
      gameEvents: true,
      loreSystem: true
    },
    oracleComms: {
      prophecyAlerts: true,
      legendaryEvents: true,
      corruptionAlerts: true,
      legendaryThreshold: 90
    },
    communityPolling: {
      newPollAlerts: true,
      endingSoonWarnings: true,
      highStakesPolls: true,
      votingMilestones: true,
      highStakesThreshold: 1500, // $GIRTH threshold for high-stakes
      endingSoonHours: 2 // Alert when polls end within 2 hours
    },
    // Phase 3: Game Events & Community Milestones Controls
    gameEvents: {
      girthAchievements: true,
      communityMilestones: true,
      leaderboardEntries: true,
      recordBreaking: true,
      topTenChanges: true,
      oracleIndexChanges: true,
      girthThreshold: 100000, // Minimum girth for achievement alerts (100K, 1M, etc.)
      leaderboardTopCount: 10 // Track top N positions (default 10)
    },
    // Phase 4: Lore System Integration Controls
    loreSystem: {
      loreCycleAlerts: true,          // New lore cycles starting/completing
      loreGenerationAlerts: true,     // New lore entries published
      comicPanelAlerts: true,         // Comic panel generation completed
      legendarySubmissions: true,     // High oracle_significance contributions
      corruptionInfluencedLore: true, // Corruption-influenced lore entries
      popularLoreAlerts: true,        // High view/like count lore entries
      communityParticipation: true,   // Community participation achievements
      entriesPerCycleCounter: true,   // Show entries count per cycle in alerts
      popularityThreshold: 50,        // Minimum views/likes for popular alerts (default 50)
      participationThreshold: 5        // Minimum participants for participation alerts (default 5)
    }
  };

  private alertCallbacks: Set<(alerts: Alert[]) => void> = new Set();
  private currentAlerts: Alert[] = [];
  private subscriptions: any[] = [];

  constructor() {
    this.loadConfig();
    this.setupRealtimeSubscriptions();
  }

  // === CONFIGURATION MANAGEMENT ===

  public updateConfig(updates: Partial<SmartAlertsConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    
    // Dispatch custom event for admin panel
    window.dispatchEvent(new CustomEvent('smartAlertsConfigUpdated', {
      detail: this.config
    }));

    // Update subscriptions based on new config
    this.updateSubscriptions();
  }

  public getConfig(): SmartAlertsConfig {
    return { ...this.config };
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('smart_alerts_config');
      if (stored) {
        const config = JSON.parse(stored);
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      console.error('Failed to load SmartAlerts config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('smart_alerts_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save SmartAlerts config:', error);
    }
  }

  // === ALERT MANAGEMENT ===

  public onAlertsUpdate(callback: (alerts: Alert[]) => void): void {
    this.alertCallbacks.add(callback);
    // Send current alerts immediately
    callback(this.currentAlerts);
  }

  public offAlertsUpdate(callback: (alerts: Alert[]) => void): void {
    this.alertCallbacks.delete(callback);
  }

  private notifyCallbacks(): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(this.currentAlerts);
      } catch (error) {
        console.error('Error in SmartAlerts callback:', error);
      }
    });
  }

  public addAlert(alert: BackendAlert): void {
    console.log('🚨 Adding new alert:', alert.source, alert.type, alert.title);
    console.log('🚨 Alert details:', alert);
    
    const newAlert: Alert = {
      id: alert.id,
      source: alert.source, // 🔧 FIX: Copy source field for navigation
      type: alert.type,
      title: alert.title,
      message: alert.message,
      icon: alert.icon,
      priority: alert.priority,
      timestamp: alert.timestamp,
      dismissible: alert.dismissible ?? true,
      autoHide: alert.autoHide ?? false,
      hideAfter: alert.hideAfter,
      metadata: alert.metadata // 🔧 FIX: Copy metadata field for navigation
    };

    // Add to current alerts (newest first)
    this.currentAlerts = [newAlert, ...this.currentAlerts.slice(0, 19)]; // Keep max 20 alerts
    
    console.log('🚨 Total alerts now:', this.currentAlerts.length);
    console.log('🚨 Current alerts list:', this.currentAlerts.map(a => ({ id: a.id, title: a.title })));
    
    this.notifyCallbacks();
    console.log('🚨 Callbacks notified. Callback count:', this.alertCallbacks.size);
  }

  public removeAlert(alertId: string): void {
    this.currentAlerts = this.currentAlerts.filter(alert => alert.id !== alertId);
    this.notifyCallbacks();
  }

  public clearAlerts(): void {
    this.currentAlerts = [];
    this.notifyCallbacks();
  }

  // === BACKEND DATA SOURCES ===

  private updateSubscriptions(): void {
    // Clean up existing subscriptions
    this.subscriptions.forEach(sub => {
      try {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      } catch (error) {
        console.error('Error cleaning up subscription:', error);
      }
    });
    this.subscriptions = [];

    if (!this.config.realTimeEnabled) return;

    // Setup new subscriptions based on config
    if (this.config.backendSources.oracleCommunication) {
      this.setupOracleCommunicationAlerts();
    }

    if (this.config.backendSources.communityData) {
      this.setupCommunityDataAlerts();
    }

    if (this.config.backendSources.gameEvents) {
      this.setupGameEventAlerts();
    }

    if (this.config.backendSources.loreSystem) {
      this.setupLoreSystemAlerts();
    }
  }

  private setupRealtimeSubscriptions(): void {
    this.updateSubscriptions();
  }

  // === ORACLE COMMUNICATION ALERTS ===

  private setupOracleCommunicationAlerts(): void {
    console.log('🚨 Setting up Oracle Communication alerts (Phase 1: Selective)...');
    
    // 🔮 Subscribe to Apocryphal Scrolls (Prophecy Born alerts)
    if (this.config.oracleComms.prophecyAlerts) {
      const prophecySubscription = supabase
        .channel('oracle_prophecy_alerts')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'apocryphal_scrolls' },
          (payload) => this.handleProphecyBorn(payload.new)
        )
        .subscribe();

      this.subscriptions.push(prophecySubscription);
      console.log('🔮 Subscribed to prophecy alerts');
      
      // Load recent prophecies as initial alerts
      this.loadRecentProphecies();
    }

    // ⚡ Subscribe to Legendary Game Events (Ultra-selective)
    if (this.config.oracleComms.legendaryEvents) {
      const legendaryEventsSubscription = supabase
        .channel('oracle_legendary_events')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'live_game_events' },
          (payload) => this.handleLegendaryGameEvent(payload.new)
        )
        .subscribe();

      this.subscriptions.push(legendaryEventsSubscription);
      console.log('⚡ Subscribed to legendary game events');
      
      // Load recent legendary events as initial alerts
      this.loadRecentLegendaryEvents();
    }

    // 🌀 Subscribe to Corrupted Prophecies (Corruption-level filtering)
    if (this.config.oracleComms.corruptionAlerts) {
      const corruptionSubscription = supabase
        .channel('oracle_corruption_alerts')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'apocryphal_scrolls' },
          (payload) => this.handleCorruptedProphecy(payload.new)
        )
        .subscribe();

      this.subscriptions.push(corruptionSubscription);
      console.log('🌀 Subscribed to corruption alerts');
    }
  }

  // 🔮 PHASE 1: Prophecy Born Alert Handler
  private handleProphecyBorn(prophecy: any): void {
    if (!prophecy.prophecy_text || !prophecy.created_at) return;

    console.log('🔮 New prophecy detected:', prophecy.id);

    // Extract first sentence or 80 characters for preview
    const preview = prophecy.prophecy_text.length > 80 
      ? prophecy.prophecy_text.substring(0, 77) + '...'
      : prophecy.prophecy_text;

    this.addAlert({
      id: `prophecy_${prophecy.id}`,
      source: 'oracle',
      type: 'prophecy',
      title: 'Oracle Prophecy Born',
      message: `New divine vision received: "${preview}"`,
      icon: this.getCorruptionIcon(prophecy.corruption_level),
      priority: prophecy.corruption_level === 'pristine' ? 'high' : 'critical',
      timestamp: new Date(prophecy.created_at),
      dismissible: true,
      autoHide: false,
      metadata: { 
        prophecyId: prophecy.id, 
        corruption: prophecy.corruption_level,
        fullText: prophecy.prophecy_text 
      }
    });
  }

  // ⚡ PHASE 1: Legendary Game Event Handler (Ultra-Selective)
  private handleLegendaryGameEvent(event: any): void {
    if (!event.event_type || !event.event_payload) return;

    // ⚡ ULTRA-SELECTIVE: Only legendary significance events
    const isLegendary = event.event_payload?.oracle_significance === 'legendary';
    
    if (!isLegendary) {
      console.log('🚨 Skipping non-legendary event:', event.event_type);
      return;
    }

    console.log('⚡ LEGENDARY EVENT DETECTED:', event.event_type, event.event_payload);

    // Format legendary event based on type
    let title = 'LEGENDARY EVENT';
    let message = 'Something extraordinary has occurred!';
    let icon = '⚡';

    if (event.event_type === 'giga_slap_burst') {
      const payload = event.event_payload;
      title = 'LEGENDARY GIGA SLAP BURST';
      message = `Player unleashed ${payload.slap_count} consecutive Giga Slaps! Streak: ${payload.max_streak_in_batch} | Total Power: ${payload.total_giga_slaps}`;
      icon = '💥';
    }

    this.addAlert({
      id: `legendary_${event.id}`,
      source: 'oracle',
      type: 'milestone',
      title,
      message,
      icon,
      priority: 'critical',
      timestamp: new Date(event.created_at),
      dismissible: true,
      autoHide: false,
      metadata: { 
        eventType: event.event_type, 
        significance: 'legendary',
        payload: event.event_payload
      }
    });
  }

  // 🌀 PHASE 1: Corrupted Prophecy Handler
  private handleCorruptedProphecy(prophecy: any): void {
    // Only alert for non-pristine corruption levels
    if (!prophecy.corruption_level || prophecy.corruption_level === 'pristine') return;

    console.log('🌀 Corrupted prophecy detected:', prophecy.corruption_level);

    const corruptionText = this.getCorruptionDescription(prophecy.corruption_level);

    this.addAlert({
      id: `corruption_${prophecy.id}`,
      source: 'oracle',
      type: 'glitch',
      title: 'Divine Corruption Detected',
      message: `Prophecy streams affected: ${corruptionText} reality distortion detected`,
      icon: this.getCorruptionIcon(prophecy.corruption_level),
      priority: 'critical',
      timestamp: new Date(),
      dismissible: false, // Critical corruption alerts not dismissible
      autoHide: true,
      hideAfter: 12000, // Show for 12 seconds
      metadata: { 
        prophecyId: prophecy.id, 
        corruption: prophecy.corruption_level 
      }
    });
  }

  // 🔮 PHASE 1: Load Recent Prophecies (Initial Alert Seeding)
  private async loadRecentProphecies(): Promise<void> {
    try {
      console.log('🔮 Loading recent prophecies for initial alerts...');
      
      const { data: prophecies, error } = await supabase
        .from('apocryphal_scrolls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3); // Last 3 prophecies

      if (error) {
        console.error('❌ Failed to load recent prophecies:', error);
        return;
      }

      if (prophecies && prophecies.length > 0) {
        console.log(`🔮 Found ${prophecies.length} recent prophecies, creating alerts...`);
        prophecies.forEach(prophecy => this.handleProphecyBorn(prophecy));
      } else {
        console.log('🔮 No recent prophecies found');
      }
    } catch (error) {
      console.error('❌ Error loading recent prophecies:', error);
    }
  }

  // ⚡ PHASE 1: Load Recent Legendary Events (Initial Alert Seeding)
  private async loadRecentLegendaryEvents(): Promise<void> {
    try {
      console.log('⚡ Loading recent legendary events for initial alerts...');
      
      const { data: events, error } = await supabase
        .from('live_game_events')
        .select('*')
        .eq('event_payload->>oracle_significance', 'legendary')
        .order('created_at', { ascending: false })
        .limit(2); // Last 2 legendary events

      if (error) {
        console.error('❌ Failed to load recent legendary events:', error);
        return;
      }

      if (events && events.length > 0) {
        console.log(`⚡ Found ${events.length} recent legendary events, creating alerts...`);
        events.forEach(event => this.handleLegendaryGameEvent(event));
      } else {
        console.log('⚡ No recent legendary events found');
      }
    } catch (error) {
      console.error('❌ Error loading recent legendary events:', error);
    }
  }

  // === 📊 PHASE 2: COMMUNITY POLLING ALERTS ===

  private setupCommunityDataAlerts(): void {
    console.log('📊 Setting up Phase 2: Community Polling alerts...');

    // 📊 Real-time subscription for new polls and poll updates
    const pollsSubscription = supabase
      .channel('oracle_polls_alerts')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'oracle_polls' },
        (payload) => this.handleNewPoll(payload.new)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'oracle_polls' },
        (payload) => this.handlePollUpdate(payload.new)
      )
      .subscribe();

    this.subscriptions.push(pollsSubscription);

    // 🗳️ Real-time subscription for vote activity
    const votesSubscription = supabase
      .channel('oracle_votes_alerts')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_votes' },
        (payload) => this.handlePollVote(payload.new)
      )
      .subscribe();

    this.subscriptions.push(votesSubscription);

    // ⏰ Initial data seeding and recurring checks
    this.loadRecentPolls();
    this.checkEndingSoonPolls();
    this.checkHighStakesPolls();
    this.checkVotingMilestones();

    // ⏰ Set up recurring checks (every 5 minutes)
    setInterval(() => {
      this.checkEndingSoonPolls();
      this.checkVotingMilestones();
    }, 5 * 60 * 1000);
  }

  // 📊 NEW POLL CREATION ALERTS
  private handleNewPoll(poll: any): void {
    if (!this.config.communityPolling.newPollAlerts) return;
    
    console.log('📊 New Oracle poll created:', poll.title);

    // Determine priority based on rewards and category
    let priority: Alert['priority'] = 'medium';
    if (poll.girth_reward_pool && poll.girth_reward_pool >= this.config.communityPolling.highStakesThreshold) priority = 'high';
    if (poll.category === 'oracle_personality') priority = 'high';

    this.addAlert({
      id: `poll_new_${poll.id}`,
      source: 'community',
      type: 'poll',
      title: 'New Oracle Poll Created',
      message: `"${poll.title}" - ${this.getCategoryDescription(poll.category)}`,
      icon: this.getPollCategoryIcon(poll.category),
      priority,
      timestamp: new Date(poll.created_at),
      dismissible: true,
      autoHide: false,
      metadata: {
        pollId: poll.id,
        category: poll.category,
        girthPool: poll.girth_reward_pool,
        shardsReward: poll.oracle_shards_reward
      }
    });
  }

  // 📊 POLL STATUS UPDATE ALERTS
  private handlePollUpdate(poll: any): void {
    if (poll.status === 'closed') {
      console.log('📊 Oracle poll closed:', poll.title);
      
      this.addAlert({
        id: `poll_closed_${poll.id}`,
        source: 'community',
        type: 'poll',
        title: 'Poll Results Available',
        message: `Voting complete: "${poll.title}" - Community has spoken!`,
        icon: '🏆',
        priority: 'medium',
        timestamp: new Date(),
        dismissible: true,
        autoHide: false,
        metadata: {
          pollId: poll.id,
          category: poll.category,
          status: 'closed'
        }
      });
    }
  }

  // 🗳️ VOTING ACTIVITY ALERTS  
  private handlePollVote(vote: any): void {
    console.log('🗳️ New vote cast:', vote.poll_id);
    
    // Trigger immediate milestone check for this specific poll
    this.checkSpecificPollMilestone(vote.poll_id);
    
    // Throttled general voting activity alert
    const now = Date.now();
    const lastVoteAlert = this.getLastAlertTime('poll_activity');
    
    if (now - lastVoteAlert > 10 * 60 * 1000) { // 10 minutes throttle
      this.addAlert({
        id: `poll_activity_${now}`,
        source: 'community',
        type: 'community',
        title: 'Community Voting Active',
        message: 'Oracle community members are actively participating in polls!',
        icon: '🗳️',
        priority: 'low',
        timestamp: new Date(),
        dismissible: true,
        autoHide: true,
        hideAfter: 8000,
        metadata: {
          type: 'voting_activity'
        }
      });
      
      this.setLastAlertTime('poll_activity', now);
    }
  }

  // ⏰ POLL ENDING SOON WARNINGS
  private async checkEndingSoonPolls(): Promise<void> {
    if (!this.config.communityPolling.endingSoonWarnings) return;
    
    try {
      const hoursThreshold = this.config.communityPolling.endingSoonHours;
      const { data: endingSoonPolls, error } = await supabase
        .from('oracle_polls')
        .select(`
          id, title, category, voting_end, girth_reward_pool,
          vote_count:user_votes(count)
        `)
        .eq('status', 'active')
        .gt('voting_end', new Date().toISOString())
        .lt('voting_end', new Date(Date.now() + hoursThreshold * 60 * 60 * 1000).toISOString()); // Configurable hours

      if (error) {
        console.error('❌ Failed to check ending soon polls:', error);
        return;
      }

      if (endingSoonPolls && endingSoonPolls.length > 0) {
        endingSoonPolls.forEach(poll => {
          const voteCount = poll.vote_count?.[0]?.count || 0;
          const hoursLeft = Math.ceil((new Date(poll.voting_end).getTime() - Date.now()) / (1000 * 60 * 60));
          
          // Only alert if we haven't already alerted for this poll ending
          const alertId = `poll_ending_${poll.id}`;
          if (!this.currentAlerts.find(alert => alert.id === alertId)) {
            console.log('⏰ Poll ending soon:', poll.title, `${hoursLeft}h left`);
            
            this.addAlert({
              id: alertId,
              source: 'community',
              type: 'poll',
              title: 'Poll Closing Soon',
              message: `"${poll.title}" ends in ${hoursLeft}h (${voteCount} votes)`,
              icon: '⏰',
              priority: hoursLeft <= 1 ? 'high' : 'medium',
              timestamp: new Date(),
              dismissible: true,
              autoHide: false,
              metadata: {
                pollId: poll.id,
                category: poll.category,
                hoursLeft,
                voteCount,
                type: 'ending_soon'
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('❌ Error checking ending soon polls:', error);
    }
  }

  // 💰 HIGH-STAKES POLL ALERTS  
  private async checkHighStakesPolls(): Promise<void> {
    if (!this.config.communityPolling.highStakesPolls) return;
    
    try {
      const { data: highStakesPolls, error } = await supabase
        .from('oracle_polls')
        .select('id, title, category, girth_reward_pool, oracle_shards_reward')
        .eq('status', 'active')
        .gte('girth_reward_pool', this.config.communityPolling.highStakesThreshold); // Configurable threshold

      if (error) {
        console.error('❌ Failed to check high-stakes polls:', error);
        return;
      }

      if (highStakesPolls && highStakesPolls.length > 0) {
        highStakesPolls.forEach(poll => {
          // Only alert once per high-stakes poll
          const alertId = `poll_high_stakes_${poll.id}`;
          if (!this.currentAlerts.find(alert => alert.id === alertId)) {
            console.log('💰 High-stakes poll detected:', poll.title, `${poll.girth_reward_pool} $GIRTH`);
            
            this.addAlert({
              id: alertId,
              source: 'community',
              type: 'poll',
              title: 'High-Stakes Oracle Poll',
              message: `"${poll.title}" - ${poll.girth_reward_pool} $GIRTH pool!`,
              icon: '💰',
              priority: 'high',
              timestamp: new Date(),
              dismissible: true,
              autoHide: false,
              metadata: {
                pollId: poll.id,
                category: poll.category,
                girthPool: poll.girth_reward_pool,
                type: 'high_stakes'
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('❌ Error checking high-stakes polls:', error);
    }
  }

  // 🎯 VOTING MILESTONE ALERTS
  private async checkVotingMilestones(): Promise<void> {
    if (!this.config.communityPolling.votingMilestones) return;
    
    try {
      const { data: pollsWithVotes, error } = await supabase
        .from('oracle_polls')
        .select(`
          id, title, category,
          vote_count:user_votes(count)
        `)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Failed to check voting milestones:', error);
        return;
      }

      if (pollsWithVotes && pollsWithVotes.length > 0) {
        pollsWithVotes.forEach(poll => {
          const voteCount = poll.vote_count?.[0]?.count || 0;
          
          // Check for milestone (every 50 votes)
          if (voteCount > 0 && voteCount % 50 === 0) {
            const alertId = `poll_milestone_${poll.id}_${voteCount}`;
            if (!this.currentAlerts.find(alert => alert.id === alertId)) {
              console.log('🎯 Voting milestone reached:', poll.title, `${voteCount} votes`);
              
              this.addAlert({
                id: alertId,
                source: 'community',
                type: 'milestone',
                title: 'Community Voting Milestone',
                message: `${voteCount} votes cast in "${poll.title}"`,
                icon: '🎯',
                priority: 'medium',
                timestamp: new Date(),
                dismissible: true,
                autoHide: true,
                hideAfter: 12000,
                metadata: {
                  pollId: poll.id,
                  category: poll.category,
                  voteCount,
                  type: 'voting_milestone'
                }
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Error checking voting milestones:', error);
    }
  }

  // 🎯 SPECIFIC POLL MILESTONE CHECK (triggered by real-time vote)
  private async checkSpecificPollMilestone(pollId: string): Promise<void> {
    try {
      const { data: voteData, error } = await supabase
        .from('user_votes')
        .select('id')
        .eq('poll_id', pollId);

      if (error || !voteData) return;

      const voteCount = voteData.length;
      
      // Check if this is a milestone (every 50 votes)
      if (voteCount > 0 && voteCount % 50 === 0) {
        // Get poll details for alert
        const { data: poll } = await supabase
          .from('oracle_polls')
          .select('title, category')
          .eq('id', pollId)
          .single();

        if (poll) {
          const alertId = `poll_milestone_${pollId}_${voteCount}`;
          if (!this.currentAlerts.find(alert => alert.id === alertId)) {
            console.log('🎯 Real-time voting milestone:', poll.title, `${voteCount} votes`);
            
            this.addAlert({
              id: alertId,
              source: 'community',
              type: 'milestone',
              title: 'Voting Milestone Reached!',
              message: `${voteCount} votes cast in "${poll.title}"`,
              icon: '🎯',
              priority: 'medium',
              timestamp: new Date(),
              dismissible: true,
              autoHide: true,
              hideAfter: 12000,
              metadata: {
                pollId,
                category: poll.category,
                voteCount,
                type: 'voting_milestone_realtime'
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking specific poll milestone:', error);
    }
  }

  // 📊 LOAD RECENT POLLS FOR INITIAL ALERTS
  private async loadRecentPolls(): Promise<void> {
    if (!this.config.communityPolling.newPollAlerts && 
        !this.config.communityPolling.highStakesPolls && 
        !this.config.communityPolling.endingSoonWarnings) return;

    try {
      console.log('🚨 Loading recent polls for Phase 2 initial alerts...');
      
      const { data: polls, error } = await supabase
        .from('oracle_polls')
        .select(`
          id, title, category, status, voting_end, girth_reward_pool, oracle_shards_reward,
          vote_count:user_votes(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('🚨 Failed to load recent polls:', error);
        return;
      }

      if (polls && polls.length > 0) {
        console.log(`🚨 Found ${polls.length} active polls for initial alerts`);
        
        // Add new poll alerts for recent polls (created in last 24 hours)
        if (this.config.communityPolling.newPollAlerts) {
          const recentPolls = polls.filter(poll => {
            // Estimate creation time (polls without created_at)
            return true; // For now, show all active polls as "recent"
          });
          
          recentPolls.forEach(poll => {
            this.handleNewPoll(poll);
          });
        }

        // Check for high-stakes polls
        if (this.config.communityPolling.highStakesPolls) {
          const highStakesPolls = polls.filter(poll => 
            poll.girth_reward_pool && poll.girth_reward_pool >= this.config.communityPolling.highStakesThreshold
          );
          
          highStakesPolls.forEach(poll => {
            this.addAlert({
              id: `high-stakes-${poll.id}`,
              source: 'community',
              type: 'community_milestone',
              title: '💰 High-Stakes Poll Active',
              message: `"${poll.title}" - ${poll.girth_reward_pool} $GIRTH pool available`,
              icon: '💰',
              priority: 'high',
              timestamp: new Date(),
              metadata: { pollId: poll.id, type: 'high_stakes' }
            });
          });
        }

        // Check for ending soon polls
        if (this.config.communityPolling.endingSoonWarnings) {
          const endingSoonPolls = polls.filter(poll => {
            if (!poll.voting_end) return false;
            const endTime = new Date(poll.voting_end);
            const hoursRemaining = (endTime.getTime() - Date.now()) / (1000 * 60 * 60);
            return hoursRemaining > 0 && hoursRemaining <= this.config.communityPolling.endingSoonHours;
          });
          
          endingSoonPolls.forEach(poll => {
            const endTime = new Date(poll.voting_end);
            const hoursRemaining = Math.max(0, (endTime.getTime() - Date.now()) / (1000 * 60 * 60));
            
            this.addAlert({
              id: `ending-soon-${poll.id}`,
              source: 'community',
              type: 'oracle_prophecy',
              title: '⏰ Poll Ending Soon',
              message: `"${poll.title}" ends in ${Math.ceil(hoursRemaining)}h`,
              icon: '⏰',
              priority: 'medium',
              timestamp: new Date(),
              metadata: { pollId: poll.id, type: 'ending_soon' }
            });
          });
        }
      }
    } catch (error) {
      console.error('🚨 Error loading recent polls:', error);
    }
  }

  // 📊 HELPER FUNCTIONS FOR POLL CATEGORIZATION
  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'prophecy': 'Divine visions and Oracle wisdom',
      'lore': 'Community storytelling direction', 
      'game_evolution': 'Gameplay and feature development',
      'oracle_personality': 'Oracle consciousness and behavior'
    };
    return descriptions[category] || 'Community decision';
  }

  private getPollCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'prophecy': '🔮',
      'lore': '📜',
      'game_evolution': '🎮',
      'oracle_personality': '👁️'
    };
    return icons[category] || '📊';
  }

  // === PHASE 4: LORE SYSTEM INTEGRATION ===

  private setupLoreSystemAlerts(): void {
    console.log('🚨 Setting up Phase 4: Lore System Integration alerts...');

    // 📜 Subscribe to lore cycles for cycle completion and entry counting
    if (this.config.loreSystem.loreCycleAlerts || this.config.loreSystem.entriesPerCycleCounter) {
      const loreCycleSubscription = supabase
        .channel('lore_cycles_alerts')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'lore_cycles' },
          (payload) => this.handleLoreCycleUpdate(payload.new)
        )
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'lore_cycles' },
          (payload) => this.handleNewLoreCycle(payload.new)
        )
        .subscribe();

      this.subscriptions.push(loreCycleSubscription);
    }

    // 📖 Subscribe to lore entries for generation alerts, comic panels, corruption, and popularity
    if (this.config.loreSystem.loreGenerationAlerts || this.config.loreSystem.comicPanelAlerts || 
        this.config.loreSystem.corruptionInfluencedLore || this.config.loreSystem.popularLoreAlerts) {
      const loreEntriesSubscription = supabase
        .channel('lore_entries_alerts')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chode_lore_entries' },
          (payload) => this.handleNewLoreEntry(payload.new)
        )
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'chode_lore_entries' },
          (payload) => this.handleLoreEntryUpdate(payload.new, payload.old)
        )
        .subscribe();

      this.subscriptions.push(loreEntriesSubscription);
    }

    // ✍️ Subscribe to community story inputs for legendary submissions and participation tracking
    if (this.config.loreSystem.legendarySubmissions || this.config.loreSystem.communityParticipation) {
      const storyInputsSubscription = supabase
        .channel('community_story_inputs_alerts')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'community_story_inputs' },
          (payload) => this.handleCommunityStoryInput(payload.new)
        )
        .subscribe();

      this.subscriptions.push(storyInputsSubscription);
    }

    // Load initial lore system data for existing content
    this.loadRecentLoreData();
  }

  // 🌀 LORE CYCLE HANDLERS

  private handleNewLoreCycle(cycle: Record<string, unknown>): void {
    if (!this.config.loreSystem.loreCycleAlerts) return;

    this.addAlert({
      id: `lore_cycle_start_${cycle.id}`,
      source: 'lore',
      type: 'system',
      title: 'New Lore Cycle Begins',
      message: `Cycle ${cycle.cycle_number}: The Oracle opens the void for new community stories...`,
      icon: '🌀',
      priority: 'medium',
      timestamp: new Date(cycle.created_at as string),
      dismissible: true,
      autoHide: false,
      metadata: {
        cycleId: cycle.id,
        cycleNumber: cycle.cycle_number,
        eventType: 'new_lore_cycle',
        navigateTo: 'lore_input'
      }
    });
  }

  private handleLoreCycleUpdate(cycle: Record<string, unknown>): void {
    const status = cycle.status as string;
    
    // Handle cycle completion
    if (status === 'complete' && this.config.loreSystem.loreCycleAlerts) {
      this.addAlert({
        id: `lore_cycle_complete_${cycle.id}`,
        source: 'lore',
        type: 'milestone',
        title: 'Lore Cycle Complete',
        message: `Cycle ${cycle.cycle_number}: Community stories have been woven into new lore! ${cycle.total_inputs || 0} contributions processed.`,
        icon: '✨',
        priority: 'high',
        timestamp: new Date(),
        dismissible: true,
        autoHide: false,
        metadata: {
          cycleId: cycle.id,
          cycleNumber: cycle.cycle_number,
          totalInputs: cycle.total_inputs,
          eventType: 'lore_cycle_complete',
          navigateTo: 'lore_slideshow'
        }
      });
    }

    // Check for community participation milestones
    if (this.config.loreSystem.communityParticipation && cycle.total_inputs) {
      this.checkCommunityParticipationMilestones(cycle);
    }
  }

  // 📖 LORE ENTRY HANDLERS

  private handleNewLoreEntry(entry: Record<string, unknown>): void {
    if (!this.config.loreSystem.loreGenerationAlerts) return;

    const corruptionLevel = entry.oracle_corruption_level as string || 'pristine';
    const isCorrupted = corruptionLevel !== 'pristine';
    
    // Check if this is a corruption-influenced lore entry
    if (isCorrupted && this.config.loreSystem.corruptionInfluencedLore) {
      this.handleCorruptionInfluencedLore(entry);
      return; // Don't create duplicate alerts
    }

    this.addAlert({
      id: `lore_entry_${entry.id}`,
      source: 'lore',
      type: 'community',
      title: 'New Lore Fragment Published',
      message: `"${entry.story_title}" - A new tale emerges from the digital void...`,
      icon: '📜',
      priority: 'medium',
      timestamp: new Date(entry.created_at as string),
      dismissible: true,
      autoHide: false,
      metadata: {
        entryId: entry.id,
        storyTitle: entry.story_title,
        corruptionLevel: corruptionLevel,
        cycleId: entry.lore_cycle_id,
        eventType: 'new_lore_entry',
        navigateTo: 'lore_slideshow'
      }
    });
  }

  private handleLoreEntryUpdate(newEntry: Record<string, unknown>, oldEntry: Record<string, unknown>): void {
    // Handle comic panel generation completion
    if (this.config.loreSystem.comicPanelAlerts && 
        newEntry.comic_panel_url && !oldEntry?.comic_panel_url) {
      this.handleComicPanelComplete(newEntry);
    }

    // Handle popularity milestones
    if (this.config.loreSystem.popularLoreAlerts) {
      this.checkLorePopularityMilestones(newEntry, oldEntry);
    }
  }

  private handleComicPanelComplete(entry: Record<string, unknown>): void {
    this.addAlert({
      id: `comic_panel_${entry.id}`,
      source: 'lore',
      type: 'milestone',
      title: 'Comic Panel Generated',
      message: `Visual narrative complete for "${entry.story_title}" - The Oracle's vision manifests!`,
      icon: '🎨',
      priority: 'medium',
      timestamp: new Date(),
      dismissible: true,
      autoHide: false,
      metadata: {
        entryId: entry.id,
        storyTitle: entry.story_title,
        comicPanelUrl: entry.comic_panel_url,
        eventType: 'comic_panel_complete',
        navigateTo: 'lore_slideshow'
      }
    });
  }

  private handleCorruptionInfluencedLore(entry: Record<string, unknown>): void {
    const corruptionLevel = entry.oracle_corruption_level as string;
    const corruptionIcon = this.getCorruptionIcon(corruptionLevel);
    const corruptionDesc = this.getCorruptionDescription(corruptionLevel);

    this.addAlert({
      id: `corrupted_lore_${entry.id}`,
      source: 'lore',
      type: 'glitch',
      title: 'Corrupted Lore Manifests',
      message: `"${entry.story_title}" - ${corruptionDesc} influence detected in the narrative...`,
      icon: corruptionIcon,
      priority: 'high',
      timestamp: new Date(entry.created_at as string),
      dismissible: true,
      autoHide: false,
      metadata: {
        entryId: entry.id,
        storyTitle: entry.story_title,
        corruptionLevel: corruptionLevel,
        cycleId: entry.lore_cycle_id,
        eventType: 'corrupted_lore_entry',
        navigateTo: 'lore_slideshow'
      }
    });
  }

  // ✍️ COMMUNITY STORY INPUT HANDLERS

  private handleCommunityStoryInput(input: Record<string, unknown>): void {
    // Handle legendary submissions
    if (this.config.loreSystem.legendarySubmissions && 
        input.oracle_significance === 'legendary') {
      this.handleLegendaryStorySubmission(input);
    }

    // Update cycle participation tracking (throttled)
    if (this.config.loreSystem.communityParticipation && input.lore_cycle_id) {
      this.updateCycleParticipationTracking(input.lore_cycle_id as string);
    }
  }

  private handleLegendaryStorySubmission(input: Record<string, unknown>): void {
    const username = input.username as string || 'Anonymous Contributor';
    
    this.addAlert({
      id: `legendary_submission_${input.id}`,
      source: 'lore',
      type: 'milestone',
      title: 'Legendary Story Submission',
      message: `${username} contributes a tale of legendary significance to the Oracle's collection!`,
      icon: '⭐',
      priority: 'high',
      timestamp: new Date(input.created_at as string),
      dismissible: true,
      autoHide: false,
      metadata: {
        inputId: input.id,
        username: username,
        cycleId: input.lore_cycle_id,
        significance: input.oracle_significance,
        eventType: 'legendary_story_submission',
        navigateTo: 'lore_input'
      }
    });
  }

  // 📊 MILESTONE & TRACKING HELPERS

  private checkCommunityParticipationMilestones(cycle: Record<string, unknown>): void {
    const totalInputs = cycle.total_inputs as number || 0;
    const participationThreshold = this.config.loreSystem.participationThreshold;

    // Check for participation milestones
    if (totalInputs > 0 && totalInputs % participationThreshold === 0) {
      this.addAlert({
        id: `participation_milestone_${cycle.id}_${totalInputs}`,
        source: 'lore',
        type: 'community',
        title: 'Community Participation Milestone',
        message: `${totalInputs} degens have contributed to Cycle ${cycle.cycle_number}! The collective consciousness grows...`,
        icon: '👥',
        priority: 'medium',
        timestamp: new Date(),
        dismissible: true,
        autoHide: false,
        metadata: {
          cycleId: cycle.id,
          cycleNumber: cycle.cycle_number,
          participantCount: totalInputs,
          eventType: 'community_participation_milestone',
          navigateTo: 'lore_input'
        }
      });
    }
  }

  private checkLorePopularityMilestones(newEntry: Record<string, unknown>, oldEntry: Record<string, unknown>): void {
    const newViews = newEntry.view_count as number || 0;
    const newLikes = newEntry.like_count as number || 0;
    const oldViews = oldEntry?.view_count as number || 0;
    const oldLikes = oldEntry?.like_count as number || 0;
    const threshold = this.config.loreSystem.popularityThreshold;

    // Check for view milestones
    if (newViews >= threshold && oldViews < threshold) {
      this.addAlert({
        id: `popular_lore_views_${newEntry.id}`,
        source: 'lore',
        type: 'community',
        title: 'Popular Lore Fragment',
        message: `"${newEntry.story_title}" reaches ${newViews} views! The community resonates with this tale.`,
        icon: '👁️',
        priority: 'low',
        timestamp: new Date(),
        dismissible: true,
        autoHide: true,
        hideAfter: 10000,
        metadata: {
          entryId: newEntry.id,
          storyTitle: newEntry.story_title,
          viewCount: newViews,
          eventType: 'popular_lore_views',
          navigateTo: 'lore_slideshow'
        }
      });
    }

    // Check for like milestones
    if (newLikes >= Math.floor(threshold / 2) && oldLikes < Math.floor(threshold / 2)) {
      this.addAlert({
        id: `popular_lore_likes_${newEntry.id}`,
        source: 'lore',
        type: 'community',
        title: 'Beloved Lore Fragment',
        message: `"${newEntry.story_title}" receives ${newLikes} likes! This story touches the collective soul.`,
        icon: '❤️',
        priority: 'low',
        timestamp: new Date(),
        dismissible: true,
        autoHide: true,
        hideAfter: 10000,
        metadata: {
          entryId: newEntry.id,
          storyTitle: newEntry.story_title,
          likeCount: newLikes,
          eventType: 'popular_lore_likes',
          navigateTo: 'lore_slideshow'
        }
      });
    }
  }

  private updateCycleParticipationTracking(cycleId: string): void {
    // Throttle participation updates to prevent spam
    const now = Date.now();
    const lastUpdate = this.getLastAlertTime(`cycle_participation_${cycleId}`);
    
    if (now - lastUpdate > 300000) { // 5 minutes throttle per cycle
      this.setLastAlertTime(`cycle_participation_${cycleId}`, now);
      
      // Check current cycle participation count
      this.checkCurrentCycleParticipation(cycleId);
    }
  }

  private async checkCurrentCycleParticipation(cycleId: string): Promise<void> {
    try {
      // Get current participation count for the cycle
      const { data: inputCount, error } = await supabase
        .from('community_story_inputs')
        .select('id')
        .eq('lore_cycle_id', cycleId);

      if (error) {
        console.error('Error checking cycle participation:', error);
        return;
      }

      const participantCount = inputCount?.length || 0;
      const participationThreshold = this.config.loreSystem.participationThreshold;

      // Show counter-style alerts if enabled
      if (this.config.loreSystem.entriesPerCycleCounter && participantCount > 0) {
        // Get cycle details
        const { data: cycle } = await supabase
          .from('lore_cycles')
          .select('cycle_number, status')
          .eq('id', cycleId)
          .single();

        if (cycle) {
          this.addAlert({
            id: `cycle_counter_${cycleId}_${participantCount}`,
            source: 'lore',
            type: 'system',
            title: `Cycle ${cycle.cycle_number} Progress`,
            message: `${participantCount} ${participantCount === 1 ? 'story' : 'stories'} contributed to the current lore cycle`,
            icon: '📊',
            priority: 'low',
            timestamp: new Date(),
            dismissible: true,
            autoHide: true,
            hideAfter: 8000,
            metadata: {
              cycleId: cycleId,
              cycleNumber: cycle.cycle_number,
              participantCount: participantCount,
              cycleStatus: cycle.status,
              eventType: 'cycle_participation_counter',
              navigateTo: 'lore_input'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in checkCurrentCycleParticipation:', error);
    }
  }

  // 📚 INITIAL DATA LOADING

  private async loadRecentLoreData(): Promise<void> {
    try {
      console.log('📜 Loading recent lore data for SmartAlerts seeding...');
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // === LORE CYCLES ===
      if (this.config.loreSystem.loreCycleAlerts || this.config.loreSystem.entriesPerCycleCounter) {
        const { data: recentCycles, error: cycleError } = await supabase
          .from('lore_cycles')
          .select('*')
          .gte('created_at', oneWeekAgo)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!cycleError && recentCycles) {
          console.log(`🔄 Found ${recentCycles.length} recent lore cycles`);
          console.log('🔍 Raw cycle data:', recentCycles.map(c => ({ 
            id: c.id, 
            story_theme: c.story_theme, 
            total_inputs: c.total_inputs, 
            status: c.status 
          })));
          
          recentCycles.forEach(cycle => {
            // Recently completed cycles
            if (cycle.status === 'complete' && this.config.loreSystem.loreCycleAlerts) {
              this.addAlert({
                id: `lore_cycle_complete_${cycle.id}_seed`,
                source: 'lore',
                type: 'system',
                title: '📜 Lore Cycle Complete',
                message: `Cycle ${cycle.cycle_number}: "${cycle.story_theme || 'Unknown Theme'}" concluded with ${cycle.total_inputs || 0} community stories`,
                icon: '🔄',
                priority: 'medium',
                timestamp: new Date(cycle.updated_at || cycle.created_at),
                dismissible: true,
                autoHide: false,
                metadata: {
                  cycleId: cycle.id,
                  cycleNumber: cycle.cycle_number,
                  theme: cycle.story_theme,
                  totalEntries: cycle.total_inputs || 0,
                  eventType: 'lore_cycle_complete',
                  navigateTo: 'lore_slideshow'
                }
              });
            }

            // Active cycles with entry counter
            if (cycle.status === 'collecting' && this.config.loreSystem.entriesPerCycleCounter) {
              this.addAlert({
                id: `lore_cycle_active_${cycle.id}_seed`,
                source: 'lore',
                type: 'community',
                title: '📊 Active Lore Cycle',
                message: `"${cycle.story_theme || 'Unknown Theme'}" - ${cycle.total_inputs || 0} stories submitted so far`,
                icon: '📊',
                priority: 'low',
                timestamp: new Date(cycle.created_at),
                dismissible: true,
                autoHide: false,
                metadata: {
                  cycleId: cycle.id,
                  cycleNumber: cycle.cycle_number,
                  theme: cycle.story_theme,
                  currentEntries: cycle.total_inputs || 0,
                  eventType: 'cycle_progress_counter',
                  navigateTo: 'lore_input'
                }
              });
            }
          });
        }
      }

      // === LORE ENTRIES ===
      if (this.config.loreSystem.loreGenerationAlerts || this.config.loreSystem.corruptionInfluencedLore || this.config.loreSystem.popularLoreAlerts) {
        const { data: recentEntries, error: entryError } = await supabase
          .from('chode_lore_entries')
          .select('*')
          .gte('created_at', oneDayAgo)
          .eq('text_completed', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!entryError && recentEntries) {
          console.log(`📖 Found ${recentEntries.length} recent lore entries`);
          
          recentEntries.forEach(entry => {
            // Check characteristics
            const isCorrupted = entry.corruption_level && ['glitched_ominous', 'forbidden_fragment', 'cryptic'].includes(entry.corruption_level);
            const isLegendary = entry.oracle_significance && entry.oracle_significance >= 85;
            const isPopular = (entry.view_count || 0) >= this.config.loreSystem.popularityThreshold ||
                             (entry.like_count || 0) >= Math.floor(this.config.loreSystem.popularityThreshold / 2);

            // New lore entry alerts
            if (this.config.loreSystem.loreGenerationAlerts) {
              let alertType: 'prophecy' | 'poll' | 'milestone' | 'glitch' | 'community' | 'system' = 'system';
              let title = '📖 New Lore Entry';
              let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
              let icon = '📖';

              if (isLegendary) {
                title = '⭐ Legendary Lore Entry';
                priority = 'high';
                icon = '⭐';
                alertType = 'milestone';
              }

              this.addAlert({
                id: `lore_entry_${entry.id}_seed`,
                source: 'lore',
                type: alertType,
                title,
                message: `"${entry.title}" - A new tale from the ${entry.category || 'unknown'} realm`,
                icon,
                priority,
                timestamp: new Date(entry.created_at),
                dismissible: true,
                autoHide: false,
                metadata: {
                  entryId: entry.id,
                  title: entry.title,
                  category: entry.category,
                  corruptionLevel: entry.corruption_level,
                  oracleSignificance: entry.oracle_significance,
                  isLegendary,
                  isCorrupted,
                  eventType: 'new_lore_entry',
                  navigateTo: 'lore_slideshow'
                }
              });
            }

            // Corruption-influenced lore alerts
            if (isCorrupted && this.config.loreSystem.corruptionInfluencedLore) {
              this.addAlert({
                id: `corrupted_lore_${entry.id}_seed`,
                source: 'lore',
                type: 'glitch',
                title: '🌪️ Corruption-Influenced Lore',
                message: `"${entry.title}" bears the mark of ${this.getCorruptionDescription(entry.corruption_level)}`,
                icon: '🌪️',
                priority: 'high',
                timestamp: new Date(entry.created_at),
                dismissible: true,
                autoHide: false,
                metadata: {
                  entryId: entry.id,
                  title: entry.title,
                  corruptionLevel: entry.corruption_level,
                  eventType: 'corrupted_lore_entry',
                  navigateTo: 'lore_slideshow'
                }
              });
            }

            // Popular lore alerts
            if (isPopular && this.config.loreSystem.popularLoreAlerts) {
              this.addAlert({
                id: `popular_lore_${entry.id}_seed`,
                source: 'lore',
                type: 'community',
                title: '🔥 Popular Lore Entry',
                message: `"${entry.title}" is gaining community attention with ${entry.view_count || 0} views`,
                icon: '🔥',
                priority: 'medium',
                timestamp: new Date(entry.created_at),
                dismissible: true,
                autoHide: false,
                metadata: {
                  entryId: entry.id,
                  title: entry.title,
                  viewCount: entry.view_count || 0,
                  likeCount: entry.like_count || 0,
                  eventType: 'popular_lore_entry',
                  navigateTo: 'lore_slideshow'
                }
              });
            }
          });
        }
      }

      // === COMIC PANELS ===
      if (this.config.loreSystem.comicPanelAlerts) {
        const { data: recentPanels, error: panelError } = await supabase
          .from('comic_generation_queue')
          .select('*, chode_lore_entries!inner(title, category)')
          .gte('created_at', oneDayAgo)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(8);

        if (!panelError && recentPanels) {
          console.log(`🎨 Found ${recentPanels.length} recent comic panels`);
          
          recentPanels.forEach(panel => {
            this.addAlert({
              id: `comic_panel_${panel.id}_seed`,
              source: 'lore',
              type: 'milestone',
              title: '🎨 Comic Panel Generated',
              message: `Visual interpretation of "${panel.chode_lore_entries?.title}" is ready to view`,
              icon: '🎨',
              priority: 'medium',
              timestamp: new Date(panel.updated_at || panel.created_at),
              dismissible: true,
              autoHide: false,
              metadata: {
                panelId: panel.id,
                loreEntryId: panel.lore_entry_id,
                title: panel.chode_lore_entries?.title,
                category: panel.chode_lore_entries?.category,
                imageUrl: panel.generated_image_url,
                eventType: 'comic_panel_complete',
                navigateTo: 'lore_slideshow'
              }
            });
          });
        }
      }

      // === COMMUNITY CONTRIBUTIONS ===
      if (this.config.loreSystem.legendarySubmissions || this.config.loreSystem.communityParticipation) {
        const { data: recentContributions, error: contribError } = await supabase
          .from('community_story_inputs')
          .select('*')
          .gte('created_at', oneDayAgo)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!contribError && recentContributions) {
          console.log(`👥 Found ${recentContributions.length} recent community contributions`);
          
          // Legendary submissions
          if (this.config.loreSystem.legendarySubmissions) {
            const legendaryContributions = recentContributions.filter(c => 
              c.oracle_significance && c.oracle_significance >= 85
            );

            legendaryContributions.forEach(contrib => {
              this.addAlert({
                id: `legendary_submission_${contrib.id}_seed`,
                source: 'lore',
                type: 'milestone',
                title: '⭐ Legendary Story Submission',
                message: `A tale of exceptional significance: "${contrib.story_content?.substring(0, 50)}..."`,
                icon: '⭐',
                priority: 'high',
                timestamp: new Date(contrib.created_at),
                dismissible: true,
                autoHide: false,
                metadata: {
                  contributionId: contrib.id,
                  cycleId: contrib.cycle_id,
                  oracleSignificance: contrib.oracle_significance,
                  preview: contrib.story_content?.substring(0, 100),
                  eventType: 'legendary_submission',
                  navigateTo: 'lore_input'
                }
              });
            });
          }

          // Community participation milestones
          if (this.config.loreSystem.communityParticipation) {
            const uniqueContributors = new Set(
              recentContributions.map(c => c.contributor_address || c.session_id)
            ).size;
            
            if (uniqueContributors >= this.config.loreSystem.participationThreshold) {
              this.addAlert({
                id: `community_participation_${Date.now()}_seed`,
                source: 'lore',
                type: 'community',
                title: '👥 Community Participation Milestone',
                message: `${uniqueContributors} unique contributors shared stories in the last 24 hours`,
                icon: '👥',
                priority: 'medium',
                timestamp: new Date(),
                dismissible: true,
                autoHide: false,
                metadata: {
                  contributorCount: uniqueContributors,
                  totalContributions: recentContributions.length,
                  threshold: this.config.loreSystem.participationThreshold,
                  eventType: 'community_participation',
                  navigateTo: 'lore_input'
                }
              });
            }
          }
        }
      }

      console.log('✅ Phase 4 lore data loaded for SmartAlerts seeding');
    } catch (error) {
      console.error('❌ Error loading recent lore data:', error);
    }
  }

  // === PHASE 3: GAME EVENTS & COMMUNITY MILESTONES ===

  private setupGameEventAlerts(): void {
    console.log('🚨 Setting up Phase 3: Game Events & Community Milestones alerts...');

    // Subscribe to live game events for girth achievements and community milestones
    if (this.config.gameEvents.girthAchievements || this.config.gameEvents.communityMilestones) {
      const gameEventsSubscription = supabase
        .channel('game_events_alerts')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'live_game_events' },
          (payload) => this.handleGameEvent(payload.new)
        )
        .subscribe();

      this.subscriptions.push(gameEventsSubscription);
    }

    // Subscribe to leaderboard entries for new entries and record breaking
    if (this.config.gameEvents.leaderboardEntries || this.config.gameEvents.recordBreaking || this.config.gameEvents.topTenChanges) {
      const leaderboardSubscription = supabase
        .channel('leaderboard_alerts')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'leaderboard_entries' },
          (payload) => this.handleLeaderboardEntry(payload.new)
        )
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'leaderboard_entries' },
          (payload) => this.handleLeaderboardUpdate(payload.new)
        )
        .subscribe();

      this.subscriptions.push(leaderboardSubscription);
    }

    // Subscribe to oracle index changes
    if (this.config.gameEvents.oracleIndexChanges) {
      const oracleIndexSubscription = supabase
        .channel('oracle_index_alerts')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'girth_index_current_values' },
          (payload) => this.handleOracleIndexChange(payload.new, payload.old)
        )
        .subscribe();

      this.subscriptions.push(oracleIndexSubscription);
    }

    // Load initial game events data for existing milestones
    this.loadRecentGameEvents();
    this.loadCurrentLeaderboard();
    this.loadCurrentOracleIndex();
  }

  // 🎮 GAME EVENT HANDLERS

  private handleGameEvent(event: any): void {
    console.log('🎮 New game event:', event.event_type, event.event_payload);

    // Check for girth achievements
    if (this.config.gameEvents.girthAchievements && this.isGirthAchievement(event)) {
      this.handleGirthAchievement(event);
    }

    // Check for community milestones
    if (this.config.gameEvents.communityMilestones && this.isCommunityMilestone(event)) {
      this.handleCommunityMilestone(event);
    }
  }

  private isGirthAchievement(event: any): boolean {
    const girthEvents = ['chode_evolution', 'mega_slap_landed', 'giga_slap_landed', 'oracle_girth_milestone'];
    if (!girthEvents.includes(event.event_type)) return false;

    const totalGirth = event.event_payload?.total_girth || event.event_payload?.current_girth || 0;
    return totalGirth >= this.config.gameEvents.girthThreshold;
  }

  private isCommunityMilestone(event: any): boolean {
    // Check if this is a significant community event
    return event.event_payload?.oracle_significance === 'legendary' ||
           event.event_payload?.community_significance === true ||
           event.event_type === 'community_milestone_reached';
  }

  private handleGirthAchievement(event: any): void {
    const totalGirth = event.event_payload?.total_girth || event.event_payload?.current_girth || 0;
    const playerAddress = event.player_address || 'Anonymous Player';
    
    let milestoneType = '';
    let icon = '💪';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    if (totalGirth >= 10000000) { // 10M
      milestoneType = 'Cosmic Ascension';
      icon = '🌌';
      priority = 'critical';
    } else if (totalGirth >= 1000000) { // 1M
      milestoneType = 'Million GIRTH Milestone';
      icon = '💎';
      priority = 'high';
    } else if (totalGirth >= 100000) { // 100K
      milestoneType = '100K GIRTH Achievement';
      icon = '🏆';
      priority = 'high';
    } else {
      milestoneType = 'GIRTH Achievement';
      icon = '💪';
      priority = 'medium';
    }

    this.addAlert({
      id: `girth-achievement-${event.id}`,
      source: 'game',
      type: 'milestone',
      title: `🎮 ${milestoneType}`,
      message: `Player ${playerAddress.slice(0, 8)}...${playerAddress.slice(-4)} reached ${this.formatNumber(totalGirth)} GIRTH!`,
      icon: icon,
      priority: priority,
      timestamp: new Date(),
      metadata: { eventType: 'girth_achievement', totalGirth, playerId: playerAddress, eventId: event.id }
    });
  }

  private handleCommunityMilestone(event: any): void {
    const significance = event.event_payload?.oracle_significance || 'notable';
    let title = '🌟 Community Milestone';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    if (significance === 'legendary') {
      title = '⚡ LEGENDARY Community Event';
      priority = 'critical';
    }

    this.addAlert({
      id: `community-milestone-${event.id}`,
      source: 'game',
      type: 'milestone',
      title: title,
      message: `${this.getEventDescription(event.event_type)} - Community celebrates together!`,
      icon: '🌟',
      priority: priority,
      timestamp: new Date(),
      metadata: { eventType: 'community_milestone', significance, eventId: event.id }
    });
  }

  // 🏆 LEADERBOARD HANDLERS

  private handleLeaderboardEntry(entry: any): void {
    if (!this.config.gameEvents.leaderboardEntries) return;

    console.log('🏆 New leaderboard entry:', entry);

    this.addAlert({
      id: `leaderboard-new-${entry.id}`,
      source: 'game',
      type: 'milestone',
      title: '🏆 New Leaderboard Entry',
      message: `${entry.username || 'Player'} scored ${this.formatNumber(entry.score_value)} in ${entry.leaderboard_category}!`,
      icon: '🏆',
      priority: 'medium',
      timestamp: new Date(),
      metadata: { eventType: 'new_leaderboard_entry', entryId: entry.id, category: entry.leaderboard_category }
    });

    // Check if this is a record-breaking score
    this.checkRecordBreaking(entry);
  }

  private handleLeaderboardUpdate(entry: any): void {
    if (!this.config.gameEvents.topTenChanges) return;

    // This would require additional logic to determine position changes
    console.log('🏆 Leaderboard entry updated:', entry);
  }

  private async checkRecordBreaking(entry: any): Promise<void> {
    if (!this.config.gameEvents.recordBreaking) return;

    try {
      const { data: topEntry, error } = await supabase
        .from('leaderboard_entries')
        .select('score_value')
        .eq('leaderboard_category', entry.leaderboard_category)
        .order('score_value', { ascending: false })
        .limit(1)
        .single();

      if (!error && topEntry && entry.score_value >= topEntry.score_value) {
        this.addAlert({
          id: `record-breaking-${entry.id}`,
          source: 'game',
          type: 'milestone',
          title: '🔥 RECORD BROKEN!',
          message: `NEW ${entry.leaderboard_category} RECORD: ${this.formatNumber(entry.score_value)} by ${entry.username || 'Player'}!`,
          icon: '🔥',
          priority: 'critical',
          timestamp: new Date(),
          metadata: { eventType: 'record_breaking', entryId: entry.id, category: entry.leaderboard_category }
        });
      }
    } catch (error) {
      console.error('🚨 Error checking record breaking:', error);
    }
  }

  // 👁️ ORACLE INDEX HANDLERS

  private handleOracleIndexChange(newValues: any, oldValues: any): void {
    if (!this.config.gameEvents.oracleIndexChanges) return;

    console.log('👁️ Oracle index change detected:', newValues);

    // Check Divine Girth Resonance changes
    const oldResonance = parseFloat(oldValues?.divine_girth_resonance || '0');
    const newResonance = parseFloat(newValues?.divine_girth_resonance || '0');
    
    if (Math.abs(newResonance - oldResonance) > 10) { // Significant change
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      let icon = '🔮';
      
      if (newResonance > 90) {
        priority = 'high';
        icon = '✨';
      } else if (newResonance < 20) {
        priority = 'high';
        icon = '⚠️';
      }

      this.addAlert({
        id: `girth-resonance-${Date.now()}`,
        source: 'oracle',
        type: 'system',
        title: '🔮 Girth Resonance Shift',
        message: `Divine Girth Resonance ${newResonance > oldResonance ? 'increased' : 'decreased'} to ${newResonance.toFixed(1)}`,
        icon: icon,
        priority: priority,
        timestamp: new Date(),
        metadata: { eventType: 'girth_resonance_change', oldValue: oldResonance, newValue: newResonance }
      });
    }

    // Check Tap Surge Index changes
    if (oldValues?.tap_surge_index !== newValues?.tap_surge_index) {
      this.addAlert({
        id: `tap-surge-${Date.now()}`,
        source: 'oracle',
        type: 'system',
        title: '⚡ Tap Surge Intensity Change',
        message: `Tap Surge shifted from "${oldValues?.tap_surge_index}" to "${newValues?.tap_surge_index}"`,
        icon: this.getTapSurgeIcon(newValues?.tap_surge_index),
        priority: 'medium',
        timestamp: new Date(),
        metadata: { eventType: 'tap_surge_change', oldValue: oldValues?.tap_surge_index, newValue: newValues?.tap_surge_index }
      });
    }

    // Check Oracle Stability changes
    if (oldValues?.oracle_stability_status !== newValues?.oracle_stability_status) {
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      
      if (newValues?.oracle_stability_status === 'FORBIDDEN_FRAGMENT') {
        priority = 'critical';
      } else if (newValues?.oracle_stability_status === 'GLITCHED_OMINOUS') {
        priority = 'high';
      }

      this.addAlert({
        id: `oracle-stability-${Date.now()}`,
        source: 'oracle',
        type: 'glitch',
        title: '👁️ Oracle Stability Shift',
        message: `Oracle stability changed from "${oldValues?.oracle_stability_status}" to "${newValues?.oracle_stability_status}"`,
        icon: this.getStabilityIcon(newValues?.oracle_stability_status),
        priority: priority,
        timestamp: new Date(),
        metadata: { eventType: 'oracle_stability_change', oldValue: oldValues?.oracle_stability_status, newValue: newValues?.oracle_stability_status }
      });
    }
  }

  // 📊 INITIAL DATA LOADING

  private async loadRecentGameEvents(): Promise<void> {
    if (!this.config.gameEvents.girthAchievements && !this.config.gameEvents.communityMilestones) return;

    try {
      console.log('🚨 Loading recent game events for Phase 3 initial alerts...');
      
      const { data: recentEvents, error } = await supabase
        .from('live_game_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('🚨 Failed to load recent game events:', error);
        return;
      }

      if (recentEvents && recentEvents.length > 0) {
        console.log(`🚨 Found ${recentEvents.length} recent game events`);
        
        recentEvents.forEach(event => {
          if (this.config.gameEvents.girthAchievements && this.isGirthAchievement(event)) {
            // Show as "recent" achievement instead of "new"
            const totalGirth = event.event_payload?.total_girth || event.event_payload?.current_girth || 0;
            
            this.addAlert({
              id: `recent-girth-${event.id}`,
              source: 'game',
              type: 'milestone',
              title: '🎮 Recent GIRTH Achievement',
              message: `Player achieved ${this.formatNumber(totalGirth)} GIRTH recently`,
              icon: '🏆',
              priority: 'medium',
              timestamp: new Date(event.created_at),
              metadata: { eventType: 'recent_girth_achievement', totalGirth, eventId: event.id }
            });
          }
          
          if (this.config.gameEvents.communityMilestones && this.isCommunityMilestone(event)) {
            this.addAlert({
              id: `recent-milestone-${event.id}`,
              source: 'game',
              type: 'milestone',
              title: '🌟 Recent Community Milestone',
              message: `${this.getEventDescription(event.event_type)} - Community achieved together`,
              icon: '🌟',
              priority: 'medium',
              timestamp: new Date(event.created_at),
              metadata: { eventType: 'recent_community_milestone', eventId: event.id }
            });
          }
        });
      }
    } catch (error) {
      console.error('🚨 Error loading recent game events:', error);
    }
  }

  private async loadCurrentLeaderboard(): Promise<void> {
    if (!this.config.gameEvents.leaderboardEntries) return;

    try {
      console.log('🚨 Loading current leaderboard for Phase 3 initial alerts...');
      
      const { data: topEntries, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .order('score_value', { ascending: false })
        .limit(this.config.gameEvents.leaderboardTopCount);

      if (error) {
        console.error('🚨 Failed to load leaderboard:', error);
        return;
      }

      if (topEntries && topEntries.length > 0) {
        console.log(`🚨 Found ${topEntries.length} leaderboard entries`);
        
        // Show top performer as current leader
        const topEntry = topEntries[0];
        this.addAlert({
          id: `current-leader-${topEntry.id}`,
          source: 'game',
          type: 'milestone',
          title: '👑 Current Leaderboard Leader',
          message: `${topEntry.username || 'Player'} leads ${topEntry.leaderboard_category} with ${this.formatNumber(topEntry.score_value)}`,
          icon: '👑',
          priority: 'medium',
          timestamp: new Date(),
          metadata: { eventType: 'current_leader', entryId: topEntry.id, category: topEntry.leaderboard_category }
        });
      }
    } catch (error) {
      console.error('🚨 Error loading leaderboard:', error);
    }
  }

  private async loadCurrentOracleIndex(): Promise<void> {
    if (!this.config.gameEvents.oracleIndexChanges) return;

    try {
      console.log('🚨 Loading current oracle index for Phase 3 initial alerts...');
      
      const { data: currentIndex, error } = await supabase
        .from('girth_index_current_values')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('🚨 Failed to load oracle index:', error);
        return;
      }

      if (currentIndex) {
        console.log('🚨 Current oracle index loaded:', currentIndex);
        
        // Show current oracle status
        this.addAlert({
          id: `oracle-status-current`,
          source: 'oracle',
          type: 'system',
          title: '👁️ Current Oracle Status',
          message: `Resonance: ${parseFloat(currentIndex.divine_girth_resonance).toFixed(1)} | Surge: ${currentIndex.tap_surge_index} | Stability: ${currentIndex.oracle_stability_status}`,
          icon: '👁️',
          priority: 'low',
          timestamp: new Date(),
          metadata: { eventType: 'oracle_status_summary', resonance: currentIndex.divine_girth_resonance }
        });
      }
    } catch (error) {
      console.error('🚨 Error loading oracle index:', error);
    }
  }

  // === PHASE 3 UTILITY METHODS ===

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  private getEventDescription(eventType: string): string {
    const descriptions: Record<string, string> = {
      'giga_slap_landed': 'GIGA SLAP unleashed',
      'mega_slap_landed': 'Mega Slap delivered',
      'chode_evolution': 'Player evolved',
      'achievement_unlocked': 'Achievement unlocked',
      'oracle_girth_milestone': 'GIRTH milestone reached',
      'community_milestone_reached': 'Community milestone achieved'
    };
    return descriptions[eventType] || 'Significant event occurred';
  }

  private getTapSurgeIcon(surge: string): string {
    const icons: Record<string, string> = {
      'FLACCID_DRIZZLE': '💧',
      'WEAK_PULSES': '💨',
      'STEADY_POUNDING': '🔥',
      'FRENZIED_SLAPPING': '⚡',
      'MEGA_SURGE': '💥',
      'GIGA_SURGE': '🌟',
      'ASCENDED_NIRVANA': '✨'
    };
    return icons[surge] || '⚡';
  }

  private getStabilityIcon(stability: string): string {
    const icons: Record<string, string> = {
      'RADIANT_CLARITY': '✨',
      'PRISTINE': '🌟',
      'CRYPTIC': '🔮',
      'FLICKERING': '⚡',
      'GLITCHED_OMINOUS': '🔥',
      'FORBIDDEN_FRAGMENT': '👹'
    };
    return icons[stability] || '👁️';
  }

  // === HELPER METHODS ===

  private getOracleIcon(style?: string): string {
    const iconMap: Record<string, string> = {
      'cyberpunk_prophet': '🔮',
      'corrupted_oracle': '🔥',
      'chaotic_sage': '⚡',
      'pure_prophet': '✨'
    };
    return iconMap[style || 'pure_prophet'] || '👁️';
  }

  // 🌀 PHASE 1: Corruption-specific icon mapping
  private getCorruptionIcon(corruptionLevel?: string): string {
    const corruptionIconMap: Record<string, string> = {
      'pristine': '✨',
      'cryptic': '🔮',
      'flickering': '⚡',
      'glitched_ominous': '🌀',
      'forbidden_fragment': '💀'
    };
    return corruptionIconMap[corruptionLevel || 'pristine'] || '👁️';
  }

  // 🌀 PHASE 1: Corruption-level descriptions
  private getCorruptionDescription(corruptionLevel: string): string {
    const descriptions: Record<string, string> = {
      'cryptic': 'Mysterious symbols',
      'flickering': 'Unstable data streams',
      'glitched_ominous': 'Reality fractures',
      'forbidden_fragment': 'Dangerous void energies'
    };
    return descriptions[corruptionLevel] || 'Unknown distortion';
  }

  private mapUrgencyToPriority(urgency?: string): Alert['priority'] {
    const priorityMap: Record<string, Alert['priority']> = {
      'legendary': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    return priorityMap[urgency || 'medium'] || 'medium';
  }

  private mapEventTypeToAlertType(eventType: string): Alert['type'] {
    const typeMap: Record<string, Alert['type']> = {
      'chode_evolution': 'milestone',
      'achievement_unlocked': 'milestone',
      'oracle_girth_milestone': 'milestone',
      'mega_slap_landed': 'community',
      'giga_slap_landed': 'community'
    };
    return typeMap[eventType] || 'system';
  }

  private generateGameEventTitle(eventType: string): string {
    const titleMap: Record<string, string> = {
      'chode_evolution': 'Evolution Achieved',
      'achievement_unlocked': 'Achievement Unlocked',
      'oracle_girth_milestone': 'Girth Milestone',
      'mega_slap_landed': 'Mega Slap Power',
      'giga_slap_landed': 'Giga Slap Mastery'
    };
    return titleMap[eventType] || 'Game Event';
  }

  private generateGameEventMessage(eventType: string, payload: any): string {
    switch (eventType) {
      case 'chode_evolution':
        return `A player has evolved their chode to new heights of power!`;
      case 'achievement_unlocked':
        return `Achievement unlocked: "${payload.achievement_name || 'Unknown Achievement'}"`;
      case 'oracle_girth_milestone':
        return `Girth milestone reached: ${payload.milestone_value || 'Unknown'} total girth!`;
      case 'mega_slap_landed':
        return `Mega slap unleashed with ${payload.slap_power_girth || 'massive'} power!`;
      case 'giga_slap_landed':
        return `GIGA SLAP DEVASTATION! Reality trembles with power!`;
      default:
        return 'Something significant happened in the game...';
    }
  }

  private getGameEventIcon(eventType: string): string {
    const iconMap: Record<string, string> = {
      'chode_evolution': '🚀',
      'achievement_unlocked': '🏆',
      'oracle_girth_milestone': '💎',
      'mega_slap_landed': '💥',
      'giga_slap_landed': '⚡'
    };
    return iconMap[eventType] || '🎮';
  }

  private getGameEventPriority(eventType: string): Alert['priority'] {
    const priorityMap: Record<string, Alert['priority']> = {
      'chode_evolution': 'high',
      'achievement_unlocked': 'medium',
      'oracle_girth_milestone': 'high',
      'mega_slap_landed': 'medium',
      'giga_slap_landed': 'high'
    };
    return priorityMap[eventType] || 'medium';
  }

  private getLastAlertTime(type: string): number {
    const stored = localStorage.getItem(`smart_alerts_last_${type}`);
    return stored ? parseInt(stored, 10) : 0;
  }

  private setLastAlertTime(type: string, time: number): void {
    localStorage.setItem(`smart_alerts_last_${type}`, time.toString());
  }

  // === PUBLIC METHODS ===

  public isDemoMode(): boolean {
    return this.config.demoMode;
  }

  public isRealTimeEnabled(): boolean {
    return this.config.realTimeEnabled;
  }

  public getBackendSources(): SmartAlertsConfig['backendSources'] {
    return { ...this.config.backendSources };
  }

  public cleanup(): void {
    this.subscriptions.forEach(sub => {
      try {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      } catch (error) {
        console.error('Error cleaning up SmartAlerts subscription:', error);
      }
    });
    this.subscriptions = [];
    this.alertCallbacks.clear();
  }
}

// Export singleton instance
export const smartAlertsService = new SmartAlertsService(); 