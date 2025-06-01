import React from 'react';
import { Scroll, Sparkles } from 'lucide-react';
import './RitualRequests.css';

interface RitualRequestsProps {
  currentTopic: string | null;
  onTopicSelect: (topic: string | null) => void;
}

export const RitualRequests: React.FC<RitualRequestsProps> = ({
  currentTopic,
  onTopicSelect,
}) => {
  const ritualTopics = [
    {
      id: 'FUTURE_OF_GIRTH',
      text: 'Oracle, reveal the secrets of the Future of $GIRTH!',
    },
    {
      id: 'ANCIENT_TECHNIQUES',
      text: 'Oracle, speak of the Ancient Chodes and their Lost Slapping Techniques!',
    },
    {
      id: 'MEME_COINS',
      text: 'Oracle, what omens do the Next Meme Coins carry?',
    },
    {
      id: 'FUD_STORMS',
      text: 'Oracle, warn us of the Coming FUD Storms!',
    },
  ];

  const handleTopicClick = (topicId: string) => {
    onTopicSelect(currentTopic === topicId ? null : topicId);
  };

  return (
    <div className="ritual-requests">
      <div className="ritual-header">
        <Scroll className="ritual-icon" size={24} />
        <h2>SEEK SPECIFIC WISDOM</h2>
        <Scroll className="ritual-icon" size={24} />
      </div>

      <div className="ritual-topics">
        {ritualTopics.map((topic) => (
          <button
            key={topic.id}
            className={`ritual-button ${currentTopic === topic.id ? 'active' : ''}`}
            onClick={() => handleTopicClick(topic.id)}
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
            {ritualTopics.find(t => t.id === currentTopic)?.text}
          </span>
        </div>
      )}
    </div>
  );
};