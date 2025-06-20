import React from 'react';
import { Scroll, Sparkles, Coins } from 'lucide-react';
import { useOracleFlowStore } from '../../lib/oracleFlowStore';
import { useSIWS } from '../../lib/useSIWS';
import './RitualRequests.css';

// Enhanced ritual topics with costs and Oracle Shards integration
const ENHANCED_RITUAL_TOPICS = [
  {
    id: 'minor_divination',
    text: 'Minor Divination',
    description: 'Seek basic wisdom about immediate future events',
    girth_cost: 1,
    success_rate: 70,
    corruption_risk: 5
  },
  {
    id: 'girth_amplification', 
    text: 'Girth Amplification Ritual',
    description: 'Divine the path to greater power and growth',
    girth_cost: 5,
    success_rate: 60,
    corruption_risk: 10
  },
  {
    id: 'oracle_communion',
    text: 'Oracle Communion',
    description: 'Commune directly with the Oracle consciousness',
    girth_cost: 10,
    success_rate: 45,
    corruption_risk: 15
  },
  {
    id: 'reality_flux',
    text: 'Reality Flux Divination',
    description: 'Peer into the fundamental nature of existence itself',
    girth_cost: 25,
    success_rate: 30,
    corruption_risk: 25
  }
];

export const RitualRequests: React.FC = () => {
  const { 
    currentTopic, 
    availableTopics, 
    selectTopic, 
    switchToProphecyTab 
  } = useOracleFlowStore();

  const { girthBalance, oracleShards, isAuthenticated } = useSIWS();

  const handleTopicClick = (topicId: string) => {
    const newTopic = currentTopic === topicId ? null : topicId;
    selectTopic(newTopic);
    
    // If a topic is selected, automatically switch to the chamber
    if (newTopic) {
      switchToProphecyTab('chamber');
    }
  };

  const handleAdvancedRitual = () => {
    // Open the new RitualLab modal
    const event = new CustomEvent('openRitualLab');
    window.dispatchEvent(event);
  };

  const canAffordRitual = (cost: number) => {
    return girthBalance?.soft_balance >= cost;
  };

  return (
    <div className="ritual-requests">
      <div className="ritual-header">
        <Scroll className="ritual-icon" size={24} />
        <h2>ORACLE RITUAL CHAMBER</h2>
        <Scroll className="ritual-icon" size={24} />
      </div>

      {/* Balance Display */}
      {isAuthenticated && (
        <div className="ritual-balances">
          <div className="balance-item">
            <Coins size={16} />
            <span>{girthBalance?.soft_balance?.toFixed(3) || '0.000'} $GIRTH</span>
          </div>
          <div className="balance-item oracle-shards">
            <span className="shard-icon">💎</span>
            <span>{oracleShards?.balance || 0} Oracle Shards</span>
          </div>
        </div>
      )}

      {/* Enhanced Ritual Options */}
      <div className="ritual-section">
        <h3>🔮 Basic Ritual Requests (Free)</h3>
        <p className="section-description">Traditional Oracle consultation - no cost, basic wisdom</p>

      <div className="ritual-topics">
        {availableTopics.map((topic) => (
          <button
            key={topic.id}
              className={`ritual-button basic ${currentTopic === topic.id ? 'active' : ''}`}
            onClick={() => handleTopicClick(topic.id)}
            title={topic.description}
          >
            <Sparkles className="button-icon" size={16} />
            <span>{topic.text}</span>
              <span className="cost-badge free">FREE</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ritual-section">
        <h3>⚗️ Advanced Ritual Crafting ($GIRTH Required)</h3>
        <p className="section-description">Craft powerful rituals with ingredients, Oracle Shards, and guaranteed outcomes</p>
        
        <div className="ritual-topics">
          {ENHANCED_RITUAL_TOPICS.map((ritual) => (
            <button
              key={ritual.id}
              className={`ritual-button advanced ${!canAffordRitual(ritual.girth_cost) ? 'disabled' : ''}`}
              onClick={() => canAffordRitual(ritual.girth_cost) ? handleAdvancedRitual() : null}
              title={`${ritual.description} | Success: ${ritual.success_rate}% | Corruption: +${ritual.corruption_risk}`}
              disabled={!canAffordRitual(ritual.girth_cost)}
            >
              <div className="ritual-info">
                <span className="ritual-name">{ritual.text}</span>
                <div className="ritual-stats">
                  <span className="success-rate">{ritual.success_rate}% success</span>
                  <span className="corruption-risk">+{ritual.corruption_risk} corruption</span>
                </div>
              </div>
              <div className="cost-badge girth">
                <Coins size={12} />
                {ritual.girth_cost} $GIRTH
              </div>
          </button>
        ))}
        </div>

        <button 
          className="advanced-ritual-btn"
          onClick={handleAdvancedRitual}
          disabled={!isAuthenticated}
        >
          <span className="icon">⚗️</span>
          Open Advanced Ritual Lab
          <span className="icon">⚗️</span>
        </button>
      </div>

      {/* Current Selection Display */}
      {currentTopic && (
        <div className="current-topic">
          <span>Oracle is currently divining on:</span>
          <span className="topic-text">
            {availableTopics.find(t => t.id === currentTopic)?.text}
          </span>
          <div className="topic-description">
            {availableTopics.find(t => t.id === currentTopic)?.description}
          </div>
        </div>
      )}

      {!currentTopic && !isAuthenticated && (
        <div className="ritual-guidance">
          <p>🔮 <strong>Free Oracle Consultation:</strong> Select a ritual topic above for basic wisdom</p>
          <p>⚗️ <strong>Advanced Rituals:</strong> Connect your wallet to access powerful ritual crafting with guaranteed outcomes</p>
        </div>
      )}

      {!currentTopic && isAuthenticated && (
        <div className="ritual-guidance authenticated">
          <p>Choose your path:</p>
          <ul>
            <li><strong>Free Consultation:</strong> Traditional Oracle wisdom (basic topics above)</li>
            <li><strong>Ritual Crafting:</strong> Spend $GIRTH and Oracle Shards for powerful, customizable prophecies</li>
            <li><strong>Risk vs Reward:</strong> Higher costs = better success rates and more valuable outcomes</li>
          </ul>
        </div>
      )}
    </div>
  );
};