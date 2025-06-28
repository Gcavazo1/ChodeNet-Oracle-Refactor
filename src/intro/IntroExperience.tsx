import React, { lazy, Suspense, useState, ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// ... existing code ...
// Added: new IntroExperience implementation that orchestrates the cinematic intro scenes
import { SmartCursor } from './SmartCursor';
import { LenisProvider } from './LenisProvider';
import { ScrollSceneManager } from './ScrollSceneManager';
import { HeroScene } from './scenes/HeroScene';
import { SacredTabsScene } from './scenes/SacredTabsScene';
import { GameFeedScene } from './scenes/GameFeedScene';
import { OracleLoreScene } from './scenes/OracleLoreScene';
import { OracleReferendumScene } from './scenes/OracleReferendumScene';
import { BeginRitualScene } from './scenes/BeginRitualScene';
import { useAmbientAudio } from './useAmbientAudio';
import { StartScreen } from './StartScreen';
import { motion } from 'framer-motion';

interface IntroExperienceProps {
  onIntroFinish: (savePreference: boolean) => void;
}

const IntroExperience: React.FC<IntroExperienceProps> = ({ onIntroFinish }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const navigate = useNavigate();
  useAmbientAudio(isAudioEnabled);

  const handleStart = () => {
    setIsAudioEnabled(true);
    setHasStarted(true);
  };

  const handleSkip = () => {
    onIntroFinish(false);
    navigate('/');
  };

  const handleIntroComplete = (savePreference: boolean) => {
    onIntroFinish(savePreference);
    navigate('/');
  };

  // Define the full cinematic flow – adjust durations to taste
  const scrollScenes: {id: string, duration: number, component: ComponentType<any>}[] = [
    { id: 'hero', duration: 10, component: HeroScene },
    { id: 'sacred-tabs', duration: 20,component: SacredTabsScene },
    { id: 'game-feed', duration: 20, component: GameFeedScene },
    { id: 'oracle-lore', duration: 20, component: OracleLoreScene },
    { id: 'oracle-referendum', duration: 20, component: OracleReferendumScene },
    { id: 'begin-ritual', duration: 10, component: BeginRitualScene }
  ];

  // Pass handleIntroComplete to the last scene
  const scenesWithInjectedProps = scrollScenes.map(scene => {
    if (scene.id === 'begin-ritual') {
      return {
        ...scene,
        component: (props: any) => <BeginRitualScene {...props} onComplete={handleIntroComplete} />
      };
    }
    return scene;
  });

  return (
    <>
      <AnimatePresence>
        {!hasStarted && <StartScreen onStart={handleStart} />}
      </AnimatePresence>
      
      {hasStarted && (
        <LenisProvider>
          <div className="bg-black text-white intro-sequence relative">
            {/* Global Skip Button */}
            <motion.button
              className="fixed top-8 right-8 text-gray-400 hover:text-white transition-colors duration-300 text-sm z-[100]"
              onClick={handleSkip}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skip Intro →
            </motion.button>

            {/* Custom cursor that morphs based on interactive elements */}
            <SmartCursor />

            {/* Section-based scroll orchestration */}
            <ScrollSceneManager scenes={scenesWithInjectedProps}>
              {/* Global scroll progress bar */}
              <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 z-[60]" />
            </ScrollSceneManager>
          </div>
        </LenisProvider>
      )}
    </>
  );
};

export default IntroExperience; 