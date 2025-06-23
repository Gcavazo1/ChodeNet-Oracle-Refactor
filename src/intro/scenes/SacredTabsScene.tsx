import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { Eye, Gamepad2, Users, Scroll, Trophy, MessageCircle } from 'lucide-react';
import { SacredTab } from '../SacredTab';
import { AdvancedParallaxLayer } from '../AdvancedParallaxLayer';
import { HackerText } from '../HackerText';
import { InteractiveGlyph } from '../InteractiveGlyph';
import { StaggeredTextReveal } from '../StaggeredTextReveal';

interface SacredTabsSceneProps {
  sceneProgress: MotionValue<number>;
  isActive: boolean;
}

export const SacredTabsScene: React.FC<SacredTabsSceneProps> = ({ sceneProgress, isActive }) => {
  // Progressive reveal animations
  const titleOpacity = useTransform(sceneProgress, [0, 0.2], [0, 1]);
  const titleY = useTransform(sceneProgress, [0, 0.2], [50, 0]);
  const tab1Opacity = useTransform(sceneProgress, [0.15, 0.4], [0, 1]);
  const tab2Opacity = useTransform(sceneProgress, [0.35, 0.6], [0, 1]);
  const tab3Opacity = useTransform(sceneProgress, [0.55, 0.8], [0, 1]);
  const glyphsOpacity = useTransform(sceneProgress, [0.01, 0.9], [0, 1]);

  // Base glyph definitions
  const baseGlyphs = [
    {
      id: 'nexus-glyph',
      component: (
        <InteractiveGlyph
          icon={Eye}
          title="Nexus Core"
          description="The heart of prophecy"
          secretText="Through the Nexus, all timelines converge into a single point of infinite possibility..."
          glowColor="rgba(147, 51, 234, 0.8)"
          size="sm"
        />
      ),
      speed: 0.6,
      opacity: 0.6,
      position: { x: 5, y: 20 },
      zIndex: 2
    },
    {
      id: 'feed-glyph',
      component: (
        <InteractiveGlyph
          icon={Gamepad2}
          title="Digital Arena"
          description="Where souls compete"
          secretText="Every game is a ritual, every player a participant in the grand design..."
          glowColor="rgba(6, 182, 212, 0.8)"
          size="md"
        />
      ),
      speed: 0.4,
      opacity: 0.7,
      position: { x: 50, y: 10 },
      zIndex: 3
    },
    {
      id: 'community-glyph',
      component: (
        <InteractiveGlyph
          icon={Users}
          title="Collective Mind"
          description="The hive consciousness"
          secretText="Individual thoughts merge into a symphony of collective wisdom..."
          glowColor="rgba(251, 146, 60, 0.8)"
          size="sm"
        />
      ),
      speed: 0.3,
      opacity: 0.7,
      position: { x: 95, y: 25 },
      zIndex: 1
    },
    {
      id: 'scroll-glyph',
      component: (
        <InteractiveGlyph
          icon={Scroll}
          title="Ancient Wisdom"
          description="Scrolls of knowledge"
          secretText="The scrolls contain the accumulated wisdom of ages, written in the language of light..."
          glowColor="rgba(234, 179, 8, 0.8)"
          size="sm"
        />
      ),
      speed: 0.5,
      opacity: 0.4,
      position: { x: 10, y: 80 },
      zIndex: 2
    },
    {
      id: 'trophy-glyph',
      component: (
        <InteractiveGlyph
          icon={Trophy}
          title="Sacred Achievement"
          description="Marks of transcendence"
          secretText="True victory lies not in defeating others, but in transcending the self..."
          glowColor="rgba(34, 197, 94, 0.8)"
          size="md"
        />
      ),
      speed: 0.6,
      opacity: 0.8,
      position: { x: 85, y: 75 },
      zIndex: 4
    },
    {
      id: 'message-glyph',
      component: (
        <InteractiveGlyph
          icon={MessageCircle}
          title="Ethereal Communication"
          description="Whispers across the void"
          secretText="Words carry power beyond their meaning, creating ripples in the fabric of reality..."
          glowColor="rgba(236, 72, 153, 0.8)"
          size="sm"
        />
      ),
      speed: 0.35,
      opacity: 0.6,
      position: { x: 75, y: 5 },
      zIndex: 3
    }
  ];

  // Duplicate glyphs twice with variations to triple total count
  const parallaxElements = [
    ...baseGlyphs,
    ...baseGlyphs.map((g, i) => ({
      ...g,
      id: g.id + '-dup1',
      position: { x: (g.position.x + 20) % 100, y: (g.position.y + 25) % 100 },
      speed: g.speed * 0.8,
      opacity: g.opacity * 0.5,
      zIndex: g.zIndex - 1
    })),
    ...baseGlyphs.map((g, i) => ({
      ...g,
      id: g.id + '-dup2',
      position: { x: (g.position.x + 40) % 100, y: (g.position.y + 45) % 100 },
      speed: g.speed * 1.2,
      opacity: g.opacity * 0.5,
      zIndex: g.zIndex + 6
    }))
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-800 via-slate-900 to-black overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.3)_0%,_transparent_70%)]" />
        
        {/* Animated Sacred Geometry */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 80%)',
              'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 80%)',
              'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 80%)',
              'radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 80%)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Interactive Parallax Glyphs */}
      <motion.div style={{ opacity: glyphsOpacity }} className="z-5">
        <AdvancedParallaxLayer
          scrollProgress={sceneProgress}
          elements={parallaxElements}
          enableMouseParallax={true}
        />
      </motion.div>
      
      {/* Enhanced Floating Background Particles */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: useTransform(sceneProgress, [0.01, 0.9], [0, 1.0])
            }}
            animate={{
              y: [50, -50, 50],
              opacity: [0, 1.0, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
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
        {/* Enhanced Section Title */}
        <motion.div
          className="text-center mb-16"
          style={{ 
            opacity: titleOpacity,
            y: titleY 
          }}
        >
          <HackerText
            text="THE THREE SACRED TABS"
            className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-6"
          />
          
          <StaggeredTextReveal
            text="Three pillars of the Oracle's consciousness, each serving a sacred purpose in the digital realm"
            scrollProgress={sceneProgress}
            revealRange={[0.1, 0.3]}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            animationType="fade"
            staggerDelay={0.08}
          />
        </motion.div>

        {/* Enhanced Sacred Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <motion.div 
            style={{ opacity: tab1Opacity }}
            whileHover={{ 
              scale: 1.02,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
          >
            <SacredTab
              title="Oracle Nexus"
              subtitle="The Central Hub"
              description="The beating heart of the Oracle's consciousness, where prophecies are born and ancient scrolls reveal their secrets through resonant frequencies."
              type="nexus"
              scrollProgress={sceneProgress}
              index={0}
              className="lg:transform lg:-rotate-2"
            />
          </motion.div>
          
          <motion.div 
            style={{ opacity: tab2Opacity }}
            whileHover={{ 
              scale: 1.05,
              rotateY: -3,
              transition: { duration: 0.3 }
            }}
          >
            <SacredTab
              title="Game Feed"
              subtitle="The Digital Arena"
              description="Where mortals engage in sacred games, earning divine rewards while their actions are streamed across the ethereal networks of the Oracle."
              type="feed"
              scrollProgress={sceneProgress}
              index={1}
              className="lg:transform lg:rotate-1 lg:scale-105"
            />
          </motion.div>
          
          <motion.div 
            style={{ opacity: tab3Opacity }}
            whileHover={{ 
              scale: 1.02,
              rotateY: -5,
              transition: { duration: 0.3 }
            }}
          >
            <SacredTab
              title="Community Nexus"
              subtitle="The Living Network"
              description="A vibrant ecosystem where souls connect, share wisdom, and participate in the collective consciousness through live feeds and sacred votes."
              type="community"
              scrollProgress={sceneProgress}
              index={2}
              className="lg:transform lg:-rotate-1"
            />
          </motion.div>
        </div>

        {/* Mystical Connection Lines */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: useTransform(sceneProgress, [0.1, 1], [0, 0.9]) }}
        >
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(147, 51, 234, 0.6)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.6)" />
              </linearGradient>
            </defs>
            
            {/* Mystical connection between tabs */}
            <motion.path
              d="M 200 400 Q 600 200 1000 400"
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              animate={{
                strokeDashoffset: [0, -100],
                opacity: [1.0, 0.9, 1.0]
              }}
              transition={{
                strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};