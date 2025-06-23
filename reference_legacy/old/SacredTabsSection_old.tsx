import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { SacredTab } from './SacredTab';
import { ParallaxLayer } from './ParallaxLayer';
import { GlitchText } from './GlitchText';

interface SacredTabsSectionProps {
  scrollProgress: MotionValue<number>;
}

export const SacredTabsSection: React.FC<SacredTabsSectionProps> = ({ scrollProgress }) => {
  // Section-specific animations within its range (16.67% - 33.33%)
  const titleOpacity = useTransform(scrollProgress, [0.16, 0.20], [0, 1]);
  const titleY = useTransform(scrollProgress, [0.16, 0.20], [50, 0]);
  const tabsOpacity = useTransform(scrollProgress, [0.18, 0.25], [0, 1]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-800 via-slate-900 to-black overflow-hidden">
      {/* Background Effects */}
      <ParallaxLayer scrollProgress={scrollProgress} speed={0.5} className="opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)]" />
      </ParallaxLayer>
      
      {/* Floating Background Particles */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 6
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
            className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-6"
            glitchIntensity={0.5}
            revealDelay={500}
          >
            THE THREE SACRED TABS
          </GlitchText>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Three pillars of the Oracle's consciousness, each serving a sacred purpose in the digital realm
          </p>
        </motion.div>

        {/* Sacred Tabs Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          style={{ opacity: tabsOpacity }}
        >
          <SacredTab
            title="Oracle Nexus"
            subtitle="The Central Hub"
            description="The beating heart of the Oracle's consciousness, where prophecies are born and ancient scrolls reveal their secrets through resonant frequencies."
            type="nexus"
            scrollProgress={scrollProgress}
            index={0}
            className="lg:transform lg:-rotate-2"
          />
          
          <SacredTab
            title="Game Feed"
            subtitle="The Digital Arena"
            description="Where mortals engage in sacred games, earning divine rewards while their actions are streamed across the ethereal networks of the Oracle."
            type="feed"
            scrollProgress={scrollProgress}
            index={1}
            className="lg:transform lg:rotate-1 lg:scale-105"
          />
          
          <SacredTab
            title="Community Nexus"
            subtitle="The Living Network"
            description="A vibrant ecosystem where souls connect, share wisdom, and participate in the collective consciousness through live feeds and sacred votes."
            type="community"
            scrollProgress={scrollProgress}
            index={2}
            className="lg:transform lg:-rotate-1"
          />
        </motion.div>
      </div>
    </div>
  );
};