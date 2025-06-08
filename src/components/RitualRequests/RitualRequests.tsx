import React from 'react';
import { Scroll, Sparkles } from 'lucide-react';
import { useOracleFlowStore } from '../../lib/oracleFlowStore';
import './RitualRequests.css';

export const RitualRequests: React.FC = () => {
  const { 
    currentTopic, 
    availableTopics, 
    selectTopic, 
    switchToTab 
  } = useOracleFlowStore();

  const handleTopicClick = (topicId: string) => {
    const newTopic = currentTopic === topicId ? null : topicId;
    selectTopic(newTopic);
    
    // If a topic is selected, automatically switch to the chamber
    if (newTopic) {
      switchToTab('chamber');
    }
  };

  return (
    <div className="ritual-requests">
      <div className="ritual-header">
        <Scroll className="ritual-icon" size={24} />
        <h2>SEEK SPECIFIC WISDOM</h2>
        <Scroll className="ritual-icon" size={24} />
      </div>

      <div className="ritual-topics">
        {availableTopics.map((topic) => (
          <button
            key={topic.id}
            className={`ritual-button ${currentTopic === topic.id ? 'active' : ''}`}
            onClick={() => handleTopicClick(topic.id)}
            title={topic.description}
          >
            <Sparkles className="button-icon" size={16} />
            <span>{topic.text}</span>
            <Sparkles className="button-icon" size={16} />
          </button>
        ))}
      </div>

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

      {!currentTopic && (
        <div className="ritual-guidance">
          <p>Select a ritual topic above to focus the Oracle's divine attention.</p>
          <p>Each topic will guide the Oracle to provide specific wisdom tailored to your inquiry.</p>
        </div>
      )}
    </div>
  );
};