import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  Image, 
  Zap,
  Clock,
  Sparkles,
  Eye,
  BookOpen,
  Volume2
} from 'lucide-react';
import { LorePipelineNode, LoreNode } from './LorePipelineNode';
import { LoreArchivePreview } from './LoreArchivePreview';
import { CorruptionWave } from './CorruptionWave';
import { HackerText } from './HackerText';
import { LoreNodeCard } from './LoreNodeCard';

interface OracleLoreSystemProps {
  scrollProgress: MotionValue<number>;
  sectionIndex: number;
  totalSections: number;
}

const loreNodes: LoreNode[] = [
  {
    id: 1,
    title: "User Submissions",
    subtitle: "Lore Fragments Input",
    description: "Players submit mythic fragments and story seeds",
    icon: FileText,
    color: "cyan",
    position: { x: 10, y: 20 },
    glowColor: "rgba(6, 182, 212, 0.6)",
    borderGradient: "from-cyan-400 to-cyan-600",
    cardPosition: 'bottom'
  },
  {
    id: 2,
    title: "Cron Trigger",
    subtitle: "Supabase Edge Function",
    description: "Automated 4-hour cycle activation",
    icon: Clock,
    color: "green",
    position: { x: 30, y: 10 },
    glowColor: "rgba(34, 197, 94, 0.6)",
    borderGradient: "from-green-400 to-green-600",
    cardPosition: 'bottom'
  },
  {
    id: 3,
    title: "AI Story Generation",
    subtitle: "Groq LLaMA 70B",
    description: "Transform fragments into epic narratives",
    icon: Brain,
    color: "purple",
    position: { x: 50, y: 30 },
    glowColor: "rgba(147, 51, 234, 0.6)",
    borderGradient: "from-purple-400 to-purple-600",
    cardPosition: 'top'
  },
  {
    id: 4,
    title: "Comic Panel Creation",
    subtitle: "Stable Diffusion",
    description: "Generate mythic illustrations",
    icon: Image,
    color: "orange",
    position: { x: 70, y: 15 },
    glowColor: "rgba(251, 146, 60, 0.6)",
    borderGradient: "from-orange-400 to-orange-600",
    cardPosition: 'bottom'
  },
  {
    id: 5,
    title: "Voiceover Generation",
    subtitle: "ElevenLabs TTS",
    description: "Create immersive narration",
    icon: Volume2,
    color: "pink",
    position: { x: 90, y: 25 },
    glowColor: "rgba(236, 72, 153, 0.6)",
    borderGradient: "from-pink-400 to-pink-600",
    cardPosition: 'top'
  },
  {
    id: 6,
    title: "Real-Time Lore Drop",
    subtitle: "UI Update + Smart Alerts",
    description: "Deliver completed stories to the community",
    icon: Zap,
    color: "yellow",
    position: { x: 50, y: 65 },
    glowColor: "rgba(234, 179, 8, 0.6)",
    borderGradient: "from-yellow-400 to-yellow-600",
    cardPosition: 'bottom'
  }
];

// Define floating glyph icons
const floatingGlyphIcons = [BookOpen, Eye, Sparkles];

export const OracleLoreSystem: React.FC<OracleLoreSystemProps> = ({
  scrollProgress,
}) => {
  // Main title animation
  const titleOpacity = useTransform(scrollProgress, [0.05, 0.15], [0, 1]);
  const titleY = useTransform(scrollProgress, [0.05, 0.15], [50,-50]);
  const corruptionIntensity = useTransform(scrollProgress, [0.2, 0.6], [0, 0.8]);

  // --- REVISED TIMING ---
  const stepDuration = 0.08; // Make reveal faster
  const lastNodeStart = 0.15 + (5 * stepDuration);

  const node6 = loreNodes.find(n => n.id === 6);
  const node6CardOpacity = useTransform(scrollProgress, [lastNodeStart, lastNodeStart + stepDuration], [0, 1]);
  const node6CardScale = useTransform(scrollProgress, [lastNodeStart, lastNodeStart + stepDuration], [0.9, 1]);

  // Animation for the hand-off - EARLIER & LONGER DURATION
  const handoffStart = 0.65;
  const handoffEnd = 0.9;
  const pipelineX = useTransform(scrollProgress, [handoffStart, handoffEnd], [0, 950]);
  const pipelineOpacity = useTransform(scrollProgress, [handoffStart, handoffEnd], [1, 0]);

  const archivePreviewX = useTransform(scrollProgress, [handoffStart, handoffEnd], [-300, 0]);
  const archivePreviewOpacity = useTransform(scrollProgress, [handoffStart, handoffEnd], [0, 1]);
  const archivePreviewY = useTransform(scrollProgress, [handoffStart, handoffEnd], [0, -80]); // Slide up

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black overflow-hidden pt-24 px-8">
      {/* --- AMBIENT BACKGROUNDS --- */}
      <CorruptionWave
        scrollProgress={scrollProgress}
        intensity={corruptionIntensity}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      <div className="absolute inset-0 z-5 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => {
          const IconComponent = floatingGlyphIcons[i % 3];
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0], rotate: [0, 180, 360], opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 8 + Math.random() * 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 8
              }}
            >
              <IconComponent className="w-6 h-6 text-purple-400" strokeWidth={1} />
            </motion.div>
          );
        })}
      </div>

      {/* --- MAIN CONTENT CONTAINER --- (REVERTED TO STABLE LAYOUT) */}
      <div className="relative z-10 container mx-auto h-full flex flex-col items-center">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <HackerText
            text="ORACLE LORE SYSTEM"
            className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent mb-6"
          />
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Witness the fully automated AI pipeline that transforms player fragments into mythic, illustrated, narrated stories every 4 hours
          </p>
        </motion.div>

        {/* REVERTED: Wrapper for Pipeline and Preview */}
        <div className="relative w-full max-w-7xl aspect-[16/7] -mt-8">

          {/* Pipeline Stage */}
          <motion.div
            className="absolute inset-0"
            style={{
              x: pipelineX,
              opacity: pipelineOpacity,
            }}
          >
            {/* SVG for connection lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="pipelineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(147, 51, 234, 0.6)" />
                  <stop offset="50%" stopColor="rgba(34, 197, 94, 0.6)" />
                  <stop offset="100%" stopColor="rgba(234, 179, 8, 0.6)" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Sequentially drawn paths */}
              {loreNodes.slice(0, -1).map((node, index) => {
                const nextNode = loreNodes[index + 1];
                
                // Timing for this specific path to draw
                const pathStart = 0.20 + (index * stepDuration);
                const pathEnd = pathStart + stepDuration;
                const pathProgress = useTransform(scrollProgress, [pathStart, pathEnd], [0, 1]);

                // Convert node positions from % to SVG viewBox units
                const x1 = (node.position.x / 100) * 800;
                const y1 = (node.position.y / 100) * 400;
                const x2 = (nextNode.position.x / 100) * 800;
                const y2 = (nextNode.position.y / 100) * 400;
                const midX = (x1 + x2) / 2;
                const midY = Math.min(y1, y2) - 40;
                
                return (
                  <motion.path
                    key={`path-${index}`}
                    d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                    stroke="url(#pipelineGradient)"
                    strokeWidth="3"
                    fill="none"
                    filter="url(#glow)"
                    style={{ pathLength: pathProgress }}
                    initial={{ pathLength: 0 }}
                  />
                );
              })}
            </svg>

            {/* Sequentially revealed nodes */}
            {loreNodes.map((node, index) => {
              // Timing for this specific node to appear
              const nodeStart = 0.15 + (index * stepDuration);
              const nodeEnd = nodeStart + stepDuration;
              const nodeOpacity = useTransform(scrollProgress, [nodeStart, nodeEnd], [0, 1]);
              const nodeScale = useTransform(scrollProgress, [nodeStart, nodeEnd], [0.8, 1]);

              return (
                <motion.div
                  key={node.id}
                  className="absolute z-20"
                  style={{
                    left: `${node.position.x}%`,
                    top: `${node.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: nodeOpacity,
                    scale: nodeScale,
                  }}
                >
                  <LorePipelineNode
                    node={node}
                    activationProgress={nodeOpacity}
                    showCard={node.id !== 6}
                  />
                </motion.div>
              );
            })}

            {/* Detached card for Node 6 */}
            {node6 && (
              <motion.div
                className="absolute z-20"
                style={{
                  left: '60%',
                  top: '60%',
                  transform: 'translate(-50%, -50%)',
                  opacity: node6CardOpacity,
                  scale: node6CardScale,
                }}
              >
                <LoreNodeCard node={node6} />
              </motion.div>
            )}
          </motion.div>
          
          {/* Lore Archive Preview Stage */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              x: archivePreviewX,
              opacity: archivePreviewOpacity,
              y: archivePreviewY, // Apply vertical shift
            }}
          >
            <div className="w-full max-w-2xl transform scale-90">
              <LoreArchivePreview scrollProgress={scrollProgress} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
