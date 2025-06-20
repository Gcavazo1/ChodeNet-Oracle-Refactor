import React from 'react'
import { Activity, Wifi, WifiOff, AlertCircle, Users, Filter } from 'lucide-react'

interface FeedHeaderProps {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'error'
  totalEvents: number
  compact?: boolean
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ 
  isConnected, 
  connectionStatus, 
  totalEvents,
  compact = false 
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-electric-blue animate-electric-pulse" />
      case 'connecting':
        return <Activity className="w-4 h-4 text-cyber-gold animate-liquid-loading" />
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live Stream Active'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Connection Error'
      default:
        return 'Unknown Status'
    }
  }

  if (compact) {
    return (
      <div className="mb-4">
        {/* Compact header with liquid glass */}
        <div className="flex justify-between items-center p-4 liquid-glass-intense border border-electric-blue/30 rounded-2xl animate-liquid-morph">
          <div className="flex items-center gap-3">
            <div className="p-2 liquid-glass rounded-xl border border-white/10">
              {getStatusIcon()}
            </div>
            <div>
              <p className="text-white font-medium text-sm text-glow-electric">Oracle Feed</p>
              <p className="text-gray-400 text-xs">{getStatusText()}</p>
            </div>
          </div>
          
          {/* Event Counter with cyberpunk styling */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 liquid-glass rounded-xl border border-electric-blue/30 animate-electric-pulse">
              <Users className="w-3 h-3 text-electric-blue" />
              <div className="text-center">
                <div className="text-sm font-bold text-cyber-gold font-mono text-glow-gold">{totalEvents}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Events</div>
              </div>
            </div>
            
            <div className="text-center liquid-glass px-3 py-2 rounded-xl">
              <div className="text-sm font-bold text-electric-blue font-mono text-glow-electric">
                {isConnected ? '100%' : '0%'}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Uptime</div>
            </div>
            
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-electric-blue to-cyber-gold animate-electric-pulse shadow-lg shadow-electric-blue/50"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Main title with enhanced cyberpunk styling */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-electric-blue via-cyber-gold to-electric-blue bg-clip-text text-transparent mb-4 text-glow-electric animate-liquid-morph">
          ORACLE FEED
        </h1>
        <div className="w-40 h-1.5 bg-gradient-to-r from-electric-blue via-cyber-gold to-electric-blue mx-auto rounded-full animate-electric-pulse shadow-lg shadow-electric-blue/50"></div>
      </div>

      {/* Connection status and controls with liquid glass */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-6 liquid-glass-intense border border-electric-blue/30 rounded-3xl animate-liquid-morph">
        <div className="flex items-center gap-4">
          <div className="p-3 liquid-glass rounded-2xl border border-white/10 animate-float">
            {getStatusIcon()}
          </div>
          <div>
            <p className="text-white font-medium text-lg text-glow-electric">{getStatusText()}</p>
            <p className="text-gray-400 text-sm">Real-time blockchain events</p>
          </div>
        </div>
        
        {/* Event Counter and Stats */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 px-4 py-3 liquid-glass rounded-2xl border border-electric-blue/30 animate-electric-pulse">
            <Users className="w-5 h-5 text-electric-blue" />
            <div className="text-center">
              <div className="text-2xl font-bold text-cyber-gold font-mono text-glow-gold">{totalEvents}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Events</div>
            </div>
          </div>
          
          <div className="text-center liquid-glass px-4 py-3 rounded-2xl border border-white/10">
            <div className="text-2xl font-bold text-electric-blue font-mono text-glow-electric">
              {isConnected ? '100%' : '0%'}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Uptime</div>
          </div>
          
          {/* Placeholder for Future Filter Controls */}
          <div className="flex items-center gap-3 px-4 py-3 liquid-glass rounded-2xl border border-gray-500/20 opacity-60">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Filters</span>
          </div>
          
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-electric-blue to-cyber-gold animate-electric-pulse shadow-lg shadow-electric-blue/50"></div>
        </div>
      </div>
    </div>
  )
}

export default FeedHeader 