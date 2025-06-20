import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  category: 'core' | 'advanced' | 'progression';
  trend?: 'up' | 'down';
  highlight?: boolean;
  badge?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  category,
  trend,
  highlight = false,
  badge,
  className = ''
}) => {
  const getCategoryStyles = () => {
    switch (category) {
      case 'core':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
      case 'advanced':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-300';
      case 'progression':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className={`relative p-3 rounded-lg border ${getCategoryStyles()} ${highlight ? 'ring-2 ring-purple-400/50' : ''} ${className}`}>
      {badge && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold">
          {badge}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-300">{title}</span>
        {icon}
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-white">{value}</div>
          <div className="text-xs opacity-80">{subtitle}</div>
        </div>
        
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard; 