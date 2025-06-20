import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import LiveEventFeed from './LiveEventFeed'
import './LiveEventFeed.css'

interface LiveEventFeedModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LiveEventFeedModal: React.FC<LiveEventFeedModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Hide header when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('live-event-feed-open')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.classList.remove('live-event-feed-open')
      document.body.style.overflow = 'auto'
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('live-event-feed-open')
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="live-event-feed-modal bg-black/60 backdrop-blur-sm">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-electric-blue to-transparent animate-electric-pulse"></div>
        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-cyber-gold to-transparent animate-gold-pulse delay-1000"></div>
      </div>
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-grid-pattern"></div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[10000] p-3 liquid-glass-intense text-white hover:text-electric-blue rounded-2xl border border-white/20 hover:border-electric-blue/50 transition-all duration-300 group animate-float"
        aria-label="Close Live Event Feed"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Main Content - Use CSS Classes for Full Screen */}
      <div className="live-event-feed-container z-10">
        <LiveEventFeed 
          maxEvents={100}
          compactMode={false}
          showOracleResponses={true}
          anonymizeAddresses={true}
          autoScroll={true}
          showHeader={true}
          showFooter={true}
          height="100vh"
          className="live-event-feed-content"
          fullScreenMode={true}
        />
      </div>
    </div>
  )
}

export default LiveEventFeedModal