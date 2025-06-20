// Live Event Feed Utilities
import { LiveGameEvent } from '../components/LiveEventFeed/LiveEventFeed'

// Event type configurations with icons and colors
export const EVENT_TYPES = {
  // Tapping Events
  'tap_activity': {
    icon: 'Target',
    iconColor: 'text-electric-blue',
    color: 'from-electric-blue/20 to-electric-blue/10',
    borderColor: 'border-electric-blue/40',
    displayName: 'Tap Activity'
  },
  'mega_slap': {
    icon: 'Zap',
    iconColor: 'text-cyber-gold',
    color: 'from-cyber-gold/20 to-cyber-gold/10',
    borderColor: 'border-cyber-gold/40',
    displayName: 'Mega Slap'
  },
  'giga_slap': {
    icon: 'Flame',
    iconColor: 'text-red-400',
    color: 'from-red-400/20 to-red-400/10',
    borderColor: 'border-red-400/40',
    displayName: 'Giga Slap'
  },
  
  // Achievement Events
  'achievement_unlock': {
    icon: 'Trophy',
    iconColor: 'text-electric-blue',
    color: 'from-electric-blue/20 to-purple-500/10',
    borderColor: 'border-electric-blue/40',
    displayName: 'Achievement Unlocked'
  },
  'milestone_reached': {
    icon: 'Star',
    iconColor: 'text-cyber-gold',
    color: 'from-cyber-gold/20 to-yellow-500/10',
    borderColor: 'border-cyber-gold/40',
    displayName: 'Milestone Reached'
  },
  
  // Upgrade Events
  'upgrade_purchase': {
    icon: 'ShoppingCart',
    iconColor: 'text-green-400',
    color: 'from-green-400/20 to-green-400/10',
    borderColor: 'border-green-400/40',
    displayName: 'Upgrade Purchased'
  },
  
  // Session Events
  'session_start': {
    icon: 'Play',
    iconColor: 'text-electric-blue',
    color: 'from-electric-blue/20 to-blue-500/10',
    borderColor: 'border-electric-blue/40',
    displayName: 'Session Started'
  },
  'session_end': {
    icon: 'Square',
    iconColor: 'text-gray-400',
    color: 'from-gray-400/20 to-gray-400/10',
    borderColor: 'border-gray-400/40',
    displayName: 'Session Ended'
  },
  
  // Oracle Events
  'oracle_prophecy': {
    icon: 'Eye',
    iconColor: 'text-purple-400',
    color: 'from-purple-400/20 to-purple-400/10',
    borderColor: 'border-purple-400/40',
    displayName: 'Oracle Prophecy'
  },
  'special_report': {
    icon: 'Scroll',
    iconColor: 'text-cyber-gold',
    color: 'from-cyber-gold/20 to-amber-500/10',
    borderColor: 'border-cyber-gold/40',
    displayName: 'Special Report'
  },
  
  // Aggregated Events
  'significant_girth_achievement': {
    icon: 'Flame',
    iconColor: 'text-red-400',
    color: 'from-red-400/20 to-orange-500/10',
    borderColor: 'border-red-400/40',
    displayName: 'Significant GIRTH Achievement'
  }
}

// Oracle significance levels
export const ORACLE_SIGNIFICANCE = {
  'standard': {
    icon: 'MessageCircle',
    textColor: 'text-electric-blue',
    bgColor: 'bg-electric-blue/5',
    borderColor: 'border-electric-blue/30',
    pulseClass: ''
  },
  'notable': {
    icon: 'Zap',
    textColor: 'text-cyber-gold',
    bgColor: 'bg-cyber-gold/5',
    borderColor: 'border-cyber-gold/30',
    pulseClass: 'animate-gold-pulse'
  },
  'legendary': {
    icon: 'Crown',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-400/5',
    borderColor: 'border-purple-400/30',
    pulseClass: 'animate-legendary-liquid-pulse'
  }
}

// Utility function to anonymize wallet addresses
export const anonymizeAddress = (address: string): string => {
  if (!address || address.length < 8) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// Utility function to format event messages
export const formatEventMessage = (event: LiveGameEvent): string => {
  const eventConfig = EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES]
  const displayName = eventConfig?.displayName || event.event_type.replace(/_/g, ' ')
  
  // Handle aggregated events
  if (event.event_payload?.aggregated && event.event_payload?.count > 1) {
    const count = event.event_payload.count
    const totalGirth = event.event_payload.total_girth_earned
    
    if (totalGirth) {
      return `${count} ${displayName.toLowerCase()} events (${new Intl.NumberFormat('en-US').format(totalGirth)} total GIRTH)`
    }
    return `${count} ${displayName.toLowerCase()} events`
  }
  
  // Handle specific event types with custom formatting
  switch (event.event_type) {
    case 'tap_activity':
      const tapCount = event.event_payload?.tap_count || 1
      const girthEarned = event.event_payload?.girth_earned || 0
      return `${tapCount} taps (${new Intl.NumberFormat('en-US').format(girthEarned)} GIRTH)`
    
    case 'mega_slap':
    case 'giga_slap':
      const girth = event.event_payload?.girth_earned || 0
      const streak = event.event_payload?.streak_count
      let message = `${displayName} (${new Intl.NumberFormat('en-US').format(girth)} GIRTH)`
      if (streak) message += ` - ${streak} streak`
      return message
    
    case 'achievement_unlock':
      const achievementName = event.event_payload?.achievement_name || 'Unknown Achievement'
      return `${displayName}: ${achievementName}`
    
    case 'milestone_reached':
      const milestoneType = event.event_payload?.milestone_type || 'Unknown Milestone'
      return `${displayName}: ${milestoneType}`
    
    case 'upgrade_purchase':
      const upgradeName = event.event_payload?.upgrade_name || 'Unknown Upgrade'
      const cost = event.event_payload?.cost
      let upgradeMessage = `${displayName}: ${upgradeName}`
      if (cost) upgradeMessage += ` (${new Intl.NumberFormat('en-US').format(cost)} GIRTH)`
      return upgradeMessage
    
    case 'oracle_prophecy':
      const prophecyTitle = event.event_payload?.prophecy_title || 'Divine Vision'
      return `${displayName}: ${prophecyTitle}`
    
    case 'special_report':
      const reportTitle = event.event_payload?.report_title || 'Oracle Report'
      return `${displayName}: ${reportTitle}`
    
    default:
      return displayName
  }
}

// Utility function to get relative time
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date()
  const eventTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
}

// Event filtering function with admin config support
export const shouldShowEvent = (event: LiveGameEvent, adminConfig?: any): boolean => {
  // If admin config provided and filtering disabled, show all events
  if (adminConfig && !adminConfig.eventFilteringEnabled) {
    return true
  }
  
  // Filter out internal/debug events (unless debug mode is enabled)
  const hiddenEventTypes = [
    'debug_event',
    'internal_state_change',
    'heartbeat',
    'connection_test'
  ]
  
  if (hiddenEventTypes.includes(event.event_type)) {
    // Show debug events if debug mode is enabled
    if (adminConfig?.debugMode) {
      return true
    }
    return false
  }
  
  // Filter out events without meaningful data (unless debug mode is enabled)
  if (!event.event_payload || Object.keys(event.event_payload).length === 0) {
    if (adminConfig?.debugMode) {
      return true
    }
    return false
  }
  
  // Apply custom event type filters if configured
  if (adminConfig?.eventTypeFilters && adminConfig.eventTypeFilters.length > 0) {
    return adminConfig.eventTypeFilters.includes(event.event_type)
  }
  
  return true
}

// Function to find aggregatable events
export const findAggregatableEvent = (
  events: LiveGameEvent[], 
  newEvent: LiveGameEvent, 
  timeWindowSeconds: number = 60
): LiveGameEvent | null => {
  const aggregatableTypes = ['tap_activity', 'mega_slap', 'giga_slap']
  
  if (!aggregatableTypes.includes(newEvent.event_type)) {
    return null
  }
  
  const newEventTime = new Date(newEvent.timestamp_utc).getTime()
  
  return events.find(event => {
    if (event.event_type !== newEvent.event_type) return false
    if (event.player_address !== newEvent.player_address) return false
    if (event.session_id !== newEvent.session_id) return false
    
    const eventTime = new Date(event.timestamp_utc).getTime()
    const timeDiff = Math.abs(newEventTime - eventTime) / 1000
    
    return timeDiff <= timeWindowSeconds
  }) || null
}

// Function to aggregate events
export const aggregateEvents = (existingEvent: LiveGameEvent, newEvent: LiveGameEvent): LiveGameEvent => {
  const existingCount = existingEvent.event_payload?.count || 1
  const existingGirth = existingEvent.event_payload?.total_girth_earned || 
                       existingEvent.event_payload?.girth_earned || 0
  const newGirth = newEvent.event_payload?.girth_earned || 0
  
  return {
    ...existingEvent,
    timestamp_utc: newEvent.timestamp_utc, // Use latest timestamp
    event_payload: {
      ...existingEvent.event_payload,
      ...newEvent.event_payload,
      count: existingCount + 1,
      total_girth_earned: existingGirth + newGirth,
      latest_girth_earned: newGirth,
      aggregated: true,
      // Preserve Oracle response from the most recent event if it exists
      oracle_response: newEvent.event_payload?.oracle_response || existingEvent.event_payload?.oracle_response,
      urgency: newEvent.event_payload?.urgency || existingEvent.event_payload?.urgency
    }
  }
} 