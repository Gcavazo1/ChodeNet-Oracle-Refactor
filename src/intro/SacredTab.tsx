import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Eye, Gamepad2, Users, Zap, Scroll, Trophy, MessageCircle, Heart } from 'lucide-react';

interface SacredTabProps {
  title: string;
  subtitle: string;
  description: string;
  type: 'nexus' | 'feed' | 'community';
  scrollProgress: MotionValue<number>;
  index: number;
  className?: string;
}

const tabConfigs = {
  nexus: {
    color: 'purple',
    bgGradient: 'from-purple-900/20 via-purple-800/10 to-transparent',
    borderGradient: 'from-purple-500 to-purple-700',
    glowColor: 'rgba(147, 51, 234, 0.6)',
    icons: [Eye, Scroll, Zap],
    features: ['Prophecy Chamber', 'Apocryphal Scrolls', 'Resonance Core']
  },
  feed: {
    color: 'cyan',
    bgGradient: 'from-cyan-900/20 via-cyan-800/10 to-transparent',
    borderGradient: 'from-cyan-400 to-cyan-600',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    icons: [Gamepad2, Trophy, Zap],
    features: ['Play', 'Earn', 'Streamed']
  },
  community: {
    color: 'orange',
    bgGradient: 'from-orange-900/20 via-orange-800/10 to-transparent',
    borderGradient: 'from-orange-400 to-orange-600',
    glowColor: 'rgba(251, 146, 60, 0.6)',
    icons: [Users, MessageCircle, Heart],
    features: ['Live Feed', 'Vote', 'Connect']
  }
};

export const SacredTab: React.FC<SacredTabProps> = ({
  title,
  subtitle,
  description,
  type,
  scrollProgress,
  index,
  className = ''
}) => {
  const config = tabConfigs[type];
  
  // Adjusted entrance timing for better visibility
  const entranceDelay = index * 0.08;
  const entranceRange: [number, number] = [0.25 + entranceDelay, 0.35 + entranceDelay];
  
  const y = useTransform(
    scrollProgress,
    entranceRange,
    [80, 0]
  );
  
  const opacity = useTransform(
    scrollProgress,
    entranceRange,
    [0, 1]
  );
  
  const scale = useTransform(
    scrollProgress,
    entranceRange,
    [0.9, 1]
  );
  
  const rotateX = useTransform(
    scrollProgress,
    entranceRange,
    [10, 0]
  );

  // Z-depth illusion - closer tabs appear earlier and larger
  const zDepth = 3 - index;
  const finalScale = useTransform(scale, (value) => value * (1 + zDepth * 0.03));

  return (
    <motion.div
      className={`relative group ${className}`}
      style={{
        y,
        opacity,
        scale: finalScale,
        rotateX,
        transformPerspective: 1000,
        zIndex: 10 + zDepth
      }}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-xl"
        style={{
          background: `linear-gradient(135deg, ${config.glowColor}, transparent)`,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main Card */}
      <motion.div
        className={`gradient-hover-card relative bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border-2 border-transparent rounded-2xl p-8 overflow-hidden min-h-[400px]`}
        style={{
          borderImage: `linear-gradient(135deg, ${config.borderGradient}) 1`,
        }}
        whileHover={{
          scale: 1.02,
          rotateY: 5,
          transition: { duration: 0.3 }
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10 mb-6">
          {/* Animated title – wave rise per character */}
          <div className="flex text-3xl font-bold text-white mb-2 overflow-hidden">
            {title.split('').map((ch, i) => {
              // Spaces shouldn't animate
              const isSpace = ch === ' ';
              const charKey = `${ch}-${i}`;

              // Wave timing based on card index and char offset
              const baseStart = 0.2 + index * 0.2;
              const baseEnd = baseStart + 0.15;
              const offset = i * 0.01; // 1% per character (faster wave)

              const letterY = useTransform(scrollProgress, [baseStart + offset, baseEnd + offset], [20, 0]);
              const letterOpacity = useTransform(scrollProgress, [baseStart + offset, baseEnd + offset], [0, 1]);

              return (
                <motion.span
                  key={charKey}
                  style={{ y: letterY, opacity: letterOpacity, display: 'inline-block' }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </motion.span>
              );
            })}
          </div>
          <motion.p
            className="text-gray-300 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Icons Row – now fly-out on late scroll */}
        <div className="relative z-5 flex space-x-6 mb-6">
          {config.icons.map((Icon, iconIndex) => {
            // Fly-out timing per tab (chain-reaction)
            const baseStart = 0.4;   // when first tab's icons launch
            const step = 0.2;        // add 20% per tab (0.4, 0.6, 0.8)
            const flyStart = baseStart + index * step;
            const flyEnd = flyStart + 0.15; // run for 15% of progress

            // tiny stagger per icon inside its tab
            const iconDelay = iconIndex * 0.03; // 3% shift

            // Direction scatter per tab & per icon
            const scatter = {
              nexus: [
                { x: -240, y: -90 },
                { x: -200, y:  10 },
                { x: -260, y: 120 }
              ],
              feed: [
                { x: -60,  y: -250 },
                { x:   0,  y: -220 },
                { x:  70,  y: -270 }
              ],
              community: [
                { x: 240, y: -90 },
                { x: 200, y:  30 },
                { x: 260, y: 110 }
              ]
            } as const;

            const chosen = scatter[type][iconIndex];
            const dirX = chosen.x;
            const dirY = chosen.y;

            const iconX = useTransform(scrollProgress, [flyStart + iconDelay, flyEnd + iconDelay], [0, dirX]);
            const iconY = useTransform(scrollProgress, [flyStart + iconDelay, flyEnd + iconDelay], [0, dirY]);
            const iconScale = useTransform(scrollProgress, [0.2, 0.4, flyStart + iconDelay, flyEnd + iconDelay], [0, 1, 1, 1.8]);
            const iconOpacity = useTransform(scrollProgress, [0.2, 0.4, flyEnd + iconDelay], [0, 1, 1]);

            return (
              <motion.div
                key={iconIndex}
                className="relative"
                style={{ x: iconX, y: iconY, scale: iconScale, opacity: iconOpacity }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${config.borderGradient} p-0.5`}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8 + iconIndex * 2, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-3 mb-6">
          {config.features.map((feature, featureIndex) => (
            <motion.div
              key={featureIndex}
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + featureIndex * 0.1 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-gradient-to-r from-white to-gray-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: featureIndex * 0.3
                }}
              />
              <span className="text-gray-300 font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Description */}
        <motion.p
          className="relative z-10 text-gray-400 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {description}
        </motion.p>

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        />
      </motion.div>
    </motion.div>
  );
};