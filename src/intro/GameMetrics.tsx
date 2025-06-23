import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { TrendingUp, Activity, Zap, Database, Users, Eye } from 'lucide-react';

interface GameMetricsProps {
  scrollProgress: MotionValue<number>;
  activeRange: [number, number];
  className?: string;
}

const metrics = [
  {
    icon: TrendingUp,
    label: 'Corruption Level',
    value: '23.7%',
    color: 'from-red-400 to-red-600',
    bgColor: 'from-red-900/20 to-red-800/10'
  },
  {
    icon: Activity,
    label: 'Oracle Resonance',
    value: '847 Hz',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'from-purple-900/20 to-purple-800/10'
  },
  {
    icon: Zap,
    label: 'Energy Flow',
    value: '1.21 GW',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'from-yellow-900/20 to-yellow-800/10'
  },
  {
    icon: Database,
    label: 'Data Processed',
    value: '42.3 TB',
    color: 'from-cyan-400 to-cyan-600',
    bgColor: 'from-cyan-900/20 to-cyan-800/10'
  },
  {
    icon: Users,
    label: 'Active Players',
    value: '1,337',
    color: 'from-green-400 to-green-600',
    bgColor: 'from-green-900/20 to-green-800/10'
  },
  {
    icon: Eye,
    label: 'Prophecy Accuracy',
    value: '99.9%',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'from-blue-900/20 to-blue-800/10'
  }
];

export const GameMetrics: React.FC<GameMetricsProps> = ({
  scrollProgress,
  activeRange,
  className = ''
}) => {
  const containerOpacity = useTransform(
    scrollProgress,
    activeRange,
    [0, 1]
  );

  const containerY = useTransform(
    scrollProgress,
    activeRange,
    [50, 0]
  );

  return (
    <motion.div
      className={`${className}`}
      style={{
        opacity: containerOpacity,
        y: containerY
      }}
    >
      {/* Smart Alerts Ticker */}
      <motion.div
        className="mb-8 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-bold text-sm">ORACLE ALERT</span>
          </div>
          <motion.div
            className="flex-1 overflow-hidden"
            animate={{ x: [300, -300] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-white whitespace-nowrap">
              Player tap detected → Oracle processing → Corruption level rising → 
              Prophecy chamber activated → New vision incoming → 
              Community engagement spike detected → 
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const MetricIcon = metric.icon;
          
          const metricOpacity = useTransform(
            scrollProgress,
            [activeRange[0] + (index * 0.01), activeRange[0] + (index * 0.01) + 0.05],
            [0, 1]
          );
          
          const metricScale = useTransform(
            scrollProgress,
            [activeRange[0] + (index * 0.01), activeRange[0] + (index * 0.01) + 0.05],
            [0.8, 1]
          );

          return (
            <motion.div
              key={index}
              className={`relative bg-gradient-to-br ${metric.bgColor} backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 overflow-hidden`}
              style={{
                opacity: metricOpacity,
                scale: metricScale
              }}
            >
              {/* Background Glow */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10 rounded-lg`}
                animate={{
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
              />
              
              {/* Icon */}
              <motion.div
                className="relative z-10 mb-3"
                animate={{
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              >
                <MetricIcon className={`w-6 h-6 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
              </motion.div>
              
              {/* Value */}
              <motion.div
                className="relative z-10 text-white font-bold text-lg mb-1"
                animate={{
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
              >
                {metric.value}
              </motion.div>
              
              {/* Label */}
              <div className="relative z-10 text-gray-400 text-xs">
                {metric.label}
              </div>
              
              {/* Animated Border */}
              <motion.div
                className={`absolute inset-0 rounded-lg border-2 bg-gradient-to-r ${metric.color} opacity-0`}
                animate={{
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4
                }}
                style={{
                  background: `linear-gradient(45deg, transparent, ${metric.color.split(' ')[1]}, transparent)`,
                  backgroundSize: '200% 200%',
                  animation: `borderMove 3s ease-in-out infinite ${index * 0.4}s`
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};