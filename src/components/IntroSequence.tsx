import React, { useEffect, useRef, useState } from 'react';
import { ShaderRenderer } from '../webgl/ShaderRenderer';

interface IntroSequenceProps {
  onEnter: () => void;
}

// Oracle entry WebGL intro with tap-to-enter transition
export const IntroSequence: React.FC<IntroSequenceProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ShaderRenderer | null>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new ShaderRenderer(canvasRef.current);
    rendererRef.current = renderer;
    renderer.start();

    // Title appears after 6.5 seconds
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 6500);

    // Button appears after 8 seconds
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 8000);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(buttonTimer);
      renderer.destroy();
    };
  }, []);

  const handleEnter = () => {
    if (!rendererRef.current || isTransitioning) return;

    setIsTransitioning(true);

    // Start the reverse animation then callback
    rendererRef.current.startReverse(() => {
      onEnter();
    });
  };

  return (
    <div className="intro-sequence relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Title */}
      <div
        className={`intro-title absolute inset-0 flex items-center justify-center ${
          showTitle && !isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
        }`}
      >
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-blue-300 to-amber-400 bg-clip-text text-transparent mb-8 tracking-wider">
            CHODE-NET
          </h1>
          <h2 className="text-3xl md:text-5xl font-light text-blue-200 tracking-widest opacity-90">
            ORACLE
          </h2>
        </div>
      </div>

      {/* Enter Button */}
      <div
        className={`intro-button-container absolute bottom-20 left-1/2 transform -translate-x-1/2 ${
          showButton && !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <button
          onClick={handleEnter}
          disabled={isTransitioning}
          className={`group relative overflow-hidden px-16 py-5 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-blue-400/50 text-blue-200 font-light text-lg tracking-[0.3em] uppercase transition-all duration-700 hover:border-blue-300 hover:text-white hover:shadow-2xl hover:shadow-blue-400/30 ${
            isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          style={{
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
          }}
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-400/30 to-blue-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

          {/* Pulsing border effect */}
          <div
            className="absolute inset-0 border border-blue-300/30 animate-pulse"
            style={{ clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)' }}
          ></div>

          {/* Corner accents */}
          <div className="absolute top-0 left-2 w-1 h-1 bg-blue-400 opacity-60"></div>
          <div className="absolute top-0 right-2 w-1 h-1 bg-blue-400 opacity-60"></div>
          <div className="absolute bottom-0 left-2 w-1 h-1 bg-blue-400 opacity-60"></div>
          <div className="absolute bottom-0 right-2 w-1 h-1 bg-blue-400 opacity-60"></div>

          {/* Text with subtle glow */}
          <span
            className="intro-pulse relative z-10 drop-shadow-lg"
            style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
          >
            {isTransitioning ? 'ENTERING...' : 'TAP TO ENTER'}
          </span>

          {/* Subtle inner glow */}
          <div
            className="absolute inset-1 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ clipPath: 'polygon(9px 0%, 100% 0%, calc(100% - 9px) 100%, 0% 100%)' }}
          ></div>
        </button>
      </div>

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-30 pointer-events-none"></div>
    </div>
  );
}; 