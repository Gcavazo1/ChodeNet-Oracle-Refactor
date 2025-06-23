import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MysticalTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  mysticalText?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  glowColor?: string;
  className?: string;
}

export const MysticalTooltip: React.FC<MysticalTooltipProps> = ({
  children,
  title,
  description,
  mysticalText,
  position = 'top',
  glowColor = 'rgba(147, 51, 234, 0.8)',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMystical, setShowMystical] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-3'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-8 border-l-8 border-r-8 border-transparent border-t-purple-500/80',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-8 border-l-8 border-r-8 border-transparent border-b-purple-500/80',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-8 border-t-8 border-b-8 border-transparent border-l-purple-500/80',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-8 border-t-8 border-b-8 border-transparent border-r-purple-500/80'
  };

  const handleLongPress = () => {
    if (mysticalText) {
      setShowMystical(true);
      setTimeout(() => setShowMystical(false), 4000);
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onMouseDown={handleLongPress}
      data-mystical={mysticalText ? 'true' : undefined}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 ${positionClasses[position]}`}
            initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <motion.div
              className="bg-black/95 backdrop-blur-sm border border-purple-500/50 rounded-lg px-4 py-3 text-center min-w-48 max-w-64 relative overflow-hidden"
              animate={{
                boxShadow: [
                  `0 0 10px ${glowColor}`,
                  `0 0 20px ${glowColor}`,
                  `0 0 10px ${glowColor}`
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Mystical Background */}
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="relative z-10">
                <div className="text-white font-bold text-sm mb-1">{title}</div>
                <div className="text-gray-300 text-xs leading-relaxed">{description}</div>
                
                {mysticalText && (
                  <motion.div
                    className="text-purple-300 text-xs mt-2 italic opacity-60"
                    animate={{
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Hold to reveal secrets...
                  </motion.div>
                )}
              </div>
              
              {/* Floating Particles */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: glowColor,
                    left: `${20 + i * 30}%`,
                    top: '50%'
                  }}
                  animate={{
                    x: [0, Math.random() * 20 - 10, 0],
                    y: [0, -20, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
            
            {/* Arrow */}
            <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mystical Secret Reveal */}
      <AnimatePresence>
        {showMystical && mysticalText && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm border-2 border-purple-400/50 rounded-2xl p-8 text-center max-w-md mx-4 relative overflow-hidden"
              initial={{ scale: 0.5, rotateY: -90 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.5, rotateY: 90 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Mystical Aura */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `conic-gradient(from 0deg, ${glowColor}, transparent, ${glowColor})`
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10">
                <motion.div
                  className="text-2xl mb-4"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔮
                </motion.div>
                
                <h3 className="text-purple-200 font-bold text-lg mb-4">Ancient Secret Revealed</h3>
                
                <motion.p
                  className="text-purple-100 italic leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  "{mysticalText}"
                </motion.p>
                
                <motion.div
                  className="mt-6 text-purple-300 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  This knowledge shall fade in moments...
                </motion.div>
              </div>
              
              {/* Mystical Particles */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{ 
                    background: glowColor,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};