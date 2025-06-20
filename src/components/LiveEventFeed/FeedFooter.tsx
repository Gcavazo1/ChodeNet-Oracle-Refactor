import React from 'react'
import { Shield, Zap, Globe, Wifi, WifiOff, Activity, TrendingUp } from 'lucide-react'

interface FeedFooterProps {
  connectionStatus: 'connecting' | 'connected' | 'error'
  compact?: boolean
}

const FeedFooter: React.FC<FeedFooterProps> = ({ connectionStatus, compact = false }) => {
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4 text-electric-blue animate-electric-pulse" />,
          text: 'Live',
          color: 'text-electric-blue text-glow-electric'
        }
      case 'connecting':
        return {
          icon: <Activity className="w-4 h-4 text-cyber-gold animate-liquid-loading" />,
          text: 'Connecting...',
          color: 'text-cyber-gold text-glow-gold'
        }
      case 'error':
        return {
          icon: <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />,
          text: 'Error',
          color: 'text-red-400'
        }
    }
  }

  const statusDisplay = getConnectionStatusDisplay()

  if (compact) {
    return (
      <div className="mt-6">
        {/* Compact footer with liquid glass */}
        <div className="flex justify-between items-center p-4 liquid-glass border border-electric-blue/20 rounded-2xl animate-liquid-morph">
          {/* Connection Status */}
          <div className="flex items-center gap-3">
            <div className="p-2 liquid-glass rounded-xl border border-white/10">
              {statusDisplay.icon}
            </div>
            <div>
              <p className={`font-medium text-sm ${statusDisplay.color}`}>
                {statusDisplay.text}
              </p>
            </div>
          </div>
          
          {/* Events Per Minute with cyberpunk styling */}
          <div className="flex items-center gap-2 px-3 py-2 liquid-glass rounded-xl border border-gray-500/20">
            <TrendingUp className="w-3 h-3 text-electric-blue" />
            <div className="text-center">
              <div className="text-xs font-bold text-cyber-gold font-mono text-glow-gold">--</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">EPM</div>
            </div>
          </div>
        </div>
        
        {/* Minimal footer text with electric accents */}
        <div className="text-gray-500 text-xs text-center mt-3">
          <div className="flex justify-center items-center gap-2">
            <div className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-electric-pulse"></div>
            <span>Oracle Network: {statusDisplay.text}</span>
            {connectionStatus === 'connected' && (
              <div className="w-1.5 h-1.5 bg-cyber-gold rounded-full animate-gold-pulse"></div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {/* Connection Status and Stats with enhanced liquid glass */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 p-6 liquid-glass-intense border border-electric-blue/20 rounded-3xl animate-liquid-morph">
        {/* Connection Status */}
        <div className="flex items-center gap-4">
          <div className="p-3 liquid-glass rounded-2xl border border-white/10 animate-float">
            {statusDisplay.icon}
          </div>
          <div>
            <p className={`font-medium text-lg ${statusDisplay.color}`}>
              Connection Status: {statusDisplay.text}
            </p>
            <p className="text-gray-400 text-sm">Oracle Network Monitoring</p>
          </div>
        </div>
        
        {/* Events Per Minute with cyberpunk enhancement */}
        <div className="flex items-center gap-3 px-4 py-3 liquid-glass rounded-2xl border border-gray-500/20">
          <TrendingUp className="w-5 h-5 text-electric-blue" />
          <div className="text-center">
            <div className="text-xl font-bold text-cyber-gold font-mono text-glow-gold">--</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Events/Min</div>
          </div>
        </div>
      </div>

      {/* Features with liquid glass cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 liquid-glass border border-green-400/20 rounded-2xl animate-float hover:liquid-glass-intense transition-all duration-500 group">
          <div className="p-3 liquid-glass rounded-xl w-fit mx-auto mb-3 group-hover:animate-electric-pulse">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-white font-semibold mb-2 text-sm text-center">Verified Transactions</h3>
          <p className="text-gray-400 text-xs text-center">All events verified on-chain</p>
        </div>
        
        <div className="p-4 liquid-glass border border-cyber-gold/20 rounded-2xl animate-float hover:liquid-glass-intense transition-all duration-500 group delay-100">
          <div className="p-3 liquid-glass rounded-xl w-fit mx-auto mb-3 group-hover:animate-gold-pulse">
            <Zap className="w-6 h-6 text-cyber-gold" />
          </div>
          <h3 className="text-white font-semibold mb-2 text-sm text-center">Real-time Updates</h3>
          <p className="text-gray-400 text-xs text-center">Live streaming events as they happen</p>
        </div>
        
        <div className="p-4 liquid-glass border border-electric-blue/20 rounded-2xl animate-float hover:liquid-glass-intense transition-all duration-500 group delay-200">
          <div className="p-3 liquid-glass rounded-xl w-fit mx-auto mb-3 group-hover:animate-electric-pulse">
            <Globe className="w-6 h-6 text-electric-blue" />
          </div>
          <h3 className="text-white font-semibold mb-2 text-sm text-center">Global Community</h3>
          <p className="text-gray-400 text-xs text-center">Players from around the world</p>
        </div>
      </div>
      
      {/* Footer text with cyberpunk accents */}
      <div className="text-gray-500 text-sm text-center">
        <p className="mb-3">Powered by blockchain technology and real-time data streams</p>
        <div className="flex justify-center items-center gap-3">
          <div className="w-2 h-2 bg-electric-blue rounded-full animate-electric-pulse"></div>
          <span>Oracle Network Status: {statusDisplay.text}</span>
          {connectionStatus === 'connected' && (
            <div className="w-2 h-2 bg-cyber-gold rounded-full animate-gold-pulse"></div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedFooter 