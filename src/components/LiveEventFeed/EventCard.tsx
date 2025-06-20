import React from 'react'
import { 
  Target, Zap, Flame, ShoppingCart, Trophy, Play, Square, Star, 
  User, Clock, Coins, MessageCircle, Eye, Scroll, Crown, Hash
} from 'lucide-react'
import { LiveGameEvent } from './LiveEventFeed'
import { 
  anonymizeAddress, 
  formatEventMessage, 
  getRelativeTime, 
  EVENT_TYPES, 
  ORACLE_SIGNIFICANCE 
} from '../../lib/liveEventUtils'

interface EventCardProps {
  event: LiveGameEvent
  isNew?: boolean
  showOracleResponses?: boolean
  anonymizeAddresses?: boolean
  onBump?: () => void
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isNew = false, 
  showOracleResponses = true,
  anonymizeAddresses = true,
  onBump
}) => {
  const getEventIcon = (eventType: string) => {
    const iconName = EVENT_TYPES[eventType as keyof typeof EVENT_TYPES]?.icon || 'Target'
    const iconColor = EVENT_TYPES[eventType as keyof typeof EVENT_TYPES]?.iconColor || 'text-electric-blue'
    
    const iconProps = { className: `w-4 h-4 ${iconColor}` }
    
    switch (iconName) {
      case 'Zap': return <Zap {...iconProps} />
      case 'Flame': return <Flame {...iconProps} />
      case 'ShoppingCart': return <ShoppingCart {...iconProps} />
      case 'Trophy': return <Trophy {...iconProps} />
      case 'Play': return <Play {...iconProps} />
      case 'Square': return <Square {...iconProps} />
      case 'Star': return <Star {...iconProps} />
      case 'Eye': return <Eye {...iconProps} />
      case 'Scroll': return <Scroll {...iconProps} />
      default: return <Target {...iconProps} />
    }
  }

  const getOracleIcon = (urgency: string) => {
    const config = ORACLE_SIGNIFICANCE[urgency as keyof typeof ORACLE_SIGNIFICANCE]
    const iconName = config?.icon || 'MessageCircle'
    const iconProps = { className: `w-4 h-4 ${config?.textColor || 'text-electric-blue'}` }
    
    switch (iconName) {
      case 'Zap': return <Zap {...iconProps} />
      case 'Crown': return <Crown {...iconProps} />
      default: return <MessageCircle {...iconProps} />
    }
  }

  const getEventColors = (eventType: string) => {
    const config = EVENT_TYPES[eventType as keyof typeof EVENT_TYPES]
    return {
      gradient: config?.color || 'from-electric-blue/20 to-cyber-gold/10',
      border: config?.borderColor || 'border-electric-blue/40'
    }
  }

  const colors = getEventColors(event.event_type)
  const message = formatEventMessage(event)
  const timeAgo = getRelativeTime(event.timestamp_utc)

  // Extract GIRTH amount from event payload (handle aggregated events)
  const girthAmount = event.event_payload?.total_girth_earned || 
                     event.event_payload?.girth_earned || 
                     event.event_payload?.amount || null

  // Check for aggregated events
  const isAggregated = event.event_payload?.aggregated
  const eventCount = event.event_payload?.count || 1

  // Check for Oracle response
  const oracleResponse = event.event_payload?.oracle_response
  const oracleUrgency = event.event_payload?.urgency || 'standard'
  const oracleConfig = ORACLE_SIGNIFICANCE[oracleUrgency as keyof typeof ORACLE_SIGNIFICANCE]

  // Determine if this is a legendary event for special animation
  const isLegendary = oracleUrgency === 'legendary' || 
                     event.event_type === 'oracle_prophecy' || 
                     event.event_type === 'special_report' ||
                     (girthAmount && girthAmount >= 10000)

  // Handle bump animation for aggregated events
  React.useEffect(() => {
    if (onBump && isAggregated && eventCount > 1) {
      onBump()
    }
  }, [eventCount, onBump, isAggregated])

  return (
    <div className={`
      relative p-3 rounded-2xl border liquid-glass transition-all duration-700
      bg-gradient-to-r ${colors.gradient} ${colors.border}
      ${isNew ? 'animate-liquid-slide-in border-glow-electric' : 'animate-float'}
      ${isLegendary ? 'animate-legendary-liquid-pulse liquid-glass-intense' : ''}
      ${isAggregated && eventCount > 1 ? 'animate-liquid-bump' : ''}
      hover:liquid-glass-intense hover:border-glow-electric hover:scale-[1.02]
      cursor-pointer group ripple-effect animate-liquid-morph
    `}>
      {/* New event pulse indicator with electric glow */}
      {isNew && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-electric-blue rounded-full animate-electric-pulse shadow-lg shadow-electric-blue/50"></div>
      )}

      {/* Aggregated event count indicator with liquid glass */}
      {isAggregated && eventCount > 1 && (
        <div className="absolute -top-2 -left-2 flex items-center gap-1 liquid-glass-intense text-electric-blue text-xs px-3 py-1 rounded-full border border-electric-blue/30 animate-electric-pulse">
          <Hash className="w-3 h-3" />
          <span className="font-bold">{eventCount}</span>
        </div>
      )}

      {/* Legendary event crown indicator with gold glow */}
      {isLegendary && (
        <div className="absolute -top-2 -right-2 text-cyber-gold animate-gold-pulse">
          <Crown className="w-5 h-5 filter drop-shadow-lg" />
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Event icon with liquid glass background */}
          <div className="flex-shrink-0 p-2 liquid-glass rounded-xl group-hover:liquid-glass-intense group-hover:border-glow-electric transition-all duration-500 border border-white/10">
            {getEventIcon(event.event_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Event message with enhanced typography */}
            <div className="text-white font-medium text-sm mb-2 leading-relaxed tracking-wide">
              {message}
            </div>
            
            {/* Player info with cyberpunk styling */}
            <div className="flex items-center gap-2 text-gray-300 text-xs">
              <div className="p-1 liquid-glass rounded-md">
                <User className="w-3 h-3 text-electric-blue" />
              </div>
              <span className="font-mono text-electric-blue">
                {event.player_address ? 
                  (anonymizeAddresses ? anonymizeAddress(event.player_address) : event.player_address) : 
                  'Anonymous'
                }
              </span>
              {event.session_id && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 font-mono">
                    {event.session_id.slice(0, 6)}...
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side - Amount and timestamp with enhanced styling */}
        <div className="text-right flex-shrink-0 ml-3">
          {girthAmount && (
            <div className="flex items-center gap-2 text-cyber-gold font-bold text-sm font-mono mb-2 liquid-glass px-2 py-1 rounded-lg border border-cyber-gold/20">
              <Coins className="w-3 h-3" />
              <span className="text-glow-gold">
                {new Intl.NumberFormat('en-US').format(girthAmount)}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-gray-400 text-xs liquid-glass px-2 py-1 rounded-md">
            <Clock className="w-3 h-3 text-electric-blue" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
      
      {/* Oracle Commentary Section with enhanced liquid glass */}
      {showOracleResponses && oracleResponse && (
        <div className={`
          mt-4 p-3 rounded-xl border liquid-glass-intense
          ${oracleConfig?.bgColor || 'bg-electric-blue/5'}
          ${oracleConfig?.borderColor || 'border-electric-blue/30'}
          ${oracleConfig?.pulseClass || ''}
          animate-liquid-morph
        `}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1 p-1.5 liquid-glass rounded-lg">
              {getOracleIcon(oracleUrgency)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${oracleConfig?.textColor || 'text-electric-blue'} text-glow-electric`}>
                  Oracle {oracleUrgency}
                </span>
                {oracleUrgency === 'legendary' && (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyber-gold rounded-full animate-gold-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-cyber-gold rounded-full animate-gold-pulse delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-cyber-gold rounded-full animate-gold-pulse delay-200"></div>
                  </div>
                )}
              </div>
              <p className={`text-xs leading-relaxed ${oracleConfig?.textColor || 'text-electric-blue'} italic`}>
                "{oracleResponse}"
              </p>
              {event.event_payload?.prophecy_source && (
                <div className="mt-2 text-xs opacity-75 liquid-glass px-2 py-1 rounded-md inline-block">
                  Source: {event.event_payload.prophecy_source}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Additional event details with liquid glass styling */}
      {event.event_payload && Object.keys(event.event_payload).length > 1 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-gray-300 text-xs flex flex-wrap gap-2">
            {event.event_payload.upgrade_name && (
              <span className="inline-block liquid-glass text-green-300 px-3 py-1 rounded-full text-xs border border-green-400/20 animate-electric-pulse">
                {event.event_payload.upgrade_name}
              </span>
            )}
            {event.event_payload.achievement_name && (
              <span className="inline-block liquid-glass text-electric-blue px-3 py-1 rounded-full text-xs border border-electric-blue/20 animate-electric-pulse">
                {event.event_payload.achievement_name}
              </span>
            )}
            {event.event_payload.streak_count && (
              <span className="inline-block liquid-glass text-cyber-gold px-3 py-1 rounded-full text-xs border border-cyber-gold/20 animate-gold-pulse">
                {event.event_payload.streak_count} streak
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EventCard 