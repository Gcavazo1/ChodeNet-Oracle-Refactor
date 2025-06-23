import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CursorState {
  type: 'default' | 'glyph' | 'interactive' | 'mystical';
  scale: number;
  color: string;
  trail: boolean;
}

export const SmartCursor: React.FC = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [cursorState, setCursorState] = useState<CursorState>({
    type: 'default',
    scale: 1,
    color: 'rgba(147, 51, 234, 0.8)',
    trail: true
  });
  
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    opacity: number;
    scale: number;
    color: string;
  }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const TRAIL_CONFIG = {
    maximumGlowPointSpacing: 10,
  };

  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const springConfig = { damping: 25, stiffness: 200 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Enhanced cursor detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mousePosition = { x: e.clientX, y: e.clientY };
      cursorX.set(mousePosition.x);
      cursorY.set(mousePosition.y);
      
      // Detect what we're hovering over
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        const isGlyph = element.closest('[data-glyph]');
        const isInteractive = element.closest('button, [role="button"], a, [data-interactive]');
        const isMystical = element.closest('[data-mystical]');
        
        if (isMystical) {
          setCursorState({
            type: 'mystical',
            scale: 1.5,
            color: 'rgba(236, 72, 153, 0.9)',
            trail: true
          });
        } else if (isGlyph) {
          setCursorState({
            type: 'glyph',
            scale: 1.3,
            color: 'rgba(6, 182, 212, 0.8)',
            trail: true
          });
        } else if (isInteractive) {
          setCursorState({
            type: 'interactive',
            scale: 1.2,
            color: 'rgba(34, 197, 94, 0.8)',
            trail: false
          });
        } else {
          setCursorState({
            type: 'default',
            scale: 1,
            color: 'rgba(147, 51, 234, 0.8)',
            trail: true
          });
        }
      }
      
      // Add particles based on cursor state (canvas glow)
      if (cursorState.trail) {
        const lastPos = lastMousePosRef.current;
        const distance = Math.hypot(mousePosition.x - lastPos.x, mousePosition.y - lastPos.y);
        const quantity = Math.max(Math.floor(distance / TRAIL_CONFIG.maximumGlowPointSpacing), 1);

        for (let i = 0; i < quantity; i++) {
          const t = i / Math.max(quantity - 1, 1);
          const x = lastPos.x + (mousePosition.x - lastPos.x) * t;
          const y = lastPos.y + (mousePosition.y - lastPos.y) * t;
          
          const particleCount = cursorState.type === 'mystical' ? 3 : 1;
          for (let j = 0; j < particleCount; j++) {
            particlesRef.current.push({
              x: x + (Math.random() - 0.5) * 20,
              y: y + (Math.random() - 0.5) * 20,
              opacity: cursorState.type === 'mystical' ? 0.8 : 0.6,
              scale: cursorState.scale,
              color: cursorState.color
            });
          }
        }
      }
      lastMousePosRef.current = mousePosition;
    };

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.opacity -= cursorState.type === 'mystical' ? 0.015 : 0.02;
        particle.scale *= 0.99;
        
        if (particle.opacity > 0) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, 25 * particle.scale
          );
          
          // Parse color and add opacity
          const colorMatch = particle.color.match(/rgba?\(([^)]+)\)/);
          if (colorMatch) {
            const [r, g, b] = colorMatch[1].split(',').map(n => parseInt(n.trim()));
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particle.opacity})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          }
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 25 * particle.scale, 0, Math.PI * 2);
          ctx.fill();
          
          // Add mystical sparkles
          if (cursorState.type === 'mystical' && Math.random() < 0.3) {
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`;
            ctx.beginPath();
            ctx.arc(
              particle.x + (Math.random() - 0.5) * 40,
              particle.y + (Math.random() - 0.5) * 40,
              1,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          
          return true;
        }
        return false;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cursorX, cursorY, cursorState]);

  return (
    <>
      {/* Particle Trail Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Main Cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%'
        }}
        animate={{
          scale: cursorState.scale,
          borderColor: cursorState.color
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.div
          className="w-6 h-6 border-2 rounded-full"
          style={{ borderColor: cursorState.color }}
          animate={{
            rotate: cursorState.type === 'mystical' ? [0, 360] : 0,
            boxShadow: [
              `0 0 10px ${cursorState.color}`,
              `0 0 20px ${cursorState.color}`,
              `0 0 10px ${cursorState.color}`
            ]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Cursor State Indicator */}
        {cursorState.type !== 'default' && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-black/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-white font-medium">
              {cursorState.type === 'glyph' && '✨ Glyph'}
              {cursorState.type === 'interactive' && '👆 Interactive'}
              {cursorState.type === 'mystical' && '🔮 Mystical'}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};