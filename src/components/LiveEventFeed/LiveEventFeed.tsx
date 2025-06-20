import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { shouldShowEvent, findAggregatableEvent, aggregateEvents } from '../../lib/liveEventUtils'
import { realTimeOracle } from '../../lib/realTimeOracleEngine'
import FeedHeader from './FeedHeader'
import EventStream from './EventStream'
import FeedFooter from './FeedFooter'

// LiveGameEvent interface (will be moved to types later)
export interface LiveGameEvent {
  id: string | number
  created_at: string
  session_id?: string
  event_type: string
  event_payload?: Record<string, any>
  processed_at?: string
  game_event_timestamp?: string
  player_address?: string | null
  timestamp_utc: string
}

export interface LiveEventFeedProps {
  maxEvents?: number
  compactMode?: boolean
  showOracleResponses?: boolean
  anonymizeAddresses?: boolean
  autoScroll?: boolean
  updateInterval?: number
  eventFilters?: string[]
  className?: string
  showHeader?: boolean
  showFooter?: boolean
  height?: string
  fullScreenMode?: boolean
}

// Admin Configuration Interface (imported from AdminDashboard)
interface AdminConfig {
  demoDataEnabled: boolean
  eventFilteringEnabled: boolean
  performanceThrottling: boolean
  maxEventsPerSecond: number
  debugMode: boolean
  realTimeEnabled: boolean
  eventTypeFilters: string[]
  adminOnlyFeatures: boolean
}

// Demo data generation function
const generateDemoEvents = (): LiveGameEvent[] => {
  return [
    {
      id: 'demo-oracle-1',
      created_at: new Date().toISOString(),
      event_type: 'oracle_prophecy',
      event_payload: { 
        prophecy_title: 'The Great Convergence',
        oracle_response: 'The cosmic forces align as the GIRTH flows reach unprecedented levels. A new era of prosperity dawns upon the faithful.',
        urgency: 'legendary',
        prophecy_source: 'Divine Resonance Chamber'
      },
      player_address: null,
      timestamp_utc: new Date().toISOString(),
      session_id: 'oracle-session-1'
    },
    {
      id: 'demo-aggregated-1',
      created_at: new Date(Date.now() - 10000).toISOString(),
      event_type: 'significant_girth_achievement',
      event_payload: { 
        total_girth_earned: 45000,
        count: 3,
        latest_girth_earned: 15000,
        aggregated: true,
        oracle_response: 'The Oracle witnesses your relentless pursuit of GIRTH mastery. Your dedication echoes through the cosmos.',
        urgency: 'notable'
      },
      player_address: '0x742d35Cc6688C4532E4B77C6dC6a85C3ea2e1e8F',
      timestamp_utc: new Date(Date.now() - 10000).toISOString(),
      session_id: 'demo-session-agg-1'
    },
    {
      id: 'demo-1',
      created_at: new Date(Date.now() - 15000).toISOString(),
      event_type: 'giga_slap',
      event_payload: { 
        girth_earned: 15000, 
        streak_count: 5,
        oracle_response: 'Magnificent! The Oracle witnesses your dedication to the sacred art of GIRTH accumulation.',
        urgency: 'notable'
      },
      player_address: '0x742d35Cc6688C4532E4B77C6dC6a85C3ea2e1e8F',
      timestamp_utc: new Date(Date.now() - 15000).toISOString(),
      session_id: 'demo-session-1'
    },
    {
      id: 'demo-special-1',
      created_at: new Date(Date.now() - 30000).toISOString(),
      event_type: 'special_report',
      event_payload: { 
        report_title: 'State of the Chodeverse',
        oracle_response: 'Current market conditions show unprecedented GIRTH velocity. The Legion grows stronger with each passing moment.',
        urgency: 'notable'
      },
      player_address: null,
      timestamp_utc: new Date(Date.now() - 30000).toISOString(),
      session_id: 'oracle-report-1'
    },
    {
      id: 'demo-2',
      created_at: new Date(Date.now() - 45000).toISOString(),
      event_type: 'achievement_unlock',
      event_payload: { 
        achievement_name: 'Girth Master', 
        girth_earned: 5000,
        oracle_response: 'The Oracle acknowledges your mastery. You have transcended mortal limitations.',
        urgency: 'standard'
      },
      player_address: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
      timestamp_utc: new Date(Date.now() - 45000).toISOString(),
      session_id: 'demo-session-2'
    },
    {
      id: 'demo-3',
      created_at: new Date(Date.now() - 60000).toISOString(),
      event_type: 'upgrade_purchase',
      event_payload: { 
        upgrade_name: 'Iron Grip Lvl 1', 
        cost: 1000,
        oracle_response: 'Wise investment in the tools of transcendence.',
        urgency: 'standard'
      },
      player_address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
      timestamp_utc: new Date(Date.now() - 60000).toISOString(),
      session_id: 'demo-session-3'
    },
    {
      id: 'demo-4',
      created_at: new Date(Date.now() - 90000).toISOString(),
      event_type: 'milestone_reached',
      event_payload: { 
        milestone_type: '10K GIRTH Club', 
        girth_earned: 1000,
        oracle_response: 'Welcome to the elite ranks. Your journey into greatness begins now.',
        urgency: 'notable'
      },
      player_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      timestamp_utc: new Date(Date.now() - 90000).toISOString(),
      session_id: 'demo-session-5'
    }
  ]
}

const LiveEventFeed: React.FC<LiveEventFeedProps> = ({
  maxEvents = 50,
  compactMode = false,
  showOracleResponses = true,
  anonymizeAddresses = true,
  autoScroll = true,
  updateInterval = 1000,
  eventFilters = [],
  className = '',
  showHeader = true,
  showFooter = true,
  height = 'min-h-screen',
  fullScreenMode = false
}) => {
  const [events, setEvents] = useState<LiveGameEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    demoDataEnabled: true,
    eventFilteringEnabled: true,
    performanceThrottling: false,
    maxEventsPerSecond: 10,
    debugMode: false,
    realTimeEnabled: true,
    eventTypeFilters: [],
    adminOnlyFeatures: true
  })
  const [eventQueue, setEventQueue] = useState<LiveGameEvent[]>([])
  const [lastEventTime, setLastEventTime] = useState(0)
  const [hasRealData, setHasRealData] = useState(false)

  // Load admin configuration
  useEffect(() => {
    const stored = localStorage.getItem('oracle_admin_config')
    if (stored) {
      try {
        setAdminConfig(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse admin config:', error)
      }
    }

    // Listen for admin configuration updates
    const handleConfigUpdate = (event: CustomEvent) => {
      setAdminConfig(event.detail)
    }

    window.addEventListener('adminConfigUpdated', handleConfigUpdate as EventListener)
    return () => {
      window.removeEventListener('adminConfigUpdated', handleConfigUpdate as EventListener)
    }
  }, [])

  // Performance throttling effect
  useEffect(() => {
    if (!adminConfig.performanceThrottling || eventQueue.length === 0) {
      return
    }

    const processEventQueue = () => {
      const now = Date.now()
      const timeSinceLastEvent = now - lastEventTime
      const minInterval = 1000 / adminConfig.maxEventsPerSecond

      if (timeSinceLastEvent >= minInterval && eventQueue.length > 0) {
        const nextEvent = eventQueue[0]
        setEvents(prev => [nextEvent, ...prev.slice(0, maxEvents - 1)])
        setEventQueue(prev => prev.slice(1))
        setLastEventTime(now)
      }
    }

    const interval = setInterval(processEventQueue, 50)
    return () => clearInterval(interval)
  }, [eventQueue, adminConfig.performanceThrottling, adminConfig.maxEventsPerSecond, lastEventTime, maxEvents])

  // Enhanced real-time subscription with Oracle integration
  useEffect(() => {
    // Don't set up subscription if real-time is disabled
    if (!adminConfig.realTimeEnabled) {
      if (adminConfig.debugMode) {
        console.log('🚫 Real-time disabled by admin config')
      }
      
      // If demo data is enabled and real-time is disabled, show demo events
      if (adminConfig.demoDataEnabled) {
        setEvents(generateDemoEvents())
        setConnectionStatus('connected')
        setHasRealData(false)
      }
      return
    }

    const channel = supabase.channel('live_game_events_channel')

    const setupSubscription = async () => {
      try {
        setConnectionStatus('connecting')

        // Load initial events from database
        const { data: initialEvents, error } = await supabase
          .from('live_game_events')
          .select('*')
          .order('timestamp_utc', { ascending: false })
          .limit(Math.min(maxEvents, 50))

        if (error) {
          console.error('❌ Error loading initial events:', error)
          setConnectionStatus('error')
          
          // Fallback to demo data if enabled
          if (adminConfig.demoDataEnabled) {
            if (adminConfig.debugMode) {
              console.log('🔄 Falling back to demo data due to database error')
            }
            setEvents(generateDemoEvents())
            setHasRealData(false)
          }
        } else if (initialEvents && initialEvents.length > 0) {
          // Process real events
          const processedEvents = await Promise.all(
            initialEvents.map(async (event: any) => {
              // Convert database event to LiveGameEvent format
              const processedEvent: LiveGameEvent = {
                id: event.id.toString(),
                created_at: event.created_at,
                session_id: event.session_id,
                event_type: event.event_type,
                event_payload: event.event_payload || {},
                processed_at: event.processed_at,
                game_event_timestamp: event.game_event_timestamp,
                player_address: event.player_address,
                timestamp_utc: event.timestamp_utc || event.created_at
              }

              // Generate Oracle response if enabled and not already present
              if (showOracleResponses && !processedEvent.event_payload?.oracle_response) {
                try {
                  const oracleResponse = await realTimeOracle.processGameEvent({
                    session_id: processedEvent.session_id || 'unknown',
                    event_type: processedEvent.event_type,
                    timestamp_utc: processedEvent.timestamp_utc,
                    player_address: processedEvent.player_address || 'anonymous',
                    event_payload: processedEvent.event_payload || {}
                  })

                  if (oracleResponse) {
                    processedEvent.event_payload = {
                      ...processedEvent.event_payload,
                      oracle_response: oracleResponse.notification.message,
                      urgency: oracleResponse.notification.urgency,
                      corruption_influence: oracleResponse.notification.corruption_influence
                    }
                  }
                } catch (oracleError) {
                  if (adminConfig.debugMode) {
                    console.warn('⚠️ Oracle processing failed for event:', processedEvent.id, oracleError)
                  }
                }
              }

              return processedEvent
            })
          )

          const filteredEvents = processedEvents.filter(event => shouldShowEvent(event, adminConfig))
          setEvents(filteredEvents)
          setHasRealData(true)
          setConnectionStatus('connected')

          if (adminConfig.debugMode) {
            console.log(`✅ Loaded ${filteredEvents.length} real events from database`)
          }
        } else {
          // No real events found
          setHasRealData(false)
          
          if (adminConfig.demoDataEnabled) {
            if (adminConfig.debugMode) {
              console.log('📝 No real events found, showing demo data')
            }
            setEvents(generateDemoEvents())
          } else {
            setEvents([])
          }
          setConnectionStatus('connected')
        }

        // Set up real-time subscription for new events
        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'live_game_events'
            },
            async (payload) => {
              if (adminConfig.debugMode) {
                console.log('📥 New real-time event received:', payload)
              }
              
              if (payload.new) {
                const newEvent: LiveGameEvent = {
                  id: payload.new.id.toString(),
                  created_at: payload.new.created_at,
                  session_id: payload.new.session_id,
                  event_type: payload.new.event_type,
                  event_payload: payload.new.event_payload || {},
                  processed_at: payload.new.processed_at,
                  game_event_timestamp: payload.new.game_event_timestamp,
                  player_address: payload.new.player_address,
                  timestamp_utc: payload.new.timestamp_utc || payload.new.created_at
                }
                
                // Apply enhanced event filtering based on admin config
                const shouldShow = shouldShowEvent(newEvent, adminConfig)
                
                if (shouldShow) {
                  // Generate Oracle response if enabled
                  if (showOracleResponses && !newEvent.event_payload?.oracle_response) {
                    try {
                      const oracleResponse = await realTimeOracle.processGameEvent({
                        session_id: newEvent.session_id || 'unknown',
                        event_type: newEvent.event_type,
                        timestamp_utc: newEvent.timestamp_utc,
                        player_address: newEvent.player_address || 'anonymous',
                        event_payload: newEvent.event_payload || {}
                      })

                      if (oracleResponse) {
                        newEvent.event_payload = {
                          ...newEvent.event_payload,
                          oracle_response: oracleResponse.notification.message,
                          urgency: oracleResponse.notification.urgency,
                          corruption_influence: oracleResponse.notification.corruption_influence
                        }
                      }
                    } catch (oracleError) {
                      if (adminConfig.debugMode) {
                        console.warn('⚠️ Oracle processing failed for new event:', newEvent.id, oracleError)
                      }
                    }
                  }

                  const processEvent = (processedEvent: LiveGameEvent) => {
                    setEvents(prev => {
                      // Check for aggregatable events
                      const existingEvent = findAggregatableEvent(prev, processedEvent, 60)
                      
                      if (existingEvent) {
                        // Aggregate with existing event
                        if (adminConfig.debugMode) {
                          console.log('🔄 Aggregating event with existing:', existingEvent.id)
                        }
                        const aggregatedEvent = aggregateEvents(existingEvent, processedEvent)
                        
                        // Update the existing event in place
                        return prev.map(event => 
                          event.id === existingEvent.id ? aggregatedEvent : event
                        )
                      } else {
                        // Add as new event
                        const filtered = prev.filter(e => e.id !== processedEvent.id)
                        return [processedEvent, ...filtered].slice(0, maxEvents)
                      }
                    })
                    
                    // Mark that we have real data
                    setHasRealData(true)
                  }

                  // Apply performance throttling if enabled
                  if (adminConfig.performanceThrottling) {
                    setEventQueue(prev => [...prev, newEvent])
                  } else {
                    processEvent(newEvent)
                  }
                } else {
                  if (adminConfig.debugMode) {
                    console.log('🚫 Event filtered out:', newEvent.event_type)
                  }
                }
              }
            }
          )
          .subscribe((status) => {
            if (adminConfig.debugMode) {
              console.log('📡 Subscription status:', status)
            }
            
            // Handle subscription status changes
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              setConnectionStatus('connected')
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setIsConnected(false)
              setConnectionStatus('error')
            }
          })

      } catch (error) {
        console.error('❌ Error setting up subscription:', error)
        setConnectionStatus('error')
        setIsConnected(false)
        
        // Fallback to demo data if enabled
        if (adminConfig.demoDataEnabled) {
          if (adminConfig.debugMode) {
            console.log('🔄 Falling back to demo data due to subscription error')
          }
          setEvents(generateDemoEvents())
          setHasRealData(false)
        }
      }
    }

    setupSubscription()

    // Cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  }, [maxEvents, adminConfig.realTimeEnabled, adminConfig.debugMode, adminConfig.eventFilteringEnabled, adminConfig.performanceThrottling, adminConfig.demoDataEnabled, showOracleResponses])

  // Update demo data when admin config changes
  useEffect(() => {
    // Only show demo data if:
    // 1. Demo data is enabled AND
    // 2. We don't have real data OR real-time is disabled
    if (adminConfig.demoDataEnabled && (!hasRealData || !adminConfig.realTimeEnabled)) {
      if (adminConfig.debugMode) {
        console.log('🎭 Updating demo data due to config change')
      }
      setEvents(generateDemoEvents())
    } else if (!adminConfig.demoDataEnabled && !hasRealData) {
      // Clear events if demo is disabled and no real data
      setEvents([])
    }
  }, [adminConfig.demoDataEnabled, hasRealData, adminConfig.realTimeEnabled, adminConfig.debugMode])

  const containerStyle = fullScreenMode ? {
    position: 'relative' as const,
    width: '100%',
    minHeight: '100vh'
  } : {}

  return (
    <div 
      className={`
        ${fullScreenMode ? 'w-full h-full' : height} 
        bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 relative overflow-hidden
        ${compactMode ? 'compact-mode' : ''}
        ${className}
      `}
      style={containerStyle}
    >
      {/* Background effects - simplified for performance */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-electric-blue to-transparent animate-electric-pulse"></div>
        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-cyber-gold to-transparent animate-gold-pulse delay-1000"></div>
      </div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-grid-pattern"></div>
      </div>

      <div 
        className={`relative z-10 flex flex-col ${compactMode ? 'p-4' : 'p-8'}`}
        style={fullScreenMode ? { 
          width: '100%', 
          minHeight: '100vh'
        } : { height: '100%' }}
      >
        {showHeader && (
          <div className="flex-shrink-0">
            <FeedHeader 
              isConnected={isConnected} 
              connectionStatus={connectionStatus}
              totalEvents={events.length}
              compact={compactMode}
            />
          </div>
        )}
        
        <div 
          className="flex-1"
          style={fullScreenMode ? {
            minHeight: '400px'
          } : { 
            minHeight: 0
          }}
        >
          <EventStream 
            events={events} 
            compactMode={compactMode}
            showOracleResponses={showOracleResponses}
            anonymizeAddresses={anonymizeAddresses}
            autoScroll={autoScroll}
            fullScreenMode={fullScreenMode}
          />
        </div>
        
        {showFooter && (
          <div className="flex-shrink-0">
            <FeedFooter 
              connectionStatus={connectionStatus} 
              compact={compactMode}
            />
          </div>
        )}
      </div>
      
      {/* Data source indicator */}
      {adminConfig.debugMode && (
        <div className="absolute top-4 right-4 p-2 liquid-glass rounded-lg border border-white/20 text-xs text-white z-20">
          {hasRealData ? '🔴 Real Data' : '🎭 Demo Data'}
        </div>
      )}
    </div>
  )
}

export default LiveEventFeed 