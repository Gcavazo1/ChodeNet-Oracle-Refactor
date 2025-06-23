import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { useLenis } from './LenisProvider';

interface ScrollScene {
  id: string;
  duration: number; // How many scroll units this scene takes
  component: React.ComponentType<{ sceneProgress: MotionValue<number>; isActive: boolean }>;
  onEnter?: () => void;
  onExit?: () => void;
}

interface ScrollSceneContextType {
  currentScene: number;
  sceneProgress: MotionValue<number>;
  totalScenes: number;
  isScrollLocked: boolean;
}

const ScrollSceneContext = createContext<ScrollSceneContextType | null>(null);

export const useScrollScene = () => {
  const context = useContext(ScrollSceneContext);
  if (!context) {
    throw new Error('useScrollScene must be used within ScrollSceneManager');
  }
  return context;
};

interface ScrollSceneManagerProps {
  scenes: ScrollScene[];
  children?: React.ReactNode;
}

export const ScrollSceneManager: React.FC<ScrollSceneManagerProps> = ({ scenes, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [currentScroll, setCurrentScroll] = useState(0); // For debug panel

  const currentSceneRef = useRef(0);
  const { lenis, isReady: lenisReady } = useLenis();

  const SCROLL_MULTIPLIER = 900; // Each duration unit equals 100px of scrolling

  // Sync ref with state
  useEffect(() => {
    currentSceneRef.current = currentScene;
  }, [currentScene]);

  // Create scroll progress for current scene
  const sceneProgressMotionValue = useTransform(() => sceneProgress);

  // CORE REFACTOR V2: Listen to Lenis's scroll event with a multiplier
  useEffect(() => {
    if (!lenisReady || !lenis) {
      return;
    }

    const totalPixelHeight = scenes.reduce((acc, scene) => acc + scene.duration * SCROLL_MULTIPLIER, 0);
    console.log(`📊 Total scrollable height set: ${totalPixelHeight}px`);

    const unsubscribe = lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      setCurrentScroll(scroll); // Update debug panel

      let accumulatedHeight = 0;
      let activeSceneIndex = 0;
      let progressInScene = 0;

      for (let i = 0; i < scenes.length; i++) {
        const sceneHeight = scenes[i].duration * SCROLL_MULTIPLIER;
        const sceneStart = accumulatedHeight;
        const sceneEnd = accumulatedHeight + sceneHeight;

        if (scroll >= sceneStart && scroll < sceneEnd) {
          activeSceneIndex = i;
          progressInScene = (scroll - sceneStart) / sceneHeight;
          break;
        }
        accumulatedHeight += sceneHeight;
      }
      
      if (scroll >= totalPixelHeight) {
        activeSceneIndex = scenes.length - 1;
        progressInScene = 1;
      }

      if (currentSceneRef.current !== activeSceneIndex) {
        scenes[currentSceneRef.current]?.onExit?.();
        setCurrentScene(activeSceneIndex);
        scenes[activeSceneIndex]?.onEnter?.();
      }
      setSceneProgress(progressInScene);
    });

    return () => {
      unsubscribe();
    };

  }, [lenisReady, lenis, scenes]);
  
  // This effect sets the total scrollable height on the body
  useEffect(() => {
    if (lenisReady) {
      const totalPixelHeight = scenes.reduce((acc, scene) => acc + scene.duration * SCROLL_MULTIPLIER, 0);
      document.body.style.height = `${totalPixelHeight}px`;
      
      return () => {
        document.body.style.height = '';
      };
    }
  }, [lenisReady, scenes]);

  return (
    <ScrollSceneContext.Provider value={{ currentScene, sceneProgress: sceneProgressMotionValue, totalScenes: scenes.length, isScrollLocked: false }}>
      <div ref={containerRef} className="scroll-scene-manager">
        {scenes.map((scene, index) => (
          <div key={scene.id} style={{ height: `${scene.duration * SCROLL_MULTIPLIER}px` }}>
            <motion.div 
              className="sticky top-0 h-screen"
              style={{ pointerEvents: index === currentScene ? 'auto' : 'none' }}
              initial={false}
              animate={{ 
                opacity: index === currentScene ? 1 : 0,
                scale: index === currentScene ? 1 : 1.15
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <scene.component 
                sceneProgress={sceneProgressMotionValue} 
                isActive={index === currentScene} 
              />
            </motion.div>
          </div>
        ))}
      </div>
      
      {/* Updated Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-1/2 left-4 bg-black/50 p-2 rounded-lg text-xs z-[100] pointer-events-none">
          <div>Lenis Ready: {lenisReady ? 'YES' : 'NO'}</div>
          <div>Scene ID: <span className="font-bold text-green-400">{scenes[currentScene]?.id}</span></div>
          <div>Scroll: {Math.round(currentScroll)}</div>
          <div>Progress: {Math.round(sceneProgress * 100)}%</div>
        </div>
      )}

      {children}
    </ScrollSceneContext.Provider>
  );
};