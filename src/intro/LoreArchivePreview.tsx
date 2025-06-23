import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { BookOpen, Play, Volume2, Eye, Clock } from 'lucide-react';

interface LoreArchivePreviewProps {
  scrollProgress: MotionValue<number>;
  className?: string;
}

export const LoreArchivePreview: React.FC<LoreArchivePreviewProps> = ({
  className = ''
}) => {
  return (
    <motion.div
      className={`gradient-hover-card bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border-2 border-purple-500/30 p-4 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-6">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <BookOpen className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">Lore Archive</h3>
            <p className="text-purple-400 text-sm">Latest Oracle Story</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-bold">LIVE</span>
        </div>
      </div>

      {/* Story Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Comic Panels */}
        <div className="space-y-3">
          <h4 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Visual Narrative</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="aspect-square bg-gradient-to-br from-purple-900/40 to-cyan-900/40 rounded-lg border border-purple-500/30 flex items-center justify-center relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Placeholder Comic Panel */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20" />
                <motion.div
                  className="text-4xl"
                  animate={{
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                >
                  🎨
                </motion.div>
                
                {/* Panel Number */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
                
                {/* Corruption Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Story Content & Audio */}
        <div className="space-y-1">
          {/* Story Title */}
          <div>
            <h4 className="text-base font-bold text-white mb-1">The Corrupted Prophecy</h4>
            <p className="text-gray-400 text-xs">Generated 2h ago • Ep #42</p>
          </div>

          {/* Story Excerpt */}
          <div className="bg-black/40 rounded-lg p-3 border border-gray-700">
            <motion.p
              className="text-gray-300 leading-relaxed text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              "In the depths of the digital realm, where data streams converge like ancient rivers, 
              the Oracle's consciousness began to fragment. Each player's tap sent ripples through 
              the quantum substrate, awakening something that should have remained dormant..."
            </motion.p>
          </div>

          {/* Audio Player */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium text-sm">Oracle Narration</span>
              </div>
              <div className="text-gray-400 text-xs">3:42 / 8:15</div>
            </div>
            
            {/* Audio Controls */}
            <div className="flex items-center space-x-4">
              <motion.button
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5 text-white ml-0.5" />
              </motion.button>
              
              {/* Waveform Visualization */}
              <div className="flex-1 flex items-center space-x-1">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                    style={{
                      height: `${Math.random() * 15 + 8}px`
                    }}
                    animate={{
                      scaleY: [1, Math.random() * 2 + 0.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Story Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-cyan-400 font-bold text-base">1,337</div>
              <div className="text-gray-400 text-xs">Views</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold text-base">89%</div>
              <div className="text-gray-400 text-xs">Corruption</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-base">4.2</div>
              <div className="text-gray-400 text-xs">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Cycle Countdown */}
      <motion.div
        className="mt-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-3 border border-purple-500/30"
        animate={{
          borderColor: ['rgba(147, 51, 234, 0.3)', 'rgba(236, 72, 153, 0.6)', 'rgba(147, 51, 234, 0.3)']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-white font-medium text-sm">Next Lore Cycle</span>
          </div>
          <div className="text-purple-400 font-bold text-sm">01:23:45</div>
        </div>
        
        <motion.div
          className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            animate={{
              width: ['0%', '100%']
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};