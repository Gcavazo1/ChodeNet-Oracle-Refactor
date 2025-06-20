import React, { useRef, useEffect, useState } from 'react'
import { LiveGameEvent } from './LiveEventFeed'
import EventCard from './EventCard'

interface EventStreamProps {
  events: LiveGameEvent[]
  compactMode?: boolean
  showOracleResponses?: boolean
  anonymizeAddresses?: boolean
  autoScroll?: boolean
  fullScreenMode?: boolean
}

const EventStream: React.FC<EventStreamProps> = ({ 
  events, 
  compactMode = false,
  showOracleResponses = true,
  anonymizeAddresses = true,
  autoScroll = true,
  fullScreenMode = false
}) => {
  const streamRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(autoScroll)
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set())
  const [bumpingEventIds, setBumpingEventIds] = useState<Set<string>>(new Set())

  // Update shouldAutoScroll when autoScroll prop changes
  useEffect(() => {
    setShouldAutoScroll(autoScroll)
  }, [autoScroll])

  // Track new events for animation
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0]
      const eventIdString = String(latestEvent.id)
      setNewEventIds(prev => new Set([...prev, eventIdString]))
      
      // Remove the "new" status after animation completes
      const timer = setTimeout(() => {
        setNewEventIds(prev => {
          const updated = new Set(prev)
          updated.delete(eventIdString)
          return updated
        })
      }, 1200)
      
      return () => clearTimeout(timer)
    }
  }, [events.length])

  // Auto-scroll to top when new events arrive (unless user is hovering or auto-scroll is disabled)
  useEffect(() => {
    if (events.length > 0 && shouldAutoScroll && !isHovered && streamRef.current) {
      streamRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [events.length, shouldAutoScroll, isHovered])

  // Handle mouse enter/leave for pause on hover
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Handle scroll to detect if user manually scrolled
  const handleScroll = () => {
    if (streamRef.current && autoScroll) {
      const { scrollTop } = streamRef.current
      // If user scrolled away from top, disable auto-scroll
      setShouldAutoScroll(scrollTop < 50)
    }
  }

  // Handle bump animation for aggregated events
  const handleEventBump = (eventId: string) => {
    setBumpingEventIds(prev => new Set([...prev, eventId]))
    
    // Remove bump status after animation
    setTimeout(() => {
      setBumpingEventIds(prev => {
        const updated = new Set(prev)
        updated.delete(eventId)
        return updated
      })
    }, 800)
  }

  if (events.length === 0) {
    return (
      <div className={`text-center ${compactMode ? 'py-8' : 'py-16'}`}>
        <div className="relative mx-auto mb-6">
          <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-liquid-loading mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-cyber-gold/30 rounded-full animate-electric-pulse mx-auto"></div>
        </div>
        <p className={`text-white font-medium mb-3 text-glow-electric ${compactMode ? 'text-sm' : 'text-lg'}`}>
          Monitoring Oracle Network...
        </p>
        <p className={`text-gray-400 ${compactMode ? 'text-xs' : 'text-sm'}`}>
          Live events will appear here in real-time
        </p>
        <div className="flex justify-center items-center gap-3 mt-4">
          <div className="w-2 h-2 bg-electric-blue rounded-full animate-electric-pulse"></div>
          <div className="w-2 h-2 bg-electric-blue rounded-full animate-electric-pulse delay-150"></div>
          <div className="w-2 h-2 bg-electric-blue rounded-full animate-electric-pulse delay-300"></div>
        </div>
      </div>
    )
  }

  const containerStyle = fullScreenMode ? {
    width: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column' as const
  } : {}

  const scrollAreaStyle = fullScreenMode ? {
    flex: 1,
    minHeight: '400px'
  } : {}

  return (
    <div 
      className={`flex flex-col space-y-4 ${compactMode ? 'compact-mode' : ''} ${fullScreenMode ? 'w-full h-full' : 'h-full'}`}
      style={containerStyle}
    >
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className={`font-bold text-white flex items-center gap-3 ${compactMode ? 'text-lg' : 'text-2xl'}`}>
          <div className="w-3 h-3 bg-electric-blue rounded-full animate-electric-pulse shadow-lg shadow-electric-blue/50"></div>
          <span className="text-glow-electric">Live Event Stream</span>
          <div className="flex-1 h-px bg-gradient-to-r from-electric-blue/50 via-cyber-gold/30 to-transparent ml-4"></div>
        </h2>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="text-gray-400 liquid-glass px-3 py-1 rounded-lg border border-white/10">
            <span className="text-electric-blue font-mono">{events.length}</span> events
          </div>
          {autoScroll && !shouldAutoScroll && (
            <button
              onClick={() => {
                setShouldAutoScroll(true)
                streamRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="px-3 py-2 liquid-glass text-electric-blue rounded-xl border border-electric-blue/30 hover:liquid-glass-intense hover:border-glow-electric transition-all duration-500 text-xs animate-electric-pulse"
            >
              Resume Auto-scroll
            </button>
          )}
        </div>
      </div>
      
      <div 
        ref={streamRef}
        className={`space-y-3 overflow-y-auto custom-scrollbar pr-2 ${fullScreenMode ? 'live-event-stream-scroll' : 'flex-1'}`}
        style={scrollAreaStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onScroll={handleScroll}
      >
        {events.map((event, index) => (
          <EventCard 
            key={`${event.id}-${event.timestamp_utc}`}
            event={event} 
            isNew={newEventIds.has(String(event.id)) && shouldAutoScroll}
            showOracleResponses={showOracleResponses}
            anonymizeAddresses={anonymizeAddresses}
            onBump={() => handleEventBump(String(event.id))}
          />
        ))}
      </div>
      
      {/* Scroll indicator with cyberpunk styling */}
      {events.length > 5 && autoScroll && (
        <div className={`text-center text-gray-500 mt-4 flex-shrink-0 ${compactMode ? 'text-xs' : 'text-xs'}`}>
          <div className="flex justify-center items-center gap-2">
            <div className="w-1 h-1 bg-electric-blue rounded-full animate-electric-pulse"></div>
            <span>{isHovered ? 'Auto-scroll paused' : 'Hover to pause auto-scroll'}</span>
            <div className="w-1 h-1 bg-cyber-gold rounded-full animate-gold-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventStream