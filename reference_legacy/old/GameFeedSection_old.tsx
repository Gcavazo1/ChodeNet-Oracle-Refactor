import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { 
  Gamepad2, 
  Database, 
  Zap, 
  Eye, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Cpu,
  Server,
  BarChart3
} from 'lucide-react';
import { DataFlowArrow } from './DataFlowArrow';
import { GameMetrics } from './GameMetrics';
import { OracleProcessor } from './OracleProcessor';
import { GlitchText } from './GlitchText';

interface GameFeedSectionProps {
  scrollProgress: MotionValue<number>;
  sectionIndex: number;
  totalSections: number;
}

export const GameFeedSection: React.FC<GameFeedSectionProps> = ({
  scrollProgress,
  sectionIndex,
  totalSections
}) => {
  // Extended section visibility range (40% to 60% of total scroll) - More time for appreciation
  const sectionStart = 0.40;
  const sectionEnd = 0.60;
  
  const sectionOpacity = useTransform(
    scrollProgress,
    [sectionStart - 0.08, sectionStart, sectionEnd, sectionEnd + 0.08],
    [0, 1, 1, 0]
  );

  // Extended title entrance timing
  const titleOpacity = useTransform(
    scrollProgress,
    [sectionStart, sectionStart + 0.08],
    [0, 1]
  );
  
  const titleY = useTransform(
    scrollProgress,
    [sectionStart, sectionStart + 0.08],
    [50, 0]
  );

  // Extended game iframe entrance
  const gameOpacity = useTransform(
    scrollProgress,
    [sectionStart + 0.05, sectionStart + 0.12],
    [0, 1]
  );
  
  const gameScale = useTransform(
    scrollProgress,
    [sectionStart + 0.05, sectionStart + 0.12],
    [0.8, 1]
  );

  // Extended data flow stages (5 stages across the section with more time)
  const stageProgress = useTransform(
    scrollProgress,
    [sectionStart + 0.08, sectionEnd - 0.08],
    [0, 5]
  );

  return (
    <motion.section
      className="min-h-screen sticky top-0 bg-gradient-to-br from-gray-900 via-slate-800 to-black relative overflow-hidden"
      style={{ 
        opacity: sectionOpacity,
        paddingBottom: '200vh' // Extended height for more scroll time
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        {/* Pulsing Data Streams */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent"
            style={{
              left: `${10 + i * 12}%`,
              height: '100%',
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

      <div className="relative z-10 container mx-auto px-8 py-16 h-full flex flex-col justify-center">
        {/* Section Title with Original Glitch Effect */}
        <motion.div
          className="text-center mb-16"
          style={{
            opacity: titleOpacity,
            y: titleY
          }}
        >
          <GlitchText
            className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6"
            glitchIntensity={0.4}
            revealDelay={300}
          >
            THE GAME FEED
          </GlitchText>
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
              scale: gameScale
            }}
          >
            {/* Game Frame */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-cyan-500/30 shadow-2xl">
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
          <div className="relative">
            {/* Data Flow Pipeline with Extended Timing */}
            <div className="space-y-8">
              {/* Stage 1: Player Action */}
              <motion.div
                className="flex items-center space-x-4"
                style={{
                  opacity: useTransform(stageProgress, [0, 1], [0, 1])
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Player Taps</h3>
                  <p className="text-gray-400 text-sm">Action triggers event burst</p>
                </div>
                <DataFlowArrow 
                  scrollProgress={scrollProgress}
                  activeRange={[sectionStart + 0.10, sectionStart + 0.15]}
                />
              </motion.div>

              {/* Stage 2: Oracle Reception */}
              <motion.div
                className="flex items-center space-x-4"
                style={{
                  opacity: useTransform(stageProgress, [1, 2], [0, 1])
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Oracle Receives</h3>
                  <p className="text-gray-400 text-sm">Event captured by Oracle container</p>
                </div>
                <DataFlowArrow 
                  scrollProgress={scrollProgress}
                  activeRange={[sectionStart + 0.15, sectionStart + 0.20]}
                />
              </motion.div>

              {/* Stage 3: Edge Function */}
              <motion.div
                className="flex items-center space-x-4"
                style={{
                  opacity: useTransform(stageProgress, [2, 3], [0, 1])
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Edge Function</h3>
                  <p className="text-gray-400 text-sm">Supabase processes the event</p>
                </div>
                <DataFlowArrow 
                  scrollProgress={scrollProgress}
                  activeRange={[sectionStart + 0.20, sectionStart + 0.25]}
                />
              </motion.div>

              {/* Stage 4: Oracle Engine */}
              <motion.div
                className="flex items-center space-x-4"
                style={{
                  opacity: useTransform(stageProgress, [3, 4], [0, 1])
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">Oracle Engine</h3>
                  <p className="text-gray-400 text-sm">AI processes and decides response</p>
                </div>
                <DataFlowArrow 
                  scrollProgress={scrollProgress}
                  activeRange={[sectionStart + 0.25, sectionStart + 0.30]}
                />
              </motion.div>

              {/* Stage 5: UI Update */}
              <motion.div
                className="flex items-center space-x-4"
                style={{
                  opacity: useTransform(stageProgress, [4, 5], [0, 1])
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">UI Response</h3>
                  <p className="text-gray-400 text-sm">Game and metrics update in real-time</p>
                </div>
              </motion.div>
            </div>

            {/* Oracle Processor Visualization */}
            <OracleProcessor 
              scrollProgress={scrollProgress}
              activeRange={[sectionStart + 0.20, sectionStart + 0.35]}
              className="absolute -right-20 top-1/2 transform -translate-y-1/2"
            />
          </div>
        </div>

        {/* Bottom Metrics Panel with Extended Timing */}
        <GameMetrics 
          scrollProgress={scrollProgress}
          activeRange={[sectionStart + 0.30, sectionEnd]}
          className="mt-16"
        />

        {/* Extended Scroll Progress Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          style={{
            opacity: useTransform(scrollProgress, [sectionStart + 0.15, sectionStart + 0.25, sectionEnd - 0.15, sectionEnd], [0, 1, 1, 0])
          }}
        >
          <div className="text-gray-400 text-sm mb-2">DATA FLOW ACTIVE</div>
          <motion.div
            className="w-40 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full mx-auto"
            style={{
              scaleX: useTransform(scrollProgress, [sectionStart, sectionEnd], [0, 1])
            }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
};