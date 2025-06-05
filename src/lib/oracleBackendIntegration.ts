// 🔮 Oracle Backend Integration - Connects Scaling System to Real Data
import { supabase } from './supabase';
import { oracleScaling, OracleMetrics } from './oracleScalingSystem';

interface DatabasePlayerActivity {
  session_id: string;
  player_address: string;
  taps_per_minute: number;
  session_duration_minutes: number;
  achievements_unlocked: number;
  total_taps: number;
  time_since_last_activity_minutes: number;
  upgrades_purchased: number;
  evolution_level: number;
  mega_slaps_count: number;
  last_activity_timestamp: string;
}

interface DatabaseCommunityActivity {
  total_active_players: number;
  collective_taps_per_minute: number;
  voting_participation: number;
  community_milestones_hit: number;
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  total_events_last_hour: number;
}

export class OracleBackendIntegration {
  
  // === EXTRACT PLAYER ACTIVITY FROM DATABASE ===
  async extractPlayerActivity(session_id?: string, player_address?: string): Promise<DatabasePlayerActivity> {
    console.log('🔮 Extracting player activity from database...');
    
    try {
      // Get recent events for the player/session
      let query = supabase
        .from('live_game_events')
        .select('*')
        .gte('timestamp_utc', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .order('timestamp_utc', { ascending: false })
        .limit(1000);
      
      if (session_id) {
        query = query.eq('session_id', session_id);
      } else if (player_address) {
        query = query.eq('player_address', player_address);
      }
      
      const { data: events, error } = await query;
      
      if (error) {
        console.error('🔮 Error fetching player events:', error);
        throw error;
      }
      
      console.log(`🔮 Found ${events?.length || 0} recent events`);
      
      if (!events || events.length === 0) {
        // Return default activity for new/inactive players
        return {
          session_id: session_id || 'unknown',
          player_address: player_address || 'unknown',
          taps_per_minute: 0,
          session_duration_minutes: 0,
          achievements_unlocked: 0,
          total_taps: 0,
          time_since_last_activity_minutes: 60, // Default to 1 hour inactive
          upgrades_purchased: 0,
          evolution_level: 0,
          mega_slaps_count: 0,
          last_activity_timestamp: new Date().toISOString()
        };
      }
      
      // Calculate activity metrics from events
      const now = new Date();
      const sessionStart = new Date(events[events.length - 1].timestamp_utc);
      const lastActivity = new Date(events[0].timestamp_utc);
      
      const session_duration_minutes = (now.getTime() - sessionStart.getTime()) / (1000 * 60);
      const time_since_last_activity_minutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      // Count different event types
      const tap_events = events.filter(e => e.event_type === 'tap_activity_burst');
      const mega_slap_events = events.filter(e => e.event_type === 'mega_slap_landed');
      const achievement_events = events.filter(e => e.event_type === 'achievement_unlocked');
      const upgrade_events = events.filter(e => e.event_type === 'upgrade_purchased');
      const evolution_events = events.filter(e => e.event_type === 'chode_evolution');
      
      // Calculate taps per minute from tap_activity_burst events
      const total_taps = tap_events.reduce((sum, event) => {
        const payload = event.event_payload as any;
        return sum + (payload?.tap_count || payload?.taps_in_burst || 1);
      }, 0);
      
      const taps_per_minute = session_duration_minutes > 0 ? total_taps / session_duration_minutes : 0;
      
      // Get evolution level from latest evolution event
      const latest_evolution = evolution_events[0]?.event_payload as any;
      const evolution_level = latest_evolution?.new_level || latest_evolution?.level || 0;
      
      return {
        session_id: session_id || events[0].session_id,
        player_address: player_address || events[0].player_address,
        taps_per_minute: Math.round(taps_per_minute),
        session_duration_minutes: Math.round(session_duration_minutes),
        achievements_unlocked: achievement_events.length,
        total_taps,
        time_since_last_activity_minutes: Math.round(time_since_last_activity_minutes),
        upgrades_purchased: upgrade_events.length,
        evolution_level,
        mega_slaps_count: mega_slap_events.length,
        last_activity_timestamp: lastActivity.toISOString()
      };
      
    } catch (error) {
      console.error('🔮 Error in extractPlayerActivity:', error);
      throw error;
    }
  }
  
  // === EXTRACT COMMUNITY ACTIVITY FROM DATABASE ===
  async extractCommunityActivity(): Promise<DatabaseCommunityActivity> {
    console.log('🔮 Extracting community activity from database...');
    
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      // Get all events from last hour
      const { data: recentEvents, error: eventsError } = await supabase
        .from('live_game_events')
        .select('*')
        .gte('timestamp_utc', oneHourAgo);
      
      if (eventsError) {
        console.error('🔮 Error fetching community events:', eventsError);
        throw eventsError;
      }
      
      // Get unique players from recent events
      const uniquePlayers = new Set(recentEvents?.map(e => e.player_address) || []);
      const total_active_players = uniquePlayers.size;
      
      // Calculate collective taps per minute
      const tap_events = recentEvents?.filter(e => e.event_type === 'tap_activity_burst') || [];
      const total_community_taps = tap_events.reduce((sum, event) => {
        const payload = event.event_payload as any;
        return sum + (payload?.tap_count || payload?.taps_in_burst || 1);
      }, 0);
      const collective_taps_per_minute = total_community_taps / 60; // Over last hour
      
      // Check for voting participation (if we have voting events)
      const voting_events = recentEvents?.filter(e => e.event_type === 'community_vote') || [];
      const voting_participation = Math.min(1.0, voting_events.length / 100); // Normalize to 0-1
      
      // Count community milestones
      const milestone_events = recentEvents?.filter(e => 
        e.event_type === 'community_milestone' || 
        e.event_type === 'achievement_unlocked'
      ) || [];
      
      // Determine overall sentiment based on event types
      const positive_events = recentEvents?.filter(e => 
        e.event_type === 'achievement_unlocked' || 
        e.event_type === 'chode_evolution' ||
        e.event_type === 'mega_slap_landed'
      ).length || 0;
      
      const negative_events = recentEvents?.filter(e => 
        e.event_type === 'session_timeout' || 
        e.event_type === 'player_disconnect'
      ).length || 0;
      
      let overall_sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (positive_events > negative_events * 2) {
        overall_sentiment = 'positive';
      } else if (negative_events > positive_events * 2) {
        overall_sentiment = 'negative';
      }
      
      console.log(`🔮 Community Activity: ${total_active_players} players, ${collective_taps_per_minute.toFixed(1)} taps/min`);
      
      return {
        total_active_players,
        collective_taps_per_minute: Math.round(collective_taps_per_minute),
        voting_participation,
        community_milestones_hit: milestone_events.length,
        overall_sentiment,
        total_events_last_hour: recentEvents?.length || 0
      };
      
    } catch (error) {
      console.error('🔮 Error in extractCommunityActivity:', error);
      throw error;
    }
  }
  
  // === CALCULATE METRICS WITH REAL DATA ===
  async calculateOracleMetricsFromDatabase(session_id?: string, player_address?: string): Promise<{
    metrics: OracleMetrics,
    influences: Record<string, any>,
    player_activity: DatabasePlayerActivity,
    community_activity: DatabaseCommunityActivity
  }> {
    console.log('🔮 Calculating Oracle metrics from real database data...');
    
    try {
      // Extract real data from database
      const [playerActivity, communityActivity] = await Promise.all([
        this.extractPlayerActivity(session_id, player_address),
        this.extractCommunityActivity()
      ]);
      
      console.log('🔮 Player Activity:', playerActivity);
      console.log('🔮 Community Activity:', communityActivity);
      
      // Convert to scaling system format
      const scalingPlayerActivity = {
        taps_per_minute: playerActivity.taps_per_minute,
        session_duration_minutes: playerActivity.session_duration_minutes,
        achievements_unlocked: playerActivity.achievements_unlocked,
        total_taps: playerActivity.total_taps,
        time_since_last_activity_minutes: playerActivity.time_since_last_activity_minutes,
        upgrades_purchased: playerActivity.upgrades_purchased,
        evolution_level: playerActivity.evolution_level,
        mega_slaps_count: playerActivity.mega_slaps_count
      };
      
      const scalingCommunityActivity = {
        total_active_players: communityActivity.total_active_players,
        collective_taps_per_minute: communityActivity.collective_taps_per_minute,
        voting_participation: communityActivity.voting_participation,
        community_milestones_hit: communityActivity.community_milestones_hit,
        overall_sentiment: communityActivity.overall_sentiment
      };
      
      // Calculate metrics using the scaling system
      const result = oracleScaling.calculateAllMetrics(scalingPlayerActivity, scalingCommunityActivity);
      
      console.log('🔮 Calculated Metrics:', result.metrics);
      
      return {
        metrics: result.metrics,
        influences: result.all_influences,
        player_activity: playerActivity,
        community_activity: communityActivity
      };
      
    } catch (error) {
      console.error('🔮 Error calculating Oracle metrics:', error);
      throw error;
    }
  }
  
  // === UPDATE GIRTH INDEX WITH CALCULATED METRICS ===
  async updateGirthIndexWithCalculatedMetrics(calculated_metrics: OracleMetrics): Promise<void> {
    console.log('🔮 Updating girth index with calculated metrics...');
    
    try {
      const { error } = await supabase
        .from('girth_index_current_values')
        .upsert({
          id: 1, // Singleton row
          divine_girth_resonance: calculated_metrics.divine_resonance,
          tap_surge_index: calculated_metrics.tap_surge_index,
          legion_morale: calculated_metrics.legion_morale,
          oracle_stability_status: calculated_metrics.oracle_stability,
          last_updated: new Date().toISOString(),
          calculation_source: 'oracle_scaling_system'
        });
      
      if (error) {
        console.error('🔮 Error updating girth index:', error);
        throw error;
      }
      
      console.log('🔮 Girth index updated successfully with calculated metrics');
      
    } catch (error) {
      console.error('🔮 Error in updateGirthIndexWithCalculatedMetrics:', error);
      throw error;
    }
  }
  
  // === STORE INFLUENCE DETAILS ===
  async storeInfluenceDetails(influences: Record<string, any>, session_id: string): Promise<void> {
    console.log('🔮 Storing influence details...');
    
    try {
      // Store detailed influence breakdown for frontend consumption
      const { error } = await supabase
        .from('oracle_influence_details')
        .upsert({
          session_id,
          influences_json: influences,
          calculated_at: new Date().toISOString()
        });
      
      if (error && error.code !== '42P01') { // Ignore table doesn't exist error for now
        console.error('🔮 Error storing influence details:', error);
        // Don't throw - this is optional
      }
      
    } catch (error) {
      console.error('🔮 Error in storeInfluenceDetails:', error);
      // Don't throw - this is optional
    }
  }
  
  // === MAIN ORCHESTRATION FUNCTION ===
  async processPlayerSession(session_id: string, player_address?: string): Promise<{
    success: boolean,
    metrics: OracleMetrics,
    influences: Record<string, any>
  }> {
    console.log(`🔮 Processing player session: ${session_id}`);
    
    try {
      // Calculate metrics from real database data
      const result = await this.calculateOracleMetricsFromDatabase(session_id, player_address);
      
      // Update the girth index with calculated metrics
      await this.updateGirthIndexWithCalculatedMetrics(result.metrics);
      
      // Store influence details for frontend
      await this.storeInfluenceDetails(result.influences, session_id);
      
      console.log('🔮 Player session processed successfully');
      
      return {
        success: true,
        metrics: result.metrics,
        influences: result.influences
      };
      
    } catch (error) {
      console.error('🔮 Error processing player session:', error);
      return {
        success: false,
        metrics: {
          divine_resonance: 50,
          tap_surge_index: 'STEADY_POUNDING',
          legion_morale: 'CAUTIOUS',
          oracle_stability: 'PRISTINE'
        },
        influences: {}
      };
    }
  }
}

export const oracleBackend = new OracleBackendIntegration(); 