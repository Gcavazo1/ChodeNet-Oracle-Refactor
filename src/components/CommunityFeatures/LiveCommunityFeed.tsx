import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LiveEvent {
  id: string;
  timestamp: Date;
  description: string;
  type: 'girth_increase' | 'achievement' | 'milestone';
}

const randomDescription = () => {
  const messages = [
    'Player123 achieved Mega Surge!',
    'Global GIRTH resonance increased by 2%',
    'ShadowWeaver minted Legendary NFT',
    'Server processed 10k taps',
    'Oracle prophecy unlocked a new quest',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const LiveCommunityFeed: React.FC<{}> = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    const addEvent = () => {
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          description: randomDescription(),
          type: 'girth_increase',
        },
        ...prev.slice(0, 49), // keep last 50
      ]);
    };

    addEvent(); // initial
    const id = setInterval(addEvent, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-2 text-left">
      {events.map((evt) => (
        <div
          key={evt.id}
          className="flex items-center bg-slate-800/50 rounded-lg px-3 py-2 text-sm border border-white/5 hover:bg-slate-700/60 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mr-2" />
          <span className="flex-1 truncate text-gray-100" title={evt.description}>{evt.description}</span>
          <span className="ml-2 text-[10px] text-gray-400 whitespace-nowrap">
            {evt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LiveCommunityFeed;