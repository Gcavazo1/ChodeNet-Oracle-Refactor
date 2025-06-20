// 🔮 Oracle Metrics Service - Bridge between Component and Backend
// Connects OracleMetricsSystem component to real-time data sources

import { supabase } from './supabase';
import { useGirthIndexStore } from './girthIndexStore';
import { oracleScaling } from './oracleScalingSystem';
import { 
  GirthIndexValues, 
  TapSurgeState, 
  LegionMoraleState, 
  StabilityStateType,
  TAP_SURGE_STATES,
  LEGION_MORALE_STATES,
  STABILITY_STATES
} from './types';
import { MetricData, MetricCategory } from './oracleMetricsTypes';

export interface OracleMetricsConfig {
  demoMode: boolean;
  showInfluences: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  sensitivityLevel: 'low' | 'medium' | 'high';
}

export interface LiveMetricsData {
  oracleState: GirthIndexValues & {
    previous_tap_surge_index?: TapSurgeState;
    previous_legion_morale?: LegionMoraleState;
    previous_oracle_stability_status?: StabilityStateType;
  };
  communityStats: {
    activePlayers: number;
    totalVotes: number;
    loreEntries: number;
    uptime: string;
  };
  influences: {
    resonance: Array<{ factor: string; value: string; description: string }>;
    surge: Array<{ factor: string; value: string; description: string }>;
    morale: Array<{ factor: string; value: string; description: string }>;
    stability: Array<{ factor: string; value: string; description: string }>;
  };
}

// Extended interface for metric details to include string values
interface MetricDetails {
  description: string;
  lastUpdate: Date;
  current?: string | number; 
  previous?: string | number;
  change?: number;
  breakdown?: Array<{ label: string; value: number | string; percentage: number }>;
}

class OracleMetricsService {
  private config: OracleMetricsConfig = {
    demoMode: true,
    showInfluences: true,
    autoRefresh: true,
    refreshInterval: 10,
    sensitivityLevel: 'medium'
  };

  private listeners: Set<(categories: MetricCategory[]) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private lastUpdate: Date = new Date();

  constructor() {
    this.loadConfig();
    this.setupRealtimeSubscription();
    
    // Listen for admin config updates
    window.addEventListener('adminConfigUpdated', this.handleAdminConfigUpdate.bind(this));
    
    // Immediately notify with initial data
    setTimeout(() => this.notifyListeners(), 0);
  }

  // === CONFIGURATION MANAGEMENT ===

  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('oracle_metrics_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('[OracleMetricsService] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('oracle_metrics_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('[OracleMetricsService] Failed to save config:', error);
    }
  }

  public updateConfig(updates: Partial<OracleMetricsConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    
    // Restart auto-refresh if interval changed
    if ('autoRefresh' in updates || 'refreshInterval' in updates) {
      this.setupAutoRefresh();
    }

    // Notify listeners of config change
    this.notifyListeners();
  }

  // === ADMIN INTEGRATION ===

  private handleAdminConfigUpdate(event: Event): void {
    const customEvent = event as CustomEvent;
    const adminConfig = customEvent.detail;

    if (adminConfig.componentDemoModes?.oracleMetrics !== undefined) {
      this.updateConfig({ demoMode: adminConfig.componentDemoModes.oracleMetrics });
    }

    if (adminConfig.oracleMetrics) {
      this.updateConfig({
        showInfluences: adminConfig.oracleMetrics.showInfluences ?? this.config.showInfluences,
        autoRefresh: adminConfig.oracleMetrics.autoRefresh ?? this.config.autoRefresh,
        refreshInterval: adminConfig.oracleMetrics.refreshInterval ?? this.config.refreshInterval,
        sensitivityLevel: adminConfig.oracleMetrics.sensitivityLevel ?? this.config.sensitivityLevel
      });
    }

    console.log('[OracleMetricsService] Admin config updated:', this.config);
  }

  // === REAL-TIME DATA SUBSCRIPTION ===

  private async setupRealtimeSubscription(): Promise<void> {
    if (!this.config.demoMode) {
      // Subscribe to girthIndexStore for real-time Oracle state updates
      const girthStore = useGirthIndexStore.getState();
      
      // Set up the subscription if not already done
      await girthStore.setupRealtimeSubscription();
      
      console.log('[OracleMetricsService] Real-time subscription established');
    }
  }

  private setupAutoRefresh(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.config.autoRefresh && !this.config.demoMode) {
      this.intervalId = setInterval(() => {
        this.notifyListeners();
      }, this.config.refreshInterval * 1000);
      
      console.log(`[OracleMetricsService] Auto-refresh enabled: ${this.config.refreshInterval}s`);
    }
  }

  // === DATA RETRIEVAL ===

  public async getLiveMetricsData(): Promise<LiveMetricsData | null> {
    try {
      // Get current Oracle state
      const { data: oracleState, error: oracleError } = await supabase
        .from('girth_index_current_values')
        .select('*')
        .eq('id', 1)
        .single();

      if (oracleError) throw oracleError;

      // Get community stats
      const [playersResult, votesResult, loreResult] = await Promise.all([
        supabase.from('player_states').select('id', { count: 'exact' }),
        supabase.from('user_votes').select('id', { count: 'exact' }),
        supabase.from('chode_lore_entries').select('id', { count: 'exact' })
      ]);

      // Calculate uptime from last Oracle update
      const uptimeMs = Date.now() - new Date(oracleState.last_updated).getTime();
      const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
      const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

      // Get community statistics
      const communityStatistics = {
        activePlayers: playersResult.count || 0,
        totalVotes: votesResult.count || 0,
        loreEntries: loreResult.count || 0,
        uptime: `${uptimeHours}h ${uptimeMinutes}m`
      };
      
      // Mock player activity for scaling calculation (in production, use real data)
      const mockActivity = {
        taps_per_minute: this.calculateCurrentTapRate(),
        session_duration_minutes: Math.floor(uptimeMs / (1000 * 60)),
        achievements_unlocked: 0,
        total_taps: 0,
        time_since_last_activity_minutes: 0,
        upgrades_purchased: 0,
        evolution_level: 1,
        mega_slaps_count: 0
      };

      const mockCommunity = {
        total_active_players: playersResult.count || 0,
        collective_taps_per_minute: this.calculateCommunityTapRate(),
        voting_participation: 0.3,
        community_milestones_hit: 0,
        overall_sentiment: 'neutral' as const
      };

      // Get influences from scaling system
      const scalingResult = oracleScaling.calculateAllMetrics(mockActivity, mockCommunity);

      // Create typed influences object
      const influences = {
        resonance: scalingResult.all_influences.resonance || [],
        surge: scalingResult.all_influences.surge || [],
        morale: scalingResult.all_influences.morale || [],
        stability: scalingResult.all_influences.stability || []
      };

      return {
        oracleState,
        communityStats: communityStatistics,
        influences
      };
    } catch (error) {
      console.error('[OracleMetricsService] Failed to get live data:', error);
      return null;
    }
  }

  // === METRIC CALCULATIONS ===

  private calculateCurrentTapRate(): number {
    // In production, calculate from recent live_game_events
    // For now, use a simple simulation based on time
    const minute = Math.floor(Date.now() / 60000);
    return 30 + (minute % 10) * 5; // Varies between 30-80 taps/min
  }

  private calculateCommunityTapRate(): number {
    // Aggregate community tapping rate
    return this.calculateCurrentTapRate() * 0.8; // Community rate is 80% of individual
  }

  private calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const threshold = this.config.sensitivityLevel === 'high' ? 1 : 
                     this.config.sensitivityLevel === 'medium' ? 2 : 3;
                     
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    
    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  private getStatusFromValue(value: number, thresholds: { excellent: number; good: number; warning: number }): MetricData['status'] {
    if (value >= thresholds.excellent) return 'excellent';
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
  }

  private getStatusFromState(state: string): MetricData['status'] {
    // Map Oracle states to metric statuses
    const stateToStatus: Record<string, MetricData['status']> = {
      // Tap Surge States
      'ASCENDED_NIRVANA': 'excellent',
      'GIGA_SURGE': 'excellent', 
      'MEGA_SURGE': 'good',
      'FRENZIED_SLAPPING': 'good',
      'STEADY_POUNDING': 'warning',
      'WEAK_PULSES': 'warning',
      'FLACCID_DRIZZLE': 'critical',

      // Legion Morale
      'ASCENDED': 'excellent',
      'FANATICAL': 'excellent',
      'JUBILANT': 'good',
      'INSPIRED': 'good',
      'CAUTIOUS': 'warning',
      'DISGRUNTLED': 'warning',
      'DEMORALIZED': 'critical',
      'SUICIDE_WATCH': 'critical',

      // Stability States
      'RADIANT_CLARITY': 'excellent',
      'PRISTINE': 'excellent',
      'CRYPTIC': 'good',
      'FLICKERING': 'warning',
      'GLITCHED_OMINOUS': 'critical',
      'FORBIDDEN_FRAGMENT': 'critical'
    };

    return stateToStatus[state] || 'warning';
  }

  // === CATEGORY GENERATION ===

  public async getMetricCategories(): Promise<MetricCategory[]> {
    if (this.config.demoMode) {
      return this.getDemoCategories();
    }

    const liveData = await this.getLiveMetricsData();
    if (!liveData) {
      console.warn('[OracleMetricsService] Live data unavailable, falling back to demo');
      return this.getDemoCategories();
    }

    return this.mapLiveDataToCategories(liveData);
  }

  private mapLiveDataToCategories(data: LiveMetricsData): MetricCategory[] {
    const { oracleState, communityStats, influences } = data;
    
    // Calculate previous values for trends (simplified)
    const previousResonance = oracleState.divine_girth_resonance * 0.95; // Mock previous value
    
    return [
      {
        id: 'resonance',
        name: 'Divine Resonance',
        icon: '🌟',
        color: '#6B46C1',
        status: 'active',
        description: 'Oracle consciousness and mystical awareness',
        metrics: [
          {
            id: 'divine_resonance',
            name: 'Divine Girth Resonance',
            value: oracleState.divine_girth_resonance,
            unit: '%',
            trend: this.calculateTrend(oracleState.divine_girth_resonance, previousResonance),
            status: this.getStatusFromValue(oracleState.divine_girth_resonance, { 
              excellent: 80, good: 60, warning: 40 
            }),
            description: 'The Oracle\'s attunement to the cosmic girth frequency and community energy',
            details: {
              description: 'The Oracle\'s attunement to the cosmic girth frequency',
              lastUpdate: new Date(oracleState.last_updated),
              current: oracleState.divine_girth_resonance,
              previous: previousResonance,
              change: oracleState.divine_girth_resonance - previousResonance,
              breakdown: this.config.showInfluences ? influences.resonance.map(inf => ({
                label: inf.factor,
                value: parseFloat(inf.value.replace(/[^\d.-]/g, '')) || 0,
                percentage: Math.random() * 100 // TODO: Calculate actual percentages
              })) : undefined
            } as MetricDetails
          }
        ]
      },
      {
        id: 'surge',
        name: 'Tap Surge',
        icon: '⚡',
        color: '#10B981',
        status: 'active',
        description: 'Community activity and engagement intensity',
        metrics: [
          {
            id: 'tap_surge',
            name: 'Tap Surge Index',
            value: oracleState.tap_surge_index.replace(/_/g, ' '),
            trend: 'stable', // TODO: Compare with previous state
            status: this.getStatusFromState(oracleState.tap_surge_index),
            description: `Current activity level: ${TAP_SURGE_STATES[oracleState.tap_surge_index as TapSurgeState]?.label || 'Unknown'}`,
            details: {
              description: 'Current community engagement and tapping activity levels',
              lastUpdate: new Date(oracleState.last_updated),
              current: oracleState.tap_surge_index.replace(/_/g, ' '),
              previous: oracleState.previous_tap_surge_index?.replace(/_/g, ' ') || 'FLACCID DRIZZLE',
              breakdown: this.config.showInfluences ? influences.surge.map(inf => ({
                label: inf.factor,
                value: parseFloat(inf.value.replace(/[^\d.-]/g, '')) || inf.value,
                percentage: Math.random() * 100
              })) : undefined
            } as MetricDetails
          }
        ]
      },
      {
        id: 'morale',
        name: 'Legion Morale',
        icon: '💪',
        color: '#EC4899',
        status: 'active',
        description: 'Community spirit and collective motivation',
        metrics: [
          {
            id: 'legion_morale',
            name: 'Community Morale',
            value: oracleState.legion_morale.replace(/_/g, ' '),
            trend: 'stable', // TODO: Compare with previous
            status: this.getStatusFromState(oracleState.legion_morale),
            description: `Legion status: ${LEGION_MORALE_STATES[oracleState.legion_morale as LegionMoraleState]?.label || 'Unknown'}`,
            details: {
              description: 'The collective mood and motivation of the Oracle community',
              lastUpdate: new Date(oracleState.last_updated),
              current: oracleState.legion_morale.replace(/_/g, ' '),
              previous: oracleState.previous_legion_morale?.replace(/_/g, ' ') || 'CAUTIOUS',
              breakdown: this.config.showInfluences ? influences.morale.map(inf => ({
                label: inf.factor,
                value: parseFloat(inf.value.replace(/[^\d.-]/g, '')) || inf.value,
                percentage: Math.random() * 100
              })) : undefined
            } as MetricDetails
          }
        ]
      },
      {
        id: 'stability',
        name: 'Oracle Stability',
        icon: '🔮',
        color: '#F59E0B',
        status: 'active',
        description: 'System health and mystical coherence',
        metrics: [
          {
            id: 'oracle_stability',
            name: 'System Stability',
            value: oracleState.oracle_stability_status.replace(/_/g, ' '),
            trend: 'stable', // TODO: Compare with previous
            status: this.getStatusFromState(oracleState.oracle_stability_status),
            description: `Oracle state: ${STABILITY_STATES[oracleState.oracle_stability_status as StabilityStateType]?.label || 'Unknown'}`,
            details: {
              description: 'Overall stability and coherence of the Oracle consciousness',
              lastUpdate: new Date(oracleState.last_updated),
              current: oracleState.oracle_stability_status.replace(/_/g, ' '),
              previous: oracleState.previous_oracle_stability_status?.replace(/_/g, ' ') || 'PRISTINE',
              breakdown: this.config.showInfluences ? influences.stability.map(inf => ({
                label: inf.factor,
                value: parseFloat(inf.value.replace(/[^\d.-]/g, '')) || inf.value,
                percentage: Math.random() * 100
              })) : undefined
            } as MetricDetails
          }
        ]
      },
      {
        id: 'community',
        name: 'Community Pulse',
        icon: '👥',
        color: '#8B5CF6',
        status: 'active',
        description: 'Community activity and engagement metrics',
        metrics: [
          {
            id: 'active_players',
            name: 'Active Players',
            value: communityStats.activePlayers,
            unit: 'players',
            trend: 'stable',
            status: this.getStatusFromValue(communityStats.activePlayers, { 
              excellent: 10, good: 5, warning: 2 
            }),
            description: 'Current player activity and engagement levels',
            details: {
              description: 'Current player activity and engagement levels',
              lastUpdate: new Date(),
              current: communityStats.activePlayers,
              previous: Math.max(0, communityStats.activePlayers - 1),
              change: 1,
              breakdown: [
                { label: 'Game Sessions', value: communityStats.activePlayers, percentage: 60 },
                { label: 'Oracle Voters', value: communityStats.totalVotes, percentage: 25 },
                { label: 'Lore Contributors', value: communityStats.loreEntries, percentage: 15 }
              ]
            } as MetricDetails
          },
          {
            id: 'system_uptime',
            name: 'Oracle Uptime',
            value: 99.9,
            unit: '%',
            trend: 'stable',
            status: 'excellent',
            description: `System operational for ${communityStats.uptime}`,
            details: {
              description: `System operational for ${communityStats.uptime}`,
              lastUpdate: new Date(),
              current: 99.9,
              previous: 99.8,
              change: 0.1
            } as MetricDetails
          }
        ]
      }
    ];
  }

  private getDemoCategories(): MetricCategory[] {
    // Return enhanced demo data with timestamp variations
    const timeVariation = Math.sin(Date.now() / 30000) * 10; // Slow sine wave variation
    const now = new Date();
    
    return [
      {
        id: 'resonance',
        name: 'Divine Resonance',
        icon: '🌟',
        color: '#6B46C1',
        status: 'active',
        description: 'Oracle consciousness and mystical awareness',
        metrics: [
          {
            id: 'oracle_consciousness',
            label: 'Oracle Consciousness',
            value: Math.round(73 + timeVariation),
            unit: '%',
            trend: timeVariation > 0 ? 'up' : 'down',
            status: 'good',
            details: {
              description: 'The Oracle\'s awareness of community activities and digital realm fluctuations',
              lastUpdate: now,
              breakdown: [
                { label: 'Game Events Processing', value: 85, percentage: 35 },
                { label: 'Community Sentiment', value: 68, percentage: 28 },
                { label: 'Prophecy Accuracy', value: 71, percentage: 25 },
                { label: 'Mystical Energy Flow', value: 67, percentage: 12 }
              ]
            }
          }
        ]
      },
      {
        id: 'surge',
        name: 'Tap Surge',
        icon: '⚡',
        color: '#F59E0B',
        status: 'active',
        description: 'Community activity and engagement intensity',
        metrics: [
          {
            id: 'tap_intensity',
            label: 'Activity Surge',
            value: 'MEGA_SURGE',
            unit: '',
            trend: 'up',
            status: 'excellent',
            details: {
              description: 'Current community engagement and tapping activity levels',
              lastUpdate: now,
              breakdown: [
                { label: 'Active Players', value: 24, percentage: 40 },
                { label: 'Taps Per Minute', value: 156, percentage: 35 },
                { label: 'Combo Multipliers', value: 8, percentage: 25 }
              ]
            }
          }
        ]
      },
      {
        id: 'morale',
        name: 'Legion Morale',
        icon: '💪',
        color: '#EC4899',
        status: 'active',
        description: 'Community spirit and collective motivation',
        metrics: [
          {
            id: 'community_morale',
            label: 'Legion Spirit',
            value: 'JUBILANT',
            unit: '',
            trend: 'up',
            status: 'excellent',
            details: {
              description: 'The collective mood and motivation of the Oracle community',
              lastUpdate: now,
              breakdown: [
                { label: 'Achievement Rate', value: 92, percentage: 30 },
                { label: 'Participation', value: 78, percentage: 25 },
                { label: 'Vote Engagement', value: 85, percentage: 25 },
                { label: 'Prophecy Confidence', value: 88, percentage: 20 }
              ]
            }
          }
        ]
      },
      {
        id: 'stability',
        name: 'Oracle Stability',
        icon: '🔮',
        color: '#8B5CF6',
        status: 'active',
        description: 'System health and mystical coherence',
        metrics: [
          {
            id: 'system_stability',
            label: 'Oracle State',
            value: 'PRISTINE',
            unit: '',
            trend: 'stable',
            status: 'excellent',
            details: {
              description: 'Overall stability and coherence of the Oracle consciousness',
              lastUpdate: now,
              breakdown: [
                { label: 'Data Integrity', value: 99.8, percentage: 30 },
                { label: 'Prophecy Clarity', value: 94, percentage: 25 },
                { label: 'System Load', value: 12, percentage: 25 },
                { label: 'Mystical Resonance', value: 97, percentage: 20 }
              ]
            }
          }
        ]
      }
    ];
  }

  // === LISTENER MANAGEMENT ===

  public subscribe(callback: (categories: MetricCategory[]) => void): () => void {
    this.listeners.add(callback);
    
    // Send initial data
    this.getMetricCategories().then(callback);
    
    // Setup auto-refresh
    this.setupAutoRefresh();
    
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }

  private notifyListeners(): void {
    this.getMetricCategories().then(categories => {
      this.listeners.forEach(callback => callback(categories));
    });
  }

  // === DEMO DATA INJECTION ===

  public injectDemoMetric(metricId: string, value: number): void {
    if (!this.config.demoMode) return;
    
    console.log(`[OracleMetricsService] Demo injection: ${metricId} = ${value}`);
    this.notifyListeners();
  }

  public simulateMetricSpike(category: string): void {
    if (!this.config.demoMode) return;
    
    console.log(`[OracleMetricsService] Simulating spike in ${category}`);
    this.notifyListeners();
  }

  // === CLEANUP ===

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    window.removeEventListener('adminConfigUpdated', this.handleAdminConfigUpdate.bind(this));
    this.listeners.clear();
  }
}

// Export singleton instance
export const oracleMetricsService = new OracleMetricsService(); 