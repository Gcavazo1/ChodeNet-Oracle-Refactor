import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { 
  Radar, 
  Brain, 
  Vote,
  Gavel,
  PenSquare,
  Cpu,
  Database,
  Network,
  Target,
  Sparkles,
  ShieldCheck,
  ToggleLeft,
  Server
} from 'lucide-react';
import { AdvancedParallaxLayer } from './AdvancedParallaxLayer';
import { HackerText } from './HackerText';

interface OracleReferendumSectionProps {
  scrollProgress: MotionValue<number>;
}

const governanceAgents = [
  {
    id: 1,
    name: "Sentinel",
    role: "Scans game & blockchain data every 5 minutes",
    description: "Flags anomalies & emerging trends before they escalate.",
    icon: Radar,
    color: "green",
    gradient: "from-green-400 to-green-600",
    glowColor: "rgba(34, 197, 94, 0.8)",
  },
  {
    id: 2,
    name: "Analyst",
    role: "Aggregates Sentinel data every 10 minutes with Groq LLaMA",
    description: "Scores issues and decides if human review is needed, filtering out the noise.",
    icon: Brain,
    color: "purple",
    gradient: "from-purple-400 to-purple-600",
    glowColor: "rgba(147, 51, 234, 0.8)",
  },
  {
    id: 3,
    name: "Prophet",
    role: "Converts decisions into draft or immediate polls",
    description: "Opens 24-hour voting windows and announces referendums to the community.",
    icon: Vote,
    color: "cyan",
    gradient: "from-cyan-400 to-cyan-600",
    glowColor: "rgba(6, 182, 212, 0.8)",
  },
  {
    id: 4,
    name: "Arbiter",
    role: "Monitors completed polls every 15 minutes",
    description: "Executes approved on-chain/backend actions, with power to trigger rollbacks or emergency brakes.",
    icon: Gavel,
    color: "yellow",
    gradient: "from-yellow-400 to-yellow-600",
    glowColor: "rgba(234, 179, 8, 0.8)",
  },
  {
    id: 5,
    name: "Scribe",
    role: "Every 2 hours mines outcomes & feedback",
    description: "Updates governance configuration and the LLM's memory for smarter, adaptive cycles.",
    icon: PenSquare,
    color: "pink",
    gradient: "from-pink-400 to-pink-600",
    glowColor: "rgba(236, 72, 153, 0.8)",
  },
];

const CARD_WIDTH = 288; // w-72
const GAP = 32; // gap-8

const floatingIcons = [Cpu, Database, Network, Target, Sparkles];

export const OracleReferendumSection: React.FC<OracleReferendumSectionProps> = ({ scrollProgress }) => {
  // Section-specific animations now start from the beginning of the scene's progress
  const titleOpacity = useTransform(scrollProgress, [0.02, 0.15], [0, 1]);
  const titleY = useTransform(scrollProgress, [0.02, 0.15], [-20, 0]);
  
  const backgroundHue = useTransform(scrollProgress, [0, 1], [240, 300]);
  
  // Timeline now controls the revealing of 5 stacked cards
  const timelineProgress = useTransform(scrollProgress, [0.2, 0.8], [0, 5]);

  const glitchElements = Array.from({ length: 8 }).map((_, i) => ({
    id: `glitch-line-${i}`,
    component: (
      <motion.div
        className="absolute w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
        style={{
          height: `${Math.random() * 2 + 1}px`,
        }}
        animate={{
          opacity: [0, 0.6, 0],
          scaleX: [0, 1, 0],
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: Math.random() * 4 + 2,
          ease: "easeInOut"
        }}
      />
    ),
    speed: 0, // No scroll-based movement
    position: { x: 0, y: Math.random() * 100 },
    zIndex: 1,
  }));

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-black overflow-x-hidden flex flex-col justify-center">
      {/* Dynamic Gradient Grid Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: useTransform(
            backgroundHue,
            (hue) => `
              radial-gradient(circle at 20% 20%, hsla(${hue}, 70%, 60%, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, hsla(${hue + 60}, 70%, 60%, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, hsla(${hue + 120}, 70%, 60%, 0.2) 0%, transparent 50%)
            `
          )
        }}
      />

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '80px 80px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating Background Icons */}
      <div className="absolute inset-0 z-5">
        {Array.from({ length: 20 }).map((_, i) => {
          const IconComponent = floatingIcons[i % 5];
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.4, 0.1],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 10
              }}
            >
              <IconComponent 
                className="w-8 h-8 text-blue-400"
                strokeWidth={1}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Glitch Overlay */}
      <AdvancedParallaxLayer
        scrollProgress={scrollProgress}
        elements={glitchElements}
        className="opacity-20"
      />

      <div className="relative z-10 container mx-auto px-8 h-full flex flex-col justify-center">
        {/* Section Title */}
        <motion.div
          className="text-center pt-16"
          style={{
            opacity: titleOpacity,
            y: titleY,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <HackerText
            text="ORACLE REFERENDUM"
            className="text-6xl md:text-7xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 bg-clip-text text-transparent mb-6"
          />
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The community's will shapes the Oracle's evolution. Every vote is a ripple in the digital cosmos.
          </p>
        </motion.div>

        {/* Governance Agent Stack */}
        <div className="relative w-full flex-grow flex items-center justify-center -mt-24">
          {governanceAgents.map((agent, index) => {
              const AgentIcon = agent.icon;

              const start = index;
              const end = index + 1;
              
              const xRange = [0, (index % 2 === 0 ? -1 : 1) * window.innerWidth];
              const x = useTransform(timelineProgress, [start, end], xRange);
              
              const opacity = useTransform(timelineProgress, [start, end], [1, 0]);
              
              const scale = useTransform(timelineProgress, [start, end], [1, 0.8]);

              const y = useTransform(scrollProgress, (latest) => {
                const frequency = 1;
                const amplitude = 20;
                const phaseShift = index * 0.5;
                return Math.sin(latest * Math.PI * 5 + phaseShift) * amplitude;
              });

              return (
                <motion.div
                  key={agent.id}
                  className="w-80 absolute gradient-hover-card"
                  style={{
                    x,
                    y,
                    opacity,
                    scale,
                    zIndex: governanceAgents.length - index,
                  }}
                >
                  <motion.div
                    className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border-2 border-transparent p-6 overflow-hidden h-full"
                    style={{
                      borderImage: `linear-gradient(135deg, ${agent.gradient}) 1`,
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: `linear-gradient(135deg, ${agent.glowColor}, transparent)`, opacity: 0.6 }}/>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <motion.div
                        className={`w-16 h-16 rounded-full bg-gradient-to-r ${agent.gradient} p-0.5 mb-4`}
                      >
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                          <AgentIcon className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                      <p className={`text-${agent.color}-400 font-medium text-sm mb-3 h-10`}>{agent.role}</p>
                      <p className="text-gray-400 text-sm leading-relaxed">{agent.description}</p>
                      <div className="flex items-center space-x-2 mt-4">
                        <div className={`w-2 h-2 bg-${agent.color}-400 rounded-full`} />
                        <span className="text-xs text-gray-300 font-medium">ACTIVE</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
        </div>
        
        {/* Final Icons */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center gap-12"
          style={{
            opacity: useTransform(timelineProgress, [4.2, 4.8], [0, 1]),
            zIndex: 15,
          }}
        >
          {[
            { src: '/intro/icons/sentinel_eye.svg', color: 'rgba(34, 197, 94, 0.9)' },
            { src: '/intro/icons/analyst_chart.svg', color: 'rgba(147, 51, 234, 0.9)' },
            { src: '/intro/icons/prophet_crystal.svg', color: 'rgba(6, 182, 212, 0.9)' },
            { src: '/intro/icons/arbiter_scale.svg', color: 'rgba(234, 179, 8, 0.9)' },
            { src: '/intro/icons/scribe_feather.svg', color: 'rgba(236, 72, 153, 0.9)' },
          ].map((icon, index) => (
            <motion.img
              key={icon.src}
              src={icon.src}
              className="w-50 h-50"
              alt=""
              animate={{
                opacity: [0.7, 1, 0.7],
                filter: [`drop-shadow(0 0 8px ${icon.color})`, `drop-shadow(0 0 20px ${icon.color})`, `drop-shadow(0 0 8px ${icon.color})`]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
                delay: index * 0.3
              }}
            />
          ))}
        </motion.div>

        {/* Key System Highlights */}
        <motion.div
          className="absolute bottom-16 left-0 right-0 px-8"
          style={{
            opacity: useTransform(timelineProgress, [4.5, 5], [0, 1]),
            y: useTransform(timelineProgress, [4.5, 5], [50, 0]),
            zIndex: 20,
          }}
        >
          <div className="gradient-hover-card bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Key System Highlights</h3>
            <div className="grid grid-cols-3 gap-4 text-center items-start">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-10 h-10 text-cyan-400 mb-2" />
                <div className="text-cyan-400 font-bold text-lg">Autonomy Tiers</div>
                <div className="text-gray-400 text-sm mt-1">Balances risk from full autopilot to human-in-the-loop approval.</div>
              </div>
              <div className="flex flex-col items-center">
                <ToggleLeft className="w-10 h-10 text-purple-400 mb-2" />
                <div className="text-purple-400 font-bold text-lg">Emergency Brake</div>
                <div className="text-gray-400 text-sm mt-1">Instantly halts all voting and execution systems with a single toggle.</div>
              </div>
              <div className="flex flex-col items-center">
                <Server className="w-10 h-10 text-green-400 mb-2" />
                <div className="text-green-400 font-bold text-lg">Serverless Stack</div>
                <div className="text-gray-400 text-sm mt-1">Runs entirely on Supabase edge functions and secure cron jobs.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};