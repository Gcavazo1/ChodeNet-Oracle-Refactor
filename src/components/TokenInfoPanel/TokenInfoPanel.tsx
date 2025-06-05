import React, { useState } from 'react';
import { Coins, PieChart, Sparkles } from 'lucide-react';
import './TokenInfoPanel.css';

interface TokenDistribution {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

const distributions: TokenDistribution[] = [
  { label: 'In-Game Rewards', amount: 38_000_000, percentage: 38, color: '#00FF41' },
  { label: 'Burn Reserve', amount: 25_000_000, percentage: 25, color: '#FF00FF' },
  { label: 'Events & Airdrops', amount: 10_000_000, percentage: 10, color: '#00f0ff' },
  { label: 'Staking & Bonus', amount: 10_000_000, percentage: 10, color: '#FFD700' },
  { label: 'Development & Treasury', amount: 10_000_000, percentage: 10, color: '#FF6B6B' },
  { label: 'Liquidity & Market Making', amount: 7_000_000, percentage: 7, color: '#4FFFB0' }
];

export const TokenInfoPanel: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const totalSupply = 100_000_000;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="token-info-panel">
      <div className="token-header">
        <Coins className="token-icon" size={32} />
        <h2>TREASURY OF GIRTH</h2>
        <Coins className="token-icon" size={32} />
      </div>

      <div className="total-supply">
        <div className="supply-amount">
          <span className="number">{formatNumber(totalSupply)}</span>
          <span className="symbol">$GIRTH</span>
        </div>
        <div className="supply-text">One Hundred Million</div>
      </div>

      <div className="distribution-container">
        <div className="chart-header">
          <PieChart size={24} />
          <h3>Token Distribution</h3>
        </div>

        <div className="distribution-chart">
          <div className="pie-segments">
            {distributions.map((dist, index) => {
              const rotation = distributions
                .slice(0, index)
                .reduce((acc, curr) => acc + curr.percentage, 0);
              
              return (
                <div
                  key={dist.label}
                  className={`pie-segment ${activeSegment === index ? 'active' : ''}`}
                  style={{
                    '--segment-color': dist.color,
                    '--segment-start': `${rotation}deg`,
                    '--segment-end': `${rotation + dist.percentage * 3.6}deg`
                  } as React.CSSProperties}
                  onMouseEnter={() => setActiveSegment(index)}
                  onMouseLeave={() => setActiveSegment(null)}
                >
                  <div className="segment-tooltip">
                    <strong>{dist.label}</strong>
                    <div>{formatNumber(dist.amount)} $GIRTH</div>
                    <div>{dist.percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="distribution-legend">
          {distributions.map((dist, index) => (
            <div 
              key={dist.label}
              className="legend-item"
              onMouseEnter={() => setActiveSegment(index)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <div 
                className="legend-color"
                style={{ backgroundColor: dist.color }}
              />
              <div className="legend-text">
                <div className="legend-label">{dist.label}</div>
                <div className="legend-value">
                  {formatNumber(dist.amount)} ({dist.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="price-prediction">
        <Sparkles className="sparkle-icon" size={20} />
        <div className="scrolling-text">
          PRICELESS... UNTIL THE FIRST DEGEN SELLS FOR A LAMBO!
        </div>
        <Sparkles className="sparkle-icon" size={20} />
      </div>
    </div>
  );
};