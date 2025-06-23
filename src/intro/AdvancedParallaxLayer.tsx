import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface ParallaxElement {
  id: string;
  component: React.ReactNode;
  speed: number;
  opacity?: number;
  scale?: number;
  rotation?: number;
  position: { x: number; y: number };
  zIndex?: number;
}

interface ParallaxItemProps {
  element: ParallaxElement;
  scrollProgress: MotionValue<number>;
  mousePosition: { x: number; y: number };
  enableMouseParallax: boolean;
}

const ParallaxItem: React.FC<ParallaxItemProps> = ({ element, scrollProgress, mousePosition, enableMouseParallax }) => {
  // Scroll-based transforms
  const scrollY = useTransform(
    scrollProgress,
    [0, 1],
    [0, -100 * element.speed]
  );

  const scrollOpacity = useTransform(
    scrollProgress,
    [0, 0.3, 0.7, 1],
    [element.opacity || 1, element.opacity || 1, element.opacity || 1, (element.opacity || 1) * 0.3]
  );

  const scrollScale = useTransform(
    scrollProgress,
    [0, 1],
    [element.scale || 1, (element.scale || 1) * 1.2]
  );

  const scrollRotation = useTransform(
    scrollProgress,
    [0, 1],
    [element.rotation || 0, (element.rotation || 0) + 360 * element.speed * 0.1]
  );

  // Mouse-based parallax (subtle)
  const mouseX = enableMouseParallax ? mousePosition.x * element.speed * 10 : 0;
  const mouseY = enableMouseParallax ? mousePosition.y * element.speed * 10 : 0;

  const combinedY = useTransform(() => scrollY.get() + mouseY);

  return (
    <motion.div
      key={element.id}
      className="absolute"
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        zIndex: element.zIndex || 1,
        opacity: scrollOpacity,
        scale: scrollScale,
        rotate: scrollRotation,
        x: mouseX,
        y: combinedY
      }}
    >
      {element.component}
    </motion.div>
  );
};

interface AdvancedParallaxLayerProps {
  scrollProgress: MotionValue<number>;
  elements: ParallaxElement[];
  className?: string;
  enableMouseParallax?: boolean;
}

export const AdvancedParallaxLayer: React.FC<AdvancedParallaxLayerProps> = ({
  scrollProgress,
  elements,
  className = '',
  enableMouseParallax = false
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!enableMouseParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseParallax]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {elements.map((element) => (
        <ParallaxItem
          key={element.id}
          element={element}
          scrollProgress={scrollProgress}
          mousePosition={mousePosition}
          enableMouseParallax={enableMouseParallax}
        />
      ))}
    </div>
  );
};