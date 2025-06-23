import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { 
  Gamepad2, 
  Eye, 
  ArrowRight,
  Cpu,
  Server,
  BarChart3
} from 'lucide-react';
import { GameMetrics } from '../GameMetrics';
import { HackerText } from '../HackerText';

interface GameFeedSceneProps {
  sceneProgress: MotionValue<number>;
  isActive: boolean;
}

export const GameFeedScene: React.FC<GameFeedSceneProps> = ({ sceneProgress }) => {
  // Title reveal (unchanged)
  const titleOpacity = useTransform(sceneProgress, [0, 0.10], [0, 1]);
  const titleY = useTransform(sceneProgress, [0, 0.15], [50, 0]);

  // Game card entrance then glide out (slower fade)
  const gameOpacity = useTransform(sceneProgress, [0.15, 0.45, 0.9], [0, 1, 0]);
  const gameScale   = useTransform(sceneProgress, [0.15, 0.5], [0.75, 1.5]);
  const gameX       = useTransform(sceneProgress, [0.35, 0.55], [0, -850]);

  // Data-flow list entrance then glide out (mirror, slower fade)
  const flowOpacity = useTransform(sceneProgress, [0.15, 0.45, 0.9], [0, 1, 0]);
  const flowX       = useTransform(sceneProgress, [0.35, 0.55], [0, 750]);

  // Metrics rise higher (slides further up and slightly overshoot)
  const metricsOpacity = useTransform(sceneProgress, [0.15, 0.9], [0, 1]);
  const metricsY       = useTransform(sceneProgress, [0.35, 0.9], [220, -150]);

  return (
    <motion.section
      className="min-h-screen bg-gradient-to-br from-slate-800 via-black to-slate-800 relative overflow-hidden
                  overflow-y-auto"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <motion.div 
          className="absolute inset-0 opacity-50"
          style={{ opacity: useTransform(sceneProgress, [0, 0.5], [0, 0.2]) }}
        >
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(19, 130, 296, 0.8) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </motion.div>
        
        {/* Pulsing Data Streams */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent"
            style={{
              left: `${10 + i * 12}%`,
              height: '100%',
              opacity: useTransform(sceneProgress, [0.2, 0.7], [0, 0.6])
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scaleY: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
      </div>

      {/* Main vertical stack: title – content grid – metrics */}
      <div className="relative z-10 container mx-auto px-6
                      py-8 lg:py-12
                      flex flex-col justify-between gap-12
                      min-h-screen">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          style={{
            opacity: titleOpacity,
            y: titleY
          }}
        >
          <HackerText
            text="THE GAME FEED"
            className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6"
          />
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Witness the perpetual flow of data as player actions fuel the Oracle's intelligence
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-center">
          {/* Left Side: Game Interface */}
          <motion.div
            className="relative"
            style={{
              opacity: gameOpacity,
              scale: gameScale,
              x: gameX
            }}
          >
            {/* Game Frame */}
            <div className="gradient-hover-card relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-cyan-500/30 shadow-2xl">
              {/* Game Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Gamepad2 className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-bold">$CHODE Tapper</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">LIVE</span>
                </div>
              </div>
              
              {/* Game Placeholder */}
              <div className="aspect-video bg-black rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
                {/* Simulated Game Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20" />
                
                {/* Tap Animation */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">TAP</span>
                  </div>
                </motion.div>
                
                {/* Tap Effects */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-cyan-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, (Math.cos(i * 60 * Math.PI / 180) * 80)],
                      y: [0, (Math.sin(i * 60 * Math.PI / 180) * 80)],
                      opacity: [1, 0],
                      scale: [1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Game Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-cyan-400 font-bold text-lg">1,337</div>
                  <div className="text-gray-400 text-sm">Taps</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-lg">42.0</div>
                  <div className="text-gray-400 text-sm">$CHODE</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">Level 7</div>
                  <div className="text-gray-400 text-sm">Progress</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Data Flow Visualization */}
          <motion.div 
            className="relative"
            style={{ opacity: flowOpacity, x: flowX }}
          >
            {/* Data Flow Pipeline */}
            <div className="space-y-8">
              {/* Stage 1: Player Action */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Player Taps</h3>
                  <p className="text-gray-400 text-sm">Action triggers event burst</p>
                </div>
                <ArrowRight className="w-6 h-6 text-cyan-400" />
              </div>

              {/* Stage 2: Oracle Reception */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Oracle Receives</h3>
                  <p className="text-gray-400 text-sm">Event captured by Oracle container</p>
                </div>
                <ArrowRight className="w-6 h-6 text-purple-400" />
              </div>

              {/* Stage 3: Edge Function */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Edge Function</h3>
                  <p className="text-gray-400 text-sm">Supabase processes the event</p>
                </div>
                <ArrowRight className="w-6 h-6 text-green-400" />
              </div>

              {/* Stage 4: Oracle Engine */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Oracle Engine</h3>
                  <p className="text-gray-400 text-sm">AI processes and decides response</p>
                </div>
                <ArrowRight className="w-6 h-6 text-yellow-400" />
              </div>

              {/* Stage 5: UI Update */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">UI Response</h3>
                  <p className="text-gray-400 text-sm">Game and metrics update in real-time</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div> {/* CLOSE main container */}

      {/* Bottom Metrics Panel – overlayed so it never pushes content off */}
      <motion.div
        className="absolute inset-x-0 bottom-4 px-6"
        style={{ opacity: metricsOpacity, y: metricsY }}
      >
        <GameMetrics
          scrollProgress={sceneProgress}
          activeRange={[0.6, 1]}
          className="max-w-7xl mx-auto"
        />

        {/* Powered by Icons */}
        <motion.div
          className="flex justify-center items-center space-x-16 max-w-lg mx-auto mt-12"
          style={{ opacity: useTransform(sceneProgress, [0.6, 0.9], [0, 1]) }}
        >
          {/* Supabase Icon */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="p-4 bg-slate-900/50 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(74, 222, 128, 0.4)',
                  '0 0 20px 10px rgba(74, 222, 128, 0)',
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            >
              <img src="/intro/icons/supabase.svg" alt="Supabase" className="w-20 h-20" />
            </motion.div>
            <span className="text-sm text-green-300/80 font-mono">Supabase</span>
          </div>

          {/* Player Actions Icon */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="p-5 bg-slate-900/50 rounded-full"
               animate={{
                boxShadow: [
                  '0 0 0 0px rgba(252, 211, 77, 0.4)',
                  '0 0 25px 12px rgba(252, 211, 77, 0)',
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.25
              }}
            >
              <img src="/intro/icons/keyboard_mouse.svg" alt="Player Actions" className="w-20 h-20" />
            </motion.div>
            <span className="text-sm text-amber-300/80 font-mono">Player Actions</span>
          </div>

          {/* Solana Oracle Icon */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="p-4 bg-slate-900/50 rounded-full"
               animate={{
                boxShadow: [
                  '0 0 0 0px rgba(139, 92, 246, 0.4)',
                  '0 0 20px 10px rgba(139, 92, 246, 0)',
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5
              }}
            >
              <img src="/intro/icons/solana_oracle.svg" alt="Solana Oracle" className="w-20 h-20" />
            </motion.div>
             <span className="text-sm text-violet-300/80 font-mono">Solana</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};