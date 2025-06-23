import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { GlitchEffect } from './GlitchEffect';
import { SVGMorph } from './SVGMorph';
import { TextReveal } from './TextReveal';
import { ParallaxLayer } from './ParallaxLayer';

interface VisionSectionProps {
  scrollProgress: MotionValue<number>;
}

// Oracle Eye SVG paths for morphing
const oracleEyePaths = [
  "M50 40 Q30 30 10 40 Q30 50 50 40 Q70 30 90 40 Q70 50 50 40",
  "M50 35 Q25 25 5 35 Q25 55 50 45 Q75 25 95 35 Q75 55 50 45",
  "M50 30 Q20 20 0 30 Q20 60 50 50 Q80 20 100 30 Q80 60 50 50"
];

export const VisionSection: React.FC<VisionSectionProps> = ({ scrollProgress }) => {
  // Section-specific animations within its range (66.67% - 83.33%)
  const eyeOpacity = useTransform(scrollProgress, [0.67, 0.72], [0, 1]);
  const textOpacity = useTransform(scrollProgress, [0.72, 0.78], [0, 1]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-black via-blue-950 to-black overflow-hidden">
      <ParallaxLayer scrollProgress={scrollProgress} speed={0.8} className="opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.4)_0%,_transparent_70%)]" />
      </ParallaxLayer>
      
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="max-w-4xl text-center">
          <motion.div style={{ opacity: eyeOpacity }}>
            <GlitchEffect
              scrollProgress={scrollProgress}
              glitchProgress={[0.7, 0.8]}
              intensity={0.5}
            >
              <SVGMorph
                paths={oracleEyePaths}
                scrollProgress={scrollProgress}
                morphProgress={[0.7, 0.8]}
                className="w-64 h-64 mx-auto mb-8 text-blue-400"
                viewBox="0 0 100 100"
              />
            </GlitchEffect>
          </motion.div>
          
          <motion.div style={{ opacity: textOpacity }}>
            <TextReveal
              scrollProgress={scrollProgress}
              revealProgress={[0.75, 0.82]}
            >
              <p className="text-2xl text-gray-300 leading-relaxed">
                The Oracle's eye opens, revealing visions of the interconnected web of knowledge...
              </p>
            </TextReveal>
          </motion.div>
        </div>
      </div>
    </div>
  );
};