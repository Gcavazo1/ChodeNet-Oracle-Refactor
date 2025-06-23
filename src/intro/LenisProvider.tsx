import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

interface LenisContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number, options?: any) => void;
  isReady: boolean;
}

const LenisContext = createContext<LenisContextType | null>(null);

export const useLenis = () => {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error('useLenis must be used within LenisProvider');
  }
  return context;
};

interface LenisProviderProps {
  children: React.ReactNode;
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    console.log('🚀 LenisProvider: Starting initialization...');
    
    try {
      // Initialize Lenis with optimal settings for cinematic scrolling
      const lenisInstance = new Lenis({
        lerp: 0.001, // Lower values create a smoother, more "floaty" scroll
        duration: 1.0, // Slightly increase duration for a more cinematic feel
        wheelMultiplier: 5.0, // Use a standard multiplier for natural scroll speed
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false
      });

      console.log('✅ LenisProvider: Lenis instance created successfully');
      
      lenisRef.current = lenisInstance;
      setLenis(lenisInstance);

      // Add the 'lenis' class to the html element
      const htmlElement = document.documentElement;
      htmlElement.classList.add('lenis', 'lenis-smooth');

      // Wait a tick to ensure everything is properly set up
      setTimeout(() => {
        console.log('✅ LenisProvider: Marking as ready');
        setIsReady(true);
      }, 100);

      // Animation loop
      let animationId: number;
      function raf(time: number) {
        if (lenisRef.current) {
          lenisRef.current.raf(time);
        }
        animationId = requestAnimationFrame(raf);
      }
      animationId = requestAnimationFrame(raf);

      console.log('✅ LenisProvider: Animation loop started');

      // Cleanup
      return () => {
        console.log('🧹 LenisProvider: Cleaning up...');
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        if (lenisRef.current) {
          lenisRef.current.destroy();
        }
        // Remove the 'lenis' class on cleanup
        htmlElement.classList.remove('lenis', 'lenis-smooth');
        setIsReady(false);
        setLenis(null);
      };
    } catch (error) {
      console.error('❌ LenisProvider: Error during initialization:', error);
      setIsReady(false);
      setLenis(null);
    }
  }, []);

  const scrollTo = (target: string | number, options?: any) => {
    if (lenisRef.current && isReady) {
      lenisRef.current.scrollTo(target, {
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        ...options
      });
    } else {
      console.warn('⚠️ LenisProvider: scrollTo called but Lenis not ready');
    }
  };

  // Debug logging
  useEffect(() => {
    console.log(`📊 LenisProvider State: Ready=${isReady}, Instance=${!!lenis}`);
  }, [isReady, lenis]);

  return (
    <LenisContext.Provider value={{ lenis, scrollTo, isReady }}>
      {children}
    </LenisContext.Provider>
  );
};