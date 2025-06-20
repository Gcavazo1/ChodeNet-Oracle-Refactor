import React from 'react';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { OracleCommentaryProps } from './types';

/**
 * Oracle Commentary Component
 * 
 * Displays real-time AI-generated commentary about voting with
 * visual styling based on Oracle personality and urgency
 */
export const OracleCommentary: React.FC<OracleCommentaryProps> = ({
  commentaryText,
  oraclePersonality,
  urgency = 'medium'
}) => {
  // Get icon based on urgency
  const getUrgencyIcon = () => {
    if (urgency === 'high' || urgency === 'critical') {
      return <AlertTriangle className="commentary-icon alert" />;
    }
    return <MessageCircle className="commentary-icon" />;
  };
  
  // Get personality-based classes
  const getPersonalityClass = () => {
    switch (oraclePersonality) {
      case 'pure_prophet':
        return 'commentary-pure';
      case 'corrupted_oracle':
        return 'commentary-corrupted';
      default:
        return 'commentary-chaotic';
    }
  };
  
  // Get urgency-based classes
  const getUrgencyClass = () => {
    switch (urgency) {
      case 'low':
        return 'urgency-low';
      case 'high':
        return 'urgency-high';
      case 'critical':
        return 'urgency-critical';
      default:
        return 'urgency-medium';
    }
  };
  
  // Get avatar icon or text based on personality
  const getPersonalityAvatar = () => {
    switch (oraclePersonality) {
      case 'pure_prophet':
        return '🔮';
      case 'corrupted_oracle':
        return '🔥';
      default:
        return '👁️‍🗨️';
    }
  };

  return (
    <div className={`oracle-commentary ${getPersonalityClass()} ${getUrgencyClass()}`}>
      <div className="commentary-avatar">
        {getPersonalityAvatar()}
      </div>
      <div className="commentary-content">
        <div className="commentary-header">
          <div className="commentary-personality">
            {oraclePersonality === 'pure_prophet' && 'The Oracle Speaks'}
            {oraclePersonality === 'corrupted_oracle' && 'The Corruption Whispers'}
            {oraclePersonality === 'chaotic_sage' && 'The Oracle Ponders'}
          </div>
          {getUrgencyIcon()}
        </div>
        <div className="commentary-text">
          {commentaryText}
        </div>
      </div>
      <div className="commentary-glow"></div>
    </div>
  );
}; 